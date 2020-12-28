#!/usr/bin/env python3

import urllib.request,urllib.error

"""
helps handle server communication

"""


"""
post data 
parameter :
	url - url of post request 
	body - the data to be posted

"""

def  postData(url,body):
	request = urllib.request.Request(url,body,
							method='POST',
							headers={'Content-Type': 'application/octet-stream'})
	try:
		conn = urllib.request.urlopen(request)
		return conn.getcode()
	except urllib.error.HTTPError as e:
		return e.getcode()

"""
get data 
returns response
parameter :
	url - url of post request 
"""
def getData(url):
	request = urllib.request.Request(url,
			method='GET',
			headers={'Content-Type': 'application/octet-stream'})
	try:
		conn = urllib.request.urlopen(request)
		return conn.read()
	except urllib.error.HTTPError as e:

		return e.getcode()

