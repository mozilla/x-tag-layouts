//global
Layout = {
	settings:{
		smallMenuWidth: 60, 
		largeMenuWidth: 120
	}, 
	setDetail: function(node){
		var detail = document.getElementById('detail');
		detail.innerHTML = '';
		detail.appendChild(node);
		this.slideToDetail();
		xtag.removeClass(document.getElementById('flipbox'), 'x-card-flipped');
	}, 
	slideToDetail: function(){
		var app = document.getElementById('app');
		var hasClass = xtag.hasClass;
		if (hasClass(app,'large_desktop') || 
			hasClass(app,'med_desktop') || hasClass(app,'tablet')){
			//do nothing
		}else{
			document.getElementById('slidebox').slideTo(1);
		}
	},
	showSettings: function(){
		var modal = document.createElement('x-modal');
		var settings = document.createElement('x-todo-settings');
		modal.appendChild(settings);
		modal.setAttribute('overlay','');
		xtag.addEvents(modal, {
			'click:delegate(button)' : function(e){
				modal.parentNode.removeChild(modal);
			}, 
			'modalhide': function(e){
				modal.parentNode.removeChild(modal);
			}}
		);
		document.body.appendChild(modal);
		
	}, 
	home: function(){
		var slidebox =  document.getElementById('slidebox');
		var idx = slidebox.selectedIndex;
		if (idx == 1){
			slidebox.slideTo(0);
		}
	}, 
	refreshList: function(){
		document.getElementById('list').refresh();
	}
}


xtag.register('x-todo-settings', {
	mixins: ['template'],
	onCreate: function(){
		this.setAttribute('template', 'todo-settings');
	}, 
	onInsert: function(){
	}
});

document.addEventListener('DOMComponentsLoaded', function(){

	document.getElementById('logo').addEventListener('click', Layout.home);
	document.getElementById('wordmark').addEventListener('click', Layout.home);

	/*
		Toggle shift menu for small layouts
	*/
	document.getElementById('global_actions_trigger').addEventListener('click', function(e){
		if (document.getElementById('content').shift == 0){
			xtag.addClass(e.target, 'open');
			document.getElementById('content').shift = Layout.settings.smallMenuWidth;
		} else {
			xtag.removeClass(e.target, 'open');
			document.getElementById('content').shift = 0;
		}
	});

	/*
		Shift menu around based on matching media query 
	*/
	function toggleShift(amount, mode){
		document.getElementById('content').shift = Number(amount);
		document.getElementById('global_actions').setAttribute('data-mode', mode);
	}
	
	document.getElementById('small_desktop').addEventListener('mediaqueryactive', function(){
		toggleShift.apply(this, [0, 'icon']);
	});

	document.getElementById('med_desktop').addEventListener('mediaqueryactive', function(){
		document.getElementById('slidebox').slideTo(0);
		toggleShift.apply(this, [0, 'full']);
	});

	document.getElementById('large_desktop').addEventListener('mediaqueryactive', function(){
		document.getElementById('slidebox').slideTo(0);
		toggleShift.apply(this, [Layout.settings.largeMenuWidth, 'full']);
		document.querySelector('#content > x-actionbar').setAttribute('data-mode', 'full');
	});

	document.getElementById('large_desktop').addEventListener('mediaqueryinactive', function(){		
		document.querySelector('#content > x-actionbar').removeAttribute('data-mode');
	});

	document.getElementById('tablet').addEventListener('mediaqueryactive', function(){
		document.getElementById('slidebox').slideTo(0);
		toggleShift.apply(this, [Layout.settings.smallMenuWidth, 'full']);
	});

	document.getElementById('phone_portrait').addEventListener('mediaqueryactive', function(){
		toggleShift.apply(this, [0, 'icon']);
	});

	document.getElementById('phone_landscape').addEventListener('mediaqueryactive', function(){
		toggleShift.apply(this, [0, 'icon']);
	});

});
