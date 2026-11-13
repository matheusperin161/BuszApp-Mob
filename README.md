# BusZapp Mobile

Aplicativo do **BusZapp**, o sistema de rastreamento do transporte público de Chapecó.
Feito em **React Native CLI** (sem Expo), para Android e iOS. Consome o mesmo backend
do site (Flask + PostgreSQL, publicado na Hostinger).

Cada perfil entra com a sua barra de abas:

| Perfil        | Abas                                                        |
|---------------|-------------------------------------------------------------|
| Passageiro    | Início · Mapa · Recarga · Avaliar · Perfil (+ sino de avisos) |
| Motorista     | Painel (linha → horário → iniciar trajeto, GPS ao vivo) · Perfil |
| Administrador | Geral · Mapa ao vivo · Cadastros · Avaliações · Perfil      |

Segue a organização do projeto de referência da disciplina (`MeuAppCLI`, prof. Moretto):
**Atomic Design**, `App.js` só com a navegação, um cliente HTTP único
(`src/services/api.js`) e o token guardado no Keychain/Keystore.

---

## Como rodar no seu computador

### 1. Instale (uma vez só)

| O quê | Versão | Observação |
|---|---|---|
| **Node.js** | 22 (mínimo 22.11) | recomendado pelo [nvm](https://github.com/nvm-sh/nvm) (Mac/Linux) ou [nvm-windows](https://github.com/coreybutler/nvm-windows) |
| **Android Studio** | atual | instala o SDK, o `adb` e o Java (JBR) — ou veja a [alternativa sem Android Studio](#alternativa-sem-android-studio-só-celular-no-cabo) |
| **Git** | qualquer | |
| Xcode + CocoaPods | só para iPhone | só no Mac |

No **Android Studio** → *More Actions* → *SDK Manager*, confirme que estão instalados:
**Android SDK Platform** (a mais recente), **Android SDK Build-Tools**,
**Android SDK Platform-Tools** e, na aba *SDK Tools*, o **NDK (Side by side)**.

### 2. Configure as variáveis de ambiente (uma vez só)

**Mac** — cole no fim do arquivo `~/.zshrc` e depois rode `source ~/.zshrc`:

```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
```

**Windows** — *Painel de Controle → Sistema → Configurações avançadas → Variáveis de Ambiente*:

| Variável | Valor |
|---|---|
| `JAVA_HOME` | `C:\Program Files\Android\Android Studio\jbr` |
| `ANDROID_HOME` | `C:\Users\SEU_USUARIO\AppData\Local\Android\Sdk` |
| `Path` (acrescentar) | `%ANDROID_HOME%\platform-tools` e `%ANDROID_HOME%\emulator` |

Feche e abra o terminal e confira: `node -v` (v22…), `adb version` e `java -version`.

### Alternativa: sem Android Studio (só celular no cabo)

Não precisa do Android Studio para compilar: bastam o **Java 17**, as **ferramentas de linha
de comando do Android** e o celular ligado no USB (passo 4). Faça isto no lugar dos passos 1 e 2.

**Mac** (com [Homebrew](https://brew.sh)):

```bash
brew install --cask temurin@17 android-commandlinetools
```

Cole no fim do `~/.zshrc` e rode `source ~/.zshrc`:

```bash
export JAVA_HOME="$(/usr/libexec/java_home -v 17)"
export ANDROID_HOME="/opt/homebrew/share/android-commandlinetools"
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
```

(Mac com Intel: troque `/opt/homebrew` por `/usr/local`.)

**Windows:**

1. Instale o **JDK 17** da [Adoptium (Temurin)](https://adoptium.net/temurin/releases/?version=17) — marque a opção *Set JAVA_HOME*.
2. Baixe o *Command line tools only* em [developer.android.com/studio](https://developer.android.com/studio#command-line-tools-only)
   e extraia de modo que fique `C:\Android\cmdline-tools\latest\bin\sdkmanager.bat`.
3. Variáveis de ambiente: `ANDROID_HOME` = `C:\Android` e, no `Path`,
   `%ANDROID_HOME%\platform-tools` e `%ANDROID_HOME%\cmdline-tools\latest\bin`.

**Depois, nos dois sistemas** (feche e abra o terminal antes), instale o SDK que o projeto usa:

```bash
sdkmanager --licenses
sdkmanager "platform-tools" "platforms;android-37" "build-tools;37.0.0" "ndk;27.1.12297006"
```

Responda `y` às licenças. Confira com `java -version` (17) e `adb devices` (celular como `device`).
Daí em diante é igual: passos 3, 4 (celular) e 5. Sem Android Studio não há emulador —
use o celular.

### 3. Baixe o projeto e instale as dependências

```bash
git clone https://github.com/matheusperin161/BuszApp-Mob.git
cd BuszApp-Mob
nvm install 22
nvm use 22
npm install
```

> Já tinha clonado antes? O histórico do repositório foi refeito. Apague a pasta antiga e
> clone de novo (ou rode `git fetch origin` e `git reset --hard origin/main`).

### 4. Escolha onde o app vai rodar

**Celular Android (recomendado)**

1. No celular: *Configurações → Sobre o telefone* → toque 7 vezes em *Número da versão*.
2. Em *Opções do desenvolvedor*, ligue **Depuração USB**
   (em Xiaomi ligue também **Instalar via USB**).
3. Ligue o cabo, aceite o aviso no celular e confira com `adb devices`
   (o aparelho tem que aparecer como `device`).

**Emulador**: Android Studio → *Device Manager* → crie um aparelho (Pixel, Android 14+) e aperte ▶.

### 5. Rode (dois terminais, sempre na pasta do projeto)

**Terminal 1 — Metro** (o servidor do JavaScript; deixe aberto):

```bash
npm start
```

**Terminal 2 — compila e instala o app:**

```bash
adb reverse tcp:8081 tcp:8081
npx react-native run-android --no-packager
```

A **primeira compilação demora** (10 a 25 minutos: o Gradle baixa tudo). As próximas são rápidas.

**iPhone (só no Mac):**

```bash
cd ios && pod install && cd ..
npx react-native run-ios --no-packager
```

### No dia a dia

- Mudou só código em `src/`? Não precisa compilar: aperte **`r`** no terminal do Metro.
- Desconectou o cabo? Rode de novo `adb reverse tcp:8081 tcp:8081`.
- Só compile de novo (`run-android`) quando mudar o `package.json`, algo em `android/`/`ios/`,
  ou se o app for desinstalado. Depois de trocar bibliotecas, antes de compilar:
  `cd android && ./gradlew clean && cd ..` (no Windows: `cd android && gradlew clean && cd ..`).

---

## Servidor (API)

O endereço do backend fica em `src/services/config.js`:

```js
export const API_BASE_URL = 'https://buszapp.com.br'; // sem barra no final
```

| Onde está o backend | `API_BASE_URL` |
|---|---|
| Produção (Hostinger) | `https://<domínio do site>` |
| PC local + emulador Android | `http://10.0.2.2:8080` |
| PC local + celular no cabo | `http://localhost:8080` (depois de `adb reverse tcp:8080 tcp:8080`) |
| PC local + iOS simulador | `http://localhost:8080` |

Backend local: rode o Flask com `FLASK_ENV=development` — em produção o cookie de sessão
é `Secure` e só funciona com HTTPS.

## Contas para testar

Use uma conta do site do BusZapp ou crie pelo app (o backend manda um e-mail de confirmação;
só depois de confirmar dá para entrar). **Motoristas** são cadastrados pelo administrador no
painel do site. O app aceita os perfis `user`, `motorista` e `admin`.

---

## O que cada tela faz

| Tela | Função | API |
|---|---|---|
| Login / Cadastro | entrar, login automático, "Lembrar de mim", termos | `POST /auth/login`, `GET /auth/profile`, `POST /auth/register` |
| Verificar e-mail / Esqueci a senha | reenviar link; código de 6 dígitos → nova senha | `/auth/resend-verification`, `/auth/forgot-password`, `/auth/verify-reset-code`, `/auth/reset-password` |
| Início | saldo, atalhos, últimas transações | `GET /card/info`, `GET /transactions` |
| Mapa → Acompanhamento | linhas com busca; status, mapa ao vivo, horários ("ao vivo"), paradas | `GET /routes`, `/route/:n`, `/route/:n/schedules`, `/bus_location/:id` |
| Recarga | cartão de transporte, cadastrar cartão, recarregar, extrato | `/card/register`, `POST /recharge`, `GET /transactions` |
| Avaliar | nota geral, 4 critérios, linha, horário e comentário | `POST /submit-rating` |
| Notificações | sino do cabeçalho | `GET /notifications` |
| Perfil / Configurações | foto, dados, senha, aviso de saldo baixo | `PUT /auth/profile`, `POST /auth/profile/picture` |
| Painel do motorista | linha (com busca) → horário → iniciar/encerrar trajeto, GPS a cada 5 s | `/auth/driver/trip/start`, `POST /update_location`, `/auth/driver/trip/stop` |
| Ocorrência | avisa os passageiros | `POST /incidents` |
| Admin · Geral | ônibus em rota, motoristas, frota, linhas, recargas, avaliações | `/admin/active-trips-count`, `/admin/drivers`, `/admin/vehicles`, `/admin/routes`, `/admin/all-transactions`, `/admin/ratings` |
| Admin · Mapa | todos os ônibus transmitindo (atualiza a cada 10 s) | `GET /admin/all-bus-locations` |
| Admin · Cadastros | motoristas, frota, rotas (ativar/desativar) e cartões, com busca | `PATCH /admin/routes/:id`, `/admin/users/cards` |
| Admin · Avaliações | médias por critério, filtro por motorista | `GET /admin/ratings` |

O motorista usa as **mesmas rotas do painel do site**, então o passageiro vê o ônibus
(iniciado e posição) **no site e no app** pelo horário escolhido.

### GPS com a tela bloqueada

- **Android**: serviço em primeiro plano (Notifee) com a notificação fixa
  "BusZapp — trajeto em andamento" (tipo `location` no `AndroidManifest.xml`).
  Em Xiaomi/Samsung, libere o BusZapp na economia de bateria — o painel mostra um botão.
- **iOS**: `UIBackgroundModes = location` no `Info.plist` e permissão "Sempre".
- Código: `src/services/rastreio.js` (envio) e `index.js` (registro do serviço).

### Sessão: token ou cookie

O login manda `"client": "mobile"`. Se o backend devolver `token`, ele vai para o
Keychain/Keystore e segue como `Authorization: Bearer`; se não devolver, o app usa o
cookie de sessão. O resto do app não muda.

---

## Estrutura (Atomic Design)

```
App.js            pilha de telas (navegação)
index.js          registro do app e do serviço de GPS do motorista
src/
  components/
    atoms/        Button, Input, Label, TextArea, Chip, Avatar, Checkbox, Icone, Gradiente
    molecules/    FormField, Card, SaldoCard, AtalhoTile, LinhaItem, HorarioItem, SeletorBusca,
                  CartaoTransporte, TransacaoItem, NotificacaoItem, EstrelasCampo, StatCard,
                  Segmentos, RegistroItem, Selo, AvisoBox, ErrorMessage, EstadoCarga ...
    organisms/    Cabecalho, LoginForm, RegisterForm, TermosModal, RedefinirSenhaForm,
                  TrajetoForm, AvaliacaoForm, PerfilForm, CartaoForm, RecargaForm,
                  OcorrenciaForm, MapaLinha, LinhaList, TransacaoList, NotificacaoList
    templates/    CenteredTemplate (login/cadastro), ScreenTemplate (telas internas)
  screens/        uma por tela (inclusive Admin*Screen e MotoristaScreen)
  navigation/     AppTabs (abas por perfil), acoes, espacoInferior
  services/       api, auth, storage, config, cartao, linhas, motorista, rastreio,
                  admin, avaliacao, notificacoes, usuario, nativos, preferencias
  constants/      icones (Feather), cartao, termos, lista
  utils/          validacao, formato
  theme/          cores, degradês e espaçamentos (mesma paleta do site)
  assets/         logo.png
```

A dependência sempre aponta para baixo: **screen → organisms → molecules → atoms**.

## Testes e lint

```bash
npm test
npm run lint
```

---

## Problemas comuns

| Sintoma | Solução |
|---|---|
| `command not found: npm` | `nvm use 22` (ou `nvm alias default 22` para ficar fixo) |
| `Unable to locate a Java Runtime` | defina o `JAVA_HOME` (passo 2) |
| `SDK location not found` | defina o `ANDROID_HOME` (passo 2) |
| `INSTALL_FAILED_USER_RESTRICTED` (Xiaomi) | ligue **Instalar via USB** nas opções do desenvolvedor |
| Tela branca / "Could not connect to development server" | Metro aberto? `adb reverse tcp:8081 tcp:8081` e aperte `r` |
| App abre e fecha logo | compile de novo (`run-android`); se continuar: `adb shell pm clear br.com.buszapp.mobile` |
| `EACCES` no `npm install` | `sudo chown -R $(whoami) .` dentro da pasta do projeto |
| "Sem conexão com o BusZapp" | confira `API_BASE_URL` e a internet do celular |
| Login entra e volta para o login | backend em HTTP com `FLASK_ENV=production`: use HTTPS ou `development` |
| Mapa cinza | sem internet no aparelho (o mapa baixa as ruas do OpenStreetMap) |
| GPS no emulador | *Extended controls (⋯) → Location* → marque um ponto em Chapecó |
| Ver o erro de um crash | `adb logcat -d \| grep -E "AndroidRuntime\|FATAL\|ReactNativeJS" \| tail -80` |
