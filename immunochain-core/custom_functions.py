import bcrypt
from datetime import datetime,timedelta
import uuid

def create_hash(password):
    passwd = password.encode('raw_unicode_escape')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(passwd, salt)
    return hashed.decode('utf8')

def check_password(password,hashed_password):
    return bcrypt.checkpw(password.encode('utf8'), hashed_password.encode('utf8'))

def get_random_id():
    x = datetime.now()
    return x.strftime("%Y%m%d")[2:] + uuid.uuid1().hex[0:5]

def obj_to_date(date_obj,string=True,extra_day=0):
    if not date_obj:
        date_obj = {'yyyy':2099,'mm':12,'dd':31}
    if 'HH' in date_obj:
        date = datetime(int(date_obj['yyyy']), int(date_obj['mm']), int(date_obj['dd']),int(date_obj['HH']),int(date_obj['MM']))
    else:
        date = datetime(int(date_obj['yyyy']), int(date_obj['mm']), int(date_obj['dd'])) + timedelta(days=extra_day)
    if string:
        return date.strftime("%Y-%m-%d %H:%M:%S")
    else:
        return date

def date_to_string(date,datetime=True):
    if date and date != "" and datetime:
        date_obj = {}
        date_obj['dd'] = date.day
        date_obj['mm'] =date.month
        date_obj['yyyy'] = date.year
        if date_obj['yyyy'] == 2099:
            return ""#{'dd':"",'mm':"",'yyyy':""}
        return date_obj
    elif date:
        date_arr = date.split(" ")[0]
        date_arr = date_arr.split("-")
        date_obj = {}
        date_obj['dd'] = int(date_arr[2])
        date_obj['mm'] = int(date_arr[1])
        date_obj['yyyy'] = int(date_arr[0])
        return date_obj
    else:
        return {}
