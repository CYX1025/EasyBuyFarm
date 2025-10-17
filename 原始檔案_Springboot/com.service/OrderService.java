package com.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.entity.Member;
import com.entity.Order;
import com.entity.OrderDetail;


@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepo;

    @Autowired
    private OrderDetailRepository detailRepo;

    @Autowired
    private MemberService memberService;

    /** 自動生成訂單號：ORD-YYYYMMDD-xxxxx **/
    private String generateOrderNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE); // 20251015
        String prefix = "ORD-" + datePart + "-";

        String maxCode = orderRepo.findMaxOrderCodeForDate(prefix);
        int nextSeq = 1;
        if (maxCode != null) {
            try {
                String seqStr = maxCode.substring(maxCode.lastIndexOf('-') + 1);
                nextSeq = Integer.parseInt(seqStr) + 1;
            } catch (Exception e) {
                nextSeq = 1;
            }
        }
        return prefix + String.format("%05d", nextSeq);
    }

    /** 新增訂單＋明細（同交易） **/
    @Transactional
    public Order addOrderWithDetails(String memberId, Order order, List<OrderDetail> details) {
        Member member = memberService.findMemberByMemberId(memberId);
        if (member == null)
            throw new IllegalArgumentException("找不到對應的會員 ID：" + memberId);

        String orderNumber = generateOrderNumber();
        order.setOrderNumber(orderNumber);
        order.setMemberToOrder(member);

        double total = 0.0;
        Order saved = orderRepo.save(order);

        if (details != null) {
            for (OrderDetail d : details) {
                d.setOrderId(saved);
                detailRepo.save(d);
                total += (d.getSubtotal() != null ? d.getSubtotal() : 0.0);
            }
        }

        saved.setTotalAmount(total);
        return orderRepo.save(saved);
    }

    /** 查詢全部訂單 **/
    public List<Order> getAllOrders() {
        return orderRepo.findAll();
    }

    /** 查單筆 **/
    public Order findById(Long id) {
        return orderRepo.findById(id).orElse(null);
    }

    /** 查會員訂單 **/
    public List<Order> findByMemberId(String memberId) {
        return orderRepo.findByMemberToOrder_MemberId(memberId);
    }

    /** 模糊搜尋（訂單號或付款方式） **/
    public List<Order> findByKeyword(String kw) {
        return orderRepo.searchByKeyword(kw);
    }

    /** 時間區間查詢 **/
    public List<Order> findByDateRange(LocalDateTime start, LocalDateTime end) {
        return orderRepo.findByOrderDateBetween(start, end);
    }

    /** 重算總金額（依現有明細 subtotal 合計） **/
    @Transactional
    public Double recalcTotal(String orderNumber) {
        Order order = orderRepo.findByOrderNumber(orderNumber).orElse(null);
        if (order == null) return null;
        List<OrderDetail> details = detailRepo.findByOrderId_OrderNumber(orderNumber);
        double total = details.stream()
                .mapToDouble(d -> d.getSubtotal() == null ? 0.0 : d.getSubtotal())
                .sum();
        order.setTotalAmount(total);
        orderRepo.save(order);
        return total;
    }

    /** 更新訂單 **/
    public Order updateOrder(Long id, LocalDateTime date, String payment, Double total) {
        Order exist = orderRepo.findById(id).orElse(null);
        if (exist == null) return null;
        if (date != null) exist.setOrderDate(date);
        if (payment != null) exist.setPaymentMethod(payment);
        if (total != null) exist.setTotalAmount(total);
        return orderRepo.save(exist);
    }

    /** 刪除訂單（含明細） **/
    @Transactional
    public boolean deleteOrder(Long id) {
        if (!orderRepo.existsById(id)) return false;
        detailRepo.deleteByOrderId_Id(id); // 要在 OrderDetailRepository 補上對應方法
        orderRepo.deleteById(id);
        return true;
    }
}
