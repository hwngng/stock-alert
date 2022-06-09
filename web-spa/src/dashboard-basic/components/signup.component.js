import axios from 'axios';
import React, { Component } from 'react'
import userApi from '../../common/api/userApi';
import '../auth.css';
import { Modal, Button } from 'react-bootstrap';

export default class SignUp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      form: {},
      errorMsg: null,
      openPopup: false,
      successMessage: null
    }

    this.config = props.config;
    this.apiRequest = WebAPI(this.config['webApiHost']);
  }

  handleChange(event) {
    let form = this.state.form;
    form[event.target.name] = event.target.value;
    this.setState({ form: form });
  }

  handleSubmit(event) {
    event.preventDefault();
    let form = this.state.form;
    let that = this;

    this.apiRequest(userApi.register.path, {
      method: userApi.register.method,
      data: form
    })
      .then(function (response) {
        that.setState({ openPopup: true, successMessage: 'Đăng ký thành công!', errorMsg: null, form: {} });
      })
      .catch(function (error) {
        form.password = form.confirmPassword = '';
        that.setState({ errorMsg: error.response.data, form: form });
      });
  }

  renderErrorMessage() {
    const { errorMsg } = this.state;
    if (!errorMsg || !Array.isArray(errorMsg))
      return '';
    return (
      <div className="error-message-region">
        {
          errorMsg.map((x, idx) => (
            <div className="error-message" key={idx}>
              {x}
            </div>
          ))
        }
      </div>
    );
  }

  closeModal(event) {
    this.setState({ openPopup: false });
  }

  render() {
    const { openPopup, successMessage, form } = this.state;

    return (
      <div className="auth-wrapper">
        <div className="auth-inner">
          <form className="form-group" onSubmit={this.handleSubmit.bind(this)}>
            <h3>Đăng ký</h3>

            <div className="mb-3">
              <label>Tên</label>
              <input
                onChange={this.handleChange.bind(this)}
                type="text"
                className="form-control"
                placeholder="Tên"
                name="firstName"
                value={form["firstName"] || ''}
              />
            </div>

            <div className="mb-3">
              <label>Họ</label>
              <input
                onChange={this.handleChange.bind(this)}
                type="text"
                className="form-control"
                placeholder="Họ"
                name="lastName"
                value={form["lastName"] || ''}
              />
            </div>

            <div className="mb-3">
              <label className="required">Tên tài khoản</label>
              <input
                onChange={this.handleChange.bind(this)}
                type="text"
                className="form-control"
                placeholder="Username"
                name="userName"
                value={form["userName"] || ''}
              />
            </div>

            <div className="mb-3">
              <label>Email</label>
              <input
                onChange={this.handleChange.bind(this)}
                type="email"
                className="form-control"
                placeholder="abc@xyz.com"
                name="email"
                value={form["email"] || ''}
              />
            </div>

            <div className="mb-3">
              <label className="required">Mật khẩu</label>
              <input
                onChange={this.handleChange.bind(this)}
                type="password"
                className="form-control"
                placeholder="Password"
                name="password"
                value={form["password"] || ''}
              />
            </div>

            <div className="mb-3">
              <label className="required">Xác nhận Mật khẩu</label>
              <input
                onChange={this.handleChange.bind(this)}
                type="password"
                className="form-control"
                placeholder="Confirm password"
                name="confirmPassword"
                value={form["confirmPassword"] || ''}
              />
            </div>

            <div className="d-grid">
              <button type="submit" className="btn btn-primary">
                Đăng ký
              </button>
            </div>
            <p className="forgot-password text-right">
              {/* Already registered <a href="/login">sign in?</a> */}
              Đã có tài khoản, <a href="/login">đăng nhập?</a>
            </p>
          </form>
          {this.renderErrorMessage()}
          <Modal show={openPopup} size='lg' centered>
            <Modal.Header>
              <Modal.Title>Thông báo</Modal.Title>
            </Modal.Header>
            <Modal.Body>{successMessage}</Modal.Body>
            <Modal.Footer>
              <Button variant="primary" href="/login">
                Đăng nhập
              </Button>
              <Button variant="secondary" onClick={this.closeModal.bind(this)}>
                Đóng
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    )
  }
}
