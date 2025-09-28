package entity;

import java.io.Serializable;
import javax.persistence.*;
import java.util.Date;
import java.sql.Timestamp;


/**
 * The persistent class for the member database table.
 * 
 */
@Entity
@NamedQuery(name="Member.findAll", query="SELECT m FROM Member m")
public class Member implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	private int id;
	
	@Column(name="member_id")
	private String memberId;
	
	private String email;
	
	private String phone;
	
	private String password;

	private String address;

	@Temporal(TemporalType.DATE)
	private Date birthday;
	
	private String role;
	
	private boolean status;

	@Column(name="created_at")
	private Timestamp createdAt;

	
	/*
	 * Register
	 */
	public Member(String memberId, String email, String phone, String password) {
		super();
		this.memberId = memberId;
		this.email = email;
		this.phone = phone;
		this.password = password;
	}

	public Member(String keyword, String password) {
		super();
		this.email = keyword;
		
		this.password = password;
	}

	public Member() {
	}

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getAddress() {
		return this.address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public Date getBirthday() {
		return this.birthday;
	}

	public void setBirthday(Date birthday) {
		this.birthday = birthday;
	}

	public Timestamp getCreatedAt() {
		return this.createdAt;
	}

	public void setCreatedAt(Timestamp createdAt) {
		this.createdAt = createdAt;
	}

	public String getEmail() {
		return this.email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getMemberId() {
		return this.memberId;
	}

	public void setMemberId(String memberId) {
		this.memberId = memberId;
	}

	public String getPassword() {
		return this.password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getPhone() {
		return this.phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public String getRole() {
		return this.role;
	}

	public void setRole(String role) {
		this.role = role;
	}

	public boolean getStatus() {
		return this.status;
	}

	public void setStatus(boolean status) {
		this.status = status;
	}

}