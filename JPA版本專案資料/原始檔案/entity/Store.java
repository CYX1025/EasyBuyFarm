package entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.NamedQuery;
import javax.persistence.Table;

@Entity
@Table(name="store")
@NamedQuery(name="Store.findAll", query="SELECT s FROM Store s")
public class Store {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;
	
	@Column(name="store_id")
	private String storeId;
	
	@Column(name="member_id")
	private String memberId;
	
	private String name;
	
	
	private String introduce;
	
	@Column(name="store_img")
	private String storeImg;

	public Store(String storeId, String memberId, String name, String introduce, String storeImg) {
		this.storeId = storeId;
		this.memberId = memberId;
		this.name = name;
		this.introduce = introduce;
		this.storeImg = storeImg;
	}

	public Store() {
		
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getStoreId() {
		return storeId;
	}

	public void setStoreId(String storeId) {
		this.storeId = storeId;
	}

	public String getMemberId() {
		return memberId;
	}

	public void setMemberId(String memberId) {
		this.memberId = memberId;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getIntroduce() {
		return introduce;
	}

	public void setIntroduce(String introduce) {
		this.introduce = introduce;
	}

	public String getStoreImg() {
		return storeImg;
	}

	public void setStoreImg(String storeImg) {
		this.storeImg = storeImg;
	}
}
