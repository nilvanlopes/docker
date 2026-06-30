SHELL := /bin/bash

.PHONY: help all deploy deploy-tunnel deploy-traefik deploy-authentik deploy-foundry-signup deploy-authentik-outpost-traefik deploy-authentik-outpost-portainer deploy-authentik-outpost-foundry deploy-crowdsec deploy-portainer deploy-foundry deploy-n8n deploy-waha deploy-qbittorrent deploy-honcho deploy-excalidraw deploy-stremio deploy-whoami deploy-fred deploy-curriculum-optimizer down logs-tunnel logs-traefik logs-authentik logs-foundry-signup logs-authentik-outpost-traefik logs-authentik-outpost-portainer logs-authentik-outpost-foundry logs-crowdsec logs-portainer logs-foundry logs-n8n logs-waha logs-qbittorrent logs-honcho logs-excalidraw logs-stremio logs-whoami logs-fred logs-curriculum-optimizer restart-tunnel restart-traefik restart-crowdsec restart-authentik restart-foundry-signup restart-authentik-outpost-traefik restart-authentik-outpost-portainer restart-authentik-outpost-foundry restart-crowdsec restart-portainer restart-foundry restart-n8n restart-waha restart-qbittorrent restart-honcho restart-excalidraw restart-stremio restart-whoami restart-fred restart-curriculum-optimizer

# Caminhos dos arquivos compose e variáveis de ambiente
TUNNEL_COMPOSE := cloudflare_tunnel/docker-compose.yml
TRAEFIK_COMPOSE := traefik/docker-compose.yml
TRAEFIK_ENV := traefik/.env
PORTAINER_COMPOSE := portainer/docker-compose.yml
PORTAINER_ENV := portainer/.env
FOUNDRY_COMPOSE := foundry/docker-compose.yml
CROWDSEC_COMPOSE := crowdsec/docker-compose.yml
CROWDSEC_ENV := crowdsec/.env
AUTHENTIK_COMPOSE := authentik/docker-compose.yml
AUTHENTIK_ENV := authentik/.env
FOUNDRY_SIGNUP_COMPOSE := authentik/foundry-signup/docker-compose.yml
FOUNDRY_SIGNUP_ENV := authentik/foundry-signup/.env
FOUNDRY_SIGNUP_DIR := authentik/foundry-signup
AUTHENTIK_OUTPOST_TRAEFIK_COMPOSE := authentik/outposts/traefik/docker-compose.yml
AUTHENTIK_OUTPOST_TRAEFIK_ENV := authentik/outposts/traefik/.env
AUTHENTIK_OUTPOST_PORTAINER_COMPOSE := authentik/outposts/portainer/docker-compose.yml
AUTHENTIK_OUTPOST_PORTAINER_ENV := authentik/outposts/portainer/.env
AUTHENTIK_OUTPOST_FOUNDRY_COMPOSE := authentik/outposts/foundry/docker-compose.yml
AUTHENTIK_OUTPOST_FOUNDRY_ENV := authentik/outposts/foundry/.env
N8N_COMPOSE := n8n/docker-compose.yml
N8N_ENV := n8n/.env
WAHA_COMPOSE := waha/docker-compose.yml
WAHA_ENV := waha/.env
QBITTORRENT_COMPOSE := qbittorrent/docker-compose.yml
HONCHO_COMPOSE := honcho/docker-compose.yml
HONCHO_ENV := honcho/.env
EXCALIDRAW_COMPOSE := excalidraw/docker-compose.yml
STREMIO_COMPOSE := stremio/docker-compose.yml
WHOAMI_COMPOSE := whoami/docker-compose.yml
WHOAMI_ENV := whoami/.env
CURRICULUM_OPTIMIZER_COMPOSE := curriculum-optimizer/docker-compose.yml
CURRICULUM_OPTIMIZER_DIR := curriculum-optimizer
FRED_DIR := fred
FRED_COMPOSE := docker-compose.yml


