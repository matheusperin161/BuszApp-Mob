# BusZappMobile — BusZapp mobile (Expo)

Versão mobile do **BusZapp** (rastreamento de ônibus, cartão de transporte e
avaliações), feita com **React Native + Expo** e **Atomic Design**. Ela consome a
API Flask que fica na pasta `BusZapp/`.

> **Entrega 1:** só a estrutura do projeto. Telas, componentes e serviços ainda
> são esqueletos (`TODO`).

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
cd BusZappMobile
nvm use
npm install
npx expo start
```

A URL da API fica em `src/services/config.js` (Flask na porta 5000).
