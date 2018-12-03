function comma(str) {
      str = String(str);
      return str.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
}

//0:장전,1:장중,2:장마감,-1:에러
function marketStatus(jangFlag) {
	var status = "";

	if (jangFlag == 0) {
		status = "장전";
	}
	else if (jangFlag == 1) {
		status = "장중";
	}
	else if (jangFlag == 2) {
		status = "장마감";
	}
	else if (jangFlag == -1) {
		status = "";
	}

	//console.log(status);
	return status;
}

var intervalFuncId;
$(function() {
    getStockData();
    intervalFuncId = setInterval(function(){
        $("#curPrc").fadeOut("fast");
        $("#upDownPoint").fadeOut("fast");
        $("#upDownRate").fadeOut("fast");
        $("#volume").fadeOut("fast");

        getStockData();
    }, 300000);
 });

function getStockData() {
  var params = {
     custId: 130660,
     pagePart: 3
  };

  $.ajax({
    url: '/cyberir/main.json',
    data: params,
    type: 'get',
    dataType: 'json',
    success: function(data) {
      //console.log(data);
      var jangFlag = data.cyberirMainInfo.jangFlag;
      var currentTime = data.cyberirMainInfo.currentTime;
      var currentPrice = data.cyberirMainInfo.currStockInfo[0].current.close;
      var upDownPoint = data.cyberirMainInfo.currStockInfo[0].current.upDownPoint;
      var upDownRate = data.cyberirMainInfo.currStockInfo[0].current.upDownRate;
      var upDownRateAbs = data.cyberirMainInfo.currStockInfo[0].current.upDownRateAbs;
      var upDownFlag = data.cyberirMainInfo.currStockInfo[0].current.upDownFlag;
      var volume = data.cyberirMainInfo.currStockInfo[0].current.volume;

      var formattedTime = "";

      if (jangFlag == 1) {
    	  formattedTime = 	currentTime.substring(0,2) + ":" +
          					currentTime.substring(2,4) + ":" +
          					currentTime.substring(4,6);
      } else {
    	  formattedTime = marketStatus(jangFlag);
      }

      var upDownSign = "";
      var upDownColor = "";
      if (upDownPoint > 0) {
        upDownSign = "▲";
        upDownColor = "price_up_color";
      }
      else if (upDownPoint < 0){
        upDownSign = "▼";
        upDownColor = "price_dw_color";
      }

      $("#jangFlag").text(formattedTime);
      $("#curPrc").text(comma(currentPrice));
      $("#upDownPoint").text(upDownSign + " " + comma(Math.abs(upDownPoint)));

      //$("#upDownRate").text(upDownSign + " " + Math.abs(upDownRate));
      $("#upDownRate").text(upDownSign + " " + upDownRateAbs);
      $("#volume").text(comma(volume));

      $("#upDownPoint").removeClass("price_up_color");
      $("#upDownPoint").removeClass("price_dw_color");
      $("#upDownPoint").addClass(upDownColor);

      $("#curPrc").fadeIn("slow");
      $("#upDownPoint").fadeIn("slow");
      $("#upDownRate").fadeIn("slow");
      $("#volume").fadeIn("slow");

      if (jangFlag == 2) {
    	  clearInterval(intervalFuncId);
      }
    }
  });
}