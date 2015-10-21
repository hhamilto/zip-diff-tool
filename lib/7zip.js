var Promise = require('bluebird')
var _ = require('lodash')

var childProcess = require('child_process')
var path = require('path')
var os = require('os')
var logger = require("log4js").getLogger('7zip.js');

var executable7z = os.type == 'Linux'?'7za':'7z'
//runs a command then fufills a promise with the output.

var run = function(command){
	return new Promise(function(resolve,reject){
		var cp = childProcess.exec(command, function(err, stdout, stderr){
			if(err)
				reject(err)
			else
				resolve(stdout,stderr)
		})
	})
}

var delimiter = '------------------- ----- ------------ ------------  ------------------------'+os.EOL
var folderFileCount = function(folder){
	var files = 0, folders = 0;
	_.each(folder, function(childFile){
		if(childFile.children){
			folders++
			var internalCount = folderFileCount(childFile.children)
			folders+=internalCount.folders
			files+=internalCount.files
		}else{
			files++
		}
	})
	return {files:files,folders:folders}
}

var folderFileCountToString = function(folderFileCount){
	return folderFileCount.files+' files, '+folderFileCount.folders+' folders'
}

module.exports = {
	list: function(archive){
		return run(executable7z+' l '+archive).then(function(data){
			//parse input
			var fileSplitter = new RegExp(delimiter+'([^]*)'+delimiter+'([^]*)')
			var results = fileSplitter.exec(data)
			var fileLines = results[1].split(os.EOL).slice(0,-1), summaryText = results[2]
			var files = []
			fileLines.forEach(function(fileLine){
				//Example File Line:
				//2015-10-18 14:47:44 .....            0            0  fileName
				//2015-10-18 17:23:48 D....            0            0  folderName
				var fileLineSplitter = new RegExp('....................(.)...............................\\s(.*)$')
				var results = fileLineSplitter.exec(fileLine)
				var isDirectory = results[1]=='D'

				var filePath = results[2]
				var parts = filePath.split(path.sep)
				var containingFolder = files
				parts.slice(0,-1).forEach(function(part){
					containingFolder = _.find(containingFolder, {name:part}).children
					if(containingFolder == null) throw new Error('Could not find directory '+part+' in path '+filePath+' in achive list: '+fileLines)
				})
				var fileObject = {
					name:_.last(parts),
				}
				if(isDirectory)
					fileObject.children = []
				containingFolder.push(fileObject)
			})
			//sanity checking
			var calculatedCount = folderFileCount(files)
			var countRegexResults = /(\d+)\sfiles, (\d+)\sfolders/.exec(summaryText)
			var trueCounts = {
				files: parseInt(countRegexResults[1]),
				folders: parseInt(countRegexResults[2]),
			}
			if(!_.isEqual(calculatedCount,trueCounts)){
				throw new Error('File and folder count listed by 7z ('+folderFileCountToString(trueCounts)+') did not match the listing produced by list function: '+folderFileCountToString(calculatedCount))
			}
			return files
		})
	},
	archive: function(options){
		logger.info('Archiving files into: '+options.output)
		var command = executable7z+' a -tzip -y '+options.output+' \''+options.files.join('\' \'')+'\''
		return run(command)
	},
	extract: function(options){
		var command = executable7z+' x '+options.archive+' -y -o'+options.dest
		return run(command)
	}
}


//2211 renee

//example listing
/*
------------------- ----- ------------ ------------  ------------------------
2015-10-18 14:47:44 D....            0            0  1
2015-10-18 14:47:12 .....           19           19  1/a.txt
2015-10-18 14:48:34 D....            0            0  1/dir1
2015-10-18 14:48:34 .....           22           22  1/dir1/b.txt
------------------- ----- ------------ ------------  ------------------------
                                    41           41  2 files, 2 folders
*/