package com.kh.im.common;

import java.text.SimpleDateFormat;
import java.util.Date;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class Utils {

	public static String getRenamedFileName(String oname) {
		int beginIndex = oname.lastIndexOf(".");
		String ext = oname.substring(beginIndex); // .txt
		
		SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd_HHmmssSSS_");
		int rndNum = (int)(Math.random() * 1000);
		
		String rname = sdf.format(new Date()) + rndNum + ext;
		log.debug("rname={}", rname);
		
		return rname;
	}
	
	public static String getPageBarHtml(int cPage, int numPerPage, int totalContents, String url) {
		String pageBar = "";
		int pageBarSize = 10;//페이지 바에 표시될 페이지 번호수
		
		int totalPage = (int)Math.ceil((double)totalContents/numPerPage);
		
		int pageStart = ((cPage-1)/pageBarSize) * pageBarSize+1;
		int pageEnd = pageStart + pageBarSize - 1;
		
		int pageNo = pageStart;
		
		//(이전) 영역
		if(pageNo == 1) {
			
		} else {
			pageBar += "<a class='page-link page-pre' href='" + url + "cPage=" + (pageNo - 1) + "'><이전</a>";
		}
		
		//페이지 번호 영역
		while(pageNo <= pageEnd && pageNo <= totalPage) {
			
			//현재 페이지인경우
			if(pageNo == cPage) {
				pageBar += "<span class='cPage'>" + pageNo + "</span>";
			} else {
				pageBar += "<a class='page-link' href='" + url + "cPage=" + pageNo + "'>" + pageNo + "</a>";
			}
			pageNo++;
		}
		
		//다음 영역
		if(pageNo > totalPage) {
			
		} else {
			pageBar += "<a class='page-link page-pre' href='" + url + "cPage=" + pageNo + "'>다음></a>";
		}
		return pageBar;
	}

}
