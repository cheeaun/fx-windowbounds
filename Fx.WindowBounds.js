/*
Script: Fx.WindowBounds.js
	Contains <Fx.WindowBounds>
	
Author:
	Lim Chee Aun <cheeaun@gmail.com>

License:
	MIT-style license.
*/

/*
Class: Fx.WindowBounds
	Apply resizing and moving transition for any nativeWindow instance.
	Inherits methods, properties, options and events from <Fx.Base>.

Note:
	Fx.WindowBounds requires an Adobe AIR runtime and AIRAliases.js.

Arguments:
	window - the nativeWindow instance to be applied effects
	options - all the <Fx.Base> options

Options:
	all the Fx.Base options and events, plus:
	dimension - set it to window or stage. Defaults to wndow.

Example:
	(start code)
	var boundsChange = new Fx.WindowBounds(nativeWindow);
	boundsChange.boundTo('center','30%',300,'30%');
	(end)
*/

Fx.WindowBounds = Fx.Base.extend({
	
	options: {
		dimension: 'window'
	},

    initialize: function(window,options) {
		this.window = window;
		this.options.fps = 200;
        this.setOptions(options);
		switch(this.options.dimension){
			case 'window': this.now = [window.x, window.y, window.width, window.height]; break;
			case 'stage': this.now = [window.x, window.y, window.stage.stageWidth, window.stage.stageHeight]; break;
		}
	},
	
	set: function(x, y, width, height){
		var values = ($type(x) == 'array') ? x : this.parseBounds(x,y,width,height);
		return this.parent(values);
	},

	setNow: function(){
		for (var i = 0; i < this.now.length; i++) this.now[i] = this.compute(this.from[i], this.to[i]);
	},
	
	/*
	Property: getCurrentScreen
		Get current screen
	*/

	getCurrentScreen: function(){
		var screens = air.Screen.getScreensForRectangle(this.window.bounds);
		return (screens.length > 0) ? screens[0] : air.Screen.mainScreen;
	},
	
	/*
	Property: parseBounds
		Parse bounds transition

	Arguments:
		x - the x coordinate to move the instance to
		y - the y coordinate to move the instance to
		width - the width value to set the instance to
		height - the height value to set the instance to
	*/
	
	parseBounds: function(x, y, width, height){
		var currentScreen = this.getCurrentScreen();

		var screenWidth = currentScreen.visibleBounds.width;
		var screenHeight = currentScreen.visibleBounds.height;

		if ($type(width) == "string" && width.contains('%')) width = Math.abs(width.toFloat() / 100 * screenWidth);

		if ($type(height) == "string" && height.contains('%')) height = Math.abs(height.toFloat() / 100 * screenHeight);

		if ($type(x) == "string")
			if(x.contains('%')) x = Math.abs(x.toFloat() / 100) * (screenWidth - width);
			else switch(x){
				case 'left': x = 0; break;
				case 'right': x = screenWidth - width; break;
				case 'center': x = (screenWidth - width) / 2; break;
			}

		if ($type(y) == "string")
			if (y.contains('%')) y = Math.abs(y.toFloat() / 100) * (screenHeight - height);
			else switch(y){
				case 'top': y = 0; break;
				case 'bottom': y = screenHeight - height; break;
				case 'center': y = (screenHeight - height) / 2; break;
			}
			
		return [x, y, width, height];
	},
	
	/*
	Property: boundTo
		Apply bounds transition the chosen nativeWindow instance.

	Arguments:
		x - the x coordinate to move the instance to
		y - the y coordinate to move the instance to
		width - the width value to set the instance to
		height - the height value to set the instance to
	*/
	
	boundTo: function(x, y, width, height){
		if (this.timer && this.options.wait) return this;
		var values = this.parseBounds(x,y,width,height);
		return this.start([this.now[0], this.now[1], this.now[2], this.now[3]],values);
	},
	
	/*
	Property: resizeTo
		Resize the chosen nativeWindow instance to specified dimension.
		
	Arguments:
		x - the x coordinate to move the instance to
		y - the y coordinate to move the instance to
	*/
	
	resizeTo: function(width, height){
		return this.boundTo(this.window.x, this.window.y, width, height);
	},
	
	/*
	Property: moveTo
		Move the chosen nativeWindow instance to specified position.
		
	Arguments:
		width - the width value to set the instance to
		height - the height value to set the instance to
	*/

	moveTo: function(x, y){
		return this.boundTo(x, y, this.window.width, this.window.height);
	},
	
	/*
	Property: checkVisibleBounds
		check if the window is in visible bounds of the screen
	*/
	
	checkVisibleBounds: function(){
		var currentScreen = this.getCurrentScreen();

		var screenWidth = currentScreen.visibleBounds.width;
		var screenHeight = currentScreen.visibleBounds.height;
		
		if (this.window.bounds.top < 0 || this.window.bounds.left < 0 || this.window.bounds.right > screenWidth || this.window.bounds.bottom > screenHeight){
			return false;
		}
		return true;
	},

	/*
	Property: moveToVisibleBounds
		Move the chosen nativeWindow instance into visible bounds of the screen
	*/
	
	moveToVisibleBounds: function(){
		if (!this.checkVisibleBounds()){
			var currentScreen = this.getCurrentScreen();
			var screenWidth = currentScreen.visibleBounds.width;
			var screenHeight = currentScreen.visibleBounds.height;

			var x = this.window.x;
			var y = this.window.y;

			if (this.window.bounds.top < 0) y = 0;
			else if(this.window.bounds.bottom > screenHeight) y = screenHeight - this.window.height;

			if (this.window.bounds.left < 0) x = 0;
			else if(this.window.bounds.right > screenWidth) x = screenWidth - this.window.width;

			return this.moveTo(x,y);
		}
	},

    increase: function(){
		this.window.x = this.now[0];
		this.window.y = this.now[1];
		switch(this.options.dimension){
			case 'window':
				this.window.width = this.now[2];
				this.window.height = this.now[3];
				break;
			case 'stage':
				this.window.stage.stageWidth = this.now[2];
				this.window.stage.stageHeight = this.now[3];
				break;
		}
    }
});