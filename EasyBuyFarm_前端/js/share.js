// ======================================
// 全域購物車
// ======================================
window.cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(window.cart));
}

// ======================================
// DOMContentLoaded 主程式
// ======================================
document.addEventListener("DOMContentLoaded", async () => {

    // -------------------------------
  // ✅ 登入頁 / 註冊頁自動處理登入狀態
  // -------------------------------
  const token = localStorage.getItem("token");
  const isAuth = isAuthPage();

  // ✅ 如果已登入卻又打開 login/register → 強制登出並導回首頁
  if (token && isAuth) {
    await hardLogout(true); // 靜默登出
    window.location.href = "/html/index/index.html";
    return; // 不繼續載入後面內容
  }

  // ✅ 如果關閉瀏覽器重新開啟（session 已重啟），就清除登入資訊
  //    （利用 sessionStorage 旗標檢測瀏覽器是否重啟）
  if (!sessionStorage.getItem("browserSessionActive")) {
    // 表示這是新開的瀏覽器 session
    sessionStorage.setItem("browserSessionActive", "true");
    // 若 token 存在代表是上次遺留的 → 清除
    if (token) {
      await hardLogout(true);
    }
  }
//*************************************************************/
    // -------------------------------
    // 1️⃣ 載入 Navbar
    // -------------------------------
    const navbarContainer = document.getElementById("navbar-placeholder");

    if (navbarContainer) {
        try {
            const headerResponse = await fetch('/html/order/header.html');
            if (!headerResponse.ok) throw new Error(`載入 header.html 失敗 (HTTP ${headerResponse.status})`);
            const headerHtml = await headerResponse.text();
            navbarContainer.innerHTML = headerHtml;

            // 初始化搜尋框（按 Enter 導向結果頁）
            try {
                const searchInput = document.querySelector('.search-box');
                if (searchInput) {
                    const goSearch = () => {
                        const q = (searchInput.value || '').trim();
                        if (q) {
                            window.location.href = `/html/search/results.html?q=${encodeURIComponent(q)}`;
                        }
                    };
                    searchInput.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            goSearch();
                        }
                    });
                }
            } catch (_) { /* noop */ }

            // 初始化 Navbar
            initNavbarEvents();
            updateNavbarStatus();
            updateCartCount();
            initSellerButton();
        } catch (err) {
            console.error("載入 Navbar 失敗:", err.message);
            updateNavbarStatus();
            updateCartCount();
        }
    } else {
        // 沒有佔位符
        initNavbarEvents();
        updateNavbarStatus();
        updateCartCount();
        initSellerButton();
    }

    // -------------------------------
    // 2️⃣ 載入 Footer
    // -------------------------------
    await loadFooter();

    // -------------------------------
    // 3️⃣ 通用初始化
    // -------------------------------
    renderCartItems();
    initRegisterForm();
    initEditProfile();

    

    // -------------------------------
    // 5️⃣ 登入表單監聽
    // -------------------------------
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.removeEventListener("submit", loginUser);
        loginForm.addEventListener("submit", loginUser);
    }

    // 只有 member.html 才會有這個元素 → 自動載入
    if (document.getElementById("profile-memberId")) {
    loadMemberProfile();
    }


});

// ======================================
// Footer 載入函式
// ======================================
async function loadFooter() {
    try {
        const footerContainer = document.getElementById('loadFooter') || document.getElementById('footer-placeholder'); 
        if (!footerContainer) {
            console.warn("⚠️ 找不到 footer 容器");
            return;
        }

        const footerResponse = await fetch('/html/order/footer.html');
        if (!footerResponse.ok) throw new Error(`載入 footer.html 失敗 (HTTP ${footerResponse.status})`);

        footerContainer.innerHTML = await footerResponse.text();
        console.log("✅ Footer 載入成功");
    } catch (error) {
        console.error("❌ 載入 Footer 時發生錯誤:", error.message);
    }
}



