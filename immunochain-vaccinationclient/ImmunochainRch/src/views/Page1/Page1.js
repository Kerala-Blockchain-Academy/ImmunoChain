'use strict';

import React, { Component } from 'react';
import {
  AppRegistry,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  NativeModules,
} from 'react-native';
import styles from './styles';
import { Table, Row, Rows } from 'react-native-table-component';


import i18n from 'i18n-js';

i18n.fallbacks = true;

i18n.locale = NativeModules.I18nManager.localeIdentifier;
i18n.translations = {
  en: require('../../translations/en.json'),
  ml: require('../../translations/ml.json'),
  hi: require('../../translations/hi.json'),
};



export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      previous_delivery: '',
      othersText: '',
      blood_group: '',
      rh_category: '',
      Visit: 0,
      signature: '',
      ifa: '',
      hb: '',
      urine_albumin: '',
      edema_on_legs: '',
      weight: '',
      week: '',
      blood_pressure: '',
      visit_date: '',
      tableHead: ['Vaccine Name ', ' Given On '],
      missedTableHead: ['Vaccine \nName ', 'Missed Date', 'Reason'],
      widthArr: [200, 200, 200, 200],
      tableData: '',
      vaccine_name_dose: '',
      recommended_date: '',
      reason: '',
      nextDate: '',
      name: '',
      vaccine_details: [],
      visit_arr: [],
      Visit: { 1: {} },
      itemValue: 1,
      lang: 'en',
      showtableMiss: false,
      missedAge: ""


    }

  }

  onSubmit = () => {
    console.log("bloodGroup: ", this.state.blood_group)
  };

  onmissedSubmit = () => {

  };

  handleChangeOption = (value) => {
    if (value != null) {

      this.setState({
        showtable: true,
        vaccineAge: value

      })

    }
    else {

      this.setState({
        showtable: false,
        vaccineAge: ''

      })

    }
  }

  handleMissed = (value) => {

    if (value != null) {

      this.setState({
        showtableMiss: true,
        missedAge: value

      })


    }
    else {

      this.setState({
        showtableMiss: false,
        missedAge: ''

      })

    }
  }

  componentDidMount() {
    i18n.locale = this.props.lang;
  }

  onVaccineDataSubmit = () => {

  };

  renderRow(row) {

    return (
      <Rows data={[
        [row,

          <Text>{this.props.vaccine_details.vaccTak[row].current_date}</Text>

        ]]} />
    );
  }

  renderMissedRow(row) {
    return (

      <Rows data={[
        [row,
          <Text>{this.props.vaccine_details.vaccMiss[row].current_date}</Text>
          ,
          <Text>{this.props.vaccine_details.vaccMiss[row].reason}</Text>
        ]]} />
    );
  }

  render() {
    i18n.locale = this.props.lang;

    return (
      <ScrollView style={{ width: '90%' }} keyboardShouldPersistTaps="always"
        refreshControl={
          <RefreshControl
            //refresh control used for the Pull to Refresh
            refreshing={this.props.isRefreshing}
            onRefresh={this.props.handleRefresh}
          />
        }
      >
        <Text style={styles.headingText}>{i18n.t('VACCINATIONINFORMATION')} </Text>

        <View style={styles.VaccDetailscontainer}>

          <Text style={styles.mainHead}>{i18n.t("ChildsDetails")}</Text>
          <View style={styles.detailsContainer}>
            <Text style={styles.LabelText}>{i18n.t("ChildName")} </Text>
            <Text style={styles.LabelText}> : </Text>
            <Text style={styles.LabelText}>{this.props.vaccine_details.child_name}</Text>
          </View>

        </View>

        <View style={styles.VaccDetailscontainer}>
          <Text style={styles.mainHead}>{i18n.t('VaccinationDetails')}</Text>
          <View>

            <View>
              {this.props.vaccinePick.map((itemAge) =>
                <View>
                  {this.props.vaccine_details.vaccTakArray[itemAge.value].length != 0 &&

                    <View>
                      <Text style={styles.vaccineAge}>{itemAge.label}</Text>
                      <Table borderStyle={{ borderColor: '#c8e1ff' }} style={styles.tableContainer}>
                        <Row data={this.state.tableHead} textStyle={styles.headerRowStyle} />
                        <Rows flexArr={[1, 1]} />

                        {this.props.vaccine_details.vaccTakArray[itemAge.value].map((item) => {

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
            <Text style={styles.mainHead}>{i18n.t('DetailsofVaccinationsMissed')} </Text>
            <View>
              <View>
                {this.props.vaccinePick.map((itemAge) =>
                  <View>
                    {this.props.vaccine_details.vaccMissArray[itemAge.value].length != 0 &&

                      <View>
                        <Text style={styles.vaccineAge}>{itemAge.label}</Text>
                        <Table borderStyle={{ borderColor: '#c8e1ff' }} style={styles.tableContainer}>
                          <Row data={this.state.missedTableHead} textStyle={styles.headerRowStyle} />
                          <Rows flexArr={[1, 1, 1]} />
                          {this.props.vaccine_details.vaccMissArray[itemAge.value].map((item) => {
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
    );
  }
}

AppRegistry.registerComponent('App', () => App);


