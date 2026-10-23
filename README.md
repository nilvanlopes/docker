# Serviços Docker

Repositório de orquestração do ambiente pessoal de serviços self-hosted de
Nilvan Lopes. Os diretórios de serviço, incluindo `adguard`, usam submódulos Git.
O repositório centraliza
as redes compartilhadas e os comandos de deploy, logs e reinício.

## Conteúdo

### Infraestrutura e serviços publicados

| Diretório | Função |
| --- | --- |
| [`traefik`](./traefik) | Reverse proxy, TLS e descoberta de serviços no Swarm |
| [`adguard`](./adguard) | DNS local para Fred, WAHA e AdGuard, com encaminhamento externo |
| [`cloudflare_tunnel`](./cloudflare_tunnel) | Túnel Cloudflare até o Traefik |
| [`authentik`](./authentik) | Identidade e autenticação, incluindo outposts |
| [`crowdsec`](./crowdsec) | Detecção e bloqueio de tráfego malicioso |
| [`portainer`](./portainer) | Administração do Docker Swarm |
| [`n8n`](./n8n) | Automação de workflows com PostgreSQL e Redis |
| [`waha`](./waha) | API HTTP para WhatsApp |
| [`fred`](./fred) | API do Vôlei Frederico e processamento de conversas |
| [`foundry`](./foundry) | Foundry Virtual Tabletop |
| [`fichasrpg`](./fichasrpg) | Portal React para Mutantes & Malfeitores e Vampiro: A Máscara |
| [`meu-site`](./meu-site/DEPLOY.md) | Site pessoal privado, com CrowdSec e acesso Authentik exclusivo do pyu |
| [`qbittorrent`](./qbittorrent) | Cliente BitTorrent |
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

### Reinício dos serviços

Os serviços permanentes publicados no Swarm usam `restart_policy` com
`condition: any`, `delay: 5s` (10s no agente Portainer) e `max_attempts: 0`.
Assim o Swarm continua tentando recuperar tarefas mesmo após várias falhas
ou uma saída normal. Serviços deliberadamente escalados para zero continuam
parados. As políticas ficam nos Compose de cada submódulo; reiniciar o servidor
não executa `make deploy` nem aplica alterações pendentes nesses arquivos.

### Publicação dos serviços

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
deploy-adguard
setup-traefik-local-lan
deploy-authentik
deploy-authentik-outpost-traefik
deploy-authentik-outpost-portainer
deploy-authentik-outpost-foundry
deploy-authentik-outpost-fichasrpg
deploy-authentik-outpost-n8n
deploy-crowdsec
deploy-portainer
deploy-foundry
deploy-fichasrpg
deploy-meu-site
deploy-n8n
deploy-waha
deploy-qbittorrent
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

Para o portal unificado em `https://fichasrpg.nilvanlopes.com`:

