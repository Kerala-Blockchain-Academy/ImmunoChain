from flask import Flask,Blueprint, jsonify, request
from mongo_log import *
import json
from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    get_jwt_identity
)
from sqlalchemy.sql import text
from postgres_models.base import Session, engine, Base
from postgres_models.rch_users import RCHUser
from postgres_models.vaccine_doses import VaccineDose
from postgres_models.languages import Language
from postgres_models.locations import Location
from postgres_models.stations import Station
from postgres_models.ages import Age
from postgres_models.age_vaccines import AgeVaccine
from postgres_models.service_providers import ServiceProvider
from postgres_models.pregnancy_details import PregnancyDetail
from postgres_models.children import Child
from postgres_models.user_roles import UserRole
from postgres_models.users import User
from postgres_models.roles import Role
from rabbit_queue import producer
from custom_functions import get_random_id, date_to_string, create_hash, obj_to_date
import uuid
from datetime import datetime,timedelta
from immuno_cassandra import DBconnect
import error_email

Base.metadata.create_all(engine)
session = Session()

BenLogDB = DBconnect.Cassandra()
BenLogDB.set_table('beneficiary_log','(id,beneficiary_id,beneficiary_type_id)')

cassandra_client = DBconnect.Cassandra()


dashboard = Blueprint('dashboard', __name__)
@jwt_required
@dashboard.route('/register_rch_user',methods = ['POST'])
def creation():
    args = request.json
    log = {}
    log['request'] = args
    if not "phone_no" in args:
        log['response'] = {"status_code":400, "status_msg": "Bad Request. Phone Number not found."}
        ml_register_rch_user.insert_one(log)
        return jsonify({"status_code":400, "status_msg": "Bad Request. Phone Number not found."})
    if args["phone_no"] == "":
        log['response'] = {"status_code": 400, "status_msg": "Bad Request. Phone Number not valid."}
        ml_register_rch_user.insert_one(log)
        return jsonify({"status_code":400, "status_msg": "Bad Request. Phone Number not valid."})
    try:
        if "record_unique_id" in args:
            r = session.query(RCHUser).filter(RCHUser.phone_no_1 == args["phone_no"])
            rch_rec_phone = r.count()
            rch_rec =r.first()
            if rch_rec_phone > 0 and args['record_unique_id'] != rch_rec.uid:
                log['response'] ={"status_code":400, "record_unique_id":rch_rec.uid, "status_msg": "Phone number is already taken for another user."}
                ml_register_rch_user.insert_one(log)
                return jsonify(log['response'])

            rch_rec = session.query(RCHUser).filter(RCHUser.uid == args["record_unique_id"]).first()
            woman_dob = obj_to_date(args["woman_dob"],False)
            husband_dob = obj_to_date(args["husband_dob"],False)
            preg_rec = session.query(PregnancyDetail).filter(PregnancyDetail.rch_user_id == rch_rec.id).all()
            record_pregnancy_ids = []
            for p in preg_rec:
                record_pregnancy_ids.append(p.pregnancy_id)
            rch_rec.name = args["woman_name"]
            rch_rec.dob = woman_dob,
            rch_rec.address = args["address"]
            rch_rec.phone_no_1 = str(args["phone_no"])
            rch_rec.phone_no_2 = args["phone_no_1"]
            rch_rec.age = args["woman_age"]
            rch_rec.husband_name = args["husband_name"]
            rch_rec.husband_dob = husband_dob,
            rch_rec.husband_age = args["husband_age"]
            rch_rec.family_reg_no = args["family_registration_number"]
            rch_rec.mother_education = args["mother_education"]
            rch_rec.unique_id = args["unique_id"]
            rch_rec.aadhar_id = args["aadhar_id"]
            rch_rec.income = args["income"]
            rch_rec.caste = args["caste"]
            rch_rec.ec_no = args["ec_no"]
            rch_rec.apl_bpl = args["apl_bpl"]
            rch_rec.bank_account_number = args["bank_account_number"]
            rch_rec.ifsc_code = args["ifsc_code"]
            rch_rec.category = args["category"]
            session.commit()
            record = {'status_code': 200, "woman_name":rch_rec.name,"record_unique_id":rch_rec.uid ,"record_pregnancy_ids":record_pregnancy_ids,"status_msg": "Details have been successfully edited."}
        else:
            rec = session.query(User).filter(User.username == str(args["phone_no"])).first()
            role = session.query(Role).filter(Role.role_name == "rch_user").first()
            uid = get_random_id()
            if rec:
                user = rec
            else:
                passwd = create_hash(args["unique_id"])
                user=User(
                    username=str(args["phone_no"]),
                    password=passwd,
                    unique_id=uid
                )
                session.add(user)
                session.commit()
                user_role = UserRole(role_id=role.id,user_id=user.id)
                session.add(user_role)
                session.commit()
            rch_rec = session.query(RCHUser).filter(RCHUser.user_id == user.id).first()

            if rch_rec:
                preg_recs = session.query(PregnancyDetail).filter(PregnancyDetail.rch_user_id == rch_rec.id).all()
                preg_dates = {}
                for preg_rec in preg_recs:
                    children = session.query(Child).filter(Child.pregnancy_detail_id == preg_rec.id).all()
                    child_arr = []
                    for child in children:
                        child_arr.append(child.date_of_birth)
                    child_arr.sort()
                    preg_dates[preg_rec.pregnancy_id] = date_to_string(child_arr[-1])
                return jsonify({"status_code":401,"record_unique_id":rch_rec.uid, "pregnancy_dates":preg_dates, "status_msg": "RCH User already exists"})
            else:
                woman_dob = obj_to_date(args["woman_dob"], False)
                husband_dob = obj_to_date(args["husband_dob"], False)
                rch_user=RCHUser(
                    user_id = user.id,
                    name = args["woman_name"],
                    dob = woman_dob,
                    address = args["address"],
                    phone_no_1 = str(args["phone_no"]),
                    phone_no_2 = args["phone_no_1"],
                    age = args["woman_age"],
                    husband_name = args["husband_name"],
                    husband_dob = husband_dob,
                    husband_age = args["husband_age"],
                    family_reg_no = args["family_registration_number"],
                    mother_education = args["mother_education"],
                    unique_id = args["unique_id"],
                    aadhar_id = args["aadhar_id"],
                    income = args["income"],
                    uid= uid,
                    caste = args["caste"],
                    ec_no = args["ec_no"],
                    apl_bpl = args["apl_bpl"],
                    bank_account_number = args["bank_account_number"],
                    ifsc_code = args["ifsc_code"],
                    category = args["category"]
                )
                session.add(rch_user)
                session.commit()

            record = {'status_code': 200, "woman_name":rch_user.name, "record_unique_id":rch_user.uid ,"status_msg": "Details have been successfully created."}
    except Exception as e:
        session.rollback()
        error_email.send_email({'error':str(e),'url':request.url})
        record = {'status_code': 500, "status_msg": str(e)}
    log['response'] = record
    ml_register_rch_user.insert_one(log)
    return jsonify(record)



