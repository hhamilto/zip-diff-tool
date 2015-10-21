var Promise = require('bluebird')
var _ = require('lodash')

var path = require('path')
var fs = Promise.promisifyAll(require('fs'))

var listDirectory = function(directory){
	return fs.readdirAsync(directory).then(function(files){
		return Promise.all(_.map(files, function(file){
			var filePath = path.join(directory,file)
			return fs.statAsync(filePath).then(function(stats){
				if(stats.isDirectory()){
					return listDirectory(filePath).then(function(listing){
						return {
							name: file,
							children: listing
						}
					})
				}
				return {
					name: file
				}
			})
		}))
	})
}

module.exports = listDirectory