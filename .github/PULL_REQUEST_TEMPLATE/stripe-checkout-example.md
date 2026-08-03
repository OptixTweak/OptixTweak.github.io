---
name: "feat: Add Stripe checkout example server"
about: "Adds an example Stripe Checkout server (examples/stripe-checkout/) compatible with the demo cart format. Includes server.js, package.json and .env.example. Server maps cart → Stripe line_items and returns { sessionId }.

Notes:
- Set STRIPE_SECRET_KEY locally before running.
- Test with Stripe test card 4242 4242 4242 4242.
- Consider using Stripe Price IDs and webhooks for production.
"
labels:
- feature
- stripe
assignees:
- OptixTweak
---

Pull request template: adding stripe checkout example server
