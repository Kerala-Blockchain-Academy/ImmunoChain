import React from "react";
import { Field, reduxForm, formValueSelector } from "redux-form";
import renderField from "components/FormInputs/renderField";
import DatePicker from "react-date-picker";
import store from "../../../index";
import apiCall from "../../../service";
import "./Family.css";
import { relative } from "path";
import swal from 'sweetalert';
import DropdownList from 'react-widgets/lib/DropdownList'
import 'react-widgets/dist/css/react-widgets.css'




const normalizeAadhar = (value, previousValue) => {
  if (!value) {
    return value
  }
  const onlyNums = value.replace(/[^\d]/g, '')
  if (!previousValue || value.length > previousValue.length) {
    // typing forward
    if (onlyNums.length === 4) {
      return onlyNums + ' '
    }
    if (onlyNums.length === 8) {
      return onlyNums.slice(0, 4) + ' ' + onlyNums.slice(4) + ' '
    }
  }
  if (onlyNums.length <= 4) {
    return onlyNums
  }
  if (onlyNums.length <= 8) {
    return onlyNums.slice(0, 4) + ' ' + onlyNums.slice(4)
  }
  return onlyNums.slice(0, 4) + ' ' + onlyNums.slice(4, 8) + ' ' + onlyNums.slice(8, 12)
}


const validate = values => {
  const errors = {};
  console.log(values);
  if (!values.woman_name || values.woman_name.trim() === "") {
    errors.woman_name = "This field is required";
  } else if (!values.woman_name.match(/^[A-Za-z\s]{1,}[A-Za-z\s]{0,}$/)) {
    errors.woman_name = "Special characters and numbers are not allowed";
  }
  if (!values.husband_name || values.husband_name.trim() === "") {
    errors.husband_name = "This field is required";
  } else if (!values.husband_name.match(/^[A-Za-z\s]{1,}[A-Za-z\s]{0,}$/)) {
    errors.husband_name = "Special characters and numbers are not allowed";
  }
  if (!values.address || values.address.trim() === '') {
    errors.address = "This field is required";
  } else if (!values.address.match(/^[a-zA-Z0-9\s-.,]+$/)) {
    errors.address = "Special characters are not allowed"
  }
  if (!values.phone_no) {
    errors.phone_no = "Enter a valid input";
  }
  if (!values.family_registration_number || values.family_registration_number.trim() === "") {
    errors.family_registration_number = "This field is required";
  } else if (!values.family_registration_number.match(/^[a-zA-Z0-9\s-.]+$/)) {
    errors.family_registration_number = "Special characters are not allowed"
  }
  if (values.mother_education) {
    if (!values.mother_education.match(/^[a-zA-Z0-9\s-.,]+$/) || values.mother_education.trim() === "") {
      errors.mother_education = "Special characters not allowed";
    }
  }
  if (values.unique_id) {
    if (!values.unique_id.match(/^[a-zA-Z0-9\s-.,]+$/) || values.unique_id.trim() === "") {
      errors.unique_id = "Special characters not allowed";
    }
  }
  if (!values.aadhar_id) {
    errors.aadhar_id = "This field is required";
  } else if (values.aadhar_id && /[0-9]{12}/i.test(values.aadhar_id)) {
    errors.aadhar_id = "Invalid Aadhar Number"
  }

  if (values.income) {
    if (isNaN(Number(values.income))) {
      errors.income = "Must be a number";
    }
  }

  if (values.ec_no) {
    if (!values.ec_no.match(/^[a-zA-Z0-9\s-.,]+$/) || values.ec_no.trim() === "") {
      errors.ec_no = "Special characters not allowed";
    }
  }

  // if (!values.caste || values.caste.trim()=== "") {
  //   errors.caste = "This field is required";
  // }
  if (values.bank_account_number) {
    if (isNaN(Number(values.bank_account_number))) {
      errors.bank_account_number = "Must be a number";
    }
  }

  if (values.ifsc_code) {
    if (!values.ifsc_code.match(/^[a-zA-Z0-9\s-.,]+$/) || values.ifsc_code.trim() === "") {
      errors.ifsc_code = "Special characters not allowed";
    }
  }
  if (values.category) {
    if (!values.category.match(/^[a-zA-Z0-9\s-.,]+$/) || values.category.trim() === "") {
      errors.category = "Special characters not allowed";
    }
  }

  console.log(errors);
  return errors;
};

