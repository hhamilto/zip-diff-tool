var assert = require('assert')
var path = require('path')
var fs = require('fs')

var _ = require('lodash')
var tmp = require('tmp')


var areListingsEquivalent = require('./lib/are-listings-equivalent.js')
var sevenZip = require('../lib/7zip.js')


describe('7zip.js', function(done) {
	describe('#list()', function(done) {
		it('should handle long names and spaces', function(done){
			var expectedListing = [{
				name:'a_really_long_File_Name'
			},{
				name:'a_really_long_File_Name_No_joke'
			},{
				name:'spaces In me'
			}]
			sevenZip.list(path.join(__dirname,'resources','weird-names','test.zip')).done(function(files){
				assert(areListingsEquivalent(files,expectedListing))
				done()
			})
		})
		it('should handle nested folders', function(done){
			var expectedListing = [{
				name:'1'
			},{
				name:'a',
				children:[{
					name:'2'
				},{
					name:'c',
					children:[{
						name:'4'
					}]
				}]
			},{
				name:'b',
				children:[{
					name:'3'
				},{
					name:'d',
					children:[{
						name:'5'
					}]
				}],
			}]
			sevenZip.list(path.join(__dirname,'resources','nested-folders','test.zip')).done(function(files){
				assert(areListingsEquivalent(files,expectedListing))
				done()
			})
		})
	})
	describe('#archive()', function(done) {
		it('should produce an archive of the given files', function(done){

			tmp.dir({
				unsafeCleanup: true
			},function(err, tmpDirPath, cleanupCallback) {
				if (err) throw err
				var outputArchivePath = path.join(tmpDirPath,'test.zip')
				sevenZip.archive({
					output: outputArchivePath,
					files:[
						path.join(__dirname,'resources','sample-files','a'),
						path.join(__dirname,'resources','sample-files','1')
					]
				}).done(function(){
					var expectedListing = [{
						name:'a'
					},{
						name:'1',
						children:[{
							name:'b',
						}]
					}]
					sevenZip.list(outputArchivePath).done(function(files){
						assert(areListingsEquivalent(files,expectedListing))
						cleanupCallback()
						done()
					})
				})
			})
		})	
	})
		
	describe('#extract()', function(done) {
		it('should create the same files that are in the archive', function(done){
			tmp.dir({
				unsafeCleanup: true
			},function(err, tmpDirPath, cleanupCallback) {
				if (err) throw err
				sevenZip.extract({
					dest: tmpDirPath,
					archive: path.join(__dirname,'resources','sample-archive','test.zip')
				}).done(function(){
					var files = fs.readdirSync(tmpDirPath)
					assert(_.contains(files,'1'))
					assert(_.contains(files,'a'))
					files = fs.readdirSync(path.join(tmpDirPath,'1'))
					assert(_.contains(files,'b'))
					done()
				})
			})
		})
	})
})