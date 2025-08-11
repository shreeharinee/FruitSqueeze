/* script.js
   - session reset: clears saved cart on fresh visit (per tab)
   - cart stored in localStorage during the session after first add
   - floating bottom-right button auto navigation
   - menu collapsible toggle
   - product add/remove/qty and total calculation (₹)
*/

// Clear cart on fresh visit (one-time per tab)
if (!sessionStorage.getItem('cartResetDone')) {
  localStorage.removeItem('cart');
  sessionStorage.setItem('cartResetDone', 'true');
}

// cart array
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Save cart helper
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
}

// Update cart badge in nav
function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  const qty = cart.reduce((s, it) => s + it.quantity, 0);
  badge.textContent = qty;
}

// Add item to cart
function addToCart(name, price, image) {
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ name, price, image, quantity: 1 });
  }
  saveCart();
  showToast(`${name} added • ₹${price.toFixed(2)}`);
}

// small toast
function showToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.position = 'fixed';
  t.style.left = '50%';
  t.style.transform = 'translateX(-50%)';
  t.style.bottom = '90px';
  t.style.background = 'rgba(0,0,0,0.8)';
  t.style.color = '#fff';
  t.style.padding = '8px 12px';
  t.style.borderRadius = '8px';
  t.style.zIndex = 9999;
  document.body.appendChild(t);
  setTimeout(() => t.style.opacity = '0', 1400);
  setTimeout(() => t.remove(), 1800);
}

// Render cart on cart page
function renderCartPage() {
  const list = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  if (!list || !totalEl) return;

  list.innerHTML = '';
  if (cart.length === 0) {
    list.innerHTML = '<p style="padding:10px;background:#fff;border-radius:8px;">Your cart is empty.</p>';
    totalEl.textContent = '₹0.00';
    return;
  }

  let total = 0;
  cart.forEach((it, idx) => {
    total += it.price * it.quantity;
    const row = document.createElement('div');
    row.className = 'cart-row';
    row.innerHTML = `
      <img src="${it.image}" alt="${it.name}">
      <div style="flex:1;">
        <div style="font-weight:700;">${it.name}</div>
        <div style="color:#ff6b00;margin-top:6px;font-weight:700;">₹${it.price.toFixed(2)} each</div>
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;">
        <div class="qty-controls">
          <button onclick="changeQty(${idx}, -1)">−</button>
          <div style="padding:6px 10px;background:#fff;border-radius:6px;border:1px solid #eee;margin:0 8px;">${it.quantity}</div>
          <button onclick="changeQty(${idx}, 1)">+</button>
        </div>
        <div style="margin-top:8px;display:flex;gap:8px;align-items:center;">
          <div style="font-weight:800;">₹${(it.price * it.quantity).toFixed(2)}</div>
          <button style="background:#eee;border:none;padding:6px 8px;border-radius:8px;cursor:pointer;" onclick="removeItem(${idx})">Remove</button>
        </div>
      </div>
    `;
    list.appendChild(row);
  });

  totalEl.textContent = `₹${total.toFixed(2)}`;
}

// change quantity
function changeQty(idx, delta) {
  if (!cart[idx]) return;
  cart[idx].quantity += delta;
  if (cart[idx].quantity <= 0) cart.splice(idx, 1);
  saveCart();
  renderCartPage();
}

// remove item
function removeItem(idx) {
  cart.splice(idx, 1);
  saveCart();
  renderCartPage();
}

// checkout (on cart page)
function checkout() {
  const name = document.getElementById('name')?.value?.trim();
  const address = document.getElementById('address')?.value?.trim();
  const phone = document.getElementById('phone')?.value?.trim();

  if (!name || !address || !phone) {
    alert('Please fill in name, address and phone.');
    return;
  }
  if (cart.length === 0) {
    alert('Cart is empty.');
    return;
  }

  // simulate order processed
  showOrderSuccess();
  localStorage.removeItem('cart');
  cart = [];
  saveCart();
  renderCartPage();
  document.getElementById('checkout-form')?.reset();
}

// success overlay
function showOrderSuccess() {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.left = '0'; overlay.style.top='0'; overlay.style.right='0'; overlay.style.bottom='0';
  overlay.style.background = 'rgba(0,0,0,0.5)';
  overlay.style.display = 'flex'; overlay.style.alignItems='center'; overlay.style.justifyContent='center';
  overlay.style.zIndex = 9999;
  const box = document.createElement('div');
  box.style.background = '#fff'; box.style.padding = '20px'; box.style.borderRadius = '12px'; box.style.textAlign='center';
  box.innerHTML = `<h3 style="color:#ff6b00;margin-bottom:8px;">Order Confirmed!</h3><p>Your delicious juices will reach soon. Thank you! 🍊</p><div style="margin-top:10px;"><button style="background:#ff6b00;color:#fff;padding:8px 12px;border:none;border-radius:8px;cursor:pointer;">OK</button></div>`;
  box.querySelector('button').onclick = () => overlay.remove();
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  setTimeout(()=> overlay.remove(), 4200);
}

// menu toggle behavior
document.addEventListener('click', (e) => {
  if (e.target.classList && e.target.classList.contains('menu-toggle')) {
    const section = e.target.closest('.menu-section');
    const list = section.querySelector('.menu-list');
    // close others
    document.querySelectorAll('.menu-list').forEach(l => { if (l !== list) l.style.display = 'none'; });
    list.style.display = (list.style.display === 'block') ? 'none' : 'block';
    // smooth scroll into view
    setTimeout(()=> section.scrollIntoView({behavior:'smooth', block:'center'}), 150);
  }
});

// floating bottom-right button (next page)
function setupFloatingBtn() {
  const existing = document.querySelector('.floating-btn');
  if (existing) existing.remove();
  const btn = document.createElement('button');
  btn.className = 'floating-btn';
  const path = window.location.pathname.split('/').pop();
  if (path === '' || path === 'index.html') {
    btn.textContent = 'Order Now';
    btn.onclick = () => location.href = 'menu.html';
  } else if (path === 'menu.html') {
    btn.textContent = 'View Cart';
    btn.onclick = () => location.href = 'cart.html';
  } else if (path === 'cart.html') {
    btn.textContent = 'Contact';
    btn.onclick = () => location.href = 'contact.html';
  } else if (path === 'contact.html') {
    btn.textContent = 'Back Home';
    btn.onclick = () => location.href = 'index.html';
  } else {
    btn.textContent = 'Menu';
    btn.onclick = () => location.href = 'menu.html';
  }
  document.body.appendChild(btn);
}

// initial run on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  setupFloatingBtn();
  // if cart page present, render cart
  renderCartPage();
});
