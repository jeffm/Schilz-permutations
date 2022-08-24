var yargs = require('yargs');
var fs = require('fs');
var AdmZip = require("adm-zip");
var permutations = buildPermSet();
//console.log(permutations);
var globalArguments = parseArguments(process.argv.slice(2));
var mask = globalArguments.mask.split(',');
log('Using permutations zip file:' + globalArguments.projectPath + 'Permutations\\permutations.zip','info');
var permutationSourceFile = new AdmZip(globalArguments.projectPath + 'Permutations\\permutations.zip');

var resArray = buildPermutationList();
//console.log('resArray:' + resArray);
writeResult(globalArguments.outpath, resArray);
//node permutations.js -m "1,2,3,4,5,6,7,*,*" -p "C:\\Schilz-permutations\\" -s "{\"subs\": [\"A\",\"B\",\"C\",\"D\",[\"E\",\"A#\"],\"F\",\"G\",\"Ab\",\"Bb\"]}"
//node permutations.js -m "1,2,3,4,5" -p "C:\\Schilz-permutations\\" -i "5"
function parseArguments(args) {
	var argStructure = {};
	var argv = yargs(args)
		.usage('Usage: $0 <command> [options]')
		.command('generate', 'Generate permutations')
		.example('$0 generate -m "1,2,*,*,*"', 'generate permutations')
		.alias('g', 'generate')
		.describe('g', 'Generate permutations')
		.describe('m', 'Permutation mask.')
		.alias('m', 'mask')
		.describe('i', 'Permutation increment.')
		.alias('i', 'increment')
		.describe('c', 'Return count permutations.')
		.alias('c', 'count')
		.describe('p', 'Path to the project folder.')
		.alias('p', 'project')
		.describe('a', 'True | false indicating whether output should be returned as nested arrays, or concatenated together into a single array')
		.alias('a','array')
		.default('a',false)
		.describe('s','Substitute the included array of symbols. Must be a proper json array, but can be a nested array')
		.alias('s','substitute')
		.describe('o', 'Output file name. Will be placed in the project folder.')
		.alias('o', 'outfile')
		.describe('v', 'Level of detail in console output. None n, Info i, Warn w, Debug d')
		.alias('v', 'verbose')
		.default('v', 'n')

		.help('h')
		.alias('h', 'help')
		.epilog('copyright 2022, Jeffrey D. Mershon')
		.argv;
	//console.log('Your globalArguments are:' + JSON.stringify(argv));
	
	if (typeof argv.mask != 'undefined') {
		argStructure.mask = argv.mask;
		var goodMask = false;
		var maskCount = 0;
		for (var i=0;i<argStructure.mask.length;i++) {
			if (argStructure.mask[i] != '*') {
				maskCount++;
			}
		}
		if (argStructure.mask.length > 4 && maskCount == 0) {
			log('A mask longer than 5 elements must have at least one non-wildcard element','error');
			return;
		}
	}
	if (typeof argv.increment != 'undefined') {
		argStructure.increment = argv.increment;
	}
	if (typeof argv.count != 'undefined') {
		argStructure.count = argv.count;
	}
	if (typeof argv.project != 'undefined') {
		argStructure.projectPath = argv.project.replace(/'/g,'');
		argStructure.outpath = '';
		if (typeof argv.outfile != 'undefined') {
			argStructure.outpath = argStructure.projectPath + argv.outfile.replace(/'/g,'');
			//console.log('outpath:' + argStructure.outpath);
		}
	}
	if (typeof argv.sets != 'undefined' && argv.sets == true) {
		argStructure.separateSets = true;
	} else {
		argStructure.separateSets = false;
	}
	if (typeof argv.substitute != 'undefined') {
		argStructure.separateSets = false;
		console.log("substitute:" + JSON.stringify(argv.substitute));
		var temp = JSON.parse(argv.substitute)
		argStructure.substitute = temp.subs;
	}
	if (typeof argv.verbose != 'undefined') {
		var level = argv.verbose.toLowerCase().substring(0,1);
		//None n, Info i, Warn w, Debug d
		if (level == 'n') {
			argStructure.logLevel = 0;
		} else if (level == 'w') {
			argStructure.logLevel = 1;
		} else if (level == 'i') {
			argStructure.logLevel = 2;
		} else if (level == 'd') {
			argStructure.logLevel = 3;
		}
	} else {
		argStructure.logLevel = 3;
	}
	return argStructure;
}

function log(message,warnLevel) {
	//yes, there are logger packages, but this is a placeholder because my favorite--npmlog--wouldn't load for some reason, and I didn't want to waste time learning a new logger when my needs are simple.
	var level = warnLevel.toLowerCase().substring(0,1);
	var logLevel = 0;
	//None n, Info i, Warn w, Debug d
	if (level == 'e') {
		logLevel = 0;
	} else if (level == 'w') {
		logLevel = 1;
	} else if (level == 'i') {
		logLevel = 2;
	} else if (level == 'd') {
		logLevel = 3;
	}
	//console.log("globalArguments.logLevel:" + globalArguments.logLevel + " logLevel " + logLevel + ' level:' + level);
	if (typeof globalArguments.logLevel == 'undefined' || logLevel <= globalArguments.logLevel) {
		if (logLevel == 0) {
			console.error(message);
		} else if (logLevel == 1) {
			console.warn(message);
		} else if (logLevel == 2) {
			console.info(message);
		} else if (logLevel == 3) {
			console.log(message);
		}
	}
}

function safeStringify(jsonInput) {
	if (typeof jsonInput == 'undefined') return;
	if (jsonInput instanceof Array && jsonInput.length == 0) return;
	//log('safeStringify:' + JSON.stringify(jsonInput),'debug');
	var stringified = JSON.stringify(jsonInput,function(k,v){
		if(v instanceof Array)
			return JSON.stringify(v);
		   return v;
			},4)
			.replace(/"\[/g, '[')
			.replace(/\]"/g, ']')
			.replace(/\\"/g, '"')
			.replace(/""/g, '"');
			return stringified;
}

function writeResult(outpath, resArray) {
	try {
		var outString = safeStringify(resArray);
		if (globalArguments.separateSets == false) {
			outString = outString.replaceAll("],[",",");
			outString = outString.replaceAll("]]","]");
			outString = outString.replaceAll("[[","[");
		}
		var termFlag = false;
		if (typeof globalArguments.substitute != 'undefined') {
			for (var i=1;i<=globalArguments.substitute.length;i++) {
				if (i==10) {
					outString.replaceAll('0',globalArguments.substitute[10]);
				} else {
					outString = outString.replaceAll(i,safeStringify(globalArguments.substitute[i-1]));
				}
			}
			outString = outString.replaceAll("\"\"","\"");
			outString = outString.replaceAll("\"[","[");
			outString = outString.replaceAll("]\"","]");
		}
		console.log(outString);
		if (typeof outpath != 'undefined' && outpath != '') {
			log('WriteResult:' + outpath);
			var outFile = fs.openSync(outpath,'w');
			fs.writeSync(outFile,outString);
		}
	} catch (err) {
	   console.error(err);
	}
}

function openPermutationFile (permLength, increment) {
	var zipEntries = permutationSourceFile.getEntries();
	var desiredPermFile = 'permutation' + permLength.toString() + '_' + increment.toString() + '.json';
	//log('desiredPermFile:' + desiredPermFile, 'debug');
	for (i=0;i<zipEntries.length;i++) {
    //log(zipEntry.name.toString(),'debug'); // outputs zip entries information
		if (zipEntries[i].entryName == desiredPermFile) {
			//console.log('********FOUND IT!*******');
			var aObject = JSON.parse(zipEntries[i].getData().toString("utf8"));
			break;
			//console.log('#######:' + aObject.permutations.length);
		}
	};
	return aObject.permutations;
}

function buildPermutationList() {
	var resultArray = [];
	var permutationSourceArray;
	if (mask.length <= 5) {
		var permSet = mask.length - 3
		permutationSourceArray = permutations[permSet].permutations;
		resultArray = buildPermutations(permutationSourceArray, resultArray);
	} else if (mask.length <= 9) {
		permutationSourceArray = openPermutationFile(mask.length,0);
		resultArray = buildPermutations(permutationSourceArray, resultArray);
	} else if (mask.length == 10) {
		for (var i=0;i<10;i++) {
			permutationSourceArray = openPermutationFile(10,i);
			resultArray = buildPermutations(permutationSourceArray, resultArray);
		}
	}
	return resultArray;
}

function buildPermutations(permutationSourceArray, resultArray) {
	var resArray = [];
	if (typeof permutationSourceArray != 'undefined') {
		log('permutationSourceArray:' + permutationSourceArray.length + '  ' + permutationSourceArray[0],'debug');
		if (typeof globalArguments.increment != 'undefined') {
			resArray = appendPermutationListWithIncrement(permutationSourceArray, resultArray);
		} else if (typeof mask != 'undefined') {
			resArray = appendPermutationUsingMask(permutationSourceArray, resultArray);
		}
	}
	return resArray;
}
	
function appendPermutationListWithIncrement(permutationSourceArray, resultArray) {
	var resArray = resultArray;
	log('appendPermutationListWithIncrement:' + permutationSourceArray.length, 'debug');
	var count = 0;
	var numGenerated = 0;
	var increment = 1;
	if (typeof globalArguments.count != 'undefined') {
		count = globalArguments.count;
	} else if (permutationSourceArray.length < 1000) {
		count = permutationSourceArray.length-1;
	} else {
		count = 1000;
	}
	console.log('count:' + count);
	if (typeof globalArguments.increment != 'undefined') {
		increment = globalArguments.increment;
	} else {
		increment = 1;
	}
	console.log('increment:' + increment);
	var complete = false;
	var inc = 0;
	var loopInc = 1;
	while (!complete) {
		console.log('loop:' + inc);
		if (inc >= permutationSourceArray.length) {
			//123 - 3 = 120
			inc = inc - (inc - permutationSourceArray.length);
			if (inc == permutationSourceArray.length) {
				inc-=loopInc;
				loopInc++;
			}
			increment *= -1;
			console.log('inc too large: newinc:' + inc + ' increment:' + increment);
		} else if (inc < 0) {
			//console.log(inc<0)
			inc = Math.abs(0 - inc);
			if (inc == 0) {
				inc+=loopInc;
				loopInc++;
			}
			increment *= -1;
			console.log('inc too small: newinc:' + inc + ' increment:' + increment);
		}
		resArray.push(permutationSourceArray[inc]);
		numGenerated++;
		if (numGenerated > count) {
			console.log('limit + reached!' + numGenerated);
			break;
		}
		inc+=increment;
	}
	return resArray;
}

function appendPermutationUsingMask(permutationSourceArray, resultArray) {
	resArray = resultArray;
	log('appendPermutationUsingMask:' + permutationSourceArray.length, 'debug');
	for (var perms=0;perms<permutationSourceArray.length;perms++) {
		if (comparePermutationMask(permutationSourceArray[perms],mask)) {
			resArray.push(permutationSourceArray[perms]);
		}
	}
	return resArray;
}

function comparePermutationMask(aPerm, aMask) {
	for (var perm=0;perm<aPerm.length;perm++) {
		if (aMask[perm] != '*' && aMask[perm] != aPerm[perm]) {
			return false;
		}
	}
	return true;
}

function buildPermSet() {
return [
	{
		"elements": 3,
		"columns": [2],
		"permutations": [
			[1,2,3],
			[1,3,2],
			[2,1,3],
			[2,3,1],
			[3,1,2],
			[3,2,1]
		]
	},{
		"elements": 4,
		"columns": [6,2],
		"permutations": [
			[1,2,3,4],
			[1,2,4,3],
			[1,3,2,4],
			[1,3,4,2],
			[1,4,2,3],
			[1,4,3,2],
			[2,1,3,4],
			[2,1,4,3],
			[2,3,1,4],
			[2,3,4,1],
			[2,4,1,3],
			[2,4,3,1],
			[3,1,2,4],
			[3,1,4,2],
			[3,2,1,4],
			[3,2,4,1],
			[3,4,1,2],
			[3,4,2,1],
			[4,1,2,3],
			[4,1,3,2],
			[4,2,1,3],
			[4,2,3,1],
			[4,3,1,2],
			[4,3,2,1]
		]
	},{
		"elements": 5,
		"columns": [24,6,2],
		"permutations": [
			[1,2,3,4,5],
			[1,2,3,5,4],
			[1,2,4,3,5],
			[1,2,4,5,3],
			[1,2,5,3,4],
			[1,2,5,4,3],
			[1,3,2,4,5],
			[1,3,2,5,4],
			[1,3,4,2,5],
			[1,3,4,5,2],
			[1,3,5,2,4],
			[1,3,5,4,2],
			[1,4,2,3,5],
			[1,4,2,5,3],
			[1,4,3,2,5],
			[1,4,3,5,2],
			[1,4,5,2,3],
			[1,4,5,3,2],
			[1,5,2,3,4],
			[1,5,2,4,3],
			[1,5,3,2,4],
			[1,5,3,4,2],
			[1,5,4,2,3],
			[1,5,4,3,2],
			[2,1,3,4,5],
			[2,1,3,5,4],
			[2,1,4,3,5],
			[2,1,4,5,3],
			[2,1,5,3,4],
			[2,1,5,4,3],
			[2,3,1,4,5],
			[2,3,1,5,4],
			[2,3,4,1,5],
			[2,3,4,5,1],
			[2,3,5,1,4],
			[2,3,5,4,1],
			[2,4,1,3,5],
			[2,4,1,5,3],
			[2,4,3,1,5],
			[2,4,3,5,1],
			[2,4,5,1,3],
			[2,4,5,3,1],
			[2,5,1,3,4],
			[2,5,1,4,3],
			[2,5,3,1,4],
			[2,5,3,4,1],
			[2,5,4,1,3],
			[2,5,4,3,1],
			[3,1,2,4,5],
			[3,1,2,5,4],
			[3,1,4,2,5],
			[3,1,4,5,2],
			[3,1,5,2,4],
			[3,1,5,4,2],
			[3,2,1,4,5],
			[3,2,1,5,4],
			[3,2,4,1,5],
			[3,2,4,5,1],
			[3,2,5,1,4],
			[3,2,5,4,1],
			[3,4,1,2,5],
			[3,4,1,5,2],
			[3,4,2,1,5],
			[3,4,2,5,1],
			[3,4,5,1,2],
			[3,4,5,2,1],
			[3,5,1,2,4],
			[3,5,1,4,2],
			[3,5,2,1,4],
			[3,5,2,4,1],
			[3,5,4,1,2],
			[3,5,4,2,1],
			[4,1,2,3,5],
			[4,1,2,5,3],
			[4,1,3,2,5],
			[4,1,3,5,2],
			[4,1,5,2,3],
			[4,1,5,3,2],
			[4,2,1,3,5],
			[4,2,1,5,3],
			[4,2,3,1,5],
			[4,2,3,5,1],
			[4,2,5,1,3],
			[4,2,5,3,1],
			[4,3,1,2,5],
			[4,3,1,5,2],
			[4,3,2,1,5],
			[4,3,2,5,1],
			[4,3,5,1,2],
			[4,3,5,2,1],
			[4,5,1,2,3],
			[4,5,1,3,2],
			[4,5,2,1,3],
			[4,5,2,3,1],
			[4,5,3,1,2],
			[4,5,3,2,1],
			[5,1,2,3,4],
			[5,1,2,4,3],
			[5,1,3,2,4],
			[5,1,3,4,2],
			[5,1,4,2,3],
			[5,1,4,3,2],
			[5,2,1,3,4],
			[5,2,1,4,3],
			[5,2,3,1,4],
			[5,2,3,4,1],
			[5,2,4,1,3],
			[5,2,4,3,1],
			[5,3,1,2,4],
			[5,3,1,4,2],
			[5,3,2,1,4],
			[5,3,2,4,1],
			[5,3,4,1,2],
			[5,3,4,2,1],
			[5,4,1,2,3],
			[5,4,1,3,2],
			[5,4,2,1,3],
			[5,4,2,3,1],
			[5,4,3,1,2],
			[5,4,3,2,1]
		]
	}
];
}