const educationList = [
  { edu: 'PhD and Above', value: 'PhD and Above' },
  { edu: 'PG', value: 'PG' },
  { edu: 'UG', value: 'UG' },
  { edu: 'Higer Secondary or Pre-degree', value: 'Higer Secondary or Pre-degree' },
  { edu: 'Matriculation', value: 'Matriculation' },
  { edu: 'Below Matriculation', value: 'Below Matriculation' }
]

class Family extends React.Component {
  constructor(props) {
    super(props);
    console.log(this.props);
    this.isFirstLoad = true;
    this.state = {
      dates: {
        woman_dob: "",
        husband_dob: ""
      },
      viewMode: false,
      showswal: false,
      editButton: false,
      view: false,
      proceedButton: false,
      proceedButtonview: false,
      saveMode: false,
    };
    this.mainRef = React.createRef()   // Create a ref object 

  }

  componentDidMount() {
    this.intialize_data();
    this.mainRef.current.scrollIntoView();
  }

  intialize_data = async () => {
    if (this.props.history.location.state) { //check whether edit mode or not
      let body_obj = {}
      body_obj["data"] = {}
      body_obj["data"]["record_unique_id"] = this.props.history.location.state.record_unique_id
      let body = JSON.stringify(body_obj);
      let res = await apiCall("edit_beneficiary_family", "POST", body)
      console.log("res", res.family_details)
      let womanDob = res.family_details.woman_dob;
      let husbandDob = res.family_details.husband_dob;
      this.setState({ editButton: true });


      this.setState({
        dates: {
          woman_dob: new Date(womanDob.yyyy, womanDob.mm - 1, womanDob.dd),
          husband_dob: new Date(husbandDob.yyyy, husbandDob.mm - 1, husbandDob.dd),
        },
        viewMode: this.props.history.location.state.view //makes fields disabled
      });
      this.props.initialize({
        // viewMode: this.props.history.location.state.view,
        // famDetails: this.props.history.location.state.famDetails
        woman_name: res.family_details.woman_name,
        husband_name: res.family_details.husband_name,
        address: res.family_details.address,
        phone_no: res.family_details.phone_no,
        family_registration_number: res.family_details.family_registration_number,
        mother_education: res.family_details.mother_education,
        unique_id: res.family_details.unique_id,
        aadhar_id: res.family_details.aadhar_id,
        income: res.family_details.income,
        caste: res.family_details.caste,
        ec_no: res.family_details.ec_no,
        bank_account_number: res.family_details.bank_account_number,
        ifsc_code: res.family_details.ifsc_code,
        category: res.family_details.category,
        apl_bpl: res.family_details.apl_bpl
      });
    }
    else {
      this.setState({ proceedButton: true })
    }
  }

  onDateChange = (date, key) => {
    let dateToSet = this.state.dates;
    if (dateToSet) {
      dateToSet[key] = date;
      this.setState({ dates: dateToSet });
    }
    console.log(this.props.history.location.state);
  };

  convert_date_to_obj(_date) {
    var date = new Date(_date);
    //convert date to object
    console.log("date.toLocaleDateString();", date.toLocaleDateString())
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
    console.log("store", store);
    this.props.change("woman_name", "Rashmi");
    this.props.change("husband_name", "Sooraj");
    this.props.change("address", "Sreekaryam P.O, Trivandrum");
    this.props.change("phone_no", 6238212107);
    this.props.change("family_registration_number", "186AHD");
    this.props.change("mother_education", "Post Graduate");
    this.props.change("unique_id", "U765");
    this.props.change("aadhar_id", "8668 2929 2212");
    this.props.change("income", 200000);
    this.props.change("caste", "Ezhava");
    this.props.change("ec_no", "EC578865");
    this.props.change("bank_account_number", 23456790292);
    this.props.change("ifsc_code", "SBI45KZK");
    this.props.change("category", "OBC");
    this.props.change("apl_bpl", "apl");

    this.setState({
      dates: {
        woman_dob: new Date(),
        husband_dob: new Date()
      }
    });
    console.log("date", new Date(1999, 12, 12));
  }

