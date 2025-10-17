document.addEventListener("DOMContentLoaded", () => {
  const productList = document.getElementById("productList");
  const urlParams = new URLSearchParams(window.location.search);
  const storeId = urlParams.get("storeId");

  if (!storeId) {
    productList.innerHTML = "<p>無效的商店 ID</p>";
    return;
  }

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
        div.innerHTML = `
          <img src="http://localhost:8080/uploads/product/${p.productImg}" alt="${p.name}">
          <h3>${p.name}</h3>
          <p>$${p.price}元</p>
          <p>重量 ${p.weight}</p>
        `;

        div.addEventListener("click", () => {
          window.location.href = '/html/product/productdetail.html?id=' + p.id;
        
        });
        productList.appendChild(div);
      });
    })
    .catch(err => {
      console.error("載入商品列表失敗:", err);
      productList.innerHTML = "<p>商品資料載入錯誤</p>";
    });
});


