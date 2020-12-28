import React, { Component } from 'react';
import { SingleDatePicker, DateRangePicker } from 'react-dates';
import moment from 'moment';

export default class DatePicker extends Component {
  constructor(props) {
    super(props)
    console.log(this.props)
  }
  state = {
    date: moment(),
    startDate: moment(),
    endDate: moment(),
    dateRangeFocusedInput: null,

  };

  render() {
    let { date } = this.state;
    return (
      <div className="row">
        <div className="col-md-6">
          <div className="form-group">
            <SingleDatePicker
              date={date}
              // isRTL={true}
              // enableOutsideDays={true}
              onDateChange={date => this.setState({ date })}
              focused={this.state.focused}
              onFocusChange={({ focused }) => this.setState({ focused })}
            />
          </div>
        </div>
        {/* <div className="col-md-6">
          <h4 className="title">DateRange Picker</h4>
          <div className="form-group">
            <DateRangePicker
              startDate={this.state.startDate}
              endDate={this.state.endDate}
              focusedInput={this.state.dateRangeFocusedInput}
              onFocusChange={focusedInput => this.setState({ dateRangeFocusedInput: focusedInput })}
              onDatesChange={({ startDate, endDate }) => this.setState({ startDate, endDate })} />
          </div>
        </div> */}
        {/* <button type="button" className="btn btn-default" onClick={() => {
          this.props.history.push(
            {
              pathname: '/registration/pregnancy',
              state: { detail: 'data' }
            })
        }}>Go To Pregnancy</button> */}
      </div>
    );
  }
}