  async registerFamily(action) {
    this.isFirstLoad = false;
    let values = store.getState();
    document.getElementsByName("woman_name")[0].focus();
    document.getElementsByName("husband_name")[0].focus();
    document.getElementsByName("address")[0].focus();
    document.getElementsByName("phone_no")[0].focus();
    document.getElementsByName("family_registration_number")[0].focus();
    document.getElementsByName("mother_education")[0].focus();
    document.getElementsByName("unique_id")[0].focus();
    document.getElementsByName("aadhar_id")[0].focus();
    document.getElementsByName("income")[0].focus();
    document.getElementsByName("caste")[0].focus();
    document.getElementsByName("ec_no")[0].focus();
    document.getElementsByName("apl_bpl")[0].focus();
    document.getElementsByName("bank_account_number")[0].focus();
    document.getElementsByName("ifsc_code")[0].focus();
    document.getElementsByName("category")[0].focus();
    document.getElementsByName("category")[0].blur();

    if (values.form.family.syncErrors) {
      console.log(values.form.family.syncErrors);
      swal("Message", "Please clear all errors ", "warning")
      // <SweetAlert
      //   show={this.state.showswal}
      //   title="Demo"
      //   text="SweetAlert in React"
      //   onConfirm={() => this.setState({ showswal: false })}
      // />
      //Alert("Please clear all errors");
    } else if (!this.state.dates.woman_dob) {
      //Alert("Please clear all errors");
    } else if (!this.state.dates.husband_dob) {
      // Alert("Please clear all errors");
    } else {

      if (!this.props.history.location.state) { //not edit mode
        let data_input = values.form.family.values;
        let payload = {};
        payload["woman_name"] = data_input.woman_name
          ? data_input.woman_name
          : "";
        payload["woman_age"] = 0;
        payload["husband_name"] = data_input.husband_name
          ? data_input.husband_name
          : "";
        payload["husband_age"] = 0;
        payload["address"] = data_input.address ? data_input.address : "";
        payload["phone_no"] = data_input.phone_no ? data_input.phone_no : 0;
        payload[
          "family_registration_number"
        ] = data_input.family_registration_number
            ? data_input.family_registration_number
            : "";
        payload["mother_education"] = data_input.mother_education
          ? data_input.mother_education
          : "";
        payload["unique_id"] = data_input.unique_id ? data_input.unique_id : "";
        payload["aadhar_id"] = data_input.aadhar_id ? data_input.aadhar_id.trim() : "";
        payload["income"] = data_input.income ? data_input.income : 0;
        payload["caste"] = data_input.caste ? data_input.caste : "";
        payload["ec_no"] = data_input.ec_no ? data_input.ec_no : "";
        payload["apl_bpl"] = data_input.apl_bpl ? data_input.apl_bpl : "";
        payload["bank_account_number"] = data_input.bank_account_number
          ? data_input.bank_account_number
          : 0;
        payload["ifsc_code"] = data_input.ifsc_code ? data_input.ifsc_code : "";
        payload["category"] = data_input.category ? data_input.category : "";

        payload["phone_no_1"] = ""; //for future purpose

        payload["woman_dob"] = this.state.dates.woman_dob
          ? this.convert_date_to_obj(this.state.dates.woman_dob)
          : "";
        payload["husband_dob"] = this.state.dates.husband_dob
          ? this.convert_date_to_obj(this.state.dates.husband_dob)
          : "";
        console.log(payload);


        payload = JSON.stringify(payload);

        let apiResponse = await apiCall("register_rch_user", "POST", payload);

        console.log(apiResponse);
        if (apiResponse.status_code === 200) {
          //success
          if (action === "goto") {
            this.props.history.push({
              pathname: "/registration/pregnancy",
              state: {
                record_unique_id: apiResponse.record_unique_id,
                woman_name: apiResponse.woman_name
              }
            });
          }
        }
        else if (apiResponse.status_code === 500) {
          swal("Message", "Internal Service Error", "error");
        }
        else if (apiResponse.status_code !== 200) {
          swal("Message", apiResponse.status_msg, "error");
        }

      }
      else if (this.props.history.location.state) { //edit mode
        console.log(this.props.history.location.state);
        let data_input = values.form.family.values;
        let payload = {};
        payload["record_unique_id"] = this.props.history.location.state.record_unique_id;
        //payload["record_pregnancy_id"] =res.family_details.record_pregnancy_id;
        payload["woman_name"] = data_input.woman_name
          ? data_input.woman_name
          : "";
        payload["woman_age"] = 0;
        payload["husband_name"] = data_input.husband_name
          ? data_input.husband_name
          : "";
        payload["husband_age"] = 0;
        payload["address"] = data_input.address ? data_input.address : "";
        payload["phone_no"] = data_input.phone_no ? data_input.phone_no : "";
        payload[
          "family_registration_number"
        ] = data_input.family_registration_number
            ? data_input.family_registration_number
            : "";
        payload["mother_education"] = data_input.mother_education
          ? data_input.mother_education
          : "";
        payload["unique_id"] = data_input.unique_id ? data_input.unique_id : "";
        payload["aadhar_id"] = data_input.aadhar_id ? data_input.aadhar_id : "";
        payload["income"] = data_input.income ? data_input.income : 0;
        payload["caste"] = data_input.caste ? data_input.caste : "";
        payload["ec_no"] = data_input.ec_no ? data_input.ec_no : "";
        payload["apl_bpl"] = data_input.apl_bpl ? data_input.apl_bpl : "";
        payload["bank_account_number"] = data_input.bank_account_number
          ? data_input.bank_account_number
          : 0;
        payload["ifsc_code"] = data_input.ifsc_code ? data_input.ifsc_code : "";
        payload["category"] = data_input.category ? data_input.category : "";

        payload["phone_no_1"] = ""; //for future purpose

        payload["woman_dob"] = this.state.dates.woman_dob
          ? this.convert_date_to_obj(this.state.dates.woman_dob)
          : "";
        payload["husband_dob"] = this.state.dates.husband_dob
          ? this.convert_date_to_obj(this.state.dates.husband_dob)
          : "";
        console.log(payload);


        payload = JSON.stringify(payload);

        let apiResponse = await apiCall("register_rch_user", "POST", payload);

        console.log(apiResponse);
        if (apiResponse.status_code === 200) {
          //success
          // this.props.history.push({
          //   pathname: "/registration/pregnancy-list",
          //   state: {
          //     record_unique_id:res.family_details.record_unique_id,
          //     pregnancy_list: apiResponse.record_rch_ids
          //   }
          // });
          if (action === "goto") {

            const data = {
              data: {
                record_unique_id: this.props.history.location.state.record_unique_id
              }
            }
            let payload = JSON.stringify(data);
            let response = await apiCall("children_data", "POST", payload)

            this.props.history.push({
              pathname: "/registration/pregnancy-list",
              state: {
                record_unique_id: this.props.history.location.state.record_unique_id,
                woman_name: values.form.family.values.woman_name,
                children_data: response
              }
            })
          }
          else {
            this.setState({
              proceedButton: true,
              proceedButtonview: true,
              view: false,
              viewMode: true
            })
            swal("Message", apiResponse.status_msg, "success");
          }
        } else if (apiResponse.status_code === 500) {
          swal("Message", "Internal Service Error", "error");
        }
        else if (apiResponse.status_code !== 200) {
          swal("Message", apiResponse.status_msg, "error");
        }
      }
    }
  }

