# LabReport AI

Upload a PDF lab report, extract all biomarkers, and classify each result as **Optimal**, **Normal**, or **Out of Range** — with AI-powered extraction and a regex-based manual fallback.

## Prerequisites

- [Bun](https://bun.sh) installed
- An API key from one of the following (optional — app works without one via manual fallback but it will be less accurate):
  - [OpenAI](https://platform.openai.com/api-keys)
  - [DeepSeek](https://platform.deepseek.com/api_keys)

## Setup

1. Clone or navigate into the project folder.
2. Install dependencies:
   ```bash
   bun install
   ```
3. Create a `.env` file in the project root:
   ```env
   # Required only for AI extraction. If omitted, manual fallback is used. # See .env.example for details
   OPENAI_API_KEY=sk-your-key-here
   OPENAI_BASE_URL=https://api.deepseek.com   # or https://api.openai.com/v1
   OPENAI_MODEL=deepseek-v4-flash   # or gpt-4o-mini, gpt-4o, etc.
   ```

## Run

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How it works

1. **Upload** — Drag & drop or select a PDF lab report.
2. **Parse** — `pdf-parse` extracts raw text from the PDF server-side.
3. **Extract** — Two paths depending on whether an API key is configured:
   - **AI path** (primary): Raw PDF text is sent to the AI model. The model extracts biomarker names, values, units, reference ranges, patient demographics, and translates everything to standardized English terminology in a single pass. No separate translation step needed.
   - **Manual path** (fallback): Regex-based line parser extracts biomarker values using `lib/manual-extractor.ts`. Biomarker names are kept in their original language (no translation attempted) to avoid inaccurate guesses.
4. **Classify** — Each value is compared against its reference range and scored:
   - 🟢 **Optimal** — comfortably within range, away from boundaries
   - 🔵 **Normal** — within reference range
   - 🔴 **Out of Range** — above or below reference range
5. **Display** — Results are grouped by category (Blood Count, Lipids, Metabolism, etc.) with patient demographics shown at the top.

## Extraction modes

| Mode | Triggered when | Name language | Accuracy |
|------|---------------|---------------|----------|
| AI | `OPENAI_API_KEY` is set | English (standardized) | High |
| Manual | No API key, or AI call fails | Original PDF language | Moderate |

The UI shows a notice when manual mode is active so you know what to expect.

## Stack

- **Next.js 15** (App Router + Server Actions)
- **TypeScript** (strict mode)
- **Tailwind CSS**
- **shadcn/ui** components
- **next-themes** (dark / light mode)
- **Bun** runtime
- **pdf-parse** — PDF text extraction
- **OpenAI SDK** — compatible with OpenAI and DeepSeek APIs

## Deployment

No deployment is required for evaluation. For production, the recommended setup would be:

- **Frontend + Server Actions**: Vercel (zero-config for Next.js)
- **API key storage**: Vercel environment variables or AWS Secrets Manager
- **PDF storage** (if persistence needed): AWS S3 with a short TTL lifecycle policy
- **Database** (if storing report history): PostgreSQL on Supabase or AWS RDS

## Project structure

```
src/
├── app/
│   ├── actions/
│   │   └── analyze-report.ts     # Server action: orchestrates AI/manual extraction
│   └── page.tsx                  # Main page with loading timer UI
├── components/
│   ├── header.tsx
│   ├── upload-area.tsx
│   └── results-dashboard.tsx
└── lib/
    ├── types.ts                  # Shared TypeScript types
    ├── biomarker-map.ts          # Spanish → English normalization map (manual fallback)
    └── manual-extractor.ts       # Regex-based PDF parser
```

## Notes

- Results are for informational purposes only and do not replace medical advice.
- The app was tested against a Spanish Eurofins/SNB Diagnósticos Globales lab report format.
- For scanned (image-based) PDFs, `pdf-parse` cannot extract text — AI vision or OCR would be needed as an additional step.