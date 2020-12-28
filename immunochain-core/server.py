import os
import pyqrcode
import io
import base64
from datetime import timedelta
from flask import Flask,jsonify, request, Response
from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    jwt_refresh_token_required, create_refresh_token,
    get_jwt_identity
)
import json
from flask_cors import CORS
from flask_restful import Api
from resources.analytics import Analytics_Api
from resources.vaccine import Vaccine_Api
from resources.immunization import Immunization_Api
from data_analytics import analytics
from rch_book import rch
from dashboard import dashboard
from vaccine_manager import vaccine_manager
from mongo_log import *
import error_email

TZ = server_config.Config["TIME_ZONE"]

class User(object):
    def __init__(self, id):
        self.id = id

# Create Flask App
app = Flask(__name__)
app.secret_key = os.getenv('APP_SECRET_KEY', 'ThisIsNotASecret')
app.config['JWT_SECRET_KEY'] = 'Some secrets.'  # Change this!
jwt = JWTManager(app)

import authentication
app.register_blueprint(analytics)
app.register_blueprint(rch)
app.register_blueprint(dashboard)
app.register_blueprint(vaccine_manager)
#AUTHENTICATION AND USER REGISTRATION  #####################################################

@app.route('/register',methods = ['POST'])
@jwt_required
def register():
    try:
        json_data = request.get_json()
        log = {}
        log['request'] = json_data

        user = authentication.registration(json_data["username"], \
        json_data["password"] , json_data["name"],json_data["roles"], json_data["phone"], \
        json_data["email"], json_data['stations'])

        if user["result"]:
            record = {'status_code': user['code'],'status_msg': user["message"]}
        else:
            record = {'status_code': user['code'],'status_msg': user["message"]}
    except Exception as e:
        error_email.send_email({'error':str(e),'url':request.url})
        record = {'status_code': 500, "status_msg": str(e)}

    log['response'] = record
    ml_register.insert_one(log)
    return jsonify(record)

@app.route('/otp_login', methods=['POST'])
def otp_login():
    try:
        json_data = request.get_json()
        log = {}
        log['request'] = json_data
        response = authentication.otp_login(json_data["pregnancy_id"],json_data["phone"])
        if response["result"]:
            record = {'status_code': response['code'],'status_msg': response["message"]}
        else:
            record = {'status_code': response['code'],'status_msg': response["message"]}
    except Exception as e:
        error_email.send_email({'error':str(e),'url':request.url})
        record = {'status_code': 500, "status_msg": str(e)}
    log['response'] = record
    ml_otp_login.insert_one(log)
    return jsonify(record)

@app.route('/otp_login_validation', methods=['POST'])
def otp_login_validation():
    try:
        json_data = request.get_json()
        log = {}
        log['request'] = json_data
        response, user_id = authentication.otp_login_validation(json_data["pregnancy_id"], json_data["otp"])
        if response["result"]:

            return jsonify({'status_code': response['code'],'role':response["roles"],'access_token':response["access_token"],'refresh_token':response['refresh_token'], 'uid': response["uid"], 'rch_ids': response["rch_ids"]}), 200
        else:
            record = {'status_code': response['code'],'status_msg': response["message"]}
    except Exception as e:
        error_email.send_email({'error':str(e),'url':request.url})
        record = {'status_code': 500, "status_msg": str(e)}
    log['response'] = record
    ml_otp_login_validation.insert_one(log)
    return jsonify(record)

@app.route('/qr_code_generator', methods=['POST'])
def qr_gen():
    try:
        json_data = request.get_json()
        log = {}
        log['request'] = json_data
        data_hash = {}
        data_hash[json_data["key"]]=json_data["data"]
        str_data_hash = json.dumps(data_hash)
        str_data_hash = str_data_hash.replace("'",'"')
        c = pyqrcode.create(str_data_hash)
        s = io.BytesIO()
        c.png(s,scale=6)
        encoded = base64.b64encode(s.getvalue()).decode("ascii")
        record = {'image_string':encoded,'status_code':200}
    except Exception as e:
        error_email.send_email({'error':str(e),'url':request.url})
        record = {'status_code': 500, "status_msg": str(e)}
    log['response'] = record
    ml_qr_code_generator.insert_one(log)
    return jsonify(record)

