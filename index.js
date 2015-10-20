
var zipDiff = require('./lib/zip-diff.js')

var baseArchive = process.argv[2]
var updatedArchive = process.argv[3]
var diffArchive = process.argv[4] || 'diff.zip'
zipDiff({
	baseArchive:baseArchive,
	updatedArchive:updatedArchive,
	diffArchive:diffArchive
})
