// import './wdyr'; 

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';


import { BrowserRouter } from 'react-router-dom';
import Config from './common/Config';
import { ConfigProvider } from 'antd';

import esEs from 'antd/lib/locale/es_ES'

ReactDOM.render(
    <React.StrictMode>
        <BrowserRouter basename={Config.getViewContextPath()}>
            <ConfigProvider locale={esEs}>
                <App />
            </ConfigProvider>
        </BrowserRouter>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
