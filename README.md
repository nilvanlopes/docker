# Serviços Docker

Repositório de orquestração do ambiente pessoal de serviços self-hosted de
Nilvan Lopes. Cada diretório de serviço é um submódulo Git; o repositório raiz
centraliza os arquivos Compose, as redes compartilhadas e os comandos de
deploy, logs e reinício.

## Conteúdo

### Infraestrutura e serviços publicados

| Diretório | Função |
| --- | --- |
| [`traefik`](./traefik) | Reverse proxy, TLS e descoberta de serviços no Swarm |
| [`cloudflare_tunnel`](./cloudflare_tunnel) | Túnel Cloudflare até o Traefik |
| [`authentik`](./authentik) | Identidade e autenticação, incluindo outposts |
| [`crowdsec`](./crowdsec) | Detecção e bloqueio de tráfego malicioso |
| [`portainer`](./portainer) | Administração do Docker Swarm |
| [`n8n`](./n8n) | Automação de workflows com PostgreSQL e Redis |
| [`waha`](./waha) | API HTTP para WhatsApp |
| [`fred`](./fred) | API do Vôlei Frederico e processamento de conversas |
| [`foundry`](./foundry) | Foundry Virtual Tabletop |
| [`authentik/foundry-signup`](./authentik/foundry-signup) | Página de cadastro do Foundry |
| [`qbittorrent`](./qbittorrent) | Cliente BitTorrent |
| [`honcho`](./honcho) | Backend de memória local do Hermes |
| [`excalidraw`](./excalidraw) | Canvas para o MCP do Excalidraw |
| [`stremio`](./stremio) | Stremio Server e interface web local |
| [`whoami`](./whoami) | Serviço de teste das rotas do Traefik |

### Ferramentas locais e projetos relacionados

- [`ollama`](./ollama): Ollama local com suporte à GPU.
- [`job-application-automation`](./job-application-automation): automação de
  candidaturas; também contém uma opção Compose para seu Ollama.
- [`curriculum-optimizer`](./curriculum-optimizer): geração e validação de
  currículos via IA.
- [`meu-site`](./meu-site): código do site pessoal.
- [`renovate`](./renovate): configuração centralizada de atualizações.
- [`scripts`](./scripts): seleção de deploy e recuperação do estado do Docker.

Os diretórios de serviço possuem instruções próprias quando há configuração
adicional ou variáveis obrigatórias.

## Pré-requisitos

- Docker instalado e, para os serviços Swarm, um node manager com o Swarm
  inicializado.
- Arquivos `.env` preenchidos conforme os `.env.example` existentes em cada
  serviço. Segredos não devem ser commitados.
- `whiptail` para o seletor interativo de `make deploy`.
- Para o primeiro checkout, inicialize os submódulos:

```bash
git clone --recurse-submodules <url-do-repositorio>
```

Em um clone existente:

```bash
git submodule update --init --recursive
```

## Deploy

Os serviços publicados usam Docker Swarm. O `make deploy` cria as redes
externas `traefik-public`, `traefik-local` e `n8n` e abre um seletor interativo
com os serviços que ainda não estão em execução.

```bash
# No diretório raiz deste repositório
make deploy

# Deploy não interativo de tudo, na ordem definida em scripts/deploy-select.sh
make deploy SERVICES=all

# Selecionar serviços específicos, mantendo a ordem do orquestrador
make deploy SERVICES="traefik authentik n8n waha"
```

Também é possível executar um alvo individual. Os nomes abaixo correspondem
aos alvos definidos no [`makefile`](./makefile):

```text
deploy-tunnel
deploy-traefik
deploy-authentik
deploy-foundry-signup
deploy-authentik-outpost-traefik
deploy-authentik-outpost-portainer
deploy-authentik-outpost-foundry
deploy-crowdsec
deploy-portainer
deploy-foundry
deploy-n8n
deploy-waha
deploy-qbittorrent
deploy-honcho
deploy-excalidraw
deploy-stremio
deploy-whoami
deploy-ollama
deploy-job-application-automation-ollama
deploy-fred
deploy-curriculum-optimizer
```

Exemplos:

```bash
make deploy-fred
make deploy-stremio
make deploy-curriculum-optimizer
```

`deploy-stremio` constrói a imagem local
`stremio-web-official:development` a partir do submódulo
[`stremio/stremio-web`](./stremio/stremio-web) antes de publicar a stack.
`deploy-fred` constrói a API antes do deploy. O alvo do Ollama usa Compose
local e evita subir uma segunda instância quando já existe um provedor Ollama
em execução.

## Operação

```bash
# Ver ajuda e alvos disponíveis
make help

# Logs de um serviço Swarm
make logs-traefik
make logs-fred

# Reiniciar um serviço
make restart-n8n
make restart-stremio

# Remover as stacks e os Compose locais gerenciados por este repositório
make down
```

`make down` remove os serviços, mas não apaga os volumes persistentes. Para
operações específicas, consulte o README do respectivo submódulo.

## Arquitetura resumida

Traefik é o ponto de entrada HTTP/HTTPS e usa as redes overlay externas
`traefik-public` e `traefik-local`. O Cloudflare Tunnel encaminha o tráfego
externo ao Traefik; Authentik protege rotas privadas; CrowdSec analisa os logs
do Traefik e fornece o bloqueio pelo bouncer.

O n8n usa PostgreSQL, Redis e a rede externa `n8n`. O WAHA e o Fred integram-se
aos workflows do n8n pela rede local. Honcho mantém sua própria API,
PostgreSQL/pgvector, Redis e serviço de embeddings. Os demais serviços são
publicados por suas respectivas stacks e redes descritas nos Compose locais.

Nem tudo é uma stack Swarm: Ollama, `curriculum-optimizer` e os modos locais
de Fred/job-application-automation usam `docker compose`; o site pessoal e o
job-application-automation também podem ser executados pelos seus próprios
fluxos de desenvolvimento.
