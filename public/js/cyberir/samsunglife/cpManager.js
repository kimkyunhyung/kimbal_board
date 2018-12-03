//---------------------------------------------------------------------------------------
var sslifv_IfrmUrl;
var sslifv_IEAgent = (navigator.userAgent.toLowerCase().indexOf("msie") != -1);
//---------------------------------------------------------------------------------------

function sslif_DocumentReady() {
	sslif_IframeResize();
}

function sslif_QueryString(strParam) {
	var qrystr = window.location.href;
	var parms = (qrystr.slice(qrystr.indexOf("?") + 1, qrystr.length)).split("&");
	for (var ii = 0; ii < parms.length; ++ii) {
		var idx = parms[ii].indexOf("=");
		if (idx > 0) {
			if (parms[ii].substring(0, idx) == strParam) {
				return decodeURIComponent(parms[ii].substring(idx + 1));
			}
		}
	}
	return "";
}

function sslif_SetCookie(name, value, expires, path, domain, secure) {
	document.cookie = name + "=" + encodeURIComponent(value) + ((expires) ? "; expires=" + expires.toGMTString() : "") + ((path) ? "; path=" + path : "") + ((domain) ? "; domain=" + domain : "") + ((secure) ? "; secure" : "");
}

function sslif_GetCookie(name) {
	var p = name + "=";
	var s = document.cookie.indexOf(p);
	if (s == -1) {
		return "";
	}
	var e = document.cookie.indexOf(";", s + p.length);
	if (e == -1) {
		e = document.cookie.length;
	}
	return (decodeURIComponent(document.cookie.substring(s + p.length, e)));
}

function sslif_GetIfrmUrl() {
	if (sslifv_IfrmUrl) {
		return sslifv_IfrmUrl;
	}
	var domainPrefix = sslif_QueryString('domainPrefix');
	if (domainPrefix) {
		sslif_SetCookie("sslifPrefix", domainPrefix, "", "/");
	} else {
		domainPrefix = sslif_GetCookie("sslifPrefix");
		if (!domainPrefix) {
			domainPrefix = "";
		}
	}
	sslifv_IfrmUrl = window.location.protocol+"//" + domainPrefix + "www.samsunglife.com";
	return sslifv_IfrmUrl;
}

function sslif_IframeResize() {
	var hiddenIframe = document.getElementById('sslifHiddenIframe');
	var divContent = document.getElementById("sslifDivContent");
	var divHeight = (sslifv_IEAgent ? sslif_BodyHeight() : divContent.offsetHeight);
	hiddenIframe.src = sslif_GetIfrmUrl() + "/view/if/cp.jsp?height=" + divHeight;
}

function sslif_BodyHeight() {
	var height, scrollHeight, offsetHeight;
	if (document.height) {
		height = document.height;
	} else if (document.body) {
		if (document.body.scrollHeight) {
			height = scrollHeight = document.body.scrollHeight;
		}
		if (document.body.offsetHeight) {
			height = offsetHeight = document.body.offsetHeight;
		}
		if (scrollHeight && offsetHeight) {
			height = Math.max(scrollHeight, offsetHeight);
		}
	}
	return height;
}

function sslife_GoLoginPage() {
	top.location.href = sslif_GetIfrmUrl() + "/registe/login/loginForm.do";
}

/*사주카페 로그인체크*/
function sslife_CpFortuneLoginCheck () {
	top.location.href = sslif_GetIfrmUrl() + "/comn/cpFortuneLoginCheck.do";
}

/*바이러스 로그인 체크*/
function sslife_CPVirusLoginCheck () {
	top.location.href = sslif_GetIfrmUrl() + "/comn/cpVirusLoginCheck.do";
}

function goCpLoginCheck(cpTemplateIndex,cpPageURL) {
	var cpDetailPageForm = document.cpDetailPageForm;
	cpDetailPageForm.cpPageURL.value = cpPageURL;
	cpDetailPageForm.cpSeq.value = cpTemplateIndex;
	cpDetailPageForm.action = sslif_GetIfrmUrl() + "/comn//cpHealthLoginCheck.do";
	cpDetailPageForm.target = "_top";
	cpDetailPageForm.submit();
}

//--------------------------- document write --------------------------------------------
document.write("<form name='cpDetailPageForm' method='post'>\n");
document.write("<input type='hidden' name='cpPageURL'>\n");
document.write("<input type='hidden' name='cpSeq'>\n");
document.write("<input type='hidden' name='doLoginCheck'>\n");
document.write("</form>\n");
//--------------------------- document write --------------------------------------------

//--------------------------- document ready --------------------------------------------
try {
	if (document.addEventListener) {
		document.addEventListener("DOMContentLoaded", function() {
			document.removeEventListener("DOMContentLoaded", arguments.callee, false);
			sslif_DocumentReady();
		}, false);
	} else if (document.attachEvent) {
		document.attachEvent("onreadystatechange", function(){
			if ( document.readyState === "complete" ) {
				document.detachEvent( "onreadystatechange", arguments.callee );
				sslif_DocumentReady();
			}
		});
	}
} catch (e) {

}
//--------------------------- document ready --------------------------------------------