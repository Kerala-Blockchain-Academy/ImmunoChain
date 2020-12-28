const env = 'dev'


const envs = {
    'dev': {
        "api_url": 'https://api.immunochain.dev/'
    },
    'prod': {
        "api_url": 'https://api.immunochain.dev/'

    }
}

const API_URL = envs[env].api_url

export const Client_config = {
    // Get apis
    RCH_API: API_URL + 'rch_data?pregnancy_id=',
    Vaccine_Data_API: API_URL + 'api/vaccine?',
    get_user_API: API_URL + 'get_user_details',
    immunization_vaccine: API_URL + 'api/immunization?vaccine_batch_id=',
    RCH_user: API_URL + 'pregnancy_children_data?record_pregnancy_id=',
    Child_Vaccination_API: API_URL + "child_vaccine_api?rch_id=",

    //Post apis
    Login_API: API_URL + 'login',
    Vaccine_API: API_URL + "api/vaccine",
    QRCode_API: API_URL + "qr_code_generator",
    Login_otp_API: API_URL + "otp_login",
    Refresh_Token_API: API_URL + "refresh",
    Immunization_API: API_URL + "api/immunization",
    Login_otp_validation_API: API_URL + "otp_login_validation",
    App_setting_API: API_URL + "lookup_data",


}
