import sys
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '..')))
from stations import Station
from locations import Location
from roles import Role
from station_types import StationType
from station_type_roles import StationTypeRole
from base import Base, Session,engine
Base.metadata.create_all(engine)
session = Session()

roles = ["rch_user","sc_user", "phc_user","admin"]

for role in roles:
    r = Role(role_name=role)
    session.add(r)
    session.commit()

station_types = [
{
'name':"State Center",
'code':'sc'
},
{
'name':"Primary Health Center",
'code':'phc'
},
{
'name':"Community Health Center",
'code':'chc'
}
]
for st in station_types:
    s = StationType(name=st['name'],code=st['code'])
    session.add(s)
    session.commit()



locations = [{
"name":"Poonthura",
"lat":76.8731,
"long":8.5686
},{
"name":"Chettivilakonam",
"lat":76.8731,
"long":8.5686
},{
"name":"Kadakampally",
"lat":76.8731,
"long":8.5686
},{
"name":"Vattiyoorkavu",
"lat":76.8731,
"long":8.5686
},{
"name":"External",
"lat":76.2999,
"long":9.9816
},{
"name":"Trivandrum",
"lat":76.2999,
"long":9.9816
}]
for l in locations:
    s = Location(name=l['name'],latitude=l['lat'],longitude=l['long'])
    session.add(s)
    session.commit()


stations = [
    {
      "site_name": "CHC Poonthura",
      "site_id": "ST1",
      'location':"Poonthura",
      "stype":"phc"
    },

    {
      "site_name": "PHC Chettivilakonam",
      "site_id": "ST2",
      'location':"Chettivilakonam",
      "stype":"phc"
    },

    {
      "site_name": "PHC Kadakampally",
      "site_id": "ST3",
      'location':"Kadakampally",
      "stype":"phc"
    },
    {
      "site_name": "External Station",
      "site_id": "ET1",
      'location':"External",
      "stype":"phc"
    },
    {
      "site_name": "PHC Vattiyoorkavu",
      "site_id": "ST4",
      'location':"Vattiyoorkavu",
      "stype":"phc"
    },
    {
      "site_name": "District Centre",
      "site_id": "ST5",
      'location':"Trivandrum",
      "stype":"sc"
    }
]

for s in stations:
    st = session.query(StationType).filter(StationType.code == s['stype']).first()
    l = session.query(Location).filter(Location.name == s['location']).first()
    s = Station(name=s['site_name'],code=s['site_id'],location_id=l.id,station_type_id=st.id)
    session.add(s)
    session.commit()

role_stations = [
{
    'center':'sc',
    'roles': ["sc_user"]
},{
    'center':'phc',
    'roles': ["phc_user"]
}]

for rs in role_stations:
    st = session.query(StationType).filter(StationType.code == rs['center']).first()
    for role in rs['roles']:
        r = session.query(Role).filter(Role.role_name == role).first()
        s = StationTypeRole(role_id=r.id,station_type_id=st.id)
        session.add(s)
        session.commit()
