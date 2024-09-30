const fs = require('fs'); //reading, /writting data
const http = require('http'); // networking capability
const url = require('url'); // networking capability
const replaceTemplate = require('./modules/replaceTemplate');
const slugify = require('slugify');
/////////////////////////////////
// FILES
// Blocking: read - write on a file synchronous

// const textIn = fs.readFileSync("./txt/input.txt", "utf-8");
// console.log(textIn);
// const textOut = `This is what wee know about avocado: ${textIn}. \nCreated on ${Date.now()}`;
// fs.writeFileSync("./txt/output.txt", textOut);
// console.log('Filte written');

//Non-Blocking: read - write on a file asynchronous  with callbacks
// fs.readFile("./txt/start.txt", "utf-8", (err, data1) => {
//     if(err) return console.log('ERROR'); // if start.txt doesnt exists, gives error
//   fs.readFile(`./txt/${data1}.txt`, "utf-8", (err, data2) => {
//     console.log(data2);
//     fs.readFile(`./txt/append.txt`, "utf-8", (err, data3) => {
//       console.log(data3);

//       fs.writeFile("./txt/final.txt", `${data2}\n${data3}`, "utf-8", (err) => {
//         console.log("file written");
//       });
//     });
//   });
// });
// console.log("will read file!");

/////////////////////////////////
//  SERVER

//code executed abode the callback of the create server, executes only once , on start
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  'utf-8'
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  'utf-8'
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  'utf-8'
);

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data); // json into js array
//calls each times a new req, or server shows
// get the req,res vars
const slugs = dataObj.map((el) => slugify(el.productName, { lower: true }));
console.log('🚀 ~ slugs:', slugs);
console.log(slugify('Fresh Avocados', { lower: true }));
const server = http.createServer((req, res) => {
  //paths routing
  const { query, pathname } = url.parse(req.url, true);

  //overview page
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, {
      'Content-type': 'text/html',
    });
    const cardsHtml = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join('');
    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);
    res.end(output);
    //product page
  } else if (pathname === '/product') {
    res.writeHead(200, {
      'Content-type': 'text/html',
    });
    const product = dataObj[query.id];
    const output = replaceTemplate(tempProduct, product);
    res.end(output);
    //api page
  } else if (pathname === '/api') {
    res.writeHead(200, {
      'Content-type': 'application/json',
    });
    res.end(data);
  } else {
    //set before the response
    res.writeHead(404, {
      'Content-type': 'text/html',
      'my-own-header': 'hello world',
    });
    res.end('<h1>Page not found!</h1>');
  }

  // res.end("Hello from the server!"); //simple response method sendback :  '.end'
});

server.listen(8000, '127.0.0.1', () => {
  //callback fct that as servers is on
  console.log('server started on port 8000');
});
