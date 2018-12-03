function goPage(pageNo){
	document.pagingForm.pageNo.value = pageNo;
	document.pagingForm.submit();
}
/*
function noticeView(tradeDate, seqNo, pageRow) {
	//jQuery selector
	$("input[name='tradeDate']").val(tradeDate);
	$("input[name='seqNo']").val(seqNo);
	$("input[name='pageRow']").val(pageRow);
	var param = {
			stdCode: "${stdCode}",
			simpleCode: "${simpleCode}",
			tradeDate: tradeDate, //"${result.tradeDate}",
			seqNo: seqNo, //"${result.seqNo}",
			pageNo:"${pageVo.pageNo}",
			startRowNum: "${pageVo.startRowNum}",
			endRowNum: "${pageVo.endRowNum}",
			marketBit: "${marketBit}",
			lang: "${lang}",
			pageRow: pageRow //"${result.rnum}",
	};
	var url = '/cyberir/noticeContents.do?' + $.param(param);
	
	console.log($.param(param));
	console.log(decodeURIComponent($.param(param)));
	
	$("iframe[name='contents']").attr("src", url);
	var offset = $("iframe[name='contents']").offset();
	$("html, body").animate({scrollTop : offset.top}, 1000);
	return;
}
*/
function noticeView(tradeDate, seqNo, pageRow, stdCode, simpleCode, pageNo, startRowNum, endRowNum, marketBit, lang, isPopup, scroll) {
	//jQuery selector
	$("input[name='tradeDate']").val(tradeDate);
	$("input[name='seqNo']").val(seqNo);
	$("input[name='pageRow']").val(pageRow);
	var param = {
			stdCode: stdCode,
			simpleCode: simpleCode,
			tradeDate: tradeDate,
			seqNo: seqNo,
			pageNo: pageNo,
			startRowNum: startRowNum,
			endRowNum: endRowNum,
			marketBit: marketBit,
			lang: lang,
			pageRow: pageRow
	};
	//console.log($.param(param));
	//console.log(decodeURIComponent($.param(param)));
	var url = '/cyberir/noticeContents.do?' + $.param(param);
	if(isPopup) {
		var option= "width=710, height=768, scrollbars=yes";
		window.open(url, 'name', option);
	} else {
		$("iframe[name='contents']").attr("src", url);
		
		if(scroll) {
			var offset = $("iframe[name='contents']").offset();
			$("html, body").animate({scrollTop : offset.top}, 1000);
		}
	}
	return;
}

function noticeViewDart(tradeDate, seqNo, pageRow, stdCode, simpleCode, pageNo, startRowNum, endRowNum, marketBit, lang, isPopup) {
	//jQuery selector
	$("input[name='tradeDate']").val(tradeDate);
	$("input[name='seqNo']").val(seqNo);
	$("input[name='pageRow']").val(pageRow);
	var param = {
			stdCode: stdCode,
			simpleCode: simpleCode,
			tradeDate: tradeDate,
			seqNo: seqNo,
			pageNo: pageNo,
			startRowNum: startRowNum,
			endRowNum: endRowNum,
			marketBit: marketBit,
			lang: lang,
			pageRow: pageRow
	};
	//console.log($.param(param));
	//console.log(decodeURIComponent($.param(param)));
	
	//dart.fss.or.kr/dsaf001/main.do?rcpNo=20170524900503
	var url = '/cyberir/noticeContents.do?' + $.param(param);
	if(isPopup) {
		var option= "width=710, height=768, scrollbars=yes";
		window.open(url, 'name', option);
	} else {
		$("iframe[name='contents']").attr("src", url);
		var offset = $("iframe[name='contents']").offset();
		$("html, body").animate({scrollTop : offset.top}, 1000);
	}
	return;
}

//function noticeViewCheck(tradeDate, seqNo, stdCode, marketBit) {
//	//jQuery selector
//	$("input[name='tradeDate']").val(tradeDate);
//
//	$("input[name='seqNo']").val(seqNo);
//	var param = {
//			stdCode: stdCode,
//			tradeDate: tradeDate,
//			seqNo: seqNo,
//			marketBit: marketBit,
//	};
//	//console.log($.param(param));
//	//console.log(decodeURIComponent($.param(param)));
//	var url = '/cyberir/checkNoticeContents.do?' + $.param(param);
//	if(isPopup) {
//		var option= "width=710, height=768, scrollbars=yes";
//		window.open(url, 'name', option);
//	} else {
//		$("iframe[name='contents']").attr("src", url);
//		var offset = $("iframe[name='contents']").offset();
//		$("html, body").animate({scrollTop : offset.top}, 1000);
//	}
//	return;
//}