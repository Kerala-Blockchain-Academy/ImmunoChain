import sys
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '..')))
sys.path.insert(0, abspath(join(dirname(__file__), '../postgres_models')))
from sqlalchemy import *
from sqlalchemy.orm import relationship
from base import Base, Session,engine
session = Session()


class Vaccination(Base):
    __tablename__ = 'vaccinations'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    beneficiary_id = Column(String())
    beneficiary_id_type = Column(String())
    vaccine_batch_id = Column(String())
    age = Column(String())
    current_date = Column(DateTime(timezone=True))
    next_date = Column(DateTime(timezone=True))
    vaccine_dose_id = Column(Integer)
    station_id = Column(Integer)
    
    def __init__(self, beneficiary_id,beneficiary_id_type, age, vaccine_batch_id, vaccine_dose_id,station_id ,current_date=None, next_date=None):
        self.beneficiary_id = beneficiary_id
        self.beneficiary_id_type = beneficiary_id_type
        self.age = age
        self.vaccine_batch_id = vaccine_batch_id
        self.current_date = current_date
        self.next_date = next_date
        self.vaccine_dose_id = vaccine_dose_id
        self.station_id = station_id

    def __repr__(self):
        return 'id: {}'.format(self.id)

Base.metadata.create_all(engine)
session.commit()
