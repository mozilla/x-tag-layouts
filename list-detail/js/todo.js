document.addEventListener('DOMComponentsLoaded', function(){
	// load current todos

});

xtag.mixins.databind = {
	onCreate: function(){
		this.xtag.entityData = {};
	},
	onInsert: function(){
		xtag.fireEvent(this, 'dataentitycreated');
	},
	getters:{
		pk: function(){
			return this.getAttribute('data-pk');
		}
	},
	methods: {
		setData: function(data){
			_populateData(data);
			this.xtag.entityData = data;
			this.setAttribute('data-hasdata') = true;
			xtag.fireEvent(this, 'dataavailable', { bubbles: false });
		}, 
		_populateData: function(data){
			//set setters with data
			if (!this.pk && data.pk) this.setAttribute('data-pk') = data.pk;
			for (var k in data){
				if (this[this.xtag.propertyMap[k]] != data[k]){
					this[this.xtag.propertyMap[k]] = data[k];
				}
			}
		}, 
		refresh: function(){
			this.setAttribute('data-hasdata') = false;
			xtag.fireEvent(this, 'dataentitycreated');
		}
	}
}
xtag.pseudos.databind = {
	/*
		create mapping between getter/setter and datastore key
		exmaple: description:databind(body)
	*/
	onAdd: function(pseudo){
		if (!this.xtag.propertyMap) this.xtag.propertyMap = {};
		var property = pseudo.key.split(':')[0];
		this.xtag.propertyMap[pseudo.value || property] = property;
	}, 
	listener: function(pseudo, fn, args){
		var property = pseudo.key.split(':')[0];
		if (this[property] != args[0]){
			xtag.fireEvent(this, 'datapropertychanged', { 
				dataProperty: { key: pseudo.value || property , value: args[0] }
			});
		}
	}
}

/*
	Attributes:
		data-pk:  pk of item
		data-view: list|detail
*/

var templates = { 
	list: '<p class="x-todo-item-title">${title}</p>',
	detail: '<p class="x-todo-item-title">${title}</p><p class="x-todo-item-description">${description}</p>',
	edit: '<input class="x-todo-item-title" type="text" value="${title}"/><input class="x-todo-item-title" type="text" value="${description}"/>'
}

xtag.register('x-todo-item', {
	onCreate: function(){		
		this.setAttribute('data-hasdata', false);
	},
	onInsert: function(){
		var template = templates[this.getAttribute('data-template')] || templates['list'];
		template.replace('${title}', this.title)
			.replace('${description}', this.description);

		this.innerHtml = template;
		this.xtag.title = xtag.query(this, 'x-todo-item-title');
		this.xtag.description = xtag.query(this, 'x-todo-item-description');
	},
	mixins: [ 'databind' ],
	events:{
		'dataavailable': function(e, elem){
			//populate item from elem.xtag.data
		}
	},
	setters: {
		'title:databind()': function(value){
			if (this.xtag.title) this.xtag.title.innerHtml = value;
		}, 
		'description:databind(body)': function(value){
			if (this.xtag.description) this.xtag.description.innerHtml = value;
		}, 
		'date:databind()': function(){

		}, 
		'starred:databind()': function(){

		}, 
		'completed:databind()': function(){
			
		}, 
		'template': function(){

		}
	},
	getters: {
		title: function(){
			return this.xtag.entityData.title;
		}, 
		description: function(){
			return this.xtag.entityData.description;
		}, 
		date: function(){

		}, 
		starred: function(){

		}, 
		completed: function(){

		}, 
		template: function(){

		}
	}, 
	methods: {

	}
});


function locateProvider = function(target, fn){
	xtag.query(document, 'x-indexdb').forEach(function(db)){
			var match =	(target.matchesSelector || 
				target.mozMatchesSelector ||
				target.webkitMatchesSelector).call(target, db.getAttribute('for'));
			if (match) fn(db);
	});
}

document.addEventListener('datapropertychanged', function(e){
	console.log("datapropertychanged", e.dataProperty, e);
	locateProvider(e.target, function(db){

	});
});

document.addEventListener('dataentitycreated', function(e){
	console.log("dataentitycreated", e.target.getAttribute('data-pk'));
	locateProvider(e.target, function(db){
		if (e.target.getAttribute('data-hasdata') == 'false') && e.target.pk){
			db.getById(e.target.pk, function(err, data){
				
			});
		}
	});
});


xtag.mixins.datasource = {
	onInsert: function(){
		console.log("insert x-datasource");
	}
}

xtag.register('x-indexdb', {
	onCreate: function(){

	},
	onInsert: function(){
		console.log("insert x-indexDb");
	},
	mixins: ['datasource'],
	events: {
	},
	setters: {
		/*
			Selector for tags that are for this x-indexDb tag instance
		*/
		for: function(value){

		},
		/*
			indexDb file namespace 
		*/
		path: function(value){

		}, 
		/*
			indexDb schema 
		*/
		schema: function(value){

		},
		/*
			
		*/
		validation: function(value){

		}
	},
	getters: {

	},
	methods:{
		query: function(query, callback){

		}, 
		getById: function(id, callback){

		}
	}
});



/*
	changes the event target
*/
xtag.pseudos.target = {
	onAdd: function(pseudo, fn){
		console.log("applying target pseudo", pseudo, fn);
		var type = pseudo.key.split(':')[0];
		this.removeEventListener(type, fn);
		function attachEvent(element, type, fn){
			var wrapped = xtag.applyPseudos(element, type, fn);
			element.addEventListener(type, wrapped, 
				!!~['focus', 'blur'].indexOf(type));
		}
		if (pseudo.value == 'document') attachEvent(document, type, fn);
		else {
			xtag.query(document, pseudo.value).forEach(function(element){
				attachEvent(element, type, fn);
			});
		}
	}
}