import React, { Component } from 'react'
import { Form, Button, Message, Input, Icon } from 'semantic-ui-react'
import Fundraiser from '../../../ethereum/fundraiser'
import web3 from '../../../ethereum/web3'
import { Link, Router } from '../../../routes'
import Layout from '../../../components/Layout'

class NewRequest extends Component {
    state = {
        amount: '',
        description: '',
        recipient: '',
        loading: false,
        errorMessage: '',
        success: false,
        transactionHash: ''
    }

    static async getInitialProps(props) {
        const { address } = props.query

        return { address }
    }

    onSubmit = async event => {
        event.preventDefault();

        // Our fundraiser contract at the specified address
        const fundraiser = Fundraiser(this.props.address);

        // Destructuring to get the properties
        const { description, amount, recipient } = this.state

        // Set the loading and reset error message before doing anything
        this.setState({ loading: true, errorMessage: '' })

        try {
            await ethereum.enable();
            
            const accounts = await web3.eth.getAccounts()

            const transaction = await fundraiser.methods.createRequest(
                description, 
                web3.utils.toWei(amount, 'ether'),
                recipient
            ).send({ from: accounts[0] })

            // Obtains deployed contract information on the blockchain
            const txHash = transaction.transactionHash

            // Displays success message after deploying the new contract
            this.setState({ success: true, transactionHash: txHash })

        } catch (err) {
            if (err.message === 'No \"from\" address specified in' + 
            ' neither the given options, nor the default options.') {
                this.setState({ errorMessage: 'Please login to a Metamask account!' })
            } else {
                this.setState({ errorMessage: err.message })
            }
        }

        this.setState({ loading: false })
    }

    render() {
        return (
            <Layout>
                <Link route={`/fundraisers/${this.props.address}/requests`}>
                    <a>Back</a>
                </Link>

                <h3>Create a Spending Request</h3>
                <Form 
                    onSubmit={this.onSubmit}
                    error={!!this.state.errorMessage}
                    success={this.state.success}
                >
                    <Form.Field>
                        <label>Description</label>
                        <Input
                            style={{ width: '40vw' }} 
                            value={this.state.description}
                            onChange={event => this.setState({ description: event.target.value })}
                        />
                    </Form.Field>

                    <Form.Field>
                        <label>Amount in Ether</label>
                        <Input 
                            style={{ width: '40vw' }} 
                            value={this.state.amount}
                            label="ether" 
                            labelPosition="right"
                            onChange={event => this.setState({ amount: event.target.value })}
                        />
                    </Form.Field>

                    <Form.Field>
                        <label>Recipient Address</label>
                        <Input
                            style={{ width: '40vw' }}  
                            value={this.state.recipient}
                            onChange={event => this.setState({ recipient: event.target.value })}
                        />
                    </Form.Field>

                    <Message
                        style={{ overflowWrap: 'break-word', width: '40vw' }} 
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
                        style={{ overflowWrap: 'break-word', width: '40vw' }}  
                        error header="Something went wrong!" 
                        content={this.state.errorMessage} 
                    />

                    <Message icon
                        hidden={!this.state.loading}
                        style={{ overflowWrap: 'break-word', width: '40vw' }} >
                        <Icon name='circle notched' loading />
                        <Message.Content>
                            <Message.Header>Sending your transaction!</Message.Header>
                            We are creating your spending request and sending the transaction to the Ethereum network.
                        </Message.Content>
                    </Message>

                    <Button primary loading={this.state.loading}>Create</Button>
                </Form>
            </Layout>
        )
    }
}

export default NewRequest;