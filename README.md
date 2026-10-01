# Line QC Camera — Netlify site

Site: https://gwpg-line-qc.netlify.app (Netlify project "gwpg-line-qc", GitHub repo bnguyen1987/QualityControl)

## Already done
- Netlify project created.
- QC_ACCESS_CODE set to `gwqc-4827` (change it anytime in Netlify:
  Project configuration > Environment variables).

## Step 1 — Get an Anthropic API key (one time)
1. Go to https://console.anthropic.com and sign in or create an account.
2. Billing: add a payment method and some prepaid credit.
3. API Keys > Create Key. Name it "Line QC". Copy it (starts with sk-ant-).
4. In Netlify: gwpg-line-qc > Project configuration > Environment variables >
   Add variable. Key: ANTHROPIC_API_KEY, Value: the key. Mark it secret.
5. Optional: in the Anthropic console, set a monthly spend limit.

## Step 2 — Deploy (from a computer with Node.js installed)
Open a terminal in this folder and run:

    npx netlify-cli login
    npx netlify-cli deploy --prod --build --site 09a35220-e7a5-4bb1-a519-25b696898839

(Drag-and-drop deploys don't include the server functions, so use the command.)
Re-run the deploy command after any code change. Env var changes need a redeploy.

## Step 3 — Set up a camera station
1. Open https://gwpg-line-qc.netlify.app on the tablet/phone.
2. Tap the AI status pill (top right) and enter the access code.
3. Share > Add to Home Screen, then open it from the home screen icon.
4. Follow the mounting checklist on the Setup tab.

Supervisors: open the same link, enter the code, go to the Alerts tab and turn
on "Sound the alarm on this phone".

## Optional settings (Netlify environment variables)
- QC_MODEL_FAST — model for Fast mode (default claude-haiku-4-5-20251001)
- QC_MODEL_THOROUGH — model for Thorough mode (default claude-sonnet-5)

## Files
- public/index.html — the app
- netlify/functions/inspect.mts — sends photos to the AI (API key stays on the server)
- netlify/functions/events.mts — shared Fail/Check alert feed (Netlify Blobs)
- netlify/functions/stations.mts — camera status + snapshots for the Dashboard tab
