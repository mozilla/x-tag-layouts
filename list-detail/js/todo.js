xtag.mixins.databind = {
	onCreate: function(){
		this.xtag.entityData = {};
	},
	onInsert: function(){
		xtag.fireEvent(this, 'dataentitycreated');
	},	
	getters:{
		pk: function(){
			return this.dataset.pk;
		}
	},
	setters:{
		pk: function(value){
			this.dataset.pk = value;
		}
	}
}

xtag.pseudos.databind = {
	/*
		create mapping between getter/setter and datastore key
		exmaple: description:databind(body)
	*/
	onAdd: function(pseudo){
		if (!this.xtag.entityData) this.xtag.entityData = {};
		if (!this.xtag.propertyMap) this.xtag.propertyMap = {};
		var property = pseudo.key.split(':')[0];
		this.xtag.propertyMap[pseudo.value || property] = property;
	}, 
	listener: function(pseudo, fn, args){
		var property = pseudo.key.split(':')[0];
		if (this[property] !== args[0]){
			this.xtag.entityData[property] = args[0];
			xtag.fireEvent(this, 'datapropertychanged', { 
				dataProperty: { key: pseudo.value || property , value: args[0] }
			});
		}
		fn.apply(this, args);
	}
}


xtag.register('x-todo-item', {
	mixins: ['template', 'databind'],
	onCreate: function(){	
		this.setAttribute('template', 'todo-item-list');
	},
	onInsert: function(){
		
	},
	events: {
		
	},
	setters: {
		'title:databind()': function(){
		}, 
		'description:databind(body)': function(){
		}, 
		'date:databind()': function(){
		}, 
		'starred:databind()': function(){
		}, 
		'completed:databind()': function(){
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
			return this.xtag.entityData.date;
		}, 
		starred: function(){
			return this.xtag.entityData.starred;
		}, 
		completed: function(){
			return this.xtag.entityData.completed;
		}
	}
});


