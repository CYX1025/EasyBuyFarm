// 登入功能
function loginUser(event) {
  event.preventDefault();
  const username = document.getElementById("username").value;
  localStorage.setItem("loggedInUser", username);
  alert("登入成功！");
  window.location.href = "index.html";
}

function logoutUser() {
  localStorage.removeItem("loggedInUser");
  alert("已登出");
  window.location.href = "index.html";
}

// 購物車功能
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(name, price) {
  cart.push({ name, price: Number(price) });
  saveCart();
  updateCartCount();
  alert(`${name} 已加入購物車`);
}

function updateCartCount() {
  const cartCount = document.getElementById("cart-count");
  if (cartCount) cartCount.textContent = cart.length;
}

function renderCartItems() {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  if (!cartItemsContainer) return;

  cartItemsContainer.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;

    const li = document.createElement("li");
    li.textContent = `${item.name} - NT$${item.price}`;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "刪除";
    removeBtn.onclick = () => {
      cart.splice(index, 1);
      saveCart();
      updateCartCount();
      renderCartItems();
    };

    li.appendChild(removeBtn);
    cartItemsContainer.appendChild(li);
  });

  if (cartTotal) {
    cartTotal.textContent = `總金額: NT$${total}`;
  }
}

function clearCart() {
  cart = [];
  saveCart();
  updateCartCount();
  renderCartItems();
}

// 頁面載入檢查狀態
window.addEventListener("DOMContentLoaded", () => {
  const user = localStorage.getItem("loggedInUser");
  const authLinks = document.getElementById("auth-links");
  const memberBtn = document.getElementById("member-btn");
  const memberName = document.getElementById("member-name");

  if (user) {
    if (authLinks) authLinks.style.display = "none";
    if (memberBtn) memberBtn.style.display = "inline";
    if (memberName) memberName.textContent = user;
  }
  updateCartCount();
  renderCartItems();
});
