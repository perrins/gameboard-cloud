Gameboard Cloud
===
The Gameboard cloud is the components required to run the service in the Bluemix Cloud PAAS Environment

The Node server defines the REST services as Routes that integration with Cloudant for Data Storage and Youtube for Video integration.

The project is structured into routes, within the routes directory a set of REST interfaces are defined that map into function, this can include integration with the Videos data store in cloudant and favourites and other services.

Setup
---
You need to install the Node dependencies before you get started, from within the project directory run the following command

```bash
npm install
```

Running
---
To run a local instance of the node server

```bash
node app
```




