var express = require('express');
var bodyParser = require('body-parser');
var dbUtilities = require('./utilities/dbUtils.js');
var wineApiUtils = require('./utilities/wineApiUtils.js');
var cors = require('cors');

//INSTANTIATE APP
var app = express();

// var options = {
//   key: fs.readFileSync(__dirname + '/key.pem'),
//   cert: fs.readFileSync(__dirname + '/cert.pem')
// }
// console.log('jpioasdfpoijsadpfoi', options);


//Middleware for parse application/json
app.use(bodyParser.json());
app.use(cors())

//load static files
app.use(express.static(__dirname + '/../react-client/dist'));


// var a = https.createServer(options, function(req, res) {
//   console.log('insiasjdfjasopdfijasoipdfjSERVER')
//   res.writeHead(200);
//   res.send('hello world')
// })
//SETTING UP ALL THE ROUTES FOR THE CLIENT REQUEST

app.get('/wine', function(req, res) {
  console.log('GET request to /wine received');
  res.statusCode = 200;
  res.send('response from app.get /wine');
});

//This route invoke function that requests wine.com api.
// app.get('/catalog', wineApiUtils.apiRequest);

//POST request for search
app.post('/search', function(req, res) {
  var query = req.body.search;
  var price = req.body.price || 10;

  console.log('search:', query);

  wineApiUtils.apiRequest(query, price, function(error, success, results) {
    if(error){
      console.log('Error from server API request', error);
      res.sendStatus(404).send('not found')
    } else if (success) {
      // console.log('results from search post API', results);
      res.send(results);
    }
  })

});

//POST request for signup
app.post('/signup', function(req, res) {
  var user = req.body.username;
  var pass = req.body.password;

  //check for valid username, i.e. currently not in use
  dbUtilities.checkuserName(user, function(error, valid, results){
    if(error){
      res.send('error inside checkuserName index');
    } else if (!valid) {
      res.send('duplicate username')
    } else if (valid) {
      dbUtilities.addUser(user, pass, function(error, success, results){
        if(error) {
          res.send('error inside addUser index.js');
        } else if (success) {
          res.send('response from app.post /signup');
        }
      })
    }
  })
});

app.post('/users/username/', function(req, res) {
  var username = req.body.username;

  dbUtilities.checkuserName(username, function(error, valid, results){
    if(error){
      console.error(error)
      res.send(error);
    } else {
      console.log('results from checkuserName', results);
      res.send(results);
    }
  })
})

//POST request for login
app.post('/login', function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  dbUtilities.validateUser(username, password, function(error, results) {
    if(error){
      console.log(error)
    } else {
      res.send(results);
    }
  })
});

//POST request for review
app.post('/review', function(req, res) {
  var content = req.body.review;
  var rating = req.body.rating;
  var product = req.body.productID;
  var username = req.body.username;
  var review = {
    content: content,
    rating: rating,
    product: product,
    username: username
  }
  dbUtilities.addReview(review, function(error, results){
    if(error){
      console.log('error inside dbUtils addReview', error);
    } else {
      console.log('success after add wine review', results);
      res.send(results)
    }
  })
});

app.post('/reviews', function(req, res) {
  var product = req.body.product;
  console.log('product inside reviews GET all', product);

  dbUtilities.getReviews(product, function(error, reviews){
    console.log('reviews', reviews)
    if(error){
      res.send(error)
    } else {
      res.send(reviews)
    }
  })
})

// app.options('*', function(req, res) {
//   res.send('awesome')
// })


app.get('/.well-known/acme-challenge/:content', function(req, res) {
  res.send('PW-phkjKRkbF7Oeg1ed8b_EuymzQGBI0leXIYDq5Hyc')
})

//In terminal
//export PORT=3000
//nodemon index.js or npm server-dev