@dashboard.route('/register_pregnancy',methods = ['POST'])
@jwt_required
def create_pregnancy():
    args = request.json
    log = {}
    log['request'] = args
    if not "record_unique_id" in args:
        log['response'] = {"status_code":400, "status_msg": "Bad Request. Unique ID not found."}
        ml_register_pregnancy.insert_one(log)
        return jsonify({"status_code":400, "status_msg": "Bad Request. Unique ID not found."})
    if args["record_unique_id"] == "":
        log['response'] = {"status_code": 400, "status_msg": "Bad Request. Unique ID not valid."}
        ml_register_pregnancy.insert_one(log)
        return jsonify({"status_code":400, "status_msg": "Bad Request. Unique ID is not  valid."})
    try:
        if "record_pregnancy_id" in args:
            preg_rec = session.query(PregnancyDetail).filter(PregnancyDetail.pregnancy_id == args["record_pregnancy_id"]).first()
            rec = session.query(RCHUser).filter(RCHUser.uid == args["record_unique_id"]).first()
            menstruation_date = obj_to_date(args["menstruation_date"], False)
            expected_delivery_date = obj_to_date(args["expected_delivery_date"], False)
            last_delivery_date = obj_to_date(args["last_delivery_date"], False)
            serv_rec = session.query(ServiceProvider).filter(ServiceProvider.pregnancy_detail_id == preg_rec.id).first()
            tt1_date = obj_to_date(args["tt1_date"], False)
            tt2_date = obj_to_date(args["tt2_date"], False)
            usg1_date = obj_to_date(args["usg1_date"], False)
            usg2_date = obj_to_date(args["usg2_date"], False)
            usg3_date = obj_to_date(args["usg3_date"], False)
            preg_rec.rch_user_id = rec.id,
            preg_rec.phone_no=args["phone_no"]
            preg_rec.drivers_number=args["drivers_number"]
            preg_rec.menstruation_date=menstruation_date,
            preg_rec.expected_delivery_date=expected_delivery_date,
            preg_rec.blood_group=args["blood_group"]
            preg_rec.last_delivery_date=last_delivery_date,
            preg_rec.rsby_reg_number=args["rsby_reg_number"]
            preg_rec.jsy_reg_number=args["jsy_reg_number"]
            preg_rec.gravida=int(args["gravida"]),
            preg_rec.para=int(args["para"]),
            preg_rec.no_of_live_children=int(args["no_of_live_children"]),
            preg_rec.no_of_abortions=int(args["no_of_abortions"]),
            preg_rec.tt1_date=tt1_date,
            preg_rec.tt2_date=tt2_date,
            preg_rec.usg1_date=usg1_date,
            preg_rec.usg2_date=usg2_date,
            preg_rec.usg3_date=usg3_date,
            preg_rec.important_findings=args["important_findings"]
            preg_rec.complication_details=args["complication_details"]
            preg_rec.heart_complications=args["heart_complications"]
            preg_rec.advice=args["advice"]
            preg_rec.referrals=args["referrals"]
            preg_rec.contraceptive_methods_used=args["contraceptive_methods_used"]
            preg_rec.rh_category=args["rh_category"]
            preg_rec.previous_delivery=args["previous_delivery"]
            child_rch_data = []
            for child_record in args["child_data"]:
                if child_record['rch_id']:
                    child_rec = session.query(Child).filter(Child.rch_id == child_record['rch_id'],Child.deleted==False).first()
                    dob = obj_to_date(child_record['dob'], False)
                    child_rec.name = child_record['name']
                    child_rec.gender = child_record['gender']
                    child_rec.deleted = True if child_record['deleted'] == "true"  else False
                    child_rec.date_of_birth = dob
                    update_beneficiary_immunisation_tracking(child_rec.rch_id,dob)
                    child_rch_data.append(child_rec.rch_id)
                    session.commit()
                else:
                    dob = obj_to_date(child_record['dob'], False) if child_record['dob'] else datetime.now()
                    child_rec = Child(
                        name=child_record['name'] if child_record['name'] else "Baby" + rec.name,
                        gender=child_record['gender'],
                        pregnancy_detail_id=preg_rec.id,
                        rch_user_id=rec.id,
                        date_of_birth=dob ,
                        rch_id = child_record['dup_rch_id'] if 'dup_rch_id' in child_record else "",
                        deleted = True if child_record['deleted'] == "true"  else False
                    )

                    session.add(child_rec)
                    session.commit()
                    create_beneficiary_immunisation_tracking(child_rec.rch_id,dob)
                    child_rch_data.append(child_rec.rch_id)
                    add_to_cassandra(child_rec.rch_id, '3')
                    producer.ProduceBeneficiaryData('Add_Beneficiary', '3', child_rec.rch_id)

            record = {'status_code': 200,
            'woman_name':rec.name ,
            "record_pregnancy_id": preg_rec.pregnancy_id,
            "record_service_id":serv_rec.id if serv_rec else None ,
            "record_rch_ids": child_rch_data,
            "status_msg": "Pregnancy edited successfully."}
        else:
            rec = session.query(RCHUser).filter(RCHUser.uid == args["record_unique_id"]).first()
            if rec:
                menstruation_date = obj_to_date(args["menstruation_date"], False)
                expected_delivery_date = obj_to_date(args["expected_delivery_date"], False)
                last_delivery_date = obj_to_date(args["last_delivery_date"], False)

                tt1_date = obj_to_date(args["tt1_date"], False)
                tt2_date = obj_to_date(args["tt2_date"], False)
                usg1_date = obj_to_date(args["usg1_date"], False)
                usg2_date = obj_to_date(args["usg2_date"], False)
                usg3_date = obj_to_date(args["usg3_date"], False)

                preg_rec=PregnancyDetail(
                    rch_user_id = rec.id,
                    phone_no=args["phone_no"],
                    drivers_number=args["drivers_number"],
                    menstruation_date=menstruation_date,
                    expected_delivery_date=expected_delivery_date,
                    blood_group=args["blood_group"],
                    last_delivery_date=last_delivery_date,
                    rsby_reg_number=args["rsby_reg_number"],
                    jsy_reg_number=args["jsy_reg_number"],
                    gravida=int(args["gravida"]),
                    para=int(args["para"]),
                    no_of_live_children=int(args["no_of_live_children"]),
                    no_of_abortions=int(args["no_of_abortions"]),
                    tt1_date=tt1_date,
                    tt2_date=tt2_date,
                    usg1_date=usg1_date,
                    usg2_date=usg2_date,
                    usg3_date=usg3_date,
                    important_findings=args["important_findings"],
                    complication_details=args["complication_details"],
                    heart_complications=args["heart_complications"],
                    advice=args["advice"],
                    referrals=args["referrals"],
                    contraceptive_methods_used=args["contraceptive_methods_used"],
                    rh_category=args["rh_category"],
                    previous_delivery=args["previous_delivery"],
                    pregnancy_id=args["pregnancy_id"] if "pregnancy_id" in args else ""
                )
                session.add(preg_rec)
                session.commit()
                child_rch_data = []
                if args["child_data"]:
                    for child_record in args["child_data"]:
                        dob = obj_to_date(child_record['dob'], False) if child_record['dob'] else datetime.now()
                        child_rec = Child(
                            name=child_record['name'] if child_record['name'] else "Baby" + rec.name,
                            gender=child_record['gender'],
                            pregnancy_detail_id=preg_rec.id,
                            rch_user_id=rec.id,
                            deleted = True if child_record['deleted'] == "true"  else False,
                            rch_id = child_record['dup_rch_id'] if 'dup_rch_id' in child_record else "",
                            date_of_birth=dob
                        )
                        session.add(child_rec)
                        session.commit()
                        create_beneficiary_immunisation_tracking(child_rec.rch_id,dob)
                        child_rch_data.append(child_rec.rch_id)
                        add_to_cassandra(child_rec.rch_id, '3');
                        producer.ProduceBeneficiaryData('Add_Beneficiary', '3', child_rec.rch_id)
                else:
                    child_rec = Child(
                        name= "Baby" + rec.name,
                        gender= "m",
                        pregnancy_detail_id= preg_rec.id,
                        rch_user_id= rec.id,
                        rch_id =  "",
                        date_of_birth= datetime.now()
                    )
                    session.add(child_rec)
                    session.commit()
                    create_beneficiary_immunisation_tracking(child_rec.rch_id,datetime.now())
                    child_rch_data.append(child_rec.rch_id)
                    add_to_cassandra(child_rec.rch_id, '3');
                    producer.ProduceBeneficiaryData('Add_Beneficiary', '3', child_rec.rch_id)
            record = {'status_code': 200,'woman_name':rec.name ,"record_pregnancy_id": preg_rec.pregnancy_id,"record_rch_ids":child_rch_data ,"status_msg": "Pregnancy created Successfully."}
    except Exception as e:
        session.rollback()
        error_email.send_email({'error':str(e),'url':request.url})
        record = {'status_code': 500, "status_msg": str(e)}
    log['response'] = record
    ml_register_pregnancy.insert_one(log)
    return jsonify(record)

