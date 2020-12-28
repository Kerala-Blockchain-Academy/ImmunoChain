import React, { Component } from 'react';
import { Card, CardBody, Container } from 'reactstrap';
import Loader from 'react-loader-spinner'
import apiCall from "../../service"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSyringe } from '@fortawesome/free-solid-svg-icons'
import { faTint } from '@fortawesome/free-solid-svg-icons'
import { faStethoscope } from '@fortawesome/free-solid-svg-icons'
import { faHeartbeat } from '@fortawesome/free-solid-svg-icons'



class VaccineCount extends Component {

    constructor(props) {
        super(props);
        this.state = {
            vaccineIds: [],
            vaccineNames: "",
        }
        // this.fetchLookup();
        this.getVaccineCount();
    }

    getVaccineCount = async () => {

        let lookUpdata = await apiCall("lookup_data", "GET", "");
        const vaccineList = Object.values(lookUpdata.vaccine_names_id)
        this.setState({ vaccineIds: vaccineList })

        let payload = { data: [] };
        payload['data'] = this.state.vaccineIds;
        payload = JSON.stringify(payload);
        let response = await apiCall("all_time_vaccine_count", "POST", payload);
        console.log(response)
        this.setState({ vaccineNames: response.data })
    }


    render() {

        const cardColors = ["card-counter danger", "card-counter success", "card-counter warning", "card-counter primary"]
        const cardIcons = [faTint, faSyringe, faStethoscope]


        return (
            <div>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css" />

                <Card className="shadow-style">
                    <CardBody>
                        <div className="header">
                            <h4 >IMMUNIZATION COUNTER</h4>
                        </div>

                        {
                            this.state.vaccineNames ?
                                <div className="container-fluid">
                                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                        {this.state.vaccineNames.map((item, i) => (
                                            <div style={{ width: '16%', position: 'relative' }}>
                                                <div class={cardColors[i % 4]}>
                                                    {/* <i class="fas fa-syringe"></i> */}
                                                    <i className="card-icon pull-right"><FontAwesomeIcon icon={cardIcons[i % 3]} /></i>
                                                    <span class="count-numbers">{item.count}</span>
                                                    <span class="count-name">{item.name}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div> :
                                <div style={{ textAlign: "center" }}>
                                    <Loader type="ThreeDots" height={50} width={50} color="grey" />
                                    <p>Fetching data please wait...</p>
                                </div>
                        }
                    </CardBody>
                </Card>
            </div>
        );
    }
}

export default VaccineCount;