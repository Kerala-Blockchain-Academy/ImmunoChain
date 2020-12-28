import 'react-native';
import React from 'react';
import App from  './../src/views/StateCenter';
import renderer from 'react-test-renderer';

var data={
    "languages": [
        {
            "id": "en",
            "name": "English"
        },
        {
            "id": "hi",
            "name": "Hindi"
        },
        {
            "id": "ml",
            "name": "Malayalam"
        }
    ],
    "roles": [
        {
            "id": 2,
            "name": "sc_user"
        },
        {
            "id": 3,
            "name": "phc_user"
        }
    ],
    "stations": {
        "stations_list": [
            {
                "station_address": "Poonthura",
                "station_code": "ST1",
                "station_id": "1",
                "station_name": "CHC Poonthura"
            },
            {
                "station_address": "Trivandrum",
                "station_code": "ST5",
                "station_id": "6",
                "station_name": "District Centre"
            }
        ]
    },
    "vaccine_names": {
        "BCG": [
            "BCG"
        ],
        "DPT BOOSTER": [
            "DPT BOOSTER1",
            "DPT BOOSTER2"
        ],
        
    },
    "vaccine_names_id": {
        "BCG": 3,
        "DPT BOOSTER": 6,
    },
    "vaccines": {
        "vaccine": [
            {
                "age": "0M",
                "vaccines": [
                    "BCG",
                ]
            },
            {
                "age": "16to24M",
                "vaccines": [ 
                    "DPT BOOSTER1"
                ]
            },
        ]
    }
}

it('vaccine register', async ()=>{
    global.MyVar = data;

    let appInst = renderer.create(<App navigation={{state:{routeName:"Officials_home"}}}/>).getInstance();
    appInst.handleChangeVaccine('ROTA')
    appInst.checkBatchId("111222")
    appInst.checkBatchNum("20")

    expect(appInst.state.vaccine_name).toBe('ROTA')
    expect(appInst.state.batch_id).toBe('111222')
    expect(appInst.state.dose_count).toBe('20')
})


