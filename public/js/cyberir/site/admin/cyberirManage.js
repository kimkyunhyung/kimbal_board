var $dataIdField = undefined;
var $readOnlyField = undefined;
var dataType = undefined;

//function makeUrl() {
//	$.ajax({
//		url: "/site/admin/page/makeUrl.do",
//		success: function (res) {
//			alert(res);
//			location.reload();
//		},
//		error: function (err) {
//			//console.log(err);
//		}
//	});
//}

function iframeClear(iframeId) {
	$("#"+iframeId).html("");
}

function reload() {
	location.href = location.href;
}

function isValidStr(str) {
	return str != "" && str != undefined && str != null ? true : false;
}

function firstCharCap(str) {
	return str.charAt(0).toUpperCase()+str.slice(1);
}

function concatStr(str1,str2) {
	if(str2 != null && str2 != "")
		return str1 + firstCharCap(str2);
	else 
		return str1;
}

function modalShow(dataType) {
	$("#"+dataType+"Modal").modal('show');
}

function modalHide(dataType) {
	$("#"+dataType+"Modal").modal('hide');
}

function clearForm(dataType) {
	$("#"+dataType+"Form")[0].reset();
}

function dataReload(dataType) {
	if(dataType == 'page') drawPageList();
	else if(dataType == 'customer') drawCustomerList();
	else location.reload();
}

/*
 * {page,contact,customer,opinion}List.jsp 에서 사용
 */
function showDetail(currentData) {
	var dataType = $(currentData).attr("data-type");
	var dataId = $(currentData).attr("data-id");
	//console.log("dataType: " + dataType + ",dataId: " + dataId);
	showModal(dataType,dataId);
}

function showModal(dataType,dataId) {
	$("#"+dataType+"Form")[0].reset();
	
	if(dataId != undefined) {
		$(".forCreation").hide();
		$.ajax({
			type: "post",
			url: "/site/admin/"+dataType+"/selectOne.json",
			data: {dataId: dataId},
			success: function (res) { //res: ArrayList<ZValue>
				var data = res.resultList[0];
				//console.log(data);
				$.each(data,function (k,v) {
					if(typeof v == 'string')
						v = v.replace(/&amp;/gi,"&");
					$("input#"+k).val(v);
					$("select#"+k).val(v);
					$("textarea#"+k).html(v);
				});
				
				if(data.deleteYn == 'Y' || data.isValid == 'N') {
					$("button#delete").hide();
					$("button#deleteComplete").show();
				} else {
					$("button#delete").show();
					$("button#deleteComplete").hide();
				}
			}
		});
		
		if($readOnlyField != undefined)
			$readOnlyField.attr("readonly", true); //dataId가 있으면 == 읽어들인 데이터가 있으면
	} else {
		$("button#delete").hide();
		$("button#deleteComplete").hide();
		$(".forCreation").show();
	}
	
	$dataIdField.attr("readonly", true);
	
	$("#"+dataType+"Modal").modal('show');
	$.each($("form#"+dataType+"Form input"),function (k,v) {
		//console.log($(this).attr("name"));
		if($(this).attr("readonly")!="readonly") {
			$(this).get(0).focus(); return false;
		}
	});
}

function undefStr(str1,str2) {
	if(str1 != undefined && str1 != '') return str1;
	else {
		if(str2 != undefined && str2 != '') return str2;
		else return '_';
	}
}

/**
 * Function: getList(param)
 * {Customer,Page,Opinion,Contact,Master}List.jsp 에서 공통 사용
 * 전체 또는 검색 결과 데이터를 읽어와서 List로 보여줌
 */
function getList(additionalParam) {
	$("div.data-container").html("");
	$("div.data-container").append($("<div/>").css({'margin':'50px'}).append($("<div/>",{'class': 'loader-sm'}).css('margin','auto')));
	
	var param = {};
	
	$.map($("#searchForm").serializeArray(),function (k,v) {
		param[k['name']] = k['value'];
	});
	$.each(additionalParam,function (k,v) {
		param[k] = v;
	});
	param["setPagination"] = "true";
	//console.log(param);
	
	$.ajax({
		type: "post",
		url: "/site/admin/"+dataType+"/list.json",
		data: param,
		success: function (res) {
			//console.log(res);
			setTimeout(function () {
				$("div.data-container").html("");

				$.each(res.resultList,function (k,v) {
					$("div.data-container").append(dataElement(v)); //dataElement(..)는 List 유형(dataType) 별로 다르게 정의 됨
				});
				
				$("#numberOfRecords").text(res.param.numberOfRecords);
				
				createPagination(res.param);
			},200);
			
			$("input#searchWord").focus();
		}
	});
}

/**
 * createPagination(param)
 * 
 */
