SHELL := /bin/bash

.PHONY: help all deploy force-stack-services deploy-tunnel deploy-traefik deploy-authentik deploy-authentik-outpost-traefik deploy-authentik-outpost-portainer deploy-authentik-outpost-foundry deploy-authentik-outpost-n8n deploy-crowdsec deploy-portainer deploy-foundry deploy-n8n deploy-waha deploy-qbittorrent deploy-excalidraw deploy-stremio deploy-whoami deploy-ollama deploy-floci deploy-job-application-automation-ollama deploy-fred deploy-curriculum-optimizer down logs-tunnel logs-traefik logs-authentik logs-foundry-signup logs-authentik-outpost-traefik logs-authentik-outpost-portainer logs-authentik-outpost-foundry logs-authentik-outpost-n8n logs-crowdsec logs-portainer logs-foundry logs-n8n logs-waha logs-qbittorrent logs-excalidraw logs-stremio logs-whoami logs-ollama logs-floci logs-job-application-automation-ollama logs-fred logs-curriculum-optimizer restart-tunnel restart-traefik restart-crowdsec restart-authentik restart-foundry-signup restart-authentik-outpost-traefik restart-authentik-outpost-portainer restart-authentik-outpost-foundry restart-authentik-outpost-n8n restart-crowdsec restart-portainer restart-foundry restart-n8n restart-waha restart-qbittorrent restart-excalidraw restart-stremio restart-whoami restart-ollama restart-floci restart-job-application-automation-ollama restart-fred restart-curriculum-optimizer

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
AUTHENTIK_OUTPOST_TRAEFIK_COMPOSE := authentik/outposts/traefik/docker-compose.yml
AUTHENTIK_OUTPOST_TRAEFIK_ENV := authentik/outposts/traefik/.env
AUTHENTIK_OUTPOST_PORTAINER_COMPOSE := authentik/outposts/portainer/docker-compose.yml
AUTHENTIK_OUTPOST_PORTAINER_ENV := authentik/outposts/portainer/.env
AUTHENTIK_OUTPOST_FOUNDRY_COMPOSE := authentik/outposts/foundry/docker-compose.yml
AUTHENTIK_OUTPOST_FOUNDRY_ENV := authentik/outposts/foundry/.env
AUTHENTIK_OUTPOST_N8N_COMPOSE := authentik/outposts/n8n/docker-compose.yml
AUTHENTIK_OUTPOST_N8N_ENV := authentik/outposts/n8n/.env
HOMEASSISTANT_COMPOSE := homeassistant/docker-compose.yml
HOMEASSISTANT_SETUP_COMPOSE := homeassistant/docker-compose.setup.yml
HOMEASSISTANT_SETUP := docker compose -p homeassistant-setup -f $(HOMEASSISTANT_COMPOSE) -f $(HOMEASSISTANT_SETUP_COMPOSE)
N8N_COMPOSE := n8n/docker-compose.yml
N8N_ENV := n8n/.env
WAHA_COMPOSE := waha/docker-compose.yml
WAHA_ENV := waha/.env
QBITTORRENT_COMPOSE := qbittorrent/docker-compose.yml
EXCALIDRAW_COMPOSE := excalidraw/docker-compose.yml
STREMIO_COMPOSE := stremio/docker-compose.yml
STREMIO_WEB_DIR := stremio/stremio-web
STREMIO_WEB_IMAGE := stremio-web-official:development
WHOAMI_COMPOSE := whoami/docker-compose.yml
WHOAMI_ENV := whoami/.env
OLLAMA_DIR := ollama
FLOCI_COMPOSE := floci/docker-compose.yml
JOB_APPLICATION_AUTOMATION_DIR := job-application-automation
JOB_APPLICATION_AUTOMATION_OLLAMA_COMPOSE := docker-compose.ollama.yml
CURRICULUM_OPTIMIZER_COMPOSE := curriculum-optimizer/docker-compose.yml
CURRICULUM_OPTIMIZER_DIR := curriculum-optimizer
FRED_DIR := fred
FRED_COMPOSE := docker-compose.yml
NINEROUTER_DIR := 9router
FICHASRPG_DIR := fichasrpg
FICHASRPG_ENV := $(FICHASRPG_DIR)/.env
FICHASRPG_IMAGE := fichasrpg:latest
FICHASRPG_API_IMAGE := fichasrpg-api:latest
AUTHENTIK_OUTPOST_FICHASRPG_COMPOSE := authentik/outposts/fichasrpg/docker-compose.yml
AUTHENTIK_OUTPOST_FICHASRPG_ENV := authentik/outposts/fichasrpg/.env

