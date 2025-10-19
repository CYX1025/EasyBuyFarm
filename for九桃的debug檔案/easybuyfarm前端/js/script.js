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


/** 處理使用者登入邏輯 */




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


/** 初始化賣家升級按鈕與合約 Modal 邏輯 */
/** 初始化賣家升級按鈕與合約 Modal 邏輯 */


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

