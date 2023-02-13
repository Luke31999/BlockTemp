App = {
    web3Provider: null,
    contracts: {},
    
    init: function() {
      
      window.ethereum.on('accountsChanged', function (accounts) {
        App.accountChange();
      });
  
      return App.initWeb3();
    },
  
    initWeb3: function() {
      // Initialize web3 and set the provider to the testRPC.
      if (typeof web3 !== 'undefined') {
        App.web3Provider = web3.currentProvider;
        web3 = new Web3(web3.currentProvider);
      } else {
        // set the provider you want from Web3.providers
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
        web3 = new Web3(App.web3Provider);
      }
  
      return App.initContract();
    },
  
    initContract: function() {
      $.getJSON('Temperature.json', function(data) {
        // Get the necessary contract artifact file and instantiate it with truffle-contract.
        var TemperatureArtifact = data;
        App.contracts.Temperature = TruffleContract(TemperatureArtifact);
  
        // Set the provider for our contract.
        App.contracts.Temperature.setProvider(App.web3Provider);
  
        
      });
  
    },

    accountChange: function () {
      var temperatureInstance;
  
      web3.eth.getAccounts(function (error, accounts) {
        if (error) {
          console.log(error);
        }
  
        var account = accounts[0];
  
        App.contracts.Temperature.deployed().then(function (instance) {
          temperatureInstance = instance;
  
          return temperatureInstance.isOwner(account);
        }).then(function (result) {
          if (result == false)
            window.location.href = "temp.html";
            else 
            window.location.href = "admin.html";
        }).catch(function (err) {
          console.log(err.message);
          window.location.href = "index.html"
        });
      });
    },
  
  };
  
  $(function() {
    $(window).load(function() {
      App.init();
    });
  });