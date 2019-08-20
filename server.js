var express=require('express');
var bodyParser=require('body-parser');
var mongoose = require('mongoose');
var config = require('./config.json');
var preData= require('./models/User.js');
var regVoter= require('./models/RegVoter.js');
var speakeasy= require('speakeasy')
var twilioClient = require('twilio')(config.accountSid, config.authToken);

app=express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
mongoose.connect("mongodb://localhost:8080/voter_data");

app.use(express.static('./src'));
app.use(express.static('./build/contracts'));
app.use(express.static('views'));
app.use(express.static('./node_modules'));



function ageCalc(x) {
  return Math.floor(x/1000/60/60/24/365);
}


app.get('/', function(req,res){
  res.render('index');
});


app.get('/register', function(req,res){
  res.render('register');
});

app.get('/register/:adhar_id', function(req,res){
  preData.find(req.params.adhar_id, function(err, found){
    if(err) {
      res.send('Data not found');
      res.redirect('/register'); }
    else {
      var presentDate= Date.now();
      var birthDate= new Date(found.dob);
      var age= ageCalc(presentDate-birthDate);
      if (age>=18) {
        regVoter.create(found, function(err,success){
          if(err) {
            res.send('Something went wrong. Please try again.');
          } else {
            var secret= speakeasy.generateSecret({length:20});
            success.secret.push(secret.base32);
            var token= speakeasy.totp({
              secret: secret.base32,
              encoding: 'base32'
            });
            twilioClient.messages.create({
              from: from,
              to: to,
              body: `Your verification code is: $(token)`
            });
            res.render('verify', {data:found}); } })}
      else {
        res.send('Not eligible to vote. Person should be atleast 18 years of age.');
        res.redirect('/register'); } }
  });
});

app.post('/register/:adhar_id', function(req,res){
  var userToken= req.body.token;
  var secret= regVoter.find(req.params.adhar_id).secret;
  var verified= speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: userToken
  });
  if(verified) {
  regVoter.find(req.params.adhar_id, function(err,success){
  res.json(success);
  })
  } else {
    res.send('Something went wrong');
    res.redirect('/register');
  }
});

app.get('/vote', function(req,res){
  res.render('vote');
});

app.get('/vote/:adhar_id', function(req,res){
  regVoter.find(req.params.adhar_id, function(err, found){
    if(err) {
      res.send('Data not found');
      res.redirect('/vote'); }
    else {
            var token= speakeasy.totp({
              secret: found.secret,
              encoding: 'base32'
            });
            twilioClient.messages.create({
              from: from,
              to: to,
              body: `Your verification code is: $(token)`
            });
            res.render('verify', {data:found}); 
          } 
        })
});

// app.post('/vote/:adhar_id', function(req,res){
//   var userToken= req.body.token;
//   var secret= regVoter.find(req.params.adhar_id).secret;
//   var verified= speakeasy.totp.verify({
//     secret: secret,
//     encoding: 'base32',
//     token: userToken
//   });
//   if(verified) {
//     regVoter.find(req.params.adhar_id, function(err,success){
//       res.json(success);
//     })
//   } else {
//     res.send('Something went wrong');
//     res.redirect('/vote');
//   }
// });

app.listen(3000, function(){
  console.log('Server Started');
});