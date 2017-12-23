import React from 'react';
import StockCreate from './StockCreate.js'
import ChartCreate from './ChartCreate.js'

export default class PortfolioList extends React.Component {
    constructor(props) {
        super(props)
        this.handlePortfolioRemove = this.handlePortfolioRemove.bind(this)
        this.handleStockAdd = this.handleStockAdd.bind(this)
        this.handleStockNewSubmit = this.handleStockNewSubmit.bind(this)
        this.handleStockSelectedChange = this.handleStockSelectedChange.bind(this)
        this.handleRemoveSelectedStocks = this.handleRemoveSelectedStocks.bind(this)
        this.getLatestCloseValueFromAPI = this.getLatestCloseValueFromAPI.bind(this)
        this.checkAllLoaded = this.checkAllLoaded.bind(this)
        this.getTotalFromStocks = this.getTotalFromStocks.bind(this)
        this.handleLoadChart = this.handleLoadChart.bind(this)
        this.currentPortfolioId
        this.selectedStockInPortfolios = {}
        this.currentlyFetching = {}
        this.alreadyFetched = {}
        this.state = {
            CachedStockValue: {},
            ChartPortfolio: null
        }

    }
    componentWillMount() {
        let uniqueStockNames = []
        this.props.Portfolios.forEach((Portfolio) => {
            Portfolio.Stocks.forEach((Stock) => {
                this.getLatestCloseValueFromAPI(Stock.Name)
                if (!uniqueStockNames.includes(Stock.Name)) {
                    uniqueStockNames.push(Stock.Name)
                }
            })
        })
        uniqueStockNames.forEach((names) => {
            this.state.CachedStockValue[names] = "..."
        })
        this.checkAllLoaded()
    }
    checkAllLoaded() {
        if (Object.keys(this.alreadyFetched).length == Object.keys(this.currentlyFetching).length) {

            this.setState({
                CachedStockValue: this.state.CachedStockValue
            })
        } else {
            setTimeout(this.checkAllLoaded, 1000)
        }
    }
    getLatestCloseValueFromAPI(StockName, NeedsUpdate = false) {
        if ((StockName in this.state.CachedStockValue) && !NeedsUpdate) {
            //loading from cache
        } else if (!this.currentlyFetching[StockName]) {
            this.currentlyFetching[StockName] = true
            const get_stock_intraday_url = "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=" + StockName + "&interval=1min&apikey=" + this.props.APIKey + "&outputsize=compact"
            fetch(get_stock_intraday_url)
                .then(response => response.json())
                .then(data => {
                    const timed_data = data[Object.keys(data)[1]]
                    const latest_data = timed_data[Object.keys(timed_data)[0]]
                    const latest_closed_value = latest_data[Object.keys(latest_data)[3]]
                    this.state.CachedStockValue[StockName] = latest_closed_value
                    this.alreadyFetched[StockName] = true
                    if (NeedsUpdate) {
                        this.setState({
                            CachedStockValue: this.state.CachedStockValue
                        })
                    }
                }).catch(err => {
                    console.error("Error fetching intraday", err.toString())
                    alert("There was an error while getting API response, refresh the page and try again.")
                    this.state.CachedStockValue[StockName] = "error"
                    this.alreadyFetched[StockName] = true
                    if (NeedsUpdate) {
                        this.setState({
                            CachedStockValue: this.state.CachedStockValue
                        })
                    }
                })
        }
    }
    handlePortfolioRemove(PortfolioId) {
        this.props.OnPortfolioDelete(PortfolioId)
    }
    handleStockAdd(PortfolioId) {
        this.currentPortfolioId = PortfolioId
        let Portfolio = this.props.Portfolios[PortfolioId]
        if (Portfolio.Stocks.length >= 50) {
            alert("Only 50 stocks can be created")
            return;
        }
        this.showStockCreateDialog()
    }
    handleCurrencyChange(PortfolioId, NewCurrency) {
        this.props.OnCurrencyChange(PortfolioId, NewCurrency)
    }
    handleStockSelectedChange(e, PortfolioId, StockId) {
        if (!(PortfolioId in this.selectedStockInPortfolios)) {
            this.selectedStockInPortfolios[PortfolioId] = []
        }
        if (e.target.checked) {
            this.selectedStockInPortfolios[PortfolioId].push(StockId)
        } else {
            this.selectedStockInPortfolios[PortfolioId] = this.selectedStockInPortfolios[PortfolioId].filter((value, index, arr) =>
                (value == StockId) ? false : true
            )
        }
    }
    handleRemoveSelectedStocks(PortfolioId) {
        if (!(PortfolioId in this.selectedStockInPortfolios)) {
            alert("Nothing is selected")
            return
        }
        if (this.selectedStockInPortfolios[PortfolioId].length === 0) {
            alert("Nothing is selected")
            return
        }
        var result = confirm("Are you sure you want to remove the stocks?")
        if (result == false) {
            return
        }
        this.props.OnMultipleStocksDelete(PortfolioId, this.selectedStockInPortfolios[PortfolioId])
    }
    showStockCreateDialog() {
        $("#create-stock").modal('show')
    }
    hideStockCreateDialog() {
        $("#create-stock").modal('hide')
    }
    handleStockNewSubmit(StockName, StockAmount) {
        this.props.OnStockAdd(this.currentPortfolioId, StockName, StockAmount)
        this.hideStockCreateDialog()
        this.state.CachedStockValue[StockName] = '...'
        this.currentlyFetching[StockName]  = false
        this.getLatestCloseValueFromAPI(StockName, true)
    }
    handleLoadChart(Portfolio){
        this.setState({
            ChartPortfolio: Portfolio
        },()=>{
            this.Chart.reloadChartData()
            $("#show-chart").modal("show")
        })
    }
    getCorrectCurrency(Currency, Value) {
        if (Value.toString() == "NaN" || Value == "...") {
            return "..."
        }else if( Value == 'error'){
            return 'ERROR'
        }
        if (Currency == "EUR") {
            if (this.props.USD_EUR && this.props.USD_EUR !== 0) {
                return Number(Value * this.props.USD_EUR).toFixed(3) + " EUR"
            } else {
                return "..."
            }
        } else {
            return Number(Value).toFixed(3) + " USD"
        }
    }
    getTotalFromStocks(Currency, Stocks) {
        let TotalSum = 0
        Stocks.forEach((Stock)=>{
            let StockValue = this.state.CachedStockValue[Stock.Name]
            if(StockValue != "error"){
                TotalSum += Stock.Amount * StockValue
            }
        })
        const ConvertedTotalSum =  this.getCorrectCurrency(Currency, TotalSum)
        if(ConvertedTotalSum == '...'){
            return "Loading values from API..."
        }else{
            return ConvertedTotalSum
        }
    }
    render() {
        return (
            <div className="portfolioContainer">
                {
                    this.props.Portfolios.map((Portfolio, i) =>
                        <div className="portfolioRow col-md-6" key={i}>
                            <div className="row">
                                <div className="col-md-11 portfolioBox">
                                    <div className="row">
                                        <div className="col-md-4">
                                            {Portfolio.Name}
                                        </div>
                                        <div className="col-md-1">
                                        </div>
                                        <div className="col-md-3">
                                            <button className="btn btn-primary" onClick={() => this.handleCurrencyChange(i, (Portfolio.Currency == 'EUR') ? 'USD' : 'EUR')}>Show in {(Portfolio.Currency == 'EUR') ? 'Dollars' : 'Euro'}</button>
                                        </div>
                                        <div className="col-md-2">
                                        </div>
                                        <div className="col-md-2">
                                            <button className="btn btn-danger deletePortfolio" onClick={() => this.handlePortfolioRemove(i)}>&times;</button>
                                        </div>
                                    </div>
                                    <div className="row">
                                        {
                                            (Portfolio.Stocks.length > 0) ?
                                                <div>
                                                    <table className='table table-bordered table-stripped table-condensed'>
                                                        <thead>
                                                            <tr>
                                                                <th>Stock</th>
                                                                <th>Amount</th>
                                                                <th>Unit Value</th>
                                                                <th>Total Value</th>
                                                                <th></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {Portfolio.Stocks.map((Stock, j) =>
                                                                <tr key={j}>
                                                                    <td>{Stock.Name}</td>
                                                                    <td>{Stock.Amount}</td>
                                                                    <td>{this.getCorrectCurrency(Portfolio.Currency, this.state.CachedStockValue[Stock.Name])}</td>
                                                                    <td>{this.getCorrectCurrency(Portfolio.Currency, Stock.Amount * this.state.CachedStockValue[Stock.Name])}</td>
                                                                    <td><input type="checkbox" onChange={(e) => this.handleStockSelectedChange(e, i, j)} value={j} /></td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                    <span className="total">
                                                        Total: {this.getTotalFromStocks(Portfolio.Currency, Portfolio.Stocks)}
                                                    </span>
                                                </div>
                                                : ''
                                        }
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3">
                                            <button className="btn btn-primary" onClick={() => this.handleStockAdd(i)}>Add stock</button>
                                        </div>
                                        <div className="col-md-3">
                                            <button className="btn btn-info" onClick={() => this.handleLoadChart(Portfolio)}>Perf Graph</button>
                                        </div>
                                        <div className="col-md-2">
                                        </div>
                                        <div className="col-md-4">
                                            <button className="btn btn-danger" onClick={() => this.handleRemoveSelectedStocks(i)}>Remove Selected</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-1">
                                </div>
                            </div>
                        </div>)
                }
                <StockCreate OnNewSave={this.handleStockNewSubmit} />
                <ChartCreate ref={instance => { this.Chart = instance; }} APIKey={this.props.APIKey} Portfolio={this.state.ChartPortfolio} />
            </div>
        )
    }
}