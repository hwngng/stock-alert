import axios from 'axios';
import React, { PureComponent } from 'react';
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

export default class StockAlert extends PureComponent {

    constructor(props) {
        super(props);

        this.config = props.config;

        this.state = {
            isShowSetting: false,
            alertOptions: [],
            alerts: []
        };
        this.hub = null;
        this.apiAuthRequest = WebAPIAuth(this.config['webApiHost']);
        this.alertTimeFormat = timeFormat('%H:%M');
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

        connection.on("Alert", (message) => {
            console.log(message);
            let { alerts } = that.state;
            alerts = alerts.concat(message);

            that.setState({ alerts });

            that.showNotis(message);
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
                this.hub?.invoke('SubscribeAlerts', alertOptionObj);
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

    showNotis(alerts) {
        const that = this;
        let delayTime = 0;
        let delayInterval = 1000;
        alerts.forEach(alert => {
            setTimeout(() => {
                let noti = (
                    <div className="alert-noti">
                        <div className="alert-noti-symbol">{alert['symbol']}</div>
                        <div>{alert['message']}</div>
                        <div>{that.alertTimeFormat(new Date(alert['publishedAt']))}</div>
                    </div>
                );
                toast(noti);
            }, delayTime);
            delayTime += delayInterval;
        });
    }

    handleOpenModal() {
        this.setState({ isShowSetting: true });
    }

    handleCloseModal() {
        this.setState({ isShowSetting: false });
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
                        <td className="alert-symbol">{alert['symbol']}</td>
                        <td className="border-right-0">{alert['message']}</td>
                        <td className="border-left-0">{that.alertTimeFormat(new Date(alert['publishedAt']))}</td>
                    </tr>
                )
            );
        }
        return ret;
    }

    render() {
        const { isShowSetting, alertOptions } = this.state;

        return (
            <div>
                <ToastContainer
                    position="bottom-right"
                    autoClose={5000}
                    hideProgressBar
                    newestOnTop={false}
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
            </div>
        );
    }
}