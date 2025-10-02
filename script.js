// ======================================
// 全域變數
// ======================================
// cart 用來存放購物車內的商品陣列，每個商品物件包含 {id, name, price, quantity}
// 初始值從 localStorage 讀取，如果沒有就用空陣列
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ======================================
// Navbar 登入/登出狀態控制
// ======================================
// 根據 localStorage 是否有 loggedInUser 決定 navbar 上顯示哪些按鈕
function updateNavbar() {
    const user = localStorage.getItem("loggedInUser"); // 取得已登入使用者名稱
    const memberBtn = document.getElementById("member-btn");   // 會員中心按鈕
    const loginLink = document.getElementById("login-link");   // 登入連結
    const registerLink = document.getElementById("register-link"); // 註冊連結
    const logoutLink = document.getElementById("logout-link"); // 登出連結

    if (user) {
        // 使用者已登入 → 顯示會員中心與登出，隱藏登入與註冊
        if (memberBtn) memberBtn.style.display = "block";
        if (logoutLink) logoutLink.style.display = "block";
        if (loginLink) loginLink.style.display = "none";
        if (registerLink) registerLink.style.display = "none";
    } else {
        // 使用者未登入 → 顯示登入與註冊，隱藏會員中心與登出
        if (memberBtn) memberBtn.style.display = "none";
        if (logoutLink) logoutLink.style.display = "none";
        if (loginLink) loginLink.style.display = "block";
        if (registerLink) registerLink.style.display = "block";
    }
}

// ======================================
// 登入 / 登出功能
// ======================================

// 登入功能，會透過 fetch POST 請求送到後端 API
async function loginUser(event) {
    event.preventDefault(); // 阻止表單預設提交

    // 取得帳號密碼欄位值
    const keyword = document.getElementById("username")?.value.trim();
    const password = document.getElementById("password")?.value.trim();

    if (!keyword || !password) {
        alert("請輸入帳號與密碼");
        return;
    }

    try {
        // 建立 URLSearchParams 用於 x-www-form-urlencoded 格式
        const params = new URLSearchParams();
        params.append("keyword", keyword);
        params.append("password", password);

        // 發送登入請求
        const res = await fetch("/easybuyfarm/api/members/login", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params.toString(),
            credentials: "include" // 帶上 cookie / session
        });

        if (res.ok) {
            // 登入成功
            const member = await res.json();
            // 將使用者名稱存入 localStorage，只用於前端顯示
            localStorage.setItem("loggedInUser", member.name || member.phone || "會員");
            alert("登入成功！");
            updateNavbar(); // 更新 navbar 狀態
            window.location.href = "index.html"; // 導回首頁
        } else if (res.status === 401) {
            // 帳密錯誤
            const msg = await res.text();
            alert(msg || "登入失敗，帳號或密碼錯誤");
        } else {
            alert("登入失敗，伺服器錯誤");
        }
    } catch (err) {
        console.error("登入請求錯誤:", err);
        alert("網路錯誤，請稍後再試");
    }
}

// 登出功能，會呼叫後端登出 API，並清掉前端資料
async function logoutUser() {
    try {
        const res = await fetch("/easybuyfarm/api/members/logout", {
            method: "POST",
            credentials: "include"
        });
        // 即使後端沒寫 logout API，也要清掉前端資料
        localStorage.removeItem("loggedInUser");
        alert("已登出");
        updateNavbar();
        window.location.href = "index.html";
    } catch (err) {
        console.error("登出請求錯誤:", err);
        localStorage.removeItem("loggedInUser");
        updateNavbar();
        window.location.href = "index.html";
    }
}

// ======================================
// 購物車功能
// ======================================

// 將 cart 陣列存回 localStorage
function saveCart() { localStorage.setItem("cart", JSON.stringify(cart)); }

// 更新購物車徽章數量
function updateCartCount() {
    const cartCount = document.getElementById("cart-count");
    if (cartCount) {
        let totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalCount;
    }
}

// 渲染購物車列表
function renderCartItems() {
    const cartItemsContainer = document.getElementById("cart-items"); // 顯示商品的 ul
    const cartTotal = document.getElementById("cart-total");           // 顯示總金額
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = ""; // 清空原本內容
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price * item.quantity;
        const li = document.createElement("li");
        li.textContent = `${item.name} - NT$${item.price} x ${item.quantity}`;

        // 減少數量按鈕
        const minusBtn = document.createElement("button");
        minusBtn.textContent = "-";
        minusBtn.onclick = () => {
            if (item.quantity > 1) item.quantity -= 1;
            else cart.splice(index, 1); // 數量為 0 就刪除商品
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

        // 刪除商品按鈕
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "刪除";
        removeBtn.onclick = () => {
            cart.splice(index, 1);
            saveCart();
            updateCartCount();
            renderCartItems();
        };

        // 加入 li
        li.appendChild(minusBtn);
        li.appendChild(plusBtn);
        li.appendChild(removeBtn);
        cartItemsContainer.appendChild(li);
    });

    if (cartTotal) cartTotal.textContent = `總金額: NT$${total}`;
}

// 清空購物車
function clearCart() { cart = []; saveCart(); updateCartCount(); renderCartItems(); }

