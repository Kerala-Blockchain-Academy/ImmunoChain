import sys
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '..')))
from vaccine_doses import VaccineDose
from ages import Age
from age_vaccines import AgeVaccine


from base import Base, Session,engine
Base.metadata.create_all(engine)
session = Session()

vaccines = [

        {
          "age" : '0M',
          "weeks": 0,
          'name': '24 hours',
          "vaccines" : ['BCG','POLIO0','HePB']

        },
        {
          "age" : '1_5M',
          "weeks": 7,
          'name': '7 weeks',
          "vaccines" : ['POLIO1','IPV1','PENTA1','ROTA1']

        },
        {
          "age" : '2_5M',
          "weeks": 11,
          'name': '11 weeks',
          "vaccines" : ['POLIO2','PENTA2','ROTA2']

        },
        {
          "age" : '3_5M',
          "weeks": 15,
          'name': '15 weeks',
          "vaccines" : ['POLIO3','IPV2','PENTA3','ROTA3']

        },
        {
          "age" : '9M',
          "weeks": 39,
          'name': '39 weeks',
          "vaccines" : ['MR1','VITAA1','JAPANESE ENCEPHALITIS1']

        },
        {
          "age" : '16to24M',
          "weeks": 70,
          'name': '1 year',
          "vaccines" : ['POLIO BOOSTER','VITAA2','JAPANESE ENCEPHALITIS2','MMR','DPT BOOSTER1']

        },
        {
          "age" : '24M',
          "weeks": 104,
          'name': '2 years',
          "vaccines" : ['VITAA3']

        },
        {
          "age" : '30M',
          "weeks": 130,
          'name': '2.5 years',
          "vaccines" : ['VITAA4']

        },
        {
          "age" : '36M',
          "weeks": 156,
          'name': '3 years',
          "vaccines" : ['VITAA5']

        },
        {
          "age" : '42M',
          "weeks": 182,
          'name': '3.5 years',
          "vaccines" : ['VITAA6']

        },
        {
          "age" : '48M',
          "weeks": 208,
          'name': '4 years',
          "vaccines" : ['VITAA7']

        },
        {
          "age" : '54M',
          "weeks": 234,
          'name': '4.5 years',
          "vaccines" : ['VITAA8']

        },
        {
          "age" : '60M',
          "weeks": 260,
          'name': '5 years',
          "vaccines" : ['VITAA9']

        },
        {
          "age" : '60to72M',
          "weeks": 261,
          'name': '5 years',
          "vaccines" : ['DPT BOOSTER2']

        },
        {
          "age" : '120M',
          "weeks": 521,
          'name': '10 years',
          "vaccines" : ['TT BOOSTER1']

        },
        {
          "age" : '192M',
          "weeks": 834,
          'name': '16 years',
          "vaccines" : ['TT BOOSTER2']

        }
      ]


for vac in vaccines:
    v = Age(name=vac['name'],code=vac['age'],weeks=vac["weeks"])
    session.add(v)
    session.commit()

    for dose in vac['vaccines']:
        vd = session.query(VaccineDose).filter(VaccineDose.name == dose).first()
        av = AgeVaccine(age_id=v.id,vaccine_dose_id=vd.id)
        session.add(av)
        session.commit()
