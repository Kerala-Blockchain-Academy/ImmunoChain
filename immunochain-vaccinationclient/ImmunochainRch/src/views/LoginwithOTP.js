import React, { Component } from 'react';
import BarCodeScanner from 'react-native-qrcode-scanner';
import * as Service from './Service'
import DropdownAlert from 'react-native-dropdownalert';


import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableHighlight,
  AsyncStorage,
  Alert,
  TextInput,
  BackHandler,
  PermissionsAndroid
} from 'react-native';


export default class App extends Component {


  constructor(props) {
    super(props);
    this.state = {

      showThis: false,
      status: false,
      hasCameraPermission: null,
      vaccineIdInput: '',
      uData: null,
      OTP: null,

    }
  }


  componentDidMount() {
    const { navigation } = this.props;
    this.focusListener = navigation.addListener('didFocus', () => {
      AsyncStorage.clear()
    });

    this._requestCameraPermission();
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

  componentWillMount() {
    BackHandler.addEventListener("hardwareBackPress", this.onBackPress);
  }

  componentWillUnmount() {
    this.focusListener.remove();
    BackHandler.removeEventListener("hardwareBackPress", this.onBackPress);
  }

  _clearotp() {
    this.setState({ OTP: null, uData: null })
  }
  _alertmsg = () => {
    this.setState(
      {
        status: false,
        showThis: false
      });
    this.dropDownAlertRef.alertWithType('error', 'Error', "Invalid QR Code ");

  }



  _handleBarCodeRead = UserId => {
    try {
      let read_data = JSON.parse(UserId.data)
      console.log("key RCH ID", read_data)

      if (read_data.key_rch_id) {

        this.setState({

          uData: read_data.key_rch_id,
          status: false,
          showThis: false
        });

        var data = {
          pregnancy_id: read_data.key_rch_id,
          phone: "0000000000"

        };

        let response = Service._userLogin_otp(data);
        response.then((d) => {
          if (d.status_code !== undefined) {
            if (d.status_code == 200) {
              AsyncStorage.setItem('RCHBook_ID', read_data.key_rch_id);
              this.dropDownAlertRef.alertWithType('success', 'Success', d.status_msg);
            }
            else if (d.status_code == 400 || d.status_code == 404) {
              console.log("erroe", d)
              this.dropDownAlertRef.alertWithType('error', 'Error', d.status_msg);
            }
            else {
              this.dropDownAlertRef.alertWithType('error', 'Error', "Internal Server Error");
            }
          }
          else {
            console.log(d)
          }
        })
      }
      else {
        this._alertmsg();
      }
    } catch (error) {
      this._alertmsg()
      console.log(error)
    }
  };

  onBackPress = () => {
    //Code to display alert message when use click on android device back button.
    Alert.alert(
      " Exit From App ",
      " Do you want to exit From App ?",
      [
        {
          text: "Yes", onPress: () => {
            BackHandler.exitApp()
          }
        },
        { text: "No", onPress: () => console.log("NO Pressed") }
      ],
      { cancelable: false }
    );

    // Return true to enable back button over ride.
    return true;
  };


  handlePress = () => {
    if (this.state.showThis == false) {
      this.setState({
        status: true,
        showThis: true,
      });
    }
    else {
      this.setState({
        showThis: false
      });
    }
  }


  _userScanQRCode = async () => {

    if (this.state.uData != null) {
      if (this.state.OTP != null) {

        var data1 = {
          pregnancy_id: this.state.uData,
          otp: this.state.OTP,
          access_token_time: 36000,
          refresh_token_time: 36000
        };

        let response = Service._user_otp_login_validation(data1);
        response.then((d) => {
          console.log("otp", d)
          if (d.status_code == 200) {
            this._clearotp();
            this.props.navigation.navigate("Rch_home");
          }

          else if (d.status_code == 400 || d.status_code == 404) {
            this.dropDownAlertRef.alertWithType('error', 'Error', d.status_msg);
            this._clearotp();

          }

          else {
            this.dropDownAlertRef.alertWithType('error', 'Error', "Internal Server Error");

          }
        })

      }
      else {
        this.dropDownAlertRef.alertWithType('error', 'Error', "OTP Missing. Enter the OTP");

      }

    }

    else {

      this.dropDownAlertRef.alertWithType('error', 'Error', "RCH ID Missing. Please scan the RCH ID");

    }
  }

  /* .......................................................... */


  render() {
    return (
      <>
        <View style={styles.container}>
          <Text style={styles.title}>RCH BOOK</Text>
          {this.state.showThis == false && <View >
            <Text style={styles.Text}>SCAN RCH ID</Text>
            <TouchableHighlight
              style={[styles.button, styles.Button]}
              onPress={this.handlePress} >
              <Image style={styles.inputIcon} source={require("../assets/icons8-qr-code-24.png")} />
            </TouchableHighlight>
          </View>}

          {this.state.showThis == false && <View>
            <Text style={styles.Text}>Enter OTP Here</Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.TextInputStyle}
                placeholder='OTP'
                keyboardType='numeric'
                underlineColorAndroid='transparent'
                ref={(input) => { this.vaccineIdInput = input; }}
                onChangeText={text => this.setState({ OTP: text })}>
              </TextInput>
            </View>
            <TouchableHighlight
              style={[styles.buttonContainer, styles.Button]}
              onPress={this._userScanQRCode.bind(this)} >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableHighlight>
          </View>}
          {this.state.showThis && <View style={{ flex: 1 }}>

            <BarCodeScanner
              onRead={this._handleBarCodeRead}
              showMarker={true}
              bottomContent={
                <TouchableHighlight
                  style={[styles.buttonContainer, styles.Button]}
                  onPress={() => this.setState({ showThis: false })}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableHighlight>

              }
            />

          </View>}
        </View>
        <View>
          <DropdownAlert ref={ref => this.dropDownAlertRef = ref} />
        </View>
      </>

    );
  }
}

AppRegistry.registerComponent('App', () => App);

const resizeMode = 'center';
const styles = StyleSheet.create({
  title: {
    fontSize: 35,
    alignSelf: "center",
    marginTop: 25,
    marginBottom: 40,
    fontWeight: "bold"
  },
  Text: {
    fontSize: 20,
    fontWeight: "bold",
    alignSelf: "center"
  },

  TextInputStyle: {
    height: 45,
    marginLeft: 16,
    fontSize: 15,
    borderBottomColor: '#FFFFFF',
    flex: 1,
  },

  button: {
    height: 100,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: "center",
    marginBottom: 20,
    width: 100,
    borderRadius: 30,
  },
  buttonText: {
    fontSize: 20,
    color: "white",
    alignSelf: "center",
    fontWeight: "bold",
  },
  container: {
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
    width: 300,
    height: 45,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: "center",
    shadowColor: "#808080",
  },
  inputIcon: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignSelf: "center"
  },
  buttonContainer: {
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: "center",
    marginBottom: 20,
    width: 300,
    borderRadius: 30,
  },
  Button: {
    backgroundColor: "#205370",
  },
  button1: {
    shadowColor: '#00000021',

    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,

    elevation: 12,
    marginVertical: 10,
    backgroundColor: "white",
    flexBasis: '42%',
    marginHorizontal: 10,
  },
});
