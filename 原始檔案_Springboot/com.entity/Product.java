package com.entity;

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
@Table(name = "product")
public class Product {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(nullable = false)
	Integer id;
	@Column(name = "product_id",length=45)
	String productId;
	@Column(length=100)
	String name;
	@Column(columnDefinition="DECIMAL(10,2)")
	Integer price;
	@Column(length=45)
	String salequantity;
	@Column(length=45)
	String weight;
	@Column(length=225)
	String introduce;
	@Column(name="product_img",length=100)
	String productImg;
	//getter、setter、toString

	
	@ManyToOne
	@JoinColumn(name = "store_id",columnDefinition="VARCHAR(10)",referencedColumnName = "store_id")
	@JsonIgnoreProperties("takeStore")
	private Store storeId;
}
