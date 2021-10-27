import React, { Component } from 'react'
import { Table, Button, Message, Icon } from 'semantic-ui-react'
import web3 from '../ethereum/web3'
import { Link } from '../routes'
import Fundraiser from '../ethereum/fundraiser'

class RequestRow extends Component {
    state = {
        loadingApprove: false,
        loadingFinalize: false,
        positiveApprove: false,
        errorApprove: false,
        positiveFinalize: false,
        errorFinalize: false
    }

    onApprove = async () => {
        const fundraiser = Fundraiser(this.props.address)

        await ethereum.enable();

        const accounts = await web3.eth.getAccounts()

        this.setState({ loadingApprove: true, positiveApprove: false, errorApprove: false })
        try {
            await fundraiser.methods.approveRequest(this.props.id).send({
                from: accounts[0]
            })

            this.setState({ positiveApprove: true })
        } catch (err) {
            this.setState({ errorApprove: true })
        }

        this.setState({ loadingApprove: false })
    }

    onFinalize = async () => {
        const fundraiser = Fundraiser(this.props.address)

        await ethereum.enable();

        const accounts = await web3.eth.getAccounts()

        this.setState({ loadingFinalize: true, positiveFinalize: false, errorFinalize: false })
        try {
            await fundraiser.methods.finalizeRequest(this.props.id).send({
                from: accounts[0]
            })

            this.setState({ positiveFinalize: true })
        } catch (err) {
            this.setState({ errorFinalize: true })
        }

        this.setState({ loadingFinalize: false })
    }

    render() {
        //Destructuring for cleaner syntax
        const { Row, Cell } = Table
        const { id, request, contributorsCount } = this.props

        //A flag to determine if a spending request can be finalized (total / 2)
        const canFinalize = request.numOfYesVotes > contributorsCount / 2

        return (
            <Row 
                disabled={request.complete} 
                positive={canFinalize && !request.complete}>

                <Cell>{id}</Cell>

                <Cell>{request.description}</Cell>

                <Cell>{web3.utils.fromWei(request.value, 'ether')}</Cell>

                <Cell>
                    {request.complete ? request.recipient :
                        <Link route={'https://rinkeby.etherscan.io/address/' + request.recipient}>
                            <a>{request.recipient}</a>
                        </Link>
                    }                    
                </Cell>

                <Cell>{request.numOfYesVotes} of {Math.ceil(contributorsCount / 2)}</Cell>

                <Cell>
                    {request.complete ? 'Completed' : (
                        <Button 
                            compact
                            positive={this.state.positiveApprove}
                            negative={this.state.errorApprove}
                            basic={! (this.state.positiveApprove || this.state.errorApprove)}
                            color="blue" 
                            onClick={this.onApprove}
                            loading={this.state.loadingApprove}
                            content={'Approve'}
                        />
                    )}
                </Cell>

                <Cell>
                    {request.complete ? 'Completed' : (
                        canFinalize ? 
                            <Button 
                                compact
                                positive={this.state.positiveFinalize}
                                negative={this.state.errorFinalize}
                                basic={! (this.state.positiveFinalize || this.state.errorFinalize)}
                                color="blue" 
                                onClick={this.onFinalize}
                                loading={this.state.loadingFinalize}>
                                    Finalize
                            </Button> : 
                                'Votes Required'
                    )}
                </Cell>
            </Row>
        )
    }
}

export default RequestRow