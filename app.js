require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const nanoid = require("fix-esm").require('nanoid');
const got = require("got");
const axios = require('axios');

const port = 3000;
const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: false}));



app.get('/', (req, res)=>{
    axios.get('https://api.short.io/api/links', {
    params: {
        domain_id: '463215', 
        limit: '150', 
        offset: '0'
    },
    headers: {
        accept: 'application/json',
        authorization: process.env.API_KEY,
    }
  })
    .then(function (response) {
        res.render('home', {links:response.data.links});
        console.log(response.data.links);
    })
    .catch(function (err) {
        console.log(err);
    });
});

app.post('/', (req, res)=>{
    const urlInput = req.body.urlInput;

    var urlExpression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
    var regex = new RegExp(urlExpression);

    if(urlInput == ""){
        console.log("no input entered");
    }else if(!urlInput.match(regex)){
      console.log("this is not a link");
    }else{
        const options = {
            method: 'POST',
            url: 'https://api.short.io/links',
            headers: {
              authorization: process.env.API_KEY,
            },
            json: {
              originalURL: urlInput,
              domain: '4xqc.short.gy'
            },
            responseType: 'json'
          };
          
          got(options).then(response => {
            res.redirect('/');
          });
    }  
});

app.post('/delete', (req, res)=>{
   const options = {
    headers: {
      'content-type': 'application/json',
      authorization: process.env.API_KEY,
    }
  };

  const idString = req.body.linkId;
  const apiUrl = 'https://api.short.io/links/' + idString;
  axios.delete(apiUrl, options)
  .then(function (response) {
    res.redirect('/');
  }) .catch(function (response) {
    console.log(response);
  });
});

app.get('/signup', (req, res)=>{
  res.render('signup')
});

app.get('/login', (req, res)=>{
  res.render('login')
});



app.listen(port, (req, res)=>{
    console.log("server is running on port " + port);
});