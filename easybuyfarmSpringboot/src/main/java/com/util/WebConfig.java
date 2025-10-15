package com.util;

import org.springframework.context.annotation.Configuration;
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
    }

}
