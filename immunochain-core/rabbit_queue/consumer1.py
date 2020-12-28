import pika
import sys
import os
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '..')))
import server_config
from blockchain.ben_chain import ben_Client
import protobuf.beneficiary_pb2 as benBuf
import json
# print(config.Config)

def callback(ch, method, properties, body):
    payloadBuf = benBuf.beneficiary()
    strBody = body.decode()
    payload = json.loads(strBody)
    payloadBuf.action = payload["action"]
    payloadBuf.beneficiary_id_type = payload["BeneficiaryIdType"]
    payloadBuf.beneficiary_id = payload["BeneficiaryId"]
    ben_Client.BeneficiaryClient(payloadBuf.SerializeToString())
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
            queue='Beneficiary_queue',
            exclusive=True,
            durable=True    # for queue durability
            )
        channel.queue_bind(
            exchange='direct_logs',
            queue='Beneficiary_queue',
            routing_key='Beneficiary'
            )
        channel.basic_consume(
            queue='Beneficiary_queue',
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






#print(' [*] Waiting for logs. To exit press CTRL+C')


#
