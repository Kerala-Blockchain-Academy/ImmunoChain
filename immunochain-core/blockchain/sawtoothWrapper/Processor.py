#!/usr/bin/env python3

from sawtooth_sdk.processor.handler import TransactionHandler
from sawtooth_sdk.processor.exceptions import InvalidTransaction
from sawtooth_sdk.processor.exceptions import InternalError
from sawtooth_sdk.processor.core import TransactionProcessor
import json
from .Transaction import getHash

#DEFAULTURL ='tcp://localhost:4004'

#DEFAULTURL ='tcp://validator-1:4004'

"""
functions for handling the transaction 

"""

def getNamespace(familyname):
	return getHash(familyname,6)

"""
function to deploy the processor 
parameters : 
	TP - the class that defines the transaction processor
	url - url of the validator
"""

def deployProcessor(Class,url):
	processor = TransactionProcessor(url)
	handler = Class()
	processor.add_handler(handler)
	processor.start()		

"""
function to get the state data using context
parameters :
	address :- state address
	context
	format :- 
		JSON - for json format
		proto - for protobuf
"""
def getState(address,context,format="JSON"):
	current_entry = context.get_state([address])
	if(current_entry == [] or current_entry =='' or current_entry == None):
		return None
	else :
			if(format == "protobuf"):
					return current_entry[0].data
			else:
					return json.loads((current_entry[0].data).decode())
			

"""
function to set the state data using context
parameters :
	data :- the new data 
	address :- state address
	context
"""
def setState(data,address,context,format="JSON"):
	if(format=="JSON"):
		return context.set_state({address : json.dumps(data).encode()})
	else:
		return context.set_state({address : data})

def unpackTransaction(transaction,payloadType="CommaSeperated"):
	header = transaction.header
	signer_public_key = header.signer_public_key
	if(payloadType == "CommaSeperated"):
		payload = transaction.payload.decode().split(",")
	else :
		payload = transaction.payload
	return header,payload
