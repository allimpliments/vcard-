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
        document.getElementById('loader').style.display = 'none';
        document.getElementById('error').style.display = 'block';
        return;
      }

      const data = docSnap.data();

      var savedTheme = data.theme || 'default';
      if (savedTheme === 'default') {
        var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        savedTheme = prefersDark ? 'graphite' : 'default';
      }
      document.body.className = savedTheme;

      document.getElementById('loader').style.display = 'none';
      document.getElementById('card-container').style.display = 'block';

      const animContainer = document.getElementById('main-anim');
      if (animContainer && typeof lottie !== 'undefined') {
        lottie.loadAnimation({
          container: animContainer, renderer: 'svg', loop: true, autoplay: true,
          path: 'assets/lottie/' + (data.animation || 'wave') + '.json'
        });
      }

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

      const profileImg = document.getElementById('profile-img');
      if (profileImg) {
        if (data.profileImage && data.profileImage.trim() !== '') {
          profileImg.src = data.profileImage;
        } else {
          profileImg.src = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect width="120" height="120" fill="#e2e8f0"/><text x="60" y="65" text-anchor="middle" font-size="40" fill="#94a3b8">👤</text></svg>');
        }
        var style = data.profileStyle || 'circle';
        profileImg.className = 'profile-' + style;
      }

      document.getElementById('name').textContent = data.name || '';
      document.getElementById('title').textContent = data.title || '';

      const container = document.getElementById('sections-container');
      container.innerHTML = '';
      const order = data.sectionOrder || ['about', 'contact', 'social'];

      const btnStyle = 'font-family:var(--font-body);border-radius:var(--btn-radius);font-weight:var(--btn-font-weight);transition:all var(--transition-speed) var(--transition-style);';
      const btnPrimary = btnStyle + 'background:var(--primary);color:#fff;';
      const btnAccent = btnStyle + 'background:var(--accent);color:#fff;';
      const btnWhatsappStyle = btnStyle + 'background:var(--whatsapp);color:#fff;';

      for (let i = 0; i < order.length; i++) {
        const sec = order[i];
        const div = document.createElement('div');
        div.id = sec + '-section';

        // ABOUT
        if (sec === 'about' && data.about) {
          let h = '<h3>About Us</h3>';
          if (data.aboutImage && data.aboutImage.trim() !== '') {
            h += '<div style="text-align:center;margin-bottom:15px;"><img src="' + data.aboutImage + '" style="max-width:200px;max-height:200px;border-radius:15px;object-fit:cover;"></div>';
          }
          h += '<p style="font-size:14px;line-height:1.7;color:var(--text-secondary);text-align:center;margin-bottom:15px;">' + data.about + '</p>';
          if (data.aboutPdf && data.aboutPdf.trim() !== '') {
            h += '<div style="text-align:center;"><a href="' + data.aboutPdf + '" target="_blank" style="display:inline-block;padding:12px 25px;' + btnAccent + 'text-decoration:none;">📥 Download PDF</a></div>';
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
          let h = '<h3>🛍️ Online Shop</h3><div style="display:flex;flex-direction:column;gap:15px;">';
          for (let k = 0; k < data.products.length; k++) {
            const p = data.products[k];
            const pid = 'prod-' + k;
            const phone = data.phone ? data.phone.replace(/[^0-9]/g, '') : '';
            h += '<div style="background:var(--card-bg-secondary);border-radius:14px;padding:15px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">';
            if (p.image) h += '<img src="' + p.image + '" style="width:90px;height:90px;object-fit:cover;border-radius:12px;flex-shrink:0;">';
            h += '<div style="flex:1;min-width:140px;"><p style="font-weight:600;font-size:15px;color:var(--text);margin:0 0 4px;">' + p.name + '</p>';
            if (p.actualPrice) h += '<span style="text-decoration:line-through;color:#ef4444;font-size:13px;">₹' + p.actualPrice + '</span> ';
            h += '<span style="font-weight:700;color:var(--primary);font-size:18px;">₹' + p.sellingPrice + '</span></div>';
            h += '<div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">';
            h += '<div style="display:flex;align-items:center;background:var(--card-bg);border-radius:25px;overflow:hidden;border:1px solid var(--border);">';
            h += '<button onclick="changeQty(\'' + pid + '\', -1)" style="background:none;border:none;padding:8px 12px;font-size:16px;cursor:pointer;color:var(--text);">−</button>';
            h += '<span id="' + pid + '" style="padding:4px 8px;font-weight:600;font-size:14px;min-width:30px;text-align:center;color:var(--text);">1</span>';
            h += '<button onclick="changeQty(\'' + pid + '\', 1)" style="background:none;border:none;padding:8px 12px;font-size:16px;cursor:pointer;color:var(--text);">+</button>';
            h += '</div>';
            h += '<button onclick="orderNow(\'' + p.name.replace(/'/g, "\\'") + '\',\'' + p.sellingPrice + '\',\'' + pid + '\',\'' + phone + '\')" style="padding:10px 16px;' + btnWhatsappStyle + 'border:none;cursor:pointer;white-space:nowrap;font-size:13px;">💬 Order</button>';
            h += '</div></div>';
          }
          h += '</div>';
          div.innerHTML = h;
        }

        // SERVICES
        else if (sec === 'services' && data.services && data.services.length > 0) {
          let h = '<h3>📦 Products & Services</h3><div style="display:flex;flex-direction:column;gap:12px;">';
          for (let k = 0; k < data.services.length; k++) {
            const s = data.services[k];
            const phone = data.phone ? data.phone.replace(/[^0-9]/g, '') : '';
            const wa = phone ? 'https://wa.me/' + phone + '?text=Hi,%20I%20am%20interested%20in%20' + encodeURIComponent(s.title) : '#';
            h += '<div style="display:flex;align-items:center;gap:12px;background:var(--card-bg-secondary);border-radius:14px;padding:12px;">';
            if (s.image) h += '<img src="' + s.image + '" style="width:70px;height:70px;object-fit:cover;border-radius:10px;flex-shrink:0;">';
            h += '<p style="flex:1;font-weight:600;font-size:14px;color:var(--text);margin:0;">' + s.title + '</p>';
            h += '<a href="' + wa + '" target="_blank" style="padding:10px 16px;' + btnWhatsappStyle + 'text-decoration:none;white-space:nowrap;flex-shrink:0;font-size:12px;">Enquiry Now</a>';
            h += '</div>';
          }
          h += '</div>';
          div.innerHTML = h;
        }

        // GALLERY
        else if (sec === 'gallery' && data.gallery && data.gallery.length > 0) {
          const images = data.gallery;
          let cur = 0;
          let h = '<h3>🖼️ Gallery</h3><div style="position:relative;text-align:center;margin-bottom:10px;">';
          h += '<img id="gallery-main" src="' + images[0] + '" style="width:100%;max-height:300px;object-fit:cover;border-radius:15px;cursor:pointer;">';
          if (images.length > 1) {
            h += '<button id="gal-prev" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.4);color:#fff;border:none;border-radius:50%;width:38px;height:38px;font-size:16px;cursor:pointer;z-index:5;">◀</button>';
            h += '<button id="gal-next" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:rgba(0,0,0,0.4);color:#fff;border:none;border-radius:50%;width:38px;height:38px;font-size:16px;cursor:pointer;z-index:5;">▶</button>';
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
            function upd(idx) { cur = idx; main.src = images[cur]; dots.forEach(function(d, i) { d.style.background = i === cur ? 'var(--primary)' : '#ccc'; }); }
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
          let h = '<h3>🎬 YouTube Videos</h3><div style="text-align:center;margin-bottom:10px;"><div style="border-radius:15px;overflow:hidden;"><div id="yt-container" style="position:relative;padding-bottom:' + (videos[0].isShort ? '177%' : '56.25%') + ';height:0;"><iframe id="yt-main" src="https://www.youtube.com/embed/' + videos[0].id + '" style="position:absolute;top:0;left:0;width:100%;height:100%;border-radius:15px;" frameborder="0" allowfullscreen></iframe></div></div></div>';
          if (videos.length > 1) {
            h += '<div style="display:flex;align-items:center;justify-content:center;gap:15px;margin-bottom:10px;">';
            h += '<button id="yt-prev" style="' + btnPrimary + 'border:none;width:36px;height:36px;font-size:18px;cursor:pointer;">◀</button>';
            h += '<div style="display:flex;gap:8px;overflow-x:auto;max-width:250px;">';
            for (let t = 0; t < videos.length; t++) {
              h += '<img src="' + videos[t].thumb + '" class="yt-thumb" data-index="' + t + '" style="width:70px;height:50px;object-fit:cover;border-radius:8px;cursor:pointer;border:2px solid ' + (t === 0 ? 'var(--primary)' : 'transparent') + ';opacity:' + (t === 0 ? '1' : '0.6') + ';flex-shrink:0;">';
            }
            h += '</div><button id="yt-next" style="' + btnPrimary + 'border:none;width:36px;height:36px;font-size:18px;cursor:pointer;">▶</button></div>';
          }
          div.innerHTML = h;
          if (videos.length > 1) {
            setTimeout(function() {
              const iframe = document.getElementById('yt-main');
              const ctr = document.getElementById('yt-container');
              const prev = document.getElementById('yt-prev');
              const next = document.getElementById('yt-next');
              const thumbs = document.querySelectorAll('.yt-thumb');
              if (!iframe) return;
              function updV(idx) {
                curV = idx; iframe.src = 'https://www.youtube.com/embed/' + videos[curV].id;
                ctr.style.paddingBottom = videos[curV].isShort ? '177%' : '56.25%';
                thumbs.forEach(function(t, i) { t.style.border = i === curV ? '2px solid var(--primary)' : '2px solid transparent'; t.style.opacity = i === curV ? '1' : '0.6'; });
              }
              if (next) next.onclick = function() { updV((curV + 1) % videos.length); };
              if (prev) prev.onclick = function() { updV((curV - 1 + videos.length) % videos.length); };
              thumbs.forEach(function(t) { t.onclick = function() { updV(parseInt(this.getAttribute('data-index'))); }; });
            }, 100);
          }
        }

        // REELS
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
          let h = '<h3>📱 Reels & Posts</h3><div style="position:relative;width:100%;text-align:center;margin-bottom:15px;">';
          h += '<div id="reel-card" style="width:290px;margin:0 auto;border-radius:24px;overflow:hidden;background:var(--card-bg);">';
          h += '<div id="reel-thumb-area" style="width:100%;height:240px;background:' + fi.g + ';position:relative;overflow:hidden;">';
          h += '<div id="reel-thumb-bg" style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;">';
          h += '<span id="reel-icon-fallback" style="font-size:70px;">' + fi.i + '</span>';
          h += '<div style="width:60px;height:60px;background:rgba(255,255,255,0.9);border-radius:50%;display:flex;align-items:center;justify-content:center;margin-top:10px;"><span style="font-size:24px;color:' + fi.c + ';">▶</span></div>';
          h += '</div><img id="reel-thumb" src="" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;display:none;"></div>';
          h += '<div style="padding:16px 20px;"><span id="reel-platform" style="background:' + fi.c + ';color:#fff;padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;">' + fi.p + '</span> ';
          h += '<span id="reel-type" style="color:var(--text-secondary);font-size:12px;font-weight:600;">' + fi.t + '</span>';
          h += '<p id="reel-title" style="font-weight:600;font-size:14px;color:var(--text);margin:6px 0;">' + fi.p + ' ' + fi.t + '</p>';
          h += '<p id="reel-counter" style="color:var(--text-secondary);font-size:12px;margin-bottom:12px;">1 of ' + reels.length + '</p>';
          h += '<a id="reel-link" href="' + reels[0] + '" target="_blank" style="display:block;text-align:center;padding:14px;' + btnAccent + 'text-decoration:none;font-size:15px;">▶ Watch Now</a></div></div>';
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
            curR = index; const inf = getInfo(reels[index]);
            const area = document.getElementById('reel-thumb-area'); if (!area) return;
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
            document.querySelectorAll('.reel-dot').forEach(function(d, i) { d.style.background = i === index ? 'var(--primary)' : '#ccc'; });
          }
          updateReelUI(0);
          if (reels.length > 1) {
            setTimeout(function() {
              const next = document.getElementById('reel-next');
              const prev = document.getElementById('reel-prev');
              if (next) next.onclick = function() { updateReelUI((curR + 1) % reels.length); };
              if (prev) prev.onclick = function() { updateReelUI((curR - 1 + reels.length) % reels.length); };
              document.querySelectorAll('.reel-dot').forEach(function(d) { d.onclick = function() { updateReelUI(parseInt(this.getAttribute('data-index'))); }; });
            }, 100);
          }
        }

        // PAYMENT
        else if (sec === 'payment' && data.payment) {
          let h = '<h3>💳 Payment Info</h3><div style="text-align:center;">';
          if (data.payment.qrImage && data.payment.qrImage.trim() !== '') {
            h += '<img src="' + data.payment.qrImage + '" style="width:180px;height:180px;object-fit:contain;border-radius:15px;margin-bottom:15px;">';
          }
          if (data.payment.paytm && data.payment.paytm.trim() !== '') {
            h += '<div style="background:rgba(0,188,212,0.1);border-radius:12px;padding:15px;margin:8px 0;"><p style="font-weight:700;color:#00bcd4;margin:0;">Paytm</p><p style="font-size:18px;font-weight:700;margin:5px 0;color:var(--text);">' + data.payment.paytm + '</p></div>';
          }
          if (data.payment.upi && data.payment.upi.trim() !== '') {
            h += '<div style="background:rgba(25,118,210,0.1);border-radius:12px;padding:15px;margin:8px 0;"><p style="font-weight:700;color:#1976d2;margin:0;">UPI</p><p style="font-size:18px;font-weight:700;margin:5px 0;color:var(--text);">' + data.payment.upi + '</p></div>';
          }
          h += '</div>'; div.innerHTML = h;
        }

        // BANK
        else if (sec === 'bank' && data.bank) {
          let h = '<h3>🏦 Bank Details</h3><div style="background:var(--card-bg-secondary);border-radius:15px;padding:20px;">';
          if (data.bank.accountNumber) h += '<p style="font-size:11px;color:var(--text-secondary);margin:0;">Account Number</p><p style="font-size:16px;font-weight:700;margin:2px 0 12px;color:var(--text);">' + data.bank.accountNumber + '</p>';
          if (data.bank.ifsc) h += '<p style="font-size:11px;color:var(--text-secondary);margin:0;">IFSC Code</p><p style="font-size:16px;font-weight:700;margin:2px 0 12px;color:var(--text);">' + data.bank.ifsc + '</p>';
          if (data.bank.bankName) h += '<p style="font-size:11px;color:var(--text-secondary);margin:0;">Bank Name</p><p style="font-size:16px;font-weight:700;margin:2px 0 12px;color:var(--text);">' + data.bank.bankName + '</p>';
          if (data.bank.holderName) h += '<p style="font-size:11px;color:var(--text-secondary);margin:0;">Account Holder</p><p style="font-size:16px;font-weight:700;margin:2px 0;color:var(--text);">' + data.bank.holderName + '</p>';
          h += '</div>'; div.innerHTML = h;
        }

        // FEEDBACK
        else if (sec === 'feedback') {
          let h = '<h3>⭐ Feedback</h3><div style="background:var(--card-bg-secondary);border-radius:15px;padding:20px;margin-bottom:15px;">';
          h += '<div id="star-rating" style="text-align:center;margin-bottom:15px;"><p style="font-size:13px;color:var(--text-secondary);margin-bottom:8px;">Select Star</p>';
          for (let s = 1; s <= 5; s++) h += '<span class="star" data-star="' + s + '" style="font-size:30px;cursor:pointer;color:#ccc;">★</span>';
          h += '<input type="hidden" id="feedback-star" value="0"></div>';
          h += '<input type="text" id="feedback-name" placeholder="Your name" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:10px;margin-bottom:8px;background:var(--card-bg);color:var(--text);">';
          h += '<input type="email" id="feedback-email" placeholder="Your email" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:10px;margin-bottom:8px;background:var(--card-bg);color:var(--text);">';
          h += '<input type="tel" id="feedback-contact" placeholder="Your contact" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:10px;margin-bottom:8px;background:var(--card-bg);color:var(--text);">';
          h += '<textarea id="feedback-msg" placeholder="Your feedback" rows="3" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:10px;margin-bottom:8px;background:var(--card-bg);color:var(--text);"></textarea>';
          h += '<button id="feedback-submit" style="width:100%;padding:14px;' + btnPrimary + 'border:none;cursor:pointer;font-size:15px;">Submit</button>';
          h += '<p style="font-size:11px;color:var(--text-secondary);text-align:center;margin-top:10px;">Note: We do not show your contact details.</p></div>';
          h += '<h4 style="font-size:14px;font-weight:600;color:var(--primary);margin-bottom:10px;">📝 Latest Feedback</h4><div id="feedback-list" style="max-height:300px;overflow-y:auto;">';
          if (data.feedbacks && data.feedbacks.length > 0) {
            for (let f = data.feedbacks.length - 1; f >= 0; f--) {
              const fb = data.feedbacks[f];
              h += '<div style="background:var(--card-bg-secondary);border-radius:12px;padding:15px;margin-bottom:10px;"><div style="display:flex;justify-content:space-between;margin-bottom:5px;"><span style="font-weight:600;color:var(--text);">' + (fb.name || 'Anonymous') + '</span><span style="color:#f59e0b;">' + '★'.repeat(fb.stars || 5) + '</span></div><p style="font-size:13px;color:var(--text-secondary);">' + (fb.message || '') + '</p><p style="font-size:10px;color:var(--text-secondary);">Date: ' + (fb.date || '') + '</p></div>';
            }
          } else { h += '<p style="text-align:center;color:var(--text-secondary);">No feedback yet.</p>'; }
          h += '</div>'; div.innerHTML = h;
          setTimeout(function() {
            const stars = document.querySelectorAll('.star');
            const starInput = document.getElementById('feedback-star');
            stars.forEach(function(star) {
              star.addEventListener('click', function() {
                const val = parseInt(this.getAttribute('data-star')); starInput.value = val;
                stars.forEach(function(s, i) { s.style.color = i < val ? '#f59e0b' : '#ccc'; });
              });
            });
            document.getElementById('feedback-submit').addEventListener('click', async function() {
              const star = parseInt(starInput.value);
              const msg = document.getElementById('feedback-msg').value.trim();
              if (!star) { alert('Please select star!'); return; }
              if (!msg) { alert('Please enter feedback!'); return; }
              const newFB = { stars: star, name: document.getElementById('feedback-name').value.trim() || 'Anonymous', email: document.getElementById('feedback-email').value.trim(), contact: document.getElementById('feedback-contact').value.trim(), message: msg, date: new Date().toLocaleDateString('en-IN', { year:'numeric', month:'short', day:'numeric' }) };
              const all = data.feedbacks || []; all.push(newFB);
              try { await db.collection('cards').doc(slug).update({ feedbacks: all }); alert('✅ Feedback submitted!'); location.reload(); }
              catch (err) { alert('❌ Error: ' + err.message); }
            });
          }, 100);
        }

        // LOCATION
        else if (sec === 'location' && data.location) {
          let h = '<h3>📍 Location</h3>';
          h += '<div style="background:var(--card-bg-secondary);border-radius:16px;padding:20px;text-align:center;">';
          if (data.location.mapLink && data.location.mapLink.trim() !== '') {
            h += '<div style="border-radius:16px;overflow:hidden;margin-bottom:15px;background:#e2e8f0;height:200px;display:flex;align-items:center;justify-content:center;">';
            h += '<div style="text-align:center;"><span style="font-size:60px;">🗺️</span>';
            h += '<p style="font-size:13px;color:#64748b;margin-top:8px;">Tap below to view map</p></div></div>';
          }
          if (data.location.address && data.location.address.trim() !== '') {
            h += '<p style="font-size:14px;color:var(--text);margin:10px 0;line-height:1.6;">📍 ' + data.location.address + '</p>';
          }
          if (data.location.mapLink && data.location.mapLink.trim() !== '') {
            h += '<a href="' + data.location.mapLink + '" target="_blank" style="display:inline-block;margin:6px;padding:14px 28px;' + btnPrimary + 'text-decoration:none;font-size:15px;">🗺️ Open in Google Maps</a>';
          }
          if (data.location.address && data.location.address.trim() !== '') {
            h += '<a href="https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(data.location.address) + '" target="_blank" style="display:inline-block;margin:6px;padding:14px 28px;' + btnWhatsappStyle + 'text-decoration:none;font-size:15px;">🧭 Navigate</a>';
          }
          h += '</div>';
          div.innerHTML = h;
        }

        // CONTACT FORM
        else if (sec === 'contactform') {
          let h = '<h3>📩 Contact Us</h3><div style="background:var(--card-bg-secondary);border-radius:15px;padding:20px;">';
          h += '<textarea id="enquiry-msg" placeholder="Enter your enquiry..." rows="3" style="width:100%;padding:12px;border:1px solid var(--border);border-radius:10px;font-size:14px;margin-bottom:12px;background:var(--card-bg);color:var(--text);"></textarea>';
          h += '<button id="enquiry-send" style="width:100%;padding:14px;' + btnWhatsappStyle + 'border:none;cursor:pointer;font-size:15px;">📤 Send via WhatsApp</button></div>';
          div.innerHTML = h;
          setTimeout(function() {
            document.getElementById('enquiry-send').addEventListener('click', function() {
              const msg = document.getElementById('enquiry-msg').value.trim();
              if (!msg) { alert('Please enter your message!'); return; }
              const phone = data.phone ? data.phone.replace(/[^0-9]/g, '') : '';
              if (phone) window.open('https://wa.me/' + phone + '?text=' + encodeURIComponent(msg), '_blank');
              else alert('Phone not available!');
            });
          }, 100);
        }

        container.appendChild(div);
      }

      const sections = container.querySelectorAll('#sections-container > div');
      sections.forEach(function(sec) { sec.classList.add('fade-section'); });
      const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) { if (entry.isIntersecting) entry.target.classList.add('visible'); });
      }, { threshold: 0.1 });
      sections.forEach(function(sec) { observer.observe(sec); });

      const qrImage = document.getElementById('qr-image');
      const qrBox = document.getElementById('qr-box');
      const cardUrlText = document.getElementById('card-url-text');
      const currentUrl = window.location.href;
      if (cardUrlText) cardUrlText.textContent = currentUrl;
      if (data.qrImage && data.qrImage.trim() !== '' && qrImage) { qrImage.src = data.qrImage; qrImage.style.display = 'block'; }
      else if (qrBox && typeof QRCode !== 'undefined') { new QRCode(qrBox, { text: currentUrl, width: 200, height: 200 }); }
      const btnCopy = document.getElementById('btn-copy-url');
      if (btnCopy) btnCopy.addEventListener('click', function() { navigator.clipboard.writeText(currentUrl).then(function() { alert('✅ URL copied!'); }); });

      const btnShare = document.getElementById('btn-share');
      if (btnShare) btnShare.addEventListener('click', function() {
        const txt = data.name + ' - ' + (data.title || '');
        if (navigator.share) navigator.share({ title: txt, text: txt, url: currentUrl }).catch(function(){});
        else navigator.clipboard.writeText(currentUrl).then(function() { alert('🔗 Link copied!'); });
      });

      const btnPdf = document.getElementById('btn-pdf');
      if (btnPdf) btnPdf.addEventListener('click', function() { window.print(); });

      const btnSave = document.getElementById('save-contact');
      if (btnSave) btnSave.addEventListener('click', function() {
        let vcf = 'BEGIN:VCARD\nVERSION:3.0\nFN:' + (data.name || '') + '\nTITLE:' + (data.title || '') + '\nTEL:' + (data.phone || '') + '\nEMAIL:' + (data.email || '') + '\nURL:' + (data.website || '') + '\nEND:VCARD';
        const blob = new Blob([vcf], { type: 'text/vcard' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = (data.name || 'contact') + '.vcf'; a.click();
      });
            // Inject WhatsApp button styles directly
      var waStyle = document.createElement('style');
      var theme = document.body.className;
      var waColor = '#25d366';
      if (theme === 'sunset') waColor = '#ffd700';
      else if (theme === 'ocean') waColor = '#00e676';
      else if (theme === 'forest') waColor = '#4ade80';
      else if (theme === 'aurora') waColor = '#34d399';
      else if (theme === 'mono') waColor = '#000000';
      
      waStyle.textContent = '#btn-whatsapp, button[onclick*="orderNow"], a[href*="wa.me"]:not(.social-icons a), #enquiry-send { background: ' + waColor + ' !important; }';
      document.head.appendChild(waStyle);
      
      console.log('✅ Card successfully displayed!');
    })
    .catch((error) => {
      console.error('❌ Firestore Error:', error);
      document.getElementById('loader').style.display = 'none';
      document.getElementById('error').style.display = 'block';
    });
}
