// admin-upload.js
// Simple client-side uploader: creates blob URLs for selected files and shows previews.

(function(){
  document.addEventListener('DOMContentLoaded', ()=>{
    const file = document.getElementById('file');
    const preview = document.getElementById('preview');
    const copy = document.getElementById('copy-urls');
    const urls = [];

    if(file) file.addEventListener('change', (e)=>{
      const fList = Array.from(e.target.files || []);
      fList.forEach(f=>{
        const url = URL.createObjectURL(f);
        urls.push(url);
        const img = document.createElement('img'); img.src = url; img.className = 'thumb'; img.alt = f.name;
        preview.appendChild(img);
      });
    });

    if(copy) copy.addEventListener('click', ()=>{
      if(urls.length===0) return alert('No images');
      const text = urls.join('\n');
      navigator.clipboard.writeText(text).then(()=> alert('Copied URLs to clipboard'));
    });
  });
})();
