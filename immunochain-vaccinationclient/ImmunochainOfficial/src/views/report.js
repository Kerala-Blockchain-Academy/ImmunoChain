import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView, NativeModules, TouchableOpacity, AsyncStorage, BackHandler } from 'react-native';
import InnerHeader from "../components/InnerHeader";
import { widthPercentageToDP, } from 'react-native-responsive-screen';
import DatePicker from "react-native-datepicker";
import * as Service from "./Service";
import { Table, Row, Rows, TableWrapper, } from 'react-native-table-component';
import i18n from "i18n-js";
i18n.fallbacks = true;
import DropdownAlert from 'react-native-dropdownalert';
import RNPickerSelect from "react-native-picker-select";
import AdministrationReport from '../components/administered_report';
import { StackActions, NavigationActions } from "react-navigation";

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

const picker_data = [
  {
    label: "Vaccine Report",
    value: 1,
    key: 1
  },
  {
    label: "Beneficiary Report",
    value: 2,
    key: 2
  }
]

class report extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lan: 'en',
      station_name: '',
      User_Role: '',
      tableHead: ['Vaccine Name ', ' Male ', 'Female', 'Total'],
      tableHeader: ["FROM", "TO"],
      data_set: [],
      starting_date: '',
      stations: [],
      starting_date: '',
      ending_date: '',
      beneficiary_report: false,
      vaccine_report: true,
      beneficiary_report_view: false,
      vaccine_report_view: true,
      picker_data: ''
    };
  }

  async componentDidMount() {
    const { navigation } = this.props;
    this.focusListener = navigation.addListener('didFocus', () => {
      let lang = Service._get_language()
      lang.then((x) => {
        this.setState({ lang: x })
      })

      let user_det = Service._get_User()
      user_det.then((x) => {
        this.setState({ station_name: x.Station_Name, User_Role: x.User_Role })
      })

      i18n.locale = this.state.lang;
    });
    this._onsubmit();
  }

  componentWillMount() {
    BackHandler.addEventListener("hardwareBackPress", this.onBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.onBackPress);
  }

  onBackPress = () => {
    //Code to display alert message when use click on android device back button.
    this.props.navigation.goBack(null);
    return true;
  }
  _get_date() {
    var day = new Date().getDate(); //Current Date
    var month = new Date().getMonth() + 1; //Current Month
    var year = new Date().getFullYear(); //Current Year
    const date = {
      "dd": parseFloat(day),
      "mm": parseFloat(month),
      "yyyy": parseFloat(year),
    }
    return date;
  }

  _report = async (item) => {

    if (item === 2) {
      this.setState({ beneficiary_report: true, vaccine_report: false, picker_data: item })
      this._onsubmit();
    }
    else {
      this.setState({ beneficiary_report: false, vaccine_report: true, picker_data: item })
      this._onsubmit();
    }
  }

  _onsubmit = async () => {
    try {
      let station_id = await AsyncStorage.getItem('station_id');
      let payload = {
        station_id: station_id,
        date_from: this.state.starting_date ? Service.changeto_date_string(this.state.starting_date) : this._get_date(),
        date_to: this.state.ending_date ? Service.changeto_date_string(this.state.ending_date) : this._get_date(),
      }
      let response
      if (this.state.vaccine_report) {
        response = Service._get_report(payload);
        this.setState({ beneficiary_report_view: false, vaccine_report_view: true })
      }
      else if (this.state.beneficiary_report) {
        response = Service._get_beneficiary_report(payload);
        setTimeout(() => {
          this.setState({ beneficiary_report_view: true, vaccine_report_view: false })
        }, 1000)
      }
      else {
        this.dropDownAlertRef.alertWithType('error', 'Error', "Report not available");
      }
      response.then((res) => {
        if (res) {
          console.log("responseee=", res)
          if (res.status_code === 200) {
            console.log("res.vaccine_doses   ", res.data)
            let data_set = res.data
            this.setState({ data_set: data_set })
          }
          else if (res.status_code == 501) {

            alert("Session Expired Login again")
            this.props.navigation.dispatch(resetAction);

          }

          else if (res.status_code == 400 || res.status_code == 404) {
            this.setState({ data_set: [] })
            this.dropDownAlertRef.alertWithType('error', 'Error', res.status_msg);
          }

          else {
            this.dropDownAlertRef.alertWithType('error', 'Error', "Internal Server error");
          }
        }
        else {
          console.log("data is undefined")
        }
      })
    } catch (error) {
      console.log("oops",error)
    }

  }

  renderRow(row) {
    return (
      <Rows flexArr={[2, 1, 1, 1]} style={{ justifyContent: "center", height: 32 }} data={[
        [row.dose_name,
        row.male,
        row.female,
        row.total
        ]]}
        textStyle={{ alignSelf: "center" }} />
    );
  }


  render() {
    i18n.locale = this.state.lang;
    return (

      <View style={styles.MainContainer}>
        <View>
          <DropdownAlert ref={ref => this.dropDownAlertRef = ref} />
        </View>

        <InnerHeader navigation={this.props.navigation}
          station={this.state.station_name}
          user_role={this.state.User_Role} />
        <View style={{ backgroundColor: '#008abe', paddingTop: '.1%', height: '9%', alignContent: 'center', paddingBottom: '.5%' }}>
          <Text style={styles.title}> {i18n.t("AdministrationReport")}</Text>
        </View>
        <ScrollView style={{ width: widthPercentageToDP('100%'), marginTop: ".1%" }} keyboardShouldPersistTaps="always">
          <View style={{ marginTop: 5 }}>
            <View style={styles.pickerStyle}>
              <RNPickerSelect
                placeholder={{}}
                onValueChange={value => this._report(value)}
                items={picker_data}
                value={this.state.picker_data}
                ref={ref => (this.AgeselectionPicker = ref)}

              />
            </View>
            <Table style={styles.tableContainer}>
              <TableWrapper>
                <Row data={this.state.tableHeader} flexArr={[2, 2]} style={styles.head} textStyle={styles.text} />
                <Row flexArr={[2, 2]} style={styles.row}
                  data={[
                    <DatePicker
                      style={{ margin: "5%", backgroundColor: "#fff" }}
                      mode="date"
                      format="DD-MM-YYYY"
                      maxDate={this.state.ending_date ? this.state.ending_date : new Date()}
                      value={this._get_date}
                      date={this.state.starting_date}
                      onDateChange={date => {
                        this.setState({ starting_date: date });
                      }}
                    />,
                    <DatePicker
                      style={{ margin: "5%", backgroundColor: "#fff" }}
                      mode="date"
                      format="DD-MM-YYYY"
                      value={this._get_date}
                      minDate={this.state.starting_date ? this.state.starting_date : null}
                      maxDate={new Date()}
                      date={this.state.ending_date}
                      onDateChange={date => {
                        this.setState({ ending_date: date });
                      }}
                    />

                  ]}
                />
              </TableWrapper>
            </Table>
          </View>
          <View style={{ marginTop: "5%", justifyContent: "center", alignSelf: "center" }}>
            <TouchableOpacity
              onPress={this._onsubmit}
              activeOpacity={0.7}
              style={[styles.buttonContainer, styles.Button]}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
          {this.state.vaccine_report_view && <View>
            <Table borderStyle={{ borderWidth: 1, borderColor: '#c8e1ff' }} style={styles.tableContainer}>
              <Row flexArr={[2, 1, 1, 1]} data={this.state.tableHead} textStyle={styles.headerRowStyle} />
              <Rows flexArr={[2, 1, 1, 1]} />
              {this.state.data_set.map((obj) => {
                return this.renderRow(obj)
              })}

            </Table>
          </View>}
          {this.state.beneficiary_report_view &&
            <AdministrationReport
              beneficiary_report_data={this.state.data_set}
            />}
        </ScrollView>
      </View>
    );
  }
}

