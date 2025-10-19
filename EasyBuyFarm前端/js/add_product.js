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
  const result = document.getElementById("result") || document.createElement("div");
  const storeTitle = document.getElementById("store-title");


  const backBtn = document.getElementById("backToListBtn");
  backBtn.addEventListener("click", () => {
    window.history.back();
  });

  async function updateStoreTitle() {
  const urlParams = new URLSearchParams(window.location.search);
  const storeId = urlParams.get("storeId");
    if (!storeId) return;

    try {
        const res = await fetch(`http://localhost:8080/easybuyfarm/stores/storeId/${storeId}`);
        if (!res.ok) throw new Error("無法取得商店資料");
        const store = await res.json();
        storeTitle.textContent = `新增「${store.name}」的商品`;
    } catch (err) {
        console.error(err);
        storeTitle.textContent = "新增商品";
    }
}

// 初次載入或商店 ID 變動時更新標題
storeIdInput.addEventListener("change", updateStoreTitle);
updateStoreTitle(); // 頁面載入就更新



  //驗證登入
  const token = localStorage.getItem("token");
  const loginuser = localStorage.getItem("loggedInUser");
  if (!token||!loginuser) {
    alert("❌ 尚未登入，請先登入！");
    window.location.href = "../login/login.html";
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const storeId = urlParams.get("storeId");
  if (storeId) {
    storeIdInput.value = storeId;
    storeIdInput.readOnly = true; // 避免使用者修改
  }

  // 提交新增商品的表單
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const storeid=storeIdInput.value;
    const name = productNameInput.value.trim();
    const price=productPriceInput.value.trim();
    const priceInt = parseInt(price);
    const salequantity=productSalequantityInput.value.trim();
    const weight=productWeightInput.value.trim();
    const introduce = productDetailInput.value.trim();
    const productImg = productImgInput.files[0];

    if (!storeid) {
    result.textContent = "⚠️ 請輸入商店 ID";
    return;
  }

    if (!name) {
      result.textContent = "⚠️ 請輸入商品名稱";
      return;
    }

    const formData = new FormData();
    formData.append("storeId",storeid)
    formData.append("name", name);
    formData.append("price",priceInt);
    formData.append("salequantity",salequantity);
    formData.append("weight",weight);
    formData.append("introduce", introduce);
    if (productImg) formData.append("productImg", productImg);

    try {
      result.textContent = "⏳ 資料傳送中...";
      const response = await fetch("http://localhost:8080/easybuyfarm/products/add", {
        method: "POST",
        headers: { "Authorization": "Bearer " + token },
        body: formData
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `伺服器回傳錯誤 ${response.status}`);
      }

      const data = await response.json();
      alert(`商品「${data.name}」新增成功！`);
      const urlParams = new URLSearchParams(window.location.search);
      const storeId = urlParams.get("storeId");

      // 跳轉回商品編輯頁並重新載入
      window.location.href = `editproduct.html?storeId=${storeId}`;
      } 
    catch (err) {
    console.error(err);
    result.textContent = `❌ 新增/更新失敗：${err.message}`;
    }
  });
});
