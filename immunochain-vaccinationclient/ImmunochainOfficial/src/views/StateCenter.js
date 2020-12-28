import React, { Component } from "react";
import {
  StyleSheet,
  AppRegistry,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  BackHandler,
  ScrollView,
  AsyncStorage,
  NativeEventEmitter,
  NativeModules,
} from "react-native";
import uuid from "react-native-uuid";
import RNPickerSelect from "react-native-picker-select";
import i18n from "i18n-js";
import DropdownAlert from 'react-native-dropdownalert';
import { StackActions, NavigationActions } from "react-navigation";
import DatePicker from "react-native-datepicker";
import Spinner from 'react-native-loading-spinner-overlay';

import * as Service from "./Service";
import InnerHeader from "../components/InnerHeader";
import PrintQR from './../services/printer/PrintQR';


const resetAction = StackActions.reset({
  index: 0,
  actions: [NavigationActions.navigate({ routeName: "Login" })]
});

i18n.fallbacks = true;

i18n.locale = NativeModules.I18nManager.localeIdentifier;
i18n.translations = {
  en: require("../translations/en.json"),
  ml: require("../translations/ml.json"),
  hi: require("../translations/hi.json")
};

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      batch_id: "",
      package_type_id: "1",
      dose_count: "",
      response: "",
      Qr_image: "",
      Uuid: "",
      Qr_image_status: false,
      isDone: false,
      station_flag: false,
      status: " ",
      lang: "en",
      vaccine_name: null,
      manufacturing_date: null,
      expiry_date: null,
      manufacturer_info: null,
      vaccineName: [],
      current_station: {},
      PrintQRData: "",
      PrintStatus: "",
      PrintProgress: false,
    };
  }
  printQR = async () => {
    PrintQR.print(
      this.state.PrintQRData,
      (message) => {
        console.log("Event: ", message)
        if (message === "Printing initiated")
          this.setState({ PrintStatus: "Please wait", PrintProgress: true })
        else if (message === "Printer not configured")
          this.dropDownAlertRef.alertWithType('error', 'Printer', "You haven't configured any printer yet");
        else
          this.dropDownAlertRef.alertWithType('error', 'Printer', "Printing Failed");
      },
    )
  }


  _downloadQR = async () => {
    console.log("this.state.Qr_image", this.state.Qr_image);
    this.printQR();
  };
  componentDidMount() {

    this._request_vaccine();
    const station_data = Service._get_station_details();
    station_data.then((x) => {
      this.setState({
        current_station: x
      })
    })

    try {
      AsyncStorage.getItem("App_Language").then(value =>
        this.setState({ lang: value })
      );
    } catch (error) {
      console.log("AsyncStorage error: " + error.message);
    }

    i18n.locale = this.state.lang;
    //This event Listener will get the Status of Printing Process
    const PrinterQREventListener = new NativeEventEmitter(NativeModules.PrintQR);
    PrinterQREventListener.addListener('PrinterResponce', (event) => {
      console.log("Event: ", event.Status)

      if (event.Status === "Printing completed") {
        this.dropDownAlertRef.alertWithType('info', 'Printer', "Print Completed");
        this.setState({ PrintProgress: false, PrintStatus: "" })
      } else {
        this.setState({ PrintStatus: event.Status })
      }
    })
  }

  _request_vaccine = () => {

    const stationDet = global.MyVar.vaccine_names;
    var datas = Object.keys(stationDet).map(function (item) {
      return {
        label: item,
        value: item,
        key: item,

      };
    });

    this.setState({ vaccineName: datas });
  }

  componentWillMount() {
    BackHandler.addEventListener("hardwareBackPress", this.onBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.onBackPress);
  }

  onBackPress = () => {
    //Code to display alert message when use click on android device back button.
    this.props.navigation.goBack(null);
    return true;
  }

  _getTextInputValue = () => {

    if (
      this.state.batch_id != '' &&
      this.state.manufacturing_date &&
      this.state.expiry_date &&
      this.state.vaccine_name &&
      this.state.dose_count > 0
    ) {

      if (isNaN(this.state.dose_count) || this.state.dose_count < 1) {
        this.dropDownAlertRef.alertWithType('error', 'Error', "Dose count must be a postive number");
      }

      else {

        let Uuid = uuid.v1();
        const data = {
          uuid: Uuid,
          package_id: this.state.batch_id.trimRight(),
          package_type_id: "1",
          name: this.state.vaccine_name,
          manufacturing_date: Service.changeto_date_string(this.state.manufacturing_date),
          expiry_date: Service.changeto_date_string(this.state.expiry_date),
          manufacturer_info: this.state.manufacturer_info,
          from_station: this.state.current_station,
          to_station: this.state.current_station,
          dose_count: this.state.dose_count,
          previous_uuid: null,
          status: "received"
        };

        Qrdata = {
          uuid: Uuid,
          package_id: this.state.batch_id.trimRight(),
          dose_count: this.state.dose_count,
          name: this.state.vaccine_name,
        }

        console.log("send=", data)
        //Post the details of vaccine
        const response = Service._sendVaccineData(data)
        response.then((d) => {
          console.log("bdjsb", d)
          status = d.status_code
          return status
        })
          .then((data) => {
            let status = data
            console.log("67t3e67=", data)
            if (status == 200) {
              const q_data = {
                data: JSON.stringify(Qrdata),
                key: "VAC_key"
              }

              this.setState({ PrintQRData: JSON.stringify(q_data) });
              console.log("===============Checking QR Data==================", this.state.PrintQRData)
              //Post the data for generating QR
              const Qr_data = Service._getQrcode(q_data);
              Qr_data.then((d) => {
                if (d.image_string) {
                  image = d.image_string
                  this.setState(
                    {
                      Qr_image: image,
                      Qr_image_status: true
                    })
                }
                else {
                  this.dropDownAlertRef.alertWithType('error', 'Error', "Invalid Data, Generate QR code again");
                }
              })
            }
            else if (status == 501) {

              alert("Session Expired Login again")
              this.props.navigation.dispatch(resetAction);

            }
            else if (status == 400 || status == 404) {
              this.dropDownAlertRef.alertWithType('error', 'Error', data.status_msg);
            }

            else {
              console.log("error in data sent")
              this.dropDownAlertRef.alertWithType('error', 'Error', "Internal Server Error... Try again Later");
            }
          })
      }
    } else {
      this.dropDownAlertRef.alertWithType('error', 'Error', "All the Fields are Mandatory. Please Fill all the Fields");

    }
  };


  onPress = () => {
    this.setState({
      Qr_image_status: false,
      dose_count: null,
      batch_id: null,
      manufacturing_date: null,
      expiry_date: null,
      manufacturer_info: null,
    })

  }
  handleChangeVaccine = (value) => {
    this.setState({
      vaccine_name: value,
      manufacturing_date: null,
      expiry_date: null,
      manufacturer_info: null,
      batch_id: "",
      dose_count: ""
    })
  }

  checkBatchId(batch_id) {

    if (String(batch_id) != "") {
      let charRegex = new RegExp("^[A-Za-z0-9-_/\ ]+$");
      if (charRegex.test(batch_id)) {
        this.setState({ batch_id: batch_id })

      } else {

        this.dropDownAlertRef.alertWithType('error', 'Error', "Special charecters are not allowed");

      }

    }
    else {
      this.setState({ batch_id: "" })
    }

  }

  checkBatchNum(num) {

    if (String(num) != "") {
      let charRegex = new RegExp("^[0-9]+$");
      if (charRegex.test(num)) {
        this.setState({ dose_count: num })

      } else {

        this.dropDownAlertRef.alertWithType('error', 'Error', "Decimals are not allowed");

      }
    }
    else {
      this.setState({ dose_count: num })

    }

  }


  render() {
    i18n.locale = this.state.lang;
    return (
      <View style={styles.MainContainer}>
        <View>
          <DropdownAlert ref={ref => this.dropDownAlertRef = ref} />
        </View>
        <View>
          <Spinner
            visible={this.state.PrintProgress}
            textContent={this.state.PrintStatus}
            animation={"fade"}
            overlayColor={"rgba(0, 0, 0, 0.75)"}
            size={"large"}
          />
        </View>
        <InnerHeader navigation={this.props.navigation} />
        <View style={{ backgroundColor: '#008abe', paddingTop: '.1%', height: '15%', alignContent: 'center', paddingBottom: '.5%' }}>
          <Text style={styles.title}> {i18n.t("VaccineReg")} </Text>
        </View>

        <ScrollView style={{ width: "100%" }} keyboardShouldPersistTaps="always">
          <View >
            {this.state.Qr_image_status == false && (
              <View>
                <Text style={styles.Text}>{i18n.t("Vaccinename")}</Text>
                <View style={styles.pickerStyle}>
                  <RNPickerSelect
                    placeholder={{
                      label: i18n.t("SelectVaccine"),
                      value: null,
                      key: null
                    }}
                    onValueChange={value => this.handleChangeVaccine(value)}
                    items={this.state.vaccineName}
                  />
                </View>
                <Text style={styles.Text}>{i18n.t("EntertheBatchID")} </Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.TextInputStyle}
                    mode='outlined'
                    keyboardType='ascii-capable'
                    underlineColorAndroid='transparent'
                    onChangeText={text => this.checkBatchId(text.trimLeft())}
                    value={this.state.batch_id}
                    underlineColorAndroid="transparent"
                  />
                  <Image style={styles.inputIcon} source={require("../assets/icons8-doctors-bag-48.png")} />
                </View>

                <Text style={styles.Text}>{i18n.t("NoofDose")} </Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.TextInputStyle}
                    keyboardType='numeric'
                    onChangeText={text => this.checkBatchNum(text.trim())}
                    value={this.state.dose_count}
                  />
                  <Image style={styles.inputIcon} source={require("../assets/icons8-syringe-16.png")} />
                </View>
                <Text style={styles.Text}>{i18n.t("ma_date")} </Text>
                <View style={styles.inputContainer}>
                  <DatePicker
                    style={{ marginLeft: 10, backgroundColor: "#fff", width: "85%" }}
                    mode="date"
                    date={this.state.manufacturing_date}
                    placeholder={i18n.t("ma_date")}
                    format="DD-MM-YYYY"
                    maxDate={new Date()}
                    onDateChange={(date) => {
                      this.setState({ manufacturing_date: date });
                    }}
                  />
                </View>
                <Text style={styles.Text}>{i18n.t("ex_date")} </Text>
                <View style={styles.inputContainer}>
                  <DatePicker
                    style={{ marginLeft: 10, backgroundColor: "#fff", width: "85%" }}
                    mode="date"
                    date={this.state.expiry_date}
                    placeholder={i18n.t("ex_date")}
                    format="DD-MM-YYYY"
                    minDate={new Date()}
                    onDateChange={(date) => {
                      this.setState({ expiry_date: date });
                    }}
                  />
                </View>
                <Text style={styles.Text}>{i18n.t("manufacturer_info")} </Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.TextInputStyle}
                    keyboardType='ascii-capable'
                    onChangeText={text => this.setState({ manufacturer_info: text.trimLeft() })}
                    value={this.state.manufacturer_info}
                  />
                </View>
                <TouchableOpacity
                  onPress={this._getTextInputValue}
                  style={[styles.buttonContainer, styles.Button]}
                >
                  <Text style={styles.buttonText}>{i18n.t("RegisterVaccine")}  </Text>
                </TouchableOpacity>
              </View>
            )}


            {this.state.Qr_image_status && (
              <View style={styles.Panel}>
                <Image
                  source={{
                    uri: `data:image/png;base64,${this.state.Qr_image}`
                  }}
                  style={{
                    width: 200,
                    height: 200,
                    alignSelf: "center"
                  }}
                />
                <TouchableOpacity
                  onPress={this._downloadQR}
                  activeOpacity={0.7}
                  style={[styles.buttonContainer, styles.Button]}
                >
                  <Text style={styles.buttonText}>{i18n.t("PrintQRCode")}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={this.onPress}
                  activeOpacity={0.7}
                  style={[styles.buttonContainer, styles.Button]}
                >
                  <Text style={styles.buttonText}>{i18n.t("done")}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

    );
  }
}
AppRegistry.registerComponent("App", () => App);

