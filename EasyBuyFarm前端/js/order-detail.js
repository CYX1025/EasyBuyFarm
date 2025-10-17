const DETAIL_API_BASE = 'http://localhost:8080/easybuyfarm';
function q$(k){return document.querySelector(k);}
function escapeHtml(str=''){return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;')
  .replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
function fmtCurrency(n){ if(n==null||isNaN(n))return 'NT$0.00'; return 'NT$'+Number(n).toFixed(2); }

function getParam(name){
  const u=new URL(window.location.href);
  return u.searchParams.get(name);
}

async function loadOrderDetails(){
  const tbody = q$('#detail-tbody');
  const totalEl = q$('#detail-total');
  const metaEl  = q$('#order-meta');
  if(!tbody) return;

  const orderNumber = getParam('orderNumber');
  if(!orderNumber){
    tbody.innerHTML = `<tr><td colspan="6">缺少訂單編號</td></tr>`;
    return;
  }

  // 顯示訂單編號
  metaEl.innerHTML = `訂單編號：<strong>${escapeHtml(orderNumber)}</strong>`;

  // （可選）安全檢查：確認這張訂單屬於目前登入者
  try{
    const me = getLoggedInUser && getLoggedInUser();
    if(!me){ /* 未登入就放行顯示或導回登入頁，依需求 */ }

    // 取得此訂單的基本資料以比對 customer_id（你也可以直接略過這段）
    const ordersRes = await fetch(`${DETAIL_API_BASE}/orders`);
    if(ordersRes.ok){
      const all = await ordersRes.json();
      const theOrder = Array.isArray(all) ? all.find(o=>o.orderNumber === orderNumber) : null;
      if(theOrder && me && String(theOrder.customer_id) !== String(me.memberId)){
        tbody.innerHTML = `<tr><td colspan="6">你沒有權限檢視此訂單。</td></tr>`;
        return;
      }
    }
  }catch(_){/* 忽略檢查失敗，仍嘗試載入明細 */ }

  // 依訂單編號載入明細
  tbody.innerHTML = `<tr><td colspan="6">載入中…</td></tr>`;
  try{
    const res = await fetch(`${DETAIL_API_BASE}/orderdetails/order/${encodeURIComponent(orderNumber)}`);
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const list = await res.json();

    if(!Array.isArray(list) || list.length===0){
      tbody.innerHTML = `<tr><td colspan="6">此訂單沒有明細</td></tr>`;
      totalEl.textContent = 'NT$0.00';
      return;
    }

    let sum = 0;
    const rows = list.map(d=>{
      const unitPrice = Number(d.unitPrice || 0);
      const qty = Number(d.quantity || 0);
      const subtotal = Number(d.subtotal || unitPrice * qty);
      sum += subtotal;
      return `
        <tr>
          <td>${escapeHtml(d.productId)}</td>
          <td>${escapeHtml(d.productName)}</td>
          <td>${escapeHtml(d.storeName)}</td>
          <td class="text-right">${fmtCurrency(unitPrice)}</td>
          <td class="text-right">${qty}</td>
          <td class="text-right">${fmtCurrency(subtotal)}</td>
        </tr>`;
    }).join('');

    tbody.innerHTML = rows;
    totalEl.textContent = fmtCurrency(sum);
  }catch(err){
    console.error('載入訂單明細失敗:', err);
    tbody.innerHTML = `<tr><td colspan="6">載入失敗：${escapeHtml(err.message)}</td></tr>`;
  }
}

document.addEventListener('DOMContentLoaded', loadOrderDetails);
