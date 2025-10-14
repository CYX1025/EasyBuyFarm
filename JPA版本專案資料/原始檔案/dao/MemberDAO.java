package dao;


import java.sql.Timestamp;
import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;

import entity.Member;
import util.AutoNumber;
import util.DbConnection;

public class MemberDAO {
	
	public static void main(String[] args) {
		//System.out.println(new MemberDAO().findMemberByMemberId("sn202509240001"));
		//System.out.println(new MemberDAO().addMember("0987654321","zxc@fku.com","7788"));
		//System.out.println(new MemberDAO().upgradeToSeller("sn202510010001"));
		//System.out.println(new MemberDAO().deleteMember("sn202510020001"));
		//System.out.println(new MemberDAO().findMemberByMemberEmail("zxc@fku.com"));
		//System.out.println(new MemberDAO().findMemberByMemberPhone("0932165498"));
	}
	
	private static EntityManager con = new DbConnection().createConnection();
	
	public boolean addMember(String phone, String email, String password){
	    try {
	        con.getTransaction().begin();
	        String memberId = AutoNumber.generateMemberNo();
	        Member member = new Member(memberId, phone, email, password);
	        member.setRole("BUYER");
	        member.setStatus(true);
	        member.setCreatedAt(new Timestamp(System.currentTimeMillis()));
	        con.persist(member);
	        con.getTransaction().commit();
	        System.out.println("新增成功：" + member); // Debug 資訊
	        return true;
	    } catch(Exception e) {
	        System.out.println("Add Member Error: " + e.getMessage());
	        return false;
	    }
	}


	
	public List<Member> getAllMembers(){
		TypedQuery<Member> data = con.createNamedQuery("Member.findAll",Member.class);
		return data.getResultList();
	}
	
	
	
	public Member findMemberByMemberId(String memberId) {
	    TypedQuery<Member> query = con.createQuery(
	        "SELECT m FROM Member m WHERE m.memberId = :memberId", Member.class);
	    query.setParameter("memberId", memberId);
	    return query.getResultStream().findFirst().orElse(null);
	}
	
	public Member findMemberByMemberEmail(String email) {
		TypedQuery<Member> query = con.createQuery("SELECT m FROM Member m WHERE m.email = :email",Member.class);
		query.setParameter("email", email);
		return query.getResultStream().findFirst().orElse(null);
	}
	
	public Member findMemberByMemberPhone(String phone) {
		TypedQuery<Member> query = con.createQuery("SELECT m FROM Member m WHERE m.phone = :phone",Member.class);
		query.setParameter("phone", phone);
		return query.getResultStream().findFirst().orElse(null);
	}

	
	public Member login(String keyword, String password) {
		TypedQuery<Member> query = con.createQuery(
		        "SELECT m FROM Member m WHERE (m.email = :keyword OR m.phone = :keyword) AND m.password = :password", Member.class);
		    query.setParameter("keyword", keyword);
		    query.setParameter("password", password);
		    return query.getResultStream().findFirst().orElse(null);
		
	}
	
	
	public boolean upgradeToSeller(String memberId) {
	    try {
	        con.getTransaction().begin();

	        Member member = con.createQuery(
	                "SELECT m FROM Member m WHERE m.memberId = :memberId", Member.class)
	                .setParameter("memberId", memberId)
	                .getSingleResult();

	        if (member == null) {
	            System.out.println("找不到會員：" + memberId);
	            con.getTransaction().rollback();
	            return false;
	        }

	        member.setRole("SELLER");
	        con.merge(member);

	        con.getTransaction().commit();
	        System.out.println("會員已升級為 SELLER：" + memberId);
	        return true;

	    } catch (Exception e) {
	        System.out.println("Upgrade Error: " + e.getMessage());
	        //try {
	            con.getTransaction().rollback();
	        //} catch(Exception ex) {
	        	//System.out.println(ex.getMessage());
	        //}
	        return false;
	    }
	}

	
	public Member updateMember(String MemberId, Member updateMember) {
	    Member existingMember = findMemberByMemberId(MemberId);
	    if (existingMember == null) {
	        return null; // 找不到會員
	    } else {
	        try {
	            con.getTransaction().begin();

	            // 💡 修正邏輯：只更新 updateMember 中非 null 的欄位
	            
	            // 姓名
	            if (updateMember.getFirstName() != null) {
	                existingMember.setFirstName(updateMember.getFirstName());
	            }
	            if (updateMember.getLastName() != null) {
	                existingMember.setLastName(updateMember.getLastName());
	            }
	            
	            // 密碼 (通常前端只會在輸入新密碼時傳遞)
	            // 額外檢查是否為空字串，避免前端誤傳 ""
	            if (updateMember.getPassword() != null && !updateMember.getPassword().isEmpty()) {
	                existingMember.setPassword(updateMember.getPassword());
	            }
	            
	            // 地址與生日
	            if (updateMember.getAddress() != null) {
	                existingMember.setAddress(updateMember.getAddress());
	            }
	            if (updateMember.getBirthday() != null) {
	                existingMember.setBirthday(updateMember.getBirthday());
	            }
	            
	            /*
	             * ⚠️ 警告：以下欄位（Role, Status）通常不應由使用者 API 更新。
	             * 若非必要，建議保持它們的原始邏輯或直接移除。
	             */
	            if (updateMember.getRole() != null) {
	                existingMember.setRole(updateMember.getRole());
	            }
	            if (updateMember.getStatus() != null) {
	                existingMember.setStatus(updateMember.getStatus());
	            }
	            
	            // ⚠️ 警告：Phone/Email 也應獨立於此 API 之外，以確保資料驗證和唯一性。
	            
	            
	            Member mergedMember = con.merge(existingMember);

	            con.getTransaction().commit();
	            System.out.println("會員資料更新成功: " + MemberId);
	            return mergedMember;
	        } catch (Exception e) {
	            con.getTransaction().rollback();
	            // 將錯誤訊息輸出到伺服器日誌
	            System.err.println("Update Member error: " + e.getMessage());
	            e.printStackTrace(); // 打印完整堆棧追蹤，方便除錯
	            return null;
	        }
	    }
	}
	
	
	
	public boolean deleteMember(String memberId) {
		Member found = findMemberByMemberId(memberId);
		boolean isdelete = false;
		if(found ==null) {
			System.out.println("找不到會員：" + memberId);
			return isdelete;
		}else {
			try {
				con.getTransaction().begin();
				con.remove(found);
				con.getTransaction().commit();
				System.out.println("會員已成功刪除：" + memberId);
				return isdelete = true;
				 
			}catch(Exception e) {
				System.out.println("deleteMember error: "+e.getMessage());
				con.getTransaction().rollback();
				isdelete = false;
	            return isdelete;
			}
		}
		
	}
	
	
}
