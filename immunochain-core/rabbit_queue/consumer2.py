import pika
import sys
import os
import json
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '..')))
import server_config
from blockchain.vac_chain import vac_Client
import protobuf.immuno_pb2 as dataBuf

def callback(ch, method, properties, body):
    payloadBuf = dataBuf.payload()
    strBody = body.decode()
    payload = json.loads(strBody)
    payloadBuf.action = str(payload["action"])
    payloadBuf.uuid = str(payload["uuid"])
    payloadBuf.package_id = str(payload["package_id"])
    payloadBuf.package_type_id = str(payload["package_type_id"])
    payloadBuf.name = str(payload["name"])
    payloadBuf.manufacturing_date = str(payload["manufacturing_date"])
    payloadBuf.expiry_date = str(payload["expiry_date"])
    payloadBuf.manufacturer_info = str(payload["manufacturer_info"])
    payloadBuf.from_station = str(payload["from_station"])
    payloadBuf.to_station = str(payload["to_station"])
    payloadBuf.previous_uuid = str(payload["previous_uuid"])
    payloadBuf.dose_count = str(payload["dose_count"])
    payloadBuf.user_id = str(payload["user_id"])
    payloadBuf.adjustments = str(payload["adjustments"])
    payloadBuf.comments = str(payload["comments"])
    payloadBuf.received_date_time = str(payload["date_time"])
    payloadBuf.status = str(payload["status"])
    vac_Client.VaccineClient(payloadBuf.SerializeToString())
    ch.basic_ack(   # this is where manual confirmations are specified
        delivery_tag=method.delivery_tag,
        # requeue=True,
        multiple=True   # to confirm multiple msgs
        )

while(True):
    try:
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=server_config.Config["RABBITMQ_CONNECTION"], heartbeat=0))

        channel = connection.channel()
        channel.basic_qos(prefetch_count=150)
        channel.exchange_declare(exchange='direct_logs', exchange_type='direct')
        channel.queue_declare(
            queue='Vaccine_queue',
            exclusive=True,
            durable=True    # for queue durability
            )
        channel.queue_bind(
            exchange='direct_logs',
            queue='Vaccine_queue',
            routing_key='Vaccine'
            )
        channel.basic_consume(
            queue='Vaccine_queue',
            on_message_callback=callback,
            auto_ack=False  # set this to False for manual confirmations
            )
        try:
            channel.start_consuming()
        except KeyboardInterrupt:
            channel.stop_consuming()
            connection.close()
            break
    except pika.exceptions.ConnectionClosedByBroker:
        continue
    # Do not recover on channel errors
    except pika.exceptions.AMQPChannelError as err:
        print("Caught a channel error: {}, stopping...".format(err))
        break
    # Recover on all other connection errors
    except pika.exceptions.AMQPConnectionError:
        print("Connection was closed, retrying...")
        continue
