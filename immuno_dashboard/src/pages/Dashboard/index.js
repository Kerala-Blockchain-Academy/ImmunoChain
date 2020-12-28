import React from 'react';
import StationVaccinesCurrent from './StationVaccinesCurrent'
import VaccineAdministartionTable from './VaccineAdministration'
import VaccineCount from './VaccineCount'
import ImmunizationRegister from './ImmunizationRegister'


const Dashboard = () => (


    <div className="container-fluid">
        <VaccineCount />
        <div>
            <StationVaccinesCurrent />
        </div>
        <div>
            <ImmunizationRegister />
        </div>
        <div>
            <VaccineAdministartionTable />
        </div>
    </div>


);

export default Dashboard;
