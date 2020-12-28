from flask import Flask,Blueprint, jsonify, request
from mongo_log import *
from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    get_jwt_identity
)
from postgres_models.base import Session, engine, Base
from postgres_models.rch_users import RCHUser
from postgres_models.vaccinations import Vaccination
from postgres_models.missed_vaccinations import MissedVaccination
from postgres_models.vaccine_doses import VaccineDose
from postgres_models.service_providers import ServiceProvider
from postgres_models.pregnancy_details import PregnancyDetail
from postgres_models.stations import Station
from postgres_models.locations import Location

from postgres_models.children import Child
from custom_functions import date_to_string
import error_email
import json
from immuno_cassandra import DBconnect
cassandra_client = DBconnect.Cassandra()

Base.metadata.create_all(engine)
session = Session()


rch = Blueprint('rch', __name__)

@rch.route('/check_rch_validity',methods = ['GET'])
@jwt_required
def check_rch_validity():
    args = request.args
    child_rec = session.query(Child).filter(Child.rch_id ==  args["rch_id"],Child.deleted==False).first()
    if child_rec:
        preg_rec = session.query(PregnancyDetail).filter(PregnancyDetail.id == child_rec.pregnancy_detail_id).first()
        return jsonify({'status_code': 200,'pregnancy_id':preg_rec.pregnancy_id})
    else:
        return jsonify({'status_code': 404})

@rch.route('/child_vaccine_api',methods = ['GET'])
@jwt_required
def child_vaccine_api():
    try:
        args = request.args
        log = {}
        log['request'] = args
        immunization = False
        if not 'rch_id' in args:
            record = {'status_code': 400, "status_msg": "One or more params is missing."}
            log['response'] = record
            ml_child_vaccine_api.insert_one(log)
            return jsonify(record)

        if 'immunization' in args and args['immunization'] == "t":
            immunization = True

        child_rec = session.query(Child).filter(Child.rch_id ==  args["rch_id"],Child.deleted==False).first()
        child_details = {}
        child_details['name'] = child_rec.name
        child_details['dob'] = date_to_string(child_rec.date_of_birth)
        child_details['gender'] = child_rec.gender

        vaccinations = session.query(Vaccination).filter(Vaccination.beneficiary_id == args['rch_id'])
        missed_vaccinations = session.query(MissedVaccination).filter(
                        MissedVaccination.beneficiary_id == args['rch_id']).filter(MissedVaccination.active == True)

        record = cassandra_client.session.execute("SELECT JSON * FROM kba.beneficiary_immunisation_tracking WHERE beneficiary_id='"+args['rch_id']+"';")[0]
        data = {}
        data['vaccination_object'] = json.loads(record.json)['vaccination_object']



        ages = list(data['vaccination_object'].keys())
        vacc_arr = {}
        missed_vacc_arr = {}
        all_vaccinations = {}

        for age in ages:
            all_vaccinations[age] = {}


            vaccinations_of_ages = vaccinations.filter(Vaccination.age == age).all()
            if vaccinations_of_ages:
                vacc_arr[age] = {}

            for voa in vaccinations_of_ages:

                vd = session.query(VaccineDose).filter(VaccineDose.id == voa.vaccine_dose_id).first()

                if not vd.name in all_vaccinations[age]:
                    all_vaccinations[age][vd.name] = {}
                all_vaccinations[age][vd.name]['batch_id'] = voa.vaccine_batch_id
                station = session.query(Station).filter(Station.id == voa.station_id).first()
                obj = {}
                obj['station_name'] = station.name
                obj['station_code'] = station.code
                obj['station_id'] = str(station.id)
                location = session.query(Location).filter(Location.id == station.location_id).first()
                obj['station_address'] = location.name
                all_vaccinations[age][vd.name]['station'] = obj

                vacc_arr[age][vd.name] = {
                    'current_date': date_to_string(voa.current_date),
                    # 'next_date': date_to_string(voa.next_date),
                    'eligible_date': date_to_string(data['vaccination_object'][age][vd.name]['expected_date'],False)
                }


            missed_vaccinations_of_ages = missed_vaccinations.filter(MissedVaccination.age == age).all()
            if missed_vaccinations_of_ages:
                missed_vacc_arr[age] = {}
            for mvoa in missed_vaccinations_of_ages:
                vd = session.query(VaccineDose).filter(VaccineDose.id == mvoa.vaccine_dose_id).first()

                if not vd.name in all_vaccinations[age]:
                    all_vaccinations[age][vd.name] = {}
                station = session.query(Station).filter(Station.id == mvoa.station_id).first()
                obj = {}
                obj['station_name'] = station.name
                obj['station_code'] = station.code
                obj['station_id'] = str(station.id)
                location = session.query(Location).filter(Location.id == station.location_id).first()
                obj['station_address'] = location.name
                all_vaccinations[age][vd.name]['station'] = obj

                missed_vacc_arr[age][vd.name] = {
                    'current_date': date_to_string(mvoa.current_date),
                    'reason': mvoa.reason,
                    'eligible_date': date_to_string(data['vaccination_object'][age][vd.name]['expected_date'],False)
                }


            for vaccine_key in data['vaccination_object'][age].keys():
                if not vaccine_key in all_vaccinations[age]:
                    all_vaccinations[age][vaccine_key] = {}
                all_vaccinations[age][vaccine_key]['eligible_date'] = date_to_string(data['vaccination_object'][age][vaccine_key]['expected_date'],False)
                if data['vaccination_object'][age][vaccine_key]['vaccination_date']:
                    all_vaccinations[age][vaccine_key]['current_date'] = date_to_string(data['vaccination_object'][age][vaccine_key]['vaccination_date'],False)

        record = {'status_code': 200, "data": {
        'child_details':child_details,
        'vaccinations':vacc_arr,
        'missed_vaccinations':missed_vacc_arr,
        'all_vaccinations':all_vaccinations}
        }
    except Exception as e:
        error_email.send_email({'error':str(e),'url':request.url})
        record = {'status_code': 500, "status_msg": str(e)}
    log['response'] = record
    ml_child_vaccine_api.insert_one(log)
    return jsonify(record)


