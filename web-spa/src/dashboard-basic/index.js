import React, { Component } from 'react';
import Main from './main';
import './dashboard.css';
import NavBar from './navbar';
import Session from '../common/session';

export default class DashboardBasic extends Component {
    constructor(props) {
        super(props);
        this.config = props.config;
        let authPage = null;
        switch (document.location.pathname) {
            case '/login':
                authPage = 'login';
                break;
            case '/signup':
                authPage = 'signup';
                break;
        }
        this.authPage = authPage;
        this.user = Session.getSessionLocal();
    }
    render() {
        return (
            <div>
                <NavBar authPage={this.authPage} config={this.config} user={this.user}/>
                <div id="container" className="container-fluid">
                    <div className="row">
                        <Main config={this.config}/>
                    </div>
                </div>
            </div>
        );
    }
}