@dashboard.route('/register_service_provider',methods = ['POST'])
@jwt_required
def create_service_provider():
    args = request.json
    log = {}
    log['request'] = args
    if not "record_pregnancy_id" in args:
        log['response'] = {"status_code":400, "status_msg": "Bad Request. RCH ID not found."}
        ml_register_service_provider.insert_one(log)
        return jsonify({"status_code":400, "status_msg": "Bad Request. RCH ID not found."})
    if args["record_pregnancy_id"] == "":
        log['response'] = {"status_code": 400, "status_msg": "Bad Request. RCH ID not valid."}
        ml_register_service_provider.insert_one(log)
        return jsonify({"status_code":400, "status_msg": "Bad Request. RCH ID not valid."})
    try:
        if ("record_pregnancy_id" in args) and ("record_service_id" in args):
            date_of_first_registration =obj_to_date(args["date_of_first_registration"], False)
            serv_rec = session.query(ServiceProvider).filter(ServiceProvider.id == args["record_service_id"]).first()
            if serv_rec:
                serv_rec.health_centre = args["health_centre"]
                serv_rec.sub_centre = args["sub_centre"]
                serv_rec.asha = args["asha"]
                serv_rec.asha_phone = args["asha_phone"]
                serv_rec.jphn = args["jphn"]
                serv_rec.jphn_phone = args["jphn_phone"]
                serv_rec.hospital_for_delivery = args["hospital_for_delivery"]
                serv_rec.hospital_address = args["hospital_address"]
                serv_rec.birth_companion = args["birth_companion"]
                serv_rec.transportation_arrangement = args["transportation_arrangement"]
                serv_rec.registered_for_pmmvy = False#args["registered_for_pmmvy"]
                serv_rec.first_financial_aid = False#args["first_financial_aid"]
                serv_rec.second_financial_aid = False#args["second_financial_aid"]
                serv_rec.third_financial_aid = False#args["third_financial_aid"]
                serv_rec.anganwadi_worker = args["anganwadi_worker"]
                serv_rec.anganwadi_registration_number = args["anganwadi_registration_number"]
                serv_rec.anganwadi_centre = args["anganwadi_centre"]
                serv_rec.anganwadi_phone = args["anganwadi_phone"]
                serv_rec.icds = args["icds"]
                serv_rec.sub_centre_registration_number = args["sub_centre_registration_number"]
                serv_rec.date_of_first_registration = date_of_first_registration
                serv_rec.nearest_station_id = int(args["nearest_station"]["station_id"] if "station_id" in args["nearest_station"] else 0)
                session.commit()
                record = {'status_code': 200, "record_service_id":serv_rec.id ,"status_msg": "Successfully updated."}
            else:
                jsonify({"status_code":404, "status_msg": "Record Service Provider Not Found."})
        else:
            preg_detail = session.query(PregnancyDetail).filter(PregnancyDetail.pregnancy_id == args["record_pregnancy_id"]).first()
            if preg_detail:
                date_of_first_registration =obj_to_date(args["date_of_first_registration"], False)
                serv_rec = ServiceProvider(
                    pregnancy_detail_id = preg_detail.id,
                    health_centre = args["health_centre"],
                    sub_centre = args["sub_centre"],
                    asha = args["asha"],
                    asha_phone = args["asha_phone"],
                    jphn = args["jphn"],
                    jphn_phone = args["jphn_phone"],
                    hospital_for_delivery = args["hospital_for_delivery"],
                    hospital_address = args["hospital_address"],
                    birth_companion = args["birth_companion"],
                    transportation_arrangement = args["transportation_arrangement"],
                    registered_for_pmmvy = False,#args["registered_for_pmmvy"],
                    first_financial_aid = False,#args["first_financial_aid"],
                    second_financial_aid = False,#args["second_financial_aid"],
                    third_financial_aid = False,#args["third_financial_aid"],
                    anganwadi_worker = args["anganwadi_worker"],
                    anganwadi_registration_number = args["anganwadi_registration_number"],
                    anganwadi_centre = args["anganwadi_centre"],
                    anganwadi_phone = args["anganwadi_phone"],
                    icds = args["icds"],
                    sub_centre_registration_number = args["sub_centre_registration_number"],
                    date_of_first_registration = date_of_first_registration,
                    nearest_station_id = int(args["nearest_station"]["station_id"] if "station_id" in args["nearest_station"] else 0)
                )
                session.add(serv_rec)
                session.commit()
                record = {'status_code': 200, "record_service_id":serv_rec.id ,"status_msg": "Successfully created."}
    except Exception as e:
        session.rollback()
        error_email.send_email({'error':str(e),'url':request.url})
        record = {'status_code': 500, "status_msg": str(e)}
    log['response'] = record
    ml_register_service_provider.insert_one(log)
    return jsonify(record)

