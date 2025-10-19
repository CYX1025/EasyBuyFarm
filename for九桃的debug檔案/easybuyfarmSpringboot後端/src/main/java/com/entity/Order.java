package com.entity;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", length = 50, nullable = false, unique = true)
    private String orderNumber;

    @Column(name = "order_date", nullable = false)
    private LocalDateTime orderDate;

    @Column(name = "total_amount", columnDefinition = "DECIMAL(10,2)", nullable = false)
    private Double totalAmount;

    @Column(name = "payment_method", length = 30, nullable = false)
    private String paymentMethod;

    @ManyToOne(optional = false)
    @JoinColumn(name = "customer_id", referencedColumnName = "member_id", nullable = false)
    @JsonIgnore    // ✅ 不輸出會員欄位，只保留 orders 自己的欄位
    private Member memberToOrder;

    @OneToMany(mappedBy = "orderId", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore 
    private List<OrderDetail> takeOrderDetail;
}
