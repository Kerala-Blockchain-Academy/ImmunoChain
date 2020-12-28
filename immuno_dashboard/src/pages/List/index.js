import React from 'react';
import { Field, reduxForm } from 'redux-form';
import renderField from 'components/FormInputs/renderField';
import Table from './Tables'
import SearchForm from './SearchForm'
import { browserHistory } from 'react-router';
import { Route } from 'react-router-dom';
import Family from "../Registration/Family"

class FormElements extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      items: [],
      display: false
    }
  }
  render_items(data, heading) {
    if (data) {
      console.log(data, heading);
      this.setState({
        items: data,
        display: true,
        heading: heading
      })
    }
  }

  // componentWillUnmount(){
  //   window.sessionStorage.clear()
  // }

  render() {
    return (
      <div >
        <Route path={`registration/family`} component={Family} />
        <SearchForm pointer={this} />
        {this.state.display ? <Table data={this.state.items} header={this.state.heading} /> : null}
      </div>
    );
  }
}
export default reduxForm({
  form: 'formElements'
})(FormElements);
