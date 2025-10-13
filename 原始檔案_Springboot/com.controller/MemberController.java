package com.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.entity.Member;
import com.service.MemberService;

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

	/**註冊為買家，部分設定在Member的Constructor內部**/
	@PostMapping
	public ResponseEntity<Member> addMember(@RequestParam("phone") String phone,@RequestParam("email") String email , @RequestParam("password") String password){
		boolean flag=membersrv.addMember(phone, email, password);
		Member checkmember=membersrv.findMemberByMemberPhone(phone);
		if(flag) return ResponseEntity.status(HttpStatus.CREATED).body(checkmember);
		else return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
	}
	
	/**註冊時判斷有沒有註冊過**/
	@PostMapping("/addMemberCheck")
	public ResponseEntity<String> addMemberCheck(@RequestParam("phone") String phone,@RequestParam("email") String email , @RequestParam("password") String password) {
		Member phoneIsAdd=membersrv.findMemberByMemberPhone(phone);
		Member emailIsAdd=membersrv.findMemberByMemberEmail(email);
		if(phoneIsAdd!=null && emailIsAdd!=null) return ResponseEntity.status(HttpStatus.CONFLICT).body("此手機和此信箱已註冊");
		else if(phoneIsAdd!=null) return ResponseEntity.status(HttpStatus.CONFLICT).body("此手機號碼已註冊");
		else if(emailIsAdd!=null) return ResponseEntity.status(HttpStatus.CONFLICT).body("此信箱已註冊");
		else return ResponseEntity.status(HttpStatus.OK).body("可以註冊");
	}

	/**登入後，後端Member會傳入前端，設成Session資料**/
//	@PostMapping("/login")
//	public Response login(@FormParam("keyword") String keyword, @FormParam("password") String password, @Context HttpServletRequest request) {
		
//	}

}
