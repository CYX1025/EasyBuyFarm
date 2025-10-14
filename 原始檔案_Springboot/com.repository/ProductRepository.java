package com.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.entity.Product;
import com.entity.Store;

public interface ProductRepository extends JpaRepository<Product,Integer>{
	@Query("SELECT MAX(p.productId) FROM Product p")
    String findMaxProductCode();
	
    List<Product> findBystoreId_StoreId(String storeId);
}
