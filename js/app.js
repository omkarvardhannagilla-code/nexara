// ══════════════════════════════════════════════
// NEXARA — MAIN APPLICATION  v2
// ══════════════════════════════════════════════

// ── STATE ──
let state = {
  user: null,
  cart: [],
  wishlist: [],
  orders: [],
  currentProduct: null,
  currentReviewIndex: 0,
  currentQty: 1,
  selectedPayment: null,
  deliveryAddress: null,
  currentCategory: 'all',
  searchQuery: '',
  displayedCount: 20,
  heroSlide: 0,
  chatHistory: [],
  navCity: 'Select Location',
  cancelTargetOrderId: null,
  cancelReason: null,
  wasOffline: false
};

// ── INIT ──
window.addEventListener('DOMContentLoaded', () => {
  loadState();
  initParticleCanvas('particle-canvas');
  initOfflineCanvas();
  setTimeout(startLoaderProgress, 3000);
  setTimeout(endIntro, 6500);
  buildTickerDeals();
  startHeroSlider();
  renderProducts();
  initLoginCanvas();
  initOfflineDetection();
});

function loadState() {
  try {
    const saved = localStorage.getItem('nexara_v2');
    if (saved) {
      const p = JSON.parse(saved);
      state.cart     = p.cart     || [];
      state.wishlist = p.wishlist || [];
      state.orders   = p.orders   || [];
      state.user     = p.user     || null;
      state.navCity  = p.navCity  || 'Select Location';
    }
  } catch(e) {}
}

function saveState() {
  try {
    localStorage.setItem('nexara_v2', JSON.stringify({
      cart: state.cart, wishlist: state.wishlist,
      orders: state.orders, user: state.user, navCity: state.navCity
    }));
  } catch(e) {}
}

// ════════════════════════════════════════
// OFFLINE / ONLINE DETECTION
// ════════════════════════════════════════
function initOfflineDetection() {
  // Check initial state
  if (!navigator.onLine) showOfflineScreen();

  window.addEventListener('offline', () => {
    state.wasOffline = true;
    showOfflineScreen();
  });

  window.addEventListener('online', () => {
    if (state.wasOffline) {
      hideOfflineScreen();
      state.wasOffline = false;
    }
  });
}

function showOfflineScreen() {
  const screen = document.getElementById('offline-screen');
  screen.classList.remove('hidden');
  screen.style.opacity = '0';
  screen.style.transition = 'opacity 0.5s ease';
  requestAnimationFrame(() => {
    screen.style.opacity = '1';
  });
  animateOfflineStatus();
  document.body.style.overflow = 'hidden';
}

function hideOfflineScreen() {
  const screen = document.getElementById('offline-screen');
  screen.style.transition = 'opacity 0.8s ease';
  screen.style.opacity = '0';
  setTimeout(() => {
    screen.classList.add('hidden');
    screen.style.opacity = '';
    document.body.style.overflow = '';
  }, 800);
  showOnlineBanner();
}

function animateOfflineStatus() {
  const messages = [
    'Scanning for network...',
    'Attempting quantum reconnect...',
    'Neural link severed...',
    'Searching for signal...',
    'Awaiting connection...'
  ];
  let i = 0;
  const el = document.getElementById('offline-status-text');
  if (!el) return;
  const interval = setInterval(() => {
    if (!document.getElementById('offline-screen').classList.contains('hidden')) {
      i = (i + 1) % messages.length;
      el.textContent = messages[i];
    } else {
      clearInterval(interval);
    }
  }, 2000);
}

function retryConnection() {
  const btn = document.querySelector('.offline-retry-btn .btn-text');
  if (btn) btn.textContent = '⟳ Checking...';
  setTimeout(() => {
    if (navigator.onLine) {
      hideOfflineScreen();
      state.wasOffline = false;
    } else {
      if (btn) btn.textContent = '⟳ Retry Connection';
      showToast('Still offline. Check your network.');
    }
  }, 1200);
}

function showOnlineBanner() {
  const banner = document.getElementById('online-banner');
  banner.classList.remove('hidden');
  setTimeout(() => dismissOnlineBanner(), 5000);
}

function dismissOnlineBanner() {
  const banner = document.getElementById('online-banner');
  banner.style.transition = 'opacity 0.4s, transform 0.4s';
  banner.style.opacity = '0';
  banner.style.transform = 'translateY(-100%)';
  setTimeout(() => {
    banner.classList.add('hidden');
    banner.style.opacity = '';
    banner.style.transform = '';
  }, 400);
}

function initOfflineCanvas() {
  const canvas = document.getElementById('offline-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;

  // Floating static particles
  const particles = Array.from({length: 60}, () => ({
    x: Math.random() * w, y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    size: Math.random() * 1.5 + 0.5,
    opacity: Math.random() * 0.4 + 0.05,
    hue: 330 + Math.random() * 40  // pink-red hues
  }));

  function draw() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue},100%,65%,${p.opacity})`;
      ctx.fill();
    });
    if (!document.getElementById('offline-screen').classList.contains('hidden')) {
      requestAnimationFrame(draw);
    }
  }

  // Re-start draw whenever offline screen shows
  const obs = new MutationObserver(() => {
    if (!document.getElementById('offline-screen').classList.contains('hidden')) {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      draw();
    }
  });
  obs.observe(document.getElementById('offline-screen'), {attributeFilter: ['class']});
  window.addEventListener('resize', () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; });
}

// ════════════════════════════════════════
// PARTICLE CANVAS (intro)
// ════════════════════════════════════════
function initParticleCanvas(id) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const particles = Array.from({length: 120}, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    size: Math.random() * 2 + 0.5,
    opacity: Math.random() * 0.6 + 0.1,
    hue: Math.random() * 60 + 170
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue},100%,70%,${p.opacity})`;
      ctx.fill();
      particles.slice(i + 1).forEach(p2 => {
        const dx = p.x - p2.x, dy = p.y - p2.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `hsla(${p.hue},100%,70%,${0.1*(1-dist/120)})`;
          ctx.lineWidth = 0.5; ctx.stroke();
        }
      });
    });
    requestAnimationFrame(draw);
  }
  draw();
  window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });
}

