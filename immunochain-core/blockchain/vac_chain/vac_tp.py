#!/usr/bin/env python3

import sys
import os
from os.path import dirname, join, abspath
import json
sys.path.insert(0, abspath(join(dirname(__file__), '..')))
from sawtooth_sdk.processor.handler import TransactionHandler
from sawtoothWrapper.Processor import *
import protobuf.immuno_pb2 as dataBuf
from sawtooth_sdk.processor.core import TransactionProcessor

class VaccineTP(TransactionHandler):
	def __init__(self):
		self.familyName = "Vaccine"

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
		payloadBuf = dataBuf.payload()
		header,payload = unpackTransaction(transaction,payloadType="Protobuf")
		payloadBuf.ParseFromString(payload)
		address = header.outputs[0]
		action = payloadBuf.action
		uuid = payloadBuf.uuid
		package_id = payloadBuf.package_id
		package_type_id = payloadBuf.package_type_id
		name = payloadBuf.name
		manufacturing_date = payloadBuf.manufacturing_date
		expiry_date = payloadBuf.expiry_date
		manufacturer_info = payloadBuf.manufacturer_info
		from_station = payloadBuf.from_station
		to_station = payloadBuf.to_station
		previous_uuid = payloadBuf.previous_uuid
		dose_count = payloadBuf.dose_count
		adjustments = payloadBuf.adjustments
		comments = payloadBuf.comments
		user_id = payloadBuf.user_id
		received_date_time = payloadBuf.received_date_time
		status = payloadBuf.status
		if action == "Add_Vaccine":
			self.Add_Vaccine(context,uuid,package_id,package_type_id,previous_uuid,dose_count,user_id,received_date_time,status,address,name,manufacturing_date,expiry_date,manufacturer_info,from_station,to_station,adjustments,comments)

	def Add_Vaccine(self,context,uuid,package_id,package_type_id,previous_uuid,dose_count,user_id,received_date_time,status,address,name,manufacturing_date,expiry_date,manufacturer_info,from_station,to_station,adjustments,comments):
		print("----------------------------------------------------")
		vaccine_detail = dataBuf.vaccine()
		data = getState(address,context,format="protobuf")
		print("data",data, flush=True)
		if(data == None):
			uuids = {}
			uuids[uuid] = {
				"doseCount":dose_count,
				"userID":user_id,
				"receivedTime":received_date_time,
				"status":status,
				"previous_uuid":previous_uuid,
				"package_id":package_id,
				"package_type_id":package_type_id,
				"name":name,
				"manufacturing_date":manufacturing_date,
				"expiry_date":expiry_date,
				"manufacturer_info":manufacturer_info,
				"from_station":from_station,
				"to_station":to_station,
				"adjustments":adjustments,
				"comments":comments
			}
			vaccine_detail.uuids = json.dumps(uuids,sort_keys=True)
			print("vaccine_detail",vaccine_detail,flush=True)
		if(data != None):
				vaccine_detail.ParseFromString(data)
				uuids = json.loads(vaccine_detail.uuids)
				uuids[uuid] = {
				"doseCount":dose_count,
				"userID":user_id,
				"receivedTime":received_date_time,
				"status":status,
				"previous_uuid":previous_uuid,
				"package_id":package_id,
				"package_type_id":package_type_id,
				"name":name,
				"manufacturing_date":manufacturing_date,
				"expiry_date":expiry_date,
				"manufacturer_info":manufacturer_info,
				"from_station":from_station,
				"to_station":to_station,
				"adjustments":adjustments,
				"comments":comments}
				vaccine_detail.uuids = json.dumps(uuids,sort_keys=True)
			# vaccine_detail = { "vaccine_id_type" : vaccine_id_type ,  "Vaccine_id" : vaccine_id}
		addressess =  setState(vaccine_detail.SerializeToString(),address,context,format="protobuf")
		if len(addressess) <1 :
				print("addresses: ", addressess, flush=True)
				raise InternalError("State Error ! Cannot Set State !")
		# else:
		# 	# Generate an event on successfully setting the state
		# 	context.add_event(
		# 			event_type="Vaccine/Add_Vaccine",
		# 			attributes=[("uuid", uuid),("package_id", package_id),("package_type_id",package_type_id),("name",name),("to_station",to_station),("from_station",from_station),
		# 			("manufacturing_date",manufacturing_date),("previous_uuid",previous_uuid),("dose_count",dose_count),("user_id",user_id),("received_date_time",received_date_time),
		# 			("expiry_date",expiry_date),("manufacturer_info",manufacturer_info),("adjustments",adjustments),("comments",comments),("status",status)])


def main():
	if len(sys.argv) < 2:
		print("Argument Missing : Validator Url ",flush=True)
	else:
		deployProcessor(VaccineTP,url=sys.argv[1])
		

if __name__ == '__main__':
	main()