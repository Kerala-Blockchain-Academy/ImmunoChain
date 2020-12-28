from pymongo import MongoClient
import server_config


mongo_client = MongoClient(server_config.Config["MONGO_CONNECTION"])

ml_vaccine_get = mongo_client['immunochain_log']['vaccine_get']
ml_vaccine_post = mongo_client['immunochain_log']['vaccine_post']

ml_immunisation_get = mongo_client['immunochain_log']['immunisation_get']
ml_immunisation_post = mongo_client['immunochain_log']['immunisation_post']

ml_rch_user_details = mongo_client['immunochain_log']['rch_user_details']
ml_rch_data = mongo_client['immunochain_log']['rch_data']

ml_register_rch_user = mongo_client['immunochain_log']['register_rch_user']
ml_register_pregnancy = mongo_client['immunochain_log']['register_pregnancy']
ml_register_service_provider = mongo_client['immunochain_log']['register_service_provider']
ml_beneficiary_data = mongo_client['immunochain_log']['beneficiary_data']
ml_edit_beneficiary_family = mongo_client['immunochain_log']['edit_beneficiary_family']
ml_edit_service_provider = mongo_client['immunochain_log']['edit_service_provider']
ml_edit_beneficiary_pregnancy = mongo_client['immunochain_log']['edit_beneficiary_pregnancy']
ml_search_family_data = mongo_client['immunochain_log']['search_family_data']
ml_lookup_data = mongo_client['immunochain_log']['lookup_data']
ml_children_data = mongo_client['immunochain_log']['children_data']
ml_pregnancy_children_data = mongo_client['immunochain_log']['pregnancy_children_data']

ml_station_vaccine_analytics = mongo_client['immunochain_log']['station_vaccine_analytics']
ml_station_vaccination_analytics = mongo_client['immunochain_log']['station_vaccination_analytics']
ml_station_vaccination_analytics_csv = mongo_client['immunochain_log']['station_vaccination_analytics_csv']
ml_all_time_vaccine_count = mongo_client['immunochain_log']['ml_all_time_vaccine_count']
ml_detailed_immunization_register = mongo_client['immunochain_log']['ml_detailed_immunization_register']
ml_vaccination_coverage = mongo_client['immunochain_log']['ml_vaccination_coverage']
ml_male_female_count = mongo_client['immunochain_log']['ml_male_female_count']
ml_beneficiary_report =  mongo_client['immunochain_log']['ml_beneficiary_report']

ml_child_vaccine_api = mongo_client['immunochain_log']['child_vaccine_api']
ml_get_user_details = mongo_client['immunochain_log']['get_user_details']
ml_get_csv = mongo_client['immunochain_log']['get_csv']
ml_refresh = mongo_client['immunochain_log']['refresh']
ml_login = mongo_client['immunochain_log']['login']
ml_qr_code_generator = mongo_client['immunochain_log']['qr_code_generator']
ml_otp_login_validation = mongo_client['immunochain_log']['otp_login_validation']
ml_otp_login = mongo_client['immunochain_log']['otp_login']
ml_register = mongo_client['immunochain_log']['register']

ml_discard_vaccine = mongo_client['immunochain_log']['discard_vaccin']
