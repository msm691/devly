// Année footer
document.getElementById('y') && (document.getElementById('y').textContent = new Date().getFullYear());

// Burger menu
const toggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('mainnav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click', ()=>{
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded','false');
    });
  });
}

// Smooth scroll
document.querySelectorAll('header nav a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    e.preventDefault();
    const el=document.querySelector(a.getAttribute('href'));
    if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
  });
});

// Panier
const cart = new Map(); // sku -> {name, price, qty}
function formatEUR(n){
  if(n===0) return '0€';
  return new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n).replace(',00','');
}
function renderCart(){
  const tbody = document.querySelector('#cartTable tbody');
  if(!tbody) return;
  tbody.innerHTML='';
  let sum=0;
  for(const [sku,it] of cart){
    const tr=document.createElement('tr');
    const tot=(it.price||0)*it.qty; sum+=tot;
    tr.innerHTML = `
      <td>${it.name}</td>
      <td>${it.price?formatEUR(it.price):'—'}</td>
      <td>${it.qty}</td>
      <td>${it.price?formatEUR(tot):'—'}</td>
      <td><button data-sku="${sku}" class="rmv" aria-label="Supprimer">🗑️</button></td>
    `;
    tbody.appendChild(tr);
  }
  const sub=document.getElementById('subtotal');
  if(sub) sub.textContent=formatEUR(sum);
}
function addToCart(sku,name,price){
  const cur=cart.get(sku)||{name,price:Number(price)||0,qty:0};
  cur.qty+=1; cart.set(sku,cur); renderCart();
}

// Boutons Ajouter
document.querySelectorAll('.add').forEach(btn=>{
  btn.addEventListener('click', e=>{
    const p=e.target.closest('.product');
    addToCart(p.dataset.sku,p.dataset.name,p.dataset.price);
    p.classList.add('added');
    const old=e.target.textContent; e.target.textContent='Ajouté ✓';
    setTimeout(()=>{p.classList.remove('added'); e.target.textContent=old;},800);
  });
});

// Actions panier
const cartPanel=document.getElementById('cartPanel');
if(cartPanel){
  cartPanel.addEventListener('click', e=>{
    if(e.target.classList.contains('rmv')){
      cart.delete(e.target.dataset.sku); renderCart();
    }
  });
  const clearBtn=document.getElementById('clearCart');
  clearBtn && clearBtn.addEventListener('click', ()=>{ cart.clear(); renderCart(); });

  const checkout=document.getElementById('checkout');
  checkout && checkout.addEventListener('click', ()=>{
    let text='Panier vide — DevLy69';
    if(cart.size>0){
      let lines=[],sum=0;
      for(const[_,it]of cart){
        const t=(it.price||0)*it.qty; sum+=t;
        lines.push(`- ${it.name} x${it.qty} => ${it.price?formatEUR(t):'sur devis'}`);
      }
      text=`Commande/Devis — DevLy69\n${lines.join('\n')}\nSous-total estimé: ${formatEUR(sum)}`;
    }
    if(navigator.clipboard?.writeText){ navigator.clipboard.writeText(text).catch(()=>{}); }
    window.open('https://instagram.com/devly69','_blank');
  });
}
