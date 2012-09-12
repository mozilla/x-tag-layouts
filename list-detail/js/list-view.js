(function(){

	//global
	layout = {
		settings:{
			smallMenuWidth: 60, 
			largeMenuWidth: 120
		},
		loadDetail: function(node){

		}
	}

	document.addEventListener('DOMComponentsLoaded', function(){
		//Toggle shift menu for small layouts
		document.getElementById('global_actions_trigger').addEventListener('click', function(e){
			if (document.getElementById('content').shift == 0){
				document.getElementById('content').shift = layout.settings.smallMenuWidth;
			} else {
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
			toggleShift.apply(this, [layout.settings.smallMenuWidth, 'full']);
		});

		document.getElementById('large_desktop').addEventListener('mediaqueryactive', function(){
			toggleShift.apply(this, [layout.settings.largeMenuWidth, 'full']);
			document.querySelector('#content > x-actionbar').setAttribute('data-mode', 'full');
		});

		document.getElementById('large_desktop').addEventListener('mediaqueryinactive', function(){		
			document.querySelector('#content > x-actionbar').removeAttribute('data-mode');
		});

		document.getElementById('tablet').addEventListener('mediaqueryactive', function(){
			toggleShift.apply(this, [layout.settings.smallMenuWidth, 'full']);
		});

		document.getElementById('phone_portrait').addEventListener('mediaqueryactive', function(){
			toggleShift.apply(this, [0, 'icon']);
		});

		document.getElementById('phone_landscape').addEventListener('mediaqueryactive', function(){
			toggleShift.apply(this, [0, 'icon']);
		});

	});


})();