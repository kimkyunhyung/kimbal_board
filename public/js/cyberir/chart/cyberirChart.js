var cyberirChart = {};

cyberirChart.chartData = {};

cyberirChart.chartData.jangStartTime = "09:00:00";
cyberirChart.chartData.jangEndTime = "15:32:00";
	
function chartReadyHandler(id) {
		var layoutStr = cyberirChart.createLayoutAdv(cyberirChart.chartData);
		document.getElementById(id).setLayout(layoutStr);
		document.getElementById(id).setData(cyberirChart.chartData.data);
}

cyberirChart.drawChartAdv = function (chartParam) {
	/* graphParams Definition
	 * chartParam = {
	 * 	divId: 		<required>   //그래프가 그려질 div id
	 *	code: 		<required>  	//그래프 데이터 코드 : kse, ksd, k200, 005930, ...
	 *	width: 		<required>	//그래프의 width (div와 graph에 공통 적용)
	 *	height: 	<required>	//그래프의 height (div와 graph에 공통 적용)
	 *  chartType: 	<optional> default[d] | mini	 | daily | indexCombine //그래프 유형 설정 (지속 추가)
	 *  -----------------------------
	 *  debug: 		<optional> true | false | undefined[d]	//debug 모드 적용ㅣ true일 경우 데이터를 console.log로 출력
	 *  showLabel: 	<optional> true | false[d]	//Label 표시 모드: true일 경우 그래프 label 표시
	 *  minPercent: <optional> 0.995[d] (0~1)	//그래프 최소값 설정: 데이터 최소값+%
	 *  maxPercent: <optional> 1.005[d] (1~2)	//그래프 최대값 설정: 데이터 최대값+%
	*/

//	if(chartParam.debug) {
//		console.log("====== CHART PARAM =====================================\n");
//		console.log(chartParam);
//		console.log("========================================================\n");
//	}
	
	var $chartDiv = $("#"+chartParam.divId);
	$chartDiv.css("background-color", "white");
	$chartDiv.html("<div style='font-size:11px;text-align:center;width:100%;font-weight:bold;'>Loading...</div>");

	var dataUrl = "/cyberir/chart/data/tick.json";
	if(chartParam.chartType == "candle") dataUrl = "/cyberir/chart/data/history.json";
	
	dataUrl += "?" + (chartParam.queryString || $.param(chartParam)); //데이터 조회 요청에 queryString을 그대로 전달
	
//	if(chartParam.debug) console.log(dataUrl);
	
	$.ajax({
		type: "get",
		url: dataUrl,
		/*data: {"code": chartParam.queryString},*/
 		dataType: "json",
		async: true,
		success: function(result) {

//			if(chartParam.debug) console.log(result);
			
			cyberirChart.setValueAdv(cyberirChart.chartData, result, chartParam); //chart를 그리는데 필요한 추가 값들을 설정하여 cyberirChart.chartData OBJECT 에 저장
			
			var chartVars = "rMateOnLoadCallFunction=chartReadyHandler";

			$chartDiv.html("");
			$chartDiv.css("background-color", "#ffffff");

			rMateChartH5.create("chart1", chartParam.divId, chartVars, "100%", "100%");
		},
		error : function(err) {
//			console.log(err);
			$chartDiv.html("<div style='font-size:11px;text-align:center;width:100%;font-weight:bold;'>Not Ready Yet</div>");
		}
	});
};

cyberirChart.setValueAdv = function (finalParam, result, chartParam) {
	//그래프 설정에 필요한 필요한 각종 파라미터를 chartParam로 받아와서 finalParam에 저장하고 차트 그릴때 사용함
	//<== param 유형 추가 시 finalParam로 옮기는 작업 필수 (디폴트값 설정과 함께)

	//체결가격, 체결량의 min, max 값 구해서 finalParam 에 저장
	//console.log("${cyberirMainInfo.currStockInfo[0].master.simpleCode}");
	finalParam.data = result.graphData; //원본 데이터 저장

	finalParam.width = chartParam.width || '100%';
	finalParam.height = chartParam.height || '100%';
	finalParam.debug = chartParam.debug || false;
	finalParam.showLabel = chartParam.showLabel || false;
//	finalParam.chartType = chartParam.chartType || 'default';
	
	finalParam.chartType = chartParam.chartType || 'line';
	finalParam.dataType = chartParam.dataType || 'stock';
	finalParam.overlay = chartParam.overlay || 'single';
	finalParam.size = chartParam.size || 'default';
	finalParam.style = chartParam.style || 'style1';

	//if(finalParam.chartType == "default" || finalParam.chartType == "mini" || finalParam.chartType == "mini2") {
	if(finalParam.chartType == 'line' && finalParam.overlay == 'single') {

		finalParam.base = result.base || finalParam.data[0].value;
		finalParam.date = finalParam.data[0].time.substring(0,10); //TODO jangtime 작업
		finalParam.low = finalParam.min = finalParam.data.reduce(function(i, j) {
//			console.log(i.value + " " + j.value + " " + (parseFloat(i.value) > parseFloat(j.value)) + " " + (i.value > j.value));
			return parseFloat(i.value) > parseFloat(j.value) ? j : i;
		}).value;
		finalParam.high = finalParam.max = finalParam.data.reduce(function(i, j) {
			return parseFloat(i.value) > parseFloat(j.value) ? i : j;
		}).value;
		finalParam.volmin = finalParam.data.reduce(function(i, j) {
			return parseFloat(i.volume)> parseFloat(j.volume) ? j : i;
		}).volume;
		finalParam.volmax = finalParam.data.reduce(function(i, j) {
			return parseFloat(i.volume) > parseFloat(j.volume) ? i : j;
		}).volume;

		if(chartParam.volmax)
			finalParam.volmax = chartParam.volmax;
		
//		var interval = Math.round((finalParam.max-finalParam.min)/12)*12/12;
		var interval = parseFloat(finalParam.max-finalParam.min)/10;
		finalParam.min -= interval;
		finalParam.max -= -interval;
	//} else if(finalParam.chartType == "3indices") {
	} else if(finalParam.chartType == 'line' && finalParam.overlay == 'double') {
		
		finalParam.base = result.base || finalParam.data[0].value;
		finalParam.date = finalParam.data[0].time.substring(0,10); //TODO jangtime 작업
		finalParam.low1 = finalParam.min1 = finalParam.data.reduce(function(i, j) {
			return parseInt(i.value1) > parseInt(j.value1) ? j : i;
		}).value1;
		finalParam.high1 = finalParam.max1 = finalParam.data.reduce(function(i, j) {
			return parseInt(i.value1) > parseInt(j.value1) ? i : j;
		}).value1;
		finalParam.low2 = finalParam.min2 = finalParam.data.reduce(function(i, j) {
			return parseInt(i.value2) > parseInt(j.value2) ? j : i;
		}).value2;
		finalParam.high2 = finalParam.max2 = finalParam.data.reduce(function(i, j) {
			return parseInt(i.value2) > parseInt(j.value2) ? i : j;
		}).value2;

		finalParam.interval1 = 10;
		finalParam.interval2 = 5;

		var interCount = 3;
		var interval1 = Math.round((finalParam.max1-finalParam.min1)/interCount)*interCount/interCount;
		finalParam.min1 -= interval1;
		finalParam.max1 -= -interval1;

		var interval2 = Math.round((finalParam.max2-finalParam.min2)/interCount)*interCount/interCount;
		finalParam.min2 -= interval2;
		finalParam.max2 -= -interval2;

	} else if(finalParam.chartType == 'line' && finalParam.overlay == 'triple') {
		
		finalParam.base = result.base || finalParam.data[0].value;
		finalParam.date = finalParam.data[0].time.substring(0,10); //TODO jangtime 작업
		finalParam.low1 = finalParam.min1 = finalParam.data.reduce(function(i, j) {
			return parseInt(i.value1) > parseInt(j.value1) ? j : i;
		}).value1;
		finalParam.high1 = finalParam.max1 = finalParam.data.reduce(function(i, j) {
			return parseInt(i.value1) > parseInt(j.value1) ? i : j;
		}).value1;
		finalParam.low2 = finalParam.min2 = finalParam.data.reduce(function(i, j) {
			return parseInt(i.value2) > parseInt(j.value2) ? j : i;
		}).value2;
		finalParam.high2 = finalParam.max2 = finalParam.data.reduce(function(i, j) {
			return parseInt(i.value2) > parseInt(j.value2) ? i : j;
		}).value2;
		finalParam.low3 = finalParam.min3 = finalParam.data.reduce(function(i, j) {
			return parseInt(i.value3) > parseInt(j.value3) ? j : i;
		}).value3;
		finalParam.high3 = finalParam.max3 = finalParam.data.reduce(function(i, j) {
			return parseInt(i.value3) > parseInt(j.value3) ? i : j;
		}).value3;

		finalParam.interval1 = 10;
		finalParam.interval2 = 5;
		finalParam.interval3 = 3;

		var interCount = 3;
		var interval1 = Math.round((finalParam.max1-finalParam.min1)/interCount)*interCount/interCount;
		finalParam.min1 -= interval1;
		finalParam.max1 -= -interval1;

		var interval2 = Math.round((finalParam.max2-finalParam.min2)/interCount)*interCount/interCount;
		finalParam.min2 -= interval2;
		finalParam.max2 -= -interval2;

		var interval3 = Math.round((finalParam.max3-finalParam.min3)/interCount)*interCount/interCount;
		finalParam.min3 -= interval3;
		finalParam.max3 -= -interval3;
	}

	//if(chartParam.debug) console.log(finalParam);
};



