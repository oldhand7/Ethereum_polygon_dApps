import React, { Component } from 'react'
import Layout from '../../components/Layout'
import { Form, Button, Input, Message, Icon } from 'semantic-ui-react'
import instance from '../../ethereum/instance'
import web3 from '../../ethereum/web3'
import { Link, Router } from '../../routes'

class FundraiserNew extends Component {
    state = {
        minimumContribution: '',
        title: '',
        description: '',
        errorMessage: '',
        transactionHash: '',
        success: false,
        loading: false,
        deploying: false
    }

    onSubmit = async (event) => {
        event.preventDefault();

        // When on submit runs, loading shows up
        this.setState({ loading: true, errorMessage: ''});

        try {
            await ethereum.enable();
            
            // Get our accounts from metamask
            const accounts = await web3.eth.getAccounts();

            // Deploying status is true
            this.setState({ deploying: true })

            // Deploys new fundraiser contract on the Ethereum network
            const deployedContract = await instance.methods
                                        .createNewInstance(
                                            web3.utils.toWei(this.state.minimumContribution, 'ether'),
                                            this.state.title,
                                            this.state.description)
                                        .send({
                                            from: accounts[0]
                                        })


            // Obtains deployed contract information on the blockchain
            const txHash = deployedContract.transactionHash

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

        // When the form is finished loading, loading is turned back to false
        this.setState({ loading: false, deploying: false })
    }

    render() {
        return (
            <Layout>
                <h3>Create a Fundraiser!</h3>

                <Form error={!!this.state.errorMessage}
                      success={this.state.success}
                      onSubmit={this.onSubmit}>

                    <Form.Field>
                        <label>Enter a Title:</label>
                        <Input
                            style={{ width: '25vw' }} 
                            value={this.state.title}
                            onChange={event => this.setState({ title: event.target.value })} 
                        />

                        <label>Enter the Minimum Contribution Amount:</label>
                        <Input
                            style={{ width: '25vw' }} 
                            label="ether" 
                            labelPosition="right" 
                            value={this.state.minimumContribution} 
                            onChange={event => this.setState({ minimumContribution: event.target.value })} 
                        />

                        <label>Enter a Description: </label>
                        <Input
                            style={{ width: '50vw' }} 
                            value={this.state.description}
                            onChange={event => this.setState({ description: event.target.value })} 
                        />

                    </Form.Field>

                    <Message
                        style={{ width: '50vw', overflowWrap: 'break-word' }} 
                        success >
                        <Message.Content>
                            <Message.Header>Success</Message.Header>
                            Your fundraiser contract is now deployed! Your transaction hash is
                             
                                <Link route={'https://rinkeby.etherscan.io/tx/' + this.state.transactionHash}>
                                    <a>  {this.state.transactionHash.toString()} </a>
                                </Link>
                        </Message.Content>
                    </Message>    

                    <Message
                        style={{ width: '50vw', overflowWrap: 'break-word' }}  
                        error header="Something went wrong!" 
                        content={this.state.errorMessage} />
                    
                    <Message icon
                        hidden={!this.state.deploying}
                        style={{ width: '50vw', overflowWrap: 'break-word' }} >
                        <Icon name='circle notched' loading />
                        <Message.Content>
                            <Message.Header>Deploying to the blockchain!</Message.Header>
                            We are deploying your new fundraiser contract on the Ethereum blockchain.
                        </Message.Content>
                    </Message>

                    <Button loading={this.state.loading} primary>Create</Button>
                </Form>
            </Layout>
        )
    }
}

export default FundraiserNew;