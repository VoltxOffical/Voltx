/* ═══════════════════════════════════════════════════════
   VOLTX — SCRIPT
═══════════════════════════════════════════════════════ */

const DISCOUNT_CODE = 'zenzirl';
const DISCOUNT_PCT  = 0.20;

const PRODUCTS = {
  g2: {
    name: 'G2 Stickers',
    price: 15.00,
    shipping: 0,
    img: 'black.png',
  },
  decal: {
    name: 'Front Plate Decal',
    price: 10.00,
    shipping: 3.00,
    img: 'Frontdecal.png',
  },
  s1: {
    name: 'S1 Max Front Decal',
    price: 5.00,
    shipping: 0,
    img: 'whites1.png',
  }
};

const COLOUR_NAMES = {
  black: 'Black', red: 'Red', white: 'White',
  blue: 'Blue', purple: 'Purple', pink: 'Pink'
};

let cart            = [];
let discountApplied = false;
let activeG2Colour  = 'black';
let activeS1Colour  = 'white';

/* ─── MOBILE NAV ────────────────────────────────────── */
function toggleMobileMenu() {
  const nav      = document.getElementById('mobile-nav');
  const backdrop = document.getElementById('mobile-nav-backdrop');
  const burger   = document.getElementById('hamburger');
  const isOpen   = nav.classList.contains('open');

  nav.classList.toggle('open', !isOpen);
  backdrop.classList.toggle('open', !isOpen);
  burger.classList.toggle('open', !isOpen);
  document.body.style.overflow = isOpen ? '' : 'hidden';
}


window.addEventListener('load', () => {
  document.querySelector('.hero')?.classList.add('loaded');
});

/* ─── HEADER SCROLL ─────────────────────────────────── */
window.addEventListener('scroll', () => {
  document.getElementById('header').classList.toggle('scrolled', window.scrollY > 8);
}, { passive: true });

/* ═══════════════════════════════════════════════════════
   TAB NAVIGATION
═══════════════════════════════════════════════════════ */
function showTab(tabName, linkEl) {
  // Hide all pages
  document.querySelectorAll('.tab-page').forEach(p => {
    p.classList.remove('active');
  });

  // Deactivate all nav links
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  // Show target page
  const page = document.getElementById('tab-' + tabName);
  if (page) {
    // Force reflow so animation re-triggers
    void page.offsetWidth;
    page.classList.add('active');
  }

  // Activate correct nav link (checkout is hidden from nav, so nothing activates)
  const link = linkEl || document.querySelector(`.nav-link[data-tab="${tabName}"]`);
  if (link) link.classList.add('active');

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Close cart drawer and mobile nav
  closeCart();
  const mobileNav = document.getElementById('mobile-nav');
  if (mobileNav?.classList.contains('open')) toggleMobileMenu();
}

/* ─── Go to checkout tab from cart ── */
function goToCheckout() {
  closeCart();
  renderCheckout();
  setTimeout(() => showTab('checkout'), 80);
}

/* ═══════════════════════════════════════════════════════
   MODALS
═══════════════════════════════════════════════════════ */
function openModal(productId) {
  const idMap = { g2: 'modal-g2', decal: 'modal-decal', s1: 'modal-s1' };
  const id = idMap[productId];
  if (!id) return;
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(overlayId) {
  const el = document.getElementById(overlayId);
  if (el) el.classList.remove('open');
  const anyOpen = document.querySelector('.overlay.open, .cart-drawer.open');
  if (!anyOpen) document.body.style.overflow = '';
}

function closeOverlay(event, id) {
  if (event.target === document.getElementById(id)) closeModal(id);
}

/* ─── COLOUR SWITCHER ───────────────────────────────── */
function switchColour(colour, thumbEl, swatchEl) {
  activeG2Colour = colour;

  const mainImg = document.getElementById('modal-img-g2');
  const label   = document.getElementById('g2-colour-label');

  // Update card images
  ['home-card-g2', 'shop-card-g2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.src = colour + '.png';
  });

  // Fade swap main image
  mainImg.classList.add('fade');
  setTimeout(() => {
    mainImg.src = colour + '.png';
    mainImg.classList.remove('fade');
  }, 160);

  if (label) label.textContent = COLOUR_NAMES[colour] || colour;

  // Update thumbs
  document.querySelectorAll('#thumbs-g2 .thumb').forEach(t => {
    t.classList.toggle('active', t.dataset.src === colour + '.png');
  });

  // Update swatches
  document.querySelectorAll('.sw').forEach(s => {
    s.classList.toggle('active', s.dataset.colour === colour);
  });
}

