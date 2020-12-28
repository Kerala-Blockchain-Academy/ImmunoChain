import { Client_config } from './Client_Config';
import { AsyncStorage } from 'react-native';
import { fetch } from 'react-native-ssl-pinning';


const RCH_API_URL = Client_config.RCH_API;
const Vaccine_API_URL = Client_config.Vaccine_API;
const QRCode_API_URL = Client_config.QRCode_API;
const Login_otp_API_URL = Client_config.Login_otp_API;
const Login_API_URL = Client_config.Login_API;
const Immunization_API_URL = Client_config.Immunization_API;
const Resfresher_API_URL = Client_config.Refresh_Token_API;
const Login_otp_validation_API_URL = Client_config.Login_otp_validation_API;
const App_setting_API_URL = Client_config.App_setting_API;
const Vaccine_Data_API_URL = Client_config.Vaccine_Data_API;
const get_user_URL = Client_config.get_user_API;
const Immuno_vaccine_API_URL = Client_config.immunization_vaccine;
const RCH_user_API_URL = Client_config.RCH_user;
const Child_Vaccine_Detail_API_URL = Client_config.Child_Vaccination_API;
const Discard_vaccine_API = Client_config.Discard_vaccine;


const errorMsg = "Network Request Failed. Please check your Internet Connection"

async function _Post_Api_(URL, data) {
  try {
    let token = await AsyncStorage.getItem('STORAGE_KEY')
    let response = await fetch(URL,
      {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify(data),
        sslPinning: {
          certs: ["mycert"]
        },
      });
    let responsejson = await response.json();
    if (response.status == 200) {
      return responsejson
    }
    else {
      return await post_api_catch(URL, data, response)
    }
  }

  catch (errors) {
    console.log("post", errors)
    if (errors.status) {
      return await post_api_catch(URL, data, errors)
    }
    else {
      alert(errorMsg);
    }
  }
}

async function post_api_catch(URL, data, response) {
  try {
    if (response.status == 401 || response.status == 422) {
      let response_refresher = await _refresher();
      console.log("response_refresher", response_refresher)
      if (response_refresher.status_code == 200) {
        let token = await AsyncStorage.getItem('STORAGE_KEY')
        let response = await fetch(URL,
          {
            method: "POST",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              "Authorization": "Bearer " + token
            },
            body: JSON.stringify(data),
            sslPinning: {
              certs: ["mycert"]
            },
          });
        let responsejson = await response.json();
        if (response.status == 200) {
          return responsejson
        }
        else {
          return { status_code: 501 }
        }
      }
      else {
        return response_refresher
      }
    }

  } catch (error) {

    return { status_code: 501 }
  }

}

async function _Get_Api_(URL) {
  try {
    let token = await AsyncStorage.getItem('STORAGE_KEY')
    let response = await fetch(URL,
      {
        method: "GET",
        headers: {
          'Accept': 'application/json',
          "Authorization": "Bearer " + token
        },
        sslPinning: {
          certs: ["mycert"]
        },
      });
    if (response.status == 200) {
      let responsejson = await response.json();
      return responsejson
    }
    else {
      return await get_api_catch(URL, response)
    }

  }
  catch (errors) {
    console.log("post", errors)
    if (errors.status) {
      return await get_api_catch(URL, errors)
    }
    else {
      alert(errorMsg);
    }
  }
}

async function get_api_catch(URL, response) {

  try {
    console.log("response", response)
    if (response.status == 401 || response.status == 422) {
      let response_refresher = await _refresher();
      console.log("response_refresher", response_refresher)
      if (response_refresher.status_code == 200) {
        let token = await AsyncStorage.getItem('STORAGE_KEY')
        console.log("oopppp", token)
        let response = await fetch(URL,
          {
            method: "GET",
            headers: {
              'Accept': 'application/json',
              "Authorization": "Bearer " + token
            },
            sslPinning: {
              certs: ["mycert"]
            },
          });
        let responsejson = await response.json();
        if (response.status == 200) {
          return responsejson
        }
        else {

          return { status_code: 501 }
        }
      }
      else {
        return response_refresher
      }
    }


  } catch (error) {

    return { status_code: 501 }

  }
}

