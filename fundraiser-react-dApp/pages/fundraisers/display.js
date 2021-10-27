import React, { Component } from 'react'
import Layout from '../../components/Layout'
import Fundraiser from '../../ethereum/fundraiser'
import { Card, Grid, Button } from 'semantic-ui-react'
import web3 from '../../ethereum/web3'
import ContributeForm from '../../components/ContributeForm'
import { Link } from '../../routes'

class FundraiserDisplay extends Component {
    // Function gets called automatically before component is rendered.
    // Returned as an object and can now access via the props object.
    static async getInitialProps(props) {
        // Call our created function which creates an instance of the
        // contract and passing in the address of the url obtained
        // from the props.query property.
        const fundraiser = Fundraiser(props.query.address);

        const summary = await fundraiser.methods.getSummary().call();

        return {
            address: props.query.address,
            minimumContribution: summary[0],
            balance: summary[1],
            requestsCount: summary[2],
            contributorsCount: summary[3],
            manager: summary[4],
            title: summary[5],
            description: summary[6]
        };
    }

    renderFundraiserDetails() {
        // Destructuring
        const {
            balance,
            manager,
            minimumContribution,
            requestsCount,
            contributorsCount
        } = this.props;

        const items = [
            {
                header: manager,
                meta: 'Contract Manager Address',
                description: 'The manager is the owner who created this fundraiser contract and can create spending requests to withdraw ether.',
                style: { overflowWrap: 'break-word' }
            },
            {
                // Converts wei units to wei using web3 library
                header: web3.utils.fromWei(balance, 'ether'),
                meta: 'Fundraiser Current Balance in Ether',
                description: 'This balance is the total amount of ether this fundraiser currently holds.'
            },
            {
                header: web3.utils.fromWei(minimumContribution, 'ether'),
                meta: 'Minimum Contribution Amount in Ether',
                description: 'Minimum contribution amount is the minimum required contribution in wei for this fundraiser, set by the owner of this contract.'
            },
            {
                header: contributorsCount,
                meta: 'Number of Contributors',
                description: 'A contributor is someone who has already donated to this fundraiser and can approve spending requests.'
            },
            {
                header: requestsCount,
                meta: 'Number of Spending Requests',
                description: 'A spending request is when the owner of this fundraiser wants to withdraw ether from this contract balance. Requests must be approved by contributors.'
            }
        ]

        return <Card.Group items={items} />
    }

    render() {
        return (
            <Layout>

                <h3>Viewing {this.props.title} </h3>
                <p>{this.props.description}</p>

                <Grid>
                    <Grid.Row>
                        <Grid.Column width={10}>
                            {this.renderFundraiserDetails()}
                        </Grid.Column>
                
                        <Grid.Column width={6}>
                            <ContributeForm address={this.props.address}/>
                        </Grid.Column>
                    </Grid.Row>

                    <Grid.Row>
                        <Grid.Column>
                            <Link route={`/fundraisers/${this.props.address}/requests`}>
                                <a>
                                    <Button primary>View Requests</Button>
                                </a>
                            </Link>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                
            </Layout>
        )
    }
}

export default FundraiserDisplay