function createPagination(param) {
	$("div.pagination").html("");
	$("div.pagination").append($("<nav/>")).append($("<ul/>",{'class':'pagination'}));
	$("div.pagination").attr({'data-recordsPerPage':param.recordsPerPage});
	
	var pagingElem = "";

	//Previous 표시
	pagingElem = $("<li/>",{'class': 'page-item'})
		.append($("<a/>",{'class': 'page-link','data-pageNo':'prev','aria-label':'Previous',
			'html':$("<span/>",{'aria-hidden':'true','html':'&laquo'}).prop('outerHTML')+$("<span/>",{'class':'sr-only','text':'Previous'}).prop('outerHTML')
		})
	);
	$("ul.pagination").append(pagingElem);
	
	//Page Numbers
	for(var i=param.startPage; i<=param.endPage; i++) {
		pagingElem = $("<li/>",{'class': 'page-item'})
			.append($("<a/>",{'class': 'page-link','data-pageNo':i,'text': i,'href':'javascript:pageClickEventHandler('+i+')'}));
		//console.log("param.togoPageNo=",param.togoPageNo); 
		if(param.togoPageNo == i) $(pagingElem).addClass("active");
		$("ul.pagination").append(pagingElem);
	}

	//Next 표시
	pagingElem = $("<li/>",{'class': 'page-item'})
		.append($("<a/>",{'class': 'page-link','data-pageNo':'next','aria-label':'Next',
			'html':$("<span/>",{'aria-hidden':'true','html':'&raquo'}).prop('outerHTML')+$("<span/>",{'class':'sr-only','text':'Next'}).prop('outerHTML')
		})
	);
	$("ul.pagination").append(pagingElem);
	pageClickEventHandler();
}

function pageClickEventHandler() {
	$("a.page-link").click(function () {
		var togoPageNo = $(this).attr("data-pageNo");
		//console.log("togoPageNo="+togoPageNo+",$('ul.pagination li.active a').text()="+$("ul.pagination li.active a").text());
		
		getList({
			togoPageNo:togoPageNo,
			currentPageNo:$("ul.pagination li.active a").text(),
			recordsPerPage:$("div.pagination").attr("data-recordsPerPage")
		});
	});
}

function createClickEventHandler() { 
	//create 버튼을 클릭했을 때
	$("button#create").click(function () {
		var dataType = $(this).attr("data-type");
		showModal(dataType);
	});
}

function copyClickEventHandler() {
	//TODO copy 버튼을 클릭했을 때 --> 현재 정보 그대로 신규 저장 1건 하고 바로 보여줌
	$("button#copy").click(function () {
		var dataType = $(this).attr("data-type");
		showModal(dataType);
	});
}

function saveDeleteClickEventHandler() {
	//save,delete 버튼을 클릭했을 때
	$("button#save,button#delete,button#deleteComplete").click(function () {
		var dataId = $dataIdField.val();
		var dataType = $(this).attr("data-type");
		var crudType = $(this).attr("id"); //button의 id 값 == {save,delete}
		
		if(!confirm(crudType + ": Confirm (" + dataId + ")")) {
			return false;
		}
		
		$.ajax({
			type: "post",
			url: "/site/admin/"+dataType+"/"+crudType+".do",
			data: $("#"+dataType+"Form").serialize(),
			success: function (res) {
				if(res.result == "success") {
					alert(crudType + ": Success (" + dataId + ")");
					
					$("#"+dataType+"Form")[0].reset();
					$("#"+dataType+"Modal").modal('hide');
					location.reload();
				}
			}
		});
	});
}

function searchClickEventHandler() {
	$("button#search").click(function (e) {
		e.preventDefault();
		//getList($("#searchForm").serialize());
		getList();
	});
}

function emailEditor(elem) {
	var emailAddress = $(elem).text();
	$("#emailForm")[0].reset();
	$("#emailModal").modal('show');
	$("input#targetEmail").val(emailAddress);
}