help:
	@echo "Comandos disponíveis:"
	@echo "  make deploy            - Deploy todos os stacks na ordem"
	@echo "  make deploy-tunnel     - Deploy apenas cloudflare tunnel"
	@echo "  make deploy-traefik    - Deploy apenas traefik"
	@echo "  make deploy-authentik  - Deploy apenas authentik"
	@echo "  make deploy-foundry-signup - Build e deploy da pagina de cadastro do Foundry"
	@echo "  make deploy-authentik-outpost-traefik - Deploy do outpost do Authentik para o dashboard do Traefik"
	@echo "  make deploy-authentik-outpost-portainer - Deploy do outpost do Authentik para o Portainer"
	@echo "  make deploy-authentik-outpost-foundry - Deploy do outpost do Authentik para o Foundry"
	@echo "  make deploy-crowdsec   - Deploy apenas crowdsec"
	@echo "  make deploy-portainer  - Deploy apenas portainer"
	@echo "  make deploy-foundry    - Deploy apenas foundry"
	@echo "  make deploy-n8n        - Deploy apenas n8n"
	@echo "  make deploy-waha       - Deploy apenas waha"
	@echo "  make deploy-qbittorrent - Deploy apenas qbittorrent"
	@echo "  make deploy-honcho     - Deploy apenas honcho"
	@echo "  make deploy-excalidraw - Deploy apenas excalidraw"
	@echo "  make deploy-stremio    - Deploy apenas stremio"
	@echo "  make deploy-whoami     - Deploy apenas whoami"
	@echo "  make deploy-fred      - Deploy apenas fred"
	@echo "  make deploy-curriculum-optimizer - Deploy local do curriculum-optimizer"
	@echo "  make deploy SERVICES=\"all\" - Deploy não-interativo de tudo"
	@echo "  make deploy SERVICES=\"traefik whoami\" - Deploy não-interativo dos serviços escolhidos"
	@echo "  make -j deploy all     - Deploy tudo sem interação"
	@echo "  make down              - Remove todos os stacks"
	@echo "  make logs-<stack>      - Mostra logs do stack"
	@echo "  make restart-<stack>   - Reinicia o stack"

deploy: setup-traefik-network setup-traefik-local-network setup-n8n-network
	@SERVICES="$(if $(filter all,$(MAKECMDGOALS)),all,$(SERVICES))" MAKE_CMD="$(MAKE)" bash ./scripts/deploy-select.sh

all:
	@:

setup-traefik-network:
	@docker network create --driver=overlay --attachable traefik-public 2>/dev/null || true
	@echo "✓ Rede traefik-public configurada"

setup-traefik-local-network:
	@docker network create --driver=overlay --attachable traefik-local 2>/dev/null || true
	@echo "✓ Rede traefik-local configurada"

setup-n8n-network:
	@docker network create --driver=overlay --attachable n8n 2>/dev/null || true
	@echo "✓ Rede n8n configurada"

deploy-tunnel:
	@echo ">>> Deploying cloudflare_tunnel..."
	docker stack deploy --detach=true -c $(TUNNEL_COMPOSE) tunnel

deploy-traefik: setup-traefik-network setup-traefik-local-network
	@echo ">>> Deploying traefik..."
	(set -a && source $(TRAEFIK_ENV) && set +a && docker stack deploy --detach=true -c $(TRAEFIK_COMPOSE) traefik)

deploy-authentik:
	@echo ">>> Deploying authentik..."
	(set -a && source $(AUTHENTIK_ENV) && set +a && docker stack deploy --detach=true -c $(AUTHENTIK_COMPOSE) authentik)

deploy-foundry-signup: setup-traefik-network
	@echo ">>> Building foundry signup image..."
	docker build -t foundry-signup:latest $(FOUNDRY_SIGNUP_DIR)
	@echo ">>> Deploying foundry signup..."
	(set -a && source $(FOUNDRY_SIGNUP_ENV) && set +a && docker stack deploy --detach=true -c $(FOUNDRY_SIGNUP_COMPOSE) foundry-signup)

