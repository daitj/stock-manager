import React from 'react';
export default class StockCreate extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            StockName: '',
            StockAmount: 0,
        }
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this)
        this.handleAmountChange = this.handleAmountChange.bind(this)

    }
    handleNameChange(e){
        e.target.value = e.target.value.toUpperCase()
        this.setState({
            StockName: e.target.value
        })
    }
    handleAmountChange(e){
        this.setState({
            StockAmount: e.target.value
        })
    }
    handleSubmit(){
        this.props.OnNewSave(this.state.StockName, this.state.StockAmount)
        this.setState({
            StockName: '',
            StockAmount: 0,
        })
    }
    render() {
        return (
            <div id="create-stock" className="modal fade" tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                            <h4 className="modal-title">Create new portfolio</h4>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label> Stock Name </label>
                                <input type="text" className="form-control stock-name" value={this.state.StockName} onChange={this.handleNameChange} name="stock-name" placeholder="Stock Name" />
                            </div>
                            <div className="form-group">
                                <label> Stock Amount </label>
                                <input type="text" className="form-control stock-amount" value={this.state.StockAmount} onChange={this.handleAmountChange} name="stock-amount" placeholder="Stock Amount" />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary" onClick={this.handleSubmit}>Save changes</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}