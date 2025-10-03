package dao;

import entity.Order;
import entity.OrderDetail;
import util.DbConnection;

import javax.persistence.EntityManager;
import javax.persistence.EntityTransaction;
import javax.persistence.TypedQuery;
import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

public class OrderDAO {

	/**
	 * 產生唯一訂單編號 格式：ORD-YYYYMMDD-<timestamp> 例如：ORD-20251003-163247892
	 */
	private String generateOrderNumber() {
		String datePart = new SimpleDateFormat("yyyyMMdd").format(new Date());
		String timePart = String.valueOf(System.currentTimeMillis()).substring(5); // 取時間戳部分避免衝突
		return "ORD-" + datePart + "-" + timePart;
	}

	/**
	 * 建立訂單（orders）與明細（orderdetails） order_number 自動產生，並與明細 order_id 對應
	 */
	public Order createOrderWithDetails(Order order, List<OrderDetail> details) {
		EntityManager em = new DbConnection().createConnection();
		EntityTransaction tx = em.getTransaction();
		try {
			tx.begin();

			// 如果沒有設定 orderNumber，自動生成
			if (order.getOrderNumber() == null || order.getOrderNumber().isEmpty()) {
				order.setOrderNumber(generateOrderNumber());
			}

			// 綁定明細
			if (details != null) {
				for (OrderDetail d : details) {
					order.addOrderDetail(d); // 會自動 setOrder(this)
				}
			}

			em.persist(order); // cascade = ALL 會自動帶出明細
			tx.commit();

			return order;
		} catch (Exception e) {
			if (tx.isActive())
				tx.rollback();
			throw e;
		} finally {
			em.close();
		}
	}

	/** 查詢：依訂單編號 */
	public Order findByOrderNumber(String orderNumber) {
		EntityManager em = new DbConnection().createConnection();
		try {
			TypedQuery<Order> q = em.createQuery("SELECT o FROM Order o WHERE o.orderNumber = :no", Order.class);
			q.setParameter("no", orderNumber);
			return q.getResultStream().findFirst().orElse(null);
		} finally {
			em.close();
		}
	}

	/** 查詢：依主鍵 id */
	public Order findById(Long id) {
		EntityManager em = new DbConnection().createConnection();
		try {
			return em.find(Order.class, id);
		} finally {
			em.close();
		}
	}

	/*public static void main(String[] args) {
		OrderDAO dao = new OrderDAO();

		// 建立訂單主檔
		Order order = new Order();
		order.setCustomerId("CUST001");
		order.setOrderDate(new Date());
		order.setPaymentMethod("CREDIT_CARD");

		// 建立明細
		OrderDetail d1 = new OrderDetail();
		d1.setProductId("P001");
		d1.setProductName("新鮮番茄");
		d1.setStoreName("好水果賣場");
		d1.setUnitPrice(new BigDecimal("50.00"));
		d1.setQuantity(2);
		d1.setSubtotal(new BigDecimal("100.00"));

		OrderDetail d2 = new OrderDetail();
		d2.setProductId("P002");
		d2.setProductName("有機小黃瓜");
		d2.setStoreName("蔬菜賣場");
		d2.setUnitPrice(new BigDecimal("80.00"));
		d2.setQuantity(1);
		d2.setSubtotal(new BigDecimal("80.00"));

		order.setTotalAmount(d1.getSubtotal().add(d2.getSubtotal()));

		// 存檔
		dao.createOrderWithDetails(order, java.util.Arrays.asList(d1, d2));

		System.out.println("✅ 訂單建立成功，訂單號：" + order.getOrderNumber());
	}*/
}
