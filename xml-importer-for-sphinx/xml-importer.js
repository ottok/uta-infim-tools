#!/usr/bin/env nodejs

/*
 * This script is written for the single purpose of importing WikiPedia XML
 * files into a MariaDB database so that it can be indexed by the Sphinx
 * Search Engine.
 *
 * With small modifications this script is able to import also other kind of
 * XML files into MariaDB.
 *
 *
 * Procedure:
 * 1. Traverse a directory and all it's subdirectories. Open all XML files found.
 * 2. Extract from the XML files the contents of <title> and <bdy> (and a few others)
 *    and insert them to the database in respective columns.
 * 3. Enable Sphinx Search to index that data.
 *
 */

/* SQL commands to create database and table:

$ mysql -u root -p

CREATE DATABASE wikipediadata;

USE wikipediadata;

CREATE TABLE `wikipediadata` (
  `id` int NOT NULL,
  `revision` int NOT NULL,
  `timestamp` timestamp NOT NULL,
  `username` tinytext NOT NULL,
  `userid` int NOT NULL,
  `title` text NOT NULL,
  `bdy` mediumtext NOT NULL,
  PRIMARY KEY (`id`),
  INDEX (`id`)
) ENGINE=Aria DEFAULT CHARSET=utf8;

TRUNCATE wikipediadata;

*/


/*
 * Required modules
 */
var async = require('async');
var util = require('util');
var Client = require('mariasql');
var spawn = require('child_process').spawn;
var fs = require('fs');
var xpath = require('xpath')
var dom = require('xmldom').DOMParser


/*
 * Initilize MariaDB connection
 */
var c = new Client();
c.connect({
  host: '127.0.0.1',
  user: 'root',
  password: 'dw45fw342d32s2D',
  db: 'wikipediadata'
});

c.on('connect', function() {
    console.log('MariaDB connection established');
  })
  .on('error', function(err) {
    console.log('MariaDB error: ' + err);
  })
  .on('close', function(hadError) {
    console.log('MariaDB connection closed');
  });

var pq = c.prepare(
  'INSERT INTO wikipediadata ' +
  'VALUES (:id, :revision, :timestamp, :username, :userid, :title, :bdy) ' +
  'ON DUPLICATE KEY UPDATE ' +
  'id=VALUES(id), revision=VALUES(revision), timestamp=VALUES(timestamp), ' +
  'username=VALUES(username), userid=VALUES(userid), title=VALUES(title), ' +
  'bdy=VALUES(bdy)');


/*
 * Create queue with parallel async workers
 * that reads files and extracts XML
 */
var q = async.queue(function (fileName, callback) {

  counterXMLfiles++;
  var countNow = counterXMLfiles;
  // console.log('Fetching', fileName);

  var xml = fs.readFileSync(fileName, {'encoding': 'utf-8'});
  var doc = new dom().parseFromString(xml);

  // read all in an array
  var v = {};
  v['id'] = xpath.select('/article/header/id', doc)[0].firstChild.data;
  v['revision'] = xpath.select('/article/header/revision/id/text()', doc)[0].data;
  v['timestamp'] = xpath.select('/article/header/revision/timestamp/text()', doc).toString();
  v['username'] = xpath.select('/article/header/revision/contributor/username/text()', doc).toString();
  v['userid'] = xpath.select('/article/header/revision/contributor/id/text()', doc).toString();
  v['title'] = xpath.select('/article/header/title/text()', doc).toString();
  v['bdy'] = xpath.select('/article/bdy/node()', doc).toString();

  // console.log(v);

  // Insert contents into database
  c.query(pq(v))
    .on('result', function(res) {
      res.on('row', function(row) {
        console.log('Result row: ' + util.inspect(row));
      })
      .on('error', function(err) {
        console.log('Result error: ' + util.inspect(err));
        // callback executes next task in que
        callback(err);
        // stop processing immediately
        process.exit();
      })
      .on('end', function(info) {
        if (info.affectedRows !== 1) {
          callback(info.affectedRows + ' affected rows for: ' + fileName);
        } else {
          counterRowsAffected++;
          callback(countNow + ': ' + fileName);
        }
      });
    })
    .on('end', function() {
      // console.log('Done with all results');
    });

}, 40);


// Run when queue is processed
q.drain = function() {
  // Exit once loop finishes
  console.log('Done inserting ' + counterRowsAffected + ' rows into database ' +
              'from ' + counterXMLfiles + ' XML files.');

  // Error: Already closed => next line not needed
  // c.end();

  process.exit()
}


/*
 * Counters
 */
var fileListTotals = 0;
var counterXMLfiles = 0;
var counterRowsAffected = 0;


/*
 * Fetch list of xml files and push to queue
 */
var find = spawn('find', ['/aineisto/documents/', '-name', '*.xml']);
var lastLine = '';

find.stdout.on('data', function (data) {

/*
  // limit to 50 000 rows
  if (counterXMLfiles > 50000) {
    return;
  }
*/

  var fileList = data.toString().trim().split('\n');

  // If lastLine is empty, then this equals plain first line.
  // If lastLine has contents, then first line gets merged with it.
  q.push(lastLine + fileList.slice(0,1)[0], console.log);

  // Push as such all other lines but first and last
  q.push(fileList.slice(1, -1));

  // If lastLine is a complete file path push it
  // as such, otherwise keep it to be later combined
  // with first line of next buffer chunk
  lastLine = fileList.slice(-1)[0].trim();
  if (lastLine.slice(-4) == '.xml') {
    q.push(lastLine, console.log)
    lastLine = '';
  }

  fileListTotals += fileList.length;
  console.log('Find results +' + fileList.length + ' (' + fileListTotals + ')');
});

find.stderr.on('data', function (data) {
  console.log('Find error: ' + data);
});

find.on('close', function (code) {
  console.log('Find completed with code ' + code);
});

