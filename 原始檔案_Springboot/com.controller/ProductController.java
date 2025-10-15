package com.controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.entity.Member;
import com.entity.Product;
import com.entity.Role;
import com.service.MemberService;
import com.service.ProductService;
import com.util.JwtUtility;

@CrossOrigin
@RestController

@RequestMapping("/easybuyfarm/products")
public class ProductController {
	
	@Autowired
	ProductService productservice;
	
	@Autowired
	MemberService memberservice;
	
	private String extractToken(String authHeader) {
	    if (authHeader != null && authHeader.startsWith("Bearer ")) {
	        return authHeader.substring(7);
	    }
	    return null;
	}
	
	//新增商品
	@PostMapping("/add")
	public ResponseEntity<?> addProduct(@RequestHeader("Authorization") String authHeader
			,@RequestParam("storeId") String storeId
			,@RequestParam("name") String name
			,@RequestParam("price") int price
			,@RequestParam("salequantity") String salequantity
			,@RequestParam("weight") String weight
			,@RequestParam("introduce") String introduce
			,@RequestParam("productImg") MultipartFile productImg)
	{
		try
		{
			 //取出 Token
	        String token = extractToken(authHeader);
	        if (token == null) {
	            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("缺少 Token");
	        }

	        //驗證 Token
	        String memberId = JwtUtility.validateToken(token);
	        if (memberId == null) {
	            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token 無效或過期");
	        }

	        //驗證會員身份
	        Member member = memberservice.findMemberByMemberId(memberId);
	        if (member == null) {
	            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("會員不存在");
	        }
	        
	        if (member.getRole() != Role.SELLER) 
	        {
	            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("只有賣家可新增商品");
	        }

	        //驗證該賣家是否為此商店的擁有者
	        boolean isOwner = productservice.verifyStoreOwner(storeId, memberId);
	        if (!isOwner) 
	        {
	            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("您不是此商店的擁有者");
	        }
	        
			Product product=new Product();
			product.setName(name);
			product.setPrice(price);
			product.setSalequantity(salequantity);
			product.setWeight(weight);
			product.setIntroduce(introduce);
			
			String fileName = productservice.saveProductImage(productImg);
			product.setProductImg(fileName);
			
			Product newProduct=productservice.addProduct(product, storeId);
			return ResponseEntity.status(HttpStatus.CREATED).body(newProduct);
		}
		
		catch(Exception e) 
		{
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
		}
	}
	
	//找尋所有商品
	@GetMapping
	public List<Product> getAll()
	{
		return productservice.getAllProducts();
	}
	
	//根據id，找出商品
	@GetMapping("/id/{id}")
	public Product getProductById(@PathVariable Integer id)
	{
		return productservice.findById(id);
	}
	
	//根據商店id，列出該商店所有商品
	@GetMapping("/store/{storeId}")
	public List<Product> getProductByStoreId(@PathVariable String storeId)
	{
		return productservice.findByStoreId(storeId);
	}
	
	//用名稱找尋商品，模糊搜尋用
	@GetMapping("/search")
	public ResponseEntity<List<Product>> searchStores(@RequestParam String name) 
	{
		List<Product> products = productservice.findByProductName(name);
		return ResponseEntity.ok(products);
	}
	
	//修改商品
	@PutMapping("/update/{id}")
	public ResponseEntity<?> updateProduct(@RequestHeader("Authorization") String authHeader
			,@RequestParam("storeId") String storeId
			,@PathVariable("id") Integer id
			,@RequestParam("name") String name
			,@RequestParam("price") int price
			,@RequestParam("salequantity") String salequantity
			,@RequestParam("weight") String weight
			,@RequestParam("introduce") String introduce
			,@RequestParam("productImg") MultipartFile productImg)
	{
		try
		{
			//取出 Token
	        String token = extractToken(authHeader);
	        if (token == null) 
	        {
	            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("缺少 Token");
	        }

	        //驗證 Token
	        String memberId = JwtUtility.validateToken(token);
	        if (memberId == null) 
	        {
	            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token 無效或過期");
	        }

	        //驗證會員
	        Member member = memberservice.findMemberByMemberId(memberId);
	        if (member == null) 
	        {
	            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("會員不存在");
	        }
	        
	        //檢查角色
	        if (member.getRole() != Role.SELLER) 
	        {
	            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("只有賣家可新增商品");
	        }

	        //驗證該賣家是否為此商店的擁有者
	        boolean isOwner = productservice.verifyStoreOwner(storeId, memberId);
	        if (!isOwner) 
	        {
	            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("您不是此商店的擁有者");
	        }
	        
			Product updateProduct=productservice.updateProduct(id, name, price, salequantity, weight, introduce, productImg);
			return ResponseEntity.ok(updateProduct);
		}
		catch (IllegalArgumentException e) 
		{
	        // 如果找不到產品，回傳 404
	        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
	    } 
		
		catch (Exception e) 
		{
	        // 其他錯誤回傳 500
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
	    }
	}
	
	//刪除商品
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<String> deleteProduct(@RequestHeader("Authorization") String authHeader
										,@RequestParam("storeId") String storeId
										,@PathVariable Integer id)
	{
		try 
		{
	        //取出 Token
	        String token = extractToken(authHeader);
	        if (token == null) 
	        {
	            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("缺少 Token");
	        }

	        //驗證 Token
	        String memberId = JwtUtility.validateToken(token);
	        if (memberId == null) 
	        {
	            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token 無效或已過期");
	        }

	        //查詢會員
	        Member member = memberservice.findMemberByMemberId(memberId);
	        if (member == null) 
	        {
	            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("會員不存在");
	        }

	        //檢查角色
	        if (member.getRole() != Role.SELLER) 
	        {
	            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("只有賣家可以刪除商品");
	        }

	        //驗證該賣家是否為商店擁有者
	        boolean isOwner = productservice.verifyStoreOwner(storeId, memberId);
	        if (!isOwner) 
	        {
	            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("您不是此商店的擁有者");
	        }

	        //執行刪除
	        boolean deleted = productservice.deleteProduct(id);
	        if (deleted) 
	        {
	            return ResponseEntity.ok("商品刪除成功");
	        } 
	        else 
	        {
	            return ResponseEntity.status(HttpStatus.NOT_FOUND)
	                    .body("找不到該商品 ID：" + id);
	        }

	    } 
		catch (Exception e) 
		{
	        e.printStackTrace(); 
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
	                .body("伺服器發生錯誤，無法刪除商品");
	    }
	}

}