// GET Refreash token
async function _refresher() {
  try {
    let resfresh_key = await AsyncStorage.getItem('REFRESH_KEY')
    let response2 = await fetch(
      Resfresher_API_URL,
      {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": "Bearer " + resfresh_key
        },
        body: JSON.stringify({ access_token_time: 60 }),
        sslPinning: {
          certs: ["mycert"]
        }
      })
    let responsejson = await response2.json()
    if (response2.status == 200) {

      console.log("responseJSlm", responsejson)
      let access_token = responsejson.access_token
      await AsyncStorage.setItem("STORAGE_KEY", access_token);
      return { status_code: 200 }
    }
    else {
      return await refresh_catch(response2)
    }

  } catch (error) {
    if (error.status) {
      return await refresh_catch(error)
    }
    else {
      console.log(error)
      alert(errorMsg)
    }
  }
}


async function refresh_catch(response) {
  if (response.status == 401 || response.status == 422) {
    console.log("Refresh token expired")
    await AsyncStorage.setItem('STORAGE_KEY', "");
    await AsyncStorage.setItem('REFRESH_KEY', "");
    return { status_code: 501 }

  }
  else {

    console.log("inside refresh_catch")
    alert(errorMsg)

  }

}
//Post State and CHC/PHC center Login details

export async function _userLogin(data) {

  try {
    let response = await fetch(Login_API_URL, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      sslPinning: {
        certs: ["mycert"]
      },
    });
    let responsejson = await response.json();
    let token = responsejson.access_token;
    let ref_token = responsejson.refresh_token;
    _onValueChange(token, ref_token)
    return responsejson

  } catch (error) {
    console.log(error)
    alert(errorMsg)
  }
}

//OTP login validation
export async function _user_otp_login_validation(data) {
  try {
    let response = await fetch(
      Login_otp_validation_API_URL, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      sslPinning: {
        certs: ["mycert"]
      },
    })
    let responsejson = await response.json();
    let token = responsejson.access_token;
    let ref_token = responsejson.refresh_token;
    _onValueChange(token, ref_token)
    return responsejson
  } catch (error) {
    console.log(error)
    alert(errorMsg)
  }
}
// Set access and refresh token into async storage
export async function _onValueChange(token, ref_token) {

  try {
    await AsyncStorage.setItem("STORAGE_KEY", token);
    await AsyncStorage.setItem("REFRESH_KEY", ref_token);
    console.log("trying to print access token", token);
  } catch (error) {
    console.log('AsyncStorage error: ' + error.message);
  }
}

//Store Object in AsyncStorage

export async function storeItem(key, item) {

  try {
    //we want to wait for the Promise returned by AsyncStorage.setItem()
    //to be resolved to the actual value before returning the value
    await AsyncStorage.setItem(key, JSON.stringify(item));


  } catch (error) {
    console.log(error.message);
  }

}

//the functionality of retrieve JSON Object from AsyncStorage

export async function retrieveItem(key) {

  try {
    const retrievedItem = await AsyncStorage.getItem(key);
    const item = JSON.parse(retrievedItem);
    return item;
  } catch (error) {
    console.log(error.message);
  }

}

//Post User Login with otp details

export async function _userLogin_otp(data) {
  try {
    let response = await fetch(
      Login_otp_API_URL,
      {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        sslPinning: {
          certs: ["mycert"]
        },
      });
    let responsejson = await response.json();
    return responsejson
  }
  catch (errors) {
    console.log("uuuuuuuuuuuuu---------", errors)
    alert(errorMsg);
  }

}

// Get login/logout detatils

export async function _get_LoginInfo() {
  try {
    let response = _Get_Api_(get_user_URL)
    return response;
  }
  catch (error) {
    console.error(error);
  }
}

//get vaccine details

export async function _get_vaccineInfo(id) {
  try {
    let response = await _Get_Api_(Immuno_vaccine_API_URL + id)
    return response;
  }
  catch (error) {
    console.error(error);
  }
}

