package com.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"orderId"}) // 防止循環遞迴
@Entity
@Table(name = "orderdetails")
public class OrderDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 關聯：orderdetails.order_id → orders.order_number */
    @ManyToOne(optional = false)
    @JoinColumn(name = "order_id", referencedColumnName = "order_number", nullable = false)
    @JsonBackReference
    @JsonIgnoreProperties("takeOrderDetail")
    private Order orderId;

    @Column(name = "order_id", insertable = false, updatable = false)
    private String orderIdValue;   // 👈 若 DB 是 BIGINT，改成 Long

    @Column(name = "product_id", length = 50, nullable = false)
    private String productId;

    @Column(name = "product_name", length = 255, nullable = false)
    private String productName;

    @Column(name = "store_name", length = 100, nullable = false)
    private String storeName;

    @Column(name = "unit_price", columnDefinition = "DECIMAL(10,2)", nullable = false)
    private Double unitPrice;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "subtotal", columnDefinition = "DECIMAL(10,2)", nullable = false)
    private Double subtotal;
}
