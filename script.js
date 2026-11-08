/* ═══════════════════════════════════════════════════════
   VOLTX — SCRIPT
═══════════════════════════════════════════════════════ */

// ─── STOCK ────────────────────────────────────────────
// 0 = out of stock, any number = in stock
const STOCK = {
  g2:    2,   // G2 Stickers — 2 in stock
  decal: 1,   // Front Plate Decal — 1 in stock
  s1:    0    // S1 Max Front Decal — out of stock
};

// ─── DISCOUNT CODES ───────────────────────────────────
const DISCOUNT_CODES = {
  zenzirl: 0.20,  // 20% off
  '3kand':  0.20  // 20% off
};

// ─── PRODUCTS ─────────────────────────────────────────
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

// ─── STATE ────────────────────────────────────────────
let cart            = [];
let discountApplied = null;  // null or the code string currently applied
let activeG2Colour  = 'black';
let activeS1Colour  = 'white';

/* ─── HERO INIT ─────────────────────────────────────── */
window.addEventListener('load', () => {
  document.querySelector('.hero')?.classList.add('loaded');
  updateAllStockUI();
});

/* ─── HEADER SCROLL ─────────────────────────────────── */
window.addEventListener('scroll', () => {
  document.getElementById('header').classList.toggle('scrolled', window.scrollY > 8);
}, { passive: true });

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

/* ═══════════════════════════════════════════════════════
   STOCK UI
═══════════════════════════════════════════════════════ */
function isInStock(productId) {
  return STOCK[productId] > 0;
}

function updateAllStockUI() {
  // Update each product's sold-out tags and add-to-cart buttons
  Object.keys(PRODUCTS).forEach(id => {
    const inStock = isInStock(id);

    // Card tags
    ['home', 'shop'].forEach(page => {
      const card = document.querySelector(`#tab-${page} .product-card[data-product="${id}"]`);
      if (card) {
        const outTag = card.querySelector('.tag-out');
        const inTag  = card.querySelector('.tag-in');
        if (outTag) outTag.style.display = inStock ? 'none' : '';
        if (inTag)  inTag.style.display  = inStock ? '' : 'none';
      }
    });

    // Modal button
    const btn = document.getElementById(`btn-cart-${id}`);
    if (btn) {
      if (inStock) {
        btn.textContent = 'Add to Cart';
        btn.disabled    = false;
        btn.className   = 'btn-add-cart';
      } else {
        btn.textContent = 'Out of Stock';
        btn.disabled    = true;
        btn.className   = 'btn-add-cart btn-oos';
      }
    }

    // Modal sold-out pill
    const pill = document.getElementById(`pill-${id}`);
    if (pill) {
      pill.style.display = inStock ? 'none' : '';
    }

    // Restock msg
    const msg = document.getElementById(`restock-${id}`);
    if (msg) {
      msg.style.display = inStock ? 'none' : '';
    }
  });
}

/* ═══════════════════════════════════════════════════════
   TAB NAVIGATION
═══════════════════════════════════════════════════════ */
function showTab(tabName, linkEl) {
  document.querySelectorAll('.tab-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  const page = document.getElementById('tab-' + tabName);
  if (page) { void page.offsetWidth; page.classList.add('active'); }

  const link = linkEl || document.querySelector(`.nav-link[data-tab="${tabName}"]`);
  if (link) link.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });
  closeCart();
  const mobileNav = document.getElementById('mobile-nav');
  if (mobileNav?.classList.contains('open')) toggleMobileMenu();
}

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

/* ─── G2 COLOUR SWITCHER ────────────────────────────── */
function switchColour(colour, thumbEl, swatchEl) {
  activeG2Colour = colour;
  const mainImg = document.getElementById('modal-img-g2');
  const label   = document.getElementById('g2-colour-label');

  ['home-card-g2', 'shop-card-g2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.src = colour + '.png';
  });

  mainImg.classList.add('fade');
  setTimeout(() => { mainImg.src = colour + '.png'; mainImg.classList.remove('fade'); }, 160);

  if (label) label.textContent = COLOUR_NAMES[colour] || colour;

  document.querySelectorAll('#thumbs-g2 .thumb').forEach(t => {
    t.classList.toggle('active', t.dataset.src === colour + '.png');
  });

  document.querySelectorAll('#modal-g2 .sw').forEach(s => {
    s.classList.toggle('active', s.dataset.colour === colour);
  });
}

