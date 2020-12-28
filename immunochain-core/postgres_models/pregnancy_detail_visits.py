
import sys
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '..')))
sys.path.insert(0, abspath(join(dirname(__file__), '../postgres_models')))
from sqlalchemy import *
from base import Base, Session,engine
session = Session()

class PregnancyDetailVisit(Base):
    __tablename__ = 'pregnancy_detail_visits'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    pregnancy_detail_id = Column(Integer)
    visit_no = Column(Integer)
    ifa = Column(Integer)
    hb = Column(Float)
    urine_albumin = Column(Float)
    week = Column(Integer)
    weight = Column(Float)
    edema_on_legs = Column(String())
    blood_pressure =  Column(Float)
    visit_date = Column(Date)


    def __init__(self, pregnancy_detail_id, visit_no, ifa, \
    hb, urine_albumin, week, weight, edema_on_legs,blood_pressure,visit_date):
        self.pregnancy_detail_id =pregnancy_detail_id
        self.visit_no = visit_no
        self.ifa = ifa
        self.hb = hb
        self.urine_albumin =urine_albumin
        self.week = week
        self.weight = weight
        self.edema_on_legs = edema_on_legs
        self.blood_pressure = blood_pressure
        self.visit_date = visit_date

    def __repr__(self):
        return 'id: {}'.format(self.id)

    def serialize(self):
        return {
            'id': self.id
        }
Base.metadata.create_all(engine)
session.commit()
