package com.entity;

import java.sql.Timestamp;
import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**The persistent class for the member database table.**/
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="member")
public class Member {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(nullable = false,updatable=false)
	Integer id;
	@Column(name = "member_id", length = 100, nullable = false, unique = true)
	String memberId;
	@Column(length=100,nullable = false)
	String email;
	@Column(length=20,nullable = false)
	String phone;
	@Column(length=255,nullable = false)
	String password;
	@Column(length=100)
	String firstName;
	@Column(length=100)
	String lastName;
	@Temporal(TemporalType.DATE)
	Date birthday;
	@Column(length=200)
	String address;
	@Enumerated(EnumType.STRING)
	Role role;
	Boolean status;
	@Column(name="created_at")
	Timestamp createdAt;
	//getter、setter、toString


	@OneToMany(mappedBy = "memberToOrder")
    @JsonManagedReference
    private List<Order> takeOrder;
	
	
	@OneToMany(mappedBy = "memberToStore")
    @JsonManagedReference
    private List<Store> takeStore;



	public Member(String phone, String email, String password) {
		super();
		this.email = email;
		this.phone = phone;
		this.password = password;
	}
	
	


}
