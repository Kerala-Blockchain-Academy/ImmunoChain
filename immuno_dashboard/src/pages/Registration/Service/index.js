import React from "react";
import { Field, reduxForm } from "redux-form";
import renderField from "components/FormInputs/renderField";
import DatePicker from "react-date-picker";
import QR from "../QR";
import store from "../../../index";
import apiCall from "../../../service";
import Alert from 'sweetalert-react';
import Select from 'react-select';
import swal from 'sweetalert';


const validate = values => {
  const errors = {};
  console.log(values);
  if (values.icds) {
    if (!values.icds.match(/^[a-zA-Z0-9\s-.,]+$/) || values.icds.trim() === "") {
      errors.icds = "Special characters not allowed";
    }
  }
  if (!values.anganwadi_centre || values.anganwadi_centre.trim() === "") {
    errors.anganwadi_centre = "This field is required";
  } else if (!values.anganwadi_centre.match(/^[a-zA-Z0-9\s-]+$/)) {
    errors.anganwadi_centre = "Special characters not allowed";
  }
  if (!values.anganwadi_worker || values.anganwadi_worker.trim() === "") {
    errors.anganwadi_worker = "This field is required";
  } else if (!values.anganwadi_worker.match(/^[a-zA-Z0-9\s-]+$/)) {
    errors.anganwadi_worker = "Special characters not allowed"
  }
  if (!values.anganwadi_phone) {
    errors.anganwadi_phone = "Enter a valid input";
  }
  if (!values.health_centre || values.health_centre.trim() === "") {
    errors.health_centre = "This field is required";
  } else if (!values.health_centre.match(/^[a-zA-Z0-9\s-]+$/)) {
    errors.health_centre = "Special characters not allowed"
  }
  if (!values.sub_centre || values.sub_centre.trim() === "") {
    errors.sub_centre = "This field is required";
  } else if (!values.sub_centre.match(/^[a-zA-Z0-9\s-]+$/)) {
    errors.sub_centre = "Special characters not allowed"
  }
  if (!values.asha || values.asha.trim() === "") {
    errors.asha = "This field is required";
  } else if (!values.asha.match(/^[a-zA-Z0-9\s-]+$/)) {
    errors.asha = "Special characters not allowed"
  }
  if (!values.asha_phone) {
    errors.asha_phone = "Enter a valid input";
  }
  if (!values.jphn || values.jphn.trim() === "") {
    errors.jphn = "This field is required";
  } else if (!values.jphn.match(/^[a-zA-Z0-9\s-]+$/)) {
    errors.jphn = "Special characters not allowed"
  }
  if (!values.jphn_phone) {
    errors.jphn_phone = "Enter a valid input";
  }
  if (values.hospital_for_delivery) {
    if (!values.hospital_for_delivery.match(/^[a-zA-Z0-9\s-.,]+$/) || values.hospital_for_delivery.trim() === "") {
      errors.hospital_for_delivery = "Special characters not allowed";
    }
  }
  if (values.hospital_address) {
    if (!values.hospital_address.match(/^[a-zA-Z0-9\s-.,]+$/) || values.hospital_address.trim() === "") {
      errors.hospital_address = "Special characters not allowed";
    }
  }
  if (values.birth_companion) {
    if (!values.birth_companion.match(/^[a-zA-Z0-9\s-.,]+$/) || values.birth_companion.trim() === "") {
      errors.birth_companion = "Special characters not allowed";
    }
  }
  if (values.transportation_arrangement) {
    if (!values.transportation_arrangement.match(/^[a-zA-Z0-9\s-.,]+$/) || values.transportation_arrangement.trim() === "") {
      errors.transportation_arrangement = "Special characters not allowed";
    }
  }
  if (values.anganwadi_registration_number) {
    if (!values.anganwadi_registration_number.match(/^[a-zA-Z0-9\s-.,]+$/) || values.anganwadi_registration_number.trim() === "") {
      errors.anganwadi_registration_number = "Special characters not allowed";
    }
  }
  if (values.sub_centre_registration_number) {
    if (!values.sub_centre_registration_number.match(/^[a-zA-Z0-9\s-.,]+$/) || values.sub_centre_registration_number.trim() === "") {
      errors.sub_centre_registration_number = "Special characters not allowed";
    }
  }

  console.log(errors);
  return errors;
};

