# Renovate centralizado

O workflow [`../.github/workflows/renovate.yml`](../.github/workflows/renovate.yml)
executa o Renovate uma vez por semana e também pode ser iniciado manualmente.
Ele lê [`config.js`](config.js) e monitora os
repositórios dos submódulos sem exigir uma configuração repetida em cada um.

## Ativação

### 1. Criar o token do GitHub

No GitHub, abra **Settings > Developer settings > Personal access tokens >
Fine-grained tokens** e clique em **Generate new token**.

Use uma validade definida e selecione os repositórios que aparecem em
[`config.js`](config.js). Para este workflow, conceda:

- **Metadata**: `Read-only`;
- **Contents**: `Read and write`;
- **Pull requests**: `Read and write`;
- **Issues**: `Read and write` (necessário para o Dependency Dashboard).
- **Commit statuses**: `Read and write` (necessário para publicar o status das
  branches do Renovate).

O token precisa pertencer a uma conta que tenha acesso de escrita a todos os
repositórios monitorados. Para repositórios de uma organização, a organização
também pode exigir aprovação do administrador.

Se o token já foi criado, edite-o em **Settings > Developer settings > Personal
access tokens > Fine-grained tokens**, adicione **Commit statuses: Read and
write** e salve. Não é necessário criar outro token se ele puder ser editado.

Copie o token imediatamente após sua criação. O GitHub não o exibe novamente.

### 2. Cadastrar `RENOVATE_TOKEN` no repositório

No repositório `nilvanlopes/docker`:

1. Abra **Settings**;
2. No menu lateral, abra **Secrets and variables > Actions**;
3. Clique em **New repository secret**;
4. Em **Name**, informe exatamente `RENOVATE_TOKEN`;
5. Cole o token em **Secret**;
6. Clique em **Add secret**.

O token deve ser cadastrado como **Repository secret**, não como variável
pública. Nunca coloque seu valor em `config.js`, em um compose ou em um
commit.

### 3. Executar o workflow

Abra **Actions > Renovate > Run workflow** e execute-o manualmente. Depois,
confira o **Dependency Dashboard** e os PRs criados nos repositórios monitorados.

Após a ativação inicial, o workflow roda automaticamente toda segunda-feira às
03:00 UTC (00:00 no horário de São Paulo).

## Política aplicada

- atualizações de Docker Compose e Dockerfile são detectadas centralmente;
- imagens passam a ser acompanhadas por digest;
- major versions ficam bloqueadas inicialmente;
- PostgreSQL, Redis, Authentik, WAHA, n8n e Ollama nunca fazem merge automático;
- cada PR deve ser revisado antes do redeploy da Stack no Portainer/Swarm.

O Renovate altera os repositórios donos dos compose files. Depois do merge,
este agregador pode ter seus ponteiros de submódulo atualizados separadamente.
