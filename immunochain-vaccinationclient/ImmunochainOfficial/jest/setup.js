import {PermissionsAndroid} from "react-native";
  jest.mock(
    './../node_modules/react-native/Libraries/EventEmitter/NativeEventEmitter',
    () => {
        return class MockNativeEventEmitter {
            addListener = () => jest.fn()
            removeListener = () => jest.fn()
            removeAllListeners = () => jest.fn()
        }
    }
)
jest.mock('react-native/Libraries/Components/DatePicker/DatePickerIOS.ios.js', () => {
    const React = require('React');
    return class MockPicker extends React.Component {
        render() {
            return React.createElement('DatePicker', { date: '21.07.2020' });
        }
    };
});
