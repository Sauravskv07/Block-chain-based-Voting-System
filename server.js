var express=require('express');
var bodyParser=require('body-parser');
var mongoose = require('mongoose');
var config = require('./config.json');
var preData= require('./models/User.js');
var regVoter= require('./models/RegVoter.js');
var speakeasy= require('speakeasy')
var twilioClient = require('twilio')(config.accountSid, config.authToken);
var logger=require('morgan');

app=express();
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
mongoose.connect('mongodb://localhost/voter_data', {useNewUrlParser: true});

mongoose.connection.on('error',(error)=>{
    console.log(error);
});

app.use(express.static('./src'));
app.use(express.static('./build/contracts'));
app.use(express.static('views'));
app.use(express.static('./node_modules'));



function ageCalc(x) {
  return Math.floor(x/(1000 * 3600 * 24* 365));
}


app.get('/', function(req,res){
  res.render('index');
});


app.get('/register', function(req,res){
  res.render('register');
});

app.post('/register', function(req,res){
  console.log(req.body);
  preData.findOne({adhar_id:req.body.adhar_id}, function(err, found){
    if(err) {
      res.send('Data not found');
      res.redirect('/register'); }
    else {
      console.log(found);
      console.log(found.dob);
      var presentDate= Date.now();
      console.log("birth date of the person is ",found.dob);
      var birthDate=new Date(found.dob);
      var age= ageCalc(presentDate-birthDate);
      console.log("age of the person is ",age);
      if (age>=18) {
        var secret= speakeasy.generateSecret({length:20});
        regVoter.create({
          dob:found.dob,
          name:found.name,
          address:found.address,
          phone:found.phone,
          adhar_id:found.adhar_id,
          gender:found.gender,
          secret:secret.ascii,
          email:found.email,

        }, function(err,success){
          if(err) {
            console.log(err);
            res.send('Something went wrong. Please try again.');
          } else {
            var token= speakeasy.totp({
              secret: secret.base32,
              encoding: 'base32'
            });
            twilioClient.messages.create({
              from:'+12165849643',
              to: found.phone,
              body: `Your verification code is: $(token)`
            }).then((message)=>{
              console.log(message);
            });
            res.render('verify',{data:success}) } })}
      else {
        res.send('Not eligible to vote. Person should be atleast 18 years of age.');
        //res.redirect('/register'); 
      } }
  });
});


app.post('/verify/:adhar_id', function(req,res){
  var userToken= req.body.OTP;
  var secret;
  regVoter.findOne({adhar_id:req.params.adhar_id},(error,user)=>{
    if(error)
      return res.send('There has been some error while verifying');
    else if(!user)
    {
      return res.send("No such user has been registered");
    }
    secret=user.secret;
  })
  console.log('user secret = ',secret);

  var verified= speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: userToken
  });
  if(verified) {
  regVoter.findOne(req.params.adhar_id, function(err,success){
    return res.json(success);
  })
  } else {
    res.send('Something went wrong');
    res.redirect('/register');
  }
});

app.get('/vote', function(req,res){
  res.render('vote');
});

app.post('/vote', function(req,res){
  regVoter.findOne({adhar_id:req.body.adhar_id}, function(err, found){
    if(err) {
      res.send('Data not found');
      res.redirect('/vote'); }
    else {
            var token= speakeasy.totp({
              secret: found.secret,
              encoding: 'base32'
            });
            twilioClient.messages.create({
              from:'+12165849643',
              to: found.phone,
              body: 'Your verification code is: '+token
            });
            res.render('verify', {data:found}); 
          } 
        })
});


app.post('/addAadharData',(req,res)=>{
  preData.create({
    adhar_id:req.body.adhar_id,
    name:req.body.name,
    gender:req.body.gender,
    phone:req.body.phone,
    email:req.body.email,
    address:req.body.address,
    dob:req.body.dob,
  },(error,results)=>{
    if(error)
      console.log(error);
    else
      res.json(results);
  })
});

app.get('/partyVotes',(req,res)=>{
  return res.render('partyVotes');
})

app.get('/admin',(req,res)=>{
  return res.render('admin');
})

app.listen(3000, function(){
  console.log('Server Started');
});