import React, { Component } from 'react';
import { timeParse } from "d3-time-format";

import CandleStickChartHighlightCandle from './CandleStickChartHighlightCandle';
import DataService from '../../../common/request/DataService';
import dataServiceApi from '../../../common/api/dataServiceApi';
import { Modal, Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import patternMap from '../../../common/patternMap';

export default class StockChart extends Component {
    constructor(props) {
        super(props);
        this.config = props.config;
        this.handleCloseModal = this.props.handleCloseModal;

        this.state = {
            plotData: undefined,
            stockInfo: {},
            type: 'hybrid',
            highlightPatterns: [],
            isShowModal: false,
            highlightOptions: [''],
            selectValue: '',
            newPattern: {}
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

    handleCloseModalChild(event) {
        this.handleCloseModal();
    }

    handleChangeSelect(event, optionIdx) {
        const { highlightOptions, plotData } = this.state;
        let { highlightPatterns, newPattern } = this.state;
        let newPatternKey = event.target.value ?? '';
        newPattern = null;
        if (optionIdx != null) {
            highlightOptions[optionIdx] = newPatternKey;
            highlightPatterns = [];
            highlightOptions.forEach(patternKey => {
                let pattern = patternMap[patternKey];
                if (pattern) {
                    let resultPatterns = pattern.fn(plotData);
                    resultPatterns = resultPatterns.map(p => {
                        p.push(patternKey);
                        return p;
                    })
                    if (patternKey == newPatternKey && resultPatterns.length > 0)
                        newPattern = resultPatterns[resultPatterns.length - 1];
                    highlightPatterns = highlightPatterns.concat(resultPatterns);
                }
            });
            highlightPatterns.sort((pattern1, pattern2) => pattern1[0].date - pattern2[0].date);
        } else {
            highlightOptions.push(newPatternKey)
            let pattern = patternMap[newPatternKey];
            if (pattern) {
                let resultPatterns = pattern.fn(plotData);
                resultPatterns = resultPatterns.map(p => {
                    p.push(newPatternKey);
                    return p;
                });
                if (resultPatterns.length > 0)
                    newPattern = resultPatterns[resultPatterns.length - 1];
                highlightPatterns = highlightPatterns.concat(resultPatterns);
                highlightPatterns.sort((pattern1, pattern2) => pattern1[0].date - pattern2[0].date);
            }
        }
        this.setState({ highlightOptions, highlightPatterns, newPattern });
    }

    handleAddPattern(event) {
        const { highlightOptions } = this.state;
        if (highlightOptions[highlightOptions.length - 1] != '')
            highlightOptions.push('');

        this.setState({ highlightOptions });
    }

    handleRemovePattern(event, optionIdx) {
        if (optionIdx == null)
            return;
        const { plotData } = this.state;
        let { highlightOptions, highlightPatterns, newPattern } = this.state;
        highlightOptions.splice(optionIdx, 1);
        highlightPatterns = [];
        highlightOptions.forEach(patternKey => {
            let pattern = patternMap[patternKey];
            if (pattern) {
                let resultPatterns = pattern.fn(plotData);
                resultPatterns = resultPatterns.map(p => {
                    p.push(patternKey);
                    return p;
                })
                highlightPatterns = highlightPatterns.concat(resultPatterns);
            }
        });
        highlightPatterns.sort((pattern1, pattern2) => pattern1[0].date - pattern2[0].date);
        newPattern = null;

        this.setState({ highlightOptions, highlightPatterns, newPattern });
    }

    renderPatternSelect(optionIdx = null) {
        const that = this;
        const { highlightOptions } = this.state;
        let options = Object.keys(patternMap)?.filter(x => !highlightOptions.includes(x) || (optionIdx != null && x == highlightOptions[optionIdx])).map(pattern => {
            return (
                <option value={pattern}>{`Mẫu hình ${patternMap[pattern]['titleEn']}`}</option>
            );
        });

        return (
            <div className="select-pattern">
                <Form.Control className="select" as="select" aria-label="Default select example" onChange={e => that.handleChangeSelect(e, optionIdx)} value={optionIdx != null ? highlightOptions[optionIdx] : ''}>
                    <option>Chọn mẫu hình nến</option>
                    {options}
                </Form.Control>
                <Button className="control-btn remove" onClick={e => that.handleRemovePattern(e, optionIdx)}><FontAwesomeIcon className="control-icon" icon={faXmark} /></Button>
            </div>
        );
    }

    render() {
        const { plotData, stockInfo, type, highlightPatterns, isShowModal, highlightOptions, newPattern } = this.state;
        // const highlightAccumulated = Helper.accumulateAdjPoint(highlightPatterns, 24*60*60*1000000);
        // console.log(highlightPatterns);
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
                        <div className="row">
                            <div id="chart" className="stockchart col-10">
                                <CandleStickChartHighlightCandle
                                    type={type}
                                    code={stockInfo['symbol']}
                                    exchangeTitle={this.exchanges[stockInfo['exchange_code']]}
                                    data={plotData}
                                    highlightPatterns={highlightPatterns}
                                    highlightOptions={highlightOptions}
                                    focusPattern={newPattern}
                                />
                            </div>
                            <div className="highlight col-2">
                                {highlightOptions.length > 0 &&
                                    highlightOptions.map((select, idx) => this.renderPatternSelect(idx))}
                                <div>
                                    <Button className="add-new-pattern-btn" onClick={this.handleAddPattern.bind(this)}>Thêm mẫu hình</Button>
                                </div>
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