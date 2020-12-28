'use strict';
import { StyleSheet } from 'react-native';

var Style = StyleSheet.create({
  list_container: {
    flex: 1,
    flexDirection: 'column',
    borderRadius: 10,
    margin: 2,
    padding: 5,
    backgroundColor: '#97CAE5',
    paddingTop: 10,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,.2)',
    width: '85%',
  },
  list_item: {
    fontSize: 14,
  },
  list_header: {
    fontSize: 17,
    margin: 10,
    flex: 1,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  list_sub_header: {
    fontSize: 17,
    fontWeight: 'bold',
  },

});

export default Style;