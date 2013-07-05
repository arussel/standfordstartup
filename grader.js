#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
	console.log("%s does not exist. Exiting.", instr);
	process.exit(1);
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(htmlfile);
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
	var present = $(checks[ii]).length > 0;
	out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    return fn.bind({});
};

var buildfn = function(checks) {
    var displayOutput = function(result, response) {
	processOutput(result, checks);
    }
    return displayOutput;
}

var processOutput = function(fileAsString, checks) {
    var checkJson = checkHtmlFile(fileAsString, checks);
    var outJson = JSON.stringify(checkJson, null, 4);
    console.log(outJson);
}
if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <url>','url to file')
        .parse(process.argv);
    console.log("file:" + program.file);
    console.log("checks:" + program.checks);
    console.log("url:" + program.url);
    var fileAsString = "";
    if(program.url) {
	var displayOutput = buildfn(program.checks);
	rest.get(program.url).on('complete', displayOutput);
    } else {
	fileAsString = fs.readFileSync(program.file)
	processOutput(fileAsString, program.checks);
    }

} else {
    exports.checkHtmlFile = checkHtmlFile;
}
