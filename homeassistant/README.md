# Home Assistant Container

Home Assistant em Docker Swarm, disponível em
`https://homeassistant.nilvanlopes.com` no navegador e no aplicativo Companion,
com login nativo, TLS e CrowdSec. O Authentik não participa desse acesso.

A instalação atual já tem conta criada, proxy confiável, URL externa e
bloqueio de IP após cinco tentativas de login inválidas configurados. O segundo
fator depende de ativação pelo próprio usuário no perfil do Home Assistant.

## Acesso e autenticação

No aplicativo, cadastre `https://homeassistant.nilvanlopes.com` como endereço
do servidor e entre com sua conta do Home Assistant. Esse mesmo endereço abre
o dashboard pela internet. O antigo `homeassistant-app.nilvanlopes.com` foi
retirado das rotas do Traefik.

Para ativar o segundo fator, abra seu perfil, entre em **Segurança** e habilite
**Aplicativo autenticador** em **Autenticação multifator**. Leia o QR code no
seu autenticador e confirme o código na própria interface. A configuração é
individual para cada conta; ela não é ativada apenas pela publicação do
serviço. Veja a [documentação oficial de MFA](https://www.home-assistant.io/docs/authentication/multi-factor-auth/).

## Arquitetura

O acesso percorre Cloudflare Tunnel → Traefik → CrowdSec → Home Assistant
(`homeassistant_homeassistant:8123`). A porta 8123 fica na rede overlay
`traefik-public`, sem publicação de porta no host na stack definitiva.

Uma única rota aplica CrowdSec a todos os caminhos, incluindo a interface,
a autorização do aplicativo e WebSocket. O Home Assistant gerencia suas
contas, permissões e tokens. Endpoints públicos, como a tela de login e
webhooks, seguem as regras nativas do Home Assistant.

A rota está em
[`../traefik/infra/traefik/dynamic/homeassistant.yml`](../traefik/infra/traefik/dynamic/homeassistant.yml).
O Traefik acompanha essa pasta automaticamente. O DNS deve apontar para o
Cloudflare Tunnel, com uma regra de ingress para esse hostname ou para
`*.nilvanlopes.com`.

## Primeiro acesso local

Esta etapa prepara uma instalação nova. A instalação atual já foi preparada
e está na stack definitiva. A imagem oficial usa seu próprio inicializador,
sem scripts de bootstrap.

A confiança no Traefik é configurada uma vez pela interface. O modo temporário
usa Docker Compose e o mesmo volume da stack. Ele publica somente
`127.0.0.1:18123` no servidor. Na raiz do repositório:

```bash
make setup-homeassistant
```

No computador em que abrirá o navegador, mantenha um túnel SSH ativo:

```bash
ssh -N -o ExitOnForwardFailure=yes -L 127.0.0.1:18123:127.0.0.1:18123 pyu@192.168.10.90
```

Abra `http://127.0.0.1:18123` e conclua o assistente inicial criando sua conta.
Depois:

1. Abra **Configurações → Sistema → Rede → Servidor HTTP**.
2. Ative **Confiar em X-Forwarded-For** e adicione `10.0.1.0/24` em
   **Proxies confiáveis**. Essa é a sub-rede atual de `traefik-public`.
3. Mantenha a porta `8123`, ative o bloqueio de IP e defina o limite de
   tentativas de login como `5`.
4. Salve, aguarde o reinício e confirme os ajustes em até cinco minutos.
5. Nos ajustes de rede, configure a URL externa como
   `https://homeassistant.nilvanlopes.com`.

Os campos podem aparecer como **Trust X-Forwarded-For**, **Trusted proxies** e
**Login attempts threshold**. Consulte a
[documentação HTTP oficial](https://www.home-assistant.io/integrations/http/).

O túnel SSH encaminha TCP sem adicionar cabeçalhos de proxy e permite manter
o acesso durante esses ajustes. A conta e as configurações ficam no volume;
não é necessário refazer a preparação a cada deploy.

## Publicação

Com Traefik, Cloudflare Tunnel e CrowdSec operacionais, conclua e confirme os
ajustes pela interface. Depois:

```bash
make stop-homeassistant-setup
make deploy-homeassistant
```

O primeiro comando remove o container temporário, preservando o volume.
Encerre também o túnel SSH com `Ctrl+C`. Os alvos de preparação e deploy
recusam executar uma segunda instância no mesmo volume.

O serviço aparece também no seletor `make deploy`:

```bash
make deploy SERVICES="homeassistant"
```

## Persistência e configuração

O volume `homeassistant_homeassistant_config` guarda `/config`, incluindo
usuários, integrações, automações e banco SQLite. Novos deploys preservam os
dados. A imagem está fixada por versão e digest no Compose.

O serviço usa uma réplica no nó `pyuserver`, onde fica o volume local. Se mudar
o nó, migre o volume e ajuste o Compose. Atualizações param a tarefa anterior
antes de iniciar outra no mesmo banco, com 60 segundos para encerramento.

Os ajustes HTTP ficam em **Configurações → Sistema → Rede**. Se a sub-rede de
`traefik-public` mudar, atualize os proxies confiáveis pela interface. O limite
de cinco tentativas bloqueia o IP que acumular falhas; os bloqueios nativos
ficam em `/config/ip_bans.yaml`. O CrowdSec mantém seus próprios bloqueios.

Para recuperar o acesso usando o modo temporário, remova antes a stack com
`docker stack rm homeassistant` e aguarde o encerramento da tarefa. Preserve
o volume e só então execute `make setup-homeassistant`. Depois da recuperação,
encerre o modo temporário antes de publicar novamente. `make down` também
preserva o volume.

## Dispositivos e rede local

A rede overlay segue o padrão do repositório. Cadastre dispositivos pelo IP
da LAN quando a descoberta automática não funcionar. mDNS/SSDP e protocolos
que dependem de multicast podem exigir rede host ou outra rede apropriada.
Bluetooth, Zigbee e Z-Wave exigem configurar os dispositivos e, quando
necessário, D-Bus, conforme o hardware usado.

Esta instalação é Home Assistant Container. Recursos que dependem do
Supervisor precisam de containers separados. Veja a
[instalação oficial para Linux](https://www.home-assistant.io/installation/linux#install-home-assistant-container).

## Operação

```bash
make logs-homeassistant
make restart-homeassistant
docker service ps homeassistant_homeassistant
```

O healthcheck usa o Python da imagem para consultar a interface em 8123.
Para conferir o YAML persistente, no nó que executa a tarefa:

```bash
docker exec "$(docker ps -q --filter label=com.docker.swarm.service.name=homeassistant_homeassistant)" \
  python3 -m homeassistant --script check_config --config /config
```
