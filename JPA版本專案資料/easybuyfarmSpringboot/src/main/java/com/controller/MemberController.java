package com.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.entity.Member;
import com.service.MemberService;
import com.util.JwtUtility;

@CrossOrigin // 前後端分離跨境請求狀況處理
@RestController
@RequestMapping("/easybuyfarm/members")
public class MemberController {
	
	// 輔助方法：從 Authorization header 抽取 Token
    private String extractToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
    
    
	@Autowired
	MemberService membersrv;

	@GetMapping
	public List<Member> getAll() {
		return membersrv.getAllMembers();
	}

	/** 註冊為買家**/
	@PostMapping("/register")
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
	public ResponseEntity<String> addMemberCheck(@RequestBody Map<String, String> userInfo) {
		
	    Member phoneIsAdd = membersrv.findMemberByMemberPhone(userInfo.get("phone"));
	    Member emailIsAdd = membersrv.findMemberByMemberEmail(userInfo.get("email"));

	    if (phoneIsAdd != null && emailIsAdd != null) {
	        return ResponseEntity.status(HttpStatus.CONFLICT).body("此手機和此信箱已註冊");
	    } else if (phoneIsAdd != null) {
	        return ResponseEntity.status(HttpStatus.CONFLICT).body("此手機號碼已註冊");
	    } else if (emailIsAdd != null) {
	        return ResponseEntity.status(HttpStatus.CONFLICT).body("此信箱已註冊");
	    } else {
	        return ResponseEntity.ok("可以註冊");
	    }
	}
	
	
	/** 登入，回傳 JWT Token **/
    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody Map<String, String> loginData) {
    	
    	String keyword = loginData.get("keyword");
    	String password = loginData.get("password");
        Member member = membersrv.login(keyword, password);
        if (member != null) {
        	String token = JwtUtility.generateToken(member.getMemberId());
        	return ResponseEntity.ok()
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                    .body(Map.of(
                        "token", token,
                        "member", member
                    ));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("登入失敗，帳號或密碼錯誤");
        }
    }
    
    
    /** 登出，JWT 無狀態，前端自行清除 Token **/
    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        return ResponseEntity.ok("登出成功，請前端清除 Token");
    }
    
    
    /** 取得當前會員資料，需帶 Authorization: Bearer token **/
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentMember(@RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("缺少 Token");
        }

        String memberId = JwtUtility.validateToken(token);
        if (memberId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token 無效或過期");
        }

        Member member = membersrv.findMemberByMemberId(memberId);
        if (member == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("會員不存在");
        }

        return ResponseEntity.ok(member);
    }

    /** 升級成賣家，需帶 Token **/
    @PutMapping("/upgradeSeller")
    public ResponseEntity<?> upgradeToSeller(@RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("缺少 Token");
        }

        String memberId = JwtUtility.validateToken(token);
        if (memberId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token 無效或過期");
        }

        boolean success = membersrv.upgradeToSeller(memberId);
        if (success) {
            return ResponseEntity.ok("已升級為賣家");
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("升級失敗");
        }
    }
    
    
    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteMember(@RequestHeader("Authorization") String authHeader) {
        String token = extractToken(authHeader);
        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("缺少 Token");
        }

        String memberId = JwtUtility.validateToken(token);
        if (memberId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token 無效或過期");
        }

        boolean success = membersrv.deleteMember(memberId);
        if (success) {
            return ResponseEntity.ok("會員刪除成功");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("會員不存在或刪除失敗");
        }
    }

    
    
    
    
    
    
    
    
    
    
    
    
    

}
