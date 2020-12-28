from flask import Flask,Blueprint, jsonify, request
import custom_functions
from mongo_log import *
from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    get_jwt_identity
)
from csv_generator import generate_csv
from postgres_models.base import Session, engine, Base
from postgres_models.vaccine_doses import VaccineDose
from postgres_models.children import Child
from postgres_models.ages import Age
from postgres_models.age_vaccines import AgeVaccine
from postgres_models.rch_users import RCHUser
import error_email
from immuno_cassandra import DBconnect

Base.metadata.create_all(engine)
session = Session()

cassandra_client = DBconnect.Cassandra()

analytics = Blueprint('analytics', __name__)
@analytics.route('/station_vaccine_analytics',methods = ['POST'])
@jwt_required
def show():
    try:
        args = request.json
        log = {}
        log['request'] = args
        return_data = []
        if False:             ## TO DO LATER.
            from_obj = args['date']
            from_time = custom_functions.obj_to_date(from_obj)
            args['date']['HH'] = 23
            args['date']['MM'] = 59
            to_obj = args['date']
            to_time = custom_functions.obj_to_date(to_obj)
            sub_select_query =  "SELECT id,name,dose_count,package_id,manufacturing_date,manufacturer_info,date_time FROM kba.vaccine_sub_log WHERE status='received' \
            AND date_time >= '{}' AND date_time <= '{}'   \
            AND station_id={} allow filtering;"
        else:
            sub_select_query =  "SELECT * FROM kba.vaccine_sub_log WHERE \
            current_station_id={} allow filtering;"
        for station_id in args['station_id']:
            station_obj = {}
            station_obj["station_id"] = station_id
            station_obj["vaccines"] = {}
            sub_logs = cassandra_client.session.execute(sub_select_query.format(station_id))
            for sub_log in sub_logs:
                vaccine_name = sub_log.name
                if vaccine_name in  station_obj["vaccines"]:
                    if sub_log.status == "send":
                        station_obj["vaccines"][vaccine_name]['transit_count'] = station_obj["vaccines"][vaccine_name]['transit_count'] + sub_log.dose_count
                    else:
                        station_obj["vaccines"][vaccine_name]['received_count'] = station_obj["vaccines"][vaccine_name]['received_count'] + sub_log.dose_count
                    count_obj = {}
                    count_obj['count'] = sub_log.dose_count
                    count_obj['vaccine_sub_id'] =  str(sub_log.id)
                    count_obj['package_id'] = sub_log.package_id
                    count_obj['previous_station'] = dict(sub_log.previous_station)
                    count_obj['status'] = "In-Transit" if sub_log.status == "send" else "Received"
                    count_obj['date_checked_in'] = custom_functions.date_to_string(sub_log.date_time)
                    count_obj['manufacturing_date'] = custom_functions.date_to_string(sub_log.manufacturing_date)
                    count_obj['expiry_date'] = custom_functions.date_to_string(sub_log.expiry_date)
                    count_obj['manufacturer_info'] = sub_log.manufacturer_info
                    station_obj["vaccines"][vaccine_name]['batches'].append(count_obj)
                else:
                    station_obj["vaccines"][vaccine_name] = {}
                    if sub_log.status == "send":
                        station_obj["vaccines"][vaccine_name]['transit_count'] = sub_log.dose_count
                        station_obj["vaccines"][vaccine_name]['received_count'] = 0
                    else:
                        station_obj["vaccines"][vaccine_name]['transit_count'] = 0
                        station_obj["vaccines"][vaccine_name]['received_count'] = sub_log.dose_count
                    station_obj["vaccines"][vaccine_name]['batches'] = []
                    count_obj = {}
                    count_obj['count'] = sub_log.dose_count
                    count_obj['vaccine_sub_id'] =  str(sub_log.id)
                    count_obj['package_id'] = sub_log.package_id
                    count_obj['status'] = "In-Transit" if sub_log.status == "send" else "Received"
                    count_obj['previous_station'] = dict(sub_log.previous_station)
                    count_obj['date_checked_in'] = custom_functions.date_to_string(sub_log.date_time)
                    count_obj['manufacturing_date'] = custom_functions.date_to_string(sub_log.manufacturing_date)
                    count_obj['expiry_date'] = custom_functions.date_to_string(sub_log.expiry_date)
                    count_obj['manufacturer_info'] = sub_log.manufacturer_info
                    if (station_obj["vaccines"][vaccine_name]['transit_count'] + station_obj["vaccines"][vaccine_name]['received_count'])>0:
                        station_obj["vaccines"][vaccine_name]['batches'].append(count_obj)
            return_data.append(station_obj)
        if return_data:
            record = {'status_code': 200,'status_msg': "Posted successfully","data":return_data}
        else:
            record = {'status_code': 404,'status_msg': "No records found","data":[]}
    except Exception as e:
        error_email.send_email({'error':str(e),'url':request.url})
        record = {'status_code': 500, "status_msg": str(e)}
    log['response'] = record
    ml_station_vaccine_analytics.insert_one(log)
    return jsonify(record)


