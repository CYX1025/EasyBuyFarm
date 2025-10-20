
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
            credentials: "include"
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
            localStorage.setItem("loggedInUser", JSON.stringify(member)); // 儲存用戶資料
            // localStorage.setItem("loggedInUser", JSON.stringify({
            //     name: (member.firstName || '') + " " + (member.lastName || '') || member.phone || "會員",
            //     phone: member.phone,
            //     role: member.role ? member.role.toUpperCase() : "MEMBER",
            //     memberId: member.memberId,
            //     email: member.email,  // 假設你後端有返回 email
            //     birthday: (member.birthday || ''),  // 假設後端有返回生日
            //     address: (member.address || '')  // 假設後端有返回地址
            // }));

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


//登出功能*******************
// async function logoutUser() {
//     try {
//         await fetch("/easybuyfarm/api/members/logout", { method: "POST", credentials: "include" });
//     } catch (err) {
//         console.error("登出 API 錯誤:", err);
//     }
//     localStorage.removeItem("loggedInUser");
//     alert("已登出");
//     updateNavbarStatus();
//     window.location.href = "/html/index/index.html";
// }



// // ==============================
// // 編輯會員資料功能
// // ==============================

// ---- member.js：彈窗控制 ----
// member.js
document.addEventListener('DOMContentLoaded', () => {
  const modal   = document.getElementById('edit-profile-modal');
  const openBtn = document.getElementById('edit-profile-btn');
  const form    = document.getElementById('edit-profile-form');

  if (!modal || !openBtn) {
    console.warn('[member.js] 找不到 edit-profile-btn 或 edit-profile-modal');
    return;
  }

  // 只在「自己的 modal」內找 close 按鈕，避免抓到 header 的 close
  const closeX  = modal.querySelector('.close-btn');

  // ✅ 改成 async，開啟前先預填
const openModal = async () => {
  try {
    const m = await getCurrentMember();   // 這支函式你檔案下方已定義
    if (m) {
      setInput('lastName',  m.lastName);
      setInput('firstName', m.firstName);
      setInput('birthday',  toDateInputValue(m.birthday)); // 生日轉 YYYY-MM-DD
      setInput('address',   m.address);
      setInput('passwordEdit', ''); // 密碼不預填
    }
  } catch (e) {
    console.warn('預填會員資料失敗：', e);
  }

  // 顯示視窗
  modal.classList.add('show');      // 用 class 切換，對應你的 CSS
  document.body.classList.add('modal-open'); // 禁止背景滾動
  modal.setAttribute('aria-hidden', 'false');
};

  const closeModal = () => {
    modal.classList.remove('show');
    document.body.classList.remove('modal-open');
    modal.setAttribute('aria-hidden', 'true');
  };

  // 開啟
  openBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();   // ← 關鍵：呼叫 openModal()
  });

  // 關閉（X）
  if (closeX) closeX.addEventListener('click', closeModal);

  // 點遮罩關閉（點內容不關）
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // ESC 關閉
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) closeModal();
  });

  // 送出編輯（沿用你原本的更新 API）
  if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = "/html/login/login.html?redirect=" + encodeURIComponent("/html/member/member.html");
      return;
    }

    // 目前會員資料（用來做 diff）
    const current = await getCurrentMember() || {};

    // 讀表單
    const draft = {
      lastName:  document.getElementById('lastName').value.trim(),
      firstName: document.getElementById('firstName').value.trim(),
      birthday:  document.getElementById('birthday').value, // date 可為空字串
      address:   document.getElementById('address').value.trim(),
      password:  document.getElementById('passwordEdit').value, // 空字串代表不修改
    };

    // 只擷取「非空且有變動」的欄位
    const updatedData = {};
    Object.entries(draft).forEach(([k, v]) => {
      // 密碼：空字串不送；有值才送
      if (k === 'password') {
        if (v) updatedData[k] = v;
        return;
      }
      // 其他欄位：值有變動且非空才送（若要允許清空，這裡可改成：只要與 current 不同就送）
      const currVal = (current[k] ?? '').toString().trim();
      const newVal  = (v ?? '').toString().trim();
      if (newVal && newVal !== currVal) {
        updatedData[k] = v;
      }
    });

    if (Object.keys(updatedData).length === 0) {
      alert('沒有變更內容可更新');
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/easybuyfarm/members/update", {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      if (!res.ok) {
        const error = await res.text();
        alert(`更新失敗: ${error || ('HTTP ' + res.status)}`);
        return;
      }

      alert('資料更新成功！');
      // 合併最新資料回 localStorage，保持前端一致
      const merged = { ...current, ...updatedData };
      localStorage.setItem('loggedInUser', JSON.stringify(merged));

      closeModal();
      if (typeof loadMemberProfile === 'function') await loadMemberProfile();
    } catch (err) {
      console.error('更新會員資料失敗:', err);
      alert('更新會員資料時發生錯誤，請稍後再試');
    }
  });
}
});

// 取得目前會員資料：優先用 localStorage，其次用 /me
async function getCurrentMember() {
  // 先從 localStorage 拿
  const cached = localStorage.getItem('loggedInUser');
  if (cached) {
    try { return JSON.parse(cached); } catch {}
  }
  // 沒有就打 /me
  const token = localStorage.getItem('token');
  if (!token) return null;

  const res = await fetch("http://localhost:8080/easybuyfarm/members/me", {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return null;
  const member = await res.json();
  localStorage.setItem('loggedInUser', JSON.stringify(member));
  return member;
}

function setInput(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = (val ?? '');
}



// ==============================
// 用來填入 HTML 元素的安全設置函數
function safeSetText(id, text) {
    const element = document.getElementById(id);
    if (element && text) {
        element.textContent = text;
        console.log(`已更新 ${id} 的內容為：${text}`); // 用來檢查是否正確設置
    } else {
        console.log(`找不到元素 ${id} 或文本為空`);
    }
}

function safeSetValue(id, value) {
    const element = document.getElementById(id);
    if (element && value) {
        element.value = value;
        console.log(`已更新 ${id} 的值為：${value}`); // 用來檢查是否正確設置
    } else {
        console.log(`找不到元素 ${id} 或值為空`);
    }
}


function toDateInputValue(v) {
  if (!v) return '';
  // 支援 "2025/10/18" 或 "2025-10-18T00:00:00"
  const d = new Date(v);
  if (isNaN(d)) return '';
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}






// 在 member.js 內，改成這樣
window.initNavbarEvents  = window.initNavbarEvents  || function(){};
window.updateNavbarStatus= window.updateNavbarStatus|| function(){};
window.updateCartCount   = window.updateCartCount   || function(){};
window.initSellerButton  = window.initSellerButton  || function(){};
