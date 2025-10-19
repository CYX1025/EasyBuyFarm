package com.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.entity.Member;
import com.entity.Store;
import com.repository.StoreRepository;
import com.util.AutoNumber;

@Service
public class StoreService {
	@Autowired
	StoreRepository storedao;
	
	@Autowired
	MemberService memberservice;
	
	private static final String UPLOAD_DIR="uploads/store/";
	
	 public boolean verifyStoreOwner(Integer id, String memberId) {
	        Store store = storedao.findById(id).orElse(null);
	        if (store == null)
	        {
	        	return false;
	        }
	        System.out.println("storeId=" + id);
	        System.out.println("memberId=" + memberId);
	        String ownerId = store.getMemberToStore().getMemberId();
	        return ownerId.equals(memberId);
	    }
	
	//儲存商店圖片，並回傳檔名
	public String saveStoreImage(MultipartFile file) throws IOException
	{
		if(file.isEmpty())
		{
			return null;
		}
		
		String originalFileName=file.getOriginalFilename();
		
		//擷取副檔名，保留檔案格式
		String extension=originalFileName.substring(originalFileName.lastIndexOf("."));
		
		String newFileName=UUID.randomUUID().toString()+extension;
		
		//建立上傳資料夾
		File uploadDir=new File(UPLOAD_DIR);
		if(!uploadDir.exists())
		{
			uploadDir.mkdirs();
		}
		
		// 寫入檔案
        Path filePath = Paths.get(UPLOAD_DIR, newFileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        return newFileName; // 只回傳檔名存入資料庫
	}
	
	
	//新增商店
		public Store addStore(Store store,String memberId) 
		{
			Member member = memberservice.findMemberByMemberId(memberId);
			if(member==null)
			{
				 throw new IllegalArgumentException("找不到對應的會員 ID：" + memberId);
			}
			
			String maxCode=storedao.findMaxStoreCode();
			String newCode=AutoNumber.generateStoreNo(maxCode);
			
			store.setStoreId(newCode);
	        store.setMemberToStore(member);

	        return storedao.save(store);
		}
		
		
	//找尋所有商店
	public List<Store> getAllStores() {
		return storedao.findAll();
	}
	
	//用Id找商店功能
	public Store findById(Integer id)
	{
		return storedao.findById(id).orElse(null);
	}
	
	//根據商店id找商店
	public Store findByStoreId(String storeId)
	{
		return storedao.findByStoreId(storeId);
	}
	
	//根據會員ID找商店
	public List<Store> findByMemberId(String memberId)
	{
		return storedao.findByMemberToStore_MemberId(memberId) ;
	}
	
	//用名稱找尋賣場，模糊搜尋用
	public List<Store> findByStoreName(String name) {
        return storedao.searchByName(name);
    }
	
	//修改商店資料
	public Store updateStore(Integer id,String name,String introduce,MultipartFile storeImg)
	 {
		 Store existStore=findById(id);
		 if(existStore == null)
		 {
			 throw new IllegalArgumentException("找不到商店 ID：" + id);
		 }
		 existStore.setName(name);
		 existStore.setIntroduce(introduce);
		 if(storeImg !=null && !storeImg.isEmpty())
		 {
			 try 
			 {
				 String newFileName= saveStoreImage(storeImg);
				 existStore.setStoreImg(newFileName);
			 } 
			 catch (IOException e) 
			 {
				 e.printStackTrace();
			 } 
		 }
		    return storedao.save(existStore); 
	 }
	
	//刪除商店
	public boolean deletestore(Integer id)
	{
		Store store=storedao.findById(id).orElse(null);
		if(store!=null)
		{
			storedao.deleteById(id);
			return true ;
		}
		else
		{
			return false;
		}
	}

}
