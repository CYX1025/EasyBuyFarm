package com.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.entity.Product;
import com.entity.Store;

public interface ProductRepository extends JpaRepository<Product,Integer>{
	@Query("SELECT MAX(p.productId) FROM Product p")
    String findMaxProductCode();
	
    List<Product> findBystoreId_StoreId (String storeId);
    
    //用名稱找商品，模糊搜尋用
    @Query("SELECT p FROM Product p WHERE p.name LIKE %:name%")
    List<Product> searchByName(@Param("name") String name);
}
