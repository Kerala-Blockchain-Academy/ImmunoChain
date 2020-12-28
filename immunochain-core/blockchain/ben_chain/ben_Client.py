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
import protobuf.beneficiary_pb2 as benBuf


BENEFICIARY_URL = server_config.Config["BEN_RESTAPI"]+"batches"


def BeneficiaryClient(data):
    payloadBuf = benBuf.beneficiary()
    payloadBuf.ParseFromString(data)
    id_type = payloadBuf.beneficiary_id_type
    id = payloadBuf.beneficiary_id

    # payload_json = json.dumps(payload_data)
    print("RESTAPI_URL: ", BENEFICIARY_URL, flush=True)
    

    user = Client("Beneficiary")    # name of TF 
    
    
    user_id =  'temp_user' # add a user id
    generateKeys(user_id)
    user.setTransactor(user_id)
    
    
    address = getHash("Beneficiary",6) +getHash(id_type,10) +getHash(id ,54)
    print("ben address=", address, flush=True)
    user.generateTransaction([address],[address],data, BENEFICIARY_URL)
    