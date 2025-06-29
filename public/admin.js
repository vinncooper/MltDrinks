let cats = [], prods = [], mans = [];
let editingProd = null, editingCat = null, editingMan = null;

function switchTab(tab) {
  document.getElementById('productsTab').style.display = tab==='products'?'':'none';
  document.getElementById('categoriesTab').style.display = tab==='categories'?'':'none';
  document.getElementById('managersTab').style.display = tab==='managers'?'':'none';
}

async function loadCats() {
  cats = await fetch('/api/categories').then(r=>r.json());
  updateCatTable();
  fillCatSelect();
}
async function loadProds() {
  prods = await fetch('/api/products').then(r=>r.json());
  updateProdsTable();
}
async function loadMans() {
  mans = await fetch('/api/managers').then(r=>r.json());
  updateManTable();
}

function fillCatSelect() {
  const s = document.getElementById('prodCat');
  s.innerHTML = '';
  cats.forEach(c=>{
    let opt = document.createElement('option');
    opt.value = c.id;
    opt.innerText = c.name;
    s.appendChild(opt);
  });
}

function updateCatTable() {
  const t = document.getElementById('categoryTable');
  t.innerHTML = `<tr>
    <th>Категория</th>
    <th>Действия</th>
  </tr>`;
  cats.forEach(c=>{
    const row = document.createElement('tr');
    row.innerHTML = `<td>${c.name}</td>
      <td>
        <button class="small-btn edit" onclick="editCat(${c.id},'${c.name}')">✎</button>
        <button class="small-btn delete" onclick="delCat(${c.id})">🗑</button>
      </td>`;
    t.appendChild(row);
  });
}
function updateProdsTable() {
  const t = document.getElementById('productsTable');
  t.innerHTML = `<tr>
    <th>Название</th><th>Категория</th><th>Цена</th><th>Остаток</th>
    <th>В наличии</th><th>Хит</th><th>Акция</th><th>Уп.</th><th>Изображение</th><th>Действия</th>
  </tr>`;
  prods.forEach(p=>{
    const cat = cats.find(c=>c.id==p.category_id);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${p.name}</td>
      <td>${cat ? cat.name : ''}</td>
      <td>${p.price} ₽</td>
      <td>${p.stock_qty} ${p.in_pack?'уп.':'шт.'}</td>
      <td>${p.in_stock ? 'Да':'Нет'}</td>
      <td>${p.is_hot?'Да':'Нет'}</td>
      <td>${p.is_sale?'Да':'Нет'}</td>
      <td>${p.in_pack?'Да':'Нет'}</td>
      <td>${p.img ? `<img src="${p.img}" style="max-width:60px;">` : ''}</td>
      <td>
        <button class="small-btn edit" onclick="editProd(${p.id})">✎</button>
        <button class="small-btn delete" onclick="delProd(${p.id})">🗑</button>
      </td>`;
    t.appendChild(row);
  });
}
function updateManTable() {
  const t = document.getElementById('managersTable');
  t.innerHTML = `<tr>
    <th>Имя</th><th>Телефон</th><th>Telegram</th><th>WhatsApp</th><th>Действия</th>
  </tr>`;
  mans.forEach(m=>{
    const row = document.createElement('tr');
    row.innerHTML = `<td>${m.name}</td>
      <td>${m.phone||''}</td>
      <td>${m.telegram||''}</td>
      <td>${m.whatsapp||''}</td>
      <td>
        <button class="small-btn edit" onclick="editMan(${m.id})">✎</button>
        <button class="small-btn delete" onclick="delMan(${m.id})">🗑</button>
      </td>`;
    t.appendChild(row);
  });
}

async function addCategory() {
  let name = document.getElementById('newCategoryName').value;
  if (!name.trim()) return false;
  await fetch('/api/categories', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({name})
  });
  document.getElementById('newCategoryName').value = '';
  await loadCats();
  return false;
}
async function delCat(id) {
  if (!confirm('Удалить категорию?')) return;
  await fetch(`/api/categories/${id}`, {method:'DELETE'});
  await loadCats(); await loadProds();
}
async function editCat(id, name) {
  const n = prompt('Новое имя категории', name);
  if (!n) return;
  await fetch(`/api/categories/${id}`, {
    method:'PUT', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({name:n})
  });
  await loadCats();
}

async function addProduct() {
  const data = {
    name: document.getElementById('prodName').value,
    price: +document.getElementById('prodPrice').value,
    stock_qty: +document.getElementById('prodQty').value,
    in_stock: +document.getElementById('prodStock').value,
    category_id: +document.getElementById('prodCat').value,
    img: document.getElementById('prodImg').value,
    is_hot: document.getElementById('prodHot').checked?1:0,
    is_sale: document.getElementById('prodSale').checked?1:0,
    in_pack: document.getElementById('prodPack').checked?1:0,
  };
  if (editingProd) {
    await fetch(`/api/products/${editingProd}`, {
      method:'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(data)
    });
    editingProd = null;
  } else {
    await fetch('/api/products', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(data)
    });
  }
  document.querySelectorAll('#prodName,#prodPrice,#prodQty,#prodImg').forEach(i=>i.value='');
  document.getElementById('prodHot').checked = false;
  document.getElementById('prodSale').checked = false;
  document.getElementById('prodPack').checked = false;
  await loadProds();
  return false;
}
async function delProd(id) {
  if (!confirm('Удалить товар?')) return;
  await fetch(`/api/products/${id}`, {method:'DELETE'});
  await loadProds();
}
async function editProd(id) {
  const prod = prods.find(p=>p.id==id);
  editingProd = id;
  document.getElementById('prodName').value = prod.name;
  document.getElementById('prodPrice').value = prod.price;
  document.getElementById('prodQty').value = prod.stock_qty;
  document.getElementById('prodStock').value = prod.in_stock;
  document.getElementById('prodCat').value = prod.category_id;
  document.getElementById('prodImg').value = prod.img;
  document.getElementById('prodHot').checked = !!prod.is_hot;
  document.getElementById('prodSale').checked = !!prod.is_sale;
  document.getElementById('prodPack').checked = !!prod.in_pack;
}

async function addManager() {
  const data = {
    name: document.getElementById('managerName').value,
    phone: document.getElementById('managerPhone').value,
    telegram: document.getElementById('managerTG').value,
    whatsapp: document.getElementById('managerWA').value
  };
  if (editingMan) {
    await fetch(`/api/managers/${editingMan}`, {
      method:'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(data)
    });
    editingMan = null;
  } else {
    await fetch('/api/managers', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(data)
    });
  }
  document.querySelectorAll('#managerName,#managerPhone,#managerTG,#managerWA').forEach(i=>i.value='');
  await loadMans();
  return false;
}
async function delMan(id) {
  if (!confirm('Удалить менеджера?')) return;
  await fetch(`/api/managers/${id}`, {method:'DELETE'});
  await loadMans();
}
async function editMan(id) {
  const man = mans.find(m=>m.id==id);
  editingMan = id;
  document.getElementById('managerName').value = man.name;
  document.getElementById('managerPhone').value = man.phone;
  document.getElementById('managerTG').value = man.telegram;
  document.getElementById('managerWA').value = man.whatsapp;
}

async function startAdmin() {
  await loadCats();
  await loadProds();
  await loadMans();
}
startAdmin();
