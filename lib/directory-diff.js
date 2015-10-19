var Promise = require('bluebird')
var _ = require('lodash')

var path = require('path')
var fs = Promise.promisifyAll(require('fs'))


var listDirectory = require('./list-directory.js')


var sortFileList = function(fileList){
	return _.sortBy(fileList, 'name')
}

listingDiff = function(basePath, updatedPath, baseListing, updatedListing){
	return Promise.all(_.compact(_.map(updatedListing, function(updatedFileObj){
		if(baseFileObj = _.find(baseListing, updatedFileObj.name, updatedFileObj)){
			var baseFilePath = path.join(basePath,baseFileObj.name)
			var updatedFilePath = path.join(updatedPath,updatedFileObj.name)
			if(updatedFileObj.children){
				//return a diff of the children
				return {
					name: updatedFileObj.name,
					children: listingDiff(baseFilePath,updatedFilePath,baseFileObj.children, updatedFileObj.children)
				}
			}
			//check by size
			return Promise.all([fs.statAsync(baseFilePath),fs.statAsync(updatedFilePath)]).then(function(stats){
				if(stats[0].size != stats[1].size){
					//file has been changed
					return updatedFileObj
				}else{
					//check by contents
					return Promise.all([fs.readFileAsync(baseFilePath),fs.readFileAsync(updatedFilePath)]).then(function(contents){
						if(contents[0] != contents[1])
							return updatedFileObj
					})
				}
			})
		}else{
			// this represents a new file or folder
			return updatedFileObj
		}
	})))
}

directoryDiff = function(basePath, updatedPath){
	return Promise.all([listDirectory(basePath),listDirectory(updatedPath)]).then(function(listings){
		var baseListing = listings[0], updatedListing = listings[1]
	})
}

module.exports = directoryDiff