.PHONY: deploy-fichasrpg deploy-authentik-outpost-fichasrpg logs-fichasrpg restart-fichasrpg

.PHONY: deploy-adguard setup-traefik-local-lan logs-adguard restart-adguard
.PHONY: logs-authentik-outpost-fichasrpg restart-authentik-outpost-fichasrpg
.PHONY: deploy-9router logs-9router restart-9router
.PHONY: deploy-homeassistant logs-homeassistant restart-homeassistant
.PHONY: setup-homeassistant stop-homeassistant-setup
.PHONY: setup-floci-network setup-floci-assets setup-floci-drawings


help:
	@echo "  make deploy-meu-site - Build e deploy do site privado do pyu"
	@echo "Comandos disponíveis:"
	@echo "  make deploy-9router   - Build e deploy Swarm do 9router na LAN"
	@echo "  make deploy-fichasrpg - Build e deploy do portal Fichas de RPG"
	@echo "  make deploy-authentik-outpost-fichasrpg - Deploy do outpost do portal RPG"
	@echo "  make deploy-adguard    - Provisionar e publicar DNS AdGuard interno"
	@echo "  make setup-traefik-local-lan - Preparar o IP 192.168.10.91 para o Traefik"
	@echo "  make deploy            - Deploy todos os stacks na ordem"
	@echo "  make deploy-tunnel     - Deploy apenas cloudflare tunnel"
	@echo "  make deploy-traefik    - Deploy apenas traefik"
	@echo "  make deploy-authentik  - Deploy apenas authentik"
	@echo "  make deploy-authentik-outpost-traefik - Deploy do outpost do Authentik para o dashboard do Traefik"
	@echo "  make deploy-authentik-outpost-portainer - Deploy do outpost do Authentik para o Portainer"
	@echo "  make deploy-authentik-outpost-foundry - Deploy do outpost do Authentik para o Foundry"
	@echo "  make deploy-authentik-outpost-n8n - Deploy do outpost do Authentik para o n8n"
	@echo "  make deploy-homeassistant - Deploy do Home Assistant"
	@echo "  make setup-homeassistant - Primeiro acesso ao Home Assistant por túnel SSH"
	@echo "  make stop-homeassistant-setup - Encerrar o acesso temporário, preservando os dados"
	@echo "  make deploy-crowdsec   - Deploy apenas crowdsec"
	@echo "  make deploy-portainer  - Deploy apenas portainer"
	@echo "  make deploy-foundry    - Deploy apenas foundry"
	@echo "  make deploy-n8n        - Deploy apenas n8n"
	@echo "  make deploy-waha       - Deploy apenas waha"
	@echo "  make deploy-qbittorrent - Deploy apenas qbittorrent"
	@echo "  make deploy-excalidraw - Deploy apenas excalidraw"
	@echo "  make deploy-stremio    - Deploy apenas stremio"
	@echo "  make deploy-whoami     - Deploy apenas whoami"
	@echo "  make deploy-ollama     - Deploy apenas ollama local"
	@echo "  make deploy-floci      - Publicar Floci privado e proxy público de leitura"
	@echo "  make setup-floci-assets - Criar o bucket público de assets do FichasRPG"
	@echo "  make setup-floci-drawings - Criar o bucket privado de desenhos por ficha"
	@echo "  make deploy-job-application-automation-ollama - Deploy do Ollama gerenciado pelo job-application-automation"
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