// ════════════════════════════════════════
// LOGIN CANVAS — matrix rain
// ════════════════════════════════════════
function initLoginCanvas() {
  const canvas = document.getElementById('login-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const cols = Math.floor(canvas.width / 20);
  const drops = Array(cols).fill(0).map(() => Math.random() * canvas.height);
  const chars = 'NEXARA01ΩΔΦ∑∞⬡◈⊕◉⌖⊞⊗⬢◇';

  function drawMatrix() {
    ctx.fillStyle = 'rgba(3,5,15,0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0,212,255,0.15)';
    ctx.font = '14px Space Mono, monospace';
    drops.forEach((y, i) => {
      ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 20, y);
      if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i] += 20;
    });
    requestAnimationFrame(drawMatrix);
  }
  drawMatrix();
}

// ════════════════════════════════════════
// INTRO
// ════════════════════════════════════════
function startLoaderProgress() {
  const fill = document.querySelector('.loader-fill');
  if (fill) fill.style.width = '100%';
}

function endIntro() {
  const overlay = document.getElementById('intro-overlay');
  if (!overlay) return;
  overlay.style.transition = 'opacity 0.8s ease';
  overlay.style.opacity = '0';
  setTimeout(() => {
    overlay.classList.add('hidden');
    showLoginPage();
  }, 800);
}

// ════════════════════════════════════════
// AUTH
// ════════════════════════════════════════
function showLoginPage() {
  if (state.user) { showMainApp(); return; }
  document.getElementById('login-page').classList.remove('hidden');
}

function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach((b, i) => b.classList.toggle('active', (tab === 'signin' ? i === 0 : i === 1)));
  document.getElementById('signin-form').classList.toggle('hidden', tab !== 'signin');
  document.getElementById('signup-form').classList.toggle('hidden', tab !== 'signup');
}

function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value.trim();
  if (!email || !pass) { showToast('Please enter email and password'); return; }
  showGlobalLoader();
  setTimeout(() => {
    hideGlobalLoader();
    state.user = { name: email.split('@')[0], email };
    saveState();
    loginSuccess();
  }, 1400);
}

function doSignup() {
  const name  = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const pass  = document.getElementById('signup-pass').value.trim();
  if (!name || !email || !pass) { showToast('Please fill all fields'); return; }
  showGlobalLoader();
  setTimeout(() => {
    hideGlobalLoader();
    state.user = { name, email };
    saveState();
    loginSuccess();
  }, 1400);
}

function guestLogin() {
  state.user = { name: 'Explorer', email: 'guest@nexara.com' };
  saveState();
  loginSuccess();
}

function loginSuccess() {
  const lp = document.getElementById('login-page');
  lp.style.transition = 'opacity 0.6s ease';
  lp.style.opacity = '0';
  setTimeout(() => { lp.classList.add('hidden'); showMainApp(); }, 600);
}

function doLogout() {
  state.user = null; saveState();
  document.getElementById('main-app').classList.add('hidden');
  document.getElementById('account-dropdown').classList.add('hidden');
  const lp = document.getElementById('login-page');
  lp.classList.remove('hidden');
  lp.style.opacity = '0';
  setTimeout(() => { lp.style.transition = 'opacity 0.5s'; lp.style.opacity = '1'; }, 50);
}

function showMainApp() {
  const app = document.getElementById('main-app');
  app.classList.remove('hidden');
  app.style.opacity = '0';
  setTimeout(() => { app.style.transition = 'opacity 0.6s ease'; app.style.opacity = '1'; }, 50);
  if (state.user) {
    document.getElementById('nav-username').textContent = state.user.name;
    const mn = document.getElementById('mobile-username');
    const me = document.getElementById('mobile-useremail');
    if (mn) mn.textContent = state.user.name;
    if (me) me.textContent = state.user.email || '';
  }
  updateCartCount();
  updateNavCity();
}

// ════════════════════════════════════════
// HERO SLIDER
// ════════════════════════════════════════
function startHeroSlider() {
  setInterval(() => {
    const slides = document.querySelectorAll('.hero-slide');
    const dots   = document.querySelectorAll('.hero-dot');
    slides[state.heroSlide].classList.remove('active');
    dots[state.heroSlide].classList.remove('active');
    state.heroSlide = (state.heroSlide + 1) % slides.length;
    slides[state.heroSlide].classList.add('active');
    dots[state.heroSlide].classList.add('active');
  }, 4000);
}

function goSlide(n) {
  document.querySelectorAll('.hero-slide')[state.heroSlide].classList.remove('active');
  document.querySelectorAll('.hero-dot')[state.heroSlide].classList.remove('active');
  state.heroSlide = n;
  document.querySelectorAll('.hero-slide')[n].classList.add('active');
  document.querySelectorAll('.hero-dot')[n].classList.add('active');
}

// ════════════════════════════════════════
// TICKER
// ════════════════════════════════════════
function buildTickerDeals() {
  const deals = PRODUCTS_DB.filter(p => p.badge === 'DEAL' || parseInt(p.discount) >= 27).slice(0, 10);
  const track = document.getElementById('ticker-track');
  if (!track) return;
  const items = deals.map(p =>
    `<span class="ticker-item">${p.emoji} <strong>${p.name}</strong> — ₹${p.price.toLocaleString('en-IN')} <span style="color:var(--neon-green)">${p.discount} OFF</span></span>`
  ).join('');
  track.innerHTML = items + items;
}

// ════════════════════════════════════════
// PRODUCTS
// ════════════════════════════════════════
function getFilteredProducts() {
  let products = [...PRODUCTS_DB];
  if (state.currentCategory !== 'all') products = products.filter(p => p.category === state.currentCategory);
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.desc && p.desc.toLowerCase().includes(q))
    );
  }
  return products;
}

function renderProducts(reset = false) {
  if (reset) state.displayedCount = 20;
  const grid     = document.getElementById('products-grid');
  const products = getFilteredProducts();
  const toShow   = products.slice(0, state.displayedCount);

  if (toShow.length === 0) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">⌕</div><h3>No products found</h3><p>Try a different search or category</p></div>`;
    document.getElementById('load-more-btn').style.display = 'none';
    return;
  }

  grid.innerHTML = toShow.map((p, i) => renderProductCard(p, i)).join('');
  const btn = document.getElementById('load-more-btn');
  btn.style.display = state.displayedCount >= products.length ? 'none' : '';
}

