package com.service;

import java.sql.Timestamp;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.entity.Member;
import com.entity.Role;
import com.entity.Store;
import com.repository.MemberRepository;
import com.repository.StoreRepository;
import com.util.AutoNumber;

@Service
public class StoreService {
	@Autowired
	StoreRepository storedao;
	
	@Autowired
	MemberService memberservice;
	
	//找尋所有商店
	public List<Store> getAllStores() {
		return storedao.findAll();
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
	
	//用Id找商店功能
	public Store findById(Integer id)
	{
		return storedao.findById(id).orElse(null);
	}
	
	//根據會員ID找商店
	public List<Store> findByMemberId(String memberId)
	{
		return storedao.findByMemberToStore_MemberId(memberId) ;
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
