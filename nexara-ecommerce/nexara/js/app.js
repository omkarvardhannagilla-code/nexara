// ══════════════════════════════════════════════
// NEXARA — MAIN APPLICATION
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
  navCity: 'Select Location'
};

// ── INIT ──
window.addEventListener('DOMContentLoaded', () => {
  initParticleCanvas('particle-canvas');
  setTimeout(() => {
    startLoaderProgress();
  }, 3000);
  setTimeout(() => {
    endIntro();
  }, 6500);
  loadState();
  buildTickerDeals();
  startHeroSlider();
  renderProducts();
  initLoginCanvas();
});

function loadState() {
  try {
    const saved = localStorage.getItem('nexara_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      state.cart = parsed.cart || [];
      state.wishlist = parsed.wishlist || [];
      state.orders = parsed.orders || [];
      state.user = parsed.user || null;
    }
  } catch(e) {}
}

function saveState() {
  try {
    localStorage.setItem('nexara_state', JSON.stringify({
      cart: state.cart,
      wishlist: state.wishlist,
      orders: state.orders,
      user: state.user
    }));
  } catch(e) {}
}

// ════════════════════════════════════════
// INTRO ANIMATION
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
// PARTICLE CANVAS
// ════════════════════════════════════════
function initParticleCanvas(id) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const count = 120;

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.6 + 0.1,
      hue: Math.random() * 60 + 170
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${p.opacity})`;
      ctx.fill();

      // Connect nearby particles
      particles.slice(i + 1).forEach(p2 => {
        const dx = p.x - p2.x, dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `hsla(${p.hue}, 100%, 70%, ${0.1 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
    });
    requestAnimationFrame(draw);
  }
  draw();

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// ════════════════════════════════════════
// LOGIN CANVAS
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
    ctx.fillStyle = 'rgba(3, 5, 15, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(0, 212, 255, 0.15)';
    ctx.font = '14px Space Mono, monospace';

    drops.forEach((y, i) => {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(char, i * 20, y);
      if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i] += 20;
    });
    requestAnimationFrame(drawMatrix);
  }
  drawMatrix();
}

// ════════════════════════════════════════
// LOGIN / AUTH
// ════════════════════════════════════════
function showLoginPage() {
  if (state.user) {
    showMainApp();
    return;
  }
  document.getElementById('login-page').classList.remove('hidden');
}

function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('signin-form').classList.add('hidden');
  document.getElementById('signup-form').classList.add('hidden');

  if (tab === 'signin') {
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
    document.getElementById('signin-form').classList.remove('hidden');
  } else {
    document.querySelectorAll('.tab-btn')[1].classList.add('active');
    document.getElementById('signup-form').classList.remove('hidden');
  }
}

function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value.trim();
  if (!email || !pass) { showToast('Please enter email and password'); return; }

  showGlobalLoader();
  setTimeout(() => {
    hideGlobalLoader();
    state.user = { name: email.split('@')[0], email };
    saveState();
    loginSuccess();
  }, 1500);
}

function doSignup() {
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const pass = document.getElementById('signup-pass').value.trim();
  if (!name || !email || !pass) { showToast('Please fill all fields'); return; }

  showGlobalLoader();
  setTimeout(() => {
    hideGlobalLoader();
    state.user = { name, email };
    saveState();
    loginSuccess();
  }, 1500);
}

function guestLogin() {
  state.user = { name: 'Explorer', email: 'guest@nexara.com' };
  saveState();
  loginSuccess();
}

function loginSuccess() {
  const loginPage = document.getElementById('login-page');
  loginPage.style.transition = 'opacity 0.6s ease';
  loginPage.style.opacity = '0';
  setTimeout(() => {
    loginPage.classList.add('hidden');
    showMainApp();
  }, 600);
}

function doLogout() {
  state.user = null;
  saveState();
  document.getElementById('main-app').classList.add('hidden');
  document.getElementById('account-dropdown').classList.add('hidden');
  const loginPage = document.getElementById('login-page');
  loginPage.classList.remove('hidden');
  loginPage.style.opacity = '0';
  setTimeout(() => { loginPage.style.transition = 'opacity 0.5s'; loginPage.style.opacity = '1'; }, 50);
}

