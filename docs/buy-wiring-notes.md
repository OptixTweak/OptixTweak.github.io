Update: wire "Kaufen" buttons to add products to cart.

This file (src/js/buy-wiring.js) will:
- On product pages with ?id=..., attach the main "Kaufen" button to add the product to the cart and redirect to /demo/checkout/cart.html
- On pages with buttons that include data-product="<id>", attach click handlers to add that product by id to the cart

Usage:
- Include <script src="/src/js/buy-wiring.js" defer></script> on pages where buy buttons exist (product.html, index.html, etc.)
- It relies on /data/products.json being available and window.OptixCart (provided by src/js/cart.js)
