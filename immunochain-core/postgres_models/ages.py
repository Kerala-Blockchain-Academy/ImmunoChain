import sys
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '..')))
sys.path.insert(0, abspath(join(dirname(__file__), '../postgres_models')))
from sqlalchemy import *
from base import Base, Session,engine
session = Session()

class Age(Base):
    __tablename__ = 'ages'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    name = Column(String())
    code = Column(String())
    weeks = Column(Integer)


    def __init__(self,name,code,weeks):
        self.name = name
        self.code = code
        self.weeks = weeks

    def __repr__(self):
        return 'id: {}'.format(self.id)

    def serialize(self):
        return {
            'id': self.id,
            'age': self.name
        }
Base.metadata.create_all(engine)
session.commit()
