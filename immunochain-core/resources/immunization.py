# For adding vaccination details into the database.
# Author : Deepu Shaji
# Email  : deepu.shaji@iiitmk.ac.in
# Mobile : +917356209364
# Copyright 2019@IIITMK
import sys, os
sys.path.append(os.getcwd())
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '..')))
import uuid
from postgres_models.vaccinations import Vaccination
from postgres_models.missed_vaccinations import MissedVaccination
from postgres_models.vaccine_doses import VaccineDose
from postgres_models.locations import Location
from postgres_models.stations import Station

from postgres_models.children import Child
from postgres_models.rch_users import RCHUser
from postgres_models.base import Base, Session,engine
import custom_functions
session = Session()
from mongo_log import *
import error_email
from immuno_cassandra import DBconnect
from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    get_jwt_identity
)
from flask_restful import reqparse, abort, Resource
from datetime import datetime
import json

TZ = server_config.Config["TIME_ZONE"]

cassandra_client = DBconnect.Cassandra()

def call_et():
    et1_obj = {}
    station = session.query(Station).filter(Station.code == 'ET1').first()
    et1_obj['station_name'] = station.name
    et1_obj['station_code'] = station.code
    et1_obj['station_id'] = str(station.id)
    location = session.query(Location).filter(Location.id == station.location_id).first()
    et1_obj['station_address'] = location.name
    return et1_obj

