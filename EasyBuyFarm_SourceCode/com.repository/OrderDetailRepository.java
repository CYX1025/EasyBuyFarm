package com.repository;

import com.service.*;

import com.entity.OrderDetail;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {

    /** 依訂單號取所有明細（orderdetails.order_id → orders.order_number） */
    List<OrderDetail> findByOrderId_OrderNumber(String orderNumber);

    /** 是否存在某張訂單的任何明細 */
    boolean existsByOrderId_OrderNumber(String orderNumber);

    /** 刪除某張訂單的所有明細（回傳刪除筆數） */
    long deleteByOrderId_OrderNumber(String orderNumber);

    /** 統計：某張訂單所有明細小計加總（總金額） */
    @Query("SELECT COALESCE(SUM(d.subtotal), 0) FROM OrderDetail d WHERE d.orderId.orderNumber = :orderNumber")
    Double sumSubtotalByOrderNumber(@Param("orderNumber") String orderNumber);

    /** 統計：某張訂單的總數量（SUM(quantity)） */
    @Query("SELECT COALESCE(SUM(d.quantity), 0) FROM OrderDetail d WHERE d.orderId.orderNumber = :orderNumber")
    Long sumQuantityByOrderNumber(@Param("orderNumber") String orderNumber);

    /** 關鍵字搜尋（產品/商店）＋可選綁定特定訂單號（不分頁版本） */
    @Query("""
           SELECT d FROM OrderDetail d
           WHERE (:kw IS NULL OR :kw = '' 
                  OR d.productId   LIKE %:kw%
                  OR d.productName LIKE %:kw%
                  OR d.storeName   LIKE %:kw%)
             AND (:orderNumber IS NULL OR d.orderId.orderNumber = :orderNumber)
           """)
    List<OrderDetail> searchList(@Param("kw") String keyword,
                                 @Param("orderNumber") String orderNumber);
    /** 依訂單主鍵刪除所有明細 */
    @Transactional
    void deleteByOrderId_Id(Long orderId);
}
