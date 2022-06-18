import React, { Component } from 'react';
import { timeParse } from "d3-time-format";

import CandleStickChartHighlightCandle from './CandleStickChartHighlightCandle';

import hammerCandle from '../../candle-patterns/hammer';
import invertedHammerCandle from '../../candle-patterns/invertedHammer';
import morningStar from '../../candle-patterns/morningStar';
import eveningStar from '../../candle-patterns/eveningStar';
import bullishEngulfing from '../../candle-patterns/bullishEngulfing';
import bearishEngulfing from '../../candle-patterns/bearishEngulfing';
import threeWhiteSoldiers from '../../candle-patterns/threeWhiteSoldiers';
import threeBlackCrows from '../../candle-patterns/threeBlackCrows';
import DataService from '../../../common/request/DataService';
import dataServiceApi from '../../../common/api/dataServiceApi';
import { Modal, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';

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
            highlightOptions: {},
            selectValue: ''
        };

        this.parseDate = timeParse("%Y%m%d");
        this.dataSvcRequest = DataService(this.config['dataServiceHost']);
        this.exchanges = this.config['exchanges'];
        this.patternMap = {
            hammerCandle: {
                titleEn: 'Hammer',
                titleVi: '',
                stroke: '',
                fn: hammerCandle
            },
            invertedHammerCandle: {
                titleEn: 'Inverted Hammer',
                titleVi: '',
                stroke: '',
                fn: invertedHammerCandle
            },
            morningStar: {
                titleEn: 'Morning Star',
                titleVi: '',
                stroke: '',
                fn: morningStar
            },
            eveningStar: {
                titleEn: 'Evening Star',
                titleVi: '',
                stroke: '',
                fn: eveningStar
            },
            bullishEngulfing: {
                titleEn: 'Bullish Engulfing',
                titleVi: '',
                stroke: '',
                fn: bullishEngulfing
            },
            bearishEngulfing: {
                titleEn: 'Bearish Engulfing',
                titleVi: '',
                stroke: '',
                fn: bearishEngulfing
            },
            threeWhiteSoldiers: {
                titleEn: 'Three White Soldiers',
                titleVi: '',
                stroke: '',
                fn: threeWhiteSoldiers
            },
            threeBlackCrows: {
                titleEn: 'Three Black Crows',
                titleVi: '',
                stroke: '',
                fn: threeBlackCrows
            }
        }
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
        highlightCandles = threeWhiteSoldiers(plotData);
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

    handleChangeSelect(event) {
        this.setState({})
    }

    renderPatternSelect() {
        const that = this;
        const { highlightOptions } = this.state;
        let options = Object.keys(this.patternMap)?.map(pattern => {
            return (
                <option value={pattern}>{`Mẫu hình ${that.patternMap[pattern]['titleEn']}`}</option>
            );
        });

        return (
            <Form.Control as="select" aria-label="Default select example" onChange={e => that.handleChangeSelect(e)}>
                <option>Chọn mẫu hình nến</option>
                {options}
            </Form.Control>
        );
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
                    <div className="container-xxl pattern-select">
                        <div class="row">
                            <div id="chart" className="stockchart col-10">
                                <CandleStickChartHighlightCandle type={type} code={stockInfo['symbol']} exchangeTitle={this.exchanges[stockInfo['exchange_code']]} data={plotData} highlightCandle={highlightCandles} />
                            </div>
                            <div className="highlight col-2">
                                <div className="">
                                    <input type="radio" onChange={this.onHammerSelect.bind(this)} name="pattern" />
                                    <label>Mẫu hình Hammer</label>
                                </div>
                                <div className="">
                                    <input type="radio" onChange={this.onInvertedHammerSelect.bind(this)} name="pattern" />
                                    <label>Mẫu hình Inverted Hammer</label>
                                </div>
                                <div className="">
                                    <input type="radio" onChange={this.onMorningStarSelect.bind(this)} name="pattern" />
                                    <label>Mẫu hình Morning Star</label>
                                </div>
                                <div className=" text-wrap">
                                    <input type="radio" onChange={this.onEveningStarSelect.bind(this)} name="pattern" />
                                    <label>Mẫu hình Evening Star</label>
                                </div>
                                <div className=" text-wrap">
                                    <input type="radio" onChange={this.onBullishEngulfingSelect.bind(this)} name="pattern" />
                                    <label>Mẫu hình Bullish Engulfing</label>
                                </div>
                                <div className=" text-wrap">
                                    <input type="radio" onChange={this.onBearishEngulfingSelect.bind(this)} name="pattern" />
                                    <label>Mẫu hình Bearish Engulfing</label>
                                </div>
                                <div className=" text-wrap">
                                    <input type="radio" onChange={this.onThreeWhiteSolidersSelect.bind(this)} name="pattern" />
                                    <label>Mẫu hình Three White Soliders</label>
                                </div>
                                <div className=" text-wrap">
                                    <input type="radio" onChange={this.onThreeBlackCrowsSelect.bind(this)} name="pattern" />
                                    <label>Mẫu hình Three Black Crows</label>
                                </div>
                                {this.renderPatternSelect()}
                            </div>
                        </div>
                    </div>
                </>
            );
        }

        if (isShowModal) {
            return (
                <Modal show onHide={this.handleCloseModal} dialogClassName="chart-modal-width" contentClassName="chart-modal-height" centered>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <div>
                                <div className="modal-company-name">
                                    {stockInfo['name']}
                                </div>
                                <div className="modal-symbol">
                                    ({`${stockInfo['symbol']}:${this.exchanges[stockInfo['exchange_code']]}`})
                                </div>
                                <a href={`/stock-chart?symbol=${stockInfo['symbol']}&exchangeCode=${stockInfo['exchange_code']}`} target="_blank">
                                    <FontAwesomeIcon className="chart-new-tab" icon={faUpRightFromSquare} />
                                </a>
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