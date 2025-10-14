package com.service;

import java.sql.Timestamp;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.entity.Member;
import com.entity.Role;
import com.util.AutoNumber;


@Service
@Transactional
public class MemberService {
	@Autowired
	MemberRepository memberdao;
	
	@Autowired
	AutoNumber auto;

	public boolean addMember(String phone, String email, String password) {
		try {
			Member member = new Member(phone, email, password);
			member.setMemberId(auto.generateMemberNo());
			member.setRole(Role.BUYER);
			member.setStatus(true);
			member.setCreatedAt(new Timestamp(System.currentTimeMillis()));
			memberdao.save(member);
			memberdao.flush();
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
		List<Member> takemember = this.getAllMembers();
		Member find = takemember.stream().filter(m -> m.getMemberId().equals(memberId)).findAny().orElse(null);
		if (find != null)
			return find;
		else
			return null;
	}

	public Member findMemberByMemberEmail(String email) {
		List<Member> takemember = this.getAllMembers();
		Member find = takemember.stream().filter(m -> m.getEmail().equals(email)).findAny().orElse(null);
		if (find != null)
			return find;
		else
			return null;
	}

	public Member findMemberByMemberPhone(String phone) {
		List<Member> takemember = this.getAllMembers();
		Member find = takemember.stream().filter(m -> m.getPhone().equals(phone)).findAny().orElse(null);
		if (find != null)
			return find;
		else
			return null;
	}

	public Member login(String keyword, String password) {
		return memberdao.findByKeywordAndPassword(keyword, password);
	}

	public boolean upgradeToSeller(String memberId) {
		try {
			Member member = this.findMemberByMemberId(memberId);
			if (member == null) {
				System.out.println("找不到會員：" + memberId);
				return false;
			} else {
				member.setRole(Role.SELLER);
				return true;
			}
		} catch (Exception e) {
			System.out.println("Upgrade Error: " + e.getMessage());
		}
		return false;
	}

	public Member updateMember(String memberId, Member updateMember) {
		Member existingMember = findMemberByMemberId(memberId);
		if (existingMember == null)
			return null;
		else {
			// 💡 修正邏輯：只更新 updateMember 中非 null 的欄位

			// 姓名
			if (updateMember.getFirstName() != null)
				existingMember.setFirstName(updateMember.getFirstName());

			if (updateMember.getLastName() != null)
				existingMember.setLastName(updateMember.getLastName());

			// 密碼 (通常前端只會在輸入新密碼時傳遞)
			// 額外檢查是否為空字串，避免前端誤傳 ""
			if (updateMember.getPassword() != null && !updateMember.getPassword().isEmpty())
				existingMember.setPassword(updateMember.getPassword());

			// 地址與生日
			if (updateMember.getAddress() != null)
				existingMember.setAddress(updateMember.getAddress());

			if (updateMember.getBirthday() != null)
				existingMember.setBirthday(updateMember.getBirthday());

			/*
			 * ⚠️ 警告：以下欄位（Role, Status）通常不應由使用者 API 更新。 若非必要，建議保持它們的原始邏輯或直接移除。
			 */
			if (updateMember.getRole() != null)
				existingMember.setRole(updateMember.getRole());

			if (updateMember.getStatus() != null)
				existingMember.setStatus(updateMember.getStatus());

			System.out.println("會員資料更新成功: " + memberId);
			// ⚠️ 警告：Phone/Email 也應獨立於此 API 之外，以確保資料驗證和唯一性。
			return existingMember;
		}
	}

	public boolean deleteMember(String memberId) {
		Member found = this.findMemberByMemberId(memberId);
		if (found == null) {
			System.out.println("找不到會員：" + memberId);
			return false;
		} else {
			try {
				memberdao.delete(found);
				System.out.println("會員已成功刪除：" + memberId);
				return true;
			} catch (Exception e) {
				System.out.println("deleteMember error: " + e.getMessage());
				return false;
			}
		}
	}
}
