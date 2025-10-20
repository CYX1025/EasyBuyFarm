document.addEventListener("DOMContentLoaded", async () => {
  // 取得 URL 上的 productId
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  if (!productId) {
    document.querySelector(".product-detail").innerHTML = "<p>❌ 找不到商品 ID。</p>";
    return;
  }

  try {
    // 取得商品資料
    const response = await fetch(`http://localhost:8080/easybuyfarm/products/id/${productId}`);
    if (!response.ok) throw new Error("無法取得商品資料");

    const product = await response.json();
     const backBtn = document.getElementById("backToListBtn");
    if (backBtn) {
    backBtn.addEventListener("click", () => {
        
        window.location.href = `../product/productlist.html?storeId=${product.storeId.storeId}`;
    });
  }


    // ✅ 圖片顯示邏輯（含預設圖片）
    
    //  判斷圖片是否存在
    const imgSrc = product.productImg && product.productImg.trim() !== ""
    ? `http://localhost:8080/uploads/product/${product.productImg}`
    : "/images/default.png"; // 預設圖片路徑

    // ✅ 填入其他資料
    document.getElementById("productImg").src = imgSrc;
    document.getElementById("productName").textContent = product.name || "未命名商品";
    document.getElementById("productIntroduce").textContent = product.introduce || "暫無商品描述";
    document.getElementById("productPrice").textContent = product.price ? `$${product.price}` : "未定價";
    document.getElementById("productWeight").textContent = product.weight || "無資料";
    document.getElementById("productSalequantity").textContent = product.salequantity || "無庫存資料";

    // ✅ 加入購物車按鈕事件
    const buyBtn = document.getElementById("buyBtn");
    if (buyBtn) {
      buyBtn.addEventListener("click", () => {
        alert(`✅ 已將「${product.name}」加入購物車！`);
      });
    }

  } catch (error) {
    console.error("載入商品失敗:", error);
    document.querySelector(".product-detail").innerHTML =
      "<p>❌ 商品資料載入失敗，請稍後再試。</p>";
  }
});

// Add-to-cart flow: capture click and handle ourselves
document.addEventListener("DOMContentLoaded", () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");
    const buyBtn = document.getElementById("buyBtn");
    if (!buyBtn || !productId) return;

    buyBtn.addEventListener(
      "click",
      (e) => {
        try {
          e.preventDefault();
          e.stopPropagation();
          if (e.stopImmediatePropagation) e.stopImmediatePropagation();

          const name = (document.getElementById("productName")?.textContent || "").trim();
          const priceText = (document.getElementById("productPrice")?.textContent || "").replace(/[^0-9.]/g, "");
          const price = Number(priceText) || 0;

          if (!window.cart) window.cart = [];
          const item = {
            id: isNaN(Number(productId)) ? productId : Number(productId),
            name,
            price,
            quantity: 1,
          };

          const idx = window.cart.findIndex((p) => String(p.id) === String(item.id));
          if (idx > -1) {
            window.cart[idx].quantity += 1;
          } else {
            window.cart.push(item);
          }

          if (typeof saveCart === "function") saveCart();
          if (typeof updateCartCount === "function") updateCartCount();
          alert("已加入購物車");
        } catch (err) {
          console.error("Add to cart error:", err);
          alert("加入購物車失敗");
        }
      },
      true // capture to prevent existing alert handler
    );
  } catch (err) {
    console.error("Init add-to-cart failed:", err);
  }
});
