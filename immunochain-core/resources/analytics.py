# For an optional analytics to the data.
# Author : Deepu Shaji
# Email  : deepu.shaji@iiitmk.ac.in
# Mobile : +917356209364
# Copyright 2018@IIITMK
import sys, os
sys.path.append(os.getcwd())
import server_config
from pymongo import MongoClient
from datetime import datetime,timedelta
from flask_jwt import jwt_required
from flask_restful import reqparse, abort, Resource
from datetime import datetime
import pytz
import requests
import json

TZ = server_config.Config["TIME_ZONE"]

mongo_client = MongoClient(server_config.Config["MONGO_CONNECTION"])

class Analytics_Api(Resource):
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
        parser.add_argument('var1', type=str, required=True,
                            help="var 1 required")
        parser.add_argument('var2', type=str, required=True,
                            help="var 2 required")
        args = parser.parse_args()
        data = {}

        try:
            data['data'] = "success"
            record = {'result': data, 'status': True}
        except Exception as e:
            record = {'status': False, "message": str(e)}
        return record


    def post(self):
        """
            Documentation

            Params:
                var1: required
                var2: required

            Returns:
                JSON dict
        """
        parser = reqparse.RequestParser()
        parser.add_argument('var1', type=str, required=True,
                            help="var 1 required")
        parser.add_argument('var2', type=str, required=True,
                            help="var 2 required")
        args = parser.parse_args()

        try:
            data['data'] = "success"
            record = {'result': data, 'status': True}
        except Exception as e:
            record = {'status': False, "message": str(e)}
        return record
