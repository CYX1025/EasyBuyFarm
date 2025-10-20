// ======================================
// 全域變數
// ======================================
// 載入購物車 (從 localStorage)
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ======================================
// Helper Functions (輔助函式)
// ======================================

/** 安全地設定元素的值 (e.g., input fields) */
function safeSetValue(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
}

/** 安全地設定元素的文本內容 (e.g., div, span) */
function safeSetText(id, val) {
    const el = document.getElementById(id);
    // 保持 HTML 預設的 '*' 提示如果資料為空
    if (el) el.textContent = val || '*';
}

/** 儲存購物車資料到 localStorage */
function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

/** 從 localStorage 取得已登入的使用者物件 */
function getLoggedInUser() {
    const userString = localStorage.getItem("loggedInUser");
    try {
        // 確保取出的資料能被解析，若儲存的是字串則返回字串
        return userString ? JSON.parse(userString) : null;
    } catch (e) {
        // 如果解析失敗，表示儲存格式有誤，直接返回字串內容或 null
        return userString || null;
    }
}

/** 將使用者物件儲存到 localStorage */
function setLoggedInUser(user) {
    localStorage.setItem("loggedInUser", JSON.stringify(user));
}

// ======================================
// Navbar / 登入登出狀態控制
// ======================================

/**
 * 核心函式：更新導覽列的登入/登出狀態顯示
 * 【優化點】：統一使用 getLoggedInUser 確保資料格式一致
 */
function updateNavbarStatus() {
    const user = getLoggedInUser(); // 取得使用者物件或 null
    const memberBtn = document.getElementById("member-btn");
    const loginLink = document.getElementById("login-link");
    const registerLink = document.getElementById("register-link");
    const logoutLink = document.getElementById("logout-link");
    const welcomeMsg = document.getElementById("welcome-message");
    const beSellerBtn = document.getElementById("be-seller-btn"); // 確保取得按鈕

    if (user) {
        // 已登入狀態
        if (welcomeMsg) welcomeMsg.textContent = `歡迎, ${user.name || "會員"}`;
        if (memberBtn) memberBtn.style.display = "block";
        if (logoutLink) logoutLink.style.display = "block";
        if (loginLink) loginLink.style.display = "none";
        if (registerLink) registerLink.style.display = "none";
        
        // 🌟 角色判斷邏輯 (新加入或修改的部分) 🌟
        if (beSellerBtn) {
            beSellerBtn.style.display = "block"; // 確保登入後按鈕仍顯示

            if (user.role && user.role.toUpperCase() === 'SELLER') {
                // 賣家狀態：按鈕改為「我的賣場」，並標記角色
                beSellerBtn.textContent = '我的賣場';
                beSellerBtn.dataset.role = 'seller'; 
            } else {
                // 一般會員狀態：按鈕為「成為賣家」，並標記角色
                beSellerBtn.textContent = '成為賣家';
                beSellerBtn.dataset.role = 'member';
            }
        }
        // 🌟 角色判斷邏輯結束 🌟

    } else {
        // 未登入狀態
        if (welcomeMsg) welcomeMsg.textContent = "";
        if (memberBtn) memberBtn.style.display = "none";
        if (logoutLink) logoutLink.style.display = "none";
        if (loginLink) loginLink.style.display = "block";
        if (registerLink) registerLink.style.display = "block";
        
        // 未登入時，按鈕顯示為「成為賣家」
        if (beSellerBtn) {
            beSellerBtn.style.display = "block";
            beSellerBtn.textContent = '成為賣家';
            beSellerBtn.dataset.role = 'guest'; // 標記為訪客角色
        }
    }
}

/** 處理使用者登入邏輯 */
async function loginUser(event) {
    event.preventDefault();
    const keyword = document.getElementById("username")?.value.trim();
    const password = document.getElementById("password")?.value.trim();

    if (!keyword || !password) {
        alert("請輸入帳號與密碼");
        return;
    }

    try {
        const params ={
            keyword: keyword,
            password: password
        };

        const res = await fetch("http://localhost:8080/members/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params),
            credentials: "include"
        });

        if (res.ok) {
            const member = await res.json();
            // 【優化點】：登入成功後儲存用戶資訊，儲存為物件
            setLoggedInUser({
                name: member.name || member.phone || "會員",
                phone: member.phone,
                // 這裡可以加入其他資訊如 role
				role: (member.role && member.role.toUpperCase()) || 'MEMBER', 
				            });
            alert("登入成功！");
            updateNavbarStatus();
            window.location.href = "index.html";
        } else {
            const text = await res.text();
            alert(text || "登入失敗");
        }
    } catch (err) {
        console.error("登入請求錯誤:", err);
        alert("網路錯誤，請稍後再試");
    }
}

