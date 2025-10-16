package com.entity;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "orderdetails")
public class OrderDetail {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(nullable = false,updatable=false)
	Integer id;
	@Column(name = "product_name", length = 100)
	String productName;
	Integer quantity;
	@Column(name="unit_price",columnDefinition = "DECIMAL(10,2)")
	Double unitPrice;
	@Column(columnDefinition = "DECIMAL(10,2)")
	Double subtotal;
	//getter、setter、toString

	
	@ManyToOne
	@JoinColumn(name = "order_id",nullable=false)
	@JsonIgnoreProperties("takeOrderDetail")
	private Order orderId;
	@ManyToOne
	@JoinColumn(name = "store_id",nullable=false)
	@JsonIgnoreProperties("orderdetailStore")
	private Store storeToOrder;
}
