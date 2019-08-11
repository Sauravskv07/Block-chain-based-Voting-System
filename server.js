const express=require('express');
const port=3000;
const app=express();

app.use(express.static('./src'));
app.use(express.static('./build/contracts'));
app.use(express.static('views'));
app.use(express.static('./node_modules'));

app.get('/',(req,res)=>{
    res.sendFile('index.html');
})


app.listen(port,()=>{
    console.log('app is listening on port number ',port);
});