/**
 * 處理使用者登出邏輯
 * 【優化點】：移除了重複的 logoutUser
 */
async function logoutUser() {
    try {
        // 呼叫後端登出 API
        await fetch("http://localhost:8080/members/logout", {
            method: "POST",
            credentials: "include"
        });
    } catch (err) {
        // 即使登出 API 失敗（例如網路斷線），仍應移除本地狀態
        console.error("登出 API 請求錯誤:", err);
    }
    localStorage.removeItem("loggedInUser"); // 移除本地狀態
    alert("已登出");
    updateNavbarStatus();
    window.location.href = "index.html";
}


// ======================================
// 註冊功能
// ======================================

/** 初始化註冊表單的事件監聽 */
function initRegisterForm() {
    const registerForm = document.getElementById('register-form');
    const registerMessage = document.getElementById('register-message');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const phone = document.getElementById('reg-username')?.value.trim();
            const email = document.getElementById('reg-email')?.value.trim();
            const password = document.getElementById('reg-password')?.value.trim();

            if (!registerMessage) return;

            registerMessage.style.color = 'red';
            registerMessage.textContent = '';

            if (!phone || !email || !password) {
                registerMessage.textContent = '請填寫所有欄位';
                return;
            }

            const phoneRegex = /^09\d{8}$/;
            if (!phoneRegex.test(phone)) {
                registerMessage.textContent = '請輸入正確電話號碼 (09xxxxxxxx)';
                return;
            }

                console.log("Phone:", phone, "Email:", email, "Password:", password);


            try {
                // 1. 檢查電話和信箱是否重複
                const checkParams={
                    phone:phone,
                    email: email
                };

                const checkRes = await fetch('http://localhost:8080/members/addMemberCheck', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(checkParams)
                });

                if (checkRes.status === 409) {
                    const text = await checkRes.text();
                    registerMessage.textContent = text || '電話或信箱已被註冊';
                    return;
                }
                
                // 2. 執行註冊
                const memberData = {
                    phone: phone,
                    email: email,
                    password: password
                };

                const res = await fetch('http://localhost:8080/members', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(memberData)
                });

                if (res.ok) {
                    registerMessage.style.color = 'green';
                    registerMessage.textContent = '註冊成功！2 秒後跳轉登入頁面...';
                    setTimeout(() => window.location.href = 'login.html', 2000);
                } else {
                    const text = await res.text();
                    registerMessage.textContent = text || '註冊失敗';
                }

            } catch (err) {
                console.error('註冊請求失敗:', err);
                registerMessage.textContent = '網路連線錯誤，無法完成註冊';
            }
        });
    }
}

// ======================================
// 購物車功能
// ======================================

/** 更新購物車總商品數量 */
function updateCartCount() {
    const cartCount = document.getElementById("cart-count");
    if (cartCount) {
        let totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalCount;
    }
}

/** 渲染購物車內的商品列表和總金額 */
function renderCartItems() {
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
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
    
    // 【優化點】：使用事件代理處理購物車按鈕點擊，減少事件監聽器數量
    cartItemsContainer.onclick = (e) => {
        const target = e.target;
        if (!target.classList.contains('cart-btn')) return;

        const index = parseInt(target.dataset.index);
        const action = target.dataset.action;
        let item = cart[index];

        if (action === 'minus') {
            if (item.quantity > 1) item.quantity -= 1;
            else cart.splice(index, 1);
        } else if (action === 'plus') {
            item.quantity += 1;
        } else if (action === 'remove') {
            cart.splice(index, 1);
        }

        saveCart();
        updateCartCount();
        renderCartItems();
    };

    if (cartTotal) cartTotal.textContent = `總金額: NT$${total}`;
}

/** 清空購物車 */
function clearCart() {
    cart = [];
    saveCart();
    updateCartCount();
    renderCartItems();
}

// ======================================
// 下拉選單功能
// ======================================

/** 初始化下拉選單的顯示/隱藏邏輯 */
function initDropdown() {
    const dropdownBtn = document.querySelector(".dropbtn");
    const dropdownContent = document.querySelector(".dropdown-content");

    if (dropdownBtn && dropdownContent) {
        // 點擊按鈕切換顯示/隱藏
        dropdownBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // 阻止事件冒泡到 window
            dropdownContent.classList.toggle("show");
        });
    }

    // 點擊視窗外部時關閉選單
    window.addEventListener("click", (e) => {
        if (!e.target.matches('.dropbtn') && dropdownContent?.classList.contains('show')) {
            dropdownContent.classList.remove('show');
        }
    });
}