/** 判斷目前是否為登入或註冊頁 */
function isAuthPage() {
  const p = (location.pathname || "").replace(/\\/g, "/");
  return (
    p.endsWith("/html/login/login.html") ||
    p.endsWith("/html/register/register.html")
  );
}

/** 強制登出（可靜默） */
async function hardLogout(silent = true) {
  try {
    await fetch("http://localhost:8080/easybuyfarm/members/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch (_) {
    // 忽略網路錯誤
  }
  localStorage.removeItem("token");
  localStorage.removeItem("loggedInUser");
  if (!silent) alert("已登出");
  if (typeof updateNavbarStatus === "function") updateNavbarStatus();
}

// ======================================
// Navbar 初始化函式
// ======================================
function initNavbarEvents() {
    // 登出事件
    const logoutLink = document.getElementById("logout-link");
    if (logoutLink) {
        logoutLink.removeEventListener("click", logoutUser);
        logoutLink.addEventListener("click", e => {
            e.preventDefault();
            logoutUser();
        });
    }

    const memberBtn = document.getElementById("member-btn");
    if (memberBtn) {
    memberBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const target = "/html/member/member.html";
    if (!token) {
      window.location.href = "/html/login/login.html?redirect=" + encodeURIComponent(target);
      return;
    }
    window.location.href = target;
    });
    }

    // 下拉選單初始化
    initDropdown();
}


// -------------------------------
    // 4️⃣ 會員資料載入
    // -------------------------------
async function loadMemberProfile() {
  try {
    const token = localStorage.getItem("token");
    const targetUrl = "/html/member/member.html";

    if (!token) {
      window.location.href = "/html/login/login.html?redirect=" + encodeURIComponent(targetUrl);
      return;
    }

    const res = await fetch("http://localhost:8080/easybuyfarm/members/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("loggedInUser");
      window.location.href = "/html/login/login.html?redirect=" + encodeURIComponent(targetUrl);
      return;
    }

    if (!res.ok) {
      const txt = await res.text();
      alert(`取得會員資料失敗：${txt || "HTTP " + res.status}`);
      return;
    }

    // /me 直接回傳 Member 物件
    const member = await res.json();
    const isActive = toBool(member.status);
    // 填入欄位
    setText("profile-memberId", member.memberId || "未設定");
    setText("profile-firstName", member.firstName || "未設定");
    setText("profile-lastName", member.lastName || "未設定");
    setText("profile-phone", member.phone || "未設定");
    setText("profile-email", member.email || "未設定");
    setText("profile-birthday", member.birthday || "未設定");
    setText("profile-address", member.address || "未設定");
    setText("profile-role", member.role === "SELLER" ? "賣家" : "會員");
    setText("profile-status", isActive ? "啟用" : "停用");

    // 同步 navbar 的歡迎詞資料，避免還用舊的
    localStorage.setItem("loggedInUser", JSON.stringify(member));
    updateNavbarStatus();
  } catch (err) {
    console.error("載入會員資料失敗：", err);
    alert("載入會員資料時發生錯誤，請稍後再試");
  }
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val ?? "";
}


// 工具：把 BIT(1) / boolean / number / string 都轉成布林
function toBool(v) {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v === 1;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    return s === '1' || s === 'true' || s === 'y' || s === 'yes';
  }
  return false;
}

function initDropdown() {
    const dropdownBtn = document.querySelector(".dropbtn");
    const dropdownContent = document.querySelector(".dropdown-content");

    if (dropdownBtn && dropdownContent) {
        dropdownBtn.addEventListener("click", e => {
            e.stopPropagation();
            dropdownContent.classList.toggle("show");
        });
    }

    window.addEventListener("click", () => {
        if (dropdownContent?.classList.contains('show')) {
            dropdownContent.classList.remove('show');
        }
    });
}

