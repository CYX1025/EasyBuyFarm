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
		System.out.println(new MemberDAO().addMember("0987654321","zxc@fku.com","7788"));
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

	
	public Member login(String keyword, String password) {
		List<Member> members = getAllMembers();
		
		Member check = members.stream().
				filter(
						m-> (m.getEmail().equals(keyword) || m.getPhone().equals(keyword)) && 
							m.getPassword().equals(password)).findAny().orElse(null);
		return check;
		
	}
	
	public Member updateMember(String MemberId, Member updateMember) {
		Member existingMember = findMemberByMemberId(MemberId);
	    if (existingMember == null) {
	        return null; // 找不到會員
	    }
	    
	    try {
	        con.getTransaction().begin();

	        // 把要更新的欄位複製到 existingMember（你可以用 Setter）
	        existingMember.setPassword(updateMember.getPassword());
	        existingMember.setFirstName(updateMember.getFirstName());
	        existingMember.setLastName(updateMember.getLastName());
	        existingMember.setAddress(updateMember.getAddress());
	        existingMember.setBirthday(updateMember.getBirthday());
	        existingMember.setRole(updateMember.getRole());
	        existingMember.setStatus(updateMember.getStatus());

	        Member mergedMember = con.merge(existingMember);

	        con.getTransaction().commit();

	        return mergedMember;
	    } catch (Exception e) {
	        con.getTransaction().rollback();
	        System.out.println("Update Member error: " + e.getMessage());
	        return null;
	    }
	    
		/*
		Member m1 = findMemberByMemberId(MemberId);
		if(m1!=null) {
			try {
				con.getTransaction().begin();
				Member m2 = con.merge(member);
				con.getTransaction().commit();
				return m2;
			}catch(Exception e) {
				System.out.println("Update Member error"+e.getMessage());
				return null;
			}finally {
				con.close();
			}
		}else {
			con.close();
			return null;
		}*/
	}
	
	
}
