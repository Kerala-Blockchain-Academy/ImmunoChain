import React, { Component } from 'react';

import { withRouter } from 'react-router-dom';


import apiCall from "../../service"

class Table extends Component {
  constructor(props) {
    super(props)
    this.state = {
      items: this.props.data,
      viewFamily: false,
    }
    console.log(this.state.items);
    console.log(this.props.header);
  }


  async editData(record_unique_id) {

    this.props.history.push({
      pathname: "/registration/family",
      state: {
        view: true,
        edit: false,
        record_unique_id: record_unique_id
      }
    });

  }

  async viewPregnancyList(record_unique_id, woman_name) {
    const data = {
      data: {
        record_unique_id: record_unique_id
      }
    }
    let payload = JSON.stringify(data);
    let response = await apiCall("children_data", "POST", payload)
    console.log("aaa", response)
    this.props.history.push({
      pathname: "/registration/pregnancy-list",
      state: {
        record_unique_id: record_unique_id,
        woman_name: woman_name,
        children_data: response
      }
    })

  }

  render() {

    return (
      <div className="container-fluid">
        <div className="card shadow-style">
          <div className="header" style={{ textAlign: 'center' }}>
            <h4 className="title" >{this.props.header}</h4>
          </div>

          {this.state.items.length !== 0 ?
            (<div className="content table-responsive table-full-width">
              <table className="table table-hover table-striped">
                <thead>
                  <tr>
                    <th>Woman Name</th>
                    <th>Husband Name</th>
                    <th>Phone Number</th>
                    <th>Address </th>
                    <th>Woman DOB</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.items.map(item => (
                    < tr >
                      <td>{item.pregnant_woman_name}</td>
                      <td>{item.husband_name}</td>
                      <td>{item.phone_number}</td>
                      <td> {item.address}</td>
                      <td>
                        {item.pregnant_woman_dob.dd + '/' + item.pregnant_woman_dob.mm + '/' + item.pregnant_woman_dob.yyyy}
                      </td>
                      <td>
                        <div style={{ textAlign: 'center' }}>
                          {/* <AddPregnancyButton recordUniqueId={item.record_unique_id} /> */}
                          <button className="btn btn-secondary  btn-fill btn-wd"
                            onClick={() => this.editData(item.record_unique_id)}>View/Edit</button>
                          &nbsp;
                    </div>

                        <div style={{ textAlign: 'center', marginTop: '10px' }}>

                          <button className="btn btn-primary btn-fill btn-wd"
                            onClick={() => this.viewPregnancyList(item.record_unique_id, item.pregnant_woman_name)}
                          >Edit Pregnancy/Child </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </div>)
            :
            (<div style={{ textAlign: 'center' }}>
              <h4>Records Not Found</h4>
            </div>)}
        </div>
      </div>
    );
  }
}

export default withRouter(Table);

// export default reduxForm({
//   table: "table",
// })(Table);
