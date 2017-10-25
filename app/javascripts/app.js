// Import the page's CSS. Webpack will know what to do with it.
import '../stylesheets/app.css';

// Import libraries we need.
import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract';
const ProviderEngine = require('web3-provider-engine');
const CacheSubprovider = require('web3-provider-engine/subproviders/cache.js');
const FixtureSubprovider = require('web3-provider-engine/subproviders/fixture.js');
const FilterSubprovider = require('web3-provider-engine/subproviders/filters.js');
const NonceSubprovider = require('web3-provider-engine/subproviders/nonce-tracker.js');
const RpcSubprovider = require('web3-provider-engine/subproviders/rpc.js');

// Import our contract artifacts and turn them into usable abstractions.
import edtaCrowdsaleArtifacts from '../../build/contracts/edtaCrowdsale.json';
import edtaTokenArtifacts from '../../build/contracts/edtaToken.json';

var EdtaTokenSale = contract(edtaCrowdsaleArtifacts);
var EdtaToken = contract(edtaTokenArtifacts);

var accounts;
var account;
var EdtaTokenAddress;

window.App = {
  start: function () {
    var self = this;

    // Bootstrap the EdtaToken and EdtaTokenSale abstraction for Use.
    EdtaTokenSale.setProvider(window.web3.currentProvider);
    EdtaToken.setProvider(window.web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    window.web3.eth.getAccounts(function (err, accs) {
      if (err != null) {
        window.alert('There was an error fetching your accounts.');
        return;
      }

      if (accs.length === 0) {
        window.alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

      EdtaTokenSale.deployed().then(function (sale) {
        sale.token().then(function (addr) {
          EdtaTokenAddress = addr;
          self.refreshBalance();
          self.setTokenAddress(addr);
          self.setSaleAddress(sale.address);
        });
      });
    });
  },
  setTokenAddress: function (tokenAddress) {
    console.log(tokenAddress);
  },
  setSaleAddress: function (saleAddress) {
    console.log(saleAddress);
    var sale = document.getElementById('crowdsaleAddress');
    sale.innerHTML = saleAddress;
  },
  setStatus: function (message) {
    var status = document.getElementById('status');
    status.innerHTML = message;
  },
  setChecker: function (message) {
    var checker = document.getElementById('checker');
    checker.innerHTML = message;
  },
  refreshBalance: function () {
    var self = this;
    var token;
    EdtaToken.at(EdtaTokenAddress).then(function (instance) {
      token = instance;
      return token.balanceOf.call(account, { from: account });
    }).then(function (value) {
      var balanceElement = document.getElementById('balance');
      balanceElement.innerHTML = window.web3.fromWei(value, 'ether');
    }).catch(function (e) {
      console.log(e);
      self.setStatus('Error getting balance; see log.');
    });
  },
  checkBalance: function () {
    var self = this;
    var address = document.getElementById('address').value;

    self.setStatus('Checking Address... (please wait)');

    EdtaToken.at(EdtaTokenAddress).then(function (token) {
      return token.balanceOf.call(address, { from: address });
    }).then(function (balance) {
      var status = 'Balance of ' + address + ' is ' + window.web3.fromWei(balance, 'ether') + ' XEDTA ';
      self.setStatus(status);
      self.setChecker(status);
    }).catch(function (e) {
      console.log(e);
      self.setStatus('Error Checking; see log.');
    });
  },
  buyCoin: function () {
    var self = this;

    var amount = parseInt(document.getElementById('buyAmount').value);
    this.setStatus('Initiating transaction... (please wait)');

    var tokenSale;
    EdtaTokenSale.deployed().then(function (instance) {
      tokenSale = instance;
      return tokenSale.sendTransaction({ from: account, value: window.web3.toWei(amount, 'ether') });
    }).then(function () {
      self.setStatus('Transaction complete!');
      self.refreshBalance();
    }).catch(function (e) {
      console.log(e);
      self.setStatus('Error sending coin; see log.');
    });
  },
  sendCoin: function () {
    var self = this;

    var amount = parseInt(document.getElementById('amount').value);
    var receiver = document.getElementById('receiver').value;

    this.setStatus('Initiating transaction... (please wait)');

    var token;
    EdtaToken.at(EdtaTokenAddress).then(function (instance) {
      token = instance;
      return token.sendCoin(receiver, amount, { from: account });
    }).then(function () {
      self.setStatus('Transaction complete!');
      self.refreshBalance();
    }).catch(function (e) {
      console.log(e);
      self.setStatus('Error sending coin; see log.');
    });
  }
};

window.addEventListener('load', function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn('Using web3 detected from external source.');
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(window.web3.currentProvider);
  } else {
    console.warn('No web3 detected. Falling back to http://localhost:8545.');
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    var engine = new ProviderEngine();
    window.web3 = new Web3(engine);
    engine.addProvider(new FixtureSubprovider());
    engine.addProvider(new CacheSubprovider());
    engine.addProvider(new FilterSubprovider());
    engine.addProvider(new NonceSubprovider());
    engine.addProvider(new RpcSubprovider({
      rpcUrl: 'http://localhost:8545'
    }));
    engine.on('error', function (error) {
      console.log(error.stack);
    });
    engine.start();
  }

  window.App.start();
});
