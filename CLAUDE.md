# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

BusZapp mobile — React Native + Expo port of the BusZapp web app (bus tracking, transit card recharge, trip ratings). The backend is a separate Flask API: the `BusZapp` repo, cloned as a sibling folder (`../BusZapp`). Features usually need changes on both sides.

Implemented ("Entrega 2"): login, driver management for admins (RF23), and trips with live tracking (driver sends GPS, passenger and admin follow on a map). Files still holding only a header comment plus `TODO: implementar na próxima entrega` (recharge, rating, profile, register, routes/vehicles admin, `cartao.js`, `onibus.js`, `navigation/acoes.js`…) are specs for later deliveries — treat the header comment as the spec. `app.json` references `./assets/*` icons that are not committed yet.

The codebase, comments, file names and route names are in **Portuguese** — keep new code consistent with that (e.g. `cartao.js`, `rastreamento.js`, `opcoesCabecalho`).

## Commands

```bash
nvm use            # Node 22 (.nvmrc)
npm install
npx expo start     # or: npm run android | npm run ios | npm run web
npx expo export --platform android --output-dir <tmp>   # quick check that the bundle compiles
EXPO_PUBLIC_API_URL=http://<lan-ip>:8080 npx expo start  # physical device
```

No lint or test runner is configured in this repo. `/ios` and `/android` are gitignored (generated native folders). `babel.config.js` needs `babel-preset-expo` (direct dependency) and includes the `react-native-reanimated/plugin`; `index.js` must keep `import 'react-native-gesture-handler'` as its first line (required by the drawer).

Backend (in `../BusZapp`): `./venv/Scripts/python -m pytest` runs its tests; it serves on port **8080**.

## Architecture

**Atomic Design** under `src/components/`: `atoms` → `molecules` → `organisms` → `templates`. Screens in `src/screens/` compose organisms inside a template (`CenteredTemplate` for auth screens, `ScreenTemplate` for logged-in screens: title, optional subtitle, scrollable body or `rolavel={false}` for FlatList/map screens; it pads the Android edge-to-edge bottom inset). Visual tokens (yellow/orange identity taken from the web `static/css/main.css`) live in `src/theme/index.js`.

**Auth and navigation**: `contexts/AuthContext.js` holds the session (`{ role, user, driver }`, persisted in SecureStore and re-validated against `/api/auth/profile`; offline it keeps the saved session). `App.js` mounts a different navigator per role — `admin` → `AdminStack`, `motorista` → `DriverScreen`, `user` → `AppDrawer` (→ `PassengerTabs`). Screens a role must not see are simply not registered, so access control is structural (the backend still enforces 403). `navigation/opcoes.js` exports shared header options (`...opcoesCabecalho`) and `comBotaoSair`.

**Services / API**:
- `services/api.js` is the single HTTP client (15 s timeout via AbortController) — screens never call `fetch` directly. Errors are `ApiError` with `status`; `semConexao` means no server response.
- The Flask backend authenticates with a **session cookie, not a Bearer token**; the native fetch keeps the cookie.
- `services/config.js`: base URL and `INTERVALO_ENVIO_POSICAO_MS` (RNF08, 10 s).
- `admin.js` → `/api/admin/drivers` (+ `/api/viagens/ativas` for the admin map); `motorista.js` and `rastreamento.js` → `/api/viagens`, `/api/linhas` (backend `src/routes/viagens.py`).
- `services/storage.js`: SecureStore for the session, AsyncStorage for bulky non-sensitive data.

**Trip tracking pipeline** (the part that spans several files):
`DriverScreen` checks GPS + permission before starting (CA08.4) → `hooks/useEnvioPosicoes.js` watches location and, every 10 s while the app is in the foreground, pushes a position into `services/filaPosicoes.js` → the queue (persisted per trip in AsyncStorage, operations serialized) sends batches and only drops items the server accepted; 404/409 means the trip ended server-side and the queue is discarded. Only one send is in flight at a time. `DriverScreen` also caches the current trip so an offline app restart resumes sending. Finishing a trip flushes the queue first and refuses to finish while positions are pending. Passenger (`TrackingScreen`) and admin (`AdminTripsScreen`) poll `/api/viagens/ativas` via `hooks/useAtualizacaoPeriodica.js`; next stop and ETA are computed by the backend.

**Utils** are pure functions: `validacao.js` takes text and returns an error string or `null` (CPF check-digit rule mirrors the backend's `src/utils/cpf.py`); `formatacao.js` holds masks and date/time/distance formatting — backend datetimes are naive UTC, convert with `utcParaDate`. `constants/lista.js` holds shared FlatList virtualization settings.

**Web → mobile mapping**: each screen corresponds to one page of the web version's `static/` folder (e.g. `acompanhamento.html` → `TrackingScreen`, `add-driver.html` → `DriversScreen`/`AddDriverScreen`); each screen's header comment names its web equivalent. See the full table in `README.md`.

**Expo Go caveat**: Expo Go keeps its own per-project location permission on top of Android's, so "deny in app, then allow in system settings" doesn't unblock there; a dev/standalone build behaves normally.
