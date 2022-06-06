'use strict';
const path = require('path');

module.exports = function (app) {
  var snapshotCtrl = require('../api/controllers/SnapshotController');
  var historyCtrl = require('../api/controllers/HistoryController');
  var infoCtrl = require('../api/controllers/InfoController');

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  });

  app.route('/stock/snapshot')
    .get(snapshotCtrl.get);

  app.route('/stock/history')
    .get(historyCtrl.get);

  app.route('/stock/info')
    .get(infoCtrl.get);
};