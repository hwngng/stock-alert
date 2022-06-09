import React, { Component } from 'react';
import '../auth.css';
import userApi from '../../common/api/userApi';
import Session from '../../common/session';
import { Modal, Button } from 'react-bootstrap';
import Helper from '../../common/helper';
import WebAPI from '../../common/request/WebAPI';

export default class Login extends Component {
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
    if (Helper.isValidEmail(form['usr']))
      form['email'] = form['usr'];
    else
      form['userName'] = form['usr'];
    let that = this;

    this.apiRequest(userApi.login.path, {
      method: userApi.login.method,
      data: form
    })
      .then(function (response) {
        let tokenModel = response.data;
        Session.getUser(tokenModel, that.config['webApiHost'])?.then((user) => {
          Session.saveSession(user, tokenModel);
        });
        that.setState({ openPopup: true, successMessage: 'Đăng nhập thành công! Đang điều hướng tới trang chủ...', errorMsg: null, form: {} });
        setTimeout(() => {
          window.location = '/';
        }, 1200);
      })
      .catch(function (error) {
        form.password = null;
        if (error.response) {
          that.setState({ errorMsg: error.response.data, form: form });
        }
      });
  }

  handleChangeCheckbox(event) {
    let form = this.state.form;
    form['isRemember'] = event.target.checked;
    this.setState({form});
  }

  closeModal(event) {
    this.setState({ openPopup: false });
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

  render() {
    const { openPopup, successMessage, form } = this.state;

    return (
      <div className="auth-wrapper">
        <div className="auth-inner">
          <form onSubmit={this.handleSubmit.bind(this)}>
            <h3>Đăng nhập</h3>

            <div className="mb-3">
              <label className="required">Email/Username</label>
              <input
                onChange={this.handleChange.bind(this)}
                type="text"
                className="form-control"
                placeholder="Enter email or username"
                name="usr"
                value={form["usr"] || ''}
              />
            </div>

            <div className="mb-3">
              <label className="required">Password</label>
              <input
                onChange={this.handleChange.bind(this)}
                type="password"
                className="form-control"
                placeholder="Enter password"
                name="password"
                value={form["password"] || ''}
              />
            </div>

            <div className="mb-3">
              <div className="custom-control custom-checkbox">
                <input
                  onChange={this.handleChangeCheckbox.bind(this)}
                  type="checkbox"
                  className="custom-control-input"
                  id="customCheck1"
                  name="isRemember"
                  checked={form["isRemember"] || false}

                />
                <label className="custom-control-label" htmlFor="customCheck1">
                  Remember me
                </label>
              </div>
            </div>

            <div className="d-grid">
              <button type="submit" className="btn btn-primary submit">
                Submit
              </button>
            </div>
            <p className="forgot-password text-right">
              Forgot <a href="#">password?</a>
            </p>
            {this.renderErrorMessage()}
            <Modal show={openPopup} size='lg' centered>
              <Modal.Header>
                <Modal.Title>Thông báo</Modal.Title>
              </Modal.Header>
              <Modal.Body>{successMessage}</Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={this.closeModal.bind(this)}>
                  Đóng
                </Button>
              </Modal.Footer>
            </Modal>
          </form>
        </div>
      </div>
    )
  }
}
