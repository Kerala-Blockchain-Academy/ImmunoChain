import sys
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '..')))
sys.path.insert(0, abspath(join(dirname(__file__), '../postgres_models')))
from sqlalchemy import *
from vaccines import Vaccine
from base import Base, Session,engine
session = Session()


class VaccineDose(Base):
    __tablename__ = 'vaccine_doses'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    vaccine_id = Column(Integer, ForeignKey(Vaccine.id))
    name = Column(String())
    time_delta = Column(Integer)  #this is in weeks

    def __init__(self, name, time_delta):
        self.name = name
        self.time_delta = time_delta


    def __repr__(self):
        return 'id: {}'.format(self.id)

Base.metadata.create_all(engine)
session.commit()
