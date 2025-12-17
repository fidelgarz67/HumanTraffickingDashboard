# Trafficking Risk Identifier Dashboard (dashboard folder)

This copy of the project lives in the `dashboard/` subfolder so you can open that folder directly in VS Code or serve it from Live Server.

## Quick Start

1. Open the `dashboard/` folder in VS Code.
2. Install and run the Live Server extension, or run a simple HTTP server from the folder.

### Start a simple Python server

```bash
cd "/Users/fidel/Library/Mobile Documents/com~apple~CloudDocs/School/Graduate/DSC580/Milestone3/dashboard"
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Files in this folder

- `index.html` — main HTML
- `styles.css` — CSS
- `app.js` — application JS
- `config.js` — placeholder AWS config and demo credentials
- `trafficking-risk-data.json` — sample data (also used as local fallback)

## Default credentials (for demo)

- Username: `admin`
- Password: `password123`

## Notes
- If you plan to fetch data directly from S3 in-browser, uncomment the AWS SDK script tag in `index.html` and update `config.js` with safe credentials (or use temporary credentials). See the main README for security notes.
