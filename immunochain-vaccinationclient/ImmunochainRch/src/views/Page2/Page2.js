"use strict";

import React, { Component } from "react";
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ScrollView,
  NativeModules
} from "react-native";
import { Input } from "react-native-elements";
import DatePicker from "react-native-datepicker";
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
      checked: false,

      FirstReceived: "",
      Secondreceived: "",
      ThirdReceived: "",
      Registered: "",
      dataArray: [],
      service_provider_details: [],
      tableHead: ["Conditions", "Amount", "Received "],
      tableData: [],
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
      <ScrollView style={{ width: "90%" }} keyboardShouldPersistTaps="always">

        <Text style={styles.headingText}>{i18n.t("DETAILSOFSERVICEPROVIDER")}</Text>
        <View style={styles.container}>

          <Text style={styles.LabelText}>{i18n.t("ICDS")}</Text>
          <Input

            shake={true}
            editable={false}
            value={this.props.vaccine_details.ICDS}
            onChangeText={text => {
              this.setState({ icds: text });
            }}
          />
          <Text style={styles.LabelText}>{i18n.t("AnganwadiCentre")}</Text>
          <Input
            value={this.props.vaccine_details.Anganwadi_Centre}
            multiline={true}
            editable={false}
            shake={true}
            onChangeText={text => {
              this.setState({ anganwadi_center: text });
            }}
          />
          <Text style={styles.LabelText}>{i18n.t("AnganwadiRegistrationNumber")}</Text>
          <Input
            shake={true}
            editable={false}
            value={this.props.vaccine_details.anganwadi_reg_no}
            onChangeText={text => {
              this.setState({ anganwadi_reg_no: text });
            }}
          />
          <Text style={styles.LabelText}>{i18n.t("AnganwadiWorker")}</Text>
          <Input
            shake={true}
            editable={false}
            multiline={true}
            value={this.props.vaccine_details.Anganwadi_Worker}
            onChangeText={text => {
              this.setState({ anganwadi_worker: text });
            }}
          />
          <Text style={styles.LabelText}>{i18n.t("PhoneNo")}</Text>
          <Input
            shake={true}
            editable={false}
            value={this.props.vaccine_details.Phone}
            onChangeText={text => {
              this.setState({ worker_phone: text });
            }}
          />
          <Text style={styles.LabelText}>
            {i18n.t("PrimaryHealthCentre/SocialHealthCentre/PPunit")}
          </Text>
          <Input
            shake={true}
            editable={false}
            value={this.props.vaccine_details.Center_name}
            onChangeText={text => {
              this.setState({ phc_shc_pp_clinic: text });
            }}
          />
          <Text style={styles.LabelText}>{i18n.t("Subcentre")}</Text>
          <Input
            shake={true}
            editable={false}
            value={this.props.vaccine_details.Sub_Centre}
            onChangeText={text => {
              this.setState({ sub_center: text });
            }}
          />
          <Text style={styles.LabelText}>{i18n.t("SubcentreRegistrationNumber")}</Text>
          <Input
            shake={true}
            editable={false}
            value={this.props.vaccine_details.subcentre_reg_no}
            onChangeText={text => {
              this.setState({ subcentre_reg_no: text });
            }}
          />
          <Text style={styles.LabelText}>{i18n.t("Asha")}</Text>
          <Input
            shake={true}
            editable={false}
            value={this.props.vaccine_details.Asha}
            onChangeText={text => {
              this.setState({ asha: text });
            }}
          />
          <Text style={styles.LabelText}>{i18n.t("PhoneNumber")}</Text>
          <Input
            shake={true}
            editable={false}
            value={this.props.vaccine_details.asha_phone}
            onChangeText={text => {
              this.setState({ asha_phone: text });
            }}
          />
          <Text style={styles.LabelText}>{i18n.t("JPHN")}</Text>
          <Input
            shake={true}
            editable={false}
            value={this.props.vaccine_details.jphn}
            onChangeText={text => {
              this.setState({ jphn: text });
            }}
          />
          <Text style={styles.LabelText}>{i18n.t("PhoneNumber")}</Text>
          <Input
            shake={true}
            editable={false}
            value={this.props.vaccine_details.jphn_phone}
            onChangeText={text => {
              this.setState({ jphn_phone: text });
            }}
          />

          <Text style={styles.LabelText}>{i18n.t("Hospitalselectedfordelivery")}</Text>
          <Input
            shake={true}
            editable={false}
            multiline={true}
            value={this.props.vaccine_details.preffered_hospital_delivery}
            onChangeText={text => {
              this.setState({ preffered_hospital_delivery: text });
            }}
          />
          <Text style={styles.LabelText}>{i18n.t("HospitalAddress")}</Text>
          <Input
            shake={true}
            editable={false}
            multiline={true}
            value={this.props.vaccine_details.hospital_address}
            onChangeText={text => {
              this.setState({ hospital_address: text });
            }}
          />
          <Text style={styles.LabelText}>{i18n.t("BirthCompanion")}</Text>
          <Input
            shake={true}
            editable={false}
            value={this.props.vaccine_details.birth_companion}
            onChangeText={text => {
              this.setState({ birth_companion: text });
            }}
          />

          <Text style={styles.LabelText}>{i18n.t("TransportationArrangement")}</Text>
          <Input
            shake={true}
            editable={false}
            value={this.props.vaccine_details.transportation_arrangement}
            onChangeText={text => {
              this.setState({ transportation_arrangement: text });
            }}
          />



          <Text style={styles.LabelText}>{i18n.t("Dateoffirstregistration")}</Text>

          <DatePicker
            style={{ margin: 2, backgroundColor: "#fff" }}
            mode="date"
            placeholder=" "
            format="DD-MM-YYYY"
            disabled={true}
            date={this.props.vaccine_details.date_of_first_reg}
            onDateChange={date => {
              this.setState({ date_of_first_reg: date });
            }}
          />

        </View>
      </ScrollView>
    );
  }
}

AppRegistry.registerComponent("App", () => App);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F3A882",
    alignSelf: "center",
    justifyContent: "center",
    width: "95%",
    borderRadius: 5,
    marginTop: 25,
    padding: 5,
    marginBottom: 25,
    paddingTop: 5,
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
