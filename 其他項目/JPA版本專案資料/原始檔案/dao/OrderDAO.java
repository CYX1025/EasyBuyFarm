package dao;

import entity.Order;
import entity.OrderDetail;
import util.DbConnection;

import javax.persistence.EntityManager;
import javax.persistence.EntityTransaction;
import javax.persistence.TypedQuery;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * OrderDAO
 * - 建立訂單 + 明細（使用 Order.addOrderDetail 綁雙向關聯）
 * - 依日期範圍查詢（半開區間，不使用 DB 的 DATE()）
 * - 依訂單編號查主檔 / 主+明細 / 明細
 * - 依主鍵查主檔
 */
public class OrderDAO {

    /* ======================== 建單 ======================== */

    /** 產生唯一訂單編號（可依需求更換格式） */
    private String generateOrderNumber() {
        String datePart = new SimpleDateFormat("yyyyMMdd").format(new Date());
        String ts = String.valueOf(System.currentTimeMillis()).substring(5); // 避免衝突
        return "ORD-" + datePart + "-" + ts;
    }

    /**
     * 建立訂單（orders）與多筆明細（orderdetails）
     * 關聯：OrderDetail.order → Order（JPA 綁定），實體層用 addOrderDetail()
     */
    public Order createOrderWithDetails(Order order, List<OrderDetail> details) {
        EntityManager em = new DbConnection().createConnection();
        EntityTransaction tx = em.getTransaction();
        try {
            tx.begin();

            if (order.getOrderNumber() == null || order.getOrderNumber().isEmpty()) {
                order.setOrderNumber(generateOrderNumber());
            }

            if (details != null) {
                for (OrderDetail d : details) {
                    order.addOrderDetail(d); // 雙向關聯（會 setOrder(this)）
                }
            }

            em.persist(order); // cascade = ALL 會一併存明細
            tx.commit();
            return order;

        } catch (Exception e) {
            if (tx.isActive()) tx.rollback();
            throw e;
        } finally {
            em.close();
        }
    }

    /* ======================== 查詢 ======================== */

    /**
     * 依日期區間查訂單（只比年月日；包含起迄日）
     * 使用半開區間： [start 00:00:00, end+1 00:00:00)
     * 參數格式：yyyy-MM-dd
     */
    public List<Order> findByDateRange(String startDateYmd, String endDateYmd) {
        EntityManager em = new DbConnection().createConnection();
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
            Date start = sdf.parse(startDateYmd);

            Calendar cal = Calendar.getInstance();
            cal.setTime(sdf.parse(endDateYmd));
            cal.add(Calendar.DAY_OF_MONTH, 1);
            Date endExclusive = cal.getTime();

            TypedQuery<Order> q = em.createQuery(
                "SELECT o FROM Order o " +
                "WHERE o.orderDate >= :start AND o.orderDate < :end " +
                "ORDER BY o.orderDate DESC",
                Order.class
            );
            q.setParameter("start", start);
            q.setParameter("end", endExclusive);

            return q.getResultList();
        } catch (Exception ex) {
            throw new RuntimeException("Date range parse/query failed: " + ex.getMessage(), ex);
        } finally {
            em.close();
        }
    }

    /** 依訂單編號查主檔（不帶明細） */
    public Order findByOrderNumber(String orderNumber) {
        EntityManager em = new DbConnection().createConnection();
        try {
            TypedQuery<Order> q = em.createQuery(
                "SELECT o FROM Order o WHERE o.orderNumber = :no", Order.class);
            q.setParameter("no", orderNumber);
            return q.getResultStream().findFirst().orElse(null);
        } finally {
            em.close();
        }
    }

    /** 依訂單編號查主檔 + 明細（JOIN FETCH） */
    public Order findWithDetailsByOrderNumber(String orderNumber) {
        EntityManager em = new DbConnection().createConnection();
        try {
            TypedQuery<Order> q = em.createQuery(
                "SELECT DISTINCT o FROM Order o " +
                "LEFT JOIN FETCH o.orderDetails od " +
                "WHERE o.orderNumber = :no",
                Order.class
            );
            q.setParameter("no", orderNumber);
            return q.getResultStream().findFirst().orElse(null);
        } finally {
            em.close();
        }
    }

    /** 只取某訂單的明細列表 */
    public List<OrderDetail> findDetailsByOrderNumber(String orderNumber) {
        EntityManager em = new DbConnection().createConnection();
        try {
            TypedQuery<OrderDetail> q = em.createQuery(
                "SELECT od FROM OrderDetail od " +
                "WHERE od.order.orderNumber = :no " +
                "ORDER BY od.id ASC",
                OrderDetail.class
            );
            q.setParameter("no", orderNumber);
            return q.getResultList();
        } finally {
            em.close();
        }
    }

    /** 依 DB 主鍵 id 查單（不含明細） */
    public Order findById(Long id) {
        EntityManager em = new DbConnection().createConnection();
        try {
            return em.find(Order.class, id);
        } finally {
            em.close();
        }
    }
}
