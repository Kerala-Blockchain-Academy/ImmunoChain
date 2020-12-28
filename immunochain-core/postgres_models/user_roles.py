
import sys
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '..')))
sys.path.insert(0, abspath(join(dirname(__file__), '../postgres_models')))
from sqlalchemy import *
from users import User
from base import Base, Session,engine

session = Session()

class UserRole(Base):
    __tablename__ = 'user_roles'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    role_id = Column(Integer)


    def __init__(self,user_id,role_id):
        self.user_id = user_id
        self.role_id = role_id

    def __repr__(self):
        return 'id: {}'.format(self.id)

    def serialize(self):
        return {
            'id': self.id,
            'role_id': self.role_id,
            'user_id': self.user_id
        }
Base.metadata.create_all(engine)
session.commit()
