// server/routes/checkout.routes.js
// POST /create-checkout-session — erstellt eine Stripe Checkout Session (Testmodus).
// Logik unverändert aus der bisherigen server.js übernommen (inkl. serverseitiger
// Preisvalidierung), nutzt jetzt services/productService statt direktem require
// von data/products.json.
'use strict';

const express = require('express');
const Stripe = require('stripe');
const { config } = require('../config/env');
const productService = require('../services/productService');

const router = express.Router();

const stripe = config.stripe.secretKey ? Stripe(config.stripe.secretKey) : null;

router.post('/create-checkout-session', async (req, res) => {
  try{
    if(!stripe) return res.status(503).json({ error: 'Stripe not configured (STRIPE_SECRET_KEY missing)' });

    const { cart = [], customerEmail } = req.body;
    if(!Array.isArray(cart) || cart.length === 0){
      return res.status(400).json({ error: 'Cart is empty or invalid' });
    }

    // Preise serverseitig aus dem Produkt-Repository holen (Client-Preise NICHT vertrauen)
    const line_items = [];
    for(const item of cart){
      // eslint-disable-next-line no-await-in-loop
      const product = await productService.getProductById(item.id);
      const price = product ? Number(product.price) : (Number(item.price) || 0);
      if(price <= 0) throw new Error('Invalid product in cart: ' + item.id);
      const qty = Math.max(1, parseInt(item.qty || 1, 10));
      line_items.push({
        price_data: {
          currency: config.currency,
          product_data: { name: product ? product.name : item.id, metadata: { product_id: item.id } },
          unit_amount: Math.round(price * 100)
        },
        quantity: qty
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      success_url: config.urls.success,
      cancel_url: config.urls.cancel,
      metadata: { cartSummary: JSON.stringify(cart.map(i => ({ id: i.id, qty: i.qty || 1 }))) }
    });

    res.json({ sessionId: session.id, url: session.url });
  }catch(err){
    console.error('create-checkout-session error', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = { router, stripe };
