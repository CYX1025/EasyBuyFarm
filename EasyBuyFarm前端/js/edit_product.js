document.addEventListener("DOMContentLoaded", () => {
  const productList = document.getElementById("productList");
  const storeTitle = document.getElementById("storeTitle");
  const urlParams = new URLSearchParams(window.location.search);
  const storeId = urlParams.get("storeId");
  const token = localStorage.getItem("token");
  const addBtn = document.getElementById("addProductBtn");

  const backBtn = document.getElementById("backToListBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
        // 假設 storeId 已經存在
        const storeId = document.getElementById("storeId")?.value || "";
        window.location.href = `../store/editstore.html?storeId=${storeId}`;
    });
}

  if (!storeId) {
    productList.innerHTML = "<p>無效的商店 ID</p>";
    return;
  }

  //新增商品
  addBtn.addEventListener("click", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const storeId = urlParams.get("storeId");
  window.location.href = `/html/product/addproduct.html?storeId=${storeId}`;
});



// 取得商店名稱
  fetch(`http://localhost:8080/easybuyfarm/stores/storeId/${storeId}`)
    .then(res => res.json())
    .then(store => {
      if (store && store.name) {
        storeTitle.textContent = `${store.name} 商品編輯頁面`;
      } else {
        storeTitle.textContent = "商品編輯頁面";
      }
    })
    .catch(err => {
      console.error("載入商店資訊失敗:", err);
      storeTitle.textContent = "商品編輯頁面";
    });
  
    
  //取得商品列表
  fetch(`http://localhost:8080/easybuyfarm/products/store/${storeId}`)
    .then(res => res.json())
    .then(products => {
      productList.innerHTML = "";
      if (products.length === 0) {
        productList.innerHTML = "<p>暫無商品資料</p>";
        return;
      }
  products.forEach(p => {
  const div = document.createElement("div");
  div.classList.add("product-card");

  //  判斷圖片是否存在
  const imgSrc = p.productImg && p.productImg.trim() !== ""
    ? `http://localhost:8080/uploads/product/${p.productImg}`
    : "/images/default.png"; // 預設圖片路徑

  //  建立商品卡內容
  div.innerHTML = `
    <img class="product-card-img" src="${imgSrc}" alt="${p.name}">
    <h3 class="product-card-name">${p.name}</h3>
    <p class="product-price">$${p.price}元</p>
    <p class="product-intro">重量 ${p.weight}</p>
    <div class="product-card-buttons">
            <button class="edit-btn">編輯商品</button>
            <button class="delete-btn">刪除商品</button>
    </div>
  `;

  // 若圖片載入失敗，改用預設圖片
  const img = div.querySelector("img");
  img.onerror = function () {
    this.onerror = null; // 防止無限觸發
    this.src = "/images/default.png";
  };

  // 按鈕事件
  const editBtn = div.querySelector(".edit-btn");
  editBtn.addEventListener("click", (e) => {
  e.stopPropagation(); // 避免觸發點擊整個卡片跳頁
  window.location.href = `/html/product/updateproduct.html?id=${p.id}`;
  });

  const deleteBtn = div.querySelector(".delete-btn");
  deleteBtn.addEventListener("click", (e) => 
  {
  e.stopPropagation();
  if (confirm(`確定要刪除商品 "${p.name}" 嗎？`)) 
    {
      fetch(`http://localhost:8080/easybuyfarm/products/delete/${p.id}?storeId=${storeId}`, {
      method: "DELETE",
      headers: {
      "Authorization": `Bearer ${token}`
    }
      })
    .then(res => {
    if (res.ok) 
      {
        div.remove(); // 刪除卡片
      } 
    else 
      {
        alert("刪除商品失敗");
      }
              })
    .catch(err => {
      console.error("刪除商品錯誤:", err);
      alert("刪除商品錯誤");
            });
    }
  });

  // 加入商品卡片到列表
  productList.appendChild(div);
});

    })
    .catch(err => {
      console.error("載入商品列表失敗:", err);
      productList.innerHTML = "<p>商品資料載入錯誤</p>";
    });
});