force-stack-services:
	@test -n "$(STACK)" || { echo "ERRO: STACK é obrigatório." >&2; exit 1; }
	@echo ">>> Forcing update of $(STACK) services..."
	@docker stack services "$(STACK)" --format '{{.Name}}' | while read -r service; do \
		[ -n "$$service" ] || continue; \
		docker service update --force "$$service" >/dev/null; \
	done

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
	$(MAKE) --no-print-directory force-stack-services STACK=tunnel

deploy-traefik: setup-traefik-network setup-traefik-local-network setup-traefik-local-lan
	@echo ">>> Deploying traefik..."
	(set -a && source $(TRAEFIK_ENV) && set +a && docker stack deploy --detach=true -c $(TRAEFIK_COMPOSE) traefik)
	$(MAKE) --no-print-directory force-stack-services STACK=traefik

deploy-adguard: setup-traefik-local-network
	@umask 077; mkdir -p adguard/data/conf adguard/data/work
	docker stack deploy --detach=true -c adguard/docker-compose.yml adguard

setup-traefik-local-lan:
	@docker network inspect traefik_local_lan_node >/dev/null 2>&1 || docker network create --config-only --subnet=192.168.10.0/24 --gateway=192.168.10.1 --ip-range=192.168.10.91/32 -o parent=bond0 -o ipvlan_mode=l2 traefik_local_lan_node
	@docker network inspect traefik_local_lan >/dev/null 2>&1 || docker network create --driver=ipvlan --scope=swarm --config-from=traefik_local_lan_node traefik_local_lan

logs-adguard:
	docker service logs -f adguard_adguardhome

restart-adguard:
	docker service update --force adguard_adguardhome

deploy-authentik:
	@echo ">>> Deploying authentik..."
	(set -a && source $(AUTHENTIK_ENV) && set +a && docker stack deploy --detach=true -c $(AUTHENTIK_COMPOSE) authentik)
	$(MAKE) --no-print-directory force-stack-services STACK=authentik

deploy-authentik-outpost-traefik: setup-traefik-network
	@echo ">>> Deploying authentik outpost for traefik..."
	(set -a && source $(AUTHENTIK_OUTPOST_TRAEFIK_ENV) && set +a && docker stack deploy --detach=true -c $(AUTHENTIK_OUTPOST_TRAEFIK_COMPOSE) authentik-outpost-traefik)
	$(MAKE) --no-print-directory force-stack-services STACK=authentik-outpost-traefik

deploy-authentik-outpost-portainer: setup-traefik-network
	@echo ">>> Deploying authentik outpost for portainer..."
	(set -a && source $(AUTHENTIK_OUTPOST_PORTAINER_ENV) && set +a && docker stack deploy --detach=true -c $(AUTHENTIK_OUTPOST_PORTAINER_COMPOSE) authentik-outpost-portainer)
	$(MAKE) --no-print-directory force-stack-services STACK=authentik-outpost-portainer

deploy-authentik-outpost-foundry: setup-traefik-network
	@echo ">>> Deploying authentik outpost for foundry..."
	(set -a && source $(AUTHENTIK_OUTPOST_FOUNDRY_ENV) && set +a && docker stack deploy --detach=true -c $(AUTHENTIK_OUTPOST_FOUNDRY_COMPOSE) authentik-outpost-foundry)
	$(MAKE) --no-print-directory force-stack-services STACK=authentik-outpost-foundry

deploy-authentik-outpost-n8n: setup-traefik-network
	@echo ">>> Deploying authentik outpost for n8n..."
	@test -f $(AUTHENTIK_OUTPOST_N8N_ENV) || { echo "ERRO: $(AUTHENTIK_OUTPOST_N8N_ENV) não existe; copie o .env.example e preencha AUTHENTIK_TOKEN." >&2; exit 1; }
	(set -a && source $(AUTHENTIK_OUTPOST_N8N_ENV) && set +a && docker stack deploy --detach=true -c $(AUTHENTIK_OUTPOST_N8N_COMPOSE) authentik-outpost-n8n)
	$(MAKE) --no-print-directory force-stack-services STACK=authentik-outpost-n8n

