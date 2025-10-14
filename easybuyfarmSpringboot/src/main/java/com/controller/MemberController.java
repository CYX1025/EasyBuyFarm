package com.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.entity.JwtUtility;
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

	/** 註冊為買家，部分設定在Member的Constructor內部 **/
	@PostMapping
	public ResponseEntity<Member> addMember(@RequestBody Map<String,String> newUser) {
	    boolean flag = membersrv.addMember(newUser.get("phone"), newUser.get("email"), newUser.get("password"));
	    if (!flag) {
	        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
	    }

	    Member checkmember = membersrv.findMemberByMemberPhone(newUser.get("phone"));
	    if (checkmember == null) {
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	    }

	    return ResponseEntity.status(HttpStatus.CREATED).body(checkmember);
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
	
	
	// 登入
    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestParam("keyword") String keyword, @RequestParam("password") String password) {
        Member member = membersrv.login(keyword, password);
        if (member != null) {
        	String token = JwtUtility.generateToken(member.getMemberId());
        	return ResponseEntity.ok(token);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("登入失敗，帳號或密碼錯誤");
        }
    }

}
