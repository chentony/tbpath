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
		this.oldIE = document.documentMode && document.documentMode < 8;
		
		var self = this, fn, path
		if (this.supported) {
			fn = function () { Path.dispatch(location.pathname+location.search); };
			
			window.onpopstate = fn;

			path = location.pathname+window.location.search;
		} else {
			fn = function () { Path.dispatch(location.hash) };

			if (!this.oldIE) {
				window.onhashchange = fn;
			} else {
				setInterval(fn, 1000); // to be solved
			}	
			
			if (location.hash.replace('#') !== '') {
				this.execute(location.hash);
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
			window.location.hash = '#' + path;
		} else {
			// old IE
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
		
		this.execute(path);

	},
	executeTimer: null,
	execute: function (path) {
		path = path.replace(/^#/, '');
		
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
			} else {
				 // 没有找到匹配的路由
			}
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

})();