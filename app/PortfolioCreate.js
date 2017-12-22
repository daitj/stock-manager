import React from 'react';
export default class PortfolioCreate extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            PortfolioName: '',
        }
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handlePortfolioNameChange = this.handlePortfolioNameChange.bind(this)
    }
    handlePortfolioNameChange(e){
        this.setState({
            PortfolioName: e.target.value
        })
    }
    handleSubmit(){
        this.props.OnNewSave(this.state.PortfolioName)
        this.setState({
            PortfolioName: ''
        })
    }
    render() {
        return (
            <div id="create-portfolio" className="modal fade" tabIndex="-1" role="dialog">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                            <h4 className="modal-title">Create new portfolio</h4>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <input type="text" className="form-control portfolio-name" value={this.state.PortfolioName} onChange={this.handlePortfolioNameChange} name="portfolio-name" placeholder="Portfolio Name" />
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