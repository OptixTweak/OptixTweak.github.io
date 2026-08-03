PR body for feature/admin: Admin & Content Management (Phase 5)

This PR adds an in-browser admin UI for managing site content (products) in demo mode. It includes:
- demo admin login (token + GitHub OAuth placeholder)
- products editor (create/edit/delete) with preview
- local draft save + export JSON
- Upload page to simulate image uploads (blob URLs)
- Scaffolding & documentation for PR automation (server endpoint POST /create-pr)

How to test
1. git fetch && git checkout feature/admin
2. Start a local server: npx serve demo
3. Open /demo/admin/index.html and login with token: admindemo or use GitHub placeholder
4. Open Products Editor, edit a product, save local draft, export JSON
5. (Optional) Implement server /create-pr to exercise PR automation

Acceptance checklist
- [ ] Admin sign-in (token or GitHub placeholder)
- [ ] Product create/edit/delete in editor
- [ ] Save draft and export JSON
- [ ] Upload page creates blob URL previews
- [ ] docs/admin-notes.md documents PR automation requirements
