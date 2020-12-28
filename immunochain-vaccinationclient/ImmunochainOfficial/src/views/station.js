import React, { Component } from "react";

import {
  View,
  StyleSheet,
  BackHandler,
  AppRegistry,
  TouchableOpacity,
  AsyncStorage,
  Text
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import DropdownAlert from 'react-native-dropdownalert';
import i18n from "i18n-js";
import * as Service from "./Service";

export default class station extends Component {
  constructor(props) {
    super(props);
    this.state = {
      statecenter_view: '',
      lang: 'en',
      chc_phc_view: '',
      stations: [],
      station: null
    }
  }

  componentDidMount() {
    if (!this.props.navigation.getParam("stations_list")) {
      try {
        AsyncStorage.getItem('station_list').then((station) => {
          let stations = JSON.parse(station);
          this._setpicker(stations);
        })
      } catch (e) {
        console.log(e);
      }
    } else {
      let stations = this.props.navigation.getParam("stations_list");
      this._setpicker(stations);
    }

    const { navigation } = this.props;
    this.focusListener = navigation.addListener('didFocus', () => {
      let lang = Service._get_language()
      lang.then((x) => {

        this.setState({ lang: x, station: null })

      })

      i18n.locale = this.state.lang;

    });
  }

  _setpicker = (stations) => {
    let station = stations.map(function (item) {
      return {
        label: item.station_code + " " + item.station_name,
        value: item,
        key: item.station_name

      };
    });
    this.setState({ stations: station });
  }


  componentWillMount() {
    BackHandler.addEventListener("hardwareBackPress", this.onBackPress);
  }

  componentWillUnmount() {
    this.focusListener.remove();
    BackHandler.removeEventListener("hardwareBackPress", this.onBackPress);
  }

  _set_satation_data = async (station) => {
    try {
      AsyncStorage.setItem("station_code", station.station_code);
      AsyncStorage.setItem("station_id", station.station_id.toString());
      AsyncStorage.setItem("station_address", station.station_address);
      AsyncStorage.setItem("station_name", station.station_name);

    } catch (e) {
      console.log(e)
    }

  }

  onBackPress = () => {
    //Code to display alert message when use click on android device back button.
    // this.props.navigation.goBack(null);
    // return true;
    return false;
  };

  onsubmit = () => {
    if (this.state.station)
      this.props.navigation.navigate("Officials_home");

    else {
      this.dropDownAlertRef.alertWithType('warn', 'Station Not Selected', "Choose the station to continue");
    }
  }

  handleChangeOption = (itemValue) => {
    if (itemValue != null) {
      console.log("item=", itemValue)
      this._set_satation_data(itemValue)
      this.setState({
        station: itemValue
      });
    } else {
      this.setState({
        station: null
      });
    }
  }

  render() {
    i18n.locale = this.state.lang;
    return (
      <>
        <View>
          <DropdownAlert ref={ref => this.dropDownAlertRef = ref} />
        </View>
        <View style={styles.container}>
          <Text style={styles.heading}>{i18n.t("StationList")}</Text>
          <Text style={styles.subHeading}>{i18n.t("SelectStation")}</Text>
          <View style={styles.pickerStyle}>
            <RNPickerSelect
              placeholder={{
                label: "Select Station",
                value: null,
                key: null,
              }}
              onValueChange={value => this.handleChangeOption(value)}
              items={this.state.stations}
              ref={ref => (this.AgeselectionPicker = ref)}
              value={this.state.station}
              style={styles.pickerStyle}
              useNativeAndroidPickerStyle={true}
            />
          </View>

          <TouchableOpacity
            onPress={this.onsubmit}
            activeOpacity={0.7}
            style={[styles.buttonContainer, styles.Button]}
          >
            <Text style={styles.buttonText}>Done</Text>
          </TouchableOpacity>

        </View>
      </>
    );
  }
}
AppRegistry.registerComponent("station", () => station);


const resizeMode = 'center';
const styles = StyleSheet.create({
  container: {
    resizeMode,
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    backgroundColor: "#008abe",
  },
  twoPickers: {
    height: 88,
    borderColor: 'black',
    borderWidth: 1,
  },
  twoPickerItems: {
    height: 88,
    color: 'red'
  },
  heading: {
    fontSize: 30,
    alignSelf: "center",
    marginTop: 30,
    marginBottom: 40,
    fontWeight: "bold"
  },
  subHeading: {
    fontSize: 18,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  button: {
    height: 36,
    backgroundColor: "#48BBEC",
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 10,
    alignSelf: "stretch",
    justifyContent: "center"
  },

  Button: {
    backgroundColor: "#205370",
  },

  buttonText: {
    fontSize: 18,
    color: "white",
    alignSelf: "center"
  },

  buttonContainer: {
    height: 45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: "center",
    marginBottom: 20,
    width: 270,
    borderRadius: 30,
  },

  pickerStyle: {
    width: 270,
    color: '#000000',
    textDecorationColor: '#000000',
    alignSelf: "center",
    justifyContent: 'center',
    borderBottomColor: '#F5FCFF',
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    borderBottomWidth: 1,
    marginBottom: 20,
  }
});
