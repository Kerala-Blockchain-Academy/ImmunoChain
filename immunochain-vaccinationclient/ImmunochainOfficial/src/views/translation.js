import React, { Component } from "react";
import {
  View,
  StyleSheet,
  BackHandler,
  AppRegistry,
  AsyncStorage,
  TouchableOpacity,
  Text
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import DropdownAlert from 'react-native-dropdownalert';



export default class language extends Component {

  constructor(props) {
    super(props);

    this.state = {
      lang: 'en',
      translation: []
    }
    this.onPress = this.onPress.bind(this);
  }

  static navigationOptions = {
    title: 'Language',
    headerMode: 'float',
  };
  componentDidMount() {
    let translations = global.MyVar.languages;
    console.log(translations)
    this.setState({ translation: translations });
    this._setRNPicker(translations);
  }

  _setRNPicker = (translations) => {
    var lang = translations.map(function (item) {
      return {
        label: item.name,
        value: item.id,
        key: item.id
      };
    });
    this.setState({ translation: lang });
  }

  componentWillMount() {
    BackHandler.addEventListener("hardwareBackPress", this.onBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.onBackPress);
  }



  onBackPress = () => {
    //Code to display alert message when use click on android device back button.
    // this.props.navigation.goBack(null);
    return false;
  };

  onPress = (value) => {
    this.setState({ lang: value });
    AsyncStorage.setItem("App_Language", value);
  }

  onsubmit = () => {
    if (this.state.lang) {
      AsyncStorage.setItem("App_Language", this.state.lang);
      this.props.navigation.goBack(null);
    } else {
      this.dropDownAlertRef.alertWithType('warn', 'Language Not Selected', "Choose your language to continue");
    }
  }

  handleChangeOption = (itemValue) => {
    if (itemValue != null) {
      console.log("item=", itemValue)
      this.setState({
        lang: itemValue
      });

    } else {
      this.setState({
        lang: null
      });
    }

  }

  render() {
    return (
      <>
        <View>
          <DropdownAlert ref={ref => this.dropDownAlertRef = ref} />
        </View>
        <View style={styles.container}>
          <Text style={styles.heading}>App Language</Text>
          <Text style={styles.subHeading}>Select App Language</Text>
          <View style={styles.pickerStyle}>
            <RNPickerSelect
              placeholder={{
                label: "Select Your Language",
                value: null,
                key: null
              }}
              onValueChange={value => this.handleChangeOption(value)}
              items={this.state.translation}
              value={this.state.lang}
            />
          </View>

          <TouchableOpacity
            onPress={this.onsubmit}
            activeOpacity={0.7}
            style={[styles.buttonContainer, styles.Button]}
          >
            <Text style={styles.buttonText}>Done</Text>
          </TouchableOpacity>

        </View>
      </>
    );
  }
}
AppRegistry.registerComponent("station", () => station);


const resizeMode = 'center';
const styles = StyleSheet.create({
  container: {
    resizeMode,
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    backgroundColor: "#008abe",
  },
  twoPickers: {
    height: 88,
    borderColor: 'black',
    borderWidth: 1,
  },
  twoPickerItems: {
    height: 88,
    color: 'red'
  },
  heading: {
    fontSize: 30,
    alignSelf: "center",
    marginTop: 30,
    marginBottom: 40,
    fontWeight: "bold"
  },
  subHeading: {
    fontSize: 18,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  button: {
    height: 36,
    backgroundColor: "#48BBEC",
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 10,
    alignSelf: "stretch",
    justifyContent: "center"
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
    marginBottom: 20,
    width: 270,
    borderRadius: 30,
  },

  pickerStyle: {
    width: 270,
    color: '#344953',
    alignSelf: "center",
    justifyContent: 'center',
    borderBottomColor: '#F5FCFF',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    borderBottomWidth: 1,
    marginBottom: 20,
  }
});
