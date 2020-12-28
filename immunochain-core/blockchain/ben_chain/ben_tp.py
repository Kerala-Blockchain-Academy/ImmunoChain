#!/usr/bin/env python3
import sys
import os
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '..')))
from sawtooth_sdk.processor.handler import TransactionHandler
from sawtoothWrapper.Processor import *
import protobuf.beneficiary_pb2 as benBuf
from sawtooth_sdk.processor.core import TransactionProcessor
class BeneficiaryTP(TransactionHandler):
	def __init__(self):
		self.familyName = "Beneficiary"

	@property
	def family_name(self):
		return self.familyName
	@property
	def family_versions(self):
		return ['1.0']
	@property
	def namespaces(self):
		return [getNamespace(self.familyName)]

	def apply(self,transaction,context):
		payloadBuf = benBuf.beneficiary()
		header,payload = unpackTransaction(transaction,payloadType="Protobuf")
		payloadBuf.ParseFromString(payload)
		address = header.outputs[0]
		action = payloadBuf.action
		Beneficiary_id_type = payloadBuf.beneficiary_id_type 
		Beneficiary_id = payloadBuf.beneficiary_id
		if action == "Add_Beneficiary":
			self.Add_Beneficiary(context,Beneficiary_id_type,Beneficiary_id,address)


	def Add_Beneficiary(self,context,Beneficiary_id_type,Beneficiary_id,address):
		Beneficiary_detail = benBuf.beneficiary(
			beneficiary_id_type = Beneficiary_id_type,
			beneficiary_id= Beneficiary_id
		).SerializeToString()
		print("Beneficiary_id", Beneficiary_id, flush=True)
		

		# Beneficiary_detail = { "Beneficiary_id_type" : Beneficiary_id_type , "Beneficiary_id" :Beneficiary_id }
		addressess =  setState(Beneficiary_detail, address, context, "Normal")

		print ("CONTEXT ****: ",context, flush=True)
		if len(addressess) <1 :
			print("Error in save to state", flush=True)
			print(addressess, flush=True)
			raise InternalError("State Error ! Cannot Set State !")
		else:
		# Generate an event on successfully setting the state
			context.add_event(
				event_type="Beneficiary/Add_Beneficiary",
				attributes=[("beneficiaryId", Beneficiary_id),("beneficiaryType", Beneficiary_id_type)])

def main():
	if len(sys.argv) < 2:
		print("Argument Missing : Validator Url ")
	else:
		deployProcessor(BeneficiaryTP,url=sys.argv[1])
		

if __name__ == '__main__':
	main()