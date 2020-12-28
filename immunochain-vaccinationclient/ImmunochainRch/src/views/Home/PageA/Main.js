"use strict";

import React, { Component } from "react";
import { Button } from "react-native-elements";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  RefreshControl,
  Picker,
  NativeModules
} from "react-native";
import { Input } from "react-native-elements";
import DatePicker from "react-native-datepicker";
import * as Service from "../../Service";
import i18n from "i18n-js";

i18n.fallbacks = true;

i18n.locale = NativeModules.I18nManager.localeIdentifier;
i18n.translations = {
  en: require("../../../translations/en.json"),
  ml: require("../../../translations/ml.json"),
  hi: require("../../../translations/hi.json")
};


export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: false,
      nextDate: "",
      MenDate: "",
      DelDate: "",
      family_card_details: [],
      lang: "en"
    };
  }

  pressme = async () => {
    if (this.state.checked == true) {
      this.setState({
        checked: false
      });
    } else {
      this.setState({
        checked: true
      });
    }
  };

  onSubmit = () => { };

  onSubmit1 = () => { };
  componentDidMount() {
    i18n.locale = this.props.lang;

  }

  render() {
    i18n.locale = this.props.lang;
    return (
      <ScrollView style={{ width: "90%" }} keyboardShouldPersistTaps="always">

        <Text style={styles.text}>{i18n.t("FAMILYHEALTHCARD")}</Text>
        <View style={styles.list_container}>
          <View>
            <Text style={styles.LabelText}>{i18n.t("PregnantWomansName")}</Text>
            <Input
              shake={true}
              editable={false}
              value={this.props.vaccine_details.Woman_Name}
              onChangeText={text =>
                this.setState({ pregnant_woman_name: text })
              }
            />
            <Text style={styles.LabelText}>{i18n.t("PregnantWomansDoB")}</Text>
            <Input
              shake={true}
              editable={false}
              value={this.props.vaccine_details.Woman_Dob}
              onChangeText={text => this.setState({ pregnant_woman_age: text })}
            />
            <Text style={styles.LabelText}>{i18n.t("HusbandsName")}</Text>
            <Input
              shake={true}
              editable={false}
              value={this.props.vaccine_details.Husband_Name}
              onChangeText={text => this.setState({ husband_name: text })}
            />
            <Text style={styles.LabelText}>{i18n.t("HusbandsAge")}</Text>
            <Input
              shake={true}
              editable={false}
              value={this.props.vaccine_details.Husband_Dob}
              onChangeText={text => this.setState({ husband_age: text })}
            />
            <Text style={styles.LabelText}>{i18n.t("Address")}</Text>
            <Input
              shake={true}
              editable={false}
              multiline={true}
              value={this.props.vaccine_details.Address}
              onChangeText={text => this.setState({ address: text })}
            />
            <Text style={styles.LabelText}>{i18n.t("PhoneNo")}</Text>
            <Input
              shake={true}
              editable={false}
              value={this.props.vaccine_details.Phone_No}
              onChangeText={text => this.setState({ phone_no: text })}
            />
            <Text style={styles.LabelText}>{i18n.t("FamilyRegistrationNumber")}</Text>
            <Input
              shake={true}
              editable={false}
              value={this.props.vaccine_details.Family_Registration_Number}
              onChangeText={text => this.setState({ family_reg_no: text })}
            />
            <Text style={styles.LabelText}>{i18n.t("MothersEducation")}</Text>
            <Input
              shake={true}
              editable={false}
              value={this.props.vaccine_details.Mother_Education}
              onChangeText={text => this.setState({ mother_education: text })}
            />
            <Text style={styles.LabelText}>{i18n.t("UniqueId")}</Text>
            <Input
              shake={true}
              editable={false}
              value={this.props.vaccine_details.Unique_Id}
              onChangeText={text => this.setState({ unique_id: text })}
            />
            <Text style={styles.LabelText}>{i18n.t("AadharId")}</Text>
            <Input
              shake={true}
              editable={false}
              value={this.props.vaccine_details.Aadhar_Id}
              onChangeText={text => this.setState({ aadhar_id: text })}
            />
            <Text style={styles.LabelText}>{i18n.t("Income")}</Text>
            <Input
              shake={true}
              editable={false}
              value={this.props.vaccine_details.Income}
              onChangeText={text => this.setState({ income: text })}
            />


            <Text style={styles.LabelText}>{i18n.t("BankAccountNumber")}</Text>
            <Input
              shake={true}
              editable={false}
              value={this.props.vaccine_details.Bank_Account_Number}
              onChangeText={text => this.setState({ account_number: text })}
            />

            <Text style={styles.LabelText}>{i18n.t("IFSCCode")}</Text>
            <Input
              shake={true}
              editable={false}
              value={this.props.vaccine_details.IFSC_Code}
              onChangeText={text => this.setState({ ifsc_code: text })}
            />


            <Text style={styles.LabelText}>{i18n.t("Caste")}</Text>
            <Input
              shake={true}
              editable={false}
              value={this.props.vaccine_details.caste}
              onChangeText={text => this.setState({ caste: text })}
            />
            <Text style={styles.LabelText}>{i18n.t("ECNO")}</Text>
            <Input
              shake={true}
              editable={false}
              value={this.props.vaccine_details.EC_No}
              onChangeText={text => this.setState({ ec_no: text })}
            />
            <Text style={styles.LabelText}>{i18n.t("APL/BPL")}</Text>
            <Input
              shake={true}
              editable={false}
              value={this.props.vaccine_details.APL_BPL}
              onChangeText={text => this.setState({ apl_or_bpl: text })}
            />
          </View>
        </View>
      </ScrollView>
    );
  }
}

AppRegistry.registerComponent("App", () => App);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#97CAE5",
    alignSelf: "center",
    justifyContent: "center",
    width: "95%",
    borderRadius: 5,
    marginTop: 25,
    textAlign: "center"
  },
  text: {
    color: "white",
    fontWeight: "bold",
    borderRadius: 5,
    width: "100%",
    textAlign: "center",
    fontSize: 23,
    marginTop: 10,
    backgroundColor: "#E9AB5B"
  },
  list_container: {
    borderRadius: 5,
    backgroundColor: "#99CCCC",
    marginTop: 25,
    padding: 5,
    marginBottom: 25,
    paddingTop: 5,
    width: "95%",
    alignSelf: "center",
    justifyContent: "center"
  },
  headingText: {
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
  checkStyle: {
    backgroundColor: "#FFFFFF",
    width: "92%",
    borderRadius: 5,
    marginLeft: 10,
    marginTop: 10,
    marginBottom: 10
  },
  LabelText: {
    fontWeight: "bold",
    textAlign: "left",
    fontSize: 21,
    marginTop: 2,
    marginBottom: 2,
    marginLeft: 7
  }
});