// ======================================
// 賣家升級功能
// ======================================

/** 初始化賣家升級按鈕與合約 Modal 邏輯 */
/** 初始化賣家升級按鈕與合約 Modal 邏輯 */
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
                window.location.href = "login.html";
                return;
            }
			if (user.role === 'seller'|| user.role === 'SELLER'){
			                // 如果用戶物件本身就標記為 'seller'，直接導向賣家中心，阻止重複註冊
			                alert("您已是賣家，即將導向我的賣場。");
			                window.location.href = "storelist.html"; // 替換為你的賣家中心頁面
			                return; // 執行完畢，結束函式
			            }

            // 🌟 關鍵修改：取得在 updateNavbarStatus 中設定的角色狀態 🌟
            const currentRole = beSellerBtn.dataset.role;

            if (currentRole === 'SELLER') {
                // 狀況一：已是賣家 (按鈕顯示「我的賣場」)
                // 直接導向賣家儀表板
                window.location.href = "storelist.html"; // 替換為你的賣家中心頁面
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
                    window.location.href = "index.html"; 
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
                        window.location.href = "login.html";
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

// ======================================
// 會員資料載入/編輯
// ======================================

/** 從後端載入會員資料並填入畫面 (Profile 頁面只讀欄位及 Modal 編輯欄位) */
async function loadMemberProfile() {
    try {
        // 修正路徑：/members/current 或 /members/me 較為常見，但維持你原本的 /members
        const res = await fetch('/easybuyfarm/api/members', { 
            method: 'GET',
            credentials: 'include'
        });

        if (res.status === 401) {
            console.warn('用戶未登入，無法載入會員資料');
            // 可以導向登入頁面
            // window.location.href = 'login.html'; 
            return;
        }
        if (!res.ok) {
            console.error('API 錯誤狀態碼:', res.status);
            throw new Error(`無法取得會員資料 (HTTP ${res.status})`);
        }

        const member = await res.json();
        
        // 填入顯示區塊 (safeSetText)
        safeSetText('profile-firstName', member.firstName);
        safeSetText('profile-lastName', member.lastName);
        safeSetText('profile-phone', member.phone);
        safeSetText('profile-email', member.email);
        safeSetText('profile-birthday', member.birthday);
        safeSetText('profile-address', member.address);

        // 填入 Modal 編輯欄位 (safeSetValue)
        safeSetValue('firstName', member.firstName);
        safeSetValue('lastName', member.lastName);
        safeSetValue('phone', member.phone);
        safeSetValue('email', member.email);
        safeSetValue('birthday', member.birthday);
        safeSetValue('address', member.address);
        safeSetValue('passwordEdit', ''); // 密碼欄位清空
        
    } catch (err) {
        console.error('載入會員資料失敗:', err);
    }
}

/** 初始化編輯個人資料 Modal 的事件監聽 */
function initEditProfile() {
    const editBtn = document.getElementById('edit-profile-btn');
    const modal = document.getElementById('edit-profile-modal');
    const form = document.getElementById('edit-profile-form');
    const overlay = document.getElementById('modal-overlay');

    if (!editBtn || !modal || !form) return;

    // 輔助函數：關閉 Modal
    const closeModal = () => {
        modal.style.display = 'none';
        if (overlay) overlay.style.display = 'none';
        document.body.classList.remove('modal-open');
    };
    
    // 開啟 Modal
    editBtn.addEventListener('click', () => {
        // 每次開啟 Modal 重新載入最新資料
        loadMemberProfile();
        modal.style.display = 'flex';
        if (overlay) overlay.style.display = 'block';
        document.body.classList.add('modal-open');
    });
    
    // 關閉 Modal (透過 X 按鈕)
    modal.querySelector('.close-btn')?.addEventListener('click', closeModal);
    // 關閉 Modal (透過點擊背景遮罩)
    if (overlay) overlay.addEventListener("click", closeModal);

    // 表單送出
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 從 Modal 欄位取得值
        const firstName = document.getElementById('firstName')?.value.trim();
        const lastName = document.getElementById('lastName')?.value.trim();
        const email = document.getElementById('email')?.value.trim();
        const birthday = document.getElementById('birthday')?.value.trim();
        const address = document.getElementById('address')?.value.trim();
        const password = document.getElementById('passwordEdit')?.value.trim();

        const updatedMember = {};
		updatedMember.birthday = birthday || null;
		updatedMember.address = address || null; 

        // 只傳遞非空值
        if (firstName) updatedMember.firstName = firstName;
        if (lastName) updatedMember.lastName = lastName;
        // phone 欄位通常不可編輯，這裡忽略
        if (email) updatedMember.email = email;
        
        // 只有在密碼欄位有輸入新值時才傳遞
        if (password) updatedMember.password = password;


		if (Object.keys(updatedMember).length === 0 && !password) {
		        alert("請至少填寫一個要更新的欄位。");
		        return;
		    }

        try {
            const res = await fetch('/easybuyfarm/api/members/updateMember', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedMember),
                credentials: 'include'
            });

            if (res.ok) {
                alert('個人資料更新成功！');
                closeModal();
                
                // 重新載入並更新畫面資料
                await loadMemberProfile(); 
                
                // 由於更新了名字，可能需要更新 Navbar 的歡迎詞
                const newName = `${lastName || ''}${firstName || ''}` || '會員';
                const user = getLoggedInUser();
                if (user) {
                    setLoggedInUser({ ...user, name: newName.trim() });
                }
                updateNavbarStatus(); 
                
            } else if (res.status === 401) {
                alert('更新失敗: 尚未登入或登入資訊已過期。');
                window.location.href = "login.html";
            } else {
                const text = await res.text();
                alert('更新失敗: ' + (text || `未知錯誤 (HTTP ${res.status})`));
            }
        } catch (err) {
            console.error('更新個人資料錯誤:', err);
            alert('網路錯誤，無法更新個人資料');
        }
    });
}

