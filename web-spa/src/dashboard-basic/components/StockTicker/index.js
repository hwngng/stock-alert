import React, { Component } from 'react';
import { Link } from 'react-router-dom';
const { io } = require("socket.io-client");
import { Nav, NavDropdown, InputGroup, FormControl, Button } from 'react-bootstrap';
import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Autosuggest from 'react-autosuggest';
import dataServiceApi from '../../../common/api/dataServiceApi';
import userApi from '../../../common/api/userApi';
import WebAPIAuth from '../../../common/request/WebAPIAuth';
import DataService from '../../../common/request/DataService';

export default class StockTicker extends Component {
    constructor(props) {
        super(props);

        this.state = {
            stocks: [],
            loading: true,
            error: null,
            isMarketOpened: false,
            stockObjs: [],
            activeTabKey: 'hoseTab',
            activeDropdownTitle: 'VN30',
            activeDropdownKey: 'vn30',
            searchHints: [],
            searchedSymbol: '',
            watchlist: [],
            watchlistTxt: ''
        };

        this.socket = null;
        this.apiUrl = props.apiUrl;
        this.config = props.config;

        this.format = {}
        this.format["SFU"] = {};
        this.format["SFU"]["ST"] = [
            "Symbol",
            "StockType",
            "ExchangeCode",
            "RefPrice",
            "FloorPrice",
            "CeilingPrice",
            "BidPrice01",
            "BidPrice02",
            "BidPrice03",
            "BidPrice04",
            "BidPrice05",
            "BidPrice06",
            "BidPrice07",
            "BidPrice08",
            "BidPrice09",
            "BidPrice10",
            "BidQtty01",
            "BidQtty02",
            "BidQtty03",
            "BidQtty04",
            "BidQtty05",
            "BidQtty06",
            "BidQtty07",
            "BidQtty08",
            "BidQtty09",
            "BidQtty10",
            "AskPrice01",
            "AskPrice02",
            "AskPrice03",
            "AskPrice04",
            "AskPrice05",
            "AskPrice06",
            "AskPrice07",
            "AskPrice08",
            "AskPrice09",
            "AskPrice10",
            "AskQtty01",
            "AskQtty02",
            "AskQtty03",
            "AskQtty04",
            "AskQtty05",
            "AskQtty06",
            "AskQtty07",
            "AskQtty08",
            "AskQtty09",
            "AskQtty10",
            "TotalBidQtty",
            "TotalAskQtty",
            "TradingSessionId",
            "ForeignBuyQtty",
            "ForeignSellQtty",
            "DayHigh",
            "DayLow",
            "AccumulatedVal",
            "AccumulatedVol",
            "MatchPrice",
            "MatchQtty",
            "CurrentPrice",
            "currentQtty",
            "ProjectOpen",
            "TotalRoom",
            "CurrentRoom"
        ];
        this.format["SFU"]["S"] = [
            "Symbol",
            "StockType",
            "ExchangeCode",
            "RefPrice",
            "FloorPrice",
            "CeilingPrice",
            "BidPrice01",
            "BidPrice02",
            "BidPrice03",
            "BidQtty01",
            "BidQtty02",
            "BidQtty03",
            "AskPrice01",
            "AskPrice02",
            "AskPrice03",
            "AskQtty01",
            "AskQtty02",
            "AskQtty03",
            "TotalBidQtty",
            "TotalAskQtty",
            "TradingSessionId",
            "ForeignBuyQtty",
            "ForeignSellQtty",
            "DayHigh",
            "DayLow",
            "AccumulatedVal",
            "AccumulatedVol",
            "MatchPrice",
            "MatchQtty",
            "CurrentPrice",
            "currentQtty",
            "ProjectOpen",
            "TotalRoom",
            "CurrentRoom"
        ];
        this.format["SMA"] = {};
        this.format["SMA"]["S"] = this.format["SMA"]["ST"] = [
            "code",
            "stockType",
            "tradingSessionId",
            "buyForeignQtty",
            "sellForeignQtty",
            "highestPrice",
            "lowestPrice",
            "accumulatedVal",
            "accumulatedVol",
            "matchPrice",
            "matchQtty",
            "currentPrice",
            "currentQtty",
            "projectOpen",
            "totalRoom",
            "currentRoom",
        ];
        this.format["SBA"] = {};
        this.format["SBA"]["S"] = [
            "code",
            "stockType",
            "bidPrice01",
            "bidPrice02",
            "bidPrice03",
            "bidQtty01",
            "bidQtty02",
            "bidQtty03",
            "offerPrice01",
            "offerPrice02",
            "offerPrice03",
            "offerQtty01",
            "offerQtty02",
            "offerQtty03",
            "totalBidQtty",
            "totalOfferQtty",
        ];
        this.format["SBA"]["ST"] = [
            "code",
            "stockType",
            "bidPrice01",
            "bidPrice02",
            "bidPrice03",
            "bidPrice04",
            "bidPrice05",
            "bidPrice06",
            "bidPrice07",
            "bidPrice08",
            "bidPrice09",
            "bidPrice10",
            "bidQtty01",
            "bidQtty02",
            "bidQtty03",
            "bidQtty04",
            "bidQtty05",
            "bidQtty06",
            "bidQtty07",
            "bidQtty08",
            "bidQtty09",
            "bidQtty10",
            "offerPrice01",
            "offerPrice02",
            "offerPrice03",
            "offerPrice04",
            "offerPrice05",
            "offerPrice06",
            "offerPrice07",
            "offerPrice08",
            "offerPrice09",
            "offerPrice10",
            "offerQtty01",
            "offerQtty02",
            "offerQtty03",
            "offerQtty04",
            "offerQtty05",
            "offerQtty06",
            "offerQtty07",
            "offerQtty08",
            "offerQtty09",
            "offerQtty10",
            "totalBidQtty",
            "totalOfferQtty",
        ];
        this.format["sep"] = "|";

        this.comparer = [
            {
                type: 'up',
                class: 'sort-up',
                fn: (fieldName) => {
                    return (stock1, stock2) => {
                        let val1 = this.parseField(stock1[fieldName]);
                        let val2 = this.parseField(stock2[fieldName]);
                        if (val1 < val2)
                            return -1;
                        else if (val1 > val2)
                            return 1;
                        else
                            return 0;
                    }
                }
            },
            {
                type: 'down',
                class: 'sort-down',
                fn: (fieldName) => {
                    return (stock1, stock2) => {
                        let val1 = this.parseField(stock1[fieldName]);
                        let val2 = this.parseField(stock2[fieldName]);
                        if (val1 > val2)
                            return -1;
                        else if (val1 < val2)
                            return 1;
                        else
                            return 0;
                    }
                }
            }
        ];
        this.sortBy = { fieldName: 'Symbol', direction: 0, updateCount: 0 };
        this.exchanges = {
            '10': 'HOSE',
            '02': 'HNX',
            '03': 'UPCOM',
            'HOSE': '10',
            'HNX': '02',
            'UPCOM': '03'
        };
        this.filter = {
            top30: true,
            all: null,
            codes: null,
            exchangeCodes: [this.exchanges['HOSE']]
        };
        this.versions = null;
        this.stockInfos = null;
        this.subscribedStocks = [];
        this.apiAuthRequest = WebAPIAuth(this.config['webApiHost']);
        this.dataSvcRequest = DataService(this.config['dataServiceHost']);
    }

