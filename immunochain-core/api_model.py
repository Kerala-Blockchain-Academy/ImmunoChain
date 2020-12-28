# This is a backend model for Cassandra Database.
# The names of the classes should represent the names of the appropriate tables
# the names of attributes should represent the names of schema of these tables.
# Bad things will happend if you don't keep in mind these instructions.
# Beware!
class immunisation_log():
    def __init__(self,args):
        self.package_id = args["package_id"]
        self.beneficiary_id = int(args["beneficiary_id"])
        self.package_type_id = args["package_type_id"]
        self.beneficiary_type_id = args["beneficiaryid_type"]
        self.date_id = ""
        self.station_type = ""
        self.station_id = args["station_id"]
        self.station_other = args["station_other"]
        self.comment = args["comment"]
        self.location = args["geolocation"]
        self.vile_image = args["vile_image"]
        self.medicine_id = args["medicine_id"]
        self.vaccine_id = args["vaccine_id"]

class rch_book_log():
    def __init__(self,args):
        self.pregnant_woman_name = args["pregnant_woman_name"]
        self.pregnant_woman_age = int(args["pregnant_woman_age"])
        self.husband_name = args["husband_name"]
        self.husband_age = int(args["husband_age"])
        self.address = args["address"]
        self.phone_no = args["phone_no"]
        self.family_reg_no = int(args["family_reg_no"])
        self.mother_education = args["mother_education"]
        self.unique_id = args["unique_id"]
        self.aadhar_id = int(args["aadhar_id"])
        self.income = args["income"]
        self.caste = args["caste"]
        self.ec_no = args["ec_no"]
        self.apl_or_bpl = args["apl_or_bpl"]
        self.last_menstruation_date = args["last_menstruation_date"]
        self.expected_delivery_date = args["expected_delivery_date"]
        self.gravida = int(args["gravida"])
        self.para = int(args["para"])
        self.last_delivery_date = args["last_delivery_date"]
        self.institution_of_delivery = args["institution_of_delivery"]
        self.rsby_card_reg_no = args["rsby_card_reg_no"]
        self.no_of_live_children = int(args["no_of_live_children"])
        self.no_of_abortions = int(args["no_of_abortions"])
        self.tt1_date = args["tt1_date"]
        self.tt2_date = args["tt2_date"]
        self.usg1_date = args["usg1_date"]
        self.usg2_date = args["usg2_date"]
        self.usg3_date = args["usg3_date"]
        self.important_findings = args["important_findings"]
        self.complication_details = args["complication_details"]
        self.heart_complications = args["heart_complications"]
        self.advice = args["advice"]
        self.referrals = args["referrals"]
        self.contraceptive_methods_used = args["contraceptive_methods_used"]

class vaccine_log():
    def __init__(self,args):
        self.package_id = args["package_id"]
        self.package_type_id = args["package_type_id"]
        self.comment = args["comment"]

class beneficiary_log():
    def __init__(self,args):
        self.beneficiary_id = args["beneficiary_id"]
        self.beneficiary_type_id = args["beneficiaryid_type"]
        self.comment = args["comment"]

class user_log():
    def __init__(self,args):
        self.user_id = args["user_id"]
        self.first_name = args["first_name"]
        self.last_name = args["last_name"]
        self.user_name = args["user_name"]
        self.user_role = args["user_role"]
        self.station_id = args["station_id"]

class med_log():
    def __init__(self,args):
        self.med_id = args["med_id"]
        self.med_name = args["med_name"]

class ben_lookup():
    def __init__(self,args):
        self.id = args["id"]
        self.type = args["type"]

class package_lookup():
    def __init__(self,args):
        self.id = args["id"]
        self.type = args["type"]

class vaccine_lookup():
    def __init__(self,args):
        self.id = args["id"]
        self.type = args["type"]
