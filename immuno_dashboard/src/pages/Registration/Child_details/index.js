import React from "react";
import { reduxForm } from "redux-form";
import DatePicker from "react-date-picker";
import apiCall from "../../../service";
import { Card, CardBody } from 'reactstrap';
import swal from 'sweetalert';
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCaretDown } from '@fortawesome/free-solid-svg-icons'
import { faCaretUp } from '@fortawesome/free-solid-svg-icons'







const validate = values => {
  const errors = {};
  if (!values.rch_details) {
    errors.rch_details = 'Invalid RCH ID'
  }

  if (!values.childname) {
    errors.childname = 'child name is required'
  }


  return errors;
};


class child_details extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rch_details: {},
      stations: [],
      vaccines: {},
      vaccinepicker: [],
      vaccine_data: [],
      vaccinepick: [],
      dates: {},
      selected_stations: {},
      batch_id_given: {},
      is_edit: {},
      is_open: {},
      is_table: {},
      show: false
    };

  }

  async componentDidMount() {
    let vaccines = {};
    let vaccAge = []

    let api_response = await apiCall(
      "lookup_data",
      "GET",
      "");
    console.log(api_response);
    if (api_response.status_code == 200) {
      var datas = api_response.vaccines.vaccine.map(function (item, itemIndex) {
        vaccines[item.age] = item.vaccines;
        vaccAge.push(item.age)
        return {
          label: item.age,
          value: itemIndex,
          key: item.age
        };
      });
      this.setState({ vaccinepicker: datas, vaccines: vaccines });
      this.setState({ stations: api_response.stations.stations_list });
    }

    console.log("rchid=", this.props.rch_id)
    if (this.props.rch_id) {
      let Rch_id = this.props.rch_id
      let rch_details = await apiCall("child_vaccine_api?rch_id=" + Rch_id, "GET", "");

      this.setState({ rch_details: rch_details.data })
      // console.log("rch_details.data=", rch_details.data)
      let vaccineIds = this.state.vaccinepicker;
      let vaccines1 = this.state.vaccines;
      var data = [];
      let vaccTak = {};
      let vaccMiss = {};
      let vaccTakArr = {};
      let vaccMissArr = {};
      if (rch_details) {
        if (Object.keys(rch_details.data['all_vaccinations']).length || Object.keys(rch_details.data['missed_vaccinations']).length) {
          this.setState({ show: true })
          vaccineIds.map((item, index) => {
            console.log(item);
            if (rch_details.data.all_vaccinations[item.label] != undefined) {

              vaccTakArr[item.label] = []
              vaccMissArr[item.label] = []

              console.log("1234=", vaccines1[item.label])

              vaccines1[item.label].map(vaccitem => {
                // console.log(rch_details.data.all_vaccinations[item.label][vaccitem]);
                if (rch_details.data.all_vaccinations[item.label][vaccitem] != undefined) {
                  vaccTak[vaccitem] = {
                    current_date: rch_details.data.all_vaccinations[item.label][vaccitem].current_date ? this.date_change(
                      rch_details.data.all_vaccinations[item.label][vaccitem].current_date
                    ) : "",
                    eligible_date: rch_details.data.all_vaccinations[item.label][vaccitem].eligible_date ? this.date_change(
                      rch_details.data.all_vaccinations[item.label][vaccitem].eligible_date
                    ) : "",
                    batch_id: rch_details.data.all_vaccinations[item.label][vaccitem].batch_id ? rch_details.data.all_vaccinations[item.label][vaccitem].batch_id : "",
                    station: rch_details.data.all_vaccinations[item.label][vaccitem].station ? rch_details.data.all_vaccinations[item.label][vaccitem].station : ""
                  };
                  vaccTakArr[item.label].push(vaccitem)

                }
                // else if (rch_details.data.missed_vaccinations[item.label][vaccitem] != undefined) {

                //console.log("error",rch_details.missed_vaccinations[item.label])
                // rch_details.missed_vaccinations;

                // console.log("erroe",rch_details.missed_vaccinations[item.label]+rch_details.missed_vaccinations[item.label][vaccitem])
                console.log(item.label, vaccitem)
                // console.log(rch_details.data.missed_vaccinations)
                if (rch_details.data.missed_vaccinations[item.label]) {
                  if (rch_details.data.missed_vaccinations[item.label][vaccitem]) {
                    console.log("before:", item.label, vaccitem)
                    vaccMiss[vaccitem] = {
                      current_date: rch_details.data.missed_vaccinations[item.label][vaccitem] ? this.date_change(
                        rch_details.data.missed_vaccinations[item.label][vaccitem].current_date
                      ) : "",
                      eligible_date: rch_details.data.missed_vaccinations[item.label][vaccitem] ? this.date_change(
                        rch_details.data.missed_vaccinations[item.label][vaccitem].eligible_date
                      ) : "",
                      reason:
                        rch_details.data.missed_vaccinations[item.label][vaccitem] ? rch_details.data.missed_vaccinations[item.label][vaccitem].reason : ""
                    };
                  }
                }
                vaccMissArr[item.label].push(vaccitem)
                // }
              });

              data.push({
                label: item.label,
                value: item.label,
                key: index
              });
            }
          });
        }
      }

      const vaccine = {}
      vaccine["vaccTak"] = vaccTak;
      vaccine["vaccMiss"] = vaccMiss;
      vaccine["vaccTakArray"] = vaccTakArr;
      vaccine["vaccMissArray"] = vaccMissArr;
      console.log("datass=", data)
      console.log(vaccine);
      this.setState({ vaccine_data: vaccine, vaccinepick: data });
    }
    console.log("gashghjags:", this.state.vaccinepick);
  }
  date_change(date) {
    if (date != null) {
      let value = date.mm + "-" + date.dd + "-" + date.yyyy;
      return value;
    } else return null;
  }

  convert_date_to_obj(_date) {
    //convert date to object
    var date_obj = {};
    date_obj["yyyy"] = _date.getFullYear();
    date_obj["mm"] = _date.getMonth() + 1;
    date_obj["dd"] = _date.getDate();
    return date_obj;
  }


  async saveChildVaccine(vaccine, age, j, i) {
    // console.log("pling");
    console.log(this.state.dates["current_date" + j + i]);
    console.log(this.state.batch_id_given["" + j + i]);
    console.log(this.state.selected_stations["" + j + i]);
    console.log(this.props.rch_id);

    if (this.state.dates["current_date" + j + i]) {

      let payload = {
        "Age": {},
        "BeneficiaryId": this.props.rch_id,
        "BeneficiaryIdType": "RCH",
        "GeoLocation": {
          "latitude": 0.0,
          "longitude": 0.0,
        },

        "nextDate": {},
        "currentDate": this.convert_date_to_obj(this.state.dates["current_date" + j + i]),
        "station_other": this.state.selected_stations["" + j + i] ? this.state.selected_stations["" + j + i] : {},
      }

      let vaccine_struct = {};
      vaccine_struct[vaccine] = {
        "vaccine_batch_id": "",
        "vaccine_package_id": this.state.batch_id_given["" + j + i] ? this.state.batch_id_given["" + j + i] : "",
      }

      payload.Age[age] = vaccine_struct;
      // payload_struct.Age[]

      var administration_response = await apiCall("api/immunization", "POST", JSON.stringify(payload));
      console.log(administration_response);

      if (administration_response.status_code === 200) {
        swal("VACCINE ADDED", "", "success");
        let editToSet = this.state.is_edit;
        editToSet["" + j + i] = false
        this.setState({ is_edit: editToSet })
        console.log(this.state.is_edit)
      }
      else {
        swal("Something went wong", "", "error");
      }

    }
    else {
      swal("Please enter administered date", "", "warning")
      let editToSet = this.state.is_edit;
      editToSet["" + j + i] = false
      this.setState({ is_edit: editToSet })
      console.log(this.state.is_edit)
    }
  }

  changeEditState = (j, i) => {
    let editToSet = this.state.is_edit;
    editToSet["" + j + i] = true
    this.setState({ is_edit: editToSet })
    console.log(this.state.is_edit)
  }

  batchIdOnChange = (j, i, value) => {
    let batchToSet = this.state.batch_id_given;
    batchToSet["" + j + i] = value;
    this.setState({ batch_id_given: batchToSet })
  }
  stationOnChange = (j, i, value) => {
    let stationToSet = this.state.selected_stations;
    stationToSet["" + j + i] = JSON.parse(value);
    this.setState({ selected_stations: stationToSet })
    console.log(this.state.selected_stations);
  }
  onDateChange = (date, key) => {
    var dateToSet = this.state.dates;
    dateToSet[key] = date;
    this.setState({ dates: dateToSet });
    console.log(this.state);
  };
  onCollapse = (j) => {
    let openToSet = Object.assign({}, this.state.is_open);
    openToSet[j] = !openToSet[j];
    console.log("open:", openToSet[j]);

    let tableToSet = Object.assign({}, this.state.is_table);
    tableToSet[j] = !tableToSet[j];
    console.log("close:", tableToSet[j]);


    if (openToSet[j] === tableToSet[j]) {
      if (tableToSet[j]) {
        console.error("open")
        this.setState({ is_table: tableToSet });
        setTimeout(() => {
          this.setState({ is_open: openToSet });
          console.log("transition open done");
        }, 150);

      }
      else {
        console.error("close");
        this.setState({ is_open: openToSet });

        setTimeout(() => {
          this.setState({ is_table: tableToSet });
          console.log("transition close done");
        }, 250)
      }
    }
  }

  renderRow(row, age, j, i) {
    console.log("alskdjghh:", this.state.vaccine_data.vaccTak[row]);
    console.log(this.state.vaccine_data.vaccTak[row].eligible_date);

    return (

      <tr>
        <td>{row}</td>
        <td>{this.state.vaccine_data.vaccTak[row].eligible_date ? <td>{this.state.vaccine_data.vaccTak[row].eligible_date}</td> :
          null
        }
        </td>
        <td>
          {this.state.vaccine_data.vaccTak[row].current_date ? <td>{this.state.vaccine_data.vaccTak[row].current_date}</td> :
            <DatePicker
              name={"current_date" + j + i}
              onChange={_date => {
                this.onDateChange(_date, "current_date" + j + i);
              }}
              className="datepicker_responsive"
              value={this.state.dates["current_date" + j + i]}
              disabled={!this.state.is_edit["" + j + i]}
            />
          }
        </td>
        <td>{this.state.vaccine_data.vaccTak[row].batch_id ?
          this.state.vaccine_data.vaccTak[row].batch_id === "ExternalPackageID" ? "--" :
            this.state.vaccine_data.vaccTak[row].batch_id :
          <input onChange={
            (e) => this.batchIdOnChange(j, i, e.target.value)} disabled={!this.state.is_edit["" + j + i]}></input>}</td>
        <td>{this.state.vaccine_data.vaccTak[row].batch_id ?
          this.state.vaccine_data.vaccTak[row].station.station_name === "External Station" ? "--" :
            this.state.vaccine_data.vaccTak[row].station.station_name :
          <select name="state" className="col-md-2 form-control selectpicker"
            onChange={(e) => this.stationOnChange(j, i, e.target.value)}
            disabled={!this.state.is_edit["" + j + i]}
          >
            <option disabled selected value> ---Select an option--- </option>
            {
              this.state.stations.map((obj) => {
                console.log(obj)
                return (<option value={JSON.stringify(obj)} >{obj.station_name}</option>)
              })
            }
          </select>}
        </td>
        {this.state.is_edit["" + j + i] ? <td>{this.state.vaccine_data.vaccTak[row].batch_id ?
          null : <button type="button" className="btn btn-fill btn-success" onClick={() => this.saveChildVaccine(row, age, j, i)}>Save</button>}</td> :
          <td>{this.state.vaccine_data.vaccTak[row].batch_id ?
            null : <button type="button" className="btn btn-fill btn-primary" onClick={() => this.changeEditState(j, i)}> Edit </button>}</td>}
      </tr>
    );
  }

  missedrenderRow(row, index) {
    console.log(row);
    console.log(this.state.vaccine_data.vaccMiss[row]);
    return (

      <tr>
        <td>{row}</td>
        <td>{this.state.vaccine_data.vaccMiss[row].current_date}</td>
        <td>{this.state.vaccine_data.vaccMiss[row].reason}</td>
        <td>{this.state.vaccine_data.vaccMiss[row].eligible_date}</td>
      </tr>

    );
  }

  render() {
    console.log(this.state.vaccine_data.vaccMissArray);
    console.log(this.state.rch_details);

    return (

      <form className="form-horizontal" style={{ marginTop: 10 }}>
        {this.state.show ? (
          <div className="card ">
            <div className="form-group">
              {/* <div className="container-fluid"> */}
              {Object.keys(this.state.rch_details.missed_vaccinations).length !== 0 ?
                <div className="container-fluid">
                  <Card style={{ backgroundColor: '#FFECEC', borderColor: '#FF1902', width: '50%' }}>
                    <CardBody>
                      <h4 className="control-label col-md-12" style={{ textAlign: "center", fontWeight: "bold" }}>
                        Missed Vaccination Details
                      </h4>
                      <div>
                        {
                          this.state.vaccinepick.map((itemAge) => {
                            return (
                              <div>
                                {this.state.rch_details.missed_vaccinations[itemAge.label] ? Object.keys(this.state.rch_details.missed_vaccinations[itemAge.label]).length > 0 ?

                                  <div>
                                    <th>
                                      Vaccine Missing Age : {itemAge.label}
                                    </th>
                                    <table className="table table-hover" >
                                      <thead>

                                        <tr>
                                          <th>Vaccine</th>
                                          <th>Vaccination Missed Date</th>
                                          <th>Reason</th>
                                          <th>Next Vaccination Date</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {this.state.vaccine_data.vaccMissArray[itemAge.value].map((item) => {
                                          if (this.state.vaccine_data.vaccMiss[item]) {
                                            return this.missedrenderRow(item, itemAge.value)
                                          }
                                        })}
                                      </tbody>
                                    </table>
                                  </div> : null : null}
                              </div>)
                          })
                        }

                      </div>
                    </CardBody>
                  </Card>
                </div> : null}
              <div className="col-md-12 col-lg-12">
                <h4 className="control-label col-md-12" style={{ textAlign: "center", fontWeight: "bold" }}>
                  Vaccination Details
                </h4>
                <div>
                  {this.state.vaccinepick.map((itemAge, j) => (
                    <div>
                      {this.state.vaccine_data.vaccTakArray[itemAge.value].length !== 0 && (
                        <div>
                          <p class={this.state.is_table[j] ? "collapse_open" : "collapsible"} onClick={() => this.onCollapse(j)}>
                            Vaccine Taken Age: {itemAge.label}  {this.state.is_table[j] ? <FontAwesomeIcon icon={faCaretUp} /> : <FontAwesomeIcon icon={faCaretDown} />}
                          </p>
                          <table style={this.state.is_open[j] ? { 'opacity': '1' } : { 'opacity': '0' }} className="table table-hover table-striped table_transition" >

                            <thead >

                              {this.state.is_table[j] ?
                                <tr>
                                  <th>Vaccine</th>
                                  <th>Eligible Date</th>
                                  <th>Administered Date</th>
                                  <th>Batch ID</th>
                                  <th>Station</th>
                                  <th> </th>
                                </tr> : null}
                            </thead>
                            {/* <Collapse in={this.state.is_open[j]}> */}

                            {this.state.is_table[j] ?

                              <tbody>
                                {this.state.vaccine_data.vaccTakArray[itemAge.value].map((item, i) => {
                                  return this.renderRow(item, itemAge.value, j, i)
                                })}
                              </tbody>
                              : null}
                            {/* </Collapse> */}

                          </table>
                        </div>)}
                    </div>
                  ))}

                </div>
              </div>

            </div>
          </div>
        ) : null}


      </form>
    );
  }
}
export default reduxForm({
  form: "child_details",
  validate
})(child_details);