/* ─── S1 COLOUR SWITCHER ────────────────────────────── */
function switchS1Colour(colour, thumbEl, swatchEl) {
  activeS1Colour = colour;

  const mainImg = document.getElementById('modal-img-s1');
  const label   = document.getElementById('s1-colour-label');
  const imgFile = colour + 's1.png';

  // Update card images
  ['home-card-s1', 'shop-card-s1'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.src = imgFile;
  });

  // Fade swap
  mainImg.classList.add('fade');
  setTimeout(() => {
    mainImg.src = imgFile;
    mainImg.classList.remove('fade');
  }, 160);

  if (label) label.textContent = COLOUR_NAMES[colour] || colour;

  // Thumbs
  document.querySelectorAll('#thumbs-s1 .thumb').forEach(t => {
    t.classList.toggle('active', t.dataset.src === imgFile);
  });

  // Swatches — only update within the s1 modal
  document.querySelectorAll('#modal-s1 .sw').forEach(s => {
    s.classList.toggle('active', s.dataset.colour === colour);
  });
}

/* ═══════════════════════════════════════════════════════
   CART
═══════════════════════════════════════════════════════ */
function openCart() {
  document.getElementById('cart-drawer').classList.add('open');
  document.getElementById('cart-backdrop').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('cart-backdrop').classList.remove('open');
  const anyOpen = document.querySelector('.overlay.open');
  if (!anyOpen) document.body.style.overflow = '';
}

function addToCart(productId, colour) {
  const product = PRODUCTS[productId];
  if (!product) return;

  let key, img;
  if (productId === 'g2') {
    key = `g2-${colour}`;
    img = colour + '.png';
  } else if (productId === 's1') {
    key = `s1-${colour}`;
    img = colour + 's1.png';
  } else {
    key = productId;
    img = product.img;
  }

  const existing = cart.find(i => i.key === key);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({
      key,
      productId,
      name: product.name,
      price: product.price,
      shipping: product.shipping,
      img,
      colour: (productId === 'g2' || productId === 's1') ? colour : null,
      qty: 1
    });
  }

  renderCart();
  bumpBadge();

  closeModal('modal-g2');
  closeModal('modal-decal');
  closeModal('modal-s1');
  setTimeout(openCart, 80);
}

function changeQty(key, delta) {
  const item = cart.find(i => i.key === key);
  if (!item) return;
  item.qty = Math.max(0, item.qty + delta);
  if (item.qty === 0) cart = cart.filter(i => i.key !== key);
  renderCart();
}

function getSubtotal() {
  return cart.reduce((s, i) => s + (i.price + i.shipping) * i.qty, 0);
}

function getDiscount() {
  return discountApplied ? getSubtotal() * DISCOUNT_PCT : 0;
}

function getTotal() { return getSubtotal() - getDiscount(); }

function fmt(n) { return '€' + n.toFixed(2); }

