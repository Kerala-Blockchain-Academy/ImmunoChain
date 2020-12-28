from flask import Flask,Blueprint, jsonify, request
from mongo_log import *
from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    get_jwt_identity
)
from rabbit_queue import producer
from custom_functions import *
import error_email
import json
from immuno_cassandra import DBconnect
import uuid

cassandra_client = DBconnect.Cassandra()
VacTransferLogDB = DBconnect.Cassandra()
VacTransferLogDB.set_table('vaccine_transfer_log','(id,\
vaccine_sub_id, from_station_id, from_station,\
to_station_id, to_station, comments,transit_remark, user_id, status, date_time)')

vaccine_manager = Blueprint('vaccine_manager', __name__)

@vaccine_manager.route('/discard_vaccine',methods = ['POST'])
@jwt_required
def discard_vaccine():
    try:
        args = request.json
        log = {}
        current_user = get_jwt_identity()
        log['request'] = args
        loss = int(args['discard_vaccine']['count'])
        loss_reason = args['discard_vaccine']['reason']
        sub_select_query =  "SELECT * FROM kba.vaccine_sub_log WHERE id="+args['batch_id']+";"
        sub_log = cassandra_client.session.execute(sub_select_query)[0]
        if sub_log:
            old_count = sub_log.dose_count
            if old_count >= loss:
                new_count =  old_count - loss
                update_query = "UPDATE kba.vaccine_sub_log SET dose_count="+str(new_count)+" WHERE id="+args['batch_id']+";"
                cassandra_client.session.execute(update_query)

                now  = datetime.now()
                dict_previous_station = dict(sub_log.previous_station)
                dict_current_station = dict(sub_log.current_station)
                data = {
                'uuid':args['batch_id'],
                'package_id':str(sub_log.package_id),
                'package_type_id': 't',
                'name': sub_log.name,
                'manufacturing_date': str(sub_log.manufacturing_date),
                'manufacturer_info': sub_log.manufacturer_info,
                'expiry_date': str(sub_log.expiry_date),
                'to_station': str(dict_previous_station),
                'from_station': str(dict_current_station),
                'previous_uuid':str(sub_log.previous_uuid),
                'dose_count':str(new_count),
                'user_id':str(current_user),
                'adjustments': {'doses':0,'remarks':'auto_generated'},
                'comments': loss_reason,
                'date_time': now.strftime("%m/%d/%Y, %H:%M:%S"),
                'status': "received"
                }

                VacTransferLogDB.insert_data(
                    uuid.uuid4(),
                    uuid.UUID(args['batch_id']),
                    int(sub_log.previous_station_id), dict_previous_station,
                    int(sub_log.current_station_id), dict_current_station, "Discard Transaction", loss_reason,
                    str(current_user), "received", now
                )
                producer.ProduceVaccineData('Add_Vaccine',data)
                record = {'status_code': 200, "status_msg": "API Posted Successfully"}
            else:
                record = {'status_code': 400, "status_msg": "Loss is greater than current count."}
        else:
            record = {'status_code': 404, "status_msg": "No Vaccine found for this ID."}
    except Exception as e:
        error_email.send_email({'error':str(e),'url':request.url})
        record = {'status_code': 500, "status_msg": str(e)}
    log['response'] = record
    ml_discard_vaccine.insert_one(log)
    return jsonify(record)
