package com.service;

import java.sql.Timestamp;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.entity.Member;
import com.entity.Role;
import com.util.AutoNumber;

@Service
public class MemberService {
	@Autowired
	MemberRepository memberdao;
	
	@Autowired
    AutoNumber autoNumber;

	public boolean addMember(String phone, String email, String password) {
		try {		
			Member member = new Member(phone, email, password);
			member.setMemberId(autoNumber.generateMemberNo());
			member.setRole(Role.BUYER);
			member.setStatus(true);;
			member.setCreatedAt(new Timestamp(System.currentTimeMillis()));
			memberdao.save(member);
			System.out.println("新增成功："); // Debug 資訊
			System.out.println("正在儲存會員：phone=" + phone + ", email=" + email);
			return true;
		} catch (Exception e) {
			System.out.println("Add Member Error: " + e.getMessage());
			return false;
		}
	}

	public List<Member> getAllMembers() {
		return memberdao.findAll();
	}
	
	public Member findMemberByMemberId(String memberId) {
		List<Member> takemember=this.getAllMembers();
		Member find=takemember.stream().filter(m->m.getMemberId().equals(memberId)).findAny().orElse(null);
		if(find!=null) return find;
		else return null;
	}
	
	public Member findMemberByMemberEmail(String email) {
		List<Member> takemember=this.getAllMembers();
		Member find=takemember.stream().filter(m->m.getEmail().equals(email)).findAny().orElse(null);
		if(find!=null) return find;
		else return null;
	}
	
	public Member findMemberByMemberPhone(String phone) {
		List<Member> takemember=this.getAllMembers();
		Member find=takemember.stream().filter(m->m.getPhone().equals(phone)).findAny().orElse(null);
		if(find!=null) return find;
		else return null;
	}

	public Member login(String keyword, String password) {
		return memberdao.findByKeywordAndPassword(keyword, password);
	}
	
	public boolean upgradeToSeller(String memberId) {
	    Member member = findMemberByMemberId(memberId);  // 改這裡 👈
	    if (member != null && member.getRole() != Role.SELLER) {
	        member.setRole(Role.SELLER);
	        memberdao.save(member);
	        return true;
	    }
	    return false;
	}
	
	public boolean deleteMember(String memberId) {
	    try {
	    	List<Member> takemember=this.getAllMembers();
			Member find=takemember.stream().filter(m->m.getMemberId().equals(memberId)).findAny().orElse(null);
	        if (find != null) {
	            memberdao.delete(find);
	            return true;
	        } else {
	            return false;
	        }
	    } catch (Exception e) {
	        System.out.println("Delete Member Error: " + e.getMessage());
	        return false;
	    }
	}
	
	
}
