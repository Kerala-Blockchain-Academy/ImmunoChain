"use strict";

import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  Image,
  ScrollView,
  NativeModules,

} from "react-native";
import i18n from "i18n-js";

i18n.fallbacks = true;

i18n.locale = NativeModules.I18nManager.localeIdentifier;
i18n.translations = {
  en: require("../../translations/en.json"),
  ml: require("../../translations/ml.json"),
  hi: require("../../translations/hi.json")
};



export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {

      lang: "en"
    };
  }

  onSubmit = () => { };
  componentDidMount() {
    i18n.locale = this.props.lang;
  }

  render() {
    i18n.locale = this.props.lang;

    return (
      <ScrollView style={{ width: "100%" }} keyboardShouldPersistTaps="always">
        <Text style={styles.headingText}>Immunization Schedule for Infants</Text>
        <Image
          source={require("../../assets/immunization_shedule.png")}
          resizeMode='center'
          style={{ width: "100%", resizeMode: 'stretch' }}
        >
        </Image>


      </ScrollView>
    );
  }
}

AppRegistry.registerComponent("App", () => App);
const resizeMode = 'center';
const styles = StyleSheet.create({
  container: {
    resizeMode,
    backgroundColor: "#008abe",
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    textAlign: "center"
  },

  backgroundImage: {
    flex: 1,
    width: null,
    height: null,
    resizeMode: 'cover'
  },
  text: {
    color: "white",
    fontWeight: "bold",
    borderRadius: 5,
    textAlign: "center",
    height: 50,
    fontSize: 18,
    marginTop: 10
  },
  headingText: {
    color: "white",
    fontWeight: "bold",
    borderRadius: 5,
    width: "100%",
    textAlign: "center",
    fontSize: 23,
    marginTop: 10,
    backgroundColor: "#E9AB5B"


  },
  subHeadingText: {
    color: "white",
    fontWeight: "bold",
    borderRadius: 5,
    width: "100%",
    textAlign: "center",
    height: 95,
    fontSize: 25,
    marginTop: 10
  },
  tableStyle: {
    borderColor: "#B9724F",
    borderRadius: 3
  },
  checkStyle: {
    color: "white",
    fontWeight: "bold",
    borderRadius: 5,
    width: "95%",
    textAlign: "center",
    fontSize: 22,
    marginTop: 10,
    backgroundColor: "#B9724F",
    paddingBottom: 2,
    marginBottom: 5,
    alignSelf: "center"
  },
  TitleText: {
    color: "white",
    fontWeight: "bold",
    borderRadius: 5,
    width: "100%",
    textAlign: "center",
    height: 30,
    fontSize: 24,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: "#E9AB5B"
  },
  LabelText: {
    fontWeight: "bold",
    textAlign: "left",
    fontSize: 21,
    marginTop: 2,
    marginBottom: 2,
    marginLeft: 7,
    flex: 1
  }

});
