#!/usr/bin/env bash
set -euo pipefail

umask 077

API_URL="${AUTHENTIK_API_URL:-https://authentik.nilvanlopes.com}"
API_TOKEN="${AUTHENTIK_API_TOKEN:-}"
GROUP_NAME="${AUTHENTIK_N8N_GROUP:-n8n}"
USERNAME="${AUTHENTIK_N8N_USER:-pyu}"
APPLICATION_NAME="${AUTHENTIK_N8N_APPLICATION_NAME:-n8n}"
APPLICATION_SLUG="${AUTHENTIK_N8N_APPLICATION_SLUG:-n8n}"
PROVIDER_NAME="${AUTHENTIK_N8N_PROVIDER_NAME:-n8n-forward-auth}"
OUTPOST_NAME="${AUTHENTIK_N8N_OUTPOST_NAME:-n8n}"
EXTERNAL_HOST="${AUTHENTIK_N8N_EXTERNAL_HOST:-https://n8n.nilvanlopes.com}"
OUTPOST_ENV="${AUTHENTIK_N8N_OUTPOST_ENV:-authentik/outposts/n8n/.env}"

AUTHENTICATION_FLOW_SLUG="${AUTHENTIK_N8N_AUTHENTICATION_FLOW_SLUG:-default-authentication-flow}"
AUTHORIZATION_FLOW_SLUG="${AUTHENTIK_N8N_AUTHORIZATION_FLOW_SLUG:-default-provider-authorization-explicit-consent}"
INVALIDATION_FLOW_SLUG="${AUTHENTIK_N8N_INVALIDATION_FLOW_SLUG:-default-invalidation-flow}"

SKIP_PATH_REGEX=$'^/webhook(?:/|$)\n^/webhook-test(?:/|$)\n^/webhook-waiting(?:/|$)\n^/mcp(?:/|$)\n^/mcp-server(?:/|$)'
API_BASE="${API_URL%/}/api/v3"

if [[ -z "$API_TOKEN" ]]; then
  echo "ERRO: AUTHENTIK_API_TOKEN é obrigatório e deve ser fornecido somente no ambiente local." >&2
  exit 1
fi

for command in curl jq; do
  if ! command -v "$command" >/dev/null 2>&1; then
    echo "ERRO: dependência ausente: $command" >&2
    exit 1
  fi
done

urlencode() {
  jq -rn --arg value "$1" '$value | @uri'
}

api_request() {
  local method="$1"
  local path="$2"
  local body="${3:-}"
  local response_file status response

  response_file="$(mktemp)"
  if [[ -n "$body" ]]; then
    status="$(curl --silent --show-error --output "$response_file" --write-out '%{http_code}' \
      --request "$method" \
      --header "Authorization: Bearer ${API_TOKEN}" \
      --header 'Accept: application/json' \
      --header 'Content-Type: application/json' \
      --data "$body" \
      "${API_BASE}${path}" || true)"
  else
    status="$(curl --silent --show-error --output "$response_file" --write-out '%{http_code}' \
      --request "$method" \
      --header "Authorization: Bearer ${API_TOKEN}" \
      --header 'Accept: application/json' \
      "${API_BASE}${path}" || true)"
  fi

  response="$(<"$response_file")"
  rm -f "$response_file"

  if [[ ! "$status" =~ ^2[0-9][0-9]$ ]]; then
    echo "ERRO: Authentik API ${method} ${path} respondeu HTTP ${status}." >&2
    exit 1
  fi

  printf '%s' "$response"
}

find_one() {
  local path="$1"
  local response count

  response="$(api_request GET "$path")"
  count="$(jq -r '(.results // []) | length' <<<"$response")"
  if [[ "$count" -gt 1 ]]; then
    echo "ERRO: mais de um objeto correspondeu a ${path}; nenhuma alteração aplicada." >&2
    exit 1
  fi
  if [[ "$count" -eq 0 ]]; then
    return 1
  fi
  jq -c '.results[0]' <<<"$response"
}

flow_id() {
  local slug="$1"
  local encoded="$(urlencode "$slug")"
  local flow

  flow="$(find_one "/flows/instances/?slug__iexact=${encoded}&page_size=10")" || {
    echo "ERRO: fluxo Authentik não encontrado: ${slug}" >&2
    exit 1
  }
  jq -r '.pk' <<<"$flow"
}

