import React from 'react';
import { Button, View, Text, SafeAreaView, TouchableOpacity, Alert, AsyncStorage } from 'react-native';
import { createAppContainer, StackActions, NavigationActions } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createDrawerNavigator, DrawerNavigatorItems } from 'react-navigation-drawer';
import Ionicons from "react-native-vector-icons/Ionicons";

import translation from '../views/translation';
import station from '../views/station';
import Login from "../views/Login";
import Officials_home from '../views/Officials_home';
import Child_vaccination from '../views/child_vaccination';
import About from "../views/About";
import StateCenter from '../views/StateCenter';
import Stock_home from '../views/Stock_home';
import CHCCenter from '../views/CHCCenter';
import Stock_in from '../views/Stock_in';
import Stock_Discard from '../views/Stock_discard';
import Report from '../views/report';
import * as Service from "../views/Service";
import PrinterSettings from '../views/PrinterSettings';


const config = Platform.select({
  android: { headerMode: "none" },
  default: {},
});

const resetAction = StackActions.reset({
  index: 0,
  actions: [NavigationActions.navigate({ routeName: "Login" })]
});

Service.asyncClear();
class Hidden extends React.Component {
  render() {
    return null;
  }
}


const HomeStack = createStackNavigator({
  Officials_home: {
    screen: Officials_home,
  }
},
  config
);
HomeStack.navigationOptions = {
  drawerLabel: <Hidden />,
  gesturesEnabled:false,
};
HomeStack.path = '';

const TranslationStack = createStackNavigator({
  translation: {
    screen: translation,
  }
},
  config
);
TranslationStack.navigationOptions = {
  drawerLabel: "Language",
  drawerIcon: ({ tintColor }) => (
    <Ionicons name="md-log-in" style={{ color: tintColor }} size={30} />
  ),
};
TranslationStack.path = '';

const StationStack = createStackNavigator({
  station: {
    screen: station
  },
},
  config
);
StationStack.navigationOptions = {
  drawerLabel: 'Station',
  drawerIcon: ({ tintColor }) => (
    <Ionicons name="md-book" style={{ color: tintColor }} size={30} />
  ),
};
StationStack.path = ''

const PrinterSettingsStack = createStackNavigator({
  PrinterSettings: {
    screen: PrinterSettings
  },
},
  config
);
PrinterSettingsStack.navigationOptions = {
  drawerLabel: 'Printer Setings',
  drawerIcon: ({ tintColor }) => (
    <Ionicons name="md-print" style={{ color: tintColor }} size={30} />
  ),
};
PrinterSettingsStack.path = ''

const HomeDrawer = createDrawerNavigator(
  {

    Navigator: {
      screen: HomeStack,
    },
    TranslationStack: {
      screen: TranslationStack,
    },
    StationStack: {
      screen: StationStack,
    },
    PrinterSettingsStack: {
      screen: PrinterSettingsStack,
    },
  },
  {
    initialRouteName: 'Navigator',
    edgeWidth: -1,
    contentComponent: (props) => (
      <View style={{ flex: 1 }}>
        <SafeAreaView forceInset={{ top: 'always', horizontal: 'never' }}>
          <DrawerNavigatorItems {...props} />
          <TouchableOpacity onPress={() =>
            Alert.alert(
              'Log out',
              'Do you want to logout?',
              [
                { text: 'Cancel', onPress: () => { return null } },
                {
                  text: 'Confirm', onPress: () => {
                    Service.asyncClear();
                    props.navigation.dispatch(resetAction)
                  }
                },
              ],
              { cancelable: false }
            )
          }>
            <Text style={{ margin: 16, fontWeight: 'bold' }}>Logout</Text>
          </TouchableOpacity>
        </SafeAreaView>
        <Text style={{ margin: 16, fontWeight: 'bold' }}>V:0.9.1</Text>
      </View>
    ),
  },
  {
    headerMode: 'none',
  }
);
HomeDrawer.path = '';

const MainNavigator = createStackNavigator({
  Login: Login,
  HomeDrawer: HomeDrawer,
  about: About,
  child_vaccination: Child_vaccination,
  StateCenter: StateCenter,
  report: Report,
  Stock_home: Stock_home,
  CHCCenter: CHCCenter,
  Stock_in: Stock_in,
  Stock_Discard: Stock_Discard,
}, {
  headerMode: 'none',
  initialRouteName: 'Login',
},
  config
);
MainNavigator.navigationOptions = {
  drawerLabel: <Hidden />,
};
MainNavigator.path = '';

export default createAppContainer(MainNavigator);