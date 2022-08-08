import React, { Component } from 'react';
import { Button, Modal } from 'react-bootstrap';
import userApi from '../../../common/api/userApi';
import WebAPIAuth from '../../../common/request/WebAPIAuth';
import { faPen, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Dropdown from 'react-multilevel-dropdown';
import { Form } from 'react-bootstrap';
import Helper from '../../../common/helper';

export default class AlertSettings extends Component {

    constructor(props) {
        super(props);

        this.handleCloseModal = this.props.handleCloseModal;
        this.config = props.config;
        this.editOption = props.option ?? {};
        this.hub = props.hub;

        this.state = {
            isShowModal: false,
            alertOptions: props.alertOptions ?? null,
            alertTypes: null,
            watchlists: null,
            createAlertModal: false,
            selectedAlertType: null,
            selectedAlertType2: null,
            selectedSearchRangeIdx: 0,
            selectedVolumeRange: null,
            edittingOption: {}
        };

        this.exchanges = this.config['exchanges'];
        this.apiAuthRequest = WebAPIAuth(this.config['webApiHost']);
        this.searchRangeOptions = [
            { 'title': 'Chứng khoán sàn HOSE', 'exchange': '10' },
            { 'title': 'Chứng khoán sàn HNX', 'exchange': '02' },
            { 'title': 'Chứng khoán sàn UPCOM', 'exchange': '03' },
            { 'title': 'Tất cả chứng khoán', 'exchange': '10,02,03' },
        ];
        this.avgVolume = [10000, 50000, 100000, 200000, 500000, 1000000];
        this.volumeOptions = this.avgVolume.map(v => ({ title: 'KLTB 5 phiên tối thiểu ' + v, vol: v }));
        this.defaultAlertType = '';
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

    componentDidMount() {
        const { alertOptions } = this.state;
        let { isShowModal } = this.state;

        isShowModal = this.props.isShowModal;

        this.setState({ isShowModal });

        this.loadAlertType();
        alertOptions && this.loadAlertOption();
        this.loadWatchlist();

    }

    loadAlertType() {
        const that = this;

        this.apiAuthRequest(userApi.alertTypes.path, {
            method: userApi.alertTypes.method
        })
            .then(response => {
                let alertTypeObj = response.data;
                if (!alertTypeObj) return;
                that.buildTree(alertTypeObj, 'typeKey', 'parent');
                console.log(alertTypeObj);
                let highestNode = alertTypeObj.find(x => !x['parentNode']);
                if (!this.defaultAlertType) {
                    let leftMostNode = {};
                    if (highestNode) {
                        leftMostNode = that.leftLeastLeaf(highestNode);
                    }
                    this.defaultAlertType = leftMostNode['typeKey'];
                }
                that.setState({ alertTypes: alertTypeObj });
            })
            .catch(error => {
                console.log(error);
            });
    }

    loadAlertOption() {
        const that = this;

        this.apiAuthRequest(userApi.alertOptions.path, {
            method: userApi.alertOptions.method
        })
            .then(response => {
                let alertOptionObj = response.data;
                if (!alertOptionObj || !Array.isArray(alertOptionObj)) {
                    console.log(response);
                    return;
                }
                that.setState({ alertOptions: alertOptionObj });
            })
            .catch(error => {
                console.log(error);
            });
    }

    loadWatchlist() {
        const that = this;

        this.apiAuthRequest(userApi.watchlists.path, {
            method: userApi.watchlists.method
        })
            .then(response => {
                let watchlistObj = response.data;
                if (!watchlistObj) return;
                this.searchRangeOptions = this.searchRangeOptions.concat(watchlistObj.map(w => ({
                    title: `Chứng khoán từ watchlist "${w['name']}"`,
                    watchlistId: w['id']
                })));
                console.log(this.searchRangeOptions);
                that.setState({ watchlists: watchlistObj });
            })
            .catch(error => {
                console.log(error);
            });
    }

    getAlertRangeTitle(option) {
        let rangeTitle = '';
        let exchange = option['exchange'];
        let watchlistId = option['watchlistId'];
        let average5Volume = option['average5Volume'];
        if (exchange) {
            let exchangeLst = exchange.split(',');
            let exchangeSymbol = '';
            if (exchangeLst.length == 1) {
                exchangeSymbol = this.exchanges[exchangeLst[0]];
                if (exchangeSymbol) {
                    rangeTitle = 'Chứng khoán sàn ' + exchangeSymbol;
                }
            } else if (exchangeLst.length == 3) {
                if (this.exchanges[exchangeLst[0]]
                    && this.exchanges[exchangeLst[1]]
                    && this.exchanges[exchangeLst[2]]) {
                    rangeTitle = 'Tất cả chứng khoán';
                }
            }

        } else {
            const { watchlists } = this.state;
            let watchlist = null;
            if (watchlistId) {
                watchlist = watchlists.find(w => w.id == watchlistId);
                if (watchlist) {
                    rangeTitle = `Chứng khoán trong watchlist "${watchlist['name']}"`;
                }
            }
        }
        if (average5Volume) {
            if (rangeTitle) {
                rangeTitle += '; KLTB 5 phiên tối thiểu ' + average5Volume;
            }
        } else {
            if (rangeTitle) {
                rangeTitle += '; Không hạn chế thanh khoản';
            }
        }
        return rangeTitle;
    }

    getAlertTypeTitle(typeKey) {
        const { alertTypes } = this.state;
        let alertType = alertTypes.find(a => a.typeKey == typeKey);
        return alertType ? alertType['title'] : null;
    }

    handleOpenCreateModal(e, edittingOption = {}) {
        let { selectedAlertType, selectedAlertType2, selectedSearchRangeIdx, selectedVolumeRange } = this.state;
        // selectedAlertType = edittingOption['typeKey'] ?? this.defaultAlertType;
        selectedAlertType = edittingOption['typeKey'];
        selectedAlertType2 = edittingOption['typeKey2'];
        selectedSearchRangeIdx = 0;
        if (edittingOption['watchlistId'] || edittingOption['exchange']) {
            let firstIdx = this.searchRangeOptions.findIndex(o => (edittingOption['exchange'] && o['exchange'] == edittingOption['exchange'])
                || (edittingOption['watchlistId'] && o['watchlistId'] == edittingOption['watchlistId']));
            if (firstIdx > 0) {
                selectedSearchRangeIdx = firstIdx;
            }
        }
        selectedVolumeRange = edittingOption['average5Volume'] ?? '';
        this.setState({ createAlertModal: true, selectedAlertType, selectedAlertType2, selectedSearchRangeIdx, selectedVolumeRange, edittingOption });
    }

    handleCloseCreateModal(e) {
        const that = this;
        this.setState({ createAlertModal: false });
        setTimeout(() => {
            that.setState({
                selectedAlertType: null,
                selectedAlertType2: null,
                selectedSearchRangeIdx: 0,
                selectedVolumeRange: ''
            });
        }, 500);
    }

    handleChangeAlertType(event, node, rootNodeKey) {
        if (node['children'])
            return;
        if (rootNodeKey == 'tech') {
            this.setState({ selectedAlertType2: node['typeKey'] });
            return;   
        }
        this.setState({ selectedAlertType: node['typeKey'] });
    }

    renderChildren(children, rootNodeKey) {
        const that = this;
        return children.map(child => {
            return (
                <Dropdown.Item
                    className="alert-type-select-menu"
                    onClick={e => that.handleChangeAlertType(e, child, rootNodeKey)}
                >
                    <span>{child['title']}</span>
                    {child['children'] &&
                        (
                            <Dropdown.Submenu position="right" className="alert-type-select-menu">
                                {this.renderChildren(child['children'], rootNodeKey)}
                            </Dropdown.Submenu>
                        )}
                </Dropdown.Item>
            );
        })
    }

    leftLeastLeaf(node) {
        if (node['children'])
            return this.leftLeastLeaf(node['children'][0]);
        return node;
    }

    renderAlertTypeSelect(alertTypes, fromNodeTypeKey = null) {
        const { selectedAlertType, selectedAlertType2 } = this.state;
        this.buildTree(alertTypes, 'typeKey', 'parent');
        let highestNodes = alertTypes.filter(x => !x['parentNode']);
        if (fromNodeTypeKey) {
            highestNodes = highestNodes.filter(x => x['typeKey'] == fromNodeTypeKey)[0]['children'];
        }
        let selectedNode = alertTypes.find(x => x['typeKey'] == (selectedAlertType ?? fromNodeTypeKey));
        if (fromNodeTypeKey == 'tech') {
            selectedNode = alertTypes.find(x => x['typeKey'] == (selectedAlertType2 ?? fromNodeTypeKey));
        }
        let selectedTitle = '';
        if (selectedNode) {
            selectedTitle = selectedNode['title'];
        }
        return (
            <Dropdown
                position="right"
                title={selectedTitle}
                wrapperClassName="alert-type-select"
                buttonClassName="alert-type-select-btn"
                menuClassName="alert-type-select-menu"
            >
                {this.renderChildren(highestNodes, fromNodeTypeKey)}
            </Dropdown>
        );
    }

    buildTree(flat, key, parentAccessor) {
        let parents = {};
        for (let i = 0; i < flat.length; ++i) {
            let parentKey = flat[i][parentAccessor];
            if (parentKey in parents) {
                let parentNode = parents[parentKey];
                if (parentNode) {
                    parentNode['children'].push(flat[i]);
                    flat[i]['parentNode'] = parentNode;
                }
            } else {
                let parentNode = flat.find(x => x[key] == parentKey);
                parents[parentKey] = parentNode;
                if (parentNode) {
                    parentNode['children'] = [];
                    parents[parentKey]['children'].push(flat[i]);
                    flat[i]['parentNode'] = parentNode;
                }
            }
        }
    }

    handleChangeSearchRangeIdx(event) {
        let newValue = event.target.value ?? '';
        this.setState({ selectedSearchRangeIdx: newValue });
    }

    handleChangeVolumeRange(event) {
        let newValue = event.target.value ?? '';
        this.setState({ selectedVolumeRange: newValue });
    }

    async handleSaveAlertOption(event) {
        const { selectedAlertType, selectedAlertType2, selectedSearchRangeIdx, selectedVolumeRange, watchlists } = this.state;
        let { alertOptions, edittingOption } = this.state;
        let searchRange = this.searchRangeOptions[selectedSearchRangeIdx];
        let option = {
            typeKey: selectedAlertType,
            typeKey2: selectedAlertType2,
            exchange: searchRange['exchange'],
            watchlistId: searchRange['watchlistId'],
            average5Volume: selectedVolumeRange ? parseFloat(selectedVolumeRange) : null,
        }
        if (option.watchlistId) {
            let resp = await this.apiAuthRequest(userApi.watchlistDetail.path, {
                method: userApi.watchlistDetail.method,
                params: { id: option.watchlistId }
            });
            let watchlist = resp.data;
            if (watchlist['symbolJson']) {
                try {
                    option['symbols'] = JSON.parse(watchlist['symbolJson']);
                } catch (e) {
                    console.log(resp);
                }
            }
        }

        let dup = alertOptions.find(o => {
            if (o['typeKey'] != option['typeKey'])
                return false;
            if (o['typeKey2'] != option['typeKey2'])
                return false;
            if (!Helper.isEqual(o['exchange'], option['exchange']))
                return false;
            if (!Helper.isEqual(o['watchlistId'], option['watchlistId']))
                return false;
            if (!Helper.isEqual(o['average5Volume'], option['average5Volume']))
                return false;

            return true;
        });

        if (dup) {
            alert('Đã tồn tại cảnh báo trên hệ thống!');
        } else {
            if (edittingOption['typeKey']) {
                option['id'] = edittingOption['id'];
                let stdData = Helper.dropFalsyFields(option);
                try {
                    let resp = await this.apiAuthRequest(userApi.updateAlertOption.path, {
                        method: userApi.updateAlertOption.method,
                        data: stdData
                    });
                    let apiData = resp['data'];
                    if (!resp || apiData != 1) {
                        alert('Lưu cảnh báo không thành công');
                    } else {
                        this.hub?.invoke('UnsubscribeAlerts', [stdData]);
                        // modify to change state of editting option
                        edittingOption['typeKey'] = option.typeKey;
                        edittingOption['typeKey2'] = option.typeKey2;
                        edittingOption['exchange'] = option.exchange;
                        edittingOption['watchlistId'] = option.watchlistId;
                        edittingOption['average5Volume'] = option.average5Volume;
                        edittingOption = {};
                        this.hub?.invoke('SubscribeAlerts', [stdData]);
                    }
                } catch (e) {
                    console.log(e);
                    alert('Lưu cảnh báo không thành công');
                }
            } else {
                try {
                    let stdData = Helper.dropFalsyFields(option);
                    let resp = await this.apiAuthRequest(userApi.insertAlertOption.path, {
                        method: userApi.insertAlertOption.method,
                        data: stdData
                    });
                    let apiData = resp['data'];
                    if (!resp || apiData['status'] != 1) {
                        alert('Thêm cảnh báo không thành công');
                    } else {
                        option['id'] = apiData['id'];
                        if (!alertOptions)
                            alertOptions = [];
                        alertOptions.push(option);
                        this.hub?.invoke('SubscribeAlerts', [stdData]);
                    }
                } catch (e) {
                    console.log(e);
                    alert('Thêm cảnh báo không thành công');
                }
            }
        }

        this.setState({ createAlertModal: false, alertOptions, edittingOption });
    }

    renderSearchRange() {
        const { selectedSearchRangeIdx } = this.state;
        let options = this.searchRangeOptions.map((rangeOption, idx) => {
            return (
                <option value={idx}>{rangeOption['title']}</option>
            );
        });

        return (
            <Form.Control
                className="search-range-control"
                as="select"
                aria-label="Default select example"
                value={selectedSearchRangeIdx}
                onChange={this.handleChangeSearchRangeIdx.bind(this)}
            >
                {options}
            </Form.Control>
        )
    }

    renderVolumeRange() {
        const { selectedVolumeRange } = this.state;
        let options = this.volumeOptions.map((volumeOption, idx) => {
            return (
                <option value={volumeOption['vol']}>{volumeOption['title']}</option>
            );
        });

        return (
            <Form.Control
                className="search-range-control"
                as="select"
                aria-label="Default select example"
                value={selectedVolumeRange}
                onChange={this.handleChangeVolumeRange.bind(this)}
            >
                <option>Không hạn chế thanh khoản</option>
                {options}
            </Form.Control>
        )
    }

    handleEditAlertOption(option) {
        this.oldOption = option;
        this.handleOpenCreateModal(null, option);
    }

    async handleRemoveAlertOption(optionIdx) {
        const { alertOptions } = this.state;
        const option = alertOptions[optionIdx];
        try {
            let resp = await this.apiAuthRequest(userApi.removeAlertOption.path, {
                method: userApi.removeAlertOption.method,
                params: { id: option['id'] }
            });
            let apiData = resp['data'];
            if (!resp || apiData != 1) {
                alert('Xóa cảnh báo không thành công');
            } else {
                this.hub?.invoke('UnsubscribeAlerts', [option]);
                alertOptions.splice(optionIdx, 1);
                this.setState({ alertOptions });
            }
        } catch (e) {
            console.log(e);
        }
    }

    render() {
        const that = this;
        const { isShowModal, alertOptions, alertTypes, watchlists, createAlertModal } = this.state;

        let content = <></>;
        if (!alertTypes || !alertOptions || !watchlists) {
            content = (
                <div>Loading...</div>
            );
        } else {
            console.log(alertOptions);
            content = (
                <div>
                    <div className="table-responsive">
                        <table className="table table-striped table-bordered">
                            <thead>
                                <tr className="align-middle">
                                    <th>ĐIỀU KIỆN CẢNH BÁO</th>
                                    <th>PHẠM VI TÌM KIẾM</th>
                                    <th>THAO TÁC</th>
                                </tr>
                            </thead>
                            <tbody>
                                {alertOptions.map((o, idx) => {
                                    let alertTypeTitle = that.getAlertTypeTitle(o['typeKey']);
                                    let alertTypeTitle2 = that.getAlertTypeTitle(o['typeKey2']);
                                    if (alertTypeTitle) {
                                        alertTypeTitle += (' & ' + alertTypeTitle2);
                                    } else {
                                        alertTypeTitle = alertTypeTitle2;
                                    }
                                    let alertRangeTitle = that.getAlertRangeTitle(o);
                                    if (!alertTypeTitle || !alertRangeTitle) {
                                        return <></>;
                                    } else {
                                        return (
                                            <tr key={o['id']} className="">
                                                <td>
                                                    <input name="id" type="hidden" value={o['id']}></input>
                                                    <span>{alertTypeTitle}</span>
                                                </td>
                                                <td><span>{alertRangeTitle}</span></td>
                                                <td className="align-middle">
                                                    <div className="alert-control">
                                                        <Button className="alert-control-btn" onClick={e => that.handleEditAlertOption(o)}><FontAwesomeIcon className="control-icon" icon={faPen} /></Button>
                                                        <Button className="alert-control-btn remove" onClick={e => that.handleRemoveAlertOption(idx)}><FontAwesomeIcon className="control-icon" icon={faXmark} /></Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }
                                })}
                            </tbody>
                        </table>
                    </div>
                    <Modal show={createAlertModal} onHide={this.handleCloseCreateModal.bind(this)} size='lg' centered>
                        <Modal.Header closeButton>
                            <Modal.Title>
                                <div>
                                    Tạo cảnh báo
                                </div>
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div>
                                <div>
                                    <div>
                                        Điều kiện cảnh báo
                                    </div>
                                    <div className="alert-criteria highlight-area">
                                        <div>
                                            <span>Tiêu chí cảnh báo: </span>
                                            <span>
                                                {this.renderAlertTypeSelect(alertTypes, 'candle')}
                                            </span>
                                            <span class="ml-1">
                                                {this.renderAlertTypeSelect(alertTypes, 'tech')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <span>Phạm vi tìm kiếm: </span>
                                    <div className="search-range highlight-area">
                                        <div className="search-range-control">
                                            {this.renderSearchRange()}
                                        </div>
                                        <div className="search-range-control">
                                            {this.renderVolumeRange()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button onClick={this.handleSaveAlertOption.bind(this)}>Lưu cảnh báo</Button>
                        </Modal.Footer>
                    </Modal>
                </div >
            )
        }

        if (isShowModal) {
            return (
                <Modal show onHide={this.handleCloseModal} size='lg' dialogClassName="setting-modal-width" contentClassName="setting-modal-height" centered>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <div>
                                Thiết lập cảnh báo
                            </div>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {content}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.handleOpenCreateModal.bind(this)}>Tạo cảnh báo</Button>
                    </Modal.Footer>
                </Modal>
            );
        } else {
            return (
                <>
                    {content}
                </>
            );
        }
    }
}