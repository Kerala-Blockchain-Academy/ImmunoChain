'use strict';

import React, { Component } from 'react';
import {
  AppRegistry,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  NativeModules,
  AsyncStorage
} from 'react-native';
import InnerHeader from "../components/InnerHeader";
import { Table, Row, Rows } from 'react-native-table-component';
import * as Service from './Service'
import i18n from 'i18n-js';
import DropdownAlert from 'react-native-dropdownalert';
import { StackActions, NavigationActions } from "react-navigation";

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

export default class child_vaccination extends Component {

  constructor(props) {
    super(props);
    this.state = {
      lang: 'en',
      tableHead: ['Vaccine Name ', ' Given On '],
      missedTableHead: ['Vaccine \nName ', 'Missed Date', 'Reason'],
      vaccinepicker: [],
      vaccine_data: [],
      vaccinepick: [],
      vaccines: {},
      child_Details: {}
    }

  }

  async componentDidMount() {

    try {
      AsyncStorage.getItem("App_Language").then(value =>
        this.setState({ lang: value })
      );
      setTimeout(() => {
        console.log("Selected Lanuage:", this.state.lang);
      }, 100);

    } catch (error) {
      console.log("AsyncStorage error: " + error.message);
    }

    i18n.locale = this.state.lang;
    let vaccines = {};
    let vaccines_list = global.MyVar;
    var datas = vaccines_list.vaccines.vaccine.map(function (item, itemIndex) {
      vaccines[item.age] = item.vaccines;

      return {
        label: item.age,
        value: itemIndex,
        key: item.age
      };
    });
    this.setState({ vaccinepicker: datas, vaccines: vaccines });
    this.getchildvaccine();
  }

  getchildvaccine() {
    let Rch_id = this.props.navigation.getParam("RCH_ID");
    if (Rch_id) {

      let respose = Service._getChildVaccineDetails(Rch_id)
      respose.then((d) => {
        if (d != undefined) {
          if (d.status_code == 200) {

            let vaccine = {}
            let vaccineIds = this.state.vaccinepicker;
            let vaccines1 = this.state.vaccines;
            var data = [];
            let vaccTak = {};
            let vaccMiss = {};
            let vaccTakArr = {};
            let vaccMissArr = {};
            let child_Details = {}

            let rch_details = d.data

            child_Details = rch_details.child_details;
            if (Object.keys(rch_details['vaccinations']).length || Object.keys(rch_details['missed_vaccinations']).length) {
              vaccineIds.map((item, index) => {
                if (rch_details.vaccinations[item.label] != undefined) {

                  vaccTakArr[item.label] = []
                  vaccMissArr[item.label] = []

                  vaccines1[item.label].map(vaccitem => {
                    if (rch_details.vaccinations[item.label][vaccitem] != undefined) {
                      vaccTak[vaccitem] = {
                        current_date: this.date_change(
                          rch_details.vaccinations[item.label][vaccitem].current_date
                        ),

                      };
                      vaccTakArr[item.label].push(vaccitem)
                    }
                    else if (rch_details.missed_vaccinations[item.label] != undefined &&
                      rch_details.missed_vaccinations[item.label][vaccitem] != undefined) {
                      vaccMiss[vaccitem] = {
                        current_date: this.date_change(
                          rch_details.missed_vaccinations[item.label][vaccitem]
                            .current_date
                        ),

                        reason:
                          rch_details.missed_vaccinations[item.label][vaccitem]
                            .reason
                      };
                      vaccMissArr[item.label].push(vaccitem)
                    }
                  });

                  data.push({
                    label: item.label,
                    value: item.label,
                    key: index
                  });
                }
              });
            }
            vaccine["vaccTak"] = vaccTak;
            vaccine["vaccMiss"] = vaccMiss;
            vaccine["vaccTakArray"] = vaccTakArr;
            vaccine["vaccMissArray"] = vaccMissArr;
            this.setState({ vaccine_data: vaccine, vaccinepick: data, child_Details: child_Details });



          }
          else if (d.status_code == 501) {

            alert("Session Expired Login again")
            this.props.navigation.dispatch(resetAction);

          }

          else if (d.status_code == 400 || d.status_code == 404) {
            this.dropDownAlertRef.alertWithType('error', 'Error', d.status_msg);
          }

          else {
            this.dropDownAlertRef.alertWithType('error', 'Error', "Internal Server error");
          }
        }
        else {
          console.log("data is undefined")
        }

      })


    }
  }
  date_change(date) {
    if (date != null) {
      let value = date.yyyy + "-" + date.mm + "-" + date.dd;
      return value;
    } else return null;
  }

