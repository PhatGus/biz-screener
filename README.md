# biz-screener

A small-business **acquisition deal screener** for a buyer targeting **$1.5M–$5M**
businesses in the **DE / PA / MD** corridor, open to any industry with strong
fundamentals.

Paste a listing (BizBuySell teaser, broker email, any format), optionally upload
post-NDA documents (P&Ls, tax returns, leases, org charts as PDFs or images), and
get a structured deal memo: a **GO / CAUTION / PASS** verdict, extracted metrics,
five dimension scores, license-risk assessment, red/yellow/green flags, and
prioritized diligence — plus a follow-up Q&A thread that keeps full deal context.

## Stack

- **Next.js (App Router)** + **TypeScript**
- **Tailwind CSS** — dark slate + cyan, terminal/Bloomberg-ish aesthetic
- **Anthropic API** (`claude-sonnet-4-6`, `max_tokens: 4000`) via server-side routes
  - `POST /api/analyze` — listing + base64 documents → strict-JSON deal memo
  - `POST /api/chat` — follow-up Q&A with the full deal context preserved
- Deploy target: **Vercel**

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then set ANTHROPIC_API_KEY
npm run dev                        # http://localhost:3000
```

### Scripts

| Command            | Purpose                          |
| ------------------ | -------------------------------- |
| `npm run dev`      | Start the dev server             |
| `npm run build`    | Production build                 |
| `npm run start`    | Serve the production build       |
| `npm run lint`     | ESLint (next/core-web-vitals)    |
| `npm run typecheck`| `tsc --noEmit`                   |
| `npm run test`     | Vitest unit tests                |

## Environment

| Variable            | Required | Notes                                        |
| ------------------- | -------- | -------------------------------------------- |
| `ANTHROPIC_API_KEY` | yes      | Server-side only. Stored in `.env.local`.    |

The key is read with `process.env.ANTHROPIC_API_KEY` inside the API routes and is
never exposed to the browser.

## How it works

1. **Intake** (`components/IntakeForm.tsx`) — listing textarea + drag-and-drop file
   upload. Files are read to base64 in the browser.
2. **Analyze** (`app/api/analyze/route.ts`) — documents become Anthropic `document`
   (PDF) / `image` blocks placed before the listing text; the model is prompted with
   the verbatim scoring rubric (`lib/prompt.ts`) and returns strict JSON.
3. **Parse** (`lib/parse.ts`) — markdown fences are stripped and the JSON is
   structurally validated before rendering. Covered by `lib/parse.test.ts`.
4. **Render** (`components/DealMemoView.tsx`) — verdict badge, metrics table,
   dimension bars, license card, flag columns, numbered diligence list, regional
   notes.
5. **Follow-up Q&A** (`app/api/chat/route.ts`) — the listing, documents, and the
   produced memo are replayed as conversation context so answers stay grounded.

## Deploying to Vercel

1. Push this repo to GitHub and import it into Vercel.
2. Add the `ANTHROPIC_API_KEY` environment variable in the Vercel project settings.
3. Deploy — no extra configuration needed (App Router + Node.js runtime).

## Disclaimer

This is a screening aid, not investment advice. Verify every figure during formal
due diligence.