@dashboard.route('/beneficiary_data',methods = ['GET'])
@jwt_required
def beneficiary_data():
    try:
        data = []
        log = {}
        log['request'] = {}
        rch_recs  = session.query(RCHUser).all()
        for rch_rec in rch_recs:
            data_obj = {}
            data_obj["record_unique_id"] = rch_rec.uid
            data_obj["pregnant_woman_name"] = rch_rec.name
            data_obj["husband_name"] = rch_rec.husband_name
            data_obj["address"] = rch_rec.address
            data_obj["pregnant_woman_dob"] =  date_to_string(rch_rec.dob)
            data_obj["phone_number"] = rch_rec.phone_no_1
            data.append(data_obj)

        if data:
            record = {'status_code': 200,'status_msg': "Success","data":data}
        else:
            record = {'status_code': 200,'status_msg': "No records found","data":[]}
    except Exception as e:
        error_email.send_email({'error':str(e),'url':request.url})
        record = {'status_code': 500, "status_msg": str(e)}
    log['response'] = record
    ml_beneficiary_data.insert_one(log)
    return jsonify(record)

@dashboard.route('/edit_beneficiary_family',methods = ['POST'])
@jwt_required
def edit_beneficiary_family():
    try:
        args = request.json
        log = {}
        log['request'] = args
        rch_rec  = session.query(RCHUser).filter(RCHUser.uid == args["data"]["record_unique_id"]).first()
        if rch_rec:
           preg_recs  = session.query(PregnancyDetail).filter(PregnancyDetail.rch_user_id == rch_rec.id).all()
           record_pregnancy_ids = []
           for p in preg_recs:
               record_pregnancy_ids.append(p.pregnancy_id)
           data = {}
           data["woman_name"]= rch_rec.name
           data["woman_dob"]= date_to_string(rch_rec.dob)
           data["woman_age"]= rch_rec.age
           data["husband_name"]= rch_rec.husband_name
           data["husband_dob"]= date_to_string(rch_rec.husband_dob)
           data["husband_age"]= rch_rec.husband_age
           data["address"]= rch_rec.address
           data["phone_no"]= rch_rec.phone_no_1
           data["phone_no_1"]= rch_rec.phone_no_2
           data["family_registration_number"]= rch_rec.family_reg_no
           data["mother_education"]= rch_rec.mother_education
           data["unique_id"]= rch_rec.unique_id
           data["aadhar_id"]= rch_rec.aadhar_id
           data["income"]= rch_rec.income
           data["caste"]= rch_rec.caste
           data["ec_no"]= rch_rec.ec_no
           data["apl_bpl"]= rch_rec.apl_bpl
           data["bank_account_number"]= rch_rec.bank_account_number
           data["ifsc_code"]= rch_rec.ifsc_code
           data["category"]= rch_rec.category
           data["record_pregnancy_ids"] = record_pregnancy_ids
           data["record_unique_id"] = rch_rec.uid
           record = {'status_code': 200,'status_msg': "Success","family_details":data}
        else:
            record = {'status_code': 200,'status_msg': "No records found","data":[]}
    except Exception as e:
        error_email.send_email({'error':str(e),'url':request.url})
        record = {'status_code': 500, "status_msg": str(e)}
    log['response'] = record
    ml_edit_beneficiary_family.insert_one(log)
    return jsonify(record)