class Service extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dates: {
        date_of_first_registration: ""
      },
      message: {
        status: false,
        content: ''
      },
      qr: false,
      stations: [],
      station: '',
      isedit: true,
      service_provider_id: ''
    };
    this.scrollPoint = null;
    this.isFirstLoad = true;

    this.mainRef = React.createRef()   // Create a ref object 


  }

  alert_function = (message) => {
    this.setState({
      message: {
        status: true,
        content: message
      }
    })
    setTimeout(() => {
      this.setState({
        message: {
          status: false,
          content: ''
        }
      })
    }, 2000);
  }


  async componentDidMount() {
    this.mainRef.current.scrollIntoView();


    console.log(this.props.history.location.state);
    if (this.props.history.location.state) {
      if (this.props.history.location.state.record_pregnancy_id) {
        this.props.initialize({    //fetch record unique id from family registration section
          record_pregnancy_id: this.props.history.location.state.record_pregnancy_id
        });
      }
      if (this.props.history.location.state.edit) {//check whether edit mode or not
        if (this.props.history.location.state.service_data) {
          let service_provider_id = this.props.history.location.state.service_data.record_service_id ?
            this.props.history.location.state.service_data.record_service_id : "";
          let dateOfFirstRegistration = this.props.history.location.state.service_data.date_of_first_registration ;
          this.setState({
            dates:
            {
              date_of_first_registration: dateOfFirstRegistration ? new Date(dateOfFirstRegistration.yyyy, dateOfFirstRegistration.mm - 1, dateOfFirstRegistration.dd):null,
            },
            station: this.props.history.location.state.service_data.nearest_station ?
              this.props.history.location.state.service_data.nearest_station : [],
            service_provider_id: service_provider_id
          });
          console.log("this.state.dates",this.state.dates)

          this.props.initialize({    //set data to fields
            record_pregnancy_id: this.props.history.location.state.record_pregnancy_id,
            icds: this.props.history.location.state.service_data.icds,
            anganwadi_centre: this.props.history.location.state.service_data.anganwadi_centre,
            anganwadi_worker: this.props.history.location.state.service_data.anganwadi_worker,
            anganwadi_phone: this.props.history.location.state.service_data.anganwadi_phone,
            health_centre: this.props.history.location.state.service_data.health_centre,
            sub_centre: this.props.history.location.state.service_data.sub_centre,
            asha: this.props.history.location.state.service_data.asha,
            asha_phone: this.props.history.location.state.service_data.asha_phone,
            jphn_phone: this.props.history.location.state.service_data.jphn_phone,
            jphn: this.props.history.location.state.service_data.jphn,
            hospital_for_delivery: this.props.history.location.state.service_data.hospital_for_delivery,
            hospital_address: this.props.history.location.state.service_data.hospital_address,
            birth_companion: this.props.history.location.state.service_data.birth_companion,
            transportation_arrangement: this.props.history.location.state.service_data.transportation_arrangement,
            anganwadi_registration_number: this.props.history.location.state.service_data.anganwadi_registration_number,
            sub_centre_registration_number: this.props.history.location.state.service_data.sub_centre_registration_number
          });
        }
      }
    }
    console.log("this.state.station", this.state.station)
    let api_response = await apiCall(
      "lookup_data",
      "GET",
      ""
    );
    let options1 = api_response.stations.stations_list.map(function (item, itemIndex) {
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
    this.setState({ stations: options1 })

  }

  onDateChange = (date, key) => {
    var dateToSet = this.state.dates;
    dateToSet[key] = date;
    this.setState({ dates: dateToSet });
    console.log(this.state);
  };

  convert_date_to_obj(_date) {
    var date = new Date(_date);
    //convert date to object
    var date_string = date.toLocaleDateString('en-GB');
    _date = date_string.split('/');
    var date_obj = {};
    date_obj["yyyy"] = _date[2];
    date_obj["mm"] = _date[1];
    date_obj["dd"] = _date[0];
    return date_obj;
  }

  autoPopulate() {
    this.props.change("icds", "ICDS6886");
    this.props.change("anganwadi_centre", "Kazhakoottam");
    this.props.change("anganwadi_worker", "Anganwadi Worker");
    this.props.change("anganwadi_phone", 9533234096);
    this.props.change("health_centre", "Trivandrum");
    this.props.change("sub_centre", "Kazhakoottam");
    this.props.change("asha", "Remya");
    this.props.change("asha_phone", 9234567754);
    this.props.change("jphn", "Sushma");
    this.props.change("jphn_phone", 95764488764);
    this.props.change("hospital_for_delivery", "Government Hospital");
    this.props.change("hospital_address", "Medical College, Uloor, Trivamdrum");
    this.props.change("birth_companion", "Mother");
    this.props.change("transportation_arrangement", "Ambulance");
    this.props.change("anganwadi_registration_number", "AWD863");
    this.props.change("sub_centre_registration_number", "SCH643");

    this.setState({
      dates: {
        date_of_first_registration: new Date()
      },
      station: {
        station_address: "Kazhakuttam",
        station_code: "ST1",
        station_id: "1",
        station_name: "sub station 1 ,Kazhakuttam"
      }
    });
  }

  async registerService() {
    this.isFirstLoad = false;
    let values = store.getState();
    document.getElementsByName("icds")[0].focus();
    document.getElementsByName("anganwadi_centre")[0].focus();
    document.getElementsByName("anganwadi_worker")[0].focus();
    document.getElementsByName("anganwadi_phone")[0].focus();
    document.getElementsByName("health_centre")[0].focus();
    document.getElementsByName("sub_centre")[0].focus();
    document.getElementsByName("asha")[0].focus();
    document.getElementsByName("asha_phone")[0].focus();
    document.getElementsByName("jphn")[0].focus();
    document.getElementsByName("jphn_phone")[0].focus();
    document.getElementsByName("hospital_for_delivery")[0].focus();
    document.getElementsByName("hospital_address")[0].focus();
    document.getElementsByName("birth_companion")[0].focus();
    document.getElementsByName("transportation_arrangement")[0].focus();
    document.getElementsByName("anganwadi_registration_number")[0].focus();
    document.getElementsByName("sub_centre_registration_number")[0].focus();
    document.getElementsByName("sub_centre_registration_number")[0].blur();

    if (values.form.service.syncErrors) {
      console.log(values.form.service.syncErrors);
      //this.alert_function("Please clear all errors or select nearest station");
      swal("Message", "Please clear all errors ", "warning")
    } else {
      if (this.props.history.location.state.edit && this.state.service_provider_id) { //edit
        this.setState({ isedit: false })
        let data_input = values.form.service.values;
        let payload = {};
        payload[
          "record_service_id"
        ] = this.state.service_provider_id;
        payload[
          "record_pregnancy_id"
        ] = this.props.history.location.state.record_pregnancy_id;

        payload["icds"] = data_input.icds ? data_input.icds : "";
        payload["anganwadi_centre"] = data_input.anganwadi_centre
          ? data_input.anganwadi_centre
          : "";
        payload["anganwadi_worker"] = data_input.anganwadi_worker
          ? data_input.anganwadi_worker
          : "";
        payload["anganwadi_phone"] = data_input.anganwadi_phone
          ? data_input.anganwadi_phone
          : 0;
        payload["health_centre"] = data_input.health_centre
          ? data_input.health_centre
          : "";
        payload["sub_centre"] = data_input.sub_centre
          ? data_input.sub_centre
          : "";
        payload["asha"] = data_input.asha ? data_input.asha : "";
        payload["asha_phone"] = data_input.asha_phone
          ? data_input.asha_phone
          : 0;
        payload["jphn"] = data_input.jphn ? data_input.jphn : "";
        payload["jphn_phone"] = data_input.jphn_phone
          ? data_input.jphn_phone
          : 0;
        payload["hospital_for_delivery"] = data_input.hospital_for_delivery
          ? data_input.hospital_for_delivery
          : "";
        payload["hospital_address"] = data_input.hospital_address
          ? data_input.hospital_address
          : "";
        payload["birth_companion"] = data_input.birth_companion
          ? data_input.birth_companion
          : "";
        payload[
          "transportation_arrangement"
        ] = data_input.transportation_arrangement
            ? data_input.transportation_arrangement
            : "";
        payload["referrals"] = data_input.referrals ? data_input.referrals : "";
        payload[
          "anganwadi_registration_number"
        ] = data_input.anganwadi_registration_number
            ? data_input.anganwadi_registration_number
            : "";
        payload[
          "sub_centre_registration_number"
        ] = data_input.sub_centre_registration_number
            ? data_input.sub_centre_registration_number
            : "";
        console.log("this.state.station", this.state.station)
        payload[
          "nearest_station"
        ] = this.state.station
            ? this.state.station
            : null;
        payload["registered_for_pmmvy"] = true;
        payload["first_financial_aid"] = true;
        payload["second_financial_aid"] = false;
        payload["third_financial_aid"] = false;

        payload["date_of_first_registration"] = this.state.dates
          .date_of_first_registration
          ? this.convert_date_to_obj(this.state.dates.date_of_first_registration)
          : { yyyy: "2099", mm: "12", dd: "31" };

        console.log(payload);
        payload = JSON.stringify(payload);
        let apiResponse = await apiCall(
          "register_service_provider",
          "POST",
          payload
        );

        console.log("apiResponse", apiResponse);
        if (apiResponse.status_code === 200) {
          //success
          swal("Message", apiResponse.status_msg, "success");

          // this.alert_function(apiResponse.status_msg)
          this.setState({ qr: true });
          if (this.scrollPoint) {
            this.scrollPoint.scrollIntoView();
          }
        }
        else if (apiResponse.status_code === 500) {
          swal("Message", "Internal Service Error", "error");
        }
        else if (apiResponse.status_code !== 200) {
          swal("Message", apiResponse.status_msg, "error");
        }

      }
      else {
        let data_input = values.form.service.values;
        let payload = {};
        console.log(this.props.history.location.state.record_pregnancy_id)
        payload[
          "record_pregnancy_id"
        ] = this.props.history.location.state.record_pregnancy_id;

        payload["icds"] = data_input.icds ? data_input.icds : "";
        payload["anganwadi_centre"] = data_input.anganwadi_centre
          ? data_input.anganwadi_centre
          : "";
        payload["anganwadi_worker"] = data_input.anganwadi_worker
          ? data_input.anganwadi_worker
          : "";
        payload["anganwadi_phone"] = data_input.anganwadi_phone
          ? data_input.anganwadi_phone
          : 0;
        payload["health_centre"] = data_input.health_centre
          ? data_input.health_centre
          : "";
        payload["sub_centre"] = data_input.sub_centre
          ? data_input.sub_centre
          : "";
        payload["asha"] = data_input.asha ? data_input.asha : "";
        payload["asha_phone"] = data_input.asha_phone
          ? data_input.asha_phone
          : 0;
        payload["jphn"] = data_input.jphn ? data_input.jphn : "";
        payload["jphn_phone"] = data_input.jphn_phone
          ? data_input.jphn_phone
          : 0;
        payload["hospital_for_delivery"] = data_input.hospital_for_delivery
          ? data_input.hospital_for_delivery
          : "";
        payload["hospital_address"] = data_input.hospital_address
          ? data_input.hospital_address
          : "";
        payload["birth_companion"] = data_input.birth_companion
          ? data_input.birth_companion
          : "";
        payload[
          "transportation_arrangement"
        ] = data_input.transportation_arrangement
            ? data_input.transportation_arrangement
            : "";
        payload["referrals"] = data_input.referrals ? data_input.referrals : "";
        payload[
          "anganwadi_registration_number"
        ] = data_input.anganwadi_registration_number
            ? data_input.anganwadi_registration_number
            : "";
        payload[
          "sub_centre_registration_number"
        ] = data_input.sub_centre_registration_number
            ? data_input.sub_centre_registration_number
            : "";
        payload[
          "nearest_station"
        ] = this.state.station
            ? this.state.station
            : [];

        payload["registered_for_pmmvy"] = true;
        payload["first_financial_aid"] = true;
        payload["second_financial_aid"] = false;
        payload["third_financial_aid"] = false;

        payload["date_of_first_registration"] = this.state.dates
          .date_of_first_registration
          ? this.convert_date_to_obj(this.state.dates.date_of_first_registration)
          : { yyyy: "2099", mm: "12", dd: "31" };

        console.log(payload);
        payload = JSON.stringify(payload);
        let apiResponse = await apiCall(
          "register_service_provider",
          "POST",
          payload
        );

        console.log("apiResponse", apiResponse);
        if (apiResponse.status_code === 200) {
          //success
          this.setState({ qr: true });
          if (this.scrollPoint) {
            this.scrollPoint.scrollIntoView();
          }
        }
        else if (apiResponse.status_code === 500) {
          swal("Message", "Internal Service Error", "error");
        }
        else if (apiResponse.status_code !== 200) {
          swal("Message", apiResponse.status_msg, "error");
        }
      }


    }
  }


  render() {
    return (
      <div className="card shadow-style" ref={this.mainRef}>
        <div className="header">
          <h4 onClick={() => this.autoPopulate()}>Service Provider Details</h4>
        </div>
        <div className="content">
          <form className="form-horizontal">
            <div className="form-group">
              <div className="col-md-4">
                <label className="control-label col-md-12">Record Pregnancy Id</label>
                <Field
                  name="record_pregnancy_id"
                  type="text"
                  component={renderField}
                  disabled={true}
                // helpText="A block of help text that breaks onto a new line."
                />
              </div>
              <div className="col-md-4">
                <label className="control-label col-md-12">ICDS</label>
                <Field name="icds" type="text" component={renderField} />
              </div>
            </div>

            <div className="form-group">
              <div className="col-md-4">
                <label className="control-label col-md-12">
                  Anganwadi Registration Number
                </label>
                <Field
                  name="anganwadi_registration_number"
                  type="text"
                  component={renderField}
                />
              </div>
              <div className="col-md-3">
                <label className="control-label col-md-12">
                  Anganwadi Centre
                </label>
                <Field
                  name="anganwadi_centre"
                  type="text"
                  component={renderField}
                />
              </div>
              <div className="col-md-3">
                <label className="control-label col-md-12">
                  Anganwadi Worker
                </label>
                <Field
                  name="anganwadi_worker"
                  type="text"
                  component={renderField}
                />
              </div>

              <div className="col-md-2">
                <label className="control-label col-md-12">
                  Anganwadi Phone
                </label>
                <Field
                  name="anganwadi_phone"
                  type="number"
                  component={renderField}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="col-md-4">
                <label className="control-label col-md-12">Health Centre</label>
                <Field
                  name="health_centre"
                  type="text"
                  component={renderField}
                />
              </div>
              <div className="col-md-4">
                <label className="control-label col-md-12">Sub Centre</label>
                <Field name="sub_centre" type="text" component={renderField} />
              </div>
              <div className="col-md-4">
                <label className="control-label col-md-12">
                  Sub Centre registration Number
                </label>
                <Field
                  name="sub_centre_registration_number"
                  type="text"
                  component={renderField}
                />
              </div>
            </div>
            <div className="form-group"></div>

            <div className="form-group">
              <div className="col-md-3">
                <label className="control-label col-md-12">Asha Worker</label>
                <Field name="asha" type="text" component={renderField} />
              </div>

              <div className="col-md-3">
                <label className="control-label col-md-12">
                  Asha worker Phone Number
                </label>
                <Field name="asha_phone" type="number" component={renderField} />
              </div>
              <div className="col-md-3">
                <label className="control-label col-md-12">JPHN</label>
                <Field name="jphn" type="text" component={renderField} />
              </div>

              <div className="col-md-3">
                <label className="control-label col-md-12">JPHN Phone</label>
                <Field
                  name="jphn_phone"
                  type="number"
                  component={renderField}
                />
              </div>
            </div>

            <div className="form-group"></div>

            <div className="form-group">
              <div className="col-md-6">
                <label className="control-label col-md-12">
                  Hospital For Delivery
                </label>
                <Field
                  name="hospital_for_delivery"
                  type="text"
                  component={renderField}
                />
              </div>
              <div className="col-md-6">
                <label className="control-label col-md-12">
                  Hospital Address
                </label>
                <Field
                  name="hospital_address"
                  type="text"
                  component={renderField}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="col-md-6">
                <label className="control-label col-md-12">
                  Birth Companion
                </label>
                <Field
                  name="birth_companion"
                  type="text"
                  component={renderField}
                />
              </div>

              <div className="col-md-6">
                <label className="control-label col-md-12">
                  Transportation Arrangement
                </label>
                <Field
                  name="transportation_arrangement"
                  type="text"
                  component={renderField}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="col-md-6">
                <label className="control-label col-md-12">
                  Date of first registration
                </label>

                <DatePicker
                  onChange={_date => {
                    this.onDateChange(_date, "date_of_first_registration");
                  }}
                  format="dd-MM-y"
                  value={this.state.dates.date_of_first_registration}
                  className="pull-right react-date-picker"
                  maxDate={new Date()}
                />
                {/* {!this.isFirstLoad &&
                  !this.state.dates.date_of_first_registration ? (
                    <label className="pull-right error">Please enter date</label>
                  ) : null} */}
              </div>
              <div className="col-md-6">
                <label className="control-label col-md-12">
                  Nearest Station
                </label>
                <Select
                  styles={{ backgroundcolor: "white-bg" }}
                  defaultValue={{ label: "Select one", value: 0 }}
                  options={this.state.stations}
                  onChange={e => {
                    console.log("e.value", e.value)
                    this.setState({ station: e.value });
                  }}
                  value={this.state.stations.find(op => {
                    return op.value.station_id === this.state.station.station_id
                  })}
                />
                {/* {!this.isFirstLoad &&
                  !this.state.station ? (
                    <label className="error">Please Select Nearest Station</label>
                  ) : null} */}
              </div>
            </div>

            <div>
              <button
                type="button"
                className="btn btn-primary btn-fill"
                onClick={() => {
                  this.registerService();
                }}
              >
                Submit
              </button>
            </div>
          </form>
          <div
            ref={element => {
              this.scrollPoint = element;
            }}
          >
            {this.state.qr ? (
              <QR rch_id={this.props.history.location.state.record_pregnancy_id} />
            ) : null}
          </div>
        </div>
        <Alert
          title="Alert!"
          show={this.state.message.status}
          text={this.state.message.content}
          onConfirm={() => this.setState({ message: { status: false } })}
        />
      </div>
    );
  }
}
export default reduxForm({
  form: "service",
  validate
})(Service);
