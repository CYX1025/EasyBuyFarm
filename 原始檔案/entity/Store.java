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
	private String storeid;
	
	@Column(name="member_id")
	private String memberid;
	
	@Column(name="store_name")
	private String storename;
	
	@Column(name="store_inreoduce")
	private String storeinreoduce;
	
	@Column(name="store_img")
	private String storeimg;
	public Store(String storeid, String memberid, String storename, String storeinreoduce, String storeimg) {
		this.storeid = storeid;
		this.memberid = memberid;
		this.storename = storename;
		this.storeinreoduce = storeinreoduce;
		this.storeimg = storeimg;
	}
	public Store() {
		
	}
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
	public String getStoreid() {
		return storeid;
	}
	public void setStoreid(String storeid) {
		this.storeid = storeid;
	}
	public String getMemberid() {
		return memberid;
	}
	public void setMemberid(String memberid) {
		this.memberid = memberid;
	}
	public String getStorename() {
		return storename;
	}
	public void setStorename(String storename) {
		this.storename = storename;
	}
	public String getStoreinreoduce() {
		return storeinreoduce;
	}
	public void setStoreinreoduce(String storeinreoduce) {
		this.storeinreoduce = storeinreoduce;
	}
	public String getStoreimg() {
		return storeimg;
	}
	public void setStoreimg(String storeimg) {
		this.storeimg = storeimg;
	}
	
	

}
