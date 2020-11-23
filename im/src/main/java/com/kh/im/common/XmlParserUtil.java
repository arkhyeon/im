package com.kh.im.common;

import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.w3c.dom.Document;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

public class XmlParserUtil {
	
	public static Map<String, Object> XmlToMap(String xml) throws SAXException, IOException, ParserConfigurationException {
		Map<String, Object> msgMap = new HashMap<String, Object>();
		
		//XML 파싱(Parsing)
		InputSource is = new InputSource(new StringReader(new String(xml)));
		Document document = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(is);
		document.getDocumentElement().normalize();
		NodeList nodeList = null;
		ArrayList<Map<String, String>> xmlList = new ArrayList<Map<String, String>>();
		String getNodeName = "";
		
		//root 다음의 첫번째 노드명
		if(document.getFirstChild().getChildNodes().getLength() > 0) {
			getNodeName = document.getFirstChild().getLastChild().getFirstChild().getFirstChild().getNodeName();
//			System.out.println("getNodeName : " + getNodeName);
			
			// root 다음의 첫번째 노드 찾아서 셋팅
			nodeList = document.getElementsByTagName(getNodeName);
			
			for(int i=0; i < nodeList.getLength(); i++) {
				//nodeList의 Child Node를 다시 nodeList에 셋팅
				NodeList childList = nodeList.item(i).getChildNodes();
				
				// Child Node의 key, value를 map에 순차적으로 셋팅
				Map<String, String> childNodeMap = new HashMap<String, String>();
				for(int j=0; j < childList.getLength(); j++) {
					String childNodeName = childList.item(j).getNodeName();
					String childNodeValue = childList.item(j).getTextContent();
					
					childNodeMap.put(childNodeName, childNodeValue);
				}
				xmlList.add(childNodeMap);
			}
			msgMap.put("resultMap", xmlList);
		} else {
			msgMap.compute("resultMap", null);
		}
		return msgMap;
	}

}
