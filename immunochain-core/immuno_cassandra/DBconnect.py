import sys, os
# sys.path.append(os.getcwd())
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '..')))
import server_config
from cassandra.cluster import Cluster, BatchStatement


class Cassandra :
	def __init__(self):
		self.cluster = Cluster([server_config.Config["CASSANDRA_CONNECTION"]])
		self.keyspace = None
		self.session = self.cluster.connect()
		self.connectKeyspace("kba")

	def __del__(self):
		self.cluster.shutdown()

	def connectKeyspace(self,keyspace):
		if(self.keyspaceNotExist(keyspace)):
			self.createkeyspace(keyspace)
		self.keyspace = keyspace
		self.session.set_keyspace(self.keyspace)
		self.initialiseTable()

	def createkeyspace(self, keyspace):
		rows = self.session.execute("SELECT keyspace_name FROM system_schema.keyspaces")
		if keyspace in [row[0] for row in rows]:
			self.session.execute("USE keyspace" + keyspace)
		self.session.execute("""
				CREATE KEYSPACE %s
				WITH replication = { 'class': 'SimpleStrategy', 'replication_factor': '2' }
				""" % keyspace)

	def create_table(self,tableName,fieldTupleStr):
		TABLE_CMD = """CREATE TABLE IF NOT EXISTS {}{};"""
		INSERT_TABLE = TABLE_CMD.format(tableName,fieldTupleStr)
		self.session.execute(INSERT_TABLE)

	def alter_table(self,action,tableName,columnName,Type=""):
		KeyspaceTable = "kba."+tableName
		CMD = """ALTER TABLE {} {} {} {};"""
		ALTER_COLUMN = CMD.format(KeyspaceTable,action.upper(),columnName,Type)
		self.session.execute(ALTER_COLUMN)
  #Use add / drop for action




	def initialiseTable(self):
		self.session.execute("CREATE TYPE IF NOT EXISTS kba.beneficiary (beneficiary_id varchar, vaccine_dose_id int,age varchar, time_rec time );")
		self.session.execute("CREATE TYPE IF NOT EXISTS kba.vaccine (vaccine_id varchar, time_rec time );")
		self.session.execute("CREATE TYPE IF NOT EXISTS kba.vaccination (vaccine_id int,\
																		  vaccine_name varchar,\
																		  vaccine_dose_id int,\
																		  vaccine_dose_name varchar, \
																		  package_id varchar, \
																		  expected_date date,\
																		  vaccination_date date );")
		self.create_table("beneficiary_immunisation_tracking","""(
											beneficiary_id varchar PRIMARY KEY,
                                        	vaccination_object map<text,frozen <map<text,frozen <vaccination>>>>
											)""")

		self.create_table("immunisation_log","""(
											id uuid PRIMARY KEY,
											vaccine_id varchar,
											beneficiary_id varchar,
											beneficiary_details map<text,text>,
											vaccine_dose_id int,
											vaccine_details map<text,text>,
											beneficiary_type varchar,
											age varchar,
											current_date varchar,
											next_date varchar,
											station_id varchar,
											station_other map<text,text>,
											geo_location map<text,float>)""")
		self.create_table("batch_immunisation_log","""(
											package_id varchar,
											name varchar,
											date_rec date,
											beneficiary_list list<frozen <beneficiary>>,
											beneficiary_no int,
											vaccine_list  list<frozen <vaccine>>,
											vaccine_no int,
											station_id varchar,
											station_other map<text,text>,
											PRIMARY KEY (package_id,date_rec,station_id)
											)""")
		self.create_table("beneficiary_log","""(id uuid, beneficiary_id varchar PRIMARY KEY, beneficiary_type_id varchar)""")
		self.create_table("vaccine_log","""(package_id varchar PRIMARY KEY,
											package_type_id varchar,
											name varchar,
											manufacturing_date timestamp,
											expiry_date timestamp,
											manufacturer_info varchar)""")
		self.create_table("vaccine_sub_log","""(id uuid PRIMARY KEY,
											package_id varchar,
											name varchar,
											manufacturing_date timestamp,
											expiry_date timestamp,
											manufacturer_info varchar,
											previous_uuid uuid,
											dose_count int,
											transit_loss int,
											transit_remark varchar,
											status varchar,
											date_time timestamp ,
											comments varchar,
											previous_station_id int,
											previous_station map<text,text>,
											current_station_id int,
											current_station map<text,text>)""")
		self.create_table("vaccine_transfer_log","""(id uuid PRIMARY KEY,
											vaccine_sub_id uuid ,
											from_station_id int,
											from_station map<text,text>,
											to_station_id int,
											to_station map<text,text>,
											comments varchar,
											transit_remark varchar,
											user_id varchar,
											status varchar,
											date_time timestamp)""")





	def keyspaceNotExist(self,keyspace):
		rows = self.session.execute("SELECT keyspace_name FROM system_schema.keyspaces")
		print(rows)
		if keyspace in [row[0] for row in rows]:
			return False
		else:
			return True


	def set_table(self,tableName,fieldTupleStr):
		self.tableName = tableName
		self.fieldTupleStr = fieldTupleStr



	def insert_data(self,*fields):
		value_str = ["?"]*len(fields)
		CMD_STR = """INSERT INTO {} {} values ({})"""
		INSERT_COMMAND = CMD_STR.format(self.tableName,self.fieldTupleStr,",".join(value_str))
		insert_sql = self.session.prepare(INSERT_COMMAND)
		batch = BatchStatement()
		batch.add(insert_sql, fields)
		self.session.execute(batch)

	def get_data(self,table_name,schema_names = [],group_by = None, count = False):
		select_query_start = "SELECT "
		scheme_query_start = ""
		group_start_query = ""
		if schema_names == []:
			scheme_query_start = "*"
		from_query_start = " FROM kba."
		for s in schema_names:
			if s == schema_names[0]:
				scheme_query_start = s
			else:
				scheme_query_start = scheme_query_start + ","+s
		if group_by:
			group_start_query = " GROUP BY "
			for g in group_by:
				if g == group_by[0]:
					group_start_query = group_start_query + g
				else:
					group_start_query = group_start_query + ", "+g
		from_query_stop = from_query_start+table_name+group_start_query+";"
		select_query = select_query_start+scheme_query_start+from_query_stop
		result = self.session.execute(select_query)
		return_list = []
		if count:
			return len(list(result))
		for res in result:
			dict_obj = {}
			fields = res._fields
			for i,f in enumerate(fields):
				dict_obj[str(f)] = res[i]
			return_list.append(dict_obj)
		return return_list


	def create_view(self):
		view1 = """CREATE MATERIALIZED VIEW IF NOT EXISTS sampleview
					AS SELECT package_id,beneficiary_id,package_type_id,beneficiary_type_id,date_id,station_id,station_other,comment,location,vile_image,medicine_id,vaccine_id
					FROM immunisation_log
					WHERE package_id IS NOT NULL
					PRIMARY KEY (package_id, beneficiary_id)
				"""
		self.session.execute(view1)
