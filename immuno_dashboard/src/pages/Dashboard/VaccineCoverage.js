import React, { Component } from 'react';
import { Card, CardBody, Container } from 'reactstrap';
import { Chart } from 'react-google-charts';
import Loader from 'react-loader-spinner'


const testData = [
    {
        BCG: {
            beneficiaries_deserved: 200,
            beneficiaires_administered: 140
        }
    },

    {
        MMR: {
            beneficiaries_deserved: 300,
            beneficiaires_administered: 100
        }
    },
    {
        Polio: {
            beneficiaries_deserved: 535,
            beneficiaires_administered: 452
        }
    },
    {
        MR1: {
            beneficiaries_deserved: 789,
            beneficiaires_administered: 543
        }
    },
    {
        HePB: {
            beneficiaries_deserved: 543,
            beneficiaires_administered: 125
        }
    },
    {
        IPV: {
            beneficiaries_deserved: 421,
            beneficiaires_administered: 342
        }
    },
    {
        PENTA: {
            beneficiaries_deserved: 764,
            beneficiaires_administered: 743
        }
    },
]

let pay = {
    data: {
        vaccines: ["BCG", "POLIO", "MMR"],
        stations: [0, 1, 2],
        year: [2019, 2018, 2017]
    }
}


class VaccineCoverageGraph extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chart_data: [['Vaccine', 'Coverage(%)'], ['Fetching Data. Please wait..!', 0]],

        }
    }

    componentDidMount() {
        const coverageChartData = [
            [
                'Vaccine',
                'Coverage(%)',
                'Variation'
            ],
        ]
        testData.map((obj) => {
            let eachVaccine = []
            const vaccineName = Object.keys(obj)[0];
            console.log(obj[vaccineName])
            //calculate coverage percentage
            const coverage = (obj[vaccineName].beneficiaires_administered) / (obj[vaccineName].beneficiaries_deserved) * 100
            eachVaccine.push(vaccineName, coverage, coverage) //each vaccine name
            console.log(eachVaccine);
            coverageChartData.push(eachVaccine);
        })

        this.setState({ chart_data: coverageChartData })
    }

    render() {
        return (
            <div>
                <Card>
                    <CardBody>
                        <div className="header">
                            <h4>VACCINES COVERAGE</h4>
                        </div>
                        <Container>
                            <Chart
                                width={'80%'}
                                height={'350px'}
                                chartType="ComboChart"
                                loader={
                                    <div style={{ textAlign: "center" }}>
                                        <Loader type="ThreeDots" height={50} width={50} color="grey" />
                                        <p>Fetching data please wait...</p>
                                    </div>
                                }
                                data={this.state.chart_data}
                                options={{
                                    title: 'Coverage of each vaccine',
                                    vAxis: { title: 'Coverage(%)' },
                                    hAxis: { title: 'Vaccines' },
                                    seriesType: 'bars',
                                    series: { 1: { type: 'line' } },
                                }}
                                rootProps={{ 'data-testid': '1' }}
                            />
                        </Container>
                    </CardBody>
                </Card>

            </div>
        );
    }
}

export default VaccineCoverageGraph;