
(function(){

  	var delayedEvents = [];

	document.addEventListener('__DOMComponentsLoaded__', function(){
		delayedEvents.forEach(function(item){
			xtag.fireEvent.apply(null, item);
		});
		delayedEvents = [];
		document.removeEventListener(this);
	});

	

	var ensureFireEvent = function(element, eventType, payload, options){
		if (xtag.domready) {
			xtag.fireEvent(element, eventType, payload, options);
		} 
		else {
			delayedEvents.push(xtag.toArray(arguments));
		}
	}
	var fireMatches = function(element, mql, attr, refresh){
			if (mql.matches) {
				var eventType = 'mediaqueryactive';
				element.setAttribute('matches', null);
			}
			else {
				var eventType = 'mediaqueryinactive';
				element.removeAttribute('matches');
			}
			var payload = { 'query': mql, 'queryid': element.id };			
			if (!refresh) ensureFireEvent(element, eventType, payload);
			(attr || (element.getAttribute('for') || '').split(' ')).forEach(function(id){
				var node = document.getElementById(id);
				if (node) {
					xtag[(eventType == 'mediaqueryactive' ? 'add' : 'remove') + 'Class'](node, element.id);
					if (!refresh) ensureFireEvent(node, eventType, payload, { bubbles: false });
				}
			});
		},
		attachQuery = function(element, query, attr, refresh){
			query = query || element.getAttribute('media');
			if (query){
				if (element.xtag.query) element.xtag.query.removeListener(element.xtag.listener);
				query = element.xtag.query = window.matchMedia(query);
				var listener = element.xtag.listener = function(mql){
					fireMatches(element, mql);
				};
				fireMatches(element, query, attr, refresh);
				query.addListener(listener);
			}
		};
	
	xtag.register('x-mediaquery', {
		onCreate: function(){
			attachQuery(this);
		},
		getters: {
			'for': function(){
				return this.getAttribute('for');
			},
			'media': function(){
				return this.getAttribute('media');
			},
			'id': function(){
				return this.getAttribute('id');
			},
		},
		setters: {
			
			'media:attribute(media)': function(query){
				attachQuery(this, query);
			},
			'id:attribute(id)': function(id){
				var current = this.getAttribute('id');
				xtag.query(document, '.' + current).forEach(function(node){
					xtag.removeClass(node, current);
					xtag.addClass(node, id);
				});
			},
			'for:attribute(for)': function(value){
				var next = (value || '').split(' ');
				
				(this.getAttribute('for') || '').split(' ').map(function(id){
					var index = next.indexOf(id);
					if (index == -1){
						var element = document.getElementById(id);
						xtag.removeClass(element, this.id);
						xtag.fireEvent(element, 'mediaqueryremoved');
					}
					else next.splice(index, 1);
					
				}, this);
				
				attachQuery(this, element.getAttribute('media'), next, true);
			}
		}
	});
	
})();