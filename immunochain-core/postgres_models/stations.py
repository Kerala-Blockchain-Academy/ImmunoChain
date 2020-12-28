import sys
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '..')))
sys.path.insert(0, abspath(join(dirname(__file__), '../postgres_models')))
from sqlalchemy import *
from base import Base, Session,engine
session = Session()

class Station(Base):
    __tablename__ = 'stations'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    name = Column(String())
    code = Column(String())
    location_id = Column(Integer)
    station_type_id = Column(Integer)


    def __init__(self,name,code,location_id,station_type_id):
        self.name = name
        self.code = code
        self.location_id = location_id
        self.station_type_id = station_type_id


    def __repr__(self):
        return 'id: {}'.format(self.id)

    def serialize(self):
        return {
            'id': self.id,
            'station_name': self.name
        }
Base.metadata.create_all(engine)
session.commit()
