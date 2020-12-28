import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';

class AddPregnancyButton extends Component {
    state = {}

    addPregnancy(uniqueID) {
        console.log(uniqueID);
        this.props.history.push({
            pathname: "/registration/pregnancy",
            state: {
                record_unique_id: uniqueID,
                woman_name:this.props.woman_name,
                edit: false
            }
        });
    }

    render() {
        return (
            <div style={{ textAlign: 'center' }}>
                <button className="btn btn-secondary btn-md btn-fill btn-wd"
                    onClick={() => this.addPregnancy(this.props.recordUniqueId)}
                >Add Pregnancy</button>
            </div>
        );
    }
}

export default withRouter(AddPregnancyButton);
