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

  const token = localStorage.getItem("token");
  const loginuser = localStorage.getItem("loggedInUser");
  if (!token||!loginuser) {
    alert("❌ 尚未登入，請先登入！");
    window.location.href = "../login/login.html";
    return;
  }


  // 🔹 新增/更新商店
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
      result.textContent = `✅ 新增/更新成功！商品名稱：「${data.name}」`;
      //要寫一個導向的語法在這邊喔
      previewImg.style.display = "none";
    } catch (err) {
      console.error(err);
      result.textContent = `❌ 新增/更新失敗：${err.message}`;
    }
  });
});
