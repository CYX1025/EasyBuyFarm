document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("storeCardsContainer");
  if (!container) {
    console.error("❌ 找不到 storeCardsContainer 容器");
    return;
  }

  try {
    // 取得所有賣場資料
    const res = await fetch(`http://localhost:8080/easybuyfarm/stores`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const stores = await res.json();
    container.innerHTML = "";

    if (stores.length === 0) {
      container.innerHTML = "<p>目前尚無建立任何賣場。</p>";
      return;
    }

    // 建立每個賣場卡片
    for (const store of stores) {
      const card = document.createElement("div");
      card.classList.add("store-card");

      // ------------------------
      // 賣場圖片
      // ------------------------
      const img = document.createElement("img");
      img.classList.add("store-img");
      img.alt = store.name;

      // 當圖片載入失敗時，自動使用預設圖片
      img.onerror = function () {
        this.onerror = null;
        this.src = "/images/default.png";
      };

      // 設定圖片來源
      img.src = store.storeImg && store.storeImg.trim() !== ""
        ? `/uploads/store/${store.storeImg}`
        : "/images/default.png";

      // ------------------------
      // 賣場名稱 & 簡介
      // ------------------------
      const name = document.createElement("h3");
      name.textContent = store.name;

      const intro = document.createElement("p");
      intro.textContent = store.introduce || "（尚無介紹）";

      // ------------------------
      // 組合卡片內容
      // ------------------------
      card.appendChild(img);
      card.appendChild(name);
      card.appendChild(intro);

      // 點擊卡片導向商品清單頁
      card.addEventListener("click", () => {
        window.location.href = `/html/product/productlist.html?storeId=${store.storeId}`;
      });

      container.appendChild(card);
    }
  } catch (err) {
    console.error("載入賣場清單失敗:", err);
    container.innerHTML = `<p class="error">❌ 載入失敗：${err.message}</p>`;
  }
});