setup-homeassistant: setup-traefik-network
	@if docker service inspect homeassistant_homeassistant >/dev/null 2>&1; then echo "ERRO: a stack Home Assistant já existe; não inicie outra instância no mesmo volume." >&2; exit 1; fi
	$(HOMEASSISTANT_SETUP) up -d --wait
	@echo "Acesso temporário em 127.0.0.1:18123 no servidor. Consulte homeassistant/README.md para abrir o túnel SSH."

stop-homeassistant-setup:
	$(HOMEASSISTANT_SETUP) down

deploy-homeassistant: setup-traefik-network
	@echo ">>> Deploying homeassistant..."
	@setup_containers="$$($(HOMEASSISTANT_SETUP) ps -q --status running)" && { test -z "$$setup_containers" || { echo "ERRO: finalize a configuração e execute make stop-homeassistant-setup antes do deploy Swarm." >&2; exit 1; }; }
	@docker stack config -c $(HOMEASSISTANT_COMPOSE) >/dev/null
	docker stack deploy --detach=true -c $(HOMEASSISTANT_COMPOSE) homeassistant
	$(MAKE) --no-print-directory force-stack-services STACK=homeassistant

deploy-crowdsec:
	@echo ">>> Deploying crowdsec..."
	(set -a && source $(CROWDSEC_ENV) && set +a && docker stack deploy --detach=true -c $(CROWDSEC_COMPOSE) crowdsec)
	$(MAKE) --no-print-directory force-stack-services STACK=crowdsec

deploy-authentik-outpost-fichasrpg: setup-traefik-network
	@test -f $(AUTHENTIK_OUTPOST_FICHASRPG_ENV) || { echo "ERRO: copie authentik/outposts/fichasrpg/.env.example para .env e preencha o token do outpost configurado no Authentik." >&2; exit 1; }
	(set -a && source $(AUTHENTIK_OUTPOST_FICHASRPG_ENV) && set +a && docker stack deploy --detach=true -c $(AUTHENTIK_OUTPOST_FICHASRPG_COMPOSE) authentik-outpost-fichasrpg)
	$(MAKE) --no-print-directory force-stack-services STACK=authentik-outpost-fichasrpg

deploy-fichasrpg: setup-traefik-network setup-floci-drawings
	@test -f $(FICHASRPG_ENV) || { echo "ERRO: $(FICHASRPG_ENV) precisa conter as credenciais atuais de cadastro." >&2; exit 1; }
	@docker secret inspect fichasrpg_db_password >/dev/null
	@docker volume inspect fichasrpg_postgres_data >/dev/null
	@(set -a && source $(FICHASRPG_ENV) && set +a && docker stack config -c "$(FICHASRPG_DIR)/docker-compose.yml" >/dev/null)
	docker build --target api -t $(FICHASRPG_API_IMAGE) "$(FICHASRPG_DIR)"
	docker build --target web -t $(FICHASRPG_IMAGE) "$(FICHASRPG_DIR)"
	(set -a && source $(FICHASRPG_ENV) && set +a && docker stack deploy --detach=true --resolve-image never -c "$(FICHASRPG_DIR)/docker-compose.yml" fichasrpg)
	docker service update --force fichasrpg_api
	docker service update --force fichasrpg_web

deploy-portainer:
	@echo ">>> Deploying portainer..."
	(set -a && source $(PORTAINER_ENV) && set +a && docker stack deploy --detach=true -c $(PORTAINER_COMPOSE) portainer)
	$(MAKE) --no-print-directory force-stack-services STACK=portainer

deploy-foundry:
	@echo ">>> Deploying foundry..."
	docker stack deploy --detach=true -c $(FOUNDRY_COMPOSE) foundry
	$(MAKE) --no-print-directory force-stack-services STACK=foundry