// Post the Discard vaccine Details

export async function _sendDiscardData(data) {
  try {
    let response = _Post_Api_(Discard_vaccine_API, data)
    return response
  }
  catch (errors) {
    alert(errors);
  }
}

//get RCH user details

export async function _get_userInfo(id) {
  try {
    let response = _Get_Api_(RCH_user_API_URL + id)
    return response;
  }
  catch (error) {
    console.error(error);
  }
}


// Get the RCH book details

export async function _get_rch_data_FromApi() {
  try {

    let RCH_ID = await AsyncStorage.getItem('RCHBook_ID')
    let response = _Get_Api_(RCH_API_URL + RCH_ID)
    return response;

  }
  catch (error) {
    console.error(error);
  }
}


// Post the vaccine details from District centers

export async function _sendVaccineData(data) {
  try {
    let response = _Post_Api_(Vaccine_API_URL, data)
    return response
  }
  catch (errors) {
    alert(errors);
  }
}

// Get the QR Code from server

export async function _getQrcode(Data) {
  try {
    let response = _Post_Api_(QRCode_API_URL, Data)
    return response
  }
  catch (error) {
    console.error(error);
  }
}

//Post Immunization data
export async function _send_immunization_data(data) {
  try {
    let response = _Post_Api_(Immunization_API_URL, data)
    return response
  }
  catch (error) {
    console.log(error)
  }
}

//Get App setting Data data
export async function _get_app_setting_data() {
  try {
    let response = await fetch(App_setting_API_URL,
      {
        method: "GET",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        sslPinning: {
          certs: ["mycert"]
        },
      });
    let responsejson = await response.json();
    return responsejson
  }

  catch (errors) {
    alert(errorMsg);
  }
}
//Get child vaccine details (taken and missed)
export function _getChildVaccineDetails(rchId) {
  try {
    let URL = Child_Vaccine_Detail_API_URL + rchId
    let response = _Get_Api_(URL)
    return response;
  } catch (error) {
    console.log(error)
  }
}

//Get vaccination data in stations
export async function _getVaccineDetails(station_id, type) {
  try {
    let URL = Vaccine_Data_API_URL + "station_id=" + station_id + "&request_type=" + type
    let response = _Get_Api_(URL)
    return response;
  } catch (e) {
    console.log(e);
  }
}

export function date_change(date) {
  if (date != null) {
    let value = pad(date.dd, 2) + "-" + pad(date.mm, 2) + "-" + date.yyyy;
    return value;
  } else return null;
}

function pad(n, width, z) {
  z = z || '0'; n = n + ''; return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

export function changeto_date_string(date) {
  if (date != null) {
    let value = date.split("-");
    date = {
      "dd": parseFloat(value[0]),
      "mm": parseFloat(value[1]),
      "yyyy": parseFloat(value[2]),
    }
    return date;
  }
  else {
    return null;
  }
}

export async function _get_station_details() {
  try {
    let station_code = await AsyncStorage.getItem("station_code");
    let station_id = await AsyncStorage.getItem("station_id");
    let station_address = await AsyncStorage.getItem("station_address");
    let station_name = await AsyncStorage.getItem("station_name");

    const station_data = {
      "station_id": station_id,
      "station_code": station_code,
      "station_name": station_name,
      "station_address": station_address
    }
    return station_data
  } catch (error) {
    console.log(error)
  }
}


export async function _get_language() {

  try {

    let language = await AsyncStorage.getItem("App_Language")
    return language


  } catch (error) {

    console.log("AsyncStorage error: " + error.message);
    return "en"
  }

}

export async function _get_User() {

  try {

    let User_Role = await AsyncStorage.getItem('User_Name');
    let Station_Name = await AsyncStorage.getItem('station_name');

    let user_det = {
      User_Role: User_Role,
      Station_Name: Station_Name
    }

    return user_det

  } catch (error) {

    console.log("AsyncStorage error: " + error.message);
    return null
  }

}