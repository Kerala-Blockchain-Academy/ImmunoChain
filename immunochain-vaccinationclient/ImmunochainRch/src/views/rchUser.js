import React, { Component } from "react";
import {
  View,
  StyleSheet,
  BackHandler,
  AppRegistry,
  AsyncStorage,
  Text,
  TouchableOpacity
} from "react-native";
import i18n from "i18n-js";
import RNPickerSelect from "react-native-picker-select";
import * as Service from "./Service";
import DropdownAlert from 'react-native-dropdownalert';

export default class Rch_User extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lang: 'en',
      rch_details: [],
      rch_Id_user: null,
    }

  }

  fetch_data() {

    let retDetails = Service.retrieveItem("Rch_Book")
    retDetails.then(rch_details => {
      if (rch_details != null) {
        if (rch_details.length > 1) {
          var datas = rch_details.map(function (item) {
            return {
              label: item.child_name + " (" + item.rch_id + ") ",
              value: item,
              key: item.rch_id
            };
          });

          this.setState({ rch_details: datas });
        }
        else
          this.props.navigation.goBack(null);
      }
      else {
        this.props.navigation.goBack(null);
      }
    })

  }

  componentDidMount() {
    const { navigation } = this.props;
    this.focusListener = navigation.addListener('didFocus', () => {
      let lang = Service._get_language()
      lang.then((x) => {

        this.setState({ lang: x })

      })
      i18n.locale = this.state.lang;
      this.fetch_data()
    });
  }

  componentWillMount() {
    BackHandler.addEventListener("hardwareBackPress", this.onBackPress);
  }

  componentWillUnmount() {
    this.focusListener.remove();
    BackHandler.removeEventListener("hardwareBackPress", this.onBackPress);
  }

  onBackPress = () => {
    //Code to display alert message when use click on android device back button.
    // this.props.navigation.goBack(null);
    return false;
  };


  onsubmit = () => {
    if (this.state.rch_Id_user != null) {

      AsyncStorage.setItem("selectRchID", this.state.rch_Id_user.rch_id)
      this.props.navigation.goBack(null);
    }

    else {
      this.dropDownAlertRef.alertWithType('warn', 'RCH ID Not Selected', "Select a child to continue");
    }
  }


  handleChangeOption = (itemValue) => {

    if (itemValue != null) {
      this.setState({ rch_Id_user: itemValue })
    }
    else {
      this.setState({
        rch_Id_user: null
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
          <Text style={styles.heading}>{i18n.t("RCHUsers")}</Text>
          <Text style={styles.subHeading}>{i18n.t("Selectchild")}</Text>
          <View style={styles.pickerStyle}>
            <RNPickerSelect
              placeholder={{
                label: "Select child",
                value: null,
                key: null
              }}
              onValueChange={value => this.handleChangeOption(value)}
              items={this.state.rch_details}
              value={this.state.rch_Id_user}
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

AppRegistry.registerComponent("Rch_user", () => Rch_User);


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
  pickerStyle: {
    width: 270,
    color: '#344953',
    alignSelf: "center",
    justifyContent: 'center',
    borderBottomColor: '#F5FCFF',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    borderBottomWidth: 1,
    marginBottom: 20,
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
});
