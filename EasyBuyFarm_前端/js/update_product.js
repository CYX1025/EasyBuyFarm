document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("create-marketplace-form");
  const storeIdInput = document.getElementById("storeId");
  const productNameInput = document.getElementById("productName");
  const productPriceInput = document.getElementById("productPrice");
  const productSalequantityInput = document.getElementById("productSalequantity");
  const productWeightInput = document.getElementById("productWeight");
  const productDetailInput = document.getElementById("productDetail");
  const productImgInput = document.getElementById("productImg");
  const previewImg = document.getElementById("previewImg");
  const result = document.getElementById("result");
  const storeTitle = document.getElementById("store-title");

  const token = localStorage.getItem("token");
  const loginuser = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!token || !loginuser) {
    alert("❌ 尚未登入，請先登入！");
    window.location.href = "../login/login.html";
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");  // 編輯商品必須帶 id
 

  if (!productId) {
    alert("❌ 無法識別商品 ID");
    window.location.href = "editproduct.html";
    return;
  }

  // 回上一頁按鈕
  const backBtn = document.getElementById("backToListBtn");
  if (backBtn) backBtn.addEventListener("click", () => window.history.back());

  // 抓取商品資料並填入表單
  async function loadProductData() {
    try {
      const res = await fetch(`http://localhost:8080/easybuyfarm/products/id/${productId}`, {
        headers: { "Authorization": "Bearer " + token }
      });
      if (!res.ok) throw new Error("無法取得商品資料");

      const product = await res.json();
      const storeId=product.storeId.storeId;
      
   // 填入表單
      if (storeId) {
      storeIdInput.value = storeId;
      console.log(storeId);
      storeIdInput.readOnly = true;
      }

      // 擁有者檢查：比對 memberId（字串）
      const ownerMemberId = product.storeId.memberToStore.memberId?.trim();
      const loginMemberId = loginuser.memberId?.trim();
      if (ownerMemberId !== loginMemberId) {
        alert("❌ 您不是此商店的擁有者(前端錯誤)");
        window.location.href = `editproduct.html?storeId=${storeId}`;
        return;
      }

      productNameInput.value = product.name || "";
      productPriceInput.value = product.price || "";
      productSalequantityInput.value = product.salequantity || "";
      productWeightInput.value = product.weight || "";
      productDetailInput.value = product.introduce || "";

      if (product.productImg) {
        previewImg.src = `http://localhost:8080/uploads/product/${product.productImg}`;
        previewImg.style.display = "block";
      }

      storeTitle.textContent = `編輯「${product.name}」的商品資料`;
    } catch (err) {
      console.error(err);
      result.textContent = "❌ 無法載入商品資料";
    }
  }
  loadProductData();

  // 提交表單
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = productNameInput.value.trim();
    const price = parseInt(productPriceInput.value.trim());
    const salequantity = productSalequantityInput.value.trim();
    const weight = productWeightInput.value.trim();
    const introduce = productDetailInput.value.trim();
    const productImg = productImgInput.files[0];
    const storeId=storeIdInput.value.trim();

    if (!name) {
      result.textContent = "⚠️ 請輸入商品名稱";
      return;
    }

    const formData = new FormData();
    formData.append("storeId", storeId);
    formData.append("name", name);
    formData.append("price", price);
    formData.append("salequantity", salequantity);
    formData.append("weight", weight);
    formData.append("introduce", introduce);
    if (productImg) formData.append("productImg", productImg);

    try {
      result.textContent = "⏳ 資料更新中...";

      const response = await fetch(`http://localhost:8080/easybuyfarm/products/update/${productId}`, {
        method: "PUT",
        headers: { "Authorization": "Bearer " + token },
        body: formData
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `伺服器回傳錯誤 ${response.status}`);
      }

      const data = await response.json();
      alert(`商品「${data.name}」更新成功！`);
      window.location.href = `editproduct.html?storeId=${storeId}`;
    } catch (err) {
      console.error(err);
      result.textContent = `❌ 更新失敗：${err.message}`;
    }
  });
});
