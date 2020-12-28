import React, { Component } from "react";
import {
  StyleSheet,
  AppRegistry,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  Alert,
  BackHandler,
  ScrollView,
  Button,
  Vibration,
  AsyncStorage,
  NativeModules,
  PermissionsAndroid,
} from "react-native";
import { Table, Row, Rows } from "react-native-table-component";
import { widthPercentageToDP } from 'react-native-responsive-screen';
import DropdownAlert from 'react-native-dropdownalert';
import * as Service from "./Service";
import i18n from "i18n-js";
import BarCodeScanner from 'react-native-qrcode-scanner';
import RNPickerSelect from "react-native-picker-select";
import { StackActions, NavigationActions } from "react-navigation";
import InnerHeader from "../components/InnerHeader";

const resetAction = StackActions.reset({
  index: 0,
  actions: [NavigationActions.navigate({ routeName: "Login" })]
});

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
      QrcodeData: "",
      showcam: false,
      status: "",
      showview: false,
      lang: "en",
      station_vaccine: [],
      stations: [],
      current_station: {},
      vaccine_Data: {},
      manufacturing_date: "",
      expiry_date: "",
      uuid: null,
      lost_doses: null,
      remarks: null
    };
  }

  componentDidMount() {
    console.log("1")
    this._getAsyncData();
    this._requestCameraPermission();
    this._setlanguage();

    i18n.locale = this.state.lang;
  }

  _getAsyncData = async () => {
    try {
      const station_data = Service._get_station_details();
      station_data.then((x) => {
        this.setState({
          current_station: x
        })
        this._VaccineDetails();
      })
    } catch (error) {
      console.log(error)
    }
  }

  _setlanguage = async () => {
    try {
      AsyncStorage.getItem("App_Language").then(value =>
        this.setState({ lang: value })
      );
    } catch (error) {
      console.log("AsyncStorage error: " + error.message);
    }
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


  _VaccineDetails = async () => {
    try {
      let station_id = this.state.current_station.station_id
      let type = "confirm"
      const response = Service._getVaccineDetails(station_id, type);
      response.then((d) => {
        if (d != undefined) {
          if (d.status_code == 200) {
            let station_vaccine = d.station_vaccine
            this.setState({ station_vaccine: station_vaccine })
            let station = station_vaccine.map(function (item) {
              console.log("valitem", item)
              return {
                label: item.package_id + " (" + item.name + ") ",
                value: item.uuid,
                key: item.uuid

              };
            });

            console.log("61", station);
            this.setState({ stations: station });
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
          console.log("Data is undefined")
        }
      })
    } catch (e) {
      console.log(e)
    }
  }


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

  handleBarCodeScanned = ({ data }) => {
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

  _sendconformation = () => {
    console.log("sssss", this.state.vaccine_Data)
    if (Object.keys(this.state.vaccine_Data.length === 0 && this.state.vaccine_Data.constructor === Object) &&
      this.state.vaccine_Data.status == "received"
    ) {
      const data = this.state.vaccine_Data
      if (this.state.lost_doses != null) {
        let adjustments = {
          "doses": this.state.lost_doses,
          "remarks": this.state.remarks
        }
        data["adjustments"] = adjustments
        delete data.comments;

      }
      console.log("confirm=", data)
      let response = Service._sendVaccineData(data);
      response.then((d) => {
        console.log("nnjdsonc=", d)
        if (d.status_code == 200) {
          //SweatAlert
          Alert.alert("Stock Confirmed", "Stock In Confirmation Success", [
            { text: "OK", onPress: () => this.props.navigation.goBack(null) }
          ]);
        }
        else if (d.status_code == 400 || d.status_code == 404) {
          //SweatAlert
          this.dropDownAlertRef.alertWithType('error', 'Error', d.status_msg);
        }
        else {
          this.dropDownAlertRef.alertWithType('error', 'Error', "Internal Server Error");

        }
      })
    } else {

      this.dropDownAlertRef.alertWithType('error', 'Error', "Scan QR Once Again");
    }
  };


  vaccine_fetch_fn = (uuid) => {
    if (uuid != null) {

      this.setState({
        lost_doses: null,
        remarks: null
      });

      let response = Service._get_vaccineInfo(uuid);
      response.then(d => {
        console.log("check_details", d)
        if (d != undefined) {
          if (d.status_code == 200) {

            let validation = true
            let vacData = d.data
            console.log("vacData", vacData)


            if (validation) {
              console.log("Int0 Validations")
              if (vacData.from_station.station_code != this.state.current_station.station_code) {
                if (vacData.to_station.station_code == this.state.current_station.station_code) {

                  this.vaccineTak_fn(vacData)

                }

                else {
                  this.setState({
                    showcam: false
                  });
                  this.dropDownAlertRef.alertWithType('error', 'Error', "Vaccine does not belongs to current station");
                }
              }
              else {
                this.setState({
                  showcam: false
                });
                this.dropDownAlertRef.alertWithType('warn', 'Warning', "Vaccine already in stock");
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
            this.dropDownAlertRef.alertWithType('error', 'Error', "Internal Server error");

          }
        }
        else {
          console.log("data is undefined")
        }
      })
    }
    else {
      this.setState({
        vaccine_Data: {},
        showview: false,
        expiry_date: "",
        manufacturing_date: "",
        uuid: null,
        lost_doses: null,
        remarks: null

      })

    }
  }

  vaccineTak_fn = (vaccine) => {

    delete vaccine.date_time;
    delete vaccine.validation;

    vaccine.status = "received"
    this.setState({

      uuid: vaccine.uuid,
      vaccine_Data: vaccine,
      showview: true,
      expiry_date: Service.date_change(vaccine.expiry_date),
      manufacturing_date: Service.date_change(vaccine.manufacturing_date)

    })

    console.log("vaccinefn", vaccine)

  }

  checkBatchNum(num) {

    if (String(num) != "") {
      let charRegex = new RegExp("^[0-9]+$");
      if (charRegex.test(num)) {
        this.setState({ lost_doses: num })

      } else {

        this.dropDownAlertRef.alertWithType('error', 'Error', "Decimals are not allowed");

      }
    }
    else {
      this.setState({ lost_doses: num })

    }

  }

  render() {
    i18n.locale = this.state.lang;
    return (
      <>

        <View style={styles.MainContainer}>

          <View>
            <DropdownAlert ref={ref => this.dropDownAlertRef = ref} />
          </View>
          <InnerHeader navigation={this.props.navigation} />


          <View style={{ backgroundColor: '#008abe', paddingTop: '.1%', height: '10%', alignContent: 'center', paddingBottom: '.5%' }}>
            <Text style={styles.title}> {i18n.t("STOCKIN")} </Text>
          </View>


          <ScrollView style={{ width: widthPercentageToDP('100%'), marginTop: ".1%" }} keyboardShouldPersistTaps="always">
            {this.state.showcam == false && (
              <View>
                <Text style={styles.Text}> {i18n.t("SCANQRCODE")}  </Text>
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
                  <View >
                    <View style={styles.Panel}>

                      <Text style={styles.Text}> {i18n.t("BatchID")}</Text>
                      <View style={styles.inputContainer}>
                        <TextInput
                          style={styles.TextInputStyle}
                          editable={false}
                          value={this.state.vaccine_Data.package_id}
                        />
                      </View>
                      <Text style={styles.Text}>{i18n.t("VaccineReceived")}</Text>
                      <View style={styles.inputContainer}>
                        <TextInput
                          style={styles.TextInputStyle}
                          editable={false}
                          value={this.state.vaccine_Data.to_station.station_name}
                        />
                      </View>
                      <Text style={styles.Text}>{i18n.t("VaccineFrom")}</Text>
                      <View style={styles.inputContainer}>
                        <TextInput
                          style={styles.TextInputStyle}
                          editable={false}
                          value={this.state.vaccine_Data.from_station.station_name}
                        />
                      </View>

                      <Table style={styles.dateContainer} borderStyle={{ borderWidth: 0, borderColor: '#c8e1ff' }}>
                        <Row flexArr={[1, 1]} />
                        <Rows data={[
                          [<Text style={styles.dateContainer}>{i18n.t("ma_date")}</Text>,
                          <Text style={styles.dateContainer}>{i18n.t("ex_date")}</Text>
                          ],
                          [
                            <TextInput
                              style={styles.TextInputStyle}
                              editable={false}
                              underlineColorAndroid="transparent"                            >
                              {this.state.manufacturing_date.toString()}
                            </TextInput>,
                            <TextInput
                              style={styles.TextInputStyle}
                              editable={false}
                              underlineColorAndroid="transparent"                            >
                              {this.state.expiry_date.toString()}
                            </TextInput>,
                          ]
                        ]} />
                      </Table>

                      <Text style={styles.Text}>{i18n.t("NoofDose")}</Text>
                      <View style={styles.inputContainer}>
                        <TextInput
                          style={styles.TextInputStyle}
                          editable={false}
                          value={this.state.vaccine_Data.dose_count.toString()}
                        />
                      </View>


                      {this.state.vaccine_Data.comments != "nil" && (
                        <View style={{ flex: 1 }}>

                          <Text style={styles.Text}>{i18n.t("Comments")}</Text>
                          <View style={styles.inputContainerb}>
                            <TextInput
                              style={styles.TextInputStyle}
                              editable={false}
                              value={this.state.vaccine_Data.comments}
                            />
                          </View>
                        </View>)}
                    </View>
                    <Text style={styles.Text}>{i18n.t("LostVaccines")}</Text>
                    <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.TextInputStyle}
                        keyboardType='numeric'
                        placeholder={"Maximum Dose " + this.state.vaccine_Data.dose_count}
                        onChangeText={text => this.checkBatchNum(text.trim())}
                        value={this.state.lost_doses}
                      />
                    </View>

                    <Text style={styles.Text}>{i18n.t("Remarks")}</Text>
                    <View style={styles.inputContainerb}>
                      <TextInput
                        style={styles.TextInputStyle}
                        placeholder="Optional"
                        maxLength={100}
                        onChangeText={text => this.setState({ remarks: text.trimLeft() })}
                        value={this.state.remarks}
                      />
                    </View>

                    <TouchableOpacity
                      onPress={this._sendconformation}
                      style={[styles.buttonContainer, styles.Button]}
                    >
                      <Text style={styles.buttonText}> {i18n.t("CONFIRMSTOCK")} </Text>
                    </TouchableOpacity>
                  </View>
                )}
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
  container: {
    flex: 1,
    resizeMode,
    backgroundColor: "#008abe",
    position: 'absolute',
    width: widthPercentageToDP('100%'),
    height: '100%',
    justifyContent: 'center',
  },
  HeaderContainer: {
    backgroundColor: "#FFFFFF",
    width: '100%',
    height: '10%',
  },

  dateShow: {

    flex: 2,
    flexDirection: 'row',
    resizeMode,
    width: '90%',
    marginHorizontal: '10%'


  },
  dateTextShow: {

    flex: 2,
    flexDirection: 'row',
    resizeMode,
    width: '100%',
    marginHorizontal: '10%'
  },
  MainContainer: {
    flex: 1,
    resizeMode,
    backgroundColor: "#008abe",
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  inputIcon: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignSelf: "center"
  },
  Panel: {

    backgroundColor: '#04759E',
    marginHorizontal: "10%",
    marginVertical: "10%"
  },
  title: {
    fontSize: 30,
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 20,
    fontWeight: "bold"
  },
  Text: {
    fontSize: 20,
    fontWeight: "bold",
    alignSelf: "center",
    marginTop: 5
  },
  TText: {
    fontSize: 20,
    fontWeight: "bold",
    justifyContent: 'center',
    alignSelf: "center",
  },

  TextOr: {
    fontSize: 20,
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 10
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
  dateContainer: {
    backgroundColor: '#3E81A8',
    justifyContent: 'center',
    marginLeft: "6%",
    marginRight: "3%",
    fontSize: 20,
    fontWeight: "bold",
  },
  TextInputStyle: {
    height: 45,
    marginLeft: 20,
    borderBottomColor: '#FFFFFF',
    flex: 1,
    fontSize: 15,
    fontWeight: "bold",
    color: 'black'
  },


  button: {
    height: 36,
    backgroundColor: "#205370",
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 10,
    alignSelf: "stretch",
    justifyContent: "center"
  },

  buttonText: {
    fontSize: 18,
    color: "white",

    alignSelf: "center"
  },
  ExpoContainer: {
    width: "90%"
  },
  BarScanner: {
    flex: 1,
    width: 400,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  buttonstyle: {
    height: 100,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: "center",
    marginBottom: 15,
    width: 100,
    borderRadius: 30,
  },
  Button: {
    backgroundColor: "#205370",
  },

  DateinputContainer: {
    borderBottomColor: '#F5FCFF',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    borderBottomWidth: 1,
    marginTop: 10,
    width: '40%',
    height: 45,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: "center",
    shadowColor: "#808080",
    marginLeft: '5%',
    marginRight: '5%'
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
  buttonContainer: {
    height: 45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: "center",
    marginBottom: 20,
    width: 230,
    borderRadius: 30,
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
  }
});
