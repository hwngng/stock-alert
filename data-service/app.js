const io = require('socket.io');
const http = require('http');
const lineReader = require('line-reader');
const utils = require('./utils');
const express = require('express');
const app = express();
const Templar = require('templar');
const routes = require('./routes');
const bodyParser = require('body-parser');
const cors = require("cors");
const WebSocket = require('ws');
const pg = require('pg');
const pool = pg.Pool;

const conn = new pool({
    user: 'postgres',
    host: 'localhost',
    database: 'msig_stock_alert',
    password: 'Thanos123',
    port: 5432,
});
const types = pg.types;
types.setTypeParser(1114, function (stringValue) {
    return stringValue;
});

// set MongoDB connection
// mongoose.Promise = require('bluebird');
// mongoose.connect('mongodb://localhost/anychart_db');
// mongoose.connection.on('error', console.error.bind(console, 'Connection error:'));

// template setting
const environment = 'development';
const config = require('./config/' + environment + '.js');
const templarOptions = { engine: config.engine, folder: config.templates };
Templar.loadFolder(config.templates);
const port = config.port || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
    cors({
        origin: config.allowedHosts,
        credentials: true
    })
);

// inject module
app.use(function (req, res, next) {
    req.config = config;
    req.conn = conn;
    req.exchangeCodeMap = {
        'HOSE': '10',
        'HNX': '02',
        'UPCOM': '03'
    };
    return next();
});

// set routes
routes(app);

// set server
const server = http.Server(app);
const io_server = io(server, { path: '/realtime' });
server.listen(port);
const connections = {};
const todayOpenPrice = {};

const handleSub = function (socket, data = null) {
    if (!Array.isArray(data)) {
        socket.emit('err', { message: 'Invalid input' });
        return false;
    }
    console.log(connections);
    let subbed = new Set();
    data.forEach(sym => {
        let isString = typeof (sym) == 'string' || sym instanceof String;
        if (!isString || (Array.isArray(config.allowedRooms) && config.allowedRooms.length && !config.allowedRooms.includes(sym))) {
            socket.emit('err', { message: sym + ' is not valid or supported symbol' });
            return;
        }
        subbed.add(sym);
        socket.join(sym);
    });
    if (!connections[socket.client.id]['sub'] || !(connections[socket.client.id]['sub'] instanceof Set)) {
        connections[socket.client.id]['sub'] = subbed;
    } else {
        connections[socket.client.id]['sub'] = utils.helper.set.union(connections[socket.client.id]['sub'], subbed);
    }
    console.log(connections);
};

const handleDisconnect = function (socket, data = null) {
    console.log("disconnect: ", socket.client.id);
    delete connections[socket.client.id];
}

const handleUnsub = function (socket, data = null) {
    if (!Array.isArray(data)) {
        socket.emit('err', { message: 'Invalid input' });
        return false;
    }
    data.forEach(sym => {
        let isString = typeof (sym) == 'string' || sym instanceof String;
        if (!isString) {
            socket.emit('err', { message: sym + ' is not valid or supported symbol' });
            return;
        }
        socket.leave(sym);
    });
    if (connections[socket.client.id]['sub'] instanceof Set) {
        let diff = utils.helper.set.difference(connections[socket.client.id]['sub'], new Set(data));
        connections[socket.client.id]['sub'] = diff;
    }
    console.log(connections);
}

const handleClearSub = function (socket, data) {
    if (!connections[socket.client.id]['sub'] || !(connections[socket.client.id]['sub'] instanceof Set))
        return;
    let subbed = connections[socket.client.id]['sub'];
    subbed.forEach(sym => {
        let isString = typeof (sym) == 'string' || sym instanceof String;
        if (!isString) {
            return;
        }
        socket.leave(sym);
    });

    connections[socket.client.id]['sub'] = new Set();
    console.log(connections);
}

io_server.on('connection', function (socket) {
    console.log("connect: " + socket.client.id);
    connections[socket.client.id] = {};
    console.log(connections);

    socket.on('sub', function (data) {
        handleSub(socket, data);
    });

    socket.on('disconnect', function () {
        handleDisconnect(socket);
    });

    socket.on('unsub', function (data) {
        handleUnsub(socket, data);
    });

    socket.on('clearSub', function (data) {
        handleClearSub(socket, data)
    })
});

const fileSource = function (path, hasOpenPrice = false) {
    let time = 0;
    lineReader.eachLine(path, function (line, last) {
        let decodedLine = '';
        var filteredMsg = utils.vnd.filterVNDmessage(line);
        if (filteredMsg.length == 3) {
            var rawData = filteredMsg[2];
            decodedLine = utils.vnd.decodeVNDdata(rawData);
            let meta = utils.vnd.getMetaMessage(decodedLine);
            if (!hasOpenPrice && meta.messageType == 'SMA') {
                decodedLine += '|' + 10;
            }
            setTimeout(function () {
                io_server.to(meta.symbol).emit('s', decodedLine);
                // console.log(utils.vnd.mapObjVND(decodedLine));
            }, time + 300);
        }
        if (last) {
        }
        time += 300;
    });
}

const wsSource = function (path) {
    const that = this;
    const ws = new WebSocket(path);
    const ping = '0';
    const pong = '1';

    console.log('wsSource');
    ws.on('open', function () {
        console.log('connected vnd ws');
        ws.send('a');
        ws.send('s|S:' + config.allowedRooms.join(','));
        ws.on('message', async data => {
            data = data.toString();
            if (data == ping) {
                ws.send(pong);
                return;
            }
            let decodedMsg = '';
            var filteredData = utils.vnd.filterVNDmessage(data);
            if (filteredData.length == 3) {
                let rawMsg = filteredData[2];
                decodedMsg = utils.vnd.decodeVNDdata(rawMsg);
                let meta = utils.vnd.getMetaMessage(decodedMsg);
                decodedMsg = await utils.vnd.addOpenPriceToSMA(meta, decodedMsg, todayOpenPrice);
                io_server.to(meta.symbol).emit('s', decodedMsg);
            }
        });
        ws.on('close', function () {
            console.log('disconnected vnd ws');
        });
    });
}

var dataSource = config.source

switch (dataSource.type) {
    case 'file':
        fileSource(dataSource.uri, dataSource.hasOpenPrice);
        break;
    case 'ws':
        wsSource(dataSource.uri);
        break;
    default:
        break;
}

console.log('Server Listening - http://localhost:' + config.port + '. ' + environment + ' environment');
module.exports = server;
