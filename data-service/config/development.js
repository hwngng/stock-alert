'use strict';

// npm package
var ejs = require('ejs');

module.exports = {
  port: 9876, 
  engine: ejs, 
  templates: __dirname + '/../templates',
  source: {
    type: 'file',
    uri: './resources/raw_data.txt'
  },
  allowedRooms: ['MBB', 'FLC', 'VIC', 'SHB', 'VND'],
  infoVersion: '1654185264',
  allowedHosts : ["http://localhost:3000", "http://localhost:9876", "https://localhost:5001"]
};
