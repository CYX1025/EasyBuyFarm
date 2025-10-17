// edit_store.js
document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("create-marketplace-form");
  const shopNameInput = document.getElementById("shopName");
  const shopDescriptionInput = document.getElementById("shopDescription");
  const storeImgInput = document.getElementById("storeImg");
  const previewImg = document.getElementById("previewImg");

  const storeNameDisplay = document.getElementById("storeName");
  const storeIntroduceDisplay = document.getElementById("storeIntroduce");
  const storePreviewImg = document.getElementById("storePreviewImg");
  const result = document.getElementById("result") || document.createElement("div");

  const token = localStorage.getItem("token");
  const loginuser = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const memberId = loginuser.memberId;

  if (!token || !memberId) {
    alert("❌ 尚未登入，請先登入！");
    window.location.href = "../login/login.html";
    return;
  }

  // ========================
  // 1️⃣ 載入現有賣場資料
  // ========================
  try {
    const response = await fetch(`http://localhost:8080/easybuyfarm/stores/member/${memberId}`, {
      headers: { "Authorization": "Bearer " + token },
    });
    if (!response.ok) throw new Error("載入商店資料失敗");

    const stores = await response.json();
    renderStoreList(stores); // ✅ 顯示右側清單

    if (stores.length > 0) {
      const store = stores[0];
      shopNameInput.value = store.name || "";
      shopDescriptionInput.value = store.introduce || "";
      storeNameDisplay.textContent = store.name || "賣場名稱";
      storeIntroduceDisplay.textContent = store.introduce || "這裡是賣場介紹文字";
      storePreviewImg.src = store.storeImg
        ? `/uploads/store/${store.storeImg}`
        : "https://placehold.co/200x150?text=No+Image";
    }
  } catch (err) {
    console.error(err);
    result.textContent = "❌ 載入商店資料失敗：" + err.message;
  }

  // ========================
  // 2️⃣ 即時預覽區更新
  // ========================
  shopNameInput.addEventListener("input", () => {
    storeNameDisplay.textContent = shopNameInput.value || "賣場名稱";
  });

  shopDescriptionInput.addEventListener("input", () => {
    storeIntroduceDisplay.textContent = shopDescriptionInput.value || "這裡是賣場介紹文字";
  });

  storeImgInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        storePreviewImg.src = reader.result;
        previewImg.src = reader.result;
        previewImg.style.display = "block";
      };
      reader.readAsDataURL(file);
    } else {
      storePreviewImg.src = "https://placehold.co/200x150?text=No+Image";
      previewImg.style.display = "none";
    }
  });

  // ========================
  // 3️⃣ 新增 / 更新商店
  // ========================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = shopNameInput.value.trim();
    const introduce = shopDescriptionInput.value.trim();
    const store_Img = storeImgInput.files[0];

    if (!name) {
      result.textContent = "⚠️ 請輸入賣場名稱";
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("introduce", introduce);
    if (store_Img) formData.append("store_img", store_Img);

    try {
      result.textContent = "⏳ 資料傳送中...";
      const response = await fetch("http://localhost:8080/easybuyfarm/stores/add", {
        method: "POST",
        headers: { "Authorization": "Bearer " + token },
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `伺服器錯誤 ${response.status}`);
      }

      const data = await response.json();

      // ✅ 新增完成後右側顯示卡片
      addStoreCardToRight(data);

      result.textContent = `✅ 新增成功！商店名稱：「${data.name}」`;

      previewImg.style.display = "none";
      form.reset();

    } catch (err) {
      console.error(err);
      result.textContent = `❌ 新增/更新失敗：${err.message}`;
    }
  });

  // ========================
  // 4️⃣ 顯示右側商店清單
  // ========================
  function renderStoreList(stores) {
    const container = document.getElementById("storeItems");
    container.innerHTML = "";
    stores.forEach((store) => addStoreCardToRight(store));
  }

  // ========================
  // 5️⃣ 動態新增右側卡片
  // ========================
  function addStoreCardToRight(store) {
    const container = document.getElementById("storeItems");
    if (!container) return;

    const div = document.createElement("div");
    div.classList.add("store-item");
    div.innerHTML = `
      <img src="${store.storeImg ? `/uploads/store/${store.storeImg}` : 'https://placehold.co/120x90?text=No+Image'}" alt="${store.name}">
      <div>
        <h4>${store.name}</h4>
        <p>${store.introduce || "（尚無介紹）"}</p>
      </div>
    `;
    container.appendChild(div);
  }
});
