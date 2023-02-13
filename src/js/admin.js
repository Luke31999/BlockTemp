App = {
  web3Provider: null,
  contracts: {},

  init: function () {
    window.ethereum.on('accountsChanged', function (accounts) {
      App.accountChange();
    });

    return App.initWeb3();
  },

  initWeb3: function () {
    // Initialize web3 and set the provider to the testRPC.
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }

    return App.initContract();
  },

  initContract: function () {
    $.getJSON('Temperature.json', function (data) {
      var temperatureArtifact = data;
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      App.contracts.Temperature = TruffleContract(temperatureArtifact);
      // Connect provider to interact with contract
      App.contracts.Temperature.setProvider(App.web3Provider);

      return App.listCities();

    });

    return App.bindEvents();
  },
  bindEvents: function () {
    $(document).on('click', '#addCity', App.addCity);
    $(document).on('click', '.remove-city', App.removeCity);
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
        window.location.href = "index.html";
      });
    });
  },

  listCities: function () {
    $("#city-list").empty();
    var cityList = $("#city-list")

    // Load contract data
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
            var lastLecture = city[1];
            var temperature = city[3];

            //javascript code that convert UNIX-timestamp in a string 
            var a = new Date(lastLecture * 1000);
            var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            var year = a.getFullYear();
            var month = months[a.getMonth()];
            var date = a.getDate();
            var hour = a.getHours();
            var min = a.getMinutes();
            var sec = a.getSeconds();
            var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;

            if (id == 0) {
              var cityTemplate = `<tr>
                                      <td> ${id} </td>
                                      <td> ${name} </td>
                                      <td> ${time} </td>
                                      <td> ${temperature} </td>
                                      <td> </td>
                                  </tr>`
              cityList.append(cityTemplate);
            }
            else {
              var cityTemplate = `<tr>
                                      <td> ${id} </td>
                                      <td> ${name} </td>
                                      <td> ${time} </td>
                                      <td> ${temperature} </td>
                                      <td>
                                        <button class="btn btn-danger remove-city" id="${id}">
                                        <i class="material-icons">delete</i>
                                        </button>
                                      </td>
                                  </tr>`
              cityList.append(cityTemplate);
            }
          })
        }
      }).catch((err) => {
        console.warn("Errrore: " + err);
      })
  },

  removeCity: function () {
    var id = $(this).attr("id");
    Swal.fire({
      title: 'Sei sicuro?',
      text: "Non si può annullare!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, elimina!'
    }).then((result) => {
      if (result.isConfirmed) {
        web3.eth.getAccounts(function (error, accounts) {
          if (error) {
            console.log(error);
          }

          var account = accounts[0];
          App.contracts.Temperature.deployed().then(function (instance) {

            temperatureInstance = instance;
            //return temperatureInstance.open()

            return temperatureInstance.deleteCity(id, { from: account });

          }).then(function (result) {
            if (result != undefined) {
              Swal.fire(
                'Operazione eseguita con successo!',
                'Il luogo è stato disabilitato',
                'success'
              )
              App.listCities();
            }

          })
            .catch((err) => {
              console.log(err)
              err.code == 4001 ?
                Swal.fire({
                  icon: 'error',
                  title: 'Transazione annullata',
                  text: 'Hai annullato da Metamask!',
                })
                :
                Swal.fire({
                  icon: 'error',
                  title: 'Oops...',
                  text: 'Errore imprevisto',
                })
            })
        })
      }
    })

  },

  addCity: function () {

    const imageUrlRegex = /https?:\/\/[^\s]+\.(jpeg|jpg|png|gif|webp|svg|ico)(?:\?\S+)?/gi;
    var nome = $("#city-name").val();
    var link = $("#link").val();

    var time = Math.floor(Date.now() / 1000) //converto per il formato UNIX

    if (nome != '') {
      if (imageUrlRegex.test(link)) {
        web3.eth.getAccounts(function (error, accounts) {
          if (error) {
            console.log(error);
          }

          var account = accounts[0];
          App.contracts.Temperature.deployed()
            .then(function (instance) {

              temperatureInstance = instance;

              return temperatureInstance.addCity(nome, time, 0, link, { from: account });

            })
            .then(function (result) {
              if (result != undefined) {
                Swal.fire(
                  'Aggiunta avvenuta con successo',
                  'Il luogo con nome ' + nome + ' è stato aggiunto correttamente',
                  'success'
                )
                App.listCities();
              }
            })
            .catch((err) => {
              console.log(err)
              err.code == 4001 ?
                Swal.fire({
                  icon: 'error',
                  title: 'Transazione annullata',
                  text: 'Hai annullato da Metamask!',
                })
                :
                Swal.fire({
                  icon: 'error',
                  title: 'Oops...',
                  text: 'Errore imprevisto',
                })
            })
        })
      } else {
        //esempio con modal 
        /*Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: "Formato dell'url non valido deve essere un link di un'immagine",
        })*/
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 5000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
          }
        })
        
        Toast.fire({
          icon: 'error',
          title: 'Formato dell`url non valido'
        })
      }
    } else {
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      })
      
      Toast.fire({
        icon: 'error',
        title: 'Nome non valido'
      })
    }
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});