deploy-n8n: setup-traefik-local-network
	@echo ">>> Deploying n8n..."
	(set -a && source $(N8N_ENV) && set +a && docker stack deploy --detach=true -c $(N8N_COMPOSE) n8n)
	$(MAKE) --no-print-directory force-stack-services STACK=n8n

deploy-waha: setup-traefik-local-network
	@echo ">>> Deploying waha..."
	(set -a && source $(WAHA_ENV) && set +a && docker stack deploy --detach=true -c $(WAHA_COMPOSE) waha)
	$(MAKE) --no-print-directory force-stack-services STACK=waha

deploy-qbittorrent:
	@echo ">>> Deploying qbittorrent..."
	docker stack deploy --detach=true -c $(QBITTORRENT_COMPOSE) qbittorrent
	$(MAKE) --no-print-directory force-stack-services STACK=qbittorrent

deploy-excalidraw:
	@echo ">>> Deploying excalidraw..."
	docker stack deploy --detach=true -c $(EXCALIDRAW_COMPOSE) excalidraw
	$(MAKE) --no-print-directory force-stack-services STACK=excalidraw

deploy-stremio:
	@echo ">>> Ensuring local swarm is initialized..."
	@if [[ "$$(docker info --format '{{.Swarm.ControlAvailable}}')" != "true" ]]; then \
		advertise_addr="$${SWARM_ADVERTISE_ADDR:-$$(ip -o -4 addr show dev eth0 | awk '{split($$4,a,"/"); print a[1]; exit}')}"; \
		if [[ -z "$${advertise_addr}" ]]; then \
			echo "ERRO: não foi possível descobrir o IP da eth0; defina SWARM_ADVERTISE_ADDR." >&2; \
			exit 1; \
		fi; \
		docker swarm init --advertise-addr "$${advertise_addr}"; \
	fi
	@if [[ "$$(docker info --format '{{.Swarm.ControlAvailable}}')" != "true" ]]; then \
		echo "ERRO: este node não virou swarm manager; deploy-stremio abortado." >&2; \
		exit 1; \
	fi
	@echo ">>> Pausing stale stremio web tasks..."
	-docker service scale stremio_stremio-web=0
	@echo ">>> Building stremio web image..."
	docker build --build-arg COMMIT_HASH="$$(git -C $(STREMIO_WEB_DIR) rev-parse HEAD 2>/dev/null || echo local)" -t $(STREMIO_WEB_IMAGE) $(STREMIO_WEB_DIR)
	docker image inspect $(STREMIO_WEB_IMAGE) >/dev/null
	@echo ">>> Deploying stremio..."
	docker stack deploy --detach=true --resolve-image never -c $(STREMIO_COMPOSE) stremio
	$(MAKE) --no-print-directory force-stack-services STACK=stremio

deploy-whoami: setup-traefik-network
	@echo ">>> Deploying whoami..."
	(set -a && source $(WHOAMI_ENV) && set +a && docker stack deploy --detach=true -c $(WHOAMI_COMPOSE) whoami)
	$(MAKE) --no-print-directory force-stack-services STACK=whoami

deploy-ollama:
	@echo ">>> Deploying ollama..."
	@if docker ps --format '{{.Names}}' | grep -qx 'job-application-automation-ollama'; then \
		echo ">>> job-application-automation-ollama já fornece localhost:11434; pulando ollama."; \
	else \
		(cd $(OLLAMA_DIR) && docker compose up -d --force-recreate); \
	fi

setup-floci-network: setup-traefik-network
	@set -e; \
	if docker network inspect floci-internal >/dev/null 2>&1; then \
		test "$$(docker network inspect floci-internal --format '{{.Driver}} {{.Attachable}} {{.Internal}}')" = "overlay true true" || { echo "ERRO: floci-internal precisa ser overlay, attachable e internal." >&2; exit 1; }; \
	else \
		docker network create --driver overlay --attachable --internal floci-internal; \
	fi

deploy-floci: setup-floci-network
	@echo ">>> Publicando Floci S3 no Swarm..."
	docker stack deploy --detach=true -c $(FLOCI_COMPOSE) floci

