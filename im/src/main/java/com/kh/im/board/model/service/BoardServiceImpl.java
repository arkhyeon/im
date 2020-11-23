package com.kh.im.board.model.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.kh.im.board.model.dao.BoardDao;
import com.kh.im.board.model.vo.Board;

import lombok.extern.slf4j.Slf4j;

@Service
public class BoardServiceImpl implements BoardService {

	@Autowired
	private BoardDao dao; 
	
	@Override
	public List<Board> selectList() {
		return dao.selectList();
	}

}
