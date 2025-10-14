package com.service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.entity.Product;
import com.entity.Store;
import com.repository.ProductRepository;
import com.repository.StoreRepository;
import com.util.AutoNumber;

@Service
public class ProductService {
	@Autowired
	StoreRepository storedao;
	
	@Autowired
	ProductRepository productdao;
	
	private static final String UPLOAD_DIR="uploads/product/";
	
	//儲存商店圖片，並回傳檔名
		public String saveProductImage(MultipartFile file) throws IOException
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
		
		//新增商品
		public Product addProduct(Product product,String storeId)
		{
			Store store=storedao.findByStoreId(storeId);
			if(store == null)
			{
				throw new IllegalArgumentException("找不到對應的商店 ID：" + storeId);
			}
			
			String maxCode=productdao.findMaxProductCode();
			String newCode=AutoNumber.generateProductNo(maxCode);
			
			product.setProductId(newCode);
			product.setStoreId(store);
			
			return productdao.save(product);
		}

}