// ======================================
// 註冊功能
// ======================================
function initRegisterForm() {
    const registerForm = document.getElementById('register-form');
    const registerMessage = document.getElementById('register-message');

    if(registerForm){
        registerForm.addEventListener('submit', async (e)=>{
            e.preventDefault();
            const phone = document.getElementById('reg-username').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const password = document.getElementById('reg-password').value.trim();

            registerMessage.style.color = 'red';
            registerMessage.textContent = '';
            if(!phone || !email || !password){
                registerMessage.textContent = '請填寫所有欄位'; return;
            }
            const phoneRegex = /^09\d{8}$/;
            if(!phoneRegex.test(phone)){ registerMessage.textContent = '請輸入正確電話號碼'; return; }

            try{
                // 檢查電話是否已註冊
                const checkRes = await fetch(`/easybuyfarm/api/members/${phone}`);
                if(checkRes.status === 200){ registerMessage.textContent = '此電話已被註冊'; return; }

                const params = new URLSearchParams();
                params.append('phone', phone);
                params.append('email', email);
                params.append('password', password);

                const res = await fetch('/easybuyfarm/api/members', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'},
                    body: params.toString()
                });

                if(res.ok){
                    registerMessage.style.color = 'green';
                    registerMessage.textContent = '註冊成功！2 秒後跳轉登入頁面...';
                    setTimeout(()=>window.location.href='login.html', 2000);
                } else {
                    const text = await res.text();
                    registerMessage.textContent = text || '註冊失敗';
                }
            } catch(err){
                console.error('註冊請求失敗:', err);
                registerMessage.textContent = '網路連線錯誤，無法完成註冊';
            }
        });
    }
}

// ======================================
// 下拉選單功能
// ======================================
function initDropdown() {
    const dropdownBtn = document.querySelector(".dropbtn");
    const dropdownContent = document.querySelector(".dropdown-content");

    if(dropdownBtn && dropdownContent){
        // 點擊按鈕切換顯示/隱藏
        dropdownBtn.addEventListener("click", ()=>{
            dropdownContent.classList.toggle("show");
        });
    }

    // 點擊頁面其他地方自動關閉下拉選單
    window.addEventListener("click", (e)=>{
        if(!e.target.matches('.dropbtn')){
            if(dropdownContent && dropdownContent.classList.contains('show')){
                dropdownContent.classList.remove('show');
            }
        }
    });
}

// ======================================
// 賣家升級功能
// ======================================
function initSellerButton() {
    const beSellerBtn = document.getElementById("be-seller-btn");
    const contractModal = document.getElementById("contract-modal");
    const closeModalBtn = document.getElementById("close-modal-btn");
    const agreeBtn = document.getElementById("agree-contract-btn");
	const overlay = document.getElementById("modal-overlay");

	// 點擊「成為賣家」按鈕
	if (beSellerBtn && contractModal) {
	    beSellerBtn.addEventListener("click", () => {
	        const user = localStorage.getItem("loggedInUser");
	        if (!user) {
	            alert("請先登入會員");
	            window.location.href = "login.html";
	            return;
	        }
	        contractModal.style.display = "flex"; // 顯示彈窗
	        overlay.style.display = "block";      // 顯示遮罩
	    });
	}

	// 點擊關閉按鈕
	if (closeModalBtn && contractModal) {
	    closeModalBtn.addEventListener("click", () => {
	        contractModal.style.display = "none";
	        overlay.style.display = "none"; // 關閉遮罩
	    });
	}

	// 點擊「同意」升級為賣家
	if (agreeBtn && contractModal) {
	    agreeBtn.addEventListener("click", async () => {
	        try {
	            const res = await fetch(`/easybuyfarm/api/members/upgradeSeller`, {
	                method: "PUT",
	                credentials: "include",
	                headers: {"Content-Type": "application/json"}
	            });

	            if (res.ok) {
	                alert("你已成功升級為賣家！");
	                contractModal.style.display = "none";
	                overlay.style.display = "none";
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

	// 點擊遮罩關閉
	if (overlay) {
	    overlay.addEventListener("click", () => {
	        contractModal.style.display = "none";
	        overlay.style.display = "none";
	    });
	}

    // 點擊彈窗外側也能關閉
    if (contractModal) {
        window.addEventListener("click", (e) => {
            if (e.target === contractModal) {
                contractModal.style.display = "none";
            }
        });
    }
}

// ======================================
// 初始化
// ======================================
document.addEventListener('DOMContentLoaded', ()=> {
    try { updateNavbar(); } catch(e){ console.error("Navbar 初始化失敗:", e); }
    try { initRegisterForm(); } catch(e){ console.error("註冊表單初始化失敗:", e); }
    try { initDropdown(); } catch(e){ console.error("會員選單初始化失敗:", e); }
    try { updateCartCount(); } catch(e){ console.error("購物車數量更新失敗:", e); }
    try { renderCartItems(); } catch(e){ console.error("購物車渲染失敗:", e); }
    try { initSellerButton(); } catch(e){ console.error("賣家按鈕初始化失敗:", e); }

    // 登入表單綁定 submit
    const loginForm = document.getElementById("login-form");
    if(loginForm) 		{
	    loginForm.removeEventListener("submit", loginUser);
	    loginForm.addEventListener("submit", loginUser);
	}

    // 登出事件綁定
	const logoutLink = document.getElementById("logout-link");
	if(logoutLink) {
	    logoutLink.removeEventListener("click", logoutUser); // 先移除舊事件
	    logoutLink.addEventListener("click", (e)=>{
	        e.preventDefault();
	        logoutUser();
	    });
	}
});
