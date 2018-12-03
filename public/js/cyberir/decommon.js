/* 주가지수 롤링 */
function rollPoint(objid){
	var obj=document.getElementById(objid);
	var ul=obj.getElementsByTagName('ul')[0];
	if(!ul.style.marginTop) ul.style.marginTop=0;
	var lis=ul.getElementsByTagName('li');
	var liheight=parseInt(lis[0].offsetHeight);

	function getmargin(){
		return parseInt(ul.style.marginTop)
	}

	function append(){
		var clone=lis[0].cloneNode(true);
		ul.appendChild(clone);
		ul.removeChild(lis[0]);
		ul.style.marginTop=0+'px';
		ul.timer=setTimeout(action,3000);
	}			

	var mg,speed=100;

	function action(){
		clearTimeout(ul.timer);
		mg=getmargin();
		if(mg>-(liheight)){
			mg=Math.floor((-(liheight)-mg)/speed)+mg;
			ul.style.marginTop=mg+'px';
			ul.timer=setTimeout(action,10);
		}else{
			append();
		}
	}
	ul.timer=setTimeout(action,3000);
	document.getElementById('pointBtn').onclick=function(){action();}
}