import React, { Component } from 'react';
import apiCall from "../../../service"
import AddPregnancyButton from "../../../components/FormInputs/AddPregnancyButton"
import { withRouter } from 'react-router-dom';
import Pregnancy from '../Pregnancy';
import * as jsPDF from 'jspdf'
import { url } from '../../../service'

class PregnancyList extends Component {
    state = {}



    async editPregnancy(item) {
        let body_obj = {}
        body_obj["data"] = {}
        body_obj["data"]["record_pregnancy_id"] = item.record_pregnancy_id
        console.log()
        let payload = JSON.stringify(body_obj);
        let res = await apiCall("edit_beneficiary_pregnancy", "POST", payload);
        console.log(res);
        this.props.history.push({
            pathname: "/registration/pregnancy",
            state: {
                edit: true,
                record_pregnancy_id: item.record_pregnancy_id,
                rchId: item.rch_id,
                woman_name: item.woman_name,
                pregnancyDetails: res.pregnancy_details
            }
        });

    }

    async downloadqr(item) {
        fetch(url + "qr_code_generator", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                data: item,
                key: "key_rch_id"
            })
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.status_code === 200) {
                    this.setState({
                        base64_qr: "data:application/pdf;base64, " + data.image_string //to display qr code in png format
                    });
                    return "data:application/pdf;base64, " + data.image_string;
                }
            }).then(data => {
                var doc = new jsPDF({ orientation: 'p', unit: 'mm', format: [70, 70] }) // change format according to printing tap
                doc.addImage(data, 'PNG', 0, 0, 24, 24); // image, format, x, y, tap width, tap height, alias, compression, rotation
                doc.autoPrint({ variant: 'non-conform' });
                window.open(URL.createObjectURL(doc.output('blob')), '_blank')
            })

    }

    async addchild(item) {
        this.props.history.push({
            pathname: "/registration/pregnancy",
            state: {
                edit: true,
                record_pregnancy_id: item.record_pregnancy_id,
                rchId: item.rch_id,
                //pregnancyDetails: res.pregnancy_details
            }
        });

    }
    date_change(date) {
        if (date != null) {
            let value = date.yyyy + "-" + date.mm + "-" + date.dd;
            return value;
        } else return null;
    }

    render() {
        let pregnancies = this.props.history.location.state ? this.props.history.location.state.children_data ? this.props.history.location.state.children_data : null : null
        console.log(pregnancies)

        return (
            pregnancies ?
                <div className="card">
                    <div className="header" style={{ textAlign: 'center' }}>
                        <h4 className="title" >Pregnancy list</h4>
                    </div>
                    {console.log(pregnancies)}
                    {/* {this.state.items.length !== 0 ? (<div className="content table-responsive table-full-width"> */}
                    <table className="table table-hover table-striped" >
                        <thead >
                            <tr>
                                <th>No.</th>
                                <th>Pregnancy ID</th>
                                <th>RCH ID</th>
                                <th >Child Name</th>
                                <th>Child DoB</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pregnancies.data.map((item, i) => (
                                <tr >
                                    <td >{i + 1}</td>
                                    <td>{item.record_pregnancy_id}</td>
                                    <td>{item.rch_id}</td>
                                    <td >{item.name}</td>
                                    <td>{this.date_change(item.dob)}</td>
                                    <td>
                                        <div style={{ textAlign: 'center' }}>
                                            <button className="btn btn-primary btn-sm btn-fill btn-wd"
                                                onClick={() => this.editPregnancy(item)}
                                            >Edit Pregnancy/Child</button>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ textAlign: 'center' }}>
                                            <button className="btn btn-primary btn-sm btn-fill btn-wd"
                                                onClick={() => this.downloadqr(item.record_pregnancy_id)}
                                            >Print QR Code</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <AddPregnancyButton recordUniqueId={this.props.history.location.state.record_unique_id}
                        woman_name={this.props.history.location.state.woman_name} />
                </div>
                : <div>Pregnancy is not found</div>
        )
        //         :
        //         (<div style={{ textAlign: 'center' }}>
        //             <h4>Records Not Found</h4>
        //         </div>)}
        // </div>
        // );
    }
}

export default withRouter(PregnancyList);
