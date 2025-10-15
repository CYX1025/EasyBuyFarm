package com.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.entity.Store;

public interface StoreRepository extends JpaRepository<Store,Integer>{
	// 找目前最大 storeId
    @Query("SELECT MAX(s.storeId) FROM Store s")
    String findMaxStoreCode();
    
    List<Store> findByMemberToStore_MemberId(String memberId);
    
    //用名稱找尋賣場，模糊搜尋用
    @Query("SELECT s FROM Store s WHERE s.name LIKE %:name%")
    List<Store> searchByName(@Param("name") String name);
    
    //找出商店ID 給新增/修改產品使用
    @Query("SELECT s FROM Store s WHERE s.storeId = :storeId")
    Store findByStoreId(@Param("storeId") String storeId);
}
