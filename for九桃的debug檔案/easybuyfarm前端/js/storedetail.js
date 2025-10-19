document.addEventListener("DOMContentLoaded", () => {
  // 取得 URL 中的 storeId
  const urlParams = new URLSearchParams(window.location.search);
  const storeId = urlParams.get("Id");

  if (!storeId) {
    alert("未指定賣場 ID！");
    return;
  }

  // ✅ 載入賣場資料
  fetch(`http://localhost:8080/easybuyfarm/api/stores/${Id}`)
    .then(res => {
      if (!res.ok) throw new Error("無法取得賣場資料");
      return res.json();
    })
    .then(store => {
      document.getElementById("storeImg").src = `./images/${store.storeImg}`;
      document.getElementById("storeName").textContent = store.name;
      document.getElementById("storeIntroduce").textContent = store.introduce;
    })
    .catch(err => console.error("載入賣場資料失敗:", err));

  // ✅ (可選) 載入商品列表
  fetch(`http://localhost:8080/easybuyfarm/api/products/store/${Id}`)
    .then(res => {
      if (!res.ok) throw new Error("無法取得商品列表");
      return res.json();
    })
    .then(products => {
      const productList = document.getElementById("productList");
      productList.innerHTML = "";
      if (products.length === 0) {
        productList.innerHTML = "<p>暫無商品資料</p>";
        return;
      }

      products.forEach(p => {
        const div = document.createElement("div");
        div.classList.add("product-card");
        div.innerHTML = `
          <img src="./images/${p.image}" alt="${p.name}">
          <h3>${p.name}</h3>
          <p>$${p.price}</p>
        `;
        productList.appendChild(div);
      });
    })
    .catch(err => {
      console.error("載入商品列表失敗:", err);
      document.getElementById("productList").innerHTML = "<p>商品資料載入錯誤</p>";
    });
});
