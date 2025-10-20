document.addEventListener("DOMContentLoaded", () => {
  const productList = document.getElementById("productList");
   const storeTitle = document.getElementById("storeTitle");
  const urlParams = new URLSearchParams(window.location.search);
  const storeId = urlParams.get("storeId");
  const backBtn = document.getElementById("backToListBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
        // 假設 storeId 已經存在
        const storeId = document.getElementById("storeId")?.value || "";
        window.location.href = `../store/storelist.html`;
    });
  }
  

  if (!storeId) {
    productList.innerHTML = "<p>無效的商店 ID</p>";
    return;
  }

// 取得商店名稱
  fetch(`http://localhost:8080/easybuyfarm/stores/storeId/${storeId}`)
    .then(res => res.json())
    .then(store => {
      if (store && store.name) {
        storeTitle.textContent = `${store.name} 商品列表`;
      } else {
        storeTitle.textContent = "商店商品列表";
      }
    })
    .catch(err => {
      console.error("載入商店資訊失敗:", err);
      storeTitle.textContent = "商店商品列表";
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
    </div>
  `;

  // 若圖片載入失敗，改用預設圖片
  const img = div.querySelector("img");
  img.onerror = function () {
    this.onerror = null; // 防止無限觸發
    this.src = "/images/default.png";
  };

  //  點擊跳轉商品詳情頁
  div.addEventListener("click", () => {
    window.location.href = `/html/product/productdetail.html?id=${p.id}`;
  });

  // ✅ 加入商品卡片到列表
  productList.appendChild(div);
});

    })
    .catch(err => {
      console.error("載入商品列表失敗:", err);
      productList.innerHTML = "<p>商品資料載入錯誤</p>";
    });
});


