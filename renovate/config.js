/**
 * Configuração administrativa do Renovate.
 *
 * Este arquivo é executado pelo workflow central do repositório agregador.
 * Os compose files continuam pertencendo aos seus repositórios originais;
 * por isso a lista abaixo aponta diretamente para cada repositório.
 */
module.exports = {
  platform: 'github',
  gitAuthor: 'Nilvan Lopes <28903634+nilvanlopes@users.noreply.github.com>',
  repositories: [
    'nilvanlopes/authentik',
    'nilvanlopes/cloudflare_tunnel',
    'nilvanlopes/crowdsec',
    'nilvanlopes/curriculum-optimizer',
    'nilvanlopes/excalidraw',
    'nilvanlopes/foundry',
    'nilvanlopes/fredApi',
    'nilvanlopes/honcho',
    'nilvanlopes/job-application-automation',
    'nilvanlopes/n8n',
    'nilvanlopes/ollama',
    'nilvanlopes/portainer',
    'nilvanlopes/qbittorrent',
    'nilvanlopes/stremio',
    'nilvanlopes/traefik',
    'nilvanlopes/waha',
    'nilvanlopes/whoami',
  ],

  // Os repositórios não precisam de um renovate.json próprio.
  onboarding: false,
  requireConfig: 'optional',
  dependencyDashboard: true,
  enabledManagers: ['docker-compose', 'dockerfile'],

  extends: [
    'config:recommended',
    'docker:pinDigests',
  ],

  // Evita abrir uma grande quantidade de PRs simultaneamente.
  prConcurrentLimit: 5,
  branchConcurrentLimit: 10,
  prHourlyLimit: 2,
  rebaseWhen: 'behind-base-branch',
  minimumReleaseAge: '7 days',

  packageRules: [
    {
      description: 'Contornar stability-days incorreto para digests Docker',
      matchDatasources: ['docker'],
      matchUpdateTypes: ['digest', 'pinDigest'],
      minimumReleaseAgeBehaviour: 'timestamp-optional',
    },
    {
      description: 'Permitir versões de registries Docker sem timestamp',
      matchDatasources: ['docker'],
      matchPackageNames: ['/^ghcr\\.io\\//', '/^lscr\\.io\\//'],
      minimumReleaseAgeBehaviour: 'timestamp-optional',
    },
    {
      description: 'Não atualizar major versions automaticamente',
      matchManagers: ['docker-compose', 'dockerfile'],
      matchUpdateTypes: ['major'],
      enabled: false,
    },
    {
      description: 'Atualizações de banco sempre exigem revisão',
      matchDatasources: ['docker'],
      matchPackageNames: [
        'postgres',
        'postgres:*',
        'pgvector/pgvector',
        'redis',
        'redis:*',
      ],
      automerge: false,
    },
    {
      description: 'Atualizações Docker agrupadas por digest',
      matchDatasources: ['docker'],
      matchUpdateTypes: ['digest'],
      groupName: 'Docker image digests',
      automerge: false,
    },
    {
      description: 'Serviços sensíveis nunca fazem merge automático',
      matchPackageNames: [
        'ghcr.io/goauthentik/server',
        'devlikeapro/waha',
        'n8nio/n8n',
        'ollama/ollama',
      ],
      automerge: false,
    },
  ],
};
