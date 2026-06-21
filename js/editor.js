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
  // Token check
  if (cardData.editToken !== token) {
    document.getElementById('access-denied').style.display = 'block';
    return;
  }

  // Load data into form
  document.getElementById('e-name').value = cardData.name || '';
  document.getElementById('e-title').value = cardData.title || '';
  document.getElementById('e-phone').value = cardData.phone || '';
  document.getElementById('e-email').value = cardData.email || '';
  document.getElementById('e-website').value = cardData.website || '';
  document.getElementById('e-about').value = cardData.about || '';
  document.getElementById('e-img').value = cardData.profileImage || '';
  document.getElementById('e-qr').value = cardData.qrImage || '';
  document.getElementById('e-theme').value = cardData.theme || 'default';

  // Social links dynamic list
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
    const p = prompt('Platform name?');
    if (p) { socialData[p] = ''; renderSocial(); }
  };

  // Section order
  const sectionList = document.getElementById('section-order');
  let currentOrder = cardData.sectionOrder || ['about','contact','social'];
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
    // Gather social data from inputs
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
      profileImage: document.getElementById('e-img').value.trim(),
      qrImage: document.getElementById('e-qr').value.trim(),
      theme: document.getElementById('e-theme').value,
      social: newSocial,
      sectionOrder: currentOrder
    };

    try {
      await docRef.update(updates);
      alert('✅ सफलतापूर्वक सेव हो गया!');
      // Show public link
      document.getElementById('publish-link').innerHTML = `
        <p>आपका पब्लिक कार्ड: <a href="index.html?id=${slug}">यहाँ क्लिक करें</a></p>
      `;
      document.getElementById('publish-link').style.display = 'block';
    } catch (err) {
      alert('❌ कुछ गलत हुआ: ' + err.message);
    }
  };
})();
