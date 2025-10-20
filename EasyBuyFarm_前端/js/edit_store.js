document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("storeCardsContainer");
  const user = getLoggedInUser();
  const token = localStorage.getItem("token");

  // 取得 modal 和表單元件（全域一次就好）
  const editProfileModal = document.getElementById("edit-profile-modal");
  const closeModalBtn = document.querySelector('.close-btn');
  const editProfileForm = document.getElementById('edit-profile-form');
  const editshopNameInput = document.getElementById("name");
  const editshopDescriptionInput = document.getElementById("introduce");
  const editstoreImgInput = document.getElementById("store_img");

  let currentEditingStoreId = null;

  // 🔸 關閉 modal 的按鈕只需綁一次
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      editProfileModal.style.display = 'none';
      editProfileForm.reset();
    });
  }

  // 🔸 表單提交事件，只綁一次
  if (editProfileForm) {
    editProfileForm.addEventListener('submit', async function(event) {
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
          window.location.href = "/html/login/login.html?redirect=" + encodeURIComponent(window.location.href);
          return;
        }

        const res = await fetch(`http://localhost:8080/easybuyfarm/stores/update/${currentEditingStoreId}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });

        if (!res.ok) {
          const error = await res.text();
          alert(`更新失敗: ${error}`);
          return;
        }

        alert("資料更新成功！");
        editProfileModal.style.display = 'none';
        await loadStores();

      } catch (err) {
        console.error('更新商店資料失敗:', err);
        alert('更新商店資料時發生錯誤，請稍後再試');
      }
    });
  }

  // -------------------------------
  // 載入會員賣場列表
  // -------------------------------
  async function loadStores() {
    if (!container) return;
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
        img.src = store.storeImg ? `/uploads/store/${store.storeImg}` : "/images/default.png";
        img.onerror = () => img.src = "/images/default.png";

        const name = document.createElement("h3");
        name.textContent = store.name;
        const intro = document.createElement("p");
        intro.textContent = store.introduce || "（尚無介紹）";

        card.appendChild(img);
        card.appendChild(name);
        card.appendChild(intro);

        // 僅限自己賣場可編輯
        if (user.role?.toUpperCase() === "SELLER" && user.memberId === store.memberToStore?.memberId) {
          const btnWrapper = document.createElement("div");
          const editBtn = document.createElement("button");
          editBtn.textContent = "編輯賣場";
          editBtn.classList.add("store-btn");
          editBtn.dataset.storeId = store.id;

          // 🔸 點擊編輯按鈕時，僅設定 currentEditingStoreId & 開啟 modal
          editBtn.addEventListener("click", (e) => {
            currentEditingStoreId = e.currentTarget.dataset.storeId;
            e.stopPropagation();
            editshopNameInput.value = store.name || "";
            editshopDescriptionInput.value = store.introduce || "";
            editProfileModal.style.display = 'block';
          });

          btnWrapper.appendChild(editBtn);
          card.appendChild(btnWrapper);
        }

        container.appendChild(card);
      }

    } catch (err) {
      console.error("載入賣場清單失敗:", err);
      container.innerHTML = `<p class="error">❌ 載入失敗：${err.message}</p>`;
    }
  }

  await loadStores();
});
