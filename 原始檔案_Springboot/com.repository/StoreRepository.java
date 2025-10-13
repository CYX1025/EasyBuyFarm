package com.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.entity.Store;

public interface StoreRepository extends JpaRepository<Store,Integer>{
	// 找目前最大 storeId
    @Query("SELECT MAX(s.storeId) FROM Store s")
    String findMaxStoreCode();
    
    List<Store> findByMemberToStore_MemberId(String memberId);
}
