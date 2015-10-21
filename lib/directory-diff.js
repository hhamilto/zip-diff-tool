var Promise = require('bluebird')
var _ = require('lodash')
var logger = require('log4js').getLogger('directory-diff.js')

var path = require('path')
var fs = Promise.promisifyAll(require('fs'))


var listDirectory = require('./list-directory.js')


var sortFileList = function(fileList){
	return _.sortBy(fileList, 'name')
}

listingDiff = function(basePath, updatedPath, baseListing, updatedListing){
	return Promise.all(_.compact(_.map(updatedListing, function(updatedFileObj){
		logger.debug('Examining file: "'+updatedFileObj.name+'" in updated archive')
		var baseFileObj
		if(baseFileObj = _.find(baseListing, {name:updatedFileObj.name})){
			logger.debug('Comparing file: "'+baseFileObj.name+'" in base archive')
		
			var baseFilePath = path.join(basePath,baseFileObj.name)
			var updatedFilePath = path.join(updatedPath,updatedFileObj.name)
			if(updatedFileObj.children){
				//return a diff of the children
				return listingDiff(baseFilePath,updatedFilePath,baseFileObj.children, updatedFileObj.children).then(function(childDiff){
					return {
						name: updatedFileObj.name,
						children: childDiff
					}
				})	
			}
			//check by size
			return Promise.all([fs.statAsync(baseFilePath),fs.statAsync(updatedFilePath)]).then(function(stats){
				if(stats[0].size != stats[1].size){
					//file has been changed
					return updatedFileObj
				}else{
					//check by contents
					return Promise.all([fs.readFileAsync(baseFilePath),fs.readFileAsync(updatedFilePath)]).then(function(contents){
						if(!contents[0].equals(contents[1]))
							return updatedFileObj
					})
				}
			})
		}else{
			// this represents a new file or folder
			logger.debug('File is new: "'+updatedFileObj.name+'"')
		
			return updatedFileObj
		}
	}))).then(function(listing){
		return _.compact(listing)
	})
}

directoryDiff = function(basePath, updatedPath){
	return Promise.all([listDirectory(basePath),listDirectory(updatedPath)]).then(function(listings){
		var baseListing = listings[0], updatedListing = listings[1]
		return listingDiff(basePath, updatedPath, baseListing, updatedListing)
	})
}

module.exports = directoryDiff