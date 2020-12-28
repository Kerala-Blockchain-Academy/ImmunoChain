import React, { Component } from "react";
import { AsyncStorage } from 'react-native';
import {
  StyleSheet,
  Text,
  View,
  BackHandler,
  Dimensions,
  NativeModules
} from "react-native";
import Swiper from "react-native-swiper";
import DropdownAlert from 'react-native-dropdownalert';
import Main from "../views/Home/PageA/Main";
import Page2 from "../views/Page2";
import Page3 from "./Page3";
import Page4 from './Page4';
import Page1 from "./Page1";
import PregnancyRelatedDetails from '../views/PregnancyRelatedDetails';
import i18n from "i18n-js";
import * as Service from "./Service";
import InnerHeader from "../components/InnerHeader";
import { StackActions, NavigationActions } from "react-navigation";


const resetAction = StackActions.reset({
  index: 0,
  actions: [NavigationActions.navigate({ routeName: "LoginwithOTP" })]
});


i18n.fallbacks = true;

i18n.locale = NativeModules.I18nManager.localeIdentifier;;
i18n.translations = {
  en: require("../translations/en.json"),
  ml: require("../translations/ml.json"),
  hi: require("../translations/hi.json")
};

export default class Home extends Component {

  constructor(props) {
    super(props);
    this.handleRefresh = this.handleRefresh.bind(this);
    this.state = {
      vaccine_data: [],
      lang: "en",
      visit_arr: [],
      Visit: { 1: {} },
      tableData: [],
      vaccinepicker: [],
      vaccinepick: [],
      vaccines: {},
      missed_vaccines: [],
      vaccinesTaken: [],
      isRefreshing: false,
      screenHeight: 0,
      screenWidth: 0,
      height: 0,
      width: 0,
    };
  }

  componentDidMount() {

    const { width, height } = Dimensions.get('window');
    this.setState({ height: height, width: width })
    this.initialLoadData();

    const { navigation } = this.props;
    this.focusListener = navigation.addListener('didFocus', () => {
      let lang = Service._get_language()
      lang.then((x) => {

        this.setState({ lang: x })
        this.previousLoadData()

      })
      i18n.locale = this.state.lang;
    });
  }


  componentWillUnmount() {
    this.focusListener.remove();
  }


  onContentSizeChange = (contentWidth, contentHeight) => {
    // Save the content screenHeight in state
    this.setState({ screenHeight: contentHeight, screenWidth: contentWidth });
  }

  handleRefresh = async () => {
    this.setState({ isRefreshing: true })
    await this.loadData();
    this.setState({ isRefreshing: false })
  };

  initialLoadData = () => {
    const vaccineDet = global.MyVar.vaccines;
    let vaccines = {};
    let vaccAge = []
    var datas = vaccineDet.vaccine.map(function (item, itemIndex) {
      vaccines[item.age] = item.vaccines;
      vaccAge.push(item.age)
      return {
        label: item.age,
        value: itemIndex,
        key: item.age
      };
    });
    this.setState({ vaccinepicker: datas, vaccines: vaccines });
  }

  previousLoadData = () => {

    let retDetails = Service.retrieveItem("Rch_Book")
    retDetails.then(rch_details => {
      if (rch_details != null) {
        this.popviewData(rch_details);
        setTimeout(() => {
          this.loadData()
        }, 1000);
      }
      else {
        let data = Service._get_rch_data_FromApi();
        data.then(x => {
          if (x.status_code == 200) {
            this.loadData()
          }
          else if (x.status_code == 501) {
            alert("Session Expired Login again")
            this.props.navigation.dispatch(resetAction);
          }
          else if (x.status_code == 400 || x.status_code == 404) {
            this.dropDownAlertRef.alertWithType('error', 'Error', x.status_msg);
          }
          else {
            this.dropDownAlertRef.alertWithType('error', 'Error', "Internal Server Error");
          }
        });
      }
    })
  }

  loadData = () => {
    console.log("new fetched data")

    let data = Service._get_rch_data_FromApi();
    data.then(x => {
      if (x.status_code == 200) {
        Service.storeItem("Rch_Book", x.response)
        this.popviewData(x.response)
      }
      else if (x.status_code == 501) {
        alert("Session Expired Login again")
        this.props.navigation.dispatch(resetAction);
      }
      else if (x.status_code == 400 || x.status_code == 404) {
        this.dropDownAlertRef.alertWithType('error', 'Error', x.status_msg);
      } else {
        console.log("error", x)
        this.dropDownAlertRef.alertWithType('error', 'Error', "Internal Server Error");
      }
      return;
    });
  }

  popviewData = (arr_rch_details) => {

    if (arr_rch_details.length == 1) {
      this.viewData(arr_rch_details[0])
    }

    else {

      try {

        AsyncStorage.getItem("selectRchID").then(value => {
          if (value) {
            let selUser = arr_rch_details.filter(obj => {
              return (obj.rch_id == value)
            })

            this.viewData(selUser[0])

          }
          else {
            this.viewData(arr_rch_details[0])

          }

        }
        );

      }
      catch (error) {
        console.log("AsyncStorage error: " + error.message);
      }

    }

  }

