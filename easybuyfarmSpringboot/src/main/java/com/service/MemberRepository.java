package com.service;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.entity.Member;

public interface MemberRepository extends JpaRepository<Member,Integer>{
	
	@Query("SELECT m FROM Member m WHERE (m.email = :keyword OR m.phone = :keyword) AND m.password = :password")
    Member findByKeywordAndPassword(@Param("keyword") String keyword, @Param("password") String password);
	
	@Query("SELECT m FROM Member m WHERE m.memberId = :memberId")
	Member findByMemberId(@Param("memberId") String memberId);
}
