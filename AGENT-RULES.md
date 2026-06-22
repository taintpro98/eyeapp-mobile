# Agent Rules

Rules for AI agents (Claude Code, etc.) working in this repository.

## Git

- **Never commit or push without an explicit instruction.** Editing files is not permission to commit. Wait for a clear command: "commit", "push", "commit and push".
- **Never amend published commits.** Create a new commit instead.
- **Never force-push** to any branch without explicit instruction.
- **Never use `--no-verify`** to skip hooks.

## File Edits

- Prefer editing existing files over creating new ones.
- Do not create documentation or README files unless asked.
- Do not add comments that explain *what* the code does — only add comments when the *why* is non-obvious.
- Do not refactor, clean up, or add abstractions beyond what the task requires.

## Code Style

- No `"use client"` directives — this is an Expo/React Native project, not Next.js. Ignore any linter suggestions about it.
- Use `useTranslation()` from `react-i18next` for all user-facing strings.
- Use `useThemeColors()` for all colors — never hardcode light/dark values outside `src/theme/tokens.ts`.
- New theme color tokens go in both `light` and `dark` objects in `src/theme/tokens.ts`.

## Architecture

- API calls live in `src/api/`. One file per domain.
- Zustand stores live in `src/store/`. Persist sensitive data via `expo-secure-store`, non-sensitive via `AsyncStorage`.
- Screens live in `app/`. Components live in `src/components/`.
- Translations live in `src/locales/en.json` and `src/locales/vi.json`. Both files must be updated together.

## Expo / EAS

- Do not run `eas build` or `eas submit` without explicit instruction.
- Do not run `expo start --clear` unless Metro cache is confirmed stale.
- Build profiles are defined in `eas.json` — do not modify without discussion.

## Scope

- Fix only what was asked. Do not fix surrounding code, rename variables, or reorganize files as a side effect.
- If a task is ambiguous, ask before implementing.
