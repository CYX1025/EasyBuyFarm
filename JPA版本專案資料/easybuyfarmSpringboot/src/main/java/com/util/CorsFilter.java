package com.util;
import java.io.IOException;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebFilter(urlPatterns={"/*"})
public class CorsFilter implements Filter {

	public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
			throws IOException, ServletException {
		HttpServletResponse response = (HttpServletResponse) res;
		HttpServletRequest request = (HttpServletRequest) req;
		response.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5500");
		response.setHeader("Access-Control-Allow-Credentials", "true");
		response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
		response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
		response.setHeader("Access-Control-Expose-Headers", "Location");
		
		// 目的讓前後端分離時候不會發生response header [last modified time]回傳錯誤
		if (request.getMethod().equalsIgnoreCase("OPTIONS")) {
			response.setStatus(HttpServletResponse.SC_OK);
			return;
		}
		chain.doFilter(req, res);
	}

	public void init(FilterConfig filterConfig) {
	}

	public void destroy() {
	}

}
