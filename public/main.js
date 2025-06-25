const API_URL = '/api/products';

async function loadProducts() {
  const res = await fetch(API_URL);
  const products = await res.json();

  const allDiv = document.getElementById('all');
  const hitsDiv = document.getElementById('hits');

  if (allDiv) allDiv.innerHTML = '';
  if (hitsDiv) hitsDiv.innerHTML = '';

  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product';
    card.innerHTML = `
      <img src="${product.photo}" alt="${product.name}" />
      <h3>${product.name}</h3>
      <p>${product.price}₽</p>
      <span class="${product.status === 'в наличии' ? 'green' : 'red'}">${product.status}</span>
    `;
    if (allDiv) allDiv.appendChild(card);
    if (hitsDiv && product.isHit) hitsDiv.appendChild(card.cloneNode(true));
  });
}

const form = document.getElementById('product-form');
if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const product = {
      name: document.getElementById('name').value,
      photo: document.getElementById('photo').value,
      price: parseFloat(document.getElementById('price').value),
      status: document.getElementById('status').value,
      isHit: document.getElementById('isHit').checked,
    };

    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });

    form.reset();
    await loadProducts();
  });
}

loadProducts();