class Immunization_Api(Resource):
    @jwt_required
    def get(self):
        """
            Documentation

            Params:
                var1: required
                var2: required

            Returns:
                JSON dict
        """
        parser = reqparse.RequestParser()
        parser.add_argument('vaccine_batch_id', type=str, required=True,
                            help="Package ID is required")
        args = parser.parse_args()
        try:
            log = {}
            log['request'] = args
            package_id = args['vaccine_batch_id']
            select_query = "SELECT * FROM kba.vaccine_sub_log WHERE id={};"
            data_rec = cassandra_client.session.execute(select_query.format(package_id))
            if data_rec:
                if data_rec[0].dose_count > 0:
                    data = {}
                    data['uuid'] = str(data_rec[0].id)
                    data['date_time'] = custom_functions.date_to_string(data_rec[0].date_time)
                    data['dose_count'] = data_rec[0].dose_count
                    data['from_station'] = dict(data_rec[0].previous_station)
                    data['to_station'] = dict(data_rec[0].current_station)
                    data['manufacturer_info'] = data_rec[0].manufacturer_info
                    data['comments'] = data_rec[0].comments
                    data['adjustments'] = {'doses': data_rec[0].transit_loss, 'remarks': data_rec[0].transit_remark}
                    data['manufacturing_date'] = custom_functions.date_to_string(data_rec[0].manufacturing_date)
                    data['expiry_date'] = custom_functions.date_to_string(data_rec[0].expiry_date)
                    data['name'] = data_rec[0].name
                    data['package_id'] = data_rec[0].package_id
                    data['package_type_id'] = '1'#data_rec[0].package_type_id
                    data['previous_uuid'] = str(data_rec[0].previous_uuid)
                    data['status'] = data_rec[0].status
                    data['validation'] = True#data_rec[0].status
                    record = {'status_code': 200,'status_msg': "Success", 'data':data}
                else:
                    record = {'status_code': 404, 'status_msg': "Vaccine Count for this package is 0."}
            else:
                record = {'status_code': 404,'status_msg': "Vaccine not found."}
        except Exception as e:
            error_email.send_email({'error':str(e),'url':'/immunization/get'})
            record = {'status_code': 500,'status_msg': "API Failed.", 'msg':str(e)}
        log['response'] = record
        ml_immunisation_get.insert_one(log)
        return record

    @jwt_required
    def post(self):
        """
            Documentation

            Params:
                Specified below.

            Returns:
                JSON dict
            Sample Request: requests.post(url='http://192.168.1.22:5000/api/immunization', params={"beneficiary_id":"8992KOKOK","batch_id":"34232DDW","batch_type_id":"qqq","beneficiary_type_id":"898HBBJ","station_id":"werwer1113","medicine_id":"2","vile_image":"base encoded string"})
        """
        parser = reqparse.RequestParser()
        parser.add_argument('Age', type=dict, required=True,
                            help="vaccination_dict")
        parser.add_argument('edited', type=dict, required=True,
                            help="discarded_dict")
        parser.add_argument('BeneficiaryId', type=str, required=True,
                            help="benefeciary id")
        parser.add_argument('nextDate', type=dict, required=True,
                            help="next date")
        parser.add_argument('BeneficiaryIdType', type=str, required=True,
                            help="beneficiary type not defined")
        parser.add_argument('station_other', type=dict, required=True)
        parser.add_argument('GeoLocation', type=dict,required=True,
                            help="geo location not detailed")
        parser.add_argument('currentDate', type=dict)
        '''
        parser.add_argument('comment', type=str,required=False)
        '''
        args = parser.parse_args()
        fields = "(id,vaccine_id, vaccine_dose_id, current_date, next_date, beneficiary_id, beneficiary_details,vaccine_details,beneficiary_type, age, station_id, station_other, geo_location)"
        try:
            log = {}
            log['request'] = args
            age_object = {}
            age_vaccine_data = args["Age"]
            ages = age_vaccine_data.keys()
            child_rec = session.query(Child).filter(Child.rch_id == args["BeneficiaryId"]).first()
            rch_user = session.query(RCHUser).filter(RCHUser.id == child_rec.rch_user_id).first()
            if bool(args["currentDate"]):
                current_time = custom_functions.obj_to_date(args["currentDate"],False)
            else:
                current_time = datetime.now()

            if bool(args["nextDate"]):
                nd = custom_functions.obj_to_date(args["nextDate"]['date'],False)
            else:
                nd = None

            if not bool(args['station_other']):
                    args['station_other'] = call_et()

            if args["edited"].keys():
                self.discard_taken_vaccination(args["edited"],args['BeneficiaryId'],args["station_other"])

            if child_rec:
                cassandra_client.set_table("immunisation_log",fields)
                for age in ages:
                        age_object[age] = {}
                        vaccines = age_vaccine_data[age]
                        vaccines_keys = vaccines.keys()
                        for vaccine_name in vaccines_keys:
                            vaccine_object = vaccines[vaccine_name]
                            if bool(vaccine_object):
                                vaccine_id = vaccine_object["vaccine_package_id"] if "vaccine_package_id" in vaccine_object else None

                                vd = session.query(VaccineDose).filter(VaccineDose.name == vaccine_name).first()

                                vacc_exists = session.query(Vaccination) \
                                .filter(Vaccination.beneficiary_id==args["BeneficiaryId"]) \
                                .filter(Vaccination.vaccine_batch_id==vaccine_id)\
                                .filter(Vaccination.vaccine_dose_id==vd.id).first()

                                if vacc_exists:
                                    continue

                                if bool(args["currentDate"]) and not vaccine_id:
                                    vaccine_id = "ExternalPackageID"
                                vaccine_current_date = str(current_time)
                                vaccine_next_date = vaccine_object["next_date"] if "next_date" in vaccine_object else ""

                                age_object[age][vaccine_name] ={}


                                mv = session.query(MissedVaccination) \
                                .filter(MissedVaccination.beneficiary_id == args["BeneficiaryId"]) \
                                .filter(MissedVaccination.vaccine_dose_id == vd.id) \
                                .filter(MissedVaccination.age == age)
                                if vaccine_id:
                                    beneficiary_details = {}
                                    beneficiary_details['child_name'] = child_rec.name
                                    beneficiary_details['mother_name'] = rch_user.name
                                    beneficiary_details['date_of_birth'] = child_rec.date_of_birth.strftime("%Y-%m-%d %H:%M:%S")
                                    beneficiary_details['father_name'] = rch_user.husband_name
                                    beneficiary_details['address'] = rch_user.address
                                    beneficiary_details['sex'] = child_rec.gender

                                    vaccine_details = {}
                                    vac = vd.vaccine
                                    vaccine_details['vaccine_id'] = str(vac.id)
                                    vaccine_details['vaccine_name'] = vac.name
                                    vaccine_details['vaccine_dose_id'] = str(vd.id)
                                    vaccine_details['vaccine_dose_name'] = vd.name

                                    age_object[age][vaccine_name]['vaccine_id'] = vac.id
                                    age_object[age][vaccine_name]['vaccine_name'] = vac.name
                                    age_object[age][vaccine_name]['vaccine_dose_id'] = vd.id
                                    age_object[age][vaccine_name]['vaccine_dose_name'] = vd.name
                                    age_object[age][vaccine_name]['package_id'] = vaccine_id
                                    age_object[age][vaccine_name]['vaccination_date'] = current_time.strftime("%Y-%m-%d")


                                    cassandra_client.insert_data(uuid.uuid4(), str(vaccine_id), vd.id, vaccine_current_date,  \
                                     vaccine_next_date, args["BeneficiaryId"],beneficiary_details,\
                                     vaccine_details, args["BeneficiaryIdType"], age, str(args["station_other"]['station_id']), \
                                    eval(json.dumps(args["station_other"])),args["GeoLocation"])
                                    mvd = mv.filter(MissedVaccination.active == True).first()
                                    if mvd:
                                        mvd.active = False
                                        session.add(mvd)
                                        session.commit()

                                    v = Vaccination(
                                    beneficiary_id=args["BeneficiaryId"],
                                    beneficiary_id_type =args["BeneficiaryIdType"],
                                    age =age,
                                    vaccine_batch_id = vaccine_id,
                                    current_date=current_time,
                                    next_date= nd,
                                    station_id = int(args["station_other"]['station_id']),
                                    vaccine_dose_id = vd.id)

                                    session.add(v)
                                    session.commit()
                                else:
                                    v = session.query(Vaccination) \
                                    .filter(Vaccination.beneficiary_id==args["BeneficiaryId"]) \
                                    .filter(Vaccination.age ==age) \
                                    .filter(Vaccination.vaccine_dose_id == vd.id)
                                    if not v.first():
                                        mv = MissedVaccination(
                                        beneficiary_id=args["BeneficiaryId"],
                                        beneficiary_id_type =args["BeneficiaryIdType"],
                                        age=age,
                                        reason = vaccine_object["reason"] if "reason" in vaccine_object and vaccine_object['reason'] else "Automated Reason",
                                        current_date=current_time,
                                        next_date= nd,
                                        station_id = int(args["station_other"]['station_id']),
                                        vaccine_dose_id = vd.id)

                                        nxt = custom_functions.obj_to_date(vaccine_object["next_vaccine_date"],False)

                                        age_object[age][vaccine_name]['expected_date'] = nxt.strftime("%Y-%m-%d")

                                        session.add(mv)
                                        session.commit()
                                if "vaccine_batch_id" in vaccine_object and vaccine_object['vaccine_batch_id']:#.replace('{"','{').replace(', "',',').replace('":',':')
                                    beneficiary_dict = {"beneficiary_id":args["BeneficiaryId"],"vaccine_dose_id":vd.id,"age":age,"time_rec":current_time.strftime("%H:%M:%S")}
                                    vaccine_dict = {"vaccine_id":str(vaccine_object["vaccine_batch_id"]),"time_rec":current_time.strftime("%H:%M:%S")}
                                    batch_imm_log = "UPDATE kba.batch_immunisation_log SET name='{}',              \
                                    beneficiary_no={}, vaccine_no={}, station_other={},   \
                                    beneficiary_list=beneficiary_list+[{}],  vaccine_list=vaccine_list+[{}]     \
                                    WHERE package_id='{}' AND date_rec='{}' AND station_id='{}';"

                                    vaccine_sub_log_rec = cassandra_client.session.execute("SELECT beneficiary_no,vaccine_no FROM kba.batch_immunisation_log WHERE package_id='{}' AND date_rec='{}' AND station_id='{}';"\
                                    .format(vaccine_id, current_time.strftime("%Y-%m-%d"), args["station_other"]['station_id']))

                                    if vaccine_sub_log_rec:
                                        beneficiary_no = vaccine_sub_log_rec[0].beneficiary_no + 1
                                        vaccine_no = vaccine_sub_log_rec[0].vaccine_no + 1
                                    else:
                                        beneficiary_no = 1
                                        vaccine_no = 1

                                    beneficiary_obj_replica = json.dumps(beneficiary_dict).replace('{"','{').replace(', "',',').replace('":',':').replace('"',"'")
                                    vaccine_obj_replica = json.dumps(vaccine_dict).replace('{"','{').replace(', "',',').replace('":',':').replace('"',"'")

                                    vaccine_sub_log_rec = cassandra_client.session.execute('SELECT * FROM kba.vaccine_sub_log WHERE id='+str(vaccine_object["vaccine_batch_id"])+';')
                                    new_count = vaccine_sub_log_rec[0].dose_count - 1
                                    cassandra_client.session.execute('UPDATE kba.vaccine_sub_log SET dose_count ='+str(new_count)+' WHERE id='+str(vaccine_object["vaccine_batch_id"])+';')


                                    cassandra_client.session.execute(batch_imm_log.format(vd.vaccine.name,str(beneficiary_no),str(vaccine_no),\
                                    eval(json.dumps(args["station_other"])), beneficiary_obj_replica, vaccine_obj_replica\
                                     ,vaccine_id, current_time.strftime("%Y-%m-%d"), args["station_other"]['station_id']))

                self.update_beneficiary_immunisation_tracking(child_rec.rch_id, age_object,args["nextDate"])
                record = {'status_code': 200,'status_msg': "API is successfully posted."}
            else:
                record = {'status_code': 404,'status_msg': "Child Record Not found."}
        except Exception as e:
            error_email.send_email({'error':str(e),'url':'/immunization/post'})
            record = {'status_code': 500, "status_msg": str(e)}
        log['response'] = record
        ml_immunisation_post.insert_one(log)
        return record

    def discard_taken_vaccination(self, args_data,ben_id,station):
        age_vaccine_data = args_data
        ages = age_vaccine_data.keys()

        record = cassandra_client.session.execute("SELECT JSON * FROM kba.beneficiary_immunisation_tracking WHERE beneficiary_id='"+ben_id+"';")[0]
        data = {}
        data['beneficiary_id'] = str(ben_id)
        data['vaccination_object'] = json.loads(record.json)['vaccination_object']

        for age in ages:
            for vaccine in age_vaccine_data[age].keys():
                vaccine_obj = age_vaccine_data[age][vaccine]
                # Removing from immunisation_log
                vac_log = cassandra_client.session.execute("SELECT id FROM kba.immunisation_log WHERE beneficiary_id='{}' and vaccine_id='{}' ALLOW FILTERING;".format(ben_id,vaccine_obj['vaccine_package_id']))[0]
                cassandra_client.session.execute("DELETE FROM kba.immunisation_log WHERE id={};".format(str(vac_log.id)))
                # Removing from vaccinations table.
                print([ben_id,vaccine_obj['vaccine_package_id']],flush=True)
                session.query(Vaccination) \
                .filter(Vaccination.beneficiary_id==ben_id) \
                .filter(Vaccination.vaccine_batch_id==vaccine_obj['vaccine_package_id']).delete()
                session.commit()
                # Incrementning dose count.
                vaccine_sub_log_rec = cassandra_client.session.execute('SELECT * FROM kba.vaccine_sub_log WHERE id='+str(vaccine_obj["vaccine_batch_id"])+';')
                new_count = vaccine_sub_log_rec[0].dose_count + 1
                cassandra_client.session.execute('UPDATE kba.vaccine_sub_log SET dose_count ='+str(new_count)+' WHERE id='+str(vaccine_obj["vaccine_batch_id"])+';')
                # Changing beneficiary tracking
                vd_id = data['vaccination_object'][age][vaccine]['vaccine_dose_id']
                vac_date = data['vaccination_object'][age][vaccine]['vaccination_date']
                data['vaccination_object'][age][vaccine]['vaccine_id'] = 0
                data['vaccination_object'][age][vaccine]['vaccine_name'] = ""
                data['vaccination_object'][age][vaccine]['vaccine_dose_id'] = 0
                data['vaccination_object'][age][vaccine]['vaccine_dose_name'] = ""
                data['vaccination_object'][age][vaccine]['package_id'] = ""
                #updating batch immunisation log
                batch_immunisation_log = cassandra_client.session.execute("SELECT JSON * FROM kba.batch_immunisation_log WHERE package_id='{}' AND date_rec='{}' AND station_id='{}';"\
                .format(vaccine_obj['vaccine_package_id'],str(vac_date), station['station_id']))[0]
                json_rec = json.loads(batch_immunisation_log.json)
                json_rec['vaccine_no'] = json_rec['vaccine_no'] - 1
                json_rec['beneficiary_no'] = json_rec['beneficiary_no'] - 1
                bls = []
                for bl in json_rec['beneficiary_list']:
                    if not (bl['beneficiary_id'] == ben_id and bl['vaccine_dose_id'] == vd_id):
                        bls.append(bl)
                json_rec['beneficiary_list'] = bls

                vls = []
                lock = True
                for vl in json_rec['vaccine_list']:
                    if lock and (vl['vaccine_id'] == vaccine_obj["vaccine_batch_id"]):
                        lock = False
                        continue
                    vls.append(vl)
                json_rec['vaccine_list'] = vls
                cassandra_client.session.execute("INSERT INTO kba.batch_immunisation_log JSON '"+json.dumps(json_rec)+"';")

        cassandra_client.session.execute("INSERT INTO kba.beneficiary_immunisation_tracking JSON '"+json.dumps(data)+"';")
        return ""
    def update_beneficiary_immunisation_tracking(self,rch_id, age_object, next_date):
        try:
            record = cassandra_client.session.execute("SELECT JSON * FROM kba.beneficiary_immunisation_tracking WHERE beneficiary_id='"+rch_id+"';")[0]
            data = {}
            data['beneficiary_id'] = str(rch_id)
            data['vaccination_object'] = json.loads(record.json)['vaccination_object']
            for age_obj_key in age_object.keys():
                for polio_name_key in age_object[age_obj_key].keys():
                    y = age_object[age_obj_key][polio_name_key]
                    if 'vaccine_id' in y:
                        y['expected_date'] = data['vaccination_object'][age_obj_key][polio_name_key]['expected_date']
                        data['vaccination_object'][age_obj_key][polio_name_key] = y
                    else:
                        data['vaccination_object'][age_obj_key][polio_name_key] = y

            if bool(next_date):
                age = next_date['age']
                date = str(next_date['date']['yyyy'])+'-'+str(next_date['date']['mm']).zfill(2)+'-'+str(next_date['date']['dd']).zfill(2)
                for vac_obj_key in data['vaccination_object'][age].keys():
                    data['vaccination_object'][age][vac_obj_key]['expected_date'] = date

            cassandra_client.session.execute("INSERT INTO kba.beneficiary_immunisation_tracking JSON '"+json.dumps(data)+"';")
            return "ok"
        except Exception as e:
            return "failed"
