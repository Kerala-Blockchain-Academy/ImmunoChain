import React from 'react';
import { Button, View, Text, SafeAreaView, TouchableOpacity, Alert, AsyncStorage } from 'react-native';
import { createAppContainer, StackActions, NavigationActions } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import { createDrawerNavigator, DrawerNavigatorItems } from 'react-navigation-drawer';
import Ionicons from "react-native-vector-icons/Ionicons";

import translation from '../views/translation';
import switchView from '../views/switchView'
import LoginwithOTP from '../views/LoginwithOTP'
import RCH_HOME from '../views/Rch_home'
import Home from "../views/Home";
import Rch_user from '../views/rchUser'



const config = Platform.select({
  android: { headerMode: "none" },
  default: {},
});


class Hidden extends React.Component {
  render() {
    return null;
  }
}

const Navigator = createStackNavigator({

  switchView: switchView,
  LoginwithOTP: LoginwithOTP,
  Rch_home: RCH_HOME,
  Home: Home,

}, {
  headerMode: 'none',
  initialRouteName: "switchView",
},
  config
);
Navigator.navigationOptions = {
  drawerLabel: <Hidden />,
};
Navigator.path = '';

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



const Rch_userStack = createStackNavigator({
  rchUser: {
    screen: Rch_user
  },
},
  config
);
Rch_userStack.navigationOptions = {
  drawerLabel: 'RCH Users',
  drawerIcon: ({ tintColor }) => (
    <Ionicons name="md-book" style={{ color: tintColor }} size={30} />
  ),
};
Rch_userStack.path = ''


const MainNavigator = createDrawerNavigator(
  {

    Navigator: {
      screen: Navigator,
    },
    TranslationStack: {
      screen: TranslationStack,
    },
    Rch_userStack: {
      screen: Rch_userStack,
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
                    AsyncStorage.clear();
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
	<Text style={{ margin: 16, fontWeight: 'bold' }}>V:0.9.4</Text>
      </View>
    ),


  },
  {
    headerMode: 'none',
  }
);
MainNavigator.path = '';

const resetAction = StackActions.reset({
  index: 0,
  actions: [NavigationActions.navigate({ routeName: "LoginwithOTP" })]
});


export default createAppContainer(MainNavigator);
