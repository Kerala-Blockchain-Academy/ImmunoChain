from postgres_models.base import Session, engine, Base
from postgres_models.users import User
from postgres_models.user_roles import UserRole
from postgres_models.roles import Role
from postgres_models.rch_users import RCHUser
from postgres_models.pregnancy_details import PregnancyDetail
from postgres_models.children import Child
from postgres_models.station_users import StationUser
from postgres_models.stations import Station
from postgres_models.locations import Location
import error_email
from flask_jwt_extended import (
    JWTManager, jwt_required, create_access_token,
    jwt_refresh_token_required, create_refresh_token,
    get_jwt_identity
)
from datetime import timedelta
import otp_email
import server_config
import shortuuid
from custom_functions import create_hash,check_password

Base.metadata.create_all(engine)
session = Session()
shortuuid.set_alphabet("0123456789")

def link_station_with_user(user_id,station_id):
    if user_id and station_id:
        su = StationUser(
        user_id = user_id,
        station_id = station_id
        )
        session.add(su)
        session.commit()
        return True
    else:
        return False

def registration(username, psw ,name, roles, phone_no, email_id, station_id=[]):
    try:
        rec = session.query(User).filter(User.username == username).first()
        if rec:
            response = {'code':404,'result': False,'message': "User already exists."}
        else:
            passwd = create_hash(psw)
            user=User(
                username=username,
                password=passwd,
                name=name,
                phone_no=phone_no,
                email_id=email_id
            )
            session.add(user)
            session.commit()
            if roles:
                for role in roles:
                    user_role = UserRole(role_id=role['id'],user_id=user.id)
                    session.add(user_role)
                    session.commit()
            if station_id:
                for station in station_id:
                    link_station_with_user(user.id,int(station['station_id']))
            response = {'code':200,'result': True,'message': "User is successfully created."}
    except Exception as e:
        response = {'code':500,'result': False, "message": str(e)}
    return response

def refresh_token_validity(user_id, refresh_token):
    rec = session.query(User).filter(User.id == user_id).first()
    return rec.refresh_token == refresh_token[7:]

def login(username, psw):
    try:
        rec = session.query(User).filter(User.username == username).first()
        if rec:
            check = check_password(psw,rec.password)
            if check:
                id = rec.id
                user_roles = session.query(UserRole).filter(UserRole.user_id == id).all()
                station_users = session.query(StationUser).filter(StationUser.user_id == id).all()
                ur = []
                for user_r in user_roles:
                    role_rec = session.query(Role).filter(Role.id == user_r.role_id).first()
                    ur.append(role_rec.role_name)

                st = []
                for station_user in station_users:
                    station_rec = session.query(Station).filter(Station.id == station_user.station_id).first()
                    location = session.query(Location).filter(Location.id == station_rec.location_id).first()
                    st.append({'station_id':station_rec.id,
                                'station_name':station_rec.name,
                                'station_code':station_rec.code,
                                'station_address':location.name})
                access_token = create_access_token(identity=id,expires_delta=timedelta(seconds= server_config.Config["ACCESS_TOKEN_EXPIRY_TIME"]))
                refresh_token= create_refresh_token(identity=id,expires_delta=timedelta(seconds= server_config.Config["REFRESH_TOKEN_EXPIRY_TIME"]))
                rec.refresh_token = refresh_token
                session.commit()
                response = {'code':200,'result': True,'username':rec.name,'message': "User logged in.", "roles":ur, "stations":st,'access_token':access_token,'refresh_token':refresh_token}
            else:
                id = None
                response = {'code':404,'result': False,'message': "Username or Password is Wrong."}
        else:
            id = None
            response = {'code':404,'result': False,'message': "Username not found."}
    except Exception as e:
        session.rollback()
        id = None
        error_email.send_email({'error':str(e),'url':'/login'})
        response = {'code':500,'result': False, "message": str(e)}
    return response, id

