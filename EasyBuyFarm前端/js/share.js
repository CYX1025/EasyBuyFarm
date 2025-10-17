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
    // 1️⃣ 載入 Navbar
    // -------------------------------
    const navbarContainer = document.getElementById("navbar-placeholder");

    if (navbarContainer) {
        try {
            const headerResponse = await fetch('../../html/order/header.html');
            if (!headerResponse.ok) throw new Error(`載入 header.html 失敗 (HTTP ${headerResponse.status})`);
            const headerHtml = await headerResponse.text();
            navbarContainer.innerHTML = headerHtml;

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
    // 4️⃣ 會員資料載入
    // -------------------------------
    if (document.getElementById('edit-profile-form') || document.getElementById('profile-lastName')) {
        loadMemberProfile();
    }

    // -------------------------------
    // 5️⃣ 登入表單監聽
    // -------------------------------
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.removeEventListener("submit", loginUser);
        loginForm.addEventListener("submit", loginUser);
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

        const footerResponse = await fetch('../../html/order/footer.html');
        if (!footerResponse.ok) throw new Error(`載入 footer.html 失敗 (HTTP ${footerResponse.status})`);

        footerContainer.innerHTML = await footerResponse.text();
        console.log("✅ Footer 載入成功");
    } catch (error) {
        console.error("❌ 載入 Footer 時發生錯誤:", error.message);
    }
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

    // 下拉選單初始化
    initDropdown();
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
        if (welcomeMsg) welcomeMsg.textContent = `歡迎, ${user.name || "會員"}`;
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
        await fetch("/easybuyfarm/api/members/logout", { method: "POST", credentials: "include" });
    } catch (err) {
        console.error("登出 API 錯誤:", err);
    }
    localStorage.removeItem("loggedInUser");
    alert("已登出");
    updateNavbarStatus();
    window.location.href = "./html/index/index.html";
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
            ${item.name} - NT$${item.price} x ${item.quantity}
            <div class="cart-controls">
                <button class="cart-btn" data-action="minus" data-index="${index}">-</button>
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
function loadMemberProfile(){}
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
			                alert("您已是賣家，即將導向我的賣場。");
			                window.location.href = "/html/storelist/storelist.html"; // 替換為你的賣家中心頁面
			                return; // 執行完畢，結束函式
			            }

            // 🌟 關鍵修改：取得在 updateNavbarStatus 中設定的角色狀態 🌟
            const currentRole = beSellerBtn.dataset.role;

            if (currentRole === 'SELLER') {
                // 狀況一：已是賣家 (按鈕顯示「我的賣場」)
                // 直接導向賣家儀表板
                window.location.href = "/html/storelist/storelist.html"; // 替換為你的賣家中心頁面
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
                // ... (同意升級的 AJAX 邏輯，不變)
                try {
                    const res = await fetch(`/easybuyfarm/api/members/upgradeSeller`, {
                        method: "PUT",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" }
                    });

                    if (res.ok) {
                        alert("你已成功升級為賣家！請重新登入以更新權限。");
                        closeModal();
                        // 升級成功後，強制登出，讓下次登入能從後端取得新的 'seller' 角色
                        logoutUser(); 
                    } else if (res.status === 401) {
                        alert("請先登入會員");
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