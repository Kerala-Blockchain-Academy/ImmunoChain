
#!/usr/bin/env python3
import os
import secp256k1


__HOME = os.environ['HOME']
__DEFAULTPATH = os.path.join(__HOME,".sawtooth/keys")


"""
used for handling generation and deletion of crytographic keys 

"""


"""
function to create the full sawtooth key directory if it dosent exist
parameters : 
	path : the path where the directory is to be created 

"""
def createKeyDirectory(path):
	if (path):
		os.makedirs(path)
	else:
		os.makedirs(__DEFAULTPATH)

"""
function to write data to files
parameters : 
   filepath : the file location
   data : the data to be written
"""


def writeFiles(data,filepath):
	try:
		with open(filepath,'w') as keyfile:
			keyfile.write(data)
	except IOError as e:
		print(e)

	  
"""
function to read files
parameters : 
	filepath : file location
"""
def readFiles(filepath):
	try:
		with open(filepath,'r') as keyfile:
			return keyfile.read().strip()
	except IOError as e:
		print(e)
"""
function to format the path stucture

"""

"""
to create private and public keys

parameters :
keyname : name of the key files
keypath : specify where to store the keys 

"""
def generateKeys(keyname , keypath = __DEFAULTPATH):
	if (os.path.exists(keypath) == False):
		createKeyDirectory(keypath)
	#algorithm initialisation
	keyhandle = secp256k1.PrivateKey()
	#getting the private and public key
	private_key_hex = keyhandle.private_key.hex()
	public_key_hex = keyhandle.pubkey.serialize().hex()
	#write to files
	writeFiles(private_key_hex,os.path.join(keypath,keyname+".priv"))
	writeFiles(public_key_hex,os.path.join(keypath,keyname+".pub"))


"""
get private key
parameter :
	keyname : the name of the key
	keypath : path where the key is generated

"""

def getPrivateKey(keyname,keypath = __DEFAULTPATH):
	with open(os.path.join(keypath,keyname+".priv"), "r") as file:
			return file.read().strip()
			 

"""
to get the public key
parameters :
keyname : name of the key file
privateKeyPath : specify where to store the private key 

"""
def getPublicKey(keyname,keypath = __DEFAULTPATH):
	with open(os.path.join(keypath,keyname+".pub"), "r") as file:
			return file.read().strip()
"""
to delete the keys 
parameters :
keyname : name of the key file
keypath : specify where the key is stored

"""
def deleteKeys(keyname,keypath = __DEFAULTPATH):
		os.remove(os.path.join(keypath,keyname + ".priv"))
		os.remove(os.path.join(keypath,keyname + ".pub"))