@dashboard.route('/edit_service_provider',methods = ['POST'])
@jwt_required
def edit_service_provider():
    try:
        args = request.json
        log = {}
        log['request'] = args
        preg_rec = session.query(PregnancyDetail).filter(PregnancyDetail.pregnancy_id == args["data"]["record_pregnancy_id"]).first()
        ser_rec  = session.query(ServiceProvider).filter(ServiceProvider.pregnancy_detail_id == preg_rec.id).first()
        if ser_rec:
           data = {}
           data["icds"]= ser_rec.icds
           data["anganwadi_centre"]= ser_rec.anganwadi_centre
           data["anganwadi_worker"]= ser_rec.anganwadi_worker
           data["anganwadi_phone"]= ser_rec.anganwadi_phone
           data["health_centre"]= ser_rec.health_centre
           data["sub_centre"]= ser_rec.sub_centre
           data["asha"]= ser_rec.asha
           data["asha_phone"]= ser_rec.asha_phone
           data["jphn"]= ser_rec.jphn
           data["jphn_phone"]= ser_rec.jphn_phone
           data["hospital_for_delivery"]= ser_rec.hospital_for_delivery
           data["hospital_address"] = ser_rec.hospital_address
           data["birth_companion"]= ser_rec.birth_companion
           data["transportation_arrangement"]= ser_rec.transportation_arrangement
           data["registered_for_pmmvy"]= ser_rec.registered_for_pmmvy
           data["first_financial_aid"]= ser_rec.first_financial_aid
           data["second_financial_aid"]= ser_rec.second_financial_aid
           data["third_financial_aid"]= ser_rec.third_financial_aid
           data["anganwadi_registration_number"]= ser_rec.anganwadi_registration_number
           data["sub_centre_registration_number"]= ser_rec.sub_centre_registration_number
           data["date_of_first_registration"]= date_to_string(ser_rec.date_of_first_registration)
           data["record_service_id"] = ser_rec.id
           data["nearest_station"] = ser_rec.get_station_object()
           record = {'status_code': 200,'status_msg': "Success","service_provider_details":data}
        else:
            record = {'status_code': 200,'status_msg': "No records found","data":[]}
    except Exception as e:
        error_email.send_email({'error':str(e),'url':request.url})
        record = {'status_code': 500, "status_msg": str(e)}
    log['response'] = record
    ml_edit_service_provider.insert_one(log)
    return jsonify(record)

