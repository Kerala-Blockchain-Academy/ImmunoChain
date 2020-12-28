import React, { Component } from 'react';
import 'react-widgets/dist/css/react-widgets.css'
import DataTable from 'react-data-table-component'
import apiCall, { fileDownload } from '../../service'
import Multiselect from 'react-widgets/lib/Multiselect'
import '../../assets/styles/multiselectoverride.scss'
import swal from 'sweetalert';



import { Card, CardBody } from 'reactstrap';
import { reduxForm } from "redux-form";
import DatePicker from "react-date-picker";

import Loader from 'react-loader-spinner'


const headers =
    [
        {
            name: 'Name',
            selector: 'child_name',
            sortable: true,
            center: true
        },
        {
            name: 'Mother Name',
            selector: 'mother_name',
            sortable: true,
            center: true
        },
        {
            name: 'Father Name',
            selector: 'father_name',
            sortable: true,
            center: true
        },
        {
            name: 'Address',
            selector: 'address',
            sortable: true,
            center: true,
            wrap: true,
        },
        {
            name: 'DOB',
            selector: 'date_string',
            sortable: true,
            center: true
        },
        {
            name: 'Vaccines Given',
            selector: 'vaccine_given_list',
            sortable: true,
            center: true,
            wrap: true,
        },

    ]


