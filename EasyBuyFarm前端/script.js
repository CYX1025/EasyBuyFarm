// ======================================
// 全域變數 - 必須放在檔案頂部，讓所有函數都能訪問
// ======================================
let closeTimer; 
const dropdown = document.querySelector(".dropdown");
const dropbtn = document.querySelector(".dropbtn"); 
const dropdownContent = document.querySelector(".dropdown-content");

console.log("script.js 檔案成功載入並執行！");


/* ======================================
   Navbar 登入/登出狀態控制
   ====================================== */
function updateNavbar() {
  const user = localStorage.getItem("loggedInUser");
  const memberBtn = document.getElementById("member-btn");
  const loginLink = document.getElementById("login-link");
  const registerLink = document.getElementById("register-link");
  const logoutLink = document.getElementById("logout-link");

  // 由於 HTML 中移除了 style="display:none;"，這裡需要確保元素存在且是隱藏/顯示
  // 透過 class 或檢查 localStorage 狀態來決定初始顯示
  
  // 由於您的 HTML 沒有 style="display:none;" 屬性，我們需要假設這些元素可能需要 JS 來設定初始狀態
  // 如果它們在 CSS 中被隱藏 (例如透過父層的 class)，則這裡的邏輯需要調整。
  
  if (user) {
    // 已登入
    if (memberBtn) memberBtn.style.display = "block"; 
    if (logoutLink) logoutLink.style.display = "block";
    if (loginLink) loginLink.style.display = "none";
    if (registerLink) registerLink.style.display = "none";
  } else {
    // 未登入
    if (memberBtn) memberBtn.style.display = "none";
    if (logoutLink) logoutLink.style.display = "none";
    if (loginLink) loginLink.style.display = "block";
    if (registerLink) registerLink.style.display = "block";
  }
}


/* ======================================
   登入 / 登出功能
   ====================================== */
function loginUser(event) {
  event.preventDefault(); 
  const username = document.getElementById("username") ? document.getElementById("username").value : "測試用戶"; 
  localStorage.setItem("loggedInUser", username);
  alert("登入成功！");
  updateNavbar(); 
  window.location.href = "index.html";
}

function logoutUser() {
  localStorage.removeItem("loggedInUser");
  alert("已登出");
  updateNavbar();
  window.location.href = "index.html";
}

/* ======================================
   購物車功能
   ====================================== */
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(name, price) {
  let existingItem = cart.find(item => item.name === name);

  if (existingItem) {
    existingItem.quantity += 1;
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
    let totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalCount;
  }
}

function renderCartItems() {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");

  if (!cartItemsContainer) return; 

  cartItemsContainer.innerHTML = ""; 
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.quantity; 

    const li = document.createElement("li");
    li.textContent = `${item.name} - NT$${item.price} x ${item.quantity}`;

    const minusBtn = document.createElement("button");
    minusBtn.textContent = "-";
    minusBtn.onclick = () => {
      if (item.quantity > 1) item.quantity -= 1;
      else cart.splice(index, 1); 
      saveCart();
      updateCartCount();
      renderCartItems();
    };

    const plusBtn = document.createElement("button");
    plusBtn.textContent = "+";
    plusBtn.onclick = () => {
      item.quantity += 1;
      saveCart();
      updateCartCount();
      renderCartItems();
    };

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "刪除";
    removeBtn.onclick = () => {
      cart.splice(index, 1); 
      saveCart();
      updateCartCount();
      renderCartItems();
    };

    li.appendChild(minusBtn);
    li.appendChild(plusBtn);
    li.appendChild(removeBtn);
    cartItemsContainer.appendChild(li);
  });

  if (cartTotal) {
    cartTotal.textContent = `總金額: NT$${total}`;
  }
}

function clearCart() {
  cart = [];
  saveCart();
  updateCartCount();
  renderCartItems();
}


/* ======================================
   Dropdown 選單：點擊觸發
   ====================================== */

if (dropbtn && dropdownContent) {
    dropbtn.addEventListener("click", toggleDropdown);

    window.addEventListener("click", function(event) {
        if (!dropdown.contains(event.target)) {
            if (dropdownContent.classList.contains('show')) {
                dropdownContent.classList.remove('show');
            }
        }
    });
}

function toggleDropdown(event) {
    event.stopPropagation(); 
    dropdownContent.classList.toggle("show");
}


/* ======================================
   RESTful 賣場列表功能
   ====================================== */

/**
 * 根據 RESTful API 返回的 JSON 資料，動態渲染賣場卡片
 * @param {Array} stores - 賣場資料陣列
 */
function renderStoreCards(stores) {
    const sellerCardsContainer = document.querySelector(".seller-cards");
    if (!sellerCardsContainer) return; 

    sellerCardsContainer.innerHTML = ''; 

    if (stores && stores.length > 0) {
        stores.forEach(store => {
            const card = document.createElement('div');
            card.className = 'seller-card';

            const storeId = store.store_id || store.id; 
            const storeName = store.name;
            const storeImg = store.store_img;

            const ratingValue = store.rating || 4; 
            const rating = '★'.repeat(Math.round(ratingValue)) + '☆'.repeat(5 - Math.round(ratingValue));
            const productCount = store.product_count ? `${store.product_count}件` : '約100件'; 

            card.innerHTML = `
                <img src="${storeImg || 'https://via.placeholder.com/250x150?text=Shop+Image'}" alt="${storeName}">
                <h3>${storeName}</h3>
                <p>評價：${rating}</p>
                <p>商品數量：${productCount}</p>
                <a href="seller-shop.html?store_id=${storeId}" class="view-shop-btn">進入賣場</a>
            `;
            
            sellerCardsContainer.appendChild(card);
        });
    } else {
        sellerCardsContainer.innerHTML = '<p style="text-align: center; width: 100%;">目前沒有賣場可供顯示。</p>';
    }
}


