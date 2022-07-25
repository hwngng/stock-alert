'use strict';
const path = require('path');
const auth = require("../middleware/auth");

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
    .get(historyCtrl.get)
    .post(auth, historyCtrl.post)
    .put(auth, historyCtrl.put)
    .delete(auth, historyCtrl.delete);

  app.route('/stock/info')
    .get(infoCtrl.get)
    .post(auth, infoCtrl.post)
    .put(auth, infoCtrl.put)
    .delete(auth, infoCtrl.delete);

  app.route('/stock/history/withCurr')
    .get(historyCtrl.getSingleWithCurrent);
};