// URL к API-бэкенду
const API = '/api';

// -------------------
// Для каталога (index.html)
// -------------------
function showCatalog() {
    document.getElementById('welcome').style.display = 'none';
    document.getElementById('catalog').style.display = '';
    loadCatalogData();
}

if (document.getElementById('goto-catalog')) {
    document.getElementById('goto-catalog').onclick = function () {
        localStorage.setItem('mlt_drinks_visited', '1');
        showCatalog();
    };

    // Показать каталог если уже был
    if (localStorage.getItem('mlt_drinks_visited') === '1') {
        showCatalog();
    }
}

async function loadCatalogData() {
    // Получение категорий
    const cats = await fetch(API + '/categories').then(r => r.json());
    // Получение товаров
    const products = await fetch(API + '/products').then(r => r.json());

    // Категории для кнопок
    const catButtons = document.getElementById('category-buttons');
    catButtons.innerHTML = '';
    cats.forEach(cat => {
        const btn = document.createElement('button');
        btn.textContent = cat.name;
        btn.onclick = () => renderProducts(products.filter(p => p.category_id === cat.id));
        catButtons.appendChild(btn);
    });

    // Хиты продаж
    const hits = products.filter(p => p.is_top);
    renderProducts(hits, 'hits-list');

    // По умолчанию — товары первой категории
    if (cats.length > 0) renderProducts(products.filter(p => p.category_id === cats[0].id));

    // Фильтр поиска
    document.getElementById('search').oninput = function() {
        const q = this.value.toLowerCase();
        renderProducts(products.filter(
            p => p.name.toLowerCase().includes(q) || (p.volume || '').toLowerCase().includes(q)
        ));
    };
}

function renderProducts(products, id = 'products-list') {
    const cont = document.getElementById(id);
    if (!cont) return;
    cont.innerHTML = '';
    if (products.length === 0) {
        cont.innerHTML = '<div class="empty-msg">Нет товаров</div>';
        return;
    }
    products.forEach(p => {
        const el = document.createElement('div');
        el.className = 'product-card';
        el.innerHTML = `
            <img src="${p.image_url || 'https://via.placeholder.com/80x100?text=Фото'}" alt="${p.name}">
            <div><b>${p.name}</b></div>
            <div>${p.volume ? `${p.volume}` : ''}</div>
            <div><b>${p.price} ₽</b></div>
            <div>Мин. заказ: ${p.min_order}</div>
            <div class="${p.in_stock ? 'instock' : 'outofstock'}">
                ${p.in_stock ? 'В наличии' : 'Нет в наличии'}
            </div>
        `;
        cont.appendChild(el);
    });
}

// -------------------
// Для админки (admin.html)
// -------------------

if (document.getElementById('category-form')) {
    // Загрузка категорий для select и списка
    async function loadCategoriesAdmin() {
        const cats = await fetch(API + '/categories').then(r => r.json());
        const sel = document.getElementById('product-category');
        sel.innerHTML = '';
        cats.forEach(cat => {
            sel.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
        });
        // Отдельный список категорий
        const ul = document.getElementById('categories-admin');
        ul.innerHTML = '';
        cats.forEach(cat => {
            const li = document.createElement('li');
            li.textContent = cat.name;
            ul.appendChild(li);
        });
    }
    loadCategoriesAdmin();

    document.getElementById('category-form').onsubmit = async function (e) {
        e.preventDefault();
        const name = document.getElementById('category-name').value;
        await fetch(API + '/categories', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        this.reset();
        loadCategoriesAdmin();
    };

    document.getElementById('product-form').onsubmit = async function (e) {
        e.preventDefault();
        const body = {
            name: document.getElementById('product-name').value,
            volume: document.getElementById('product-volume').value,
            price: parseFloat(document.getElementById('product-price').value),
            min_order: parseInt(document.getElementById('product-minorder').value, 10),
            image_url: document.getElementById('product-image').value,
            category_id: parseInt(document.getElementById('product-category').value, 10),
            in_stock: document.getElementById('product-instock').checked,
            is_top: document.getElementById('product-istop').checked
        };
        await fetch(API + '/products', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        this.reset();
        loadProductsAdmin();
    };

    async function loadProductsAdmin() {
        const products = await fetch(API + '/products').then(r => r.json());
        const ul = document.getElementById('products-admin');
        ul.innerHTML = '';
        products.forEach(p => {
            const li = document.createElement('li');
            li.innerHTML = `<b>${p.name}</b> (${p.volume}), ${p.price} ₽, мин. заказ: ${p.min_order}, 
            <span class="${p.in_stock ? 'instock' : 'outofstock'}">
                ${p.in_stock ? 'В наличии' : 'Нет в наличии'}
            </span>
            [${p.is_top ? 'Хит' : ''}]
            `;
            ul.appendChild(li);
        });
    }
    loadProductsAdmin();
}
