// === 訂單列表渲染 ===
const ORDERS_API = 'http://localhost:8080/easybuyfarm/orders';

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fmtDate(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fmtCurrency(n) {
  if (n == null || isNaN(n)) return 'NT$0.00';
  return 'NT$' + Number(n).toFixed(2);
}

const paymentMap = {
  CREDIT_CARD: '信用卡',
  CASH: '現金',
  BANK_TRANSFER: '銀行轉帳',
  LINE_PAY: 'LINE Pay',
  APPLE_PAY: 'Apple Pay',
  GOOGLE_PAY: 'Google Pay',
};

async function loadOrders() {
  const tbody = document.getElementById('orders-tbody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="6">載入中…</td></tr>`;

  try {
    const res = await fetch(ORDERS_API);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const me = getLoggedInUser();
    const data = await res.json();

    console.log("目前登入會員:", me);

    // 印出後端回傳的訂單資料
    console.log("API 回傳資料:", data);

    // 篩選出屬於登入會員的訂單
    const filtered = Array.isArray(data)
    ? data.filter(o => String(o.customer_id) === String(me.memberId))
    : [];

    // 印出篩選結果
    console.log("篩選條件:", "me.memberId =", me.memberId);
    console.log("篩選後的訂單數量:", filtered.length);
    console.log("篩選後的訂單內容:", filtered);

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7">目前沒有訂單</td></tr>`;
        return;
    }

    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6">目前沒有訂單</td></tr>`;
      return;
    }

    
    const rowsHtml = filtered.map(o => {
      const id = o.id ?? '';
      const orderNumber = escapeHtml(o.orderNumber ?? '');
      const customerId = escapeHtml(o.customer_id ?? '');
      const orderDate = fmtDate(o.orderDate);
      const paymentMethod = paymentMap[o.paymentMethod] || escapeHtml(o.paymentMethod || '');
      const totalAmount = fmtCurrency(o.totalAmount);

      return `
        <tr>
          <td>${id}</td>
          <td>${orderNumber}</td>
          <td>${customerId}</td>
          <td>${orderDate}</td>
          <td>${paymentMethod}</td>
          <td class="text-right">${totalAmount}</td>
          <td>
            <a href="/html/order/detail.html?orderNumber=${encodeURIComponent(o.orderNumber)}">
            訂單明細
            </a>
          </td>
        </tr>`;
    }).join('');

    tbody.innerHTML = rowsHtml;

  } catch (err) {
    console.error('載入訂單失敗:', err);
    tbody.innerHTML = `<tr><td colspan="6">載入失敗：${escapeHtml(err.message)}</td></tr>`;
  }
}

// 若此檔案已有 DOMContentLoaded 監聽器，可把 loadOrders() 放到既有監聽器中執行
document.addEventListener('DOMContentLoaded', () => {
  loadOrders();
});
