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

      document.body.className = data.theme || 'default';
      document.getElementById('loader').style.display = 'none';
      document.getElementById('card-container').style.display = 'block';

      // Lottie animation with bodymovin
      const animContainer = document.getElementById('main-anim');
      if (animContainer && typeof lottie !== 'undefined') {
        const animName = data.animation || 'wave';
        const animPath = 'assets/lottie/' + animName + '.json';
        console.log('Lottie path:', animPath);
        lottie.loadAnimation({
          container: animContainer,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          path: animPath
        });
        console.log('✅ Lottie animation started!');
      } else {
        console.log('❌ Lottie container or library not found');
      }
            // Action Buttons
      const btnCall = document.getElementById('btn-call');
      const btnEmail = document.getElementById('btn-email');
      const btnWhatsapp = document.getElementById('btn-whatsapp');
      
      if (data.phone) {
        btnCall.href = 'tel:' + data.phone;
      } else {
        btnCall.style.display = 'none';
      }
      
      if (data.email) {
        btnEmail.href = 'mailto:' + data.email;
      } else {
        btnEmail.style.display = 'none';
      }
      
      if (data.phone) {
        btnWhatsapp.href = 'https://wa.me/' + data.phone.replace(/[^0-9]/g, '');
      } else {
        btnWhatsapp.style.display = 'none';
      }
      document.getElementById('profile-img').src = data.profileImage || 'assets/default-user.png';
      document.getElementById('name').textContent = data.name || '';
      document.getElementById('title').textContent = data.title || '';

      const container = document.getElementById('sections-container');
      container.innerHTML = '';
      
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
            const platform = platforms[j].toLowerCase();
            const url = data.social[platforms[j]];
            if (url) {
              let iconClass = 'fa-globe';
              if (platform.includes('whatsapp')) iconClass = 'fa-whatsapp';
              else if (platform.includes('instagram')) iconClass = 'fa-instagram';
              else if (platform.includes('facebook')) iconClass = 'fa-facebook';
              else if (platform.includes('youtube')) iconClass = 'fa-youtube';
              else if (platform.includes('linkedin')) iconClass = 'fa-linkedin';
              else if (platform.includes('twitter') || platform.includes('x')) iconClass = 'fa-x-twitter';
              else if (platform.includes('telegram')) iconClass = 'fa-telegram';
              else if (platform.includes('snapchat')) iconClass = 'fa-snapchat';
              else if (platform.includes('pinterest')) iconClass = 'fa-pinterest';
              
              iconsDiv.innerHTML += '<a href="' + url + '" target="_blank" class="fa-brands ' + iconClass + '"></a>';
            }
          }
        }

        container.appendChild(div);
      }

      // QR Code Section
      const qrImage = document.getElementById('qr-image');
      const qrBox = document.getElementById('qr-box');
      const cardUrlText = document.getElementById('card-url-text');
      const currentUrl = window.location.href;
      
      cardUrlText.textContent = currentUrl;

      // Check if user uploaded a QR image
      if (data.qrImage && data.qrImage.trim() !== '') {
        qrImage.src = data.qrImage;
        qrImage.style.display = 'block';
      } else if (qrBox && typeof QRCode !== 'undefined') {
        // Generate QR code
        new QRCode(qrBox, {
          text: currentUrl,
          width: 200,
          height: 200
        });
      }

      // Copy URL Button
      document.getElementById('btn-copy-url').addEventListener('click', function() {
        navigator.clipboard.writeText(currentUrl).then(function() {
          alert('✅ URL कॉपी हो गया!');
        }).catch(function() {
          prompt('URL को कॉपी करें:', currentUrl);
        });
      });
      // Share Button
      document.getElementById('btn-share').addEventListener('click', function() {
        const url = window.location.href;
        const text = data.name + ' - ' + (data.title || '') + ' - Digital vCard';
        if (navigator.share) {
          navigator.share({ title: text, text: text, url: url }).catch(() => {});
        } else {
          navigator.clipboard.writeText(url).then(function() {
            alert('🔗 लिंक कॉपी हो गया! अब WhatsApp या कहीं भी पेस्ट करें।');
          });
        }
      });

      // PDF Button
      document.getElementById('btn-pdf').addEventListener('click', function() {
        window.print();
      });

      // Save Contact Button
      document.getElementById('save-contact').addEventListener('click', function() {
        let vcf = 'BEGIN:VCARD\nVERSION:3.0\n';
        vcf += 'FN:' + (data.name || '') + '\n';
        vcf += 'TITLE:' + (data.title || '') + '\n';
        vcf += 'TEL:' + (data.phone || '') + '\n';
        vcf += 'EMAIL:' + (data.email || '') + '\n';
        vcf += 'URL:' + (data.website || '') + '\n';
        vcf += 'END:VCARD';
        const blob = new Blob([vcf], { type: 'text/vcard' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = (data.name || 'contact') + '.vcf';
        link.click();
      });
      console.log('✅ Card successfully displayed!');
    })
    .catch((error) => {
      console.error('❌ Firestore Error:', error);
      document.getElementById('loader').style.display = 'none';
      document.getElementById('error').style.display = 'block';
    });
}
