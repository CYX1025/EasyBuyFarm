document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("storeCardsContainer");
  const form = document.getElementById("create-marketplace-form");
  const shopNameInput = document.getElementById("shopName");
  const shopDescriptionInput = document.getElementById("shopDescription");
  const storeImgInput = document.getElementById("store_img");
  const previewImg = document.getElementById("previewImg");
  const storePreviewName = document.getElementById("storeName");
  const storePreviewIntro = document.getElementById("storeIntroduce");
  const storePreviewImg = document.getElementById("storePreviewImg");
  const resultContainer = document.getElementById("result");

  const user = getLoggedInUser();
  const token = localStorage.getItem("token");

  // -------------------------------
  // 編輯賣場功能相關元素 (統一管理)
  // -------------------------------
  const editProfileModal = document.getElementById("edit-profile-modal");
  const closeModalBtn = document.querySelector(".close-btn");
  const editProfileForm = document.getElementById("edit-profile-form");
  const editshopNameInput = document.getElementById("name");
  const editshopDescriptionInput = document.getElementById("introduce");
  const editstoreImgInput = document.getElementById("store_img");
  let currentEditingStoreId = null;

  // 關閉 Modal
  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      editProfileModal.style.display = "none";
      editProfileForm.reset();
    });
  }

  // 提交「編輯賣場」表單
  if (editProfileForm) {
    editProfileForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = editshopNameInput.value.trim();
      const introduce = editshopDescriptionInput.value.trim();
      const file = editstoreImgInput.files[0];

      if (!name) return alert("請輸入賣場名稱");

      const formData = new FormData();
      formData.append("name", name);
      formData.append("introduce", introduce);
      if (file) formData.append("store_img", file);

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("用戶未登入，無法修改資料");
          window.location.href = "/html/login/login.html?redirect=" + encodeURIComponent(window.location.href);
          return;
        }

        const res = await fetch(`http://localhost:8080/easybuyfarm/stores/update/${currentEditingStoreId}`, {
          method: "PUT",
          headers: { "Authorization": `Bearer ${token}` },
          body: formData
        });

        if (!res.ok) {
          const error = await res.text();
          alert(`更新失敗: ${error}`);
          return;
        }

        alert("資料更新成功！");
        editProfileModal.style.display = "none";
        await loadStores(); // 重新載入更新後的畫面
      } catch (err) {
        console.error("更新商店資料失敗:", err);
        alert("更新商店資料時發生錯誤，請稍後再試");
      }
    });
  }

  // -------------------------------
  // 預覽圖片 & 即時更新名稱/介紹
  // -------------------------------
  if (storeImgInput) {
    storeImgInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          previewImg.src = event.target.result;
          previewImg.style.display = "block";
          storePreviewImg.src = event.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        previewImg.style.display = "none";
        storePreviewImg.src = "https://via.placeholder.com/200x150?text=No+Image";
      }
    });
  }

  if (shopNameInput) {
    shopNameInput.addEventListener("input", () => {
      storePreviewName.textContent = shopNameInput.value || "賣場名稱";
    });
  }

  if (shopDescriptionInput) {
    shopDescriptionInput.addEventListener("input", () => {
      storePreviewIntro.textContent = shopDescriptionInput.value || "這裡是賣場介紹文字";
    });
  }

  // -------------------------------
  // 新增賣場表單送出
  // -------------------------------
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      resultContainer.textContent = "";

      const name = shopNameInput.value.trim();
      const introduce = shopDescriptionInput.value.trim();
      const file = storeImgInput.files[0];

      if (!name) return alert("請輸入賣場名稱");

      const formData = new FormData();
      formData.append("name", name);
      formData.append("introduce", introduce);
      if (file) formData.append("store_img", file);

      try {
        const res = await fetch("http://localhost:8080/easybuyfarm/stores/add", {
          method: "POST",
          headers: token ? { "Authorization": "Bearer " + token } : {},
          body: formData,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        resultContainer.textContent = "✅ 賣場新增成功！";
        resultContainer.style.color = "green";

        form.reset();
        storePreviewName.textContent = "賣場名稱";
        storePreviewIntro.textContent = "這裡是賣場介紹文字";
        storePreviewImg.src = "https://via.placeholder.com/200x150?text=No+Image";
        previewImg.style.display = "none";

        await loadStores();
      } catch (err) {
        console.error(err);
        resultContainer.textContent = "❌ 新增賣場失敗，請稍後再試。";
        resultContainer.style.color = "red";
      }
    });
  }

  // -------------------------------
  // 載入會員賣場列表
  // -------------------------------
  async function loadStores() {
    if (!container) return console.error("❌ 找不到 storeCardsContainer 容器");
    if (!user) return container.innerHTML = "<p>❌ 請先登入會員</p>";

    try {
      const res = await fetch(`http://localhost:8080/easybuyfarm/stores/member/${user.memberId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const stores = await res.json();

      container.innerHTML = "";
      if (stores.length === 0) {
        container.innerHTML = "<p>目前尚無建立任何賣場。</p>";
        return;
      }

      for (const store of stores) {
        const card = document.createElement("div");
        card.classList.add("store-card");

        const img = document.createElement("img");
        img.classList.add("store-img");
        img.alt = store.name;
        img.src = store.storeImg && store.storeImg.trim() !== "" ? `/uploads/store/${store.storeImg}` : "/images/default.png";
        img.onerror = function () { this.onerror = null; this.src = "/images/default.png"; };

        const name = document.createElement("h3");
        name.textContent = store.name;

        const intro = document.createElement("p");
        intro.textContent = store.introduce || "（尚無介紹）";

        card.appendChild(img);
        card.appendChild(name);
        card.appendChild(intro);

        // 僅自己賣場可操作
        if (user.role?.toUpperCase() === "SELLER" && user.memberId === store.memberToStore?.memberId) {
          const btnWrapper = document.createElement("div");
          btnWrapper.classList.add("store-btn-wrapper");

          // 編輯按鈕
          const editBtn = document.createElement("button");
          editBtn.textContent = "編輯賣場";
          editBtn.classList.add("store-btn", "edit-store-btn");
          editBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            currentEditingStoreId = store.id;
            editProfileModal.style.display = "block";
            editshopNameInput.value = store.name || "";
            editshopDescriptionInput.value = store.introduce || "";
          });

          // 刪除按鈕
          const deleteBtn = document.createElement("button");
          deleteBtn.textContent = "刪除賣場";
          deleteBtn.classList.add("store-btn", "delete-store-btn");
          deleteBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            if (!store.id || !token) return alert("無法刪除商店");
            if (!confirm(`確定要刪除 ${store.name} 嗎？`)) return;
            try {
              const delRes = await fetch(`http://localhost:8080/easybuyfarm/stores/delete/${store.id}`, {
                method: "DELETE",
                headers: { "Authorization": "Bearer " + token }
              });
              if (delRes.ok) {
                alert("刪除成功");
                card.remove();
              } else {
                const text = await delRes.text();
                alert("刪除失敗：" + delRes.status + " " + text);
              }
            } catch (err) {
              console.error(err);
              alert("刪除失敗，網路錯誤");
            }
          });

          btnWrapper.appendChild(editBtn);
          btnWrapper.appendChild(deleteBtn);
          card.appendChild(btnWrapper);
        }

        card.addEventListener("click", () => {
          window.location.href = `/html/product/editproduct.html?storeId=${store.storeId}`;
        });

        container.appendChild(card);
      }
    } catch (err) {
      console.error("載入賣場清單失敗:", err);
      container.innerHTML = `<p class="error">❌ 載入失敗：${err.message}</p>`;
    }
  }

  // 初次載入
  await loadStores();
});

// -------------------------------
// 取得登入會員資料
// -------------------------------
function getLoggedInUser() {
  const userString = localStorage.getItem("loggedInUser");
  try { return userString ? JSON.parse(userString) : null; } 
  catch { return null; }
}