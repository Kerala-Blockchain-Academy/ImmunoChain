import { StyleSheet } from 'react-native';


const styles = StyleSheet.create({
  firstContainer: {
    backgroundColor: '#ECEFF1',
    width: '90%',
    borderRadius: 5,
    height: 200,
    alignSelf: 'center',
    marginTop: 10,
    paddingBottom: 20
  },

  tableContainer: {
    marginLeft: '5%',
    marginBottom: '3%',
    marginRight: '5%',
    marginTop: '3%',
    width: '100%',
    borderRadius: 5,
    justifyContent: 'center',
  },
  category: {
    marginLeft: 3,
    backgroundColor: '#99cfec',
    borderRadius: 5
  },
  item: {
    color: 'white',
    fontWeight: 'bold',
    padding: 10,
    alignSelf: 'center'
  },
  inputArea: {
    marginRight: 3,
    backgroundColor: '#fff',
    borderRadius: 5,
    width: '52%',
    paddingLeft: 5,
    paddingRight: 5,
    paddingBottom: 5,
    marginLeft: 5
  },
  input: {
    padding: 5,
    borderBottomWidth: 1
  },
  picker: {
    height: 40,
    width: 300,
    alignSelf: 'center',
    backgroundColor: '#99cfec',
    marginBottom: 10,
    color: '#fff'
  },
  agepicker: {

    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#99cfec',
    marginBottom: 10,
    marginTop: 10,
    color: '#fff',
    borderRadius: 3
  },

  Table2container: {
    backgroundColor: '#99cfec',
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 5,
  },
  header: {
    height: 70,
    backgroundColor: '#f0dfdf'
  },
  text: {
    textAlign: 'center',
    fontWeight: '100'
  },
  dataWrapper: {
    marginTop: -1
  },
  row: {
    height: 40,
    backgroundColor: '#E7E6E1'
  },

  subHead: {
    alignSelf: 'center',
    width: '95%',
    color: 'black',
    fontWeight: 'bold',
    height: 30,
    fontSize: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    marginTop: 2
  },
  subContainer: {
    width: '95%',
    alignSelf: 'center',
    margin: 10,
    marginTop: 0,
    marginBottom: 10
  },
  VaccDetailscontainer: {
    backgroundColor: '#99cfec',
    width: '90%',
    padding: 10,
    borderRadius: 5,
    marginTop: 30,
    alignSelf: 'center'
  },
  detailsContainer: {
    flex: 2,
    flexDirection: 'row'
  },
  mainHead: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 20,
    borderBottomWidth: 1,
    borderColor: '#fff',
  },
  button: {
    height: 25,
    width: 25
  },
  vaccineSubHead: {
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    alignSelf: 'center',
    width: '100%',
    backgroundColor: '#edbbaf',
    color: 'black',
    fontWeight: 'bold'
  },
  textInput: {
    borderBottomWidth: 1,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginTop: 10
  },
  text: {
    color: 'white',
    backgroundColor: '#99cfec',
    fontWeight: 'bold',
    borderRadius: 5,
    width: '100%',
    textAlign: 'center',
    fontSize: 24,
    marginTop: 10
  },
  subHead: {
    alignSelf: 'center',
    color: 'black',
    fontWeight: 'bold',
    borderBottomWidth: 1
  },
  subSection: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#d0ddd5',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5
  },

  vaccineAge: {
    alignSelf: "center",
    fontWeight: "bold"
  },
  headerRowStyle: {
    fontWeight: "bold"
  },

  headingText: {
    color: "white",
    fontWeight: "bold",
    borderRadius: 5,
    width: "100%",
    textAlign: "center",
    fontSize: 23,
    marginTop: 10,
    backgroundColor: "#E9AB5B"


  },
  LabelText: {
    fontWeight: "bold",
    textAlign: "left",
    fontSize: 20,
    marginTop: 2,
    marginBottom: 2,
    marginLeft: 7,
  }

});

export default styles;