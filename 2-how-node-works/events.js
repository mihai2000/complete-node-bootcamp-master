const EventEmitter = require("events");
const http = require("http");

class Sales extends EventEmitter {
  constructor() {
    super(); //to access all the functionalities form the EvenEmittter which is a super class
  }
}

const myEmitter = new Sales();

//Emites: observe the emiiter and execute
myEmitter.on("newSale", () => {
  console.log("There was a new sale");
});

myEmitter.on("newSale", () => {
  console.log("Costumer name:Jonas");
});

myEmitter.on("newSale", (stock) => {
  console.log(`there are now ${stock} items left in stock`);
});

//the emitter: like as a clicking on a button
// myEmitter.emit("newSale");
myEmitter.emit("newSale", 9);

///////////////////////////
//can have only one res.end, else will throw err
const server = http.createServer();
server.on("request", (req, res) => {
  console.log("request received");
  res.end("req received");
});
server.on("request", (req, res) => {
  console.log("Another request ");
});
server.on("close", () => {
  console.log("Server closed");
});
server.listen(8000, "127.0.0.1", () => {
  console.log("Waiting for req...");
});
