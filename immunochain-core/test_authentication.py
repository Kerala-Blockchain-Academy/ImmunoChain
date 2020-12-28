# test cases of authentication.py
import authentication

def test_registration():
   value = authentication.registration('ABC','123','admin')
   assert value =={'result': True,'message': "User is successfully created."}

def test_registration1():
   value = authentication.registration('ABC','123','admin')
   assert value =={'result': True,'message': "Failed. User already exists."}

def test_registration2():
   value = authentication.registration('ABCD','123','admin')
   assert value =={'result': True,'message': "User is successfully created."}

def test_login():
    result = authentication.login('ABC','123')
    assert result =={'result': True,'message': "User is successfully login."}

def test_login1():
    result = authentication.login('ABC','1234')
    assert result =={'result': True,'message': "authentication failed, password incorrect."} 

