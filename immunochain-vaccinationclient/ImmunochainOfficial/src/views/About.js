import React, { Component } from "react";
import {
  Button,
  BackHandler,
  Text,
  AsyncStorage,
  TouchableHighlight,
  StyleSheet,
  Image,
  View,
  Alert,
  TextInput,
  ScrollView,
  NativeModules,
  PermissionsAndroid
} from "react-native";
import InnerHeader from "../components/InnerHeader";
import DropdownAlert from 'react-native-dropdownalert';
import DatePicker from "react-native-datepicker";
import Geolocation from '@react-native-community/geolocation';
import BarCodeScanner from "react-native-qrcode-scanner";
import { Collapse, CollapseHeader, CollapseBody } from "accordion-collapse-react-native";
import { ModalSelectList, } from 'react-native-modal-select-list';
import { Table, Rows } from "react-native-table-component";
import { CheckBox } from 'react-native-elements'
import i18n from "i18n-js";
import * as Service from "./Service";
import RNPickerSelect from "react-native-picker-select";
import { StackActions, NavigationActions } from "react-navigation";
import moment from 'moment';

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

export default class About extends Component {

  constructor(props) {
    super(props);

    this.state = {
      lang: "en",
      checked: "BATCH",
      hasCameraPermission: null,
      hasGeoPermission: null,
      latitude: null,
      longitude: null,
      status: false,
      showcam: false,
      camType: 0,
      vaccines: {},
      showtable: false,
      stations: {},
      currentstation: {},
      vaccineSelect: {},
      showuser: false,
      rchUsers: [],
      submit: false,
      preModal: [],
    };
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
  };

  componentDidMount() {

    this._requestCameraPermission();
    this._requestGeoPermission();
    this._getAsyncData();

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
  }

  _getAsyncData = async () => {
    try {

      let today = new Date().getDate() + "-" + new Date().getMonth() + 1 + "-" + new Date().getFullYear()
      let prevDetails = Service.retrieveItem("vaccine_Administered")
      prevDetails.then(pre_details => {
        if (pre_details !== null) {
          if (pre_details[today] == undefined)
            AsyncStorage.removeItem("vaccine_Administered")
        }
      })

      const currentstation = Service._get_station_details()
      currentstation.then((x) => {

        this.setState({
          currentstation: x
        });

        this._initState();
        this._VaccineDetails();

      })

    } catch (error) {
      console.log(error)
    }
  }

  _VaccineDetails = async () => {
    try {
      let station_id = this.state.currentstation.station_id
      let type = "send"
      const response = Service._getVaccineDetails(station_id, type);
      response.then((d) => {
        if (d != undefined) {
          if (d.status_code == 200) {
            let station_vaccine = d.station_vaccine;
            const vaccine_parent = global.MyVar.vaccine_names;
            const vaccine_name = Object.keys(global.MyVar.vaccine_names);
            let station = this.state.stations
            vaccine_name.map(function (vaccItem) {
              const result = station_vaccine.filter(item => item.name == vaccItem);
              station[vaccItem] = result.map(function (items) {
                return {
                  label: items.package_id + " (" + items.name + ") ",
                  value: items,
                  key: items.package_id
                };
              });
              vaccine_parent[vaccItem].map(function (items) {
                station[items] = station[vaccItem]
              })
            })
            this.setState({ stations: station })
            this._request_vaccines()

          }
          else if (d.status_code == 501) {

            alert("Session Expired. Please Login again")
            this.props.navigation.dispatch(resetAction);

          }
          else if (d.status_code == 400 || d.status_code == 404) {
            this.dropDownAlertRef.alertWithType('error', 'Error', d.status_msg);
          }

          else {
            this.dropDownAlertRef.alertWithType('error', 'Error', "Internal Server Error");
          }
        }
        else {
          console.log("data is Undefined")
        }
      })
    } catch (e) {
      this.dropDownAlertRef.alertWithType('error', 'Error', e);
      console.log(e)
    }
  }

  _initState = async () => {

    this.setState({
      RCHId: null,
      preloaded: false,
      nextAge: null,
      next_maxDate: null,
      nextDate: null,
      childDetails: {},
      takenvaccine: {},
      editedVaccine: {},
      previousTaken: [],
      vaccinepicker: [],
      nextAges: [],
    });

  }


  _request_vaccines() {

    const vaccineDet = global.MyVar.vaccines;
    let vaccineSelect = this.state.vaccineSelect
    let nextAges = []
    vaccineDet.vaccine.map((Vaccitem, index) => {

      if (index > 0) {
        nextAges.push({
          label: i18n.t(Vaccitem.age),
          value: Vaccitem.age,
          key: Vaccitem.age
        })
      }


      if (!vaccineSelect[Vaccitem.age]) {
        vaccineSelect[Vaccitem.age] = {}
      }

      let vaccines = Vaccitem.vaccines
      vaccines.map((vaccine) => {
        if (this.state.stations[vaccine].length > 0) {
          if (!vaccineSelect[Vaccitem.age][vaccine]) {
            vaccineSelect[Vaccitem.age][vaccine] = {
              "selected": this.state.stations[vaccine][0].value,
              "check": false,
              "package_id": this.state.stations[vaccine][0].value.package_id
            }
          }
          else {
            let value = vaccineSelect[Vaccitem.age][vaccine]["selected"]
            vaccineSelect[Vaccitem.age][vaccine] = {
              "selected": value,
              "check": false,
              "package_id": value.package_id
            }

          }
        }
        else {
          vaccineSelect[Vaccitem.age][vaccine] = {
            "selected": {},
            "check": false,
            "package_id": null
          }
        }
      })
    })

    this.setState({
      vaccineSelect: vaccineSelect,
      nextAges: nextAges
    })

  }


