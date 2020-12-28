import sys
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '..')))
sys.path.insert(0, abspath(join(dirname(__file__), '../postgres_models')))
from sqlalchemy import *
from sqlalchemy.orm import relationship
from base import Base, Session,engine
session = Session()


class Vaccine(Base):
    __tablename__ = 'vaccines'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    vaccine_doses = relationship("VaccineDose",backref="vaccine")
    name = Column(String())


    def __init__(self, name):
        self.name = name


    def __repr__(self):
        return 'id: {}'.format(self.id)

Base.metadata.create_all(engine)
session.commit()
