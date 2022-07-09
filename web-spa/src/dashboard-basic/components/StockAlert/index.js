import axios from 'axios';
import React, { PureComponent } from 'react';
import { HubConnectionBuilder, } from '@microsoft/signalr';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons'
import AlertSettings from '../AlertSettings';
import alertServiceApi from '../../../common/api/alertServiceApi';

export default class StockAlert extends PureComponent {

    constructor(props) {
        super(props);

        this.config = props.config;

        this.state = {
            isShowSetting: false
        };

        this.alertOption = {
            "highestInRange": {
                "fromDate": "2020-06-22",
                "toDate": "2021-06-22"
            },
            "lowestInRange": {
                "fromDate": "2020-06-22",
                "toDate": "2021-06-22"
            },
            "priceTrendPattern": [1, -1, 1, -2],
            "TASignals": {
                "sma": 1
            },
            "stockCodes": ["FLC", "HAG", "HSG", "MBB", "PDR", "PVD", "SHB", "VIC", "VND", "ASP", "FTS", "GVR", "HAG", "HCM", "HDC", "SSI", "TCB", "TGG", "VOS", "VTO"]
        }
        this.alertOption = {};
        let alertOptionsStr = localStorage.getItem("alertOptions");
        let alertOptions = {}
        if (alertOptionsStr) {
            try {
                alertOptions = JSON.parse(alertOptionsStr);
                if ("highestInRange" in alertOptions) {
                    alertOptions["highestInRange"].toDate = this.formatDate(new Date(alertOptions["highestInRange"].toDate));
                    let dateOffset = (24 * 60 * 60 * 1000) * parseInt(alertOptions["highestInRange"].fromDate);
                    let fromDate = new Date();
                    fromDate.setTime(new Date(alertOptions["highestInRange"].toDate).getTime() - dateOffset);
                    alertOptions["highestInRange"].fromDate = this.formatDate(new Date(fromDate));
                }
                if ("lowestInRange" in alertOptions) {
                    alertOptions["lowestInRange"].toDate = this.formatDate(new Date(alertOptions["lowestInRange"].toDate));
                    let dateOffset = (24 * 60 * 60 * 1000) * parseInt(alertOptions["lowestInRange"].fromDate);
                    let fromDate = new Date();
                    fromDate.setTime(new Date(alertOptions["lowestInRange"].toDate).getTime() - dateOffset);
                    alertOptions["lowestInRange"].fromDate = this.formatDate(new Date(fromDate));
                }
                if ("priceTrendPattern" in alertOptions) {
                    alertOptions["priceTrendPattern"].forEach((val, idx) => alertOptions["priceTrendPattern"][idx] = parseInt(val));
                }
                this.alertOption = alertOptions;
            } catch (e) {

            }
        }

        console.log(this.alertOption);

        this.alertResult = {
            "highestInRange": [],
            "lowestInRange": [],
            "priceTrendPattern": [],
            "taSignals": {
            }
        };

        this.apiRequestIntervalID = 0;
    }

    connect() {
        let connection = new HubConnectionBuilder()
            .withUrl((new URL(alertServiceApi.realtime.path, this.config['alertServiceHost'])).toString())
            .withAutomaticReconnect()
            // .configureLogging(LogLevel.Trace)
            .build();

        connection.onclose(
            (e) => {
                if (e) {
                    console.error('Connection closed with error: ' + e);
                }
                else {
                    console.info('Disconnected');
                }
            }
        );

        connection.on("Alert", (message) => {
            console.log(message);
        });

        connection.start()
            .then(() => {
                console.info('Connected successfully to alert service');
            })
            .catch(err => {
                console.error(err.toString());
            });

        return connection;
    }

    showAlert(type, stockCode) {
        switch (type) {
            case "highestInRange":
                NotificationManager.info(`${stockCode} giá tăng phá đỉnh 1 năm`, "", 3000);
                break;
            case "lowestInRange":
                NotificationManager.info(`${stockCode} giá giảm thủng đáy 1 năm`, "", 3000);
                break;
            case "priceTrendPattern":
                NotificationManager.info(`${stockCode} giá tăng 3 phiên liên tục`, "", 3000);
                break;
            default:
                break;
        }
    }

    formatDate(date) {
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();
        if (!year) {
            let currentDate = new Date();
            year = currentDate.getFullYear();
            month = currentDate.getMonth();
            day = currentDate.getDate();
        } else if (!month) {
            month = 1;
            day = 1;
        } else if (!day) {
            day = 1;
        }

        return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
    }

