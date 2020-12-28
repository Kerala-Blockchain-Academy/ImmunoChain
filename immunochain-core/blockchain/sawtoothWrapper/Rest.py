#!/usr/bin/env python3

import urllib.request
from .Request import getData
import json
from .Data import decodeResponse


"""
function to get state data using address 
parameters : 
    address - state address

"""

def getStatesByAddress(address):
        response = getData('http://127.0.0.1:8008/state/' + address)
        return decodeResponse(response)

