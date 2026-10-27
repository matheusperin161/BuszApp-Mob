# Registro — Entrega 3 (trabalho final)

Atividade: implementar em grupo **persistência local e armazenamento seguro de credenciais;
autenticação** e **recursos nativos: câmera, geolocalização, permissões e notificações**, sobre o
projeto base. Junto, o módulo de cartão (**RF11** cadastrar cartão, **RF12** consultar saldo).
Data: 27/10/2026.

## 1. Análise do projeto base

| Item | Situação encontrada | Decisão |
|---|---|---|
| Autenticação | Login no Flask com cookie de sessão; sessão revalidada ao abrir | Manter |
| Credenciais | Sessão no SecureStore; senha não é gravada | Endurecer as opções do SecureStore |
| Persistência local | AsyncStorage (fila de posições offline do motorista) | Reaproveitar para os cartões e a foto |
| Geolocalização + permissão | Prontas no `DriverScreen` (CA08.4) | Manter; mostrar no painel de permissões |
| Câmera | Não existia | Foto de perfil (`ProfileScreen` era spec TODO) |
| Notificações | Não existia | Avisos locais do cartão |
| Cartão (RF11/RF12) | Specs TODO: `cartao.js`, `BalanceCard`, `RechargeScreen` | Implementar com repositório local |
| Banco | Não há banco para cartões (MongoDB no futuro) | Serviço local com a mesma interface da futura API |

## 2. Passos executados

1. **Dependências** — `npx expo install expo-image-picker expo-notifications expo-file-system`.
2. **Auditoria** — `npm audit`: 4 alertas altos em ferramentas de build (`node-forge`, `zod`, dentro do
   `@expo/cli`). `npm audit fix` corrigiu o `node-forge` (1.4.2). O `zod` exige `--force`, que troca a
   versão do Expo: **risco aceito** (é só ferramenta de build, não vai para o app).
   ⚠ O `npm audit fix` também subiu só o `expo` para `^58`, deixando o resto no SDK 57 — o bundle passou
   a dar **erro 500** no `expo start` (`Unable to resolve react-native/unstable-internals-do-not-use`).
   Como o Expo Go do grupo exige o SDK 58, a correção foi **atualizar o projeto inteiro**:
   `npx expo install expo@^58.0.0` + `npx expo install --fix` (react-native 0.88, gesture-handler 3,
   reanimated 4.7, expo-* 58). Conferido: APIs usadas inalteradas, drawer compatível com
   gesture-handler 3, bundles Android/iOS do servidor de desenvolvimento respondendo 200.
   Lição: depois de `npm audit fix`, conferir o `package.json` e rodar `npx expo install --check`.
3. **Utils** — `validacao.numeroCartao` (8–16 dígitos); `formatacao.moeda` (centavos → `R$ 1.234,56`),
   `mascaraCartao` e `cartaoOculto`.
4. **Armazenamento seguro** — `storage.js`: SecureStore com `WHEN_UNLOCKED_THIS_DEVICE_ONLY` (só lê com
   aparelho desbloqueado, não vai para backup nem para outro aparelho) e `JSON.parse` protegido.
5. **Serviço de cartão** — `services/cartao.js` como "servidor local" (ver seção 3).
6. **Notificações** — `services/notificacoes.js`: canal Android, permissão pedida no primeiro aviso,
   exibição com o app aberto, texto sem o número completo.
7. **Permissões** — `services/permissoes.js`: consulta câmera/localização/notificações e pede câmera.
8. **Câmera** — `services/fotoPerfil.js` (copia a foto do cache para a pasta de documentos do app) e
   `ProfileScreen` (foto, dados do usuário, painel de permissões com "Abrir configurações").
9. **Telas do cartão** — `BalanceCard`, `CardForm`, `RechargeScreen` (aba "Cartão"),
   `AdminCardsScreen` (admin, somente leitura) e atalho com saldo no `HomeScreen`.
10. **Navegação** — aba Cartão, item "Meu perfil" no menu lateral, "Cartões de transporte" no painel admin.
11. **app.json** — plugins do image-picker (texto da câmera; galeria e microfone desligados) e de
    notificações; `RECORD_AUDIO` bloqueado no Android.
12. **Verificação** — bundle Android compila (`npx expo export`); regras do cartão testadas em Node com
    armazenamento simulado (seção 5).

13. **Correção no Expo Go (SDK 58)** — o app abria com *"Cannot find native module
    'ExpoTopicSubscriptionModule'"*: o `expo-notifications` 58 carrega um módulo nativo de push que o
    Expo Go do Android não tem, e o `import` no topo derrubava o app inteiro. Agora `notificacoes.js`
    carrega o pacote sob demanda (`require` com `try/catch`): sem o módulo, notificações ficam
    "Indisponível" no painel de permissões e o resto do app funciona. Para demonstrar notificações,
    usar um build de desenvolvimento (`npx expo run:android`).

