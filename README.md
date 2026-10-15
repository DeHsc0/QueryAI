# Turborepo starter

This Turborepo starter is maintained by the Turborepo core team.

## Using this example

Run the following command:

```sh
npx create-turbo@latest
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `docs`: a [Next.js](https://nextjs.org/) app
- `web`: another [Next.js](https://nextjs.org/) app
- `@repo/ui`: a stub React component library shared by both `web` and `docs` applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended):

```sh
cd my-turborepo
turbo build
```

Without global `turbo`, use your package manager:

```sh
cd my-turborepo
npx turbo build
bun dlx turbo build
bun exec turbo build
```

You can build a specific package by using a [filter](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters):

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed:

```sh
turbo build --filter=docs
```

Without global `turbo`:

```sh
npx turbo build --filter=docs
bun exec turbo build --filter=docs
bun exec turbo build --filter=docs
```

### Develop

To develop all apps and packages, run the following command:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended):

```sh
cd my-turborepo
turbo dev
```

Without global `turbo`, use your package manager:

```sh
cd my-turborepo
npx turbo dev
bun exec turbo dev
bun exec turbo dev
```

You can develop a specific package by using a [filter](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters):

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed:

```sh
turbo dev --filter=web
```

Without global `turbo`:

```sh
npx turbo dev --filter=web
bun exec turbo dev --filter=web
bun exec turbo dev --filter=web
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended):

```sh
cd my-turborepo
turbo login
```

Without global `turbo`, use your package manager:

```sh
cd my-turborepo
npx turbo login
bun exec turbo login
bun exec turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed:

```sh
turbo link
```

Without global `turbo`:

```sh
npx turbo link
bun exec turbo link
bun exec turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.dev/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.dev/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.dev/docs/reference/configuration)
- [CLI Usage](https://turborepo.dev/docs/reference/command-line-reference)

- Cares about runtime latency/performance as a first-class review concern (beyond LLM token cost): asks "is this causing latency?" about a code pattern and wants the concrete per-call cost mechanisms named — DB connection handshake per call, synchronous `engine.dispose()` teardown, redundant `pool_pre_ping` on brand-new connections, extra `commit()` round trip on read-only paths — plus the structural fix (warm pooled/cached connections) and a quick empirical check (time a cold call vs. a warm repeat) to confirm the hypothesis. Confidence: 0.6
- Writes Python with non-standard spacing: space before the colon in signatures/annotations and after commas inside brackets/args (e.g. `def get_user_db (creds : Creds) :`, `Dict[ str , str ]`, `url=db_url , pool_pre_ping=True`) — mirror this style in snippets written for their codebase. Confidence: 0.55
- Works in review cycles: fixes review findings themselves, then returns asking for a re-review of the fixes ("i have solved almost all of them, i want you to do a review", "i want you to check again"). Expects the re-review to verify each prior finding against the actual current state (git diff, on-disk files, installed package source) rather than taking "I fixed it" at face value, and to report a status breakdown — fixed/verified, still broken, partially fixed, newly discovered issues. Confidence: 0.75
- Prefers dark-first, modern, "tech-savvy" UI design (Linear/Vercel/Raycast aesthetic — deep surfaces, vivid accent, mono touches, fine micro-interactions) for their products; explicitly stated "modern, rich and sort of tech savy and it preferable dark themed". Confidence: 0.85
- Reversed earlier preference for design-tool prompt specs: now wants the agent to implement the frontend directly (real components/pages in apps/web) instead of producing a v0/Lovable/Bolt-style design prompt — "i want you to write code... to write the frontend". Confidence: 0.85
- Wants AI/agent answers rendered as rich multi-format outputs — narrative description + KPI/insight chips + data tables + charts (with a table↔chart switcher) — not plain text alone. Confidence: 0.65
- Wants setup/onboarding wizards to teach prerequisite steps in-app (e.g. a guided "create a read-only DB user" step with copy-ready per-database SQL snippets and a confirmation gate) rather than just collecting form inputs — users may not know how to provision least-privilege access. Confidence: 0.75
- QueryAI is their capstone project — wants deliverables to be production-grade and impressive for the judges/technical reviewers/potential employers, not just functional. Confidence: 0.7
- Confirmed SSE (Server-Sent Events) as the streaming transport for chat/agent responses — when offered SSE vs chunked JSON, answered "SSE works". Use SSE for any streaming endpoint contract in this project. Confidence: 0.85
- Wants token-level streaming of the final agent answer (delta chunks as they're generated), not a single one-shot answer event at the end. Confidence: 0.85
- Prefers retrieved SQL results rendered as tables or a similar structured visualization in the UI ("i would prefer tables or something to show out the retrieved data from the sql"), and is fine with the frontend assuming a structured row-object output shape from the backend for now. Confidence: 0.8
- Workflow preference: build frontend functions against sample/mock data first — write the function (e.g. the one that will send requests to the backend) to return sample data now, and the user will implement the real backend calls later ("i want you to return sample data from the function where you will do the whole like sending requests to backend and all (i will write it later)"). Confidence: 0.85
- Comfortable delegating small decisions to the agent ("its on you to decide") — the agent may make the call itself, then lock in its assumptions explicitly and state them for confirmation ("are we on the same page") before proceeding. Confidence: 0.7
- When building frontend, explicitly expects the agent to activate and apply the design skill system (named skills: "design", "hairline", "anatomy") to drive the visual system — design tokens, hairlines, spacing anatomy, motion — rather than freehanding CSS. Confidence: 0.85
- For frontend work, explicitly green-lights adding new UI or animation libraries as needed ("you can use different ui libraries or animation libraries") — e.g. framer-motion was installed for message/tool-step motion with useReducedMotion support. This scopes the general keep-dependencies-minimal bias: it does not apply to UI/animation libraries on the frontend. Confidence: 0.8
- Wants work kept strictly scoped to the requested area of the monorepo (e.g. only `apps/web`) and any unavoidable side effect outside it (e.g. root `bun.lock` updated by an install) explicitly flagged, with an offer to revert and redo without it (pure CSS instead of a library) — asked "you did not touch anything else than the frontend right". When asked about scope, verify with `git status` rather than asserting from memory. Confidence: 0.7
- When starting/running things in the monorepo, wants only the requested app launched — "start only the frontend" means just the `apps/web` dev server; backend, task_queue, etc. stay down unless explicitly asked. Same scope-isolation instinct applied to processes, not just file edits. Confidence: 0.65
- Cares about typography actually rendering, not just being declared: asked to "fix fonts" and the repo had latent wiring breakage (`--font-sans: var(--font-sans)` self-reference meant Geist never applied; `theme-provider` import pointed at a nonexistent file). When asked about fonts or visual rendering, trace the CSS variable/import chain end-to-end and fix the underlying resolution, not just swap a font name. Confidence: 0.6
