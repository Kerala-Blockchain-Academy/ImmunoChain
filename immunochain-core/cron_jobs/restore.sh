#restoring mongo database start
cp -r "$folder_name"-mongo /var/www/immunochain-core/data_backup/mongo_data/
docker exec -t immunochain-core_mongo_1 mongorestore --db immunochain --verbose /data/db/"$folder_name"-mongo/immunochain
rm -rf /var/www/immunochain-core/data_backup/mongo_data/"$folder_name"-mongo
#restoring mongo database end

#restoring postgres database start
cp "$folder_name"-postgres.sql /var/www/immunochain-core/data_backup/postgres_data/
docker exec -t immunochain-core_postgres_1 psql -U admin -d postgres_db -1 -f /var/lib/postgresql/data/"$folder_name"-postgres.sql
rm /var/www/immunochain-core/data_backup/postgres_data/"$folder_name"-postgres.sql
#restoring postgres database end

#restoring cassandra database start
cp -r "$folder_name"-cassandra /var/www/immunochain-core/data_backup/cassandra_pers_data/
rm -rf /var/www/immunochain-core/data_backup/cassandra_pers_data/data/kba/*
cd /var/www/immunochain-core/data_backup/cassandra_pers_data/
for table_name in "$folder_name"-cassandra/* ; # find all files with a pattern and process its
do
  cp -r "$folder_name"-cassandra/"$table_name" /var/www/immunochain-core/data_backup/cassandra_pers_data/data/kba/
  mkdir /var/www/immunochain-core/data_backup/cassandra_pers_data/data/kba/"$table_name"/snapshots
  mkdir /var/www/immunochain-core/data_backup/cassandra_pers_data/data/kba/"$table_name"/backups
done
rm -rf /var/www/immunochain-core/data_backup/cassandra_pers_data/"$folder_name"-cassandra
#restoring cassandra database end
