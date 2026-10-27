# Mig_CLAUDE.md

Guia para o Claude Code (e para o grupo) trabalhar neste repositório. Complementa o `CLAUDE.md` com o
que entrou na **Entrega 3** (trabalho final: persistência/credenciais/autenticação + recursos nativos,
e o módulo de cartão — RF11/RF12). O registro passo a passo está em `docs/REGISTRO_ENTREGA3.md`.

## Projeto

BusZapp mobile — React Native + Expo (**SDK 58**, RN 0.88 — exigido pelo Expo Go do grupo) porte do BusZapp web (rastreamento de ônibus, cartão de
transporte, avaliações). Backend Flask no repositório irmão `../BusZapp` (porta **8080**), autenticação
por **cookie de sessão** (não Bearer). Código, comentários, arquivos e rotas em **português**.

Ainda **não há banco ligado ao módulo de cartão**; no futuro será MongoDB. Ver "Cartão sem banco" abaixo.

Arquivos que ainda só têm o comentário de cabeçalho + `TODO: implementar na próxima entrega` são
especificações das próximas entregas — o cabeçalho é a spec.

## Comandos

```bash
nvm use                 # Node 22 (.nvmrc)
npm install
npx expo start          # npm run android | ios | web
npx expo export --platform android --output-dir <tmp>   # confere se o bundle compila (não há lint/testes)
EXPO_PUBLIC_API_URL=http://<ip-da-lan>:8080 npx expo start   # celular físico
```

Novas dependências nativas: sempre `npx expo install <pacote>` (versão compatível com o SDK).
`index.js` mantém `import 'react-native-gesture-handler'` na primeira linha.

## Arquitetura

- **Atomic Design** em `src/components/` (atoms → molecules → organisms → templates). Telas em
  `src/screens/` montam organisms dentro de `ScreenTemplate`/`CenteredTemplate`. Tokens em `src/theme`.
- **Navegação por perfil** (`App.js`): `admin` → `AdminStack`, `motorista` → `DriverScreen`,
  `user` → `AppDrawer` (Início/abas, Meu perfil) → `PassengerTabs` (Início, Acompanhar, Cartão).
  Tela que um perfil não pode ver simplesmente não é registrada.
- **HTTP**: só `services/api.js` chama `fetch` (timeout 15 s). Erros são `ApiError` com `status`;
  `semConexao` = sem resposta do servidor.
- **Utils puros**: `validacao.js` (texto → erro ou `null`), `formatacao.js` (máscaras, datas UTC, `moeda`).

## Entrega 3 — o que existe e onde

| Requisito do trabalho | Onde |
|---|---|
| Autenticação | `contexts/AuthContext.js` + `services/auth.js` (login no Flask, sessão revalidada em `/api/auth/profile`) |
| Armazenamento seguro de credenciais | `services/storage.js`: sessão no **SecureStore** (`WHEN_UNLOCKED_THIS_DEVICE_ONLY`); a senha **nunca** é gravada |
| Persistência local | AsyncStorage: cartões (`buszapp_cartoes`), fila de posições, viagem atual, referência da foto; arquivo da foto em `Paths.document/perfil/` |
| Câmera | `ProfileScreen` + `services/fotoPerfil.js` (expo-image-picker, `exif: false`) |
| Geolocalização | `DriverScreen` + `hooks/useEnvioPosicoes.js` (expo-location, já existia) |
| Permissões | pedidas só no momento do uso; `services/permissoes.js` consulta todas; painel em `ProfileScreen` com "Abrir configurações" |
| Notificações | `services/notificacoes.js` (expo-notifications, locais): cadastro e bloqueio de cartão |
| RF11/RF12 cartão | `services/cartao.js`, `screens/RechargeScreen.js` (aba Cartão), `organisms/BalanceCard.js`, `organisms/CardForm.js`, `screens/AdminCardsScreen.js` |

### Cartão sem banco (`services/cartao.js`)

O serviço faz o papel do servidor: mesmas funções, regras e `ApiError` (401/403/404/409/422) que a API
terá. Entidade: `{ id, usuario_id, numero, saldo, status, criado_em, atualizado_em }`.

- Dono vem de `lerSessao()` (como o cookie no Flask), **nunca** de parâmetro da tela.
- `saldo` em **centavos inteiros**; exibição com `moeda()` → `R$ 0,00`.
- Não existe função para editar saldo/número (CA06.5). Saldo só muda por `recarregar`/`debitarTarifa`
  (CRUD 07), que recusam cartão não-ativo (CA06.6).
- Operações serializadas (`emSerie`) para a unicidade do número não furar com toques duplos.
- Admin: só `listarTodosCartoes` (leitura, CA06.7).

**Migração para MongoDB**: trocar o corpo de cada função por `api.get/post` (`GET /api/cartoes`,
`POST /api/cartoes`, `POST /api/cartoes/:id/bloquear`, `GET /api/admin/cartoes`). No backend: índice
único em `numero`, `usuario_id` a partir da sessão, checagem de dono (403), saldo em inteiro e
alteração atômica (`$inc` com filtro `status: 'ativo'`). As telas não mudam.

## Regras de segurança (manter ao mexer no código)

1. Credenciais/sessão só no SecureStore; nada sensível em AsyncStorage, logs ou notificações.
2. Notificações e listas mostram o cartão oculto (`cartaoOculto` → `•••• 1234`).
3. Identidade/papel vêm da sessão; regra de acesso fica no serviço, não na tela. O backend é a
   autoridade final — a checagem local é defesa em profundidade.
4. Validar entrada no app **e** no serviço (`numeroCartao`: 8–16 dígitos).
5. Nome de arquivo nunca vem cru de dado externo (`idSeguro` em `fotoPerfil.js`).
6. Permissão pedida no contexto de uso, com texto explicando o porquê; negada → explicar e
   oferecer `Linking.openSettings()`. Microfone bloqueado no `app.json` (só fotos).
7. `JSON.parse` de dado persistido sempre protegido (`analisar` em `storage.js`).
8. Dependências: `npm audit` a cada instalação; `--force` só se não quebrar o SDK.

## Pontos de atenção

- `sessao.user.id` precisa vir no login do Flask — sem ele o módulo de cartão responde 401.
- Expo Go: notificações locais funcionam; push remoto não (não usamos). A permissão de localização do
  Expo Go é separada da do Android (ver `CLAUDE.md`).
- Cartões ficam neste aparelho até o MongoDB: o admin só vê os cartões cadastrados nele.
