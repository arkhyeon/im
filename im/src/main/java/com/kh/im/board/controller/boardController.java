package com.kh.im.board.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import com.kh.im.board.model.service.BoardService;
import com.kh.im.board.model.vo.Board;

import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping("/board")
@Slf4j
public class boardController {

	@Autowired
	private BoardService boardService;
	
	
	@GetMapping("/board.do")
	public ModelAndView board(ModelAndView mav) {
		
		List<Board> list = boardService.selectList();
		
		System.out.println(list);
		mav.addObject("list",list);
		mav.setViewName("board/board");
		return mav;
	}
}
