# English Practice App

An AI-powered mobile-first English language practice app for native Spanish speakers.  
Installable as a PWA on iPhone and Android. Deployable to Vercel in minutes.

---

## Features

| Feature | Technology |
|---|---|
| Speech-to-text transcription | OpenAI Whisper API |
| Grammar & language feedback | Claude (claude-sonnet-4-20250514) |
| Pronunciation scoring | Azure Cognitive Services Speech |
| Progress dashboard with charts | Recharts + LocalStorage |
| Offline support | Workbox service worker |
| PWA install (iOS & Android) | vite-plugin-pwa |

---

## Quick Start (local dev)

### 1. Prerequisites

- Node.js 18 or later — https://nodejs.org
- npm 9 or later (included with Node)

### 2. Install dependencies

```bash
cd english-practice-app
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your API keys:

```
VITE_OPENAI_API_KEY=sk-...
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_AZURE_SPEECH_KEY=...        # optional — enables pronunciation scoring
VITE_AZURE_SPEECH_REGION=eastus  # optional
```

**Where to get keys:**
- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/
- Azure Speech: https://portal.azure.com → Create resource → Azure AI services → Speech

> **Note:** If you don't have API keys yet you can enter them inside the app via  
> **Settings → API Keys** and they will be stored in your browser's localStorage.

### 4. Generate PWA icons (one-time)

Open `public/generate-icons.html` in your browser, right-click each canvas,  
and save as `pwa-192x192.png`, `pwa-512x512.png`, and `apple-touch-icon.png`  
into the `public/` folder.

### 5. Run the dev server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Deploy to Vercel

### Option A — Vercel CLI (recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# From the project root:
vercel

# Follow the prompts. When asked for environment variables, add:
#   VITE_OPENAI_API_KEY
#   VITE_ANTHROPIC_API_KEY
#   VITE_AZURE_SPEECH_KEY      (optional)
#   VITE_AZURE_SPEECH_REGION   (optional)
```

For subsequent deploys:
```bash
vercel --prod
```

### Option B — GitHub + Vercel Dashboard

1. Push this repo to GitHub.
2. Go to https://vercel.com/new and import your repository.
3. Vercel auto-detects Vite. Leave build settings as defaults:
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
4. Add environment variables under **Settings → Environment Variables**:

| Name | Value |
|---|---|
| `VITE_OPENAI_API_KEY` | `sk-...` |
| `VITE_ANTHROPIC_API_KEY` | `sk-ant-...` |
| `VITE_AZURE_SPEECH_KEY` | *(optional)* |
| `VITE_AZURE_SPEECH_REGION` | `eastus` *(optional)* |

5. Click **Deploy**. Vercel will build and deploy automatically on every push.

---

## Install as PWA

### iPhone (Safari)
1. Open the deployed URL in Safari.
2. Tap the **Share** button (box with arrow).
3. Scroll down → tap **Add to Home Screen**.
4. Tap **Add**.

### Android (Chrome)
1. Open the deployed URL in Chrome.
2. Tap the three-dot menu → **Add to Home screen**.
3. Tap **Install**.

---

## Project Structure

```
english-practice-app/
├── public/
│   ├── favicon.svg
│   ├── pwa-192x192.png        ← generate with generate-icons.html
│   ├── pwa-512x512.png        ← generate with generate-icons.html
│   └── apple-touch-icon.png   ← generate with generate-icons.html
├── src/
│   ├── components/
│   │   ├── Layout.jsx          # Nav + header shell
│   │   ├── RecordButton.jsx    # Animated mic button
│   │   ├── ModeSelector.jsx    # Casual / Formal / Grammar tabs
│   │   ├── TopicPrompt.jsx     # Random conversation topic picker
│   │   ├── TranscriptEditor.jsx# Editable transcription review
│   │   ├── GrammarCard.jsx     # Claude feedback display
│   │   ├── PronunciationCard.jsx # Azure scoring display
│   │   └── AudioPlayer.jsx     # Playback bar
│   ├── hooks/
│   │   ├── useRecorder.js      # MediaRecorder wrapper
│   │   └── usePractice.js      # Practice session state machine
│   ├── pages/
│   │   ├── PracticePage.jsx    # Main recording + feedback screen
│   │   ├── DashboardPage.jsx   # Progress charts & history
│   │   └── SettingsPage.jsx    # API key entry + data management
│   └── utils/
│       ├── api.js              # Whisper / Claude / Azure calls
│       ├── storage.js          # LocalStorage helpers
│       └── topics.js           # Conversation topic bank
├── .env.example
├── vercel.json
├── vite.config.js              # PWA plugin configured here
├── tailwind.config.js
└── package.json
```

---

## Practice Modes

| Mode | Description |
|---|---|
| **Casual** | Everyday conversational English |
| **Formal** | Academic / professional English with stricter standards |
| **Grammar** | Deep grammar correction — every error is flagged and explained |

---

## Offline Support

Past sessions are stored in `localStorage` and fully accessible offline.  
The service worker caches the app shell and static assets so the app  
loads even with no internet connection. API calls (transcription, analysis)  
require an active network connection.

---

## Privacy

- All audio is processed via the respective APIs and is not stored by this app.
- Session transcripts are stored only in your browser's `localStorage`.
- API keys entered in Settings are stored only in `localStorage` on your device.
