function main(){
	//var parser = new Parser("storagefacility.xml");
	//var parser = new Parser("sourcefacility.xml");
  //var parser = new Parser("file:///home/scopatz/cyclus/src/Models/Facility/StorageFacility/StorageFacility.rng");
  var parser = new Parser("file:///C:/Users/Kevin/Documents/GitHub/core/src/Models/Facility/StorageFacility/StorageFacility.rng");
  
  var parsed_obj = parser.parse_obj();
  parser.printObject(parsed_obj, 0);	
}

function mainGather(){
  //gatherSchemas('/home/scopatz/cyclus')
  //gatherSchemas('../../cyclus')
  gatherSchemas('file:/Users/Robert/cyclus/src/core');
  //gatherSchemas('http://raw.github.com/cyclus/core/master/src/Models/Facility/StorageFacility/StorageFacility.rng');
   
}

function cycicXMLHttpRequest() {
  if (window.XMLHttpRequest) {
    var xhttp = new XMLHttpRequest()
  }
  else { // IE 5/6
    var xhttp = new ActiveXObject("Microsoft.XMLHTTP")
  }
  return xhttp
}

//
// Parser Class
//

function Parser(word){
	this.currentIndex = new Array();
	this.jsObjName = new Array();
	this.elementTrace = new Array();
	this.file = word;
}

Parser.prototype.speak = function() {
	document.write(this.word);
}
	
// Take XML and convert to JS object to be printed out.
Parser.prototype.parse_obj = function() {
	var xhttp = cycicXMLHttpRequest()
	xhttp.open("GET", this.file, false);
	xhttp.send();
	xmlDoc=xhttp.responseXML; 

	var x = xmlDoc.childNodes[0].childNodes;

	// First, start looking for the main parent name by searching for the 'define' tag
	for(n=0; n<x.length; n++){
    // If found, start printing out the children
		if (x[n].nodeName === 'define'){
			var elements = x[n].childNodes[1].childNodes;
							
		this.jsObjName[x[n].childNodes[1].getAttribute('name')] = {};
		this.jsObjName[x[n].childNodes[1].getAttribute('name')] = this.parseObject(elements);
		}
	}
	return this.jsObjName; 
}
	
Parser.prototype.parseObject = function(a){
	var spaces = new Array();
	result = {};
	for (i=0; i<a.length; i++){
		// Extract only the element, not the text objects
		if(a[i].nodeName != '#text'){
			if(a[i].nodeName != '#comment'){
				var currentElement = a[i];
				// If the object has a 'name' attribute, print it
				if(currentElement.getAttribute('name')){
					this.currentIndex.push(i);
					
					result[currentElement.getAttribute('name')] = {};						
					this.elementTrace.push(result);
					tempList = this.parseObject(currentElement.childNodes);
					result = this.elementTrace.pop(result);
					result[currentElement.getAttribute('name')] = tempList;
					
					i = this.currentIndex.pop(i);
				}
				
				// If the object has a 'type' attribute, print it
				else if(currentElement.getAttribute('type')){
					this.currentIndex.push(i);	
					
					result[currentElement.getAttribute('type')] = {};
					this.elementTrace.push(result);
					tempList = this.parseObject(currentElement.childNodes);
					result = this.elementTrace.pop(result);
					result[currentElement.getAttribute('type')] = tempList;
					
					i = this.currentIndex.pop(i);
				}
				else if(currentElement.getAttribute('name') === null){
					if(currentElement.getAttribute('type') === null){

						this.currentIndex.push(i);	
						
						result[currentElement.nodeName] = {};
						this.elementTrace.push(result);
						tempList = this.parseObject(currentElement.childNodes);
						result = this.elementTrace.pop(result);
						result[currentElement.nodeName] = tempList;
					
						i = this.currentIndex.pop(i);
					}
				}
			}
		}
	}
	return result;
}
	
// Function used to recursively print the JS object
Parser.prototype.printObject = function(parsed_object, spaces) {
	var count = 0;
	// Loop through each element in the object
	for (var key in parsed_object) {
		// Keep track of the current index
		count++;
		// If the element has more than one child, print out the parent,
		// the children and its children
		if(this.getChildrenNum(parsed_object[key]) > 1){
			document.write("[\"" + key + "\",<br>");
			this.inputSpaces(spaces + 1);
			document.write("[<br>");
			this.inputSpaces(spaces + 2);
			this.printObject(parsed_object[key], spaces + 2);
			this.inputSpaces(spaces + 1);
			document.write("]<br>");
			this.inputSpaces(spaces);
			document.write("]<br>");
		}
		// If the element has exactly one child, print out the parent and its
		// single child
		else if (this.getChildrenNum(parsed_object[key]) == 1){
			document.write("[\"" + key + "\", ");
			length = this.getLength(parsed_object);
			tempKey = this.getKey(parsed_object[key]);
			// If the parent's child has no children, just print out the child with
			// closing brackets
			if (this.getChildrenNum(parsed_object[key][tempKey]) == 0){
				document.write("\"" + this.getKey(parsed_object[key]) + "\"");
				// Check if we are at the last element
				if(count == length){
					document.write("]<br>");
				}
				else{
					document.write("],<br>");
					this.inputSpaces(spaces);
				}
			}
			// If the parent's child has children, print out everything and print the
			// children's children
			else {
				document.write("<br>");
				this.inputSpaces(spaces +1);
				this.printObject(parsed_object[key], spaces + 1);
				this.inputSpaces(spaces);
				document.write("]<br>");
			}
		}
		// If the parent has no child, it is a ref, so just print out the parent
		else if (this.getChildrenNum(parsed_object[key]) == 0){
			length = this.getLength(parsed_object);
			//If it is the last element, print just a newline
			if (count == length) {
				document.write("\"" + key + "\"<br>");
			}
			else {
				document.write("\"" + key + "\",<br>");
				this.inputSpaces(spaces);
			}
		}
	}	
}

