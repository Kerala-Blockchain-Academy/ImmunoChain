import sys
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '..')))
sys.path.insert(0, abspath(join(dirname(__file__), '../postgres_models')))
from sqlalchemy import *
from base import Base, Session,engine
session = Session()

class Location(Base):
    __tablename__ = 'locations'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    name = Column(String())
    latitude = Column(Float)
    longitude = Column(Float)


    def __init__(self,name,latitude,longitude):
        self.name = name
        self.latitude = latitude
        self.longitude = longitude


    def __repr__(self):
        return 'id: {}'.format(self.id)

    def serialize(self):
        return {
            'id': self.id,
            'location_name': self.name
        }
Base.metadata.create_all(engine)
session.commit()
