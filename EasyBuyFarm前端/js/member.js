
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

            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; // 至少8個字符，並包含字母和數字
            if (!passwordRegex.test(password)) {
                registerMessage.textContent = '密碼需要至少8個字符，並且包含字母和數字';
                return;
            }

            try {
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
                const res = await fetch('http://localhost:8080/easybuyfarm/members', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone, email, password })
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


// 登入
async function loginUser(event) {
    event.preventDefault();
    const keyword = document.getElementById("username")?.value.trim();
    const password = document.getElementById("password")?.value.trim();

    if (!keyword || !password) {
        alert("請輸入帳號與密碼");
        return;
    }

    try {
        const loginData = {
            keyword: keyword,
            password: password
        };

        const res = await fetch("http://localhost:8080/easybuyfarm/members/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(loginData),
            credentials: "include"
        });

        if (res.ok) {
            const responseData = await res.json();
            const token = responseData.token;

            // 儲存 Token
            localStorage.setItem("token", token);

            const member = responseData.member;

            // 儲存用戶資料到 localStorage
            localStorage.setItem("loggedInUser", JSON.stringify({
                name: (member.firstName || '') + " " + (member.lastName || '') || member.phone || "會員",
                phone: member.phone,
                role: member.role ? member.role.toUpperCase() : "MEMBER"
            }));

            alert("登入成功！");
            updateNavbarStatus();

            // 登入成功後跳轉到正確的頁面
            window.location.href = "../../html/index/index.html";  // 修改成正確的路徑
        } else {
            const text = await res.text();
            alert(text || "登入失敗");
        }
    } catch (err) {
        console.error("登入請求錯誤:", err);
        alert("網路錯誤，請稍後再試");
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