@analytics.route('/station_vaccination_analytics',methods = ['POST'])
@jwt_required
def station_vaccination_analytics():
    args = request.json
    log = {}
    log['request'] = args
    csv = args['csv'] == "y"
    from_str = custom_functions.obj_to_date(args['date_from']).split(" ")[0]
    to_str = custom_functions.obj_to_date(args['date_to'],extra_day=1).split(" ")[0]
    station_ids = args['station']
    vaccine_name = args['vaccine_name'] if 'vaccine_name' in args else None
    batch_id = args['batch_id'] if 'batch_id' in args else None
    return_obj = {}
    main_obj = []
    csv_query = "AND name='{}' " if vaccine_name else ""
    csv_query = csv_query + ("AND package_id='{}' " if batch_id else "")
    sub_select_query = "SELECT package_id,name,date_rec,beneficiary_no,vaccine_no,station_other FROM kba.batch_immunisation_log WHERE \
         station_id='{}' AND date_rec >= '{}' AND date_rec <= '{}' " + csv_query + "allow filtering;"
    try:
        for station in station_ids:
             if vaccine_name:
                 sub_logs = cassandra_client.session.execute(sub_select_query.format(str(station),from_str,to_str,vaccine_name,batch_id))
             else:
                 sub_logs = cassandra_client.session.execute(
                     sub_select_query.format(str(station), from_str, to_str, batch_id))
             for sub_log in sub_logs:
                 datestr = str(sub_log.date_rec)
                 if sub_log.package_id in return_obj:
                     if datestr in return_obj[sub_log.package_id]:
                         obj = {}
                         obj['batch_id'] = sub_log.package_id
                         obj['vaccine_name'] = sub_log.name
                         if csv:
                            dat = custom_functions.date_to_string(datestr,False)
                         else:
                            try:
                                format  = custom_functions.date_to_string(datestr,False)
                                dat = str(format['dd'])+"/"+str(format['mm'])+"/"+str(format['yyyy'])
                            except:
                                dat = ""
                         obj['date_of_administration'] = dat
                         obj['no_of_doses_administered'] = sub_log.vaccine_no
                         obj['no_of_beneficiaries_administered'] = sub_log.beneficiary_no
                         main_obj.append(obj)

                     else:
                        return_obj[sub_log.package_id][datestr] = []
                        obj = {}
                        obj['batch_id'] = sub_log.package_id
                        obj['vaccine_name'] = sub_log.name
                        if csv:
                           dat = custom_functions.date_to_string(datestr,False)
                        else:
                           try:
                               format  = custom_functions.date_to_string(datestr,False)
                               dat = str(format['dd'])+"/"+str(format['mm'])+"/"+str(format['yyyy'])
                           except:
                               dat = ""
                        obj['date_of_administration'] = dat
                        obj['no_of_doses_administered'] = sub_log.vaccine_no
                        obj['no_of_beneficiaries_administered'] = sub_log.beneficiary_no
                        main_obj.append(obj)
                 else:
                     return_obj[sub_log.package_id] = {}
                     return_obj[sub_log.package_id][datestr] = []
                     obj = {}
                     obj['batch_id'] = sub_log.package_id
                     obj['vaccine_name'] = sub_log.name
                     if not csv:
                        dat = custom_functions.date_to_string(datestr,False)
                     else:
                        try:
                            format  = custom_functions.date_to_string(datestr,False)
                            dat = str(format['dd'])+"/"+str(format['mm'])+"/"+str(format['yyyy'])
                        except:
                            dat = ""
                     obj['date_of_administration'] = dat
                     obj['no_of_doses_administered'] = sub_log.vaccine_no
                     obj['no_of_beneficiaries_administered'] = sub_log.beneficiary_no
                     main_obj.append(obj)
        if main_obj:
            if csv:
                file_name = generate_csv(main_obj)
                record = {'status_code': 200,'status_msg': "Posted successfully","file_name":file_name}
            else:
                record = {'status_code': 200,'status_msg': "Posted successfully","data":main_obj}
        else:
            record = {'status_code': 404,'status_msg': "No records found","data":[]}
    except Exception as e:
        error_email.send_email({'error':str(e),'url':request.url})
        record = {'status_code': 500, "status_msg": str(e)}
    log['response'] = record
    ml_station_vaccination_analytics.insert_one(log)
    return jsonify(record)

