(function(){

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
			xtag.removeClass(document.getElementById('flipbox'), 'x-card-flipped');
		}, 
		slideToDetail: function(){
			document.getElementById('slidebox').slideNext();
		},
		showSettings: function(){
			var modal = document.createElement('x-modal');
			modal.setAttribute('overlay','');
			modal.innerHTML = '<h2>Settings</h2><p>Email Updates:<input type="checkbox" checked /></p><p>Email:<input name="email"/></p><button>Ok</button>';
			xtag.addEvent(modal, 'click:delegate(button)', function(e){
				console.log("ok");
				modal.parentNode.removeChild(modal);
			});
			document.body.appendChild(modal);
			//document.getElementById('flipbox').flipped = true;
		}
	}

	document.addEventListener('DOMComponentsLoaded', function(){
		//Toggle shift menu for small layouts
		document.getElementById('global_actions_trigger').addEventListener('click', function(e){
			if (document.getElementById('content').shift == 0){
				document.getElementById('content').shift = Layout.settings.smallMenuWidth;
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
			toggleShift.apply(this, [Layout.settings.smallMenuWidth, 'full']);
		});

		document.getElementById('large_desktop').addEventListener('mediaqueryactive', function(){
			toggleShift.apply(this, [Layout.settings.largeMenuWidth, 'full']);
			document.querySelector('#content > x-actionbar').setAttribute('data-mode', 'full');
		});

		document.getElementById('large_desktop').addEventListener('mediaqueryinactive', function(){		
			document.querySelector('#content > x-actionbar').removeAttribute('data-mode');
		});

		document.getElementById('tablet').addEventListener('mediaqueryactive', function(){
			toggleShift.apply(this, [Layout.settings.smallMenuWidth, 'full']);
		});

		document.getElementById('phone_portrait').addEventListener('mediaqueryactive', function(){
			toggleShift.apply(this, [0, 'icon']);
		});

		document.getElementById('phone_landscape').addEventListener('mediaqueryactive', function(){
			toggleShift.apply(this, [0, 'icon']);
		});

	});


})();