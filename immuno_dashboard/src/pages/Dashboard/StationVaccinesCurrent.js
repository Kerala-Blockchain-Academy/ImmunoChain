import React, { Component } from 'react';

import { Chart } from 'react-google-charts';
import DataTable from 'react-data-table-component'
import { Card, CardBody } from 'reactstrap';
import Loader from 'react-loader-spinner'

import apiCall, { url } from "../../service"



const vaccineTableHeader = [
    {
        name: 'Batch ID',
        selector: 'package_id',
        sortable: true,
        center: true,
    },
    {
        name: 'Vaccine Name',
        selector: 'vaccine_name',
        center: true,
        wrap: true,
    },
    {
        name: 'Dose Count',
        selector: 'count',
        sortable: true,
        center: true,
    },
    {
        name: 'Previous Station',
        selector: 'previous_station',
        wrap: true,
        center: true,
    },
    {
        name: 'Manufacturer Info',
        selector: 'manufacturer_info',
        center: true,

    },
    {
        name: 'Status',
        selector: 'status',
        sortable: true,
        center: true,

    },
]

class StationVaccinesCurrent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            stations: [],
            fullVaccines: {},
            showChartLoader: true,
            chart_data: [['Vaccine', 'In Stock'], ['Fetching Data. Please wait..!', 0]],
            table_data: {}
        }
        this.tableRef = React.createRef();

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
        console.log("response=", res)
        this.setState({ stations: res.stations.stations_list })
        // this.fetchStationVaaccineData()
        console.log(this.state.stations);
        this.fetchVaccineDetailInitially();

    }

    fetchVaccineDetailInitially = async () => {
        console.log(this.state.stations);
        let now = new Date();
        let payload = {
            station_id: [],//array of station IDs
            date: { dd: now.getDate(), mm: now.getMonth(), yyyy: now.getFullYear() }
        }
        // setTimeout(function () {
        payload.station_id.push(this.state.stations[0].station_id);
        // }, 50);


        let apiResponse = await apiCall(
            "station_vaccine_analytics",
            "POST",
            JSON.stringify(payload)
        );

        console.log(apiResponse);

        if (apiResponse.status_code === 200) {
            this.setState({ showChartLoader: true })
            this.setState({ fullVaccines: apiResponse.data })
            let vaccineDetailsObj = apiResponse.data[0].vaccines
            console.log(vaccineDetailsObj);
            if (Object.keys(vaccineDetailsObj).length !== 0) {
                console.log("vaccines in stock")
                let vaccineNames = Object.keys(vaccineDetailsObj);

                let vaccineDetailsArray = Object.values(vaccineDetailsObj);
                vaccineDetailsArray.map((obj, i) => { obj["vaccine_name"] = vaccineNames[i] })

                let vaccineList = [['Vaccine', 'Recieved', 'In Transit']] //headers

                await vaccineDetailsArray.map((item) => {
                    vaccineList.push([item.vaccine_name, item.received_count, item.transit_count])
                })
                console.log(JSON.stringify(vaccineList));

                this.setState({ chart_data: vaccineList });
                this.setState({ showChartLoader: false });

                //session storage for faster loading
                const forSession = { sessionChart: vaccineList };
                sessionStorage.setItem(this.state.stations[0].station_id, JSON.stringify(forSession));


            } else { //no vaccination in stock
                this.setState({ showChartLoader: false })
                console.log("no vaccines")
                let noVaccineArray = [['Vaccine', 'In Stock'], ['No vaccines in stock', 0]]
                this.setState({ chart_data: noVaccineArray })
                console.log(this.state.chart_data);
            }
        }
        else {
            console.log("bad api response") //bad response case
            let noVaccineArray = [['Vaccine', 'In Stock'], ['Server error. Unable to fetch data', 0]]
            this.setState({ chart_data: noVaccineArray })
            console.log(this.state.chart_data);
        }
    }


    fetchVaccineDetailOnChange = async (e) => {
        this.setState({ table_data: {} });
        const value = e.target.value;

        if (sessionStorage.getItem(value)) { //load from session storage
            console.log("session:", JSON.parse(sessionStorage.getItem(value)).sessionChart)
            this.setState({ chart_data: JSON.parse(sessionStorage.getItem(value)).sessionChart })
            this.setState({ showChartLoader: false })

        }
        else {
            this.setState({ showChartLoader: true })
        }
        let now = new Date();
        let payload = {
            station_id: [],                         //array of station IDs
            date: { dd: now.getDate(), mm: now.getMonth(), yyyy: now.getFullYear() }
        }
        payload.station_id.push(value);
        console.log(payload);


        let apiResponse = await apiCall(
            "station_vaccine_analytics",
            "POST",
            JSON.stringify(payload)
        );

        if (apiResponse.status_code === 200) {
            this.setState({ fullVaccines: apiResponse.data })
            let vaccineDetailsObj = apiResponse.data[0].vaccines;
            console.log(vaccineDetailsObj);
            if (Object.keys(vaccineDetailsObj).length !== 0) {
                console.log("vaccines in stock")
                let vaccineNames = Object.keys(vaccineDetailsObj);

                let vaccineDetailsArray = Object.values(vaccineDetailsObj);
                vaccineDetailsArray.map((obj, i) => { obj["vaccine_name"] = vaccineNames[i] })

                let vaccineList = [['Vaccine', 'Recieved', 'In Transit']] //headers

                await vaccineDetailsArray.map((item) => {
                    vaccineList.push([item.vaccine_name, item.received_count, item.transit_count])
                })
                console.log(vaccineList);

                this.setState({ chart_data: vaccineList });
                this.setState({ showChartLoader: false })

                //session storage for faster loading
                const forSession = { sessionChart: vaccineList };
                sessionStorage.setItem(value, JSON.stringify(forSession));

            } else { //no vaccination in stock
                this.setState({ showChartLoader: false })
                console.log("no vaccines")
                let noVaccineArray = [['Vaccine', 'In Stock'], ['No vaccines in stock', 0]]
                this.setState({ chart_data: noVaccineArray })
                console.log(this.state.chart_data);
            }
        }

        else { //api response not succesfuly posted
            console.log("bad api response") //bad response case
            let noVaccineArray = [['Vaccine', 'In Stock'], ['Network error. Unable to fetch data', 0]]
            this.setState({ chart_data: noVaccineArray })
            console.log(this.state.chart_data);
        }
        // }
        console.log(this.state.chart_data);
    }

    showVaccineDet = (item) => {
        let vaccineInfo = this.state.fullVaccines[0].vaccines[item[0]]
        console.log(item[0]);
        vaccineInfo.batches.map((obj) => { obj.vaccine_name = vaccineInfo.vaccine_name })

        console.log(vaccineInfo.batches);

        var tableContent = vaccineInfo.batches.map(obj => ({
            vaccine_name: obj.vaccine_name,
            package_id: obj.package_id,
            count: obj.count,
            previous_station: obj.previous_station.station_name,
            manufacturer_info: obj.manufacturer_info,
            status: obj.status

        }));
        console.log(tableContent);

        this.setState({ table_data: tableContent });
        console.log(this.state.table_data);




        // for auto scrolling
        this.tableRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'end',

        });


    }

    render() {
        return (

            <div>
                <Card className="shadow-style">
                    <CardBody>
                        <div className="header">
                            <h4>VACCINES IN STOCK</h4>
                        </div>
                        <div class="container-fluid">
                            <div className="col-md-12">
                                {/* <div class="container-fluid"> */}
                                <div class="col-md-6 row" >
                                    {/* <div class="col-md-6"> */}
                                    <label className="control-label col-md-6">
                                        Select Station
                                    </label>
                                    <select name="state" className="col-md-2 form-control selectpicker"
                                        onChange={this.fetchVaccineDetailOnChange}>
                                        {
                                            this.state.stations.map((obj) => {
                                                return (<option value={obj.station_id} >{obj.station_name}</option>)
                                            })
                                        }
                                    </select>
                                    {/* </div> */}
                                </div>
                                <div class="col-md-10 row">
                                    {!this.state.showChartLoader ?
                                        <Chart
                                            width={window.screen.width < 1024 ? "100%" : "100%"}
                                            height={'300px'}
                                            // Note here we use Bar instead ofx BarChart to load the material design version
                                            chartType="ColumnChart"
                                            loader={<div style={{ textAlign: "center" }}>
                                                <Loader type="ThreeDots" height={50} width={50} color="grey" />
                                                <p>Fetching data please wait...</p>
                                            </div>}
                                            data={this.state.chart_data}
                                            options={{
                                                // Material chart options
                                                chart: {
                                                    title: 'Number of vaccines in stock',
                                                    subtitle: 'Click on the vaccine to get more details',
                                                },
                                                colors: ['#4d4dff', '#ff9e93'],

                                                isStacked: true,

                                                hAxis: {
                                                    title: 'Vaccine Name',
                                                    minValue: 0
                                                },
                                                vAxis: {
                                                    title: 'Dose in Stock',

                                                },
                                                // bars: 'vertical',
                                            }}

                                            chartEvents={[
                                                {
                                                    eventName: 'select',
                                                    callback: ({ chartWrapper }) => {
                                                        const chart = chartWrapper.getChart()
                                                        const selection = chart.getSelection()
                                                        if (selection.length === 1) {
                                                            const [selectedItem] = selection
                                                            // console.log([selectedItem])
                                                            const dataTable = chartWrapper.getDataTable()
                                                            const { row, column } = selectedItem
                                                            // const value = dataTable.getValue(row, column);

                                                            this.showVaccineDet(this.state.chart_data[selection[0].row + 1]);

                                                        }

                                                    },
                                                },
                                            ]}
                                        /> :
                                        <div style={{ textAlign: "center" }}>
                                            <Loader type="ThreeDots" height={50} width={50} color="grey" />
                                            <p>Fetching data please wait...</p>
                                        </div>
                                    }
                                </div>

                                {/* <br /><br /> */}
                                <div ref={this.tableRef}>
                                    <DataTable
                                        title="Vaccine Details"
                                        columns={vaccineTableHeader}
                                        data={this.state.table_data}
                                        noDataComponent={<div>Click on graph to view details</div>}
                                        fixedHeader
                                        striped
                                        highlightOnHover
                                        pagination
                                        paginationPerPage={5}
                                        paginationRowsPerPageOptions={[5, 10, 20, 30]}
                                    />

                                </div>
                                {/* </div> */}
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div >

        );
    }
}

export default StationVaccinesCurrent;