def check_filter(args,sub_log):
    keys = ['child_name','father_name','mother_name']
    avail_keys = []
    for key in keys:
        if key in args and args[key]:
            avail_keys.append(key)
    if avail_keys:
        return_val = True
        for k in avail_keys:
            return_val = return_val and (sub_log.beneficiary_details[k] == args[k])
        return return_val
    else:
        return True

@analytics.route('/detailed_immunization_register',methods = ['POST'])
@jwt_required
def detailed_immunization_register():
    try:
        args = request.json
        log = {}
        log['request'] = args
        station_ids = args['station']
        csv = args['csv'] == "y"
        from_str = custom_functions.obj_to_date(args['date_from']).split(" ")[0]
        to_str = custom_functions.obj_to_date(args['date_to'],extra_day=1).split(" ")[0]
        data = {}
        for station_id in station_ids:
            sub_select_query =  "SELECT beneficiary_id,vaccine_details,beneficiary_details FROM kba.immunisation_log WHERE \
            station_id='{}' AND current_date >= '{}' AND current_date <= '{}' allow filtering;"
            sub_logs = cassandra_client.session.execute(sub_select_query.format(station_id,from_str,to_str))
            for sub_log in sub_logs:
                if sub_log.beneficiary_id in data:
                    data[sub_log.beneficiary_id]['vaccines_given'].append(sub_log.vaccine_details['vaccine_dose_name'])
                else:
                    if check_filter(args,sub_log):
                        data[sub_log.beneficiary_id] = {}
                        data[sub_log.beneficiary_id]['child_name'] = sub_log.beneficiary_details['child_name']
                        data[sub_log.beneficiary_id]['father_name'] = sub_log.beneficiary_details['father_name']
                        data[sub_log.beneficiary_id]['mother_name'] = sub_log.beneficiary_details['mother_name']
                        data[sub_log.beneficiary_id]['address'] = sub_log.beneficiary_details['address']
                        data[sub_log.beneficiary_id]['sex'] = sub_log.beneficiary_details['sex']
                        if not csv:
                           dat = custom_functions.date_to_string(sub_log.beneficiary_details['date_of_birth'],False) if 'date_of_birth' in sub_log.beneficiary_details else {}
                        else:
                           try:
                               format  = custom_functions.date_to_string(sub_log.beneficiary_details['date_of_birth'],False) if 'date_of_birth' in sub_log.beneficiary_details else {'dd':"0",'mm':"0",'yyyy':"0000"}
                               dat = str(format['dd'])+"/"+str(format['mm'])+"/"+str(format['yyyy'])
                           except:
                               dat = ""
                        data[sub_log.beneficiary_id]['date_of_birth'] = dat
                        data[sub_log.beneficiary_id]['vaccines_given'] = [sub_log.vaccine_details['vaccine_dose_name']]
        detailed_data = data.values()
        if csv:
            file_name = generate_csv(list(detailed_data))
            record = {'status_code': 200,'status_msg': "Posted successfully","file_name":file_name}
        else:
            list_data = list(detailed_data)
            if list_data:
                record = {'status_code': 200, 'data':list_data}
            else:
                record = {'status_code': 404, "status_msg":"No data found.", 'data':list_data}
    except Exception as e:
        error_email.send_email({'error':str(e),'url':request.url})
        record = {'status_code': 500, "status_msg": str(e)}
    log['response'] = record
    ml_detailed_immunization_register.insert_one(log)
    return jsonify(record)


