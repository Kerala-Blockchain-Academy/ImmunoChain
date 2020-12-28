import sys
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '..')))
sys.path.insert(0, abspath(join(dirname(__file__), '../postgres_models')))
from sqlalchemy import *
from base import Base, Session,engine
session = Session()

class StationUser(Base):
    __tablename__ = 'station_users'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    station_id = Column(Integer)
    user_id = Column(Integer)


    def __init__(self,station_id,user_id):
        self.station_id = station_id
        self.user_id = user_id


    def __repr__(self):
        return 'id: {}'.format(self.id)

    def serialize(self):
        return {
            'id': self.id
        }
Base.metadata.create_all(engine)
session.commit()
