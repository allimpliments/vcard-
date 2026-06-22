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
        return;ab
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
      const profileImg = document.getElementById('profile-img');
if (data.profileImage && data.profileImage.trim() !== '') {
  profileImg.src = data.profileImage;
} else {
  profileImg.src = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="#e2e8f0"/><text x="60" y="65" text-anchor="middle" font-size="40" fill="#94a3b8">👤</text></svg>');
}
      document.getElementById('name').textContent = data.name || '';
      document.getElementById('title').textContent = data.title || '';

      const container = document.getElementById('sections-container');
      container.innerHTML = '';
      
      const order = data.sectionOrder || ['about', 'contact', 'social'];

      for (let i = 0; i < order.length; i++) {
        const sec = order[i];
        const div = document.createElement('div');

        if (sec === 'about' && data.about) {
          let aboutHTML = '<h3>About Us</h3>';
          
          // About Image (agar ho)
          if (data.aboutImage && data.aboutImage.trim() !== '') {
            aboutHTML += '<div style="text-align: center; margin-bottom: 15px;">';
            aboutHTML += '<img src="' + data.aboutImage + '" alt="About" style="max-width: 200px; max-height: 200px; border-radius: 15px; object-fit: cover; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">';
            aboutHTML += '</div>';
          }
          
          // About Text
          aboutHTML += '<p style="font-size: 14px; line-height: 1.7; color: var(--text-secondary); text-align: center; margin-bottom: 15px;">' + data.about + '</p>';
          
          // PDF Download Button (agar PDF link ho)
          if (data.aboutPdf && data.aboutPdf.trim() !== '') {
            aboutHTML += '<div style="text-align: center;">';
            aboutHTML += '<a href="' + data.aboutPdf + '" target="_blank" style="display: inline-block; padding: 12px 25px; background: #ef4444; color: #fff; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 15px rgba(239,68,68,0.3); transition: all 0.3s ease;" onmouseover="this.style.background=\'#dc2626\'; this.style.transform=\'translateY(-2px)\';" onmouseout="this.style.background=\'#ef4444\'; this.style.transform=\'translateY(0)\';">📥 Download PDF</a>';
            aboutHTML += '</div>';
          }
          
          div.innerHTML = aboutHTML;
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
                else if (sec === 'products' && data.products && data.products.length > 0) {
          let prodHTML = '<h3>🛍️ Online Shop</h3><div style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: center;">';
          
          for (let k = 0; k < data.products.length; k++) {
            const p = data.products[k];
            const phone = data.phone ? data.phone.replace(/[^0-9]/g, '') : '';
            const waLink = phone ? 'https://wa.me/' + phone + '?text=I%20am%20interested%20in%20' + encodeURIComponent(p.name) + '%20Price:%20' + p.sellingPrice : '#';
            
            prodHTML += '<div style="width: 140px; background: var(--card-bg-secondary); border-radius: var(--radius-sm); padding: 12px; text-align: center; box-shadow: var(--shadow-sm);">';
            
            // Product Image
            if (p.image) {
              prodHTML += '<img src="' + p.image + '" alt="' + p.name + '" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;">';
            }
            
            // Product Name
            prodHTML += '<p style="font-weight: 600; font-size: 13px; margin: 5px 0;">' + p.name + '</p>';
            
            // Prices
            if (p.actualPrice) {
              prodHTML += '<p style="text-decoration: line-through; color: #ef4444; font-size: 12px; margin: 2px 0;">₹' + p.actualPrice + '</p>';
            }
            prodHTML += '<p style="font-weight: 700; color: var(--primary); font-size: 16px; margin: 2px 0;">₹' + p.sellingPrice + '</p>';
            
            // WhatsApp Button
            prodHTML += '<a href="' + waLink + '" target="_blank" style="display: inline-block; width: 30px; height: 30px; background: #25d366; color: #fff; border-radius: 50%; text-decoration: none; font-size: 16px; line-height: 30px; margin: 3px;">💬</a>';
            
            // Quantity + Add to Cart
            prodHTML += '<div style="margin-top: 6px;"><input type="number" min="1" value="1" id="qty-' + k + '" style="width: 45px; padding: 3px; border: 1px solid var(--border); border-radius: 5px; text-align: center; font-size: 12px;">';
            prodHTML += '<button onclick="addToCart(\'' + p.name + '\', \'' + p.sellingPrice + '\', \'' + (p.image || '') + '\')" style="margin-left: 4px; padding: 4px 8px; background: var(--accent); color: #fff; border: none; border-radius: 5px; font-size: 11px; cursor: pointer;">Add to Cart</button></div>';
            
            prodHTML += '</div>';
          }
          
          prodHTML += '</div>';
          div.innerHTML = prodHTML;
        }
                else if (sec === 'services' && data.services && data.services.length > 0) {
          let servHTML = '<h3>📦 Products & Services</h3><div style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: center;">';
          
          for (let k = 0; k < data.services.length; k++) {
            const s = data.services[k];
            const phone = data.phone ? data.phone.replace(/[^0-9]/g, '') : '';
            const waLink = phone ? 'https://wa.me/' + phone + '?text=Hi,%20I%20am%20interested%20in%20' + encodeURIComponent(s.title) : '#';
            
            servHTML += '<div style="width: 140px; background: var(--card-bg-secondary); border-radius: var(--radius-sm); padding: 12px; text-align: center; box-shadow: var(--shadow-sm);">';
            
            if (s.image) {
              servHTML += '<img src="' + s.image + '" alt="' + s.title + '" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;">';
            }
            
            servHTML += '<p style="font-weight: 600; font-size: 13px; margin: 5px 0;">' + s.title + '</p>';
            
            servHTML += '<a href="' + waLink + '" target="_blank" style="display: inline-block; padding: 8px 16px; background: #25d366; color: #fff; text-decoration: none; border-radius: 50px; font-size: 12px; font-weight: 600;">Enquiry Now</a>';
            
            servHTML += '</div>';
          }
          
          servHTML += '</div>';
          div.innerHTML = servHTML;
        }
        else if (sec === 'gallery' && data.gallery && data.gallery.length > 0) {
          let currentIndex = 0;
          const images = data.gallery;
          
          let galHTML = '<h3>🖼️ Gallery</h3>';
          
          // Main large image
          galHTML += '<div style="position: relative; text-align: center; margin-bottom: 10px;">';
          galHTML += '<img id="gallery-main" src="' + images[0] + '" alt="Gallery" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 15px; box-shadow: var(--shadow-sm); cursor: pointer;" onclick="window.open(\'' + images[0] + '\', \'_blank\')">';
          
          // Navigation arrows
          if (images.length > 1) {
            galHTML += '<button id="gal-prev" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: #fff; border: none; border-radius: 50%; width: 35px; height: 35px; font-size: 18px; cursor: pointer;">◀</button>';
            galHTML += '<button id="gal-next" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: #fff; border: none; border-radius: 50%; width: 35px; height: 35px; font-size: 18px; cursor: pointer;">▶</button>';
          }
          galHTML += '</div>';
          
          // Thumbnail dots
          if (images.length > 1) {
            galHTML += '<div id="gal-dots" style="text-align: center; margin-bottom: 10px;">';
            for (let d = 0; d < images.length; d++) {
              galHTML += '<span class="gal-dot" data-index="' + d + '" style="display: inline-block; width: 10px; height: 10px; background: ' + (d === 0 ? 'var(--primary)' : '#ccc') + '; border-radius: 50%; margin: 0 4px; cursor: pointer;"></span>';
            }
            galHTML += '</div>';
          }
          
          div.innerHTML = galHTML;
          
          // Gallery slider logic
          if (images.length > 1) {
            const mainImg = document.getElementById('gallery-main');
            const dots = document.querySelectorAll('.gal-dot');
            
            function updateGallery(index) {
              currentIndex = index;
              mainImg.src = images[currentIndex];
              mainImg.onclick = function() { window.open(images[currentIndex], '_blank'); };
              dots.forEach((dot, i) => {
                dot.style.background = i === currentIndex ? 'var(--primary)' : '#ccc';
              });
            }
            
            document.getElementById('gal-next').onclick = () => {
              updateGallery((currentIndex + 1) % images.length);
            };
            document.getElementById('gal-prev').onclick = () => {
              updateGallery((currentIndex - 1 + images.length) % images.length);
            };
            
            dots.forEach(dot => {
              dot.onclick = function() {
                updateGallery(parseInt(this.dataset.index));
              };
            });
            
            // Auto scroll every 3 seconds
            setInterval(() => {
              updateGallery((currentIndex + 1) % images.length);
            }, 3000);
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
