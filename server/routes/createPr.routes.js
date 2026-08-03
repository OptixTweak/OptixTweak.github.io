// server/routes/createPr.routes.js
// POST /create-pr — GitHub Pull Request erstellen (optional, @octokit).
// Verhalten unverändert aus server.js übernommen (weiterhin Scaffold/501,
// solange @octokit/rest nicht verdrahtet ist — siehe docs/admin-notes.md).
'use strict';

const express = require('express');
const { config } = require('../config/env');

const router = express.Router();

router.post('/create-pr', async (req, res) => {
  try{
    const { title, files } = req.body || {};
    if(!title || !Array.isArray(files) || files.length === 0){
      return res.status(400).json({ error: 'title and files[] are required' });
    }

    if(!config.github.token){
      return res.status(501).json({ error: 'GITHUB_TOKEN not configured. See docs/admin-notes.md' });
    }

    // Hinweis: Hier @octokit/rest nutzen, um Branch/Blob/Tree/Commit/PR zu erstellen.
    // Diese Demo gibt nur einen Platzhalter zurück. Der vollständige Code ist in
    // server/create-pr-octokit.example.js vorgesehen (siehe docs/admin-notes.md).
    res.status(501).json({ error: 'PR automation not implemented in demo server scaffold. Use @octokit/rest.' });
  }catch(err){
    console.error('create-pr error', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
