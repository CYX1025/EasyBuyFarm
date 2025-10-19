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
import org.springframework.web.bind.annotation.RequestParam;
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
	
	public boolean verifyStoreOwner(String storeId, String memberId) {
        Store store = storedao.findByStoreId(storeId);
        if (store == null)
        {
        	return false;
        }
        System.out.println("storeId=" + storeId);
        System.out.println("memberId=" + memberId);
        String ownerId = store.getMemberToStore().getMemberId();
        return ownerId.equals(memberId);
    }
	
	//儲存產品圖片，並回傳檔名
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
		
		//找尋所有商品
		public List<Product> getAllProducts()
		{
			return productdao.findAll();
		}
		
		//用id找產品
		public Product findById(Integer id)
		{
			return productdao.findById(id).orElse(null);
		}
		
		//根據商店id找產品
		public List<Product> findByStoreId(String storeId)
		{
			return productdao.findBystoreId_StoreId(storeId);
		}
		
		//用商品名稱找商品，模糊搜尋用
		public List<Product> findByProductName(String name)
		{
			return productdao.searchByName(name);
		}
		
		//修改產品
		public Product updateProduct(Integer id,String name,int price
									,String salequantity,String weight
									,String introduce
									,MultipartFile productImg)
		{
			Product existProduct=findById(id);
			if(existProduct == null)
			{
				throw new IllegalArgumentException("找不到產品ID：" + id);
			}
			
			existProduct.setName(name);
			existProduct.setPrice(price);
			existProduct.setSalequantity(salequantity);
			existProduct.setWeight(weight);
			existProduct.setIntroduce(introduce);
			
			try 
			{
				String newFileName= saveProductImage(productImg);
				existProduct.setProductImg(newFileName);
			} 
			catch(IOException e)
			{
				e.printStackTrace();
			}
			
			return productdao.save(existProduct);
		}
		
		//刪除商品
		public boolean deleteProduct(Integer id)
		{
			Product product=productdao.findById(id).orElse(null);
			if(product != null)
			{
				productdao.deleteById(id);
				return true;
			}
			else
			{
				return false;
			}
		}

}