## 3. RF11/RF12 — critérios de aceite

| Critério | Como foi atendido |
|---|---|
| CA06.1 número único | `cadastrarCartao` normaliza para dígitos e recusa repetido em **todo o sistema** (409); operações em série evitam duplicar com toque duplo |
| CA06.2 saldo zero, ativo | O cartão é criado pelo serviço com `saldo: 0`, `status: 'ativo'`; a tela só envia o número |
| CA06.3 só os próprios / 403 | Dono vem da sessão; `meusCartoes` filtra; acessar/bloquear/recarregar cartão de outro → **403** |
| CA06.4 saldo em R$ | `moeda()` no `BalanceCard` (aba Cartão) e no atalho do Início |
| CA06.5 saldo não editável | Não existe função de editar; saldo só muda em `recarregar`/`debitarTarifa` (para o CRUD 07) |
| CA06.6 bloqueio | Botão "Bloquear (perda ou roubo)" com confirmação + notificação; bloqueado recusa recarga e débito (409); sem desbloqueio pelo app |
| CA06.7 admin somente leitura | `AdminCardsScreen` com filtro de status; serviço só oferece listagem ao admin, outros perfis → 403 |

## 4. Análise de vulnerabilidades

| Risco | Mitigação |
|---|---|
| Vazamento de sessão/credencial | Sessão só no SecureStore (Keychain/Keystore), sem backup; senha nunca persistida; logout apaga |
| IDOR (acessar cartão de outro) | Dono vem da sessão, não da tela; checagem central `cartaoDoDono` (403) |
| Elevação de privilégio | Papel lido da sessão; cadastro só `user`, listagem geral só `admin`; telas nem registradas para outros perfis |
| Adulteração de saldo | Sem endpoint/função de edição; inteiro em centavos; valor validado (inteiro > 0, teto de recarga, sem saldo negativo) |
| Condição de corrida | Leitura+gravação serializadas (`emSerie`); no Mongo: índice único + `$inc` atômico |
| Exposição em tela bloqueada | Notificações/listas usam `•••• 1234` |
| Metadados da foto | `exif: false` e recompressão (`quality: 0.6`) |
| Path traversal no arquivo | `idSeguro` limpa o id antes de compor o nome |
| Permissões excessivas | Só o necessário; microfone e galeria desligados; pedido no contexto de uso |
| Dados corrompidos/maliciosos no armazenamento | `JSON.parse` protegido → tratado como ausente |
| Enumeração de números de cartão | "Já cadastrado" revela existência — **pendente para o backend**: rate limit no `POST /api/cartoes` |
| Aparelho com root | AsyncStorage pode ser editado → a regra local é provisória; **o servidor (Mongo) deve ser a autoridade** |
| Dependências | `npm audit fix` aplicado; `zod` (build) aceito e registrado |

## 5. Testes executados

Script em Node com `storage` simulado sobre o `cartao.js` real — todos passaram:

- sem sessão → 401;
- cadastro: saldo 0 e ativo; número com espaços/traços normalizado; repetido → 409 (também para outro usuário);
  inválido → 422; limite de 5 por passageiro → 422; dois cadastros simultâneos do mesmo número → só um entra;
- outro usuário: lista vazia; obter/bloquear/recarregar → 403; listagem geral → 403;
- recarga altera saldo; valor fracionado → 422; débito acima do saldo → 422;
- bloqueado: recarga e débito → 409; bloquear de novo → 409;
- admin: não cadastra (403); lista todos e filtra por status;
- `moeda`: `0 → R$ 0,00`, `1050 → R$ 10,50`, `123456789 → R$ 1.234.567,89`.

Ainda é preciso testar no aparelho (câmera, notificações e diálogos de permissão).

## 6. Roteiro para o PDF de demonstração

1. Login (passageiro) → app reaberto continua logado (sessão segura).
2. Início mostra "Cadastre seu cartão" → aba **Cartão** → cadastrar → saldo **R$ 0,00**, status ativo,
   **notificação** "Cartão cadastrado" (aceitar a permissão na primeira vez).
3. Cadastrar o mesmo número de novo → erro de número já cadastrado.
4. Bloquear o cartão → confirmação → status bloqueado + notificação.
5. **Meu perfil** → Tirar foto → diálogo de permissão da câmera → foto salva; fechar e abrir o app: a
   foto continua lá.
6. Painel de permissões: negar uma permissão nas configurações e voltar → status atualizado.
7. Login como **motorista** → iniciar viagem → diálogo de localização → envio de GPS.
8. Login como **admin** → Cartões de transporte (somente leitura, filtro Bloqueados).
