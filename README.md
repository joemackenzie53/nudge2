# Nudge (prototype).

Lightweight web prototype that replaces an Excel tracker:
- **Tasks** (to-dos)
- **Chases** (follow-ups)
- **Meetings** (with actions/notes created from meeting view)
- **Inbox triage** (quick notes → convert to task/chase)

## Run locally
```bash
npm install
npm run dev
```

## Deploy to GitHub Pages
This repo includes a GitHub Actions workflow at `.github/workflows/deploy.yml`.

1) Repo Settings → Pages → Source: **GitHub Actions**
2) Push to `main`
3) Your Pages URL will appear in Settings → Pages

Notes:
- Uses **HashRouter** so refresh/navigation works on GitHub Pages.
- Uses `base: './'` in Vite config so assets load correctly on Pages subpaths.