const resizeMode = 'center';

const styles = StyleSheet.create({
  MainContainer: {
    flex: 1,
    resizeMode,
    backgroundColor: "#008abe",
    justifyContent: 'center',
  },
  Panel: {
    backgroundColor: "#008abe",
    alignSelf: "center",
    justifyContent: "center",
    width: "95%",
    borderRadius: 5,
    marginTop: 35,
    padding: 5,
    marginBottom: 25,
    paddingTop: 5
  },
  title: {
    fontSize: 28,
    alignSelf: "center",
    marginTop: 30,
    marginBottom: 40,
    fontWeight: "bold"
  },
  Text: {
    fontSize: 20,
    fontWeight: "bold",
    alignSelf: "center"
  },

  Text1: {
    fontSize: 18,
    marginLeft: 20
  },

  TextInputStyle: {
    height: 45,
    marginLeft: 20,
    borderBottomColor: '#FFFFFF',
    flex: 1,
    fontSize: 15,
    fontWeight: "bold"
  },

  button: {
    backgroundColor: "#0D47A1",
    marginTop: 20,
    width: 270,
    height: 45,
    marginBottom: 20,
    alignSelf: "center",
    borderRadius: 30,
  },
  buttonText: {
    fontSize: 20,
    color: "white",
    alignSelf: "center",
    fontWeight: "bold",
  },
  bgImage: {
    flex: 1,
    resizeMode,
    backgroundColor: "#008abe",
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  inputContainer: {
    borderBottomColor: '#F5FCFF',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    borderBottomWidth: 1,
    marginTop: 10,
    width: 270,
    height: 45,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: "center",
    shadowColor: "#808080",
  },
  inputIcon: {
    width: 30,
    height: 30,
    marginRight: 15,
    justifyContent: 'center'
  },
  pickerStyle: {
    width: 270,
    color: '#344953',
    alignSelf: "center",
    justifyContent: 'center',
    borderBottomColor: '#F5FCFF',
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    borderRadius: 30,
    borderBottomWidth: 1,
    marginBottom: 20,

  },
  buttonContainer: {
    height: 45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: "center",
    marginBottom: 20,
    marginTop: 20,
    width: 270,
    borderRadius: 30,
  },
  Button: {
    backgroundColor: "#205370",
  },
});
