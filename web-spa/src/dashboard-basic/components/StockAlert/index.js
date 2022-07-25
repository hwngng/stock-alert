import React, { Component } from 'react';
import { HubConnectionBuilder, } from '@microsoft/signalr';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons'
import AlertSettings from '../AlertSettings';
import alertServiceApi from '../../../common/api/alertServiceApi';
import WebAPIAuth from '../../../common/request/WebAPIAuth';
import userApi from '../../../common/api/userApi';
import { timeFormat } from 'd3-time-format';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import StockChart from '../StockChart';

export default class StockAlert extends Component {

    constructor(props) {
        super(props);

        this.config = props.config;

        this.state = {
            isShowSetting: false,
            alertOptions: [],
            alerts: [],
            isShowChart: false,
            chartStock: {},
            highlightChartPattern: null
        };
        this.hub = null;
        this.apiAuthRequest = WebAPIAuth(this.config['webApiHost']);
        this.alertTimeFormat = timeFormat('%H:%M');
        this.canNoti = true;
    }

    async connect() {
        const that = this;
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

        connection.onreconnected(() => {
            const { alertOptions } = that.state;
            that.hub?.invoke('SubscribeAlerts', alertOptions);
            that.pauseNoti(500);
        });

        connection.on("Alert", (alert) => {
            console.log(alert);
            const { alerts, isShowSetting } = that.state;
            alerts.push(alert);

            that.showNotis(alert);

            that.setState({ alerts });
        });

        try {
            await connection.start();
            console.info('Connected successfully to alert service');
        } catch (e) {
            console.error(e);
            connection = null;
        };

        return connection;
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

    pauseNoti(ms) {
        const that = this;
        this.canNoti = false;
        setTimeout(function () {
            that.canNoti = true;
        }, ms);
    }

    loadAlertOption() {
        const that = this;

        this.apiAuthRequest(userApi.alertOptions.path, {
            method: userApi.alertOptions.method
        })
            .then(response => {
                let alertOptionObj = response.data;
                if (!alertOptionObj && !Array.isArray(alertOptionObj)) {
                    console.log(response);
                    return;
                }
                alertOptionObj.forEach(alertOption => {
                    if (!alertOption['symbolsJson'])
                        return;
                    try {
                        alertOption['symbols'] = JSON.parse(alertOption['symbolsJson']);
                    } catch (e) {
                        console.log(alertOption);
                    }
                })
                that.hub?.invoke('SubscribeAlerts', alertOptionObj);
                that.pauseNoti(500);
                that.setState({ alertOptions: alertOptionObj });
            })
            .catch(error => {
                console.log(error);
            });
    }

    async componentDidMount() {
        this.hub = await this.connect();
        this.loadAlertOption();
    }

    showNotis(alert) {
        if (!this.canNoti) return;
        let noti = (
            <div className="alert-noti">
                <div className="alert-noti-symbol">{alert['symbol']}</div>
                <div>{alert['message']}</div>
                <div>{this.alertTimeFormat(new Date(alert['publishedAt']))}</div>
            </div>
        );
        toast(noti);
    }

    handleOpenModal() {
        this.setState({ isShowSetting: true });
    }

    handleCloseModal() {
        this.setState({ isShowSetting: false });
    }

    handleOpenChartModal(event, alert) {
        event.preventDefault();
        let chartStock = { symbol: alert['symbol'], exchange_code: alert['exchange'] };
        let highlightChartPattern = alert['type'];
        this.setState({ chartStock, isShowChart: true, highlightChartPattern });
    }

    handleCloseChartModal() {
        this.setState({ chartStock: {}, isShowChart: false });
    }

    renderAlerts() {
        const that = this;
        const { alerts } = this.state;

        var ret = [];

        for (let i = alerts.length - 1; i >= 0; --i) {
            let alert = alerts[i];
            ret.push(
                (
                    <tr key={i}>
                        <td className="alert-symbol">
                            <div className="symbol clear-fix">
                                <a className="symbol-link link-primary" onClick={e => that.handleOpenChartModal(e, alert)}>{alert['symbol']}</a>
                            </div>
                        </td>
                        <td className="border-right-0">{alert['message']}</td>
                        <td className="border-left-0">{that.alertTimeFormat(new Date(alert['publishedAt']))}</td>
                    </tr>
                )
            );
        }
        return ret;
    }

    render() {
        const { isShowSetting, alertOptions, chartStock, isShowChart, highlightChartPattern } = this.state;

        return (
            <div>
                <ToastContainer
                    position="bottom-right"
                    autoClose={5000}
                    hideProgressBar
                    newestOnTop={true}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    limit={3}
                />
                <h3>Thông báo</h3>
                <div className="table-responsive table-fix-head">
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
                            {this.renderAlerts()}
                        </tbody>
                    </table>
                </div>
                {isShowSetting && (
                    <AlertSettings
                        config={this.config}
                        isShowModal={isShowSetting}
                        handleCloseModal={this.handleCloseModal.bind(this)}
                        hub={this.hub}
                        alertOptions={alertOptions}
                    ></AlertSettings>
                )}
                {isShowChart ?
                    (<StockChart config={this.props.config} stock={chartStock} handleCloseModal={this.handleCloseChartModal.bind(this)} option={highlightChartPattern}/>)
                    : (<></>)}
            </div>
        );
    }
}