<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/99a7f21a-f35a-4104-9110-79ffeea338c9

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Copy [.env.example](.env.example) to `.env.local` and replace the placeholder values.
3. Add your Firebase values to `.env.local` using the `VITE_FIREBASE_*` variables.
4. Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key.
5. Run the app:
   `npm run dev`

The app will use Vite environment variables first, and will fall back to the legacy `firebase-applet-config.json` values if needed.
