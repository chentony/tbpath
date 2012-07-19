(function () {
	
window.Path = {
	//------  public -----------
	map: function (path) {
		if (!this.routes.defined[path]) {
			this.routes.defined[path] = new this.Route(path);
		}			
		return this.routes.defined[path];
	},
	listened: false,
	listen: function () {
		this.listened = true;
	
		this.supported = !!(window.history && window.history.pushState);
		this.oldIE = (navigator.userAgent.toLowerCase().search('msie') > 0) && (!document.documentMode || document.documentMode < 8);
		
		var self = this, fn, path
		if (this.supported) {
			fn = function () { Path.dispatch(location.pathname+location.search); };
			
			window.onpopstate = fn;

			path = location.pathname+window.location.search;
		} else {
			path = location.hash.replace('#', '');
			
			if (!this.oldIE) {
				fn = function () { Path.dispatch(location.hash.replace('#', '')); };		
				window.onhashchange = fn;
			} else {
				fn = function () { Path.dispatch(Path.iframe.location.hash.replace('#', '')); };
				
				this.iframe = document.createElement('<iframe src="javascript:0" tabindex="-1">');
				this.iframe.style.display = 'none';
				document.body.appendChild(this.iframe);
				this.iframe = this.iframe.contentWindow;
				this.iframe.document.open().close();
				this.iframe.location.hash = path;
				
				setInterval(fn, 50); // to be solved
			}	
			
			if (path !== '') {
				this.execute(path);
			}

		}
		
		this.routes.current = path;
		
	},
	nav: function (path) {
		if (!this.listened) return;
	
		if (this.supported) {
			window.history.pushState(null, null, path);
			this.dispatch(path);
		} else if (!this.oldIE) {
			window.location.hash = path;
		} else {
			// old IE
			this.iframe.document.open().close();
			this.iframe.location.hash = path;
		}
	},
	//------- private --------------
	Route: function (path) {
		this.action = null;
		this.path = path;
	},
	routes: {
		current: null,
		defined: {}
	},
	dispatch: function (path) { 
		if (path === this.routes.current) {
			return;
		}
		this.routes.current = path;
		
		if (this.oldIE) {
			location.hash = path;
		}
		
		this.execute(path);

	},
	executeTimer: null,
	execute: function (path) {
		
		if (path === '') { // 
			path = location.pathname + location.search;
		} 
		
		var route, isMatch;
		for (var i in Path.routes.defined) {
			route = Path.routes.defined[i];
			isMatch = Path.match(route.path, path);
			if (isMatch) {
				route.action.apply(route, isMatch);
				return;
			} else {}
		}
		
	},
	match: function (path, apath) {
		var values = [apath];
 
		path = path.split('/'),
		apath = apath.split('/');
		
		if (path.length !== apath.length) return false;
		
		var index;
		for (var i = 0, j = path.length; i < j; i++) {
			index = path[i].search(':');
			if (index !== -1) {
				if (path[i].slice(0, index) === apath[i].slice(0, index)) {
					values.push(apath[i].slice(index));
				} else {
					return false;
				}
			} else if (path[i] !== apath[i]) {
				return false;
			} 
		}
		return values;
	}
};

Path.Route.prototype = {
	to: function (fn) {
		this.action = fn;
	}
};