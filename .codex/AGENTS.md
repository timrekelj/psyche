# Repository Guidelines

## Project Structure & Module Organization
- `app/` contains Expo Router screens and routes (file-based routing).
- `components/`, `hooks/`, `contexts/`, and `lib/` host shared UI, hooks, state, and utilities.
- `assets/` stores images and static media used by the app.
- `android/` and `ios/` are native projects for local builds and platform configs.
- `constants/`, `global.css`, and `tailwind.config.js` define styling tokens and global styles.

## Build, Test, and Development Commands
- `npm install` installs dependencies.
- `npm run start` starts the Expo dev server.
- `npm run android` / `npm run ios` run native builds on a device or simulator.
- `npm run lint` runs the Expo ESLint configuration.

## Coding Style & Naming Conventions
- TypeScript is the default; keep components in `.tsx` and utilities in `.ts`.
- Prettier is configured in `.prettierrc` with 4-space indentation, single quotes, and semicolons.
- Tailwind/NativeWind classes should follow the Prettier Tailwind plugin ordering.
- Prefer PascalCase for components (e.g., `ProfileCard.tsx`) and camelCase for hooks (e.g., `useAuth.ts`).

## Commit & Pull Request Guidelines
- Recent commit messages use short, plain-English sentences (e.g., “Update legal site design”).
- Keep commits focused and scoped to a single change.
- PRs should include a clear description, any linked issues, and screenshots for UI changes.

## Configuration & Secrets
- Never commit secrets or personal keys; rotate any exposed tokens immediately.
