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
  Button,
  Vibration,
  AsyncStorage,
  NativeModules,
  NativeEventEmitter,
  PermissionsAndroid,
} from "react-native";
import * as Service from "./Service";
import DropdownAlert from 'react-native-dropdownalert';
import BarCodeScanner from 'react-native-qrcode-scanner';
import RNPickerSelect from "react-native-picker-select";
import uuid from "react-native-uuid";
import Spinner from 'react-native-loading-spinner-overlay';
import i18n from "i18n-js";
import { StackActions, NavigationActions } from "react-navigation";
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
      hasCameraPermission: null,
      batch_id: "",
      station_name: "",
      station_address: "",
      station_code: "",
      station_ID: null,
      response: "",
      Qr_image: "",
      Qr_image_status: false,
      showcam: false,
      station_id: "",
      sta_det: [],
      station_flag: false,
      status: "",
      lang: "en",
      dose: "",
      showview: false,
      station_vaccine: [],
      stations: [],
      current_station: {},
      vaccine_Data: {},
      to_station: {},
      dose_count: null,
      uuid: null,
      expiry_date: "",
      comments: "",
      PrintQRData: "",
      PrintStatus: "",
      PrintProgress: false,
    };
  }

  componentDidMount() {
    this._getAsyncData();
    this._request_stations();
    this._setlanguage();
    this._requestCameraPermission();

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

  _setlanguage = () => {
    try {
      AsyncStorage.getItem("App_Language").then(value =>
        this.setState({ lang: value })
      );
    } catch (error) {
      console.log("AsyncStorage error: " + error.message);
    }
  }

  _getAsyncData = async () => {
    try {
      const station_data = Service._get_station_details();
      station_data.then((x) => {
        console.log("knkdc=", x.station_id)
        this.setState({
          current_station: x,
          current_station_id: x.station_id,
          current_station_code: x.station_code,
          current_station_name: x.station_name,
          current_station_address: x.station_address
        })
        this._VaccineDetails();
      })


    } catch (error) {
      console.log(error)
    }
  }

  _VaccineDetails = () => {
    try {
      let station_id = this.state.current_station.station_id
      let type = "send"
      const response = Service._getVaccineDetails(station_id, type);
      response.then((d) => {
        if (d != undefined) {
          if (d.status_code == 200) {
            let station_vaccine = d.station_vaccine
            this.setState({ station_vaccine: station_vaccine })
            let station = station_vaccine.map(function (item, itemIndex) {
              return {
                label: item.package_id + " (" + item.name + ") ",
                value: item.uuid,
                key: item.uuid

              };
            });
            this.setState({ stations: station });
          }
          else if (d.status_code == 501) {
            alert("Session Expired Login again")
            this.props.navigation.dispatch(resetAction);

          }
          else if (d.status_code == 400 || d.status_code == 404) {
            this.dropDownAlertRef.alertWithType('error', 'Error', d.status_msg);
          }
          else {
            this.dropDownAlertRef.alertWithType('error', 'Error', "Internal Server Error");
          }
        }
        else {
          console.log("Data is Undefined")
        }
      })

    } catch (e) {
      console.log(e)
    }
  }
  checkBatchNum(num) {

    if (String(num) != "") {
      let charRegex = new RegExp("^[0-9]+$");
      if (charRegex.test(num)) {
        this.setState({ dose: num })

      } else {

        this.dropDownAlertRef.alertWithType('error', 'Error', "Decimals are not allowed");

      }
    }
    else {
      this.setState({ dose: num })

    }

  }

  checkBatchNum(num) {

    if (String(num) != "") {
      let charRegex = new RegExp("^[0-9]+$");
      if (charRegex.test(num)) {
        this.setState({ dose: num })

      } else {

        this.dropDownAlertRef.alertWithType('error', 'Error', "Decimals are not allowed");

      }
    }
    else {
      this.setState({ dose: num })

    }

  }

  _request_stations() {

    const stationDet = global.MyVar.stations;

    console.log("333", stationDet)
    var datas = stationDet.stations_list.map(function (item, itemIndex) {
      console.log("itemsss", item)
      return {
        label: item.station_code + " " + item.station_name,
        value: item,
        key: item.station_id

      };
    });


    this.setState({ sta_det: datas });
  }


  _requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Permissions',
          message:
            'QR Scanner needs access to your camera. ' +
            'Do you want to proceed?',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the camera');
        this.setState({
          hasCameraPermission: true
        });
      } else {
        console.log('Camera permission denied');
        this.setState({
          hasCameraPermission: false
        });
      }
    } catch (err) {
      console.warn(err);
    }

  };

  _getscancam = () => {
    if (this.state.showcam == false) {
      this.setState({
        showcam: true
      });
    } else {
      this.setState({
        showcam: false
      });
    }
  };
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


  componentWillMount() {
    BackHandler.addEventListener("hardwareBackPress", this.onBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.onBackPress);
  }

  _alertmsg = () => {
    this.setState({ showcam: false });
    this.dropDownAlertRef.alertWithType('error', 'Error', "Invalid QR code");
  }

  handleBarCodeScanned = ({ type, data }) => {
    try {
      let read_data = JSON.parse(data)
      if (read_data.VAC_key) {
        let Qr_data = JSON.parse(read_data.VAC_key)
        console.log("datta", Qr_data)
        this.vaccine_fetch_fn(Qr_data.uuid);
        Vibration.vibrate();
        this.setState({ showcam: false });
      }
      else {
        this.setState({ uuid: null })
        this._alertmsg();
      }
    } catch (error) {
      console.log(error)
      this._alertmsg();
    }

  };

  onBackPress = () => {
    //Code to display alert message when use click on android device back button.
    this.props.navigation.goBack(null);
    return true;
  };

  _getTextInputValue = () => {


    console.log("tostation", this.state.to_station)
    console.log("current", this.state.current_station)

    let Uuid = uuid.v1();
    if (isNaN(this.state.dose) || this.state.dose < 1) {
      this.dropDownAlertRef.alertWithType('error', 'Error', "Dose count must be a Positive Number");
    }
    else if (this.state.to_station.station_code == this.state.current_station.station_code) {
      this.dropDownAlertRef.alertWithType('error', 'Error', "Vaccinations cant be sent to the current station");
    }
    else if (
      Uuid &&
      ("station_code" in this.state.to_station) &&
      this.state.dose
    ) {

      let send_data = this.state.vaccine_Data
      console.log("tostatation", this.state.to_station)
      console.log("keyS", send_data)
      send_data["dose_count"] = this.state.dose.trim()
      send_data["uuid"] = Uuid
      send_data["to_station"] = this.state.to_station
      send_data["from_station"] = this.state.current_station
      send_data["comments"] = this.state.comments

      //Qr code data
      var Qrdata = {
        uuid: Uuid,
        package_id: send_data.package_id,
        dose_count: this.state.dose.trim(),
        name: send_data.name,
      }

      //Post the details of vaccine
      console.log("---sendData---", send_data)
      const response = Service._sendVaccineData(send_data)
      response.then((d) => {
        console.log("hdoihf=", d)
        return d
      }).then((data) => {
        console.log("errorData", data)
        let status = data.status_code
        if (status == 200) {
          const qdata = {
            data: JSON.stringify(Qrdata),
            key: "VAC_key"
          }
          this.setState({ PrintQRData: JSON.stringify(qdata) });

          //Post the data for generating QR
          const Qr_data = Service._getQrcode(qdata);

          Qr_data.then((d) => {
            console.log("kdsak2222=", d)
            if (d.image_string) {
              let image = d.image_string;
              this.setState({ Qr_image: image, Qr_image_status: true })
            }
            else {
              this.dropDownAlertRef.alertWithType('error', 'Error', " Invalid Data");
            }
          })
        }
        else if (status == 501) {
          alert("Session Expired Login again")
          this.props.navigation.dispatch(resetAction);
        }
        else if (status == 500) {
          this.dropDownAlertRef.alertWithType('error', 'Error', "Internal Server Error");
        }
        else if (status == 400) {
          this.dropDownAlertRef.alertWithType('error', 'Error', data.status_msg);
        }
        else {
          this.dropDownAlertRef.alertWithType('error', 'Error', "Wrong request processed");
          // this.props.navigation.dispatch(resetAction);
        }
      })
    }
    else {
      this.dropDownAlertRef.alertWithType('error', 'Error', " Required Fields Missing");
    }
  };

  vaccine_fetch_fn = (uuid) => {
    if (uuid != null) {

      this.setState({
        dose: "",
        station_ID: null,
        comments: ""

      })
      let response = Service._get_vaccineInfo(uuid);
      response.then(d => {
        console.log("check_details", d)
        if (d != undefined) {
          if (d.status_code == 200) {

            let validation = true
            let vacData = d.data
            console.log("----uuid Data----", vacData)

            if (validation) {
              console.log("Int0 Validations")
              // console.log("validData",vacData)
              if (vacData.to_station.station_code == this.state.current_station.station_code) {

                this.vaccineTak_fn(vacData)

              }

              else {
                this.setState({
                  showcam: false
                });
                this.dropDownAlertRef.alertWithType('error', 'Error', "Vaccine not belongs to current station");
              }
            }

            else {
              console.log("N0 validations")
              this.vaccineTak_fn(vacData)

            }

          }

          else if (d.status_code == 501) {

            alert("Session Expired Login again")
            this.props.navigation.dispatch(resetAction);

          }

          else if (d.status_code == 400 || d.status_code == 404) {
            this.setState({
              showcam: false
            });
            this.dropDownAlertRef.alertWithType('error', 'Error', d.status_msg);
          }
          else {
            this.setState({
              showcam: false
            });
            this.dropDownAlertRef.alertWithType('error', 'Error', "Internal Server Error... Try again Later");
          }
        }
        else {
          console.log("Data is Undefined")
        }
      })
    }
    else {
      this.setState({
        vaccine_Data: {},
        uuid: null,
        showview: false,
        dose_count: null,
        expiry_date: ""

      })

    }
  }

  onPress = () => {
    this.setState({

      vaccine_Data: {},
      to_station: {},
      dose_count: null,
      dose: "",
      uuid: null,
      expiry_date: "",
      comments: "",
      batch_id: "",
      station_ID: null,
      showview: false,
      Qr_image: "",
      Qr_image_status: false,
      showcam: false,
    })

    this._VaccineDetails()

  }

  vaccineTak_fn = (vaccine) => {

    console.log("vaccinefn", vaccine)
    let dose_count = vaccine.dose_count

    delete vaccine.date_time;
    delete vaccine.validation;
    delete vaccine.to_station;
    delete vaccine.dose_count;
    delete vaccine.from_station;

    vaccine.status = "send"
    vaccine.previous_uuid = vaccine.uuid

    delete vaccine.uuid;

    this.setState({
      to_station: {},
      dose_count: dose_count,
      vaccine_Data: vaccine,
      showview: true,
      uuid: vaccine.previous_uuid,
      station_ID: null,
      expiry_date: Service.date_change(vaccine.expiry_date),

    })

  }

  handleChangeOption(station) {
    if (station != null) {
      if (station != "oth") {
        this.setState({
          to_station: station,
          station_ID: station.station_id,
          station_flag: false
        });

      } else {

        this.setState({
          to_station: {},
          station_flag: true
        });
      }
    }
    else {
      this.setState({
        to_station: {},
        station_flag: false,
        station_ID: null
      });
    }
  }


  date_change = (date) => {
    if (date != null) {
      let value = date.yyyy + "-" + date.mm + "-" + date.dd;
      return value;
    } else return null;
  }
  render() {
    i18n.locale = this.state.lang;

    return (
      <>
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

          <View style={{ backgroundColor: '#008abe', paddingTop: '.1%', height: '10%', alignContent: 'center', paddingBottom: '.5%' }}>
            <Text style={styles.title}> {i18n.t("STOCKOUT")}</Text>
          </View>

          <ScrollView style={{ width: "100%", marginTop: ".1%" }} keyboardShouldPersistTaps="always">
            {this.state.showcam == false && this.state.Qr_image_status == false && (
              <View >
                <Text style={styles.Text}>{i18n.t("SCANQRCODE")} </Text>
                <TouchableOpacity
                  onPress={this._getscancam}
                  style={[styles.buttonstyle, styles.Button]}
                >
                  <Image style={styles.inputIcon} source={require("../assets/icons8-qr-code-24.png")} />
                </TouchableOpacity>

                <Text style={styles.TextOr}>OR</Text>

                <View style={styles.pickerStyle}>
                  <RNPickerSelect
                    placeholder={{
                      label: i18n.t("SelectBatchId"),
                      value: null,
                      key: null
                    }}
                    onValueChange={value => this.vaccine_fetch_fn(value)}
                    items={this.state.stations}
                    ref={ref => (this.AgeselectionPicker = ref)}

                  />
                </View>
                {this.state.showview && (
                  <View>
                    <View style={styles.FPanel}>
                      <Text style={styles.Text}>{i18n.t("BatchID")}</Text>
                      <View style={styles.inputContainer}>
                        <TextInput
                          style={styles.TextInputStyle}
                          editable={false}
                          value={this.state.vaccine_Data.package_id}
                          onChangeText={text => this.setState({ batch_id: text })}
                        />
                      </View>
                      <Text style={styles.Text}>{i18n.t("ex_date")} </Text>
                      <View style={styles.inputContainer}>


                        <TextInput
                          style={styles.TextInputStyle}
                          editable={false}
                          value={this.state.expiry_date.toString()}
                        />

                      </View>
                    </View>
                    <Text style={styles.Text}> {i18n.t("SendVaccineTo")}</Text>
                    <View style={styles.pickerStyle}>
                      <RNPickerSelect
                        placeholder={{
                          label: i18n.t("SelectaStation"),
                          value: null,
                          key: null
                        }}
                        onValueChange={value => this.handleChangeOption(value)}
                        items={this.state.sta_det}
                        value={this.state.to_station} />
                    </View>


                    {this.state.station_flag && (
                      <View >
                        <Text style={styles.Text}>
                          {i18n.t("SessionSiteName")}{" "}
                        </Text>
                        <View style={styles.inputContainer}>
                          <TextInput
                            style={styles.TextInputStyle}
                            onChangeText={text =>
                              this.setState({ station_name: text })
                            }
                            value={this.state.station_name}
                          />
                        </View>
                        <Text style={styles.Text}>
                          {i18n.t("SessionSiteAddress")}{" "}
                        </Text>
                        <View style={styles.inputContainer}>
                          <TextInput
                            style={styles.TextInputStyle}
                            onChangeText={text =>
                              this.setState({ station_address: text })
                            }
                            value={this.state.station_address}
                          />
                        </View>
                      </View>
                    )}
                    <Text style={styles.Text}>{i18n.t("NoofDose")}</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.TextInputStyle}
                        placeholder={"Maximum Dose " + this.state.dose_count}
                        keyboardType='numeric'
                        onChangeText={text => this.checkBatchNum(text.trim())}
                        value={this.state.dose}
                      />

                    </View>
                    <Text style={styles.Text}>{i18n.t("Comments")}</Text>

                    <View style={styles.inputContainerb}>
                      <TextInput
                        style={styles.TextInputStyle}
                        placeholder={"Comments"}
                        maxLength={100}
                        value={this.state.comments.toString()}
                        onChangeText={text => this.setState({ comments: text.trimLeft() })}
                      />
                    </View>
                    <TouchableOpacity
                      onPress={this._getTextInputValue}
                      style={[styles.buttonContainer, styles.Button]}
                    >
                      <Text style={styles.buttonText}>
                        {" "}
                        {i18n.t("GenerateQR")}{" "}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {this.state.Qr_image_status && (
              <View style={styles.Panel}>
                <Image
                  source={{
                    uri: `data:image/gif;base64,${this.state.Qr_image}`
                  }}
                  style={{
                    marginBottom: 20,
                    height: 200,
                    width: 200,
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


            {this.state.showcam && (
              <View style={{ flex: 1 }}>
                <BarCodeScanner
                  onRead={this.handleBarCodeScanned}
                  showMarker={true}
                  bottomContent={
                    <Button
                      title={"Cancel"}
                      onPress={() => this.setState({ showcam: false })}
                    />
                  }
                />

              </View>
            )}
          </ScrollView>

        </View>
      </>


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
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 20,
    fontWeight: "bold"
  },
  Text: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    alignSelf: "center",
    justifyContent: "center",
    color: 'black',

  },

  TextOr: {
    fontSize: 20,
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 10
  },




  TextInputStyle: {
    height: 45,
    marginLeft: 20,
    borderBottomColor: '#FFFFFF',
    flex: 1,
    fontSize: 15,
    fontWeight: "bold",
    color: 'black',
  },
  inputIcon: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignSelf: "center"
  },



  buttonstyle: {
    height: 100,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: "center",
    marginBottom: 20,
    width: 100,
    borderRadius: 30,
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
  FPanel: {

    backgroundColor: '#04759E',
    marginHorizontal: "10%",
    marginVertical: "10%"
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
  inputContainerb: {
    borderBottomColor: '#F5FCFF',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    borderBottomWidth: 1,
    marginTop: 10,
    width: 270,
    height: 80,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: "center",
    shadowColor: "#808080",
  },
  pickerStyle: {
    width: 270,
    color: '#344953',
    alignSelf: "center",
    marginTop: 10,
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