// ======================================
// Navbar 顯示狀態
// ======================================
function updateNavbarStatus() {
    const user = getLoggedInUser();
    const memberBtn = document.getElementById("member-btn");
    const loginLink = document.getElementById("login-link");
    const registerLink = document.getElementById("register-link");
    const logoutLink = document.getElementById("logout-link");
    const welcomeMsg = document.getElementById("welcome-message");
    const beSellerBtn = document.getElementById("be-seller-btn");

    if (user) {
        if (welcomeMsg) {
            const user = getLoggedInUser();
            const displayName = ((user?.lastName || "") + (user?.firstName || "")) 
                      || user?.phone || user?.email || "會員";
            welcomeMsg.textContent = `歡迎, ${displayName}`;
        }
        if (memberBtn) memberBtn.style.display = "block";
        if (logoutLink) logoutLink.style.display = "block";
        if (loginLink) loginLink.style.display = "none";
        if (registerLink) registerLink.style.display = "none";

        if (beSellerBtn) {
            beSellerBtn.style.display = "block";
            if (user.role && user.role.toUpperCase() === 'SELLER') {
                beSellerBtn.textContent = '我的賣場';
                beSellerBtn.dataset.role = 'seller'; 
            } else {
                beSellerBtn.textContent = '成為賣家';
                beSellerBtn.dataset.role = 'member';
            }
        }
    } else {
        if (welcomeMsg) welcomeMsg.textContent = "";
        if (memberBtn) memberBtn.style.display = "none";
        if (logoutLink) logoutLink.style.display = "none";
        if (loginLink) loginLink.style.display = "block";
        if (registerLink) registerLink.style.display = "block";

        if (beSellerBtn) {
            beSellerBtn.style.display = "block";
            beSellerBtn.textContent = '成為賣家';
            beSellerBtn.dataset.role = 'guest';
        }
    }
}

// ======================================
// 會員相關
// ======================================
async function logoutUser() {
  try {
    await fetch("http://localhost:8080/easybuyfarm/members/logout", { 
      method: "POST",
      credentials: "include"
    });
  } catch (err) {
    console.error("登出 API 錯誤:", err);
  }
  localStorage.removeItem("token");
  localStorage.removeItem("loggedInUser");
  alert("已登出");
  updateNavbarStatus();
  window.location.href = "/html/index/index.html";
}


function getLoggedInUser() {
    const userStr = localStorage.getItem("loggedInUser");
    try {
        return userStr ? JSON.parse(userStr) : null;
    } catch { return null; }
}

// ======================================
// 購物車相關
// ======================================
function updateCartCount() {
    const cartCount = document.getElementById("cart-count");
    if (cartCount) {
        const totalCount = window.cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalCount;
    }
}

function renderCartItems() {
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = "";
    let total = 0;

    window.cart.forEach((item, index) => {
        total += item.price * item.quantity;
        const li = document.createElement("li");
        li.className = 'cart-item-detail';
        li.innerHTML = `
            <div class="cart-item-info">${item.name} - NT$${item.price}</div>
            <div class="cart-controls">
                <button class="cart-btn" data-action="minus" data-index="${index}">-</button>
                <span class="cart-qty" aria-label="數量">${item.quantity}</span>
                <button class="cart-btn" data-action="plus" data-index="${index}">+</button>
                <button class="cart-btn delete-btn" data-action="remove" data-index="${index}">刪除</button>
            </div>
        `;
        cartItemsContainer.appendChild(li);
    });

    cartItemsContainer.onclick = e => {
        const target = e.target;
        if (!target.classList.contains('cart-btn')) return;
        const index = parseInt(target.dataset.index);
        const action = target.dataset.action;
        let item = window.cart[index];

        if (action === 'minus') {
            if (item.quantity > 1) item.quantity -= 1;
            else window.cart.splice(index, 1);
        } else if (action === 'plus') {
            item.quantity += 1;
        } else if (action === 'remove') {
            window.cart.splice(index, 1);
        }

        saveCart();
        updateCartCount();
        renderCartItems();
    };

    if (cartTotal) cartTotal.textContent = `總金額: NT$${total}`;
}

