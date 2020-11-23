package com.kh.im.common.interceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class LoginInterceptor extends HandlerInterceptorAdapter {@Override

	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
			throws Exception {
//		log.debug("로그인 여부 체크!");
//		HttpSession session = request.getSession();
		/*
		 * User loginUser = (User)session.getAttribute("loginUser");
		 * 
		 * if(loginUser == null) { //FlashMap을 통한 사용자 피드백 FlashMap flashMap = new
		 * FlashMap(); flashMap.put("msg", "로그인후 이용할 수 있습니다.");
		 * 
		 * FlashMapManager manager = RequestContextUtils.getFlashMapManager(request);
		 * manager.saveOutputFlashMap(flashMap, request, response);
		 * 
		 * //로그인 성공후, redirect할 주소 session에 저장 : next String uri =
		 * request.getRequestURI(); // /spring/board/boardForm.do uri =
		 * uri.replace(request.getContextPath(), "");
		 * 
		 * String param = request.getQueryString();// "" | no=12&name=abc
		 * 
		 * uri += (!"".equals(param)) ? "?" + param : param; // log.debug("uri = {}",
		 * uri);
		 * 
		 * session.setAttribute("next", uri);
		 * 
		 * response.sendRedirect(request.getContextPath() + "/user/login.do"); return
		 * false; }
		 */
		
		return super.preHandle(request, response, handler);
	}

}
