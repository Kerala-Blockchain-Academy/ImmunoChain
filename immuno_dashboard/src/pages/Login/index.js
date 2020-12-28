import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import renderField from 'components/FormInputs/renderField';
import store from '../../index'
import swal from 'sweetalert';
import { url } from '../../service'



const validate = values => {
  const errors = {};
  if (!values.username || values.username.trim() === "") {
    errors.username = 'Username is required'
  }

  if (!values.password) {
    errors.password = 'Password is required';
  } else if (values.password.length < 3) {
    errors.password = 'Must be 8 characters or more';
  }
  return errors;

}


class Login extends Component {
  state = {
    message: {
      status: false,
      content: ''
    }
  }

  handleLogin = () => {
    let values = store.getState()
    document.getElementsByName("username")[0].focus();
    document.getElementsByName("password")[0].focus();
    document.getElementsByName("password")[0].blur();
    if (values.form.stackedForm.syncErrors) {
      swal("Message", "Please clear all errors ", "warning")
    } else {
      let payload = {
        username: values.form.stackedForm.values.username,
        password: values.form.stackedForm.values.password,
        access_token_time: 25,
        refresh_token_time: 2
      }
      fetch(url + 'login', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }).then(function (res) {
        return (res.json())
      }).then((res) => {
        console.log("login=", res)
        if (res.status_code === 200) {
          sessionStorage.setItem("logged_in", true);
          window.location.href = '/'
          localStorage.setItem('roles', res.role);
          localStorage.setItem('access_token', res.access_token);
          localStorage.setItem('refresh_token', res.refresh_token);
        } else {
          swal("Message", res.status_msg, "error");
        }
      })
    }
  }
  render() {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', width: '100%', height: '100vh', background: '#6d74ef' }}>
        <div className="card col-md-4" >
          <div style={{ textAlign: 'center' }}>
            <img src={'/proxy_form.png'} style={{ width: '100%' }} />
          </div>
          <div className="header" style={{ textAlign: 'center', paddingTop: '0' }}>
            <h4>LOGIN</h4>
          </div>
          <div className="content">
            <div className="form-group">
              <label className="control-label">Username</label>
              <Field
                name="username"
                type="text"
                component={renderField} />
            </div>

            <div className="form-group">
              <label className="control-label">Password</label>
              <Field
                name="password"
                type="password"
                component={renderField} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <button type="submit" onClick={this.handleLogin} className="btn btn-fill btn-primary" disabled={false}>Submit</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default reduxForm({
  form: 'stackedForm',
  validate
})(Login)