deploy-authentik-outpost-traefik: setup-traefik-network
	@echo ">>> Deploying authentik outpost for traefik..."
	(set -a && source $(AUTHENTIK_OUTPOST_TRAEFIK_ENV) && set +a && docker stack deploy --detach=true -c $(AUTHENTIK_OUTPOST_TRAEFIK_COMPOSE) authentik-outpost-traefik)

deploy-authentik-outpost-portainer: setup-traefik-network
	@echo ">>> Deploying authentik outpost for portainer..."
	(set -a && source $(AUTHENTIK_OUTPOST_PORTAINER_ENV) && set +a && docker stack deploy --detach=true -c $(AUTHENTIK_OUTPOST_PORTAINER_COMPOSE) authentik-outpost-portainer)

deploy-authentik-outpost-foundry: setup-traefik-network
	@echo ">>> Deploying authentik outpost for foundry..."
	(set -a && source $(AUTHENTIK_OUTPOST_FOUNDRY_ENV) && set +a && docker stack deploy --detach=true -c $(AUTHENTIK_OUTPOST_FOUNDRY_COMPOSE) authentik-outpost-foundry)

deploy-crowdsec:
	@echo ">>> Deploying crowdsec..."
	(set -a && source $(CROWDSEC_ENV) && set +a && docker stack deploy --detach=true -c $(CROWDSEC_COMPOSE) crowdsec)

deploy-portainer:
	@echo ">>> Deploying portainer..."
	(set -a && source $(PORTAINER_ENV) && set +a && docker stack deploy --detach=true -c $(PORTAINER_COMPOSE) portainer)

deploy-foundry:
	@echo ">>> Deploying foundry..."
	docker stack deploy --detach=true -c $(FOUNDRY_COMPOSE) foundry

deploy-n8n: setup-traefik-local-network
	@echo ">>> Deploying n8n..."
	(set -a && source $(N8N_ENV) && set +a && docker stack deploy --detach=true -c $(N8N_COMPOSE) n8n)

deploy-waha: setup-traefik-local-network
	@echo ">>> Deploying waha..."
	(set -a && source $(WAHA_ENV) && set +a && docker stack deploy --detach=true -c $(WAHA_COMPOSE) waha)

deploy-qbittorrent:
	@echo ">>> Deploying qbittorrent..."
	docker stack deploy --detach=true -c $(QBITTORRENT_COMPOSE) qbittorrent

deploy-honcho:
	@echo ">>> Deploying honcho..."
	@if ! grep -q '^LLM_OPENAI_API_KEY=.' $(HONCHO_ENV); then echo "ERRO: preencha LLM_OPENAI_API_KEY em $(HONCHO_ENV) antes do deploy"; exit 1; fi
	(set -a && source $(HONCHO_ENV) && set +a && docker stack deploy --detach=true -c $(HONCHO_COMPOSE) honcho)

deploy-excalidraw:
	@echo ">>> Deploying excalidraw..."
	docker stack deploy --detach=true -c $(EXCALIDRAW_COMPOSE) excalidraw

deploy-stremio:
	@echo ">>> Deploying stremio..."
	docker stack deploy --detach=true -c $(STREMIO_COMPOSE) stremio

deploy-whoami: setup-traefik-network
	@echo ">>> Deploying whoami..."
	(set -a && source $(WHOAMI_ENV) && set +a && docker stack deploy --detach=true -c $(WHOAMI_COMPOSE) whoami)

deploy-fred: setup-traefik-local-network
	@echo ">>> Deploying fred..."
	(cd $(FRED_DIR) && docker compose down && docker compose build api && docker stack deploy --detach=true -c $(FRED_COMPOSE) fred)

