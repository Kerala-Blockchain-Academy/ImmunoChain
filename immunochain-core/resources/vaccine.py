# For vaccine-batch details in the database.
# Author : Deepu Shaji
# Email  : deepu.shaji@iiitmk.ac.in
# Mobile : +917356209364
# Copyright 2019@IIITMK
import sys, os
sys.path.append(os.getcwd())
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '..')))
from immuno_cassandra import DBconnect
from mongo_log import *
from rabbit_queue import producer
import custom_functions
from flask_restful import reqparse, abort, Resource
from datetime import datetime
from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    get_jwt_identity)
import json
import uuid
import error_email

TZ = server_config.Config["TIME_ZONE"]

cassandra_client = DBconnect.Cassandra()
VacLogDB = DBconnect.Cassandra()
VacSubLogDB = DBconnect.Cassandra()
VacTransferLogDB = DBconnect.Cassandra()

VacLogDB.set_table('vaccine_log','(\
package_id,\
package_type_id,\
name,\
manufacturing_date,\
expiry_date,\
manufacturer_info)')

VacSubLogDB.set_table('vaccine_sub_log','(id,\
package_id, name,\
manufacturing_date,expiry_date, manufacturer_info,\
previous_uuid, dose_count,transit_loss, transit_remark,\
status, date_time, comments, previous_station_id,\
previous_station, current_station_id, current_station)')

