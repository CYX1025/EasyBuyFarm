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

	public boolean addMember(String phone, String email, String password) {
		try {
			Member member = new Member(phone, email, password);
			member.setMemberId(AutoNumber.generateMemberNo());
			member.setRole(Role.BUYER);
			member.setStatus(true);;
			member.setCreatedAt(new Timestamp(System.currentTimeMillis()));
			memberdao.save(member);
			System.out.println("新增成功："); // Debug 資訊
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
		Member find=takemember.stream().filter(m->m.getMemberId().equals(memberId)).findAny().get();
		if(find!=null) return find;
		else return null;
	}
	
	public Member findMemberByMemberEmail(String email) {
		List<Member> takemember=this.getAllMembers();
		Member find=takemember.stream().filter(m->m.getEmail().equals(email)).findAny().get();
		if(find!=null) return find;
		else return null;
	}
	
	public Member findMemberByMemberPhone(String phone) {
		List<Member> takemember=this.getAllMembers();
		Member find=takemember.stream().filter(m->m.getPhone().equals(phone)).findAny().get();
		if(find!=null) return find;
		else return null;
	}

	public Member login(String keyword, String password) {
		return memberdao.findByKeywordAndPassword(keyword, password);
	}
}
