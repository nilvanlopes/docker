# My Dockerized Services by Nilvan Lopes

This repository contains a collection of docker-compose configurations for various self-hosted services. Each service is contained in its own directory and can be deployed independently.

## Services

*   [authentik](https://github.com/nilvanlopes/authentik)
*   [cloudflare_tunnel](https://github.com/nilvanlopes/cloudflare_tunnel)
*   [crowdsec](https://github.com/nilvanlopes/crowdsec)
*   [n8n](https://github.com/nilvanlopes/n8n)
*   [portainer](https://github.com/nilvanlopes/portainer)
*   [traefik](https://github.com/nilvanlopes/traefik)
*   [waha](https://github.com/nilvanlopes/waha)
*   [whoami](https://github.com/nilvanlopes/whoami)

## Usage

To deploy a service, navigate to its directory and run:

```bash
docker-compose up -d
```

Please refer to the `README.md` file in each service's directory for more specific instructions.

## Architecture and Container Interactions

This repository is a monorepo containing the configurations for a set of self-hosted services, all running in a Docker Swarm environment. The services are designed to work together to provide a secure and robust platform for hosting web applications.

The core of the architecture is **Traefik**, a modern reverse proxy and load balancer. All incoming traffic is routed through Traefik, which then directs it to the appropriate service. Traefik also handles SSL termination, using Let's Encrypt to automatically provision and renew SSL certificates. The certificates are resolved using Cloudflare DNS.

The services are exposed to the internet via **Cloudflare Tunnel**, which creates a secure tunnel between the Cloudflare network and the Docker Swarm. This allows the services to be accessible from the internet without exposing the host server directly.

Authentication and authorization are handled by **Authentik**, an open-source identity provider. Authentik is used to protect the services that should not be publicly accessible. When a user tries to access a protected service, Traefik redirects them to Authentik to log in. Once authenticated, Authentik sends the user back to the service with a valid session.

**CrowdSec** is used to protect the services from malicious actors. CrowdSec is a collaborative intrusion detection system that analyzes the logs from Traefik to detect and block attacks. It uses a bouncer integrated with Traefik to block malicious IP addresses at the edge.

**Portainer** provides a web-based UI for managing the Docker Swarm environment. It allows for easy monitoring and management of the containers, services, and stacks.

The following is a breakdown of the services and their interactions:

### Core Infrastructure

*   **Traefik**: The entry point for all traffic. It is responsible for routing, load balancing, and SSL termination. It is configured to work with Docker Swarm, automatically discovering and configuring new services as they are deployed.
*   **Cloudflare Tunnel**: Exposes the services to the internet through a secure tunnel to the Cloudflare network. It is configured to forward all traffic to Traefik.
*   **Authentik**: Provides authentication and authorization for the services. It is integrated with Traefik to protect the services that are not public.
*   **CrowdSec**: A security tool that monitors Traefik's logs to detect and block malicious IPs. It consists of the CrowdSec agent, which analyzes the logs, and a bouncer, which blocks the IPs in Traefik.
*   **Portainer**: A management UI for Docker Swarm. It is used to monitor and manage the containers.

### Applications

*   **n8n**: A workflow automation tool. It is exposed through Traefik and can be protected by Authentik. It has its own database (PostgreSQL) and Redis instance.
*   **Waha**: A WhatsApp API gateway. It is connected to the `n8n` network, which suggests that it is used in n8n workflows.
*   **whoami**: A simple service that returns information about the request. It is used for testing and debugging Traefik configurations.

### Network and Data Flow

1.  A user accesses a service via a domain name managed by Cloudflare.
2.  Cloudflare routes the request through the **Cloudflare Tunnel** to the Docker Swarm.
3.  The **Cloudflare Tunnel** forwards the request to **Traefik**.
4.  **Traefik** analyzes the request and determines which service to route it to based on the domain name.
5.  If the service is protected by **Authentik**, Traefik redirects the user to Authentik for authentication.
6.  Once authenticated, the user is redirected back to the service.
7.  All traffic to Traefik is logged and analyzed by **CrowdSec**. If a malicious IP is detected, it is blocked by the CrowdSec bouncer in Traefik.
8.  The services themselves run in their own Docker networks, and they are only exposed to the outside world through Traefik.

This architecture provides a secure, scalable, and easy-to-manage platform for self-hosting a variety of services.

## Makefile Usage

This repository includes a `Makefile` to simplify the management of the Docker Swarm stacks. The `Makefile` provides commands to deploy, update, and manage the services.

### Prerequisites

Before using the `Makefile`, ensure that you have a Docker Swarm cluster running and that you have configured the necessary environment variables for each service.

### Commands

*   `make help`: Displays a list of available commands.
*   `make deploy`: Deploys all the stacks in the correct order. This command will also create the necessary Docker networks (`traefik-public` and `n8n`) if they don't exist.
*   `make deploy-<stack>`: Deploys a specific stack. Replace `<stack>` with the name of the service you want to deploy (e.g., `make deploy-traefik`).
*   `make down`: Removes all the stacks from the Docker Swarm.
*   `make logs-<stack>`: Tails the logs of a specific service. Replace `<stack>` with the name of the service (e.g., `make logs-traefik`).
*   `make restart-<stack>`: Forcefully restarts a specific service. Replace `<stack>` with the name of the service (e.g., `make restart-traefik`).

### Deployment Order

The `make deploy` command deploys the services in the following order:

1.  `cloudflare-tunnel`
2.  `traefik`
3.  `authentik`
4.  `crowdsec`
5.  `portainer`
6.  `n8n`
7.  `waha`

This order ensures that the core infrastructure is up and running before the applications are deployed.