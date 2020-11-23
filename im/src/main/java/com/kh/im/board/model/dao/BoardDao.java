package com.kh.im.board.model.dao;

import java.util.List;

import com.kh.im.board.model.vo.Board;

public interface BoardDao {

	List<Board> selectList();

}
