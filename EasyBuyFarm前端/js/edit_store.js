document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("storeCardsContainer");
  if (!container) {
    console.error("❌ 找不到 storeCardsContainer 容器");
    return;
  }

  const user = getLoggedInUser(); // 取得登入會員資訊
  const token = localStorage.getItem("token"); // 假設 token 存 localStorage
  

  try {
    const res = await fetch(`http://localhost:8080/easybuyfarm/stores/member/${user.memberId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const stores = await res.json();
    container.innerHTML = "";

    if (stores.length === 0) {
      container.innerHTML = "<p>目前尚無建立任何賣場。</p>";
      return;
    }

    for (const store of stores) {
      const card = document.createElement("div");
      card.classList.add("store-card");

      // ------------------------
      // 賣場圖片
      // ------------------------
      const img = document.createElement("img");
      img.classList.add("store-img");
      img.alt = store.name;

      // 當圖片載入失敗時，自動使用預設圖片
      img.onerror = function () {
        this.onerror = null; // 避免循環
        this.src = "/images/default.png";
      };

      // 設定圖片來源
      img.src = store.storeImg && store.storeImg.trim() !== ""
        ? `/uploads/store/${store.storeImg}`
        : "/images/default.png";

      // ------------------------
      // 賣場名稱 & 簡介
      // ------------------------
      const name = document.createElement("h3");
      name.textContent = store.name;

      const intro = document.createElement("p");
      intro.textContent = store.introduce || "（尚無介紹）";

      card.appendChild(img);
      card.appendChild(name);
      card.appendChild(intro);

      // ------------------------
      // 賣場操作按鈕（僅自己賣場）
      // ------------------------
      if (user && user.role?.toUpperCase() === "SELLER" && user.memberId === store.memberToStore?.memberId) {
        const btnWrapper = document.createElement("div");
        btnWrapper.classList.add("store-btn-wrapper");

        // 編輯賣場
        const editStoreBtn = document.createElement("button");
        editStoreBtn.textContent = "編輯賣場";
        editStoreBtn.classList.add("store-btn","edit-store-btn");
        editStoreBtn.addEventListener("click", e => {
          e.stopPropagation();
          window.location.href = `/html/store/editstore.html?Id=${store.id}`;
        });

        // 刪除賣場
        const deleteStoreBtn = document.createElement("button");
        deleteStoreBtn.textContent = "刪除賣場";
        deleteStoreBtn.classList.add("store-btn","delete-store-btn");
        deleteStoreBtn.addEventListener("click", async e => {
          e.stopPropagation();
          if (!store.id) return alert("商店 ID 不存在，無法刪除");
          if (!token) return alert("未取得登入憑證，無法刪除商店");
          if (!confirm(`確定要刪除 ${store.name} 嗎？`)) return;

          try {
            const delRes = await fetch(`http://localhost:8080/easybuyfarm/stores/delete/${store.id}`, {
              method: "DELETE",
              headers: { "Authorization": "Bearer " + token }
            });
            if (delRes.ok) {
              alert("刪除成功");
              card.remove();
            } else {
              const text = await delRes.text();
              alert("刪除失敗：" + delRes.status + " " + text);
            }
          } catch (err) {
            console.error(err);
            alert("刪除失敗，網路錯誤");
          }
        });

        // 新增商品
        const addProductBtn = document.createElement("button");
        addProductBtn.textContent = "新增商品";
        addProductBtn.classList.add("store-btn");
        addProductBtn.addEventListener("click", e => {
          e.stopPropagation();
          window.location.href = `/html/product/addproduct.html?storeId=${store.storeId}`;
        });

        btnWrapper.appendChild(editStoreBtn);
        btnWrapper.appendChild(deleteStoreBtn);
        btnWrapper.appendChild(addProductBtn);
        card.appendChild(btnWrapper);

        // ------------------------
        // 載入該賣場商品
        // ------------------------
        const productList = document.createElement("ul");
        productList.classList.add("product-list");

        try {
          const prodRes = await fetch(`http://localhost:8080/easybuyfarm/products?storeId=${store.storeId}`);
          if (prodRes.ok) {
            const products = await prodRes.json();
          } else {
            productList.innerHTML = "<li>無法載入商品</li>";
          }
        } catch (err) {
          console.error(err);
          productList.innerHTML = "<li>載入商品失敗</li>";
        }

        card.appendChild(productList);
      }

      // 點擊卡片導向商品清單頁
      card.addEventListener("click", () => {
        window.location.href = `/html/product/productlist.html?storeId=${store.storeId}`;
      });

      container.appendChild(card);
    }
  } catch (err) {
    console.error("載入賣場清單失敗:", err);
    container.innerHTML = `<p class="error">❌ 載入失敗：${err.message}</p>`;
  }
});

// 取得登入會員資料
function getLoggedInUser() {
  const userString = localStorage.getItem("loggedInUser");
  try {
    return userString ? JSON.parse(userString) : null;
  } catch {
    return null;
  }
}
