/* ======================================
   初始化
====================================== */
window.addEventListener("DOMContentLoaded", () => {
  updateNavbar();
  updateCartCount();

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", loginUser);
  }

  if (document.querySelector("#cart-table")) {
    renderCart();
  }

  const logoutLink = document.getElementById("logout-link");
  if (logoutLink) logoutLink.addEventListener("click", logoutUser);
});

/* ======================================
   Navbar 登入/登出狀態控制
====================================== */
function updateNavbar() {
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "null");
  const memberBtn = document.getElementById("member-btn");
  const loginLink = document.getElementById("login-link");
  const registerLink = document.getElementById("register-link");
  const logoutLink = document.getElementById("logout-link");

  if (user) {
    if (memberBtn) memberBtn.style.display = "inline";
    if (logoutLink) logoutLink.style.display = "inline";
    if (loginLink) loginLink.style.display = "none";
    if (registerLink) registerLink.style.display = "none";
  } else {
    if (memberBtn) memberBtn.style.display = "none";
    if (logoutLink) logoutLink.style.display = "none";
    if (loginLink) loginLink.style.display = "inline";
    if (registerLink) registerLink.style.display = "inline";
  }
}

/* ======================================
   登出功能
====================================== */
function logoutUser() {
  localStorage.removeItem("loggedInUser");
  alert("已登出");
  updateNavbar();
  window.location.href = "index.html";
}

/* ======================================
   登入功能 (表單版，匹配後端 FormParam)
====================================== */
async function loginUser(event) {
  event.preventDefault();

  const username = document.getElementById("username")?.value.trim();
  const password = document.getElementById("password")?.value.trim();

  if (!username || !password) {
    alert("帳號或密碼不能為空");
    return;
  }

  const formData = new URLSearchParams();
  formData.append("keyword", username);
  formData.append("password", password);

  // 固定 URL 對應後端 Jersey 路徑
  const apiUrl = "http://localhost:8080/easybuyfarm/api/members/login";

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString()
    });

    if (res.ok) {
      const member = await res.json();
      localStorage.setItem("loggedInUser", JSON.stringify(member));
      alert("登入成功！");
      updateNavbar();
      window.location.href = "index.html";
    } else if (res.status === 401) {
      const msg = await res.text();
      alert(msg || "帳號或密碼錯誤");
    } else {
      const text = await res.text();
      console.error("HTTP錯誤:", res.status, text);
      alert("伺服器異常，請稍後再試");
    }
  } catch (err) {
    console.error(err);
    alert("無法連線到伺服器，請確認後端是否啟動");
  }
}

/* ======================================
   購物車功能
====================================== */
let cart = JSON.parse(localStorage.getItem("cart") || "[]");

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(name, price) {
  let existing = cart.find(item => item.name === name);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ name, price: Number(price), quantity: 1 });
  }
  saveCart();
  updateCartCount();
  alert(`${name} 已加入購物車`);
}

function updateCartCount() {
  const cartCount = document.getElementById("cart-count");
  if (cartCount) {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = total;
  }
}

function removeFromCart(name) {
  cart = cart.filter(item => item.name !== name);
  saveCart();
  updateCartCount();
  renderCart();
}

function clearCart() {
  if (confirm("確定要清空購物車嗎？")) {
    cart = [];
    saveCart();
    updateCartCount();
    renderCart();
  }
}

function renderCart() {
  const tableBody = document.querySelector("#cart-table tbody");
  if (!tableBody) return;

  tableBody.innerHTML = "";

  cart.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.price}</td>
      <td>${item.quantity}</td>
      <td>${(item.price * item.quantity).toFixed(2)}</td>
      <td><button type="button" onclick="removeFromCart('${item.name}')">刪除</button></td>
    `;
    tableBody.appendChild(tr);
  });

  const totalElem = document.querySelector(".total");
  if (totalElem) {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    totalElem.textContent = total.toFixed(2);
  }
}