echo ">>> Validando usuário e fluxos do Authentik..."
USER_OBJECT="$(find_one "/core/users/?username__iexact=$(urlencode "$USERNAME")&page_size=10")" || {
  echo "ERRO: usuário Authentik não encontrado: ${USERNAME}" >&2
  exit 1
}
USER_ID="$(jq -r '.pk' <<<"$USER_OBJECT")"

AUTHENTICATION_FLOW_ID="$(flow_id "$AUTHENTICATION_FLOW_SLUG")"
AUTHORIZATION_FLOW_ID="$(flow_id "$AUTHORIZATION_FLOW_SLUG")"
INVALIDATION_FLOW_ID="$(flow_id "$INVALIDATION_FLOW_SLUG")"

echo ">>> Criando ou validando o grupo ${GROUP_NAME}..."
GROUP_OBJECT="$(find_one "/core/groups/?name__iexact=$(urlencode "$GROUP_NAME")&page_size=10")" || true
if [[ -z "$GROUP_OBJECT" ]]; then
  GROUP_OBJECT="$(api_request POST /core/groups/ "$(jq -nc --arg name "$GROUP_NAME" '{name:$name}')")"
  echo "Grupo ${GROUP_NAME} criado."
fi
GROUP_ID="$(jq -r '.pk' <<<"$GROUP_OBJECT")"

GROUP_MEMBER_IDS="$(jq -r '(.users // [])[] | if type == "object" then (.pk // .id) else . end' <<<"$GROUP_OBJECT")"
while IFS= read -r member_id; do
  [[ -n "$member_id" ]] || continue
  if [[ "$member_id" != "$USER_ID" ]]; then
    echo "ERRO: o grupo ${GROUP_NAME} já possui outro membro; nenhuma remoção automática será feita." >&2
    exit 1
  fi
done <<<"$GROUP_MEMBER_IDS"

if ! grep -Fxq "$USER_ID" <<<"$GROUP_MEMBER_IDS"; then
  api_request POST "/core/groups/${GROUP_ID}/add_user/" "$(jq -nc --argjson pk "$USER_ID" '{pk:$pk}')" >/dev/null
  echo "Usuário ${USERNAME} adicionado ao grupo ${GROUP_NAME}."
fi

PROVIDER_BODY="$(jq -nc \
  --arg name "$PROVIDER_NAME" \
  --arg authentication_flow "$AUTHENTICATION_FLOW_ID" \
  --arg authorization_flow "$AUTHORIZATION_FLOW_ID" \
  --arg invalidation_flow "$INVALIDATION_FLOW_ID" \
  --arg external_host "$EXTERNAL_HOST" \
  --arg skip_path_regex "$SKIP_PATH_REGEX" \
  '{name:$name,authentication_flow:$authentication_flow,authorization_flow:$authorization_flow,invalidation_flow:$invalidation_flow,mode:"forward_single",external_host:$external_host,skip_path_regex:$skip_path_regex,intercept_header_auth:false}')"

echo ">>> Criando ou atualizando o Proxy Provider ${PROVIDER_NAME}..."
PROVIDER_OBJECT="$(find_one "/providers/proxy/?name__iexact=$(urlencode "$PROVIDER_NAME")&page_size=10")" || true
if [[ -z "$PROVIDER_OBJECT" ]]; then
  PROVIDER_OBJECT="$(api_request POST /providers/proxy/ "$PROVIDER_BODY")"
else
  PROVIDER_ID="$(jq -r '.pk' <<<"$PROVIDER_OBJECT")"
  PROVIDER_OBJECT="$(api_request PATCH "/providers/proxy/${PROVIDER_ID}/" "$PROVIDER_BODY")"
fi
PROVIDER_ID="$(jq -r '.pk' <<<"$PROVIDER_OBJECT")"

APPLICATION_BODY="$(jq -nc \
  --arg name "$APPLICATION_NAME" \
  --arg slug "$APPLICATION_SLUG" \
  --argjson provider "$PROVIDER_ID" \
  --arg launch_url "$EXTERNAL_HOST" \
  '{name:$name,slug:$slug,provider:$provider,policy_engine_mode:"all",meta_launch_url:$launch_url}')"

echo ">>> Criando ou atualizando a Application ${APPLICATION_SLUG}..."
APPLICATION_OBJECT="$(find_one "/core/applications/?slug__iexact=$(urlencode "$APPLICATION_SLUG")&page_size=10")" || true
if [[ -z "$APPLICATION_OBJECT" ]]; then
  APPLICATION_OBJECT="$(api_request POST /core/applications/ "$APPLICATION_BODY")"