// Helper function used to get the length of the elements within a parent
Parser.prototype.getLength = function(object) {
	var length = 0;
	for (var key in object){
		length++;
	}
	return length;
}

// Helper function used to get the key value in an object
// Only used when we know that the parent has just one child
Parser.prototype.getKey = function(object) {
	var att = "";
	for (var key in object) {
		att = key;
	}
	return att;
}

// Helper function used to determine the number of children in a node
Parser.prototype.getChildrenNum = function(node) {
	var count = 0;
	for (var key in node){
		if (key) {
			count++;
		}
	}
	return count;
}

// Helper function used to print out 'num' amount of tabs for formatting purposes
Parser.prototype.inputSpaces = function(num) {
	for(k=0; k < num; k ++){
		document.write('&nbsp&nbsp&nbsp&nbsp');
	}
}

function gatherSchemas(cyclusPath){
  // Default arguments
  cyclusPath = typeof cyclusPath !== 'undefined' ? cyclusPath : ''
  if (cyclusPath == ''){
	console.error("cyclusPath is empty")
  }

  // local vars
  var i = 0
  var parser = null
  var schemas = {}
  var rngRelPath = ""
  var rngFullPath = ""
  var reFac = /eFacility/

  // get the list of all rng files and parse them
  var xhttp = cycicXMLHttpRequest();
  xhttp.open("GET", "rngdump.json", false)
  xhttp.send()
  var rngPaths = JSON.parse(xhttp.responseText)
  document.write(typeof(rngPaths) + "<br/>")
  document.write(Object.prototype.toString.call(rngPaths) + "<br/>")
  for (i in rngPaths) {
	rngRelPath = rngPaths[i]
	rngFullPath = cyclusPath + '/' + rngRelPath
	parser = new Parser(rngFullPath)
	schemas[rngRelPath] = parser.parse_obj()
	/**if (rngRelPath.match(reFac) !== null) {
	  schemas[rngRelPath] = new Parser(rngFullPath)
	}**/
  }

  for (s in schemas) {
	document.write(s + ":  " + "<br/>")
	var parser = new Parser('blah')
	//parser.printObject(schemas[s],0)
  }
  return schemas
}

//main();
mainGather();

//
//MENTAL NOTES TO SELF
//

/**
xmlDoc.childNodes[0].nodeName -- 'grammer'
xmlDoc.childNodes[0].childNodes[1].nodeName -- 'define'
xmlDoc.childNodes[0].childNodes[1].childNodes[1] --element RecipeReactor 
xmlDoc.childNodes[0].childNodes[1].childNodes[1].childNodes[1].nodeName --oneOrMore

for(i=0; i<elements.length; i++){
	document.write(elements[1].childNodes[i]);
}

//print tag name and value of the name attribute. change 'name' to type to get the data type of the object
document.write(xmlDoc.getElementsByTagName('element')[1].childNodes[1].getAttribute('name'));
document.write(xmlDoc.getElementsByTagName('element')[1].childNodes[1].nodeName);

//prints inrecipt.. why
document.write(xmlDoc.getElementsByTagName('element')[1].childNodes[1].nextSibling.nextSibling.getAttribute('name'));
**/

/**************************************************************************************
  *                               JSON to XML Parser                                  *
  *************************************************************************************/
  
function JsonToXmlParser(word){
    this.currentIndex = new Array();
    if (window.XMLHttpRequest) {
        this.xmlObj = (new DOMParser()).parseFromString("<simulation/>", "text/xml");
    }
    
    /** IE 5/6 */
    else { 
        this.xmlObj = new ActiveXObject("Microsoft.XMLHTTP");
    }
    
    
    this.elementTrace = new Array();
    var xhttp = cycicXMLHttpRequest();
    xhttp.open("GET", word, false);
    xhttp.send();
    this.jsonObj = JSON.parse(xhttp.responseText);
    
    
}

/** Should make an error check of JSON format */
JsonToXmlParser.prototype.parse_obj = function() {
    var elements = new Array();
    var x = this.xmlObj.getElementsByTagName('simulation')

    for (var key in this.jsonObj) {
        elements.push(key)
        //x[0].appendChild(this.xmlObj.createElement(key));
    }
    
    //this.print_obj(this.xmlObj);
    x[0].append(this.parseObject(elements))
    
}