  // viewbutton = () => {
  //   this.setState({ proceedButton: true, proceedButtonview: true, view: false, saveMode: false });
  // }

  render() {
    return (
      <div className="card shadow-style" ref={this.mainRef}>
        <div className=" content">
          <div className="row">
            <div className="header col-md-11">
              <h4 onClick={() => this.autoPopulate()}>FAMILY DETAILS</h4>
            </div>
            {this.state.editButton ? (
              <div className="header col-md-1" style={{ position: relative }}>
                <button
                  style={{ position: "absolute", marginRight: 10 }}
                  type="button"
                  className="btn btn-primary btn-fill"
                  disabled={this.state.view}
                  onClick={() => this.setState({
                    viewMode: false, saveMode: true,
                    view: true,
                    proceedButtonview: false
                  })}
                >
                  Edit
            </button>
              </div>
            ) : null}

          </div>
        </div>

        <div className="content">
          <form className="form-horizontal">
            <div className="form-group">
              <div className="col-md-6">
                <label className="control-label col-md-12">
                  Pregnant Woman Name
                </label>
                <Field
                  name="woman_name"
                  type="text"
                  component={renderField}
                  disabled={this.state.viewMode}
                // helpText="A block of help text that breaks onto a new line."
                />
              </div>

              <div className="col-md-6">
                <label className="control-label col-md-12">Husband Name</label>
                <Field
                  name="husband_name"
                  type="text"
                  component={renderField}
                  disabled={this.state.viewMode}
                />
              </div>
            </div>
            <div className="form-group">
              <div className="col-md-6">
                <label className="control-label col-md-12">
                  Pregnant Woman DOB
                </label>
                <div className="col-md-12">
                  <DatePicker
                    name="woman_dob"
                    onChange={_date => {
                      this.onDateChange(_date, "woman_dob");
                    }}
                    className="datepicker_responsive"
                    value={this.state.dates.woman_dob}
                    disabled={this.state.viewMode}
                  />
                </div>
                {!this.isFirstLoad && !this.state.dates.woman_dob ? (
                  <label className="error">Please enter date</label>
                ) : null}
              </div>
              {/* </div>

            <div className="form-group"> */}
              <div className="col-md-6">
                <label className="control-label col-md-12">Husband DOB</label>

                <div className="col-md-12">
                  <DatePicker
                    name="husband_dob"
                    onChange={_date => {
                      this.onDateChange(_date, "husband_dob");
                    }}
                    className="datepicker_responsive"
                    value={this.state.dates.husband_dob}
                    disabled={this.state.viewMode}
                  />
                </div>
                {!this.isFirstLoad && !this.state.dates.husband_dob ? (
                  <label className="error">Please enter date</label>
                ) : null}
              </div>
            </div>
            {/* ------------------------------------------------------------------ */}
            <div className="form-group">
              <div className="col-md-6">
                <label className="control-label col-md-12">Address</label>
                <Field
                  name="address"
                  type="text"
                  component={renderField}
                  disabled={this.state.viewMode}
                />
              </div>
              {/* </div>

            <div className="form-group"> */}
              <div className="col-md-6">
                <label className="control-label col-md-12">Phone Number</label>
                <Field
                  name="phone_no"
                  type="number"
                  component={renderField}
                  disabled={this.state.viewMode}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="col-md-6">
                <label className="control-label col-md-12">Aadhar ID</label>
                <Field
                  name="aadhar_id"
                  type="text"
                  component={renderField}
                  disabled={this.state.viewMode}
                  normalize={normalizeAadhar}
                />
              </div>

              <div className="col-md-6">
                <label className="control-label col-md-12">
                  Family Registration No.
                </label>
                <Field
                  name="family_registration_number"
                  type="text"
                  component={renderField}
                  disabled={this.state.viewMode}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="col-md-6">
                <label className="control-label col-md-12">Unique ID</label>
                <Field name="unique_id" type="text" component={renderField} disabled={this.state.viewMode} />
              </div>

              <div className="col-md-6">
                <label className="control-label col-md-12">
                  Mother's Education
                </label>
                <Field
                  name="mother_education"
                  type="text"
                  component={renderField}
                  disabled={this.state.viewMode}
                  data={educationList}
                  valueField="value"
                  textField="edu"
                />
                {/* <Field
                  name="mother_education"
                  component={DropdownList}
                  data={educationList}
                  valueField="value"
                  textField="edu"
                  disabled={this.state.viewMode}
                /> */}

              </div>
            </div>
            <div className="form-group">
              <div className="col-md-6">
                <label className="control-label col-md-12">IFSC</label>
                <Field name="ifsc_code" type="text" component={renderField} disabled={this.state.viewMode} />
              </div>
              <div className="col-md-6">
                <label className="control-label col-md-12">
                  Bank Account No.
                </label>
                <Field
                  name="bank_account_number"
                  type="text"
                  component={renderField}
                  disabled={this.state.viewMode}
                />
              </div>
            </div>
            <div className="form-group">
              <div className="col-md-6">
                <label className="control-label col-md-12">Caste</label>
                <Field name="caste" type="text" component={renderField} disabled={this.state.viewMode} />
              </div>
              <div className="col-md-6">
                <label className="control-label col-md-12">Category</label>
                <Field name="category" type="text" component={renderField} disabled={this.state.viewMode} />
              </div>
            </div>
            <div className="form-group">
              <div className="col-md-6">
                <label className="control-label col-md-12">Income</label>
                <Field name="income" type="text" component={renderField} disabled={this.state.viewMode} />
              </div>
              <div className="col-md-6">
                <label className="control-label col-md-12">EC No.</label>
                <Field name="ec_no" type="text" component={renderField} disabled={this.state.viewMode} />
              </div>
            </div>
            <div className="form-group">
              <div className="col-md-6">
                <label className="control-label col-md-4">Ration Card</label>
                <br />
                <br />
                <br />
                <Field
                  name="apl_bpl"
                  type="radio"
                  label="APL"
                  value="apl"
                  component={renderField}
                  disabled={this.state.viewMode}
                />
                <Field
                  name="apl_bpl"
                  type="radio"
                  label="BPL"
                  value="bpl"
                  component={renderField}
                  disabled={this.state.viewMode}
                />
              </div>
            </div>
            {this.state.editButton ? (
              <div className="row">
                <div className="col-md-1">
                  <button
                    type="button"
                    className="btn btn-primary btn-fill"
                    disabled={this.state.view}
                    onClick={() => this.setState({
                      viewMode: false, saveMode: true,
                      view: true,
                      proceedButtonview: false
                    })}
                  >
                    Edit
              </button>
                </div>
                {this.state.saveMode ? (<div className="col-md-3">
                  {/* <div className="col-md-1"> */}
                  <button
                    type="button"
                    style={{ marginRight: 10 }}
                    className="btn btn-primary btn-fill"
                    disabled={this.state.viewMode}
                    onClick={() => { this.registerFamily("save") }}
                  >
                    Save
              </button>
                  {/* </div> */}

                  {/* <div className="col-md-2"> */}
                  <button
                    type="button"
                    className="btn btn-primary btn-fill"
                    disabled={this.state.proceedButtonview}
                    onClick={() => {
                      this.intialize_data();
                      this.setState({ view: false, proceedButtonview: true, })
                    }}
                  >
                    Reset
              </button>
                  {/* </div> */}
                </div>) : null}
                {
                  this.state.editButton ? (
                    <div className="col-md-8" style={{ position: relative }}>
                      <button
                        style={{ position: "absolute", right: 0 }}
                        type="button"
                        className="btn btn-primary btn-fill"
                        disabled={this.state.view}
                        onClick={() => this.registerFamily("goto")}
                      >
                        Go to pregnancy
              </button>
                    </div>
                  ) : null
                }
              </div>
            ) :
              <button
                type="button"
                className="btn btn-primary btn-fill"
                disabled={this.state.view}
                onClick={() => this.registerFamily("goto")}
              >
                Save and Add Pregnancy Details
              </button>}
          </form>
        </div>
      </div>

    );
  }
}

Family = reduxForm({
  form: 'family', // a unique identifier for this form
  validate
})(Family)

// const selector = formValueSelector('Family') // <-- same as form name

// Family = connect(state => {
//   // can select values individually
//   const value = selector(state, 'mother_education')
//   console.log("jjjjjjjj:", (value))

//   // const favoriteColorValue = selector(state, 'favoriteColor')
//   // or together as a group
//   // const { firstName, lastName } = selector(state, 'firstName', 'lastName')
//   // return {
//   // hasEmailValue,
//   // value,
//   // fullName: `${firstName || ''} ${lastName || ''}`
//   // }
// })(Family)


export default Family;


// export default reduxForm({
//   form: "family",
//   validate
// })(Family);
