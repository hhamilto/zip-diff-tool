var tmp = require('tmp')
var _ = require('lodash')
var Promise = require('bluebird')
var logger = require('log4js').getLogger('zip-diff.js')
var globAll = Promise.promisify(require('glob-all'))

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
		var cp = childProcess.exec(command, {
			maxBuffer: 10024 * 1024
		},function(err, stdout, stderr){
			if(err)
				reject(err)
			else
				resolve(stdout,stderr)
		})
	})
}

module.exports = function(options){
	//options: baseArchive, updatedArchive, diffArchive
	if(!options.baseArchive || !options.updatedArchive)
		throw new Error("Missing required option")
	options = options || {}
	_.defaults(options,{diffArchive:'diff.zip'})
	//extract both to temp dirs
	tmp.dir({
		unsafeCleanup: true
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
			return (options.ignoreGlobs && options.ignoreGlobs.length>0?
					globAll(options.ignoreGlobs,{
						cwd: updatedPath
					}).map(function(matchedPath){
						if(os.type().indexOf('Windows') != -1){
							//Y U NO rm -rf?
							return fs.statAsync(path.join(updatedPath,matchedPath)).then(function(stats){
								if(stats.isDirectory()){
									return run('rd /s /q '+path.join(updatedPath,matchedPath))
								}else{

									return run('del /q '+path.join(updatedPath,matchedPath))
								}
							})
						}else{
							return run('rm -rf '+path.join(updatedPath,matchedPath))
						}
					})
				:
					Promise.resolve()
			).then(function(){
				return directoryDiff(basePath, updatedPath)
			}).then(function(listing){
				return createFolderStructure(diffPath,listing).then(function(){
					return listing
				})
			}).then(listingToPaths)
			.map(function(pathString){
				return run((os.type() == 'Linux'?'cp':'copy')+' "'+path.join(updatedPath,pathString)+'" "'+path.join(diffPath,pathString)+'"').then(function(){
					return pathString
				})
			}).then(function(paths){
				if(paths.length>0)
					return sevenZip.archive({
						output: options.diffArchive,
						directory: diffPath
					})
				else
					logger.info("No files to include in the diff zip file.")
			})
		})
	})
}