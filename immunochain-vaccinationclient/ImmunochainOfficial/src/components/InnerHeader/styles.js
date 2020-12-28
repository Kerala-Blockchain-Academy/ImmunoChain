import { StyleSheet } from "react-native";
import { widthPercentageToDP } from 'react-native-responsive-screen'
const styles = StyleSheet.create({
    containerHeader: {
        backgroundColor: '#fff'
    },

    container: {
        paddingTop: '10%',
        paddingLeft: 10,
        flex: 2,
        flexDirection: 'row'
    },

    StateChipView: {

        width: widthPercentageToDP('50%'),
        paddingLeft: 10,
        alignSelf: 'flex-start',
        flex: 2,
        flexDirection: 'row'
    },

    card: {
        flexDirection: 'column-reverse',
        shadowColor: '#00acee',
        alignSelf: "flex-end",
        shadowOpacity: 0.37,
        backgroundColor: "#FFFFFF",
        width: '50%',
        height: '100%',
        alignItems: "flex-end",
        fontWeight: 'bold',
        paddingRight: 10
    },

    cardContent: {
        fontWeight: 'bold',
        fontSize: 14,
        marginTop: 10,
        width: '100%',
        height: '100%'
    },

    cardImage: {
        height: 20,
        width: 20,
        alignSelf: 'flex-start',
        alignItems: "flex-start",
        borderRadius: 20,
    },

    officialChipView: {
        width: widthPercentageToDP('8%'),
        height: 10,
        paddingLeft: 30,
        flex: 2,
        flexDirection: 'row',
    },

    ChipView: {
        width: widthPercentageToDP('20%'),
        paddingLeft: 20,
        alignSelf: 'flex-start',
        flex: 2,
        flexDirection: 'row'
    },
    
    mainheadercontainer: {
        backgroundColor: 'white',
        borderColor: 'white',
        width: '100%',
        height: '100%',
    },

    statecentercontainer: {
        backgroundColor: 'white',
        height: 100,
        paddingTop: 40,
        paddingLeft: 10,
        flexDirection: 'row',
        flex: 2,
    },

});

export default styles;