function dataElement(v) {
	var el = $("<div/>",{'class':'row tablelike tablelike-body data-row text-center'});
	
	if(dataType=="customer") {
		el.append( $("<div/>",{'class':'col-xs-1','text':v.rnum}) );
		el.append( $("<div/>",{'class':'col-xs-2','text':v.customerId}) );
		el.append( $("<div/>",{'class':'col-xs-3','html':$("<span/>",{'class':'clickable','data-type':dataType,'data-id':v.customerSq,'onclick':'javascript:showDetail(this);','text':undefStr(v.customerNm)})}) );
		el.append( $("<div/>",{'class':'col-xs-4','text':v.customerMemo}) );
		el.append( $("<div/>",{'class':'col-xs-1','text':undefStr(v.createDt)}) );
		el.append( $("<div/>",{'class':'col-xs-1','text':undefStr(v.updateDt)}) );
	} else if(dataType=="page") {
		el.append( $("<div/>",{'class':'col-xs-1','text':v.rnum}) );
		el.append( $("<div/>",{'class':'col-xs-2','text':v.customerNm}) );
		el.append( $("<div/>",{'class':'col-xs-4','html':$("<span/>",{'class':'clickable','data-type':dataType,'data-id':v.pageSq,'onclick':'javascript:showDetail(this);','text':v.pageNm})}) );
		el.append( $("<div/>",{'class':'col-xs-1','text':v.pagePart}) );
		el.append( $("<div/>",{'class':'col-xs-1','html':$("<a/>",{'target':'_blank','href':(v.pageUrl).replace(/&amp;/gi, "&"),'class':'clickable','text':'Page'})}) );
		el.append( $("<div/>",{'class':'col-xs-1','html':$("<a/>",{'target':'_blank','href':(v.pageEmbedUrl).replace(/&amp;/gi, "&"),'class':'clickable','text':'Embed'})}) );
		el.append( $("<div/>",{'class':'col-xs-1','html':$("<span/>",{'class':'text-primary','text':undefStr(v.createDt)})}) );
		el.append( $("<div/>",{'class':'col-xs-1','html':$("<span/>",{'class':'text-danger','text':undefStr(v.updateDt)})}) );
	} else if(dataType=="contact") {
		el.append( $("<div/>",{'class':'col-xs-1','text':v.rnum}) );
		el.append( $("<div/>",{'class':'col-xs-2','text':undefStr(v.customerNm)}) );
		el.append( $("<div/>",{'class':'col-xs-1','text':undefStr(v.customerId)}) );
		el.append( $("<div/>",{'class':'col-xs-3','html':$("<span/>",{'class':'clickable','data-type':dataType,'data-id':v.contactSq,'onclick':'javascript:showDetail(this);','text':v.contactNm})}) );
		el.append( $("<div/>",{'class':'col-xs-2','text':v.userNm}) );
		el.append( $("<div/>",{'class':'col-xs-3','html':$("<span/>",{'class':'clickable','onclick':'javascript:emailEditor(this);','text':v.email})}) );
	} else if(dataType=="opinion") {
		el.append( $("<div/>",{'class':'col-xs-1','text':v.rnum}) );
		el.append( $("<div/>",{'class':'col-xs-3','html':$("<span/>",{'class':'clickable','data-type':dataType,'data-id':v.opinionSq,'onclick':'javascript:showDetail(this);','text':v.name})}) );
		el.append( $("<div/>",{'class':'col-xs-3','text':v.contact}) );
		el.append( $("<div/>",{'class':'col-xs-3','html':$("<span/>",{'class':'clickable','onclick':'javascript:emailEditor(this);','text':v.email})}) );
		el.append( $("<div/>",{'class':'col-xs-1','html':$("<span/>",{'class':'text-primary','text':undefStr(v.createDt)})}) );
		el.append( $("<div/>",{'class':'col-xs-1','html':$("<span/>",{'class':'text-danger','text':undefStr(v.updateDt)})}) );
	} else if (dataType=="master") {
		el.append( $("<div/>",{'class':'col-xs-1','text':v.rnum}) );
		el.append( $("<div/>",{'class':'col-xs-1','text':undefStr(v.simpleCode)}) );
		el.append( $("<div/>",{'class':'col-xs-3','html':$("<span/>",{'class':'clickable','data-type':dataType,'data-id':v.seqNo,'onclick':'javascript:showDetail(this);','text':v.stdCode})}) );
		el.append( $("<div/>",{'class':'col-xs-3','text':v.codeNameKo}) );
		el.append( $("<div/>",{'class':'col-xs-4','text':v.codeNameEn}) );
	} else if (dataType=="changeHistory") {
		el.append( $("<div/>",{'class':'col-xs-1','text':v.rnum}) );
		el.append( $("<div/>",{'class':'col-xs-1','text':undefStr(v.changeType)}) );
		el.append( $("<div/>",{'class':'col-xs-1','text':undefStr(v.tableName)}) );
		el.append( $("<div/>",{'class':'col-xs-1','text':v.dataSq}) );
		el.append( $("<div/>",{'class':'col-xs-2','html':$("<span/>",{'class':'clickable','data-type':dataType,'data-id':v.dataSq,'onclick':'javascript:showDetail(this);','text':v.columnName})}) );
		el.append( $("<div/>",{'class':'col-xs-2','text':v.oldValue}) );
		el.append( $("<div/>",{'class':'col-xs-3','text':v.newValue}) );
		el.append( $("<div/>",{'class':'col-xs-1','html':$("<span/>",{'class':'text-primary','text':undefStr(v.createDt)})}) );
	}
	if(v.isValid == 'N') $(el).css("background-color","lightgrey");
	return el;
}
