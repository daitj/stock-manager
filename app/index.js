require('bootstrap/dist/css/bootstrap.min.css')
require("./css/style.css")
window.jQuery = window.$ = require('jquery/dist/jquery.min')
require('bootstrap/dist/js/bootstrap.min.js')

import React from 'react'
import ReactDOM from 'react-dom'
import PortfolioManager from './PortfolioManager.js'
ReactDOM.render(
    <PortfolioManager />,
    document.getElementById('app')
)

