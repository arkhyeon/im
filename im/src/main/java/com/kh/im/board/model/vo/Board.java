package com.kh.im.board.model.vo;

import java.io.Serializable;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Board implements Serializable{

	private int no;
	private String boardTitle;
	private String boardContent;
	private String boardDate;
	private String boardWriter;
	private String boardPassword;
	private String boardHit;
	
//	private List<BoardAttach> attachList;
}
