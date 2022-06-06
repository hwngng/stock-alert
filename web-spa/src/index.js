import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle';

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';

import DashboardBasic from './dashboard-basic';
import registerServiceWorker from './registerServiceWorker';
const environment = 'development';
const config = require('./config/' + environment + '.js');

// const baseUrl = document.getElementsByTagName('base')[0].getAttribute('href');
const rootElement = document.getElementById('root');

ReactDOM.render(
<Router>
    <DashboardBasic config={config}/>
</Router>,
rootElement);

registerServiceWorker();
