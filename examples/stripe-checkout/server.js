// Express + Stripe Checkout adapted to OptixTweak cart format
require('dotenv').config();
const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY || '';
if (!STRIPE_SECRET) {
  console.warn('Warning: STRIPE_SECRET_KEY not set. Set it in .env before running.');
}
const stripe = Stripe(STRIPE_SECRET);

const app = express();
// Configure CORS: allow specific origins via ALLOWED_ORIGINS (comma separated), otherwise allow all for demo
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(s=>s.trim()).filter(Boolean);
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : true }));

// Webhook needs the raw body to verify the signature. Mount the raw parser specifically for /webhook
const PORT = process.env.PORT || 4242;

// Parse PRICE_MAP_JSON from env (optional). Server-side mapping productId -> price_xxx
let PRICE_MAP = {};
if (process.env.PRICE_MAP_JSON) {
  try {
    PRICE_MAP = JSON.parse(process.env.PRICE_MAP_JSON);
    console.log('Loaded PRICE_MAP for', Object.keys(PRICE_MAP).length, 'items');
  } catch (e) {
    console.warn('Invalid PRICE_MAP_JSON in env — ignoring. Provide valid JSON mapping in .env');
    PRICE_MAP = {};
  }
}

// Webhook endpoint — must use raw body. Define before express.json() so middleware ordering does not interfere.
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('Webhook secret not configured; /webhook will not verify signatures.');
    return res.status(400).send('Webhook secret not configured');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // TODO: fulfill the order (create DB order, send emails, etc.)
    console.log('Webhook: checkout.session.completed', session.id);
  }

  res.json({ received: true });
});

// For other endpoints, use JSON body parser with a reasonable limit
app.use(express.json({ limit: '50kb' }));

/**
 Expected request body from your checkout.js:
 { cart: [{ id, name, price, qty, image? }], customerEmail? }
 - price: number in Euros (e.g. 19.99)
 - qty: integer
 Response: { sessionId: '<stripe_session_id>' } or { url: '<checkout_url>' }
*/

function validateCart(cart) {
  if (!Array.isArray(cart) || cart.length === 0) return 'Cart is empty or invalid';
  for (const item of cart) {
    if (!item) return 'Invalid cart item';
    if (typeof item.id === 'undefined') return 'Each item must include id';
    if (PRICE_MAP[item.id]) continue; // price validated server-side
    // fallback: require numeric price when no server-side mapping
    if (typeof item.price !== 'number' && typeof item.price !== 'string') return `Item ${item.id} missing price`;
    const priceNum = Number(item.price);
    if (Number.isNaN(priceNum) || priceNum < 0) return `Invalid price for item ${item.id}`;
    if (item.qty && (!Number.isInteger(item.qty) || item.qty < 1)) return `Invalid qty for ${item.id}`;
  }
  return null;
}

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { cart = [], customerEmail } = req.body;
    const invalid = validateCart(cart);
    if (invalid) return res.status(400).json({ error: invalid });

    const line_items = cart.map(item => {
      const qty = Math.max(1, parseInt(item.qty || 1, 10));
      const priceId = PRICE_MAP[item.id];
      if (priceId) {
        return { price: priceId, quantity: qty };
      }
      const unit_amount = Math.round((Number(item.price) || 0) * 100);
      return {
        price_data: {
          currency: process.env.CURRENCY || 'eur',
          product_data: {
            name: item.name || 'Product',
            images: item.image ? [item.image] : undefined,
            metadata: { product_id: item.id || '' },
          },
          unit_amount,
        },
        quantity: qty,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      customer_email: customerEmail,
      success_url: (process.env.SUCCESS_URL || 'http://localhost:5173/checkout-success?session_id={CHECKOUT_SESSION_ID}'),
      cancel_url: (process.env.CANCEL_URL || 'http://localhost:5173/cart'),
    });

    // Return session id and url (checkout.js supports both)
    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('create-checkout-session error', err);
    res.status(500).json({ error: err.message || 'Internal error' });
  }
});

app.listen(PORT, () => console.log(`Stripe checkout server running on port ${PORT}`));