function showMainApp() {
  const app = document.getElementById('main-app');
  app.classList.remove('hidden');
  app.style.opacity = '0';
  setTimeout(() => {
    app.style.transition = 'opacity 0.6s ease';
    app.style.opacity = '1';
  }, 50);

  if (state.user) {
    document.getElementById('nav-username').textContent = state.user.name;
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
    const dots = document.querySelectorAll('.hero-dot');
    slides[state.heroSlide].classList.remove('active');
    dots[state.heroSlide].classList.remove('active');
    state.heroSlide = (state.heroSlide + 1) % slides.length;
    slides[state.heroSlide].classList.add('active');
    dots[state.heroSlide].classList.add('active');
  }, 4000);
}

function goSlide(n) {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  slides[state.heroSlide].classList.remove('active');
  dots[state.heroSlide].classList.remove('active');
  state.heroSlide = n;
  slides[n].classList.add('active');
  dots[n].classList.add('active');
}

// ════════════════════════════════════════
// DEALS TICKER
// ════════════════════════════════════════
function buildTickerDeals() {
  const deals = PRODUCTS_DB.filter(p => p.badge === 'DEAL' || parseInt(p.discount) >= 27).slice(0, 10);
  const track = document.getElementById('ticker-track');
  if (!track) return;
  const items = deals.map(p =>
    `<span class="ticker-item">${p.emoji} <strong>${p.name}</strong> — ₹${p.price.toLocaleString('en-IN')} <span style="color:var(--neon-green)">${p.discount} OFF</span></span>`
  ).join('');
  // Double for seamless loop
  track.innerHTML = items + items;
}

// ════════════════════════════════════════
// PRODUCTS RENDERING
// ════════════════════════════════════════
function getFilteredProducts() {
  let products = [...PRODUCTS_DB];
  if (state.currentCategory !== 'all') {
    products = products.filter(p => p.category === state.currentCategory);
  }
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q)
    );
  }
  return products;
}

function renderProducts(reset = false) {
  if (reset) state.displayedCount = 20;
  const grid = document.getElementById('products-grid');
  const products = getFilteredProducts();
  const toShow = products.slice(0, state.displayedCount);

  if (toShow.length === 0) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">⌕</div><h3>No products found</h3><p>Try a different search or category</p></div>`;
    document.getElementById('load-more-btn').style.display = 'none';
    return;
  }

  grid.innerHTML = toShow.map((p, i) => renderProductCard(p, i)).join('');

  const btn = document.getElementById('load-more-btn');
  btn.style.display = state.displayedCount >= products.length ? 'none' : 'flex';
}

