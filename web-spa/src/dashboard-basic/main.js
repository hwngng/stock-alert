import React from 'react';
import { Route } from "react-router-dom";
import StockAlert from "./components/StockAlert";
import StockTicker from "./components/StockTicker";
import StockChart from "./components/StockChart";
import AlertSettings from "./components/AlertSettings";
import Login from './components/login.component';
import SignUp from './components/signup.component';
import { render } from 'react-dom';

const Main = (props) => (
  <main role="main" className="col-md-12 mx-1">
    <Route path="/stock-ticker" render={() => <StockTicker apiUrl="http://localhost:3000/realtime" />} />
    <Route exact path="/alert-settings" render={() => <AlertSettings />} />
    <Route path="/stock-chart" render={() => <StockChart config={props.config} />} />
    <Route path="/login" render={() => <Login config={props.config} />} />
    <Route path="/signup" render={() => <SignUp config={props.config} />} />
    <div className='row justify-content-start' >
      <div className='col-9'>
        <Route exact path="/" render={() => <StockTicker config={props.config} />} />
      </div>
      <div className='col-3'>
        <Route exact path="/" render={() => <StockAlert config={props.config} />} />
      </div>
    </div>
  </main>
);

export default Main;