export default report;

const resizeMode = 'center';
const styles = StyleSheet.create({

  MainContainer: {
    flex: 1,
    resizeMode,
    backgroundColor: "#008abe",
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    textAlign: "center"
  },
  title: {
    marginLeft: "5%",
    marginRight: "5%",
    fontSize: 32,
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 25,
    fontWeight: "bold",
    textAlign: "center"
  },
  tableContainer: {
    marginLeft: '5%',
    marginTop: 30,
    marginBottom: 5,
    width: '90%',
    justifyContent: 'center',
  },
  headerRowStyle: {
    marginTop: '15%',
    fontWeight: "bold",
    height: 30,
    backgroundColor: '#f1f8ff',
    alignSelf: "center"

  },
  Text: {
    fontSize: 20,
    fontWeight: "bold",
    alignSelf: "center"
  },
  Button: {
    backgroundColor: "#205370",
  },
  buttonText: {
    fontSize: 18,
    color: "white",
    alignSelf: "center"
  },
  buttonContainer: {
    height: 45,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: "center",
    marginBottom: 15,
    marginTop: 10,
    width: 150,
    borderRadius: 30,
  },
  pickerStyle: {
    width: 250,
    color: "#344953",
    alignSelf: "center",
    justifyContent: "center",
    borderBottomColor: "#F5FCFF",
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    borderBottomWidth: 1,
    marginTop: 10
  },

  head: { height: 30, fontWeight: "bold", },
  wrapper: { flexDirection: 'row' },
  head: { height: 40, fontWeight: "bold", },
  row: { height: 40, width: "100%" },
  text: { textAlign: 'center', fontWeight: "bold", fontSize: 18 }
})
