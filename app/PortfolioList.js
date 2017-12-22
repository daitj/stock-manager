import React from 'react';
export default class PortfolioList extends React.Component {
    constructor(props) {
        super(props)
        this.handlePortfolioRemove = this.handlePortfolioRemove.bind(this);
        this.handleStockAdd = this.handleStockAdd.bind(this);
        this.handleStockRemove = this.handleStockRemove.bind(this);

    }
    handlePortfolioRemove(PortfolioId){
        this.props.OnPortfolioDelete(PortfolioId)
    }
    handleStockAdd(){
        
    }
    handleStockRemove(){
        
    }
    render() {
        return (
            <div>
            {
                this.props.Portfolios.map((Portfolio, i) =>
                <div className="col-md-6" key={i}>
                    <div className="delete"><button className="btn btn-danger" value={i} onClick={()=>this.handlePortfolioRemove(i)}>&times;</button></div>
                    <div className="row">
                        <div className="col-md-11">
                        {Portfolio.Name}
                        </div>
                        <div className="col-md-1">
                        </div>
                    </div>
                </div>)
            }
            </div>
        )
    }
}