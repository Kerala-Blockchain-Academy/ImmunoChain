
def initialiseLookUp(cassandraObject):
        fields = "(ID,Type)"
        cassandraObject.set_table("ben_lookup",fields)
        cassandraObject.insert_data("1",'RCH')
        cassandraObject.insert_data("2",'MCTS')
        cassandraObject.insert_data("3",'aadhar')
        cassandraObject.set_table("package_lookup",fields)
        cassandraObject.insert_data("1",'Batch')
        cassandraObject.set_table("vaccine_lookup",fields)
        cassandraObject.insert_data("1",'BCG')
        cassandraObject.insert_data("2",'OPV')
        cassandraObject.insert_data("3",'Hepatitis B Vaccine')
        cassandraObject.insert_data("4",'Pentavalent Vaccine')
        cassandraObject.insert_data("5",'Rotovirus vaccine')
        cassandraObject.insert_data("6",'PCV')
        cassandraObject.insert_data("7",'fIPV')
        cassandraObject.insert_data("8",'JE Vaccine')
        cassandraObject.insert_data("9",'DPT vaccine')
        cassandraObject.insert_data("10",'TT')