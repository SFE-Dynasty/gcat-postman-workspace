# GCAT Postman Workspace — VS Code Sync

This repo is auto-synced from the Postman workspace **Dashawn-Terrell Dennis's Workspace** (`f8cf6bbb-d512-497d-8cff-63b43639c5f3`).

## What's in here
- `collections/` — All Postman collections as JSON (importable into Postman or VS Code REST Client)
- `environments/` — All environments as JSON
- `scripts/` — Export and sync scripts

## How to sync manually
```bash
cd scripts
npm install
node export.js
```

## How to open in VS Code
1. Install the **Postman** VS Code extension
2. Sign in with your Postman account
3. Your workspace syncs automatically — no import needed

## Auto-export script
Run `node scripts/export.js` to pull the latest from Postman API and commit to this repo.