//cyberirChart.getElement = function (params) {
//	var src = "";
//	src += "/cyberir/chart/page.do";
//	src += "?params=" + encodeURI(JSON.stringify(params));
//
//	var elem = $(jQuery('<iframe/>', {
//		src: src,
//		scrolling: 'no',
//		framespacing: 0,
//		frameborder: 0,
//		marginheight: 0,
//		marginwidth: 0,
//		vspace: 0,
//		width: params.width,
//		height: params.height
//	}));
//
//	return elem;
//};

cyberirChart.getElementAdv = function (param) {
	// REQUIRED
	// param.queryString (ex) code=kse&code=ksd&width=
	//console.log(param);
	
	var src = "";
	src += "/cyberir/chart/page/"+(param.chartType || 'line')+".do";
	//src += "?param=" + encodeURI(JSON.stringify(param));
	src += "?";//+ (param.queryString || '');
	//console.log(typeof(param.code));
	
	if(typeof(param.code) == 'object') {
		for(var i=0; i<param.code.length; i++) {
			src += "code=" + (param.code[i] || '') + "&";
		}
	} else {
		src += "code=" + (param.code || '') + "&";
	}
	src += "width=" + (param.width || '') + "&";
	src += "height=" + (param.height || '') + "&";
	
	src += "size=" + (param.size || '') + "&";
	src += "debug=" + (param.debug || '') + "&";
	src += "debug=" + (param.debug || '') + "&";
	src += "showLabel=" + (param.showLabel || '') + "&";
	
	//console.log(src);

	var elem = $(jQuery('<iframe/>', {
		src: src,
		scrolling: 'no',
		framespacing: 0,
		frameborder: 0,
		marginheight: 0,
		marginwidth: 0,
		vspace: 0,
		width: param.width,
		height: param.height
	}));

	return elem;
};

