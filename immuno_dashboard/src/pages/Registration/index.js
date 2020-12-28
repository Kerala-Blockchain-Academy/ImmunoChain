import React from 'react';
import { Route } from 'react-router-dom';
import Family from './Family';
import Pregnancy from './Pregnancy';
import Service from './Service';
import PregnancyList from './PregnancyList';
import Child_details from './Child_details';

const Forms = ({ match }) => (
  <div className="content">
    <div className="container-fluid">
      <Route path={`${match.url}/family`} component={Family} />
      <Route path={`${match.url}/pregnancy`} component={Pregnancy} />
      <Route path={`${match.url}/service`} component={Service} />
      <Route path={`${match.url}/pregnancy-list`} component={PregnancyList} />
      <Route path={`${match.url}/child_details`} component={Child_details} />
    </div>
  </div>
);

export default Forms;
