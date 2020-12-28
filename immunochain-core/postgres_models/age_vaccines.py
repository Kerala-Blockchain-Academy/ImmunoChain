import sys
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '..')))
sys.path.insert(0, abspath(join(dirname(__file__), '../postgres_models')))
from sqlalchemy import *
from base import Base, Session,engine
session = Session()

class AgeVaccine(Base):
    __tablename__ = 'age_vaccines'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    age_id = Column(Integer)
    vaccine_dose_id = Column(Integer)


    def __init__(self,age_id,vaccine_dose_id):
        self.age_id = age_id
        self.vaccine_dose_id = vaccine_dose_id


    def __repr__(self):
        return 'id: {}'.format(self.id)

    def serialize(self):
        return {
            'id': self.id,
            'age': self.name
        }
Base.metadata.create_all(engine)
session.commit()
