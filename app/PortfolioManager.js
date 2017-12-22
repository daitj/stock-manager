import React from 'react'
import PortfolioCreate from './PortfolioCreate.js'
import PortfolioList from './PortfolioList.js'

export default class PortfolioManager extends React.Component {
    constructor(props) {
        super(props)
        this.showCreateDialog = this.showCreateDialog.bind(this);
        this.savePortfolio = this.savePortfolio.bind(this);
        this.removePortfolio = this.removePortfolio.bind(this);
        this.saveStockInPortfolio = this.saveStockInPortfolio.bind(this);
        this.removeStockFromPortfolio = this.removeStockFromPortfolio.bind(this);
        if (localStorage.getItem('Portfolios') === null)
        {
            localStorage.setItem('Portfolios',JSON.stringify([]));
        }
        this.state = {
            Portfolios: [],
            FirstLaunch: true,
            NeedsSave: false,
        }
    }
    componentWillMount(){
        if(this.state.FirstLaunch){
            this.setState({
                Portfolios: JSON.parse(localStorage.getItem("Portfolios")),
                FirstLaunch: false
            })
        }
    }
    componentDidUpdate(prevProps, prevState) {
        if(this.state.NeedsSave){
            localStorage.setItem('Portfolios',JSON.stringify(this.state.Portfolios));
            this.setState({
                NeedsSave: false
            })
        }
    }
    showCreateDialog(){
        if(this.state.Portfolios.length >= 10){
            alert("Only 10 portfolios can be created")
            return;
        }
        $("#create-portfolio").modal('show')
    }
    hideCreateDialog(){
        $("#create-portfolio").modal('hide')
    }
    savePortfolio(PortfolioName){
        console.log(this.state.Portfolios)
        if(this.state.Portfolios.length >= 10){
            alert("Only 10 portfolios can be created")
            return;
        }
        if (PortfolioName.trim() != "") {
            let NewPortfolio = {
                Name: PortfolioName,
                Stocks: []
            }
            this.setState({ 
                Portfolios: this.state.Portfolios.concat([NewPortfolio]),
                NeedsSave: true
            })
            this.hideCreateDialog();
        }else{
            alert("Name cannot be empty");
        }
    }
    removePortfolio(PortfolioId){
        console.log('del', PortfolioId)
        var result = confirm("Are you sure you want to remove the portfolio")
        if (result == false){
            return;
        }
        this.state.Portfolios.splice(PortfolioId, 1)
        this.setState({ 
            Portfolios: this.state.Portfolios,
            NeedsSave: true
        })
    }
    saveStockInPortfolio(PortfolioId, StockName, StockNumber){
        let Portfolio = this.state.Portfolios[PortfolioId]
        if(Portfolio.Stocks.length >= 50){
            alert("Only 50 stocks can be created")
            return;
        }
        let IsNewStock = true
        Portfolio.Stocks.forEach((Stock) => {
                if( Stock.Name == StockName){
                    alert("Portfolio already has that stock")
                    IsNewStock = false
                }
            }
        )
        if (IsNewStock){
            const NewStock = {
                Name: StockName,
                Amount: StockNumber
            }
            Portfolio.Stocks.concat([StockName])
            this.setState({ 
                Portfolios: this.state.Portfolios,
                NeedsSave: true
            })
        }

    }
    removeStockFromPortfolio(PortfolioId, StockId){
        var result = confirm("Are you sure you want to remove the stock")
        if (result == false){
            return;
        }
        let Portfolio = this.state.Portfolios[PortfolioId]
        Portfolio.splice(StockId, 1)
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
                    <PortfolioList Portfolios={this.state.Portfolios} OnPortfolioDelete={this.removePortfolio} OnStockAdd={this.saveStockInPortfolio} OnStockDelete={this.removeStockFromPortfolio} />
                </div>
                <PortfolioCreate OnNewSave={this.savePortfolio} />
            </div>
        )
    }
}