JsonToXmlParser.prototype.parseObject = function(elements) {
    var x = this.xmlObj.getElementsByTagName('simulation');
    var result;
    for (i=0; i<elements.length;i++){
        document.write(elements[i] + '<br>');
        
        for (var key in this.jsonObj[elements[i]]){
            document.write(key + '<br>')

            // If the node is of type 'commodity', add its name.
            if (elements[i] == 'commodities'){
                var elmt = this.xmlObj.createElement('commodity');
                var elmtName = this.xmlObj.createElement('name');

                elmtName.textContent = key;
                elmt.childNodes[0] = elmtName;
                x[0].appendChild(elmt);
            }
            
            // If the node is of type 'market', add its name and any other attributes.
            else if (elements[i] = 'markets'){
                var elmt = this.xmlObj.createElement('market');
                var elmtName = this.xmlObj.createElement('name');
                var childNodeIndex = 0;
                
                elmtName.textContent = key;
                elmt.childNodes[childNodeIndex] = elmtName;
                childNodeIndex++;
                for (var attribute in this.jsonObj[elements[i]][key]){
                    subElmt = this.xmlObj.createElement(attribute);
                    subElmt.textContext = this.jsonObj[elements[i]][key][attribute];
                    elmt.childNodes[childNodeIndex] = subElmt;
                    childNodeIndex++;
                   
                    document.write(attribute);
                
                }
                x[0].appendChild(elmt);
            }
            
            if (this.getLength(this.jsonObj[elements[i]][key]) != 0){
                //document.write(this.objectToArray(this.jsonObj[elements[i]][key]));
            }
            document.write('<br><br>');
        }
        
    }
    return result
}

JsonToXmlParser.prototype.print_obj = function(xmlObject){
    var listOfNodes = xmlObject.childNodes[0].childNodes;

    document.write('Number of Elements in xmlObj: ' + this.xmlObj.childNodes[0].childNodes.length + '<br>')

    for (i=0; i<listOfNodes.length; i++){
        document.write(listOfNodes[i].nodeName + '<br>');
    }
}

JsonToXmlParser.prototype.getLength = function(object) {
	var length = 0;
	for (var key in object){
		length++;
	}
	return length;
}

JsonToXmlParser.prototype.objectToArray = function(object){
    var list = new Array()
    for (var element in object){
        list.push(element);
    }
    return list
}





var schemas = {}

function gatherSchemas(cyclusPath){
  
  /** Default arguments. */
  cyclusPath = typeof cyclusPath !== 'undefined' ? cyclusPath : ''
  if (cyclusPath == ''){
	console.error("cyclusPath is empty")
  }

  /** Local vars. */
  var i = 0
  var parser = null
  var schemas = {}
  var rngRelPath = ""
  var rngFullPath = ""
  var reFac = /eFacility/

  /** Get the list of all rng files and parse them. */
  var xhttp = cycicXMLHttpRequest();
  xhttp.open("GET", "rngdump.json", false)
  xhttp.send()
  var rngPaths = JSON.parse(xhttp.responseText)
  //document.write(typeof(rngPaths) + "<br/>")
  //document.write(Object.prototype.toString.call(rngPaths) + "<br/>")
  for (i in rngPaths) {
	rngRelPath = rngPaths[i]
        
        /** Test to see if server request works. */
        rngRelPath =
            "\"https://raw.github.com/cyclus/cyclus/master/src/Models/Facility/StorageFacility/StorageFacility.rng\""
        if (rngRelPath.slice(0,4) == '\"htt'){
            $(document).ready(function() {
                $.ajax({
                    crossDomain: true,
                    type: 'GET',
                    url: 'http://query.yahooapis.com/v1/public/yql?q=select * from xml where url=' + rngRelPath,
                    dataType: 'jsonp',
                    success: function(response){
                        if(response.results[0] != undefined){
                            var text = response.results[0];
                            if (window.ActiveXObject){
                                var doc=new ActiveXObject('Microsoft.XMLDOM');
                                doc.async='false';
                                doc.loadXML(text);
                            } else {
                            var parser=new DOMParser();
                            var doc=parser.parseFromString(text,'text/xml');
                            }
                        
                            var parser = new Parser(doc);
                            var parsedObj = parser.parse_obj();
                            schemas[rngRelPath] = parsedObj;
                            //parser.printObject(parsedObj, 0);
                        }
                        else{
                            alert('Response undefined; incorrect url');
                        }
                    }
                })
            });
            
        }
        else{
            rngFullPath = cyclusPath + '/' + rngRelPath;
            parser = new Parser(rngFullPath);
            schemas[rngRelPath] = parser.parse_obj();
            
            /** 
             * if (rngRelPath.match(reFac) !== null) {
             * schemas[rngRelPath] = new Parser(rngFullPath)
             * }
             */
        }
  }

  for (s in schemas) {
	document.write(s + ":  " + "<br/>")
	//var parser = new Parser('blah')
	//parser.printObject(schemas[s],0)
  }
  //document.write(schemas);
  return schemas;
}

