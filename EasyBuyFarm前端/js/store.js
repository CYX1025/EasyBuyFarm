document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("storeCardsContainer");
  if (!container) {
    console.error("❌ 找不到 storeCardsContainer 容器");
    return;
  }

  fetch("http://localhost:8080/easybuyfarm/stores")
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(data => {
      container.innerHTML = ""; // 清空舊資料

      data.forEach(store => {
        // 卡片外層
        const card = document.createElement("div");
        card.classList.add("store-card");

        // 圖片
        const img = document.createElement("img");
        img.classList.add("store-img");
        img.src = store.storeImg
          ? `/uploads/store/${store.storeImg}`
          : "https://placehold.co/200x150?text=No+Image";
        img.alt = store.name;

        // 名稱
        const name = document.createElement("h3");
        name.textContent = store.name;

        // 簡介
        const intro = document.createElement("p");
        intro.textContent = store.introduce || "（尚無介紹）";

        // 組合卡片內容
        card.appendChild(img);
        card.appendChild(name);
        card.appendChild(intro);

        // 點擊導向
        card.addEventListener("click", () => {
          window.location.href = `/html/product/productlist.html?storeId=${store.storeId}`;
        });

        // 加入右側區域
        container.appendChild(card);
      });

      if (data.length === 0) {
        container.innerHTML = "<p>目前尚無建立任何賣場。</p>";
      }
    })
    .catch(error => {
      console.error("載入失敗:", error);
      container.innerHTML = `<p class="error">❌ 載入失敗：${error.message}</p>`;
    });
});
