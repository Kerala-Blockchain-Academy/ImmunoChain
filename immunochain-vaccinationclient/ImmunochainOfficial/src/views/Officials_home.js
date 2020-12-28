import React, { Component } from "react";
import {
  AsyncStorage,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
  BackHandler,
  ScrollView,
  NativeModules,
} from "react-native";
import { widthPercentageToDP, heightPercentageToDP } from 'react-native-responsive-screen';
import i18n from "i18n-js";
i18n.fallbacks = true;
import * as Service from "./Service";
import InnerHeader from "../components/InnerHeader";

i18n.locale = NativeModules.I18nManager.localeIdentifier;
i18n.translations = {
  en: require("../translations/en.json"),
  ml: require("../translations/ml.json"),
  hi: require("../translations/hi.json")
};

const Role_screen = {
  images: [{
    id: 1,
    title: "VaccineRegistration",
    image: require("../assets/statecenter.png")
  },
  {
    id: 2,
    title: "StockManagement",
    image: require("../assets/chc_phc.png")
  },
  {
    id: 3,
    title: "VaccineAdministration",
    image: require("../assets/vaccine.png")
  },
  {
    id: 4,
    title: "AdministrationReport",
    image: require("../assets/report.png")
  },

  ]
};


export default class Officials_home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      role: "",
      lang: 'en',
      statecenter_view: false,
      chc_phc_view: false,
      User_Role: "",
      station_name: ""

    };

  }
  componentDidMount() {
    this._setUser_role();
    const { navigation } = this.props;
    this.focusListener = navigation.addListener('didFocus', () => {
      let lang = Service._get_language()
      lang.then((x) => {

        console.log("langhhhhhh", x)
        this.setState({ lang: x })

      })

      let user_det = Service._get_User()
      user_det.then((x) => {

        console.log("user", x)
        this.setState({ station_name: x.Station_Name, User_Role: x.User_Role })

      })
      i18n.locale = this.state.lang;
    });
  }

  _setUser_role = async () => {
    try {
      AsyncStorage.getItem('statecenter_view').then((view) => {
        let view1 = JSON.parse(view)
        if (view1 === true) {
          this.setState({ statecenter_view: true });
        }
        else {
          this.setState({ statecenter_view: false });
        }
      })

      AsyncStorage.getItem('chc_phc_view').then((view) => {

        let view2 = JSON.parse(view)
        if (view2 === true) {
          this.setState({ chc_phc_view: true });
        }
        else {
          this.setState({ chc_phc_view: false });
        }
      })
    } catch (e) {
      console.log(e);
    }
  }

  componentWillMount() {
    BackHandler.addEventListener("hardwareBackPress", this.onBackPress);
  }

  componentWillUnmount() {
    chc_phc_view = false;
    statecenter_view = false;
    this.focusListener.remove();
    BackHandler.removeEventListener("hardwareBackPress", this.onBackPress);
  }


  onBackPress = () => {
    //Code to display alert message when use click on android device back button.
    Alert.alert(
      " Exit From App ",
      " Do you want to exit From App ?",
      [
        {
          text: "Yes", onPress: () => {
            BackHandler.exitApp()
          }
        },
        { text: "No", onPress: () => console.log("NO Pressed") }
      ],
      { cancelable: false }
    );

    // Return true to enable back button over ride.
    return true;
  };
  clickEventListener(item) {
    if (item.id === 1) this.on_statecenter();
    else if (item.id === 2) this.on_phc_chccenter();
    else if (item.id === 3) this.vaccine_details();
    else if (item.id === 4) this.on_report();
    else {
      Alert.alert(
        " Error Message ",
        " Invalid User",
        [
          {
            text: "Yes", onPress: () => {
              Service.asyncClear();
              BackHandler.exitApp()
            }
          },
          { text: "No", onPress: () => console.log("NO Pressed") }
        ],
        { cancelable: false }
      );
    }
  }

  on_report = () => {
    this.props.navigation.navigate("report");
  }

  on_statecenter = () => {
    this.props.navigation.navigate("StateCenter");
  };
  on_phc_chccenter = () => {
    this.props.navigation.navigate("Stock_home");
  };
  vaccine_details = () => {
    this.props.navigation.navigate("about");
  }
  static navigationOptions = {
    title: 'VACCINE MANAGEMENT',
    headerMode: 'float',
  };


  render() {
    i18n.locale = this.state.lang;
    BackHandler.addEventListener("hardwareBackPress", this.onBackPress);

    return (
      <View style={styles.MainContainer}>
        <InnerHeader navigation={this.props.navigation}
          station={this.state.station_name}
          user_role={this.state.User_Role} />
        <ScrollView style={{ width: widthPercentageToDP('100%'), marginTop: ".1%" }} keyboardShouldPersistTaps="always">


          <FlatList style={styles.list}
            contentContainerStyle={styles.listContainer}
            data={Role_screen.images}
            renderItem={({ item }) => {
              if (this.state.statecenter_view) {
                return (
                  <TouchableOpacity style={styles.card} onPress={() => { this.clickEventListener(item) }}>
                    <View style={styles.cardFooter}></View>
                    <Image style={styles.cardImage} source={item.image} />
                    <View style={styles.cardHeader}>
                      <View style={{ alignItems: "center", justifyContent: "center" }}>
                        <Text style={styles.title}>{i18n.t(item.title)}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                )
              }
              if (this.state.chc_phc_view && item.id == 2 || item.id == 3 || item.id == 4) {
                return (
                  <TouchableOpacity style={styles.card} onPress={() => { this.clickEventListener(item) }}>
                    <View style={styles.cardFooter}></View>
                    <Image style={styles.cardImage} source={item.image} />
                    <View style={styles.cardHeader}>
                      <View style={{ alignItems: "center", justifyContent: "center" }}>
                        <Text style={styles.title}>{i18n.t(item.title)}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                )
              }
            }}
            extraData={this.state}
            horizontal={false}
            numColumns={1}
            keyExtractor={(item) => {
              return item.id;

            }}
          />
        </ScrollView>
      </View>

    );
  }
}
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
  },

  container: {
    resizeMode,
    position: 'absolute',
    width: widthPercentageToDP('100%'),
    justifyContent: 'center',
  },
  titleh1: {
    fontSize: 26,
    alignSelf: "center",
    fontWeight: "bold",
    marginVertical: 20,
    height: 40,
    paddingTop: 10
  },
  list: {
    backgroundColor: "#008abe",
  },
  listContainer: {
    alignSelf: "center"
  },
  /******** card **************/
  card: {
    shadowColor: '#00acee',

    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,

    elevation: 12,
    marginVertical: 10,
    backgroundColor: "white",
    marginHorizontal: 10,
    width: widthPercentageToDP('60%'),
    height: heightPercentageToDP('32%'),
    borderRadius: 30,
    borderBottomWidth: 1,
  },
  cardHeader: {
    paddingVertical: 17,
    paddingHorizontal: 16,
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
    flexDirection: 'row',
    alignItems: "center",
    justifyContent: "center"
  },
  cardContent: {
    paddingVertical: 12.5,
    paddingHorizontal: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: "center",
    paddingTop: 12.5,
    paddingBottom: 25,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 1,
    borderBottomRightRadius: 1,
  },
  cardImage: {
    height: 100,
    width: 100,
    alignSelf: 'center',
    borderRadius: 30,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    alignSelf: 'center',
    color: "#696969",
    fontWeight: "bold",
  },
});