    componentDidMount() {
        this.loadVersion();
        this.socket = this.connect();
        this.loadSnapshot();
        this.loadStockInfo();
        this.loadWatchlist();
    }

    loadWatchlist() {
        let that = this;

        this.apiAuthRequest(userApi.getWatchlists.path, {
            method: userApi.getWatchlists.method
        })
            .then(response => {
                let watchlistObj = response.data;
                if (!watchlistObj) return;
                that.setState({ watchlist: watchlistObj });
            })
            .catch(error => {
                console.log(error);
            });
    }

    loadWatchlistDetail(id) {

    }

    // addSymbolToWatchlist(watchlistId)

    loadVersion() {
        this.versions = {}
        this.versions['stockInfo'] = '1654185264';
    }

    makeSearchHint(stockInfos) {
        let stockInfosWithHint = stockInfos.map(si => {
            si.hint = si['symbol'] + ' - ' + (si['short_name'] ?? si['name']) + ' - ' + this.exchanges[si['exchange_code']];
            return si;
        });

        return stockInfosWithHint;
    }

    loadStockInfo() {
        let version = this.versions['stockInfo'];
        let stockInfoObj = localStorage.getItem('stockInfos');
        try {
            stockInfoObj = JSON.parse(stockInfoObj);
            if (stockInfoObj && stockInfoObj['version'] && stockInfoObj['version'] == version) {
                this.stockInfos = this.makeSearchHint(stockInfoObj['infos']);
                return;
            }
        } catch (e) { }
        // load from data service
        let stockTicker = this;
        let params = {
            all: true
        }
        this.dataSvcRequest(dataServiceApi.stockInfo.path, {
            method: dataServiceApi.stockInfo.method,
            params: params
        })
            .then(function (response) {
                stockInfoObj = {};
                let infoObj = response.data;
                stockInfoObj['version'] = infoObj['version'];
                stockInfoObj['infos'] = infoObj['data'];
                stockTicker.stockInfo = stockInfoObj['infos'];
                localStorage.setItem('stockInfos', JSON.stringify(stockInfoObj));
                stockTicker.stockInfos = stockTicker.makeSearchHint(stockInfoObj['infos']);
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    dropNullFields(obj) {
        let newObj = {};
        for (const key in obj) {
            if (obj[key]) {
                newObj[key] = obj[key];
            }
        }

        return newObj;
    }

    standardizeStockObj(stockObjs) {
        let stdStockObjs = stockObjs.filter(s => (typeof s === 'object' && s !== null) && Object.keys(s).length > 0);
        stdStockObjs.map(s => {
            if (!s.MatchPrice && !this.isBeforeSession() && !this.isInPeriodicOrder()) {
                s.MatchPrice = s.RefPrice;
                s.AccumulatedVal = s.AccumulatedVol = 0;
            }
        });

        return stdStockObjs;
    }

    updateSubscribedStocks(stockObjs) {
        this.subscribedStocks = stockObjs.map(x => x.Symbol);
        // console.log(this.subscribedStocks);
    }

    loadSnapshot() {
        let that = this;
        let stdParams = this.dropNullFields(this.filter);

        this.dataSvcRequest(dataServiceApi.snapshot.path, {
            method: dataServiceApi.snapshot.method,
            params: stdParams,
            paramsSerializer: params => (new URLSearchParams(params)).toString()
        })
            .then(function (response) {
                let snapshots = response.data;
                let stockObjs = snapshots;
                stockObjs = that.standardizeStockObj(stockObjs);
                stockObjs = that.sortStock(stockObjs);
                that.updateSubscribedStocks(stockObjs);
                that.socket.emit('clearSub');
                that.socket.emit('sub', that.subscribedStocks);
                console.log(stockObjs);
                that.setState({ stockObjs });
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    updateStockMessage(msg) {
        let stockObj = this.tryParseMsg(msg);
        let stockObjs = this.state.stockObjs;

        // if (stockObj['code'] in stockObjs) {
        //     Object.keys(stockObjs[stockObj['code']]).forEach(updateKey => {
        //         if (updateKey in stockObj) {
        //             stockObjs[stockObj['code']][updateKey] = stockObj[updateKey];
        //         }
        //     })
        // }
        let updateIdx = stockObjs.findIndex(s => s['code'] === stockObj['code']);
        let hasSortField = false;
        Object.keys(stockObjs[updateIdx] ?? {}).forEach(updateKey => {
            if (updateKey in stockObj) {
                stockObjs[updateIdx][updateKey] = stockObj[updateKey];
                if (updateKey === this.sortBy.fieldName)
                    hasSortField = true;
            }
        });

        if (hasSortField === true) {
            this.sortBy.updateCount++;
        }
        if (this.sortBy.updateCount > 5) {
            this.sortStock(stockObjs);
            this.sortBy.updateCount = 0;
        }

        this.setState({ stockObjs });
    }

    getATOATCPrice() {
        let now = new Date();
        let opening = new Date();
        opening.setHours(9, 0, 0);

        let close = new Date();
        close.setHours(14, 30, 0);

        if (opening <= now && now <= (new Date(opening + 15 * 60 * 1000)))
            return 'ATO';
        if (close <= now && now <= (new Date(close + 15 * 60 * 1000)))
            return 'ATC';

        return '';
    }

    isBeforeSession() {
        let now = new Date();
        let opening = new Date();
        opening.setHours(9, 0, 0);
        let resetTime = new Date();
        resetTime.setHours(8, 0, 0);

        if (resetTime <= now && now <= opening)
            return true;
        return false;
    }

    isInPeriodicOrder() {
        let now = new Date();
        let opening = new Date();
        opening.setHours(9, 0, 0);

        let close = new Date();
        close.setHours(14, 30, 0);

        if (opening <= now && now <= (new Date(opening + 15 * 60 * 1000)))
            return true;
        if (close <= now && now <= (new Date(close + 15 * 60 * 1000)))
            return true;

        return false;
    }

    isInSession() {
        let now = new Date();
        let opening = new Date();
        opening.setHours(9, 15, 0);

        let close = new Date();
        close.setHours(14, 30, 0);

        if (opening <= now && now <= close)
            return true;

        return false;
    }

    isTradingDay() {
        let now = new Date();
        if (now.getDay() >= 6)
            return false;
        return true;
    }

    formatFloat(floatStr, precision, isPrice = false) {
        if (this.isTradingDay() && this.isBeforeSession()) {
            if (floatStr == '0' || isNaN(floatStr))
                return '';
        }
        if (isPrice && floatStr == '0') {
            return '';
        }
        if (isPrice && isNaN(floatStr)) {
            return this.getATOATCPrice();
        }
        if (isNaN(floatStr)) {
            return '';
        }

        let num = parseFloat(floatStr);

        if (!isNaN(num)) {
            return num.toFixed(precision);
        }

        return floatStr;
    }

    formatFloatWithSign(floatStr, precision) {
        if (this.isTradingDay() && this.isBeforeSession()) {
            if (floatStr == '0' || isNaN(floatStr))
                return '--';
        }

        if (isNaN(floatStr)) {
            return '--';
        }

        let num = parseFloat(floatStr);


        if (!isNaN(num)) {
            return (num >= 0 ? '+' : '-') + Math.abs(num).toFixed(precision);
        }

        return floatStr;
    }

    connect() {
        const socket = io.connect(this.config['dataServiceHost'], { path: dataServiceApi.realtime.path, transports: ['websocket'] });
        socket.on('disconnect',
            (e) => {
                if (e) {
                    this.setState({ error: e });
                    console.error('Connection closed with error: ' + e);
                }
                else {
                    console.info('Disconnected');
                }
            }
        );
        socket.on('connect', () => {
            console.info('Connected successfully');
            this.setState({ loading: false });
        });

        socket.on('s', (message) => {
            this.updateStockMessage(message);
        });

        socket.on('connect_failed', (data) => {
            console.info(data);
        });

        socket.on('error', (data) => {
            console.info(data);
        });

        return socket;
    }

    parseField(fieldValue) {
        let num = parseFloat(fieldValue);

        if (isNaN(num)) {
            return fieldValue;
        }

        return num;
    }

    sortStock(stockArr) {
        if (this.sortBy.direction < this.comparer.length) {
            stockArr.sort(this.comparer[this.sortBy.direction].fn(this.sortBy.fieldName));
        }

        return stockArr;
    }

    onSortChange(e, fieldName) {
        if (this.sortBy.fieldName != fieldName) {
            this.sortBy.fieldName = fieldName;
            this.sortBy.direction = 0;
        } else {
            this.sortBy.direction = (this.sortBy.direction + 1) % this.comparer.length;
        }
        let stockObjs = this.state.stockObjs;
        this.sortStock(stockObjs);

        this.setState({ stockObjs });
    }

    calcChange(matchPrice, basicPrice) {
        let fbasicPrice = parseFloat(basicPrice);
        let fmatchPrice = parseFloat(matchPrice);

        if (this.isBeforeSession()) {
            if (fmatchPrice == 0.0)
                return NaN;
        }
        if (isNaN(fbasicPrice) || isNaN(fmatchPrice)) {
            return NaN;
        } else {
            return fmatchPrice - fbasicPrice;
        }
    }

    calcPercentChange(matchPrice, basicPrice) {
        let fbasicPrice = parseFloat(basicPrice);
        let fmatchPrice = parseFloat(matchPrice);

        if (this.isBeforeSession()) {
            if (fmatchPrice == 0.0)
                return NaN;
        }
        if (isNaN(fbasicPrice) || isNaN(fmatchPrice)) {
            return NaN;
        } else {
            return (fmatchPrice - fbasicPrice) * 100 / basicPrice;
        }
    }

    calcAvgPrice(accumulatedVal, accumulatedVol) {
        let faccumulatedVal = parseFloat(accumulatedVal);
        let faccumulatedVol = parseFloat(accumulatedVol);

        if (this.isBeforeSession()) {
            if (faccumulatedVal == 0.0)
                return NaN;
        }
        if (isNaN(accumulatedVal) || isNaN(accumulatedVol)) {
            return NaN;
        } else {
            return faccumulatedVal * 10e6 / (faccumulatedVol * 100);
        }
    }

    getPriceTrendClass(comparePrice, refPrice) {
        let cls = 'price-nochange';
        comparePrice = parseFloat(comparePrice);
        refPrice = parseFloat(refPrice);
        if (this.isBeforeSession()) {
            if (comparePrice == 0.0)
                return cls;
        }
        if (comparePrice > refPrice)
            cls = 'price-up';
        else if (comparePrice < refPrice)
            cls = 'price-down'
        else
            cls = 'price-nochange'
        return cls;
    }

    tryParseMsg(msg) {
        let msgArr = msg.split(this.format["sep"]);
        let msgObj = {};
        let msgType = msgArr[0];
        let stockType = msgArr[2];

        if (!msgType || !stockType) {
            return msgObj;
        }

        if (!(msgType in this.format) || !(stockType in this.format[msgType])) {
            return msgObj;
        }

        if (this.format[msgType][stockType].length + 1 !== msgArr.length) {
            return msgObj;
        }

        for (let i = 0; i < this.format[msgType][stockType].length; ++i) {
            msgObj[this.format[msgType][stockType][i]] = msgArr[i + 1];
        }

        return msgObj;
    }

    fillObject(obj, val) {
        for (const key in obj) {
            obj[key] = val;
        }
    }

    loadFilter(activeTabKey, activeDropdownKey) {
        this.fillObject(this.filter, null)
        switch (activeTabKey) {
            case 'allTab':
                this.filter.all = true;
                break;
            case 'hoseTab':
                this.filter.exchangeCodes = this.exchanges['HOSE'];
                switch (activeDropdownKey) {
                    case 'hose':
                        break;
                    case 'vn30':
                        this.filter.top30 = true;
                        break;
                    default:
                        console.log('No valid filter for this dropdown ' + activeDropdownKey);
                        break;
                }
                break;
            case 'hnxTab':
                this.filter.exchangeCodes = this.exchanges['HNX'];
                switch (activeDropdownKey) {
                    case 'hnx':
                        break;
                    case 'hnx30':
                        this.filter.top30 = true;
                        break;
                    default:
                        console.log('No valid filter for this dropdown ' + activeDropdownKey);
                        break;
                }
                break;
            case 'upcomTab':
                this.filter.exchangeCodes = this.exchanges['UPCOM'];
                switch (activeDropdownKey) {
                    case 'upcom':
                        break;
                    default:
                        console.log('No valid filter for this dropdown ' + activeDropdownKey);
                        break;
                }
                break;
            case 'watchlist':

                break;
            default:
                console.log('No valid filter for this tab ' + activeTabKey);
                break;
        }
    }

    goToRowSearched(symbol) {
        const selectedRow = document.getElementById(symbol);
        if (selectedRow) {
            selectedRow.scrollIntoView({ block: 'center' });
            let matchPriceCell = selectedRow.getElementsByClassName('match-price');
            let trend = 'nochange';
            if (matchPriceCell[0].classList.contains('price-up'))
                trend = 'up';
            else if (matchPriceCell[0].classList.contains('price-down'))
                trend = 'down';
            selectedRow.classList.add('highlight-' + trend);
            setTimeout(function () {
                selectedRow.classList.remove('highlight-' + trend);
            }, 1000);
        }
    }

    handleSearchSymbol(symbol) {
        this.goToRowSearched(symbol);
        // check if it is in watch list, if not, add to watch list
    }

    refreshData(activeTabKey, activeDropdownKey) {
        this.loadFilter(activeTabKey, activeDropdownKey);
        this.loadSnapshot();
    }

    handleChangeTab(event) {
        event.preventDefault();
        let activeTabKey = event.target.dataset.rbEventKey;
        activeTabKey = activeTabKey ? activeTabKey : event.target.id;
        let activeDropdownKey = null;
        let activeDropdownTitle = null;
        this.refreshData(activeTabKey, activeDropdownKey);
        this.setState({ activeTabKey, activeDropdownKey, activeDropdownTitle });
    }

    handleChangeDropdownItem(event) {
        event.preventDefault();
        let activeTabKey = event.currentTarget.parentNode.parentNode.getAttribute('value');
        let activeDropdownKey = event.currentTarget.getAttribute('value');
        let activeDropdownTitle = event.currentTarget.getAttribute('title');
        this.refreshData(activeTabKey, activeDropdownKey);
        this.setState({ activeTabKey, activeDropdownKey, activeDropdownTitle });
    }

    getSuggestions(value) {
        if (!value) return [];
        const inputValue = value.trim().toLowerCase();
        const inputLength = inputValue.length;
        const stockInfos = this.stockInfos;

        return inputLength === 0 || !stockInfos ? [] : stockInfos.filter(si =>
            si['symbol'].toLowerCase().slice(0, inputLength) === inputValue
            || (si['short_name'] ? si['short_name'].toLowerCase().indexOf(inputValue) >= 0 : si['name'].toLowerCase().indexOf(inputValue) >= 0)
        );
    }

    getSuggestionValue = suggestion => suggestion['symbol'];

    renderSuggestion(suggestion) {
        return (
            <>
                {suggestion['hint']}
            </>
        );
    }

    onChangeSearchSymbol(event, { newValue }) {
        this.setState({
            searchedSymbol: newValue
        });
    }

    onSuggestionsFetchRequested({ value }) {
        this.setState({
            searchHints: this.getSuggestions(value)
        });
    }

    onSuggestionsClearRequested() {
        this.setState({
            searchHints: []
        });
    }

    onEnter(event) {
        if (event.keyCode === 13) { // Enter
            this.handleSearchSymbol(this.state.searchedSymbol.toUpperCase());
        }
    }

    onSuggestionSelected(event, { suggestion, suggestionValue }) {
        this.handleSearchSymbol(suggestionValue);
    }

    onChangeWatchlistTxt(event) {
        let watchlistTxt = this.state.watchlistTxt;
        watchlistTxt = event.target.value;
        this.setState({ watchlistTxt });
    }

    addWatchlist(event) {
        let watchlistTxt = this.state.watchlistTxt;
        if (!watchlistTxt) return;
        let watchlist = this.state.watchlist;
        if (!Array.isArray(watchlist)) watchlist = [];
        watchlist.push({ id: watchlist.length, name: watchlistTxt });
        watchlistTxt = '';
        this.setState({ watchlist, watchlistTxt });
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
    }

    removeWatchlist(event) {
        console.log('🚀 ~ file: index.js ~ line 859 ~ StockTicker ~ removeWatchlist ~ event', event);

    }

    renderStockTable(stockObjs) {
        return (
            <div>
                <div className="table-responsive table-fix-head">
                    <table className="table table-striped table-bordered align-middle price-table">
                        <colgroup>
                            <col className="col-symbol"></col>
                            <col className="col-price"></col>
                            <col className="col-price"></col>
                            <col className="col-price"></col>
                            <col className="col-price"></col>
                            <col className="col-price-lg"></col>
                            <col className="col-price"></col>
                            <col className="col-change"></col>
                            <col className="col-price"></col>
                            <col className="col-price"></col>
                            <col className="col-price"></col>
                            <col className="col-vol"></col>
                            <col className="col-vol"></col>
                        </colgroup>
                        <thead>
                            <tr className="align-midle">
                                <th className="sortable" onClick={e => this.onSortChange(e, "Symbol")}>Mã</th>
                                <th className="sortable" onClick={e => this.onSortChange(e, "MatchPrice")}>Giá hiện tại</th>
                                <th className="sortable" onClick={e => this.onSortChange(e, "RefPrice")}>Giá TC</th>
                                <th className="sortable" onClick={e => this.onSortChange(e, "PercentChange")}>+/-</th>
                                <th className="sortable" onClick={e => this.onSortChange(e, "AccumulatedVal")}>Tổng GT (Tỷ VND)</th>
                                <th className="sortable" onClick={e => this.onSortChange(e, "DayHigh")}>Cao</th>
                                <th className="sortable" onClick={e => this.onSortChange(e, "AvgPrice")}>TB</th>
                                <th className="sortable" onClick={e => this.onSortChange(e, "DayLow")}>Thấp</th>
                                <th className="sortable" onClick={e => this.onSortChange(e, "ForeignBuyQtty")}>NN Mua</th>
                                <th className="sortable" onClick={e => this.onSortChange(e, "ForeignSellQtty")}>NN Bán</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stockObjs.map(s => {
                                s.Change = this.calcChange(s.MatchPrice, s.RefPrice);
                                s.PercentChange = this.calcPercentChange(s.MatchPrice, s.RefPrice);
                                s.PriceTrendClass = this.getPriceTrendClass(s.MatchPrice, s.RefPrice);
                                s.AvgPrice = this.calcAvgPrice(s.AccumulatedVal, s.AccumulatedVol);
                                return (
                                    <tr key={s.Symbol} id={s.Symbol} className="align-midle">
                                        <td>
                                            <Link to={`/stock-chart?code=${s.Symbol}`} target="_blank">{s.Symbol}</Link>
                                            <input name="exchangeCode" type="hidden" value={s.ExchangeCode}></input>
                                        </td>
                                        <td className={'match-price ' + s.PriceTrendClass}>{this.formatFloat(s.MatchPrice, 2, true)}</td>
                                        <td className="price-nochange">{this.formatFloat(s.RefPrice, 2, true)}</td>
                                        <td className={s.PriceTrendClass}>{this.formatFloatWithSign(Math.round(s.Change * 100) / 100, 2)} / {this.formatFloatWithSign(Math.round(s.PercentChange * 10) / 10, 1)}%</td>
                                        <td>{this.formatFloat(s.AccumulatedVal, 2)}</td>
                                        <td className={this.getPriceTrendClass(s.DayHigh, s.RefPrice)}>{this.formatFloat(s.DayHigh, 2, true)}</td>
                                        <td className={this.getPriceTrendClass(s.AvgPrice, s.RefPrice)}>{this.formatFloat(Math.round(s.AvgPrice * 100) / 100, 2, true)}</td>
                                        <td className={this.getPriceTrendClass(s.DayHigh, s.RefPrice)}>{this.formatFloat(s.DayLow, 2, true)}</td>
                                        <td>{s.ForeignBuyQtty}</td>
                                        <td>{s.ForeignSellQtty}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    render() {
        const that = this;
        const { searchedSymbol, searchHints, watchlist, watchlistTxt } = this.state;
        let contents = this.state.error
            ? <p><em>Error: {this.state.error.message}</em></p>
            : this.state.loading
                ? <p><em>Loading...</em></p>
                : this.renderStockTable(this.state.stocks);
        let activeTabKey = this.state.activeTabKey;
        let activeDropdownKey = this.state.activeDropdownKey;
        let activeDropdownTitle = this.state.activeDropdownTitle;

        contents = this.renderStockTable(this.state.stockObjs);

        const inputProps = {
            placeholder: 'Nhập mã CK',
            value: searchedSymbol.toString(),
            onChange: this.onChangeSearchSymbol.bind(this),
            onKeyDown: this.onEnter.bind(this)
        };
        return (
            <>
                <Nav variant="tabs" defaultActiveKey={activeTabKey} className="portfolio-nav">
                    <Nav.Item className="search-nav">
                        <InputGroup className="search-bar">
                            <Autosuggest
                                suggestions={searchHints}
                                onSuggestionsFetchRequested={this.onSuggestionsFetchRequested.bind(this)}
                                onSuggestionsClearRequested={this.onSuggestionsClearRequested.bind(this).bind(this)}
                                onSuggestionSelected={this.onSuggestionSelected.bind(this)}
                                getSuggestionValue={this.getSuggestionValue.bind(this)}
                                renderSuggestion={this.renderSuggestion.bind(this)}
                                inputProps={inputProps}
                            />
                            <Button variant="success" id="add-btn" className="add-stock-btn"><FontAwesomeIcon className="plus-icon" icon={faPlus} /></Button>
                        </InputGroup>
                    </Nav.Item>
                    <Nav.Item className="all-nav">
                        <Nav.Link eventKey="allTab"
                            active={activeTabKey === "allTab"}
                            value="allTab"
                            onClick={this.handleChangeTab.bind(this)}>
                            Tất cả
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item className="hose-nav">
                        <NavDropdown id="hoseTab"
                            active={activeTabKey === "hoseTab"}
                            value="hoseTab"
                            title={(activeDropdownTitle && activeTabKey === "hoseTab") ? activeDropdownTitle : "HOSE"}>
                            <NavDropdown.Item value="hose" onClick={this.handleChangeDropdownItem.bind(this)} active={activeDropdownKey === "hose"} title="HOSE"><span>HOSE</span></NavDropdown.Item>
                            <NavDropdown.Item value="vn30" onClick={this.handleChangeDropdownItem.bind(this)} active={activeDropdownKey === "vn30"} title="VN30"><span>VN30</span></NavDropdown.Item>
                        </NavDropdown>
                    </Nav.Item>
                    <Nav.Item className="hnx-nav">
                        <NavDropdown id="hnxTab"
                            active={activeTabKey === "hnxTab"}
                            value="hnxTab"
                            title={(activeDropdownTitle && activeTabKey === "hnxTab") ? activeDropdownTitle : "HNX"}>
                            <NavDropdown.Item value="hnx" onClick={this.handleChangeDropdownItem.bind(this)} active={activeDropdownKey === "hnx"} title="HNX"><span>HNX</span></NavDropdown.Item>
                            <NavDropdown.Item value="hnx30" onClick={this.handleChangeDropdownItem.bind(this)} active={activeDropdownKey === "hnx30"} title="HNX30"><span>HNX30</span></NavDropdown.Item>
                        </NavDropdown>
                    </Nav.Item>
                    <Nav.Item className="upcom-nav">
                        <NavDropdown id="upcomTab"
                            active={activeTabKey === "upcomTab"}
                            value="upcomTab"
                            title={(activeDropdownTitle && activeTabKey === "upcomTab") ? activeDropdownTitle : "UPCOM"}>
                            <NavDropdown.Item value="upcom" onClick={this.handleChangeDropdownItem.bind(this)} active={activeDropdownKey === "upcom"} title="UPCOM"><span>UPCOM</span></NavDropdown.Item>
                        </NavDropdown>
                    </Nav.Item>
                    <Nav.Item className="watchlist-nav">
                        <NavDropdown id="watchlist"
                            active={activeTabKey === "watchlist"}
                            value="watchlist"
                            title={(activeDropdownTitle && activeTabKey === "watchlist") ? activeDropdownTitle : "DS Theo dõi"}>
                            {watchlist.map(function (w, idx) {
                                let wid = 'watchlist-' + idx;
                                return (
                                    <NavDropdown.Item key={w['id']}
                                        value={wid}
                                        onClick={that.handleChangeDropdownItem.bind(that)}
                                        active={activeDropdownKey === wid}
                                        title={w['name']}
                                        className="watchlist-item">
                                        <span>{w['name']}</span>
                                        <Button className="watchlist-remove" onClick={that.removeWatchlist.bind(that)}><FontAwesomeIcon className="xmark-icon" icon={faXmark} /></Button>
                                    </NavDropdown.Item>);
                            })}
                            <NavDropdown.Divider />
                            <li value="watchlist-add" title="Thêm danh mục" className="add-watchlist-nav">
                                <InputGroup className="add-watchlist-inp">
                                    <FormControl value={watchlistTxt} onChange={this.onChangeWatchlistTxt.bind(this)} placeholder="Tạo danh mục mới..." aria-label="Tạo danh mục mới" className="add-watchlist-txt" />
                                    <Button onClick={this.addWatchlist.bind(this)} variant="info" id="add-btn" className="add-watchlist-btn"><FontAwesomeIcon icon={faPlus} /></Button>
                                </InputGroup>
                            </li>
                        </NavDropdown>
                    </Nav.Item>
                </Nav>
                <div className="small center">Giá x 1000 VNĐ. Khối lượng x 10 cổ phiếu.</div>
                {contents}
            </>
        );
    }
}