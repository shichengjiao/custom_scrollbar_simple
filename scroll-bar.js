/*
.scrollbar
.scrollbar-wrap
.scrollbar-bar
.scrollbar-slide
.scrollbar-bar-x
.scrollbar-slide-x
*/

if(!window.requestAnimationFrame){
	window.requestAnimationFrame = (function(){
		return  window.mozRequestAnimationFrame ||
				window.webkitRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				function(fn){setTimeout(fn,1000/60)};
	})();
}

function initScrollBarStyle(css){
	var style = document.createElement("style"),
	head = document.getElementsByTagName('head')[0];
	head.insertBefore(style,head.firstChild);
	style.type = "text/css";
	if(style.styleSheet){
		style.styleSheet.cssText = css;
	}else{
		style.innerHTML = css;
	}
}

initScrollBarStyle(
	"html{height:100%;overflow:hidden;}body{height:100%;}" +
	".scrollbar{position:relative;overflow:hidden;}" + 
	".scrollbar-wrap{height:100%;width:100%;overflow:auto;}" +
	".scrollbar-bar{right:0;top:0;height:100%;width:8px;}" +
	".scrollbar-slide{width:100%;background:#666;}" + 

	".scrollbar-bar-x{left:0;bottom:0;width:100%;height:8px;}" +
	".scrollbar-slide-x{height:100%;background:#666;}" + 

	".scrollbar-bar,.scrollbar-bar-x{position:absolute;background:transparent;transition:background 0.3s,height 0.3s,width 0.3s;}" +
	".scrollbar-bar:hover{background:#ccc;}.scrollbar-bar-x:hover{background:#ccc;");

function ScrollBar(el,opt){
	this.opt = opt || {};
	this.init(el);
}

