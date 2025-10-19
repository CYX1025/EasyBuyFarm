package com.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.entity.Member;
import com.repository.MemberRepository;

import com.repository.OrderRepository;

@Component
public class AutoNumber {

    private final MemberRepository memberdao;
    private final OrderRepository orderRepo;

    @Autowired
    public AutoNumber(MemberRepository memberdao, OrderRepository orderRepo) {
        this.memberdao = memberdao;
        this.orderRepo = orderRepo;
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
    /** 自動生成訂單號：ORD-YYYYMMDD-xxxxx **/
    public String generateOrderNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE); // 20251015
        String prefix = "ORD-" + datePart + "-";

        String maxCode = orderRepo.findMaxOrderCodeForDate(prefix);
        int nextSeq = 1;
        if (maxCode != null) {
            try {
                String seqStr = maxCode.substring(maxCode.lastIndexOf('-') + 1);
                nextSeq = Integer.parseInt(seqStr) + 1;
            } catch (Exception e) {
                nextSeq = 1;
            }
        }
        return prefix + String.format("%05d", nextSeq);
    }
}