// ======================================
// Navbar 事件綁定 (用於 header.html 載入後)
// ======================================
function initNavbarEvents() {
    // 登出事件
    const logoutLink = document.getElementById("logout-link");
    if (logoutLink) {
        logoutLink.removeEventListener("click", logoutUser); // 避免重複綁定
        logoutLink.addEventListener("click", e => {
            e.preventDefault();
            logoutUser();
        });
    }

    // 下拉選單初始化
    initDropdown();
}


// ======================================
// 初始化
// ======================================
document.addEventListener("DOMContentLoaded", async () => {
    // 1️⃣ 動態載入 Navbar - 這是解決問題的關鍵
    const navbarContainer = document.getElementById("navbar-placeholder");
    
    // 檢查是否有 Navbar 佔位符
    if (navbarContainer) {
        try {
            // 請求 header.html
            const res = await fetch("header.html");
            if (!res.ok) {
                throw new Error(`載入 header.html 失敗 (HTTP ${res.status})`);
            }
            
            const html = await res.text();
            navbarContainer.innerHTML = html;

            // 🌟 關鍵：載入完成後，初始化所有 Navbar 相關功能 🌟
            initNavbarEvents();
            updateNavbarStatus();
            updateCartCount();
            
            // 🌟 關鍵：確保在按鈕存在後才初始化賣家按鈕邏輯 🌟
            initSellerButton(); 

        } catch (err) {
            console.error("載入 Navbar 失敗:", err.message);
            // 即使載入失敗，我們也嘗試初始化頁面其他部分
            updateNavbarStatus(); 
            updateCartCount(); 
        }
    } else {
        // 如果沒有 navbar-placeholder，則直接初始化狀態 (適用於已經包含 Navbar HTML 的頁面)
        initNavbarEvents();
        updateNavbarStatus();
        updateCartCount();
        initSellerButton(); // 這裡假設按鈕直接在 DOM 中
    }

    // ===========================================
    // 🌟 修正點：在 DOM 載入後，呼叫 loadFooter 載入頁腳
    // ===========================================
    await loadFooter(); 

    // 2️⃣ 頁面通用初始化 (不受 Navbar 影響的部分)
    renderCartItems();

    // 3️⃣ 頁面特有功能初始化
    initRegisterForm();
    initEditProfile();

    // 4️⃣ 如果是 Profile 頁面，載入會員資料
    if (document.getElementById('edit-profile-form') || document.getElementById('profile-lastName')) {
        loadMemberProfile();
    }

    // 5️⃣ 登入表單監聽（login.html）
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.removeEventListener("submit", loginUser);
        loginForm.addEventListener("submit", loginUser);
    }
});

// ======================================
// Footer 載入函式 (定義保持不變)
// ======================================
async function loadFooter() {
    try {
        const res = await fetch("footer.html");
        
        if (!res.ok) {
            throw new Error(`載入 footer.html 失敗 (HTTP ${res.status})`);
        }

        const footerHtml = await res.text();
        
        // ID 已經修正為 'loadFooter'
        const footerContainer = document.getElementById('loadFooter'); 
        
        if (footerContainer) {
            footerContainer.innerHTML = footerHtml;
        } else {
            console.error("找不到 ID 為 'loadFooter' 的元素來放置 footer 內容。");
        }

    } catch (error) {
        console.error("載入 Footer 時發生錯誤:", error);
    }
}