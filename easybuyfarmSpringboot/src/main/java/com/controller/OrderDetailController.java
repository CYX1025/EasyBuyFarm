package com.controller;

import com.entity.OrderDetail;
import com.service.OrderDetailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/easybuyfarm/orderdetails")
public class OrderDetailController {

    @Autowired
    private OrderDetailService detailService;

    /** 新增單筆明細（用 orderNumber 綁定） */
    @PostMapping("/add")
    public ResponseEntity<?> add(
            @RequestParam("orderNumber") String orderNumber,
            @RequestParam("productId") String productId,
            @RequestParam("productName") String productName,
            @RequestParam("storeName") String storeName,
            @RequestParam("unitPrice") Double unitPrice,
            @RequestParam("quantity") Integer quantity,
            @RequestParam("subtotal") Double subtotal
    ) {
        try {
            OrderDetail created = detailService.addDetail(orderNumber, productId, productName, storeName,
                    unitPrice, quantity, subtotal);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /** 取得全部明細 */
    @GetMapping({"", "/", "/all"})
    public List<OrderDetail> all() {
        return detailService.getAll();
    }

    /** 依 id 取單筆 */
    @GetMapping("/{id}")
    public ResponseEntity<OrderDetail> one(@PathVariable Long id) {
        OrderDetail d = detailService.getOne(id);
        return (d != null) ? ResponseEntity.ok(d) : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    /** 依訂單號取所有明細 */
    @GetMapping("/order/{orderNumber}")
    public List<OrderDetail> listByOrder(@PathVariable String orderNumber) {
        return detailService.listByOrderNumber(orderNumber);
    }

    /** 關鍵字搜尋（產品/商店）＋可選綁定某張訂單（不分頁） */
    @GetMapping("/search")
    public ResponseEntity<List<OrderDetail>> search(
            @RequestParam(value = "kw", required = false) String kw,
            @RequestParam(value = "orderNumber", required = false) String orderNumber
    ) {
        return ResponseEntity.ok(detailService.search(kw, orderNumber));
    }

    /** 更新單筆明細（不改 orderNumber 綁定） */
    @PutMapping("/update/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestParam(value = "productId", required = false) String productId,
            @RequestParam(value = "productName", required = false) String productName,
            @RequestParam(value = "storeName", required = false) String storeName,
            @RequestParam(value = "unitPrice", required = false) Double unitPrice,
            @RequestParam(value = "quantity", required = false) Integer quantity,
            @RequestParam(value = "subtotal", required = false) Double subtotal
    ) {
        OrderDetail updated = detailService.update(id, productId, productName, storeName, unitPrice, quantity, subtotal);
        return (updated != null) ? ResponseEntity.ok(updated)
                : ResponseEntity.status(HttpStatus.NOT_FOUND).body("找不到明細 id：" + id);
    }

    /** 刪除單筆明細 */
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        boolean ok = detailService.delete(id);
        return ok ? ResponseEntity.ok("明細刪除成功")
                  : ResponseEntity.status(HttpStatus.NOT_FOUND).body("找不到明細 id：" + id);
    }

    /** 刪除某張訂單的所有明細 */
    @DeleteMapping("/delete-by-order/{orderNumber}")
    public ResponseEntity<?> deleteByOrder(@PathVariable String orderNumber) {
        long n = detailService.deleteByOrderNumber(orderNumber);
        return ResponseEntity.ok("刪除筆數：" + n);
    }

    /** 統計：某張訂單的總金額（SUM subtotal） */
    @GetMapping("/sum/subtotal/{orderNumber}")
    public ResponseEntity<Double> sumSubtotal(@PathVariable String orderNumber) {
        return ResponseEntity.ok(detailService.sumSubtotal(orderNumber));
    }

    /** 統計：某張訂單的總數量（SUM quantity） */
    @GetMapping("/sum/quantity/{orderNumber}")
    public ResponseEntity<Long> sumQuantity(@PathVariable String orderNumber) {
        return ResponseEntity.ok(detailService.sumQuantity(orderNumber));
    }
}
