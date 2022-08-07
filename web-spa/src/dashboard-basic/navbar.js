import React from 'react';
import './navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse } from '@fortawesome/free-solid-svg-icons';
import Session from '../common/session';
import userApi from '../common/api/userApi';
import WebAPI from '../common/request/WebAPI';


const NavBar = (props) => {
    const apiHost = props.config['webApiHost'];
    const apiRequest = WebAPI(apiHost);

    const handleLogout = async function () {
        Session.clearSession();
        let tokenModel = props.msigSession['authSession'];
        if (apiHost && tokenModel) {
            let data = {
                accessToken: tokenModel['accessToken'],
                refreshToken: tokenModel['refreshToken']
            };
            let _ = await apiRequest(userApi.logout.path, {
                method: userApi.logout.method,
                data: data
            });
        }
        window.location = '/';
    }

    const renderUserNav = () => {
        if (props.authPage) {
            let href = '';
            let title = '';
            switch (props.authPage) {
                case 'login':
                    href = '/signup';
                    title = 'Đăng ký';
                    break;
                case 'signup':
                    href = '/login';
                    title = 'Đăng nhập';
                    break;
                default:
                    break;
            }
            let content = (
                <a className="nav-link navbar-avatar" style={{ paddingBottom: '7px' }} href={href} aria-expanded="false" data-animation="scale-up" role="button">
                    <div className="">
                        {title}
                    </div>
                </a>
            );
            return content;
        }
        if (props.msigSession['userSession']) {
            let user = props.msigSession['userSession']
            let content = (
                <>
                    <a className="nav-link navbar-avatar" style={{ paddingBottom: '7px' }} href="#" data-toggle="dropdown" aria-expanded="false" data-animation="scale-up" role="button">
                        <div className="">
                            Hi, {user['firstName'] ?? user['lastName'] ?? user['userName']}
                        </div>
                    </a>
                    <div className="dropdown-menu user-menu" role="menu">
                        <a className="dropdown-item" href="/profile" role="menuitem"><i className="icon md-account" aria-hidden="true"></i>Tài khoản</a>
                        {/* <a className="dropdown-item text-danger" href="/pricing.html" role="menuitem"><i className="icon fa-diamond" aria-hidden="true"></i>Nâng cấp/Gia hạn</a> */}
                        <div className="dropdown-divider" role="presentation"></div>
                        <a className="dropdown-item" role="menuitem" onClick={handleLogout}><i className="icon md-power" aria-hidden="true"></i>Đăng xuất</a>
                    </div>
                </>
            );
            return content;
        }

        let content = (
            <div>
                <span>
                    <a className="nav-link navbar-avatar" style={{ paddingBottom: '7px', display: 'inline' }} href="login" aria-expanded="false" data-animation="scale-up" role="button">
                        Đăng nhập
                    </a>/<a className="nav-link navbar-avatar" style={{ paddingBottom: '7px', display: 'inline' }} href="signup" aria-expanded="false" data-animation="scale-up" role="button">
                        Đăng ký
                    </a>
                </span>

            </div>
        );
        return content;
    };
    return (
        <div className="nav-header">
            <nav className="navbar fixed-top navbar-expand navbar-light bg-light pl-5 nav-header border-bottom">
                <a className="navbar-brand py-2" href="#" style={{ fontFamily: "GepesteVariable", fontSize: "2rem" }}>
                    <img src="assets/img/logo-lg.jpg" width="64" height="64" className="d-inline-block align-top" alt="" />
                    <span className="ml-3">mySignal</span>
                </a>

                <div className="collapse navbar-collapse pl-3" id="navbarSupportedContent">
                    <ul className="navbar-nav mr-auto">
                        <li className="nav-item active">
                            <a className="nav-link" href="/"><FontAwesomeIcon icon={faHouse} style={{ fontSize: 'large' }} /></a>
                        </li>
                        {/* <li className="nav-item active">
                            <a className="nav-link" href="/alert-settings">Bộ lọc Cổ phiếu</a>
                        </li> */}
                        <li className="nav-item active">
                            <a className="nav-link" href="#">Về chúng tôi</a>
                        </li>
                    </ul>
                    <ul className="nav navbar-toolbar navbar-right navbar-toolbar-right">
                        <li className="nav-item dropdown">
                            {renderUserNav()}
                        </li>
                    </ul>
                </div>
            </nav>
        </div>
    )
};

export default NavBar;