def otp_login(pregnancy_id,phone='null'):
    try:
        #child_rec = session.query(Child).filter(Child.rch_id == unique_id).first()
        preg_detail = session.query(PregnancyDetail).filter(PregnancyDetail.pregnancy_id == pregnancy_id).first()
        if preg_detail:
            rch_user = session.query(RCHUser).filter(RCHUser.id == preg_detail.rch_user_id).first()
            rec = session.query(User).filter(User.id == rch_user.user_id).first()
            if rec:
                otp = shortuuid.uuid()[0:4]
                rec.otp_login =otp
                session.commit()
                otp_email.send_email(rch_user.phone_no_1, otp)
                response = {'code':200,'result': True,'message': "Validation OTP has been sent."}
            else:
                response = {'code':404,'result': False,'message': "No Such User Exists."}
        else:
            response = {'code':404,'result': False,'message': "No Pregnancy Detail Found."}
    except Exception as e:
        response = {'code':500,'result': False, "message": str(e)}
    return response

def otp_login_validation(pregnancy_id, otp_login):
    response = {'code':404,'result': False,'message': "Records not found."}
    id = None
    try:
        preg_detail = session.query(PregnancyDetail).filter(PregnancyDetail.pregnancy_id == pregnancy_id).first()
        rch_user = session.query(RCHUser).filter(RCHUser.id == preg_detail.rch_user_id).first()
        rec = session.query(User).filter(User.id == rch_user.user_id, User.otp_login == otp_login).first()
        if rec:
            user_roles = session.query(UserRole).filter(UserRole.user_id == rec.id).all()
            ur = []
            for user_r in user_roles:
                role_rec = session.query(Role).filter(Role.id == user_r.role_id).first()
                ur.append(role_rec.role_name)
            pregnancy_details = session.query(PregnancyDetail).filter(PregnancyDetail.rch_user_id == rch_user.id).all()
            if pregnancy_details:
                rch_ids = []
                for p in pregnancy_details:
                    child_rec = session.query(Child).filter(Child.pregnancy_detail_id == p.id).first()
                    rch_ids.append(child_rec.rch_id)
                id = rec.id
                access_token = create_access_token(identity=id,expires_delta=timedelta(seconds= server_config.Config["ACCESS_TOKEN_EXPIRY_TIME"]))
                refresh_token= create_refresh_token(identity=id,expires_delta=timedelta(seconds= server_config.Config["RCH_REFRESH_TOKEN_EXPIRY_TIME"]))
                rec.refresh_token = refresh_token
                session.commit()
                response = {'code':200,'result': True,'message': "User logged in.", "rch_ids": rch_ids,"uid": rec.unique_id, "roles":ur,'access_token':access_token,'refresh_token':refresh_token}
            else:
                id = None
                response = {'code':404,'result': False,'message': "Token is Invalid."}
    except Exception as e:
        id = None
        response = {'code':500,'result': False, "message": str(e)}
    return response, id

def get_user_details(user_id):
    rec = session.query(User).filter(User.id==user_id).first()
    data ={}
    if rec:
        user_roles = session.query(UserRole).filter(UserRole.user_id == rec.id).all()
        ur = []
        for user_r in user_roles:
            role_rec = session.query(Role).filter(Role.id == user_r.role_id).first()
            ur.append(role_rec.role_name)
        if 'rch_user' in ur:
            rch_user = session.query(RCHUser).filter(RCHUser.user_id == rec.id).first()
            data['username'] = rch_user.name
            data['roles'] = ur
            data['unique_id'] = rch_user.uid
        else:
            data['username'] = rec.username
            user_stations = session.query(StationUser).filter(StationUser.user_id == rec.id).all()
            data['stations'] = []
            for user_station in user_stations:
                station = session.query(Station).filter(Station.id == user_station.station_id).first()
                obj = {}
                obj['station_name'] = station.name
                obj['station_code'] = station.code
                obj['station_id'] = station.id
                location = session.query(Location).filter(Location.id == station.location_id).first()
                obj['station_address'] = location.name
                data['stations'].append(obj)

            data['roles'] = ur
        return {'code':200,'msg':'User Found','data':data}
    else:
        return {'code':404,'msg':'No User Found','data':[]}
