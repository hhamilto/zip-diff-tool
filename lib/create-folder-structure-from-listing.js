var Promise = require('bluebird')
var _ = require('lodash')

var path = require('path')
var fs = Promise.promisifyAll(require('fs'))

createFolders = function(basePath, listing){
	return Promise.all(_.compact(_.map(listing, function(fileObj){
		if(fileObj.children){
			var directoryPath = path.join(basePath,fileObj.name)
			return fs.mkdirAsync(directoryPath).then(function(){
				return createFolders(directoryPath, fileObj.children)
			})
		}
	})))
}

module.exports = createFolders