logs-floci:
	docker service logs -f floci_floci

restart-floci:
	docker service update --force floci_floci

setup-floci-assets:
	./floci/setup-assets-bucket.sh

setup-floci-drawings: deploy-floci
	./floci/setup-drawings-bucket.sh

deploy-job-application-automation-ollama:
	@echo ">>> Deploying job-application-automation ollama..."
	@if docker ps --format '{{.Names}}' | grep -qx 'ollama-local'; then \
		echo ">>> ollama-local já fornece localhost:11434; pulando job-application-automation-ollama."; \
	else \
		(cd $(JOB_APPLICATION_AUTOMATION_DIR) && docker compose -f $(JOB_APPLICATION_AUTOMATION_OLLAMA_COMPOSE) up -d --force-recreate); \
	fi

deploy-fred: setup-traefik-local-network
	@echo ">>> Deploying fred..."
	(cd $(FRED_DIR) && docker compose down && docker compose build api && docker stack deploy --detach=true -c $(FRED_COMPOSE) fred)
	$(MAKE) --no-print-directory force-stack-services STACK=fred

deploy-curriculum-optimizer:
	@echo ">>> Deploying curriculum-optimizer..."
	(cd $(CURRICULUM_OPTIMIZER_DIR) && docker compose up -d --build --force-recreate)

deploy-9router: setup-traefik-local-network
	@test -f $(NINEROUTER_DIR)/.env || { echo "ERRO: gere 9router/.env conforme 9router/README.md." >&2; exit 1; }
	$(NINEROUTER_DIR)/deploy.py

down:
	@echo ">>> Removendo todos os stacks..."
	-$(HOMEASSISTANT_SETUP) down
	-docker stack rm homeassistant
	-docker stack rm ninerouter
	-docker stack rm fichasrpg
	-docker stack rm authentik-outpost-fichasrpg
	-docker stack rm adguard
	-docker stack rm qbittorrent
	-docker stack rm foundry
	-docker stack rm portainer
	-docker stack rm traefik
	-docker stack rm crowdsec
	-docker stack rm authentik
	-docker stack rm foundry-signup
	-docker stack rm authentik-outpost-traefik
	-docker stack rm authentik-outpost-portainer
	-docker stack rm authentik-outpost-foundry
	-docker stack rm authentik-outpost-n8n
	-docker stack rm tunnel
	-docker stack rm waha
	-docker stack rm n8n
	-docker stack rm excalidraw
	-docker stack rm stremio
	-docker stack rm whoami
	-docker stack rm fred
	-docker stack rm floci
	-(cd $(OLLAMA_DIR) && docker compose down)
	-(cd $(JOB_APPLICATION_AUTOMATION_DIR) && docker compose -f $(JOB_APPLICATION_AUTOMATION_OLLAMA_COMPOSE) down)
	-(cd $(FRED_DIR) && docker compose down)
	-(cd $(CURRICULUM_OPTIMIZER_DIR) && docker compose down)
	@echo "✓ Stacks removidos"

logs-tunnel:
	docker service logs -f tunnel_cloudflared

logs-fichasrpg:
	docker service logs -f fichasrpg_api

logs-authentik-outpost-fichasrpg:
	docker service logs -f authentik-outpost-fichasrpg_proxy

logs-traefik:
	docker service logs -f traefik_traefik

logs-authentik:
	docker service logs -f authentik_server

logs-foundry-signup:
	docker service logs -f foundry-signup_foundry-signup

logs-authentik-outpost-traefik:
	docker service logs -f authentik-outpost-traefik_proxy

logs-authentik-outpost-portainer:
	docker service logs -f authentik-outpost-portainer_proxy

logs-authentik-outpost-foundry:
	docker service logs -f authentik-outpost-foundry_proxy

logs-authentik-outpost-n8n:
	docker service logs -f authentik-outpost-n8n_proxy

logs-crowdsec:
	docker service logs -f crowdsec_crowdsec

