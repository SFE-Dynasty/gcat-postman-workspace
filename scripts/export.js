#!/usr/bin/env node
/**
 * GCAT Postman Workspace Exporter
 * Pulls all collections, environments from Postman API
 * and writes them as JSON files for VS Code / version control.
 *
 * Usage:
 *   POSTMAN_API_KEY=your_key node export.js
 *
 * Get your API key at: https://go.postman.co/settings/me/api-keys
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.POSTMAN_API_KEY;
const WORKSPACE_ID = 'f8cf6bbb-d512-497d-8cff-63b43639c5f3';
const BASE = 'api.getpostman.com';

if (!API_KEY) {
  console.error('ERROR: Set POSTMAN_API_KEY environment variable');
  console.error('  export POSTMAN_API_KEY=your_postman_api_key');
  console.error('  Get it at: https://go.postman.co/settings/me/api-keys');
  process.exit(1);
}

function get(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE,
      path,
      headers: { 'X-Api-Key': API_KEY }
    };
    https.get(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('Parse error: ' + data.slice(0, 200))); }
      });
    }).on('error', reject);
  });
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log('  wrote', filePath);
}

async function main() {
  console.log('GCAT Postman Workspace Exporter');
  console.log('Workspace:', WORKSPACE_ID);
  console.log('');

  // Export collections
  console.log('Fetching collections...');
  const colList = await get(`/collections?workspace=${WORKSPACE_ID}`);
  const collections = colList.collections || [];
  console.log(`  Found ${collections.length} collections`);

  for (const col of collections) {
    // Skip temp/internal collections
    if (col.name.startsWith('__')) {
      console.log(`  Skipping internal: ${col.name}`);
      continue;
    }
    const detail = await get(`/collections/${col.uid}`);
    const safeName = col.name.replace(/[^a-zA-Z0-9\-_ ]/g, '').replace(/\s+/g, '_');
    writeJson(`../collections/${safeName}.json`, detail.collection);
  }

  // Export environments
  console.log('');
  console.log('Fetching environments...');
  const envList = await get(`/environments?workspace=${WORKSPACE_ID}`);
  const environments = envList.environments || [];
  console.log(`  Found ${environments.length} environments`);

  for (const env of environments) {
    const detail = await get(`/environments/${env.uid}`);
    const safeName = env.name.replace(/[^a-zA-Z0-9\-_ ]/g, '').replace(/\s+/g, '_');
    writeJson(`../environments/${safeName}.json`, detail.environment);
  }

  console.log('');
  console.log('Export complete.');
  console.log('Collections and environments written to collections/ and environments/');
  console.log('');
  console.log('To import into Postman: File > Import > select any JSON file');
  console.log('To use in VS Code REST Client: open any .json collection file');
}

main().catch(err => {
  console.error('Export failed:', err.message);
  process.exit(1);
});
