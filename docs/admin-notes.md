Admin notes — Admin & Content Management (Phase 5)

Overview
This admin UI is a demo-level content manager for the static demo site. It allows editing products in-browser, saving drafts locally, exporting the JSON, and optionally creating a Pull Request via a server endpoint.

Auth
- Two demo auth options provided:
  - Simple token/password (in-browser): demo token is 'admindemo' (change in src/js/admin-auth.js)
  - GitHub OAuth placeholder: simulates OAuth flow and signs you in as admin@demo.local
- For real deployments, use a secure server-side auth and restrict PR automation to authenticated server-side actions.

Product editing
- Products are read from /data/products.json (repo copy). The editor merges with a local draft if present.
- Edit fields: id, name, short, description, price, images (comma-separated)
- Save strategy:
  - Local draft: saves to localStorage (optix-admin-products-draft)
  - Export JSON: downloads the modified products JSON for you to open in an editor and create your own PR
  - Create PR: this calls POST /create-pr on the same origin. The server must accept payload { title, body, files: [{path, content}] } and create a PR using a GitHub token. See scaffolding below.

PR Automation scaffolding (server required)
- Example Node/Express endpoint (very minimal, DO NOT commit secrets to the repo):

```js
// server/create-pr.js (example)
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const app = express();
app.use(bodyParser.json());

app.post('/create-pr', async (req, res) => {
  const { title, body, files } = req.body;
  // Implement: create branch, create blobs/trees, commit and open PR via GitHub REST API
  // You will need a token with repo permissions stored as an env var (GITHUB_TOKEN)
  res.status(501).json({ error: 'Not implemented in demo. See docs/admin-notes.md for instructions.' });
});

app.listen(3001);
```

- For a production-ready flow use @octokit/rest and follow GitHub's create a blob/tree/commit API or use the GitHub CLI. Keep tokens on the server and implement validations and auditing.

Image uploads
- The admin upload page simulates uploads by creating blob URLs, which you can copy and use in product images. For real uploads, integrate an asset store (S3, Netlify / Vercel upload, or commit images to the repo via PR automation).

Security
- This UI is demo-only. If you enable PR automation, restrict calls to the server (CORS, auth) and never expose GITHUB_TOKEN in the client.

Next steps
- Implement server-side create-pr using @octokit/rest and a minimal express server (I can scaffold this if you want).
- Add validation and richer previews (tinyMCE / markdown) and image upload integration.
