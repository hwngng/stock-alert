import React, { Component } from 'react';
import { Link } from 'react-router-dom';
const { io } = require("socket.io-client");
import { Nav, NavDropdown, InputGroup, FormControl, Button } from 'react-bootstrap';
import { faPen, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Autosuggest from 'react-autosuggest';
import dataServiceApi from '../../../common/api/dataServiceApi';
import userApi from '../../../common/api/userApi';
import WebAPIAuth from '../../../common/request/WebAPIAuth';
import DataService from '../../../common/request/DataService';
import StockChart from '../StockChart';
import latinize from 'latinize';

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
            watchlists: [],
            watchlistTxt: '',
            editWatchlistMode: false,
            newWatchlistName: '',
            chartStock: {},
            isShowChart: false
        };

        this.socket = null;
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
        this.exchanges = this.config['exchanges'];
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
        const that = this;

        this.apiAuthRequest(userApi.watchlists.path, {
            method: userApi.watchlists.method
        })
            .then(response => {
                let watchlistObj = response.data;
                if (!watchlistObj) return;
                that.setState({ watchlists: watchlistObj });
            })
            .catch(error => {
                console.log(error);
            });
    }

    async loadWatchlistDetail(id) {
        let detail = {};
        try {
            let response = await this.apiAuthRequest(userApi.watchlistDetail.path, {
                method: userApi.watchlistDetail.method,
                params: { id: id }
            })
            detail = response.data;
            detail['symbols'] = [];
            if (detail['symbolJson']) {
                let watchedSymbols = JSON.parse(detail['symbolJson']);
                detail['symbols'] = watchedSymbols;
            }
        } catch (e) {
            console.log(e);
            // alert
        }
        return detail;
    }

    // addSymbolToWatchlist(watchlistId)

    loadVersion() {
        this.versions = {}
        this.versions['stockInfo'] = '1654185264';
    }

    makeSearchHint(stockInfos) {
        let stockInfosWithHint = stockInfos.map(si => {
            si.full = si['symbol'] + ' - ' + (si['short_name'] ?? si['name']) + ' - ' + this.exchanges[si['exchange_code']];
            si.hint = (si['symbol'] + ' ' + latinize(si['short_name'] ?? si['name']) + ' ' + this.exchanges[si['exchange_code']]).toLowerCase();
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

    reloadSubscribedStocks(stockObjs) {
        this.subscribedStocks = stockObjs.map(s => ({ symbol: s['Symbol'], exchangeCode: s['ExchangeCode'] }));
        this.socket.emit('clearSub');
        this.socket.emit('sub', this.subscribedStocks?.map(s => s['symbol']));
        // console.log(this.subscribedStocks);
    }

    async loadSnapshot() {
        const that = this;
        let stdParams = this.dropNullFields(this.filter);
        try {
            let response = await this.dataSvcRequest(dataServiceApi.snapshot.path, {
                method: dataServiceApi.snapshot.method,
                params: stdParams
            });
            let snapshots = response.data;
            let stockObjs = snapshots;
            stockObjs = that.standardizeStockObj(stockObjs);
            stockObjs = that.sortStock(stockObjs);
            that.reloadSubscribedStocks(stockObjs);
            that.setState({ stockObjs });
        } catch (e) {
            console.log(e);
        };
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
            console.info('Connected successfully to data service');
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

    async loadFilter(activeTabKey, activeDropdownKey) {
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
                if (!activeDropdownKey) return;
                let detail = await this.loadWatchlistDetail(activeDropdownKey);
                this.filter.codes = detail['symbols']?.map(s => s.symbol) ?? [];
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
        } else {
            // alert symbol not exist in this table
        }
    }

    async addSymbolWatchlist(symbol) {
        const { activeTabKey, activeDropdownKey } = this.state;
        let { stockObjs } = this.state;
        if (activeTabKey != 'watchlist') return;
        let symbolDetail = this.stockInfos?.find(si => si.symbol === symbol);
        if (symbolDetail) {
            let symbolObj = { symbol: symbolDetail['symbol'], exchangeCode: symbolDetail['exchange_code'] };
            let newSymbol = {
                id: activeDropdownKey,
                symbol: symbolObj
            }
            try {
                let response = await this.apiAuthRequest(userApi.insertWatchlistSymbol.path, {
                    method: userApi.insertWatchlistSymbol.method,
                    data: newSymbol
                });
                let status = response.data;
                if (status <= 0)
                    return;
                // await this.refreshData(activeTabKey, activeDropdownKey);
                this.fillObject(this.filter, null);
                this.filter = {
                    codes: [symbolObj.symbol],
                    exchangeCodes: [symbolObj.exchangeCode]
                };
                let stdParams = this.dropNullFields(this.filter);
                response = await this.dataSvcRequest(dataServiceApi.snapshot.path, {
                    method: dataServiceApi.snapshot.method,
                    params: stdParams,
                    paramsSerializer: params => (new URLSearchParams(params)).toString()
                });
                let insertStockObjs = response.data;
                insertStockObjs = this.standardizeStockObj(insertStockObjs);
                stockObjs = stockObjs.concat(insertStockObjs);
                stockObjs = this.sortStock(stockObjs);
                this.subscribedStocks?.push(symbolObj);
                this.socket.emit('sub', [symbolObj.symbol]);
                this.setState({ stockObjs });
            } catch (e) {
                console.log(e);
                // alert
            }
        } else {
            // alert symbol not exist
        }
    }

    async handleSearchSymbol(symbol) {
        await this.addSymbolWatchlist(symbol);
        this.goToRowSearched(symbol);
        // check if it is in watch list, if not, add to watch list
    }

    async refreshData(activeTabKey, activeDropdownKey) {
        await this.loadFilter(activeTabKey, activeDropdownKey);
        await this.loadSnapshot();
    }

    async handleChangeTab(event, tabKey, dropdownKey) {
        event.preventDefault();
        let activeTabKey = tabKey;
        let activeDropdownKey = dropdownKey;
        let activeDropdownTitle = null;
        if (activeDropdownKey) {
            activeDropdownTitle = event.currentTarget.getAttribute('title');
        }
        await this.refreshData(activeTabKey, activeDropdownKey);
        this.setState({ activeTabKey, activeDropdownKey, activeDropdownTitle });
    }

    getSuggestions(value) {
        if (!value) return [];
        const inputValue = value.trim().toLowerCase();
        const inputLength = inputValue.length;
        const stockInfos = this.stockInfos;

        return inputLength === 0 || !stockInfos ? [] : stockInfos.filter(si =>
            (inputLength <= 4 && si['hint'].slice(0, inputLength) === inputValue)
            || (si['hint']?.slice(3)?.indexOf(inputValue) >= 0)
        );
    }

    getSuggestionValue = suggestion => suggestion['symbol'];

    renderSuggestion(suggestion) {
        return (
            <>
                {suggestion['full']}
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

    onEnterSearch(event) {
        if (event.keyCode === 13) { // Enter
            this.handleSearchSymbol(this.state.searchedSymbol.toUpperCase());
            this.setState({ searchedSymbol: '' });
        }
    }

    onEnterWatchlist(event) {
        if (event.keyCode === 13) {
            this.addWatchlist();
        }
    }

    onSuggestionSelected(event, { suggestion, suggestionValue }) {
        this.handleSearchSymbol(suggestionValue);
        this.setState({ searchedSymbol: '' });
    }

    onChangeWatchlistTxt(event) {
        let { watchlistTxt } = this.state;
        watchlistTxt = event.target.value;
        this.setState({ watchlistTxt });
    }

    addWatchlist() {
        const that = this;
        let { watchlists, watchlistTxt, activeTabKey, activeDropdownKey, activeDropdownTitle } = this.state;
        if (!watchlistTxt) return;
        if (!Array.isArray(watchlists)) watchlists = [];
        let newWatchlist = { name: watchlistTxt };
        this.apiAuthRequest(userApi.insertWatchlist.path, {
            method: userApi.insertWatchlist.method,
            data: newWatchlist
        })
            .then(response => {
                let newWlInfo = response.data;
                if (!newWlInfo && newWlInfo['status'] <= 0) {
                    // alert
                    return;
                }
                newWatchlist['id'] = newWlInfo['id'];
                watchlists.push(newWatchlist);
                watchlistTxt = '';
                if (activeTabKey == 'watchlist') {
                    activeDropdownKey = newWatchlist['id'];
                    activeDropdownTitle = newWatchlist['name'];
                }
                that.setState({ watchlists, watchlistTxt, activeDropdownKey, activeDropdownTitle });
                this.refreshData(activeTabKey, activeDropdownKey);
            })
            .catch(error => {
                // alert
            })
    }

    async removeWatchlist(event, wid) {
        event.preventDefault();
        event.stopPropagation();
        try {
            let response = await this.apiAuthRequest(userApi.removeWatchlist.path, {
                method: userApi.removeWatchlist.method,
                params: { id: wid }
            });
            let status = response.data;
            if (status <= 0) {
                // alert
            }
            let { activeTabKey, activeDropdownKey, activeDropdownTitle, watchlists } = this.state;
            if (!Array.isArray(watchlists)) watchlists = [];
            watchlists = watchlists.filter(w => w['id'] != wid);
            if (activeTabKey == 'watchlist' && activeDropdownKey == wid) {
                let first = watchlists[0];
                if (first) {
                    activeDropdownKey = first['id'];
                    activeDropdownTitle = first['name'];
                } else {
                    activeDropdownKey = '';
                    activeDropdownTitle = '';
                }
            }
            this.setState({ activeDropdownKey, activeDropdownTitle, watchlists });
            this.refreshData(activeTabKey, activeDropdownKey);
        } catch (e) {
            console.log(e);
            // alert 
        }
    }

    removeSymbolWatchlist(event, symbol) {
        const { activeTabKey, activeDropdownKey } = this.state;
        let { stockObjs } = this.state;
        if (activeTabKey != 'watchlist') return;
        stockObjs = stockObjs?.filter(s => s['Symbol'] != symbol['Symbol']);
        this.subscribedStocks = this.subscribedStocks?.filter(ss => ss['symbol'] != symbol['Symbol']);
        this.socket.emit('unsub', [symbol['Symbol']]);
        this.updateWatchlist(activeDropdownKey, false, true);
        this.setState({ stockObjs });
    }

    handleCloseModal() {
        this.setState({ chartStock: {}, isShowChart: false });
    }

    handleOpenModal(event, snapshot) {
        event.preventDefault();
        let chartStock = this.stockInfos?.find(si => si['symbol'] == snapshot['Symbol'] && si['exchange_code'] == snapshot['ExchangeCode']);
        this.setState({ chartStock, isShowChart: true });
    }

    renderStockTable(stockObjs) {
        const that = this;
        const { activeTabKey, chartStock, isShowChart } = this.state;
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
                                            <div className="symbol clear-fix">
                                                <a className="symbol-link link-primary" onClick={e => that.handleOpenModal(e, s)}>{s.Symbol}</a>
                                                <input name="exchangeCode" type="hidden" value={s.ExchangeCode}></input>
                                                {activeTabKey == 'watchlist' &&
                                                    (
                                                        <Button
                                                            className="symbol-control-btn remove float-end"
                                                            onClick={e => that.removeSymbolWatchlist(e, s)}
                                                        >
                                                            <FontAwesomeIcon className="control-icon" icon={faXmark} />
                                                        </Button>
                                                    )
                                                }
                                            </div>
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
                {isShowChart ?
                    (<StockChart config={this.props.config} stock={chartStock} handleCloseModal={this.handleCloseModal.bind(this)}/>)
                    : (<></>)}
            </div>
        );
    }

    onClickEditWatchlist(event) {
        event.stopPropagation();
    }

    onChangeEditWatchlist(event, watchlist) {
        let { newWatchlistName } = this.state;
        newWatchlistName = event.target.value;
        this.setState({ newWatchlistName });
    }

    updateWatchlist(wid, isEditName = false, isEditSymbol = false) {
        const that = this;
        const { watchlists, activeTabKey, activeDropdownKey, newWatchlistName } = this.state;
        let { activeDropdownTitle } = this.state;
        const editedWatchlist = watchlists?.find(w => w['id'] == wid);
        if (!editedWatchlist)
            return;
        let updatedName = isEditName ? newWatchlistName : null;
        let updatedSymbol = isEditSymbol ? this.subscribedStocks : null;
        this.apiAuthRequest(userApi.updateWatchlist.path, {
            method: userApi.updateWatchlist.method,
            data: {
                id: wid,
                name: updatedName,
                symbols: updatedSymbol
            }
        })
            .then(response => {
                let status = response.data;
                if (status && status > 0) {
                    if (isEditName) {
                        editedWatchlist['editMode'] = false;
                        editedWatchlist['name'] = newWatchlistName;
                        if (activeTabKey == 'watchlist' && activeDropdownKey == editedWatchlist['id']) {
                            activeDropdownTitle = editedWatchlist['name']
                        }
                    }
                    if (isEditSymbol) {

                    }
                    that.setState({ watchlists, activeDropdownTitle });
                }
            })
    }

    onEnterEditWatchlist(event, wid) {
        if (event.keyCode === 13) {
            this.updateWatchlist(wid, true, false);
        }
    }

    turnOnEditWatchlistMode(event, watchlist) {
        event.preventDefault();
        event.stopPropagation();
        const { watchlists } = this.state;
        let { newWatchlistName } = this.state;
        // watchlist referenced to watchlists state, hence changing watchlist['name']'ll impact watchlists
        watchlists.forEach(w => w['editMode'] = false);
        watchlist['editMode'] = true;
        newWatchlistName = watchlist['name'];
        this.setState({ watchlists, newWatchlistName })
    }

    turnOffEditWatchlistMode(event, watchlist) {
        event.preventDefault();
        event.stopPropagation();
        const { watchlists } = this.state;
        // watchlist referenced to watchlists state, hence changing watchlist['name']'ll impact watchlists
        watchlists.forEach(w => w['editMode'] = false);
        this.setState({ watchlists })
    }

    renderWatchlistName(watchlist) {
        const that = this;
        if (watchlist['editMode']) {
            const { newWatchlistName } = this.state;
            return (
                <>
                    <FormControl
                        value={newWatchlistName}
                        onChange={e => that.onChangeEditWatchlist(e, watchlist)}
                        className="edit-watchlist-txt"
                        onKeyDown={e => that.onEnterEditWatchlist(e, watchlist['id'])}
                        onClick={this.onClickEditWatchlist.bind(this)}
                        onBlur={e => this.turnOffEditWatchlistMode(e, watchlist)}
                        autoFocus
                    />
                </>
            )
        }

        return (
            <span>{watchlist['name']}</span>
        )
    }

    render() {
        const that = this;
        const { searchedSymbol, searchHints, watchlists, watchlistTxt, activeTabKey, activeDropdownKey, activeDropdownTitle } = this.state;
        let contents = this.state.error
            ? <p><em>Error: {this.state.error.message}</em></p>
            : this.state.loading
                ? <p><em>Loading...</em></p>
                : this.renderStockTable(this.state.stocks);

        contents = this.renderStockTable(this.state.stockObjs);

        const inputProps = {
            placeholder: 'Nhập mã CK',
            value: searchedSymbol.toString(),
            onChange: this.onChangeSearchSymbol.bind(this),
            onKeyDown: this.onEnterSearch.bind(this)
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
                        <Nav.Link
                            active={activeTabKey === "allTab"}
                            onClick={e => this.handleChangeTab(e, 'allTab', null)}
                        >
                            Tất cả
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item className="hose-nav">
                        <NavDropdown
                            active={activeTabKey === "hoseTab"}
                            title={(activeDropdownTitle && activeTabKey === "hoseTab") ? activeDropdownTitle : "HOSE"}
                        >
                            <NavDropdown.Item
                                onClick={e => this.handleChangeTab(e, 'hoseTab', 'hose')}
                                active={activeDropdownKey === "hose"}
                                title="HOSE"
                            >
                                <span>HOSE</span>
                            </NavDropdown.Item>
                            <NavDropdown.Item
                                onClick={e => this.handleChangeTab(e, 'hoseTab', 'vn30')}
                                active={activeDropdownKey === "vn30"}
                                title="VN30"
                            >
                                <span>VN30</span>
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav.Item>
                    <Nav.Item className="hnx-nav">
                        <NavDropdown
                            active={activeTabKey === "hnxTab"}
                            title={(activeDropdownTitle && activeTabKey === "hnxTab") ? activeDropdownTitle : "HNX"}
                        >
                            <NavDropdown.Item
                                onClick={e => this.handleChangeTab(e, 'hnxTab', 'hnx')}
                                active={activeDropdownKey === "hnx"}
                                title="HNX"
                            >
                                <span>HNX</span>
                            </NavDropdown.Item>
                            <NavDropdown.Item
                                onClick={e => this.handleChangeTab(e, 'hnxTab', 'hnx30')}
                                active={activeDropdownKey === "hnx30"}
                                title="HNX30"
                            >
                                <span>HNX30</span>
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav.Item>
                    <Nav.Item className="upcom-nav">
                        <NavDropdown
                            active={activeTabKey === "upcomTab"}
                            title={(activeDropdownTitle && activeTabKey === "upcomTab") ? activeDropdownTitle : "UPCOM"}>
                            <NavDropdown.Item
                                onClick={e => this.handleChangeTab(e, 'upcomTab', 'upcom')}
                                active={activeDropdownKey === "upcom"}
                                title="UPCOM"
                            >
                                <span>UPCOM</span>
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav.Item>
                    <Nav.Item className="watchlist-nav">
                        <NavDropdown
                            active={activeTabKey === "watchlist"}
                            title={(activeDropdownTitle && activeTabKey === "watchlist") ? activeDropdownTitle : "DS Theo dõi"}
                        >
                            {watchlists.map(function (w, idx) {
                                let wid = w['id'];
                                return (
                                    <NavDropdown.Item key={wid}
                                        value={wid}
                                        onClick={e => that.handleChangeTab(e, 'watchlist', wid)}
                                        active={activeDropdownKey === wid}
                                        title={w['name']}
                                        className="watchlist-item"
                                    >
                                        {that.renderWatchlistName(w)}
                                        <span className="watchlist-control">
                                            <Button className="watchlist-control-btn" onClick={e => that.turnOnEditWatchlistMode(e, w)}><FontAwesomeIcon className="control-icon" icon={faPen} /></Button>
                                            <Button className="watchlist-control-btn remove" onClick={e => that.removeWatchlist(e, wid)}><FontAwesomeIcon className="control-icon" icon={faXmark} /></Button>
                                        </span>
                                    </NavDropdown.Item>);
                            })}
                            <NavDropdown.Divider />
                            <li value="watchlist-add" title="Thêm danh mục" className="add-watchlist-nav">
                                <InputGroup className="add-watchlist-inp">
                                    <FormControl
                                        value={watchlistTxt}
                                        onChange={this.onChangeWatchlistTxt.bind(this)}
                                        placeholder="Tạo danh mục mới..."
                                        aria-label="Tạo danh mục mới"
                                        className="add-watchlist-txt"
                                        onKeyDown={this.onEnterWatchlist.bind(this)}
                                    />
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