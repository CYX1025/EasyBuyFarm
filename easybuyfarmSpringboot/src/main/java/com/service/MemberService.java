package com.service;

import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.entity.Member;
import com.entity.Role;
import com.repository.MemberRepository;
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
	    Member member = findMemberByMemberId(memberId);  // 改這裡
	    if (member != null && member.getRole() != Role.SELLER) {
	        member.setRole(Role.SELLER);
	        memberdao.save(member);
	        return true;
	    }
	    return false;
	}
	
	
	// 更新會員資料
    public boolean updateMember(String memberId, Map<String, String> updatedData) {
        try {
            // 根據 memberId 查找會員
            Member member = memberdao.findByMemberId(memberId);
            if (member == null) {
                return false;  // 找不到會員
            }

            // 根據 updatedData 更新欄位
            if (updatedData.containsKey("firstName")) {
                member.setFirstName(updatedData.get("firstName"));
            }
            if (updatedData.containsKey("lastName")) {
                member.setLastName(updatedData.get("lastName"));
            }

            // 更新生日，需處理 String -> Date 的轉換
            if (updatedData.containsKey("birthday")) {
                String birthdayStr = updatedData.get("birthday");
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
                try {
                    member.setBirthday(sdf.parse(birthdayStr));  // 轉換 String 到 Date
                } catch (ParseException e) {
                    System.out.println("Invalid birthday format: " + birthdayStr);
                    return false;  // 如果生日格式不正確，返回更新失敗
                }
            }

            if (updatedData.containsKey("address")) {
                member.setAddress(updatedData.get("address"));
            }
            if (updatedData.containsKey("phone")) {
                member.setPhone(updatedData.get("phone"));
            }
            if (updatedData.containsKey("email")) {
                member.setEmail(updatedData.get("email"));
            }

            // 保存更新後的會員資料
            memberdao.save(member);
            return true;  // 更新成功
        } catch (Exception e) {
            System.out.println("Update Member Error: " + e.getMessage());
            return false;  // 發生錯誤，更新失敗
        }
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
