import React, { Component } from 'react';
import { Field, reduxForm, reset } from 'redux-form';
import renderField from 'components/FormInputs/renderField';
import Multiselect from 'react-widgets/lib/Multiselect'
import apiCall, { url } from "../../service"
import store from '../../index'
import swal from 'sweetalert';



const validate = values => {
  const errors = {};
  if (!values.Username) {
    errors.Username = 'Username is required'
  }

  if (!values.name) {
    errors.name = 'Name is required'
  }

  if (!values.Password) {
    errors.Password = 'Password is required';
  } else if (values.Password.length < 8) {
    errors.Password = 'Must be 8 characters or more';
  }

  if (!values.PhoneNumber) {
    errors.PhoneNumber = 'Phone number is required'
  }

  if (!values.email) {
    errors.email = 'email is required'
  }
  else if (!values.email.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}/)) {
    errors.email = 'This is not a Email format'
  }


  return errors;
}

class UserRegistration extends Component {
  constructor(props) {
    super(props);
    this.isFirstLoad = true;
    this.state = {
      message: {
        status: false,
        content: ''
      },
      station: [],
      roles: [],
      stations: [],
      stationlist: [],
      role: [],
    }
    this.fetchLookup();
  }



  fetchLookup = async () => {
    const lookup = await fetch(url + "lookup_data", {
      method: "GET",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
    let res = await lookup.json();
    let stationlist = []
    stationlist = res.stations.stations_list.map(function (item, itemIndex) {
      // stationlist.push(item.station_name);
      return {
        label: item.station_name,
        value: {
          station_id: item.station_id,
          station_name: item.station_name,
          station_code: item.station_code,
          station_address: item.station_address
        }
      };
    });

    this.setState({ stationlist: stationlist })
    let options2 = []
    options2 = res.roles.map(function (item, itemIndex) {
      return {
        label: item.name,
        value: {
          id: item.id,
          name: item.name
        }
      }
    });
    this.setState({ role: options2 })
    // this.fetchStationVaaccineData()


  }

  handleLogin = async () => {
    let values = store.getState()
    this.isFirstLoad = false;
    document.getElementsByName("name")[0].focus();
    document.getElementsByName("Username")[0].focus();
    document.getElementsByName("Password")[0].focus();
    document.getElementsByName("PhoneNumber")[0].focus();
    document.getElementsByName("email")[0].focus();

    if (values.form.user_registration.syncErrors || !this.state.roles.length || !this.state.station.length) {
      swal("Message ", "Please clear all errors ..", "error")
    } else {
      let payload = {
        name: values.form.user_registration.values.name,
        username: values.form.user_registration.values.Username,
        password: values.form.user_registration.values.Password,
        phone: values.form.user_registration.values.PhoneNumber,
        email: values.form.user_registration.values.email,
        roles: this.state.roles,
        stations: this.state.station
      }
      payload = JSON.stringify(payload);
      console.log("sdpas")
      let apiResponse = await apiCall(
        "register",
        "POST",
        payload
      );
      if (apiResponse.status_code === 200) {
        swal("Message", apiResponse.status_msg, "success")
        this.props.dispatch(reset('user_registration'));
        this.setState({ station: [], roles: [] })
      } else {
        swal("Message", apiResponse.status_msg, "error")
      }
    }
  }
  //Role details
  selectRole = async (role) => {
    try {
      let role_list = []
      role.filter((obj) => {
        role_list.push(obj.value)
      })
      this.setState({ roles: role_list });
    } catch (error) {
      console.log(error)
    }
  }

  //station details
  selectStation = async (station) => {
    try {
      let stations_list = []
      station.filter((obj) => {
        stations_list.push(obj.value)
      })
      this.setState({ station: stations_list })
    } catch (error) {
      console.log(error)
    }
  }





  render() {
    const selectedOptionsStyles = {
      color: '#3c763d',
      backgroundColor: '#dff0d8',
    };
    const optionsListStyles = {
      backgroundColor: '#fcf8e3',
      color: '#8a6d3b',
    };

    return (
      <div className="card shadow-style">
        <div className="container-fluid">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', width: '100%', height: '80vh', }}>
            <div className="card col-md-6" >
              <div className="header" style={{ textAlign: 'center', paddingTop: '0' }}>
                <h3 style={{ fontWeight: "bold" }}>USER REGISTRATION</h3>
              </div>
              <div className="content">
                <div className="form-group">
                  <div className="row">
                    <div className="col-md-6">
                      <label className="control-label">Name</label>
                      <Field
                        name="name"
                        type="text"
                        component={renderField} />
                    </div>

                  </div>
                </div>
                <div className="form-group">
                  <div className="row">
                    <div className="col-md-6">
                      <label className="control-label">Username</label>
                      <Field
                        name="Username"
                        type="text"
                        component={renderField} />
                    </div>
                    <div className="col-md-6">
                      <label className="control-label">Password</label>
                      <Field
                        name="Password"
                        type="password"
                        component={renderField} />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <div className="row">
                    <div className="col-md-6">
                      <label className="control-label">Email</label>
                      <Field
                        name="email"
                        type="email"
                        component={renderField} />
                    </div>
                    <div className="col-md-6">
                      <label className="control-label">Phone Number</label>
                      <Field
                        name="PhoneNumber"
                        type="number"
                        component={renderField} />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <div className="row" >
                    <div className="col-md-6">
                      <label className="control-label" style={{ backgroundColor: '#F5F9FC' }}>Roles</label>
                      <Multiselect
                        data={this.state.role}
                        valueField='value'
                        textField="label"
                        placeholder="Select roles"
                        onChange={value =>
                          this.selectRole(value)
                        }
                      />
                      {!this.isFirstLoad && !this.state.roles.length ? (
                        <label className="error">Please Select Roles</label>
                      ) : null}
                    </div>
                    <div className="col-md-6">
                      <label className="control-label">Stations</label>
                      <Multiselect
                        data={this.state.stationlist}
                        valueField='value'
                        textField="label"
                        placeholder="Select Station"
                        onChange={value =>
                          this.selectStation(value)
                        }
                      />

                      {!this.isFirstLoad && !this.state.station.length ? (
                        <label className="error">Please Select Station</label>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <button type="submit" onClick={this.handleLogin} className="btn btn-fill btn-primary" disabled={false}>Submit</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default reduxForm({
  form: 'user_registration',
  validate
})(UserRegistration)
