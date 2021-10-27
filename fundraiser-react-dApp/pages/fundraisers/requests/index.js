import React, { Component } from 'react'
import Layout from '../../../components/Layout'
import { Button, Table, Message } from 'semantic-ui-react'
import { Link } from '../../../routes'
import Fundraiser from '../../../ethereum/fundraiser'
import RequestRow from '../../../components/RequestRow'

class FundraiserRequest extends Component {
    static async getInitialProps(props) {
        const { address } = props.query
        const fundraiser = Fundraiser(address)
        const requestCount = await fundraiser.methods.getRequestsCount().call()
        const contributorsCount = await fundraiser.methods.contributorsCount().call()
        const title = await fundraiser.methods.fundraiserTitle().call()

        // Resolve an array of all the promises which give us an array of Requests
        const requests = await Promise.all(
            Array(parseInt(requestCount)).fill().map((element, i) => {
                return fundraiser.methods.requests(i).call()
            })
        )

        return { address, requests, requestCount, contributorsCount, title }
    }

    // Helper method to iterate through every request and return a row for each one
    renderRow() {
        return this.props.requests.map((request, i) => {
            return (
                <RequestRow 
                    id={i}
                    key={i}
                    request={request}
                    address={this.props.address}
                    contributorsCount={this.props.contributorsCount}
                />
            )
        })
    }

    render() {
        const { Header, Row, HeaderCell, Body } = Table;

        return (
            <Layout>
                <Link route={`/fundraisers/${this.props.address}`}>
                    <a>Back</a>
                </Link>

                <h3>{this.props.title} Spending Requests
                    <Link route={`/fundraisers/${this.props.address}/requests/new`}>
                            <a>
                                <Button
                                    style={{ marginBottom: 10 }}
                                    floated="right"
                                    icon="add circle" 
                                    primary={true} 
                                    labelPosition="right"
                                    content="Add Request"
                                />
                            </a>
                    </Link>
                </h3>

                <Table>
                    <Header>
                        <Row>
                            <HeaderCell>Request ID</HeaderCell>
                            <HeaderCell>Description</HeaderCell>
                            <HeaderCell>Amount in Ether</HeaderCell>
                            <HeaderCell>Recipient Address</HeaderCell>
                            <HeaderCell>Approvals Required</HeaderCell>
                            <HeaderCell>Approve</HeaderCell>
                            <HeaderCell>Finalize</HeaderCell>
                        </Row>
                    </Header>
                    <Body>
                        {this.renderRow()}
                    </Body>
                </Table>

                <div>
                    Found {this.props.requestCount} spending requests.
                </div>

            </Layout>
        )
    }
}

export default FundraiserRequest;