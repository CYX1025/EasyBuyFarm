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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.entity.Store;
import com.service.StoreService;

@CrossOrigin
@RestController
@RequestMapping("/stores")
public class StoreController {
	@Autowired
	StoreService storeservice;
	
	//新增商店
	//member id由前端給
	@PostMapping("/add")
	public ResponseEntity<Store> addStore(@RequestParam("memberId") String memberId
			,@RequestParam("name") String name,
			@RequestParam("introduce") String introduce , 
			@RequestParam("store_img") String storeImg)
	{
		Store store=new Store();
		store.setName(name);
		store.setIntroduce(introduce);
		store.setStoreImg(storeImg);
		
		Store newStore=storeservice.addStore(store, memberId);
		return ResponseEntity.status(HttpStatus.CREATED).body(newStore);
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
	
	//根據會員ID找商店
	@GetMapping("/member/{memberId}")
    public List<Store> getStoresByMemberID(@PathVariable String memberId) 
	{
        return storeservice.findByMemberId(memberId);
    }
	
	//刪除商店
	//類型定義為String是因為刪除後商店物件會消失，前端只需要接收刪除成功or失敗的訊息
	@DeleteMapping("/{id}")
	public ResponseEntity<String> deleteStore(@PathVariable Integer id)
	{
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
