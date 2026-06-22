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

      // Lottie animation
      const animContainer = document.getElementById('main-anim');
      if (animContainer && typeof lottie !== 'undefined') {
        const animName = data.animation || 'wave';
        const animPath = 'assets/lottie/' + animName + '.json';
        lottie.loadAnimation({
          container: animContainer,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          path: animPath
        });
      }

      // Action Buttons
      const btnCall = document.getElementById('btn-call');
      const btnEmail = document.getElementById('btn-email');
      const btnWhatsapp = document.getElementById('btn-whatsapp');
      if (btnCall) {
        if (data.phone) btnCall.href = 'tel:' + data.phone;
        else btnCall.style.display = 'none';
      }
      if (btnEmail) {
        if (data.email) btnEmail.href = 'mailto:' + data.email;
        else btnEmail.style.display = 'none';
      }
      if (btnWhatsapp) {
        if (data.phone) btnWhatsapp.href = 'https://wa.me/' + data.phone.replace(/[^0-9]/g, '');
        else btnWhatsapp.style.display = 'none';
      }

      // Profile Image
      const profileImg = document.getElementById('profile-img');
      if (profileImg) {
        if (data.profileImage && data.profileImage.trim() !== '') {
          profileImg.src = data.profileImage;
        } else {
          profileImg.src = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="#e2e8f0"/><text x="60" y="65" text-anchor="middle" font-size="40" fill="#94a3b8">👤</text></svg>');
        }
      }

      document.getElementById('name').textContent = data.name || '';
      document.getElementById('title').textContent = data.title || '';

      const container = document.getElementById('sections-container');
      container.innerHTML = '';
      const order = data.sectionOrder || ['about', 'contact', 'social'];

      for (let i = 0; i < order.length; i++) {
        const sec = order[i];
        const div = document.createElement('div');

        // ABOUT
        if (sec === 'about' && data.about) {
          let h = '<h3>About Us</h3>';
          if (data.aboutImage && data.aboutImage.trim() !== '') {
            h += '<div style="text-align:center;margin-bottom:15px;"><img src="' + data.aboutImage + '" style="max-width:200px;max-height:200px;border-radius:15px;object-fit:cover;box-shadow:0 4px 15px rgba(0,0,0,0.1);"></div>';
          }
          h += '<p style="font-size:14px;line-height:1.7;color:var(--text-secondary);text-align:center;margin-bottom:15px;">' + data.about + '</p>';
          if (data.aboutPdf && data.aboutPdf.trim() !== '') {
            h += '<div style="text-align:center;"><a href="' + data.aboutPdf + '" target="_blank" style="display:inline-block;padding:12px 25px;background:#ef4444;color:#fff;text-decoration:none;border-radius:50px;font-weight:600;font-size:14px;">📥 Download PDF</a></div>';
          }
          div.innerHTML = h;
        }

        // CONTACT
        else if (sec === 'contact') {
          div.innerHTML = '<h3>Contact</h3><p>📞 ' + (data.phone || '-') + '</p><p>✉️ ' + (data.email || '-') + '</p><p>🌐 <a href="' + (data.website || '#') + '">' + (data.website || '-') + '</a></p>';
        }

        // SOCIAL
        else if (sec === 'social' && data.social) {
          div.innerHTML = '<h3>Social</h3><div class="social-icons"></div>';
          const iconsDiv = div.querySelector('.social-icons');
          const platforms = Object.keys(data.social);
          for (let j = 0; j < platforms.length; j++) {
            const p = platforms[j].toLowerCase();
            const url = data.social[platforms[j]];
            if (url) {
              let cls = 'fa-globe';
              if (p.includes('whatsapp')) cls = 'fa-whatsapp';
              else if (p.includes('instagram')) cls = 'fa-instagram';
              else if (p.includes('facebook')) cls = 'fa-facebook';
              else if (p.includes('youtube')) cls = 'fa-youtube';
              else if (p.includes('linkedin')) cls = 'fa-linkedin';
              else if (p.includes('twitter') || p.includes('x')) cls = 'fa-x-twitter';
              else if (p.includes('telegram')) cls = 'fa-telegram';
              else if (p.includes('snapchat')) cls = 'fa-snapchat';
              else if (p.includes('pinterest')) cls = 'fa-pinterest';
              iconsDiv.innerHTML += '<a href="' + url + '" target="_blank" class="fa-brands ' + cls + '"></a>';
            }
          }
        }

        // PRODUCTS
        else if (sec === 'products' && data.products && data.products.length > 0) {
          let h = '<h3>🛍️ Online Shop</h3><div style="display:flex;flex-wrap:wrap;gap:15px;justify-content:center;">';
          for (let k = 0; k < data.products.length; k++) {
            const p = data.products[k];
            const phone = data.phone ? data.phone.replace(/[^0-9]/g, '') : '';
            const wa = phone ? 'https://wa.me/' + phone + '?text=I%20am%20interested%20in%20' + encodeURIComponent(p.name) + '%20Price:%20' + p.sellingPrice : '#';
            h += '<div style="width:140px;background:var(--card-bg-secondary);border-radius:var(--radius-sm);padding:12px;text-align:center;box-shadow:var(--shadow-sm);">';
            if (p.image) h += '<img src="' + p.image + '" style="width:100%;height:100px;object-fit:cover;border-radius:8px;margin-bottom:8px;">';
            h += '<p style="font-weight:600;font-size:13px;margin:5px 0;">' + p.name + '</p>';
            if (p.actualPrice) h += '<p style="text-decoration:line-through;color:#ef4444;font-size:12px;">₹' + p.actualPrice + '</p>';
            h += '<p style="font-weight:700;color:var(--primary);font-size:16px;">₹' + p.sellingPrice + '</p>';
            h += '<a href="' + wa + '" target="_blank" style="display:inline-block;width:30px;height:30px;background:#25d366;color:#fff;border-radius:50%;text-decoration:none;font-size:16px;line-height:30px;">💬</a>';
            h += '<div style="margin-top:6px;"><input type="number" min="1" value="1" style="width:45px;padding:3px;border:1px solid #ddd;border-radius:5px;text-align:center;font-size:12px;">';
            h += '<button onclick="addToCart(\'' + p.name + '\',\'' + p.sellingPrice + '\',\'' + (p.image || '') + '\')" style="margin-left:4px;padding:4px 8px;background:var(--accent);color:#fff;border:none;border-radius:5px;font-size:11px;cursor:pointer;">Add to Cart</button></div>';
            h += '</div>';
          }
          h += '</div>';
          div.innerHTML = h;
        }

        // SERVICES
        else if (sec === 'services' && data.services && data.services.length > 0) {
          let h = '<h3>📦 Products & Services</h3><div style="display:flex;flex-wrap:wrap;gap:15px;justify-content:center;">';
          for (let k = 0; k < data.services.length; k++) {
            const s = data.services[k];
            const phone = data.phone ? data.phone.replace(/[^0-9]/g, '') : '';
            const wa = phone ? 'https://wa.me/' + phone + '?text=Hi,%20I%20am%20interested%20in%20' + encodeURIComponent(s.title) : '#';
            h += '<div style="width:140px;background:var(--card-bg-secondary);border-radius:var(--radius-sm);padding:12px;text-align:center;box-shadow:var(--shadow-sm);">';
            if (s.image) h += '<img src="' + s.image + '" style="width:100%;height:100px;object-fit:cover;border-radius:8px;margin-bottom:8px;">';
            h += '<p style="font-weight:600;font-size:13px;">' + s.title + '</p>';
            h += '<a href="' + wa + '" target="_blank" style="display:inline-block;padding:8px 16px;background:#25d366;color:#fff;text-decoration:none;border-radius:50px;font-size:12px;font-weight:600;">Enquiry Now</a>';
            h += '</div>';
          }
          h += '</div>';
          div.innerHTML = h;
        }

        // GALLERY
        else if (sec === 'gallery' && data.gallery && data.gallery.length > 0) {
          const images = data.gallery;
          let cur = 0;
          let h = '<h3>🖼️ Gallery</h3>';
          h += '<div style="position:relative;text-align:center;margin-bottom:10px;">';
          h += '<img id="gallery-main" src="' + images[0] + '" style="width:100%;max-height:300px;object-fit:cover;border-radius:15px;box-shadow:var(--shadow-sm);cursor:pointer;">';
          if (images.length > 1) {
            h += '<button id="gal-prev" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.5);color:#fff;border:none;border-radius:50%;width:35px;height:35px;font-size:18px;cursor:pointer;z-index:5;">◀</button>';
            h += '<button id="gal-next" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.5);color:#fff;border:none;border-radius:50%;width:35px;height:35px;font-size:18px;cursor:pointer;z-index:5;">▶</button>';
          }
          h += '</div>';
          if (images.length > 1) {
            h += '<div id="gal-dots" style="text-align:center;margin-bottom:10px;">';
            for (let d = 0; d < images.length; d++) {
              h += '<span class="gal-dot" data-index="' + d + '" style="display:inline-block;width:10px;height:10px;background:' + (d === 0 ? 'var(--primary)' : '#ccc') + ';border-radius:50%;margin:0 4px;cursor:pointer;"></span>';
            }
            h += '</div>';
          }
          div.innerHTML = h;
          setTimeout(function() {
            const main = document.getElementById('gallery-main');
            const prev = document.getElementById('gal-prev');
            const next = document.getElementById('gal-next');
            const dots = document.querySelectorAll('.gal-dot');
            if (!main) return;
            main.onclick = function() { openLightbox(images, cur); };
            function upd(idx) {
              cur = idx;
              main.src = images[cur];
              dots.forEach(function(d, i) { d.style.background = i === cur ? 'var(--primary)' : '#ccc'; });
            }
            if (next) next.onclick = function() { upd((cur + 1) % images.length); };
            if (prev) prev.onclick = function() { upd((cur - 1 + images.length) % images.length); };
            dots.forEach(function(d) { d.onclick = function() { upd(parseInt(this.getAttribute('data-index'))); }; });
            if (images.length > 1) setInterval(function() { upd((cur + 1) % images.length); }, 3000);
          }, 100);
        }

        // YOUTUBE
        else if (sec === 'youtube' && data.youtube && data.youtube.length > 0) {
          const videos = [];
          for (let k = 0; k < data.youtube.length; k++) {
            const url = data.youtube[k];
            let id = '', isShort = false;
            if (url.includes('shorts/')) { id = url.split('shorts/')[1].split('?')[0]; isShort = true; }
            else if (url.includes('watch?v=')) id = url.split('v=')[1].split('&')[0];
            else if (url.includes('youtu.be/')) id = url.split('youtu.be/')[1].split('?')[0];
            else if (url.includes('embed/')) id = url.split('embed/')[1].split('?')[0];
            if (id) videos.push({ id, isShort, thumb: 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg' });
          }
          if (videos.length === 0) { container.appendChild(div); return; }
          let curV = 0;
          let h = '<h3>🎬 YouTube Videos</h3>';
          h += '<div style="text-align:center;margin-bottom:10px;">';
          h += '<div style="border-radius:15px;overflow:hidden;box-shadow:var(--shadow-sm);">';
          h += '<div id="yt-container" style="position:relative;padding-bottom:' + (videos[0].isShort ? '177%' : '56.25%') + ';height:0;">';
          h += '<iframe id="yt-main" src="https://www.youtube.com/embed/' + videos[0].id + '" style="position:absolute;top:0;left:0;width:100%;height:100%;border-radius:15px;" frameborder="0" allowfullscreen></iframe>';
          h += '</div></div></div>';
          if (videos.length > 1) {
            h += '<div style="display:flex;align-items:center;justify-content:center;gap:15px;margin-bottom:10px;">';
            h += '<button id="yt-prev" style="background:var(--primary);color:#fff;border:none;border-radius:50%;width:36px;height:36px;font-size:18px;cursor:pointer;">◀</button>';
            h += '<div style="display:flex;gap:8px;overflow-x:auto;max-width:250px;">';
            for (let t = 0; t < videos.length; t++) {
              h += '<img src="' + videos[t].thumb + '" class="yt-thumb" data-index="' + t + '" style="width:70px;height:50px;object-fit:cover;border-radius:8px;cursor:pointer;border:2px solid ' + (t === 0 ? 'var(--primary)' : 'transparent') + ';opacity:' + (t === 0 ? '1' : '0.6') + ';flex-shrink:0;">';
            }
            h += '</div>';
            h += '<button id="yt-next" style="background:var(--primary);color:#fff;border:none;border-radius:50%;width:36px;height:36px;font-size:18px;cursor:pointer;">▶</button>';
            h += '</div>';
          }
          div.innerHTML = h;
          if (videos.length > 1) {
            setTimeout(function() {
              const iframe = document.getElementById('yt-main');
              const container2 = document.getElementById('yt-container');
              const prev = document.getElementById('yt-prev');
              const next = document.getElementById('yt-next');
              const thumbs = document.querySelectorAll('.yt-thumb');
              if (!iframe) return;
              function updV(idx) {
                curV = idx;
                iframe.src = 'https://www.youtube.com/embed/' + videos[curV].id;
                container2.style.paddingBottom = videos[curV].isShort ? '177%' : '56.25%';
                thumbs.forEach(function(t, i) {
                  t.style.border = i === curV ? '2px solid var(--primary)' : '2px solid transparent';
                  t.style.opacity = i === curV ? '1' : '0.6';
                });
              }
              if (next) next.onclick = function() { updV((curV + 1) % videos.length); };
              if (prev) prev.onclick = function() { updV((curV - 1 + videos.length) % videos.length); };
              thumbs.forEach(function(t) { t.onclick = function() { updV(parseInt(this.getAttribute('data-index'))); }; });
            }, 100);
          }
        }
                else if (sec === 'reels' && data.reels && data.reels.length > 0) {
          const reels = data.reels;
          let curR = 0;
          function getInfo(url) {
            if (url.includes('instagram.com/reel/')) return { p:'Instagram', t:'Reel', g:'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', c:'#e4405f', i:'📽️' };
            if (url.includes('instagram.com/p/')) return { p:'Instagram', t:'Post', g:'linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)', c:'#c13584', i:'📷' };
            if (url.includes('facebook.com/reel/')) return { p:'Facebook', t:'Reel', g:'linear-gradient(135deg,#1877f2,#0c5dc7)', c:'#1877f2', i:'📽️' };
            if (url.includes('fb.watch/')) return { p:'Facebook', t:'Video', g:'linear-gradient(135deg,#1877f2,#42b72a)', c:'#1877f2', i:'🎬' };
            if (url.includes('facebook.com/')) return { p:'Facebook', t:'Post', g:'linear-gradient(135deg,#1877f2,#0c5dc7)', c:'#1877f2', i:'📝' };
            return { p:'Social', t:'Media', g:'linear-gradient(135deg,#6366f1,#4f46e5)', c:'#6366f1', i:'📱' };
          }
          const fi = getInfo(reels[0]);
          let h = '<h3>📱 Reels & Posts</h3>';
          h += '<div style="position:relative;width:100%;text-align:center;margin-bottom:15px;">';
          h += '<div id="reel-card" style="width:290px;margin:0 auto;border-radius:24px;overflow:hidden;box-shadow:0 15px 40px rgba(0,0,0,0.2);background:#fff;">';
          h += '<div id="reel-thumb-area" style="width:100%;height:240px;background:' + fi.g + ';position:relative;overflow:hidden;">';
          h += '<div id="reel-thumb-bg" style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;">';
          h += '<span id="reel-icon-fallback" style="font-size:70px;">' + fi.i + '</span>';
          h += '<div style="width:60px;height:60px;background:rgba(255,255,255,0.9);border-radius:50%;display:flex;align-items:center;justify-content:center;margin-top:10px;"><span style="font-size:24px;color:' + fi.c + ';">▶</span></div>';
          h += '</div>';
          h += '<img id="reel-thumb" src="" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;display:none;">';
          h += '</div>';
          h += '<div style="padding:16px 20px;">';
          h += '<span id="reel-platform" style="background:' + fi.c + ';color:#fff;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;">' + fi.p + '</span> ';
          h += '<span id="reel-type" style="color:#64748b;font-size:12px;font-weight:600;">' + fi.t + '</span>';
          h += '<p id="reel-title" style="font-weight:600;font-size:14px;color:#1e293b;margin:6px 0;">' + fi.p + ' ' + fi.t + '</p>';
          h += '<p id="reel-counter" style="color:#94a3b8;font-size:12px;margin-bottom:12px;">1 of ' + reels.length + '</p>';
          h += '<a id="reel-link" href="' + reels[0] + '" target="_blank" style="display:block;text-align:center;padding:14px;background:' + fi.c + ';color:#fff;text-decoration:none;border-radius:50px;font-weight:700;font-size:15px;">▶ Watch Now</a>';
          h += '</div></div>';
          if (reels.length > 1) {
            h += '<button id="reel-prev" style="position:absolute;left:0;top:42%;transform:translateY(-50%);background:rgba(255,255,255,0.95);color:#333;border:none;border-radius:50%;width:40px;height:40px;font-size:18px;cursor:pointer;z-index:10;">◀</button>';
            h += '<button id="reel-next" style="position:absolute;right:0;top:42%;transform:translateY(-50%);background:rgba(255,255,255,0.95);color:#333;border:none;border-radius:50%;width:40px;height:40px;font-size:18px;cursor:pointer;z-index:10;">▶</button>';
          }
          h += '</div>';
          if (reels.length > 1) {
            h += '<div style="text-align:center;margin-bottom:10px;">';
            for (let d = 0; d < reels.length; d++) {
              h += '<span class="reel-dot" data-index="' + d + '" style="display:inline-block;width:10px;height:10px;background:' + (d === 0 ? 'var(--primary)' : '#ccc') + ';border-radius:50%;margin:0 5px;cursor:pointer;"></span>';
            }
            h += '</div>';
          }
          div.innerHTML = h;

          function updateReelUI(index) {
            curR = index;
            const inf = getInfo(reels[index]);
            const area = document.getElementById('reel-thumb-area');
            if (!area) return;
            area.style.background = inf.g;
            document.getElementById('reel-icon-fallback').textContent = inf.i;
            document.getElementById('reel-platform').textContent = inf.p;
            document.getElementById('reel-platform').style.background = inf.c;
            document.getElementById('reel-type').textContent = inf.t;
            document.getElementById('reel-link').href = reels[index];
            document.getElementById('reel-link').style.background = inf.c;
            document.getElementById('reel-counter').textContent = (index + 1) + ' of ' + reels.length;
            document.getElementById('reel-thumb').style.display = 'none';
            document.getElementById('reel-thumb-bg').style.display = 'flex';
            document.getElementById('reel-title').textContent = inf.p + ' ' + inf.t;
            if (typeof fetchOGData === 'function') {
              fetchOGData(reels[index], function(og) {
                if (og.image) {
                  document.getElementById('reel-thumb').src = og.image;
                  document.getElementById('reel-thumb').style.display = 'block';
                  document.getElementById('reel-thumb-bg').style.display = 'none';
                }
                if (og.title) document.getElementById('reel-title').textContent = og.title;
              });
            }
            document.querySelectorAll('.reel-dot').forEach(function(d, i) {
              d.style.background = i === index ? 'var(--primary)' : '#ccc';
            });
          }

          updateReelUI(0);

          if (reels.length > 1) {
            setTimeout(function() {
              const next = document.getElementById('reel-next');
              const prev = document.getElementById('reel-prev');
              if (next) next.onclick = function() { updateReelUI((curR + 1) % reels.length); };
              if (prev) prev.onclick = function() { updateReelUI((curR - 1 + reels.length) % reels.length); };
              document.querySelectorAll('.reel-dot').forEach(function(d) {
                d.onclick = function() { updateReelUI(parseInt(this.getAttribute('data-index'))); };
              });
            }, 100);
          }
        }
                else if (sec === 'payment' && data.payment) {
          let h = '<h3>💳 Payment Info</h3>';
          h += '<div style="text-align:center;">';
          
          // Payment QR Image
          if (data.payment.qrImage && data.payment.qrImage.trim() !== '') {
            h += '<img src="' + data.payment.qrImage + '" alt="Payment QR" style="width:180px;height:180px;object-fit:contain;border-radius:15px;box-shadow:var(--shadow-sm);margin-bottom:15px;">';
          }
          
          // Paytm
          if (data.payment.paytm && data.payment.paytm.trim() !== '') {
            h += '<div style="background:#e8f5e9;border-radius:12px;padding:15px;margin:8px 0;">';
            h += '<p style="font-weight:700;color:#00bcd4;margin:0;">Paytm</p>';
            h += '<p style="font-size:18px;font-weight:700;color:#1e293b;margin:5px 0;">' + data.payment.paytm + '</p>';
            h += '</div>';
          }
          
          // UPI
          if (data.payment.upi && data.payment.upi.trim() !== '') {
            h += '<div style="background:#e3f2fd;border-radius:12px;padding:15px;margin:8px 0;">';
            h += '<p style="font-weight:700;color:#1976d2;margin:0;">UPI</p>';
            h += '<p style="font-size:18px;font-weight:700;color:#1e293b;margin:5px 0;">' + data.payment.upi + '</p>';
            h += '</div>';
          }
          
          h += '</div>';
          div.innerHTML = h;
        }
                else if (sec === 'bank' && data.bank) {
          let h = '<h3>🏦 Bank Account Details</h3>';
          h += '<div style="background:var(--card-bg-secondary);border-radius:15px;padding:20px;box-shadow:var(--shadow-sm);">';
          
          if (data.bank.accountNumber && data.bank.accountNumber.trim() !== '') {
            h += '<div style="margin-bottom:12px;"><p style="font-size:11px;color:var(--text-secondary);margin:0;">Account Number</p>';
            h += '<p style="font-size:16px;font-weight:700;color:var(--text-primary);margin:2px 0;">' + data.bank.accountNumber + '</p></div>';
          }
          if (data.bank.ifsc && data.bank.ifsc.trim() !== '') {
            h += '<div style="margin-bottom:12px;"><p style="font-size:11px;color:var(--text-secondary);margin:0;">IFSC Code</p>';
            h += '<p style="font-size:16px;font-weight:700;color:var(--text-primary);margin:2px 0;">' + data.bank.ifsc + '</p></div>';
          }
          if (data.bank.bankName && data.bank.bankName.trim() !== '') {
            h += '<div style="margin-bottom:12px;"><p style="font-size:11px;color:var(--text-secondary);margin:0;">Bank Name</p>';
            h += '<p style="font-size:16px;font-weight:700;color:var(--text-primary);margin:2px 0;">' + data.bank.bankName + '</p></div>';
          }
          if (data.bank.holderName && data.bank.holderName.trim() !== '') {
            h += '<div style="margin-bottom:12px;"><p style="font-size:11px;color:var(--text-secondary);margin:0;">Account Holder</p>';
            h += '<p style="font-size:16px;font-weight:700;color:var(--text-primary);margin:2px 0;">' + data.bank.holderName + '</p></div>';
          }
          
          h += '</div>';
          div.innerHTML = h;
        }
        container.appendChild(div);
      }

      // QR Code
      const qrImage = document.getElementById('qr-image');
      const qrBox = document.getElementById('qr-box');
      const cardUrlText = document.getElementById('card-url-text');
      const currentUrl = window.location.href;
      if (cardUrlText) cardUrlText.textContent = currentUrl;
      if (data.qrImage && data.qrImage.trim() !== '' && qrImage) {
        qrImage.src = data.qrImage;
        qrImage.style.display = 'block';
      } else if (qrBox && typeof QRCode !== 'undefined') {
        new QRCode(qrBox, { text: currentUrl, width: 200, height: 200 });
      }
      const btnCopy = document.getElementById('btn-copy-url');
      if (btnCopy) {
        btnCopy.addEventListener('click', function() {
          navigator.clipboard.writeText(currentUrl).then(function() { alert('✅ URL कॉपी हो गया!'); });
        });
      }

      // Share
      const btnShare = document.getElementById('btn-share');
      if (btnShare) {
        btnShare.addEventListener('click', function() {
          const txt = data.name + ' - ' + (data.title || '') + ' - Digital vCard';
          if (navigator.share) navigator.share({ title: txt, text: txt, url: currentUrl }).catch(function(){});
          else navigator.clipboard.writeText(currentUrl).then(function() { alert('🔗 लिंक कॉपी हो गया!'); });
        });
      }

      // PDF
      const btnPdf = document.getElementById('btn-pdf');
      if (btnPdf) btnPdf.addEventListener('click', function() { window.print(); });

      // Save Contact
      const btnSave = document.getElementById('save-contact');
      if (btnSave) {
        btnSave.addEventListener('click', function() {
          let vcf = 'BEGIN:VCARD\nVERSION:3.0\nFN:' + (data.name || '') + '\nTITLE:' + (data.title || '') + '\nTEL:' + (data.phone || '') + '\nEMAIL:' + (data.email || '') + '\nURL:' + (data.website || '') + '\nEND:VCARD';
          const blob = new Blob([vcf], { type: 'text/vcard' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = (data.name || 'contact') + '.vcf';
          a.click();
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
