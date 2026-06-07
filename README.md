# Fitent

Fitent is a fitness and nutrition planner for calories, macros, hydration, and personal goals.

It can run locally with browser storage. It can also connect to Memact after user consent, so the app can reuse approved fitness memory instead of asking every setup question again.

## Why Memact helps

Fitent needs details like fitness goal, activity level, dietary preference, allergies, hydration target, and macro preference.

Without Memact, the user fills those fields manually.

With Memact, Fitent can ask for approved fitness memory. If Memact already has enough, Fitent fills known fields. If something is missing, Fitent asks only for the missing details. When the user saves new fitness details, Fitent proposes them back to Memact for the user to review, edit, or reject.

Memact is optional. Fitent still works if the user denies consent.

## Local setup

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal.

## Checks

```bash
npm run check
npm run build
```

## Vercel deployment

Fitent is configured for Vercel with `vercel.json`.

Use these project settings:

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- Node version: `24.x`

Environment variables:

```bash
MEMACT_BASE_URL=https://api.memact.com
MEMACT_API_KEY=mka_your_server_side_key
MEMACT_APP_ID=fitent
MEMACT_SESSION_SECRET=replace_with_a_long_random_secret
MEMACT_TIMEOUT_MS=8000
```

Keep `MEMACT_API_KEY` private. Do not expose it in browser code.

## Memact flow

1. User opens Fitent onboarding.
2. User can choose `Connect Memact` or continue manually.
3. Fitent sends the user to Memact consent with fitness categories.
4. Memact returns a `connection_id` after approval.
5. Fitent asks its own serverless API for approved fitness memory.
6. Fitent fills known setup fields.
7. Fitent asks only for missing fields.
8. Fitent proposes newly saved fitness context back to Memact.

## Memact files

- `scripts/memact.js` starts consent, reads approved fitness memory, fills known setup fields, and proposes saved fitness context back to Memact.
- `api/memact/session.js` creates a signed connect state.
- `api/memact/fitness-context.js` reads approved fitness memory through the server.
- `api/memact/propose-context.js` proposes saved fitness details back to Memact.
- `api/memact/_auth.js` verifies signed state and applies outbound Memact API timeouts.

## License

Apache-2.0.
