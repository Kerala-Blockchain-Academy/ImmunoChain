import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Collapse } from 'react-bootstrap';


class Nav extends Component {

  state = {};

  render() {
    let { location } = this.props;
    return (
      <ul className="nav">

        <li className={this.state.graphMenuOpen ? 'active' : null}>
          {/* <Link to="/"> */}
          <a href="#/" onClick={() => this.setState({ graphMenuOpen: !this.state.graphMenuOpen })} data-toggle="collapse">
            <i className="pe-7s-note2"></i>
            <p>Vaccination Analytics<b className="caret"></b></p>
          </a>
          {/* </Link> */}
          <Collapse in={this.state.graphMenuOpen}>
            <div>
              <ul className="nav">
                <li>
                  <Link to="/dashboard/vaccines_stock">VACCINES IN STOCK</Link>
                  {/* <a onClick={() => {
                    // this.tableRef.current.scrollIntoView(
                    //   { //auto scroll to table
                    //     behavior: 'smooth',
                    //     block: 'start',

                    //   }
                    // );
                  }}><i className="fas fa-syringe"></i>VACCINES IN STOCK</a> */}
                </li>
                <li>
                  <Link to="/dashboard/immunization_register">IMMUNIZATION REGISTER</Link>
                  {/* <a>IMMUNIZATION REGISTER</a> */}
                </li>
                <li>
                  <Link to="/dashboard/immunization_record">VACCINE ADMINISTRATION</Link>
                  {/* <a>IMMUNIZATION REGISTER</a> */}
                </li>

                <li>
                  <Link to="/dashboard/vaccine_coverage">VACCINE COVERAGE</Link>
                  {/* <a>IMMUNIZATION REGISTER</a> */}
                </li>

                {/* <li>
                  <Link to="/dashboard/area_coverage">AREA COVERAGE</Link>
                </li> */}

              </ul>
            </div>
          </Collapse>
        </li>





        {/* <li className={location.pathname === '/' ? 'active' : null}>
          <Link to="/">
            <i className="pe-7s-graph1"></i>
            <p>Vaccination Graph</p>
          </Link>
        </li> */}

        <li className={this.isPathActive('/registration') || this.state.mapMenuOpen ? 'active' : null}>
          <Link to="/registration/family">
            <i className="pe-7s-note"></i>
            <p>Registration</p>
          </Link>
        </li>

        <li className={location.pathname === '/list' ? 'active' : null}>
          <Link to="/list">
            <i className="pe-7s-note2"></i>
            <p>Beneficiary List</p>
          </Link>
        </li>

        <li className={location.pathname === '/user_registration' ? 'active' : null}>
          <Link to="/user_registration">
            <i className="pe-7s-note"></i>
            <p>User Registration</p>
          </Link>
        </li>

      </ul>
    );
  }

  isPathActive(path) {
    return this.props.location.pathname.startsWith(path);
  }
}

export default withRouter(Nav);