cyberirChart.createLayoutAdv = function (chartData) {
	// IE 7,8은 SeriesClip을 지원하지 않음
	//var effect = compIE() ? "SeriesClip" : "SeriesInterpolate";

	var showLabel = chartData.showLabel || false;
	var labelLeftText  = " ";  //왼쪽 y축
	var labelRightText = " "; //오른쪽 y축
	
	if(showLabel == false) {
		chartData.labelLeftText  = labelLeftText;
		chartData.labelRightText = labelRightText;
	} else {
		chartData.labelLeftText  = labelLeftText  = "현재가";
		chartData.labelRightText = labelRightText = "거래량";
	}
	
	var layoutStr = "";
	//var chartType = chartData.chartType;
	//if(chartData.debug) console.log(chartType);
	var visibleItemSize = 50;

//	if(chartData.debug)
//		console.log(chartData.overlay + ", " + chartData.chartType + ", " + chartData.size + ", " + chartData.style);
	
	//if(chartType == "default") {
	if(chartData.overlay == "single" && chartData.chartType == "line" && (chartData.size != "mini" || chartData.width > "200") && chartData.style == "style1") {
		//현재가 기본 차트
		layoutStr += '<rMateChart backgroundColor="#FFFFFF" borderStyle="none"  paddingBottom="10" paddingTop="10">'; //
		layoutStr += '<NumberFormatter id="numfmt" useThousandsSeparator="true" precision="0"/>';
		layoutStr += '<DateFormatter id="dateFmt" formatString="HH"/>';
		layoutStr += '<Combination2DChart showDataTips="true" gutterBottom="24" gutterTop="0" >'; //
		layoutStr += '<horizontalAxis>';
//		layoutStr += '<CategoryAxis id="hAxis" categoryField="time" padding="0.5"/>';
		layoutStr += '<DateTimeAxis id="hAxis" dataUnits="hours" labelUnits="hours" formatter="{dateFmt}" interval="1" displayName="Hour" displayLocalTime="true" padding="0" minimum="'+chartData.date+' '+cyberirChart.chartData.jangStartTime+'" maximum="'+chartData.date+' '+cyberirChart.chartData.jangEndTime+'" />';
		layoutStr += '</horizontalAxis>';
		layoutStr += '<verticalAxis>';
		layoutStr += '<LinearAxis id="vAxis1" formatter="{numfmt}" minimum="'+chartData.min+'" maximum="'+chartData.max+'"/>';
		layoutStr += '<LinearAxis id="vAxis2" formatter="{numfmt}" maximum="'+chartData.volmax+'"/>';// minimum="'+chartData.volmin+'" maximum="'+chartData.volmax+'" labelJsFunction="labelJsFunc";
		//+'<LinearAxis id="vAxis2" baseAtZero="false" formatter="{numfmt}" minimum="'+chartData.volmin+'" maximum="'+chartData.volmax+'" interval="8000"/>'//;
		layoutStr += '</verticalAxis>';
		layoutStr += '<series>';
		layoutStr += '<Column2DSet columWidthRatio="1.5" maxColumnWidth="1.5">'; //
		layoutStr += '<series>';
		layoutStr += '<Column2DSeries xField="time" yField="volume" verticalAxis="{vAxis2}" halfWidthOffset="0.5">';
		layoutStr += '<fill>';
		// 컬럼 차트(거래량) 색깔, 투명도, 굵기 지정;
		layoutStr += '<SolidColor color="#9881C2" alpha="0.7" />'; //#1493ad; C9CDD2; 9881C2;
		layoutStr += '</fill>';
//		layoutStr += '<stroke>';
//		layoutStr += '<Stroke weight="0.1" color="#FFFFFF"/>';
//		layoutStr += '</stroke>';
		layoutStr += '</Column2DSeries>';
		layoutStr += '</series>';
		layoutStr += '</Column2DSet>';
		//+'<Area2DSeries xField="time" yField="value" baseLineMode="true" baseValue="'+chartData.gijunga+'" verticalAxis="{vAxis1}">';
		layoutStr += '<Area2DSeries xField="time" yField="value" baseLineMode="true" baseValue="'+chartData.base+'" verticalAxis="{vAxis1}">';
		//기준선보다 위 전체 그래프선 색 굵기지정, 그라데이션 설정;
		layoutStr += '<areaStroke>';
		layoutStr += '<Stroke color="#DB0000" weight="1" />';
		layoutStr += '</areaStroke>';
		layoutStr += '<areaFill>';
		layoutStr += '<SolidColor color="#F06161" alpha="0.5"/>';
		layoutStr += '</areaFill>';
		//기준선보다 아래쪽 선 색, 굵기 채우기 지정;
		layoutStr += '<areaDeclineStroke>';
		layoutStr += '<Stroke color="#3669CF" weight="1"/>';
		layoutStr += '</areaDeclineStroke>';
		layoutStr += '<areaDeclineFill>';
		layoutStr += '<SolidColor color="#AFE0FF" alpha="0.3"/>';
		layoutStr += '</areaDeclineFill>';
		layoutStr += '</Area2DSeries>';
		layoutStr += '</series>';
		layoutStr += '<annotationElements>';
		layoutStr += '<CanvasElement>';
		layoutStr += '<Label left="0" height="10"  fontWeight="bold" fontFamily="Gulim" color="#1493ad" text="'+chartData.labelLeftText+'" />';
		layoutStr += '<Label right="0" height="10" fontWeight="bold" fontFamily="Gulim" color="#1493ad" text="'+chartData.labelRightText+'" />';
		layoutStr += '</CanvasElement>';
		layoutStr += '<AxisMarker>';
		layoutStr += '<lines>';
		//+ '<AxisLine value="'+chartData.highga+'" lineStyle="dashLine" axis="{vAxis1}" label="'+chartData.lowga+'" labelUpDown="down">';
		layoutStr += '<AxisLine fontFamily="Gulim" fontSize="11" color="#787878" value="'+chartData.high+'" lineStyle="dashLine"  dashLinePattern="3" axis="{vAxis1}" label="'+(chartData.high).format()+'" labelUpDown="down">';
		layoutStr += '<stroke>';
		layoutStr += '<Stroke color="#FF7171" weight="1"/>';
		layoutStr += '</stroke>';
		layoutStr += '</AxisLine>';
		//+ '<AxisLine value="'+chartData.lowga+'" lineStyle="dashLine" axis="{vAxis1}" label="'+chartData.lowga+'" labelUpDown="down">';
		layoutStr += '<AxisLine fontFamily="Gulim" fontSize="11" color="#787878" value="'+chartData.low+'" lineStyle="dashLine"  dashLinePattern="3" axis="{vAxis1}" label="'+(chartData.low).format()+'" labelUpDown="down">';
		layoutStr += '<stroke>';
		layoutStr += '<Stroke color="#6799FF" weight="1"/>';
		layoutStr += '</stroke>';
		layoutStr += '</AxisLine>';
		//+ '<AxisLine value="'+chartData.gijunga+'" lineStyle="dashLine" axis="{vAxis1}" label="'+chartData.gijunga+'" labelUpDown="down">' //기준선;
		layoutStr += '<AxisLine fontFamily="Gulim" fontSize="11" color="#787878" value="'+chartData.base+'" lineStyle="dashLine"  dashLinePattern="3" axis="{vAxis1}" label="'+(chartData.base).format()+'" labelUpDown="down">'; //기준선;
		layoutStr += '<stroke>';
		layoutStr += '<Stroke color="#747474" weight="1"/>'; //;
		layoutStr += '</stroke>';
		layoutStr += '</AxisLine>';
		layoutStr += '</lines>';
		layoutStr += '</AxisMarker>';
		layoutStr += '<CrossRangeZoomer zoomType="both" enableCrossHair="false" enableZooming="true" backgroundColor="#eb494a" borderColor="#eb494a" >';
		layoutStr += '<verticalStroke>';
		layoutStr += '<Stroke color="#eb494a"/>';
		layoutStr += '</verticalStroke>';
		layoutStr += '<horizontalStroke>';
		layoutStr += '<Stroke color="#eb494a"/>';
		layoutStr += '</horizontalStroke>';
		layoutStr += '</CrossRangeZoomer>';
		layoutStr += '</annotationElements>';
		layoutStr += '<backgroundElements>';
		layoutStr += '<GridLines direction="vertical"/>';
		layoutStr += '</backgroundElements>';
		layoutStr += '<verticalAxisRenderers>';
		layoutStr += '<Axis2DRenderer fontFamily="Gulim" fontSize="11" color="#4B4B4B" visible="'+showLabel+'" axis="{vAxis1}" showLine="false" styleName="vAxisLabel1"/>';
		layoutStr += '<Axis2DRenderer fontFamily="Gulim" fontSize="11" color="#4B4B4B" visible="'+showLabel+'" axis="{vAxis2}" showLine="false" styleName="vAxisLabel2"/>';
		layoutStr += '</verticalAxisRenderers>';
		layoutStr += '<horizontalAxisRenderers>';
		layoutStr += '<Axis2DRenderer fontFamily="Gulim" fontSize="11" color="#4B4B4B" axis="{hAxis}" showLabels="true" showLine="true" tickLength="0" styleName="hAxisLabel">';
		layoutStr += '<axisStroke>';
		layoutStr += '<Stroke weight="1" color="#000000"/>';
		layoutStr += '</axisStroke>';
		layoutStr += '</Axis2DRenderer>';
		layoutStr += '</horizontalAxisRenderers>';
		layoutStr += '</Combination2DChart>';
		layoutStr += '</rMateChart>';

	//} else if (chartType == "mini") {
	} else if(chartData.overlay == "single" && chartData.chartType == "line" && (chartData.size == "mini" || chartData.width <= "200") && chartData.style == "style1") {
		layoutStr += '<rMateChart backgroundColor="#FFFFFF" borderStyle="none" paddingBottom="0" paddingLeft="2" paddingRight="1" paddingTop="0">';
		layoutStr += '<NumberFormatter id="numfmt" useThousandsSeparator="true"/>';
		layoutStr += '<DateFormatter id="dateFmt" formatString="HH"/>';
		layoutStr += '<Area2DChart showDataTips="true" gutterBottom="26" gutterLeft="9" gutterRight="0" gutterTop="0" >';
		layoutStr += '<horizontalAxis>';
		layoutStr += '<DateTimeAxis id="hAxis" dataUnits="hours" labelUnits="hours" formatter="{dateFmt}" interval="1" displayName="Hour" alignLabelsToUnits="false" displayLocalTime="true" padding="0" minimum="'+chartData.date+' '+cyberirChart.chartData.jangStartTime+'" maximum="'+chartData.date+' '+cyberirChart.chartData.jangEndTime+'" />';
		layoutStr += '</horizontalAxis>';
		layoutStr += '<verticalAxis>';
		layoutStr += '<LinearAxis id="vAxis1" formatter="{numfmt}" minimum="'+chartData.min+'" maximum="'+chartData.max+'"/>';
		layoutStr += '</verticalAxis>';
		layoutStr += '<series>';
		layoutStr += '<Area2DSeries xField="time" yField="value" baseLineMode="true" baseValue="'+chartData.base+'" verticalAxis="{vAxis1}">';
		//기준선보다 위 전체 그래프선 색 굵기지정, 그라데이션 설정;
		layoutStr += '<areaStroke>';
		layoutStr += '<Stroke color="#DB0000" weight="1" />';
		layoutStr += '</areaStroke>';
		layoutStr += '<areaFill>';
		layoutStr += '<SolidColor color="#F06161" alpha="0.5"/>';
		layoutStr += '</areaFill>';
		//기준선보다 아래쪽 선 색, 굵기 채우기 지정;
		layoutStr += '<areaDeclineStroke>';
		layoutStr += '<Stroke color="#3669CF" weight="1"/>';
		layoutStr += '</areaDeclineStroke>';
		layoutStr += '<areaDeclineFill>';
		layoutStr += '<SolidColor color="#AFE0FF" alpha="0.3"/>';
		layoutStr += '</areaDeclineFill>';
		layoutStr += '</Area2DSeries>';
		layoutStr += '</series>';
		layoutStr += '<annotationElements>';
		layoutStr += '<AxisMarker>';
		layoutStr += '<lines>';
		layoutStr += '<AxisLine fontSize="8" color="#5D5D5D" value="'+chartData.high+'" lineStyle="dashLine" dashLinePattern="3" axis="{vAxis1}" label="'+(chartData.high).format()+'" labelUpDown="down">';
		layoutStr += '<stroke>';
		layoutStr += '<Stroke color="#FF7171" weight="1"/>';
		layoutStr += '</stroke>';
		layoutStr += '</AxisLine>';
		layoutStr += '<AxisLine fontSize="8" color="#5D5D5D" value="'+chartData.low+'" lineStyle="dashLine" dashLinePattern="3" axis="{vAxis1}" labelAlign="right" label="'+(chartData.low).format()+'" labelUpDown="down">';
		layoutStr += '<stroke>';
		layoutStr += '<Stroke color="#6799FF" weight="1"/>';
		layoutStr += '</stroke>';
		layoutStr += '</AxisLine>';
		layoutStr += '<AxisLine fontSize="8" color="#5D5D5D" value="'+chartData.base+'" lineStyle="dashLine" dashLinePattern="3" axis="{vAxis1}" label="'+(chartData.base).format()+'" labelUpDown="down">'; //기준선;
		layoutStr += '<stroke>';
		layoutStr += '<Stroke color="#747474" weight="1"/>'; //;
		layoutStr += '</stroke>';
		layoutStr += '</AxisLine>';
		layoutStr += '</lines>';
		layoutStr += '</AxisMarker>';
		layoutStr += '</annotationElements>';
		layoutStr += '<backgroundElements>';
		layoutStr += '<GridLines direction="vertical"/>';
		layoutStr += '</backgroundElements>';
		layoutStr += '<verticalAxisRenderers>';
		layoutStr += '<Axis2DRenderer visible="'+showLabel+'" axis="{vAxis1}" showLine="false"/>';
		layoutStr += '</verticalAxisRenderers>';
		layoutStr += '<horizontalAxisRenderers>';
		layoutStr += '<Axis2DRenderer axis="{hAxis}" showLabels="true" showLine="true" tickLength="0" styleName="hAxisLabel-mini">';
		layoutStr += '<axisStroke>';
		layoutStr += '<Stroke weight="1.3" color="#5D5D5D"/>';
		layoutStr += '</axisStroke>';
		layoutStr += '</Axis2DRenderer>';
		layoutStr += '</horizontalAxisRenderers>';
		layoutStr += '</Area2DChart>';
		layoutStr += '</rMateChart>';

	//} else if (chartType == "mini2") {
	} else if(chartData.overlay == "single" && chartData.chartType == "line" && (chartData.size == "mini" || chartData.width <= "200") && chartData.style == "style2") {
		//KOSPI KOSDAQ 기준선 영역 채우지는 그래프
		layoutStr += '<rMateChart backgroundColor="#FFFFFF" borderStyle="none" paddingBottom="0" paddingLeft="2" paddingRight="1" paddingTop="0">';
		layoutStr += '<NumberFormatter id="numfmt" useThousandsSeparator="true"/>';
		layoutStr += '<DateFormatter id="dateFmt" formatString="HH"/>';
		layoutStr += '<Area2DChart showDataTips="true" gutterBottom="23" gutterLeft="6" gutterRight="0" gutterTop="0" >';
		layoutStr += '<horizontalAxis>';
		layoutStr += '<DateTimeAxis id="hAxis" dataUnits="hours" labelUnits="hours" formatter="{dateFmt}" interval="1" displayName="Hour" alignLabelsToUnits="false" displayLocalTime="true" padding="0" minimum="'+chartData.date+' '+cyberirChart.chartData.jangStartTime+'" maximum="'+chartData.date+' '+cyberirChart.chartData.jangEndTime+'" />';
		layoutStr += '</horizontalAxis>';
		layoutStr += '<verticalAxis>';
		layoutStr += '<LinearAxis id="vAxis1" formatter="{numfmt}" minimum="'+chartData.min+'" maximum="'+chartData.max+'"/>';
		layoutStr += '</verticalAxis>';
		layoutStr += '<series>';
		layoutStr += '<Area2DSeries xField="time" yField="value" baseLineMode="true" baseValue="'+chartData.base+'" verticalAxis="{vAxis1}">';
		//기준선보다 위 전체 그래프선 색 굵기지정, 그라데이션 설정;
		layoutStr += '<areaStroke>';
		layoutStr += '<Stroke color="#DB0000" weight="1" />';
		layoutStr += '</areaStroke>';
		layoutStr += '<areaFill>';
		layoutStr += '<SolidColor color="#F06161" alpha="0.5"/>';
		layoutStr += '</areaFill>';
		//기준선보다 아래쪽 선 색, 굵기 채우기 지정;
		layoutStr += '<areaDeclineStroke>';
		layoutStr += '<Stroke color="#3669CF" weight="1"/>';
		layoutStr += '</areaDeclineStroke>';
		layoutStr += '<areaDeclineFill>';
		layoutStr += '<SolidColor color="#AFE0FF" alpha="0.3"/>';
		layoutStr += '</areaDeclineFill>';
		layoutStr += '</Area2DSeries>';
		layoutStr += '</series>';
		layoutStr += '<annotationElements>';
		layoutStr += '<AxisMarker>';
		layoutStr += '<lines>';
		layoutStr += '<AxisLine fontSize="8" color="#5D5D5D" value="'+chartData.high+'" lineStyle="dashLine" dashLinePattern="3" axis="{vAxis1}" label="'+(chartData.high).format()+'" labelUpDown="down">';
		layoutStr += '<stroke>';
		layoutStr += '<Stroke color="#FF7171" weight="1"/>';
		layoutStr += '</stroke>';
		layoutStr += '</AxisLine>';
		layoutStr += '<AxisLine fontSize="8" color="#5D5D5D" value="'+chartData.low+'" lineStyle="dashLine" dashLinePattern="3" axis="{vAxis1}" labelAlign="right" label="'+(chartData.low).format()+'" labelUpDown="down">';
		layoutStr += '<stroke>';
		layoutStr += '<Stroke color="#6799FF" weight="1"/>';
		layoutStr += '</stroke>';
		layoutStr += '</AxisLine>';
		layoutStr += '<AxisLine fontSize="8" color="#5D5D5D" value="'+chartData.base+'" lineStyle="dashLine" dashLinePattern="3" axis="{vAxis1}" label="'+(chartData.base).format()+'" labelUpDown="down">'; //기준선;
		layoutStr += '<stroke>';
		layoutStr += '<Stroke color="#747474" weight="1"/>'; //;
		layoutStr += '</stroke>';
		layoutStr += '</AxisLine>';
		layoutStr += '</lines>';
		layoutStr += '</AxisMarker>';
		layoutStr += '</annotationElements>';
		layoutStr += '<backgroundElements>';
		layoutStr += '<GridLines direction="vertical"/>';
		layoutStr += '</backgroundElements>';
		layoutStr += '<verticalAxisRenderers>';
		layoutStr += '<Axis2DRenderer visible="'+showLabel+'" axis="{vAxis1}" showLine="false"/>';
		layoutStr += '</verticalAxisRenderers>';
		layoutStr += '<horizontalAxisRenderers>';
		layoutStr += '<Axis2DRenderer axis="{hAxis}" showLabels="true" showLine="true" tickLength="0" styleName="hAxisLabel-mini">';
		layoutStr += '<axisStroke>';
		layoutStr += '<Stroke weight="1.3" color="#5D5D5D"/>';
		layoutStr += '</axisStroke>';
		layoutStr += '</Axis2DRenderer>';
		layoutStr += '</horizontalAxisRenderers>';
		layoutStr += '</Area2DChart>';
		layoutStr += '</rMateChart>';

//	} else if(chartType == "daily") {
	} else if(chartData.overlay == "single" && chartData.chartType == "candle" &&  (chartData.size != "mini" || chartData.width > 200) && chartData.style == "style1") {
		//TODO
		layoutStr += '<rMateChart backgroundColor="#FFFFFF"  borderStyle="none">';
		layoutStr += '<NumberFormatter id="nft" precision="0"/>';
		layoutStr += '<DateFormatter id="dateFmt" formatString="MM/DD"/>';
		layoutStr += '<DualChart leftGutterSyncEnable="true" rightGutterSyncEnable="true">';
		//MainChart 시작
		layoutStr += '<mainChart>';
		layoutStr += '<Candlestick2DChart showDataTips="true" paddingBottom="0" dataTipDisplayMode="axis">';
		layoutStr += '<horizontalAxis>';
		layoutStr += '<CategoryAxis id="hAxis" categoryField="fmtTradeDate" labelJsFunction="labelFunc" />';
		layoutStr += '</horizontalAxis>';
		layoutStr += '<verticalAxis>';
		layoutStr += '<LinearAxis id="vAxis" baseAtZero="false" formatter="{nft}"/>';
		layoutStr += '</verticalAxis>';
		//시가 종가 상한가 하한가 표현
		layoutStr += '<series>';
		layoutStr += '<Candlestick2DSeries openField="openPrice" closeField="closePrice" highField="highPrice" lowField="lowPrice" fontFamily="Gulim" fontSize="11" color="#4B4B4B" showMinValueLabel="true" showMaxValueLabel="true" showTrendLine="true" trendLineType="logarithmic">';
		layoutStr += '<fill>';
		layoutStr += '<SolidColor color="#ff0000"/>';
		layoutStr += '</fill>';
		layoutStr += '<stroke>';
		layoutStr += '<Stroke color="#ff0000"/>';
		layoutStr += '</stroke>';
		layoutStr += '<boxStroke>';
		layoutStr += '<Stroke color="#ff0000"/>';
		layoutStr += '</boxStroke>';
		layoutStr += '<declineFill>';
		layoutStr += '<SolidColor color="#0000ff"/>';
		layoutStr += '</declineFill>';
		layoutStr += '<declineStroke>';
		layoutStr += '<Stroke color="#0000ff"/>';
		layoutStr += '</declineStroke>';
		layoutStr += '<declineBoxStroke>';
		layoutStr += '<Stroke color="#0000ff"/>';
		layoutStr += '</declineBoxStroke>';
		layoutStr += '</Candlestick2DSeries>';
		layoutStr += '</series>';
		//MainChart 의 수평축 관련
		layoutStr += '<horizontalAxisRenderers>';
		layoutStr += '<Axis2DRenderer fontFamily="Gulim" fontSize="11" color="#4B4B4B" placement="bottom" axis="{hAxis}" formatter="{dateFmt}" tickLength="0" showLine="true">';
		layoutStr += '<axisStroke>';
		layoutStr += '<Stroke weight="1.7" color="#000000"/>';
		layoutStr += '</axisStroke>';
		layoutStr += '</Axis2DRenderer>';
		layoutStr += '</horizontalAxisRenderers>';
		layoutStr += '<verticalAxisRenderers>';
		layoutStr += '<Axis2DRenderer fontFamily="Gulim" fontSize="11" color="#4B4B4B" placement="left" axis="{vAxis}" showLine="false"/>';
		layoutStr += '</verticalAxisRenderers>';
		//MainChart의 Zooming 십자선 관련
		layoutStr += '<annotationElements>';
		layoutStr += '<CrossRangeZoomer id="candleCRZ" enableZooming="false" syncCrossRangeZoomer="{columnCRZ}" zoomType="both" horizontalLabelFormatter="{nft}">';
		//십자선을 빨간색으로 변경
//		layoutStr += '<verticalStroke>';
//		layoutStr += '<Stroke color="#eb494a" />';
//		layoutStr += '</verticalStroke>';
//		layoutStr += '<horizontalStroke>';
//		layoutStr += '<Stroke color="#eb494a" />';
//		layoutStr += '</horizontalStroke>';
		layoutStr += '</CrossRangeZoomer>';
		layoutStr += '</annotationElements>';
		// 백그라운드 그리드라인 vertical, horizontal, both 선택
		layoutStr += '<backgroundElements>';
		layoutStr += '<GridLines direction="both"/>';
		layoutStr += '</backgroundElements>';
		layoutStr += '</Candlestick2DChart>';
		layoutStr += '</mainChart>';
		//subChart 시작
		layoutStr += '<subChart>';
		layoutStr += '<Column2DChart showDataTips="true" height="20%" paddingTop="0" paddingBottom="0" gutterTop="6" gutterBottom="6">';
		layoutStr += '<horizontalAxis>';
		layoutStr += '<CategoryAxis id="hAxis" categoryField="fmtTradeDate" labelJsFunction="labelFunc"/>';
		layoutStr += '</horizontalAxis>';
		layoutStr += '<verticalAxis>';
		layoutStr += '<LinearAxis id="vAxis" formatter="{nft}"/>';
		layoutStr += '</verticalAxis>';
		layoutStr += '<series>';
		//Column 꾸미기 관련
		layoutStr += '<Column2DSeries yField="volume" itemRenderer="BoxItemRenderer">';
		layoutStr += '<fill>';
		layoutStr += '<SolidColor color="#00c0c7"/>';
		layoutStr += '</fill>';
		layoutStr += '</Column2DSeries>';
		layoutStr += '</series>';
		//subChart 의 수평축
		layoutStr += '<horizontalAxisRenderers>';
		layoutStr += '<Axis2DRenderer fontFamily="Gulim" fontSize="11" color="#4B4B4B" placement="bottom" axis="{hAxis}" formatter="{dateFmt}" showLine="true" showLabels="false" tickLength="0">';
		layoutStr += '<axisStroke>';
		layoutStr += '<Stroke weight="1.8" color="#000000"/>';
		layoutStr += '</axisStroke>';
		layoutStr += '</Axis2DRenderer>';
		layoutStr += '</horizontalAxisRenderers>';
		layoutStr += '<verticalAxisRenderers>';
		layoutStr += '<Axis2DRenderer fontFamily="Gulim" fontSize="11" color="#4B4B4B" placement="left" axis="{vAxis}" showLine="false"/>';
		layoutStr += '</verticalAxisRenderers>';
		//subChart 의 Zooming 십자선 관련
		layoutStr += '<annotationElements>';
		layoutStr += '<CrossRangeZoomer id="columnCRZ" syncCrossRangeZoomer="{candleCRZ}" zoomType="horizontal" verticalLabelPlacement="top" horizontalLabelFormatter="{nft}">';
		// 십자선을 빨간색으로 변경
//		layoutStr += '<verticalStroke>';
//		layoutStr += '<Stroke color="#eb494a" />';
//		layoutStr += '</verticalStroke>';
//		layoutStr += '<horizontalStroke>';
//		layoutStr += '<Stroke color="#eb494a" />';
//		layoutStr += '</horizontalStroke>';
		layoutStr += '</CrossRangeZoomer>';
		layoutStr += '</annotationElements>';
		layoutStr += '<backgroundElements>';
		// 백그라운드 그리드라인 vertical, horizontal, both 선택
		layoutStr += '<GridLines direction="both"/>';
		layoutStr += '</backgroundElements>';
		layoutStr += '</Column2DChart>';
		layoutStr += '</subChart>';
		layoutStr += '<dataSelector>';
		layoutStr += '<DualScrollBar visibleItemSize="'+visibleItemSize+'"/>';
		layoutStr += '</dataSelector>';
		layoutStr += '</DualChart>';
		layoutStr += '</rMateChart>';
		
	//} else if (chartType == "3indices") {
	} else if(chartData.overlay == "triple" && chartData.chartType == "line" && chartData.style == "style1") {

		//layoutStr += '<rMateChart backgroundColor="#FFFFFF" borderStyle="solid" borderColor="#B0B0B0" borderThickness="1" paddingBottom="0" paddingLeft="0" paddingRight="0" paddingTop="0">';
		layoutStr += '<rMateChart backgroundColor="#FFFFFF" borderStyle="solid" borderColor="#fff" borderThickness="0.5" paddingBottom="0" paddingLeft="0" paddingRight="0" paddingTop="0">';
		layoutStr += '<Options>';
		//Legend
		layoutStr += '<Legend fontFamily="Gulim" position="top" direction="horizontal" useVisibleCheck="true" labelPlacement="right" backgroundColor="#FFFFFF" fontSize="10" verticalGap="0" horizontalGap="2"/>';
		layoutStr += '</Options>';
		layoutStr += '<NumberFormatter id="numfmt" useThousandsSeparator="true"/>';
		layoutStr += '<DateFormatter id="dateFmt" formatString="HH"/>';
		layoutStr += '<Line2DChart showDataTips="true" gutterBottom="26" gutterRight="0" gutterLeft="12" >';
		layoutStr += '<horizontalAxis>';
		layoutStr += '<DateTimeAxis id="hAxis" dataUnits="hours" labelUnits="hours" formatter="{dateFmt}" interval="1" displayName="Hour" alignLabelsToUnits="false" displayLocalTime="true" padding="0" minimum="'+chartData.date+' '+cyberirChart.chartData.jangStartTime+'" maximum="'+chartData.date+' '+cyberirChart.chartData.jangEndTime+'" />';
		layoutStr += '</horizontalAxis>';
		layoutStr += '<series>';
		//KOSPI 관련
		layoutStr += '<Line2DSeries xField="time" yField="value1" displayName="KOSPI">';
		layoutStr += '<verticalAxis>';
		layoutStr += '<LinearAxis id="vAxis1" formatter="{numfmt}" baseAtZero="false" interval="3"/>' ; //
		layoutStr += '</verticalAxis>';
		//라인 색상
		layoutStr += '<lineStroke>';
		layoutStr += '<Stroke color="#ED0000" weight="1"/>' ;
		layoutStr += '</lineStroke>';
		layoutStr += '</Line2DSeries>';
		//KOSDAQ 관련
		layoutStr += '<Line2DSeries xField="time" yField="value2" displayName="KOSDAQ" >';
		layoutStr += '<verticalAxis>';
		layoutStr += '<LinearAxis id="vAxis2" formatter="{numfmt}" baseAtZero="false" interval="3"/>' ;
		layoutStr += '</verticalAxis>';
		//라인 색상
		layoutStr += '<lineStroke>';
		layoutStr += '<Stroke color="#1266FF" weight="1"/>' ;
		layoutStr += '</lineStroke>';
		layoutStr += '</Line2DSeries>';
		//K200 관련
		layoutStr += '<Line2DSeries xField="time" yField="value3" displayName="K200" >';
		layoutStr += '<verticalAxis>';
		layoutStr += '<LinearAxis id="vAxis3" formatter="{numfmt}" baseAtZero="false" interval="3"/>' ;
		layoutStr += '</verticalAxis>';
		//라인 색상
		layoutStr += '<lineStroke>';
		layoutStr += '<Stroke color="#8748E1" weight="1"/>' ;
		layoutStr += '</lineStroke>';
		layoutStr += '</Line2DSeries>';
		layoutStr += '</series>';
		layoutStr += '<backgroundElements>';
		layoutStr += '<GridLines direction="vertical"/>';
		layoutStr += '</backgroundElements>';
		//KOSPI 축 관련
		layoutStr += '<verticalAxisRenderers>' ;
		layoutStr += '<Axis2DRenderer axis="{vAxis1}" placement="left" showLine="false" showLabels="false" >' ;
		layoutStr += '<axisStroke>';
		layoutStr += '<Stroke color="#CC3D3D" weight="3" caps="none"/>';
		layoutStr += '</axisStroke>';
		layoutStr += '</Axis2DRenderer>';
		//KOSDAQ 축 관련
		layoutStr += '<Axis2DRenderer axis="{vAxis2}" placement="right" showLine="false" showLabels="false" >';
		layoutStr += '<axisStroke>';
		layoutStr += '<Stroke color="#4374D9" weight="3" caps="none"/>';
		layoutStr += '</axisStroke>';
		layoutStr += '</Axis2DRenderer>';
		//K200 축 관련
		layoutStr += '<Axis2DRenderer axis="{vAxis3}" placement="right" showLine="false" showLabels="false" >';
		layoutStr += '<axisStroke>';
		layoutStr += '<Stroke color="#5D5D5D" weight="3" caps="none"/>';
		layoutStr += '</axisStroke>';
		layoutStr += '</Axis2DRenderer>';
		layoutStr += '</verticalAxisRenderers>';
		//수평 축 (시간)
		layoutStr += '<horizontalAxisRenderers>';
		layoutStr += '<Axis2DRenderer fontFamily="Gulim" fontSize="11" axis="{hAxis}" showLabels="true" showLine="true" tickLength="0" styleName="hAxisLabel-3indices">';
		layoutStr += '<axisStroke>';
		layoutStr += '<Stroke weight="1.3" color="#747474"/>';
		layoutStr += '</axisStroke>';
		layoutStr += '</Axis2DRenderer>';
		layoutStr += '</horizontalAxisRenderers>';
		//Zoomming 십자선 표현
		layoutStr += '<annotationElements>';
		layoutStr += '<CrossRangeZoomer zoomType="horizontal" enableCrossHair="false" horizontalLabelFormatter="{dateFmt}" enableZooming="true" backgroundColor="#eb494a" borderColor="#eb494a">';
		layoutStr += '<verticalStroke>';
		layoutStr += '<Stroke color="#eb494a" />';
		layoutStr += '</verticalStroke>';
		layoutStr += '<horizontalStroke>';
		layoutStr += '<Stroke color="#eb494a" />';
		layoutStr += '</horizontalStroke>';
		layoutStr += '</CrossRangeZoomer>';
		layoutStr += '</annotationElements>';
		layoutStr += '</Line2DChart>';
		layoutStr += '</rMateChart>';

	//}else if (chartType == "2indices") {
	} else if(chartData.overlay == "double" && chartData.chartType == "line" && chartData.style == "style1") {
		layoutStr +='<rMateChart backgroundColor="#FFFFFF" borderStyle="solid" borderColor="#B0B0B0" borderThickness="1" paddingBottom="0" paddingLeft="0" paddingRight="0" paddingTop="0">';
		layoutStr +='<Options>';
		//Legend
		layoutStr +='<Legend fontFamily="Gulim" position="top" direction="horizontal" useVisibleCheck="true" labelPlacement="right" backgroundColor="#FFFFFF" fontSize="11" verticalGap="1" horizontalGap="4"/>';
		layoutStr +='</Options>';
		layoutStr +='<NumberFormatter id="numfmt" useThousandsSeparator="true"/>';
		layoutStr +='<DateFormatter id="dateFmt" formatString="HH"/>';
		layoutStr +='<Area2DChart showDataTips="true" dataTipDisplayMode="axis" gutterRight="10" gutterBottom="26">';
		layoutStr +='<horizontalAxis>';
		layoutStr +='<DateTimeAxis id="hAxis" dataUnits="hours" labelUnits="hours" formatter="{dateFmt}" interval="1" displayName="Hour" alignLabelsToUnits="false" displayLocalTime="true" padding="0" minimum="'+chartData.date+' '+cyberirChart.chartData.jangStartTime+'" maximum="'+chartData.date+' '+cyberirChart.chartData.jangEndTime+'" />';
		layoutStr +='</horizontalAxis>';
		layoutStr +='<verticalAxis>';
		layoutStr +='<LinearAxis />';
		layoutStr +='</verticalAxis>';
		//KOSPI
		layoutStr +='<series>';
		layoutStr +='<Area2DSeries xField="time" yField="value1" displayName="KOSPI">';
		layoutStr +='<verticalAxis>';
		layoutStr +='<LinearAxis id="vAxis1" formatter="{numfmt}" baseAtZero="false" interval="3"/>' ; //
		layoutStr +='</verticalAxis>';
		//KOSPI 색상 관련
		layoutStr +='<areaStroke>';
		layoutStr +='<Stroke color="#F74D4D" weight="1"/>' ;
		layoutStr +='</areaStroke>';
		layoutStr +='<areaFill>';
		layoutStr +='<SolidColor color="#F74D4D" alpha="0.5"/>';
		layoutStr +='</areaFill>';
		layoutStr +='</Area2DSeries>';
		//KOSDAQ
		layoutStr +='<Area2DSeries xField="time" yField="value2" displayName="KOSDAQ">';
		layoutStr +='<verticalAxis>';
		layoutStr +='<LinearAxis id="vAxis2" formatter="{numfmt}" baseAtZero="false" interval="3"/>' ;
		layoutStr +='</verticalAxis>';
		//KOSDAQ 색상 관련
		layoutStr +='<areaStroke>';
		layoutStr +='<Stroke color="#277CFB" weight="1"/>' ;
		layoutStr +='</areaStroke>';
		layoutStr +='<areaFill>';
		layoutStr +='<SolidColor color="#277CFB" alpha="0.5"/>';
		layoutStr +='</areaFill>';
		layoutStr +='</Area2DSeries>';
		layoutStr +='</series>';
		//backGround 그리드라인
		layoutStr +='<backgroundElements>';
		layoutStr +='<GridLines direction="vertical"/>';
		layoutStr +='</backgroundElements>';
		//KOSPI 수직 축 관련
		layoutStr +='<verticalAxisRenderers>' ;
		layoutStr +='<Axis2DRenderer axis="{vAxis1}" placement="left" showLine="false" showLabels="false" >' ;
		layoutStr +='<axisStroke>';
		layoutStr +='<Stroke color="#F74D4D" weight="1.5" caps="none"/>';
		layoutStr +='</axisStroke>';
		layoutStr +='</Axis2DRenderer>';
		//KOSDAQ 수직 축 관련
		layoutStr +='<Axis2DRenderer axis="{vAxis2}" placement="right" showLine="false" showLabels="false" >';
		layoutStr +='<axisStroke>';
		layoutStr +='<Stroke color="#277CFB" weight="1.5" caps="none"/>';
		layoutStr +='</axisStroke>';
		layoutStr +='</Axis2DRenderer>';
		layoutStr +='</verticalAxisRenderers>';
		// 수평축 (시간)
		layoutStr +='<horizontalAxisRenderers>';
		layoutStr +='<Axis2DRenderer fontFamily="Gulim" fontSize="11" axis="{hAxis}" showLabels="true" showLine="true" tickLength="0" styleName="hAxisLabel-2indices">';
		layoutStr +='<axisStroke>';
		layoutStr +='<Stroke weight="1.3" color="#747474"/>';
		layoutStr +='</axisStroke>';
		layoutStr +='</Axis2DRenderer>';
		layoutStr +='</horizontalAxisRenderers>';
		//Zoomming 십자선 관련
		layoutStr +='<annotationElements>';
		layoutStr +='<CrossRangeZoomer zoomType="horizontal" enableCrossHair="false" horizontalLabelFormatter="{dateFmt}" enableZooming="true" backgroundColor="#eb494a" borderColor="#eb494a">';
		layoutStr +='<verticalStroke>';
		layoutStr +='<Stroke color="#eb494a" />';
		layoutStr +='</verticalStroke>';
		layoutStr +='<horizontalStroke>';
		layoutStr +='<Stroke color="#eb494a" />';
		layoutStr +='</horizontalStroke>';
		layoutStr +='</CrossRangeZoomer>';
		layoutStr +='</annotationElements>';
		layoutStr +='</Area2DChart>';
		layoutStr +='</rMateChart>';

	} else { //특별히 스타일이 지정되지 않은 경우
		
		
	}

	return layoutStr;
};

