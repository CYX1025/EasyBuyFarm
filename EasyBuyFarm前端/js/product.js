document.addEventListener("DOMContentLoaded", () => {
  const productList = document.getElementById("productList");
  const storeTitle = document.getElementById("storeTitle");

  // 呼叫後端 API
  fetch(`http://localhost:8080/easybuyfarm/products`)
    .then(res => {
      if (!res.ok) throw new Error("無法取得商品列表");
      return res.json();
    })
    .then(products => {
      productList.innerHTML = "";

      if (products.length === 0) {
        productList.innerHTML = "<p>暫無商品資料</p>";
        return;
      }

      products.forEach
      (
        p => {
        const div = document.createElement("div");
        div.classList.add("product-card");
        div.innerHTML = `
          <img src="http://localhost:8080/uploads/product/${p.productImg}" alt="${p.name}">
          <h3>${p.name}</h3>
          <p>$${p.price}元</p>
          <p>重量 ${p.weight}</p>
        `;
        productList.appendChild(div);
      });
    })
    .catch(err => {
      console.error("載入商品列表失敗:", err);
      productList.innerHTML = "<p>商品資料載入錯誤</p>";
    });
});
