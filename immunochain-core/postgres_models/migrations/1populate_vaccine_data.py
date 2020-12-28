import sys
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '..')))
from vaccine_doses import VaccineDose
from vaccines import Vaccine


from base import Base, Session,engine
Base.metadata.create_all(engine)
session = Session()

vaccines = {
    "POLIO":[{'name':"POLIO0",'weeks':6},{'name':"POLIO1",'weeks':4},{'name':"POLIO2",'weeks':4},{'name':"POLIO3",'weeks':0},{'name':"POLIO BOOSTER",'weeks':0}],
    "BCG":[{'name':"BCG",'weeks':0}],
    "HePB":[{'name':"HePB",'weeks':0}],
    "IPV":[{'name':"IPV1",'weeks':8},{'name':"IPV2",'weeks':0}],
    "PENTA":[{'name':"PENTA1",'weeks':4},{'name':"PENTA2",'weeks':4},{'name':"PENTA3",'weeks':0}],
    "MR1":[{'name':"MR1",'weeks':0}],
    "ROTA":[{'name':"ROTA1",'weeks':4},{'name':"ROTA2",'weeks':4},{'name':"ROTA3",'weeks':0}],

    "VITAA":[{'name':"VITAA1",'weeks':0},{'name':"VITAA2",'weeks':0},
    {'name':"VITAA3",'weeks':0},{'name':"VITAA4",'weeks':0},
    {'name':"VITAA5",'weeks':0},{'name':"VITAA6",'weeks':0},
    {'name':"VITAA7",'weeks':0},{'name':"VITAA8",'weeks':0},
    {'name':"VITAA9",'weeks':0}],

    "JAPANESE ENCEPHALITIS":[{'name':"JAPANESE ENCEPHALITIS1",'weeks':0},{'name':"JAPANESE ENCEPHALITIS2",'weeks':0}],
    "MMR":[{'name':"MMR",'weeks':0}],
    "DPT BOOSTER":[{'name':"DPT BOOSTER1",'weeks':0},{'name':"DPT BOOSTER2",'weeks':0}],
    "TT BOOSTER":[{'name':"TT BOOSTER1",'weeks':0},{'name':"TT BOOSTER2",'weeks':0}]
}

for vaccine_key in vaccines.keys():
    v = Vaccine(name=vaccine_key)
    session.add(v)
    session.commit()

    for dose in vaccines[vaccine_key]:
        vd = VaccineDose(name=dose['name'],time_delta=dose['weeks'])
        v.vaccine_doses.append(vd)
        session.add(vd)
        session.commit()
