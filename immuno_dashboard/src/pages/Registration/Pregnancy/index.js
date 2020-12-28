import React from "react";
import { Field, reduxForm } from "redux-form";
import renderField from "components/FormInputs/renderField";
import DatePicker from "react-date-picker";
import Select from 'react-select';
import store from "../../../index";
import apiCall from "../../../service";
import Alert from "sweetalert";
import swal from 'sweetalert';

import VaccineDetails from '../Child_details'

const options = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  //{ value: 'Oth', label: 'Others' }
]

const validate = values => {
  const errors = {};
  console.log(values);

  if (values.drivers_number) {
    if (isNaN(Number(values.drivers_number))) {
      errors.drivers_number = "Must be a number";
    }
  }
  if (!values.phone_no) {
    errors.phone_no = "This field is required";
  }
  if (!values.blood_group || values.blood_group.trim() === "") {
    errors.blood_group = "This field is required";
  }
  if (values.rsby_reg_number) {
    if (!values.rsby_reg_number.match(/^[a-zA-Z0-9\s-.,]+$/) || values.rsby_reg_number.trim() === "") {
      errors.rsby_reg_number = "Special characters not allowed";
    }
  }
  if (values.jsy_reg_number) {
    if (!values.jsy_reg_number.match(/^[a-zA-Z0-9\s-.,]+$/) || values.jsy_reg_number.trim() === "") {
      errors.jsy_reg_number = "Special characters not allowed";
    }
  }
  if (values.gravida) {
    if (isNaN(Number(values.gravida))) {
      errors.gravida = "Must be a number";
    }
  }
  if (values.para) {
    if (isNaN(Number(values.para))) {
      errors.para = "Must be a number";
    }
  }
  if (values.no_of_live_children) {
    if (isNaN(Number(values.no_of_live_children))) {
      errors.no_of_live_children = "Must be a number";
    }
  }
  if (values.no_of_abortions) {
    if (isNaN(Number(values.no_of_abortions))) {
      errors.no_of_abortions = "Must be a number";
    }
  }
  if (values.important_findings) {
    if (values.important_findings.trim() === "" || !values.important_findings.match(/^[a-zA-Z0-9\s-.,']+$/)) {
      errors.important_findings = "Special characters not allowed";
    }
  }
  if (values.complication_details) {
    if (values.complication_details.trim() === "" || !values.complication_details.match(/^[a-zA-Z0-9\s-.,']+$/)) {
      errors.complication_details = "Special characters not allowed";
    }
  }
  if (values.heart_complications) {
    if (values.heart_complications.trim() === "" || !values.heart_complications.match(/^[a-zA-Z0-9\s-.,']+$/)) {
      errors.heart_complications = "Special characters not allowed";
    }
  }
  if (values.advice) {
    if (values.advice.trim() === "" || !values.advice.match(/^[a-zA-Z0-9\s-.,']+$/)) {
      errors.advice = "Special characters not allowed";
    }
  }
  if (values.referrals) {
    if (values.referrals.trim() === "" || !values.referrals.match(/^[a-zA-Z0-9\s-.,']+$/)) {
      errors.referrals = "Special characters not allowed";
    }
  }
  if (values.contraceptive_methods_used) {
    if (values.contraceptive_methods_used.trim() === "" || !values.contraceptive_methods_used.match(/^[a-zA-Z0-9\s-.,]+$/)) {
      errors.contraceptive_methods_used = "Special characters not allowed";
    }
  }
  if (values.rh_category) {
    if (values.rh_category.trim() === "" || !values.rh_category.match(/^[a-zA-Z0-9\s-.,']+$/)) {
      errors.rh_category = "Special characters not allowed";
    }
  }
  if (values.previous_delivery) {
    if (values.previous_delivery.trim() === "" || !values.previous_delivery.match(/^[a-zA-Z0-9\s-.,']+$/)) {
      errors.previous_delivery = "Special characters not allowed";
    }
  }

  console.log(errors);
  return errors;
};

class Pregnancy extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dates: {
        menstruation_date: "",
        expected_delivery_date: "",
        last_delivery_date: "",
        tt1_date: "",
        tt2_date: "",
        usg1_date: "",
        usg2_date: "",
        usg3_date: "",
        child_dob: ""
      },
      stations: [],
      station: [],
      vaccines: {},
      children_array: [],
      vaccinepicker: [],
      vaccine_data: [],
      vaccinepick: [],
      child_array: [],
      editButton: false,
      gender: '',
      open: false,
      name_of_child: '',

    };
    this.isFirstLoad = true;
    this.mainRef = React.createRef()   // Create a ref object 
  }

  componentDidMount() {
    this.mainRef.current.scrollIntoView();

    if (this.props.history.location.state) {
      console.log("location.state", this.props.history.location.state)
      if (this.props.history.location.state.record_unique_id) {
        this.props.initialize({    //fetch record unique id from family registration section 
          //for first registration
          record_unique_id: this.props.history.location.state.record_unique_id,
          woman_name: this.props.history.location.state.woman_name
        });
      }
      if (this.props.history.location.state.edit) {//check whether edit mode or not
        let expectedDeliveryDate = this.props.history.location.state.pregnancyDetails.expected_delivery_date;
        let menstrationDate = this.props.history.location.state.pregnancyDetails.menstruation_date;
        let lastDeliveryDate = this.props.history.location.state.pregnancyDetails.last_delivery_date;
        let tt1Date = this.props.history.location.state.pregnancyDetails.tt1_date;
        let tt2Date = this.props.history.location.state.pregnancyDetails.tt2_date;
        let usg1Date = this.props.history.location.state.pregnancyDetails.usg1_date;
        let usg2Date = this.props.history.location.state.pregnancyDetails.usg2_date;
        let usg3Date = this.props.history.location.state.pregnancyDetails.usg3_date;
        let child_array = []
        if (this.props.history.location.state.pregnancyDetails.child_data) {
          this.props.history.location.state.pregnancyDetails.child_data.map((obj) => {
            child_array.push(obj)
          })
          this.setState({ children_array: child_array })
        }

        this.setState({

          dates: {
            expected_delivery_date: expectedDeliveryDate? new Date(expectedDeliveryDate.yyyy, expectedDeliveryDate.mm - 1, expectedDeliveryDate.dd):null,
            menstruation_date:menstrationDate? new Date(menstrationDate.yyyy, menstrationDate.mm - 1, menstrationDate.dd):null,
            last_delivery_date: lastDeliveryDate?new Date(lastDeliveryDate.yyyy, lastDeliveryDate.mm - 1, lastDeliveryDate.dd):null,
            tt1_date:tt1Date? new Date(tt1Date.yyyy, tt1Date.mm - 1, tt1Date.dd):null,
            tt2_date:tt2Date? new Date(tt2Date.yyyy, tt2Date.mm - 1, tt2Date.dd):null,
            usg1_date:usg1Date? new Date(usg1Date.yyyy, usg1Date.mm - 1, usg1Date.dd):null,
            usg2_date:usg2Date? new Date(usg2Date.yyyy, usg2Date.mm - 1, usg2Date.dd):null,
            usg3_date:usg3Date? new Date(usg3Date.yyyy, usg3Date.mm - 1, usg3Date.dd):null,
          }
        });
        console.log("datesdates",this.state.dates)

        this.props.initialize({
          // viewMode: this.props.history.location.state.view,
          // famDetails: this.props.history.location.state.famDetails
          record_unique_id: this.props.history.location.state.pregnancyDetails.record_unique_id,
          woman_name: this.props.history.location.state.woman_name,
          phone_no: this.props.history.location.state.pregnancyDetails.phone_no,
          drivers_number: this.props.history.location.state.pregnancyDetails.drivers_number,
          blood_group: this.props.history.location.state.pregnancyDetails.blood_group,
          rsby_reg_number: this.props.history.location.state.pregnancyDetails.rsby_reg_number,
          jsy_reg_number: this.props.history.location.state.pregnancyDetails.jsy_reg_number,
          gravida: this.props.history.location.state.pregnancyDetails.gravida,
          para: this.props.history.location.state.pregnancyDetails.para,
          no_of_live_children: this.props.history.location.state.pregnancyDetails.no_of_live_children,
          name_of_child: this.props.history.location.state.pregnancyDetails.child_data.name,
          no_of_abortions: this.props.history.location.state.pregnancyDetails.no_of_abortions,
          important_findings: this.props.history.location.state.pregnancyDetails.important_findings,
          complication_details: this.props.history.location.state.pregnancyDetails.complication_details,
          heart_complications: this.props.history.location.state.pregnancyDetails.heart_complications,
          advice: this.props.history.location.state.pregnancyDetails.advice,
          referrals: this.props.history.location.state.pregnancyDetails.referrals,
          contraceptive_methods_used: this.props.history.location.state.pregnancyDetails.contraceptive_methods_used,
          rh_category: this.props.history.location.state.pregnancyDetails.rh_category,
          previous_delivery: this.props.history.location.state.pregnancyDetails.previous_delivery,
        });
      }
    }
  }

  onDateChange = (date, key) => {
    var dateToSet = this.state.dates;
    dateToSet[key] = date;
    this.setState({ dates: dateToSet });
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
    console.log("this.props", this.props);

    this.props.change("phone_no", 9738392819);
    this.props.change("drivers_number", 838399291);
    this.props.change("blood_group", "A");
    this.props.change("rsby_reg_number", "RS7479");
    this.props.change("jsy_reg_number", "JS1283");
    this.props.change("gravida", 2);
    this.props.change("para", 1);
    this.props.change("no_of_live_children", 1);
    this.props.change("no_of_abortions", 0);
    this.props.change("important_findings", "Decrease in baby's movement");
    this.props.change("complication_details", "None");
    this.props.change("heart_complications", "None");
    this.props.change("advice", "Dont miss vaccinations");
    this.props.change("referrals", "None");
    this.props.change("contraceptive_methods_used", "None");
    this.props.change("rh_category", "Positive");
    this.props.change("previous_delivery", "Normal");
    this.setState({
      dates: {
        menstruation_date: new Date(),
        last_delivery_date: new Date(),
        expected_delivery_date: new Date(),
        tt1_date: new Date(),
        tt2_date: new Date(),
        usg1_date: new Date(),
        usg2_date: new Date(),
        usg3_date: new Date()
      }
    });
  }

  async registerPregnancy() {
    this.isFirstLoad = false;
    let values = store.getState();
    document.getElementsByName("phone_no")[0].focus();
    document.getElementsByName("drivers_number")[0].focus();
    document.getElementsByName("blood_group")[0].focus();
    document.getElementsByName("rsby_reg_number")[0].focus();
    document.getElementsByName("jsy_reg_number")[0].focus();
    document.getElementsByName("gravida")[0].focus();
    document.getElementsByName("para")[0].focus();
    document.getElementsByName("no_of_live_children")[0].focus();
    document.getElementsByName("no_of_abortions")[0].focus();
    document.getElementsByName("important_findings")[0].focus();
    document.getElementsByName("complication_details")[0].focus();
    document.getElementsByName("heart_complications")[0].focus();
    document.getElementsByName("advice")[0].focus();
    document.getElementsByName("referrals")[0].focus();
    document.getElementsByName("contraceptive_methods_used")[0].focus();
    document.getElementsByName("rh_category")[0].focus();
    document.getElementsByName("previous_delivery")[0].focus();
    document.getElementsByName("submitButton")[0].focus();
    document.getElementsByName("submitButton")[0].blur();


    if (values.form.pregnancy.syncErrors) {
      console.log(values.form.pregnancy.syncErrors);
      // Alert("Please clear all errors");
      swal("Message", "Please clear all errors ", "warning")
    }
    // }
    else {
      if (this.props.history.location.state.record_unique_id) { //not edit mode
        let data_input = values.form.pregnancy.values;
        let payload = { child_data: [] };
        payload[
          "record_unique_id"
        ] = this.props.history.location.state.record_unique_id;

        payload["drivers_number"] = data_input.drivers_number
          ? data_input.drivers_number
          : 0;
        payload["phone_no"] = data_input.phone_no ? data_input.phone_no : "";
        payload["blood_group"] = data_input.blood_group
          ? data_input.blood_group
          : "";
        payload["rsby_reg_number"] = data_input.rsby_reg_number
          ? data_input.rsby_reg_number
          : "";
        payload["jsy_reg_number"] = data_input.jsy_reg_number
          ? data_input.jsy_reg_number
          : "";
        payload["gravida"] = data_input.gravida ? data_input.gravida : 0;
        payload["para"] = data_input.para ? data_input.para : 0;
        payload["no_of_live_children"] = data_input.no_of_live_children
          ? data_input.no_of_live_children
          : 0;
        payload["no_of_abortions"] =
          data_input.no_of_abortions || data_input.no_of_abortions == 0
            ? data_input.no_of_abortions
            : 0;
        payload["important_findings"] = data_input.important_findings
          ? data_input.important_findings
          : "";
        payload["complication_details"] = data_input.complication_details
          ? data_input.complication_details
          : "";
        payload["heart_complications"] = data_input.heart_complications
          ? data_input.heart_complications
          : "";
        payload["advice"] = data_input.advice ? data_input.advice : "";
        payload["referrals"] = data_input.referrals ? data_input.referrals : "";
        payload[
          "contraceptive_methods_used"
        ] = data_input.contraceptive_methods_used
            ? data_input.contraceptive_methods_used
            : "";
        payload["rh_category"] = data_input.rh_category
          ? data_input.rh_category
          : "";
        payload["previous_delivery"] = data_input.previous_delivery
          ? data_input.previous_delivery
          : "";

        payload["menstruation_date"] = this.state.dates.menstruation_date
          ? this.convert_date_to_obj(this.state.dates.menstruation_date)
          : { yyyy: "2099", mm: "12", dd: "31" };
        payload["expected_delivery_date"] = this.state.dates
          .expected_delivery_date
          ? this.convert_date_to_obj(this.state.dates.expected_delivery_date)
          : { yyyy: "2099", mm: "12", dd: "31" };
        payload["last_delivery_date"] = this.state.dates.last_delivery_date
          ? this.convert_date_to_obj(this.state.dates.last_delivery_date)
          : { yyyy: "2099", mm: "12", dd: "31" };
        payload["tt1_date"] = this.state.dates.tt1_date
          ? this.convert_date_to_obj(this.state.dates.tt1_date)
          : { yyyy: "2099", mm: "12", dd: "31" };
        payload["tt2_date"] = this.state.dates.tt2_date
          ? this.convert_date_to_obj(this.state.dates.tt2_date)
          : { yyyy: "2099", mm: "12", dd: "31" };
        payload["usg1_date"] = this.state.dates.usg1_date
          ? this.convert_date_to_obj(this.state.dates.usg1_date)
          : { yyyy: "2099", mm: "12", dd: "31" };
        payload["usg2_date"] = this.state.dates.usg2_date
          ? this.convert_date_to_obj(this.state.dates.usg2_date)
          : { yyyy: "2099", mm: "12", dd: "31" };
        payload["usg3_date"] = this.state.dates.usg3_date
          ? this.convert_date_to_obj(this.state.dates.usg3_date)
          : { yyyy: "2099", mm: "12", dd: "31" };
        payload["child_data"] = this.state.children_array;
        console.log(payload);

        payload = JSON.stringify(payload);
        let apiResponse = await apiCall("register_pregnancy", "POST", payload);

        console.log(apiResponse);
        if (apiResponse.status_code === 200) {
          //success
          this.props.history.push({
            pathname: "/registration/service",
            state: {
              record_rch_id: apiResponse.record_rch_id,
              record_pregnancy_id: apiResponse.record_pregnancy_id
            }
          });
        }
        else if (apiResponse.status_code === 500) {
          swal("Message", "Internal Service Error", "error");
        }
        else if (apiResponse.status_code !== 200) {
          swal("Message", apiResponse.status_msg, "error");
        }

      }
      else if (this.props.history.location.state.edit) { //edit mode
        this.setState({ editButton: true })
        let data_input = values.form.pregnancy.values;
        let payload = { child_data: [] };

        payload[
          "record_unique_id"
        ] = this.props.history.location.state.pregnancyDetails.record_unique_id;

        payload[
          "record_pregnancy_id"
        ] = this.props.history.location.state.record_pregnancy_id;

        payload["drivers_number"] = data_input.drivers_number
          ? data_input.drivers_number
          : 0;
        payload["phone_no"] = data_input.phone_no ? data_input.phone_no : 0;
        payload["blood_group"] = data_input.blood_group
          ? data_input.blood_group
          : "";
        payload["rsby_reg_number"] = data_input.rsby_reg_number
          ? data_input.rsby_reg_number
          : "";
        payload["jsy_reg_number"] = data_input.jsy_reg_number
          ? data_input.jsy_reg_number
          : "";
        payload["gravida"] = data_input.gravida ? data_input.gravida : 0;
        payload["para"] = data_input.para ? data_input.para : 0;
        payload["no_of_live_children"] = data_input.no_of_live_children
          ? data_input.no_of_live_children
          : 0;
        payload["no_of_abortions"] =
          data_input.no_of_abortions || data_input.no_of_abortions == 0
            ? data_input.no_of_abortions
            : 0;
        payload["important_findings"] = data_input.important_findings
          ? data_input.important_findings
          : "";
        payload["complication_details"] = data_input.complication_details
          ? data_input.complication_details
          : "";
        payload["heart_complications"] = data_input.heart_complications
          ? data_input.heart_complications
          : "";
        payload["advice"] = data_input.advice ? data_input.advice : "";
        payload["referrals"] = data_input.referrals ? data_input.referrals : "";
        payload[
          "contraceptive_methods_used"
        ] = data_input.contraceptive_methods_used
            ? data_input.contraceptive_methods_used
            : "";
        payload["rh_category"] = data_input.rh_category
          ? data_input.rh_category
          : "";
        payload["previous_delivery"] = data_input.previous_delivery
          ? data_input.previous_delivery
          : "";

        payload["menstruation_date"] = this.state.dates.menstruation_date
          ? this.convert_date_to_obj(this.state.dates.menstruation_date)
          : { yyyy: "2099", mm: "12", dd: "31" };
        payload["expected_delivery_date"] = this.state.dates
          .expected_delivery_date
          ? this.convert_date_to_obj(this.state.dates.expected_delivery_date)
          : { yyyy: "2099", mm: "12", dd: "31" };
        payload["last_delivery_date"] = this.state.dates.last_delivery_date
          ? this.convert_date_to_obj(this.state.dates.last_delivery_date)
          : { yyyy: "2099", mm: "12", dd: "31" };
        payload["tt1_date"] = this.state.dates.tt1_date
          ? this.convert_date_to_obj(this.state.dates.tt1_date)
          : { yyyy: "2099", mm: "12", dd: "31" };
        payload["tt2_date"] = this.state.dates.tt2_date
          ? this.convert_date_to_obj(this.state.dates.tt2_date)
          : { yyyy: "2099", mm: "12", dd: "31" };
        payload["usg1_date"] = this.state.dates.usg1_date
          ? this.convert_date_to_obj(this.state.dates.usg1_date)
          : { yyyy: "2099", mm: "12", dd: "31" };
        payload["usg2_date"] = this.state.dates.usg2_date
          ? this.convert_date_to_obj(this.state.dates.usg2_date)
          : { yyyy: "2099", mm: "12", dd: "31" };
        payload["usg3_date"] = this.state.dates.usg3_date
          ? this.convert_date_to_obj(this.state.dates.usg3_date)
          : { yyyy: "2099", mm: "12", dd: "31" };

        //   let child_data = this.state.children_array
        //    child_data={
        //     dob: this.state.dates.child_dob ? this.convert_date_to_obj(this.state.dates.child_dob) : "",
        //     rch_id:this.props.history.location.state.rchId,
        // }

        payload["child_data"] = this.state.children_array;
        let py = JSON.stringify(payload);
        console.log(py)
        let apiResponse = await apiCall("register_pregnancy", "POST", py);

        console.log(apiResponse);
        if (apiResponse.status_code === 200) { //fetch service provider data
          let body_obj_service = {}
          body_obj_service["data"] = {}
          body_obj_service["data"]["record_pregnancy_id"] = this.props.history.location.state.record_pregnancy_id
          let service_payload = JSON.stringify(body_obj_service)
          let serviceProviderRes = await apiCall("edit_service_provider", "POST", service_payload);
          this.props.history.push({
            pathname: "/registration/service", //to edit
            state: {
              edit: true,
              record_pregnancy_id: apiResponse.record_pregnancy_id,
              record_rch_id: this.props.history.location.state.rchId,
              service_data: serviceProviderRes.service_provider_details
            }
          });
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

  toggle = () => {
    let arr = this.state.children_array
    arr.push({
      rch_id: '',
      name: '',
      dob: { yyyy: '2019', mm: '01', dd: '11' },
      gender: '',
      deleted: "false"
    })
    this.setState({
      children_array: arr
    });
  }


  handlechange = (value, obj_atr, index) => {
    let child_arr = []
    child_arr = this.state.children_array
    if (obj_atr === "deleted") {
      swal({
        title: "Are you sure?",
        text: "Once deleted, Child will delete permanently",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
        .then((willDelete) => {
          if (willDelete) {
            swal("Poof! Child details has been deleted!", {
              icon: "success",
            });
            child_arr[index][obj_atr] = "true"
            this.setState({
              children_array: child_arr
            })
          } else {
            swal("Your Child details is safe!");
          }
        });
    }
    else {
      child_arr[index][obj_atr] = value
      console.log(child_arr)
      this.setState({
        children_array: child_arr
      })
    }
  }

  render() {
    return (
      <div className="card shadow-style" ref={this.mainRef}>
        <div className="header">
          <h4 onClick={() => this.autoPopulate()}>PREGNANCY DETAILS</h4>
        </div>
        <div className="content">
          <form className="form-horizontal">
            <div className="form-group">
              <div className="col-md-3">
                <label className="control-label col-md-12">
                  Pregnant Woman Name
                </label>
                <Field
                  name="woman_name"
                  type="text"
                  component={renderField}
                  disabled={true}
                // helpText="A block of help text that breaks onto a new line."
                />
              </div>
              <div className="col-md-3">
                <label className="control-label col-md-12">
                  Record Unique ID
                </label>
                <Field
                  name="record_unique_id"
                  type="text"
                  component={renderField}
                  disabled={true}
                // helpText="A block of help text that breaks onto a new line."
                />
              </div>
              <div className="col-md-3">
                <label className="control-label col-md-12">
                  Ambulance phone No.
                </label>
                <Field
                  name="drivers_number"
                  type="text"
                  component={renderField}
                />
              </div>
            </div>
            <div className="form-group">
              <div className="col-md-3">
                <label className="control-label col-md-12">
                  Phone No.
                  </label>
                <Field
                  name="phone_no"
                  type="number"
                  component={renderField}
                />
              </div>
              <div className="col-md-3">
                <label className="control-label col-md-12">
                  RSBY Registration No.
                  </label>
                <Field
                  name="rsby_reg_number"
                  type="text"
                  component={renderField}
                />
              </div>

              <div className="col-md-3">
                <label className="control-label col-md-12">
                  JSY Registration No.
                  </label>
                <Field
                  name="jsy_reg_number"
                  type="text"
                  component={renderField}
                />
              </div>
            </div>
            <div className="form-group"></div>

            <div className="form-group">
              <div className="col-md-3">
                <label className="control-label col-md-12">
                  Menstruation Date
                  </label>
                <DatePicker
                  onChange={_date => {
                    this.onDateChange(_date, "menstruation_date");
                  }}
                  className="pull-right"
                  value={this.state.dates.menstruation_date}
                />
                {/* {!this.isFirstLoad && !this.state.dates.menstruation_date ? (
                  <label className="error">Please enter date</label>
                ) : null} */}
              </div>

              <div className="col-md-3">
                <label className="control-label col-md-12">
                  Expected Delivery Date
                  </label>
                <DatePicker
                  onChange={_date => {
                    this.onDateChange(_date, "expected_delivery_date");
                  }}
                  className="pull-right"
                  value={this.state.dates.expected_delivery_date}
                />
                {/* {!this.isFirstLoad &&
                  !this.state.dates.expected_delivery_date ? (
                    <label className="error">Please enter date</label>
                  ) : null} */}
              </div>

              <div className="col-md-3">
                <label className="control-label col-md-12">
                  Last Delivery Date
                  </label>
                <DatePicker
                  onChange={_date => {
                    this.onDateChange(_date, "last_delivery_date");
                  }}
                  className="pull-right"
                  value={this.state.dates.last_delivery_date}
                />
                {/* {!this.isFirstLoad && !this.state.dates.last_delivery_date ? (
                  <label className="error">Please enter date</label>
                ) : null} */}
              </div>
            </div>

            <div className="form-group">
              <div className="col-md-3">
                <label className="control-label col-md-12">
                  Number of live children
                  </label>
                <Field
                  name="no_of_live_children"
                  type="text"
                  component={renderField}
                />
              </div>

              <div className="col-md-3">
                <label className="control-label col-md-12">
                  Number of abortions
                  </label>
                <Field
                  name="no_of_abortions"
                  type="text"
                  component={renderField}
                />
              </div>

              <div className="col-md-3">
                <label className="control-label col-md-12">
                  Previous Delivery Type
                  </label>
                <Field
                  name="previous_delivery"
                  type="text"
                  component={renderField}
                />
              </div>
              <div className="col-md-3">
                <label className="control-label col-md-12">
                  Contraceptive Methods Used{" "}
                </label>
                <Field
                  name="contraceptive_methods_used"
                  type="text"
                  component={renderField}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="col-md-3">
                <label className="control-label col-md-12">Gravida</label>
                <Field name="gravida" type="text" component={renderField} />
              </div>

              <div className="col-md-3">
                <label className="control-label col-md-12">Para</label>
                <Field name="para" type="text" component={renderField} />
              </div>
              <div className="col-md-3">
                <label className="control-label col-md-12">Blood Group</label>
                <Field
                  name="blood_group"
                  type="text"
                  component={renderField}
                />
              </div>
              <div className="col-md-3">
                <label className="control-label col-md-12">RH Factor</label>
                <Field
                  name="rh_category"
                  type="text"
                  component={renderField}
                />
              </div>
            </div>

            <div className="form-group"></div>

            <div className="form-group">
              <div className="col-md-3">
                <label className="control-label col-md-12">USG-1 Date</label>
                <DatePicker
                  onChange={_date => {
                    this.onDateChange(_date, "usg1_date");
                  }}
                  className="pull-right"
                  value={this.state.dates.usg1_date}
                />
                {/* {!this.isFirstLoad && !this.state.dates.usg1_date ? (
                  <label className="error">Please enter date</label>
                ) : null} */}
              </div>
              <div className="col-md-3">
                <label className="control-label col-md-12">USG-2 Date</label>
                <DatePicker
                  onChange={_date => {
                    this.onDateChange(_date, "usg2_date");
                  }}
                  className="pull-right"
                  value={this.state.dates.usg2_date}
                />
                {/* {!this.isFirstLoad && !this.state.dates.usg2_date ? (
                  <label className="error">Please enter date</label>
                ) : null} */}
              </div>
              <div className="col-md-3">
                <label className="control-label col-md-12">USG-3 Date</label>
                <DatePicker
                  onChange={_date => {
                    this.onDateChange(_date, "usg3_date");
                  }}
                  className="pull-right"
                  value={this.state.dates.usg3_date}
                />
                {/* {!this.isFirstLoad && !this.state.dates.usg3_date ? (
                  <label className="error">Please enter date</label>
                ) : null} */}
              </div>
            </div>

            <div className="form-group">
            </div>
            <div className="form-group">
              <div className="col-md-4">
                <label className="control-label col-md-12">
                  Important Findings
                  </label>
                <Field
                  name="important_findings"
                  type="textarea"
                  rows={4}
                  component={renderField}
                />
              </div>
              <div className="col-md-4">
                <label className="control-label col-md-12">
                  Complication details if any
                  </label>
                <Field
                  name="complication_details"
                  type="textarea"
                  rows={4}
                  component={renderField}
                />
              </div>
              <div className="col-md-4">
                <label className="control-label col-md-12">
                  Heart Complications if any
                  </label>
                <Field
                  name="heart_complications"
                  type="textarea"
                  rows={4}
                  component={renderField}
                />
              </div>
            </div>
            <div className="form-group">
              <div className="col-md-6">
                <label className="control-label col-md-12">Advice</label>
                <Field
                  name="advice"
                  type="textarea"
                  rows={4}
                  component={renderField}
                />
              </div>
              <div className="col-md-6">
                <label className="control-label col-md-12">Referrals</label>
                <Field
                  name="referrals"
                  type="textarea"
                  rows={4}
                  component={renderField}
                />
              </div>
            </div>

            {/* <div className="cart"> */}
            <div style={{ margin: 10 }}>
              <button className="btn btn-fill btn-secondary" type="button" onClick={(e) => this.toggle()}>
                Add Child
       </button>
            </div>

            {this.state.children_array.map((obj, index) => {

              return (
                obj.deleted === "true" ? (null) :
                  <div className="card">

                    <div className="container" style={{ width: '100%' }}>

                      <div className="header col-lg-10 col-md-10 col-sm-10">

                        <h4>Child Details</h4>
                      </div>
                      <div className="col-lg-2  col-md-2 col-sm-2">
                        <button type="button" rel="tooltip"
                          title="" className="btn btn-danger btn-simple btn-icon pull-right" data-original-title="Remove Post"
                          onClick={() => this.handlechange(" ", "deleted", index)}>
                          <i className="fa fa-times"></i>
                        </button>
                      </div>
                      {/* </div> */}
                      <div className="row">
                        <div className="col-md-4">
                          <label className="control-label col-md-12 col-sm-12">Child Name</label>
                          <input type="text" name="name" className="form-control"
                            style={{ float: 'right', width: '100%' }}
                            value={obj.name}
                            // value = {this.state.name_of_child}
                            onChange={e => {
                              this.handlechange(e.target.value, "name", index);
                            }}
                          />
                        </div>
                        <div className="col-md-4" >
                          <label className="control-label col-md-12 col-sm-12">Child Date of birth</label>
                          <div>
                            {/* {this.state.dates.child_dob ?(
                <DatePicker
                maxDate= {new Date()}
                onChange={_date => {
                  this.handlechange(this.convert_date_to_obj(_date), "dob", index);
                  this.onDateChange(_date, "child_dob")
                }}
                className="datepicker_responsive"
                value={this.state.dates.child_dob}
                
              />
              ):  */}
                            <DatePicker
                              maxDate={new Date()}
                              onChange={_date => {
                                this.handlechange(this.convert_date_to_obj(_date), "dob", index);
                                console.log("this.convert_date_to_obj(_date)", this.convert_date_to_obj(_date))
                              }}
                              className=" date datepicker_responsive"
                              value={new Date(obj.dob.yyyy, obj.dob.mm - 1, obj.dob.dd)}
                            />
                          </div>
                        </div>
                        <div className="col-md-4 col-sm-4">
                          <label className="control-label col-md-12 col-sm-12">Gender</label>
                          <Select
                            style={{ height: 34 }}
                            defaultValue={{ label: "Select one", value: 0 }}
                            options={options}
                            onChange={e => {
                              this.handlechange(e.value, "gender", index);
                              this.setState({ gender: e.value });
                            }}
                            value={options.find(op => {
                              return op.value === obj.gender
                            })}
                          />
                        </div>
                      </div>
                    </div>
                    <VaccineDetails rch_id={obj.rch_id} />
                  </div>
              )
            })
            }
            <div>
              <button
                name="submitButton"
                type="button"
                className="btn btn-primary btn-fill"
                onClick={() => {

                  this.registerPregnancy();
                }}
              >
                Save and Add Service Provider Details
                </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
export default reduxForm({
  form: "pregnancy",
  validate
})(Pregnancy);

