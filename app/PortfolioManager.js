import React from 'react'
import PortfolioCreate from './PortfolioCreate.js'
import PortfolioList from './PortfolioList.js'

export default class PortfolioManager extends React.Component {
    constructor(props) {
        super(props)
        this.apiKey = "5D7EUX29MBAQGG5H"
        this.showCreateDialog = this.showCreateDialog.bind(this);
        this.savePortfolio = this.savePortfolio.bind(this);
        this.removePortfolio = this.removePortfolio.bind(this);
        this.saveStockInPortfolio = this.saveStockInPortfolio.bind(this);
        this.removeMultipleStocksFromPortfolio = this.removeMultipleStocksFromPortfolio.bind(this);
        this.changeCurrency = this.changeCurrency.bind(this);
        this.getExchangeRate = this.getExchangeRate.bind(this);
        if (localStorage.getItem('Portfolios') === null) {
            localStorage.setItem('Portfolios', JSON.stringify([]));
        }
        this.state = {
            Portfolios: [],
            FirstLaunch: true,
            NeedsSave: false,
            Currency: 'EUR',
            USD_EUR: 0,
        }
    }
    componentWillMount() {
        if (this.state.FirstLaunch) {
            this.setState({
                Portfolios: JSON.parse(localStorage.getItem("Portfolios")),
                FirstLaunch: false
            })
            this.getExchangeRate()
        }
    }
    componentDidUpdate(prevProps, prevState) {
        if (this.state.NeedsSave) {
            localStorage.setItem('Portfolios', JSON.stringify(this.state.Portfolios));
            this.setState({
                NeedsSave: false
            })
        }
    }
    getExchangeRate(){
        const exchange_url = "https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=EUR&apikey="+ this.apiKey
        fetch(exchange_url)
                .then(response => response.json())
                .then(data => {
                    const mainObj = data[Object.keys(data)[0]]
                    const exchange_rate = mainObj[Object.keys(mainObj)[4]]
                    this.setState({
                        USD_EUR: exchange_rate
                    })
                }).catch(err => {
                    console.error("Error fetching intraday", err.toString())
                    alert("Couldn't fetch exchange rates from API")
                })
    }
    showCreateDialog() {
        if (this.state.Portfolios.length >= 10) {
            alert("Only 10 portfolios can be created")
            return;
        }
        $("#create-portfolio").modal('show')
    }
    hideCreateDialog() {
        $("#create-portfolio").modal('hide')
    }
    savePortfolio(PortfolioName) {
        if (this.state.Portfolios.length >= 10) {
            alert("Only 10 portfolios can be created")
            return;
        }
        if (PortfolioName.trim() != "") {
            let NewPortfolio = {
                Name: PortfolioName,
                Currency: 'EUR',
                Stocks: []
            }
            this.setState({
                Portfolios: this.state.Portfolios.concat([NewPortfolio]),
                NeedsSave: true
            })
            this.hideCreateDialog();
        } else {
            alert("Name cannot be empty");
        }
    }
    removePortfolio(PortfolioId) {
        var result = confirm("Are you sure you want to remove the portfolio")
        if (result == false) {
            return;
        }
        this.state.Portfolios.splice(PortfolioId, 1)
        this.setState({
            Portfolios: this.state.Portfolios,
            NeedsSave: true
        })
    }
    saveStockInPortfolio(PortfolioId, StockName, StockNumber) {
        let Portfolio = this.state.Portfolios[PortfolioId]
        if (Portfolio.Stocks.length >= 50) {
            alert("Only 50 stocks can be created")
            return;
        }
        let IsNewStock = true
        Portfolio.Stocks.forEach((Stock) => {
            if (Stock.Name == StockName) {
                alert("Portfolio already has that stock")
                IsNewStock = false
            }
        }
        )
        if (IsNewStock) {
            const NewStock = {
                Name: StockName,
                Amount: StockNumber
            }
            Portfolio.Stocks = Portfolio.Stocks.concat([NewStock])
            this.setState({
                Portfolios: this.state.Portfolios,
                NeedsSave: true
            })
        }

    }
    removeMultipleStocksFromPortfolio(PortfolioId, StockIds) {
        let Portfolio = this.state.Portfolios[PortfolioId]
        Portfolio.Stocks = Portfolio.Stocks.filter((value, index, arr) =>
            (StockIds.includes(index)) ? false : true
        )
        this.setState({
            Portfolios: this.state.Portfolios,
            NeedsSave: true
        })
    }
    changeCurrency(PortfolioId, NewCurrency) {
        let Portfolio = this.state.Portfolios[PortfolioId]
        Portfolio.Currency = NewCurrency
        this.setState({
            Portfolios: this.state.Portfolios,
            NeedsSave: true
        })
    }
    render() {
        return (
            <div>
                <button type="button" className="btn btn-primary" onClick={this.showCreateDialog}>Add Portfolio</button>
                <div className="row">
                    {
                        (this.state.USD_EUR == 0) ? <span>Loading exchange rate</span> : ""
                    }
                    <PortfolioList Portfolios={this.state.Portfolios} USD_EUR={this.state.USD_EUR} APIKey={this.apiKey} OnCurrencyChange={this.changeCurrency} OnPortfolioDelete={this.removePortfolio} OnStockAdd={this.saveStockInPortfolio} OnMultipleStocksDelete={this.removeMultipleStocksFromPortfolio} />
                </div>
                <PortfolioCreate OnNewSave={this.savePortfolio} />
            </div>
        )
    }
}