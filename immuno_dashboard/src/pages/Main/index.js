import React from 'react';
import { Route, Router, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import cx from 'classnames';
import { setMobileNavVisibility } from '../../reducers/Layout';
import { withRouter } from 'react-router-dom';

import Header from './Header';
import Footer from './Footer';
import SideBar from '../../components/SideBar';
import ThemeOptions from '../../components/ThemeOptions';
import MobileMenu from '../../components/MobileMenu';
/**
 * Pages
 */
import Login from '../Login';
import Dashboard from '../Dashboard';
import Registration from '../Registration';
import Search from '../Search';
import List from '../List';
import User_registration from '../User_registration';
import StationVaccinesCurrent from '../Dashboard/StationVaccinesCurrent';
import VaccineAdministartionTable from '../Dashboard/VaccineAdministration';
import VaccineCoverageGraph from '../Dashboard/VaccineCoverage';
import AreaCoverageMap from '../Dashboard/AreaCoverageMap';
import ImmunizationRegister from '../Dashboard/ImmunizationRegister'

import UserProfile from '../UserProfile';

const Main = ({
  mobileNavVisibility,
  hideMobileMenu,
  history
}) => {
  history.listen(() => {
    if (mobileNavVisibility === true) {
      hideMobileMenu();
    }
  });
  return (
    <div className={cx({
      'nav-open': mobileNavVisibility === true
    })}>
      <div className="wrapper">
        <div className="close-layer" onClick={hideMobileMenu}></div>
        <SideBar />

        <div className="main-panel">
          <Header />
          <Route exact path="/" component={Dashboard} />
          <Route path="/registration" component={Registration} />
          <Route path="/search" component={Search} />
          <Route path="/list" component={List} />
          <Route path="/user_registration" component={User_registration} />
          <Route path="/dashboard/vaccines_stock" component={StationVaccinesCurrent} />
          <Route path="/dashboard/immunization_record" component={VaccineAdministartionTable} />
          <Route path="/dashboard/vaccine_coverage" component={VaccineCoverageGraph} />
          <Route path="/dashboard/area_coverage" component={AreaCoverageMap} />
          <Route path="/dashboard/immunization_register" component={ImmunizationRegister} />
          <Footer />
        </div>
      </div>
    </div>
  )
};

const mapStateToProp = state => ({
  mobileNavVisibility: state.Layout.mobileNavVisibility
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  hideMobileMenu: () => dispatch(setMobileNavVisibility(false))
});

export default withRouter(connect(mapStateToProp, mapDispatchToProps)(Main));
