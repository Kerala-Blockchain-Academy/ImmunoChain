import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import { HashRouter } from 'react-router-dom';
import './assets/styles/base.scss';
//import 'sweetalert/dist/sweetalert.css';
import Main from './pages/Main';
import configureStore from './config/configureStore';
import { Provider } from 'react-redux';
import Login from './pages/Login'


const store = configureStore();
const rootElement = document.getElementById('root');

let loggedin = sessionStorage.getItem("logged_in");
// let loggedin = true
console.log(loggedin)


const renderApp = Component => {
  ReactDOM.render(
    // if(0){
    loggedin ? (<Provider store={store}>
      <HashRouter>
        <Component />
      </HashRouter>
    </Provider>) : <Provider store={store}><Login /></Provider>,
    rootElement
  );
};

renderApp(Main);

if (module.hot) {
  module.hot.accept('./pages/Main', () => {
    const NextApp = require('./pages/Main').default
    renderApp(NextApp);
  });
}
export default store;
registerServiceWorker();