  viewData = (rch_details) => {

    const visit_data = Object.keys(rch_details.Visit);
    const visit_arr = visit_data.sort();

    console.log("RCH_PPP", rch_details)

    this.setState({
      visit_arr: visit_arr,
      Visit: rch_details.Visit,
      missed_vaccines: rch_details.missed_vaccination_data
    });

    const vaccine = {
      blood_group: rch_details.blood_group,
      rh_category: rch_details.rh_category,
      vaccine_name_dose: rch_details.vaccine_name_dose,
      recommended_date: this.date_change(rch_details.recommended_date),
      next_date_allotted: this.date_change(rch_details.next_date_allotted),
      reason_not_taking_vaccine: "",
      Name_of_child: rch_details.Name_of_child,
      //Family details//
      Woman_Name: rch_details.name,
      Woman_Dob: this.date_change(rch_details.dob),
      Woman_Age: rch_details.age.toString(),
      Husband_Name: rch_details.husband_name,
      Husband_Dob: this.date_change(rch_details.husband_dob),
      Husband_Age: rch_details.husband_age.toString(),
      Address: rch_details.address,
      Phone_No: rch_details.phone_no_1.toString(),
      Family_Registration_Number: rch_details.family_reg_no,
      Mother_Education: rch_details.mother_education,
      Unique_Id: rch_details.unique_id.toString(),
      Aadhar_Id: rch_details.aadhar_id.toString(),
      Income: rch_details.income.toString(),
      caste: rch_details.caste,
      EC_No: rch_details.ec_no.toString(),
      APL_BPL: rch_details.apl_bpl,
      Bank_Account_Number: rch_details.bank_account_number.toString(),
      IFSC_Code: rch_details.ifsc_code,
      SC_ST_OTHERS: rch_details.category,
      previous_delivery: rch_details.previous_delivery,
      menstruation_date: this.date_change(rch_details.menstruation_date),
      expected_delivery_date: this.date_change(
        rch_details.expected_delivery_date
      ),
      last_delivery_date: this.date_change(rch_details.last_delivery_date),
      institution_of_delivery: rch_details.institution_of_delivery,
      rsby_reg_number: rch_details.rsby_reg_number,
      jsy_reg_number: rch_details.jsy_reg_number,
      gravida: rch_details.gravida.toString(),
      Para: rch_details.para.toString(),
      no_of_live_children: rch_details.no_of_live_children.toString(),
      no_of_abortions: rch_details.no_of_abortions.toString(),
      tt1_date: this.date_change(rch_details.tt1_date),
      tt2_date: this.date_change(rch_details.tt2_date),
      usg1_date: this.date_change(rch_details.usg1_date),
      usg2_date: this.date_change(rch_details.usg2_date),
      usg3_date: this.date_change(rch_details.usg3_date),
      Important_findings: rch_details.important_findings,
      complication_details: rch_details.complication_details,
      heart_complications: rch_details.heart_complications,
      advice: rch_details.advice,
      referrals: rch_details.referrals,
      Contraceptive_methods_used: rch_details.contraceptive_methods_used,
      //Service Provider details//
      ICDS: rch_details.icds,
      Anganwadi_Centre: rch_details.anganwadi_centre,
      Anganwadi_Worker: rch_details.anganwadi_worker,
      Phone: rch_details.phone,
      Center_name: rch_details.center_name,
      Sub_Centre: rch_details.sub_centre,
      Asha: rch_details.asha,
      asha_phone: rch_details.asha_phone,
      jphn: rch_details.jphn,
      jphn_phone: rch_details.jphn_phone,
      preffered_hospital_delivery: rch_details.preffered_hospital_delivery,
      birth_companion: rch_details.birth_companion,
      hospital_address: rch_details.hospital_address,
      transportation_arrangement: rch_details.transportation_arrangement,
      anganwadi_reg_no: rch_details.anganwadi_reg_no,
      subcentre_reg_no: rch_details.subcentre_reg_no,
      date_of_first_reg: this.date_change(rch_details.date_of_first_reg),
      registered_for_pmvy: rch_details.registered_for_pmvy,
      first_financial_aid: rch_details.first_financial_aid,
      second_financial_aid: rch_details.second_financial_aid,
      third_financial_aid: rch_details.third_financial_aid,
      Phone_Number: rch_details.phone.toString(),
      Ambulance_Service_Number: rch_details.ambulance_service_number.toString(),
      Drivers_number: rch_details.drivers_number.toString(),
      child_name: rch_details.child_name
    };

    let vaccineIds = this.state.vaccinepicker;
    let vaccines = this.state.vaccines;
    var datas = [];
    let vaccTak = {};
    let vaccMiss = {};
    let vaccTakArr = {};
    let vaccMissArr = {};

    console.log("-=---iiii000ijjdhkjbd----", vaccine.tt1_date)




    vaccineIds.map((item, index) => {
      if (rch_details.data[item.label] != undefined) {

        vaccTakArr[item.label] = []
        vaccMissArr[item.label] = []



        vaccines[item.label].map(vaccitem => {
          if (rch_details.data[item.label][vaccitem] != undefined) {

            console.log("-----------ooooooooooooopppppppppp------------")

            vaccTak[vaccitem] = {
              current_date: this.date_change(
                rch_details.data[item.label][vaccitem].current_date
              ),
              next_date: this.date_change(
                rch_details.data[item.label][vaccitem].next_date
              )
            };
            vaccTakArr[item.label].push(vaccitem)

          } else if (rch_details.missed_vaccination_data[item.label][vaccitem] != undefined) {

            console.log("-----------iiiiiiiipppppppppp------------")

            console.log("next_date", rch_details.missed_vaccination_data[item.label][vaccitem]
              .next_date)

            vaccMiss[vaccitem] = {
              current_date: this.date_change(
                rch_details.missed_vaccination_data[item.label][vaccitem]
                  .current_date
              ),
              next_date: this.date_change(
                rch_details.missed_vaccination_data[item.label][vaccitem]
                  .next_date
              ),
              reason:
                rch_details.missed_vaccination_data[item.label][vaccitem]
                  .reason
            };
            vaccMissArr[item.label].push(vaccitem)
          }
        });

        datas.push({
          label: i18n.t(item.label),
          value: item.label,
          key: index
        });
      }
    });
    vaccine["vaccTak"] = vaccTak;
    vaccine["vaccMiss"] = vaccMiss;
    vaccine["vaccTakArray"] = vaccTakArr;
    vaccine["vaccMissArray"] = vaccMissArr;

    this.setState({ vaccine_data: vaccine, vaccinepick: datas });
    var first_aid;
    var second_aid;
    var third_aid;

    if (rch_details.first_financial_aid == true) first_aid = "Yes";
    else first_aid = "No";

    if (rch_details.second_financial_aid == true) second_aid = "Yes";
    else second_aid = "No";

    if (rch_details.third_financial_aid == true) third_aid = "Yes";
    else third_aid = "No";

    var tableData = [
      [
        "Registration within 1st 3 months of pregnancy",
        "Rs. 2000",
        first_aid
      ],
      ["Atleast one pregnancy period checkup", " Rs. 2000", second_aid],
      [
        "1. At the time of registtration of child birth \n 2. After giving 1st time OPV/Penta/Hepatitis B vaccination or equivalent",
        " Rs. 2000",
        third_aid
      ]
    ];

    this.setState({ tableData: tableData });
  }

