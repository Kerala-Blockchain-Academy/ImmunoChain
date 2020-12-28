import React from "react";
import { Field, reduxForm } from "redux-form";
import renderField from "components/FormInputs/renderField";
import store from "../../index";
import apiCall from "../../service";

class SearchForm extends React.Component {
  constructor(props) {
    super(props);
    this.fetch_details = this.fetch_details.bind(this);
  }

  componentDidMount = async () => {
    let values = window.sessionStorage.getItem("value");
    let payload = {};
    if (values) {
      console.log("search back", values)
      let data_input = JSON.parse(values);
      this.props.initialize({
        womanName: data_input.womanName,
        husbandName: data_input.husbandName,
        phoneNo: data_input.phoneNo
      })
      payload["name"] = data_input ? data_input.womanName
        ? "%" + data_input.womanName + "%"
        : "" : "";
      payload["husband_name"] = data_input ? data_input.husbandName
        ? "%" + data_input.husbandName + "%"
        : "" : "";
      payload["phone_no"] = data_input ? data_input.phoneNo
        ? "%" + data_input.phoneNo + "%"
        : "" : "";
      payload = JSON.stringify(payload);

      let searchResult = await apiCall("search_family_data", "POST", payload);
      console.log(searchResult);

      // setTimeout(function () {
      this.props.pointer.render_items(searchResult["family_details"], "Search Result");
      // }, 1000)

    }
    else {
      console.log("recent")
      payload["name"] = "";
      payload["husband_name"] = "";
      payload["phone_no"] = "";
      payload = JSON.stringify(payload);

      let searchResult = await apiCall("search_family_data", "POST", payload);
      console.log(searchResult);
      this.props.pointer.render_items(searchResult["family_details"], "Recent Registrations");


    }
    // this.props.pointer.setState({
    //   display: false
    // });
  }


  async fetch_details() {
    let values = store.getState();
    console.log("dhasohdiahs", values.form.searchForm.values)
    window.sessionStorage.setItem("value", JSON.stringify(values.form.searchForm.values));
    let data_input = values.form.searchForm.values;
    let payload = {};
    payload["name"] = data_input ? data_input.womanName
      ? "%" + data_input.womanName + "%"
      : "" : "";
    payload["husband_name"] = data_input ? data_input.husbandName
      ? "%" + data_input.husbandName + "%"
      : "" : "";
    payload["phone_no"] = data_input ? data_input.phoneNo
      ? "%" + data_input.phoneNo + "%"
      : "" : "";
    payload = JSON.stringify(payload);

    this.props.pointer.setState({
      display: false
    });
    let searchResult = await apiCall("search_family_data", "POST", payload);
    console.log(searchResult);

    this.props.pointer.render_items(searchResult["family_details"], "Search Result");
  }
  render() {
    return (
      <div className="container-fluid">
        <div className="card shadow-style">
          <div className="header" style={{ textAlign: "center" }}>
            <h4>Search Form</h4>
          </div>
          <div className="content">
            <div className="form-horizontal">
              <div className="form-group">
                <label className="control-label col-md-3">Woman's Name</label>
                <div className="col-md-9">
                  <Field name="womanName" type="text" component={renderField} />
                </div>
              </div>

              <div className="form-group">
                <label className="control-label col-md-3">Husband's Name</label>
                <div className="col-md-9">
                  <Field
                    name="husbandName"
                    type="text"
                    component={renderField}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="control-label col-md-3">Phone No:</label>
                <div className="col-md-9">
                  <Field
                    name="phoneNo"
                    type="number"
                    placeholder="Without country code."
                    component={renderField}
                  />
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <button
                  onClick={this.fetch_details}
                  className="btn btn-primary btn-fill btn-wd"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default reduxForm({
  form: "searchForm"
})(SearchForm);
