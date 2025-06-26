// --- DEMO данные! Для работы с БД надо подменить на API ---
const CATEGORIES = ["Soft Drinks", "Water", "Energy Drinks", "Snacks"];
const PRODUCTS = [
  {
    name: "Coca-Cola", image: "https://cdn.icon-icons.com/icons2/1875/PNG/512/iconfinder-cocacola-4411093_120577.png",
    category: "Soft Drinks", price: 1.00, volume: "0.5 l", min_order: 12, in_stock: true, is_top: true
  },
  {
    name: "Pepsi", image: "https://cdn.icon-icons.com/icons2/1875/PNG/512/iconfinder-pepsi-4411096_120578.png",
    category: "Soft Drinks", price: 1.00, volume: "0.33 l", min_order: 12, in_stock: true, is_top: true
  },
  {
    name: "Red Bull", image: "https://cdn-icons-png.flaticon.com/512/871/871600.png",
    category: "Energy Drinks", price: 1.10, volume: "0.25 l", min_order: 12, in_stock: true, is_top: true
  },
  {
    name: "Lay’s Potato Chips", image: "https://cdn-icons-png.flaticon.com/512/865/865021.png",
    category: "Snacks", price: 0.89, volume: "90g", min_order: 12, in_stock: false, is_top: false
  },
  // ...ещё товары
];

const LS_KEY = "mlt_drinks_welcomed";

// --- Приветственная страница только при первом входе ---
function showWelcome(force = false) {
  if (force || !localStorage.getItem(LS_KEY)) {
    document.getElementById("welcome").classList.remove("hidden");
    document.getElementById("catalog").classList.add("hidden");
  } else {
    showCatalog();
  }
}
function showCatalog() {
  document.getElementById("welcome").classList.add("hidden");
  document.getElementById("catalog").classList.remove("hidden");
}
document.getElementById("goToCatalog").onclick = () => {
  localStorage.setItem(LS_KEY, "1");
  showCatalog();
};
// --- Сброс приветствия (если почистили чат) ---
window.onload = () => showWelcome();


// --- Категории ---
const categoriesDiv = document.getElementById("categories");
let selectedCat = CATEGORIES[0];
function renderCategories() {
  categoriesDiv.innerHTML = "";
  CATEGORIES.forEach(cat => {
    const btn = document.createElement("button");
    btn.textContent = cat;
    btn.className = "category-btn" + (cat === selectedCat ? " active" : "");
    btn.onclick = () => { selectedCat = cat; renderAll(); };
    categoriesDiv.appendChild(btn);
  });
}

// --- Фильтр, поиск, товары ---
const searchInput = document.getElementById("searchInput");
searchInput.oninput = () => renderAll();

function renderAll() {
  renderCategories();
  const q = searchInput.value.toLowerCase();
  // --- Хиты продаж ---
  const bestsellers = PRODUCTS.filter(p => p.is_top && p.category === selectedCat && p.name.toLowerCase().includes(q));
  renderProducts(bestsellers, document.getElementById("bestsellers"));
  // --- Все товары ---
  const all = PRODUCTS.filter(p => p.category === selectedCat && p.name.toLowerCase().includes(q));
  renderProducts(all, document.getElementById("products"));
}

function renderProducts(list, root) {
  root.innerHTML = "";
  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${p.image}" alt="">
      <div class="product-title">${p.name}</div>
      <div class="product-volume">${p.volume}</div>
      <div class="product-price">$${p.price.toFixed(2)}</div>
      <div class="product-min-order">Min. order: ${p.min_order}</div>
      <div class="${p.in_stock ? "in-stock" : "not-in-stock"}">
        ${p.in_stock ? "● In Stock" : "● Not in stock"}
      </div>
    `;
    root.appendChild(card);
  });
}