function renderProductCard(p, i) {
  const inWishlist = state.wishlist.includes(p.id);
  const delay = (i % 20) * 50;
  return `
  <div class="product-card holo-card" style="animation-delay:${delay}ms" onclick="openProductDetail(${p.id})">
    ${p.badge ? `<div class="card-badge badge-${p.badge.toLowerCase() === 'deal' ? 'deal' : p.badge.toLowerCase() === 'new' ? 'new' : 'top'}">${p.badge}</div>` : ''}
    <div class="card-wishlist" onclick="event.stopPropagation(); toggleWishlistCard(${p.id}, this)">
      ${inWishlist ? '♥' : '♡'}
    </div>
    <div class="card-image-wrap cyber-scan">
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
      <button class="card-add-btn" onclick="event.stopPropagation(); quickAddToCart(${p.id})">⊡ Add to Cart</button>
    </div>
  </div>`;
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

function loadMore() {
  state.displayedCount += 20;
  renderProducts();
}

function filterCategory(cat) {
  state.currentCategory = cat;
  state.searchQuery = '';
  document.getElementById('search-input').value = '';
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  const titles = {all:'Featured Products', electronics:'Electronics', fashion:'Fashion & Apparel', gaming:'Gaming', home:'Home & Living', sports:'Sports & Fitness', beauty:'Beauty & Wellness', books:'Books & Media', automotive:'Automotive', health:'Health & Medicine', toys:'Toys & Games', food:'Food & Grocery'};
  document.getElementById('section-title').textContent = titles[cat] || 'Products';
  renderProducts(true);
}

function searchProducts() {
  state.searchQuery = document.getElementById('search-input').value.trim();
  document.getElementById('section-title').textContent = state.searchQuery ? `Results for "${state.searchQuery}"` : 'Featured Products';
  renderProducts(true);
}

function goHome() {
  state.currentCategory = 'all';
  state.searchQuery = '';
  document.getElementById('search-input').value = '';
  document.querySelectorAll('.cat-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
  document.getElementById('section-title').textContent = 'Featured Products';
  renderProducts(true);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ════════════════════════════════════════
// PRODUCT DETAIL
// ════════════════════════════════════════
function openProductDetail(id) {
  const p = PRODUCTS_DB.find(x => x.id === id);
  if (!p) return;
  state.currentProduct = p;
  state.currentQty = 1;
  state.currentReviewIndex = 0;

  document.getElementById('detail-img').src = '';
  document.getElementById('detail-img').alt = p.name;
  document.getElementById('detail-img').style.fontSize = '8rem';
  document.getElementById('detail-img').style.display = 'none';

  // Use emoji as image fallback
  const imgFrame = document.querySelector('.detail-img-frame');
  let emojiEl = imgFrame.querySelector('.detail-emoji-big');
  if (!emojiEl) {
    emojiEl = document.createElement('div');
    emojiEl.className = 'detail-emoji-big';
    emojiEl.style.cssText = 'font-size:9rem;filter:drop-shadow(0 0 30px rgba(0,212,255,0.3));z-index:1;position:relative;';
    imgFrame.appendChild(emojiEl);
  }
  emojiEl.textContent = p.emoji;

  document.getElementById('detail-badge').textContent = `◈ ${p.category.toUpperCase()}`;
  document.getElementById('detail-title').textContent = p.name;
  document.getElementById('detail-rating').innerHTML = `<span class="stars">${renderStars(p.rating)}</span> <span>${p.rating}</span> <span style="color:var(--text-muted)">(${p.reviews.toLocaleString('en-IN')} reviews)</span>`;
  document.getElementById('detail-price').textContent = `₹${p.price.toLocaleString('en-IN')}`;
  document.getElementById('detail-original').textContent = `₹${p.original.toLocaleString('en-IN')}`;
  document.getElementById('detail-discount').textContent = `${p.discount} off`;
  document.getElementById('detail-desc').textContent = p.desc;
  document.getElementById('qty-display').textContent = '1';

  // Specs
  const specsEl = document.getElementById('detail-specs');
  specsEl.innerHTML = Object.entries(p.specs).map(([k, v]) =>
    `<div class="spec-item"><span class="spec-key">${k}:</span><span class="spec-val">${v}</span></div>`
  ).join('');

  // Delivery date (3-7 days from today)
  const del = new Date();
  del.setDate(del.getDate() + Math.floor(Math.random() * 5) + 3);
  document.getElementById('delivery-date').textContent = del.toDateString();

  // Thumbnails
  const thumbs = document.getElementById('detail-thumbs');
  thumbs.innerHTML = [p.emoji, p.emoji, p.emoji].map((e, i) =>
    `<div class="detail-thumb ${i === 0 ? 'active' : ''}">${e}</div>`
  ).join('');

  // Reviews
  loadReview();

  // Show overlay
  const overlay = document.getElementById('product-overlay');
  overlay.classList.remove('hidden');
  overlay.scrollTop = 0;
  document.body.style.overflow = 'hidden';
}

function closeProductDetail() {
  const overlay = document.getElementById('product-overlay');
  overlay.style.opacity = '0';
  overlay.style.transition = 'opacity 0.3s';
  setTimeout(() => {
    overlay.classList.add('hidden');
    overlay.style.opacity = '';
    overlay.style.transition = '';
    document.body.style.overflow = '';
    // Clean up emoji
    const old = document.querySelector('.detail-emoji-big');
    if (old) old.remove();
  }, 300);
}

function changeQty(delta) {
  state.currentQty = Math.max(1, Math.min(10, state.currentQty + delta));
  document.getElementById('qty-display').textContent = state.currentQty;
}

function addToCartFromDetail() {
  if (!state.currentProduct) return;
  for (let i = 0; i < state.currentQty; i++) {
    addToCart(state.currentProduct.id);
  }
  showToast(`⊡ Added ${state.currentQty}x ${state.currentProduct.name} to cart`);
  animateCartCount();
}

function buyNow() {
  addToCartFromDetail();
  closeProductDetail();
  setTimeout(() => openCart(), 300);
}

function toggleWishlist() {
  if (!state.currentProduct) return;
  const id = state.currentProduct.id;
  const idx = state.wishlist.indexOf(id);
  if (idx === -1) {
    state.wishlist.push(id);
    showToast('♥ Added to wishlist');
  } else {
    state.wishlist.splice(idx, 1);
    showToast('♡ Removed from wishlist');
  }
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
  card.offsetHeight;
  card.style.animation = 'reviewSlide 0.4s ease';

  document.getElementById('review-avatar').textContent = r.avatar;
  document.getElementById('review-name').textContent = r.name;
  document.getElementById('review-stars').textContent = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
  document.getElementById('review-text').textContent = r.text;
  document.getElementById('review-date').textContent = r.date;
  document.getElementById('review-index').textContent = `${state.currentReviewIndex + 1} / ${reviews.length}`;
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
  showToast('⊡ Added to cart!');
  animateCartCount();
}

function addToCart(id) {
  const existing = state.cart.find(item => item.id === id);
  if (existing) {
    existing.qty++;
  } else {
    const p = PRODUCTS_DB.find(x => x.id === id);
    if (p) state.cart.push({ id, qty: 1, price: p.price, name: p.name, emoji: p.emoji });
  }
  updateCartCount();
  saveState();
}

function updateCartCount() {
  const total = state.cart.reduce((s, i) => s + i.qty, 0);
  const el = document.getElementById('cart-count');
  el.textContent = total;
  el.style.display = total > 0 ? 'flex' : 'none';
}

function animateCartCount() {
  const el = document.querySelector('.nav-cart');
  el.classList.add('cart-bounce');
  setTimeout(() => el.classList.remove('cart-bounce'), 400);
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
          <button class="qty-btn" onclick="cartQty(${item.id}, -1)">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn" onclick="cartQty(${item.id}, 1)">+</button>
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
  updateCartCount();
  saveState();
  renderCartItems();
}

function removeFromCart(id) {
  state.cart = state.cart.filter(i => i.id !== id);
  updateCartCount();
  saveState();
  renderCartItems();
}

function toggleWishlistCard(id, el) {
  const idx = state.wishlist.indexOf(id);
  if (idx === -1) {
    state.wishlist.push(id);
    el.textContent = '♥';
    el.style.color = 'var(--neon-pink)';
    showToast('♥ Added to wishlist');
  } else {
    state.wishlist.splice(idx, 1);
    el.textContent = '♡';
    el.style.color = '';
    showToast('♡ Removed from wishlist');
  }
  saveState();
}

function showWishlist() {
  const items = state.wishlist.map(id => PRODUCTS_DB.find(p => p.id === id)).filter(Boolean);
  if (items.length === 0) { showToast('Your wishlist is empty'); return; }
  // Filter to show wishlist
  state.currentCategory = 'all';
  closeAccountMenu();
  const grid = document.getElementById('products-grid');
  document.getElementById('section-title').textContent = '♥ Your Wishlist';
  grid.innerHTML = items.map((p, i) => renderProductCard(p, i)).join('');
  document.getElementById('load-more-btn').style.display = 'none';
  window.scrollTo({ top: document.getElementById('products-section').offsetTop - 100, behavior: 'smooth' });
}

// ════════════════════════════════════════
// CHECKOUT
// ════════════════════════════════════════
function startCheckout() {
  if (state.cart.length === 0) { showToast('Your cart is empty!'); return; }
  closeCart();
  setTimeout(() => {
    document.getElementById('checkout-step-1').classList.remove('hidden');
    document.getElementById('checkout-step-2').classList.add('hidden');
    document.getElementById('checkout-step-3').classList.add('hidden');
    document.getElementById('checkout-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }, 300);
}

function closeCheckout() {
  document.getElementById('checkout-modal').classList.add('hidden');
  document.body.style.overflow = '';
}

function goToPayment() {
  const name = document.getElementById('addr-name').value.trim();
  const phone = document.getElementById('addr-phone').value.trim();
  const pincode = document.getElementById('addr-pincode').value.trim();
  const street = document.getElementById('addr-street').value.trim();
  if (!name || !phone || !pincode || !street) { showToast('Please fill all address fields'); return; }

  state.deliveryAddress = { name, phone, pincode, street,
    city: document.getElementById('addr-city').value || 'City',
    state: document.getElementById('addr-state').value || 'State'
  };

  document.getElementById('checkout-step-1').classList.add('hidden');
  document.getElementById('checkout-step-2').classList.remove('hidden');

  // Build order summary
  const total = state.cart.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = total > 5000 ? 0 : 49;
  const summary = document.getElementById('order-summary');
  summary.innerHTML = `
    ${state.cart.map(item => `<div class="order-summary-item"><span>${item.name} x${item.qty}</span><span>₹${(item.price * item.qty).toLocaleString('en-IN')}</span></div>`).join('')}
    <div class="order-summary-item"><span>Delivery</span><span>${delivery === 0 ? '<span style="color:var(--neon-green)">FREE</span>' : '₹' + delivery}</span></div>
    <div class="order-summary-total"><span>Total</span><span>₹${(total + delivery).toLocaleString('en-IN')}</span></div>
  `;
}

function selectPayment(type) {
  state.selectedPayment = type;
  document.querySelectorAll('.pay-option').forEach(el => el.classList.remove('selected'));
  event.currentTarget.classList.add('selected');
  document.querySelectorAll('[id$="-form"].pay-form').forEach(f => f.classList.add('hidden'));
  const form = document.getElementById(`${type}-form`);
  if (form) form.classList.remove('hidden');
}

function processPayment() {
  if (!state.selectedPayment) { showToast('Please select a payment method'); return; }
  showGlobalLoader();
  setTimeout(() => {
    hideGlobalLoader();
    completeOrder();
  }, 2000);
}

function completeOrder() {
  const orderId = 'NX' + Date.now().toString(36).toUpperCase();
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
    payment: state.selectedPayment
  };
  state.orders.unshift(order);
  state.cart = [];
  updateCartCount();
  saveState();

  document.getElementById('order-id-display').textContent = orderId;
  document.getElementById('est-delivery').textContent = delivery.toDateString();

  document.getElementById('checkout-step-2').classList.add('hidden');
  document.getElementById('checkout-step-3').classList.remove('hidden');
}

// ════════════════════════════════════════
// ORDER HISTORY
// ════════════════════════════════════════
function showOrderHistory() {
  closeAccountMenu();
  const list = document.getElementById('order-list');
  if (state.orders.length === 0) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">⊞</div><h3>No orders yet</h3><p>Your order history will appear here</p></div>`;
  } else {
    list.innerHTML = state.orders.map(o => `
      <div class="order-item">
        <div class="order-item-header">
          <div>
            <div class="order-id">Order #${o.id}</div>
            <div class="order-date">${o.date}</div>
          </div>
          <span class="order-status status-${o.status.toLowerCase()}">${o.status}</span>
        </div>
        <div class="order-products">${o.items.map(i => `${i.emoji} ${i.name} x${i.qty}`).join(', ')}</div>
        <div class="order-total">Total: ₹${o.total.toLocaleString('en-IN')}</div>
        ${o.delivery ? `<div style="font-size:0.8rem;color:var(--text-muted);margin-top:6px">Est. Delivery: ${o.delivery}</div>` : ''}
      </div>
    `).join('');
  }
  document.getElementById('order-history-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
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
  closeLocationModal();
  showToast(`⌖ Delivering to ${city}`);
}

function updateNavCity() {
  const el = document.getElementById('nav-city');
  if (el) el.textContent = state.navCity;
}

function filterCities() {
  const q = document.getElementById('loc-input').value.toLowerCase();
  const items = document.querySelectorAll('.city-item');
  items.forEach(item => {
    item.style.display = item.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
}

// ════════════════════════════════════════
// ACCOUNT DROPDOWN
// ════════════════════════════════════════
function toggleAccountMenu() {
  const dd = document.getElementById('account-dropdown');
  dd.classList.toggle('hidden');
}

function closeAccountMenu() {
  document.getElementById('account-dropdown').classList.add('hidden');
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav-account')) closeAccountMenu();
});

// ════════════════════════════════════════
// AI CHATBOT — NAVI
// ════════════════════════════════════════
function toggleChatbot() {
  const panel = document.getElementById('chatbot-panel');
  panel.classList.toggle('hidden');
}

function chatKeydown(e) {
  if (e.key === 'Enter') sendChat();
}

async function sendChat() {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';

  appendChatMsg('user', msg);
  showTypingIndicator();

  try {
    const cartInfo = state.cart.length > 0
      ? `Cart: ${state.cart.map(i => `${i.name} x${i.qty}`).join(', ')}. Total: ₹${state.cart.reduce((s, i) => s + i.price * i.qty, 0).toLocaleString('en-IN')}`
      : 'Cart is empty';

    const orderInfo = state.orders.length > 0
      ? `Recent order: #${state.orders[0].id}, Status: ${state.orders[0].status}`
      : 'No orders yet';

    const systemPrompt = `You are NAVI, the AI assistant for NEXARA — a futuristic e-commerce platform. You help users with product recommendations, orders, cart management, delivery info, and general questions. Be helpful, concise, and use ✦ or ⚡ occasionally for flair. The platform sells electronics, fashion, gaming, home products, sports, beauty, books, automotive, health, toys, and food.
Current user: ${state.user?.name || 'Guest'}
${cartInfo}
${orderInfo}
Location: ${state.navCity}
Keep responses under 120 words. Be friendly and futuristic.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [
          ...state.chatHistory.slice(-6),
          { role: 'user', content: msg }
        ]
      })
    });

    const data = await response.json();
    const reply = data.content?.map(b => b.text || '').join('') || 'I\'m here to help! Ask me anything about Nexara. ✦';

    removeTypingIndicator();
    appendChatMsg('ai', reply);

    state.chatHistory.push({ role: 'user', content: msg });
    state.chatHistory.push({ role: 'assistant', content: reply });
    if (state.chatHistory.length > 20) state.chatHistory = state.chatHistory.slice(-20);

  } catch (err) {
    removeTypingIndicator();
    appendChatMsg('ai', 'Greetings! I\'m NAVI ✦ — Ask me about products, orders, or anything Nexara related!');
  }
}

function appendChatMsg(role, text) {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  div.innerHTML = `
    <span class="msg-avatar">${role === 'ai' ? '⬡' : '◈'}</span>
    <div class="msg-bubble">${text}</div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function showTypingIndicator() {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = 'chat-msg ai';
  div.id = 'typing-indicator';
  div.innerHTML = `
    <span class="msg-avatar">⬡</span>
    <div class="msg-bubble chat-typing"><span></span><span></span><span></span></div>
  `;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function removeTypingIndicator() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

// ════════════════════════════════════════
// GLOBAL LOADER
// ════════════════════════════════════════
function showGlobalLoader() {
  document.getElementById('global-loader').classList.remove('hidden');
}

function hideGlobalLoader() {
  document.getElementById('global-loader').classList.add('hidden');
}

// ════════════════════════════════════════
// TOAST
// ════════════════════════════════════════
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
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeProductDetail();
    closeCart();
    closeCheckout();
    closeOrderHistory();
    closeLocationModal();
  }
});
