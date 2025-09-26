/* ======================================
   登入 / 登出功能
   ====================================== */

/**
 * 登入功能
 * @param {Event} event - 表單提交事件
 */
function loginUser(event) {
  event.preventDefault(); // 阻止表單預設提交行為

  // 取得輸入的使用者名稱
  const username = document.getElementById("username").value;

  // 將使用者名稱存入 localStorage 作為登入狀態
  localStorage.setItem("loggedInUser", username);

  alert("登入成功！");

  // 登入後跳轉回首頁
  window.location.href = "index.html";
}

/**
 * 登出功能
 */
function logoutUser() {
  // 移除 localStorage 中的登入資訊
  localStorage.removeItem("loggedInUser");

  alert("已登出");

  // 登出後跳轉回首頁
  window.location.href = "index.html";
}

/* ======================================
   購物車功能
   ====================================== */

/* 讀取 localStorage 中的購物車資料，如果沒有則初始化為空陣列 */
let cart = JSON.parse(localStorage.getItem("cart")) || [];

/**
 * 儲存購物車資料到 localStorage
 */
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

/**
 * 加入商品到購物車
 * @param {string} name - 商品名稱
 * @param {number} price - 商品價格
 */
function addToCart(name, price) {
  // 檢查購物車是否已有相同商品
  let existingItem = cart.find(item => item.name === name);

  if (existingItem) {
    // 已存在 → 數量 +1
    existingItem.quantity += 1;
  } else {
    // 新增一筆商品
    cart.push({ name, price: Number(price), quantity: 1 });
  }

  saveCart();          // 更新 localStorage
  updateCartCount();   // 更新購物車數量徽章
  alert(`${name} 已加入購物車`);
}

/**
 * 更新購物車數量徽章
 */
function updateCartCount() {
  const cartCount = document.getElementById("cart-count");
  if (cartCount) {
    // 計算購物車中所有商品的總數量
    let totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalCount;
  }
}

/**
 * 渲染購物車列表與總金額
 */
function renderCartItems() {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");

  if (!cartItemsContainer) return; // 如果頁面沒有購物車元素就直接返回

  cartItemsContainer.innerHTML = ""; // 清空現有列表
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.quantity; // 計算總金額

    // 創建商品列表項目
    const li = document.createElement("li");
    li.textContent = `${item.name} - NT$${item.price} x ${item.quantity}`;

    // 減少數量按鈕
    const minusBtn = document.createElement("button");
    minusBtn.textContent = "-";
    minusBtn.onclick = () => {
      if (item.quantity > 1) item.quantity -= 1;
      else cart.splice(index, 1); // 數量為1再按就刪除商品
      saveCart();
      updateCartCount();
      renderCartItems();
    };

    // 增加數量按鈕
    const plusBtn = document.createElement("button");
    plusBtn.textContent = "+";
    plusBtn.onclick = () => {
      item.quantity += 1;
      saveCart();
      updateCartCount();
      renderCartItems();
    };

    // 刪除整個商品按鈕
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "刪除";
    removeBtn.onclick = () => {
      cart.splice(index, 1); // 從陣列中移除
      saveCart();
      updateCartCount();
      renderCartItems();
    };

    // 將按鈕加入 li 元素
    li.appendChild(minusBtn);
    li.appendChild(plusBtn);
    li.appendChild(removeBtn);

    // 將商品加入容器
    cartItemsContainer.appendChild(li);
  });

  // 更新總金額
  if (cartTotal) {
    cartTotal.textContent = `總金額: NT$${total}`;
  }
}

/**
 * 清空購物車
 */
function clearCart() {
  cart = [];
  saveCart();
  updateCartCount();
  renderCartItems();
}

/* ======================================
   初始化頁面狀態
   ====================================== */
window.addEventListener("DOMContentLoaded", () => {
  // 取得登入使用者
  const user = localStorage.getItem("loggedInUser");
  const memberBtn = document.getElementById("member-btn");

  // 如果使用者已登入，顯示「會員中心」按鈕
  if (user) {
    if (memberBtn) memberBtn.style.display = "inline";
  }

  // 初始化購物車數量徽章
  updateCartCount();

  // 初始化購物車列表
  renderCartItems();
});