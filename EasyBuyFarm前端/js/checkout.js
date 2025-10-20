// 結帳流程（購物車頁面）
(function(){
  function getLoggedInUser() {
    try {
      const str = localStorage.getItem('loggedInUser');
      return str ? JSON.parse(str) : null;
    } catch { return null; }
  }

  function computeCartTotal() {
    if (!window.cart) return 0;
    return window.cart.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 0), 0);
  }

  function renderCheckoutPreview() {
    const ul = document.getElementById('checkout-items');
    const totalEl = document.getElementById('checkout-total');
    if (!ul) return;
    ul.innerHTML = '';
    if (!Array.isArray(window.cart) || window.cart.length === 0) {
      ul.innerHTML = '<li>購物車內尚無商品</li>';
    } else {
      window.cart.forEach(it => {
        const li = document.createElement('li');
        const price = Number(it.price) || 0;
        const qty = Number(it.quantity) || 0;
        li.textContent = `${it.name} - NT$${price} x ${qty} = NT$${(price*qty).toFixed(2)}`;
        ul.appendChild(li);
      });
    }
    if (totalEl) totalEl.textContent = `合計: NT$${computeCartTotal().toFixed(2)}`;
  }

  async function placeOrder() {
    const user = getLoggedInUser();
    if (!user) {
      alert('請先登入');
      window.location.href = '/html/login/login.html';
      return;
    }
    if (!Array.isArray(window.cart) || window.cart.length === 0) {
      alert('購物車為空');
      return;
    }

    const payment = (document.querySelector('input[name="payment"]:checked')||{}).value || 'CASH';
    const total = computeCartTotal();

    const payload = {
      memberId: user.memberId,
      orderDate: new Date().toISOString(),
      paymentMethod: payment,
      totalAmount: Number(total.toFixed(2)),
      details: window.cart.map(it => ({
        productId: it.id,
        productName: it.name,
        unitPrice: Number(it.price) || 0,
        quantity: Number(it.quantity) || 0,
        subtotal: Number(((Number(it.price)||0) * (Number(it.quantity)||0)).toFixed(2)),
        storeName: it.storeName || ''
      }))
    };

    try {
      const res = await fetch('http://localhost:8080/easybuyfarm/orders/add-with-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const txt = await res.text().catch(()=> '');
        throw new Error(`下單失敗 (${res.status}) ${txt}`);
      }

      let data = {};
      try { data = await res.json(); } catch {}

      // 清空購物車並導向
      if (typeof clearCart === 'function') clearCart();
      else {
        window.cart = [];
        if (typeof saveCart === 'function') saveCart();
        if (typeof updateCartCount === 'function') updateCartCount();
      }

      const orderNumber = data.orderNumber || data.order_number || '';
      if (orderNumber) {
        window.location.href = `/html/order/detail.html?orderNumber=${encodeURIComponent(orderNumber)}`;
      } else {
        window.location.href = '/html/member/member.html#order';
      }
    } catch (err) {
      console.error('placeOrder error:', err);
      alert('下單失敗，請稍後再試');
    }
  }

  function startCheckout() {
    const user = getLoggedInUser();
    if (!user) {
      alert('請先登入');
      window.location.href = '/html/login/login.html';
      return;
    }
    if (!Array.isArray(window.cart) || window.cart.length === 0) {
      alert('購物車為空');
      return;
    }
    const sec = document.getElementById('checkout-section');
    if (!sec) return;
    renderCheckoutPreview();
    sec.style.display = '';
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) checkoutBtn.style.display = 'none';
  }

  function cancelCheckout() {
    const sec = document.getElementById('checkout-section');
    if (sec) sec.style.display = 'none';
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) checkoutBtn.style.display = '';
  }

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('checkout-btn');
    if (btn) btn.addEventListener('click', startCheckout);

    const confirmBtn = document.getElementById('confirm-order-btn');
    if (confirmBtn) confirmBtn.addEventListener('click', placeOrder);

    const cancelBtn = document.getElementById('cancel-checkout-btn');
    if (cancelBtn) cancelBtn.addEventListener('click', cancelCheckout);
  });
})();

