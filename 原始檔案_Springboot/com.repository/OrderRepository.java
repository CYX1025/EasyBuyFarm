package com.repository;

import com.service.*;

import com.entity.Order;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    /** 以訂單號查單筆 **/
    Optional<Order> findByOrderNumber(String orderNumber);

    /** 訂單號是否存在 **/
    boolean existsByOrderNumber(String orderNumber);

    /** 依會員 ID 查訂單 **/
    List<Order> findByMemberToOrder_MemberId(String memberId);

    /** 依時間區間查詢 **/
    List<Order> findByOrderDateBetween(LocalDateTime start, LocalDateTime end);

    /** 模糊搜尋（訂單號 / 付款方式） **/
    @Query("SELECT o FROM Order o WHERE o.orderNumber LIKE %:kw% OR o.paymentMethod LIKE %:kw%")
    List<Order> searchByKeyword(@Param("kw") String kw);

    /** 查當日最大編號（用於生成 ORD-YYYYMMDD-xxxxx） **/
    @Query("SELECT MAX(o.orderNumber) FROM Order o WHERE o.orderNumber LIKE CONCAT(:prefix, '%')")
    String findMaxOrderCodeForDate(@Param("prefix") String prefix);
}