  _requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Permissions',
          message:
            'QR Scanner needs access to your camera. ' +
            'Do you want to proceed?',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the camera');
        this.setState({
          hasCameraPermission: true
        });
      } else {
        console.log('Camera permission denied');
        this.setState({
          hasCameraPermission: false
        });
      }
    } catch (err) {
      console.warn(err);
    }
  };

  _requestGeoPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Permissions',
          message:
            'QR Scanner needs access to your GPS. ' +
            'Do you want to proceed?',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the geo for camera');
        this.setState({
          hasGeoPermission: true
        });
        Geolocation.getCurrentPosition((position) => {
          this.setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            error: null
          });
        }, (error) => {
          this.setState({ error: error.message })
          console.log("Geolocation Error : ", error.message)
        });
      } else {
        console.log('Geo permisionfor camer denied');
        this.setState({
          hasGeoPermission: false
        });
      }
    } catch (err) {
      console.warn(err);
    }
  };

  state = {
    checked: "Batch"
  };

  onRchScanButtonPress = () => {
    this.setState({ camType: 0 });

    if (this.state.showcam == true) {
      this.setState({
        showcam: false
      });
    } else {
      this.setState({
        showcam: true
      });
    }
  };

  _alertmsg = () => {
    this.setState({
      showcam: false
    });
    this.dropDownAlertRef.alertWithType('error', 'Error', "Invalid QR code Scanned");
  };

  handleBarCodeScanned = e => {
    if (e.data) {
      if (this.state.camType == 1) {
        try {
          let data = JSON.parse(e.data);
          if (data.VAC_key) {
            console.log(data.VAC_key)
          } else {
            this.setState({
              showcam: false
            });
            this._alertmsg();
          }
        } catch (error) {
          console.log("error", error)
          this._alertmsg();
        }

      } else {
        try {
          let data = JSON.parse(e.data);
          if (data.key_rch_id) {
            let response = Service._get_userInfo(data.key_rch_id);
            response.then(d => {
              if (d != undefined) {
                if (d.status_code == 200) {
                  let child_det = d.data
                  var datas = child_det.map(function (item) {
                    return {
                      label: item.child_name + " (" + item.rch_id + ")",
                      value: item,
                      key: item.rch_id
                    };
                  });

                  this.setState(
                    {
                      preloaded: false,
                      editedVaccine: {},
                      previousTaken: [],
                      rchUsers: datas,
                      showcam: false
                    })

                  if (child_det.length == 1) {
                    this._rch_user(child_det[0])
                  }
                  else {
                    this.modalRef.show()
                    this._rch_user(null)
                  }

                }
                else if (d.status_code == 501) {

                  alert("Session Expired Login again")
                  this.props.navigation.dispatch(resetAction);

                }

                else if (d.status_code == 400 || d.status_code == 404) {
                  this.dropDownAlertRef.alertWithType('error', 'Error', d.status_msg);
                  this._rch_user(null)

                }

                else {
                  this.dropDownAlertRef.alertWithType('error', 'Error', "Internal Server Error");
                  this._rch_user(null)

                }
              }
              else {
                console.log("response is Undifined")
              }
            });

          } else {
            this.setState({
              childDetails: {},
              showuser: false,
              nextAge: null,
              showtable: false,
              RCHId: null,

            })
            this._alertmsg();
          }
        } catch (error) {
          console.log("error", error)
          this.setState({
            childDetails: {},
            showuser: false,
            nextAge: null,
            showtable: false,
            RCHId: null,

          })
          this._alertmsg();
        }
      }
    }
  };

  _setPrevious = () => {

    let data_post = {
      "BeneficiaryIdType": "RCH",
      "BeneficiaryId": this.state.RCHId,
      "station_other": this.state.currentstation,
      "nextDate": {},
      "GeoLocation": {
        "latitude": this.state.latitude,
        "longitude": this.state.longitude
      },
      "Age": {},
      "edited": {}
    }

    let station_id = this.state.currentstation.station_id
    let today = new Date().getDate() + "-" + new Date().getMonth() + 1 + "-" + new Date().getFullYear()
    let RCH_ID = this.state.RCHId

    var datas = {
      [RCH_ID]: {
        payload: data_post,
        appDatas: {
          vaccineSelect: this.state.vaccineSelect,
          vaccinepicker: this.state.vaccinepicker,
          childDetails: this.state.childDetails,
          nextAges: this.state.nextAges
        }
      }
    }

    let prevDetails = Service.retrieveItem("vaccine_Administered")
    prevDetails.then(pre_details => {

      if ((pre_details == null) || (!pre_details[today]))
        pre_details = {
          [today]: {
            [station_id]: datas
          }
        }
      else if (!pre_details[today][station_id]) {
        pre_details[today][station_id] = datas
        console.log("----station null----")
        Service.storeItem("vaccine_Administered", pre_details)
      }
      else if (!pre_details[today][station_id][RCH_ID]) {
        pre_details[today][station_id][RCH_ID] = datas[RCH_ID]
      }
      else {
        console.log("----Already Set Data-----")
      }

      Service.storeItem("vaccine_Administered", pre_details)
    })
  }

  _rch_user = (value) => {

    if (value != null) {
      let vaccMissed = []
      value.vaccines.map(function (item) {

        if (item.missed.length) {
          vaccMissed = [...vaccMissed, ...item.missed]
        }
      })
      let vacPick = []
      if (vaccMissed.length) {
        vacPick = [{

          label: "Missed Vaccines",
          value: { "age": "missed", "vaccines": vaccMissed },
          key: "missed"
        }]
      }


      let datas = []
      value.vaccines.map(function (item) {

        if (item.vaccines.length) {
          datas.push({
            label: i18n.t(item.age),
            value: { age: item.age, vaccines: item.vaccines },
            key: item.age
          })
        }
      });
      let vaccinePicker = [...vacPick, ...datas]

      this.setState(
        {
          RCHId: value.rch_id,
          childDetails: value,
          vaccinepicker: vaccinePicker,
          showcam: false,
          showtable: false,
          showuser: true,
          nextAge: null,
          takenvaccine: {},
          next_maxDate: null,
          nextDate: null,
          editedVaccine: {},
          previousTaken: []
        }, () => {
          AsyncStorage.setItem("RCH_ID", this.state.RCHId);
          this._request_vaccines()
          this._setPrevious()
        })
    }

    else {
      this.setState({
        showcam: false,
        childDetails: {},
        showuser: false,
        nextAge: null,
        RCHId: null,
        vaccinepicker: [],
        showtable: false,
      })
    }
  }

  onchangePicker = (vaccine, data) => {
    let vaccineSelect = this.state.vaccineSelect;
    let takenvaccine = this.state.takenvaccine;
    let editedVaccine = this.state.editedVaccine;
    let value = vaccineSelect[vaccine.age][vaccine.vaccine]["check"]
    let previousTaken = this.state.previousTaken

    if (value) {
      if (takenvaccine[vaccine.age] !== undefined) {
        if (takenvaccine[vaccine.age][vaccine.vaccine] !== undefined) {
          if (this.state.preloaded) {
            if (previousTaken.includes(vaccine.vaccine)) {
              if (takenvaccine[vaccine.age][vaccine.vaccine]["vaccine_batch_id"] !== undefined) {
                if (!editedVaccine[vaccine.age]) {
                  editedVaccine[vaccine.age] = {
                    [vaccine.vaccine]: takenvaccine[vaccine.age][vaccine.vaccine]
                  }
                }
                if (!editedVaccine[vaccine.age][vaccine.vaccine]) {
                  editedVaccine[vaccine.age][vaccine.vaccine] = takenvaccine[vaccine.age][vaccine.vaccine]
                }
              }
            }
          }

          delete takenvaccine[vaccine.age][vaccine.vaccine]
          if (Object.keys(takenvaccine[vaccine.age]).length == 0) {
            delete takenvaccine[vaccine.age]
          }
        }
      }
    }


    if (data != null) {
      vaccineSelect[vaccine.age][vaccine.vaccine] = {
        "selected": data,
        "check": false,
        "package_id": data.package_id
      }
    }
    else {
      vaccineSelect[vaccine.age][vaccine.vaccine] = {
        "selected": {},
        "check": false,
        "package_id": null
      }
    }

    this.setState({
      editedVaccine: editedVaccine,
      vaccineSelect: vaccineSelect,
      takenvaccine: takenvaccine
    })

  }

  onchangeCheckBox = (vaccine) => {

    if (vaccine != null) {

      let vaccineSelect = this.state.vaccineSelect
      let takenvaccine = this.state.takenvaccine
      let value = vaccineSelect[vaccine.age][vaccine.vaccine]["check"]
      let editedVaccine = this.state.editedVaccine
      let previousTaken = this.state.previousTaken

      console.log("---Initial previous List", previousTaken)

      if (!takenvaccine[vaccine.age]) {
        takenvaccine[vaccine.age] = {}
      }

      if (value) {
        if (takenvaccine[vaccine.age] !== undefined) {
          if (takenvaccine[vaccine.age][vaccine.vaccine] !== undefined) {
            if (this.state.preloaded) {
              if (previousTaken.includes(vaccine.vaccine)) {
                if (takenvaccine[vaccine.age][vaccine.vaccine]["vaccine_batch_id"] !== undefined) {
                  if (!editedVaccine[vaccine.age]) {
                    editedVaccine[vaccine.age] = {
                      [vaccine.vaccine]: takenvaccine[vaccine.age][vaccine.vaccine]
                    }
                  }
                  if (!editedVaccine[vaccine.age][vaccine.vaccine]) {
                    editedVaccine[vaccine.age][vaccine.vaccine] = takenvaccine[vaccine.age][vaccine.vaccine]
                  }
                }
              }
            }
            delete takenvaccine[vaccine.age][vaccine.vaccine]
            if (Object.keys(takenvaccine[vaccine.age]).length == 0) {
              delete takenvaccine[vaccine.age]
            }
          }
        }

        let selected = vaccineSelect[vaccine.age][vaccine.vaccine]["selected"]

        vaccineSelect[vaccine.age][vaccine.vaccine] = {
          "selected": selected,
          "check": !value,
          "package_id": selected.package_id
        }

        console.log("---filtered previous List", previousTaken)
      }

      else {

        if (Object.keys(vaccineSelect[vaccine.age][vaccine.vaccine]["selected"]).length == 0) {
          vaccineSelect[vaccine.age][vaccine.vaccine]["check"] = false
          this.dropDownAlertRef.alertWithType('error', 'Error', "Please Select a " + vaccine.vaccine + " vaccine");

        }
        else {

          takenvaccine[vaccine.age][vaccine.vaccine] = {
            "vaccine_batch_id": vaccineSelect[vaccine.age][vaccine.vaccine]["selected"]["uuid"],
            "vaccine_package_id": vaccineSelect[vaccine.age][vaccine.vaccine]["selected"]["package_id"],
          }

          vaccineSelect[vaccine.age][vaccine.vaccine]["check"] = !value

          if (this.state.preloaded) {
            if (editedVaccine[vaccine.age] !== undefined) {
              if (editedVaccine[vaccine.age][vaccine.vaccine] !== undefined) {
                if (editedVaccine[vaccine.age][vaccine.vaccine]["vaccine_batch_id"] !== undefined) {
                  if (editedVaccine[vaccine.age][vaccine.vaccine]["vaccine_batch_id"] == takenvaccine[vaccine.age][vaccine.vaccine]["vaccine_batch_id"]) {
                    delete editedVaccine[vaccine.age][vaccine.vaccine];
                    if (Object.keys(editedVaccine[vaccine.age]).length == 0) {
                      delete editedVaccine[vaccine.age]
                    }
                  }
                }
              }
            }
          }
        }
      }

      this.setState({
        editedVaccine: editedVaccine,
        takenvaccine: takenvaccine,
        vaccineSelect: vaccineSelect,
      })

    }

    else {
      console.log("checkBox Function vaccine Null")
    }

  }

  nextVaccineMissed = (vaccine, date) => {

    console.log(date)
    let takenvaccine = this.state.takenvaccine
    let vaccineSelect = this.state.vaccineSelect

    if (!takenvaccine[vaccine.age])
      takenvaccine[vaccine.age] = {}
    if (!takenvaccine[vaccine.age][vaccine.vaccine])
      takenvaccine[vaccine.age][vaccine.vaccine] = {}

    vaccineSelect[vaccine.age][vaccine.vaccine]["date"] = date
    if (takenvaccine[vaccine.age][vaccine.vaccine]["reason"] == undefined) {
      takenvaccine[vaccine.age][vaccine.vaccine] = {
        "next_vaccine_date": Service.changeto_date_string(date),
        "reason": " "
      }
    }
    else {
      takenvaccine[vaccine.age][vaccine.vaccine]["next_vaccine_date"] = Service.changeto_date_string(date)
    }

    this.setState({
      vaccineSelect: vaccineSelect,
      takenvaccine: takenvaccine
    })

  }

  reasonFn = (vaccine, reason) => {

    let takenvaccine = this.state.takenvaccine
    let vaccineSelect = this.state.vaccineSelect

    if (!takenvaccine[vaccine.age])
      takenvaccine[vaccine.age] = {}
    if (!takenvaccine[vaccine.age][vaccine.vaccine])
      takenvaccine[vaccine.age][vaccine.vaccine] = {}

    vaccineSelect[vaccine.age][vaccine.vaccine]["reason"] = reason

    if (takenvaccine[vaccine.age][vaccine.vaccine]["next_vaccine_date"] == undefined) {
      takenvaccine[vaccine.age][vaccine.vaccine] = {
        "next_vaccine_date": {},
        "reason": reason
      }
    }
    else {
      takenvaccine[vaccine.age][vaccine.vaccine]["reason"] = reason
    }

    this.setState({
      vaccineSelect: vaccineSelect,
      takenvaccine: takenvaccine
    })

  }

  initPrevious = () => {
    let today = new Date().getDate() + "-" + new Date().getMonth() + 1 + "-" + new Date().getFullYear()
    let prevDetails = Service.retrieveItem("vaccine_Administered")
    prevDetails.then(pre_details => {
      let station_id = this.state.currentstation.station_id
      if (pre_details !== null) {
        if (pre_details[today] !== undefined) {
          console.log("---vaccine for date available---")
          if (pre_details[today][station_id] !== undefined) {
            let RCH_IDS = Object.keys(pre_details[today][station_id])
            if (RCH_IDS.length == 0)
              this.dropDownAlertRef.alertWithType('warn', 'Warning', "No vaccines are administered today");
            else {
              if (RCH_IDS.length == 1) {
                this.loadPrevious(pre_details[today][station_id][RCH_IDS[0]])
              }
              else {
                let datas = []
                RCH_IDS.map(function (item) {
                  datas.push({
                    label: pre_details[today][station_id][item].appDatas.childDetails.child_name + " (" + item + " )",
                    value: pre_details[today][station_id][item],
                  })
                })
                this.setState({ preModal: datas })
                this.prevmodalRef.show()
              }
            }
          }
          else {
            this.dropDownAlertRef.alertWithType('warn', 'Warning', "No vaccines administered from this station");
            console.log("----no data in this station-----")
          }
        }
        else {
          this.dropDownAlertRef.alertWithType('warn', 'Warning', "No vaccines are administered today");
          console.log("----no datas today-----")
        }
      }
      else {
        console.log("-----No Datas Loaded-------")
        this.dropDownAlertRef.alertWithType('warn', 'Warning', "No vaccines administered from this station");
      }
    })
  }

  loadPrevious = async (value) => {
    if (value != null) {

      let takenVaccine = value.payload.Age
      let previousTaken = []
      Object.keys(takenVaccine).map(function (key) {
        Object.keys(takenVaccine[key]).map(function (value) {
          console.log(value)
          if (takenVaccine[key][value]["vaccine_batch_id"] !== undefined)
            previousTaken.push(value)
        });
      });
      console.log("---previous Designed---", previousTaken)
      var datas = [{
        label: value.appDatas.childDetails.child_name + " (" + value.appDatas.childDetails.rch_id + ")",
        value: value.appDatas.childDetails,
        key: value.appDatas.childDetails.rch_id
      }]
      this.setState({
        preloaded: true,
        showuser: false,
        RCHId: value.payload.BeneficiaryId,
        childDetails: value.appDatas.childDetails,
        vaccinepicker: value.appDatas.vaccinepicker,
        vaccineSelect: value.appDatas.vaccineSelect,
        takenvaccine: takenVaccine,
        nextAges: value.appDatas.nextAges,
        previousTaken: previousTaken,
        rchUsers: datas,
      }, () => {
        AsyncStorage.setItem("RCH_ID", this.state.RCHId);

        if (Object.keys(value.payload.nextDate).length) {
          this.setState({
            nextAge: value.payload.nextDate.age,
            nextDate: Service.date_change(value.payload.nextDate.date),
            showuser: true
          })
        }
        else {
          this.setState({
            nextAge: null,
            nextDate: null,
            showuser: true
          })
        }
      })

    }
    else {
      console.log("=--==-previous data null while picked------")
    }
  }

  nextVaccine = (date) => {
    if (this.state.nextAge !== null) {
      this.setState({
        nextDate: date,
      });
    }
    else {
      this.dropDownAlertRef.alertWithType('error', 'Missing', "Next Age Not selected. Select the Age from Picker");
    }

  }

  onSubmit = () => {
    if (this.state.RCHId) {

      console.log("---editedVaccine---", this.state.editedVaccine)

      if (Object.keys(this.state.editedVaccine).length) {
        this.submitFunction()
      }
      else {
        if (Object.keys(this.state.takenvaccine).length)
          this.submitFunction()
        else
          this.dropDownAlertRef.alertWithType('error', 'Missing', "No vaccines are taken, Please take the vaccination");
      }
    }
    else {
      this.dropDownAlertRef.alertWithType('error', 'Error', "RCH ID Missing. Scan the RCH ID to take a vaccine");
    };
  }

  submitFunction = () => {

    let takenVaccine = this.state.takenvaccine
    var alertMsg = ""

    Object.keys(takenVaccine).map(function (key) {
      Object.keys(takenVaccine[key]).map(function (value) {
        console.log(value)
        if (takenVaccine[key][value]["vaccine_batch_id"] !== undefined)
          alertMsg = alertMsg + value + "   "
      });
    });

    Alert.alert(
      "Confirmation Message",
      "Taken Vaccines are : " + alertMsg,
      [
        { text: 'NO', onPress: () => console.log('NO Pressed'), style: 'cancel' },
        { text: 'Yes', onPress: () => this.sendImmuneData() }])

  }

  sendImmuneData = () => {

    let nextDate = {}
    if (this.state.nextAge !== null) {
      nextDate = {
        "age": this.state.nextAge,
        "date": Service.changeto_date_string(this.state.nextDate)
      }
    }
    let data_post = {
      "BeneficiaryIdType": "RCH",
      "BeneficiaryId": this.state.RCHId,
      "station_other": this.state.currentstation,
      "nextDate": nextDate,
      "GeoLocation": {
        "latitude": this.state.latitude,
        "longitude": this.state.longitude
      },
      "Age": this.state.takenvaccine,
      "edited": this.state.editedVaccine
    }

    console.log("----takenVaccine----", this.state.takenvaccine)
    console.log("----Data Post----", JSON.stringify(data_post))

    let response = Service._send_immunization_data(data_post);
    response.then(d => {
      if (d.status_code == 200) {

        let station_id = this.state.currentstation.station_id
        let today = new Date().getDate() + "-" + new Date().getMonth() + 1 + "-" + new Date().getFullYear()

        var datas = {}
        var RCH_ID = this.state.RCHId

        datas[RCH_ID] = {
          payload: data_post,
          appDatas: {
            vaccineSelect: this.state.vaccineSelect,
            vaccinepicker: this.state.vaccinepicker,
            childDetails: this.state.childDetails,
            nextAges: this.state.nextAges
          }
        }

        let prevDetails = Service.retrieveItem("vaccine_Administered")
        prevDetails.then(pre_details => {

          if ((pre_details == null) || (!pre_details[today]))
            pre_details = {
              [today]: {
                [station_id]: datas
              }
            }
          else if (!pre_details[today][station_id]) {
            pre_details[today][station_id] = datas
            console.log("----station null----")
          }
          else {
            pre_details[today][station_id][RCH_ID] = datas[RCH_ID]
          }

          this.setState({
            showcam: false,
            showtable: false,
            showuser: false,
          });

          Service.storeItem("vaccine_Administered", pre_details)
          this.dropDownAlertRef.alertWithType('success', 'Success', 'Vaccine Taken Successfully');
          this._initState()
          this._VaccineDetails()

        })

      }
      else if (d.status_code == 501) {

        alert("Session Expired Login and try again")
        this.props.navigation.dispatch(resetAction);

      }

      else if (d.status_code == 400 || d.status_code == 404) {
        this.dropDownAlertRef.alertWithType('error', 'Error', d.status_msg);
        this._rch_user(null)

      } else {
        console.log("error", d)
        this.dropDownAlertRef.alertWithType('error', 'Error', 'Internal Server Error... Try again Later');
      }
    });

  };

  collapseFunction(isCollapsed, ageGroup) {
    if (isCollapsed) {
      if (ageGroup) {
        let maxDate = null
        let vaccinepicker = this.state.vaccinepicker
        let dates = []

        let nextVacc = vaccinepicker.filter(ageGroupSet => ageGroupSet.key == ageGroup)
        if (!nextVacc.length || !nextVacc[0].value) {
          return
        }
        nextVacc[0].value.vaccines.map((item) => {
          dates.push(moment((Service.date_change(item.eligible_date)), 'DD-MM-YYYY'))
        })


        let maximumDate = (new Date(Math.max.apply(null, dates)));
        maxDate = maximumDate.getDate() + "-" + (maximumDate.getMonth() + 1) + "-" + maximumDate.getFullYear()
        this.setState({
          nextDate: maxDate,
          nextAge: ageGroup,
          next_maxDate: maxDate
        })
      }
      else {
        this.setState({
          nextDate: null,
          nextAge: null,
          next_maxDate: null
        })

      }
    }
  }

  render() {
    i18n.locale = this.state.lang;
    return (
      <>
        <View>
          <DropdownAlert ref={ref => this.dropDownAlertRef = ref} />
        </View>
        <View style={styles.MainContainer}>
          <InnerHeader navigation={this.props.navigation} />
          <View style={{ backgroundColor: '#008abe', paddingTop: '.1%', height: '15%', alignContent: 'center', paddingBottom: '.5%' }}>
            <Text style={styles.title}>{i18n.t("VACCINE")}</Text>
          </View>
          <ScrollView>
            {this.state.showcam == false && (
              <View style={styles.Panel}>
                <View>
                  <Text style={styles.ScanText}>{i18n.t("SCAN")}</Text>
                  <TouchableHighlight
                    style={[styles.button, styles.Button]}
                    onPress={this.onRchScanButtonPress}>
                    <Image
                      style={styles.inputIcon}
                      source={require("../assets/icons8-qr-code-24.png")}
                    />
                  </TouchableHighlight>
                  <View style={{ paddingTop: 10, alignContent: 'center' }}>
                    <TouchableHighlight
                      style={[styles.buttonContainer, styles.Button]}
                      onPress={() => this.initPrevious()}>
                      <Text style={styles.buttonText}>Recently Administered</Text>
                    </TouchableHighlight>
                  </View>
                  <View >
                    <ModalSelectList
                      ref={(ref) => this.prevmodalRef = ref}
                      placeholder={"Choose the Child"}
                      closeButtonText={"Close"}
                      options={this.state.preModal}
                      onSelectedOption={value => this.loadPrevious(value)}
                      on
                      disableTextSearch={false} />
                  </View>

                  <View >
                    <ModalSelectList
                      ref={(ref) => this.modalRef = ref}
                      placeholder={"Choose the Child"}
                      closeButtonText={"Close"}
                      options={this.state.rchUsers}
                      onSelectedOption={value => this._rch_user(value)}
                      disableTextSearch={false}
                    />
                  </View>

                  {this.state.showuser && (
                    <View>

                      <View style={styles.pickerStyle}>
                        <RNPickerSelect
                          placeholder={{}}
                          onValueChange={value => this._rch_user(value)}
                          items={this.state.rchUsers}
                          value={this.state.childDetails}
                          ref={ref => (this.AgeselectionPicker = ref)}
                        />
                      </View>

                      <Table borderStyle={{ borderWidth: 2, borderColor: '#c8e1ff' }}>
                        <Rows flexArr={[1.5, 3.5]}
                          data={[
                            [<Text style={styles.TextLabel}>Child's Name</Text>,
                            <TextInput
                              style={styles.TextInputStyle}
                              placeholder="Child Name"
                              editable={false}>
                              {this.state.childDetails.child_name}
                            </TextInput>
                            ],
                            [
                              <Text style={styles.TextLabel}>Gender</Text>,
                              <TextInput
                                style={styles.TextInputStyle}
                                placeholder="Gender"
                                editable={false}
                                multiline={true}>
                                {this.state.childDetails.gender}
                              </TextInput>

                            ],
                            [
                              <Text style={styles.TextLabel}>Date Of Birth</Text>,
                              <TextInput
                                style={styles.TextInputStyle}
                                placeholder="Date Of Birth"
                                editable={false}
                                multiline={true}>
                                {Service.date_of_birth(this.state.childDetails.dob)}
                              </TextInput>
                            ],
                            [
                              <Text style={styles.TextLabel}>Mother's Name</Text>,
                              <TextInput
                                style={styles.TextInputStyle}
                                placeholder="Mother Name"
                                editable={false}
                                multiline={true}>
                                {this.state.childDetails.woman_name}
                              </TextInput>,

                            ],
                            [
                              <Text style={styles.TextLabel}>Father's Name</Text>,
                              <TextInput
                                style={styles.TextInputStyle}
                                placeholder="Father Name"
                                editable={false}
                                multiline={true}>
                                {this.state.childDetails.husband_name}
                              </TextInput>

                            ],
                            [
                              <Text style={styles.TextLabel}>Phone Num</Text>,
                              <TextInput
                                style={styles.TextInputStyle}
                                placeholder="Father Name"
                                editable={false}
                                multiline={true}>
                                {this.state.childDetails.phone_no}
                              </TextInput>

                            ],
                            [
                              <Text style={styles.TextLabel}>Address</Text>,
                              <TextInput
                                style={styles.TextInputStyle}
                                placeholder="Father Name"
                                editable={false}
                                multiline={true}>
                                {this.state.childDetails.address}
                              </TextInput>
                            ]
                          ]
                          } />
                      </Table>

                      <View style={{ paddingTop: 10, alignContent: 'center' }}>
                        <TouchableHighlight
                          style={[styles.buttonContainer, styles.Button]}
                          onPress={() =>
                            this.props.navigation.navigate('child_vaccination', { RCH_ID: this.state.RCHId })}
                        >
                          <Text style={styles.buttonText}>Vaccination Information</Text>
                        </TouchableHighlight>

                      </View>

                      <View>
                        {this.state.vaccinepicker.map((item, index) => {
                          return this.renderCollapse(item);
                        })}
                      </View>

                    </View>
                  )}
                </View>
              </View>
            )}
          </ScrollView>
          {this.state.showcam == false && this.state.showuser && (
            <View>
              <View>
                <Table >
                  <Rows
                    style={styles.head1} textStyle={styles.text}
                    data={[
                      [
                        <Text style={styles.vactitle}>{i18n.t("NextDate")}</Text>
                      ],
                      [
                        <View>
                          <RNPickerSelect
                            placeholder={{
                              label: "Select Next Age",
                              key: null,
                              value: null
                            }}
                            placeholderTextColor="#b3b5ba"
                            onValueChange={value => this.collapseFunction(true, value)}
                            items={this.state.nextAges}
                            value={this.state.nextAge}
                          />
                        </View>,
                        <DatePicker
                          style={{ backgroundColor: "#fff", width: "100%", borderColor: "#fff" }}
                          mode="date"
                          ref={(ref) => this.datePickerRef = ref}
                          date={this.state.nextDate}
                          placeholder="Next Vaccination Date"
                          format="DD-MM-YYYY"
                          minDate={new Date()}
                          onDateChange={date => {
                            this.nextVaccine(date);
                          }}
                        />
                      ]
                    ]}
                  />
                </Table>
              </View>
              <View>
                <TouchableHighlight
                  style={[styles.buttonContainer, styles.Button]}
                  onPress={this.onSubmit.bind(this)}
                >
                  <Text style={styles.buttonText}>Submit</Text>
                </TouchableHighlight>
              </View>
            </View>
          )}
        </View>
        {this.state.showcam && (
          <View style={{ flex: 1 }}>
            <BarCodeScanner
              onRead={this.handleBarCodeScanned}
              showMarker={true}
              bottomContent={
                <Button
                  title={"Cancel"}
                  onPress={() => this.setState({ showcam: false })}
                />
              }
            />
            {console.log("============BREAK POINT==================")}
          </View>
        )}
      </>
    );
  }

  renderCollapse(vaccList) {

    return (
      <View>
        <Collapse        >
          <CollapseHeader>
            <View style={styles.collapseStyle}>
              <Text style={styles.vactitle}>{vaccList.label}</Text>
            </View>

          </CollapseHeader>
          <CollapseBody>

            <View>
              {vaccList.value.vaccines.map((item) => {
                return this.renderRow(item, vaccList.key);
              })}
            </View>

          </CollapseBody>
        </Collapse>
      </View>
    );

  }

  renderRow(row, vaccAge) {

    return (
      <View style={{ marginTop: 10 }}>


        <Table borderStyle={{ borderWidth: 3, borderColor: "#008abe", }}>
          <Rows
            flexArr={[1]} style={styles.head} textStyle={styles.text}
            data={[
              [
                <Text style={styles.vactitle}>{row.vaccine}</Text>,
              ],
              [
                <View>
                  <RNPickerSelect
                    placeholder={{
                      label: "Select a vaccine",
                      key: null,
                      value: null
                    }}
                    placeholderTextColor="#b3b5ba"
                    onValueChange={value => this.onchangePicker(row, value)}
                    items={this.state.stations[row.vaccine]}
                    ref={ref => (this.AgeselectionPicker = ref)}
                    itemKey={this.state.vaccineSelect[row.age][row.vaccine]["package_id"]}
                  />
                </View>,

                <CheckBox
                  center
                  iconRight
                  checkedColor='green'
                  uncheckedColor='red'
                  checked={this.state.vaccineSelect[row.age][row.vaccine]["check"]}
                  onPress={() => this.onchangeCheckBox(row)}

                />

              ],
              [
                <Text>Batch Id:</Text>,
                <TextInput
                  style={styles.TextInputStyle}
                  placeholder="Batch_ID"
                  disabled={true}
                  editable={false}>
                  {this.state.vaccineSelect[row.age][row.vaccine]["selected"]["package_id"]}
                </TextInput>,
                <Text>Exp Date:</Text>,
                <TextInput
                  style={styles.TextInputStyle}
                  placeholder="Exp Date"
                  editable={false}                >
                  {Service.date_change(this.state.vaccineSelect[row.age][row.vaccine]["selected"]["expiry_date"])}
                </TextInput>

              ],

            ]
            }
          />
        </Table>
        { this.state.vaccineSelect[row.age][row.vaccine]["check"] == false && vaccAge !== "missed" && (
          <View>
            <View style={styles.inputContainerb}>
              <TextInput
                style={styles.TextInputStyle}
                multiline={true}
                placeholder={"Reason for not taking " + row.vaccine + " Vaccine"}
                maxLength={100}
                value={this.state.vaccineSelect[row.age][row.vaccine]["reason"]}
                onChangeText={text => this.reasonFn(row, text.trimLeft())}
              />
            </View>
            <View style={styles.inputContainer}>
              <DatePicker
                style={{ marginLeft: 10, backgroundColor: "#fff", width: "85%", borderColor: "#fff" }}
                mode="date"
                ref={(ref) => this.datePickerRef = ref}
                date={this.state.vaccineSelect[row.age][row.vaccine]["date"]}
                multiline={true}
                placeholder={"Next Date for " + row.vaccine}
                format="DD-MM-YYYY"
                minDate={new Date()}
                onDateChange={date => {
                  this.nextVaccineMissed(row, date);
                }}
              />
            </View>
          </View>
        )}
      </View>
    );
  }
}

