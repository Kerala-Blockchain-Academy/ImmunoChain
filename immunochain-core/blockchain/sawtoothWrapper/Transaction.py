#!/usr/bin/env python3

from sawtooth_sdk.protobuf.transaction_pb2 import TransactionHeader
from sawtooth_sdk.protobuf.transaction_pb2 import Transaction
from sawtooth_sdk.protobuf.batch_pb2 import BatchHeader
from sawtooth_sdk.protobuf.batch_pb2 import Batch
from sawtooth_sdk.protobuf.batch_pb2 import BatchList
from sawtooth_signing import create_context
from sawtooth_signing import CryptoFactory
from sawtooth_signing.secp256k1 import Secp256k1PrivateKey
import random
from .Data import Hash
from .Keys import getPrivateKey , getPublicKey 
from .Request import postData
import logging

DEFAULT_BATCH_URL ='http://127.0.0.1:8008/batches'

def getHash(data,length=512):
	return Hash(data.encode())[0:length]


"""
class for handling transaction generation by the client
"""

class Client:
	def __init__(self,familyName,familyVersion ='1.0'):
		self.familyName = familyName
		self.familyVersion = familyVersion
	"""
	sets the Transactor for conducting the transaction 
	parametes :
		keyname :- name of the transactor's keyfile
		keypath :- path of the keyfile  
	"""  
	def setTransactor(self,keyname):
		context = create_context("secp256k1")
		self.__privateKey = Secp256k1PrivateKey.from_hex(getPrivateKey(keyname))
		self.signer = CryptoFactory(context).new_signer(self.__privateKey)
		self.publicKey = self.signer.get_public_key().as_hex()
	"""
	generates the transaction 
	parameters :- 
		inputAddressList :-  list of addresses that the transaction can read from 
		outputAddressList :- list of addresses that the transaction can write to 
		raw_payload :- the data to be send with the transaction
		dependencies :- list of transaction IDs that should be commited before the current transaction
		createBatch :- True - creates a batch from the transaction
					   False - returns the transation 
	"""
	def generateTransaction(self,inputAddressList,
		outputAddressList,raw_payload, url, Dependencies = []
		,createBatch = True):
		#encode the payload
		if isinstance(raw_payload, bytes):
			payload = raw_payload
		else:
			payload = raw_payload.encode()
		#set the transaction header and serialize it to string
		header = TransactionHeader(
			signer_public_key=self.publicKey,
			family_name=self.familyName,
			family_version=self.familyVersion,
			inputs=inputAddressList,
			outputs=outputAddressList,
			dependencies=Dependencies,
			payload_sha512=Hash(payload),
			batcher_public_key=self.publicKey,
			nonce=random.random().hex().encode("utf-8")
		).SerializeToString()
		# setting the transactions
		transaction = Transaction(
			header=header,
			payload=payload,
			header_signature=self.signer.sign(header)
		)
		if createBatch :
			response = self.postAsBatch(url, [transaction])
			return response
		else:
			return transaction

	"""
	Generate and send batch to validator via the rest-api
	:parameter:
	Send_tp_restapi :- True - sends the batch to rest server / False - returns the byte form of the batch
	Transactions : the list of transactions
	url : 
	"""
	
	def postAsBatch(self, url, Transactions = []):
				# Create a BatchHeader from transactionList above
				print("posting batches", flush=True)
				header = BatchHeader(
					signer_public_key=self.publicKey,
					transaction_ids=[txn.header_signature for txn in Transactions]
				).SerializeToString()
				# Create Batch using the BatchHeader and transactionList above
				batch = Batch(
					header=header,
					transactions=Transactions,
					header_signature=self.signer.sign(header))
				# Create a Batch List from Batch above
				batch_list_bytes = BatchList(batches=[batch]).SerializeToString()
				#sending the batch to the rest api
				response = postData(url,batch_list_bytes)
				print("Transaction addresses", Transactions)
				return response