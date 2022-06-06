import React from 'react';
import { Link } from 'react-router-dom';
import './side-menu.css';


const SideMenu = (props) => (
    <nav className="col-sm-3 col-md-1 d-none d-sm-block bg-light sidebar navbar">
        <ul className="nav nav-pills flex-column">
            <li className="nav-item">
                <Link to ='/' className="nav-link">Bảng giá</Link>
            </li>
            <li className="nav-item">
                <Link to ='/alert-settings' className="nav-link">Thiết lập cảnh báo</Link>
            </li>
        </ul>
    </nav>
);

export default SideMenu;
