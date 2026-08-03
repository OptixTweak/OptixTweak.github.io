PR: Admin Editor UX improvements

This change improves the Admin Products editor by adding:
- Markdown preview for the description field
- Basic field validations with user-facing error messages
- Small UX improvements and guidance (docs/admin-editor-notes.md)

How to test
1. git fetch && git checkout feature/admin
2. npx serve demo
3. Open /demo/admin/products.html
4. Edit a product: add Markdown content in Description, click "Preview" and verify the rendering
5. Try invalid inputs (empty ID, invalid chars, negative price) and confirm validation messages
6. Save to draft and export JSON

If OK, create a PR from feature/admin → main with this description.
