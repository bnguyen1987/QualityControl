# Line QC Camera — Netlify site

Site: https://gwpg-line-qc.netlify.app (Netlify project "gwpg-line-qc", GitHub repo bnguyen1987/QualityControl)

## Already done
- Netlify project created.
- QC_ACCESS_CODE set to `gwqc-4827` (change it anytime in Netlify:
  Project configuration > Environment variables).

## AI access
By default the site uses Netlify AI Gateway (no API key needed; usage is billed to
Netlify credits). To use your own Anthropic account instead, follow Step 1.

## Step 1 (optional) — Use your own Anthropic API key
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

## Step 3 — Set up a machine PC
1. Plug a USB camera into the PC and mount it 2–4 ft over the belt, pointing straight down.
2. Copy `windows/Start Line QC.bat` to the PC's desktop and double-click it.
   (It opens Line QC in its own Chrome window that keeps working when Encore is in front.)
3. Click "Allow" when Chrome asks to use the camera.
4. Click the AI status (top right) and enter the access code.
5. Inspect tab: pick the USB camera from the camera list, click Start camera,
   draw the trigger zone, and click Learn empty belt with the belt clear.
6. Setup tab: fill in the machine and job, take the good sample, and tick
   "Start camera and inspecting automatically when this page opens".
7. To start automatically after a reboot: Windows+R, type shell:startup, Enter,
   and copy the .bat file into that folder.
8. Windows power settings: set Sleep to "Never" for this PC.

Supervisors: open the site on a phone, enter the code, go to the Alerts tab and
turn on "Sound the alarm on this phone".

## Optional settings (Netlify environment variables)
- QC_MODEL_FAST — model for Fast mode (default claude-haiku-4-5-20251001)
- QC_MODEL_THOROUGH — model for Thorough mode (default claude-sonnet-5)

## Files
- public/index.html — the app
- netlify/functions/inspect.mts — sends photos to the AI (API key stays on the server)
- netlify/functions/events.mts — shared Fail/Check alert feed (Netlify Blobs)
