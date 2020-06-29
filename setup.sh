#!/bin/sh

sudo apt-get update
sudo apt-get install npm -y
cd ~
git clone https://github.com/manishrawat1992/event-expo.git
cd event-expo

sudo npm install
sudo npm start
