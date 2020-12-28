
import sys
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '..')))
sys.path.insert(0, abspath(join(dirname(__file__), '../postgres_models')))
from sqlalchemy import *
from base import Base, Session,engine
from stations import Station
from locations import Location

session = Session()

class ServiceProvider(Base):
    __tablename__ = 'service_providers'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    icds = Column(String())
    pregnancy_detail_id = Column(Integer)
    anganwadi_centre = Column(String())
    anganwadi_worker = Column(String())
    anganwadi_phone = Column(String())
    health_centre = Column(String())
    sub_centre = Column(String())
    asha = Column(String())
    asha_phone = Column(String())
    jphn = Column(String())
    jphn_phone = Column(String())
    hospital_for_delivery = Column(String())
    birth_companion = Column(String())
    hospital_address = Column(String())
    transportation_arrangement = Column(String())
    registered_for_pmmvy = Column(Boolean)
    first_financial_aid = Column(Boolean)
    second_financial_aid = Column(Boolean)
    third_financial_aid = Column(Boolean)
    anganwadi_registration_number = Column(String())
    sub_centre_registration_number = Column(String())
    date_of_first_registration = Column(Date)
    pregnancy_detail_id = Column(Integer)
    nearest_station_id = Column(Integer)

    def __init__(self, icds, anganwadi_centre, anganwadi_worker, \
    anganwadi_phone,pregnancy_detail_id, health_centre, sub_centre, asha, jphn,jphn_phone,asha_phone, \
    hospital_for_delivery, birth_companion, hospital_address, transportation_arrangement, \
    registered_for_pmmvy, anganwadi_registration_number, sub_centre_registration_number, \
    first_financial_aid, second_financial_aid, third_financial_aid, date_of_first_registration,nearest_station_id):
        self.icds = icds
        self.pregnancy_detail_id = pregnancy_detail_id
        self.anganwadi_centre = anganwadi_centre
        self.anganwadi_worker = anganwadi_worker
        self.anganwadi_phone = anganwadi_phone
        self.health_centre = health_centre
        self.sub_centre = sub_centre
        self.asha = asha
        self.asha_phone = asha_phone
        self.jphn = jphn
        self.jphn_phone = jphn_phone
        self.hospital_for_delivery = hospital_for_delivery
        self.birth_companion = birth_companion
        self.first_financial_aid = first_financial_aid
        self.second_financial_aid = second_financial_aid
        self.third_financial_aid = third_financial_aid
        self.hospital_address = hospital_address
        self.transportation_arrangement = transportation_arrangement
        self.registered_for_pmmvy = registered_for_pmmvy
        self.anganwadi_registration_number = anganwadi_registration_number
        self.sub_centre_registration_number = sub_centre_registration_number
        self.date_of_first_registration = date_of_first_registration
        self.nearest_station_id = nearest_station_id

    def __repr__(self):
        return 'id: {}'.format(self.id)

    def get_station_object(self):
        if self.nearest_station_id:
            station = session.query(Station).filter(Station.id == self.nearest_station_id).first()
            obj = {}
            obj['station_name'] = station.name
            obj['station_code'] = station.code
            obj['station_id'] = str(station.id)
            location = session.query(Location).filter(Location.id == station.location_id).first()
            obj['station_address'] = location.name
            return obj
        else:
            return {}

    def serialize(self):
        return {
            'id': self.id,
        }
Base.metadata.create_all(engine)
session.commit()
