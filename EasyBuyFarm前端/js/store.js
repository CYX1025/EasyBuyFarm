// store.js
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("storeCardsContainer");
  if (!container) {
    console.error("❌ 找不到 storeCardsContainer 容器");
    return;
  }

  const user = getLoggedInUser(); // 取得登入會員資訊

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

        const img = document.createElement("img");
        img.classList.add("store-img");
        img.src = store.storeImg
          ? `/uploads/store/${store.storeImg}`
          : "https://placehold.co/200x150?text=No+Image";
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

          const addProductBtn = document.createElement("button");
          addProductBtn.textContent = "新增商品";
          addProductBtn.classList.add("store-btn");
          addProductBtn.addEventListener("click", e => {
            e.stopPropagation();
            window.location.href = `/html/product/addproduct.html?storeId=${store.storeId}`;
          });

          btnWrapper.appendChild(addProductBtn);
          card.appendChild(btnWrapper);

          // 載入該賣場商品
          const productList = document.createElement("ul");
          productList.classList.add("product-list");

          try {
            const res = await fetch(`http://localhost:8080/easybuyfarm/products?storeId=${store.storeId}`);
            if (res.ok) {
              const products = await res.json();
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
                        alert("刪除商品失敗");
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

        card.addEventListener("click", () => {
          window.location.href = `/html/product/productlist.html?storeId=${store.storeId}`;
        });

        container.appendChild(card);
      }
    })
    .catch(error => {
      console.error("載入失敗:", error);
      container.innerHTML = `<p class="error">❌ 載入失敗：${error.message}</p>`;
    });
});

function getLoggedInUser() {
  const userString = localStorage.getItem("loggedInUser");
  try {
    return userString ? JSON.parse(userString) : null;
  } catch {
    return null;
  }
}
