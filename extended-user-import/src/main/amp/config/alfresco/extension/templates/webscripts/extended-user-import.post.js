var ExtendedUserImport = {
	
	isDryRun: false,
	csvDelimiter: ",",
	
	run: function() {
	    
	    this.log('Starting ... ');
	
	var csvContent = null;
	for each (field in formdata.fields)
	{
	  if (field.name == "file")
	  {
	      // this.response.message = field.filename + new
		// String(field.content);
	      csvContent = field.value;
	  } else if (field.name == "isDryRun")
	  {
	      this.isDryRun = field.value;
	  }
	  this.response.message += field.name + "=" + field.value;
	}
	
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
	var csvData = [[]];
	var matchingGroups = null;
	while (matchingGroups = csvPattern.exec( csvContent )){
	    this.log('matchingGroups.length: ' + matchingGroups.length);
	    if (matchingGroups.length<=1) {
		continue;
	    }
	    var strMatchedDelimiter = matchingGroups[ 1 ];
	    if (
		    strMatchedDelimiter.length &&
		    (strMatchedDelimiter != this.csvDelimiter)
	    ){
		// new row
		csvData.push( [] );
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
	    }

	    csvData[ csvData.length - 1 ].push( strMatchedValue );
	}
	this.response.csvData = csvData;
	
	this.response.success = true;
    },
    
    log: function(message) {
	logger.log('ExtendedUserImport: ' + message);
    },
    
    response: {
	success: false,
    	message: null
    },

}

ExtendedUserImport.run();

model["response"] = ExtendedUserImport.response;