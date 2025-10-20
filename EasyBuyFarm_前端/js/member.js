/*
//頁頭
document.addEventListener("DOMContentLoaded", async () => {
    console.log("DOM 加載完成"); // 確認 DOM 加載完成
    const navbarContainer = document.getElementById("navbar-placeholder");
    
    if (navbarContainer) {
        try {
            const res = await fetch("header.html");
            if (!res.ok) {
                throw new Error(`載入 header.html 失敗 (HTTP ${res.status})`);
            }
            
            const html = await res.text();
            navbarContainer.innerHTML = html;

            // 初始化 Navbar 相關功能
            initNavbarEvents();
            updateNavbarStatus();
            updateCartCount();
            
            // 初始化賣家按鈕
            initSellerButton(); 

        } catch (err) {
            console.error("載入 Navbar 失敗:", err.message);
            updateNavbarStatus(); 
            updateCartCount(); 
        }
    } else {
        // 如果 navbar-placeholder 不存在，直接初始化
        initNavbarEvents();
        updateNavbarStatus();
        updateCartCount();
        initSellerButton(); // 假設按鈕直接在 DOM 中
    }

    // 載入 Footer
    loadFooter();
});

//頁尾
async function loadFooter() {
    try {
        const res = await fetch("footer.html");
        
        if (!res.ok) {
            throw new Error(`載入 footer.html 失敗 (HTTP ${res.status})`);
        }

        const footerHtml = await res.text();
        
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

*/

// ==============================
// 註冊功能：處理註冊表單提交
// ==============================

/** 初始化註冊表單的事件監聽 */
function initRegisterForm() {

    const registerForm = document.getElementById('register-form');
    const registerMessage = document.getElementById('register-message');
    const registerBtn = document.getElementById('register-btn'); // 取得註冊按鈕

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const phone = document.getElementById('reg-username').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const password = document.getElementById('reg-password').value.trim();

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

            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*-]{8,}$/;
            if (!passwordRegex.test(password)) {
                registerMessage.textContent = '密碼需要至少8個字符，並且包含字母、數字及符號';
                return;
            }

            try {
                // 顯示載入狀態，並禁用註冊按鈕
                registerMessage.textContent = '正在處理註冊...';
                registerBtn.disabled = true;

                // 1. 檢查電話和信箱是否重複
                const checkRes = await fetch('http://localhost:8080/easybuyfarm/members/addMemberCheck', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone, email })
                });

                if (checkRes.status === 409) {
                    const text = await checkRes.text();
                    registerMessage.textContent = text || '電話或信箱已被註冊';
                    return;
                }

                // 2. 執行註冊
                const res = await fetch('http://localhost:8080/easybuyfarm/members/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone, email, password })
                });

                if (res.ok) {
                    registerMessage.style.color = 'green';
                    registerMessage.textContent = '註冊成功！2 秒後跳轉登入頁面...';
                    setTimeout(() => window.location.href = "/html/index/index.html", 2000);
                } else {
                    const text = await res.text();
                    registerMessage.textContent = text || '註冊失敗';
                }

            } catch (err) {
                console.error('註冊請求失敗:', err);
                registerMessage.textContent = '網路連線錯誤，無法完成註冊';
            } finally {
                // 恢復註冊按鈕的狀態
                registerBtn.disabled = false;
            }
        });
    }
}



// 登入
async function loginUser(event) {
    event.preventDefault();
    
    // 取得帳號和密碼
    const keyword = document.getElementById("username")?.value.trim();
    const password = document.getElementById("password")?.value.trim();

    // 檢查帳號與密碼是否為空
    if (!keyword || !password) {
        alert("請輸入帳號與密碼");
        return;
    }

    try {
        // 建立登入請求資料
        const loginData = {
            keyword: keyword,
            password: password
        };

        // 發送登入請求
        const res = await fetch("http://localhost:8080/easybuyfarm/members/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(loginData),
        });

        // 檢查回應狀態
        if (res.ok) {
            const responseData = await res.json();
            const token = responseData.token; // 取得 JWT Token
            console.log(token);
            // 儲存 Token 到 localStorage
            localStorage.setItem("token", token);

            const member = responseData.member; // 取得會員資料
            console.log(member);
            // 儲存用戶資料到 localStorage
            localStorage.setItem("loggedInUser", JSON.stringify({
                name: (member.firstName || '') + " " + (member.lastName || '') || member.phone || "會員",
                phone: member.phone,
                role: member.role ? member.role.toUpperCase() : "MEMBER",
                memberId:member.memberId
            }));

            alert("登入成功！");
            
            // 更新導航欄顯示登入狀態
            updateNavbarStatus();

            // 登入成功後跳轉到正確的頁面
            window.location.href = "/html/index/index.html";  // 修改成正確的路徑
        } else {
            const text = await res.text();
            alert(text || "登入失敗");
        }
    } catch (err) {
        console.error("登入請求錯誤:", err);
        alert("網路錯誤，請稍後再試");
    }
}