@analytics.route('/all_time_vaccine_count',methods = ['POST'])
@jwt_required
def all_time_vaccine_count():
    try:
        args = request.json
        log = {}
        log['request'] = args
        vaccine_doses = session.query(VaccineDose).filter(VaccineDose.vaccine_id.in_(tuple(args['data']))).all()
        vaccine = {}
        for vd in vaccine_doses:
            v = vd.vaccine
            str_id = str(v.name)
            if str_id in vaccine:
                vaccine[str_id]['id'].append(vd.id)
            else:
                vaccine[str_id] = {}
                vaccine[str_id]['id'] = [vd.id]
                vaccine[str_id]['name'] = v.name
                vaccine[str_id]['count'] = 0

        for vacc in vaccine.keys():
            for v_id in vaccine[vacc]['id']:
                sub_select_query = "SELECT COUNT(*) FROM immunisation_log WHERE vaccine_dose_id="+str(v_id)+" allow filtering;"
                sub_log = cassandra_client.session.execute(sub_select_query)
                vaccine[vacc]['count'] = vaccine[vacc]['count'] + sub_log[0].count

        list_data = list(vaccine.values())
        if list_data:
            record = {'status_code': 200, 'data':list_data}
        else:
            record = {'status_code': 404, "status_msg":"No data found.", 'data':list_data}
    except Exception as e:
        error_email.send_email({'error':str(e),'url':request.url})
        record = {'status_code': 500, "status_msg": str(e)}
    log['response'] = record
    ml_all_time_vaccine_count.insert_one(log)
    return jsonify(record)


@analytics.route('/vaccination_coverage',methods = ['POST'])
@jwt_required
def vaccination_coverage():
    try:
        args = request.json
        log = {}
        log['request'] = args
        year = args['year']
        vaccines = args['vaccine_doses']

        sub_select_query =  "SELECT * FROM kba.beneficiary_immunisation_tracking allow filtering;"
        sub_logs = cassandra_client.session.execute(sub_select_query)
        age_vaccines = session.query(AgeVaccine).all()
        ages = session.query(Age).all()
        response_data = {}
        age_object = {}
        for age in ages:
            age_vaccines = session.query(AgeVaccine).filter(AgeVaccine.age_id == age.id).all()
            for age_vaccine in age_vaccines:
                vaccine_dose = session.query(VaccineDose).filter(VaccineDose.id == age_vaccine.vaccine_dose_id).first()
                if vaccine_dose.id in vaccines:
                    if age.code in age_object:
                        age_object[age.code].append({'name':vaccine_dose.name})
                        response_data[vaccine_dose.name] = {"beneficiaries_deserved": 0, "beneficiaries_administered": 0}
                    else:
                        age_object[age.code] = []
                        age_object[age.code].append({'name':vaccine_dose.name})
                        response_data[vaccine_dose.name] = {"beneficiaries_deserved": 0, "beneficiaries_administered": 0}

        for sub_log in sub_logs:
            cassandra_vaccination_object = sub_log.vaccination_object
            for age in age_object.keys():
                age_vaccine_object = cassandra_vaccination_object[age]
                for vaccine_obj in age_object[age]:
                    vaccination_object = age_vaccine_object[vaccine_obj['name']]
                    vaccination_date_object = custom_functions.date_to_string(str(vaccination_object.expected_date),False)
                    if vaccination_date_object['yyyy'] in year:
                        response_data[vaccine_obj['name']]['beneficiaries_deserved'] = response_data[vaccine_obj['name']]['beneficiaries_deserved'] + 1
                        if vaccination_object.vaccine_id:
                            response_data[vaccine_obj['name']]['beneficiaries_administered'] = response_data[vaccine_obj['name']]['beneficiaries_administered'] + 1
        response = []
        for vdname in response_data.keys():
            obj = {}
            obj['name'] = vdname
            obj['beneficiaries_deserved'] = response_data[vdname]['beneficiaries_deserved']
            obj['beneficiaries_administered'] = response_data[vdname]['beneficiaries_administered']
            response.append(obj)

        if response:
            record = {'status_code': 200, 'data':response}
        else:
            record = {'status_code': 404, "status_msg":"No data found.", 'data':response}

    except Exception as e:
        #error_email.send_email({'error':str(e),'url':request.url})
        record = {'status_code': 500, "status_msg": str(e)}
    log['response'] = record
    ml_vaccination_coverage.insert_one(log)
    return jsonify(record)

