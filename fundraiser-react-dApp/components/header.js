import React from 'react'
import { Menu } from 'semantic-ui-react'
import { Link } from '../routes'

export default () => {
    return (
        <Menu style={{ marginTop: '10px' }}>
            <Link route="/">
                <a className="item">
                <img style={{ marginRight: '10px',  width: '30px', height: '30px'}} src='/static/eth.png' alt='Logo'/>
                Ethereum Kickstarter
                </a>
            </Link>
        
            <Menu.Menu position="right">
                <Link route="/">
                    <a className="item">Active Fundraisers</a>
                </Link>

                <Link route="/fundraisers/new">
                    <a className="item">+ Create Fundraiser</a>
                </Link>
            </Menu.Menu>
        </Menu>
    )
}