function clearCart() {
    window.cart = [];
    saveCart();
    updateCartCount();
    renderCartItems();
}

// ======================================
// 空函式 (避免 ReferenceError)
// ======================================
function initRegisterForm(){}
function initEditProfile(){}
function initSellerButton(){}

function initSellerButton() {
    const beSellerBtn = document.getElementById("be-seller-btn");
    const contractModal = document.getElementById("contract-modal");
    const closeModalBtn = document.getElementById("close-modal-btn");
    const agreeBtn = document.getElementById("agree-contract-btn");
    const overlay = document.getElementById("modal-overlay");

    // 輔助函數：關閉 Modal (只有 Modal 存在時才有用)
    const closeModal = () => {
        if (contractModal) contractModal.style.display = "none";
        if (overlay) overlay.style.display = "none";
        document.body.classList.remove('modal-open');
    };

    // 點擊升級按鈕 (主要變動點在這裡)
    if (beSellerBtn) {
        beSellerBtn.addEventListener("click", async (e) => {
            e.preventDefault(); // 阻止按鈕的默認行為 (例如表單提交或導航)
            
            const user = getLoggedInUser();
            
            if (!user) {
                alert("請先登入會員");
                window.location.href = "/html/login/login.html";
                return;
            }
			if (user.role === 'seller'|| user.role === 'SELLER'){
			                // 如果用戶物件本身就標記為 'seller'，直接導向賣家中心，阻止重複註冊
			                alert("即將導向我的賣場。");
			                window.location.href = "/html/store/editStore.html"; // 替換為你的賣家中心頁面
			                return; // 執行完畢，結束函式
			            }

            // 🌟 關鍵修改：取得在 updateNavbarStatus 中設定的角色狀態 🌟
            const currentRole = beSellerBtn.dataset.role;

            if (currentRole === 'SELLER') {
                // 狀況一：已是賣家 (按鈕顯示「我的賣場」)
                // 直接導向賣家儀表板
                window.location.href = "/html/store/editStore.html"; // 替換為你的賣家中心頁面
            } else {
                // 狀況二：一般會員 (按鈕顯示「成為賣家」)
                
                if (contractModal) {
                    // Modal 存在 (如 index.html)，顯示合約
                    contractModal.style.display = "flex";
                    if (overlay) overlay.style.display = "block";
                    document.body.classList.add('modal-open');
                } else {
                    // Modal 不存在 (如 member.html)，導向到可以處理的頁面
                    alert("請在首頁簽署賣家合約以完成升級。");
                    window.location.href = "/html/index/index.html";
                }
            }
        });
    }

    // 只有在 Modal 相關元素存在時，才綁定關閉和同意的邏輯
    if (contractModal) {
        // 點擊關閉按鈕
        if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);

        // 點擊背景遮罩
        if (overlay) overlay.addEventListener("click", closeModal);

        // 點擊同意按鈕
        if (agreeBtn) {
    agreeBtn.addEventListener("click", async () => {
        try {
            const token = localStorage.getItem("token"); // 或 cookie
            if (!token) {
                alert("請先登入會員");
                window.location.href = "/html/login/login.html";
                return;
            }

            const res = await fetch("http://localhost:8080/easybuyfarm/members/upgradeSeller", {
                method: "PUT",
                credentials: "include", // 如果用 cookie 認證才需要
                headers: { 
                    "Authorization": `Bearer ${token}` 
                }
            });

            if (res.ok) {
                alert("你已成功升級為賣家！請重新登入以更新權限。");
                closeModal();
                logoutUser(); 
            } else if (res.status === 401) {
                alert("Token 無效或過期，請重新登入");
                window.location.href = "/html/login/login.html";
            } else {
                const text = await res.text();
                alert("升級失敗: " + (text || "未知錯誤"));
            }
        } catch (err) {
            console.error(err);
            alert("網路錯誤，無法升級為賣家");
        }
    });
}
    }
}
