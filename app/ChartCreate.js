import React from 'react';
import { Line } from 'react-chartjs-2';
import { setTimeout } from 'timers';
export default class ChartCreate extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            originalChartData: {},
            chartData: {},
            startDate: '',
            endDate: '',
        }
        this.reloadChartData = this.reloadChartData.bind(this)
        this.checkDataLoaded = this.checkDataLoaded.bind(this)
        this.makeDataForChart = this.makeDataForChart.bind(this)
        this.filterData = this.filterData.bind(this)
        this.handleEndDateChange = this.handleEndDateChange.bind(this)
        this.handleStartDateChange = this.handleStartDateChange.bind(this)
        this.allDataIsFetched = false
        this.stocksToLoad = {}
        this.stocksLoadedData = {}
    }
    checkDataLoaded() {
        if (Object.keys(this.stocksToLoad).length == Object.keys(this.stocksLoadedData).length) {
            this.allDataIsFetched = true
            this.makeDataForChart()
        } else {
            this.allDataIsFetched = false
            setTimeout(this.checkDataLoaded, 1000)
        }
    }
    loadChartDataFromAPI(StockName) {
        this.stocksToLoad[StockName] = true
        const get_stock_daily_full_url = "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=" + StockName + "&outputsize=full&apikey=" + this.props.APIKey
        fetch(get_stock_daily_full_url)
            .then(response => response.json())
            .then(data => {
                const time_series = data[Object.keys(data)[1]]
                this.stocksLoadedData[StockName] = time_series
            }).catch(err => {
                console.error("Error fetching time series", err.toString())
                alert("There was an error while getting API response, refresh the page and try again.")
                this.stocksLoadedData[StockName] = {}
            })
    }
    reloadChartData() {
        this.setState({
            originalChartData: {},
            chartData: {},
            startDate: '',
            endDate: '',
        })
        this.allDataIsFetched = false
        if (this.props.Portfolio) {
            this.props.Portfolio.Stocks.forEach((Stock) => {
                this.loadChartDataFromAPI(Stock.Name)
            })
            this.checkDataLoaded()
        }
    }
    makeDataForChart() {
        console.log(this.stocksLoadedData)
        let AllDatasets = []
        let DataDateLabels = null

        Object.keys(this.stocksLoadedData).forEach((StockName, index, arr) => {
            const StockDataSeries = this.stocksLoadedData[StockName]
            const StockData = []
            Object.keys(StockDataSeries).forEach((DateKey) => {
                const DateData = StockDataSeries[DateKey]
                const ClosedValue = DateData[Object.keys(DateData)[3]]
                StockData.push(ClosedValue)
            })
            const StockDataset = {
                label: StockName,
                data: StockData.reverse(),
                fill: false,
                lineTension: 0.1,
                borderWidth: 1,
                borderJoinStyle: 'round',
                pointBorderWidth:0,
                pointHitRadus:1,
                pointRadius:0.5,
                pointBorderColor: 'hsl(' + (360 * index / arr.length) + ', 100%, 50%)',
                backgroundColor: 'hsl(' + (360 * index / arr.length) + ', 100%, 50%)',
                borderColor: 'hsl(' + (360 * index / arr.length) + ', 100%, 50%)',
            }
            AllDatasets.push(StockDataset)
            if (DataDateLabels === null) {
                DataDateLabels = Object.keys(StockDataSeries).reverse()
            }
        })
        const ChartJSFormattedData = {
            labels: DataDateLabels,
            datasets: AllDatasets
        };

        this.setState({
            chartData: ChartJSFormattedData,
            // cloning using JSON because ChartJS will modify the dataset with extra properties
            originalChartData: JSON.parse(JSON.stringify(ChartJSFormattedData))
        })
    }
    handleStartDateChange(e) {
        this.setState({
            startDate: e.target.value
        })

    }
    handleEndDateChange(e) {
        this.setState({
            endDate: e.target.value
        })
    }
    filterData() {
        if (this.state.startDate == '' && this.state.endDate == '') {
            const originalDataCloned = JSON.parse(JSON.stringify(this.state.originalChartData));
            this.setState({
                chartData: originalDataCloned
            })
            return;
        }
        else if (this.state.startDate == '' || this.state.endDate == '') {
            alert('Fill or clear both dates first')
            return;
        }
        if ((new Date(this.state.startDate).getTime() >= new Date(this.state.endDate).getTime())) {
            alert('Start date must be smaller than end date')
            return;
        }
        console.log("filter", this.state.originalChartData, this.state.startDate, this.state.endDate)
        if (this.state.originalChartData.labels.length > 0) {
            //making a clone of original data again
            const clonedData = JSON.parse(JSON.stringify(this.state.originalChartData));
            console.log(clonedData)
            let startDateIndex = 0;
            let endDateIndex =  clonedData.labels.length - 1;
            clonedData.labels.forEach((value, index) => {
                if (this.state.startDate == value) {
                    startDateIndex = index
                }
                if (this.state.endDate == value) {
                    endDateIndex = index
                }
            })
            clonedData.labels = clonedData.labels.splice(startDateIndex, endDateIndex - startDateIndex + 1)
            clonedData.datasets.forEach((dataset)=>{
                dataset.data = dataset.data.splice(startDateIndex, endDateIndex - startDateIndex + 1)
            })
            this.setState({
                chartData: clonedData
            })
        } else {
            console.log('doing nothing, since there are no labels')
        }
    }
    render() {
        return (
            <div id="show-chart" className="modal fade" tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-lg" role="document">
                    {(this.props.Portfolio) ?
                        <div className="modal-content">
                            <div className="modal-header">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                                <h4 className="modal-title">Perf Chart for {this.props.Portfolio.Name}</h4>
                            </div>
                            <div className="modal-body">
                                {
                                    (this.allDataIsFetched) ?
                                        <Line data={this.state.chartData} />
                                        : 'Loading...'
                                }
                            </div>
                            <div className="modal-footer">
                                <div className="row">
                                    <div className="col-md-2">
                                    </div>
                                    <div className="col-md-8 chartDate">
                                        {
                                            (this.allDataIsFetched) ?
                                                <form className="form-inline">
                                                    <div className="form-group">
                                                        <label className="control-label">Start date</label>
                                                        <input className='form-control' value={this.state.startDate} onChange={this.handleStartDateChange} type="date" />
                                                    </div>
                                                    <span className="dateFieldsSpacing"></span>
                                                    <div className="form-group">
                                                        <label className="control-label">End date</label>
                                                        <input className='form-control' value={this.state.endDate} onChange={this.handleEndDateChange} type="date" />
                                                    </div>
                                                    <span className="dateFieldsSpacing"></span>
                                                    <button type="button" className='btn btn-primary' onClick={this.filterData}>Filter</button>
                                                </form>
                                                : ''
                                        }

                                    </div>
                                    <div className="col-md-2">
                                        <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        : ''
                    }
                </div>
            </div>
        )
    }
}