xtag.register('x-todo-list', {
	onInsert: function(){
		this.refresh();
	}, 
	setters: {
		for: function(){
		}, 
		query: function(value){
			this.setAttribute('query', value);
			this.refresh();
		}
	},
	getters: {
		query: function(){ 
			return this.getAttribute('query');
		}
	},
	methods: {
		refresh: function(){
			var self = this;
			this.innerHTML = '';
			var datasource = document.getElementById(this.getAttribute('for'));
			if (datasource){
				var query = {};
				try { query = JSON.parse(this.query.replace(/'/g,"\"")); } catch(e) {};				
				datasource.query(query, function(items){					
					items.forEach(function(item){
						var todo = document.createElement('x-todo-item');
						todo.setAttribute('template', 'todo-item-list');
						todo.dataset.pk = item.ID;
						for (var k in item){
							todo[k] = item[k];
						}
						self.appendChild(todo);
					});
				});
			}
		}
	}
});





xtag.register('x-value', {
	onInsert: function(){
		var self = this;
		var parentElem = this.parentNode;
		if (!parentElem.hasAttribute('data-valuepopulating')){
			parentElem.setAttribute('data-valuepopulating', '');
			xtag.toArray(parentElem.children).forEach(function(elem){
				if (elem.nodeName == 'X-VALUE'){
					parentElem[elem.getAttribute('key')] = elem.innerHTML;
				}
			});
			parentElem.innerHTML = '';
			parentElem.removeAttribute('data-valuepopulating');
			xtag.fireEvent(parentElem, 'dataavailable', {}, { bubbles: false });
		}
	}
});




/*


	Local Storage Tag

*/

function locateProvider(target, fn){
	xtag.query(document, 'x-localstorage').forEach(function(db){
			var match =	(target.matchesSelector || 
				target.mozMatchesSelector ||
				target.webkitMatchesSelector).call(target, db.getAttribute('for'));
			if (match) fn(db);
	});
}

document.addEventListener('datapropertychanged', function(e){
	locateProvider(e.target, function(db){
		var pk = e.target.getAttribute('data-pk');
		if (pk){
			var obj = {};
			obj[e.dataProperty.key] = e.dataProperty.value;
			db.update(Number(pk), obj, function(entity){
				e.target.xtag.entityData = entity;
				xtag.fireEvent(e.target, 'datapropertysaved', 
					{ entityData: entity }, { bubbles: false });
			});
		}
	});
});

document.addEventListener('dataentityupdated', function(e){

	locateProvider(e.target, function(db){

	});

});

document.addEventListener('dataentitycreated', function(e){
	locateProvider(e.target, function(db){
		var pk = e.target.pk;
		if (pk){
			db.get(Number(pk), function(entity){
				e.target.xtag.entityData = entity;
			});
		} else {			
			var entity = db.insert(e.target.xtag.entityData);			
			e.target.setAttribute('data-pk', entity.ID);
			e.target.xtag.entityData = entity;
		}
	});
});

xtag.register('x-localstorage', {
	onCreate: function(){
		this.xtag._initDb = function(){
			var pathParts = this.getAttribute('path').split('/');
			this.xtag.dbName = pathParts[0];
			this.xtag.table = pathParts[1];

			var lib = new localStorageDB(this.dbName);
			
			if (!lib.tableExists(this.table)){
				var schema = [];
				xtag.toArray(this.children).forEach(function(elem){
					if (elem.nodeName == 'X-PROPERTY'){
						schema.push(elem.getAttribute('key'));
					}
				});
				lib.createTable(this.table, schema);
				lib.commit();
			}
			this.xtag.storage = lib;
		}.bind(this);
	},
	onInsert: function(){
		this.xtag._initDb();
	},
	events: {

	},
	setters: {
		/*
			Selector for tags that are for this persistance tag instance
		*/
		for: function(value){

		},
		/*
			namespace 
		*/
		path: function(value){
			this.xtag._initDb();
		}
	},
	getters: {
		dbName: function(){
			return this.xtag.dbName;
		}, 
		table: function(){
			return this.xtag.table;
		}
	},
	methods:{
		query: function(query, limit, callback){
			if (!query || Object.keys(query).length == 0){
				query = null;
			}
			if (typeof limit == 'function'){
				callback = limit;
				limit = 999;
			}
			var data = this.xtag.storage.query(this.table, query, limit);
			if (callback) callback(data);
			else return data;
		}, 
		get: function(id, callback){
			return callback ? this.query({ ID: id }, function(res){
					callback(res[0]);
				}) :  this.query({ ID: id })[0];			
		}, 
		update: function(id, data, callback){
			var updated = null;
			this.xtag.storage.update(this.table, { ID: id }, function(row){
				for (var key in data){
					if (key != 'ID') row[key] = data[key];					
				}
				updated = row;
				return row;
			});
			this.xtag.storage.commit();
			if (callback) callback(updated);
			else return updated;
		},
		insert: function(data, callback){
			var id = this.xtag.storage.insert(this.table, data);
			this.xtag.storage.commit();
			if (callback) this.get(id, callback);
			else return this.get(id);
		}
	}
});



/*
	Kailash Nadh (http://kailashnadh.name)
	
	localStorageDB
	September 2011
	A simple database layer for localStorage

	License	:	MIT License
*/

function localStorageDB(db_name) {

	var db_prefix = 'db_',
		db_id = db_prefix + db_name,
		db_new = false,	// this flag determines whether a new database was created during an object initialisation
		db = null;

	// if the database doesn't exist, create it
	db = localStorage[ db_id ];
	if( !( db && (db = JSON.parse(db)) && db.tables && db.data ) ) {
		if(!validateName(db_name)) {
			error("The name '" + db_name + "'" + " contains invalid characters.");
		} else {
			db = {tables: {}, data: {}};
			commit();
			db_new = true;
		}
	}
	
	
	// ______________________ private methods
	
	// _________ database functions
	// drop the database
	function drop() {
		delete localStorage[db_id];
		db = null;
	}
			
	// number of tables in the database
	function tableCount() {
		var count = 0;
		for(var table in db.tables) {
			if( db.tables.hasOwnProperty(table) ) {
				count++;
			}
		}
		return count;
	}

	// _________ table functions
	
	// check whether a table exists
	function tableExists(table_name) {
		return db.tables[table_name] ? true : false;
	}
	
	// check whether a table exists, and if not, throw an error
	function tableExistsWarn(table_name) {
		if(!tableExists(table_name)) {
			error("The table '" + table_name + "' does not exist.");
		}
	}
		
	// create a table
	function createTable(table_name, fields) {
		db.tables[table_name] = {fields: fields, auto_increment: 1};
		db.data[table_name] = {};
	}
	
	// drop a table
	function dropTable(table_name) {
		delete db.tables[table_name];
		delete db.data[table_name];
	}
	
	// empty a table
	function truncate(table_name) {
		db.tables[table_name].auto_increment = 1;
		db.data[table_name] = {};
	}
	
	// number of rows in a table
	function rowCount(table_name) {
		var count = 0;
		for(var ID in db.data[table_name]) {
			if( db.data[table_name].hasOwnProperty(ID) ) {
				count++;
			}
		}
		return count;
	}
	
	// insert a new row
	function insert(table_name, data) {		
		data.ID = db.tables[table_name].auto_increment;
		db.data[table_name][ db.tables[table_name].auto_increment ] = data;
		db.tables[table_name].auto_increment++;		
		return data.ID;
	}
	
	// select rows, given a list of IDs of rows in a table
	function select(table_name, ids) {
		var ID = null, results = [], row = null;
		for(var i=0; i<ids.length; i++) {
			ID = ids[i];
			row = db.data[table_name][ID];
			results.push( clone(row) );
		}
		return results;
	}
	
	// select rows in a table by field-value pairs, returns the IDs of matches
	function queryByValues(table_name, data, limit) {
		var result_ids = [],
			exists = false,
			row = null;

		// loop through all the records in the table, looking for matches
		for(var ID in db.data[table_name]) {
			if( !db.data[table_name].hasOwnProperty(ID) ) {
				continue;
			}
			
			row = db.data[table_name][ID];
			exists = true;

			for(var field in data) {
				if( !data.hasOwnProperty(field) ) {
					continue;
				}

				if(typeof data[field] == 'string') {	// if the field is a string, do a case insensitive comparison
					if( row[field] && row[field].toString().toLowerCase() != data[field].toString().toLowerCase() ) {
						exists = false;
						continue;
					}
				} else {
					if( row[field] != data[field] ) {
						exists = false;
						continue;
					}
				}				
			}
			if(exists) {
				result_ids.push(ID);
			}
			if(result_ids.length == limit) {
				break;
			}
		}
		return result_ids;
	}
	
	// select rows in a table by a function, returns the IDs of matches
	function queryByFunction(table_name, query_function, limit) {
		var result_ids = [],
			exists = false,
			row = null;

		// loop through all the records in the table, looking for matches
		for(var ID in db.data[table_name]) {
			if( !db.data[table_name].hasOwnProperty(ID) ) {
				continue;
			}

			row = db.data[table_name][ID];

			if( query_function( clone(row) ) == true ) {	// it's a match if the supplied conditional function is satisfied
				result_ids.push(ID);
			}
			if(result_ids.length == limit) {
				break;
			}
		}
		return result_ids;
	}
	
	// return all the IDs in a table
	function getIDs(table_name, limit) {
		var result_ids = [];
		for(var ID in db.data[table_name]) {
			if( db.data[table_name].hasOwnProperty(ID) ) {
				result_ids.push(ID);

				if(result_ids.length == limit) {
					break;
				}
			}
		}
		return result_ids;
	}
	
	// delete rows, given a list of their IDs in a table
	function deleteRows(table_name, ids) {
		for(var i=0; i<ids.length; i++) {
			if( db.data[table_name].hasOwnProperty(ids[i]) ) {
				delete db.data[table_name][ ids[i] ];
			}
		}
		return ids.length;
	}
	
	// update rows
	function update(table_name, ids, update_function) {
		var ID = '', num = 0;

		for(var i=0; i<ids.length; i++) {
			ID = ids[i];

			var updated_data = update_function( clone(db.data[table_name][ID]) );

			if(updated_data) {
				delete updated_data['ID']; // no updates possible to ID

				var new_data = db.data[table_name][ID];				
				// merge updated data with existing data
				for(var field in updated_data) {
					if( updated_data.hasOwnProperty(field) ) {
						new_data[field] = updated_data[field];
					}
				}
				
				db.data[table_name][ID] = validFields(table_name, new_data);
				num++;
			}
		}
		return num;
	}
	


	// commit the database to localStorage
	function commit() {
		localStorage[db_id] = JSON.stringify(db);
	}
	
	// serialize the database
	function serialize() {
		return JSON.stringify(db);
	}
	
	// throw an error
	function error(msg) {
		throw new Error(msg);
	}
	
	// clone an object
	function clone(obj) {
		var new_obj = {};
		for(var key in obj) {
			if( obj.hasOwnProperty(key) ) {
				new_obj[key] = obj[key];
			}
		}
		return new_obj;
	}
	
	// validate db, table, field names (alpha-numeric only)
	function validateName(name) {
		return name.match(/[^a-z_0-9]/ig) ? false : true;
	}
	
	// given a data list, only retain valid fields in a table
	function validFields(table_name, data) {
		var field = '', new_data = {};

		for(var i=0; i<db.tables[table_name].fields.length; i++) {
			field = db.tables[table_name].fields[i];
			
			if(typeof data[field] != 'undefined') {
				new_data[field] = data[field];
			}
		}
		return new_data;
	}
	
	// given a data list, populate with valid field names of a table
	function validateData(table_name, data) {
		var field = '', new_data = {};
		for(var i=0; i<db.tables[table_name].fields.length; i++) {
			field = db.tables[table_name].fields[i];
			new_data[field] = typeof data[field] != 'undefined' ? data[field] : null;
		}
		return new_data;
	}
	


	// ______________________ public methods

	return {
		// commit the database to localStorage
		commit: function() {
			commit();
		},
		
		// is this instance a newly created database?
		isNew: function() {
			return db_new;
		},
		
		// delete the database
		drop: function() {
			drop();
		},
		
		// serialize the database
		serialize: function() {
			return serialize();
		},
		
		// check whether a table exists
		tableExists: function(table_name) {
			return tableExists(table_name);
		},
		
		// number of tables in the database
		tableCount: function() {
			return tableCount();
		},
		
		// create a table
		createTable: function(table_name, fields) {
			var result = false;
			if(!validateName(table_name)) {
				error("The database name '" + table_name + "'" + " contains invalid characters.");
			} else if(this.tableExists(table_name)) {
				error("The table name '" + table_name + "' already exists.");
			} else {
				// make sure field names are valid
				var is_valid = true;
				for(var i=0; i<fields.length; i++) {
					if(!validateName(fields[i])) {
						is_valid = false;
						break;
					}
				}
				
				if(is_valid) {
					// cannot use indexOf due to <IE9 incompatibility
					// de-duplicate the field list
					var fields_literal = {};
					for(var i=0; i<fields.length; i++) {
						fields_literal[ fields[i] ] = true;
					}
					delete fields_literal['ID']; // ID is a reserved field name

					fields = ['ID'];
					for(var field in fields_literal) {
						if( fields_literal.hasOwnProperty(field) ) {
							fields.push(field);
						}
					}

					createTable(table_name, fields);
					result = true;
				} else {
					error("One or more field names in the table definition contains invalid characters.");
				}
			}

			return result;
		},
		
		// drop a table
		dropTable: function(table_name) {
			tableExistsWarn(table_name);
			dropTable(table_name);
		},
		
		// empty a table
		truncate: function(table_name) {
			tableExistsWarn(table_name);
			truncate(table_name);
		},
		
		// number of rows in a table
		rowCount: function(table_name) {
			tableExistsWarn(table_name);
			return rowCount(table_name);
		},
		
		// insert a row
		insert: function(table_name, data) {
			tableExistsWarn(table_name);
			return insert(table_name, validateData(table_name, data) );
		},
		
		// update rows
		update: function(table_name, query, update_function) {
			tableExistsWarn(table_name);

			var result_ids = [];
			if(!query) {
				result_ids = getIDs(table_name);				// there is no query. applies to all records
			} else if(typeof query == 'object') {				// the query has key-value pairs provided
				result_ids = queryByValues(table_name, validFields(table_name, query));
			} else if(typeof query == 'function') {				// the query has a conditional map function provided
				result_ids = queryByFunction(table_name, query);
			}
			return update(table_name, result_ids, update_function);
		},

		// select rows
		query: function(table_name, query, limit) {
			tableExistsWarn(table_name);
			
			var result_ids = [];
			if(!query) {
				result_ids = getIDs(table_name, limit); // no conditions given, return all records
			} else if(typeof query == 'object') {			// the query has key-value pairs provided
				result_ids = queryByValues(table_name, validFields(table_name, query), limit);
			} else if(typeof query == 'function') {		// the query has a conditional map function provided
				result_ids = queryByFunction(table_name, query, limit);
			}
			return select(table_name, result_ids, limit);
		},

		// delete rows
		deleteRows: function(table_name, query) {
			tableExistsWarn(table_name);

			var result_ids = [];
			if(!query) {
				result_ids = getIDs(table_name);
			} else if(typeof query == 'object') {
				result_ids = queryByValues(table_name, validFields(table_name, query));
			} else if(typeof query == 'function') {
				result_ids = queryByFunction(table_name, query);
			}
			return deleteRows(table_name, result_ids);
		}
	}
}
