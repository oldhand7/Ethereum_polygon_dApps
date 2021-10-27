import React, { Component } from 'react'
import instance from '../ethereum/instance'
import { Card, Button } from 'semantic-ui-react'
import Layout from '../components/Layout'
import { Link } from '../routes'
import Fundraiser from '../ethereum/fundraiser'

class KickstarterIndex extends Component {
    // Required to be static by Next.js
    static async getInitialProps() {
        // Retrieves addresses of all the deployed fundraisers
        const addresses = await instance.methods.getDeployedInstances().call();

        // Returns promises of the fundraiser titles
        const promises = addresses.map(async address => {
            const eachFundraiser = Fundraiser(address);

            const title = await eachFundraiser.methods.fundraiserTitle().call();

            return title;
        })

        // Resolves all the promises returned
        const titles = await Promise.all(promises);
        
        // Create the final instances object which contains addresses with titles
        let instances = {};
        addresses.forEach((address, i) => instances[address] = titles[i]);

        return { addresses, instances };
    }

    // Card for different deployed fundraiser instances
    renderInstances() {
        const items = this.props.addresses.map( address => {
            
            return {
                header: this.props.instances[address],
                meta: "Contract Address: " + address,
                description: (
                    
                    // Wildcard address is used in route.js
                    <Link route={`/fundraisers/${address}`}>
                        <a>View Fundraiser</a>
                    </Link>
                ),
                fluid: true
            }
        });

        return <Card.Group 
                    items={items} 
                    style={{ width: '40vw', overflowWrap: 'break-word' }}  
                />;
    }

    // Need to define a render method for some jsx
    render() {
        return <Layout>
                
                    <h3>Active Fundraisers</h3>

                    <Link route="/fundraisers/new">
                        <a>
                            <Button floated="right" content="Create Fundraiser" 
                            icon="add circle" primary={true} labelPosition="right" />
                        </a>
                    </Link>

                    {this.renderInstances()}
                
               </Layout>
    }
}

export default KickstarterIndex;