@dashboard.route('/edit_beneficiary_pregnancy',methods = ['POST'])
@jwt_required
def edit_beneficiary_pregnancy():
    try:
        args = request.json
        log = {}
        log['request'] = args
        preg_rec = session.query(PregnancyDetail).filter(PregnancyDetail.pregnancy_id == args["data"]["record_pregnancy_id"]).first()
        if preg_rec:
            rch_rec  = session.query(RCHUser).filter(RCHUser.id == preg_rec.rch_user_id).first()
            child_recs = session.query(Child).filter(Child.pregnancy_detail_id == preg_rec.id,Child.deleted==False).all()
            data = {}
            data["phone_no"]=preg_rec.phone_no
            data["drivers_number"] =preg_rec.drivers_number
            data["menstruation_date"]=date_to_string(preg_rec.menstruation_date)
            data["expected_delivery_date"]=date_to_string(preg_rec.expected_delivery_date)
            data["blood_group"]=preg_rec.blood_group
            data["last_delivery_date"]=date_to_string(preg_rec.last_delivery_date)
            data["rsby_reg_number"] =preg_rec.rsby_reg_number
            data["jsy_reg_number"] =preg_rec.jsy_reg_number
            data["gravida"]=preg_rec.gravida
            data["para"]=preg_rec.para
            data["no_of_live_children"]=preg_rec.no_of_live_children
            data["no_of_abortions"]=preg_rec.no_of_abortions
            data["tt1_date"]=date_to_string(preg_rec.tt1_date)
            data["tt2_date"]=date_to_string(preg_rec.tt2_date)
            data["usg1_date"]=date_to_string(preg_rec.usg1_date)
            data["usg2_date"]=date_to_string(preg_rec.usg2_date)
            data["usg3_date"]=date_to_string(preg_rec.usg3_date)
            data["important_findings"] =preg_rec.important_findings
            data["complication_details"] =preg_rec.complication_details
            data["heart_complications"] =preg_rec.heart_complications
            data["child_data"] = []
            for cr in child_recs:
                obj = {}
                obj["rch_id"] = cr.rch_id
                obj["name"] = cr.name
                obj["gender"] = cr.gender
                obj["deleted"] = cr.deleted
                obj["dob"] = date_to_string(cr.date_of_birth)
                data["child_data"].append(obj)
            data["advice"] =preg_rec.advice
            data["referrals"] =preg_rec.referrals
            data["contraceptive_methods_used"] =preg_rec.contraceptive_methods_used
            data["rh_category"] =preg_rec.rh_category
            data["previous_delivery"]=preg_rec.previous_delivery
            data["record_unique_id"] = rch_rec.uid

            record = {'status_code': 200,'status_msg': "Success","pregnancy_details":data}
        else:
            record = {'status_code': 200,'status_msg': "No records found","data":[]}
    except Exception as e:
        error_email.send_email({'error':str(e),'url':request.url})
        record = {'status_code': 500, "status_msg": str(e)}
    log['response'] = record
    ml_edit_beneficiary_pregnancy.insert_one(log)
    return jsonify(record)

@dashboard.route('/search_family_data',methods = ['POST'])
@jwt_required
def search_family_data():
    try:
        args = request.json
        data = []
        log = {}
        log['request'] = args
        if not args['phone_no'] and not args['husband_name'] and not args['name']:
            sql = """
            SELECT * FROM rch_users ORDER BY time_created DESC LIMIT 5;
            """
            rch_recs = session.query(RCHUser).from_statement(text(sql)).all()
        else:
            sql = """
            SELECT *
            FROM rch_users
            WHERE (phone_no_1 LIKE :phone_no OR name LIKE :name OR husband_name LIKE :husband_name)
            """
            rch_recs = session.query(RCHUser).from_statement(text(sql)).params(args).all()

        for rch_rec in rch_recs:
            data_obj = {}
            data_obj["record_unique_id"] = rch_rec.uid
            data_obj["pregnant_woman_name"] = rch_rec.name
            data_obj["husband_name"] = rch_rec.husband_name
            data_obj["address"] = rch_rec.address
            data_obj["pregnant_woman_dob"] =  date_to_string(rch_rec.dob)
            data_obj["phone_number"] = rch_rec.phone_no_1
            data.append(data_obj)
        record = {'status_code': 200,'status_msg': "Success","family_details":data}
    except Exception as e:
        error_email.send_email({'error':str(e),'url':request.url})
        record = {'status_code': 500, "status_msg": str(e)}
    log['response'] = record
    ml_search_family_data.insert_one(log)
    return jsonify(record)


