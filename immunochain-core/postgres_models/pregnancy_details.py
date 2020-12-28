
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

class PregnancyDetail(Base):
    __tablename__ = 'pregnancy_details'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    rch_user_id =  Column(Integer)
    phone_no =Column(String())
    drivers_number = Column(String())
    menstruation_date = Column(Date)
    expected_delivery_date = Column(Date)
    blood_group = Column(String())
    last_delivery_date = Column(Date)
    rsby_reg_number = Column(String())
    pregnancy_id = Column(String())
    jsy_reg_number = Column(String())
    gravida = Column(Integer)
    para = Column(Integer)
    no_of_live_children = Column(Integer)
    no_of_abortions = Column(Integer)
    tt1_date = Column(Date)
    tt2_date = Column(Date)
    usg1_date = Column(Date)
    usg2_date = Column(Date)
    usg3_date = Column(Date)
    important_findings = Column(String())
    complication_details = Column(String())
    heart_complications = Column(String())
    advice = Column(String())
    referrals = Column(String())
    contraceptive_methods_used = Column(String())
    rh_category = Column(String())
    previous_delivery = Column(String())

    def __init__(self, rch_user_id,phone_no,drivers_number,menstruation_date,expected_delivery_date,\
    blood_group,last_delivery_date,rsby_reg_number,jsy_reg_number,gravida,para,no_of_live_children,\
    no_of_abortions,tt1_date,tt2_date,usg1_date,usg2_date,usg3_date,important_findings,complication_details,\
    heart_complications,advice,referrals,contraceptive_methods_used,rh_category,previous_delivery,pregnancy_id="" ):
        if pregnancy_id:
            self.pregnancy_id = pregnancy_id
        else:
            self.pregnancy_id = get_random_id()
        self.rch_user_id = rch_user_id
        self.phone_no = phone_no
        self.drivers_number = drivers_number
        self.menstruation_date =menstruation_date
        self.expected_delivery_date = expected_delivery_date
        self.blood_group = blood_group
        self.last_delivery_date = last_delivery_date
        self.rsby_reg_number = rsby_reg_number
        self.jsy_reg_number = jsy_reg_number
        self.gravida = gravida
        self.para = para
        self.no_of_live_children = no_of_live_children
        self.no_of_abortions = no_of_abortions
        self.tt1_date = tt1_date
        self.tt2_date = tt2_date
        self.usg1_date = usg1_date
        self.usg2_date = usg2_date
        self.usg3_date = usg3_date
        self.important_findings = important_findings
        self.complication_details = complication_details
        self.heart_complications = heart_complications
        self.advice = advice
        self.referrals = referrals
        self.contraceptive_methods_used = contraceptive_methods_used
        self.rh_category = rh_category
        self.previous_delivery = previous_delivery

    def __repr__(self):
        return 'id: {}'.format(self.id)

    def serialize(self):
        return {
            'id': self.id
        }
Base.metadata.create_all(engine)
session.commit()
