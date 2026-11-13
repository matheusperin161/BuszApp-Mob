# BusZapp Mobile — app do passageiro e do motorista (React Native CLI)

Versão mobile do **BusZapp**, o sistema de rastreamento do transporte público de Chapecó.
O app é para **passageiros, motoristas e administradores** — cada perfil tem a sua barra de abas.
O visual copia o site: cabeçalho em degradê âmbar → laranja, fundo creme, cards brancos,
ícones Feather e as mesmas abas de baixo (Início, Mapa, Recarga, Avaliar, Perfil).
Segue a mesma organização do projeto de referência da disciplina (`MeuAppCLI`, prof. Moretto):
**Atomic Design**, `App.js` só com a navegação, um cliente HTTP único (`src/services/api.js`)
e o token guardado no **Keychain/Keystore**. Consome o **mesmo backend do site** (Flask, na Hostinger).

> Aqui **não há Expo Go**: o app é compilado e roda no emulador do Android Studio
> (ou no simulador do iOS). O Metro roda à parte.

## Requisitos

- Node.js **22.11+** (React Native 0.87) — `nvm use` (há um `.nvmrc`)
- **JDK 17**
- **Android Studio** (SDK, platform-tools, um AVD criado) + `ANDROID_HOME` no `PATH`
- iOS (somente macOS): Xcode + CocoaPods
- Internet no emulador (o app fala com o servidor do BusZapp e o mapa usa OpenStreetMap)

## Configuração da API

A URL fica em `src/services/config.js`:

```js
export const API_BASE_URL = 'https://buszapp.com.br'; // domínio do site, sem barra no final
```

| Onde está o backend          | API_BASE_URL                    |
|------------------------------|---------------------------------|
| Hostinger (produção)         | `https://SEU-DOMINIO`           |
| PC local + emulador Android  | `http://10.0.2.2:8080`          |
| PC local + simulador iOS     | `http://localhost:8080`         |
| PC local + celular físico    | `http://IP-DO-PC:8080`          |

Para o backend local aceitar login por HTTP, rode o Flask com `FLASK_ENV=development`
(em produção o cookie de sessão é `Secure` e exige HTTPS).

## Instalação

```bash
cd buszapp-mobile
nvm use
npm install
```

### iOS (macOS)

```bash
cd ios && pod install && cd ..
```

## Rodar com Metro separado

### Terminal 1 — Metro

```bash
cd buszapp-mobile
npm start
```

### Terminal 2 — app nativo (sem outro Metro)

Abra o emulador no Android Studio (Device Manager ▶) e rode:

```bash
npx react-native run-android --no-packager
# ou
npx react-native run-ios --no-packager
```

A primeira compilação do Android demora alguns minutos (Gradle baixa tudo).

## Contas para testar

Use uma conta que já existe no site do BusZapp, ou crie pelo app (o backend manda o
e-mail de confirmação; só depois de confirmar dá para entrar).

| Perfil      | O que o app mostra                                                |
|-------------|-------------------------------------------------------------------|
| Passageiro  | abas Início · Mapa · Recarga · Avaliar · Perfil (+ sino de avisos) |
| Motorista   | abas Painel (iniciar trajeto, GPS ao vivo, ocorrência) · Perfil    |
| Admin       | abas Geral · Mapa ao vivo · Cadastros · Avaliações · Perfil        |

O login de motorista é criado pelo admin no painel web (cadastro de motoristas).
"Lembrar de mim" desmarcado: ao fechar e abrir o app, pede login de novo.

## Telas

| Tela             | Função                                    | API                                            |
|------------------|-------------------------------------------|------------------------------------------------|
| Login            | entrar + login automático                 | `POST /auth/login`, `GET /auth/profile`        |
| Cadastro         | criar conta                               | `POST /auth/register`                          |
| Verificar e-mail | confirmação + reenviar link               | `POST /auth/resend-verification`               |
| Esqueci a senha  | e-mail → código de 6 dígitos → nova senha | `/auth/forgot-password`, `/verify-reset-code`, `/reset-password` |
| Início           | saldo, atalhos, últimas transações        | `GET /card/info`, `GET /transactions`          |
| Mapa (linhas)    | busca por número ou bairro                | `GET /routes`, `GET /linhas`                   |
| Acompanhamento   | status, mapa ao vivo, horários, paradas   | `/route/:n/schedules`, `/bus_location/:id`, `/viagens/ativas` |
| Recarga (aba)    | cartão de transporte, última recarga      | `GET /card/info`, `GET /transactions`          |
| Cadastrar cartão | número, titular e tipo                    | `POST /card/register`                          |
| Recarregar       | valor + PIX/cartão + comprovante          | `POST /recharge`                               |
| Extrato          | todas as movimentações                    | `GET /transactions`                            |
| Avaliar          | nota geral, grade 2×2, linha e comentário | `POST /submit-rating`                          |
| Notificações     | sino do cabeçalho (bolinha = aviso novo)  | `GET /notifications`                           |
| Perfil           | foto, dados, senha, ações rápidas         | `PUT /auth/profile`, `POST /auth/profile/picture` |
| Configurações    | aviso de saldo baixo, mapa ao vivo        | AsyncStorage (local)                           |
| Painel motorista | linha (com busca) → horário → trajeto     | `/routes`, `/route/:n/schedules`, `/auth/driver/trip/start`, `/update_location`, `/auth/driver/trip/stop` |
| Ocorrência       | avisa os passageiros                      | `POST /incidents`                              |
| Admin · Geral    | ônibus em rota, motoristas, frota, linhas, recargas, avaliações | `/admin/active-trips-count`, `/admin/drivers`, `/admin/vehicles`, `/admin/routes`, `/admin/all-transactions`, `/admin/ratings` |
| Admin · Mapa     | todos os ônibus transmitindo (10 s)       | `GET /admin/all-bus-locations`                 |
| Admin · Cadastros| motoristas, frota, rotas (ativar/desativar) e cartões, com busca | `/admin/drivers`, `/admin/vehicles`, `/admin/routes`, `PATCH /admin/routes/:id`, `/admin/users/cards` |
| Admin · Avaliações | médias por critério, filtro por motorista | `GET /admin/ratings`                         |

