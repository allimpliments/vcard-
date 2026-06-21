(async () => {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('id');
  if (!slug) {
    document.getElementById('error').style.display = 'block';
    document.getElementById('loader').style.display = 'none';
    return;
  }

  try {
    const docSnap = await db.collection('cards').doc(slug).get();
    if (!docSnap.exists) throw new Error('Card not found');

    const data = docSnap.data();
    document.body.className = data.theme || 'default';
    document.getElementById('loader').style.display = 'none';
    document.getElementById('card-container').style.display = 'block';

    // Lottie animation
    const anim = document.getElementById('main-anim');
    anim.setAttribute('src', `assets/lottie/${data.animation || 'wave'}.json`);

    document.getElementById('profile-img').src = data.profileImage || 'assets/default-user.png';
    document.getElementById('name').textContent = data.name;
    document.getElementById('title').textContent = data.title;

    const container = document.getElementById('sections-container');
    const order = data.sectionOrder || ['about','contact','social'];

    for (const sec of order) {
      const div = document.createElement('div');
      if (sec === 'about' && data.about) div.innerHTML = `<h3>About</h3><p>${data.about}</p>`;
      else if (sec === 'contact') {
        div.innerHTML = `<h3>Contact</h3>
          <p>📞 ${data.phone || '-'}</p>
          <p>✉️ ${data.email || '-'}</p>
          <p>🌐 <a href="${data.website || '#'}">${data.website || '-'}</a></p>`;
      } else if (sec === 'social' && data.social) {
        div.innerHTML = '<h3>Social</h3><div class="social-icons"></div>';
        const icons = div.querySelector('.social-icons');
        for (const [platform, url] of Object.entries(data.social)) {
          if (url) icons.innerHTML += `<a href="${url}">${platform}</a> `;
        }
      }
      container.appendChild(div);
    }

    // QR
    new QRCode(document.getElementById('qr-box'), {
      text: window.location.href,
      width: 100, height: 100
    });
  } catch (err) {
    console.error(err);
    document.getElementById('loader').style.display = 'none';
    document.getElementById('error').style.display = 'block';
  }
})();