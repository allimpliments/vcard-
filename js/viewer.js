// Firebase SDK से db पहले ही firebase-config.js में बन चुका है

const params = new URLSearchParams(window.location.search);
const slug = params.get('id');

console.log('Slug from URL:', slug);

if (!slug) {
  document.getElementById('error').style.display = 'block';
  document.getElementById('loader').style.display = 'none';
} else {
  console.log('Firestore se data fetch kar rahe hain...');
  
  db.collection('cards').doc(slug).get()
    .then((docSnap) => {
      console.log('Document exists:', docSnap.exists);
      
      if (!docSnap.exists) {
        console.log('Document nahi mila');
        document.getElementById('loader').style.display = 'none';
        document.getElementById('error').style.display = 'block';
        return;
      }

      const data = docSnap.data();
      console.log('Data mila:', data);

      // Theme apply karo
      document.body.className = data.theme || 'default';
      
      // Loader hide, card show
      document.getElementById('loader').style.display = 'none';
      document.getElementById('card-container').style.display = 'block';

      // Lottie animation
      const anim = document.getElementById('main-anim');
      if (anim && data.animation) {
        anim.setAttribute('src', 'assets/lottie/' + data.animation + '.json');
      }

      // Profile image
      const img = document.getElementById('profile-img');
      if (img) {
        img.src = data.profileImage || 'assets/default-user.png';
      }

      // Name and Title
      const nameEl = document.getElementById('name');
      const titleEl = document.getElementById('title');
      if (nameEl) nameEl.textContent = data.name || '';
      if (titleEl) titleEl.textContent = data.title || '';

      // Sections
      const container = document.getElementById('sections-container');
      if (!container) return;

      const order = data.sectionOrder || ['about', 'contact', 'social'];

      for (let i = 0; i < order.length; i++) {
        const sec = order[i];
        const div = document.createElement('div');

        if (sec === 'about' && data.about) {
          div.innerHTML = '<h3>About</h3><p>' + data.about + '</p>';
        } 
        else if (sec === 'contact') {
          div.innerHTML = '<h3>Contact</h3>' +
            '<p>📞 ' + (data.phone || '-') + '</p>' +
            '<p>✉️ ' + (data.email || '-') + '</p>' +
            '<p>🌐 <a href="' + (data.website || '#') + '">' + (data.website || '-') + '</a></p>';
        } 
        else if (sec === 'social' && data.social) {
          div.innerHTML = '<h3>Social</h3><div class="social-icons"></div>';
          const iconsDiv = div.querySelector('.social-icons');
          
          const platforms = Object.keys(data.social);
          for (let j = 0; j < platforms.length; j++) {
            const platform = platforms[j];
            const url = data.social[platform];
            if (url) {
              iconsDiv.innerHTML += '<a href="' + url + '" target="_blank">' + platform + '</a> ';
            }
          }
        }

        container.appendChild(div);
      }

      // QR Code
      const qrBox = document.getElementById('qr-box');
      if (qrBox && typeof QRCode !== 'undefined') {
        new QRCode(qrBox, {
          text: window.location.href,
          width: 100,
          height: 100
        });
      }

      console.log('✅ Card successfully displayed!');
    })
    .catch((error) => {
      console.error('❌ Firestore Error:', error);
      document.getElementById('loader').style.display = 'none';
      document.getElementById('error').style.display = 'block';
    });
}