  renderRow(row) {
    return (
      <Rows data={[
        [row,

          <Text>{this.state.vaccine_data.vaccTak[row].current_date}</Text>

        ]]} />
    );
  }

  renderMissedRow(row) {
    return (

      <Rows data={[
        [row,
          <Text>{this.state.vaccine_data.vaccMiss[row].current_date}</Text>
          ,
          <Text>{this.state.vaccine_data.vaccMiss[row].reason}</Text>
        ]]} />
    );
  }

  render() {
    i18n.locale = this.state.lang;

    return (



      <View style={styles.MainContainer}>

        <View>
          <DropdownAlert ref={ref => this.dropDownAlertRef = ref} />
        </View>

        <InnerHeader navigation={this.props.navigation} />
        <Text style={styles.headingText}>{i18n.t("VACCINATIONINFORMATION")}
        </Text>

        <ScrollView style={{ width: '100%', backgroundColor: '#008abe' }} keyboardShouldPersistTaps="always"
        >

          {/* START */}
          <View style={styles.VaccDetailscontainer}>

            <Text style={styles.mainHead}>{i18n.t("ChildsDetails")}</Text>
            <View style={styles.detailsContainer}>
              <Text style={styles.LabelText}>{i18n.t("ChildName")} </Text>
              <Text style={styles.LabelText}> : </Text>
              <Text style={styles.LabelText}>{this.state.child_Details.name}</Text>
            </View>

          </View>


          <View style={styles.VaccDetailscontainer}>
            <Text style={styles.mainHead}>{i18n.t("VaccinationDetails")}</Text>
            <View>

              <View>

                {this.state.vaccinepick.map((itemAge) =>
                  <View>
                    {this.state.vaccine_data.vaccTakArray[itemAge.value].length != 0 &&

                      <View>
                        <Text style={styles.vaccineAge}>{i18n.t(itemAge.label)}</Text>
                        <Table borderStyle={{ borderColor: '#c8e1ff' }} style={styles.tableContainer}>
                          <Row data={this.state.tableHead} textStyle={styles.headerRowStyle} />
                          <Rows flexArr={[1, 1]} />

                          {this.state.vaccine_data.vaccTakArray[itemAge.value].map((item) => {

                            return this.renderRow(item)

                          })}

                        </Table>
                      </View>
                    }
                  </View>
                )}


              </View>


            </View>
          </View>


          {/* --------------------table2----------------------------------  */}



          <View style={styles.Table2container}>
            <View style={styles.subContainer}>
              <Text style={styles.mainHead}>{i18n.t("DetailsofVaccinationsMissed")}</Text>
              <View>
                <View>
                  {this.state.vaccinepick.map((itemAge) =>
                    <View>
                      {this.state.vaccine_data.vaccMissArray[itemAge.value].length != 0 &&

                        <View>
                          <Text style={styles.vaccineAge}>{i18n.t(itemAge.label)}</Text>
                          <Table borderStyle={{ borderColor: '#c8e1ff' }} style={styles.tableContainer}>
                            <Row data={this.state.missedTableHead} textStyle={styles.headerRowStyle} />
                            <Rows flexArr={[1, 1, 1]} />
                            {this.state.vaccine_data.vaccMissArray[itemAge.value].map((item) => {

                              return this.renderMissedRow(item)

                            })}

                          </Table>
                        </View>
                      }
                    </View>
                  )}
                </View>
              </View>
            </View>

            <View style={{ alignSelf: 'center', marginBottom: 10 }}>
              <TouchableOpacity
                onPress={() => {

                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                  <View >
                   
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
}

AppRegistry.registerComponent('child_vaccination', () => child_vaccination);

const resizeMode = "center";
const styles = StyleSheet.create({
  MainContainer: {
    flex: 1,
    resizeMode,
    backgroundColor: "#008abe",
    justifyContent: "center"
  },
  tableContainer: {
    marginLeft: '5%',
    marginBottom: '3%',
    marginRight: '5%',
    marginTop: '3%',
    width: '100%',
    borderRadius: 5,
    justifyContent: 'center',


  },
  category: {
    marginLeft: 3,
    backgroundColor: '#99cfec',
    borderRadius: 5
  },
  item: {
    color: 'white',
    fontWeight: 'bold',
    padding: 10,
    alignSelf: 'center'
  },
  inputArea: {
    marginRight: 3,
    backgroundColor: '#fff',
    borderRadius: 5,
    width: '52%',
    paddingLeft: 5,
    paddingRight: 5,
    paddingBottom: 5,
    marginLeft: 5
  },
  input: {
    padding: 5,
    borderBottomWidth: 1
  },
  picker: {
    height: 40,
    width: 300,
    alignSelf: 'center',
    backgroundColor: '#99cfec',
    marginBottom: 10,
    color: '#fff'
  },
  agepicker: {

    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#99cfec',
    marginBottom: 10,
    marginTop: 10,
    color: '#fff',
    borderRadius: 3
  },

  Table2container: {
    backgroundColor: '#99cfec',
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 5,
  },
  header: {
    height: 70,
    backgroundColor: '#f0dfdf'
  },
  text: {
    textAlign: 'center',
    fontWeight: '100'
  },
  dataWrapper: {
    marginTop: -1
  },
  row: {
    height: 40,
    backgroundColor: '#E7E6E1'
  },

  subHead: {
    alignSelf: 'center',
    width: '95%',
    color: 'black',
    fontWeight: 'bold',
    height: 30,
    fontSize: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    marginTop: 2
  },
  subContainer: {
    width: '95%',
    alignSelf: 'center',
    margin: 10,
    marginTop: 0,
    marginBottom: 10
  },
  VaccDetailscontainer: {
    backgroundColor: '#99cfec',
    width: '90%',
    padding: 10,
    borderRadius: 5,
    marginTop: 30,
    alignSelf: 'center'
  },
  detailsContainer: {
    flex: 2,
    flexDirection: 'row'
  },
  mainHead: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 20,
    borderBottomWidth: 1,
    borderColor: '#fff',
  },
  button: {
    height: 25,
    width: 25
  },
  vaccineSubHead: {
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    alignSelf: 'center',
    width: '100%',
    backgroundColor: '#edbbaf',
    color: 'black',
    fontWeight: 'bold'
  },
  textInput: {
    borderBottomWidth: 1,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginTop: 10
  },
  text: {
    color: 'white',
    backgroundColor: '#99cfec',
    fontWeight: 'bold',
    borderRadius: 5,
    width: '100%',
    textAlign: 'center',
    fontSize: 24,
    marginTop: 10
  },
  subHead: {
    alignSelf: 'center',
    color: 'black',
    fontWeight: 'bold',
    borderBottomWidth: 1
  },
  subSection: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#d0ddd5',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5
  },

  vaccineAge: {
    alignSelf: "center",
    fontWeight: "bold"
  },
  headerRowStyle: {
    fontWeight: "bold"
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
  LabelText: {
    fontWeight: "bold",
    textAlign: "left",
    fontSize: 20,
    marginTop: 2,
    marginBottom: 2,
    marginLeft: 7,
  }
})