function renderProductCard(p, i) {
  const inWishlist = state.wishlist.includes(p.id);
  const delay = (i % 20) * 50;
  const badgeClass = p.badge === 'DEAL' ? 'deal' : p.badge === 'NEW' ? 'new' : 'top';
  return `
  <div class="product-card" style="animation-delay:${delay}ms" onclick="openProductDetail(${p.id})">
    ${p.badge ? `<div class="card-badge badge-${badgeClass}">${p.badge}</div>` : ''}
    <div class="card-wishlist" onclick="event.stopPropagation();toggleWishlistCard(${p.id},this)">${inWishlist ? '♥' : '♡'}</div>
    <div class="card-image-wrap">
      <div class="card-emoji">${p.emoji}</div>
    </div>
    <div class="card-body">
      <div class="card-category">${p.category}</div>
      <div class="card-name">${p.name}</div>
      <div class="card-rating">
        <span class="stars">${renderStars(p.rating)}</span>
        <span class="rating-count">(${p.reviews.toLocaleString('en-IN')})</span>
      </div>
      <div class="card-price-wrap">
        <span class="card-price">₹${p.price.toLocaleString('en-IN')}</span>
        <span class="card-original">₹${p.original.toLocaleString('en-IN')}</span>
        <span class="card-discount">${p.discount} off</span>
      </div>
      <button class="card-add-btn" onclick="event.stopPropagation();quickAddToCart(${p.id})">⊡ Add to Cart</button>
    </div>
  </div>`;
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - half);
}

function loadMore() {
  state.displayedCount += 20;
  renderProducts();
}

function filterCategory(cat, btnEl) {
  state.currentCategory = cat;
  state.searchQuery     = '';
  document.getElementById('search-input').value = '';
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  else {
    const map = {all:0,electronics:1,fashion:2,gaming:3,home:4,sports:5,beauty:6,books:7,automotive:8,health:9,toys:10,food:11};
    const btns = document.querySelectorAll('.cat-btn');
    if (btns[map[cat] ?? 0]) btns[map[cat] ?? 0].classList.add('active');
  }
  const titles = {all:'Featured Products',electronics:'Electronics',fashion:'Fashion & Apparel',gaming:'Gaming',home:'Home & Living',sports:'Sports & Fitness',beauty:'Beauty & Wellness',books:'Books & Media',automotive:'Automotive',health:'Health & Medicine',toys:'Toys & Games',food:'Food & Grocery'};
  document.getElementById('section-title').textContent = titles[cat] || 'Products';
  renderProducts(true);
  document.getElementById('products-section').scrollIntoView({behavior:'smooth', block:'start'});
}

function searchProducts() {
  state.searchQuery = document.getElementById('search-input').value.trim();
  document.getElementById('section-title').textContent = state.searchQuery ? `Results for "${state.searchQuery}"` : 'Featured Products';
  renderProducts(true);
}

