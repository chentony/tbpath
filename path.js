(function () {
	
window.Path = {
	//------  public -----------
	map: function (path) {
		if (!this.routes.defined[path]) {
			this.routes.defined[path] = new this.Route(path);
		}			
		return this.routes.defined[path];
	},
	listen: function (trigger) {
		this.supported = !!(window.history && window.history.pushState);
		
		var self = this, fn, path
		if (this.supported) {
			fn = function () { Path.dispatch(location.pathname+window.location.search); };
			
			window.onpopstate = fn;

			path = location.pathname+window.location.search;
		} else {
			fn = function () { Path.dispatch(location.hash); };

			if ('onhashchange' in window && (!document.documentMode || document.documentMode >= 8)) {
				window.onhashchange = fn;
			} else {
				setInterval(fn, 1000);
			}	

			path = location.hash;

			if (path.charAt(0) === '#') {
				path = path.slice(1);
			}
		}
		
		this.routes.current = path;

		if (trigger && path !== '') {
			this.dispatch(path);
		}
		
	},
	navigate: function (path) {
		if (this.supported) {
			window.history.pushState(null, null, path);
			this.dispatch(window.location.pathname+window.location.search);
		} else {
			window.location.hash = '#' + path;
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
	dispatch: function (path) { document.getElementById('m').innerHTML += location.href +'<br>';
		if (path === this.routes.current) {
			return;
		}
		this.routes.current = path;

		if (path.charAt(0) === '#') {
			path = path.slice(1);
		}

		var route, isMatch;
		for (var i in this.routes.defined) {
			route = this.routes.defined[i];
			isMatch = this.match(route.path, path);
			if (isMatch) {
				route.action.apply(route, isMatch);
				return;
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