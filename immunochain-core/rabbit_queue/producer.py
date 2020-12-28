import pika
import os
import sys
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '..')))
import server_config
import time
import json

# print(immuno_config.Config["PIKA_CONNECTION"])
 #IP address of the machine running RabbitMQ Server


def ProduceBeneficiaryData(action, id_type, id):
    data = {}
    data["action"] = action
    data["BeneficiaryIdType"] = id_type
    data["BeneficiaryId"] = id
    try:
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(
                host=server_config.Config["PIKA_CONNECTION"]
                )
            )
        channel = connection.channel()
        channel.exchange_declare(
            exchange='direct_logs',
            exchange_type='direct'
            )
        channel.confirm_delivery()
        channel.basic_publish(
            exchange='direct_logs',
            routing_key='Beneficiary',
            body=json.dumps(data),
            properties=pika.BasicProperties(
                delivery_mode=2  # for message durability
            ),
            mandatory=True
        )
        print("message was published!!!!!!!", flush=True)
        connection.close()
    except pika.exceptions.UnroutableError:
        print("message was returned........", flush=True)
    except pika.exceptions.AMQPConnectionError:
        print("Connection was closed... Message not sent", flush=True)


def ProduceVaccineData(action, data):
    try:
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(
                host=server_config.Config["PIKA_CONNECTION"]
                )
            )
        channel = connection.channel()
        channel.exchange_declare(
            exchange='direct_logs',
            exchange_type='direct'
            )
        channel.confirm_delivery()
        data["action"] = action
        channel.basic_publish(
            exchange='direct_logs',
            routing_key='Vaccine',
            body=json.dumps(data),
            properties=pika.BasicProperties(
                delivery_mode=2  # for message durability
            ),
            mandatory=True
        )
        print("message was published!!!!!!!", flush=True)
        connection.close()
    except pika.exceptions.UnroutableError:
        print("message was returned........", flush=True)
    except pika.exceptions.AMQPConnectionError:
        print("Connection was closed... Message not sent", flush=True)


def NextDateMessage(action, data):
    try:
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(
                host=server_config.Config["PIKA_CONNECTION"]
                )
            )
        channel = connection.channel()
        channel.exchange_declare(
            exchange='direct_logs',
            exchange_type='direct'
            )
        channel.confirm_delivery()
        data["action"] = action
        channel.basic_publish(
            exchange='direct_logs',
            routing_key='Message',
            body=json.dumps(data),
            properties=pika.BasicProperties(
                delivery_mode=2  # for message durability
            ),
            mandatory=True
        )
        print("message was published!!!!!!!", flush=True)
        connection.close()
    except pika.exceptions.UnroutableError:
        print("message was returned........", flush=True)
    except pika.exceptions.AMQPConnectionError:
        print("Connection was closed... Message not sent", flush=True)
