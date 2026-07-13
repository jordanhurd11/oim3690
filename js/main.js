import { items } from "./data.js";

const listContainer = document.getElementById("list");

items.forEach(function(item) {
  const card = document.createElement("li");
  card.className = "item-card";

  const stockStatus = item.inStock ? "✓ In Stock" : "✗ Out of Stock";
  const stockClass = item.inStock ? "in-stock" : "out-of-stock";

  card.innerHTML = `
    <div class="item-header">
      <h3>${item.name}</h3>
      <span class="category-badge">${item.category}</span>
    </div>
    <p class="description">${item.description}</p>
    <div class="item-footer">
      <div class="item-info">
        <span class="price">$${item.price.toFixed(2)}</span>
        <span class="rating">⭐ ${item.rating}/5</span>
      </div>
      <span class="stock-status ${stockClass}">${stockStatus}</span>
    </div>
  `;

  listContainer.appendChild(card);
});