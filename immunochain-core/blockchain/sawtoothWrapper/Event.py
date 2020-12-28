#! /usr/bin/env python3

from sawtooth_sdk.messaging.stream import Stream
from sawtooth_sdk.protobuf import events_pb2
from sawtooth_sdk.protobuf import client_event_pb2
from sawtooth_sdk.protobuf.validator_pb2 import Message




class eventHandler:
	def __init__(self,validatorUrl):
		self.stream = Stream(validatorUrl)
	
	
	def generateFilters(self):
			pass 

	def generateSubscritionRequest(self,eventTypes,deltaFilters):
		susbscriptions = []
		if(len(eventTypes) == len(deltaFilters)):
				print("same length")
				for i in range(0,len(events)):
					subscription = events_pb2.EventSubscription(
						event_type=event[i], filters = deltaFilters[i])   
					susbscriptions.append(subscription)   
				print(susbscriptions)
				subscritionRequest = client_event_pb2.ClientEventsSubscribeRequest(
						subscriptions=susbscriptions)
				return subscritionRequest
		else :
				print("Error : EventType and delta filter length mismatch ! ",flush=True)

	def listenToEvents(self,eventTypes,subsciptionRequest):
			
		print("here",eventTypes)
		message = self.stream.send(message_type=Message.CLIENT_EVENTS_SUBSCRIBE_REQUEST,
					  content=subsciptionRequest.SerializeToString()).result()
		assert message.message_tyype == Message.CLIENT_EVENTS_SUBSCRIBE_RESPONSE , "Undefined Message Responce Type"
		response = client_event_pb2.ClientEventsSubscribeResponse()
		response.ParseFromString(message.content)
		assert response.status == client_event_pb2.ClientEventsSubscribeResponse.OK , "Status : Message Responce Not Okay "		
		while True:
			streamMsg  = self.stream.receive().result()
			assert streamMsg.message_type == Message.CLIENT_EVENTS , "Stream Message Type Undefined"
				# Parse the response
			eventList = events_pb2.EventList()
			eventList.ParseFromString(streamMsg.content)
			for event in eventList:
				if(event.event_type in eventTypes):
					print("Event Of Type " + eventType + " Received",flush=True)
					print("Event : " + event,flush=True)

	def unsubscribeEvent(self):
		request = client_event_pb2.ClientEventsUnsubscribeRequest()
		msg = stream.send(Message.CLIENT_EVENTS_UNSUBSCRIBE_REQUEST,
						request.SerializeToString()).result()
		assert msg.message_type == Message.CLIENT_EVENTS_UNSUBSCRIBE_RESPONSE

		response = client_event_pb2.ClientEventsUnsubscribeResponse()
		response.ParseFromString(msg.content)
		assert response.status == client_event_pb2.ClientEventsUnsubscribeResponse.OK
		print("Evens Unsubscribed ! ",flush=True)
