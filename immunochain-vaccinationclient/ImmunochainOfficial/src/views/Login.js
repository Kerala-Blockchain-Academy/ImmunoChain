import React, { Component } from 'react';
import DropdownAlert from 'react-native-dropdownalert';

import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableHighlight,
  Image,
  Alert,
  BackHandler,
  AsyncStorage,
  ScrollView

} from 'react-native';
import * as Service from "./Service";

const Roles = {
  statecenter: ["sc_user"],
  chc_phc: ["phc_user"]
};


export default class LoginView extends Component {

  constructor(props) {
    super(props);
    state = {
      username: '',
      password: '',
      statecenter_view: false,
      chc_phc_view: false,
      User_role: "",
      AccessToken: null,
      tok: null,
      actor: '',
      uname: ''
    }
  }

  componentDidMount() {
    const { navigation } = this.props;
    this.focusListener = navigation.addListener('didFocus', () => {
      this.clearForm();
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

  clearForm() {
    // clear content from all textbox
    this.setState({ username: '', password: '' });
    this.emailInput.clear();
    this.passwordInput.clear();
  }

  _intersect(a, b) {
    (a = new Set(a)), (b = new Set(b));
    return [...a].filter(v => b.has(v));
  }

  _userLogin = async () => {
    try {
      if (this.state.username != '' && this.state.password != '') {

        const data = {
          username: this.state.username.trim(),
          password: this.state.password.trim(),
          access_token_time: 36000,
          refresh_token_time: 36000
        };


        const response = Service._userLogin(data);
        this._responsefunction(response);
        await AsyncStorage.setItem("User_Role", JSON.stringify(this.state.actor));
      }

      else {
        this.clearForm();
        this.dropDownAlertRef.alertWithType('error', 'Error', "Username and Password cant be empty");
      }
    }
    catch (error) {
      this.clearForm();
      console.log("Login", error)
    }


  }

  _responsefunction = (response) => {
    try {
      response.then(d => {
        if (d.access_token) {
          if (d.role) {
            let actors = d.role;
            let u_name = d.user_name;
            let stations = d.stations
            this.setState({ uname: u_name })
            this.setState({ actor: actors })
            this._setUser_role(actors, stations);
          }
          else if (d.status_msg) {
            this.dropDownAlertRef.alertWithType('error', 'Error', d.status_msg);
            this.clearForm();
          }
        }
        else if (d.status_msg) {
          this.dropDownAlertRef.alertWithType('error', 'Error', d.status_msg);
          this.clearForm();
        }
        else {
          this.clearForm();
        }
      });

    } catch (e) {
      alert(e)
    }
  }
  _setUser_role = async (actor, current_stations) => {
    try {
      let roleview1 = this._intersect(actor, Roles.statecenter);

      await AsyncStorage.setItem("User_Name", this.state.uname);

      if (roleview1.length) {
        console.log("scuser_role==", roleview1)
        await AsyncStorage.setItem("statecenter_view", JSON.stringify(true));
        await AsyncStorage.setItem("User_Role", JSON.stringify(this.state.actor));

      }
      let roleview2 = this._intersect(actor, Roles.chc_phc);
      if (roleview2.length) {
        await AsyncStorage.setItem("User_Role", JSON.stringify(this.state.actor));
        await AsyncStorage.setItem("chc_phc_view", JSON.stringify(true));
      }
      if (current_stations) {
        let stations = current_stations
        this.setState({ stations: stations })
        if (Object.keys(stations).length === 1) {
          await AsyncStorage.setItem("station_list", JSON.stringify(stations));
          stations.map(function (item) {
            try {
              AsyncStorage.setItem("station_code", item.station_code);
              AsyncStorage.setItem("station_id", item.station_id.toString());
              AsyncStorage.setItem("station_address", item.station_address);
              AsyncStorage.setItem("station_name", item.station_name);

            } catch (e) {
              console.log(e)
            }
          })

          this.props.navigation.navigate("HomeDrawer");
        }
        else {
          this.props.navigation.navigate("station", {
            stations_list: this.state.stations
          });
        }
      }
      else {
        this.dropDownAlertRef.alertWithType('error', 'Error', "station not available");
        this.clearForm();
      }
    } catch (e) {
      console.log(e)
    }

  }


  render() {
    return (
      <>
        <View>
          <DropdownAlert ref={ref => this.dropDownAlertRef = ref} />
        </View>
        <ScrollView width="100%" display="flex" backgroundColor='#008abe'>

          <View style={styles.container}>
            <Text style={styles.title}>IMMUNOCHAIN</Text>
            <Image style={{ width: 300, height: 200, alignSelf: "center" }}
              source={require('../assets/rsz_vaccine_option1.jpg')} />
            <View style={styles.inputContainer}>
              <TextInput style={styles.inputs}
                placeholder="Username"
                underlineColorAndroid='transparent'
                ref={(input) => { this.emailInput = input; }}
                onSubmitEditing={() => { this.passwordInput.focus(); }}
                onChangeText={(username) => this.setState({ username })} />
            </View>

            <View style={styles.inputContainer}>
              <TextInput style={styles.inputs}
                placeholder="Password"
                secureTextEntry={true}
                underlineColorAndroid='transparent'
                ref={(input) => { this.passwordInput = input; }}
                onChangeText={(password) => this.setState({ password })} />
            </View>

            <TouchableHighlight style={[styles.buttonContainer, styles.loginButton]}
              onPress={this._userLogin}>
              <Text style={styles.loginText}>Login</Text>
            </TouchableHighlight>
          </View>
        </ScrollView>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: "10%",
    alignItems: 'center',
    backgroundColor: '#008abe',
  },
  title: {
    fontSize: 30,
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 30,
    fontWeight: "bold"
  },
  inputContainer: {
    borderBottomColor: '#F5FCFF',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    borderBottomWidth: 1,
    width: 300,
    height: 45,
    marginTop: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  inputs: {
    height: 45,
    marginLeft: 16,
    borderBottomColor: '#FFFFFF',
    flex: 1,
  },
  inputIcon: {
    width: 30,
    height: 30,
    marginLeft: 15,
    justifyContent: 'center'
  },
  buttonContainer: {
    height: 45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    width: 300,
    borderRadius: 30,
  },
  loginButton: {
    backgroundColor: "#205370",
  },
  loginText: {
    fontSize: 20,
    color: "white",
    alignSelf: "center",
    fontWeight: "bold",
  },

});