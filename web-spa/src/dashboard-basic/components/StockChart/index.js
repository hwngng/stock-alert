import React, { Component } from 'react';
import { timeParse } from "d3-time-format";

import CandleStickChartHighlightCandle from './CandleStickChartHighlightCandle';

import hammerCandle from '../../candle-patterns/hammer';
import invertedHammerCandle from '../../candle-patterns/invertedHammer';
import morningStar from '../../candle-patterns/morningStar';
import eveningStar from '../../candle-patterns/eveningStar';
import bullishEngulfing from '../../candle-patterns/bullishEngulfing';
import bearishEngulfing from '../../candle-patterns/bearishEngulfing';
import threeWhiteSoliders from '../../candle-patterns/threeWhiteSoliders';
import threeBlackCrows from '../../candle-patterns/threeBlackCrows';
import DataService from '../../../common/request/DataService';
import dataServiceApi from '../../../common/api/dataServiceApi';
import { Modal } from 'react-bootstrap';

export default class StockChart extends Component {
    constructor(props) {
        super(props);
        this.config = props.config;
        this.handleCloseModal = this.props.handleCloseModal;

        this.state = {
            plotData: undefined,
            stockInfo: {},
            type: 'hybrid',
            highlightCandles: [],
            isShowModal: false,
        };

        this.parseDate = timeParse("%Y%m%d");
        this.dataSvcRequest = DataService(this.config['dataServiceHost']);
        this.exchanges = this.config['exchanges'];
    }

    loadChartCode() {
        let stockInfo = {};
        let symbol = '';
        let exchangeCode = '';
        let isShowModal = false;
        if (this.callerStock) {
            stockInfo = this.callerStock;
            isShowModal = true;
        } else {
            const query = new URLSearchParams(window.location.search);
            stockInfo['symbol'] = query.get('symbol');
            stockInfo['exchange_code'] = query.get('exchangeCode');
            isShowModal = false;
        }
        return { stockInfo, isShowModal };
    }

    componentDidMount() {
        const that = this;
        let { plotData, type } = this.state;
        this.callerStock = this.props.stock;
        let { stockInfo, isShowModal } = this.loadChartCode();
        if (!stockInfo['symbol']) return;
        this.setState({ stockInfo, isShowModal });

        this.dataSvcRequest(dataServiceApi.history.path, {
            method: dataServiceApi.history.method,
            params: {
                codes: [stockInfo['symbol']],
                exchangeCodes: [stockInfo['exchange_code']]
            }
        })
            .then(response => {
                let timeseries = response.data;
                if (!Array.isArray(timeseries)) return;
                plotData = timeseries.map(ts => ({
                    date: new Date(ts['dt']),
                    open: +ts['open'],
                    high: +ts['high'],
                    low: +ts['low'],
                    close: +ts['close'],
                    volume: +ts['volume']
                }));

                that.setState({ plotData });
                // ReactDOM.render(<CandleStickChartHighlightCandle code={code} data={plotData} type="hybrid" />, document.getElementById("chart"));
            })
            .catch(error => {
                console.log(error);
                // alert
            })
    }

    onHammerSelect(event) {
        const { plotData } = this.state;
        let { highlightCandles } = this.state;
        highlightCandles = hammerCandle(plotData);
        this.setState({ highlightCandles })
    }

    onInvertedHammerSelect(event) {
        const { plotData } = this.state;
        let { highlightCandles } = this.state;
        highlightCandles = invertedHammerCandle(plotData);
        this.setState({ highlightCandles })
    }

    onMorningStarSelect(event) {
        const { plotData } = this.state;
        let { highlightCandles } = this.state;
        highlightCandles = morningStar(plotData);
        this.setState({ highlightCandles })
    }

    onEveningStarSelect(event) {
        const { plotData } = this.state;
        let { highlightCandles } = this.state;
        highlightCandles = eveningStar(plotData);
        this.setState({ highlightCandles })
    }

