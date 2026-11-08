# Bell System

> An Electron desktop app for scheduling and playing bell/audio alerts on a timer. The renderer is a React + MUI single-page UI with a password lock screen and multi-tab "bell" workspaces, each holding a list of timed alarm entries; the main process keeps a local PouchDB store, a background scheduler that fires audio (and notifications) at the scheduled times, and manages a user music folder for imported audio files. Packaging targets Windows (NSIS), macOS (DMG) and Linux (AppImage/snap/deb) via electron-builder.

## Tech Stack
- **Language:** TypeScript (strict, split `tsconfig.node.json` / `tsconfig.web.json`)
- **Desktop:** Electron ^31, electron-vite ^2.3, Vite ^5.3, electron-builder ^24
- **UI:** React ^18, MUI (`@mui/material`, `@mui/icons-material`) ^7, Emotion, react-router-dom ^6 (HashRouter)
- **Data/state:** PouchDB ^9 + `pouchdb-find` (embedded local DB in the Electron main process), TanStack React Query ^5
- **Other libs:** `sonner` (toasts), `fastpriorityqueue`, `uuid`
- **Tooling:** ESLint (`@electron-toolkit/eslint-config-ts/prettier`), Prettier
- **No external services** — everything is local (filesystem audio dir + PouchDB)

## Structure
- `src/main/` — Electron main process entry (`index.ts`): window creation, custom privileged protocol registration, data migration, IPC handler setup, app music-dir bootstrap
- `src/main/events/` — global shortcut / zoom registration and teardown
- `src/main/scheduler/` — `bellScheduler.ts` + `last.ts`: schedules upcoming bell times and emits `play-audio` to the renderer
- `src/main/utils/` — main-process helpers: `tabs/` (add/get/rename/delete/set-active tab), `audios/` (select/rename/delete/get music files), `theme/`, `times/`, plus `migrateData.ts`, `notification.ts`, `checkUserVerified.ts` / `userVerified.ts`, `getOtherData.ts` / `addOtherData.ts` / `updateOtherData.ts`
- `src/main/pouchdb.ts` — PouchDB instance/connection setup
- `src/main/setupIpcHandlers.ts` — registers all `ipcMain.handle` channels used by the renderer
- `src/preload/` — preload script exposing `window.electron` (`@electron-toolkit/preload`) + type declarations
- `src/renderer/` — React SPA: `index.html`, `src/main.tsx`, `src/App.tsx` (router)
- `src/renderer/src/pages/` — `lock.tsx` (password gate), `BellTab.tsx` (main bell/alarm view for a tab), `EmptyTabs.tsx` (no-tabs onboarding), `ManageAudioFiles.tsx` (audio library manager)
- `src/renderer/src/components/` — `Sidebar.tsx`, `dialogs/` (`AlarmDialogV2`, `ConfirmationDialog`, `ContextMenu`, `NameDialog`), `smallComponents/` (`AlarmCard`, `NoBells`, `TabList`), `Versions.tsx`
- `src/renderer/src/Apis/` — renderer-side IPC wrappers: `tab.ts`, `audio.ts`, `time.ts`, `scheduler.ts`, `other.ts`
- `src/renderer/src/hooks/`, `utils/`, `theme/`, `assets/` — React hooks (`audio`, `bells`), `playAudio`, MUI theme, static assets (incl. `Handbell.mp3`)
- `src/shared/` — code shared between main and renderer (aliased `@shared`): `constant.ts`, `type.ts`, `utils.ts`
- `resources/` — app icons (`icon.png`, `icon.ico`, `icon1.*`) used at runtime and for packaging
- `build/` — electron-builder resources (`buildResources`), e.g. macOS entitlements
- `electron.vite.config.ts` — bundles main/preload/renderer; aliases `@shared` → `src/shared`, `@renderer` → `src/renderer/src`
- `electron-builder.yml` — packaging config (appId `com.darshanheble.bellsystem`, NSIS/DMG/AppImage/snap/deb)
- `tsconfig.json` / `tsconfig.node.json` / `tsconfig.web.json` — TypeScript project refs
- `.eslintrc.cjs`, `.eslintignore`, `.prettierrc.yaml`, `.prettierignore`, `.editorconfig` — lint/format config
- `.vscode/` — editor settings, recommended extensions, launch config
- `dev-app-update.yml` — electron-updater generic update provider config
- `package.json`, `package-lock.json`, `.npmrc` — npm manifest/lockfile/registry config

## Scripts & Commands
```bash
npm install          # postinstall runs: electron-builder install-app-deps

npm run dev          # electron-vite dev   (main+preload rebuild on change, renderer HMR)
npm run start        # electron-vite preview
npm run build        # npm run typecheck && electron-vite build

npm run typecheck            # typecheck:node + typecheck:web
npm run typecheck:node       # tsc --noEmit -p tsconfig.node.json --composite false
npm run typecheck:web        # tsc --noEmit -p tsconfig.web.json --composite false

npm run lint         # eslint . --ext .js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix
npm run format       # prettier --write .

npm run build:unpack # build + electron-builder --dir
npm run build:win    # build + electron-builder --win
npm run build:mac    # electron-vite build && electron-builder --mac
npm run build:linux  # electron-vite build && electron-builder --linux
```

## Setup
1. Requires Node.js (with npm) — version pinned by `package-lock.json` / `@types/node` ^20.
2. `npm install` in the repo root (also runs `electron-builder install-app-deps`).
3. `npm run dev` to launch the app in development mode.
4. On first launch the app shows a password lock screen; unlock to reach the tab list, then create a tab from the empty state to start adding bell/alarm entries.
5. Packaged builds: `npm run build:unpack` (unpacked dir) or `npm run build:linux` / `build:win` / `build:mac`.

## Screenshots
_See assets/screenshots/ — populated separately._
