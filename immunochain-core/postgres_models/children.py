
import sys
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '..')))
sys.path.insert(0, abspath(join(dirname(__file__), '../postgres_models')))
from sqlalchemy import *
from base import Base, Session,engine
from datetime import datetime
import shortuuid
session = Session()

def get_random_id():
    x = datetime.now()
    return x.strftime("%Y%m%d")[2:] +shortuuid.uuid()[0:6]

class Child(Base):
    __tablename__ = 'children'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    rch_id = Column(String())
    pregnancy_detail_id =  Column(Integer)
    rch_user_id = Column(Integer)
    name = Column(String())
    date_of_birth = Column(Date)
    gender = Column(String())
    deleted = Column(Boolean)

    def __init__(self, pregnancy_detail_id,rch_user_id,name,date_of_birth,gender,deleted=False, rch_id=""):
        if rch_id:
            self.rch_id = rch_id
        else:
            self.rch_id = get_random_id()
        self.pregnancy_detail_id = pregnancy_detail_id
        self.rch_user_id = rch_user_id
        self.name = name
        self.date_of_birth = date_of_birth
        self.gender = gender
        self.deleted = deleted


    def __repr__(self):
        return 'id: {}'.format(self.id)

    def serialize(self):
        return {
            'id': self.id,
            'rch_id': self.rch_id
        }
Base.metadata.create_all(engine)
session.commit()