@app.route('/login', methods=['POST'])
def login():
    try:
        json_data = request.get_json()
        log = {}
        log['request'] = json_data
        response, user_id = authentication.login(json_data["username"], json_data["password"])
        if response["result"]:
            return jsonify({'status_code': response['code'],'user_name':response['username'],'role':response["roles"],'stations':response['stations'],'access_token':response["access_token"],'refresh_token':response["refresh_token"]}), 200
        else:
            record = {'status_code': response['code'],'status_msg': response["message"]}
    except Exception as e:
        error_email.send_email({'error':str(e),'url':request.url})
        record = {'status_code': 500, "status_msg": str(e)}
    log['response'] = record
    ml_login.insert_one(log)
    return jsonify(record)

@app.route('/refresh', methods=['POST'])
@jwt_refresh_token_required
def refresh():
    json_data = request.get_json()
    log = {}
    log['request'] = json_data
    current_user = get_jwt_identity()
    s = 401
    try:
        if authentication.refresh_token_validity(current_user, request.headers['Authorization']):
            s = 200
            ret = {
                'status_code': 200,
                'access_token': create_access_token(identity=current_user,expires_delta=timedelta(seconds=server_config.Config["ACCESS_TOKEN_EXPIRY_TIME"]))
            }
        else:
            ret = {
                'status_code': 400,
                'status_msg': "User is logged in at some other device."
            }
    except Exception as e:
        error_email.send_email({'error':str(e),'url':request.url})
        s = 200
        ret = {
        'status_code': 500,
        "status_msg": str(e)
        }
    log['response'] = ret
    ml_refresh.insert_one(log)
    return jsonify(ret), s
#############################################################################################

@app.route("/get_csv", methods=['GET'])
@jwt_required
def getPlotCSV():
    args = request.args
    log = {}
    log['request'] = args
    ml_get_csv.insert_one(log)
    try:
        with open(server_config.Config["CSV_PATH"]+args['file_name']) as fp:
             csv = fp.read()
        return Response(
            csv,
            mimetype="text/csv",
            headers={"Content-disposition":
                     "attachment; filename="+args['file_name']})
    except Exception as e:
        error_email.send_email({'error':str(e),'url':request.url})
        return jsonify({'status_code': 500, 'status_msg': str(e)})

@app.route('/get_user_details', methods=['GET'])
@jwt_required
def protected():
    # Access the identity of the current user with get_jwt_identity
    try:
        current_user = get_jwt_identity()
        res = authentication.get_user_details(current_user)
        return jsonify({'status_code': res['code'],'status_msg': res['msg'],'data': res['data']})
    except Exception as e:
        error_email.send_email({'error':str(e),'url':request.url})
        return jsonify({'status_code': 500,'status_msg': str(e)})

# Add our APIs
api = Api(app)
api.add_resource(Analytics_Api, '/api/analytics')
api.add_resource(Vaccine_Api, '/api/vaccine')
api.add_resource(Immunization_Api, '/api/immunization')

# Enable cross origin requests
cors = CORS(app, resources={r"/*": {"origins": "*"}})


def run_server(host=server_config.Config["APP_URL_HOST"], port=server_config.Config["APP_URL_PORT"], debug=True):
    msg = ("-----------------------------------------------"
            "\n\n\t\tPlease use HTTPS!\n\n"
            "See Let's Encrypt (https://letsencrypt.org/)\n"
            "for getting a free TSL\n\n"
            "-----------------------------------------------")
    print(msg)
    app.run(host=host, port=port, debug=debug)


if __name__ == '__main__':
    run_server()
