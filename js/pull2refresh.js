;(function($){
	
	var defaults = {
		
		offsetH : 60, // Height of Pull distance, in pixes
		bottomH : 30, // Height of the list bottom space, the 'tips', in pixes
		
		// Request
		rUrl : '#', // Request URL
		rParam : {}, // Request param
		rCallBack : function() { return true; }, // Callback function of request complete 
		rDataType : 'json', // Response data format
		
		// Control tips
		txt2Fresh : 'Release to refresh',
		txtLoading : 'Loading...',
		txtLoaded : 'Complete!',
		txtLoadMore	: 'Pull up to load more',
		loadingIcon	:  // Loading GIF，BASE64 encoded string
		'data:image/gif;base64,R0lGODlhJQAlAJECAL3L2AYrTv///wAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFCgACACwAAAAAJQAlAAACi5SPqcvtDyGYIFpF690i8xUw3qJBwUlSadmcLqYmGQu6KDIeM13beGzYWWy3DlB4IYaMk+Dso2RWkFCfLPcRvFbZxFLUDTt21BW56TyjRep1e20+i+eYMR145W2eefj+6VFmgTQi+ECVY8iGxcg35phGo/iDFwlTyXWphwlm1imGRdcnuqhHeop6UAAAIfkEBQoAAgAsEAACAAQACwAAAgWMj6nLXAAh+QQFCgACACwVAAUACgALAAACFZQvgRi92dyJcVJlLobUdi8x4bIhBQAh+QQFCgACACwXABEADAADAAACBYyPqcsFACH5BAUKAAIALBUAFQAKAAsAAAITlGKZwWoMHYxqtmplxlNT7ixGAQAh+QQFCgACACwQABgABAALAAACBYyPqctcACH5BAUKAAIALAUAFQAKAAsAAAIVlC+BGL3Z3IlxUmUuhtR2LzHhsiEFACH5BAUKAAIALAEAEQAMAAMAAAIFjI+pywUAIfkEBQoAAgAsBQAFAAoACwAAAhOUYJnAagwdjGq2amXGU1PuLEYBACH5BAUKAAIALBAAAgAEAAsAAAIFhI+py1wAIfkEBQoAAgAsFQAFAAoACwAAAhWUL4AIvdnciXFSZS6G1HYvMeGyIQUAIfkEBQoAAgAsFwARAAwAAwAAAgWEj6nLBQAh+QQFCgACACwVABUACgALAAACE5RgmcBqDB2MarZqZcZTU+4sRgEAIfkEBQoAAgAsEAAYAAQACwAAAgWEj6nLXAAh+QQFCgACACwFABUACgALAAACFZQvgAi92dyJcVJlLobUdi8x4bIhBQAh+QQFCgACACwBABEADAADAAACBYSPqcsFADs='
		
	};
	
	$.fn.pFresh = function(options){
		if(this.length === 0){
			return this;
		}
		
		// create a namespace to be used throughout the plugin
		var pf = {},
		
		// set a reference to our list element
		el = this,
		//el = {},
		
		
		windowHeight = $(window).height(),
		
		listHeight = el.children(':first').height();
		
		// merge user-supplied options with the defaults
		pf.settings = $.extend({}, defaults, options);
		
		
		if($(el).data('pFresh')) { return; }
		
		// private functions
		var init = function(){
			
			// avoid duplication 
			if($(el).data('pFresh')) { return; }
			
			pf.settings.bottomH = parseInt(pf.settings.bottomH);
			pf.settings.offsetH = parseInt(pf.settings.offsetH);
			
			el.css({
				'height':windowHeight-pf.settings.bottomH,
				'overflow':'hidden',
				'float': 'left',
				'position': 'relative'
			});
			
			// TODO the size of window change, refresh the list height etc.
			/* 
			 * resize event too often
			 * 
			$(window).resize(function(){
				alert('resizeed');
				if(!pf.myScroll) { return; }
				
				el.css('height', $(window).height()-pf.settings.bottomH);
				
				pf.myScroll.refresh();
				alert('refreshed');
			});*/
			
			
			pf.needUpdate = false;
			pf.loading = false;
			
			// init iScroll
			pf.myScroll = new IScroll(el[0],{
				scrollbars: true,
				probeType: 3, // iscroll-probe.js version has on('scroll') method
				click: true,
				mouseWheel : true
			});
			// listening pull events 
			pf.myScroll.on('scroll', function(){
				
				if(pf.loading) { return; }
				
				if( 
					(this.y*-1+windowHeight) 
					> 
					(listHeight+pf.settings.offsetH+pf.settings.bottomH) 
				) {
					pf.needUpdate = true;
					
					// complete the "fadeOut" animation immediately
					// and show the new tips("release to refresh") 
					pf.tipInfo.stop(true, true).show().text(pf.settings.txt2Fresh);
				}
			});
			
			// the pull action was ended , to refresh if meet the conditions 
			el.bind('touchend', function(){
				
				// Initiate a request a time
				if(!pf.needUpdate || pf.loading) return;
				
				el.updateList();
			});
			
			pfDownTipsInit();
		}
		
		
		var pfDownTipsInit = function (){ // the "tips" HTML and styles
			var pfTipHtml = 
			'<div id="pf-tip-box">'+
				'<span id="pf-tip-icon">'+
					'<img src="'+pf.settings.loadingIcon+'" alt=""/>'+
				'</span>'+
				'<span id="pf-tip-info">'+pf.settings.txtLoadMore+'</span>'+
			'</div>';
			el.after(pfTipHtml);
			
			pf.tipBox = $('#pf-tip-box').css({
				'float' : 'left',
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

		
		// public functions
		el.updateList = function(){ // to refresh the list
			
			pf.tipIcon.show();
			
			// complete the "fadeOut" animation immediately. stop(true, true)
			pf.tipInfo.show().text(pf.settings.txtLoading);
			
			pf.loading = true;
			pf.needUpdate = false;
			
			// Requestes data
			$.post(
				pf.settings.rUrl,
				pf.settings.rParam,
				function(data){  // request response
					
					// call the user-supplied function, update the list
					pf.settings.rCallBack(data);
					
					// Set aside time to browser processes the DOM, let iScroll knows the DOM was change ( "refresh()" functoin )
					setTimeout(function(){
						
						pf.myScroll.refresh(); // refresh the iScroll
						
						// and others
						listHeight = el.children(':first').height();
						
						pf.loading = false;
						
						pf.tipIcon.hide();
						pf.tipInfo.text(pf.settings.txtLoaded).fadeOut(1500, function(){
							pf.tipInfo.text(pf.settings.txtLoadMore).show();
						});
						
					}, 100);
				},
				pf.settings.rDataType
			);
		}
	
		init();
		$(el).data('pFresh', this);
		
		// returns the current jQuery object
		return this;
	}
})(jQuery);
