package com.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.entity.Product;
import com.service.ProductService;

@CrossOrigin
@RestController

@RequestMapping("/products")
public class ProductController {
	
	@Autowired
	ProductService productservice;
	
	//新增商品
	@PostMapping("/add")
	public ResponseEntity<Product> addProduct(@RequestParam("storeId") String storeId
			,@RequestParam("productId") String productId
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

}
