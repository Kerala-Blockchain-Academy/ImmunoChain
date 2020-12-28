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
        <Text style={styles.headingText}>Immunization Schedule for Child</Text>
        <Image
          source={require("../../assets/immunization_shedule2.png")}
          resizeMode='center'
          style={{ width: "100%", resizeMode: 'stretch' }}
        >
        </Image>
      </ScrollView>
    );
  }
}

AppRegistry.registerComponent("App", () => App);
const styles = StyleSheet.create({
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


});
