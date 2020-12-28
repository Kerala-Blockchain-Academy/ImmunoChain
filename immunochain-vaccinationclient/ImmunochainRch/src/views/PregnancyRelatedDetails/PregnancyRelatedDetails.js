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
      scchecked: false,
      stchecked: false,
      otherschecked: false,
      SC: "",
      ST: "",
      Others: "",
      family_details: [],
      lang: "en"
    };
  }

  componentDidMount() {
    i18n.locale = this.props.lang;
  }

  render() {
    i18n.locale = this.props.lang;

    return (
      <ScrollView style={{ width: "90%" }} keyboardShouldPersistTaps="always">


        <Text style={styles.text}>
          {i18n.t("Pregnancyrelateddetails")}
        </Text>

        <View style={styles.container}>



          <Text style={styles.LabelText}>{i18n.t("BloodGroup")}</Text>
          <Input
            style={styles.input}
            value={this.props.vaccine_details.blood_group}
            editable={false}
          />
          <Text style={styles.LabelText}>{i18n.t("RHType")}</Text>
          <Input
            style={styles.input}
            value={this.props.vaccine_details.rh_category}
            editable={false}

          />

          <Text style={styles.LabelText}>{i18n.t("LastMenstruationDate")}</Text>

          <DatePicker
            style={{ margin: 2, backgroundColor: "#fff" }}
            date={this.props.vaccine_details.menstruation_date}
            disabled={true}
            mode="date"
            placeholder=" "
            format="DD-MM-YYYY"
            onDateChange={date => {
              this.setState({ last_menstruation_date: date });
            }}
          />
          <Text style={styles.LabelText}>{i18n.t("ExpectedDeliveryDate")}</Text>
          <DatePicker
            style={{ margin: 2, backgroundColor: "#fff" }}
            date={this.props.vaccine_details.expected_delivery_date}
            disabled={true}
            mode="date"
            placeholder=" "
            format="DD-MM-YYYY"
            onDateChange={date => {
              this.setState({ expected_delivery_date: date });
            }}
          />

          <Text style={styles.LabelText}>{i18n.t("Gravida")}</Text>
          <Input
            shake={true}
            editable={false}
            value={this.props.vaccine_details.gravida}
            onChangeText={text => this.setState({ gravida: text })}
          />
          <Text style={styles.LabelText}>{i18n.t("Para")}</Text>
          <Input
            shake={true}
            editable={false}
            value={this.props.vaccine_details.Para}
            onChangeText={text => this.setState({ para: text })}
          />
          <Text style={styles.LabelText}>{i18n.t("PreviousDeliveryType")}</Text>
          <Input
            style={styles.input}
            value={this.props.vaccine_details.previous_delivery}
            editable={false}

          />
          <Text style={styles.LabelText}>{i18n.t("LastDeliveryDate")}</Text>
          <DatePicker
            style={{ margin: 2, backgroundColor: "#fff" }}
            date={this.props.vaccine_details.last_delivery_date}
            disabled={true}
            mode="date"
            placeholder=" "
            format="DD-MM-YYYY"
            onDateChange={date => {
              this.setState({ last_delivery_date: date });
            }}
          />

          <Text style={styles.LabelText}>{i18n.t("RSBYCardRegistrationNumber")}</Text>
          <Input
            shake={true}
            editable={false}
            value={this.props.vaccine_details.rsby_reg_number}
            onChangeText={text => this.setState({ rsby_card_reg_no: text })}
          />
          <Text style={styles.LabelText}>{i18n.t("JSYRegistrationNumber")}</Text>
          <Input
            shake={true}
            editable={false}
            value={this.props.vaccine_details.jsy_reg_number}
            onChangeText={text => this.setState({ jsy_reg_no: text })}
          />
          <Text style={styles.LabelText}>{i18n.t("Nooflivechildren")}</Text>
          <Input
            shake={true}
            editable={false}
            value={this.props.vaccine_details.no_of_live_children}
            onChangeText={text =>
              this.setState({ no_of_live_children: text })
            }
          />
          <Text style={styles.LabelText}>{i18n.t("Noofabortions")}</Text>
          <Input
            shake={true}
            editable={false}
            value={this.props.vaccine_details.no_of_abortions}
            onChangeText={text => this.setState({ no_of_abortions: text })}
          />


          <View>
            <Text style={styles.headingText}> {i18n.t("TT/USGDETAILS")}</Text>
            <Text style={styles.LabelText}>{i18n.t("USGDate1")}</Text>

            <DatePicker
              style={{ margin: 2, backgroundColor: "#fff" }}
              date={this.props.vaccine_details.usg1_date}
              disabled={true}
              mode="date"
              placeholder=" "
              format="DD-MM-YYYY"
              onDateChange={date => {
                this.setState({ usg1_date: date });
              }}
            />

            <Text style={styles.LabelText}>{i18n.t("USGDate2")}</Text>

            <DatePicker
              style={{ margin: 2, backgroundColor: "#fff" }}
              date={this.props.vaccine_details.usg2_date}
              disabled={true}
              mode="date"
              placeholder=" "
              format="DD-MM-YYYY"
              onDateChange={date => {
                this.setState({ usg2_date: date });
              }}
            />

            <Text style={styles.LabelText}>{i18n.t("USGDate3")}</Text>
            <DatePicker
              style={{ margin: 2, backgroundColor: "#fff" }}
              date={this.props.vaccine_details.usg3_date}
              disabled={true}
              mode="date"
              placeholder=" "
              format="DD-MM-YYYY"
              onDateChange={date => {
                this.setState({ usg3_date: date });
              }}
            />
          </View>
          <View>
            <Text style={styles.LabelText}> {i18n.t("Importantfindings")}</Text>
            <Input
              shake={true}
              editable={false}
              multiline={true}
              value={this.props.vaccine_details.Important_findings}
              onChangeText={text => this.setState({ important_findings: text })}
            />
            <Text style={styles.LabelText}>{i18n.t("Complications")}</Text>
            <Input
              shake={true}
              editable={false}
              value={this.props.vaccine_details.complication_details}
              multiline={true}
              onChangeText={text =>
                this.setState({ complication_details: text })
              }
            />
            <Text style={styles.LabelText}>{i18n.t("Heartrelatedproblems")}</Text>
            <Input
              shake={true}
              editable={false}
              multiline={true}
              value={this.props.vaccine_details.heart_complications}
              onChangeText={text =>
                this.setState({ heart_complications: text })
              }
            />
            <Text style={styles.LabelText}>{i18n.t("Advice")}</Text>
            <Input
              shake={true}
              editable={false}
              multiline={true}
              value={this.props.vaccine_details.advice}
              onChangeText={text => this.setState({ advice: text })}
            />
            <Text style={styles.LabelText}>{i18n.t("Referrals")}</Text>
            <Input
              shake={true}
              editable={false}
              value={this.props.vaccine_details.referrals}
              multiline={true}
              onChangeText={text => this.setState({ referrals: text })}
            />
            <Text style={styles.LabelText}>{i18n.t("Adoptedcontraceptivemeasures")}</Text>
            <Input
              shake={true}
              editable={false}
              value={this.props.vaccine_details.Contraceptive_methods_used}
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
    backgroundColor: "#E68778",
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
    width: "100%",
    textAlign: "center",
    fontSize: 23,
    marginTop: 10,
    backgroundColor: "#E9AB5B"
  },
  headingText: {
    color: "white",
    fontWeight: "bold",
    borderRadius: 5,
    width: "100%",
    textAlign: "center",
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
    marginLeft: 7
  }
});
