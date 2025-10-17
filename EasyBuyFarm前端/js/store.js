document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("storeCardsContainer");
  if (!container) {
    console.error("❌ 找不到 storeCardsContainer 容器");
    return;
  }

  const user = getLoggedInUser(); // 取得登入會員資訊
  const token = localStorage.getItem("authToken"); // 假設 token 存 localStorage

  fetch("http://localhost:8080/easybuyfarm/stores")
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(async stores => {
      container.innerHTML = "";

      if (stores.length === 0) {
        container.innerHTML = "<p>目前尚無建立任何賣場。</p>";
        return;
      }

      for (const store of stores) {
        const card = document.createElement("div");
        card.classList.add("store-card");

        // 賣場圖片
        const img = document.createElement("img");
        img.classList.add("store-img");
        img.src = store.storeImg
          ? `/uploads/store/${store.storeImg}`
          : "/images/no-image.png"; // 本地預設圖
        img.alt = store.name;

        const name = document.createElement("h3");
        name.textContent = store.name;

        const intro = document.createElement("p");
        intro.textContent = store.introduce || "（尚無介紹）";

        card.appendChild(img);
        card.appendChild(name);
        card.appendChild(intro);

        // 只有自己的賣場才顯示操作按鈕
        if (user && user.role?.toUpperCase() === "SELLER" && user.memberId === store.ownerId) {
          const btnWrapper = document.createElement("div");
          btnWrapper.classList.add("store-btn-wrapper");

          // 編輯賣場
          const editStoreBtn = document.createElement("button");
          editStoreBtn.textContent = "編輯賣場";
          editStoreBtn.classList.add("store-btn");
          editStoreBtn.addEventListener("click", e => {
            e.stopPropagation();
            window.location.href = `/html/store/editstore.html?Id=${store.id}`;
          });

          // 刪除賣場
          const deleteStoreBtn = document.createElement("button");
          deleteStoreBtn.textContent = "刪除賣場";
          deleteStoreBtn.classList.add("store-btn");
          deleteStoreBtn.addEventListener("click", async e => {
            e.stopPropagation();

            if (!store.id) return alert("商店 ID 不存在，無法刪除");
            if (!token) return alert("未取得登入憑證，無法刪除商店");
            if (!confirm(`確定要刪除 ${store.name} 嗎？`)) return;

            try {
              const res = await fetch(`http://localhost:8080/easybuyfarm/stores/delete/${store.id}`, {
                method: "DELETE",
                headers: { "Authorization": "Bearer " + token }
              });

              if (res.ok) {
                alert("刪除成功");
                card.remove();
              } else {
                const text = await res.text();
                alert("刪除失敗：" + res.status + " " + text);
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
            window.location.href = `/html/product/addproduct.html?storeId=${store.id}`;
          });

          btnWrapper.appendChild(editStoreBtn);
          btnWrapper.appendChild(deleteStoreBtn);
          btnWrapper.appendChild(addProductBtn);
          card.appendChild(btnWrapper);

          // 載入該賣場商品
          const productList = document.createElement("ul");
          productList.classList.add("product-list");

          try {
            const prodRes = await fetch(`http://localhost:8080/easybuyfarm/products?storeId=${store.id}`);
            if (prodRes.ok) {
              const products = await prodRes.json();
              products.forEach(product => {
                const li = document.createElement("li");
                li.textContent = `${product.name} - NT$${product.price}`;

                // 編輯商品
                const editBtn = document.createElement("button");
                editBtn.textContent = "編輯";
                editBtn.classList.add("product-btn");
                editBtn.addEventListener("click", e => {
                  e.stopPropagation();
                  window.location.href = `/html/product/editproduct.html?productId=${product.productId}`;
                });

                // 刪除商品
                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = "刪除";
                deleteBtn.classList.add("product-btn");
                deleteBtn.addEventListener("click", async e => {
                  e.stopPropagation();
                  if (confirm(`確定要刪除 ${product.name} 嗎？`)) {
                    try {
                      const delRes = await fetch(`http://localhost:8080/easybuyfarm/products/${product.productId}`, {
                        method: "DELETE",
                        credentials: "include"
                      });
                      if (delRes.ok) {
                        li.remove();
                      } else {
                        const text = await delRes.text();
                        alert("刪除商品失敗：" + text);
                      }
                    } catch (err) {
                      console.error(err);
                      alert("刪除商品失敗，網路錯誤");
                    }
                  }
                });

                li.appendChild(editBtn);
                li.appendChild(deleteBtn);
                productList.appendChild(li);
              });
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
          window.location.href = `/html/product/productlist.html?storeId=${store.id}`;
        });

        container.appendChild(card);
      }
    })
    .catch(error => {
      console.error("載入失敗:", error);
      container.innerHTML = `<p class="error">❌ 載入失敗：${error.message}</p>`;
    });
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
