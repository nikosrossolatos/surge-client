##To get node on the path if you have nodejs on Unix machines
sudo ln -s `which nodejs` /usr/bin/node

##Build
For development purposes you can install watchify and uglify-js and use the npm task manager to build the dependancies.

Installing watchify 
> run npm install -g watchify

Installing uglifyjs2  
> run npm install -g uglify-js

To watch everything for production purposes you can run :

> npm run watch  

You can also build the surge-client library and minify it using
> npm run build