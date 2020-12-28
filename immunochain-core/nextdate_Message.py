import server_config
import requests

from datetime import timedelta
from datetime import datetime
import json
from datetime import date
from dateutil.relativedelta import relativedelta
from immuno_cassandra import DBconnect
from postgres_models.base import Session, engine, Base
from postgres_models.children import Child
from postgres_models.pregnancy_details import PregnancyDetail
from postgres_models.rch_users import RCHUser
from rabbit_queue import producer


Base.metadata.create_all(engine)
session = Session()
cassandra_client = DBconnect.Cassandra()

def getDate(vaccineTuple):
    date = vaccineTuple[5]
    return date

def getVaccines(vaccineDict):
    dates = []
    seventhDay  = date.today() + relativedelta(days=+7)
    seventhDayFormat = str(seventhDay.year) +"-"+'{:02d}'.format(seventhDay.month)+"-"+str(seventhDay.day)
    vaccines = vaccineDict.keys()
    for vaccine in vaccines:
        Date = getDate(vaccineDict[vaccine])
        if(str(Date) == seventhDayFormat):
            dates.append(Date)
        else:
            print("No Valid dates found")
    return dates



def getDays(dataRow):
    validDates = []
    months = dataRow.keys()
    for month in months:
        validDates +=  getVaccines(dict(dataRow[month]))
    return validDates

def fetchData():
     seventhDay  = date.today() + relativedelta(days=+7)
     seventhDayFormat = str(seventhDay.year) +"-"+str(seventhDay.month)+"-"+str(seventhDay.day)
     query = "SELECT * FROM kba.beneficiary_immunisation_tracking;"
     benificaryData = {}
     for row in cassandra_client.session.execute(query):
            benificaryData[row[0]] = getDays(row[1])
     benIDs = benificaryData.keys()
     for ID in benIDs:
        if(benificaryData[ID] != []):
            RchId= session.query(Child).filter(Child.rch_id == str(ID)).first()
            RchIdFil = RchId.rch_user_id
            Rch_rec = session.query(RCHUser).filter(RCHUser.id == RchIdFil).first()
            Rch_PhoneNum = Rch_rec.phone_no_1
            Rch_ChildName = RchId.name
            if(Rch_PhoneNum!=""):
                if(Rch_ChildName!=""):
                    message = "Reminder: Next date of vaccination for "+Rch_ChildName+" is : "+str(seventhDay)
                else:
                    message = "Reminder: Next date of vaccination for your child with RCH number "+RchIdFil+" is : "+str(seventhDay)
            send_sms(Rch_PhoneNum,message)

def send_sms(phonenum, message):
        try:
            data = {
            'rch_phonenumber': phonenum,
            'message': message
            }

            producer.NextDateMessage('send_Message',data)
        except Exception as e:
            print(str(e))


fetchData()