const resizeMode = "center";
const styles = StyleSheet.create({
  MainContainer: {
    flex: 1,
    resizeMode,
    backgroundColor: "#008abe",
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center"
  },

  table: {
    width: "95%",
    alignSelf: "center",
  },

  bottomView: {
    width: '100%',
    backgroundColor: '#008abe',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
  },

  title: {
    marginLeft: "5%",
    marginRight: "5%",
    fontSize: 28,
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 25,
    fontWeight: "bold",
    textAlign: "center"
  },
  ScanText: {
    fontSize: 20,
    fontWeight: "bold",
    alignSelf: "center"
  },
  Text: {
    fontSize: 14,
    fontWeight: "bold",
    alignSelf: "center",
    textAlign: "center"
  },

  TextLabel: {

    fontSize: 12,
    fontWeight: "bold",
    alignSelf: "center",
    textAlign: "center",
    fontFamily: 'lucida grande'

  },


  button: {
    height: 100,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 10,
    width: 100,
    borderRadius: 30
  },
  inputContainerb: {
    borderBottomColor: '#F5FCFF',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    borderBottomWidth: 1,
    marginTop: 10,
    width: 270,
    height: 80,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: "center",
    shadowColor: "#808080",
  },

  buttonText: {
    fontSize: 18,
    color: "white",
    alignSelf: "center",
    fontWeight: "bold",
  },
  ExpoContainer: {
    width: "90%"
  },
  BarScanner: {
    flex: 1,
    width: 400,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  inputIcon: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignSelf: "center"
  },
  Button: {
    backgroundColor: "#205370",

  },
  inputContainer: {
    borderBottomColor: "#F5FCFF",
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    borderBottomWidth: 1,
    width: 250,
    height: 45,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center"
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
    marginBottom: 10,
    marginTop: 10
  },
  collapseStyle: {
    height: 45,
    width: "100%",
    color: "#344953",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    alignContent: 'center',
    borderBottomColor: "#6a8bd4",
    backgroundColor: "#6a8bd4",
    borderRadius: 30,
    marginBottom: 5,
    marginTop: 5
  },
  buttonContainer: {
    height: 45,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
    marginTop: 10,
    width: 250,
    borderRadius: 30
  },
  btnScanContainer: {
    height: 35,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  vactitle: {
    marginLeft: "5%",
    marginRight: "5%",
    fontSize: 20,
    color: "white",
    justifyContent: "center",
    alignSelf: "center",
    fontWeight: "bold",
    textAlign: "center"
  },
  TextInputStyle: {
    height: 35,
    color: 'black',
    marginLeft: '3%',
    marginRight: '3%',
    flex: 1,
    fontWeight: "bold",
    fontSize: 15,


  },
  tableMargin: {
    marginBottom: 10,
    backgroundColor: "white"
  },
  ModalPanel: {

    backgroundColor: '#008abe',
    alignSelf: "center",
    justifyContent: "center",
    width: "95%",
    borderRadius: 5,
    marginTop: 25,
    padding: 5,
    marginBottom: 25,
    paddingTop: 5,
    alignItems: "center"
  },

  btn: {
    backgroundColor: "#3A7597",
    borderRadius: 15,
    alignSelf: 'center'

  },
  head: { height: 40, backgroundColor: '#bbcfff', borderRadius: 5, marginTop: 2 },
  head1: { height: 40, backgroundColor: '#bbf3ff', borderRadius: 5, marginTop: 2 },
  wrapper: { flexDirection: 'row', marginBottom: 15 },
  tabletitle: { flex: 3, backgroundColor: '#f6f8fa' },
  row: { height: 130 },
  text: { textAlign: 'center' }
});