/**
 * 呼叫 RESTful API 獲取賣場資料
 */
async function fetchStoreList() {
    try {
        const apiUrl = '/api/stores'; 
        
        console.log(`正在從 ${apiUrl} 獲取賣場資料...`);

        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態碼: ${response.status}`);
        }

        const data = await response.json(); 
        
        renderStoreCards(data);

    } catch (error) {
        console.error('獲取賣場資料失敗:', error);
        const sellerCardsContainer = document.querySelector(".seller-cards");
        if(sellerCardsContainer) {
            sellerCardsContainer.innerHTML = '<p style="color: red; text-align: center; width: 100%;">載入賣場資料失敗，請檢查後端 API 連線。</p>';
        }
    }
}


/* ======================================
   成為賣家：登入檢查及合約彈窗邏輯
   ====================================== */

function isUserLoggedIn() {
    // 判斷登入狀態：如果 localStorage 有用戶名，則視為登入
    return localStorage.getItem('loggedInUser') !== null;
}

const beSellerBtn = document.getElementById('be-seller-btn');
const contractModal = document.getElementById('contract-modal');
const closeModalBtn = document.getElementById('close-modal-btn');

if (beSellerBtn) {
    beSellerBtn.addEventListener('click', function() {
        if (isUserLoggedIn()) {
            contractModal.style.display = 'flex'; 
        } else {
            window.location.href = 'login.html';
        }
    });
}

if (closeModalBtn && contractModal) {
    closeModalBtn.addEventListener('click', function() {
        contractModal.style.display = 'none';
    });

    window.addEventListener('click', function(event) {
        if (event.target === contractModal) {
            contractModal.style.display = 'none';
        }
    });
}

// 賣家合約同意：發送角色升級請求
document.getElementById('agree-contract-btn')?.addEventListener('click', async function() {
    const upgradeApiUrl = '/api/user/upgradeToSeller'; 

    try {
        const response = await fetch(upgradeApiUrl, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const result = response.ok ? {} : await response.json(); // 成功時可能沒有 body

        if (response.ok) {
            contractModal.style.display = 'none';
            alert('恭喜您！賣家申請已送出，角色已升級。請刷新頁面查看賣家功能。');
            // 建議刷新頁面以更新 UI 狀態
            // window.location.reload(); 
        } else {
            const errorMessage = result.message || '申請失敗，請稍後再試。';
            alert('賣家申請失敗：' + errorMessage);
        }

    } catch (error) {
        console.error('升級賣家角色時發生錯誤:', error);
        alert('網路連線錯誤，無法完成申請。');
    }
});


/* ======================================
   ↓↓↓↓↓↓ 註冊功能：包含電話號碼驗證 (核心修改區塊) ↓↓↓↓↓↓
   ====================================== */
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const registerMessage = document.getElementById('register-message');

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            // 阻止表單的預設提交行為
            event.preventDefault();

            // 1. 收集使用者輸入的資料
            const phone = document.getElementById('reg-username').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const password = document.getElementById('reg-password').value.trim();

            // 清除舊的訊息
            registerMessage.textContent = '';
            registerMessage.style.color = 'red';

            // --- 2. 欄位空白驗證 ---
            if (!phone || !email || !password) {
                registerMessage.textContent = '請填寫所有欄位。';
                return;
            }

            // --- 3. 電話號碼規則驗證 ---
            // 規則: 必須是 09 開頭，後面接著 8 個數字 (共 10 碼)
            const phoneRegex = /^09\d{8}$/; 
            
            if (!phoneRegex.test(phone)) {
                registerMessage.textContent = '你他媽電話不是09開頭的是不是';
                document.getElementById('reg-username').focus();
                return;
            }
            
            // --- 4. 準備發送到後端的資料結構 ---
            const userData = {
                phone: phone,
                email: email,
                password: password
            };

            // 顯示等待訊息
            registerMessage.textContent = '註冊中...';

            // 5. 發送 POST 請求到後端 API
            const registerApiUrl = '/api/register'; // 請根據您的後端路徑修改此 URL

            try {
                const response = await fetch(registerApiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });

                const result = response.ok ? await response.json() : await response.json(); // 嘗試解析 JSON

                if (response.ok) {
                    // 註冊成功
                    registerMessage.textContent = '註冊成功！您將被導向登入頁面...';
                    registerMessage.style.color = 'green';
                    
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);

                } else {
                    // 伺服器返回錯誤 (例如：Email/電話已被註冊)
                    const errorMessage = result.message || '註冊失敗，請檢查輸入資訊。';
                    registerMessage.textContent = errorMessage;
                }

            } catch (error) {
                // 網路連線錯誤或 API 無法連線
                console.error('註冊請求失敗:', error);
                registerMessage.textContent = '網路連線錯誤，無法完成註冊。';
            }
        });
    }
    
    // --- 頁面初始化邏輯 (統一管理) ---
    updateNavbar(); 
    
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", loginUser);
    }

    updateCartCount();
    renderCartItems();
    
    const logoutLink = document.getElementById("logout-link");
    if (logoutLink) {
        logoutLink.addEventListener("click", (e) => { 
            e.preventDefault(); 
            logoutUser(); 
        });
    }

    // 判斷是否在賣場列表頁面並載入資料
    if (document.querySelector('.seller-list-container')) {
        fetchStoreList();
    }
    // ---------------------------------
});