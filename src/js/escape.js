// escape.js — Gemeinsame Escaping-Utility (XSS-Schutz).
// Verfügbar als window.OptixEscape (Browser) und exportiert für Node-Tests.
// Nutzung:
//   OptixEscape.escapeHtml(s)   → Text in HTML-Knoten (innerHTML)
//   OptixEscape.escapeAttr(s)   → Text in doppelt-gequoteten Attributen
//   OptixEscape.escapeUrl(s)    → URL/Quelle in src/href (erlaubt nur http(s), data:image, relative Pfade)
/* global module */
(function(root, factory){
  'use strict';
  const api = factory();
  if(typeof module !== 'undefined' && module.exports){ module.exports = api; }
  if(root){ root.OptixEscape = api; }
})(typeof window !== 'undefined' ? window : null, function(){
  'use strict';

  const ESCAPE_MAP = { '&':'&amp;', '<':'<', '>':'>', '"':'"', "'":'&#39;', '`':'&#96;' };

  function escapeHtml(value){
    return String(value == null ? '' : value).replace(/[&<>"'`]/g, ch => ESCAPE_MAP[ch]);
  }

  function escapeAttr(value){
    return escapeHtml(value);
  }

  function escapeUrl(value){
    const s = String(value == null ? '' : value).trim();
    // javascript:, data:text/html und andere gefährliche Schemata blockieren.
    if(/^[a-z][a-z0-9+.-]*:/i.test(s) && !/^(https?:|data:image\/|mailto:|tel:)/i.test(s)) return '';
    return s.replace(/["'<>]/g, ch => ESCAPE_MAP[ch]);
  }

  return { escapeHtml, escapeAttr, escapeUrl };
});

