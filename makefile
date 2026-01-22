SHELL := /bin/bash

.PHONY: help deploy deploy-tunnel deploy-traefik deploy-authentik deploy-crowdsec deploy-portainer deploy-foundry deploy-n8n deploy-waha down logs-tunnel logs-traefik logs-authentik logs-crowdsec logs-portainer logs-foundry logs-n8n logs-waha restart-tunnel restart-traefik restart-crowdsec restart-authentik restart-crowdsec restart-portainer restart-foundry restart-n8n restart-waha

# Caminhos dos arquivos compose e variáveis de ambiente
TUNNEL_COMPOSE := cloudflare_tunnel/docker-compose.yml
TRAEFIK_COMPOSE := traefik/docker-compose.yml
TRAEFIK_ENV := traefik/.env
PORTAINER_COMPOSE := portainer/docker-compose.yml
FOUNDRY_COMPOSE := foundry/docker-compose.yml
CROWDSEC_COMPOSE := crowdsec/docker-compose.yml
CROWDSEC_ENV := crowdsec/.env
AUTHENTIK_COMPOSE := authentik/docker-compose.yml
AUTHENTIK_ENV := authentik/.env
N8N_COMPOSE := n8n/docker-compose.yml
N8N_ENV := n8n/.env
WAHA_COMPOSE := waha/docker-compose.yml
WAHA_ENV := waha/.env


help:
	@echo "Comandos disponíveis:"
	@echo "  make deploy            - Deploy todos os stacks na ordem"
	@echo "  make deploy-tunnel     - Deploy apenas cloudflare tunnel"
	@echo "  make deploy-traefik    - Deploy apenas traefik"
	@echo "  make deploy-authentik  - Deploy apenas authentik"
	@echo "  make deploy-crowdsec   - Deploy apenas crowdsec"
	@echo "  make deploy-portainer  - Deploy apenas portainer"
	@echo "  make deploy-foundry    - Deploy apenas foundry"
	@echo "  make deploy-n8n        - Deploy apenas n8n"
	@echo "  make deploy-waha       - Deploy apenas waha"
	@echo "  make down              - Remove todos os stacks"
	@echo "  make logs-<stack>      - Mostra logs do stack"
	@echo "  make restart-<stack>   - Reinicia o stack"

deploy: setup-traefik-network  setup-n8n-network deploy-tunnel deploy-traefik deploy-authentik deploy-crowdsec deploy-portainer deploy-foundry deploy-n8n deploy-waha
	@echo "✓ Todos os stacks deployados com sucesso!"

setup-traefik-network:
	@docker network create --driver=overlay --attachable traefik-public 2>/dev/null || true
	@echo "✓ Rede traefik-public configurada"

setup-n8n-network:
	@docker network create --driver=overlay --attachable n8n 2>/dev/null || true
	@echo "✓ Rede n8n configurada"

deploy-tunnel:
	@echo ">>> Deploying cloudflare_tunnel..."
	docker stack deploy --detach=true -c $(TUNNEL_COMPOSE) tunnel

deploy-traefik: setup-traefik-network
	@echo ">>> Deploying traefik..."
	(set -a && source $(TRAEFIK_ENV) && set +a && docker stack deploy --detach=true -c $(TRAEFIK_COMPOSE) traefik)

deploy-authentik:
	@echo ">>> Deploying authentik..."
	(set -a && source $(AUTHENTIK_ENV) && set +a && docker stack deploy --detach=true -c $(AUTHENTIK_COMPOSE) authentik)

deploy-crowdsec:
	@echo ">>> Deploying crowdsec..."
	(set -a && source $(CROWDSEC_ENV) && set +a && docker stack deploy --detach=true -c $(CROWDSEC_COMPOSE) crowdsec)

deploy-portainer:
	@echo ">>> Deploying portainer..."
	docker stack deploy --detach=true -c $(PORTAINER_COMPOSE) portainer

deploy-foundry:
	@echo ">>> Deploying foundry..."
	docker stack deploy --detach=true -c $(FOUNDRY_COMPOSE) foundry

deploy-n8n:
	@echo ">>> Deploying n8n..."
	(set -a && source $(N8N_ENV) && set +a && docker stack deploy --detach=true -c $(N8N_COMPOSE) n8n)

deploy-waha:
	@echo ">>> Deploying waha..."
	(set -a && source $(WAHA_ENV) && set +a && docker stack deploy --detach=true -c $(WAHA_COMPOSE) waha)

down:
	@echo ">>> Removendo todos os stacks..."
	-docker stack rm foundry
	-docker stack rm portainer
	-docker stack rm traefik
	-docker stack rm crowdsec
	-docker stack rm authentik
	-docker stack rm tunnel
	-docker stack rm waha
	-docker stack rm n8n
	@echo "✓ Stacks removidos"

logs-tunnel:
	docker service logs -f tunnel_cloudflared

logs-traefik:
	docker service logs -f traefik_traefik

logs-authentik:
	docker service logs -f authentik_authentik

logs-crowdsec:
	docker service logs -f crowdsec_crowdsec

logs-portainer:
	docker service logs -f portainer_portainer

logs-foundry:
	docker service logs -f foundry_foundry

logs-n8n:
	docker service logs -f n8n_n8n

logs-waha:
	docker service logs -f waha_waha

restart-tunnel:
	docker service update --force tunnel_cloudflared

restart-traefik:
	docker service update --force traefik_traefik

restart-crowdsec:
	docker service update --force crowdsec_crowdsec

restart-authentik:
	docker service update --force authentik_authentik

restart-portainer:
	docker service update --force portainer_portainer

restart-foundry:
	docker service update --force foundry_foundry

restart-n8n:
	docker service update --force n8n_n8n

restart-waha:
	docker service update --force waha_waha
