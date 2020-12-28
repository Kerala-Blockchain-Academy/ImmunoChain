
Config = {
    "TIME_ZONE" : 'Asia/Kolkata',
    "MONGO_CONNECTION" : 'mongo',
    "PIKA_CONNECTION" : 'rabbitmq',
    "RABBITMQ_CONNECTION" : 'rabbitmq',
    "CASSANDRA_CONNECTION" : 'cassandra',
    "BEN_VALIDATOR" : 'tcp://165.22.212.70:4004',
    "VAC_VALIDATOR" : 'tcp://165.22.212.70:4005',
    "BEN_RESTAPI"   : 'http://165.22.212.70:5001/ben/',
    "VAC_RESTAPI"   : 'http://165.22.212.70:5001/vac/',
    "TWILIO_SID"   : "",
    "TWILIO_AUTH"   : "",
    "XPRESS_SMS" : "", #SMS sending
    "CSV_PATH"   : "/tmp/",
    "TWILIO_PHONE"   : "",
    "POSTGRES_CONNECTION" : 'postgres',
    "ACCESS_TOKEN_EXPIRY_TIME":3600, #1 hour
    "REFRESH_TOKEN_EXPIRY_TIME":86400, #1 day
    "RCH_REFRESH_TOKEN_EXPIRY_TIME":15552000,#6months
    "APP_URL_HOST" : '0.0.0.0',
    "APP_URL_PORT" : 1337,
    "POSTGRES" : {
        'user': 'admin',
        'pw': 'password',
        'db': 'postgres_db',
        'host': 'postgres',
        'port': '5432',
    }

}
