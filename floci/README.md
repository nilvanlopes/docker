# Floci para imagens do FichasRPG

O Floci roda no Docker Swarm e fornece o bucket `fichasrpg-assets` para as
imagens públicas do FichasRPG. As imagens têm URLs como:

```text
https://fichasrpg-assets.nilvanlopes.com/campanha/capa.png
```

O acesso externo percorre Cloudflare Tunnel, Traefik e um proxy Nginx dedicado;
esse proxy encaminha somente `GET` e `HEAD` de objetos do bucket. O endpoint
S3 completo não tem porta publicada e não fica exposto pelo Tunnel. Uploads e
operações administrativas são feitas no host Swarm pelo helper `aws.sh`, que
executa um cliente AWS CLI descartável conectado somente à overlay privada.

```text
Internet → Cloudflare Tunnel → Traefik → proxy somente leitura → Floci S3
```

## Publicar

```bash
make deploy-floci
make setup-floci-assets
```

O segundo comando cria o bucket, configura leitura pública dos objetos e mantém
bloqueadas as ACLs públicas. A listagem do bucket não é pública.

## Enviar uma imagem

```bash
./floci/upload-image.sh ./capa.png campanha/capa.png
```

O comando imprime a URL pública, que pode ser usada como `src` em uma imagem:

```html
<img src="https://fichasrpg-assets.nilvanlopes.com/campanha/capa.png" alt="Capa">
```

Esse bucket é somente para imagens que podem ser públicas. O campo “Desenho do
personagem” usa o bucket privado `fichasrpg-drawings` e as rotas autenticadas da
API do FichasRPG; não envie desenhos de fichas para `fichasrpg-assets`.

```bash
make setup-floci-drawings
```

Outras operações S3 podem ser executadas no host pelo wrapper:

```bash
./floci/aws.sh s3 ls s3://fichasrpg-assets
```

O wrapper precisa de acesso administrativo ao Docker Swarm; não publique o
endpoint S3 para usá-lo.

## Limites de segurança

- A API S3 não tem portas publicadas. `floci-internal` é uma overlay interna e
  attachable; conecte nela somente o proxy de imagens e operadores confiáveis.
- O proxy público aceita apenas `GET` e `HEAD`, e sempre aponta para o bucket
  `fichasrpg-assets`. Upload e exclusão não passam pelo hostname público.
- O Floci valida assinaturas e políticas S3. A credencial local `test/test` é
  conhecida e representa a conta de teste; qualquer workload na overlay privada
  pode operar a API S3. Não conecte aplicações não confiáveis nem use dados reais.
- O processo Floci roda como UID 1001 sem capabilities, com root filesystem
  somente leitura e `/tmp` em tmpfs. O socket Docker não é montado, a UI fica
  desabilitada e serviços que iniciam containers ou executam templates VTL
  também ficam desligados.
- O helper de upload aceita somente JPEG, PNG, WebP, GIF ou AVIF. O proxy marca
  o conteúdo com `nosniff` e evita armazenar em cache respostas de erro.
- Os dados persistem no volume Swarm `floci-data`, no nó `pyuserver`. `make down`
  remove a stack, mas preserva o volume.

A imagem está fixada em `2.3.0`. As advisories consultadas para EKS, JWT
authorizer, ECS e VTL têm faixas afetadas anteriores a essa versão.
