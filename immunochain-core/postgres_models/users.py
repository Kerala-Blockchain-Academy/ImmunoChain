
import sys
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '..')))
sys.path.insert(0, abspath(join(dirname(__file__), '../postgres_models')))
from sqlalchemy import *
from sqlalchemy.orm import relationship
from base import Base, Session,engine
session = Session()

def get_random_id():
    x = datetime.now()
    return x.strftime("%Y%m%d")[2:] +shortuuid.uuid()[0:6]

class User(Base):
    __tablename__ = 'users'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    unique_id = Column(String())
    username = Column(String())
    name = Column(String())
    password = Column(String())
    otp_login = Column(String())
    phone_no = Column(String())
    email_id = Column(String())
    refresh_token = Column(String())

    def __init__(self, username, password, name="",phone_no="", email_id="", unique_id=""):
        self.username = username
        self.password = password
        self.name = name
        self.unique_id = unique_id
        self.phone_no = phone_no
        self.email_id = email_id


    def __repr__(self):
        return 'id: {}'.format(self.id)

    def serialize(self):
        return {
            'id': self.id,
            'username': self.username,
            'password': self.password,
        }
Base.metadata.create_all(engine)
session.commit()