O código da aplicação está no submódulo `fichasrpg/`, ligado ao repositório
[nilvanlopes/fichasrpg](https://github.com/nilvanlopes/fichasrpg). O repositório
anterior `fichaMutantes` foi renomeado com seu histórico. O cadastro, as fichas
e a API ficam nesse projeto; Authentik e Traefik ficam nos submódulos de
infraestrutura. O outpost do portal fica em `authentik/outposts/fichasrpg/`.

Preencha `fichasrpg/.env` com base em `fichasrpg/.env.example` antes do primeiro
deploy. Esse arquivo contém os tokens e credenciais usados pelo backend e é
ignorado pelo Git. O ambiente atual já teve essas credenciais migradas.

```bash
make deploy-authentik-outpost-fichasrpg
make deploy-fichasrpg
```

Configure a aplicação, o grupo `fichasrpg-users` e o outpost pelo painel do
Authentik; salve o token do outpost em `authentik/outposts/fichasrpg/.env`.
O ambiente atual já tem esses objetos configurados. Contas que só têm acesso
ao Foundry não são adicionadas automaticamente. Cadastros convidados entram no
grupo das fichas; o acesso ao Foundry continua separado. Uma conta pode ter
várias fichas em cada sistema. Os bancos foram renomeados para `fichasrpg` e
`fichasrpg_dev`; a migração copiou os dados para o volume
`fichasrpg_postgres_data` e converteu as fichas existentes sem apagá-las.

O deploy usa os alvos Docker do `makefile`, sem scripts de provisionamento,
e carrega as credenciais de `fichasrpg/.env`. O secret `fichasrpg_db_password`
e o volume persistente `fichasrpg_postgres_data` devem existir antes do deploy.
Os identificadores da stack,
banco, volume, rede e secret usam `fichasrpg`; os dados do PostgreSQL são
migrados para o volume novo durante a troca. O código legado em
`authentik/foundry-signup/` foi mantido para a transição. Exporte a ficha
de Vampiro antiga em `fichavampiro.netlify.app` e importe o JSON na nova ficha.
As rotas públicas do portal ficam em
`traefik/infra/traefik/dynamic/fichasrpg.yml`. O Traefik acompanha essa pasta
e aplica as alterações automaticamente. Edite as configurações diretamente
em `dynamic/`; não há uma etapa de cópia de modelos para ativá-las.
No cliente OAuth do Google, autorize o callback
`https://fichasrpg.nilvanlopes.com/api/oauth/google/callback`.
O backend deriva esse endereço da URL pública do portal.

O site pessoal usa `https://meusite.nilvanlopes.com`. Para provisionar o
grupo exclusivo `meu-site`, a política, o outpost e o DNS, empacotar a
aplicação e publicar as duas stacks:

```bash
make deploy-meu-site
```

O provisionamento reutiliza as credenciais locais existentes e permite somente
`pyu`. Veja os recursos, os arquivos e as verificações no
[guia de deploy do site](./meu-site/DEPLOY.md).

Para o primeiro deploy protegido do n8n, crie os objetos persistentes no
Authentik e depois publique o outpost e as rotas:

```bash
cp authentik/outposts/n8n/.env.example authentik/outposts/n8n/.env
# preencha AUTHENTIK_TOKEN no .env local
make deploy-authentik-outpost-n8n
make deploy-traefik
make deploy-n8n
```

O editor usa Authentik. Webhooks e MCP usam rotas próprias no Traefik, sem
exigir sessão de navegador, e continuam sujeitos ao CrowdSec e à autenticação
nativa do n8n.

`deploy-stremio` constrói a imagem local
`stremio-web-official:development` a partir do submódulo
[`stremio/stremio-web`](./stremio/stremio-web) antes de publicar a stack.
`deploy-fred` constrói a API antes do deploy. O alvo do Ollama usa Compose
local e evita subir uma segunda instância quando já existe um provedor Ollama
em execução.

## Operação

### DNS e serviços locais no Windows

O Windows usa **192.168.10.91 como servidor DNS**. Fred, WAHA, Stremio, Fichas de RPG e AdGuard
resolvem para esse mesmo IP e abrem em HTTP sem informar porta:

A regra DNS curinga `*.localnetwork` aponta subdomínios para `192.168.10.91`,
então não é necessário cadastrar cada hostname separadamente no AdGuard.

- `http://waha.localnetwork` abre o dashboard do WAHA.
- `http://stremio.localnetwork` abre o painel web do Stremio.
- `http://adguard.localnetwork` abre o painel do AdGuard.
- `http://fred.localnetwork` encaminha à API do Fred; `/health` verifica sua saúde.
- `http://fichasrpg.localnetwork` abre o portal em desenvolvimento enquanto `make dev` estiver rodando.

O DNS encaminha consultas externas exclusivamente para `170.239.224.25` e
`170.239.224.30`. O navegador conecta diretamente aos sites externos depois
da resolução. Os serviços locais não passam pelo Cloudflare Tunnel; a antiga
entrada 8181 foi removida. Use `.localnetwork`, não `.localhost`.

Mantenha `.91` fora do pool DHCP do roteador. No PowerShell do Windows,
como administrador, configure o adaptador correto e a resolução local:

```powershell
Set-DnsClientServerAddress -InterfaceAlias 'Wi-Fi' -ServerAddresses '192.168.10.91'
Add-DnsClientNrptRule -Namespace '.localnetwork' -NameServers '192.168.10.91' -DisplayName 'AdGuardLocal'
Clear-DnsClientCache
Resolve-DnsName waha.localnetwork -Type A
```

A regra NRPT direciona os nomes locais ao AdGuard mesmo com DNS IPv6 anunciado
pelo roteador. Mantenha IPv6 habilitado. Remova as entradas antigas desses nomes
em `C:\Windows\System32\drivers\etc\hosts`. Navegadores com DNS seguro próprio
precisam usar o resolvedor do sistema para esses nomes.

Para publicar os componentes: `make deploy-adguard` e `make deploy-traefik`.
O próprio Makefile prepara a rede LAN; não há script auxiliar. Dados e senha do
AdGuard ficam em `adguard/data/`, preservados nos novos deploys. O Linux isola
`.91` do próprio host `.90`; teste a partir do Windows/LAN.

### Comandos comuns

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

O Traefik público é o ponto de entrada HTTPS do Tunnel na rede overlay
`traefik-public`. O mesmo Traefik possui a entrada `traefik_local` em `.91`, com
acesso aos backends pela rede `traefik-local`. O Cloudflare Tunnel encaminha o tráfego
externo ao Traefik; Authentik protege rotas privadas; CrowdSec analisa os logs
do Traefik e fornece o bloqueio pelo bouncer.

O n8n usa PostgreSQL, Redis e a rede externa `n8n`. O WAHA e o Fred integram-se
aos workflows do n8n pela rede local. Os demais serviços são publicados por
suas respectivas stacks e redes descritas nos Compose locais.

Nem tudo é uma stack Swarm: Ollama, `curriculum-optimizer` e os modos locais
de Fred/job-application-automation usam `docker compose`; o site pessoal e o
job-application-automation também podem ser executados pelos seus próprios
fluxos de desenvolvimento.