## O que melhorou em relação ao site

- **Mapa sem chave do Google**: o mesmo Leaflet + OpenStreetMap do site, dentro de uma WebView.
- **Fila de GPS do motorista**: sem sinal, as posições ficam guardadas e vão em lote quando a internet volta.
- **Login automático** e sessão que sobrevive à falta de rede (só um 401 manda para o login).
- **Última linha** acompanhada vira atalho na tela inicial.
- **Aviso local** (Notifee) quando o saldo fica abaixo de R$ 5,00.
- O passageiro vê no mapa tanto o ônibus de quem usa o site quanto o de quem usa o app.

## Motorista: envio com a tela bloqueada

O painel usa as mesmas rotas do painel do site, então o passageiro vê o ônibus
(iniciado e posição) no **site e no app**, pelo horário escolhido.
A posição é enviada a cada 5 s também com a tela bloqueada ou com outro app aberto:

- **Android**: serviço em primeiro plano (Notifee) com a notificação fixa
  "BusZapp — trajeto em andamento". Tipo `location` declarado no `AndroidManifest.xml`.
  Em Xiaomi/Samsung, libere o BusZapp na economia de bateria (o painel mostra um botão).
- **iOS**: `UIBackgroundModes = location` no `Info.plist` e permissão "Sempre".

Arquivos: `src/services/rastreio.js` (laço de envio) e `index.js` (registro do serviço).
Mudou algo nisso? Recompile (`run-android` / `pod install` + `run-ios`).

## Sessão: token ou cookie

O login manda `"client": "mobile"`. Se o backend devolver um `token`, ele vai para o
Keychain/Keystore e segue como `Authorization: Bearer` (versão do backend com a API mobile).
Se não devolver (backend publicado hoje), o app usa o cookie de sessão, que o
`fetch` nativo guarda sozinho. O resto do app não muda.

## Estrutura (Atomic Design)

```
src/
  components/
    atoms/       Button, Input, Label, TextArea, Chip, Avatar, Checkbox,
                 Icone (Feather em SVG), Gradiente (degradê em SVG)
    molecules/   FormField, ErrorMessage, EstadoCarga, MenuButton, TextAreaField,
                 AvisoBox, SaldoCard, LinhaItem, TransacaoItem, NotificacaoItem,
                 InfoLinha, ChipGrupo, EstrelasCampo, Card, IconeCaixa, AtalhoTile,
                 CartaoTransporte, OpcaoTile, Selo, ForcaSenha
    organisms/   Cabecalho (barra em degradê), LoginForm, RegisterForm, TermosModal,
                 RedefinirSenhaForm, LinhaList, TransacaoList, NotificacaoList,
                 CartaoForm, RecargaForm, AvaliacaoForm, PerfilForm, ViagemForm,
                 OcorrenciaForm, MapaLinha
    templates/   CenteredTemplate (login/cadastro), ScreenTemplate (telas internas)
  screens/       uma por tela (tabela acima)
  navigation/    AppTabs (abas por perfil), acoes
  assets/        logo.png (o mesmo ícone do site)
  services/      api, auth, storage, config, cartao, linhas, motorista, avaliacao,
                 notificacoes, usuario, nativos, preferencias
  constants/     lista (FlatList), cartao (tipos e valores), icones (desenhos Feather),
                 termos (Termos de Serviço do site)
  utils/         validacao, formato
  theme/         cores e espaçamentos (mesma paleta do site)
```

A dependência sempre aponta para baixo: **screen** → **organisms** → **molecules** → **atoms**.

## Testes

```bash
npm test
```

Testa a renderização do `App`, as validações/formatos e o cliente HTTP (login com token,
login com cookie, e-mail não verificado, perfis aceitos/recusados, "Lembrar de mim", 401 e falta de rede).

## Problemas comuns

- **Metro não inicia com Node 20**: use Node 22 (`nvm use`).
- **"Sem conexão com o BusZapp"**: confira `API_BASE_URL` em `config.js` e a internet do emulador.
- **Login entra e logo volta para a tela de login**: o servidor está em HTTP com
  `FLASK_ENV=production` (cookie `Secure`). Use HTTPS ou `FLASK_ENV=development` no teste local.
- Android físico + Metro: `adb reverse tcp:8081 tcp:8081`.
- **Depois de atualizar o app (lib nova ou removida)**: `npm install` e
  `cd android && ./gradlew clean && cd ..` antes do `run-android`.
- **Câmera / GPS / notificação não abrem**: são libs nativas. Recompile
  (`run-android` / `cd ios && pod install && run-ios`). Reload do Metro não basta.
- **GPS no emulador**: Extended controls (⋯) → Location → defina um ponto ou rota em Chapecó.
- **Mapa cinza**: o emulador está sem internet (o mapa baixa os tiles do OpenStreetMap).
