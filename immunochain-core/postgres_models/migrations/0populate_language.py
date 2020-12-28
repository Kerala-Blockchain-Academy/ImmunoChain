import sys
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '..')))
from languages import Language


from base import Base, Session,engine
Base.metadata.create_all(engine)
session = Session()

languages = [
      {
        "name": "English",
        "id": "en"
      },
      {
        "name": "Hindi",
        "id": "hi"
      },
      {
        "name": "Malayalam",
        "id": "ml"
      }
]

for l in languages:
    v = Language(name=l['name'],code=l['id'])
    session.add(v)
    session.commit()
