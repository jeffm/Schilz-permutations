var fs = require('fs');
var JSONoutpath = 'c:/rhythmGenerator/permutation10_9.json'
//change the next 4 lines depending on the permutation you're creating.
var exclude = [];
var size = 10;
var include = ['1','2','3','4','5','6','7','8','9','0'];
var start = 9012345678;
var end = 	9876543210;
var permArray = [];
var iString;
for (i=start;i<=end;i++) {
	iString = i.toString();
	if (iString.length < size) {
		iString = '0' + iString;
	}
	var includeFlag = true;
	for (m=0;m<exclude.length;m++) {
		if (iString.indexOf(exclude[m]) > -1) {
			includeFlag = false;
			break;
		}
	}
	for (m=0;m<include.length;m++) {
		var regex = new RegExp( include[m], 'g' );
		if ((iString.match(regex) || []).length > 1) {
			includeFlag = false;
			//console.log('Double!!');
			break;
		}
	}
	if (includeFlag) {
		tempArray = []
		for (c=0;c<=iString.length-1;c++) {
			tempArray.push(iString.substring(c,c+1));
		}
		permArray.push(tempArray);
		//console.log(JSON.stringify(tempArray,null,4));
	}
}

console.log('JSONoutpath:' + JSONoutpath);
if (typeof JSONoutpath != 'undefined' && JSONoutpath != '') {
	try {
		var outFile = fs.openSync(JSONoutpath,'w');
		var stringified = JSON.stringify(permArray,function(k,v){
		   if(v instanceof Array)
			  return JSON.stringify(v);
		   return v;
			},4)
			.replace(/"\[/g, '[')
			.replace(/\]"/g, ']')
			.replace(/\\"/g, '"')
			.replace(/""/g, '"');
		fs.writeSync(outFile,stringified);
	} catch {
		console.og('oops');
	}
}
		
	