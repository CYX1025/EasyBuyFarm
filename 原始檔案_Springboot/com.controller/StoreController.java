package com.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.entity.Member;
import com.entity.Role;
import com.entity.Store;
import com.service.MemberService;
import com.service.StoreService;
import com.util.JwtUtility;

@CrossOrigin
@RestController
@RequestMapping("/easybuyfarm/stores")
public class StoreController {
	@Autowired
	StoreService storeservice;
	
	@Autowired
	MemberService memberservice;
	
	// 輔助方法：從 Authorization header 抽取 Token
    private String extractToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
	
	
	//新增商店
	@PostMapping("/add")
	public ResponseEntity<?> addStore(@RequestHeader("Authorization") String authHeader
			,@RequestParam("name") String name,
			@RequestParam("introduce") String introduce , 
			@RequestParam("store_img") MultipartFile storeImg)
	{
		try
		{
			// 1. 從 Header 取出 Token
			String token = extractToken(authHeader);
			if (token == null) 
			{
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("缺少 Token");
			}
	        
			String memberId = JwtUtility.validateToken(token);
			if (memberId == null) 
			{
				return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token 無效或過期");
			}
			
			Member member = memberservice.findMemberByMemberId(memberId);
	        if (member == null) 
	        {
	            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("會員不存在");
	        }
	        if (member.getRole() != Role.SELLER) 
	        {
	            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("只有賣家可新增商店");
	        }
	    
			Store store=new Store();
			store.setName(name);
			store.setIntroduce(introduce);
		
			String fileName=storeservice.saveStoreImage(storeImg);
			store.setStoreImg(fileName);
		
			Store newStore=storeservice.addStore(store, memberId);
			return ResponseEntity.status(HttpStatus.CREATED).body(newStore);
		}
		
		catch(Exception e)
		{
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
	    }
		
	}
	
	//列出所有商店
	@GetMapping
	public List<Store> getAll()
	{
		return storeservice.getAllStores();
	}
	
	//根據ID找商店
	@GetMapping("/id/{id}")
	public Store getStoreById(@PathVariable int id) 
	{
	      return storeservice.findById(id);
	}
	
	//根據商店ID找商店
	@GetMapping("/storeId/{storeId}")
	public Store getStoreByStoreId(@PathVariable String storeId) 
	{
	      return storeservice.findByStoreId(storeId);
	}
	
	//根據會員ID找商店
	@GetMapping("/member/{memberId}")
    public List<Store> getStoresByMemberID(@PathVariable String memberId) 
	{
        return storeservice.findByMemberId(memberId);
    }
	
	//用名稱找尋賣場，模糊搜尋用
	 @GetMapping("/search")
	    public ResponseEntity<List<Store>> searchStores(@RequestParam String name) 
	 {
	        List<Store> stores = storeservice.findByStoreName(name);
	        return ResponseEntity.ok(stores);
	 }
	
	 
	 //修改商店
	 @PutMapping("/update/{id}")
	 public ResponseEntity<?> updateStore(@RequestHeader("Authorization") String authHeader,
			 	@PathVariable("id") Integer id,
		        @RequestParam("name") String name,
		        @RequestParam("introduce") String introduce,
		        @RequestParam(value = "store_img", required = false) MultipartFile storeImg )
	 {
		 try {
	            //從 Header 中取出 Token
	            String token = extractToken(authHeader);
	            if (token == null) {
	                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("缺少 Token");
	            }

	            // 驗證 Token 並取得登入會員ID
	            String memberId = JwtUtility.validateToken(token);
	            if (memberId == null) {
	                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token 無效或過期");
	            }

	            //驗證商店所有權
	            boolean hasPermission = storeservice.verifyStoreOwner(id, memberId);
	            if (!hasPermission) {
	                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("無權限修改此商店");
	            }

	            //執行更新
	            Store updatedStore = storeservice.updateStore(id, name, introduce, storeImg);
	            return ResponseEntity.ok(updatedStore);

	        } catch (IllegalArgumentException e) {
	            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
	        } catch (Exception e) {
	            e.printStackTrace();
	            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
	        }
	 }
	 
	
	//刪除商店
	//類型定義為String是因為刪除後商店物件會消失，前端只需要接收刪除成功or失敗的訊息
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<String> deleteStore(@RequestHeader("Authorization") String authHeader,
												@PathVariable Integer id)
	{
		//從 Header 中取出 Token
        String token = extractToken(authHeader);
        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("缺少 Token");
        }

        // 驗證 Token 並取得登入會員ID
        String memberId = JwtUtility.validateToken(token);
        if (memberId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token 無效或過期");
        }

        //驗證商店所有權
        boolean hasPermission = storeservice.verifyStoreOwner(id, memberId);
        if (!hasPermission) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("無權限修改此商店");
        }
        
		boolean deleted=storeservice.deletestore(id);
		if(deleted)
		{
			return ResponseEntity.ok("商店刪除成功");
		}
		
		else
		{
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("找不到該商店 id：" + id);
		}
	}

}
