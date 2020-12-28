import React, { Component } from 'react';
import {
    Text,
    StyleSheet,
    View,
    TouchableOpacity,
    NativeModules,
    NativeEventEmitter,
} from 'react-native';

import FindPrinter from './../services/printer/FindPrinter';
import PrinterStatus from './../services/printer/printerStatus';
import InnerHeader from "../components/InnerHeader";

class PrinterSettings extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentPrinter_name: "",
            currentPrinter_ip: "",
            currentPrinter_status: "Searching...",
            currentPrinter_view: false,
            printer_list: [],
        }
    }

    componentDidMount() {
        //This event Listener will get the list of available printer in the local LAN Network.
        //Please note that the Printer SDK used in this Project will only list EPSON LW Series printers.
        //And for this project, the Search is filtered for EPSON LW1000P Model. 
        //You can add more on ModuleFindPrinter.java file.
        const PrinterListEventListener = new NativeEventEmitter(NativeModules.FindPrinter);
        PrinterListEventListener.addListener('PrinterList', (event) => {
            console.log(event.List)
            this.setState({ printer_list: (JSON.parse(event.List)) })
        })

        this.discoverPrinter();
        this.printerStatus();
    }

    componentWillUnmount() {
        this.cancelSearch();
    }

    //Initialize printer search process
    discoverPrinter = async () => {
        FindPrinter.discover(
            (msg) => {
                console.log(msg);
            },
        );
    }

    //Send the index of the selected printer and the printer details are stored in the java side
    //Also terminates the search process.
    //This details will be available even after restarting the app.
    selectPrinter = async (index) => {
        FindPrinter.selectPrinter(index,
            (msg) => {
                console.log(msg);
                this.printerStatus();
            },
        )
    }

    //Terminates the printer Search process.
    cancelSearch = async () => {
        FindPrinter.cancelSearch(
            (msg) => {
                console.log(msg);
            },
        );
    }

    //Get the recently connected printer information
    printerStatus = async () => {
        PrinterStatus.getPrinterDetails(
            (name, host) => {
                console.log(name, host);
                if (name != "notAvailable") {
                    this.setState({
                        currentPrinter_name: name,
                        currentPrinter_ip: host,
                        currentPrinter_view: true,
                    })
                    PrinterStatus.getStatus(
                        (status) => {
                            this.setState({
                                currentPrinter_status: status,
                            })
                        },
                    )
                }
            },
        )
    }

    render() {
        return (
            <View style={{ backgroundColor: "#008abe", flex: 1 }}>
                <InnerHeader navigation={this.props.navigation}
                    station=""
                    user_role="" />
                <Text style={styles.Heading}>Printer Settings</Text>
                <Text style={styles.SubHeading}>Curent Printer</Text>
                {
                    this.state.currentPrinter_view ?
                        <>
                            <Text style={styles.content}>Printer Name : {this.state.currentPrinter_name}</Text>
                            <Text style={styles.content}>Printer Address : {this.state.currentPrinter_ip}</Text>
                            <Text style={styles.content}>Printer Status : {this.state.currentPrinter_status}</Text>
                        </>
                        :
                        <Text style={styles.content}>Not Connected to any Printer Yet</Text>
                }

                <View style={{ height: 30 }}></View>

                <Text style={styles.SubHeading}>Available Printers</Text>
                <View>
                    {this.state.printer_list.length === 0 ?
                        <Text style={styles.content}>No Printer Found</Text>
                        :
                        this.state.printer_list.map((item, index) => {
                            console.log(item.data.name)
                            return (
                                <TouchableOpacity onPress={() => this.selectPrinter(item.index)}>
                                    <View style={styles.printerView}>
                                        <Text style={styles.content}>{item.data.name}</Text>
                                        <Text style={styles.content}>{item.data.host}</Text>
                                    </View>
                                </TouchableOpacity>
                            )
                        })
                    }
                </View>
            </View>
        );
    }
};

const styles = StyleSheet.create({
    Heading: {
        fontWeight: 'bold',
        fontSize: 30,
        textAlign: "center"
    },
    SubHeading: {
        fontWeight: 'bold',
        fontSize: 25,
    },
    content: {
        fontSize: 20,
    },
    printerView: {
        width: "100%",
        backgroundColor: "#e8e8e8",
        marginBottom: 5, padding: 15
    },
    btnView: {
        width: "40%",
        textAlign: "center"
    },
    button: {
        fontSize: 20,
    }
});


export default PrinterSettings;
