
(function(){

	xtag.register('x-actionbar', {
		events: {
			'command:delegate(x-action)': function(e){
				var group = this.getAttribute('group'),
					actions = group ? xtag.query(this.parentNode, '[for="' + group + '"]') : false,
					modal = document.querySelector('[data-action-group-modal="' + group + '"]'),
					command = this.getAttribute('command'),
					node = this.getAttribute('data-modal-target') ? document.getElementById(this.getAttribute('data-modal-target')) : document.body;

				if (actions && !modal){			
					var overlay = document.createElement('x-overlay');
					overlay.setAttribute('data-click-remove', true);
					node.appendChild(overlay);

					modal = document.createElement('x-modal');
					modal.setAttribute('data-overlay', true);
					modal.setAttribute('data-action-group-modal', group);
					xtag.addEvents(overlay,{
						'command:delegate(x-action)': function(e){
							var cmd = this.getAttribute('command');
							actions.forEach(function(action){
								if(action.getAttribute('command') == cmd){
									xtag.fireEvent(action, 'command', { command: cmd });
								}
							});
							e.stopImmediatePropagation();
						},
						'modalhide': function(){
							node.removeChild(overlay);
						}
					});
					actions.forEach(function(action){
						modal.appendChild(action.cloneNode(false));
					});
					overlay.appendChild(modal);
				} 
				else if (modal) {
					node.removeChild(modal.parentNode);					
				}			
			}
		}
	});
	
	
	
	var onCommand = function(element){
		xtag.fireEvent(element, 'command', { command: element.getAttribute('command') });
	}
	
	var selectAction = function(element){
		onCommand(element);
		if (element.parentNode && element.parentNode.tagName == 'X-ACTIONBAR') {
			xtag.queryChildren(element.parentNode, 'x-action').forEach(function(action){
				action.removeAttribute('selected');
			});
			element.setAttribute('selected', null);
		}
	};

	xtag.register('x-action', {
		content: '<img />',
		onCreate: function(){
			this.setAttribute('tabindex', 0);
			this.label = this.getAttribute('label');
			this.icon = this.getAttribute('icon');
			if (this.hasAttribute('selected')) selectAction(this);
		},
		events: {
			'click:touch': function(){
				selectAction(this);
			},
			'keyup:keypass(13)': function(){
				onCommand(this);
			}
		},
		getters: {
			'icon': function(url){
				return this.getAttribute('icon');
			},
			'label': function(html){
				return this.getAttribute('label');
			}
		},
		setters: {
			'icon:attribute(icon)': function(url){
				this.firstElementChild.src = url;
			}
		}
	});
	
})();