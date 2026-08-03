// server/routes/webhook.routes.js
// POST /webhook — Stripe Webhook (Fulfillment: Lizenzen erstellen bei
// checkout.session.completed). Logik unverändert aus server.js übernommen,
// nutzt jetzt services/licenseService statt lib/licenses direkt.
'use strict';

const express = require('express');
const { config } = require('../config/env');
const licenseService = require('../services/licenseService');

/**
 * @param {import('stripe').Stripe|null} stripe bereits konfigurierte Stripe-Instanz
 */
function createWebhookRouter(stripe){
  const router = express.Router();

  router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = config.stripe.webhookSecret;

    let event;
    try{
      if(!webhookSecret){
        console.warn('Webhook secret not configured — cannot verify signature.');
        return res.status(400).send('Webhook secret not configured');
      }
      if(!stripe){
        return res.status(503).send('Stripe not configured');
      }
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    }catch(err){
      console.error('Webhook signature verification failed.', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if(event.type === 'checkout.session.completed'){
      const session = event.data.object;
      console.log('Webhook: checkout.session.completed', session.id);

      let cartItems = [];
      try{ cartItems = JSON.parse(session.metadata.cartSummary || '[]'); }catch(e){ cartItems = []; }
      const email = session.customer_details && session.customer_details.email
        ? session.customer_details.email
        : (session.customer_email || null);

      if(email && cartItems.length){
        const order = { id: session.id, email, items: cartItems };
        const created = await licenseService.fulfillOrder(order);
        console.log('Created licenses:', created.length, 'for', email);
      } else {
        console.warn('Webhook: missing email or items — cannot fulfill order', session.id);
      }
    }

    res.json({ received: true });
  });

  return router;
}

module.exports = createWebhookRouter;
