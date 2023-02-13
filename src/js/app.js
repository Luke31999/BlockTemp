App = {
  web3Provider: null,
  contracts: {},

  init: async function () {
    // Prendere i dati staticamente da un file Json.
    /*
    $.getJSON('../city.json', function (data) {
      var tempRow = $('#tempRow');
      var tempTemplate = $('#tempTemplate');

      for (i = 0; i < data.length; i++) {

        tempTemplate.find('.panel-title').text(data[i].name);
        tempTemplate.find('img').attr('src', data[i].image);
        tempTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        tempRow.append(tempTemplate.html());
      }
    });
    */

    window.ethereum.on('accountsChanged', function (accounts) {
      App.accountChange();
    });

    return await App.initWeb3();
  },

  initWeb3: async function () {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' }); //risolto il warning 

      } catch (error) {
        // User denied account access...
        console.error("User denied account access")

        Swal.fire({
          title: 'Effettua accesso prima',
          text: "Altrimeti riceverai molti errori...",
          icon: 'warning',
          confirmButtonText: 'Si, lo farò!',
          confirmButtonColor: '#fcd000'
        })
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);


    return App.initContract();

  },

  initContract: function () {
    $.getJSON('Temperature.json', function (data) {
      // Prendo l'artefatto del file del contratto e lo inizializzo
      var TemperatureArtifact = data;
      App.contracts.Temperature = TruffleContract(TemperatureArtifact);

      // Setto il provider per il nostro contratto 
      App.contracts.Temperature.setProvider(App.web3Provider);

      return App.listZones();

    });

    return App.bindEvents();
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

  bindEvents: function () {
    $(document).on('click', '.btn-temp', App.measureTemperature);
    $(document).on('click', '.btn-my-address', App.myAccount);
  },

  tempSuccess: function (data) {

    var lastLecture = data[1];

    //javascript code che converte stringhe in formato UNIX in date 
    var a = new Date(lastLecture * 1000);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var time = date + ' ' + month + ' ' + year + ' alle ore ' + hour + ':' + min;

    if (data[0] <= 10) {
      Swal.fire({
        title: 'Operazione eseguita con successo!',
        text: 'La temperatura prelevata è: ' + data[0] + ' °C in data ' + time,
        icon: 'success',
        confirmButtonText: 'Fa freddo!',
        confirmButtonColor: '#0e3f90'
      })
    }
    else if (data[0] <= 21) {
      Swal.fire({
        title: 'Operazione eseguita con successo!',
        text: 'La temperatura prelevata è: ' + data[0] + ' °C in data ' + time,
        icon: 'success',
        confirmButtonText: 'Clima mite',
        confirmButtonColor: '#fccb02'
      })
    }
    else {
      Swal.fire({
        title: 'Operazione eseguita con successo!',
        text: 'La temperatura prelevata è: ' + data[0] + ' °C in data ' + time,
        icon: 'success',
        confirmButtonText: 'Fa caldo!',
        confirmButtonColor: '#c50302'
      })
    }
  },

  myAccount: function (event) {
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0]; //il primo parametro è il mio indirizzo
      if (account == undefined) {
        Swal.fire({
          title: 'Operazione non andata a buon fine!!!',
          text: "Devi fare l'accesso prima",
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#05c5c4'
        })
      }
      else {
        Swal.fire({
          title: 'Il mio Indirizzo su metamask',
          text: 'Address: ' + account,
          icon: 'info',
          confirmButtonText: 'OK',
          confirmButtonColor: '#05c5c4'
        })
      }
    });
  },

  measureTemperature: function (event) {
    event.preventDefault();

    var cityId = parseInt($(event.target).data('id'));

    var temperatureInstance;

    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
      }

      //il primo parametro è il mio indirizzo
      var account = accounts[0];       
      if (account == undefined) {
        Swal.fire({
          title: 'Operazione non andata a buon fine!!!',
          text: "Devi fare l'accesso prima",
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#05c5c4'
        })
      }
      else {

        App.contracts.Temperature.deployed().then(function (instance) {

          temperatureInstance = instance;
          //Esegui getTemperature specificando l'account
          return temperatureInstance.getTemperature(cityId, { from: account });
        }).then(function (result) {
          return App.tempSuccess(result);
        }).catch(function (err) {
          Swal.fire({
            title: 'Operazione non andata a buon fine!!!',
            text: 'Errore: ' + err.data.message,
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#05c5c4'
          })
        });
      }
    });
  },

  listZones: function () {
    var tempRow = $('#tempRow');
    var tempTemplate = $('#tempTemplate');

    // Carico dati contratto
    App.contracts.Temperature.deployed()
      .then(function (instance) {
        temperatureInstance = instance;
        return temperatureInstance.numberOfCities();
      })
      .then(function (numberOfCities) {
        for (var i = 0; i < numberOfCities - 1; i++) {
          temperatureInstance.cities(i).then(function (city) {
            var name = city[0];
            var id = city[2];
            var image = city[4];

            if (id != 0) {
              tempTemplate.find('.panel-title').text(name);
              tempTemplate.find('img').attr('src', image);
              tempTemplate.find('.btn-temp').attr('data-id', id);

              tempRow.append(tempTemplate.html());
            }
          })
        }
      }).catch((err) => {
        console.warn("Errrore: " + err);
      })
  }

};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
