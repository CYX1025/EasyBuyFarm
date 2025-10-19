package com.controller;

import com.entity.Order;
import com.entity.OrderDetail;
import com.service.OrderDetailService;
import com.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

/**
 * OrderController
 * - 只回傳 orders 表欄位：id, orderNumber, orderDate, totalAmount, paymentMethod
 */
@CrossOrigin
@RestController
@RequestMapping("/easybuyfarm/orders")
public class OrderController {

    @Autowired
    private OrderService orderservice;

    @Autowired
    private OrderDetailService detailService;

    // ---------- 工具：只回傳 orders 欄位 ----------
    private Map<String, Object> toOrderBody(Order o) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("id", o.getId());
        body.put("orderNumber", o.getOrderNumber());
        if (o.getMemberToOrder() != null) {
            body.put("customer_id", o.getMemberToOrder().getMemberId());
        }
        body.put("orderDate", o.getOrderDate());
        body.put("totalAmount", o.getTotalAmount());
        body.put("paymentMethod", o.getPaymentMethod());
        return body;
    }

    private List<Map<String, Object>> toOrderBodyList(List<Order> list) {
        List<Map<String, Object>> out = new ArrayList<>(list.size());
        for (Order o : list) out.add(toOrderBody(o));
        return out;
    }

    // ---------- 新增訂單（不含明細） ----------
    @PostMapping("/add")
    public ResponseEntity<?> addOrder(
            @RequestParam("memberId") String memberId,
            @RequestParam(value = "orderDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime orderDate,
            @RequestParam("paymentMethod") String paymentMethod,
            @RequestParam(value = "totalAmount", required = false) Double totalAmount
    ) {
        try {
            Order order = new Order();
            order.setOrderDate(orderDate);
            order.setPaymentMethod(paymentMethod);
            order.setTotalAmount(totalAmount);
            Order created = orderservice.addOrderWithDetails(memberId, order, null);
            return ResponseEntity.status(HttpStatus.CREATED).body(toOrderBody(created));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("新增訂單失敗");
        }
    }

    // ---------- 新增訂單（含多筆明細） ----------
    @PostMapping(value = "/add-with-details", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> addWithDetails(@RequestBody CreateOrderWithDetails req) {
        try {
            Order order = new Order();
            order.setOrderDate(req.orderDate);
            order.setPaymentMethod(req.paymentMethod);
            order.setTotalAmount(req.totalAmount);
            Order created = orderservice.addOrderWithDetails(req.memberId, order, req.details);
            return ResponseEntity.status(HttpStatus.CREATED).body(toOrderBody(created));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getClass().getName(), "message", e.getMessage()));
        }
    }

    // ---------- 查詢全部 ----------
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAll() {
        return ResponseEntity.ok(toOrderBodyList(orderservice.getAllOrders()));
    }

    // ---------- 查單筆 ----------
    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Long id) {
        Order o = orderservice.findById(id);
        return (o != null)
                ? ResponseEntity.ok(toOrderBody(o))
                : ResponseEntity.status(HttpStatus.NOT_FOUND).body("找不到該訂單 id：" + id);
    }

    // ---------- 查會員訂單 ----------
    @GetMapping("/member/{memberId}")
    public ResponseEntity<List<Map<String, Object>>> getOrdersByMemberID(@PathVariable String memberId) {
        return ResponseEntity.ok(toOrderBodyList(orderservice.findByMemberId(memberId)));
    }

    // ---------- 關鍵字搜尋 ----------
    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> searchOrders(@RequestParam String kw) {
        return ResponseEntity.ok(toOrderBodyList(orderservice.findByKeyword(kw)));
    }

    // ---------- 時間區間查詢 ----------
    @GetMapping("/range")
    public ResponseEntity<List<Map<String, Object>>> range(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        return ResponseEntity.ok(toOrderBodyList(orderservice.findByDateRange(start, end)));
    }

    // ---------- 更新訂單 ----------
    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateOrder(
            @PathVariable Long id,
            @RequestParam(value = "orderDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime orderDate,
            @RequestParam(value = "paymentMethod", required = false) String paymentMethod,
            @RequestParam(value = "totalAmount", required = false) Double totalAmount
    ) {
        Order updated = orderservice.updateOrder(id, orderDate, paymentMethod, totalAmount);
        return (updated != null)
                ? ResponseEntity.ok(toOrderBody(updated))
                : ResponseEntity.status(HttpStatus.NOT_FOUND).body("找不到該訂單 id：" + id);
    }

    // ---------- 刪除訂單 ----------
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id) {
        boolean deleted = orderservice.deleteOrder(id);
        return deleted
                ? ResponseEntity.ok("訂單刪除成功")
                : ResponseEntity.status(HttpStatus.NOT_FOUND).body("找不到該訂單 id：" + id);
    }

    // ---------- 重算訂單金額 ----------
    @PostMapping("/recalc/{orderNumber}")
    public ResponseEntity<?> recalc(@PathVariable String orderNumber) {
        Double total = orderservice.recalcTotal(orderNumber);
        return (total != null)
                ? ResponseEntity.ok(total)
                : ResponseEntity.status(HttpStatus.NOT_FOUND).body("找不到訂單號：" + orderNumber);
    }

    // ---------- JSON 請求模型 ----------
    public static class CreateOrderWithDetails {
        public String memberId;
        public LocalDateTime orderDate;
        public String paymentMethod;
        public Double totalAmount;
        public List<OrderDetail> details;
    }
}
