import sys
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '..')))
sys.path.insert(0, abspath(join(dirname(__file__), '../postgres_models')))
from sqlalchemy import *
from base import Base, Session,engine
from sqlalchemy.sql import func
from datetime import datetime
import shortuuid
session = Session()

def get_random_id():
    x = datetime.now()
    return x.strftime("%Y%m%d")[2:] +shortuuid.uuid()[0:6]

class RCHUser(Base):
    __tablename__ = 'rch_users'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    name = Column(String())
    dob = Column(Date)
    address = Column(String())
    phone_no_1 = Column(String())
    phone_no_2 = Column(String())
    age = Column(Integer)
    husband_name = Column(String())
    husband_dob = Column(Date)
    husband_age = Column(Integer)
    family_reg_no = Column(String())
    mother_education = Column(String())
    unique_id = Column(String())
    aadhar_id = Column(String())
    income = Column(Integer)
    caste = Column(String())
    ec_no = Column(String())
    apl_bpl = Column(String())
    bank_account_number = Column(String())
    ifsc_code = Column(String())
    category = Column(String())
    uid = Column(String())
    time_created = Column(DateTime(timezone=True), server_default=func.now())
    time_updated = Column(DateTime(timezone=True), onupdate=func.now())


    def __init__(self, user_id, name,dob, address, phone_no_1, phone_no_2, age, husband_name,husband_age, \
            husband_dob,family_reg_no,mother_education,unique_id,uid, bank_account_number,aadhar_id, income, caste, ec_no, category,ifsc_code,apl_bpl):
        self.user_id = user_id
        self.name = name
        self.dob = dob
        self.address = address
        self.phone_no_1 = phone_no_1
        self.phone_no_2 = phone_no_2
        self.age = int(age)
        self.husband_name = husband_name
        self.husband_age = int(husband_age)
        self.husband_dob = husband_dob
        self.family_reg_no = family_reg_no
        self.mother_education = mother_education
        self.unique_id = unique_id
        self.aadhar_id = aadhar_id
        self.income = int(income)
        self.caste = caste
        self.ec_no = ec_no
        self.category = category
        self.apl_bpl = apl_bpl
        self.uid = uid
        self.ifsc_code = ifsc_code
        self.bank_account_number = bank_account_number




    def __repr__(self):
        return 'id: {}, user_id {}'.format(self.id, self.uid)

Base.metadata.create_all(engine)
session.commit()
