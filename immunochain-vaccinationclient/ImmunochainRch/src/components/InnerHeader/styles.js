import { StyleSheet } from "react-native";
import {widthPercentageToDP,  heightPercentageToDP,
  listenOrientationChange,
  removeOrientationListener} from 'react-native-responsive-screen'
const styles = StyleSheet.create({

  containerHeader: {
    backgroundColor:'#fff'
  },

  container: {
   
   
    //height: 40,
    paddingTop: '10%',
    paddingLeft: 10,
     flex:2,
    flexDirection: 'row'
  },


  StateChipView:{

    width: widthPercentageToDP('50%'),
       //width:'20%',//40 changed to 20%
        //height: 10,
       // paddingTop: 10,
        paddingLeft: 10,
        alignSelf:'flex-start',
         flex:2,
        flexDirection: 'row'
      },
 
  card:{
    flexDirection:'column-reverse',
    shadowColor: '#00acee',
    alignSelf:"flex-end",
    shadowOpacity: 0.37,
    backgroundColor:"#FFFFFF",
    width:'50%',
    height:'100%',
    alignItems:"flex-end",
    fontWeight:'bold',
    paddingRight:10

  },
  cardContent: {
    fontWeight:'bold', 
    fontSize:14,
    marginTop:10,
    width:'100%',
    height:'100%'
  },
  cardImage:{
    height:20,
    width: 20,
    alignSelf:'flex-start',
    alignItems:"flex-start",
//flexDirection:'row',
    borderRadius:20,
    //borderBottomWidth: 1,
    
  },
  officialChipView:{
    width: widthPercentageToDP('8%'),

    height: 10,
   // paddingTop: 0,
    paddingLeft: 30,
    //    paddingLeft: widthPercentageToDP('10%'),

     flex:2,
    flexDirection: 'row',
  //  paddingBottom: 10
   },
  ChipView:{

width: widthPercentageToDP('20%'),
   //width:'20%',//40 changed to 20%
    //height: 10,
   // paddingTop: 10,
    paddingLeft: 20,
    alignSelf:'flex-start',
     flex:2,
    flexDirection: 'row'
  },
  mainheadercontainer: {
    backgroundColor: 'white',
    // borderBottomWidth: 1,
    borderColor:'white',
    width: '100%', 
    height: '100%',
    // paddingTop:40,
    // paddingLeft: 10,
    // flex:2,
    // flexDirection:'row'
  },

  statecentercontainer: {
    backgroundColor: 'white',
    height: 100,
    paddingTop: 40,
    paddingLeft: 10,
    flexDirection: 'row',
    flex:2,
   //flexDirection: 'row'
    
  },
 
});

export default styles;
