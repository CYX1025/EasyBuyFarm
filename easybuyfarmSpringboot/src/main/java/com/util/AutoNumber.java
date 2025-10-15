package com.util;

import java.util.Comparator;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.entity.Member;
import com.repository.MemberRepository;

@Component
public class AutoNumber {
	
	public static void main(String[] args) {
		
	}
	
	private final MemberRepository memberdao;

    @Autowired
    public AutoNumber(MemberRepository memberdao) {
        this.memberdao = memberdao;
    }

    public String generateMemberNo() {
        String prefix = "sn" + new java.text.SimpleDateFormat("yyyyMMdd").format(new java.util.Date());
        int nextNo = 1;

        List<Member> members = memberdao.findAll();

        // 過濾出「今天」的會員編號
        Member latestTodayMember = members.stream()
            .filter(m -> m.getMemberId() != null && m.getMemberId().startsWith(prefix))
            .max(Comparator.comparing(Member::getMemberId))
            .orElse(null);

        if (latestTodayMember != null) {
            String lastId = latestTodayMember.getMemberId();
            int lastNo = Integer.parseInt(lastId.substring(prefix.length()));
            nextNo = lastNo + 1;
        }

        // 補齊後4 位數
        String numberPart = String.format("%04d", nextNo);

        return prefix + numberPart;
    }
	
	//產生商店流水號
	    public static String generateStoreNo(String maxCode) {
	        if (maxCode == null) {
	            return "s001";
	        }
	        int num = Integer.parseInt(maxCode.substring(1)); // 去掉開頭 S
	        num++;
	        return String.format("s%03d", num);
	    }
	    
	
	 //產生商品流水號
	    public static String generateProductNo(String maxCode) {
	        if (maxCode == null) {
	            return "p001";
	        }
	        int num = Integer.parseInt(maxCode.substring(1)); // 去掉開頭 S
	        num++;
	        return String.format("p%03d", num);
	    }

}
