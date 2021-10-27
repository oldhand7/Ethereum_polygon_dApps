import React, { Component } from 'react'
import { Form, Input, Message, Button, Icon } from 'semantic-ui-react'
import Fundraiser from '../ethereum/fundraiser'
import web3 from '../ethereum/web3'
import { Router, Link } from '../routes'

class ContributeForm extends Component {
    // Initialize state object
    state = {
        value: '',
        errorMessage: '',
        loading: false,
        success: false,
        transactionHash: ''
    }

    onSubmit = async (event) => {
        event.preventDefault()
        
        // ContributeForm has a props with the address passed in from display.js
        const fundraiser = Fundraiser(this.props.address)

        this.setState({ loading: true, errorMessage: '' })

        try {
            await ethereum.enable();

            const accounts = await web3.eth.getAccounts();

            const transaction = await fundraiser.methods.contribute().send({
                from: accounts[0],
                value: web3.utils.toWei(this.state.value, 'ether')
            })

            // Obtains deployed contract information on the blockchain
            const txHash = transaction.transactionHash

            // Displays success message after deploying the new contract
            this.setState({ success: true, transactionHash: txHash })

            // Force a refresh of the current page
            Router.replaceRoute(`/fundraisers/${this.props.address}`)

        } catch (err) {
            if (err.message === 'No \"from\" address specified in' + 
            ' neither the given options, nor the default options.') {
                this.setState({ errorMessage: 'Please login to a Metamask account!' })
            } else {
                this.setState({ errorMessage: err.message })
            }
        }

        this.setState({ loading: false, value: '' })
    }

    render() {
        return (
            <Form 
                onSubmit={this.onSubmit} 
                error={!!this.state.errorMessage}
                success={this.state.success}
            >
                <Form.Field>
                    <label>Contribute Ether to this Fundraiser</label>
                    <Input 
                        label="ether" 
                        labelPosition="right"
                        value={this.state.value} 
                        onChange={event => this.setState({ value: event.target.value })} 
                    />
                </Form.Field>

                <Message
                        style={{ overflowWrap: 'break-word' }} 
                        success >
                        <Message.Content>
                            <Message.Header>Success</Message.Header>
                            Your transaction hash is
                             
                                <Link route={'https://rinkeby.etherscan.io/tx/' + this.state.transactionHash}>
                                    <a>  {this.state.transactionHash.toString()} </a>
                                </Link>
                        </Message.Content>
                </Message>  

                <Message
                        style={{ overflowWrap: 'break-word' }}  
                        error header="Something went wrong!" 
                        content={this.state.errorMessage} 
                />

                <Message icon
                        hidden={!this.state.loading}
                        style={{ overflowWrap: 'break-word' }} >
                        <Icon name='circle notched' loading />
                        <Message.Content>
                            <Message.Header>Sending your transaction!</Message.Header>
                            We are sending your transaction to this fundraiser contract on the Ethereum blockchain.
                        </Message.Content>
                </Message>

                <Button primary loading={this.state.loading}>
                    Contribute
                </Button>
            </Form>
        )

    }
}

export default ContributeForm;