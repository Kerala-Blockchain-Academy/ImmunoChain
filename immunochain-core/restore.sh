folder_name="15-30-05-04-2020"
location="/home/hp/Desktop/immunochain/immunochain-core"
#restoring mongo database start
cp -r "$folder_name"-mongo "$location"/data_backup/mongo_data/
docker exec -t immunochain-core_mongo_1 mongorestore --db immunochain /data/db/"$folder_name"-mongo/immunochain
rm -rf "$location"/data_backup/mongo_data/"$folder_name"-mongo
#restoring mongo database end

#restoring postgres database start
cp "$folder_name"-postgres.sql "$location"/data_backup/postgres_data/
docker exec -t immunochain-core_postgres_1 psql -U admin -d postgres_db -1 -f /var/lib/postgresql/data/"$folder_name"-postgres.sql
rm "$location"/data_backup/postgres_data/"$folder_name"-postgres.sql
#restoring postgres database end

#restoring cassandra database start
cp -r "$folder_name"-cassandra "$location"/data_backup/cassandra_pers_data/
rm -rf "$location"/data_backup/cassandra_pers_data/data/kba/*
cd "$location"/data_backup/cassandra_pers_data/
for table_name in "$folder_name"-cassandra/* ; # find all files with a pattern and process its
do
  cp -r "$folder_name"-cassandra/"$table_name" "$location"/data_backup/cassandra_pers_data/data/kba/
  mkdir "$location"/data_backup/cassandra_pers_data/data/kba/"$table_name"/snapshots
  mkdir "$location"/data_backup/cassandra_pers_data/data/kba/"$table_name"/backups
done

#restoring cassandra database end

