package com.util;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer{
	@Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 將 /uploads/** 對應到實際的本地檔案夾
		//讓前端可以抓取圖片資料用的程式碼
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
        
        registry.addResourceHandler("/images/**")
        .addResourceLocations("classpath:/static/images/");
    }
	
	
	@Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")  // 這裡設置允許跨域的路徑
                .allowedOrigins("http://127.0.0.1:5500") // 允許的來源（前端地址）
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // 允許的 HTTP 方法
                .allowedHeaders("*") // 允許的請求標頭
                .allowCredentials(true); // 啟用 cookies 等憑證
    }

}
