var tmp = require('tmp')
var _ = require('lodash')
var Promise = require('bluebird')
var logger = require('log4js').getLogger('zip-diff.js')

var os = require('os')
var path = require('path')
var fs = Promise.promisifyAll(require('fs'))
var childProcess = require('child_process')

var sevenZip = require('./7zip.js')
var directoryDiff = require('./directory-diff.js')
var listingToPaths = require('./listing-to-paths.js')
var createFolderStructure = require('../lib/create-folder-structure-from-listing.js')

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

module.exports = function(options){
	//options: baseArchive, updatedArchive, diffArchive
	options = options||{}
	_.defaults(options,{diffArchive:'diff.zip'})
	//extract both to temp dirs
	tmp.dir({
	//	unsafeCleanup: true
	},function(err, tmpDirPath, cleanupCallback) {
		if (err) throw err
		var basePath = path.join(tmpDirPath, 'base')
		var updatedPath = path.join(tmpDirPath, 'updated')
		var diffPath = path.join(tmpDirPath, 'diff')
		logger.info('Finding updates to '+options.baseArchive+' in '+ options.updatedArchive)
		Promise.all([
			sevenZip.extract({
				archive: options.baseArchive,
				dest: basePath
			}),
			sevenZip.extract({
				archive: options.updatedArchive,
				dest: updatedPath
			}),
			fs.mkdirAsync(diffPath)
		]).then(function(){
			return directoryDiff(basePath, updatedPath)
			.then(function(listing){
				return createFolderStructure(diffPath,listing).then(function(){
					return listing
				})
			})
			.then(function(listing){
				var paths = listingToPaths(listing)
				logger.info('Found '+paths.length+' new or updated files')
				return Promise.all(_.map(paths,function(pathString){
					return run((os.type() == 'Linux'?'cp':'copy')+' \''+path.join(updatedPath,pathString)+'\' \''+path.join(diffPath,pathString)+'\'').then(function(){
						return pathString
					})
				})).then(function(){
					return listing
				})
			}).then(function(listing){
				if (err) throw err
				if(listing.length > 0)
					return sevenZip.archive({
						output: options.diffArchive,
						files: _.map(_.map(listing, 'name'), _.partial(_.ary(path.join,2), diffPath))
					})
			})
		})
	})
}