# ImmunoChain Dashboard
Immunochain dashboard provides vaccination analytics which gives a detailed view of vaccines available in a station, the immunization details and vaccines administered details. Reports can be easily generated according to inputs such as time period, vaccine name, batchId of vaccine etc. An overall count of the vaccines administered will be listed.

There is provision to collect the details of the beneficiary for registration. Currently the beneficiary details are entered through RCH portal. To avail the details of the beneficiary for the Immunochain App, a registration page is provided for collecting the family details, pregnancy details and service provider details. When the registration is completed, a QR code will be generated which can be pasted on the existing RCH book for future reference. The registration details can be edited and there is provision to add new pregnancy details for an already registered beneficiary. The vaccines missed for the child will be listed and there is provision for entering the vaccines given to the child which are not available in the app.
A user registration form is provided for registering the users who have permission to use the app. Various roles can be set during the registration so that only those functionalities which are assigned to that role are visible to the user.

## Bringing up the project
We have to do two steps for bringing up the app.
### Build
```bash
docker-compose -f immuno_dashboard.yaml build
```

### Up
```bash
docker-compose -f immuno_dashboard.yaml up
```

# Pages

1. ## Vaccination Analytics
Vaccination Analytics provides information about vaccines available in each station and immunization details

The Vaccination Analytics tab has three sub-tabs:

1. Immunization Counter
2. Vaccines in stock
3. Immunization Register
4. Vaccine Administration Register

### Immunization Counter
An overall count of the vaccines administered will be listed in this page.

### Vaccines in stock
Vaccines in stock page displays a bar graph (bar chart) of the vaccines available in a station. From the graph it is easy to understand the available vaccines and the dose count.

### Immunization Register
Immunization register will give the immunization report which provides the details about the children undergone vaccination during a time period under one or more stations.

### Vaccine Administration Register
Vaccine administration register will give the immunization report which provides the details about the vaccines administered in a given station.


2. ## Beneficiary Registration
The beneficiary details have to be entered through the Registration process. Three levels of information are collected - family details, pregnancy details and service provider details. Once the registration process is completed, a QR code will be generated, which can be printed and pasted on the RCH book.

3. ## View/Edit Beneficiary Information

There is provision to edit the details entered during beneficiary registration. The QR code can also be regenerated. There is provision to add new pregnancy details for an already registered beneficiary and can add the child details. Under the child details, the vaccine details will be listed and there is provision to enter the details of vaccine given without using the app.

4. ## User Registration
The user registration mechanism provides a form that allows new users to register themselves on the system.


[Detailed user manual](https://docs.google.com/document/d/1aDM7KDM1frdkSl2IJi_REuyQgrSVVODT_n5Z3vMM4Zs/edit)