VacTransferLogDB.set_table('vaccine_transfer_log','(id,\
vaccine_sub_id, from_station_id, from_station,\
to_station_id, to_station, comments,transit_remark, user_id, status, date_time)')
class Vaccine_Api(Resource):
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
        parser.add_argument('station_id', type=int, required=True, location='args',
                            help="Station ID is required.")
        parser.add_argument('request_type', type=str, required=True, location='args',
                            help="Send whether it is sent or confirmed data")
        args = parser.parse_args()
        try:
            data = []
            log = {}
            log['request'] = args
            sub_select_query =  "SELECT * FROM kba.vaccine_sub_log WHERE status='{}' AND current_station_id={} AND dose_count > 0 allow filtering;"
            if args['request_type'] == 'send': #STOCK OUT
                sub_logs = cassandra_client.session.execute(sub_select_query.format('received',str(args['station_id'])))
            elif args['request_type'] == 'confirm': #STOCK IN   :     When registered the first status is this.
                sub_logs = cassandra_client.session.execute(sub_select_query.format('send',str(args['station_id'])))
            for sub_log in sub_logs:
                obj = {}
                obj['status'] = sub_log.status
                obj['datetime'] = custom_functions.date_to_string(sub_log.date_time)
                obj['uuid'] = str(sub_log.id)
                obj['previous_uuid'] = str(sub_log.previous_uuid) if sub_log.previous_uuid  else None
                obj['dose_count'] = sub_log.dose_count
                obj['package_id'] = sub_log.package_id
                obj['comments'] = sub_log.comments
                obj['adjustments'] = {'doses':sub_log.transit_loss,'remarks':sub_log.transit_remark}
                obj['from_station'] = dict(sub_log.previous_station)
                obj['to_station'] = dict(sub_log.current_station)
                vaccine_select_query = "SELECT package_type_id,name,manufacturing_date,expiry_date,manufacturer_info FROM vaccine_log WHERE package_id='{}' LIMIT 1;"
                vaccine_log = cassandra_client.session.execute(vaccine_select_query.format(str(sub_log.package_id)))[0]
                obj['package_type_id'] = vaccine_log.package_type_id
                obj['name'] = vaccine_log.name
                obj['manufacturing_date'] = custom_functions.date_to_string(vaccine_log.manufacturing_date)
                obj['expiry_date'] = custom_functions.date_to_string(vaccine_log.expiry_date)
                obj['manufacturer_info'] = vaccine_log.manufacturer_info
                data.append(obj)




            record = {'status_code': 200, 'status_message':'Success', 'station_vaccine':data}

        except Exception as e:
            error_email.send_email({'error':str(e),'url':'/vaccine/get'})
            record = {'status_code': 500, 'status_message':'API failed: Internal Server Error', 'msg':str(e)}
        log['response'] = record
        ml_vaccine_get.insert_one(log)
        return record

    @jwt_required
    def post(self):
        """
            Documentation

            Params:
                Specified below.

            Returns:
                JSON dict
            Sample Request: requests.post(url='http://192.168.1.22:5000/api/vaccine', params={"batch_id":"8992KOKOK","batch_type_id":"qqq","comment":"some random comment"})
        """
        parser = reqparse.RequestParser()
        parser.add_argument('package_id', type=str, required=True,
                            help="package_id required")
        parser.add_argument('package_type_id', type=str, required=True,
                            help="package_type_id required")
        parser.add_argument('uuid', type=str, required=True,
                            help="uuid required")
        parser.add_argument('dose_count', type=str, required=True,
                            help="dose_count required")
        parser.add_argument('name', type=str, required=True,
                            help="name required")
        parser.add_argument('manufacturing_date', type=dict, required=True,
                            help="manufacturing_date required")
        parser.add_argument('expiry_date', type=dict, required=True,
                            help="expiry_date required")
        parser.add_argument('manufacturer_info', type=str, required=True,
                            help="manufacturer_info required")
        parser.add_argument('from_station', type=dict, required=True,
                            help="from_station required")
        parser.add_argument('to_station', type=dict, required=True,
                            help="to_station required")
        parser.add_argument('adjustments', type=dict)
        parser.add_argument('comments', type=str)
        parser.add_argument('previous_uuid', type=str)
        parser.add_argument('status', type=str, required=True, help="status is required")
        args = parser.parse_args()

        try:

            log = {}
            log['request'] = args
            current_user = get_jwt_identity()
            now = datetime.now()
            data = {
                'uuid':args['uuid'],
                'package_id':args['package_id'],
                'package_type_id': args['package_type_id'],
                'name': args['name'],
                'manufacturing_date': args['manufacturing_date'],
                'manufacturer_info': args['manufacturer_info'],
                'expiry_date': args['expiry_date'],
                'to_station':json.dumps(args['to_station']),
                'from_station':json.dumps(args['from_station']),
                'previous_uuid':args['previous_uuid'],
                'dose_count':args['dose_count'],
                'user_id':str(current_user),
                'adjustments':args['adjustments'] if args['adjustments'] else {'doses':0,'remarks':'auto_generated'},
                'comments': args['comments'] if args['comments'] else "nil",
                'date_time': now.strftime("%m/%d/%Y, %H:%M:%S"),
                'status': args['status']
            }
            if args['adjustments']:
                if (int(args['adjustments']['doses']) > int(data['dose_count'])):
                    return {'status_code': 400, "status_msg": "Lost count seems to be greater than dose count."}

            if args['previous_uuid'] and args['status']=="send":
                status = self.reduce_dose_count(data)
                if status != "Success":
                    return {'status_code': 400, "status_msg": status}



            self.insert_to_cassandra(data,now)

            producer.ProduceVaccineData('Add_Vaccine',data)
            record = {'status_code': 200,'status_msg': "API is successfully posted."}
        except Exception as e:
            error_email.send_email({'error':str(e),'url':'/vaccine/post'})
            record = {'status_code': 500, "status_msg": str(e)}
        log['response'] = record
        ml_vaccine_post.insert_one(log)
        return record

    def reduce_dose_count(self,data):
        vaccine_sub_log_rec = cassandra_client.session.execute('SELECT * FROM kba.vaccine_sub_log WHERE id='+str(data["previous_uuid"])+';')
        new_count = vaccine_sub_log_rec[0].dose_count - int(data['dose_count'])
        if new_count >= 0:
            cassandra_client.session.execute('UPDATE kba.vaccine_sub_log SET dose_count ='+str(new_count)+' WHERE id='+str(data["previous_uuid"])+';')
            return "Success"
        else:
            return "New Count returned as negative : "+str(new_count)

    def insert_to_cassandra(self, data, time_now):
        VacLogDB.insert_data(
            data['package_id'],
            data['package_type_id'],
            data['name'],
            custom_functions.obj_to_date(data['manufacturing_date'], False),
            custom_functions.obj_to_date(data['expiry_date'], False),
            data['manufacturer_info']
        )
        from_station_data = eval(data['from_station'])
        to_station_data = eval(data['to_station'])
        VacSubLogDB.insert_data(
            uuid.UUID(data['uuid']),
            data['package_id'],
            data['name'],
            custom_functions.obj_to_date(data['manufacturing_date'], False),
            custom_functions.obj_to_date(data['expiry_date'], False),
            data['manufacturer_info'],
            uuid.UUID(data['previous_uuid']) if data['previous_uuid'] else None,
            (int(data['dose_count']) - int(data["adjustments"]['doses'])),
            int(data["adjustments"]['doses']),
            str(data["adjustments"]['remarks']),
            data['status'],
            time_now,
            str(data['comments']),
            int(from_station_data['station_id']),
            from_station_data,
            int(to_station_data['station_id']),
            to_station_data
        )

        VacTransferLogDB.insert_data(
            uuid.uuid4(),
            uuid.UUID(data['uuid']),
            int(from_station_data['station_id']), from_station_data,
            int(to_station_data['station_id']),  to_station_data, str(data['comments']), str(data["adjustments"]['remarks']),
            data['user_id'], data['status'], time_now
        )
