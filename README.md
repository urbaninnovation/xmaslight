# xmaslight
* Eine Christbaum-Kugel, mit einer rgb LED und einem Drehknopf incl Schalter. Durch ein Drehrad kann man die Farbe ändern.  
* Jeder von uns hängt eine solche Kugel in seinen Tannenbaum.  
* Die Kugeln sind vernetzt (socket).  
* Nachdem einer von uns eine neue Farbe einstellt und diese durch den Druckschalter bestätigt, nehmen alle Kugeln die neue Farbe an.  
* Frühestens nach 15 Sekunden kann ein anderer die Farbe wieder ändern.  
* Das symbolisiert unsere Verbundenheit.  
* Eine Internetseite zeigt die aktuelle Farbe an und listet die letzten 1000 unterschiedlichen Aktivitäten auf.  
https://xmaslight.herokuapp.com

## Voraussetzungen
* Raspberry Pi mit [Raspbian](https://downloads.raspberrypi.org/raspbian_lite_latest)
* [Node.js version 7.x](https://nodejs.org/en/download/package-manager/)
```
curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install build-essential
```

## Installation
```
git clone https://github.com/urbaninnovation/xmaslight
cd xmaslight
npm install
```
## Update (update Client)
```
cd xmaslight
git pull
```

## Start des Christbaum-Kugel-Clients (index.js)
```
sudo npm start
```
## Start des Christbaum-Kugel-Servers (server.js)
```
node server.js
```