    onBullishEngulfingSelect(event) {
        const { plotData } = this.state;
        let { highlightCandles } = this.state;
        highlightCandles = bullishEngulfing(plotData);
        this.setState({ highlightCandles })
    }

    onBearishEngulfingSelect(event) {
        const { plotData } = this.state;
        let { highlightCandles } = this.state;
        highlightCandles = bearishEngulfing(plotData);
        this.setState({ highlightCandles })
    }

    onThreeWhiteSolidersSelect(event) {
        const { plotData } = this.state;
        let { highlightCandles } = this.state;
        highlightCandles = threeWhiteSoliders(plotData);
        this.setState({ highlightCandles })
    }

    onThreeBlackCrowsSelect(event) {
        const { plotData } = this.state;
        let { highlightCandles } = this.state;
        highlightCandles = threeBlackCrows(plotData);
        this.setState({ highlightCandles })
    }

    handleCloseModalChild(event) {
        this.handleCloseModal();
    }

    render() {
        const { plotData, stockInfo, type, highlightCandles, isShowModal } = this.state;
        let content = <></>;

        if (!stockInfo || !stockInfo['symbol']) {
            content = (
                <div>None</div>
            );
        } else if (!plotData || !Array.isArray(plotData) || plotData.length <= 0) {
            content = (
                <div>Loading...</div>
            );
        } else {
            content = (
                <>
                    <div>
                        <input type="radio" onChange={this.onHammerSelect.bind(this)} name="pattern" />
                        <label style={{ marginLeft: '10px' }}>Mẫu hình Hammer</label>
                    </div>
                    <div>
                        <input type="radio" onChange={this.onInvertedHammerSelect.bind(this)} name="pattern" />
                        <label style={{ marginLeft: '10px' }}>Mẫu hình Inverted Hammer</label>
                    </div>
                    <div>
                        <input type="radio" onChange={this.onMorningStarSelect.bind(this)} name="pattern" />
                        <label style={{ marginLeft: '10px' }}>Mẫu hình Morning Star</label>
                    </div>
                    <div>
                        <input type="radio" onChange={this.onEveningStarSelect.bind(this)} name="pattern" />
                        <label style={{ marginLeft: '10px' }}>Mẫu hình Evening Star</label>
                    </div>
                    <div>
                        <input type="radio" onChange={this.onBullishEngulfingSelect.bind(this)} name="pattern" />
                        <label style={{ marginLeft: '10px' }}>Mẫu hình Bullish Engulfing</label>
                    </div>
                    <div>
                        <input type="radio" onChange={this.onBearishEngulfingSelect.bind(this)} name="pattern" />
                        <label style={{ marginLeft: '10px' }}>Mẫu hình Bearish Engulfing</label>
                    </div>
                    <div>
                        <input type="radio" onChange={this.onThreeWhiteSolidersSelect.bind(this)} name="pattern" />
                        <label style={{ marginLeft: '10px' }}>Mẫu hình Three White Soliders</label>
                    </div>
                    <div>
                        <input type="radio" onChange={this.onThreeBlackCrowsSelect.bind(this)} name="pattern" />
                        <label style={{ marginLeft: '10px' }}>Mẫu hình Three Black Crows</label>
                    </div>
                    <hr></hr>
                    <div id="chart" className="react-stockchart">
                        <CandleStickChartHighlightCandle type={type} code={stockInfo['symbol']} exchangeTitle={this.exchanges[stockInfo['exchange_code']]} data={plotData} highlightCandle={highlightCandles} />
                    </div>
                </>
            );
        }

        if (isShowModal) {
            return (
                <Modal show onHide={this.handleCloseModal} size='lg' centered>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <div>
                                <div>
                                    {stockInfo['name']}
                                </div>
                                <div>
                                    {`${stockInfo['symbol']}:${this.exchanges[stockInfo['exchange_code']]}`}
                                </div>
                            </div>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {content}
                    </Modal.Body>
                </Modal>
            );
        } else {
            return (
                <>
                    {content}
                </>
            )
        }
    }
}