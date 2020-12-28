import React, { Component } from "react";
import MainApp from "./src/navigation/MainApp";
import * as Service from './src/views/Service'

export default class App extends Component {

  componentDidMount() {
    let response = Service._get_app_setting_data();
    response.then((d) => {
      //console.log("Global = ", d)
      global.MyVar = d;
      return d
    })
  }

  render() {
    return (<MainApp />);
  }
}