  date_change(date) {
    if (date) {
      console.log("1111111111111111111111", date)
      let value = date.yyyy + "-" + date.mm + "-" + date.dd;
      return value;
    } else {
      console.log("00000000000000000000000000", date)
      return null
    }
  }

  componentWillMount() {


    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);

  }

  onBackPress = () => {
    this.props.navigation.navigate("Rch_home");
    return true;
  }


  render() {
    <View style={styles.container}>
      <Text style={styles.headerText}>
        Press Hardware back button and see the alert message {"\n"}
      </Text>
    </View>;
    return (
      <View style={{ flex: 1 }} >

        <View>
          <DropdownAlert ref={ref => this.dropDownAlertRef = ref} />
        </View>

        <InnerHeader navigation={this.props.navigation}
        />

        <Swiper
          style={styles.wrapper}
          showsButtons={true}
          showsPagination={false}
        >
          <View style={styles.slide2}>
            <Main vaccine_details={this.state.vaccine_data}
              lang={this.state.lang}
            />
          </View>

          <View style={styles.slide4}>
            <PregnancyRelatedDetails vaccine_details={this.state.vaccine_data}
              lang={this.state.lang} />
          </View>

          <View style={styles.slide3}>
            <Page2
              vaccine_details={this.state.vaccine_data}
              tableData={this.state.tableData}
              lang={this.state.lang}
            />
          </View>
          <View style={styles.slide1}>
            <Page1
              vaccine_details={this.state.vaccine_data}
              visit_arr={this.state.visit_arr}
              Visit={this.state.Visit}
              vaccinePick={this.state.vaccinepick}
              vaccines={this.state.vaccines}
              missed_vaccines={this.state.missed_vaccines}
              lang={this.state.lang}
              handleRefresh={this.handleRefresh}
              isRefreshing={this.state.isRefreshing}
            />
          </View>
          <View style={styles.slide2}>
            <Page3
              lang={this.state.lang}
            />
          </View>
          <View style={styles.slide2}>
            <Page4
              lang={this.state.lang}
            />
          </View>
        </Swiper>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  wrapper: {},
  slide1: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#b8df97"
  },
  slide2: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#87B5B5"
  },
  slide3: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#DC936E"
  },
  slide4: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E29488"
  },
  slide5: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#BAD23E"
  },
  slide6: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#92BB"
  },

  slide7: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4C87D5"
  },
  slide8: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4EBFC3"
  },

  slide9: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#5CA3CD"
  },

  slide10: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2DD4A2"
  },
  slide11: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#49C35D"
  },
  text: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold"
  },
  slide13: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#D6E493"
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  headerText: {
    fontSize: 20,
    textAlign: "center",
    margin: 10,
    fontWeight: "bold"
  }
});
