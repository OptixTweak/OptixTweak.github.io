# Image optimization notes & commands

This file explains how to generate responsive WebP images and integrate them into the demo.

1) Place high‑resolution source images (PNG / JPG / SVG) into:
   assets/images/src/

2) Run the generation script (requires ImageMagick and cwebp):
   chmod +x tools/generate-webp.sh
   ./tools/generate-webp.sh

This will create files like:
  assets/images/placeholder-480.webp
  assets/images/placeholder-768.webp
  assets/images/placeholder-1200.webp

3) The demo expects product image base paths in data/products.json without extension, e.g.
   "/assets/images/placeholder"

The frontend will use a <picture> with WebP sources and fallback to an SVG (.svg) file that already exists.

4) Alternative: use imagemin + imagemin-webp (node)
   npm install --save-dev imagemin imagemin-webp imagemin-mozjpeg imagemin-pngquant

   // sample script
   const imagemin = require('imagemin');
   const webp = require('imagemin-webp');
   (async ()=>{
     await imagemin(['assets/images/src/*.{jpg,png}'], {
       destination: 'assets/images',
       plugins: [webp({quality: 75})]
     });
   })();

5) After generation, run local server and verify images load from /assets/images/*.webp

Accessibility / Performance notes:
- Use sizes attribute matching your layout (e.g. sizes="(max-width:600px) 100vw, 33vw")
- Use loading="lazy" on img for below‑the‑fold images
- Keep quality around 70–80 for good visual size tradeoff
