# Trafficking Risk Identifier Dashboard (dashboard folder)

This copy of the project lives in the `dashboard/` subfolder so you can open that folder directly in VS Code or serve it from Live Server.

## Quick Start

1. Open the `dashboard/` folder in VS Code.
2. Install and run the Live Server extension, or run a simple HTTP server from the folder.

### Start a simple Python server

If you'd like the dashboard to fetch the local results file (`dashboard/results/country_shap_summary.json`), you can serve the `dashboard/` folder directly. For a quick start run:

```bash
# from inside the 'dashboard' folder
python3 -m http.server 8000
```

Then open `http://localhost:8000/` in your browser.

## Files in this folder

- `index.html` — main HTML
- `methodology.html` — overview of the current model workflow and interpretation
- `guide.html` — explanation of the dashboard displays and exports
- `about.html` — project background and ongoing-development context
- `styles.css` — CSS
- `app.js` — application JS
- `config.js` — placeholder AWS config and demo credentials
- `trafficking-risk-data.json` — sample data (also used as local fallback)
- Local results (project root) — `results/country_shap_summary.json` will be used automatically if present; search the dashboard by country code (e.g., `US`, `PH`)

## Default credentials (for demo)

- Username: `admin`
- Password: `password123`

## Notes
- If you plan to fetch data directly from S3 in-browser, uncomment the AWS SDK script tag in `index.html` and update `config.js` with safe credentials (or use temporary credentials). See the main README for security notes.
