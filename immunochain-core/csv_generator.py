import server_config
import csv
import time

def generate_csv(data):
    file_name = str(time.time()).replace(".","")

    with open(server_config.Config['CSV_PATH']+file_name+'.csv', 'w') as f:  # Just use 'w' mode in 3.x
        w = csv.DictWriter(f, data[0].keys())
        w.writeheader()
        for d in data:
            w.writerow(d)
    return file_name+".csv"