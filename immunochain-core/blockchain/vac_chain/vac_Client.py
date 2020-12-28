import os
import sys
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '..')))
from sawtoothWrapper.Transaction import getHash
from sawtoothWrapper.Transaction import Client
from sawtoothWrapper.Keys import generateKeys
import string
import random
import json
sys.path.insert(0, abspath(join(dirname(__file__), '../..')))
import server_config
import protobuf.immuno_pb2 as dataBuf


VACCINE_URL = server_config.Config["VAC_RESTAPI"]+"batches"

def VaccineClient(data):
    payloadBuf = dataBuf.payload()
    # payload_str = str(data, 'utf-8')
    payloadBuf.ParseFromString(data)
    product_id_type = payloadBuf.package_type_id
    product_id = payloadBuf.package_id
    
    # payload_json = json.dumps(payload_data)
    print("payload data =", payloadBuf, flush=True)
    print("RESTAPI_URL: ", VACCINE_URL, flush=True)
    
    user = Client("Vaccine")    # name of TF 
    
    
    user_id =  'temp_user' # add a user id
    generateKeys(user_id)
    user.setTransactor(user_id)

    address = getHash("Vaccine",6) + getHash(product_id_type,10) +getHash(product_id ,54)
    print("vac address=", address)
    user.generateTransaction([address],[address],data, VACCINE_URL)
