// Helper: Resize image to max 800px and return base64
function setupImageUpload(fileInputId, previewId, urlInputId) {
  const fileInput = document.getElementById(fileInputId);
  const urlInput = document.getElementById(urlInputId);
  const preview = document.getElementById(previewId);

  if (!fileInput || !preview || !urlInput) return;

  fileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(ev) {
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        const maxSize = 800;

        if (w > maxSize) {
          h = (h * maxSize) / w;
          w = maxSize;
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        const resized = canvas.toDataURL('image/jpeg', 0.85);
        urlInput.value = resized;
        preview.src = resized;
        preview.style.display = 'block';
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  urlInput.addEventListener('input', function() {
    const val = this.value.trim();
    if (val) {
      preview.src = val;
      preview.style.display = 'block';
    } else {
      preview.style.display = 'none';
    }
  });
}

(async () => {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  const token = params.get('token');

  if (!slug || !token) {
    document.getElementById('access-denied').style.display = 'block';
    return;
  }

  const docRef = db.collection('cards').doc(slug);
  let docSnap;
  try {
    docSnap = await docRef.get();
  } catch (e) {
    console.error(e);
  }

  if (!docSnap || !docSnap.exists) {
    document.getElementById('access-denied').style.display = 'block';
    return;
  }

  const cardData = docSnap.data();
  if (cardData.editToken !== token) {
    document.getElementById('access-denied').style.display = 'block';
    return;
  }

  // Load all fields
  document.getElementById('e-name').value = cardData.name || '';
  document.getElementById('e-title').value = cardData.title || '';
  document.getElementById('e-phone').value = cardData.phone || '';
  document.getElementById('e-email').value = cardData.email || '';
  document.getElementById('e-website').value = cardData.website || '';
  document.getElementById('e-about').value = cardData.about || '';
  document.getElementById('e-about-img').value = cardData.aboutImage || '';
  document.getElementById('e-about-pdf').value = cardData.aboutPdf || '';
  document.getElementById('e-img').value = cardData.profileImage || '';
  document.getElementById('e-profile-style').value = cardData.profileStyle || 'circle';
  document.getElementById('e-qr').value = cardData.qrImage || '';
  document.getElementById('e-theme').value = cardData.theme || 'default';
  document.getElementById('e-calendar').value = cardData.calendarUrl || '';

  // Preview existing images
  if (cardData.profileImage) {
    document.getElementById('e-img-preview').src = cardData.profileImage;
    document.getElementById('e-img-preview').style.display = 'block';
  }
  if (cardData.aboutImage) {
    document.getElementById('e-about-img-preview').src = cardData.aboutImage;
    document.getElementById('e-about-img-preview').style.display = 'block';
  }
  if (cardData.qrImage) {
    document.getElementById('e-qr-preview').src = cardData.qrImage;
    document.getElementById('e-qr-preview').style.display = 'block';
  }

  // Setup image uploads
  setupImageUpload('e-img-file', 'e-img-preview', 'e-img');
  setupImageUpload('e-about-img-file', 'e-about-img-preview', 'e-about-img');
  setupImageUpload('e-qr-file', 'e-qr-preview', 'e-qr');

  // Products
  const productsDiv = document.getElementById('products-list');
  const productsData = cardData.products || [];
  function renderProducts() {
    productsDiv.innerHTML = '';
    productsData.forEach((p, i) => {
      const row = document.createElement('div');
      row.style.border = '1px solid #e2e8f0';
      row.style.padding = '10px';
      row.style.margin = '8px 0';
      row.style.borderRadius = '10px';
      row.innerHTML = '<label>Product Image:</label><input type="file" class="prod-img-file" accept="image/*" style="padding:6px;width:100%;"><p style="font-size:11px;color:#64748b;">— or —</p><input type="url" class="prod-img-url" value="'+(p.image||'')+'" placeholder="Image URL" style="width:100%;"><img class="prod-img-preview" src="'+(p.image||'')+'" style="max-width:80px;max-height:80px;display:'+(p.image?'block':'none')+';margin-top:5px;border-radius:8px;"><label>Product Name:</label><input type="text" class="prod-name" value="'+(p.name||'')+'" placeholder="Product Name"><label>Selling Price (₹):</label><input type="text" class="prod-selling" value="'+(p.sellingPrice||'')+'" placeholder="999"><label>Actual Price (₹):</label><input type="text" class="prod-actual" value="'+(p.actualPrice||'')+'" placeholder="1999"><button type="button" class="remove-product" style="background:#ef4444;color:#fff;border:none;padding:6px 12px;border-radius:6px;margin-top:8px;">Remove</button>';
      
      const fileInput = row.querySelector('.prod-img-file');
      const urlInput = row.querySelector('.prod-img-url');
      const preview = row.querySelector('.prod-img-preview');
      
      fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(ev) {
          const img = new Image();
          img.onload = function() {
            const canvas = document.createElement('canvas');
            let w = img.width, h = img.height, max = 800;
            if (w > max) { h = (h * max) / w; w = max; }
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            var resized = canvas.toDataURL('image/jpeg', 0.85);
            urlInput.value = resized;
            preview.src = resized;
            preview.style.display = 'block';
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      });
      
      row.querySelector('.remove-product').onclick = () => { productsData.splice(i, 1); renderProducts(); };
      productsDiv.appendChild(row);
    });
  }
  renderProducts();
  document.getElementById('add-product').onclick = () => { productsData.push({ name:'', sellingPrice:'', actualPrice:'', image:'' }); renderProducts(); };

  // Services
  const servicesDiv = document.getElementById('services-list');
  const servicesData = cardData.services || [];
  function renderServices() {
    servicesDiv.innerHTML = '';
    servicesData.forEach((s, i) => {
      const row = document.createElement('div');
      row.style.border = '1px solid #e2e8f0';
      row.style.padding = '10px';
      row.style.margin = '8px 0';
      row.style.borderRadius = '10px';
      row.innerHTML = '<label>Service Image:</label><input type="file" class="serv-img-file" accept="image/*" style="padding:6px;width:100%;"><p style="font-size:11px;color:#64748b;">— or —</p><input type="url" class="serv-img-url" value="'+(s.image||'')+'" placeholder="Image URL" style="width:100%;"><img class="serv-img-preview" src="'+(s.image||'')+'" style="max-width:80px;max-height:80px;display:'+(s.image?'block':'none')+';margin-top:5px;border-radius:8px;"><label>Service Title:</label><input type="text" class="serv-title" value="'+(s.title||'')+'" placeholder="Service Name"><button type="button" class="remove-service" style="background:#ef4444;color:#fff;border:none;padding:6px 12px;border-radius:6px;margin-top:8px;">Remove</button>';
      
      const fileInput = row.querySelector('.serv-img-file');
      const urlInput = row.querySelector('.serv-img-url');
      const preview = row.querySelector('.serv-img-preview');
      
      fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(ev) {
          const img = new Image();
          img.onload = function() {
            const canvas = document.createElement('canvas');
            let w = img.width, h = img.height, max = 800;
            if (w > max) { h = (h * max) / w; w = max; }
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            urlInput.value = canvas.toDataURL('image/jpeg', 0.85);
            preview.src = urlInput.value;
            preview.style.display = 'block';
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      });
      
      row.querySelector('.remove-service').onclick = () => { servicesData.splice(i, 1); renderServices(); };
      servicesDiv.appendChild(row);
    });
  }
  renderServices();
  document.getElementById('add-service').onclick = () => { servicesData.push({ title:'', image:'' }); renderServices(); };

  // Gallery
  const galleryDiv = document.getElementById('gallery-list');
  const galleryData = cardData.gallery || [];
  function renderGallery() {
    galleryDiv.innerHTML = '';
    galleryData.forEach((img, i) => {
      const row = document.createElement('div');
      row.style.border = '1px solid #e2e8f0';
      row.style.padding = '10px';
      row.style.margin = '8px 0';
      row.style.borderRadius = '10px';
      row.innerHTML = '<label>Image:</label><input type="file" class="gal-img-file" accept="image/*" style="padding:6px;width:100%;"><p style="font-size:11px;color:#64748b;">— or —</p><input type="url" class="gal-img-url" value="'+(img||'')+'" placeholder="Image URL" style="width:100%;"><img class="gal-img-preview" src="'+(img||'')+'" style="max-width:100px;max-height:100px;display:'+(img?'block':'none')+';margin-top:5px;border-radius:8px;"><button type="button" class="remove-gallery" style="background:#ef4444;color:#fff;border:none;padding:6px 12px;border-radius:6px;margin-top:8px;">Remove</button>';
      
      const fileInput = row.querySelector('.gal-img-file');
      const urlInput = row.querySelector('.gal-img-url');
      const preview = row.querySelector('.gal-img-preview');
      
      fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(ev) {
          const imgEl = new Image();
          imgEl.onload = function() {
            const canvas = document.createElement('canvas');
            let w = imgEl.width, h = imgEl.height, max = 800;
            if (w > max) { h = (h * max) / w; w = max; }
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(imgEl, 0, 0, w, h);
            urlInput.value = canvas.toDataURL('image/jpeg', 0.85);
            preview.src = urlInput.value;
            preview.style.display = 'block';
          };
          imgEl.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      });
      
      row.querySelector('.remove-gallery').onclick = () => { galleryData.splice(i, 1); renderGallery(); };
      galleryDiv.appendChild(row);
    });
  }
  renderGallery();
  document.getElementById('add-gallery').onclick = () => { galleryData.push(''); renderGallery(); };

  // YouTube
  const youtubeDiv = document.getElementById('youtube-list');
  const youtubeData = cardData.youtube || [];
  function renderYoutube() {
    youtubeDiv.innerHTML = '';
    youtubeData.forEach((url, i) => {
      const row = document.createElement('div');
      row.style.border = '1px solid #e2e8f0';
      row.style.padding = '10px';
      row.style.margin = '8px 0';
      row.style.borderRadius = '10px';
      row.innerHTML = '<label>YouTube URL:</label><input type="url" class="yt-url" value="'+(url||'')+'" placeholder="https://youtube.com/watch?v=..." style="width:100%;"><button type="button" class="remove-yt" style="background:#ef4444;color:#fff;border:none;padding:6px 12px;border-radius:6px;margin-top:8px;">Remove</button>';
      row.querySelector('.remove-yt').onclick = () => { youtubeData.splice(i, 1); renderYoutube(); };
      youtubeDiv.appendChild(row);
    });
  }
  renderYoutube();
  document.getElementById('add-youtube').onclick = () => { youtubeData.push(''); renderYoutube(); };

  // Reels
  const reelsDiv = document.getElementById('reels-list');
  const reelsData = cardData.reels || [];
  function renderReels() {
    reelsDiv.innerHTML = '';
    reelsData.forEach((url, i) => {
      const row = document.createElement('div');
      row.style.border = '1px solid #e2e8f0';
      row.style.padding = '10px';
      row.style.margin = '8px 0';
      row.style.borderRadius = '10px';
      row.innerHTML = '<label>Reel URL:</label><input type="url" class="reel-url" value="'+(url||'')+'" placeholder="https://instagram.com/reel/..." style="width:100%;"><button type="button" class="remove-reel" style="background:#ef4444;color:#fff;border:none;padding:6px 12px;border-radius:6px;margin-top:8px;">Remove</button>';
      row.querySelector('.remove-reel').onclick = () => { reelsData.splice(i, 1); renderReels(); };
      reelsDiv.appendChild(row);
    });
  }
  renderReels();
  document.getElementById('add-reel').onclick = () => { reelsData.push(''); renderReels(); };

  // Payment
  const paymentData = cardData.payment || {};
  document.getElementById('e-paytm').value = paymentData.paytm || '';
  document.getElementById('e-upi').value = paymentData.upi || '';
  document.getElementById('e-payment-qr').value = paymentData.qrImage || '';
  if (paymentData.qrImage) {
    document.getElementById('e-payment-qr-preview').src = paymentData.qrImage;
    document.getElementById('e-payment-qr-preview').style.display = 'block';
  }
  setupImageUpload('e-payment-qr-file', 'e-payment-qr-preview', 'e-payment-qr');

  // Bank
  const bankData = cardData.bank || {};
  document.getElementById('e-acc-num').value = bankData.accountNumber || '';
  document.getElementById('e-ifsc').value = bankData.ifsc || '';
  document.getElementById('e-bank-name').value = bankData.bankName || '';
  document.getElementById('e-holder-name').value = bankData.holderName || '';

  // Location
  const locationData = cardData.location || {};
  document.getElementById('e-map-link').value = locationData.mapLink || '';
  document.getElementById('e-address').value = locationData.address || '';

  // Social
  const socialDiv = document.getElementById('social-links');
  const socialData = cardData.social || {};
  function renderSocial() {
    socialDiv.innerHTML = '';
    for (const [platform, url] of Object.entries(socialData)) {
      const row = document.createElement('div');
      row.innerHTML = '<input type="text" class="social-platform" value="'+platform+'" placeholder="Platform"><input type="url" class="social-url" value="'+url+'" placeholder="URL"><button type="button" class="remove-social">X</button>';
      row.querySelector('.remove-social').onclick = () => { delete socialData[platform]; renderSocial(); };
      socialDiv.appendChild(row);
    }
  }
  renderSocial();
  document.getElementById('add-social').onclick = () => { const p = prompt('Platform name?'); if(p){ socialData[p]=''; renderSocial(); } };

  // Appointment Services
  var aptServicesData = cardData.servicesList || [];
  var aptServicesDiv = document.getElementById('services-list-apt');
  function renderAptServices(){
    aptServicesDiv.innerHTML = '';
    aptServicesData.forEach(function(s, i){
      var row = document.createElement('div');
      row.style.cssText = 'border:1px solid #e2e8f0;padding:10px;margin:8px 0;border-radius:10px;';
      row.innerHTML = '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:5px;"><input type="text" class="apt-svc-name" value="'+(s.name||'')+'" placeholder="Service Name" style="flex:2;padding:8px;border:1px solid #e2e8f0;border-radius:6px;"><input type="number" class="apt-svc-duration" value="'+(s.duration||'30')+'" placeholder="Min" style="flex:1;padding:8px;border:1px solid #e2e8f0;border-radius:6px;"><input type="text" class="apt-svc-price" value="'+(s.price||'')+'" placeholder="Price ₹" style="flex:1;padding:8px;border:1px solid #e2e8f0;border-radius:6px;"></div><button type="button" class="remove-apt-svc" style="background:#ef4444;color:#fff;border:none;padding:4px 10px;border-radius:4px;font-size:11px;">Remove</button>';
      row.querySelector('.remove-apt-svc').onclick = function(){ aptServicesData.splice(i,1); renderAptServices(); };
      aptServicesDiv.appendChild(row);
    });
  }
  renderAptServices();
  document.getElementById('add-service-apt').onclick = function(){ aptServicesData.push({name:'', duration:'30', price:''}); renderAptServices(); };

  // Section order
  const sectionList = document.getElementById('section-order');
  let currentOrder = cardData.sectionOrder || ['about', 'contact', 'social'];
  sectionList.innerHTML = '';
  currentOrder.forEach(sec => {
    const li = document.createElement('li');
    li.textContent = sec.charAt(0).toUpperCase() + sec.slice(1);
    li.setAttribute('data-section', sec);
    sectionList.appendChild(li);
  });
  new Sortable(sectionList, {
    animation: 150,
    onEnd: () => { currentOrder = Array.from(sectionList.querySelectorAll('li')).map(li => li.dataset.section); }
  });

  document.getElementById('editor-container').style.display = 'block';

  // Save
  document.getElementById('edit-form').onsubmit = async (e) => {
    e.preventDefault();
    const platformInputs = document.querySelectorAll('.social-platform');
    const urlInputs = document.querySelectorAll('.social-url');
    const newSocial = {};
    platformInputs.forEach((p, i) => { if (p.value.trim()) newSocial[p.value.trim()] = urlInputs[i].value.trim(); });

    const updates = {
      name: document.getElementById('e-name').value.trim(),
      title: document.getElementById('e-title').value.trim(),
      phone: document.getElementById('e-phone').value.trim(),
      email: document.getElementById('e-email').value.trim(),
      website: document.getElementById('e-website').value.trim(),
      about: document.getElementById('e-about').value.trim(),
      aboutImage: document.getElementById('e-about-img').value.trim(),
      aboutPdf: document.getElementById('e-about-pdf').value.trim(),
      profileImage: document.getElementById('e-img').value.trim(),
      profileStyle: document.getElementById('e-profile-style').value,
      qrImage: document.getElementById('e-qr').value.trim(),
      theme: document.getElementById('e-theme').value,
      calendarUrl: document.getElementById('e-calendar').value.trim(),
      social: newSocial,
      products: (function(){ var r=[]; var rows=productsDiv.children; for(var i=0;i<rows.length;i++){ r.push({name:rows[i].querySelector('.prod-name')?.value?.trim()||'', sellingPrice:rows[i].querySelector('.prod-selling')?.value?.trim()||'', actualPrice:rows[i].querySelector('.prod-actual')?.value?.trim()||'', image:rows[i].querySelector('.prod-img-url')?.value?.trim()||''}); } return r; })(),
      services: (function(){ var r=[]; var rows=servicesDiv.children; for(var i=0;i<rows.length;i++){ r.push({title:rows[i].querySelector('.serv-title')?.value?.trim()||'', image:rows[i].querySelector('.serv-img-url')?.value?.trim()||''}); } return r; })(),
      gallery: (function(){ var r=[]; var rows=galleryDiv.children; for(var i=0;i<rows.length;i++){ var u=rows[i].querySelector('.gal-img-url'); if(u&&u.value.trim()) r.push(u.value.trim()); } return r; })(),
      youtube: (function(){ var r=[]; var rows=youtubeDiv.children; for(var i=0;i<rows.length;i++){ var u=rows[i].querySelector('.yt-url'); if(u&&u.value.trim()) r.push(u.value.trim()); } return r; })(),
      reels: (function(){ var r=[]; var rows=reelsDiv.children; for(var i=0;i<rows.length;i++){ var u=rows[i].querySelector('.reel-url'); if(u&&u.value.trim()) r.push(u.value.trim()); } return r; })(),
      payment: { paytm: document.getElementById('e-paytm').value.trim(), upi: document.getElementById('e-upi').value.trim(), qrImage: document.getElementById('e-payment-qr').value.trim() },
      bank: { accountNumber: document.getElementById('e-acc-num').value.trim(), ifsc: document.getElementById('e-ifsc').value.trim(), bankName: document.getElementById('e-bank-name').value.trim(), holderName: document.getElementById('e-holder-name').value.trim() },
      location: { mapLink: document.getElementById('e-map-link').value.trim(), address: document.getElementById('e-address').value.trim() },
      servicesList: (function(){ var r=[]; var rows=aptServicesDiv.children; for(var i=0;i<rows.length;i++){ r.push({name:rows[i].querySelector('.apt-svc-name')?.value?.trim()||'', duration:rows[i].querySelector('.apt-svc-duration')?.value?.trim()||'30', price:rows[i].querySelector('.apt-svc-price')?.value?.trim()||''}); } return r; })(),
      sectionOrder: currentOrder
    };

    try {
      const cardRef = db.collection('cards').doc(slug);
      const cardSnap = await cardRef.get();
      if (cardSnap.data().editToken !== token) { alert('❌ Unauthorized!'); return; }
      await cardRef.update(updates);
      alert('✅ Saved Successfully!');
      document.getElementById('publish-link').innerHTML = '<p>Your Public Card: <a href="index.html?id='+slug+'" target="_blank">Click Here</a></p>';
      document.getElementById('publish-link').style.display = 'block';
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };
})();
