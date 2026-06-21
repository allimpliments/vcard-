// Helper: Resize image to max 300px and return base64
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
        const maxSize = 300;

        if (w > maxSize) {
          h = (h * maxSize) / w;
          w = maxSize;
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        const resized = canvas.toDataURL('image/jpeg', 0.6);
        urlInput.value = resized;
        preview.src = resized;
        preview.style.display = 'block';
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  // URL input change preview
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
  document.getElementById('e-qr').value = cardData.qrImage || '';
  document.getElementById('e-theme').value = cardData.theme || 'default';

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

  // Setup all image uploads
  setupImageUpload('e-img-file', 'e-img-preview', 'e-img');
  setupImageUpload('e-about-img-file', 'e-about-img-preview', 'e-about-img');
  setupImageUpload('e-qr-file', 'e-qr-preview', 'e-qr');

  // Social links
  const socialDiv = document.getElementById('social-links');
  const socialData = cardData.social || {};
  function renderSocial() {
    socialDiv.innerHTML = '';
    for (const [platform, url] of Object.entries(socialData)) {
      const row = document.createElement('div');
      row.innerHTML = `<input type="text" class="social-platform" value="${platform}" placeholder="Platform"> 
                       <input type="url" class="social-url" value="${url}" placeholder="URL">
                       <button type="button" class="remove-social">X</button>`;
      row.querySelector('.remove-social').onclick = () => {
        delete socialData[platform];
        renderSocial();
      };
      socialDiv.appendChild(row);
    }
  }
  renderSocial();
  document.getElementById('add-social').onclick = () => {
    const p = prompt('Platform name? (जैसे: instagram, youtube, facebook)');
    if (p) { socialData[p] = ''; renderSocial(); }
  };

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
    onEnd: () => {
      currentOrder = Array.from(sectionList.querySelectorAll('li')).map(li => li.dataset.section);
    }
  });

  document.getElementById('editor-container').style.display = 'block';

  // Save
  document.getElementById('edit-form').onsubmit = async (e) => {
    e.preventDefault();
    const platformInputs = document.querySelectorAll('.social-platform');
    const urlInputs = document.querySelectorAll('.social-url');
    const newSocial = {};
    platformInputs.forEach((p, i) => {
      if (p.value.trim()) newSocial[p.value.trim()] = urlInputs[i].value.trim();
    });

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
      qrImage: document.getElementById('e-qr').value.trim(),
      theme: document.getElementById('e-theme').value,
      social: newSocial,
      sectionOrder: currentOrder
    };

    try {
      await docRef.update(updates);
      alert('✅ सफलतापूर्वक सेव हो गया!');
      document.getElementById('publish-link').innerHTML = `
        <p>आपका पब्लिक कार्ड: <a href="index.html?id=${slug}" target="_blank">यहाँ क्लिक करें</a></p>
      `;
      document.getElementById('publish-link').style.display = 'block';
    } catch (err) {
      alert('❌ कुछ गलत हुआ: ' + err.message);
    }
  };
})();
