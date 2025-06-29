let categories = [];
let managers = [];

async function getCategories() {
  categories = await fetch('/api/categories').then(r => r.json());
}
async function getManagers() {
  managers = await fetch('/api/managers').then(r => r.json());
}

function showWelcome() {
  document.getElementById('welcome').style.display = '';
  document.getElementById('categoryPage').style.display = 'none';
  document.getElementById('productPage').style.display = 'none';
}
function showCategories() {
  document.getElementById('welcome').style.display = 'none';
  document.getElementById('categoryPage').style.display = '';
  document.getElementById('productPage').style.display = 'none';
}
function showProductsInCategory(id) {
  document.getElementById('welcome').style.display = 'none';
  document.getElementById('categoryPage').style.display = 'none';
  document.getElementById('productPage').style.display = '';
  const cat = categories.find(c => c.id == id);
  document.getElementById('catName').innerText = cat ? cat.name : '';
  loadProducts(id);
}

async function loadProducts(categoryId, search = '', inStock = '') {
  let url = `/api/products?category=${categoryId}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (inStock !== '') url += `&in_stock=${inStock}`;
  const products = await fetch(url).then(r => r.json());
  const cont = document.getElementById('productsInCategory');
  cont.innerHTML = '';
  products.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'product-card';
    let status = prod.in_stock ? `<span class="sticker instock">В наличии</span>` : `<span class="sticker outstock">Нет в наличии</span>`;
    let qty = prod.stock_qty ? `<span class="qty">Остаток: ${prod.stock_qty} ${prod.in_pack ? 'уп.' : 'шт.'}</span>` : '';
    let stickers = '';
    if (prod.is_hot) stickers += '<span class="sticker hot">ХИТ</span>';
    if (prod.is_sale) stickers += '<span class="sticker sale">АКЦИЯ</span>';
    card.innerHTML = `
      <b>${prod.name}</b> ${stickers}<br>
      ${status} ${qty}<br>
      <span class="price">${prod.price} ₽</span>
      ${prod.img ? `<br><img src="${prod.img}">` : ''}
    `;
    cont.appendChild(card);
  });
}

async function showHotProducts() {
  const products = await fetch('/api/products?in_stock=1').then(r => r.json());
  const hot = products.filter(p => p.is_hot);
  const cont = document.getElementById('hotProducts');
  cont.innerHTML = '';
  hot.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `<b>${prod.name}</b> <span class="sticker hot">ХИТ</span><br>
    <span class="sticker instock">В наличии</span> 
    <span class="qty">Остаток: ${prod.stock_qty || '-'} ${prod.in_pack ? 'уп.' : 'шт.'}</span><br>
    <span class="price">${prod.price} ₽</span>
    ${prod.img ? `<br><img src="${prod.img}">` : ''}
    `;
    cont.appendChild(card);
  });
}
async function showSaleProducts() {
  const products = await fetch('/api/products?in_stock=1').then(r => r.json());
  const sale = products.filter(p => p.is_sale);
  const cont = document.getElementById('saleProducts');
  cont.innerHTML = '';
  sale.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `<b>${prod.name}</b> <span class="sticker sale">АКЦИЯ</span><br>
    <span class="sticker instock">В наличии</span> 
    <span class="qty">Остаток: ${prod.stock_qty || '-'} ${prod.in_pack ? 'уп.' : 'шт.'}</span><br>
    <span class="price">${prod.price} ₽</span>
    ${prod.img ? `<br><img src="${prod.img}">` : ''}
    `;
    cont.appendChild(card);
  });
}

function fillFastLinks() {
  const fast = document.getElementById('fastLinks');
  fast.innerHTML = '';
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'fast-link';
    btn.innerText = cat.name;
    btn.onclick = () => showProductsInCategory(cat.id);
    fast.appendChild(btn);
  });
}

function fillCategories() {
  const cont = document.getElementById('categoryList');
  cont.innerHTML = '';
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'category-btn';
    btn.innerText = cat.name;
    btn.onclick = () => showProductsInCategory(cat.id);
    cont.appendChild(btn);
  });
}

document.getElementById('catalogBtn').onclick = () => {
  showCategories();
  fillCategories();
};
document.getElementById('searchInput').oninput = (e) => {
  const val = e.target.value;
  const filter = document.getElementById('filterStock').value;
  const catId = document.getElementById('catName').innerText;
  const cat = categories.find(c => c.name === catId);
  if (cat) loadProducts(cat.id, val, filter);
};
document.getElementById('filterStock').onchange = (e) => {
  const val = document.getElementById('searchInput').value;
  const filter = e.target.value;
  const catId = document.getElementById('catName').innerText;
  const cat = categories.find(c => c.name === catId);
  if (cat) loadProducts(cat.id, val, filter);
};

document.getElementById('managerBtn').onclick = async () => {
  await getManagers();
  if (!managers.length) return alert('Нет менеджеров.');
  let text = '';
  managers.forEach(m => {
    text += `${m.name}: ${m.phone ? `<a href="tel:${m.phone}">${m.phone}</a>` : ''} ${m.telegram ? `<a href="https://t.me/${m.telegram}">Telegram</a>` : ''}<br>`;
  });
  let win = window.open();
  win.document.write(`<h2>Менеджеры</h2>${text}`);
};

async function startup() {
  await getCategories();
  fillFastLinks();
  fillCategories();
  await showHotProducts();
  await showSaleProducts();
}
startup();