ScrollBar.prototype = {
	isIE : document.addEventListener ? false : true,
	bind : function(el,type,fn){
		if(el.addEventListener){
			el.addEventListener(type, fn, false);
		}else{
			el.attachEvent("on" + type, function(){
				fn.id = arguments.callee;
				var e = window.event;
				e.preventDefault = function(){
					this.returnValue = true;
				};
				e.stopPropagation = function(){
					this.cancelBubble = true;
				};
				fn.call(el,e);
			});
		}
	},
	unbind : function(el,type,fn) {
		if(el.removeEventListener){
			el.removeEventListener(type, fn, false);
		}else{
			el.detachEvent("on" + type, fn.id||fn);
		}
	},
	getPos : function(el,dir){
		dir = dir || "offsetTop";
		var top = el[dir];
		var parent = el.offsetParent;
		while(parent){
			top += parent[dir];
			parent = parent.offsetParent;
		}
		return top;
	},
	setTop : function(el,val,h,H,slideH,animate,dir){
		val = val < 0 ? 0 : val > h - slideH ? h - slideH : val;
		to = H * val / h;
		dir = dir || "scrollTop";
		if(animate){
			this.animate(el,to,function(t){
				el[dir] = t;
			},dir);
		}else{
			el[dir] = to;
		}
	},
	animate : function(wrap,to,fn,dir){
		var t = 0, b = wrap[dir], c = 0, value = 0,
		d = 200 / 16.666 || 0,
		easing = function(t, b, c, d){
			if ((t /= d / 2) < 1) return c / 2 * t * t + b;
			return -c / 2 * ((--t) * (t-2) - 1) + b;
		};

		(function(){
			c = Math.abs(b - to);
			value = easing(t, b, c, d);
			value = to < b ? b - (value - b) : value;
			if(++t <= d){
				requestAnimationFrame(arguments.callee);
			}else{
				value = to;
			}
			fn(value);
		})();
	},
	init : function(el){
		var	_this = this,
		t = 0,
		l = 0,
		x = 0,
		y = 0,
		H = 0,
		W = 0,
		slideH = 0,
		slideW = 0,
		propertion = 0,
		propertionX = 0,
		h = el.clientHeight,
		w = el.clientWidth,
		wrap = document.createElement("div"),
		bar = document.createElement("div"),
		slide = document.createElement("div"),

		barX = document.createElement("div"),
		slideX = document.createElement("div"),

		selectStart = el.onselectstart,
		content = (function(){
			var arr = [];
			for (var i = 0; i < el.children.length; i++) {
				arr.push(el.children[i]);
			}
			return arr;
		})();

		wrap.className = "scrollbar-wrap";

		bar.className = "scrollbar-bar";
		slide.className = "scrollbar-slide";

		barX.className = "scrollbar-bar-x";
		slideX.className = "scrollbar-slide-x";

		el.className += " scrollbar";

		for (var i = 0; i < content.length; i++) {
			wrap.appendChild(content[i]);
		}

		el.appendChild(wrap);
		bar.appendChild(slide);
		barX.appendChild(slideX);
		if(this.opt.barY !== false){
			el.appendChild(bar);
		}else{
			wrap.style["overflow-y"] = "hidden";
		};
		if(this.opt.barX !== false){
			el.appendChild(barX);
		}else{
			wrap.style["overflow-x"] = "hidden";
		};

		this.resize = function(){
			h = el.clientHeight;
			w = el.clientWidth;
			H = wrap.scrollHeight;
			W = wrap.scrollWidth;
			propertion = h / H;
			slideH = h * propertion;
			slide.style.height = slideH + "px";
			wrap.style.width = (h >= H ? w : (w + 17)) + "px";
			bar.style.display = h >= H ? "none" : "block";
			slide.style.marginTop = wrap.scrollTop * propertion + "px";

			propertionX = w / W;
			slideW = w * propertionX;
			slideX.style.width = slideW + "px";
			wrap.style.height = (w >= W ? h : (h + 17)) + "px";
			barX.style.display = w >= W ? "none" : "block";
			slideX.style.marginLeft = wrap.scrollLeft * propertionX + "px";
		};

		this.resize();

		this.bind(wrap,"scroll",function(){
			slide.style.marginTop = this.scrollTop * propertion + "px";
			slideX.style.marginLeft = this.scrollLeft * propertionX + "px";
			if(_this.opt.onscroll){
				_this.opt.onScroll(this.offsetTop,this.offsetLeft);
			}
		});

		this.bind(bar,"mousedown",function(e){
			var val = e.clientY - _this.getPos(el) - slideH / 2;
			_this.setTop(wrap,val,h,H,slideH,true);
		});

		this.bind(barX,"mousedown",function(e){
			var val = e.clientX - _this.getPos(el,"offsetLeft") - slideW / 2;
			_this.setTop(wrap,val,w,W,slideW,true,"scrollLeft");
		});

		function drag(e){
			var val = t + (e.clientY - y);
			_this.setTop(wrap,val,h,H,slideH);
		}

		function dragX(e){
			var val = l + (e.clientX - x);
			_this.setTop(wrap,val,w,W,slideW,false,"scrollLeft");
		}

		this.bind(slide,"mousedown",function(e){
			e.preventDefault();
			e.stopPropagation();
			y = e.clientY;
			t = this.offsetTop;

			if(_this.isIE){
				el.onselectstart = function(){
					return false;
				};
			}

			_this.bind(document,"mousemove",drag);
		});

		this.bind(slideX,"mousedown",function(e){
			e.preventDefault();
			e.stopPropagation();
			x = e.clientX;
			l = this.offsetLeft;

			if(_this.isIE){
				el.onselectstart = function(){
					return false;
				};
			}

			_this.bind(document,"mousemove",dragX);
		});

		this.bind(document,"mouseup",function(){

			if(_this.isIE){
				el.onselectstart = selectStart;
			}

			_this.unbind(this,"mousemove",drag);
			_this.unbind(this,"mousemove",dragX);
		});



	}
};