logs-portainer:
	docker service logs -f portainer_portainer

logs-foundry:
	docker service logs -f foundry_foundry

logs-n8n:
	docker service logs -f n8n_n8n-main

logs-homeassistant:
	docker service logs -f homeassistant_homeassistant

logs-waha:
	docker service logs -f waha_waha

logs-qbittorrent:
	docker service logs -f qbittorrent_qbittorrent

logs-excalidraw:
	docker service logs -f excalidraw_excalidraw-canvas

logs-stremio:
	docker service logs -f stremio_stremio-server

logs-whoami:
	docker service logs -f whoami_whoami

logs-ollama:
	(cd $(OLLAMA_DIR) && docker compose logs -f)

logs-job-application-automation-ollama:
	(cd $(JOB_APPLICATION_AUTOMATION_DIR) && docker compose -f $(JOB_APPLICATION_AUTOMATION_OLLAMA_COMPOSE) logs -f)

logs-fred:
	(cd $(FRED_DIR) && docker compose logs -f)

logs-curriculum-optimizer:
	(cd $(CURRICULUM_OPTIMIZER_DIR) && docker compose logs -f)

logs-9router:
	docker service logs -f --tail=100 ninerouter_9router

restart-tunnel:
	docker service update --force tunnel_cloudflared

restart-fichasrpg: deploy-fichasrpg

restart-authentik-outpost-fichasrpg:
	docker service update --force authentik-outpost-fichasrpg_proxy

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

restart-authentik-outpost-n8n:
	docker service update --force authentik-outpost-n8n_proxy

restart-portainer:
	docker service update --force portainer_portainer

restart-foundry:
	docker service update --force foundry_foundry

restart-n8n:
	docker service update --force n8n_n8n-main

restart-homeassistant:
	docker service update --force homeassistant_homeassistant

restart-waha:
	docker service update --force waha_waha

restart-qbittorrent:
	docker service update --force qbittorrent_qbittorrent

restart-excalidraw:
	docker service update --force excalidraw_excalidraw-canvas

restart-stremio:
	docker build -t $(STREMIO_WEB_IMAGE) $(STREMIO_WEB_DIR)
	docker service update --force stremio_stremio-server
	docker service update --force stremio_stremio-web

restart-whoami:
	docker service update --force whoami_whoami

restart-ollama:
	(cd $(OLLAMA_DIR) && docker compose restart)

restart-job-application-automation-ollama:
	(cd $(JOB_APPLICATION_AUTOMATION_DIR) && docker compose -f $(JOB_APPLICATION_AUTOMATION_OLLAMA_COMPOSE) restart)

restart-fred:
	(cd $(FRED_DIR) && docker compose restart)

restart-curriculum-optimizer:
	(cd $(CURRICULUM_OPTIMIZER_DIR) && docker compose restart)

restart-9router:
	docker service update --force ninerouter_9router

# Site estático privado, com outpost Authentik dedicado.
.PHONY: deploy-meu-site deploy-authentik-outpost-meu-site logs-meu-site restart-meu-site

deploy-meu-site: setup-traefik-network
	python3 scripts/setup-meu-site.py
	docker stack config -c meu-site/docker-compose.yml >/dev/null
	docker build -t meu-site:latest meu-site
	$(MAKE) --no-print-directory deploy-authentik-outpost-meu-site
	docker stack deploy --detach=true --resolve-image never -c meu-site/docker-compose.yml meu-site
	docker service update --force meu-site_web

deploy-authentik-outpost-meu-site: setup-traefik-network
	@test -f authentik/outposts/meu-site/.env || { echo "ERRO: execute python3 scripts/setup-meu-site.py" >&2; exit 1; }
	@(set -a && source authentik/outposts/meu-site/.env && set +a && docker stack deploy --detach=true -c authentik/outposts/meu-site/docker-compose.yml authentik-outpost-meu-site)

logs-meu-site:
	docker service logs -f meu-site_web

restart-meu-site:
	docker service update --force meu-site_web
