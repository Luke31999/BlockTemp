// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

//Temperature.deployed().then(function(i) { contract=i;})

contract Temperature is AccessControl  {
    
    struct City {
        string cityName;
        uint256 tempTime;
        uint256 cityId;
        int256 cityTemp;
        string cityImg;
    }

    City[] public cities;
    uint public numberOfCities;

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);

        numberOfCities = 0;
        populateCity();
    }

    function addCity(string calldata _name, uint256 _tempTime,  int256 _cityTemp, string calldata _cityImg) external {

        City memory city = City(_name, _tempTime, numberOfCities, _cityTemp, _cityImg);

        cities.push(city);

        numberOfCities++;
    }

    function deleteCity(uint256 _cityId) external {

        uint256 IndexOfCity = cities.length;

        require(_cityId <= IndexOfCity);
                
        for (uint256 i = 0; i < cities.length; i++) {
            if (cities[i].cityId == _cityId) {
                cities[i].cityId = 0;
            }
        }

    }

    //hard coded cities. Remember the fill the Json file as you enter this data
    function populateCity() private {
        numberOfCities++;
        uint chainStartTime = block.timestamp;

        City memory citta1 = City("Montoro", chainStartTime, numberOfCities, -1, "https://www.turismonarni.it/wp-content/uploads/2022/05/castello-di-montoro.jpg");
        numberOfCities++;
        City memory citta2 = City("Avellino", chainStartTime, numberOfCities, 20, "https://www.orticalab.it/sites/ortica/IMG/arton96527.jpg?1643046645");
        numberOfCities++;
        City memory citta3 = City("Napoli", chainStartTime, numberOfCities, 30, "https://tourismmedia.italia.it/is/image/mitur/1600X1000_itinerario_diecimila_passi_napoli_hero?qlt=82&ts=1665991935953&dpr=off");
        numberOfCities++;
        City memory citta4 = City("Salerno", chainStartTime, numberOfCities, 10, "https://viaggianza.com/wp-content/uploads/2019/04/salerno-panorama.jpg");
        numberOfCities++;
        City memory citta5 = City("Fisciano", chainStartTime, numberOfCities, 22 , "https://citynews-salernotoday.stgy.ovh/~media/original-hi/34589735831117/1_campus-di-fisciano-biblioteca-scientifica.jpg");
        numberOfCities++;

        cities.push(citta1);
        cities.push(citta2);
        cities.push(citta3);
        cities.push(citta4);
        cities.push(citta5);
    }

    function setTemperature(uint256 _cityId, int256 _temperature) public {
        uint256 IndexOfCity = cities.length;

        require(_cityId <= IndexOfCity);

        for (uint256 i = 0; i < cities.length; i++) {
            if (cities[i].cityId == _cityId) {
                cities[i].tempTime = block.timestamp;
                cities[i].cityTemp = _temperature;
            }
        }
    }

    function getTemperature(uint256 _cityId) public view returns (int256, uint) {
        uint256 IndexOfCity = cities.length;
        int256 temperature;
        uint lastTime;

        require(_cityId <= IndexOfCity);
        
        for (uint256 i = 0; i < cities.length; i++) {
            if (cities[i].cityId == _cityId) {
                temperature = cities[i].cityTemp;
                lastTime = cities[i].tempTime;
            }
        }

        return (temperature, lastTime);
    }

    function isOwner(address account) public virtual view returns (bool) {
      return hasRole(DEFAULT_ADMIN_ROLE, account);
    }
}
