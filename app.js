/* ====== Menu burger ====== */
const menuBtn = document.querySelector('.menu-toggle');
const mainnav = document.getElementById('mainnav');
if (menuBtn && mainnav) {
  menuBtn.addEventListener('click', () => {
    const open = mainnav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });

  // Fermer au clic d’un lien
  mainnav.addEventListener('click', e => {
    if (e.target.tagName === 'A') {
      mainnav.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ====== Année footer ====== */
const y = document.getElementById('y');
if (y) y.textContent = new Date().getFullYear();

/* ====== Panier ====== */
const EURO = n => `${n.toFixed(2).replace('.00','')}€`;
const products = [...document.querySelectorAll('.product')];
const cartTableBody = document.querySelector('#cartTable tbody');
const subtotalEl = document.getElementById('subtotal');
const clearBtn = document.getElementById('clearCart');
const checkoutBtn = document.getElementById('checkout');

let cart = {};

function save() {
  try { localStorage.setItem('devly_cart', JSON.stringify(cart)); } catch {}
}
function load() {
  try {
    const raw = localStorage.getItem('devly_cart');
    if (raw) cart = JSON.parse(raw) || {};
  } catch { cart = {}; }
}
function keyOf(item){ return item.sku; }

function addItem(item, qty=1){
  const k = keyOf(item);
  if (!cart[k]) cart[k] = {...item, qty:0};
  cart[k].qty += qty;
  if (cart[k].qty <= 0) delete cart[k];
  render();
}

function render(){
  // tbody
  cartTableBody.innerHTML = '';
  let subtotal = 0;

  Object.values(cart).forEach(it => {
    const lineTotal = (it.price || 0) * it.qty;
    subtotal += lineTotal;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${it.name}</td>
      <td>${it.price ? EURO(it.price) : '—'}</td>
      <td>
        <button class="qbtn minus" aria-label="Retirer">−</button>
        <span class="qval">${it.qty}</span>
        <button class="qbtn plus" aria-label="Ajouter">+</button>
      </td>
      <td>${it.price ? EURO(lineTotal) : '—'}</td>
      <td><button class="qbtn remove" aria-label="Supprimer">×</button></td>
    `;
    tr.querySelector('.minus').addEventListener('click', () => addItem(it, -1));
    tr.querySelector('.plus').addEventListener('click', () => addItem(it, +1));
    tr.querySelector('.remove').addEventListener('click', () => { delete cart[keyOf(it)]; render(); });

    cartTableBody.appendChild(tr);
  });

  subtotalEl.textContent = EURO(subtotal);
  save();
}

function extractProduct(el){
  const sku = el.dataset.sku || '';
  const name = el.dataset.name || el.querySelector('h3')?.textContent?.trim() || 'Produit';
  const priceAttr = el.dataset.price;
  const price = priceAttr ? Number(priceAttr) : 0;
  return { sku, name, price };
}

// Boutons "Ajouter au panier"
products.forEach(el => {
  const addBtn = el.querySelector('.add');
  if (!addBtn) return;
  addBtn.addEventListener('click', () => {
    const item = extractProduct(el);
    addItem(item, 1);
    el.classList.add('added');
    setTimeout(()=>el.classList.remove('added'), 500);
  });
});

// Vider
if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    cart = {};
    render();
  });
}

// Checkout: compose un devis à coller en DM
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', () => {
    const lines = [];
    let total = 0;
    Object.values(cart).forEach(it => {
      const lt = (it.price || 0) * it.qty;
      total += lt;
      lines.push(`${it.name} ×${it.qty} ${it.price?EURO(it.price):''} = ${it.price?EURO(lt):'Sur devis'}`);
    });
    lines.push(`Sous-total: ${EURO(total)}`);
    const msg = `Bonjour, voici mon devis:%0A%0A${lines.join('%0A')}`;
    window.open(`https://instagram.com/direct/t/`,'_blank'); // ouvre les DMs
    navigator.clipboard?.writeText(lines.join('\n') + `\nSous-total: ${EURO(total)}`).catch(()=>{});
    alert('Devis copié. Collez-le dans vos DM Instagram.');
  });
}

// Init
load();
render();

/* ====== Amélioration ancrages: correctif header fixe ====== */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const y = el.getBoundingClientRect().top + window.pageYOffset - 84; // header ~72px + marge
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
});


/* 1) Menu burger existant ? Garde tel quel. */

/* 2) Parallaxe douce sur le hero */
(() => {
  const card = document.querySelector('.hero .hero-card');
  if(!card) return;
  window.addEventListener('scroll', () => {
    const y = Math.min(1, window.scrollY / 300);
    card.style.transform = `translateZ(${(1-y)*10}px) translateY(${y*8}px)`;
  }, {passive:true});
})();

/* 3) Révélations au scroll (IntersectionObserver) */
(() => {
  const els = document.querySelectorAll('.card, .product, .panel, .c-card');
  els.forEach(el => el.classList.add('reveal'));
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }});
  },{threshold:0.15});
  els.forEach(el=>io.observe(el));
})();

/* 4) Ripple sur .btn */
document.addEventListener('click', e=>{
  const b = e.target.closest('.btn');
  if(!b) return;
  const r = document.createElement('span');
  const rect = b.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  r.className = 'ripple';
  r.style.width = r.style.height = size+'px';
  r.style.left = (e.clientX - rect.left - size/2)+'px';
  r.style.top  = (e.clientY - rect.top  - size/2)+'px';
  b.appendChild(r);
  setTimeout(()=>r.remove(), 600);
});

/* 5) Tilt subtil sur .card/.product */
(() => {
  const tiltable = document.querySelectorAll('.card, .product');
  tiltable.forEach(el=>el.classList.add('tilt'));
})();

/* 6) Bouton flottant vers Boutique */
(() => {
  if(document.querySelector('.fab')) return;
  const a = document.createElement('a');
  a.href = '#boutique';
  a.className = 'fab';
  a.textContent = 'Commander';
  document.body.appendChild(a);
})();

