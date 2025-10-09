package com.util;

import java.util.Comparator;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;

import com.entity.Member;
import com.service.MemberRepository;

public class AutoNumber {
	
	public static void main(String[] args) {
		System.out.println(generateMemberNo());
	}
	
	@Autowired
	static MemberRepository memberdao;
	
	public static String generateMemberNo() {
	    String prefix = "sn" + new java.text.SimpleDateFormat("yyyyMMdd").format(new java.util.Date());
	    int nextNo = 1;

	    List<Member> members = memberdao.findAll();

	    /*
	     * 過濾出「今天」的會員編號
	     */
	    Member latestTodayMember = members.stream()
	        .filter(m -> m.getMemberId() != null && m.getMemberId().startsWith(prefix))
	        .max(Comparator.comparing(Member::getMemberId))
	        .orElse(null);

	    if (latestTodayMember != null) {
	        String lastId = latestTodayMember.getMemberId(); 
	        int lastNo = Integer.parseInt(lastId.substring(10));
	        nextNo = lastNo + 1;
	    }

	    /*
	     * 補齊後4 位數
	     */
	    String numberPart = String.format("%04d", nextNo);

	    return prefix + numberPart;
	}

}
