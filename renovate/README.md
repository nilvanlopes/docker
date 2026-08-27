# Renovate centralizado

O workflow [`../.github/workflows/renovate.yml`](../.github/workflows/renovate.yml)
executa o Renovate uma vez por semana e também pode ser iniciado manualmente.
Ele lê [`../renovate-config.js`](../renovate-config.js) e monitora os
repositórios dos submódulos sem exigir uma configuração repetida em cada um.

## Ativação

1. Criar um token do GitHub para o usuário/bot que administrará os repositórios.
   Ele precisa conseguir ler e criar branches/PRs nos repositórios monitorados.
2. Cadastrar esse token no repositório `nilvanlopes/docker` como Secret chamado
   `RENOVATE_TOKEN`.
3. Executar o workflow manualmente em **Actions > Renovate > Run workflow**.
4. Conferir o primeiro Dependency Dashboard e os PRs criados.

O token não deve ser colocado em arquivo, compose ou variável versionada.

## Política aplicada

- atualizações de Docker Compose e Dockerfile são detectadas centralmente;
- imagens passam a ser acompanhadas por digest;
- major versions ficam bloqueadas inicialmente;
- PostgreSQL, Redis, Authentik, WAHA, n8n e Ollama nunca fazem merge automático;
- cada PR deve ser revisado antes do redeploy da Stack no Portainer/Swarm.

O Renovate altera os repositórios donos dos compose files. Depois do merge,
este agregador pode ter seus ponteiros de submódulo atualizados separadamente.
