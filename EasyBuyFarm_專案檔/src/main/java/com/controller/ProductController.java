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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.entity.Product;
import com.service.ProductService;

@CrossOrigin
@RestController

@RequestMapping("/easybuyfarm/products")
public class ProductController {
	
	@Autowired
	ProductService productservice;
	
	//新增商品
	@PostMapping("/add")
	public ResponseEntity<Product> addProduct(@RequestParam("storeId") String storeId
			,@RequestParam("name") String name
			,@RequestParam("price") int price
			,@RequestParam("salequantity") String salequantity
			,@RequestParam("weight") String weight
			,@RequestParam("introduce") String introduce
			,@RequestParam("productImg") MultipartFile productImg)
	{
		try
		{
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
	public ResponseEntity<?> updateProduct(@PathVariable("id") Integer id
			,@RequestParam("name") String name
			,@RequestParam("price") int price
			,@RequestParam("salequantity") String salequantity
			,@RequestParam("weight") String weight
			,@RequestParam("introduce") String introduce
			,@RequestParam("productImg") MultipartFile productImg)
	{
		try
		{Product updateProduct=productservice.updateProduct(id, name, price, salequantity, weight, introduce, productImg);
		return ResponseEntity.ok(updateProduct);
		}
		catch (IllegalArgumentException e) {
	        // 如果找不到產品，回傳 404
	        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
	    } catch (Exception e) {
	        // 其他錯誤回傳 500
	        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
	    }
	}
	
	//刪除商品
	@DeleteMapping("/delete/{id}")
	public ResponseEntity<String> deleteStore(@PathVariable Integer id)
	{
		boolean deleted=productservice.deleteProduct(id);
		if(deleted)
		{
			return ResponseEntity.ok("商店刪除成功");
		}
		else
		{
			return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("找不到該產品：" + id);
		}
	}

}
