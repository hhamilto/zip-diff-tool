var colors = require('colors')
var argv = require('yargs')
     .usage('Usage: '+'$0'.bold+' '+'BASE ARCHIVE'.underline+' '+'UPDATED ARCHIVE'.underline+' ['+'-o '.bold + 'DIFF ZIP OUTPUT'.underline+'] ['+'-i '.bold+'IGNORE GLOB'.underline+']...\n'+
     	'BASE ARCHIVE'.underline+' and '+'UPDATED ARCHIVE'.underline+' are both required')
     .demand(2)
     .help('h')
     .alias('h', 'help')
     .alias('i', 'ignore-glob')
     .describe('i', 'Pass in shell-glob style strings to ignore paths in the archives.')
     .default('o', 'diff.zip')
     .example('node index.js base.zip updated.zip -o myOut.zip -i local.properties -i **.log --ignore-glob bin/')
     .wrap(null)
     .argv
var zipDiff = require('./lib/zip-diff.js')

var baseArchive = argv._[0]
var updatedArchive = argv._[1]
zipDiff({
	baseArchive: baseArchive,
	updatedArchive: updatedArchive,
	diffArchive: argv.o,
	ignoreGlobs: argv.i
})


/*If you specify a flag multiple times it will get turned into an array containing all the values in order.

$ node examples/reflect.js -x 5 -x 8 -x 0
{ _: [], x: [ 5, 8, 0 ], '$0': 'examples/reflect.js' }
*/