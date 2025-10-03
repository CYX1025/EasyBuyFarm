// ======================================
// 全域變數
// ======================================
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ======================================
// Helper Functions
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

// ======================================
// Navbar / 登入登出狀態控制
// ======================================

/** 更新導覽列的登入/登出狀態顯示 */
function updateNavbar() {
    const user = localStorage.getItem("loggedInUser");
    const memberBtn = document.getElementById("member-btn");
    const loginLink = document.getElementById("login-link");
    const registerLink = document.getElementById("register-link");
    const logoutLink = document.getElementById("logout-link");

    if (user) {
        if (memberBtn) memberBtn.style.display = "block";
        if (logoutLink) logoutLink.style.display = "block";
        if (loginLink) loginLink.style.display = "none";
        if (registerLink) registerLink.style.display = "none";
    } else {
        if (memberBtn) memberBtn.style.display = "none";
        if (logoutLink) logoutLink.style.display = "none";
        if (loginLink) loginLink.style.display = "block";
        if (registerLink) registerLink.style.display = "block";
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
        const params = new URLSearchParams();
        params.append("keyword", keyword);
        params.append("password", password);

        const res = await fetch("/easybuyfarm/api/members/login", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params.toString(),
            credentials: "include"
        });

        if (res.ok) {
            const member = await res.json();
            // 登入成功後儲存用戶資訊
            localStorage.setItem("loggedInUser", member.name || member.phone || "會員");
            alert("登入成功！");
            updateNavbar();
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

/** 處理使用者登出邏輯 */
async function logoutUser() {
    try {
        await fetch("/easybuyfarm/api/members/logout", {
            method: "POST",
            credentials: "include"
        });
    } catch (err) {
        console.error("登出請求錯誤:", err);
    }
    localStorage.removeItem("loggedInUser");
    alert("已登出");
    updateNavbar();
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
                registerMessage.textContent = '請輸入正確電話號碼';
                return;
            }

            try {
                // 1. 檢查電話和信箱是否重複
                const checkParams = new URLSearchParams();
                checkParams.append('phone', phone);
                checkParams.append('email', email);

                const checkRes = await fetch('/easybuyfarm/api/members/addMemberCheck', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
                    body: checkParams.toString()
                });

                if (checkRes.status === 409) {
                    const text = await checkRes.text();
                    registerMessage.textContent = text || '電話或信箱已被註冊';
                    return;
                }

                // 2. 執行註冊
                const params = new URLSearchParams();
                params.append('phone', phone);
                params.append('email', email);
                params.append('password', password);

                const res = await fetch('/easybuyfarm/api/members', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
                    body: params.toString()
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
        li.textContent = `${item.name} - NT$${item.price} x ${item.quantity} `;

        // 減少數量按鈕
        const minusBtn = document.createElement("button");
        minusBtn.textContent = "-";
        minusBtn.onclick = () => {
            if (item.quantity > 1) item.quantity -= 1;
            else cart.splice(index, 1); // 數量減到 0 時移除
            saveCart(); updateCartCount(); renderCartItems();
        };

        // 增加數量按鈕
        const plusBtn = document.createElement("button");
        plusBtn.textContent = "+";
        plusBtn.onclick = () => {
            item.quantity += 1;
            saveCart(); updateCartCount(); renderCartItems();
        };

        // 移除商品按鈕
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "刪除";
        removeBtn.onclick = () => {
            cart.splice(index, 1);
            saveCart(); updateCartCount(); renderCartItems();
        };

        li.appendChild(minusBtn);
        li.appendChild(plusBtn);
        li.appendChild(removeBtn);
        cartItemsContainer.appendChild(li);
    });

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
        dropdownBtn.addEventListener("click", () => dropdownContent.classList.toggle("show"));
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
function initSellerButton() {
    const beSellerBtn = document.getElementById("be-seller-btn");
    const contractModal = document.getElementById("contract-modal");
    const closeModalBtn = document.getElementById("close-modal-btn");
    const agreeBtn = document.getElementById("agree-contract-btn");
    const overlay = document.getElementById("modal-overlay");

    // 輔助函數：關閉 Modal
    const closeModal = () => {
        if (contractModal) contractModal.style.display = "none";
        if (overlay) overlay.style.display = "none";
    };

    // 點擊升級按鈕
    if (beSellerBtn && contractModal) {
        beSellerBtn.addEventListener("click", () => {
            const user = localStorage.getItem("loggedInUser");
            if (!user) {
                alert("請先登入會員");
                window.location.href = "login.html";
                return;
            }
            contractModal.style.display = "flex";
            if (overlay) overlay.style.display = "block";
        });
    }

    // 點擊關閉按鈕
    if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);

    // 點擊背景遮罩
    if (overlay) overlay.addEventListener("click", closeModal);

    // 點擊同意按鈕
    if (agreeBtn) {
        agreeBtn.addEventListener("click", async () => {
            try {
                const res = await fetch(`/easybuyfarm/api/members/upgradeSeller`, {
                    method: "PUT",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" }
                });

                if (res.ok) {
                    alert("你已成功升級為賣家！");
                    closeModal();
                    updateNavbar();
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

// ======================================
// 會員資料載入/編輯
// ======================================

/** 從後端載入會員資料並填入畫面 (Profile 頁面只讀欄位及 Modal 編輯欄位) */
async function loadMemberProfile() {
    try {
        // 修正路徑：必須是 /members/current 才能正確獲取當前會員資料
        const res = await fetch('/easybuyfarm/api/members', { 
            method: 'GET',
            credentials: 'include'
        });

        if (res.status === 401) {
            console.warn('用戶未登入，無法載入會員資料');
            return;
        }
        if (!res.ok) {
            console.error('API 錯誤狀態碼:', res.status);
            throw new Error(`無法取得會員資料 (HTTP ${res.status})`);
        }

        const member = await res.json();
        
        // ⭐️⭐️ 除錯程式碼加入處 ⭐️⭐️
        console.log('--- loadMemberProfile 除錯資訊 ---');
        console.log('API 回傳的會員資料 (JSON):', member); 
        
        const lastNameEl = document.getElementById('profile-lastName');
        console.log('抓到的「姓」的 HTML 元素:', lastNameEl); 
        console.log('--- 除錯資訊結束 ---');
        // ⭐️⭐️ ⭐️⭐️ ⭐️⭐️ ⭐️⭐️ ⭐️⭐️

        // 填入顯示區塊 (safeSetText)
        // 注意：這裡我將您的 profile-firstName 和 profile-lastName 對調了
        // 確保與常見的中文習慣 (姓在前、名在後) 一致，並與您 HTML 上的 ID 對應
        safeSetText('profile-lastName', member.lastName || ''); // 姓
        safeSetText('profile-firstName', member.firstName || ''); // 名
        safeSetText('profile-phone', member.phone || '');
        safeSetText('profile-email', member.email || '');
        safeSetText('profile-birthday', member.birthday || '');
        safeSetText('profile-address', member.address || '');

        // 填入 Modal 編輯欄位 (safeSetValue)
        safeSetValue('firstName', member.firstName || '');
        safeSetValue('lastName', member.lastName || '');
        safeSetValue('phone', member.phone || '');
        safeSetValue('email', member.email || '');
        safeSetValue('birthday', member.birthday || '');
        safeSetValue('address', member.address || '');
        safeSetValue('passwordEdit', ''); // 密碼欄位清空
    } catch (err) {
        console.error('載入會員資料失敗:', err);
    }
}

/** 初始化編輯個人資料 Modal 的事件監聽 (修正：確保 form 變數在作用域內) */
function initEditProfile() {
    const editBtn = document.getElementById('edit-profile-btn');
    const modal = document.getElementById('edit-profile-modal');
    const form = document.getElementById('edit-profile-form'); // ⬅️ 確保 form 在這裡被定義
    const overlay = document.getElementById('modal-overlay');

    if (!editBtn || !modal || !form) return;

    // 輔助函數：關閉 Modal (定義在內，確保 closeModal 在 submit 裡可用)
    const closeModal = () => {
        modal.style.display = 'none';
        if (overlay) overlay.style.display = 'none';
        document.body.classList.remove('modal-open');
    };
    
    // 輔助函數：開啟 Modal (定義在內，確保 closeModal 在 submit 裡可用)
    const openModal = () => {
        modal.style.display = 'flex';
        if (overlay) overlay.style.display = 'block';
        document.body.classList.add('modal-open');
        // 每次開啟 Modal 重新載入最新資料
        loadMemberProfile();
    };


    // 開啟 Modal
    editBtn.addEventListener('click', openModal);
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
        const password = document.getElementById('passwordEdit')?.value.trim(); // 密碼

        let updatedMember = {};

        // 確保欄位名稱與後端 Member Entity 屬性一致，只傳遞非空值
        if (firstName) updatedMember.firstName = firstName;
        if (lastName) updatedMember.lastName = lastName;
        if (email) updatedMember.email = email;
        if (birthday) updatedMember.birthday = birthday;
        if (address) updatedMember.address = address;
        if (password) updatedMember.password = password;


        if (Object.keys(updatedMember).length === 0) {
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
                
                // ✅ 關鍵優化：使用 await 確保頁面等待新資料載入完成
                await loadMemberProfile(); 
                
                // ✅ 關鍵優化：更新導覽列（如果導覽列有顯示會員名稱）
                updateNavbar(); 
                
            } else if (res.status === 401) {
                alert('更新失敗: 尚未登入或登入資訊已過期。');
                window.location.href = "login.html";
            } else {
                // 讀取後端回傳的錯誤訊息
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
// 初始化
// ======================================

document.addEventListener('DOMContentLoaded', () => {
    // 頁面通用初始化
    updateNavbar();
    initDropdown();
    updateCartCount();
    renderCartItems();
    initSellerButton();

    // 頁面特有功能初始化
    initRegisterForm(); // 註冊頁面
    initEditProfile();  // 會員專區頁面
    
    // 頁面載入時載入會員資料 (如果頁面是會員專區)
    // 放在這裡確保 initEditProfile 定義的 closeModal 等輔助函數已經存在。
    if(document.getElementById('edit-profile-form')) {
        loadMemberProfile(); 
    }
    

    // 登入表單事件監聽 (login.html)
    const loginForm = document.getElementById("login-form");
    if (loginForm) loginForm.addEventListener("submit", loginUser);

    // 登出連結事件監聽
    const logoutLink = document.getElementById("logout-link");
    if (logoutLink) logoutLink.addEventListener("click", (e) => {
        e.preventDefault();
        logoutUser();
    });
});