def create_beneficiary_immunisation_tracking(beneficiary_id,dob):
    data = {}
    ages = session.query(Age).all()
    date_of_birth = dob
    for age in ages:
        data[age.code] = {}
        new_date = date_of_birth + timedelta(weeks=age.weeks)
        age_vaccines =  session.query(AgeVaccine).filter(AgeVaccine.age_id == age.id).all()
        for age_vaccine in age_vaccines:
            vaccine_dose =  session.query(VaccineDose).filter(VaccineDose.id == age_vaccine.vaccine_dose_id).first()
            data[age.code][vaccine_dose.name] = {"expected_date":new_date.strftime("%Y-%m-%d")}
    insert_data = {}
    insert_data["beneficiary_id"] = beneficiary_id
    insert_data["vaccination_object"] = data
    cassandra_client.session.execute("INSERT INTO beneficiary_immunisation_tracking JSON '"+json.dumps(insert_data)+"';")

def update_beneficiary_immunisation_tracking(beneficiary_id,dob):
    record = cassandra_client.session.execute("SELECT JSON * FROM kba.beneficiary_immunisation_tracking WHERE beneficiary_id='"+beneficiary_id+"';")[0]

    data = {}
    data['beneficiary_id'] = str(beneficiary_id)
    data['vaccination_object'] = json.loads(record.json)['vaccination_object']
    age = session.query(Age)
    for age_obj_key in data['vaccination_object'].keys():
        a = age.filter(Age.code == age_obj_key).first()
        new_date = dob + timedelta(weeks=a.weeks)
        for polio_name_key in data['vaccination_object'][age_obj_key].keys():
            data['vaccination_object'][age_obj_key][polio_name_key]['expected_date'] = new_date.strftime("%Y-%m-%d")

    cassandra_client.session.execute("INSERT INTO beneficiary_immunisation_tracking JSON '"+json.dumps(data)+"';")


def add_to_cassandra(beneficiary_id, beneficiary_id_type):
    BenLogDB.insert_data(
        uuid.uuid4(), #uuid
        beneficiary_id, #beneficiaryId
        beneficiary_id_type)


@dashboard.route('/lookup_data',methods = ['GET'])
#@jwt_required
def lookup_data():
    try:
        log = {}
        languages = session.query(Language).all()
        lang_obj = []
        for language in languages:
            obj = {}
            obj['name'] = language.name
            obj['id'] = language.code
            lang_obj.append(obj)

        ages = session.query(Age).all()
        vac_obj = {}
        vac_obj['vaccine'] = []
        vaccine_names_id = {}
        vaccine_names = {}
        for age in ages:
            age_vaccines = session.query(AgeVaccine).filter(AgeVaccine.age_id == age.id).all()
            obj = {}
            obj['age'] = age.code
            obj['vaccines'] = []
            for age_vaccine in age_vaccines:
                vaccine_dose = session.query(VaccineDose).filter(VaccineDose.id == age_vaccine.vaccine_dose_id).first()
                vaccine = vaccine_dose.vaccine
                if vaccine.name in vaccine_names:
                    vaccine_names[vaccine.name].append(vaccine_dose.name)
                    vaccine_names_id[vaccine.name] = vaccine.id
                else:
                    vaccine_names[vaccine.name] = []
                    vaccine_names_id[vaccine.name] = vaccine.id
                    vaccine_names[vaccine.name].append(vaccine_dose.name)
                obj['vaccines'].append(vaccine_dose.name)#{"name":vaccine_dose.name,"parent_name":vaccine.name})
            vac_obj['vaccine'].append(obj)

        stations_obj = {}
        stations_obj['stations_list'] = []
        stations = session.query(Station).all()
        for station in stations:
            if station.code != "ET1":
                obj = {}
                obj['station_name'] = station.name
                obj['station_code'] = station.code
                obj['station_id'] = str(station.id)
                location = session.query(Location).filter(Location.id == station.location_id).first()
                obj['station_address'] = location.name
                stations_obj['stations_list'].append(obj)

        roles = session.query(Role).all()
        roles_obj = []
        for role in roles:
            if not role.role_name in ['admin','rch_user']:
                roles_obj.append({'id':role.id,'name':role.role_name})

        record = {
                    'status_code': 200,
                    'status_msg': "Success",
                    "languages":lang_obj,
                    'vaccines':vac_obj,
                    'vaccine_names':vaccine_names,
                    'vaccine_names_id':vaccine_names_id,
                    'stations':stations_obj,
                    'roles':roles_obj
                }
    except Exception as e:
        error_email.send_email({'error':str(e),'url':request.url})
        record = {'status_code': 500, "status_msg": str(e)}
    log['response'] = record
    ml_lookup_data.insert_one(log)
    return jsonify(record)


