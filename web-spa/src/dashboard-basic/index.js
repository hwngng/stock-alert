import React, { Component } from 'react';
import Main from './main';
import './dashboard.css';
import NavBar from './navbar';

export default class DashboardBasic extends Component {
    constructor(props) {
        super(props);
        this.config = props.config;
    }
    render() {
        return (
            <div>
                <NavBar />
                <div id="container" className="container-fluid">
                    <div className="row">
                        <Main config={this.config}/>
                    </div>
                </div>
            </div>
        );
    }
}