/* ─── RENDER CART ───────────────────────────────────── */
function renderCart() {
  const count    = cart.reduce((s, i) => s + i.qty, 0);
  const subtotal = getSubtotal();
  const total    = getTotal();
  const discount = getDiscount();

  document.getElementById('cart-count').textContent = count;

  const emptyEl = document.getElementById('cart-empty');
  const itemsEl = document.getElementById('cart-items');
  const footEl  = document.getElementById('cart-foot');

  if (cart.length === 0) {
    emptyEl.style.display = 'flex';
    itemsEl.innerHTML     = '';
    footEl.style.display  = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  footEl.style.display  = 'block';

  itemsEl.innerHTML = cart.map(item => {
    const subLabel = item.colour
      ? COLOUR_NAMES[item.colour]
      : (item.shipping > 0 ? `+${fmt(item.shipping)} shipping` : '');
    return `
      <div class="cart-item">
        <img class="c-item-img" src="${item.img}" alt="${item.name}" />
        <div class="c-item-info">
          <p class="c-item-name">${item.name}</p>
          <p class="c-item-sub">${subLabel}</p>
          <div class="qty-row">
            <button class="qty-btn" onclick="changeQty('${item.key}',-1)">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" onclick="changeQty('${item.key}',1)">+</button>
          </div>
        </div>
        <span class="c-item-price">${fmt(item.price * item.qty)}</span>
      </div>`;
  }).join('');

  document.getElementById('cart-sub').textContent   = fmt(subtotal);
  document.getElementById('cart-total').textContent = fmt(total);

  const discRow = document.getElementById('disc-row');
  const discAmt = document.getElementById('disc-amt');
  if (discountApplied && discount > 0) {
    discRow.style.display = 'flex';
    discAmt.textContent   = '-' + fmt(discount);
  } else {
    discRow.style.display = 'none';
  }
}

/* ─── RENDER CHECKOUT SUMMARY ───────────────────────── */
function renderCheckout() {
  const subtotal = getSubtotal();
  const total    = getTotal();
  const discount = getDiscount();

  const itemsEl = document.getElementById('checkout-items');
  if (!itemsEl) return;

  itemsEl.innerHTML = cart.map(item => {
    const subLabel = item.colour
      ? COLOUR_NAMES[item.colour]
      : (item.shipping > 0 ? `+${fmt(item.shipping)} shipping` : '');
    return `
      <div class="co-item">
        <img class="co-item-img" src="${item.img}" alt="${item.name}" />
        <div class="co-item-info">
          <p class="co-item-name">${item.name} × ${item.qty}</p>
          <p class="co-item-sub">${subLabel}</p>
        </div>
        <span class="co-item-price">${fmt(item.price * item.qty)}</span>
      </div>`;
  }).join('');

  document.getElementById('co-subtotal').textContent = fmt(subtotal);
  document.getElementById('co-total').textContent    = fmt(total);

  const coDiscRow = document.getElementById('co-disc-row');
  const coDiscAmt = document.getElementById('co-disc-amt');
  if (discountApplied && discount > 0) {
    coDiscRow.style.display = 'flex';
    coDiscAmt.textContent   = '-' + fmt(discount);
  } else {
    coDiscRow.style.display = 'none';
  }
}

/* ─── BADGE BUMP ────────────────────────────────────── */
function bumpBadge() {
  const badge = document.getElementById('cart-count');
  badge.classList.remove('bump');
  void badge.offsetWidth;
  badge.classList.add('bump');
  setTimeout(() => badge.classList.remove('bump'), 300);
}

/* ─── DISCOUNT ──────────────────────────────────────── */
function applyDiscount() {
  const input = document.getElementById('discount-input');
  const msg   = document.getElementById('discount-msg');
  const code  = input.value.trim().toLowerCase();

  if (!code) { setMsg(msg, 'Enter a discount code.', false); return; }

  if (code === DISCOUNT_CODE) {
    discountApplied = true;
    input.value = '';
    setMsg(msg, '20% discount applied.', true);
    renderCart();
  } else {
    setMsg(msg, 'Invalid or expired code.', false);
  }
}

function setMsg(el, text, ok) {
  el.textContent = text;
  el.className   = 'disc-msg ' + (ok ? 'ok' : 'err');
}

/* ─── KEYBOARD ──────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  ['modal-g2', 'modal-decal', 'modal-s1', 'success-overlay'].forEach(closeModal);
  closeCart();
  const mobileNav = document.getElementById('mobile-nav');
  if (mobileNav?.classList.contains('open')) toggleMobileMenu();
});

/* ─── INIT ──────────────────────────────────────────── */
renderCart();
