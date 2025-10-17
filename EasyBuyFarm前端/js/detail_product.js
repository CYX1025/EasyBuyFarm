document.addEventListener("DOMContentLoaded", async () => {
  // 取得 URL 上的 productId
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  const detailContainer = document.querySelector(".product-detail");
  if (!productId) {
    if (detailContainer) detailContainer.innerHTML = "<p>❌ 找不到商品 ID。</p>";
    return;
  }

  try {
    // 取得商品資料
    const response = await fetch(`http://localhost:8080/easybuyfarm/products/id/${productId}`);
    if (!response.ok) throw new Error("無法取得商品資料");

    const product = await response.json();

    // ------------------------
    // 圖片處理（含預設圖片 + 載入失敗）
    // ------------------------
    const imgElement = document.getElementById("productImg");
    if (imgElement) {
      imgElement.src = (product.productImg && product.productImg.trim() !== "")
        ? `http://localhost:8080/uploads/product/${product.productImg}`
        : "/images/default.png";

      imgElement.onerror = function() {
        this.onerror = null; // 避免循環
        this.src = "/images/default.png";
      };
    }

    // ------------------------
    // 填入其他商品資料
    // ------------------------
    const setText = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value || "無資料";
    };

    setText("productName", product.name || "未命名商品");
    setText("productIntroduce", product.introduce || "暫無商品描述");
    setText("productPrice", product.price ? `$${product.price}` : "未定價");
    setText("productWeight", product.weight || "無資料");
    setText("productSalequantity", product.salequantity || "無庫存資料");

    // ------------------------
    // 購物車按鈕事件
    // ------------------------
    const buyBtn = document.getElementById("buyBtn");
    if (buyBtn) {
      buyBtn.addEventListener("click", () => {
        alert(`✅ 已將「${product.name}」加入購物車！`);
      });
    }

  } catch (error) {
    console.error("載入商品失敗:", error);
    if (detailContainer) detailContainer.innerHTML =
      "<p>❌ 商品資料載入失敗，請稍後再試。</p>";
  }
});
