// Express + Stripe Checkout adapted to OptixTweak cart format
require('dotenv').config();
const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Warning: STRIPE_SECRET_KEY not set. Set it in .env before running.');
}
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || '');

// --- Lizenz-Fulfillment (Demo) ---
// Persistiert Lizenzen in einer JSON-Datei im Beispieldatensatz.
const LICENSES_FILE = path.join(__dirname, 'licenses.json');
function readLicenses(){
  try{ return JSON.parse(fs.readFileSync(LICENSES_FILE, 'utf8')); }catch(e){ return []; }
}
function writeLicenses(list){
  fs.writeFileSync(LICENSES_FILE, JSON.stringify(list, null, 2), 'utf8');
}
function generateKey(){
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let key = '';
  const bytes = crypto.randomBytes(20);
  for(let i=0;i<20;i++) key += alphabet[bytes[i] % alphabet.length];
  const groups = [];
  for(let i=0;i<key.length;i+=4) groups.push(key.slice(i, i+4));
  return 'OPTIX-' + groups.join('-');
}
function fulfillOrder(order){
  const licenses = readLicenses();
  (order.items || []).forEach(item => {
    const qty = Math.max(1, parseInt(item.qty || 1, 10));
    for(let i=0;i<qty;i++){
      licenses.push({
        key: generateKey(),
        productId: item.id,
        ownerEmail: order.email,
        orderId: order.id,
        status: 'active',
        createdAt: new Date().toISOString()
      });
    }
  });
  writeLicenses(licenses);
  return licenses;
}

const app = express();
// If your demo site is served from a different origin during dev, enable CORS:
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4242;

/**
 Expected request body from your checkout.js:
 { cart: [{ id, name, price, qty, image? }], customerEmail? }
 - price: number in Euros (e.g. 19.99)
 - qty: integer
 Response: { sessionId: '<stripe_session_id>' } or { url: '<checkout_url>' }
*/

// Optional server-side mapping from your product IDs to Stripe Price IDs.
// Populate this mapping with the price_xxx IDs you create in the Stripe Dashboard.
// Example:
// const PRICE_MAP = { 'demo-1': 'price_1NExa2Abc...', 'demo-2': 'price_1NEyB3Xyz...' };
const PRICE_MAP = {
  // 'demo-1': process.env.PRICE_DEMO_1 || 'price_abc123',
};

app.post('/create-checkout-session', async (req, res) => {
  try {
    const { cart = [], customerEmail } = req.body;

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: 'Cart is empty or invalid' });
    }

    // Build Stripe line_items from your cart format. Prefer server-side Price IDs when available.
    const line_items = cart.map(item => {
      const qty = Math.max(1, parseInt(item.qty || 1, 10));
      const priceId = PRICE_MAP[item.id];

      if (priceId) {
        // Use an existing Stripe Price ID (recommended for production)
        return { price: priceId, quantity: qty };
      }

      // Fallback: build price_data from client-supplied unit price (use only for demos / tests)
      const unit_amount = Math.round((Number(item.price) || 0) * 100); // cents
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

    // Return what checkout.js expects: { sessionId }
    // Note: in some Stripe setups you might prefer to return session.url instead; checkout.js supports both.
    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('create-checkout-session error', err);
    res.status(500).json({ error: err.message });
  }
});

// Optional webhook endpoint (recommended for reliable fulfillment)
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
    // Fulfillment: Lizenzen für die Bestellung erzeugen (Demo).
    // In Produktion: DB-Order anlegen, E-Mails senden, etc.
    const email = (session.customer_details && session.customer_details.email) || session.customer_email || null;
    let items = [];
    try{
      items = JSON.parse((session.metadata && session.metadata.cartSummary) || '[]');
    }catch(e){ items = []; }

    if(email && items.length){
      const created = fulfillOrder({ id: session.id, email, items });
      console.log('Webhook: fulfilled order', session.id, '->', created.length, 'licenses');
    } else {
      console.warn('Webhook: missing email/items for order', session.id);
    }
  }

  res.json({ received: true });
});

app.listen(PORT, () => console.log(`Stripe checkout server running on port ${PORT}`));
