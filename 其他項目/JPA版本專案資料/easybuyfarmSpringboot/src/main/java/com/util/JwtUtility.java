package com.util;

import io.jsonwebtoken.*;
import java.util.Date;

public class JwtUtility {
    private static final String SECRET = "MySecretKey";
    private static final long EXPIRATION_TIME = 1000 * 60 * 60; // 1 小時

    // 產生 Token
    public static String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SignatureAlgorithm.HS512, SECRET)
                .compact();
    }

    // 驗證 Token
    public static String validateToken(String token) {
        try {
            return Jwts.parser()
                    .setSigningKey(SECRET)
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();
        } catch (JwtException e) {
            return null;
        }
    }
}
