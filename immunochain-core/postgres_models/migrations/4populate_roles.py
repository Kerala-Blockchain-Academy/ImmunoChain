import sys
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '..')))
sys.path.insert(0, abspath(join(dirname(__file__), '../..')))
from roles import Role
from custom_functions import create_hash,check_password
from stations import Station
from station_users import StationUser
from postgres_models.user_roles import UserRole
from postgres_models.users import User

from base import Base, Session,engine
Base.metadata.create_all(engine)
session = Session()



user=User(
    username="sc_user",
    password=create_hash("password"),
)
session.add(user)
session.commit()
st = session.query(Station).filter(Station.code == 'ST1').first()
user_station = StationUser(user_id=user.id,station_id=st.id)
session.add(user_station)
session.commit()

r = session.query(Role).filter(Role.role_name == 'sc_user').first()
user_role = UserRole(role_id=r.id,user_id=user.id)
session.add(user_role)
session.commit()



user1=User(
    username="phc_user",
    password=create_hash("password"),
)
session.add(user1)
session.commit()
st = session.query(Station).filter(Station.code == 'ST2').first()
user_station = StationUser(user_id=user1.id,station_id=st.id)
session.add(user_station)
session.commit()

r = session.query(Role).filter(Role.role_name == 'phc_user').first()
user_role2 = UserRole(role_id=r.id,user_id=user1.id)
session.add(user_role2)
session.commit()

user2=User(
    username="muser",
    password=create_hash("1234"),
)
session.add(user2)
session.commit()
st = session.query(Station).filter(Station.code == 'ST1').first()
user_station = StationUser(user_id=user2.id,station_id=st.id)
session.add(user_station)
session.commit()

st = session.query(Station).filter(Station.code == 'ST2').first()
user_station = StationUser(user_id=user2.id,station_id=st.id)
session.add(user_station)
session.commit()

st = session.query(Station).filter(Station.code == 'ST3').first()
user_station = StationUser(user_id=user2.id,station_id=st.id)
session.add(user_station)
session.commit()

st = session.query(Station).filter(Station.code == 'ST4').first()
user_station = StationUser(user_id=user2.id,station_id=st.id)
session.add(user_station)
session.commit()

r = session.query(Role).filter(Role.role_name == 'sc_user').first()
user_role2 = UserRole(role_id=r.id,user_id=user2.id)
session.add(user_role2)
session.commit()

r = session.query(Role).filter(Role.role_name == 'phc_user').first()
user_role2 = UserRole(role_id=r.id,user_id=user2.id)
session.add(user_role2)
session.commit()

r = session.query(Role).filter(Role.role_name == 'admin').first()
user_role2 = UserRole(role_id=r.id,user_id=user2.id)
session.add(user_role2)
session.commit()
