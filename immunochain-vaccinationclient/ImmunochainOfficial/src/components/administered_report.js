import React, { Component } from 'react';
import * as Service from '../views/Service';
import { Content, List, ListItem, Text, Body, Right } from 'native-base';

class administered_report extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: []
        }
    }

    componentDidMount = () => {
        let data = this.props.beneficiary_report_data ? this.props.beneficiary_report_data : []
        this.setState({ data: data })
        console.log("heyyyyy sabir",data)
    };

    render() {
        return (
            <Content style={
                { backgroundColor: "#008abe", width: "98%", marginLeft: "1%" }} >
                <List dataArray={this.state.data}
                    renderRow={
                        (item) => {
                            if (item.gender === "M") {
                                return (<ListItem itemHeader itemDivider thumbnail >
                                    <Body style={{ flex: 0.7 }} >
                                        <Text style={{ fontWeight: "bold" }} numberOfLines={2} > {item.child_name}, S / o {item.mother_name}</Text>
                                        <Text style={{ fontWeight: "bold" }} > {Service.date_change(item.dob)}, {item.gender} </Text>
                                        <Text style={{ color: 'black' }} note numberOfLines={4} > {item.address} </Text>
                                    </Body>
                                    <Right style={{ flex: 0.4 }} >
                                        <Text numberOfLines={4} > {item.vaccine} </Text>
                                    </Right>
                                </ListItem>)
                            }
                            else {
                                return (<ListItem itemDivider thumbnail >
                                    <Body style={{ flex: 0.7 }} >
                                        <Text style={{ fontWeight: "bold" }} numberOfLines={2} > {item.child_name}, D / o {item.mother_name} </Text>
                                        <Text style={{ fontWeight: "bold" }} > {Service.date_change(item.dob)}, {item.gender} </Text>
                                        <Text style={{ color: 'black' }} note numberOfLines={4} > {item.address} </Text>
                                    </Body>
                                    <Right style={{ flex: 0.4 }} >
                                        <Text numberOfLines={4} > {item.vaccine} </Text>
                                    </Right>
                                </ListItem>)
                            }
                        }
                    }
                />
            </Content>
        );
    }
}

export default administered_report;