@rch.route('/rch_user_details',methods = ['GET'])
@jwt_required
def rch_user_details():
    try:
        args = request.args
        log = {}
        log['request'] = args
        rch_data = {}
        child_rec = session.query(Child).filter(Child.rch_id ==  args["rch_id"],Child.deleted==False).first()
        preg_rec = session.query(PregnancyDetail).filter(PregnancyDetail.id == child_rec.pregnancy_detail_id).first()
        if preg_rec:
            rch_rec = session.query(RCHUser).filter(RCHUser.id == preg_rec.rch_user_id).first()
            rch_data['child_name'] = child_rec.name
            rch_data['child_age'] = '1'
            rch_data['woman_name'] = rch_rec.name
            rch_data['husband_name'] = rch_rec.husband_name
            record = {'status_code': 200, "status_msg": " Success. " , "data" : rch_data}
        else:
            record = {'status_code': 404, "status_msg": "Record Not Found."}
    except Exception as e:
        error_email.send_email({'error':str(e),'url':request.url})
        record = {'status_code': 500, "status_msg": str(e)}
    log['response'] = record
    ml_rch_user_details.insert_one(log)
    return jsonify(record)


@rch.route('/rch_data',methods = ['GET'])
@jwt_required
def dataretrival():
    args = request.args
    log = {}
    log['request'] = args
    final_data = []
    try:
        preg_detail = session.query(PregnancyDetail).filter(PregnancyDetail.pregnancy_id == args["pregnancy_id"]).first()
        if preg_detail:
            children = session.query(Child).filter(Child.pregnancy_detail_id == preg_detail.id,Child.deleted==False).all()
            if children:
                for child_rec in children:
                    vaccinations = session.query(Vaccination).filter(Vaccination.beneficiary_id == child_rec.rch_id)
                    missed_vaccinations = session.query(MissedVaccination).filter(
                        MissedVaccination.beneficiary_id == child_rec.rch_id).filter(MissedVaccination.active == True)
                    rch_rec = session.query(RCHUser).filter(RCHUser.id == preg_detail.rch_user_id).first()
                    service_provider = session.query(ServiceProvider).filter(
                        ServiceProvider.pregnancy_detail_id == preg_detail.id).first()
                    ages = list(set([rec.age for rec in vaccinations.all()]))
                    vacc_arr = {}
                    missed_vacc_arr = {}
                    for age in ages:
                        vacc_arr[age] = {}
                        vaccinations_of_ages = vaccinations.filter(Vaccination.age == age).all()
                        for voa in vaccinations_of_ages:
                            vd = session.query(VaccineDose).filter(VaccineDose.id == voa.vaccine_dose_id).first()
                            vacc_arr[age][vd.name] = {
                                'current_date': date_to_string(voa.current_date),
                                'next_date': date_to_string(voa.next_date)
                            }

                        missed_vacc_arr[age] = {}
                        missed_vaccinations_of_ages = missed_vaccinations.filter(MissedVaccination.age == age).all()
                        for mvoa in missed_vaccinations_of_ages:
                            vd = session.query(VaccineDose).filter(VaccineDose.id == mvoa.vaccine_dose_id).first()
                            missed_vacc_arr[age][vd.name] = {
                                'current_date': date_to_string(mvoa.current_date),
                                'reason': mvoa.reason,
                                'next_date': date_to_string(mvoa.next_date)
                            }
                    responseData = {
                        "name": rch_rec.name,
                        "rch_id": child_rec.rch_id,
                        "child_name":child_rec.name,
                        "dob": date_to_string(rch_rec.dob),
                        "address": rch_rec.address,
                        "phone_no_1": rch_rec.phone_no_1,
                        "phone_no_2": rch_rec.phone_no_2,
                        "age": rch_rec.age,
                        "husband_name": rch_rec.husband_name,
                        "husband_age": rch_rec.husband_age,
                        "husband_dob": date_to_string(rch_rec.husband_dob),
                        "family_reg_no": rch_rec.family_reg_no,
                        "mother_education": rch_rec.mother_education,
                        "aadhar_id": rch_rec.aadhar_id,
                        "income": rch_rec.income,
                        "caste": rch_rec.caste,
                        "ec_no": rch_rec.ec_no,
                        "apl_bpl": rch_rec.apl_bpl,
                        "bank_account_number": rch_rec.bank_account_number,
                        "ifsc_code": rch_rec.ifsc_code,
                        "category": rch_rec.category,
                        "phone_number": preg_detail.phone_no,
                        "ambulance_service_number": preg_detail.phone_no,
                        "drivers_number": preg_detail.drivers_number,
                        "menstruation_date": date_to_string(preg_detail.menstruation_date),
                        "expected_delivery_date": date_to_string(preg_detail.expected_delivery_date),
                        "blood_group": preg_detail.blood_group,
                        "last_delivery_date": date_to_string(preg_detail.last_delivery_date),
                        "institution_of_delivery": preg_detail.phone_no,
                        "rsby_reg_number": preg_detail.rsby_reg_number,
                        "jsy_reg_number": preg_detail.jsy_reg_number,
                        "gravida": preg_detail.gravida,
                        "para": preg_detail.para,
                        "no_of_live_children": preg_detail.no_of_live_children,
                        "no_of_abortions": preg_detail.no_of_abortions,
                        "tt1_date": date_to_string(preg_detail.tt1_date),
                        "tt2_date": date_to_string(preg_detail.tt2_date),
                        "usg1_date": date_to_string(preg_detail.usg1_date),
                        "usg2_date": date_to_string(preg_detail.usg2_date),
                        "usg3_date": date_to_string(preg_detail.usg3_date),
                        "important_findings": preg_detail.important_findings,
                        "complication_details": preg_detail.complication_details,
                        "heart_complications": preg_detail.heart_complications,
                        "advice": preg_detail.advice,
                        "referrals": preg_detail.referrals,
                        "rh_category": preg_detail.rh_category,
                        "unique_id": child_rec.rch_id,
                        "previous_delivery": preg_detail.previous_delivery,
                        "contraceptive_methods_used": preg_detail.contraceptive_methods_used,
                        "icds": service_provider.icds,
                        "anganwadi_centre": service_provider.anganwadi_centre,
                        "anganwadi_worker": service_provider.anganwadi_worker,
                        "phone": service_provider.anganwadi_phone,
                        "center_name": service_provider.anganwadi_centre,
                        "sub_centre": service_provider.sub_centre,
                        "asha": service_provider.asha,
                        "asha_phone": service_provider.asha_phone,
                        "jphn": service_provider.jphn,
                        "jphn_phone": service_provider.jphn_phone,
                        "preffered_hospital_delivery": service_provider.hospital_for_delivery,
                        "birth_companion": service_provider.birth_companion,
                        "hospital_address": service_provider.hospital_address,
                        "transportation_arrangement": service_provider.transportation_arrangement,
                        "registered_for_pmvy": service_provider.registered_for_pmmvy,
                        "first_financial_aid": service_provider.first_financial_aid,
                        "second_financial_aid": service_provider.second_financial_aid,
                        "third_financial_aid": service_provider.third_financial_aid,
                        "anganwadi_reg_no": service_provider.anganwadi_registration_number,
                        "subcentre_reg_no": service_provider.sub_centre_registration_number,
                        "date_of_first_reg": date_to_string(service_provider.date_of_first_registration),
                        "Visit": {
                            "1": {
                                "ifa": str(2),
                                "hb": str(0.2),
                                "urine_albumin": str(0.5),
                                "edema_on_legs": "String",
                                "Week": str(2),
                                "Weight": str(30),
                                "Blood_pressure": str(2.1),
                                "visit_date": "2015/03/23"
                            },
                            "2": {
                                "ifa": str(2),
                                "hb": str(0.2),
                                "urine_albumin": str(0.5),
                                "edema_on_legs": "String",
                                "Week": str(2),
                                "Weight": str(30),
                                "Blood_pressure": str(2.1),
                                "visit_date": "2015/03/23"
                            },
                        },
                        "vaccine_name_dose": "",
                        "reason_not_taking_vaccine": "",
                        "next_date_allotted": "",
                        "recommended_date": "",
                        "Name_of_child": "",
                        "data": vacc_arr,
                        "missed_vaccination_data": missed_vacc_arr
                    }
                    final_data.append(responseData)

                record = {'status_code': 200, "status_msg": " Success. " , "response" : final_data}
            else:
                record = {'status_code': 404, "status_msg": "No Children found for this user."}
        else:
            record = {'status_code': 404, "status_msg": "No Pregnancy found for this user."}
    except Exception as e:
        error_email.send_email({'error':str(e),'url':request.url})
        record = {'status_code': 500, "status_msg": str(e)}
    log['response'] = record
    ml_rch_data.insert_one(log)
    return jsonify(record)
