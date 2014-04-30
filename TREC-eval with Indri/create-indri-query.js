/*
 * Create Indri query XML from input file
 * Input file should have one query per line. Numbering will be automatic.
 *
 * Command examples:
 *
 * local$ node create-indri-query.js tutk_topics-1.txt > query-1.sgml
 * server$ /home/courses/itims12/indri-5.0/runquery/IndriRunQuery query-1.sgml \
 *         -count=100 -index=/home/courses/itia43/Collections/tutk_2197/db/index \
 *         -trecFormat=true > query-1-tutk_2197.txt
 * server$ /home/courses/itims12/trec_eval.9.0/trec_eval -q -c -M1000 \
 *         /home/courses/itia43/Collections/tutk/rel/tutk_rels_35_highly \
 *         query-1-tutk_2197.txt > query-1-tutk_2197-eval.txt
 *
 * server$ /home/courses/itims12/indri-5.0/runquery/IndriRunQuery query-1.sgml \
 *         -count=100 -index=/home/courses/itia43/Collections/tutk/index/ \
 *          -trecFormat=true > query-1-tutk_basic.txt
 *
 * server$ /home/courses/itims12/trec_eval.9.0/trec_eval -q -c -M1000 \
 *         /home/courses/itia43/Collections/tutk/rel/tutk_rels_35_highly \
 *          query-1-tutk_basic.txt > query-1-tutk_basic-eval.txt
 */

'use strict';

function showError(msg, value) {
  if (value === undefined) { var value = ''; }
  console.log('ERROR:', msg, value);
  process.exit(1); // exit with error
}

if (process.argv.length < 3) {
  showError('No arguments given.');
} else {
  var inputfile = process.argv[2];
  // Don't pollute the output
  // console.log('Processing ' + inputfile + ' ...');
}

var fs = require('fs');
var readline = require('readline');

try {
  var stats = fs.lstatSync('./' + inputfile);
} catch (err) {
  if (err.code == 'ENOENT') {
    showError('No such file:', inputfile);
  } else {
    throw err;
  }
}

if (stats.isFile()) {

  var rd = readline.createInterface({
    input: fs.createReadStream(inputfile),
    output: process.stdout,
    terminal: false
  });

  var n = 1;

  console.log('<parameters>');

  rd.on('line', function(line) {

    if (line.length > 2) {

      var words = line.trim().split(' ');
      var wildcarded = words.join('* ');
      // compensate missing last wildcard in template below

      console.log(
        '<query>\n' +
        '  <type>indri</type>\n' +
        '  <number>' + n + '</number>\n' +
        '  <text>#combine(' + wildcarded + '*)</text>\n' +
        '</query>'
      );

      n++;

    }

  });

  rd.on('close', function() {
    console.log('</parameters>');
    process.exit(1);
  });

} else {
  showError('Not a valid file:', inputfile);
}