function goHome() {
  state.currentCategory = 'all';
  state.searchQuery     = '';
  document.getElementById('search-input').value = '';
  document.querySelectorAll('.cat-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
  document.getElementById('section-title').textContent = 'Featured Products';
  renderProducts(true);
  window.scrollTo({top: 0, behavior: 'smooth'});
}

// ════════════════════════════════════════
// PRODUCT DETAIL
// ════════════════════════════════════════
function openProductDetail(id) {
  const p = PRODUCTS_DB.find(x => x.id === id);
  if (!p) return;
  state.currentProduct      = p;
  state.currentQty          = 1;
  state.currentReviewIndex  = 0;

  // Emoji in frame
  const imgFrame = document.querySelector('.detail-img-frame');
  imgFrame.querySelectorAll('.detail-emoji-big').forEach(e => e.remove());
  const emojiEl = document.createElement('div');
  emojiEl.className = 'detail-emoji-big';
  emojiEl.style.cssText = 'font-size:9rem;filter:drop-shadow(0 0 30px rgba(0,212,255,0.3));z-index:1;position:relative;';
  emojiEl.textContent = p.emoji;
  imgFrame.appendChild(emojiEl);

  document.getElementById('detail-badge').textContent   = `◈ ${p.category.toUpperCase()}`;
  document.getElementById('detail-title').textContent   = p.name;
  document.getElementById('detail-rating').innerHTML    = `<span class="stars">${renderStars(p.rating)}</span><span>${p.rating}</span><span style="color:var(--text-muted)">(${p.reviews.toLocaleString('en-IN')} reviews)</span>`;
  document.getElementById('detail-price').textContent   = `₹${p.price.toLocaleString('en-IN')}`;
  document.getElementById('detail-original').textContent = `₹${p.original.toLocaleString('en-IN')}`;
  document.getElementById('detail-discount').textContent = `${p.discount} off`;
  document.getElementById('detail-desc').textContent    = p.desc;
  document.getElementById('qty-display').textContent    = '1';

  document.getElementById('detail-specs').innerHTML = Object.entries(p.specs || {}).map(([k,v]) =>
    `<div class="spec-item"><span class="spec-key">${k}:</span><span class="spec-val">${v}</span></div>`
  ).join('');

  const del = new Date();
  del.setDate(del.getDate() + Math.floor(Math.random() * 5) + 3);
  document.getElementById('delivery-date').textContent = del.toDateString();

  document.getElementById('detail-thumbs').innerHTML = [p.emoji, p.emoji, p.emoji].map((e, i) =>
    `<div class="detail-thumb ${i===0?'active':''}">${e}</div>`
  ).join('');

  // Wishlist button state
  const wb = document.getElementById('wishlist-toggle-btn');
  wb.textContent = state.wishlist.includes(p.id) ? '♥' : '♡';
  wb.style.color = state.wishlist.includes(p.id) ? 'var(--neon-pink)' : '';

  loadReview();

  const overlay = document.getElementById('product-overlay');
  overlay.classList.remove('hidden');
  overlay.scrollTop = 0;
  document.body.style.overflow = 'hidden';
}

function closeProductDetail() {
  const overlay = document.getElementById('product-overlay');
  overlay.style.transition = 'opacity 0.3s';
  overlay.style.opacity = '0';
  setTimeout(() => {
    overlay.classList.add('hidden');
    overlay.style.opacity = '';
    overlay.style.transition = '';
    document.body.style.overflow = '';
    overlay.querySelectorAll('.detail-emoji-big').forEach(e => e.remove());
  }, 300);
}

function changeQty(delta) {
  state.currentQty = Math.max(1, Math.min(10, state.currentQty + delta));
  document.getElementById('qty-display').textContent = state.currentQty;
}

function addToCartFromDetail() {
  if (!state.currentProduct) return;
  for (let i = 0; i < state.currentQty; i++) addToCart(state.currentProduct.id);
  showToast(`⊡ Added ${state.currentQty}× ${state.currentProduct.name} to cart`);
  animateCartCount();
}

function buyNow() {
  addToCartFromDetail();
  closeProductDetail();
  setTimeout(() => openCart(), 350);
}

function toggleWishlist() {
  if (!state.currentProduct) return;
  const id = state.currentProduct.id;
  const idx = state.wishlist.indexOf(id);
  if (idx === -1) { state.wishlist.push(id); showToast('♥ Added to wishlist'); }
  else            { state.wishlist.splice(idx, 1); showToast('♡ Removed from wishlist'); }
  const wb = document.getElementById('wishlist-toggle-btn');
  wb.textContent = state.wishlist.includes(id) ? '♥' : '♡';
  wb.style.color = state.wishlist.includes(id) ? 'var(--neon-pink)' : '';
  saveState();
}

// ════════════════════════════════════════
// REVIEWS
// ════════════════════════════════════════
function loadReview() {
  const reviews = REVIEWS_DB.default;
  const r = reviews[state.currentReviewIndex];
  if (!r) return;
  const card = document.getElementById('review-card');
  card.style.animation = 'none';
  card.offsetHeight; // reflow
  card.style.animation = 'reviewSlide 0.4s ease';
  document.getElementById('review-avatar').textContent = r.avatar;
  document.getElementById('review-name').textContent   = r.name;
  document.getElementById('review-stars').textContent  = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
  document.getElementById('review-text').textContent   = r.text;
  document.getElementById('review-date').textContent   = r.date;
  document.getElementById('review-index').textContent  = `${state.currentReviewIndex + 1} / ${reviews.length}`;
}

function nextReview() {
  state.currentReviewIndex = (state.currentReviewIndex + 1) % REVIEWS_DB.default.length;
  loadReview();
}

function prevReview() {
  state.currentReviewIndex = (state.currentReviewIndex - 1 + REVIEWS_DB.default.length) % REVIEWS_DB.default.length;
  loadReview();
}

// ════════════════════════════════════════
// CART
// ════════════════════════════════════════
function quickAddToCart(id) {
  addToCart(id);
  const p = PRODUCTS_DB.find(x => x.id === id);
  showToast(`⊡ ${p ? p.name : 'Item'} added to cart!`);
  animateCartCount();
}

function addToCart(id) {
  const existing = state.cart.find(i => i.id === id);
  if (existing) { existing.qty++; }
  else {
    const p = PRODUCTS_DB.find(x => x.id === id);
    if (p) state.cart.push({id, qty:1, price:p.price, name:p.name, emoji:p.emoji});
  }
  updateCartCount();
  saveState();
}

function updateCartCount() {
  const total = state.cart.reduce((s, i) => s + i.qty, 0);
  // Desktop nav badge
  const el = document.getElementById('cart-count');
  el.textContent = total;
  el.classList.toggle('hidden', total === 0);
  // Mobile bottom-nav badge
  const mbnBadge = document.getElementById('mbn-cart-count');
  if (mbnBadge) {
    mbnBadge.textContent = total;
    mbnBadge.classList.toggle('hidden', total === 0);
  }
}

function animateCartCount() {
  const el = document.querySelector('.nav-cart');
  if (!el) return;
  el.style.transform = 'scale(1.2)';
  setTimeout(() => { el.style.transform = ''; }, 300);
}

function openCart() {
  renderCartItems();
  document.getElementById('cart-overlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cart-overlay').classList.add('hidden');
  document.body.style.overflow = '';
}

function renderCartItems() {
  const container = document.getElementById('cart-items');
  if (state.cart.length === 0) {
    container.innerHTML = `<div class="empty-cart"><div class="empty-icon">⊡</div><p>Your cart is empty</p><p style="font-size:0.8rem;color:var(--text-muted)">Explore our futuristic products!</p></div>`;
    document.getElementById('cart-total-price').textContent = '₹0';
    return;
  }
  container.innerHTML = state.cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-emoji">${item.emoji}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="cartQty(${item.id},-1)">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn" onclick="cartQty(${item.id},1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${item.id})">✕</button>
    </div>
  `).join('');
  const total = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById('cart-total-price').textContent = `₹${total.toLocaleString('en-IN')}`;
}

function cartQty(id, delta) {
  const item = state.cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  updateCartCount(); saveState(); renderCartItems();
}

function removeFromCart(id) {
  state.cart = state.cart.filter(i => i.id !== id);
  updateCartCount(); saveState(); renderCartItems();
}

function toggleWishlistCard(id, el) {
  const idx = state.wishlist.indexOf(id);
  if (idx === -1) { state.wishlist.push(id); el.textContent = '♥'; el.style.color = 'var(--neon-pink)'; showToast('♥ Added to wishlist'); }
  else            { state.wishlist.splice(idx, 1); el.textContent = '♡'; el.style.color = ''; showToast('♡ Removed from wishlist'); }
  saveState();
}

function showWishlist() {
  const items = state.wishlist.map(id => PRODUCTS_DB.find(p => p.id === id)).filter(Boolean);
  if (!items.length) { showToast('Your wishlist is empty'); return; }
  closeAccountMenu();
  document.getElementById('section-title').textContent = '♥ Your Wishlist';
  document.getElementById('products-grid').innerHTML = items.map((p, i) => renderProductCard(p, i)).join('');
  document.getElementById('load-more-btn').style.display = 'none';
  document.getElementById('products-section').scrollIntoView({behavior:'smooth'});
}

// ════════════════════════════════════════
// CHECKOUT
// ════════════════════════════════════════

// Tracks which step we're on: 1 = address, 2 = payment, 3 = confirmed
let checkoutStep = 1;

function setCheckoutStep(step) {
  checkoutStep = step;
  [1,2,3].forEach(n => {
    document.getElementById(`checkout-step-${n}`).classList.toggle('hidden', n !== step);
  });
  // Scroll modal body back to top on each step change
  const body = document.getElementById('checkout-body');
  if (body) body.scrollTop = 0;

  const titles = { 1:'⌖ Delivery Address', 2:'⚡ Payment', 3:'✓ Order Confirmed' };
  const titleEl = document.getElementById('checkout-header-title');
  if (titleEl) titleEl.textContent = titles[step] || '';

  const btn = document.getElementById('checkout-action-btn');
  const footer = document.getElementById('checkout-footer');
  if (step === 1) {
    btn.textContent = 'Proceed to Payment ›';
    btn.style.display = '';
    footer.style.display = '';
  } else if (step === 2) {
    btn.textContent = '⚡ Pay Now';
    btn.style.display = '';
    footer.style.display = '';
  } else {
    // Step 3: hide footer button — close button shown inline
    footer.style.display = 'none';
    // Inject close button into success view
    const success = document.querySelector('#checkout-step-3 .order-success');
    if (success && !success.querySelector('.inline-close-btn')) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'cyber-btn inline-close-btn';
      closeBtn.style.cssText = 'width:100%;margin-top:24px';
      closeBtn.textContent = 'Continue Shopping ›';
      closeBtn.onclick = () => { closeCheckout(); goHome(); };
      success.appendChild(closeBtn);
    }
  }
}

// Single dispatcher for the unified footer action button
function checkoutAction() {
  if (checkoutStep === 1) goToPayment();
  else if (checkoutStep === 2) processPayment();
}

function startCheckout() {
  if (!state.cart.length) { showToast('Your cart is empty!'); return; }
  closeCart();
  setTimeout(() => {
    document.getElementById('checkout-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    // Reset
    const success = document.querySelector('#checkout-step-3 .order-success');
    if (success) { const b = success.querySelector('.inline-close-btn'); if (b) b.remove(); }
    setCheckoutStep(1);
  }, 300);
}

function closeCheckout() {
  document.getElementById('checkout-modal').classList.add('hidden');
  document.body.style.overflow = '';
  checkoutStep = 1;
}

function goToPayment() {
  const name    = document.getElementById('addr-name').value.trim();
  const phone   = document.getElementById('addr-phone').value.trim();
  const pincode = document.getElementById('addr-pincode').value.trim();
  const street  = document.getElementById('addr-street').value.trim();
  if (!name || !phone || !pincode || !street) { showToast('Please fill all address fields'); return; }
  state.deliveryAddress = {name, phone, pincode, street,
    city:  document.getElementById('addr-city').value  || 'City',
    state: document.getElementById('addr-state').value || 'State'
  };
  const total    = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = total > 5000 ? 0 : 49;
  document.getElementById('order-summary').innerHTML = `
    ${state.cart.map(i => `<div class="order-summary-item"><span>${i.emoji} ${i.name} ×${i.qty}</span><span>₹${(i.price*i.qty).toLocaleString('en-IN')}</span></div>`).join('')}
    <div class="order-summary-item"><span>Delivery</span><span>${delivery===0?'<span style="color:var(--neon-green)">FREE</span>':'₹'+delivery}</span></div>
    <div class="order-summary-total"><span>Total</span><span>₹${(total+delivery).toLocaleString('en-IN')}</span></div>
  `;
  setCheckoutStep(2);
}

function selectPayment(type, el) {
  state.selectedPayment = type;
  document.querySelectorAll('.pay-option').forEach(e => e.classList.remove('selected'));
  if (el) el.classList.add('selected');
  ['upi-form','card-form'].forEach(id => document.getElementById(id).classList.add('hidden'));
  const f = document.getElementById(`${type}-form`);
  if (f) f.classList.remove('hidden');
}

function processPayment() {
  if (!state.selectedPayment) { showToast('Please select a payment method'); return; }
  showGlobalLoader();
  setTimeout(() => { hideGlobalLoader(); completeOrder(); }, 2000);
}

function completeOrder() {
  const orderId  = 'NX' + Date.now().toString(36).toUpperCase();
  const delivery = new Date();
  delivery.setDate(delivery.getDate() + Math.floor(Math.random() * 4) + 3);
  const order = {
    id: orderId,
    items: [...state.cart],
    total: state.cart.reduce((s, i) => s + i.price * i.qty, 0),
    date: new Date().toLocaleDateString('en-IN'),
    status: 'Processing',
    delivery: delivery.toDateString(),
    address: state.deliveryAddress,
    payment: state.selectedPayment,
    cancelled: false
  };
  state.orders.unshift(order);
  state.cart = [];
  updateCartCount();
  saveState();
  document.getElementById('order-id-display').textContent = orderId;
  document.getElementById('est-delivery').textContent     = delivery.toDateString();
  setCheckoutStep(3);
}

// ════════════════════════════════════════
// CANCEL ORDER
// ════════════════════════════════════════
function openCancelModal(orderId) {
  const order = state.orders.find(o => o.id === orderId);
  if (!order) return;
  state.cancelTargetOrderId = orderId;
  state.cancelReason = null;

  document.getElementById('cancel-confirm-view').classList.remove('hidden');
  document.getElementById('cancel-success-view').classList.add('hidden');
  document.getElementById('cancel-order-info').innerHTML =
    `Order <strong style="color:var(--neon-cyan)">#${order.id}</strong> — ${order.items.length} item(s) — ₹${order.total.toLocaleString('en-IN')}`;

  document.querySelectorAll('.reason-btn').forEach(b => b.classList.remove('selected'));

  // Reset footer buttons to initial confirm state
  _resetCancelFooter();

  document.getElementById('cancel-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function _resetCancelFooter() {
  const keepBtn    = document.getElementById('cancel-keep-btn');
  const confirmBtn = document.getElementById('cancel-confirm-btn');
  if (keepBtn) {
    keepBtn.style.display = '';
    keepBtn.textContent   = 'Keep Order';
    keepBtn.onclick       = closeCancelModal;
  }
  if (confirmBtn) {
    confirmBtn.disabled       = true;
    confirmBtn.style.opacity  = '0.4';
    confirmBtn.style.border   = '';
    confirmBtn.style.color    = '';
    confirmBtn.textContent    = 'Cancel Order';
    confirmBtn.onclick        = confirmCancelOrder;
  }
}

function closeCancelModal() {
  document.getElementById('cancel-modal').classList.add('hidden');
  document.body.style.overflow = '';
  state.cancelTargetOrderId = null;
  state.cancelReason = null;
}

function selectReason(el, reason) {
  document.querySelectorAll('.reason-btn').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
  state.cancelReason = reason;
  const btn = document.getElementById('cancel-confirm-btn');
  btn.disabled      = false;
  btn.style.opacity = '1';
}

function confirmCancelOrder() {
  if (!state.cancelTargetOrderId || !state.cancelReason) return;
  const order = state.orders.find(o => o.id === state.cancelTargetOrderId);
  if (!order) return;
  order.status      = 'Cancelled';
  order.cancelled   = true;
  order.cancelReason = state.cancelReason;
  saveState();

  // Swap body to success view
  document.getElementById('cancel-confirm-view').classList.add('hidden');
  document.getElementById('cancel-success-view').classList.remove('hidden');

  // Swap footer: hide "Keep Order", change confirm btn to "Done"
  const keepBtn    = document.getElementById('cancel-keep-btn');
  const confirmBtn = document.getElementById('cancel-confirm-btn');
  if (keepBtn)    keepBtn.style.display = 'none';
  if (confirmBtn) {
    confirmBtn.disabled      = false;
    confirmBtn.style.opacity = '1';
    confirmBtn.style.border  = '1px solid var(--neon-green)';
    confirmBtn.style.color   = 'var(--neon-green)';
    confirmBtn.textContent   = '✓ Done';
    confirmBtn.onclick       = closeCancelModal;
  }

  // Refresh order list if visible
  if (!document.getElementById('order-history-modal').classList.contains('hidden')) {
    renderOrderList();
  }
}

// ════════════════════════════════════════
// ORDER HISTORY
// ════════════════════════════════════════
function showOrderHistory() {
  closeAccountMenu();
  renderOrderList();
  document.getElementById('order-history-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function renderOrderList() {
  const list = document.getElementById('order-list');
  if (!state.orders.length) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">⊞</div><h3>No orders yet</h3><p>Your order history will appear here</p></div>`;
    return;
  }
  list.innerHTML = state.orders.map(o => `
    <div class="order-item">
      <div class="order-item-header">
        <div>
          <div class="order-id">Order #${o.id}</div>
          <div class="order-date">${o.date}</div>
        </div>
        <span class="order-status status-${o.status.toLowerCase()}">${o.status}</span>
      </div>
      <div class="order-products">${o.items.map(i => `${i.emoji} ${i.name} ×${i.qty}`).join(', ')}</div>
      <div class="order-total">₹${o.total.toLocaleString('en-IN')}</div>
      ${o.delivery ? `<div style="font-size:0.8rem;color:var(--text-muted);margin-top:4px">Est. Delivery: ${o.delivery}</div>` : ''}
      ${!o.cancelled ? `<button class="cancel-order-btn" onclick="closeOrderHistory();setTimeout(()=>openCancelModal('${o.id}'),200)">⊗ Cancel Order</button>` : `<div style="font-size:0.8rem;color:var(--neon-pink);margin-top:8px">✕ Cancelled — ${o.cancelReason || ''}</div>`}
    </div>
  `).join('');
}

function closeOrderHistory() {
  document.getElementById('order-history-modal').classList.add('hidden');
  document.body.style.overflow = '';
}

// ════════════════════════════════════════
// LOCATION
// ════════════════════════════════════════
function openLocationModal() {
  document.getElementById('location-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeLocationModal() {
  document.getElementById('location-modal').classList.add('hidden');
  document.body.style.overflow = '';
}

function selectCity(city) {
  state.navCity = city;
  updateNavCity();
  saveState();
  closeLocationModal();
  showToast(`⌖ Delivering to ${city}`);
}

function updateNavCity() {
  const el = document.getElementById('nav-city');
  if (el) el.textContent = state.navCity;
  const mc = document.getElementById('mobile-city');
  if (mc) mc.textContent = state.navCity;
}

function filterCities() {
  const q = document.getElementById('loc-input').value.toLowerCase();
  document.querySelectorAll('.city-item').forEach(item => {
    item.style.display = item.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

// ════════════════════════════════════════
// ACCOUNT DROPDOWN
// ════════════════════════════════════════
function toggleAccountMenu() {
  document.getElementById('account-dropdown').classList.toggle('hidden');
}

function closeAccountMenu() {
  document.getElementById('account-dropdown').classList.add('hidden');
}

document.addEventListener('click', e => {
  if (!e.target.closest('.nav-account')) closeAccountMenu();
});

// ════════════════════════════════════════
// AI CHATBOT — NAVI  (smart local + API)
// ════════════════════════════════════════
function toggleChatbot() {
  document.getElementById('chatbot-panel').classList.toggle('hidden');
}

function chatKeydown(e) {
  if (e.key === 'Enter') sendChat();
}

// Build detailed product catalogue context for AI
function buildProductContext() {
  const categories = [...new Set(PRODUCTS_DB.map(p => p.category))];
  const catSummary = categories.map(cat => {
    const items = PRODUCTS_DB.filter(p => p.category === cat);
    const cheapest = items.reduce((a,b) => a.price < b.price ? a : b);
    const priciest = items.reduce((a,b) => a.price > b.price ? a : b);
    return `${cat} (${items.length} products, ₹${cheapest.price.toLocaleString('en-IN')}–₹${priciest.price.toLocaleString('en-IN')})`;
  }).join(', ');

  const topDeals = PRODUCTS_DB
    .filter(p => p.badge === 'DEAL')
    .slice(0, 5)
    .map(p => `${p.emoji} ${p.name} at ₹${p.price.toLocaleString('en-IN')} (${p.discount} off)`)
    .join('; ');

  const cartInfo = state.cart.length > 0
    ? `Cart has ${state.cart.length} item(s): ${state.cart.map(i=>`${i.name}×${i.qty}`).join(', ')}. Total: ₹${state.cart.reduce((s,i)=>s+i.price*i.qty,0).toLocaleString('en-IN')}`
    : 'Cart is currently empty.';

  const orderInfo = state.orders.length > 0
    ? state.orders.slice(0,3).map(o=>`Order #${o.id} (${o.status}, ${o.date}, ₹${o.total.toLocaleString('en-IN')})`).join('; ')
    : 'No orders placed yet.';

  return `You are NAVI, the intelligent AI shopping assistant for NEXARA — a futuristic e-commerce website.

WEBSITE INFO:
- Name: Nexara | Tagline: "The Future of Commerce" | Copyright: 2026
- Categories: ${catSummary}
- Total Products: ${PRODUCTS_DB.length}+
- Current flash deals: ${topDeals}

USER CONTEXT:
- User: ${state.user?.name || 'Guest'} (${state.user?.email || 'guest'})
- Location: ${state.navCity}
- ${cartInfo}
- Recent Orders: ${orderInfo}

POLICIES:
- Free delivery on orders above ₹5,000
- Cash on Delivery available
- UPI & Card payments accepted
- Cancellation allowed before shipment
- Refund in 3–5 business days after cancellation

HOW TO RESPOND:
- Be helpful, concise, and friendly with a futuristic tone
- Use ✦ or ⚡ occasionally but not excessively
- Answer product questions with specific names, prices, categories
- For order/cart queries, reference the actual data above
- Keep responses under 120 words unless a list is needed
- If asked for recommendations, suggest specific real products from the catalogue
- Do NOT give the same generic response every time — be specific to the question`;
}

async function sendChat() {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';

  appendChatMsg('user', msg);
  showTypingIndicator();

  // First try smart local responses for common queries
  const local = getLocalResponse(msg.toLowerCase());
  if (local) {
    setTimeout(() => {
      removeTypingIndicator();
      appendChatMsg('ai', local);
      state.chatHistory.push({role:'user', content:msg});
      state.chatHistory.push({role:'assistant', content:local});
    }, 700 + Math.random() * 500);
    return;
  }

  // Fall back to Claude API for complex queries
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: buildProductContext(),
        messages: [
          ...state.chatHistory.slice(-8),
          {role: 'user', content: msg}
        ]
      })
    });

    const data = await response.json();
    const reply = data.content?.find(b => b.type === 'text')?.text
      || 'I had trouble processing that. Could you rephrase? ✦';

    removeTypingIndicator();
    appendChatMsg('ai', reply);
    state.chatHistory.push({role:'user', content:msg});
    state.chatHistory.push({role:'assistant', content:reply});
    if (state.chatHistory.length > 20) state.chatHistory = state.chatHistory.slice(-20);

  } catch(err) {
    removeTypingIndicator();
    // Provide a smart fallback even without API
    appendChatMsg('ai', getOfflineFallback(msg.toLowerCase()));
  }
}

// Smart local responses for common queries — avoids API round-trip
function getLocalResponse(q) {
  // Cart queries
  if (q.includes('cart') || q.includes('basket')) {
    if (!state.cart.length) return 'Your cart is empty ⊡ — browse our 200+ products and add something futuristic!';
    const total = state.cart.reduce((s,i)=>s+i.price*i.qty,0);
    return `Your cart has ${state.cart.length} item(s) totalling ₹${total.toLocaleString('en-IN')} ✦ — ${state.cart.map(i=>`${i.emoji} ${i.name}×${i.qty}`).join(', ')}.`;
  }
  // Orders
  if (q.includes('my order') || q.includes('order status') || q.includes('order history')) {
    if (!state.orders.length) return 'You haven\'t placed any orders yet! Browse products and place your first order. ⚡';
    const latest = state.orders[0];
    return `Your latest order is #${latest.id} — Status: ${latest.status}, placed on ${latest.date}. Total: ₹${latest.total.toLocaleString('en-IN')}. ✦`;
  }
  // Delivery
  if (q.includes('delivery') || q.includes('shipping') || q.includes('deliver')) {
    return 'Free delivery on orders above ₹5,000 ⚡ Standard delivery takes 3–7 business days. Express options available at checkout!';
  }
  // Return / cancel
  if (q.includes('cancel') || q.includes('cancell')) {
    return 'To cancel an order, go to Orders → select the order → tap "Cancel Order" ⊗. Cancellations are allowed before shipment, with refund in 3–5 business days.';
  }
  if (q.includes('return') || q.includes('refund')) {
    return 'Refunds are processed in 3–5 business days after cancellation ✦ For delivered items, contact support within 7 days for returns.';
  }
  // Payment
  if (q.includes('payment') || q.includes('pay') || q.includes('upi') || q.includes('cod')) {
    return 'Nexara accepts ⚡ UPI (Google Pay, PhonePe, Paytm), ◈ Credit/Debit Cards, and ⊞ Cash on Delivery. All payments are quantum-secured!';
  }
  // Categories / deals
  if (q.includes('deal') || q.includes('offer') || q.includes('discount')) {
    const deals = PRODUCTS_DB.filter(p=>p.badge==='DEAL').slice(0,3);
    return `Today's top deals: ${deals.map(p=>`${p.emoji} ${p.name} at ₹${p.price.toLocaleString('en-IN')} (${p.discount} off)`).join(' | ')} ⚡`;
  }
  if (q.includes('electronic') || q.includes('phone') || q.includes('laptop')) {
    const items = PRODUCTS_DB.filter(p=>p.category==='electronics').slice(0,3);
    return `Top electronics: ${items.map(p=>`${p.emoji} ${p.name} (₹${p.price.toLocaleString('en-IN')})`).join(', ')} ✦ We have ${PRODUCTS_DB.filter(p=>p.category==='electronics').length} electronics products!`;
  }
  if (q.includes('gaming') || q.includes('game') || q.includes('console')) {
    const items = PRODUCTS_DB.filter(p=>p.category==='gaming').slice(0,3);
    return `Top gaming picks: ${items.map(p=>`${p.emoji} ${p.name} at ₹${p.price.toLocaleString('en-IN')}`).join(', ')} ⚡ Check the Gaming category for more!`;
  }
  if (q.includes('fashion') || q.includes('clothing') || q.includes('dress') || q.includes('shoe')) {
    const items = PRODUCTS_DB.filter(p=>p.category==='fashion').slice(0,3);
    return `Trending fashion: ${items.map(p=>`${p.emoji} ${p.name} (₹${p.price.toLocaleString('en-IN')})`).join(', ')} ✦ All smart fabrics for 2026!`;
  }
  // Location
  if (q.includes('location') || q.includes('deliver to') || q.includes('city') || q.includes('pincode')) {
    return `Currently delivering to: ${state.navCity} ⌖ — click the location icon in the navbar to change your delivery address!`;
  }
  // Price / product count
  if (q.includes('how many product') || q.includes('total product')) {
    return `Nexara has ${PRODUCTS_DB.length}+ products across ${[...new Set(PRODUCTS_DB.map(p=>p.category))].length} categories ✦ From electronics to groceries, we have it all!`;
  }
  // Greetings
  if (q.match(/^(hi|hello|hey|namaste|hola|sup)\b/)) {
    return `Hey ${state.user?.name || 'there'}! 👋 Welcome to Nexara ✦ I'm NAVI, your neural shopping assistant. What can I help you with today?`;
  }
  if (q.includes('thank')) {
    return 'You\'re welcome ✦ Happy to help! Is there anything else you\'d like to know about Nexara?';
  }
  return null; // Let API handle it
}

function getOfflineFallback(q) {
  if (q.includes('product') || q.includes('buy') || q.includes('shop')) {
    const random = PRODUCTS_DB[Math.floor(Math.random() * 20)];
    return `Check out ${random.emoji} ${random.name} at ₹${random.price.toLocaleString('en-IN')} ✦ Browse all ${PRODUCTS_DB.length}+ products in the catalogue!`;
  }
  return `I'm NAVI ✦ — your Nexara AI assistant. Ask me about our ${PRODUCTS_DB.length}+ products, orders, delivery, payments, or anything on the site!`;
}

function appendChatMsg(role, text) {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  div.innerHTML = `<span class="msg-avatar">${role==='ai'?'⬡':'◈'}</span><div class="msg-bubble">${text}</div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function showTypingIndicator() {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'chat-msg ai'; div.id = 'typing-indicator';
  div.innerHTML = `<span class="msg-avatar">⬡</span><div class="msg-bubble chat-typing"><span></span><span></span><span></span></div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function removeTypingIndicator() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

// ════════════════════════════════════════
// GLOBAL LOADER / TOAST
// ════════════════════════════════════════
function showGlobalLoader() { document.getElementById('global-loader').classList.remove('hidden'); }
function hideGlobalLoader() { document.getElementById('global-loader').classList.add('hidden'); }

let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 3000);
}