deploy-curriculum-optimizer:
	@echo ">>> Deploying curriculum-optimizer..."
	(cd $(CURRICULUM_OPTIMIZER_DIR) && docker compose up -d --build)

down:
	@echo ">>> Removendo todos os stacks..."
	-docker stack rm qbittorrent
	-docker stack rm honcho
	-docker stack rm foundry
	-docker stack rm portainer
	-docker stack rm traefik
	-docker stack rm crowdsec
	-docker stack rm authentik
	-docker stack rm foundry-signup
	-docker stack rm authentik-outpost-traefik
	-docker stack rm authentik-outpost-portainer
	-docker stack rm authentik-outpost-foundry
	-docker stack rm tunnel
	-docker stack rm waha
	-docker stack rm n8n
	-docker stack rm excalidraw
	-docker stack rm stremio
	-docker stack rm whoami
	-docker stack rm fred
	-(cd $(FRED_DIR) && docker compose down)
	-(cd $(CURRICULUM_OPTIMIZER_DIR) && docker compose down)
	@echo "✓ Stacks removidos"

logs-tunnel:
	docker service logs -f tunnel_cloudflared

logs-traefik:
	docker service logs -f traefik_traefik

logs-authentik:
	docker service logs -f authentik_authentik

logs-foundry-signup:
	docker service logs -f foundry-signup_foundry-signup

logs-authentik-outpost-traefik:
	docker service logs -f authentik-outpost-traefik_proxy

logs-authentik-outpost-portainer:
	docker service logs -f authentik-outpost-portainer_proxy

logs-authentik-outpost-foundry:
	docker service logs -f authentik-outpost-foundry_proxy

logs-crowdsec:
	docker service logs -f crowdsec_crowdsec

logs-portainer:
	docker service logs -f portainer_portainer

logs-foundry:
	docker service logs -f foundry_foundry

logs-n8n:
	docker service logs -f n8n_n8n-main

logs-waha:
	docker service logs -f waha_waha

logs-qbittorrent:
	docker service logs -f qbittorrent_qbittorrent

logs-honcho:
	docker service logs -f honcho_api

logs-excalidraw:
	docker service logs -f excalidraw_excalidraw-canvas

logs-stremio:
	docker service logs -f stremio_stremio-server

logs-whoami:
	docker service logs -f whoami_whoami

logs-fred:
	(cd $(FRED_DIR) && docker compose logs -f)

logs-curriculum-optimizer:
	(cd $(CURRICULUM_OPTIMIZER_DIR) && docker compose logs -f)

restart-tunnel:
	docker service update --force tunnel_cloudflared

restart-traefik:
	docker service update --force traefik_traefik

restart-crowdsec:
	docker service update --force crowdsec_crowdsec

restart-authentik:
	docker service update --force authentik_authentik

restart-foundry-signup:
	docker service update --force foundry-signup_foundry-signup

restart-authentik-outpost-traefik:
	docker service update --force authentik-outpost-traefik_proxy

restart-authentik-outpost-portainer:
	docker service update --force authentik-outpost-portainer_proxy

restart-authentik-outpost-foundry:
	docker service update --force authentik-outpost-foundry_proxy

restart-portainer:
	docker service update --force portainer_portainer

restart-foundry:
	docker service update --force foundry_foundry

restart-n8n:
	docker service update --force n8n_n8n-main

restart-waha:
	docker service update --force waha_waha

restart-qbittorrent:
	docker service update --force qbittorrent_qbittorrent

restart-honcho:
	docker service update --force honcho_api

restart-excalidraw:
	docker service update --force excalidraw_excalidraw-canvas

restart-stremio:
	docker service update --force stremio_stremio-server

restart-whoami:
	docker service update --force whoami_whoami

restart-fred:
	(cd $(FRED_DIR) && docker compose restart)

restart-curriculum-optimizer:
	(cd $(CURRICULUM_OPTIMIZER_DIR) && docker compose restart)