else
  APPLICATION_ID="$(jq -r '.pk' <<<"$APPLICATION_OBJECT")"
  APPLICATION_OBJECT="$(api_request PATCH "/core/applications/${APPLICATION_ID}/" "$APPLICATION_BODY")"
fi
APPLICATION_ID="$(jq -r '.pk' <<<"$APPLICATION_OBJECT")"

echo ">>> Garantindo o binding do grupo na Application..."
BINDINGS="$(api_request GET "/policies/bindings/?target=${APPLICATION_ID}&page_size=100")"
OTHER_BINDINGS="$(jq --arg group_id "$GROUP_ID" '[.results[] | select((.group // "") != $group_id)] | length' <<<"$BINDINGS")"
if [[ "$OTHER_BINDINGS" -ne 0 ]]; then
  echo "ERRO: a Application ${APPLICATION_SLUG} possui bindings adicionais; revisão manual necessária." >&2
  exit 1
fi
GROUP_BINDING_COUNT="$(jq --arg group_id "$GROUP_ID" '[.results[] | select(.group == $group_id)] | length' <<<"$BINDINGS")"
if [[ "$GROUP_BINDING_COUNT" -eq 0 ]]; then
  api_request POST /policies/bindings/ "$(jq -nc \
    --arg group "$GROUP_ID" \
    --arg target "$APPLICATION_ID" \
    '{group:$group,target:$target,enabled:true,negate:false,order:0,timeout:0,failure_result:false}')" >/dev/null
fi

echo ">>> Criando ou atualizando o Outpost manual ${OUTPOST_NAME}..."
OUTPOST_OBJECT="$(find_one "/outposts/instances/?name__iexact=$(urlencode "$OUTPOST_NAME")&page_size=10")" || true
if [[ -z "$OUTPOST_OBJECT" ]]; then
  DEFAULT_CONFIG="$(api_request GET /outposts/instances/default_settings/ | jq -c '.config // {}')"
  OUTPOST_BODY="$(jq -nc \
    --arg name "$OUTPOST_NAME" \
    --argjson provider "$PROVIDER_ID" \
    --argjson config "$DEFAULT_CONFIG" \
    '{name:$name,type:"proxy",providers:[$provider],service_connection:null,config:$config}')"
  OUTPOST_OBJECT="$(api_request POST /outposts/instances/ "$OUTPOST_BODY")"
else
  OUTPOST_ID="$(jq -r '.pk' <<<"$OUTPOST_OBJECT")"
  OTHER_PROVIDERS="$(jq --argjson provider "$PROVIDER_ID" '[(.providers // [])[] | select(. != $provider)] | length' <<<"$OUTPOST_OBJECT")"
  if [[ "$OTHER_PROVIDERS" -ne 0 ]]; then
    echo "ERRO: o Outpost ${OUTPOST_NAME} possui outros providers; nenhuma associação será removida." >&2
    exit 1
  fi
  OUTPOST_CONFIG="$(jq -c '.config // {}' <<<"$OUTPOST_OBJECT")"
  OUTPOST_BODY="$(jq -nc \
    --arg name "$OUTPOST_NAME" \
    --argjson provider "$PROVIDER_ID" \
    --argjson config "$OUTPOST_CONFIG" \
    '{name:$name,type:"proxy",providers:[$provider],service_connection:null,config:$config}')"
  OUTPOST_OBJECT="$(api_request PATCH "/outposts/instances/${OUTPOST_ID}/" "$OUTPOST_BODY")"
fi

mkdir -p "$(dirname "$OUTPOST_ENV")"
if [[ -f "$OUTPOST_ENV" ]]; then
  echo "Outpost persistente ${OUTPOST_NAME} validado; arquivo local existente preservado: ${OUTPOST_ENV}"
else
  echo "Outpost persistente ${OUTPOST_NAME} criado. Copie o token gerado no Authentik para ${OUTPOST_ENV}."
fi

echo "✓ Application, Provider, binding de grupo e Outpost n8n configurados."
echo "✓ Grupo autorizado: ${GROUP_NAME}; usuário autorizado: ${USERNAME}."
echo "Próximo passo: preencher ${OUTPOST_ENV} com o token do Outpost e executar make deploy-authentik-outpost-n8n."
