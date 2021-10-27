import React, {Component} from "react";
import logo from './logo.svg';
import './App.css';
import web3 from './web3';
import lottery from './lottery';

class App extends Component {
  // ES2016 short form moved to constructor
  state = {
    manager: '',
    players: [],
    balance: '',
    value: '',
    message: ''
  };

  // Used to load data
  async componentDidMount() {
    // When we use Metamask provider, it has default account (first account) signed into inside metamask
    // No need for a from field.
    const manager = await lottery.methods.manager().call();
    const players = await lottery.methods.getAllPlayers().call();
    const balance = await web3.eth.getBalance(lottery.options.address);
    this.setState({ manager, players, balance });
  }

  onSubmit = async (event) => {
    event.preventDefault();
    // Load accounts from user's metamask
    const accounts = await web3.eth.getAccounts();

    this.setState({ message: 'Waiting on transaction confirmation...'})

    await lottery.methods.enterLottery().send({
      from: accounts[0],
      // Convert from ether to wei units
      value: web3.utils.toWei(this.state.value, 'ether')
    });

    this.setState({ message: 'You have been entered successfully!'})
  }

  onClick = async () => {
    // Load accounts from user's metamask
    const accounts = await web3.eth.getAccounts();

    // Load total prize pool before payout
    const payout = await web3.eth.getBalance(lottery.options.address);
    const etherpayout = web3.utils.fromWei(payout, 'ether')

    // Let user know we are waiting on the block to process transaction
    this.setState({ message: 'Waiting on transaction confirmation...'})

    // Run the pickWinner method on the lottery contract
    await lottery.methods.pickWinner().send({
      from: accounts[0]
    })

    // Get the winner address from the contract
    const winner = await lottery.methods.lastWinner().call();

    // Let user know a winner has been picked
    this.setState({ message: `A winner has been picked! \n 
    Congratulations to ${winner} on winning ${etherpayout} ETH!`})
  }

  render() {
    return (
      <div>
        <h2>50/50 Charity Raffle Contract</h2>
        <p>
          This contract is managed by account: {this.state.manager} <br />
          There are currently {this.state.players.length} people that have entered into this 50/50 raffle.<br />
          The total prize pool collected is currently at a total of {web3.utils.fromWei(this.state.balance, 'ether')} ‎ETH!
        </p>

        <hr />

        <form onSubmit={this.onSubmit}>
          <h4>Want to participate in this 50/50 raffle draw?</h4>
          <div>
            <label>Amount of ETH to enter</label>
            <input onChange={event => this.setState({ value: event.target.value })} />
          </div>
          <button>Enter</button>
        </form>

        <hr />

        <h4>End the raffle and pick a winner? (must be the contract manager)</h4>
        <button onClick={ this.onClick }>End</button>

        <hr />
        <h2>{this.state.message}</h2>
      </div>
    );
  }
}

export default App;
