import Ionicons from "react-native-vector-icons/Ionicons";
import React, { Component } from "react";
import { Header } from 'react-native-elements'
import { AsyncStorage } from "react-native";
import { RNChipView } from 'react-native-chip-view';

export default class InnerHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lang: "en",
      user_role: "",
      site_name: ""
    }
  }

  onBackPress = () => {
    //Code to display alert message when use click on android device back button.
    this.props.navigation.goBack(null);
    return true;
  }
  onOpenDrawerPress = () => {
    console.log("working")
    //Code to display alert message when use click on android device back button.
    this.props.navigation.openDrawer();
    return true;
  }

  async componentDidMount() {

    let User_Role = await AsyncStorage.getItem('User_Name');
    let Station_Name = await AsyncStorage.getItem('station_name');

    this.setState({
      user_role: User_Role,
      site_name: Station_Name
    });

    console.log("routename:", this.props.navigation.state.routeName)

    if (this.props.navigation.state.routeName == "Home")
      console.log("ppllppll", this.props.rch_details)

  }



  render() {
    console.log("Route Name : ", this.props.navigation.state.routeName)
    if (this.props.navigation.state.routeName == "Officials_home") {
      return (
        <Header
          containerStyle={{ backgroundColor: '#fff', height: 50, paddingTop: -20 }}
          leftComponent={
            <Ionicons
              name="md-menu"
              size={34}
              color="#ccc"
              onPress={() => this.onOpenDrawerPress()}
            />}
          centerContainerStyle={{ flex: 5 }}
          centerComponent={
            <RNChipView
              title={this.props.station}
              avatar={false}
              backgroundColor="#E0E6F8"
              titleAllowFontScaling={true}
            />
          }
        />
      );
    } else {
      return (
        <Header
          containerStyle={{ backgroundColor: '#fff', height: 50, paddingTop: -20 }}
          leftComponent={
            <Ionicons
              name="md-arrow-round-back"
              size={34}
              color="black"
              onPress={() => this.onBackPress()}
            />}
          centerContainerStyle={{ flex: 5 }}
          centerComponent={
            <RNChipView
              title={this.state.site_name}
              avatar={false}
              backgroundColor="#E0E6F8"
              titleAllowFontScaling={true}
            />
          }
        />
      );
    }

  }
}
