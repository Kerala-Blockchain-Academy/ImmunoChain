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
from datetime import datetime
from sawtooth_sdk.messaging.stream import Stream
from sawtooth_sdk.protobuf import events_pb2
from sawtooth_sdk.protobuf import client_event_pb2
from sawtooth_sdk.protobuf.validator_pb2 import Message


# Accessing vac-validator:
VAC_VALIDATOR_URL = server_config.Config["VAC_VALIDATOR"]

print("VAC validator", VAC_VALIDATOR_URL)

# Cassandra object to perform DB transactions
VacLogDB = Cassandra()
VacSubLogDB = Cassandra()
VacTransferLogDB = Cassandra()

def listen_to_events(delta_filters=None):
    print("Starting to listen to events here")
    VacLogDB.set_table('vaccine_log','(package_id,package_type_id)')
    VacSubLogDB.set_table('vaccine_sub_log','(id,package_id,previous_uuid,dose_count)')
    VacTransferLogDB.set_table('vaccine_transfer_log','(id,vaccine_sub_id,station_other,user_id,status,date_time)')
    '''Listen to vaccination state-delta events.'''

    # Subscribe to events
    add_vaccine_subscription = events_pb2.EventSubscription(
        event_type="Vaccine/Add_Vaccine", filters = delta_filters)

    block_commit_subscription = events_pb2.EventSubscription(
        event_type="sawtooth/block-commit", filters = delta_filters)


    #Create subscription request

    requestVac = client_event_pb2.ClientEventsSubscribeRequest(
        subscriptions=[block_commit_subscription, add_vaccine_subscription],
        last_known_block_ids=['0000000000000000'])



    # Send the subscription request
    streamVac = Stream(VAC_VALIDATOR_URL)


    msgVac = streamVac.send(message_type=Message.CLIENT_EVENTS_SUBSCRIBE_REQUEST,
                      content=requestVac.SerializeToString()).result()
    assert msgVac.message_type == Message.CLIENT_EVENTS_SUBSCRIBE_RESPONSE


    # Parse the subscription response
    event_response = client_event_pb2.ClientEventsSubscribeResponse()
    event_response.ParseFromString(msgVac.content)
    assert event_response.status == client_event_pb2.ClientEventsSubscribeResponse.OK

    # Listen for events in an infinite loop
    print("------------Starting to listen for VACCINE CHAIN events---------", flush=True)
    while True:
        streamVac.wait_for_ready()
        msgVac = streamVac.receive().result()
        assert msgVac.message_type == Message.CLIENT_EVENTS
        print("Some new event received here", flush=True)
        # Parse the response
        event_list_vac = events_pb2.EventList()
        event_list_vac.ParseFromString(msgVac.content)

      # Log each Vaccine event into the DB
        for event in event_list_vac.events:
            try:
                print("event_type: ", event.event_type, flush=True)
                if event.event_type == "Vaccine/Add_Vaccine":
                    print("Received the Vaccine/Add_Vaccine event", flush=True)
                    print("Received",event.attributes, flush=True)
                    VacLogDB.insert_data(
                                    str(event.attributes[1].value), #package_id
                                    str(event.attributes[2].value) #package_type_id
                    )
                    VacSubLogDB.insert_data(
                    uuid.UUID(event.attributes[0].value), #uuid
                    str(event.attributes[1].value), #package_id
                    uuid.UUID(event.attributes[4].value) if event.attributes[4].value else None, #previous_uuid
                    int(event.attributes[5].value) #dose_count
                    )

                    VacTransferLogDB.insert_data(
                    uuid.uuid4(),
                    uuid.UUID(event.attributes[0].value), #uuid
                    eval(str(event.attributes[3].value)), #station_other
                    str(event.attributes[6].value), #user_id
                    str(event.attributes[8].value), #status
                    datetime.strptime(event.attributes[7].value,"%m/%d/%Y, %H:%M:%S") #received_date_time
                    )
            except:
                continue


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

    listen_to_events(delta_filters=None)

def main():
    '''Entry point function for the client CLI.'''

    # filters = [events_pb2.EventFilter(key="event_type", match_string="Beneficiary/Add_Beneficiary",filter_type=events_pb2.EventFilter.REGEX_ANY)]

    try:
        # To listen to all events, pass delta_filters=None :
        listen_to_events(delta_filters=None)
        # listen_to_events(delta_filters=filters)

    except KeyboardInterrupt:
        print("Keyboard interrupt", flush=True)
        pass
    except SystemExit as err:
        raise err
        print("System exit error", err, flush=True)
    except BaseException as err:
        print("Base exception", flush=True)
        print(err, flush=True)
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)
    except Exception as err:
        print("Vac subscription shutting down", flush=True)
        print(err)
        sys.exit(1)

if __name__ == '__main__':
    main()
