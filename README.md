# BusZappMobile — BusZapp mobile (Expo)

Versão mobile do **BusZapp** (rastreamento de ônibus, cartão de transporte e
avaliações), feita com **React Native + Expo** e **Atomic Design**. Ela consome a
API Flask do repositório `BusZapp` (pasta irmã `../BusZapp`).

> **Entrega 1:** estrutura do projeto. **Entrega 2:** motoristas (RF23) e viagens com
> rastreamento. **Entrega 3:** cartão de transporte (RF11/RF12, ainda sem banco), perfil com
> câmera, notificações e painel de permissões — ver `docs/REGISTRO_ENTREGA3.md`.
> As demais telas (recarga/extrato, avaliação, cadastro) ainda são `TODO`.

## Estrutura

```
BusZappMobile/
├── App.js                 # pilha raiz + NavigationContainer
├── index.js               # registerRootComponent
├── app.json / package.json / babel.config.js / .nvmrc
├── assets/                # ícones e splash
└── src/
    ├── components/        # Atomic Design
    │   ├── atoms/         # Button, Input, Label, Badge
    │   ├── molecules/     # FormField, RouteCard, TransactionItem, StarRating...
    │   ├── organisms/     # LoginForm, RouteList, BalanceCard, BusMap...
    │   └── templates/     # ScreenTemplate, CenteredTemplate
    ├── constants/         # ajustes de FlatList
    ├── navigation/        # AppDrawer, PassengerTabs, AdminStack, opcoes, acoes
    ├── screens/           # uma tela para cada página HTML da versão web
    ├── services/          # cliente HTTP + um arquivo por grupo de rotas da API
    ├── theme/             # cores, espaçamentos, tipografia
    └── utils/             # validação e formatação
```

## Web → Mobile

| Página web (`static/`)       | Tela mobile             |
|------------------------------|-------------------------|
| login.html                   | LoginScreen             |
| register.html                | RegisterScreen          |
| forgot-password.html         | ForgotPasswordScreen    |
| terms.html                   | TermsScreen             |
| dashboard.html / index.html  | HomeScreen              |
| acompanhamento.html          | TrackingScreen          |
| recarga.html                 | RechargeScreen          |
| rating.html                  | RatingScreen            |
| profile.html                 | ProfileScreen           |
| motorista.html               | DriverScreen            |
| admin.html                   | AdminScreen             |
| admin-rotas.html             | AdminRoutesScreen       |
| add-driver.html              | AddDriverScreen         |
| add-vehicle.html             | AddVehicleScreen        |

| Blueprint Flask (`BusZapp/src/routes/`) | Service mobile                  |
|-----------------------------------------|---------------------------------|
| auth.py                                 | auth.js, motorista.js           |
| card.py                                 | cartao.js                       |
| bus.py                                  | onibus.js                       |
| tracking.py                             | rastreamento.js                 |
| admin.py                                | admin.js                        |

## Navegação

- **Pilha raiz** (`App.js`): Login, Cadastro, RecuperarSenha, Termos, Principal, Motorista, Admin
- **Drawer** (`AppDrawer`): Início, Meu perfil, Avaliar viagem
- **Abas** (`PassengerTabs`): Início, Acompanhar, Recarga
- **Pilha admin** (`AdminStack`): Painel, Rotas, Novo motorista, Novo veículo

## Rodando

```bash
nvm use
npm install
npx expo start          # 'a' abre no emulador Android
```

A URL da API fica em `src/services/config.js` (Flask na porta **8080**: `10.0.2.2` no emulador
Android, `localhost` no simulador iOS). Em celular físico, aponte para o IP da máquina na rede:

```bash
EXPO_PUBLIC_API_URL=http://192.168.0.10:8080 npx expo start
```

## Entrega 2 — motoristas e viagens

| Perfil     | O que tem no app                                                                 |
|------------|----------------------------------------------------------------------------------|
| admin      | Motoristas (busca nome/CPF, filtro de status, alerta de CNH vencida, cadastro/edição/exclusão) e mapa com todas as viagens em andamento |
| motorista  | Iniciar viagem (linha, veículo e sentido ativos), envio da posição a cada 10 s com o app aberto, fila offline, finalizar |
| passageiro | Acompanhar a linha no mapa com próxima parada e previsão de chegada              |

- O perfil logado decide quais navegadores existem (`App.js`); quem não é admin não tem as telas de admin.
- Sem permissão de localização a viagem não inicia; o app explica e abre as configurações.
- Posições passam pela fila `src/services/filaPosicoes.js` (AsyncStorage): sem rede ficam no
  aparelho e vão em lote quando o servidor responde de novo.
- No Expo Go a permissão de localização é guardada por projeto, além da do Android: negar dentro
  do app e liberar só nas configurações do sistema não basta lá. Num build próprio vale a do sistema.