@dashboard.route('/children_data',methods = ['POST'])
@jwt_required
def children_data():
    args = request.json
    log = {}
    log['request'] = args
    try:
        unique_id = args['data']['record_unique_id']
        rch_user = session.query(RCHUser).filter(RCHUser.uid == unique_id).first()
        if rch_user:
            child_recs = session.query(Child).filter(Child.rch_user_id == rch_user.id,Child.deleted==False).all()
            response_data = []
            for child_rec in child_recs:
                preg_rec = session.query(PregnancyDetail).filter(PregnancyDetail.id == child_rec.pregnancy_detail_id).first()
                rec = {}
                rec['name'] = child_rec.name
                rec['dob'] = date_to_string(child_rec.date_of_birth)
                rec['rch_id'] = child_rec.rch_id
                rec['deleted'] = child_rec.deleted
                rec['woman_name'] = rch_user.name
                rec['record_pregnancy_id'] = preg_rec.pregnancy_id
                response_data.append(rec)

            record = {'status_code': 200, "status_msg": "Success","data":response_data}
        else:
            record = {'status_code': 404, "status_msg": "Mother record not found."}
    except Exception as e:
        error_email.send_email({'error':str(e),'url':request.url})
        record = {'status_code': 500, "status_msg": str(e)}
    log['response'] = record
    ml_children_data.insert_one(log)
    return jsonify(record)


@dashboard.route('/pregnancy_children_data',methods = ['GET'])
@jwt_required
def pregnancy_children_data():
    args = request.args
    log = {'request':args}
    try:
        pregnancy_id = args['record_pregnancy_id']
        preg_rec = session.query(PregnancyDetail).filter(PregnancyDetail.pregnancy_id == pregnancy_id).first()
        if preg_rec:
            rch_rec = session.query(RCHUser).filter(RCHUser.id == preg_rec.rch_user_id).first()
            child_recs = session.query(Child).filter(Child.pregnancy_detail_id == preg_rec.id,Child.deleted==False).all()
            response_data = []
            for child_rec in child_recs:
                    rec = {}
                    record = cassandra_client.session.execute("SELECT JSON * FROM kba.beneficiary_immunisation_tracking WHERE beneficiary_id='"+child_rec.rch_id+"';")[0]
                    vaccination_object = json.loads(record.json)['vaccination_object']
                    ages = session.execute("SELECT * FROM ages ORDER BY weeks;")
                    ages_obj = []
                    for age in ages:
                        o = {}
                        o['name'] = age.code
                        ages_obj.append(o)
                    ages_obj.reverse()
                    main_vaccined = False
                    vaccines = []
                    for _age in ages_obj:
                        vaccine_obj = {}
                        vaccined =False
                        vaccine_obj['age'] = _age['name']
                        vaccine_obj['missed'] = []
                        vaccine_obj['vaccines'] = []
                        current_age_v_objects = vaccination_object[_age['name']]
                        if main_vaccined:
                            for current_age_v_objects_key in current_age_v_objects.keys():
                                current_age_v_object = current_age_v_objects[current_age_v_objects_key]
                                if not current_age_v_object['vaccine_id']:
                                    vaccine_obj['missed'].append({
                                        'age':_age['name'],
                                        'vaccine':current_age_v_objects_key,
                                        'eligible_date': date_to_string(current_age_v_object['expected_date'],False)
                                        })
                        else:
                            for current_age_v_objects_key in current_age_v_objects.keys():
                                current_age_v_object = current_age_v_objects[current_age_v_objects_key]
                                if current_age_v_object['vaccine_id']:
                                    main_vaccined = True
                                    vaccined = True

                            for current_age_v_objects_key in current_age_v_objects.keys():
                                current_age_v_object = current_age_v_objects[current_age_v_objects_key]
                                if vaccined:
                                    if not current_age_v_object['vaccine_id']:
                                        vaccine_obj['missed'].append({
                                            'age':_age['name'],
                                            'vaccine': current_age_v_objects_key,
                                            'eligible_date': date_to_string(current_age_v_object['expected_date'],False)
                                            })
                                else:
                                    vaccine_obj['vaccines'].append({
                                        'age':_age['name'],
                                        'vaccine': current_age_v_objects_key,
                                        'eligible_date': date_to_string(current_age_v_object['expected_date'],False)
                                        })
                        vaccines.append(vaccine_obj)
                    vaccines.reverse()
                    rec['dob'] = date_to_string(child_rec.date_of_birth)
                    rec['rch_id'] = child_rec.rch_id
                    rec['child_name'] = child_rec.name
                    rec['deleted'] = child_rec.deleted
                    rec['gender'] = child_rec.gender
                    rec['child_age'] = '1'
                    rec['woman_name'] = rch_rec.name
                    rec['husband_name'] = rch_rec.husband_name
                    rec['phone_no'] = rch_rec.phone_no_1
                    rec['address'] = rch_rec.address
                    rec['husband_name'] = rch_rec.husband_name
                    rec['vaccines'] = vaccines
                    response_data.append(rec)
            record = {'status_code': 200, "status_msg": "Success","data":response_data}
        else:
            record = {'status_code': 404, "status_msg": "Mother record not found."}
    except Exception as e:
        error_email.send_email({'error':str(e),'url':request.url})
        record = {'status_code': 500, "status_msg": str(e)}
    log['response'] = record
    ml_pregnancy_children_data.insert_one(log)
    return jsonify(record)
