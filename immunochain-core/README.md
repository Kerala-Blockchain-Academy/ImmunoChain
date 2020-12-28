# ImmunoChain-core

Immunochain-Core is a project which deals with all the APIs required for the project  Immunochain, i.e. the web as well as the mobile application of the project. It is the core back end of immunochain. Various services used by this project include:

* Hyperledger Sawtooth Network and its dependencies.
* Flask for serving the application REST APIs.
* PostgresDB for storing the data generated.
* CassandraDB for further analytics of the above said data.
* MongoDB for logging the HTTP calls' data.
* RabbitMQ for serving asynchronous calls between application and blockchain network.


## Steps to see API spec
 * ```cd ./docs/api_spec```
 * run ```bash start```
 * open http://localhost:4400 to view the api spec
 * run ```docker stop api_spec``` to stop the container serving the api spec
 * the swagger that defines the API is available at in the docs/api_spec folder location

 [API Doc View on Git](docs/api_spec/swagger.json)

 ## Steps to run API server in Docker
 * navigate to the root dir
 * run ```docker-compose -f api.yaml build```
 * run ```docker-compose -f api.yaml up```

 ## Git commit format
 * [#&lt;issue number&gt;]&lt;space&gt;Commit Message/Title
 * Add WIP: at the begining, if the work is in progress
 * For example WIP:[#1] Sample test message

## Steps to bring up Sawtooth network, InfluxDB and Grafana

  For this project, we are running two sawtooth networks. The first one is a beneficiary chain that keeps the record of beneficiary data and the second one is a vaccination chain that keeps records related to vaccines. In the root folder, we have two separate yaml files, ben_chain.yaml and vac_chain.yaml, that deals with the deployment and running of both beneficiary and vaccination network respectively. Inside the yaml files,  we have the written configurations for running the two nodes. Each node contains the following services inside it.

   1. telegraf: Telegraf is an agent responsible for gathering and aggregating data, like the current CPU usage of our application.

   2. Grafana: It is an open-source platform for data visualization, monitoring and analysis. Here we use grafana to monitor our network.

   3. InfluxDB: InfluxDB is a time series database designed to handle high write and query loads. In our project it is used to record networks metrics datas.

   4. Four validators: They validate batches of transactions, combining them into blocks, maintaining consensus with the network, and coordinating communication between clients, other validators, and transaction processors.

   5. settings-tp: Which provides a methodology for storing on-chain configuration settings.

   6. tp(Transaction Processor): It contains the business logic of the application.

   7. Nginx server: It is a proxy server that serves to beneficiary and vaccine data blockchains.

   8. sawtooth-rest-api: Hyperledger Sawtooth provides a REST API that allows clients to interact with a validator using common HTTP/JSON standards. It is a pragmatic RESTful API that provides a language-neutral interface for submitting transactions and reading blocks.

 * Install Docker and Docker-Compose
 * run ```docker-compose -f ben_chain.yaml up``` for beneficiary data blockchain.
 * run ```docker-compose -f vac_chain.yaml up``` for vaccination data blockchain.
 * run ```docker-compose -f ben_node.yaml up``` for adding new nodes on beneficiary network during their running time.
 * run ```docker-compose -f ben_node.yaml up``` for adding new nodes on vaccination network during their running time.
 * Once both the chains are up, they can be accessed via 5001 port. eg: ```:5001/ben/transactions``` for beneficiary chain and ```:5001/vac/transactions``` for vaccination chain.
 * Grafana for viewing realtime analytics can be accessed via 3001 port.