@analytics.route('/male_female_count',methods = ['POST'])
@jwt_required
def male_female_count():
    try:
        args = request.json
        log = {}
        log['request'] = args
        station_id = args['station_id']
        from_str = custom_functions.obj_to_date(args['date_from']).split(" ")[0]
        to_str = custom_functions.obj_to_date(args['date_to'],extra_day=1).split(" ")[0]
        select_query =  "SELECT beneficiary_id,vaccine_dose_id FROM kba.immunisation_log WHERE \
        station_id='{}' AND current_date >= '{}' AND current_date <= '{}' allow filtering;"

        vaccine_doses = session.query(VaccineDose).all()
        vd_obj = {}
        for vd in vaccine_doses:
            vd_obj[vd.id] = vd.name

        sub_logs = cassandra_client.session.execute(select_query.format(station_id,from_str,to_str))
        result = {}
        for sub_log in sub_logs:
            r = session.query(Child).filter(Child.rch_id == sub_log.beneficiary_id).first()
            if r:
                if not vd_obj[sub_log.vaccine_dose_id] in result:
                    result[vd_obj[sub_log.vaccine_dose_id]] = {}
                    result[vd_obj[sub_log.vaccine_dose_id]]['male'] = 0
                    result[vd_obj[sub_log.vaccine_dose_id]]['female'] = 0
                    result[vd_obj[sub_log.vaccine_dose_id]]['total'] = 0
                    result[vd_obj[sub_log.vaccine_dose_id]]['dose_name'] = vd_obj[sub_log.vaccine_dose_id]

                result[vd_obj[sub_log.vaccine_dose_id]]['total'] = result[vd_obj[sub_log.vaccine_dose_id]]['total'] +1
                if r.gender.lower() == 'm':
                    result[vd_obj[sub_log.vaccine_dose_id]]['male'] = result[vd_obj[sub_log.vaccine_dose_id]]['male'] + 1
                elif r.gender.lower() == 'f':
                    result[vd_obj[sub_log.vaccine_dose_id]]['female'] = result[vd_obj[sub_log.vaccine_dose_id]]['female'] + 1

        result_list = list(result.values())
        sorted(result_list, key = lambda i: i['dose_name'])
        if result_list:
            record = {'status_code': 200, 'data':result_list}
        else:
            record = {'status_code': 404, "status_msg":"No data found.", 'data':result_list}
    except Exception as e:
        session.rollback()
        error_email.send_email({'error':str(e),'url':request.url})
        record = {'status_code': 500, "status_msg": str(e)}
    log['response'] = record
    ml_male_female_count.insert_one(log)
    return jsonify(record)


@analytics.route('/beneficiary_report',methods = ['POST'])
@jwt_required
def beneficiary_report():
    try:
        args = request.json
        log = {}
        log['request'] = args
        station_id = args['station_id']
        from_str = custom_functions.obj_to_date(args['date_from']).split(" ")[0]
        to_str = custom_functions.obj_to_date(args['date_to'],extra_day=1).split(" ")[0]
        select_query =  "SELECT beneficiary_id,vaccine_dose_id FROM kba.immunisation_log WHERE \
        station_id='{}' AND current_date >= '{}' AND current_date <= '{}' allow filtering;"

        vaccine_doses = session.query(VaccineDose).all()
        vd_obj = {}
        for vd in vaccine_doses:
            vd_obj[vd.id] = vd.name

        sub_logs = cassandra_client.session.execute(select_query.format(station_id,from_str,to_str))
        obj = {}
        for sub_log in sub_logs:
            r = session.query(Child).filter(Child.rch_id == sub_log.beneficiary_id).first()
            rch_user = session.query(RCHUser).filter(RCHUser.id == r.rch_user_id).first()
            if r and rch_user:
                if not sub_log.beneficiary_id in obj:
                    obj[sub_log.beneficiary_id] = {}
                obj[sub_log.beneficiary_id]['child_name'] = r.name
                obj[sub_log.beneficiary_id]['mother_name'] = rch_user.name
                obj[sub_log.beneficiary_id]['dob'] = custom_functions.date_to_string(r.date_of_birth)
                obj[sub_log.beneficiary_id]['address'] = rch_user.address
                obj[sub_log.beneficiary_id]['gender'] = r.gender.upper()
                obj[sub_log.beneficiary_id]['vaccine'] = vd_obj[sub_log.vaccine_dose_id] if (not ('vaccine' in obj[sub_log.beneficiary_id])) else obj[sub_log.beneficiary_id]['vaccine']+", "+vd_obj[sub_log.vaccine_dose_id]

        result_list = list(obj.values())
        if result_list:
            record = {'status_code': 200, 'data':result_list}
        else:
            record = {'status_code': 404, "status_msg":"No data found.", 'data':result_list}
    except Exception as e:
        session.rollback()
        error_email.send_email({'error':str(e),'url':request.url})
        record = {'status_code': 500, "status_msg": str(e)}
    log['response'] = record
    ml_beneficiary_report.insert_one(log)
    return jsonify(record)
