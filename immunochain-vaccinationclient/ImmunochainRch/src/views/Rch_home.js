import React, { Component } from "react";
import { View, StyleSheet, TouchableOpacity, BackHandler, Image, Alert, ScrollView, AppRegistry, AsyncStorage, NativeModules } from "react-native";
import { Text } from 'react-native-elements';
import InnerHeader from "../components/InnerHeader";
import * as Service from "./Service";
import DropdownAlert from 'react-native-dropdownalert';
import i18n from "i18n-js";

i18n.fallbacks = true;
i18n.locale = NativeModules.I18nManager.localeIdentifier;
i18n.translations = {
  en: require("../translations/en.json"),
  ml: require("../translations/ml.json"),
  hi: require("../translations/hi.json")
};


export default class Stock_home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lang: "en",

    }

  }
  async componentDidMount() {
    let RCH_id = await AsyncStorage.getItem('RCHBook_ID');
    let data = {
      data: RCH_id,
      key: "key_rch_id"
    }
    const Qr_data = Service._getQrcode(data);

    let token = await AsyncStorage.getItem('STORAGE_KEY')
    console.log("---token---", token)


    Qr_data.then((d) => {
      if (d.image_string) {
        image = d.image_string
        this.setState({ Qr_image: image, Qr_image_status: true })
      }
      else {
        this.dropDownAlertRef.alertWithType('error', 'Error', " Invalid Data");
      }
    })

    const { navigation } = this.props;
    this.focusListener = navigation.addListener('didFocus', () => {
      // The screen is focused

      try {
        AsyncStorage.getItem("App_Language").then(value =>
          this.setState({ lang: value })
        );
      } catch (error) {
        console.log("AsyncStorage error: " + error.message);
      }

      i18n.locale = this.state.lang;
    });
  }




  componentWillMount() {
    BackHandler.addEventListener("hardwareBackPress", this.onBackPress);
  }

  componentWillUnmount() {
    this.focusListener.remove();
    BackHandler.removeEventListener("hardwareBackPress", this.onBackPress);
  }

  onBackPress = () => {
    //Code to display alert message when use click on android device back button.

    Alert.alert(
      " Exit From App ",
      " Do you want to Exit ?",
      [
        {
          text: "Yes",
          onPress: () => {
            BackHandler.exitApp();
          }
        },
        { text: "No", onPress: () => console.log("NO Pressed") }
      ],
      { cancelable: false }
    );

    // Return true to enable back button over ride.
    return true;
  };

  clickEventListener = () => {
    this._stock_in();
  }

  _stock_in = () => {
    this.props.navigation.navigate("Home");
  }



  render() {
    i18n.locale = this.state.lang;
    BackHandler.addEventListener("hardwareBackPress", this.onBackPress);
    return (
      <View style={styles.container}>
        <View>
          <DropdownAlert ref={ref => this.dropDownAlertRef = ref} />
        </View>

        <InnerHeader navigation={this.props.navigation} />
        <ScrollView>

          <Text style={styles.titleh1}>{i18n.t("RCHBOOK")}</Text>

          <TouchableOpacity style={styles.card} onPress={() => { this._stock_in() }}>
            <View style={styles.cardFooter}></View>
            <Image style={styles.cardImage} source={require("../assets/rch_option1.jpg")} />
            <View style={styles.cardHeader}>
              <View style={{ alignItems: "center", justifyContent: "center" }}>
                <Text style={styles.title}>{i18n.t("RCHBOOK")}</Text>
              </View>
            </View>
          </TouchableOpacity>

          <Text style={styles.titleh1}>{i18n.t("Rchbookqr")}</Text>
          <View style={[styles.card, { alignSelf: "center" }]}>
            <Image
              source={{
                uri: `data:image/gif;base64,${this.state.Qr_image}`
              }}
              style={{
                height: 200,
                width: 200,
                alignSelf: "center",
                borderRadius: 30,
                borderBottomWidth: 1,
              }}
            />
          </View>
        </ScrollView>
      </View>
    );
  }
}
AppRegistry.registerComponent('Stock_home', () => Stock_home);


const resizeMode = 'center';
const styles = StyleSheet.create({
  container: {
    resizeMode,
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    backgroundColor: "#008abe",
    alignSelf: "center"
  },
  titleh1: {
    fontSize: 28,
    alignSelf: "center",
    marginTop: 25,
    fontWeight: "bold",
    height: 40
  },
  list: {
    backgroundColor: "#008abe",
    alignSelf: "center"

  },
  listContainer: {
    alignSelf: "center"
  },
  /******** card **************/
  card: {
    shadowColor: '#00acee',
    backgroundColor: "#b8df97",
    alignSelf: "center",

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
    width: 215,
    height: 215,
    borderRadius: 30,
    borderBottomWidth: 1,
    alignItems: "center",
    marginTop: 25,

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
    alignSelf: "center",
    paddingTop: 10,
    paddingBottom: 25,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 1,
    borderBottomRightRadius: 1,
  },
  cardImage: {
    height: 120,
    width: 120,
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
