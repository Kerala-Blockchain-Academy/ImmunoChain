import sys
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '..')))
sys.path.insert(0, abspath(join(dirname(__file__), '../postgres_models')))
from sqlalchemy import *
from base import Base, Session,engine
session = Session()

class StationTypeRole(Base):
    __tablename__ = 'station_type_roles'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    station_type_id = Column(Integer)
    role_id = Column(Integer)


    def __init__(self,role_id,station_type_id):
        self.role_id = role_id
        self.station_type_id = station_type_id


    def __repr__(self):
        return 'id: {}'.format(self.id)

    def serialize(self):
        return {
            'id': self.id
        }
Base.metadata.create_all(engine)
session.commit()
