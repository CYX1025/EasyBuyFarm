(function () {
  const ORDERS_SQL_PATH = "../../database_easybuyfarmForSpringboot/easybuyfarm_orders.sql";
  const ORDER_DETAILS_SQL_PATH = "../../database_easybuyfarmForSpringboot/easybuyfarm_orderdetails.sql";
  document.addEventListener("DOMContentLoaded", () => {
    const ordersTbody = document.getElementById("orders-tbody");
    if (!ordersTbody) return;
    loadOrders()
      .then(orders => renderOrders(orders))
      .catch(err => {
        console.error("載入訂單失敗:", err);
        ordersTbody.innerHTML = '<tr><td colspan="6">無法載入訂單資料</td></tr>';
      });
    setupModal();
  });
  function setupModal() {
    const modal = document.getElementById("order-details-modal");
    const closeBtn = document.getElementById("order-details-close");
    if (!modal || !closeBtn) return;
    const hide = () => (modal.style.display = "none");
    closeBtn.addEventListener("click", hide);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) hide();
    });
  }
  async function loadOrders() {
    const sql = await fetchText(ORDERS_SQL_PATH);
    const insertLine = sql.split(/\r?\n/).find(l => /INSERT INTO `orders` VALUES/i.test(l));
    if (!insertLine) return [];
    const valuesPart = insertLine.replace(/.*VALUES\s*/i, "").replace(/;\s*$/, "");
    const rows = splitSqlTuples(valuesPart);
    const orders = [];
    const rowRe = /^\(?\s*(\d+)\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*([0-9.]+)\s*,\s*'([^']+)'\s*\)?$/;
    for (const r of rows) {
      const m = r.match(rowRe);
      if (!m) continue;
      orders.push({
        id: Number(m[1]),
        order_number: m[2],
        customer_id: m[3],
        order_date: m[4],
        total_amount: Number(m[5]),
        payment_method: m[6]
      });
    }
    // 依時間排序：新到舊
    orders.sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());
    return orders;
  }
  function renderOrders(orders) {
    const tbody = document.getElementById("orders-tbody");
    if (!tbody) return;
    if (!orders.length) {
      tbody.innerHTML = '<tr><td colspan="6">目前沒有訂單</td></tr>';
      return;
    }
    const rows = orders.map(o => {
      const amount = isFinite(o.total_amount) ? o.total_amount.toFixed(2) : "0.00";
      return `
        <tr>
          <td>${escapeHtml(o.order_number)}</td>
          <td>${escapeHtml(o.customer_id)}</td>
          <td>${escapeHtml(formatDateTime(o.order_date))}</td>
          <td>NT$ ${amount}</td>
          <td>${escapeHtml(o.payment_method)}</td>
          <td><button class="btn" data-order-number="${escapeAttr(o.order_number)}">訂單明細</button></td>
        </tr>
      `;
    }).join("");
    tbody.innerHTML = rows;
    tbody.querySelectorAll('button[data-order-number]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const orderNo = e.currentTarget.getAttribute('data-order-number');
        await showOrderDetails(orderNo);
      });
    });
  }
  async function showOrderDetails(orderNumber) {
    const modal = document.getElementById("order-details-modal");
    const meta = document.getElementById("order-details-meta");
    const tbody = document.getElementById("order-details-tbody");
    if (!modal || !meta || !tbody) return;
    meta.textContent = `訂單編號：${orderNumber}`;
    tbody.innerHTML = '<tr><td colspan="6">載入中…</td></tr>';
    modal.style.display = "block";
    try {
      const details = await loadOrderDetails(orderNumber);
      if (!details.length) {
        tbody.innerHTML = '<tr><td colspan="6">查無對應明細</td></tr>';
        return;
      }
      const rows = details.map(d => {
        const unit = isFinite(d.unit_price) ? d.unit_price.toFixed(2) : "0.00";
        const sub = isFinite(d.subtotal) ? d.subtotal.toFixed(2) : "0.00";
        return `
          <tr>
            <td>${escapeHtml(d.product_id)}</td>
            <td>${escapeHtml(d.product_name)}</td>
            <td>${escapeHtml(d.store_name)}</td>
            <td>NT$ ${unit}</td>
            <td>${d.quantity}</td>
            <td>NT$ ${sub}</td>
          </tr>
        `;
      }).join("");
      tbody.innerHTML = rows;
    } catch (err) {
      console.error("載入訂單明細失敗", err);
      tbody.innerHTML = '<tr><td colspan="6">明細載入失敗</td></tr>';
    }
  }
  async function loadOrderDetails(orderNumber) {
    const sql = await fetchText(ORDER_DETAILS_SQL_PATH);
    const insertLine = sql.split(/\r?\n/).find(l => /INSERT INTO `orderdetails` VALUES/i.test(l));
    if (!insertLine) return [];
    const valuesPart = insertLine.replace(/.*VALUES\s*/i, "").replace(/;\s*$/, "");
    const rows = splitSqlTuples(valuesPart);
    const details = [];
    // 允許字串內含跳脫的單引號（以兩個單引號表示）
    const strGroup = "((?:''|[^'])*)";
    const re = new RegExp(
      `^\\(?\\s*(\\d+)\\s*,\\s*'([^']+)'\\s*,\\s*'([^']+)'\\s*,\\s*'${strGroup}'\\s*,\\s*'${strGroup}'\\s*,\\s*([0-9.]+)\\s*,\\s*(\\d+)\\s*,\\s*([0-9.]+)\\s*\\)?$`
    );
    for (const r of rows) {
      const m = r.match(re);
      if (!m) continue;
      const row = {
        id: Number(m[1]),
        order_id: m[2],
        product_id: m[3],
        product_name: (m[4] || "").replace(/''/g, "'"),
        store_name: (m[5] || "").replace(/''/g, "'"),
        unit_price: Number(m[6]),
        quantity: Number(m[7]),
        subtotal: Number(m[8])
      };
      if (row.order_id === orderNumber) details.push(row);
    }
    return details;
  }
  async function fetchText(path) {
    const res = await fetch(path, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status} 讀取失敗: ${path}`);
    // 依預設 UTF-8 解析
    return res.text();
  }
  // 將 VALUES (...) , (...) 切成每列字串，避免字串內的逗號干擾
  function splitSqlTuples(valuesPart) {
    // 以 '),(' 分割，並去除收頭收尾括號
    const trimmed = valuesPart.trim().replace(/^\(/, "").replace(/\)$/, "");
    return trimmed.split(/\)\s*,\s*\(/);
  }
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  function escapeAttr(s) {
    return String(s).replace(/"/g, "&quot;");
  }
  function formatDateTime(s) {
    // s 形如 '2025-10-03 16:12:38'
    if (!s) return "";
    const d = new Date(s.replace(/-/g, "/"));
    if (isNaN(d.getTime())) return s;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${y}/${m}/${day} ${hh}:${mm}:${ss}`;
  }
  // -------- Range filter UI + API ---------
  document.addEventListener("DOMContentLoaded", () => {
    injectOrderFilterBar();
    setupOrderFilters();
  });
  function injectOrderFilterBar() {
    const ordersSection = document.querySelector('#orders');
    const table = ordersSection ? ordersSection.querySelector('table') : null;
    if (!ordersSection || !table) return;
    if (document.getElementById('order-filter-bar')) return;
    const bar = document.createElement('div');
    bar.id = 'order-filter-bar';
    bar.style.display = 'flex';
    bar.style.gap = '8px';
    bar.style.alignItems = 'center';
    bar.style.margin = '8px 0 12px';
    bar.style.flexWrap = 'wrap';
    bar.innerHTML = `
      <label for="order-filter-start">訂單時間範圍</label>
      <input id="order-filter-start" type="datetime-local" />
      <span>至</span>
      <input id="order-filter-end" type="datetime-local" />
      <button id="order-filter-btn" class="btn">篩選</button>
      <button id="order-filter-reset" class="btn" style="background:#f0f0f0;">清除</button>
      <span id="order-filter-hint" style="color:#888;font-size:12px;"></span>
    `;
    ordersSection.insertBefore(bar, table);
  }
  function setupOrderFilters() {
    const btn = document.getElementById('order-filter-btn');
    const reset = document.getElementById('order-filter-reset');
    const hint = document.getElementById('order-filter-hint');
    const startEl = document.getElementById('order-filter-start');
    const endEl = document.getElementById('order-filter-end');
    if (!btn || !reset || !startEl || !endEl) return;
    const doFilter = async () => {
      const startVal = (startEl.value || '').trim();
      const endVal = (endEl.value || '').trim();
      if (hint) hint.textContent = '';
      if (!startVal || !endVal) {
        if (hint) hint.textContent = '請選擇起訖時間';
        return;
      }
      const start = toApiDateTime(startVal);
      const end = toApiDateTime(endVal);
      if (!start || !end) {
        if (hint) hint.textContent = '時間格式不正確';
        return;
      }
      try {
        btn.disabled = true;
        btn.textContent = '查詢中…';
        const orders = await fetchOrdersByRange(start, end);
        renderOrders(orders);
        if (hint) hint.textContent = `已套用篩選 (${start} ~ ${end})`;
      } catch (e) {
        console.error('filter error', e);
        if (hint) hint.textContent = '查詢失敗，請稍後再試';
      } finally {
        btn.disabled = false;
        btn.textContent = '篩選';
      }
    };
    btn.addEventListener('click', doFilter);
    [startEl, endEl].forEach(el => el.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') doFilter();
    }));
    reset.addEventListener('click', async () => {
      startEl.value = '';
      endEl.value = '';
      if (hint) hint.textContent = '';
      try {
        const orders = await loadOrders();
        renderOrders(orders);
      } catch (_) {}
    });
  }
  function toApiDateTime(localVal) {
    // input type=datetime-local gives YYYY-MM-DDTHH:MM (without seconds)
    if (!localVal) return '';
    return /T\d{2}:\d{2}$/.test(localVal) ? `${localVal}:00` : localVal;
  }
  async function fetchOrdersByRange(start, end) {
    const url = `http://127.0.0.1:8080/easybuyfarm/orders/range?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' }, cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return (Array.isArray(data) ? data : []).map(o => ({
      id: o.id ?? o.ID ?? undefined,
      order_number: o.order_number ?? o.orderNumber ?? o.order_no ?? '',
      customer_id: o.customer_id ?? o.customerId ?? o.member_id ?? '',
      order_date: o.order_date ?? o.orderDate ?? o.created_at ?? '',
      total_amount: Number(o.total_amount ?? o.totalAmount ?? o.amount ?? 0),
      payment_method: o.payment_method ?? o.paymentMethod ?? ''
    })).sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime());
  }
  // Override formatter to support ISO strings too
  function formatDateTime(s) {
    if (!s) return "";
    let d = new Date(s);
    if (isNaN(d.getTime())) {
      d = new Date(String(s).replace(/-/g, "/").replace('T', ' '));
    }
    if (isNaN(d.getTime())) return String(s);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${y}/${m}/${day} ${hh}:${mm}:${ss}`;
  }
})();