//이미지 로컬 다운로드 - TEST
cyberirChart.downloadImage = function (imageName) {
	rMateChartH5.downloadToLocal(imageName, "png", "/rMateChartH5/Samples/SnapshotServerSamples/downloadLocal.jsp", function () {
		return document.getElementById("chart1").saveAsImage();
	});
};

cyberirChart.getSnapshot = function (imageName) {
    if(compIE()) {
		// 차트의 스냅샷을 base64인코딩 형태로 얻습니다.
        // base64로 인코딩 된 차트 이미지를 리턴합니다.
        var base64src = document.getElementById("chart1").getSnapshot();
        $.ajax({
        	url: "/cyberir/chart/getImageSnapshot.do",
        	type: "post",
        	data: {
        		data: base64src,
        		fileName: imageName
        	},
        	success: function (res) {
//        		console.log(res);
        	},
        	error: function (err) {
//        		console.log(err);
        	}
        });
    }
};

function compIE() {
	var agent = navigator.userAgent;
	if (agent.indexOf("MSIE 7.0") > -1 || agent.indexOf("MSIE 8.0") > -1
			|| agent.indexOf("Trident 4.0") > -1)
		return false;

	if (document.documentMode && document.documentMode <= 5)
		return false;

	return true;
};

Number.prototype.format = function () {
	if (this == 0) return 0;
	var reg = /(^[+-]?\d+)(\d{3})/;
	var n = Math.round(this*100)/100 + '';

	while (reg.test(n)) n = n.replace(reg, '$1' + ',' + '$2');
	return n;
};

String.prototype.format = function () {
	var num = parseFloat(this);
	if(isNaN(num)) return "0";
	return num.format();
};