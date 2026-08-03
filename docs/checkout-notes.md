Stripe test mode integration notes

This demo includes a "Pay with Stripe (Test)" button which expects a server endpoint
POST /create-checkout-session that creates a Stripe Checkout Session and returns { sessionId }.

Important: do NOT commit your Stripe secret key to the repository. Use environment variables on the server.

Example Node/Express server (server.js):

```js
// Requires: npm install express stripe body-parser
const express = require('express');
const app = express();
app.use(express.json());
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // set in env

app.post('/create-checkout-session', async (req, res) => {
  const { cart } = req.body; // map cart items to line_items
  const line_items = cart.map(item => ({ price_data: { currency: 'eur', product_data: { name: item.name }, unit_amount: Math.round(item.price*100) }, quantity: item.qty }));
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items,
    success_url: 'https://your-site.example/checkout/success',
    cancel_url: 'https://your-site.example/checkout/cancel'
  });
  res.json({ sessionId: session.id });
});

app.listen(4242, ()=> console.log('Stripe server listening'));
```

How to test locally with Stripe CLI (recommended for dev):
1) Install Stripe CLI and login
2) Set your STRIPE_SECRET_KEY locally (export STRIPE_SECRET_KEY=sk_test_...)
3) Run the example server: node server.js
4) In demo site, the client will POST /create-checkout-session to your server (ensure CORS or proxy)

Notes: In production you'd secure the server endpoint, validate the cart, ensure idempotency, and handle webhooks for payment confirmation.
