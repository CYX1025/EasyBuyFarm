// 搜尋商店：依關鍵字比對各商店販售的商品名稱
// 本檔以 UTF-8 儲存，避免中文字元亂碼

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(location.search);
  const q = (params.get('q') || '').trim();

  const titleEl = document.getElementById('search-title');
  const container = document.getElementById('results-container');

  if (titleEl) {
    titleEl.textContent = q ? `搜尋結果：${q}` : '請輸入關鍵字';
  }

  if (!container) return;

  if (!q) {
    container.innerHTML = '<p class="search-empty">請在上方搜尋框輸入商品名稱或品牌</p>';
    return;
  }

  try {
    const storesRes = await fetch('http://localhost:8080/easybuyfarm/stores');
    if (!storesRes.ok) throw new Error(`HTTP ${storesRes.status}`);
    const stores = await storesRes.json();

    const matches = [];

    await Promise.all((stores || []).map(async (store) => {
      const sid = store?.storeId ?? store?.id;
      if (!sid) return;
      try {
        const prodsRes = await fetch(`http://localhost:8080/easybuyfarm/products/store/${sid}`);
        if (!prodsRes.ok) return;
        const products = await prodsRes.json();
        const list = Array.isArray(products) ? products : [];
        const hit = list.filter(p => String(p?.name || '').includes(q));
        if (hit.length > 0) {
          matches.push({ store, products: hit });
        }
      } catch (_) { /* ignore per-store errors */ }
    }));

    if (matches.length === 0) {
      container.innerHTML = `<p class="search-empty">找不到包含「${escapeHtml(q)}」的商店</p>`;
      return;
    }

    container.innerHTML = '';

    for (const { store, products } of matches) {
      const card = document.createElement('div');
      card.className = 'store-card';

      const img = document.createElement('img');
      img.className = 'store-img';
      img.alt = String(store?.name || '');
      img.src = (store?.storeImg && String(store.storeImg).trim() !== '')
        ? `/uploads/store/${store.storeImg}`
        : '/images/default.png';
      img.onerror = function(){ this.onerror = null; this.src = '/images/default.png'; };

      const name = document.createElement('h3');
      name.textContent = String(store?.name || '商店');

      const intro = document.createElement('p');
      intro.textContent = String(store?.introduce || '尚無介紹');

      const matchList = document.createElement('ul');
      matchList.className = 'product-list';
      for (const p of products.slice(0, 3)) {
        const li = document.createElement('li');
        li.textContent = String(p?.name || '');
        matchList.appendChild(li);
      }

      card.appendChild(img);
      card.appendChild(name);
      card.appendChild(intro);
      card.appendChild(matchList);

      card.addEventListener('click', () => {
        const sid = store?.storeId ?? store?.id;
        if (sid) window.location.href = `/html/product/productlist.html?storeId=${sid}`;
      });

      container.appendChild(card);
    }
  } catch (err) {
    container.innerHTML = `<p class="search-error">載入搜尋結果失敗：${escapeHtml(err.message || String(err))}</p>`;
  }
});

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

