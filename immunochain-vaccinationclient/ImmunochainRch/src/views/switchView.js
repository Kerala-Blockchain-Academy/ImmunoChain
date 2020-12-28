import React from 'react';
import { View, AsyncStorage, Image, StyleSheet, } from 'react-native';
import * as Service from "./Service";

export default class DummySwitch extends React.Component {
  async componentDidMount() {
    this._userLogin()
  }

  _userLogin = async () => {
    AsyncStorage.setItem("App_Mode", "rch_user");
    let response = Service._get_LoginInfo();
    response.then(d => {
      if (d != undefined) {
        if (d.status_code != undefined) {
          let retDetails = Service.retrieveItem("Rch_Book")
          retDetails.then(rch_details => {
            if (rch_details != null) {
              this.props.navigation.navigate('Rch_home');
            }
            else {
              this.props.navigation.navigate('LoginwithOTP');
            }
          })
        } else {
          this.props.navigation.navigate('LoginwithOTP');
        }
      }
      else {
        this.props.navigation.navigate('LoginwithOTP');
      }

    });

  };

  render() {
    return (

      <View style={styles.container}>
        <Image style={{ resizeMode: "contain", margin: "40%" }}
          source={require('../assets/splashIcon.png')} />
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: "10%",
    alignItems: 'center',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 30,
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 30,
    fontWeight: "bold",
  }
})