// ==============================
// 用來處理會員資料頁面的 JavaScript
// ==============================

// 載入會員資料並顯示
async function loadMemberProfile() {
    try {
        // 從 localStorage 取得 JWT Token
        const token = localStorage.getItem("token");

        // 如果沒有 Token，跳轉到登入頁面
        if (!token) {
            console.warn('用戶未登入，無法載入會員資料');
            window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
            return;
        }

        // 發送帶有 Token 的請求
        const res = await fetch("http://localhost:8080/easybuyfarm/members/me", { 
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`  // 在請求標頭中加入 Token
            }
        });

        // 檢查回應狀態
        if (res.status === 401) {
            console.warn('無效的 Token 或已過期，重新登入');
            localStorage.removeItem('token'); // 清除過期或無效的 Token
            window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
            return;
        }

        // 檢查其他錯誤狀況
        if (!res.ok) {
            console.error('API 錯誤狀態碼:', res.status);
            throw new Error(`無法取得會員資料 (HTTP ${res.status})`);
        }

        // 解析會員資料
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
        safeSetValue('passwordEdit', ''); // 密碼欄位清空，避免誤操作
        
    } catch (err) {
        console.error('載入會員資料失敗:', err);
        alert('載入會員資料時發生錯誤，請稍後再試');
    }
}

// ==============================
// 編輯會員資料功能
// ==============================

document.addEventListener('DOMContentLoaded', () => {
    // 確保元素存在後再添加事件處理器
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const closeModalBtn = document.querySelector('.close-btn');
    const editProfileForm = document.getElementById('edit-profile-form');

    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', () => {
            // 顯示編輯資料 Modal
            document.getElementById('edit-profile-modal').style.display = 'block';
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            document.getElementById('edit-profile-modal').style.display = 'none';
        });
    }

    if (editProfileForm) {
        // 編輯資料表單提交
        editProfileForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            // 從表單取得新的資料
            const updatedData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                birthday: document.getElementById('birthday').value,
                address: document.getElementById('address').value,
                password: document.getElementById('passwordEdit').value,  // 可選，若不填則保持原來
            };

            try {
                // 取得 Token
                const token = localStorage.getItem("token");

                if (!token) {
                    console.warn('用戶未登入，無法修改資料');
                    window.location.href = "/html/login/login.html?redirect=" + encodeURIComponent(window.location.href);
                    return;
                }

                // 發送修改資料請求
                const res = await fetch("http://localhost:8080/easybuyfarm/members/update", {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`  // 在請求標頭中加入 Token
                    },
                    body: JSON.stringify(updatedData)
                });

                if (!res.ok) {
                    const error = await res.text();
                    alert(`更新失敗: ${error}`);
                    return;
                }

                // 更新成功，關閉 Modal 並刷新資料
                alert('資料更新成功！');
                document.getElementById('edit-profile-modal').style.display = 'none';
                loadMemberProfile(); // 重新載入會員資料

            } catch (err) {
                console.error('更新會員資料失敗:', err);
                alert('更新會員資料時發生錯誤，請稍後再試');
            }
        });
        
        // 初始載入會員資料
        loadMemberProfile();
    }
});

// ==============================
// 用來填入 HTML 元素的安全設置函數
// ==============================

function safeSetText(id, text) {
    const element = document.getElementById(id);
    if (element && text) {
        element.textContent = text;
    }
}

function safeSetValue(id, value) {
    const element = document.getElementById(id);
    if (element && value) {
        element.value = value;
    }
}








// 測試一下函數是否正確初始化
function initNavbarEvents() {
    console.log('Navbar 事件已初始化');
    // 此處加入 navbar 相關邏輯
}

function updateNavbarStatus() {
    console.log('Navbar 狀態已更新');
    // 更新 navbar 狀態的代碼
}

function updateCartCount() {
    console.log('購物車數量已更新');
    // 更新購物車數量的代碼
}

function initSellerButton() {
    console.log('賣家按鈕已初始化');
    // 初始化賣家按鈕的代碼
}