/* ─── S1 COLOUR SWITCHER ────────────────────────────── */
function switchS1Colour(colour, thumbEl, swatchEl) {
  activeS1Colour = colour;
  const mainImg = document.getElementById('modal-img-s1');
  const label   = document.getElementById('s1-colour-label');
  const imgFile = colour + 's1.png';

  ['home-card-s1', 'shop-card-s1'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.src = imgFile;
  });

  mainImg.classList.add('fade');
  setTimeout(() => { mainImg.src = imgFile; mainImg.classList.remove('fade'); }, 160);

  if (label) label.textContent = COLOUR_NAMES[colour] || colour;

  document.querySelectorAll('#thumbs-s1 .thumb').forEach(t => {
    t.classList.toggle('active', t.dataset.src === imgFile);
  });

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
  if (!isInStock(productId)) return; // blocked if out of stock

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

  // Enforce stock limit
  const existing   = cart.find(i => i.key === key);
  const currentQty = existing ? existing.qty : 0;
  if (currentQty >= STOCK[productId]) {
    alert(`Only ${STOCK[productId]} in stock.`);
    return;
  }

  if (existing) {
    existing.qty++;
  } else {
    cart.push({
      key, productId,
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

  const newQty = item.qty + delta;
  if (newQty > STOCK[item.productId]) {
    alert(`Only ${STOCK[item.productId]} in stock.`);
    return;
  }

  item.qty = Math.max(0, newQty);
  if (item.qty === 0) cart = cart.filter(i => i.key !== key);
  renderCart();
}

function getSubtotal() {
  return cart.reduce((s, i) => s + (i.price + i.shipping) * i.qty, 0);
}

function getDiscountPct() {
  return discountApplied ? DISCOUNT_CODES[discountApplied] : 0;
}

function getDiscount() {
  return getSubtotal() * getDiscountPct();
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

  // Sync discount state into checkout field message
  if (discountApplied) {
    const coMsg = document.getElementById('co-discount-msg');
    if (coMsg) setMsg(coMsg, `20% off applied — ${discountApplied.toUpperCase()}`, true);
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

/* ═══════════════════════════════════════════════════════
   DISCOUNT — one code at a time
═══════════════════════════════════════════════════════ */
function applyDiscount() {
  const input = document.getElementById('discount-input');
  const msg   = document.getElementById('discount-msg');
  applyCode(input.value, msg, input);
}

function applyCoDiscount() {
  const input = document.getElementById('co-discount-input');
  const msg   = document.getElementById('co-discount-msg');
  applyCode(input.value, msg, input);
  renderCheckout();
}

function applyCode(rawValue, msgEl, inputEl) {
  const code = rawValue.trim().toLowerCase();

  if (!code) {
    setMsg(msgEl, 'Enter a discount code.', false);
    return;
  }

  // Already have a different code applied
  if (discountApplied && discountApplied !== code) {
    setMsg(msgEl, `Code "${discountApplied.toUpperCase()}" is already applied. Remove it first.`, false);
    return;
  }

  // Same code applied twice — just confirm
  if (discountApplied === code) {
    setMsg(msgEl, '20% discount already applied.', true);
    return;
  }

  if (DISCOUNT_CODES[code] !== undefined) {
    discountApplied = code;
    inputEl.value   = '';
    setMsg(msgEl, `20% off applied — ${code.toUpperCase()}`, true);
    renderCart();
  } else {
    setMsg(msgEl, 'Invalid or expired code.', false);
  }
}

function setMsg(el, text, ok) {
  if (!el) return;
  el.textContent = text;
  el.className   = 'disc-msg ' + (ok ? 'ok' : 'err');
}

/* ═══════════════════════════════════════════════════════
   PLACE ORDER — submits to Formspree then completes
═══════════════════════════════════════════════════════ */
async function placeOrder() {
  if (cart.length === 0) return;

  // Collect form fields
  const email    = document.getElementById('co-email')?.value.trim();
  const first    = document.getElementById('co-first')?.value.trim();
  const last     = document.getElementById('co-last')?.value.trim();
  const address  = document.getElementById('co-address')?.value.trim();
  const city     = document.getElementById('co-city')?.value.trim();
  const postcode = document.getElementById('co-postcode')?.value.trim();
  const country  = document.getElementById('co-country')?.value.trim();

  // Basic validation
  if (!email || !first || !last || !address || !city || !postcode || !country) {
    const note = document.getElementById('place-order-note');
    note.textContent = 'Please fill in all fields before placing your order.';
    note.style.color = '#e3342f';
    return;
  }

  // Build order summary string
  const orderLines = cart.map(item => {
    const colour = item.colour ? ` (${COLOUR_NAMES[item.colour]})` : '';
    return `${item.name}${colour} x${item.qty} — ${fmt(item.price * item.qty)}`;
  }).join('\n');

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const total    = getTotal();

  const orderSummary = [
    orderLines,
    '',
    `Subtotal: ${fmt(subtotal)}`,
    discount > 0 ? `Discount (${discountApplied?.toUpperCase()} 20%): -${fmt(discount)}` : null,
    `TOTAL: ${fmt(total)}`
  ].filter(Boolean).join('\n');

  // Disable button while submitting
  const btn = document.getElementById('place-order-btn');
  const note = document.getElementById('place-order-note');
  btn.textContent  = 'Placing Order...';
  btn.disabled     = true;
  note.textContent = '';
  note.style.color = '';

  try {
    const res = await fetch('https://formspree.io/f/xljjkyoo', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        _subject:      `New Voltx Order — ${first} ${last}`,
        email,
        name:          `${first} ${last}`,
        address,
        city,
        postcode,
        country,
        order_summary: orderSummary,
        discount_code: discountApplied ? discountApplied.toUpperCase() : 'None',
        total:         fmt(total)
      })
    });

    if (!res.ok) throw new Error('Formspree error');

    // Deduct stock
    cart.forEach(item => {
      if (STOCK[item.productId] !== undefined) {
        STOCK[item.productId] = Math.max(0, STOCK[item.productId] - item.qty);
      }
    });

    // Clear state
    cart            = [];
    discountApplied = null;

    // Reset form fields
    ['co-email','co-first','co-last','co-address','co-city','co-postcode','co-country'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });

    renderCart();
    updateAllStockUI();

    // Reset button
    btn.textContent = 'Place Order';
    btn.disabled    = false;

    // Show success
    showTab('home');
    setTimeout(() => {
      document.getElementById('success-overlay').classList.add('open');
      document.body.style.overflow = 'hidden';
    }, 300);

  } catch {
    btn.textContent  = 'Place Order';
    btn.disabled     = false;
    note.textContent = 'Something went wrong. Please try again.';
    note.style.color = '#e3342f';
  }
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
