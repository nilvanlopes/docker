.PHONY: dev dev-logs dev-api-logs dev-stop

dev:
	-docker rm -f fichamutantes-dev >/dev/null 2>&1
	-docker service rm fichamutantes_dev_api >/dev/null 2>&1
	-docker network create --driver overlay --attachable --internal fichamutantes-dev >/dev/null 2>&1
	docker build --target api-dev -t fichamutantes-dev-api:local .
	docker service create --name fichamutantes_dev_api --network fichamutantes-dev --network fichamutantes_database --constraint 'node.hostname==pyuserver' --mount type=bind,source="$(CURDIR)/server",target=/app/server,readonly --secret 'source=fichamutantes_db_password,target=fichamutantes_db_password,uid=1000,gid=1000,mode=0400' --env DB_HOST=postgres --env DB_NAME=fichamutantes_dev --env DB_USER=fichamutantes --env DB_PASSWORD_FILE=/run/secrets/fichamutantes_db_password --env PUBLIC_ORIGIN=http://fichamutantes.localnetwork --env DEV_AUTH_BYPASS=1 --env DEV_AUTH_USERNAME=pyu fichamutantes-dev-api:local
	docker run -d --name fichamutantes-dev --network traefik-local --network-alias fichamutantes-dev -v "$(CURDIR):/app" -v fichamutantes_node_modules:/app/node_modules -w /app node:24-alpine sh -lc 'if [ ! -x node_modules/.bin/vite ]; then npm install; fi; npm run dev -- --host 0.0.0.0'
	docker network connect fichamutantes-dev fichamutantes-dev

dev-logs:
	docker logs -f fichamutantes-dev

dev-api-logs:
	docker service logs -f fichamutantes_dev_api

dev-stop:
	docker rm -f fichamutantes-dev
	-docker service rm fichamutantes_dev_api >/dev/null 2>&1
