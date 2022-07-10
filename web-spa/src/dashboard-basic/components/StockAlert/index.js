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

export default class StockAlert extends PureComponent {

    constructor(props) {
        super(props);

        this.config = props.config;

        this.state = {
            isShowSetting: false,
            alertOptions: []
        };
        this.hub = null;
        this.apiAuthRequest = WebAPIAuth(this.config['webApiHost']);

    }

    async connect() {
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

        try {
            await connection.start();
            console.info('Connected successfully to alert service');
        } catch (e) {
            console.error(e);
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
        let stockAlert = this;
        this.hub = await this.connect();
        this.loadAlertOption();
    }

    handleOpenModal() {
        this.setState({ isShowSetting: true });
    }

    handleCloseModal() {
        this.setState({ isShowSetting: false });
    }

    render() {
        const { isShowSetting, alertOptions } = this.state;

        return (
            <div>
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