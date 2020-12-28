import React, { Component } from "react";
import { Button } from "react-bootstrap";
import * as jsPDF from 'jspdf'
import { url } from '../../../service'

class QR extends Component {
    constructor(props) {
        super(props);
        this.state = {
            base64_qr: ""
        };
        console.log(this.props);


        fetch(url + "qr_code_generator", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                data: this.props.rch_id,
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
                    console.log(this.state.base64_qr);
                }
            });


        // var qr_img = "data:image/png;base64"+this.state.base64;
    }
    onPressdownload = () => {
        var doc = new jsPDF({ orientation: 'p', unit: 'mm', format: [70, 70] }) // change format according to printing tap
        doc.addImage(this.state.base64_qr, 'PNG', 0, 0, 24, 24); // image, format, x, y, tap width, tap height, alias, compression, rotation
        doc.save(this.props.rch_id + ".pdf");
    }

    onPress = () => {
        var doc = new jsPDF({ orientation: 'p', unit: 'mm', format: [70, 70] }) // change format according to printing tap
        doc.addImage(this.state.base64_qr, 'PNG', 0, 0, 24, 24); // image, format, x, y, tap width, tap height, alias, compression, rotation
        doc.autoPrint({ variant: 'non-conform' });
        window.open(URL.createObjectURL(doc.output('blob')), '_blank')
    }

    render() {
        return (
            <div>
                <img src={this.state.base64_qr} alt="RCH_ID" id="qr" />
                <br></br>
                <a >
                    <Button onClick={this.onPress} className="btn btn-primary btn-fill" color="info">Print QR code</Button>
                    <Button style={{ marginLeft: 10 }} className="btn btn-primary btn-fill" onClick={this.onPressdownload} color="info">Download</Button>
                </a>
            </div>

        );
    }
}
export default QR;
