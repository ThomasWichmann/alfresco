var ExtendedUserImport = {
	
	isDryRun: false,
	isVerbose: false,
	setAccountEnabled: true,
	notifyByEmail: false,
	csvDelimiter: ",",
	
	csv: {
	    headers: null,
	    data: null
	},

	    response: {
		success: false,
	    	messages: []
	    },

	run: function() {
	    	
	var csvContent = this.loadParameters();

	    this.log('Starting ... ');

	    this.loadCsv(csvContent);
	    if (this.isVerbose) {
		//this.response.csv = this.csv;
	    }
	    
	this.processData();
	
	this.response.success = true;
	
	return this.response;
    },
    
    loadParameters: function(csvContent) {
	
	var csvContent = null;

	for each (field in formdata.fields)
	{
	  if (field.name == "file")
	  {
	      csvContent = field.value;
	  } else if (field.name == "isDryRun")
	  {
	      this.isDryRun = this.toBoolean(field.value);
	  } else if (field.name == "isVerbose")
	  {
	      this.isVerbose = this.toBoolean(field.value);
	  } else if (field.name == "setAccountEnabled")
	  {
	      this.setAccountEnabled = this.toBoolean(field.value);
	  } else if (field.name == "notifyByEmail")
	  {
	      this.notifyByEmail = this.toBoolean(field.value);
	  }
	  
	  if (this.toBoolean(field.value)) {
//		  this.log('enabled parameters: ' + field.name + "=" + field.value);
//		  this.log('Given parameters: ' + field.name + "=" + field.value);
	  }
	}
	
	return csvContent;
    },
    
    toBoolean: function(value) {
	return value != 0;
    },
    
    loadCsv: function(csvContent) {

	// Create a regular expression to parse the CSV values.
	var csvPattern = new RegExp(
	            (
	                // Delimiters.
	                "(\\" + this.csvDelimiter + "|\\r?\\n|\\r|^)" +
	                // Quoted fields.
	                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
	                // Standard fields.
	                "([^\"\\" + this.csvDelimiter + "\\r\\n]*))"
	            ),
	            "gi"
	            );
	this.csv.data = [[]];
	var matchingGroups = null;
	var isHeaderRow = true;
	while (matchingGroups = csvPattern.exec( csvContent )){
	    var strMatchedDelimiter = matchingGroups[ 1 ];
	    if (
		    strMatchedDelimiter.length &&
		    (strMatchedDelimiter != this.csvDelimiter)
	    ){
		// new row
		if (isHeaderRow) {
		    this.csv.headers = this.csv.data.shift();
		    isHeaderRow = false;
		} else {
		    if (this.csv.data[ this.csv.data.length - 1 ].length != this.csv.headers.length) {
			this.log('Row does contain insufficient number of columns: ' + this.csv.data.pop());
		    }
		}
		this.csv.data.push( [] );
	    }
	    // value (quoted or unquoted).
	    if (matchingGroups[ 2 ]){
		var strMatchedValue = matchingGroups[ 2 ].replace(
			new RegExp( "\"\"", "g" ),
	                    "\""
	                    );
	    } else {
		// non-quoted value.
		var strMatchedValue = matchingGroups[ 3 ];
		if (strMatchedValue) {
			strMatchedValue = strMatchedValue.trim();
		}
	    }

	    this.csv.data[ this.csv.data.length - 1 ].push( strMatchedValue );
	}
	    if (this.csv.data[ this.csv.data.length - 1 ].length != this.csv.headers.length) {
		this.log('Row does contain insufficient number of columns: ' + this.csv.data.pop());
	    }
    },    
    
    log: function(message) {
	if (this.isVerbose) {
	    logger.log('ExtendedUserImport: ' + message);
	    this.response.messages.push(message);
	}
    },
    
    processData:function() {
	for each(var row in this.csv.data){
	    var data = [];
	    // this.log('processData: ' + row);
	    for (var i=0; i<this.csv.headers.length; i++){
		data[this.csv.headers[i]] = row[i];
		//this.log('processData: ' + this.csv.headers[i] + ':' + row[i]);
	    }
	    //this.log('processData: ' + jsonUtils.toJSONString(data));

	    if (people.getPerson(data['username'])) {
		this.log('Username already exists: ' + data['username']);
	    } else {
		var user;
		if (this.isDryRun) {
		    user = people.getPerson(data['username']);
		} else {
		    user = people.createPerson(data['username'], data['firstname'], data['lastname'], data['email'], data['password'], this.setAccountEnabled, this.notifyByEmail);
		    user.properties['organization'] =  data['organization'];
		    user.save();
		    this.log('Added user: ' + data['username']);
		}
				
		var groupsData = data['groups'];
		for each(var group in groupsData.split(',')) {
			if (group.trim()) {
			    var cleanedGroup = 'GROUP_' + group.trim();
			    if (cleanedGroup) {
				var groupNode = people.getGroup(cleanedGroup);
				    //this.log('found group: ' + groupNode);
				if(groupNode){
				    if (!this.isDryRun) {
					    this.log('Added to group: ' + cleanedGroup);
					    people.addAuthority(groupNode, user);
				    }
				} else {
				    this.log('Group not found: ' + cleanedGroup);
				}
			    }
			}
		}

		for each(var site in data['sites'].split(',')) {
		    if (site) {
		    var siteData = site.split(':');
		    	
		    var cleanedSite = siteData[0].trim();
		    var cleanedSiteRole = siteData[1].trim();
		    if (cleanedSite) {
			var siteNode = siteService.getSite(cleanedSite);
			if(siteNode){
			    if (!this.isDryRun) {
				    this.log('Added to site: ' + cleanedSite);
				siteNode.setMembership(data['username'], cleanedSiteRole);
			    }
			} else {
			    this.log('Site not found: ' + cleanedSite);
			}
		    }
		    
		    }

		}
		
	    }

	}
    }
    
}

model["response"] = ExtendedUserImport.run();
