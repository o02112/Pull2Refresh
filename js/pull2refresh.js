/*
 * 版本 ：0.2.0
 * 
 * 日期：2016/02/05
 * 
 * *列表数据加载后，将标签放入文档但不立即显示，留出一定时间加载图片
 * 
 * 下拉刷新更加流畅
 * 加入淡入淡出动画
 * 
 */

;(function($){
	
	var defaults = {
		
		offsetH : 80, // 上拉高度，触发刷新
		bottomH : 30, // 底部空隙高度，提示文字
		
		height: $(window).height(), // 默认整个屏幕的高度
		width: '100%', // 默认宽度
		
		// 请求
		rUrl : '#', // 请求数据地址
		rParam : {}, // 请求参数
		rCallback : function() { return true; }, // 请求完成的回调函数
		rDataType : 'json', // 返回数据格式
		
		// 操作提示
		txt2Fresh : '松开刷新',
		txtLoading : '正在加载...',
		txtLoaded : '加载完毕！',
		txtLoadMore	: '上拉加载更多',
		loadingIcon	:  // 正在加载的GIF，BASE64 图片编码，适于不需要考虑IE6的移动端环境
		'data:image/gif;base64,R0lGODlhJQAlAJECAL3L2AYrTv///wAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFCgACACwAAAAAJQAlAAACi5SPqcvtDyGYIFpF690i8xUw3qJBwUlSadmcLqYmGQu6KDIeM13beGzYWWy3DlB4IYaMk+Dso2RWkFCfLPcRvFbZxFLUDTt21BW56TyjRep1e20+i+eYMR145W2eefj+6VFmgTQi+ECVY8iGxcg35phGo/iDFwlTyXWphwlm1imGRdcnuqhHeop6UAAAIfkEBQoAAgAsEAACAAQACwAAAgWMj6nLXAAh+QQFCgACACwVAAUACgALAAACFZQvgRi92dyJcVJlLobUdi8x4bIhBQAh+QQFCgACACwXABEADAADAAACBYyPqcsFACH5BAUKAAIALBUAFQAKAAsAAAITlGKZwWoMHYxqtmplxlNT7ixGAQAh+QQFCgACACwQABgABAALAAACBYyPqctcACH5BAUKAAIALAUAFQAKAAsAAAIVlC+BGL3Z3IlxUmUuhtR2LzHhsiEFACH5BAUKAAIALAEAEQAMAAMAAAIFjI+pywUAIfkEBQoAAgAsBQAFAAoACwAAAhOUYJnAagwdjGq2amXGU1PuLEYBACH5BAUKAAIALBAAAgAEAAsAAAIFhI+py1wAIfkEBQoAAgAsFQAFAAoACwAAAhWUL4AIvdnciXFSZS6G1HYvMeGyIQUAIfkEBQoAAgAsFwARAAwAAwAAAgWEj6nLBQAh+QQFCgACACwVABUACgALAAACE5RgmcBqDB2MarZqZcZTU+4sRgEAIfkEBQoAAgAsEAAYAAQACwAAAgWEj6nLXAAh+QQFCgACACwFABUACgALAAACFZQvgAi92dyJcVJlLobUdi8x4bIhBQAh+QQFCgACACwBABEADAADAAACBYSPqcsFADs='
	};
	
	$.fn.pFresh = function(options){
		if(this.length === 0){
			return this;
		}
		
		// 为插件定义命名空间
		var pf = {},
		
		// 插件生效对象
		el = this,
		//el = {},
		
		listHeight = el.children('ul').height();
		
		// 把用户的选项与默认值合并，得到最终选项值
		pf.settings = $.extend({}, defaults, options);
		
		
		// 如果已经初始化，退出
		if($(el).data('pFresh')) { return; }
		
		// 私有方法
		var init = function(){
			
			// 避免重复初始化
			if($(el).data('pFresh')) { return; }
			
			el.children('ul').css({'padding-bottom':pf.settings.bottomH});
			
			pf.settings.bottomH = parseInt(pf.settings.bottomH);
			pf.settings.offsetH = parseInt(pf.settings.offsetH);
			
			el.css({
				width: pf.settings.width,
				height: pf.settings.height,
				overflow: 'hidden',
				float: 'left',
				position: 'relative'
			});
			
			
			// TODO 窗口大小改变时，重新设置列表主体元素高度，适应屏幕
			/* 
			 * resize事件太频繁
			 * 
			$(window).resize(function(){
				alert('resizeed');
				if(!pf.myScroll) { return; }
				
				el.css('height', $(window).height()-pf.settings.bottomH);
				
				pf.myScroll.refresh();
				alert('refreshed');
			});*/
			
			
			pf.needUpdate = true;
			pf.loading = false;
			
			// 初始化 iScroll 插件
			pf.myScroll = new IScroll(el[0],{
				scrollbars: true,
				probeType: 3, // iscroll-probe.js版本才有on('scroll')方法
				click: true,
				mouseWheel : true
			});
			// 侦听用户的拉动操作，根据高度判断是否执行刷新
			pf.myScroll.on('scroll', function(){
				
				// 不再重复执行后面的判断 ，可以被用户拉动  ||  已经可以刷新， 
				if(pf.loading) { return; }
				
				if( 
					(this.y*-1+pf.settings.height) 
					> 
					(listHeight+pf.settings.offsetH) 
				) {
					pf.needUpdate = true;
					
					// 提示语句：松开刷新；立即完成“加载完毕”fadeOut动画，并显示提示
					pf.tipInfo.stop(true, true).show().text(pf.settings.txt2Fresh);
				}
			});
			
			// 拉动操作结束，根据需要触发刷新
			el.bind('touchend', el.updateList);
			
			// 拉动结束时不需要，但列表自动滚动动画结束时则又需要刷新的情况
			// 一直显示“松开刷新”提示，但没有动作的情况
			pf.myScroll.on('scrollEnd', el.updateList);
			
			pfDownTipsInit();
		}
		
		
		var pfDownTipsInit = function (){ // 初始化用户操作提示
			var pfTipHtml = 
			'<div id="pf-tip-box">'+
				'<span id="pf-tip-icon">'+
					'<img src="'+pf.settings.loadingIcon+'" alt=""/>'+
				'</span>'+
				'<span id="pf-tip-info">'+pf.settings.txtLoadMore+'</span>'+
			'</div>';
			el.prepend(pfTipHtml);
			
			pf.tipBox = $('#pf-tip-box').css({
				//'position': 'absolute',
				'bottom': '0',
				'width' : '100%',
				'height' : pf.settings.bottomH,
				'text-align' : 'center',
				'line-height' : '2.5em',
				'color' : '#ccc',
				'text-shadow' : '0 1px 0 white'
			});
			pf.tipIcon = $('#pf-tip-icon').hide();
			pf.tipIcon.children('img').css({
				'width':'auto',
				'height':'1em',
				'vertical-align' : 'middle',
				'margin-top' : '-.2em',
				'margin-right' : '5px'
			});
			pf.tipInfo = $('#pf-tip-info');
		}

		
		// 公共方法
		el.freshScroll = function(){
			pf.myScroll.refresh(); // 更新 iScroll
		};
		
		el.updateList = function(){ // 请求刷新
			
			// 每次发起一个请求，避免重复请求
			if(!pf.needUpdate || pf.loading) return;
				
			pf.tipIcon.show();
			
			pf.tipInfo.show().text(pf.settings.txtLoading);
			
			pf.loading = true;
			pf.needUpdate = false;
			
			//发送数据请求
			$.post(
				pf.settings.rUrl,
				pf.settings.rParam,
				function(data){  // 请求返回
					
					// 调用用户设置的回调函数，列表更新
					pf.settings.rCallback(data);
					
					// 加载后台数据完成，等待1秒图片加载时间，再显示出来
					// 为浏览器处理DOM留出时间，iScroll重识DOM变化
					setTimeout(function(){
						
						el.find('ul li').addClass('active');
						
						pf.myScroll.refresh(); // 更新 iScroll
						
						// 重新设置刷新依据
						listHeight = el.children('ul').height();
						
						pf.loading = false;
						
						pf.tipIcon.hide();
						pf.tipBox.css('position', 'absolute');
						pf.tipInfo.text(pf.settings.txtLoaded).fadeOut(800, function(){
							//pf.tipInfo.text(pf.settings.txtLoadMore).show();
							$(this).hide();
							
						});
						
					}, 1000);
				},
				pf.settings.rDataType
			);
		};
	
		init();
		$(el).data('pFresh', this);
		
		// 返回当前jQuery对象
		return this;
	}
})(jQuery);