folder_name=$(date -d "+5 hours +30 minutes" +'%H-%M-%m-%d-%Y')
mongo="-mongo"
cassandra="-cassandra"
docker exec -t immunochain-core_postgres_1 pg_dump -c -U admin postgres_db > "$folder_name"-postgres.sql
docker exec -t immunochain-core_cassandra_1 nodetool -h 127.0.0.1 -p 7199 snapshot -t "$folder_name" kba
docker exec -t immunochain-core_mongo_1 mongodump -d immunochain -o immunochain
docker cp immunochain-core_mongo_1:/immunochain "$folder_name$mongo"


for name in /var/www/immunochain-core/data_backup/cassandra_pers_data/data/kba/* ; # find all files with a pattern and process its
do
  #echo "$(basename "$name")"
  #echo  "$file_name"
  get_dir="$folder_name$cassandra"
  directory="$name/snapshots/$folder_name"
  if [ ! -d "$get_dir" ]; then mkdir "$get_dir" ; fi # make directory if not exist
  if [ ! -d "$get_dir/$(basename "$name")" ]; then mkdir "$get_dir/$(basename "$name")" ; fi
  cp -r "$directory"/* "$get_dir/$(basename "$name")/"; # copy file into the directory
done

tar -zcvf "$folder_name".tar.gz "$folder_name$cassandra" "$folder_name$mongo" "$folder_name"-postgres.sql --remove-files