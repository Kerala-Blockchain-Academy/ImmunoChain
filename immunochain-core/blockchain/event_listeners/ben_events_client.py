#! /usr/bin/env python3

# Copyright 2017-2018 Intel Corporation
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ------------------------------------------------------------------------------
'''Sample Sawtooth event client

   To run, start the validator then type the following on the command line:
       ./events_client.py

   For more information, see
   https://sawtooth.hyperledger.org/docs/core/releases/latest/app_developers_guide/event_subscriptions.html
'''

import sys
import os
from os.path import dirname, join, abspath
sys.path.insert(0, abspath(join(dirname(__file__), '../..')))
from immuno_cassandra.DBconnect import *
import server_config
import traceback
import json
import uuid
from sawtooth_sdk.messaging.stream import Stream
from sawtooth_sdk.protobuf import events_pb2
from sawtooth_sdk.protobuf import client_event_pb2
from sawtooth_sdk.protobuf.validator_pb2 import Message



# Accessing ben-validator:
BEN_VALIDATOR_URL = server_config.Config["BEN_VALIDATOR"]

# Cassandra object to perform DB transactions
BenLogDB = Cassandra()


def listen_to_events(delta_filters=None):

    BenLogDB.set_table('beneficiary_log','(id,beneficiary_id,beneficiary_type_id)')

    '''Listen to vaccination state-delta events.'''

    # Subscribe to events

    add_beneficiary_subscription = events_pb2.EventSubscription(
        event_type="Beneficiary/Add_Beneficiary", filters = delta_filters)

    block_commit_subscription = events_pb2.EventSubscription(
        event_type="sawtooth/block-commit", filters = delta_filters)


    #Create subscription request

    requestBen = client_event_pb2.ClientEventsSubscribeRequest(
        subscriptions=[block_commit_subscription, add_beneficiary_subscription],
        last_known_block_ids=['0000000000000000'])




    # Send the subscription request
    streamBen = Stream(BEN_VALIDATOR_URL)


    msgBen = streamBen.send(message_type=Message.CLIENT_EVENTS_SUBSCRIBE_REQUEST,
                      content=requestBen.SerializeToString()).result()

    assert msgBen.message_type == Message.CLIENT_EVENTS_SUBSCRIBE_RESPONSE


    # Parse the subscription response
    responseBen = client_event_pb2.ClientEventsSubscribeResponse()
    responseBen.ParseFromString(msgBen.content)
    assert responseBen.status == client_event_pb2.ClientEventsSubscribeResponse.OK


    # Listen for events in an infinite loop
    while True:

        msgBen = streamBen.receive().result()
        assert msgBen.message_type == Message.CLIENT_EVENTS
        # Parse the response
        event_list_ben = events_pb2.EventList()
        event_list_ben.ParseFromString(msgBen.content)


      # Log each Beneficiary event into the DB
        for event in event_list_ben.events:

            if event.event_type == "Beneficiary/Add_Beneficiary":
                print("Received the beneficiry event", flush=True)
                print("Beneficiary ID : ", event.attributes[0].value, flush=True)
                print("Beneficiary Type : ", event.attributes[1].value, flush=True)
                BenLogDB.insert_data(
                uuid.uuid4(), #uuid
                event.attributes[0].value, #beneficiaryId
                event.attributes[1].value) #beneficiaryType

    # Unsubscribe from events
    request = client_event_pb2.ClientEventsUnsubscribeRequest()
    msg = stream.send(Message.CLIENT_EVENTS_UNSUBSCRIBE_REQUEST,
                      request.SerializeToString()).result()
    assert msg.message_type == Message.CLIENT_EVENTS_UNSUBSCRIBE_RESPONSE

    # Parse the unsubscribe response
    response = client_event_pb2.ClientEventsUnsubscribeResponse()
    response.ParseFromString(msg.content)
    assert response.status == \
           client_event_pb2.ClientEventsUnsubscribeResponse.OK


def main():
    '''Entry point function for the client CLI.'''

    # filters = [events_pb2.EventFilter(key="event_type", match_string="Beneficiary/Add_Beneficiary",filter_type=events_pb2.EventFilter.REGEX_ANY)]

    try:
        # To listen to all events, pass delta_filters=None :
        listen_to_events(delta_filters=None)
        # listen_to_events(delta_filters=filters)

    except KeyboardInterrupt:
        pass
    except SystemExit as err:
        print("System exit from ben listener", err, flush=True)
        raise err
    except BaseException as err:
        print("BaseException from ben listener", err, flush=True)
        traceback.print_exc(file=sys.stderr)
        # sys.exit(1)
    except Exception as err:
        print("Ben subscription shutting down", flush=True)
        print(err, flush=True)
        # sys.exit(1)
    finally:
        listen_to_events(delta_filters=None)

if __name__ == '__main__':
    main()
