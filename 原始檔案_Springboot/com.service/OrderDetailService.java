package com.service;

import com.entity.Order;
import com.entity.OrderDetail;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderDetailService {

    @Autowired
    private OrderDetailRepository detailRepo;

    @Autowired
    private OrderRepository orderRepo;

    /** 新增單筆明細：會把明細綁到指定的 orderNumber */
    public OrderDetail addDetail(String orderNumber,
                                 String productId,
                                 String productName,
                                 String storeName,
                                 Double unitPrice,
                                 Integer quantity,
                                 Double subtotal) {

        Order order = orderRepo.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new IllegalArgumentException("找不到訂單號：" + orderNumber));

        OrderDetail d = new OrderDetail();
        d.setOrderId(order);
        d.setProductId(productId);
        d.setProductName(productName);
        d.setStoreName(storeName);
        d.setUnitPrice(unitPrice != null ? unitPrice : 0.0);
        d.setQuantity(quantity != null ? quantity : 0);
        d.setSubtotal(subtotal != null ? subtotal : 0.0);

        return detailRepo.save(d);
    }

    /** 取得全部明細 */
    public List<OrderDetail> getAll() {
        return detailRepo.findAll();
    }

    /** 依 id 取單筆 */
    public OrderDetail getOne(Long id) {
        return detailRepo.findById(id).orElse(null);
    }

    /** 依訂單號取所有明細 */
    public List<OrderDetail> listByOrderNumber(String orderNumber) {
        return detailRepo.findByOrderId_OrderNumber(orderNumber);
    }

    /** 關鍵字搜尋（產品/商店，可選綁指定訂單號；不分頁） */
    public List<OrderDetail> search(String kw, String orderNumber) {
        return detailRepo.searchList(kw, orderNumber);
    }

    /** 更新單筆明細（不改 orderNumber 綁定） */
    public OrderDetail update(Long id,
                              String productId,
                              String productName,
                              String storeName,
                              Double unitPrice,
                              Integer quantity,
                              Double subtotal) {
        OrderDetail db = detailRepo.findById(id).orElse(null);
        if (db == null) return null;

        if (productId != null)   db.setProductId(productId);
        if (productName != null) db.setProductName(productName);
        if (storeName != null)   db.setStoreName(storeName);
        if (unitPrice != null)   db.setUnitPrice(unitPrice);
        if (quantity != null)    db.setQuantity(quantity);
        if (subtotal != null)    db.setSubtotal(subtotal);

        return detailRepo.save(db);
    }

    /** 刪除單筆 */
    public boolean delete(Long id) {
        OrderDetail db = detailRepo.findById(id).orElse(null);
        if (db == null) return false;
        detailRepo.deleteById(id);
        return true;
    }

    /** 刪除某張訂單的所有明細，回傳刪除筆數 */
    public long deleteByOrderNumber(String orderNumber) {
        return detailRepo.deleteByOrderId_OrderNumber(orderNumber);
    }

    /** 統計：某張訂單總金額（SUM subtotal） */
    public Double sumSubtotal(String orderNumber) {
        return detailRepo.sumSubtotalByOrderNumber(orderNumber);
    }

    /** 統計：某張訂單總數量（SUM quantity） */
    public Long sumQuantity(String orderNumber) {
        return detailRepo.sumQuantityByOrderNumber(orderNumber);
    }
    public List<OrderDetail> addDetailsBatch(String orderNumber, List<OrderDetail> details) {
        Order order = orderRepo.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new IllegalArgumentException("找不到訂單號：" + orderNumber));
        if (details != null) {
            for (OrderDetail d : details) {
                d.setOrderId(order);
            }
        }
        return detailRepo.saveAll(details);
    }
}
