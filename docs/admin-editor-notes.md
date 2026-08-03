Admin Editor — Markdown & UX notes

This document describes the lightweight markdown preview and UX improvements added to the admin products editor.

Features added
- Markdown preview for the product Description field:
  - Click "Preview" to render a simple subset of Markdown (headings, bold, italic, inline code, code blocks, links, paragraphs).
  - Preview is rendered client-side and shown in the editor panel.
- Validations on Save:
  - ID is required and must match /^[a-zA-Z0-9-_]+$/
  - Name is required
  - Price must be non-negative
  - Validation errors are shown above the editor inputs
- UX:
  - After saving an item in the editor, a notice suggests saving the draft (local) via the "Save draft (Local)" button.
  - Editor fields include a Markdown preview button to help authors compose better product descriptions.

Limitations
- The Markdown renderer is intentionally minimal and does not sanitize input. This is a demo convenience — if you allow untrusted input in production, sanitize on the server or use a library like marked + DOMPurify.
- Images are still handled as comma separated URLs; for better UX you can integrate the upload page which generates blob URLs.

Usage
- Edit the Description with Markdown and click "Preview" to see the rendered result.
- Save product edits to the in-memory draft; then use "Save draft (Local)" to persist changes in localStorage or "Export JSON" to download the JSON ready for PR.