// example data format for wine product from API request
// { Id: 167706,
// Name: 'CVNE Crianza 2013',
// Url: 'http://www.wine.com/v6/CVNE-Crianza-2013/wine/167706/Detail.aspx',
// Appellation: [Object],
// Labels: [Object],
// Type: 'Wine',
// Varietal: [Object],
// Vineyard: [Object],
// Vintage: '2013',
// Community: [Object],
// Description: '',
// GeoLocation: [Object],
// PriceMax: 15.99,
// PriceMin: 12.99,
// PriceRetail: 15,
// ProductAttributes: [Object],
// Ratings: [Object],
// Retail: null,
// Vintages: [Object] }
var pricesArray = [0, 10, 20, 30, 40, 50];
var winesArray = ['red', 'white', 'rose', 'Cabernet Franc', 'cabernet', 'fran', 'cabernet sauvignon', 'gamay', 'grenache', 'garnacha', 'malbec', 'merlot', 'mourvedre', 'mataro', 'nebbiolo', 'pinot', 'pinot noir', 'sango', 'sangiovese', 'shiraz', 'syrah', 'zin', 'zinfandel', 'chenin', 'chenin blanc', 'blanc', 'Gewurztraminer', 'marsanne', 'muscat', 'pinot blanc', 'blanc', 'pinot gris', 'pinot grigio', 'riesling', 'roussanne', 'sauvignon blanc', 'fume blanc', 'semillon', 'viognier', 'gruner veltliner', 'brut']

winesArray.forEach(function(wine){

  pricesArray.forEach(function(price){

    wineApiUtils.forcedRequest(price, wine, function(error, results) {
      if(error){
        console.log('error inside forcedRequest', error);
      } else {

        resBody = JSON.parse(results.body);
        var wines = resBody.Products.List;
        wines.forEach(function(wine){

          var query = {
            name: wine.Name,
            year: wine.Vintage + '',
            type: wine.Varietal.Name,
            redORwhite: wine.Varietal.WineType.Name,
            origin: wine.Appellation.Name,
            region: wine.Appellation.Region.Name,
            priceMin: wine.PriceMin,
            priceMax: wine.PriceMax,
            apiRating: wine.Ratings.HighestScore
          }

          dbUtilities.addWine(query, function(error, results){
            if(error){
              console.error(error)
            } else {
              console.log('results from addwine dbUtilities', results)
            }
          })
        })

      }
    })

  })


})

      // //to see how the object is structured
      // console.log('VARIETAL', wine.Varietal)
      // console.log('VINEYARD', wine.Vineyard)
      // console.log('VINTAGES', wine.Vintages)
      // console.log('GEOLOCATION',wine.GeoLocation)
      // console.log('APPELLATION', wine.Appellation)

      // //where the information we want is located
      // console.log('NAME', wine.Name) //possibly change
      // console.log('YEAR', wine.Vintage)
      // console.log('TYPE', wine.Varietal.Name)
      // console.log('REDORWHITE', wine.Varietal.WineType.Name)
      // console.log('ORIGIN', wine.Appellation.Name)
      // console.log('REGION', wine.Appellation.Region.Name)
      // console.log('PRICE(MIN-MAX)', wine.PriceMin + '-' + wine.PriceMax)
      // console.log('APIRATING', wine.Ratings.HighestScore)

      var query = {
        name: wine.Name,
        year: wine.Vintage + '',
        type: wine.Varietal.Name,
        redORwhite: wine.Varietal.WineType.Name,
        origin: wine.Appellation.Name,
        region: wine.Appellation.Region.Name,
        priceMin: wine.PriceMin,
        priceMax: wine.PriceMax,
        apiRating: wine.Ratings.HighestScore
      }


      dbUtilities.addWine(query, function(error, results){
        if(error){
          console.error(error)
        } else {
          console.log('results from addwine dbUtilities', results)
        }
      })
    })

  }
})

// app.listen(3000);
// httpsServer.listen(3000)

var port = process.env.PORT;

app.listen(process.env.PORT, function() {
  console.log('listening to port ' + port);
});