// ════════════════════════════════════════
// KEYBOARD SHORTCUTS
// ════════════════════════════════════════
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeProductDetail();
    closeCart();
    closeCheckout();
    closeOrderHistory();
    closeLocationModal();
    closeCancelModal();
    closeMobileMenu();
  }
});

// ════════════════════════════════════════
// MOBILE MENU
// ════════════════════════════════════════
function toggleMobileMenu() {
  const menu    = document.getElementById('mobile-menu');
  const overlay = document.getElementById('mobile-menu-overlay');
  const btn     = document.getElementById('hamburger-btn');
  const isOpen  = menu.classList.contains('open');
  if (isOpen) {
    closeMobileMenu();
  } else {
    menu.classList.add('open');
    overlay.style.display = 'block';
    btn.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeMobileMenu() {
  const menu    = document.getElementById('mobile-menu');
  const overlay = document.getElementById('mobile-menu-overlay');
  const btn     = document.getElementById('hamburger-btn');
  menu.classList.remove('open');
  overlay.style.display = 'none';
  btn.classList.remove('open');
  document.body.style.overflow = '';
}

// Mobile search (syncs with desktop search)
function mobileSearch() {
  const val = document.getElementById('mobile-search-input').value;
  document.getElementById('search-input').value = val;
  state.searchQuery = val.trim();
  document.getElementById('section-title').textContent = val.trim()
    ? `Results for "${val.trim()}"` : 'Featured Products';
  renderProducts(true);
}

// ════════════════════════════════════════
// SWIPE-TO-CLOSE PRODUCT DETAIL (mobile)
// ════════════════════════════════════════
(function initSwipeClose() {
  let startY = 0;
  document.addEventListener('touchstart', e => {
    startY = e.touches[0].clientY;
  }, {passive: true});

  document.addEventListener('touchend', e => {
    const overlay = document.getElementById('product-overlay');
    if (!overlay || overlay.classList.contains('hidden')) return;
    const deltaY = e.changedTouches[0].clientY - startY;
    // Swipe down > 80px from top of screen = close
    if (deltaY > 80 && startY < 120) {
      closeProductDetail();
    }
  }, {passive: true});
})();

// ════════════════════════════════════════
// SWIPE HERO SLIDES (mobile touch)
// ════════════════════════════════════════
(function initHeroSwipe() {
  const hero = document.getElementById('hero-section');
  if (!hero) return;
  let sx = 0;
  hero.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, {passive: true});
  hero.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - sx;
    const total = document.querySelectorAll('.hero-slide').length;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) goSlide((state.heroSlide + 1) % total);
    else        goSlide((state.heroSlide - 1 + total) % total);
  }, {passive: true});
})();

// ════════════════════════════════════════
// RESIZE HANDLER — reset mobile menu on desktop
// ════════════════════════════════════════
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    closeMobileMenu();
  }
});

