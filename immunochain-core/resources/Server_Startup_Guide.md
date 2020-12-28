# Immunochain Server Startup Guide (Native)

## Prerequisites:
 - Gunicorn 
 - Gunicorn 'Green Unicorn' is a Python WSGI HTTP Server for UNIX.
    ```sh
     $ pip install gunicorn
    ```
 - Service Files:
There are service files written and stored which would initialise the entire environment and bring it up and online for the project to run. These files are fired up during startup i.e. ideally the environment will be up and running once server is booted up.
   
    Location: /etc/systemd/system
    
    File: immuno.service
    
    Check status of the service:
     ```sh
     $ sudo service immuno.service status
    ```
   Start / Stop / Restart service:
     ```sh
    $ sudo service immuno.service start
    
    $ sudo service immuno.service stop
    
    $ sudo service immuno.service restart
    ```

## Dependency:
immuno.service depends on two other services (these services are called by this file).

immuno_consumer.service
immuno_consuemer2.service

If either one of these services fail to run, immuno.service won’t run. These files will startup the consumer1.py & consumer2.py from the codebase.


# Immunochain Server Startup Guide (Docker)

## Prerequisites:
NOTE: Ensure that the native deployment is not running in the background (stop all running services of immunochain).
 - Docker CE (ubuntu)
 - Refer https://docs.docker.com/install/ for other OS versions.
 - Uninstall old version (if required).
    ```sh
     $ sudo apt-get remove docker docker-engine docker.io containerd runc
    ```
 - Install Docker CE.
    ```sh
     $ sudo apt-get update

     $ sudo apt-get install \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg-agent \
        software-properties-common

     $ curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -



     $ sudo add-apt-repository \
          "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
          $(lsb_release -cs) \
          stable"

     $ sudo apt-get install docker-ce docker-ce-cli containerd.io

    ```

## Startup Steps:
##### 1) Deploy the Validators and TPs for both Beneficiary & Vaccine.

Navigate to the root of the project folder (~/immunochain-core$)
For Beneficiary:
```sh
     $ suod docker-compose -f ben_chain.yaml up
```
For Vaccine:
```sh
     $ suod docker-compose -f vac_chain.yaml up
```

##### 2) Update server_config.py
Get the IP address of the machine(s) where the docker containers (ben_chain & vac_chain) are deployed.
Replace 'localhost' with the IP address as appicable for the below fields in server_config.py:

    "BEN_VALIDATOR" : 'tcp://localhost:4004'  (ben_chain IP)
    "VAC_VALIDATOR" : 'tcp://localhost:4040'  (vac_chain IP)
    "BEN_RESTAPI"   : 'http://localhost:8008' (ben_chain IP)
    "VAC_RESTAPI"   : 'http://localhost:8009' (vac_chain IP)

##### 3) Deploy api.yaml
This file will deploy all the other necessary components i.e. API, Rabbitmq, CassandraDB, PostgresDB, MongoDB, Event Listeners.

Navigate to the root of the project folder (~/immunochain-core$)
```sh
     $ suod docker-compose -f api.yaml up
```
##### 4) Check if everything is up and running.
Open a web browser:
NOTE: (replace localhost with IP address as applicable)

Check if ben_chain is up and running:

http://localhost:8008/batches

This should show you the batches of Beneficiary chain.

Check if vac_chain is up and running:

http://localhost:8009/batches

This should show you the batches of Vaccine chain.

Check if api is up and running:

Use postman/insomnia to post a call to api and receive a response.





