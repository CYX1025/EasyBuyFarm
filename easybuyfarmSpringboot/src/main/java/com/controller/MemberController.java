package com.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.entity.Member;
import com.entity.Role;
import com.service.MemberService;

import jakarta.servlet.http.HttpServletRequest;

@CrossOrigin // 前後端分離跨境請求狀況處理
@RestController
@RequestMapping("/members")
public class MemberController {
	@Autowired
	MemberService membersrv;
	
	@GetMapping
	public List<Member> getAll() {
		return membersrv.getAllMembers();
	}

	/** 註冊為買家，部分設定在Member的Constructor內部 **/
	@PostMapping
	public ResponseEntity<Member> addMember(@RequestBody Map<String,String> newUser) {
		boolean flag = membersrv.addMember(newUser.get("phone"),newUser.get("email"),newUser.get("password"));
		Member checkmember = membersrv.findMemberByMemberPhone(newUser.get("password"));
		if (flag)
			return ResponseEntity.status(HttpStatus.CREATED).body(checkmember);
		else
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
	}

	/** 註冊時判斷有沒有註冊過 **/
	@PostMapping("/addMemberCheck")
	public ResponseEntity<String> addMemberCheck(@RequestBody Map<String,String> newUser) {
		Member phoneIsAdd = membersrv.findMemberByMemberPhone(newUser.get("phone"));
		Member emailIsAdd = membersrv.findMemberByMemberEmail(newUser.get("email"));
		if (phoneIsAdd != null && emailIsAdd != null)
			return ResponseEntity.status(HttpStatus.CONFLICT).body("此手機和此信箱已註冊");
		else if (phoneIsAdd != null)
			return ResponseEntity.status(HttpStatus.CONFLICT).body("此手機號碼已註冊");
		else if (emailIsAdd != null)
			return ResponseEntity.status(HttpStatus.CONFLICT).body("此信箱已註冊");
		else
			return ResponseEntity.status(HttpStatus.OK).body("可以註冊");
	}

	/** 登入後，後端Member會傳入前端，設成Session資料 **/
	@PostMapping("/login")
	public ResponseEntity<?> login(HttpServletRequest request, @RequestParam String keyword,@RequestParam String password) {
		Member member = membersrv.login(keyword, password);
		if (member != null) {
			request.getSession(true).setAttribute("loginUser", member);
			return ResponseEntity.status(HttpStatus.OK).body(member);
		}
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("登入失敗，帳號或密碼錯誤");
	}

	/** 登出 **/
	@PostMapping("/logout")
	public ResponseEntity<?> logout(@RequestBody Member loginUser,HttpServletRequest request) {
		if (loginUser != null) {
			request.getSession(false).invalidate();// delete session使用者資訊
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("登出成功");
		}
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("您尚未登入");
	}

	/** 登入後，按升級成賣家 **/
	@PutMapping("/upgradeSeller")
	public ResponseEntity<?> upgradeToSeller(@RequestBody Member loginUser) {
		if (loginUser == null)
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("請先登入");

		boolean success = membersrv.upgradeToSeller(loginUser.getMemberId());
		if (success) {
			loginUser.setRole(Role.SELLER);
			return ResponseEntity.status(HttpStatus.OK).body("已升級為賣家");
		} else
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("升級失敗");
	}

	/** 使用者進基本資料去修改 **/
	@PutMapping("/updateMember")
	public ResponseEntity<?> updateMember(@RequestParam Member updateMember, HttpServletRequest request) {
		Member loginUser = (Member) request.getSession().getAttribute("loginUser");
		if (loginUser == null)
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("尚未登入，無法修改");
		String orginMemberId = loginUser.getMemberId();
		if (updateMember == null)
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid member data");

		Member refreshMember = membersrv.updateMember(orginMemberId, updateMember);
		if (refreshMember != null) {
			request.setAttribute("loginUser", refreshMember);
			return ResponseEntity.status(HttpStatus.OK).body(refreshMember);
		} else
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Member not found or update failed");
	}

	/** 使用者登入後可以自行刪除帳號 **/
	@DeleteMapping("/deleteMember")
	public ResponseEntity<?> deleteMember(@RequestBody Member loginUser) {
		if (loginUser == null)
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("{\"message\":\"尚未登入或 Session 過期\"}");
		else {
			try {
				boolean isdelete = membersrv.deleteMember(loginUser.getMemberId());
				if (isdelete)
					return ResponseEntity.status(HttpStatus.OK).body("{\"message\":\"會員刪除成功！\"}");
				else
					return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("{\"message\":\"刪除失敗，請稍後再試\"}");
			} catch (Exception e) {
				return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("{\"message\": \"伺服器錯誤，請稍後再試。\"}");
			}
		}
	}
}
