import React from 'react';
import './navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse } from '@fortawesome/free-solid-svg-icons';


const NavBar = (props) => (
    <nav className="navbar fixed-top navbar-expand navbar-light bg-light pl-5 nav-header border-bottom">
        {/* <button className="navbar-toggler" type="button" data-toggle="sidebar" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
        </button>
        <nav className="col-sm-3 col-md-1 d-none d-sm-block bg-light sidebar navbar">
        <ul className="nav nav-pills flex-column">
            <li className="nav-item">
                <Link to ='/' className="nav-link">Bảng giá</Link>
            </li>
            <li className="nav-item">
                <Link to ='/alert-settings' className="nav-link">Thiết lập cảnh báo</Link>
            </li>
        </ul>
        </nav> */}
        <a className="navbar-brand py-2" href="#" style={{ fontFamily: "GepesteVariable", fontSize: "2rem" }}>
            <img src="assets/img/logo-lg.jpg" width="64" height="64" className="d-inline-block align-top" alt="" />
            <span className="ml-3">mySignal</span>
        </a>

        <div className="collapse navbar-collapse pl-3" id="navbarSupportedContent">
            <ul className="navbar-nav mr-auto">
                <li className="nav-item active">
                    <a className="nav-link" href="/"><FontAwesomeIcon icon={faHouse} style={{ fontSize: 'large' }} /></a>
                </li>
                <li className="nav-item active">
                    <a className="nav-link" href="/alert-settings">Bộ lọc Cổ phiếu</a>
                </li>
                <li className="nav-item active">
                    <a className="nav-link" href="#">Về chúng tôi</a>
                </li>
            </ul>
            {/* <form className="form-inline">
                <input className="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search" />
                <button className="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>
                
            </form> */}
                <ul className="nav navbar-toolbar navbar-right navbar-toolbar-right">
                        <li className="nav-item dropdown show">
                        {/* <a className="nav-link navbar-avatar" style={{ paddingBottom: '7px' }} data-toggle="dropdown" href="#" aria-expanded="false" data-animation="scale-up" role="button"> */}
                        <a className="nav-link navbar-avatar" style={{ paddingBottom: '7px' }} href="/authen" aria-expanded="false" data-animation="scale-up" role="button">
                            <div className="font-weight-500 mt--15 mb-1">
                                <img style={{ width: '16px', float: 'left', marginTop: '3px', marginRight: '3px' }} src=""/>
                                Đăng nhập
                            </div>
                        </a>
                            <div className="dropdown-menu" role="menu">
                                <a className="dropdown-item" href="/profile.html" role="menuitem"><i className="icon md-account" aria-hidden="true"></i>Tài khoản</a>
                                <a className="dropdown-item font-weight-500 text-danger" href="/pricing.html" role="menuitem"><i className="icon fa-diamond" aria-hidden="true"></i>Nâng cấp/Gia hạn</a>
                                <div className="dropdown-divider" role="presentation"></div>
                                <a className="dropdown-item" role="menuitem" href="#"><i className="icon md-power" aria-hidden="true"></i>Đăng xuất</a>
                            </div>
                        </li>
                    </ul>
        </div>
    </nav>
);

export default NavBar;