    createAlerts(alertQueue, stockAlert) {
        let timeout = 100;
        Object.keys(alertQueue).forEach(function (key) {
            if (key !== "taSignals") {
                alertQueue[key].forEach(function (el) {
                    setTimeout(stockAlert.showAlert, (timeout += 1000), key, el);
                });
            }
        });
    }

    removeOldAlert(alertQueue, stockAlert) {
        Object.keys(alertQueue).forEach(function (key) {
            if (key in stockAlert.alertResult) {
                if (key !== "taSignals") {
                    stockAlert.alertResult[key] = stockAlert.alertResult[key].filter(function (value, index, arr) {
                        return !alertQueue[key].includes(value);
                    });
                }
            }
        });
    }

    stockAlertSchedule(stockAlert) {
        let alertOption = stockAlert.alertOption;
        let alertQueue = {};
        console.log(alertOption);
        axios.post(stockAlert.apiUrl, alertOption)
            .then(function (response) {
                let tmpAlertResult = response.data;
                Object.keys(tmpAlertResult).forEach(function (key) {
                    if (key in stockAlert.alertResult) {
                        if (key !== "taSignals") {
                            // merge arrays
                            tmpAlertResult[key].forEach(function (el) {
                                if (!stockAlert.alertResult[key].includes(el)) {
                                    stockAlert.alertResult[key].push(el);
                                    if (!(key in alertQueue)) {
                                        alertQueue[key] = [];
                                    }
                                    alertQueue[key].push(el);
                                }
                            })
                        }
                    }
                });
                if (alertQueue && Object.keys(alertQueue).length > 0) {
                    stockAlert.createAlerts(alertQueue, stockAlert);
                    setTimeout(stockAlert.removeOldAlert, 60000, alertQueue, stockAlert);
                }
            })
    }

    notifyTest() {
        NotificationManager.info('Moshi moshi');
    }

    componentDidMount() {
        let stockAlert = this;
        // this.apiRequestIntervalID = setInterval(this.stockAlertSchedule, 1500, stockAlert);
        this.connect();
    }

    componentWillUnmount() {
        clearInterval(this.apiRequestIntervalID);
    }

    handleOpenModal() {
        this.setState({ isShowSetting: true });
    }

    handleCloseModal() {
        this.setState({ isShowSetting: false });
    }

    render() {
        const { isShowSetting } = this.state;

        return (
            <div>
                <NotificationContainer />
                <h3>Thông báo</h3>
                <div className="table-responsive">
                    <table className="table table-striped table-bordered alert-table">
                        <colgroup>
                            <col className="alert-symbol col-2"></col>
                            <col className="alert-message col-9"></col>
                            <col className="alert-time col-1"></col>
                        </colgroup>
                        <thead>
                            <tr>
                                <th className="">Mã</th>
                                <th className="border-right-0">Nội dung</th>
                                <th className="border-left-0">
                                    <div className="alert-setting" onClick={this.handleOpenModal.bind(this)}>
                                        <FontAwesomeIcon icon={faGear} />
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="alert-symbol">MBB</td>
                                <td className="border-right-0">Giá hiện tại cắt lên đường SMA(5)</td>
                                <td className="border-left-0">13:22</td>
                            </tr>
                            <tr>
                                <td className="alert-symbol">VND</td>
                                <td className="border-right-0">Giá hiện tại cắt lên đường SMA(10)</td>
                                <td className="border-left-0">13:11</td>
                            </tr>
                            <tr>
                                <td className="alert-symbol">VND</td>
                                <td className="border-right-0">Nến ngày tạo thành mô hình Three White Soldiers</td>
                                <td className="border-left-0">11:33</td>
                            </tr>
                            <tr>
                                <td className="alert-symbol">MBB</td>
                                <td className="border-right-0">Nến ngày tạo thành mô hình cái nêm</td>
                                <td className="border-left-0">10:47</td>
                            </tr>
                            <tr>
                                <td className="alert-symbol">SSI</td>
                                <td className="border-right-0">Nến ngày tạo thành mô hình Sao mai</td>
                                <td className="border-left-0">9:20</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                {isShowSetting && (
                    <AlertSettings config={this.config} isShowModal={isShowSetting} handleCloseModal={this.handleCloseModal.bind(this)}></AlertSettings>
                )}
            </div>
        );
    }
}