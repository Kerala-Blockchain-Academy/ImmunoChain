#!/usr/bin/env python3

import hashlib
import base64
import json

"""
The file handles hashing , encoding ,decoding of data

"""

"""
returns the sha512 hash of the given data
parameter :
	data : the given data  
"""
def Hash(encodedData):
    return hashlib.sha512(encodedData).hexdigest()


"""
decode response data 
parameters :
	responseBody

"""

def decodeResponse(responseBody):
        responseBuffer = json.loads(responseBody.decode('utf-8'))
        print(base64.b64decode(responseBuffer["data"]).decode())
        return base64.b64decode(responseBuffer["data"]).decode()


