<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions"%>
<jsp:include page="/WEB-INF/views/common/header.jsp" />

<section>
	<c:forEach var="board" items="${ list }">
		<div>
			<ul>
				<li>${ board.no }</li>
				<li>${ board.boardTitle }</li>
				<li>${ board.boardContent }</li>
				<li>${ board.boardDate }</li>
				<li>${ board.boardWriter }</li>
				<li>${ board.boardPassword }</li>
				<li>${ board.boardPassword }</li>
			</ul>
		</div>
	</c:forEach>
</section>

<jsp:include page="/WEB-INF/views/common/footer.jsp" />