package com.entity;

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
@Table(name = "store")
public class Store {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(nullable = false)
	Integer id;
	@Column(name = "store_id",length=10,nullable=false)
	String storeId;
	@Column(length=100,nullable=false)
	String name;
	@Column(length=255)
	String introduce;
	@Column(name="store_img",length=100)
	String storeImg;
	//getter、setter、toString

	
	
	@OneToMany(mappedBy = "storeId")
    @JsonManagedReference
    private List<Product> takeStore;
	@OneToMany(mappedBy = "storeToOrder")
    @JsonManagedReference
    private List<OrderDetail> orderdetailStore;
	
	@ManyToOne
	@JoinColumn(name = "member_id", referencedColumnName = "member_id")
	@JsonIgnoreProperties("takeStore")
	private Member memberToStore;
}
