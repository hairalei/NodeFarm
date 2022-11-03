const fs = require('fs');
const http = require('http');
const path = require('path');
const url = require('url');
const { URL } = require('url');
const slugify = require('slugify');

const replaceTemplate = require('./modules/replaceTemplate');

///////////////////////////////////////////////////////////////
// FILES

//Blocking
// const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');

// console.log(textIn);

// const textOut = `This is what we know about the avocado: ${textIn}. \nCreated on ${Date.now()}`;
// fs.writeFileSync('./txt/output.txt', textOut);
// console.log(fs.readFileSync('./txt/output.txt', 'utf-8'));

//Async
// fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
//   fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
//     console.log(err, data2);

//     fs.readFile('./txt/append.txt', 'utf-8', (err, data3) => {
//       console.log(err, data3);

//       fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, 'utf-8', (err) => {
//         console.log(err);
//         console.log('Written');
//       });
//     });
//   });
// });
// console.log('end');

///////////////////////////////////////////////////////////////
// SERVER
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
const dataObj = JSON.parse(data);

const slugs = dataObj.map((el) => slugify(el.productName, { lower: true }));

console.log(slugs);

const server = http.createServer((req, res) => {
  // const pathName = req.url;
  const baseURL = `http://${req.headers.host}`;
  const requestURL = new URL(req.url, baseURL);

  // requestURL variable contains the absolute URL.
  // In this case it's http://localhost:8000/product?id=1
  // Get the path name from URL: /product
  const pathName = requestURL.pathname;
  // Get the query from the URL.
  const query = requestURL.searchParams.get('id');
  // .searchParams returns this: URLSearchParams { 'id' => '1' }

  switch (pathName) {
    // Overview page
    case '/':
    case '/overview':
      res.writeHead(200, {
        'Content-type': 'text/html',
      });

      const cardsHtml = dataObj
        .map((el) => replaceTemplate(tempCard, el))
        .join('');
      const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);

      res.end(output);
      break;

    // Product page
    case '/product':
      const product = dataObj[query];
      res.writeHead(200, {
        'Content-type': 'text/html',
      });
      const productOutput = replaceTemplate(tempProduct, product);

      res.end(productOutput);
      break;

    //API page
    case '/api':
      res.writeHead(200, { 'Content-type': 'application/json' });
      res.end(data);
      break;

    // Not found page
    default:
      res.writeHead(404, { 'Content-type': 'text/html' });
      res.end('<h1>Page not found</h1>');
  }
});

server.listen(8000, '127.0.0.1', () => {
  console.log('Listening to requests on port 8000');
});
