import React, { Component } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
  Image,
  Alert,
  ScrollView,
  AppRegistry,
  AsyncStorage,
  FlatList,
  NativeModules,
} from "react-native";
import { Text } from 'react-native-elements';
import i18n from "i18n-js";
import InnerHeader from "../components/InnerHeader";
import { widthPercentageToDP, heightPercentageToDP } from 'react-native-responsive-screen';

i18n.fallbacks = true;
i18n.locale = NativeModules.I18nManager.localeIdentifier;
i18n.translations = {
  en: require("../translations/en.json"),
  ml: require("../translations/ml.json"),
  hi: require("../translations/hi.json")
};

const Role_screen = {
  images: [{
    id: 1,
    title: "STOCKIN",
    image: require("../assets/stock_in.png")
  },
  {
    id: 2,
    title: "STOCKOUT",
    image: require("../assets/stock_out.png")
  },
  {
    id: 3,
    title: "STOCKDISCARD",
    image: require("../assets/stockUpdateIcon.jpeg")
  },
  ]
};

export default class Stock_home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lang: "en",
    }
  }
  componentDidMount() {
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

  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
  }

  onBackPress = () => {
    this.props.navigation.goBack(null);
    return true;
  }

  clickEventListener = (item) => {
    if (item.id === 1) { this._stock_in(); }
    else if (item.id === 2) { this._stock_out(); }
    else if (item.id === 3) {
      this._stock_discard();
    }
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

  _stock_in = () => {
    this.props.navigation.navigate("Stock_in");
  }

  _stock_out = () => {
    this.props.navigation.navigate("CHCCenter");
  }
  _stock_discard = () => {
    this.props.navigation.navigate("Stock_Discard");
  }


  render() {
    i18n.locale = this.state.lang;
    return (
      <View style={styles.container}>
        <InnerHeader navigation={this.props.navigation} />
        <View style={{ backgroundColor: '#008abe', paddingTop: '.1%', height: '10%', alignContent: 'center', paddingBottom: '.5%' }}>
          <Text style={styles.titleh1}>{i18n.t("STOCKMANAGEMENT")}</Text>
        </View>
        <ScrollView style={{ width: widthPercentageToDP('100%') }} keyboardShouldPersistTaps="always">
          <FlatList style={styles.list}
            contentContainerStyle={styles.listContainer}
            data={Role_screen.images}
            horizontal={false}
            numColumns={1}
            keyExtractor={(item) => {
              return item.id;
            }}
            renderItem={({ item }) => {
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
            }} />
        </ScrollView>
      </View>
    );
  }
}
AppRegistry.registerComponent('Stock_home', () => Stock_home);


const resizeMode = 'center';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    resizeMode,
    backgroundColor: "#008abe",
    position: 'absolute',
    width: widthPercentageToDP('100%'),
    height: '100%',
    justifyContent: 'center',
  },
  titleh1: {
    fontSize: 30,
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 40,
    fontWeight: "bold"
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
    backgroundColor: "#b8df97",
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
    width: widthPercentageToDP('55%'),
    height: heightPercentageToDP('32%'),
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