class ImmunizationRegister extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isTableData: false,
            filterLessdminChartData: [],
            adminChartData: [],
            stationsSelected: [],

            dates: {
                from_date: "",
                to_date: new Date()
            },

            dateToShow: {
                from_date: "",
                to_date: ""
            },

            multiSelect: [],
            filters: {
                child_names: [],
                mother_names: [],
                father_names: []
            },
            selectedChildNamefilter: "",
            selectedMotherNamefilter: "",
            selectedFatherNamefilter: "",
            noDataMessage: "Please enter required data"
        }
        this.tableRef = React.createRef();
        this.childFilterRef = React.createRef();
        this.motherFilterRef = React.createRef();
        this.fatherFilterRef = React.createRef();


        this.fetchLookup()
    }

    componentDidMount() {
    }

    fetchLookup = async () => {
        let lookUpdata = await apiCall("lookup_data", "GET", "");
        let allStationsList = lookUpdata.stations.stations_list;
        console.log(allStationsList);
        // this.setState({ allStationsData: allStationsList });
        let forMultiSelect = [];
        allStationsList.map((obj) => {
            forMultiSelect.push(
                {
                    "station_name": obj.station_name,
                    "station_id": obj.station_id
                })
        })
        console.log(forMultiSelect);
        this.setState({ multiSelect: forMultiSelect });

    }


    fetchAdministration = async () => {

        if (this.state.stationsSelected.length > 0 && this.state.dates.from_date && this.state.dates.to_date) {
            let payload = {};
            this.setState({ showAdminTableLoader: true, noDataMessage: "Loading..." })
            payload["station"] = this.state.stationsSelected;
            payload["date_from"] = this.convertDateToObj(this.state.dates.from_date);
            payload["date_to"] = this.convertDateToObj(this.state.dates.to_date);
            payload["csv"] = ""; //required filed


            let response = await apiCall("detailed_immunization_register", "POST", JSON.stringify(payload));

            let childNames = [];
            let motherNames = [];
            let fatherNames = [];


            console.log(response);

            if (response.status_code === 200) {
                if (response.data) {
                    response.data.map((obj, i) => {
                        childNames.push(obj.child_name);
                        motherNames.push(obj.mother_name);
                        fatherNames.push(obj.father_name);

                        response.data[i]['date_string'] = obj.date_of_birth.dd +
                            "/" + obj.date_of_birth.mm +
                            "/" + obj.date_of_birth.yyyy

                        var vaccine_list = ""
                        obj.vaccines_given.map((vaccine) => {
                            vaccine_list = vaccine_list + " " + vaccine
                        })

                        response.data[i]['vaccine_given_list'] = vaccine_list
                    })


                    childNames = new Set(childNames); //to remove duplicate elements
                    motherNames = new Set(motherNames);
                    fatherNames = new Set(fatherNames);

                    childNames = Array.from(childNames); //convert it again into array
                    motherNames = Array.from(motherNames);
                    fatherNames = Array.from(fatherNames);

                    this.setState({ adminChartData: response.data }); //set to chart
                    this.setState({ filterLessdminChartData: response.data }); //for clear filter purpose
                    this.setState({ filters: { child_names: childNames, mother_names: motherNames, father_names: fatherNames } }); //set filter dropdowns
                    this.setState({ isTableData: true }); //to show filter card
                    this.setState({ showAdminTableLoader: false }) //hide loader

                }
            }
            else if (response.status_code === 404) {
                this.setState({
                    noDataMessage: "No records found",
                    adminChartData: [],
                    filterLessdminChartData: [],
                    isTableData: false,
                    showAdminTableLoader: false
                })
                this.setState({ filters: { child_names: [], mother_names: [], father_names: [] } }); //set filter dropdowns to null

            }




            this.tableRef.current.scrollIntoView(
                { //auto scroll to table
                    behavior: 'smooth',
                    block: 'start',

                }
            );
        }
        else if (this.state.stationsSelected.length === 0) {
            swal("Select Station", "", "warning");

            this.setState({ showAdminTableLoader: false })
        }
        else if (!this.state.dates.from_date) {
            swal("Select Start Date", "", "warning");
            this.setState({ showAdminTableLoader: false })
        }
        else if (!this.state.dates.to_date) {
            swal("Select End Date", "", "warning");
            this.setState({ showAdminTableLoader: false })
        }




    }


    filterAdminTable = async () => {

        this.setState({ showAdminTableFilterLoader: true })

        let payload = {};
        payload["station"] = this.state.stationsSelected;
        payload["date_from"] = this.convertDateToObj(this.state.dates.from_date);
        payload["date_to"] = this.convertDateToObj(this.state.dates.to_date);

        payload["child_name"] = this.state.selectedChildNamefilter;
        payload["mother_name"] = this.state.selectedMotherNamefilter;
        payload["father_name"] = this.state.selectedFatherNamefilter;
        payload["csv"] = ""; //required filed


        let filteredTable = await apiCall("detailed_immunization_register", "POST", JSON.stringify(payload));

        if (filteredTable.status_code === 200) {

            filteredTable.data.map((obj, i) => {

                filteredTable.data[i]['date_string'] = obj.date_of_birth.dd +
                    "/" + obj.date_of_birth.mm +
                    "/" + obj.date_of_birth.yyyy
                var vaccine_list = ""
                obj.vaccines_given.map((vaccine) => {
                    vaccine_list = vaccine_list + " " + vaccine
                })

                filteredTable.data[i]['vaccine_given_list'] = vaccine_list
            })
            this.setState({ adminChartData: filteredTable.data });
            this.setState({ showAdminTableFilterLoader: false })

            this.tableRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start',

            });


        }
        else if (filteredTable.status_code === 404) {
            this.setState({
                noDataMessage: "No records found",
                adminChartData: [],
                filterLessdminChartData: [],
                isTableData: false,
                showAdminTableLoader: false
            })
            this.setState({ filters: { child_names: [], mother_names: [], father_names: [] } }); //set filter dropdowns to null
        }

        this.setState({ showAdminTableFilterLoader: false })

    }

    clearFilter = () => {
        this.setState({ adminChartData: this.state.filterLessdminChartData })

        this.setState({ selectedChildNamefilter: "", selectedMotherNamefilter: "", selectedFatherNamefilter: "" })

        // document.getElementById('batch').value = "true"; //setting filter inputs null
        // document.getElementById('vaccine').value = "true";

        this.childFilterRef.current.value = "true";
        this.motherFilterRef.current.value = "true";
        this.fatherFilterRef.current.value = "true";
    }

    selectStation = async (station) => {


        let stationsList = [];
        await station.map((obj) => {
            stationsList.push(obj.station_id)
        });
        this.setState({ stationsSelected: stationsList })

    }



    handleSelectedStation = (options) => {
        let list = options.filter((obj) => {
            if (obj.value) {
                return obj
            }
        })
        let stations_list = []
        list.map((obj) => {
            stations_list.push(obj.id)

        })
        this.setState({ stationsSelected: stations_list })
    }

    onDateChange = (date, key) => {
        var dateToSet = this.state.dateToShow;
        dateToSet[key] = date;
        this.setState({ dates: dateToSet });
        this.setState({ dateToShow: dateToSet });
        console.log(this.state.dateToSet);
        this.setState({ dateDropdown: JSON.stringify({ "range": 0, "type": "none" }) });
    };

    convertDateToObj(_date) {
        //convert date to object
        var date_obj = {};
        date_obj["yyyy"] = _date.getFullYear();
        date_obj["mm"] = _date.getMonth() + 1;
        date_obj["dd"] = _date.getDate();
        return date_obj;
    }


    exportAdiminCSV = async () => {

        let payload = {};
        payload["station"] = this.state.stationsSelected ? this.state.stationsSelected : "";
        payload["date_from"] = this.state.dates.from_date ? this.convertDateToObj(this.state.dates.from_date) : "";
        payload["date_to"] = this.state.dates.from_date ? this.convertDateToObj(this.state.dates.to_date) : "";

        payload["child_name"] = this.state.selectedChildNamefilter ? this.state.selectedChildNamefilter : "";
        payload["mother_name"] = this.state.selectedMotherNamefilter ? this.state.selectedMotherNamefilter : "";
        payload["father_name"] = this.state.selectedFatherNamefilter ? this.state.selectedFatherNamefilter : "";
        payload["csv"] = "y"; //required filed
        console.log(payload);


        //create csv file name in server
        let importCSV = await apiCall("detailed_immunization_register", "POST", JSON.stringify(payload));
        console.log(importCSV.file_name);

        //download created csv in server
        let response = await fileDownload("get_csv?file_name=" + importCSV.file_name);


        console.log(response);
        const doc = await response.blob()
        console.log(doc);
        this.saveFile(doc, "Administration Report.csv")
    }


    saveFile = (blob, filename) => {
        if (window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blob, filename);
        } else {
            const a = document.createElement('a');
            document.body.appendChild(a);
            const url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = filename;
            a.click();
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }, 50)
        }
    }

    customDates = (value) => {
        console.log(value);
        value = JSON.parse(value)

        if (value.type === "days") {
            let d = new Date();
            d.setDate(d.getDate() - value.range + 1);
            console.log(d);

            let dateToSet = this.state.dateToShow;
            dateToSet["from_date"] = d;
            dateToSet["to_date"] = new Date();

            this.setState({ dates: dateToSet, dateToShow: dateToSet, dateDropdown: JSON.stringify(value) });

        }
        else if (value.type === "months") {
            let d = new Date();
            d.setMonth(d.getMonth() - value.range);
            console.log(d);

            let dateToSet = this.state.dateToShow;
            dateToSet["from_date"] = d;
            dateToSet["to_date"] = new Date();

            this.setState({ dates: dateToSet, dateToShow: dateToSet, dateDropdown: JSON.stringify(value) });

        }
        else {
            this.setState({ dateDropdown: value })
        }
    }

    render() {
        return (

            <div>
                <Card className="shadow-style">
                    <CardBody>
                        <div className="header">
                            <h4 >IMMUNIZATION REGISTER</h4>
                        </div>

                        <div className="container-fluid">
                            <div className="row">
                                <div class="col-md-6 col-lg-6" >
                                    <label for="batch_id" className="control-label">Select Stations</label>
                                    <Multiselect
                                        data={this.state.multiSelect}
                                        value={this.state.selectedStationNames}
                                        valueField='station_id'
                                        textField='station_name'
                                        defaultValue={this.state.multiSelect.station_name}
                                        onChange={value =>
                                            this.selectStation(value)
                                        }
                                    />
                                </div>
                            </div>
                            <div className="row">
                                <div class="col-md-2 col-lg-2" >
                                    <label className="control-label">Date Range:</label>
                                    <br />
                                    <select value={this.state.dateDropdown} className="form-control selectpicker"
                                        onChange={(e) => { this.customDates(e.target.value) }}>
                                        <option selected value={JSON.stringify({ "range": 0, "type": "none" })}> Custom </option>
                                        <option value={JSON.stringify({ "range": 7, "type": "days" })}>Last 7 days</option>
                                        <option value={JSON.stringify({ "range": 1, "type": "months" })}>Last 1 Month</option>
                                    </select>

                                </div>
                                <div class="col-md-2 col-lg-2" >
                                    <label for="batch_id" className="control-label">From:</label>
                                    <br />
                                    <DatePicker
                                        name="from_date"
                                        onChange={_date => {
                                            this.onDateChange(_date, "from_date");
                                        }}
                                        maxDate={this.state.dates.to_date}
                                        value={this.state.dateToShow.from_date}
                                    />
                                </div>
                                <div class="col-md-2">
                                    <label for="batch_id" className="control-label">To:</label>
                                    <br />
                                    <DatePicker
                                        name="to_date"
                                        onChange={_date => {
                                            this.onDateChange(_date, "to_date");
                                        }}
                                        minDate={this.state.dates.from_date}
                                        maxDate={new Date()}
                                        value={this.state.dateToShow.to_date}
                                    />
                                </div>
                            </div>
                            <br />

                            <div class="col-sm-2" >
                                <button onClick={this.fetchAdministration} className="btn btn-primary btn-fill">Submit</button>
                            </div>

                        </div>

                        {this.state.showAdminTableLoader ?
                            <div style={{ textAlign: "center" }}>
                                <Loader type="ThreeDots" height={50} width={50} color="grey" />
                                <p>Fetching data please wait...</p>
                            </div> :
                            null}

                        {/* </div> */}
                        <div ref={this.tableRef} style={{ "margin-top": "2%" }}>

                            {this.state.isTableData ?  // show filter only if table is generated
                                <div style={{ "margin": "1%" }}>
                                    <Card className="col-md-8 col-lg-8">
                                        <div className="container-fluid">
                                            <CardBody>
                                                <h6>Filter Options:</h6>

                                                <div class="form-group">
                                                    <div className="row">
                                                        <div class="col-md-4" >
                                                            <label for="batch_id" className="control-label">Child Name:</label>
                                                            <select name="state" className="col-md-2 form-control" id="batch" ref={this.childFilterRef}
                                                                onChange={(e) => this.setState({ selectedChildNamefilter: e.target.value })}>
                                                                <option disabled selected value> ---Select an option--- </option>
                                                                {
                                                                    this.state.filters.child_names.map((obj) => {

                                                                        return (<option value={obj} >{obj}</option>)
                                                                    })
                                                                }
                                                            </select>
                                                        </div>

                                                        <div class="col-md-4">
                                                            <label for="vaccine_name" className="control-label">Mother Name:</label>
                                                            <select name="state" className="col-md-2 form-control" id="vaccine" ref={this.motherFilterRef}
                                                                onChange={(e) => this.setState({ selectedMotherNamefilter: e.target.value })}>
                                                                <option disabled selected value> ---Select an option--- </option>
                                                                {
                                                                    this.state.filters.mother_names.map((obj) => {
                                                                        return (<option value={obj} >{obj}</option>)
                                                                    })
                                                                }
                                                            </select>
                                                        </div>

                                                        <div class="col-md-4">
                                                            <label for="vaccine_name" className="control-label">Father Name:</label>
                                                            <select name="state" className="col-md-2 form-control" id="vaccine" ref={this.fatherFilterRef}
                                                                onChange={(e) => this.setState({ selectedFatherNamefilter: e.target.value })}>
                                                                <option disabled selected value> ---Select an option--- </option>
                                                                {
                                                                    this.state.filters.father_names.map((obj) => {
                                                                        return (<option value={obj} >{obj}</option>)
                                                                    })
                                                                }
                                                            </select>
                                                        </div>

                                                        <div style={{ "margin-top": "0.5%", "margin-bottom": "0.5%" }} class="col-md-6">
                                                            <button style={{ "margin-right": "0.5%" }} className="btn btn-success btn-sm"
                                                                type="button"
                                                                onClick={this.filterAdminTable}>
                                                                Apply Filter
                                                            </button>
                                                            <button style={{ "margin-right": "0.5%" }} className="btn btn-danger btn-sm"
                                                                type="button"
                                                                onClick={this.clearFilter}>
                                                                Clear Filter
                                                            </button>

                                                        </div>
                                                    </div>

                                                </div>
                                            </CardBody>
                                        </div>
                                    </Card>
                                </div> : null}

                            {this.state.showAdminTableFilterLoader ?
                                <div style={{ textAlign: "center" }}>
                                    <Loader type="ThreeDots" height={50} width={50} color="grey" />
                                    <p>Fetching data please wait...</p>
                                </div> : null
                            }

                            {this.state.isTableData ? //show export csv only if table is populated
                                <div className="pull-right" style={{ "margin": "1%" }}>
                                    <a onClick={this.exportAdiminCSV}>
                                        Export CSV<i className="fa fa-download"></i>
                                    </a>
                                </div> : null
                            }


                            <DataTable
                                title="Immunization Report"
                                columns={headers}
                                data={this.state.adminChartData}
                                noDataComponent={<div>{this.state.noDataMessage}</div>}
                                highlightOnHover={true}
                                fixedHeader
                                responsive={true}
                                pagination={true}
                                paginationPerPage={5}
                                paginationRowsPerPageOptions={[5, 10, 20, 30, 50, 100]}
                            />

                        </div>
                    </CardBody>
                </Card>

            </div >
        );
    }
}

export default reduxForm({
    form: "table_search",

})(ImmunizationRegister);

