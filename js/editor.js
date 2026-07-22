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

// ========== SHOW SAVE POPUP ==========
function showSavePopup(message, isError) {
  var popup = document.createElement('div');
  popup.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);padding:16px 30px;border-radius:12px;font-weight:700;font-size:16px;z-index:9999;text-align:center;min-width:300px;box-shadow:0 10px 40px rgba(0,0,0,0.2);animation:fadeInOut 2.5s forwards;';
  popup.style.background = isError ? '#fee2e2' : '#d1fae5';
  popup.style.color = isError ? '#991b1b' : '#065f46';
  popup.textContent = message;
  document.body.appendChild(popup);
  
  setTimeout(function(){ popup.remove(); }, 2500);
}

// Add CSS animation
var styleTag = document.createElement('style');
styleTag.textContent = '@keyframes fadeInOut { 0%{opacity:0;top:10px} 15%{opacity:1;top:20px} 85%{opacity:1;top:20px} 100%{opacity:0;top:10px} }';
document.head.appendChild(styleTag);

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

  // Products - Data store karo render se pehle
  var productsData = JSON.parse(JSON.stringify(cardData.products || []));
  const productsDiv = document.getElementById('products-list');
  
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
  var servicesData = JSON.parse(JSON.stringify(cardData.services || []));
  const servicesDiv = document.getElementById('services-list');
  
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
  var galleryData = JSON.parse(JSON.stringify(cardData.gallery || []));
  const galleryDiv = document.getElementById('gallery-list');
  
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
  var youtubeData = JSON.parse(JSON.stringify(cardData.youtube || []));
  const youtubeDiv = document.getElementById('youtube-list');
  function renderYoutube() {
    youtubeDiv.innerHTML = '';
    youtubeData.forEach((url, i) => {
      const row = document.createElement('div');
      row.style.border = '1px solid #e2e8f0'; row.style.padding = '10px'; row.style.margin = '8px 0'; row.style.borderRadius = '10px';
      row.innerHTML = '<label>YouTube URL:</label><input type="url" class="yt-url" value="'+(url||'')+'" placeholder="https://youtube.com/watch?v=..." style="width:100%;"><button type="button" class="remove-yt" style="background:#ef4444;color:#fff;border:none;padding:6px 12px;border-radius:6px;margin-top:8px;">Remove</button>';
      row.querySelector('.remove-yt').onclick = () => { youtubeData.splice(i, 1); renderYoutube(); };
      youtubeDiv.appendChild(row);
    });
  }
  renderYoutube();
  document.getElementById('add-youtube').onclick = () => { youtubeData.push(''); renderYoutube(); };

  // Reels
  var reelsData = JSON.parse(JSON.stringify(cardData.reels || []));
  const reelsDiv = document.getElementById('reels-list');
  function renderReels() {
    reelsDiv.innerHTML = '';
    reelsData.forEach((url, i) => {
      const row = document.createElement('div');
      row.style.border = '1px solid #e2e8f0'; row.style.padding = '10px'; row.style.margin = '8px 0'; row.style.borderRadius = '10px';
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

  // Social - DEEP CLONE
  var socialData = JSON.parse(JSON.stringify(cardData.social || {}));
  const socialDiv = document.getElementById('social-links');
  
  function renderSocial() {
    socialDiv.innerHTML = '';
    var keys = Object.keys(socialData);
    for (var i = 0; i < keys.length; i++) {
      var platform = keys[i];
      var url = socialData[platform];
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;gap:8px;align-items:center;margin-bottom:8px;';
      row.innerHTML = '<input type="text" class="social-platform" value="'+platform+'" placeholder="Platform" style="flex:1;padding:8px;border:1px solid #e2e8f0;border-radius:6px;"><input type="url" class="social-url" value="'+url+'" placeholder="URL" style="flex:2;padding:8px;border:1px solid #e2e8f0;border-radius:6px;"><button type="button" class="remove-social" style="background:#ef4444;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;">X</button>';
      
      row.querySelector('.remove-social').onclick = function() {
        var currentPlatform = row.querySelector('.social-platform').value;
        delete socialData[currentPlatform];
        renderSocial();
      };
      
      socialDiv.appendChild(row);
    }
  }
  renderSocial();
    document.getElementById('add-social').onclick = function() {
    // Create custom input instead of prompt()
    var existingRow = document.getElementById('new-social-row');
    if (existingRow) {
      // Save current input if exists
      var platInput = existingRow.querySelector('.new-social-platform');
      var urlInput = existingRow.querySelector('.new-social-url');
      if (platInput && platInput.value.trim()) {
        var p = platInput.value.trim().toLowerCase();
        socialData[p] = urlInput ? urlInput.value.trim() : '';
        existingRow.remove();
        renderSocial();
        return;
      }
      existingRow.remove();
    }
    
    // Create new input row
    var row = document.createElement('div');
    row.id = 'new-social-row';
    row.style.cssText = 'display:flex;gap:8px;align-items:center;margin:10px 0;padding:10px;background:#f0fdf4;border-radius:8px;border:2px dashed #10b981;';
    row.innerHTML = '<input type="text" class="new-social-platform" placeholder="Platform (e.g. instagram)" style="flex:1;padding:10px;border:2px solid #10b981;border-radius:8px;font-size:14px;"><input type="url" class="new-social-url" placeholder="URL" style="flex:2;padding:10px;border:2px solid #10b981;border-radius:8px;font-size:14px;"><button type="button" id="save-new-social" style="background:#10b981;color:#fff;border:none;padding:10px 16px;border-radius:8px;cursor:pointer;font-weight:600;">✅ Add</button><button type="button" id="cancel-new-social" style="background:#ef4444;color:#fff;border:none;padding:10px 16px;border-radius:8px;cursor:pointer;font-weight:600;">✕</button>';
    
    socialDiv.insertBefore(row, socialDiv.firstChild);
    
    document.getElementById('save-new-social').onclick = function() {
      var plat = row.querySelector('.new-social-platform').value.trim().toLowerCase();
      var url = row.querySelector('.new-social-url').value.trim();
      if (plat) {
        if (socialData[plat]) {
          alert('This platform already exists!');
        } else {
          socialData[plat] = url;
          row.remove();
          renderSocial();
        }
      }
    };
    
    document.getElementById('cancel-new-social').onclick = function() {
      row.remove();
    };
    
    // Focus on platform input
    setTimeout(function(){ row.querySelector('.new-social-platform').focus(); }, 100);
  };

  // Appointment Services
  var aptServicesData = JSON.parse(JSON.stringify(cardData.servicesList || []));
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

  // Load existing bookings
  var bookingsData = cardData.bookings || [];
  var bookingsDiv = document.getElementById('bookings-list-apt');
  if (bookingsDiv && bookingsData.length > 0) {
    var bh = '<h4 style="margin-top:15px;color:#1e293b;font-size:14px;">📋 Recent Bookings</h4>';
    bookingsData.forEach(function(b, idx) {
      var badge = b.status === 'cancelled' ? 'color:#ef4444;' : 'color:#10b981;';
      var statusText = (b.status || 'confirmed').toUpperCase();
      bh += '<div style="background:#f8fafc;border-radius:8px;padding:10px;margin:5px 0;font-size:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">';
      bh += '<div style="flex:1;min-width:200px;">';
      bh += '<b>' + b.serviceName + '</b> - ' + b.date + ' at ' + b.time + '<br>';
      bh += '👤 ' + b.name + ' | 📞 ' + b.phone + ' | <span style="' + badge + '">' + statusText + '</span>';
      bh += '</div>';
      if (b.status !== 'cancelled') {
        bh += '<button onclick="cancelBooking(' + idx + ')" style="background:#ef4444;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;font-size:11px;white-space:nowrap;">❌ Cancel</button>';
      }
      bh += '</div>';
    });
    bookingsDiv.innerHTML = bh;
  }

  window.cancelBooking = async function(idx) {
    if (!confirm('Cancel this booking? The slot will become available.')) return;
    try {
      var cardRef = db.collection('cards').doc(slug);
      var doc = await cardRef.get();
      var bookings = doc.data().bookings || [];
      if (bookings[idx]) { bookings[idx].status = 'cancelled'; await cardRef.update({ bookings: bookings }); showSavePopup('✅ Booking Cancelled! Slot is now available.'); location.reload(); }
    } catch(e) { showSavePopup('❌ Error: ' + e.message, true); }
  };

  // Section order
  var DEFAULT_SECTION_ORDER = ["about", "contact", "social", "products", "services", "gallery", "youtube", "reels", "appointment", "payment", "bank", "feedback", "location", "contactform"];
  const sectionList = document.getElementById('section-order');
  let currentOrder = JSON.parse(JSON.stringify(cardData.sectionOrder || DEFAULT_SECTION_ORDER));
  
  DEFAULT_SECTION_ORDER.forEach(function(defSec) {
    if (currentOrder.indexOf(defSec) === -1) { currentOrder.push(defSec); }
  });
  
  sectionList.innerHTML = '';
  currentOrder.forEach(sec => {
    const li = document.createElement('li');
    li.textContent = sec.charAt(0).toUpperCase() + sec.slice(1);
    li.setAttribute('data-section', sec);
    sectionList.appendChild(li);
  });
  
  new Sortable(sectionList, { animation: 150, onEnd: () => { currentOrder = Array.from(sectionList.querySelectorAll('li')).map(li => li.dataset.section); } });
  document.getElementById('editor-container').style.display = 'block';

  // ========== SAVE ==========
  document.getElementById('edit-form').onsubmit = async (e) => {
    e.preventDefault();
    
    // Social data from form
    var newSocial = {};
    var platformInputs = document.querySelectorAll('.social-platform');
    var urlInputs = document.querySelectorAll('.social-url');
    for (var i = 0; i < platformInputs.length; i++) {
      var plat = platformInputs[i].value.trim();
      var url = urlInputs[i].value.trim();
      if (plat) { newSocial[plat] = url; }
    }

    var finalOrder = JSON.parse(JSON.stringify(currentOrder));
    DEFAULT_SECTION_ORDER.forEach(function(defSec) {
      if (finalOrder.indexOf(defSec) === -1) { finalOrder.push(defSec); }
    });

    // Collect data from DOM
    var prodRows = productsDiv.children;
    var prodData = [];
    for (var i = 0; i < prodRows.length; i++) {
      prodData.push({
        name: prodRows[i].querySelector('.prod-name')?.value?.trim() || '',
        sellingPrice: prodRows[i].querySelector('.prod-selling')?.value?.trim() || '',
        actualPrice: prodRows[i].querySelector('.prod-actual')?.value?.trim() || '',
        image: prodRows[i].querySelector('.prod-img-url')?.value?.trim() || ''
      });
    }

    var servRows = servicesDiv.children;
    var servData = [];
    for (var i = 0; i < servRows.length; i++) {
      servData.push({
        title: servRows[i].querySelector('.serv-title')?.value?.trim() || '',
        image: servRows[i].querySelector('.serv-img-url')?.value?.trim() || ''
      });
    }

    var galRows = galleryDiv.children;
    var galData = [];
    for (var i = 0; i < galRows.length; i++) {
      var u = galRows[i].querySelector('.gal-img-url');
      if (u && u.value.trim()) galData.push(u.value.trim());
    }

    var ytRows = youtubeDiv.children;
    var ytData = [];
    for (var i = 0; i < ytRows.length; i++) {
      var u = ytRows[i].querySelector('.yt-url');
      if (u && u.value.trim()) ytData.push(u.value.trim());
    }

    var reelRows = reelsDiv.children;
    var reelData = [];
    for (var i = 0; i < reelRows.length; i++) {
      var u = reelRows[i].querySelector('.reel-url');
      if (u && u.value.trim()) reelData.push(u.value.trim());
    }

    var aptRows = aptServicesDiv.children;
    var aptData = [];
    for (var i = 0; i < aptRows.length; i++) {
      aptData.push({
        name: aptRows[i].querySelector('.apt-svc-name')?.value?.trim() || '',
        duration: aptRows[i].querySelector('.apt-svc-duration')?.value?.trim() || '30',
        price: aptRows[i].querySelector('.apt-svc-price')?.value?.trim() || ''
      });
    }

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
      products: prodData,
      services: servData,
      gallery: galData,
      youtube: ytData,
      reels: reelData,
      payment: { paytm: document.getElementById('e-paytm').value.trim(), upi: document.getElementById('e-upi').value.trim(), qrImage: document.getElementById('e-payment-qr').value.trim() },
      bank: { accountNumber: document.getElementById('e-acc-num').value.trim(), ifsc: document.getElementById('e-ifsc').value.trim(), bankName: document.getElementById('e-bank-name').value.trim(), holderName: document.getElementById('e-holder-name').value.trim() },
      location: { mapLink: document.getElementById('e-map-link').value.trim(), address: document.getElementById('e-address').value.trim() },
      servicesList: aptData,
      sectionOrder: finalOrder
    };

    try {
      const cardRef = db.collection('cards').doc(slug);
      const cardSnap = await cardRef.get();
      if (cardSnap.data().editToken !== token) { showSavePopup('❌ Unauthorized! Invalid token.', true); return; }
      await cardRef.update(updates);
      showSavePopup('✅ Saved & Published Successfully!');
      document.getElementById('publish-link').innerHTML = '<p>Your Public Card: <a href="index.html?id='+slug+'" target="_blank">Click Here</a></p>';
      document.getElementById('publish-link').style.display = 'block';
    } catch (err) {
      showSavePopup('❌ Error: ' + err.message, true);
    }
  };
})();
