package com.entity;

import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="orders")
public class Order {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(nullable = false,updatable=false)
	Integer id;
	@Column(name="order_date",nullable = false)	
	Date orderDate;
	@Column(name="total_amount",columnDefinition="DECIMAL(10,2)",nullable = false)	
	Double totalAmount;
	@Column(name="payment_method",length=50,nullable = false)	
	String paymentMethod;
	//getter、setter、toString

	@ManyToOne
	@JoinColumn(name = "member_id",nullable=false)
	@JsonIgnoreProperties("takeOrder")
	private Member memberToOrder;
	
	@OneToMany(mappedBy = "orderId")
    @JsonManagedReference
    private List<OrderDetail> takeOrderDetail;
}
