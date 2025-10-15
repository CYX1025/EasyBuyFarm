document.addEventListener("DOMContentLoaded", () => {
  const loadBtn = document.getElementById("loadStoreBtn");
  const form = document.getElementById("editStoreForm");
  const result = document.getElementById("result");
  const previewImg = document.getElementById("previewImg");

  // ✅ 1. 載入商店資料
  loadBtn.addEventListener("click", async () => {
    const id = document.getElementById("storeId").value.trim();
    if (!id) {
      result.textContent = "請輸入商店 ID";
      return;
    }

    result.textContent = "載入中...";
    try {
      const response = await fetch(`http://localhost:8080/stores/id/${id}`);
      if (!response.ok) throw new Error(`找不到商店 ID：${id}`);

      const store = await response.json();

      // 填入表單資料
      document.getElementById("name").value = store.name || "";
      document.getElementById("introduce").value = store.introduce || "";

      // 顯示圖片
      if (store.storeImg) {
        previewImg.src = `./uploads/store/${store.storeImg}`;
        previewImg.style.display = "block";
      } else {
        previewImg.style.display = "none";
      }

      form.style.display = "block";
      result.textContent = "✅ 資料載入成功";
    } catch (error) {
      console.error(error);
      result.textContent = "❌ 載入失敗，請確認商店 ID 是否存在。";
      form.style.display = "none";
    }
  });

  // ✅ 2. 送出更新請求
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("id").value.trim();
    const name = document.getElementById("name").value.trim();
    const introduce = document.getElementById("introduce").value.trim();
    const storeImg = document.getElementById("store_img").files[0];

    const formData = new FormData();
    formData.append("name", name);
    formData.append("introduce", introduce);
    if (storeImg) formData.append("store_img", storeImg);

    try {
      const response = await fetch(`http://localhost:8080/api/stores/update/${id}`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) throw new Error("伺服器回傳錯誤");

      const updatedStore = await response.json();
      result.textContent = `✅ 商店「${updatedStore.name}」更新成功！`;

      if (updatedStore.storeImg) {
        previewImg.src = `./uploads/store/${updatedStore.storeImg}`;
        previewImg.style.display = "block";
      }
    } catch (error) {
      console.error("更新失敗：", error);
      result.textContent = "❌ 更新失敗，請稍後再試。";
    }
  });
});
