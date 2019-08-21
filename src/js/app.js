var ismobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
 
if (!ismobile){
 window.addEventListener('scroll', function(){
  var scrolled=document.getElementById('scrolled');
  scrolled.style.top=-(window.pageYOffset * 0.5)+ 'px';
 }, false)
}

function formData(event) { 

event.preventDefault();
var x = document.getElementById('inputEmail1').value;
var y = document.getElementById('inputEmail2').value;
var partyData = { "Party" : x,
"Constituency" : y};
console.log(JSON.stringify(partyData));

}

function partyData(event) { 

event.preventDefault();
var x = document.getElementById('party').value;
var y = document.getElementById('const').value;
var voteData = { "Party" : x,
"Constituency" : y,
"Total Votes" : "2343" };
var totalVotes= document.getElementById('totalVote');
totalVotes.innerHTML = JSON.stringify(voteData);
totalVotes.style.visibility = "visible";
console.log(JSON.stringify(voteData));
}


var contracts={};
App={
    web3Provider: null,
    contracts:{},
    totalVotes: 0,
    totalVotesCasted: 0,
    flag_registration_started: 0,
    flag_voting_started: 0,
    flag_voting_ended: 0,
    error:0,
    errorMessage:"",

    init: function(){
        console.log("App initialized ....");
        return App.initWeb3();
    },

    initWeb3: function(){
        if(typeof web3 !== "undefined")
        {
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        }
        else{
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);
        }

        console.log('intialized web3 ....');
        return App.initContracts();
    },

    initContracts: function(){
        $.getJSON('Vote_Token.json',(VoteToken)=>{
            App.contracts.VoteToken=TruffleContract(VoteToken);
            App.contracts.VoteToken.setProvider(App.web3Provider);
            App.contracts.VoteToken.deployed().then((VoteToken)=>{
                console.log('Contract address = ',VoteToken.address);
            })
        })

        return App.render();
    },

    render: function(){
        //show whether voting started or not...
        if(App.flag_registration_started)
            document.getElementById('totalVotes').innerHTML="Total Votes Registered Till Now = "+App.totalVotes;

        if(App.flag_voting_started){
            document.getElementById('totalVotesCasted').innerHTML='Total Votes Casted Till Now = '+App.totalVotesCasted;
            document.getElementById('totalVotes').innerHTML="Total Votes Registered = "+App.totalVotes;
        }

        if(App.flag_voting_ended){
            App.showResults();
        }

        if(error==1)
        {
            document.getElementById('error').innerHTML=App.errorMessage;
        }
        //add any party that is registered...
        //show when a vote token is spent...
        //show when registering is started...
        //show when voting is ended....
    },

    //to show vote count of a particular party;
    votesParty: function(_constituency,_party){
        App.contracts.VoteToken.deployed().then(function(instance){
            //show loading symbol
            if(instance.constituency_registery(_constituency).toNumber()==1)
            {
                if(instance.party_registery(_constituency,_party).toNumber()==1)
                {
                    App.error=0;
                    document.getElementById('votesParty').innerHTML='The total votes for party ',_party,' in constituency ',_constituency,' is ',instance.vote_count(_constituency,_party).toNumber();
                }
                else
                {
                    App.error=1;
                    App.errorMessage='No such party registered in the constituecy';
                }
            }
            else
            {
                App.error=1;
                App.errorMessage='No such constituency registered';
            }
        })
    },

    //when a user wants to vote and enters party then call this function
    spendVote: function(voter,party){
        //show loading symbol
        App.contracts.VoteToken.deployed().then(function(instance){
            instance.spend(voter,party).then(function(){
                document.getElementById('Message').innerHTML="Congratulations!!! You have spent your vote token";
                //hide loading symbol
                App.error=0;
                App.render();
            })
        })
    },

    regiserForVote: function(voter,party){
        //show loading symbol
        App.contracts.VoteToken.deployed().then(function(instance){
            instance.register(voter,party).then(function(){
                document.getElementById('Message').innerHTML="Congratulations!!! You have been registered for voting";
                //hide loading symbol
                App.error=0;
                App.render();
            })
        })
    },

    regiserForVote: function(constituency,party){
        //show loading symbol
        App.contracts.VoteToken.deployed().then(function(instance){
            instance.registerParty(constituency,party).then(function(receipt){
                document.getElementById('Message').innerHTML="Congratulations!!! You have been registered a new party : "+receipt.logs[0].args._party+ " in the constituency : "+receipt.logs[0].args._constituency;
                //hide loading symbol
                App.error=0;
                App.render();
            })
        })
    },

    getTotalVote: function(){
        App.contracts.VoteToken.deployed().then(function(instance){
            instance.totalVotes((value)=>{
                App.totalVotes=value.toNumber();
            })
        })
    },

    getTotalVoteCasted: function(){
        App.contracts.VoteToken.deployed().then(function(instance){
            instance.totalVotesCasted((value)=>{
                App.totalVotesCasted=value.toNumber();
            })
        })
    },



      // Listen for events emitted from the contract
    listenForEvents: function() {
        App.contracts.VoteToken.deployed().then(function(instance) {
            instance.VoteEvent({}, {
            fromBlock: 0,
            toBlock: 'latest',
            }).watch(function(error, event) {
                if(error)
                {
                    App.error=1;
                    App.errorMessage="There has been some error while voting ";
                    console.log("There has been some error while voting ",error);
                }
                else{
                    console.log("Voterid of person = ",event.args._voterid," Party voted = ",event.args._voterid," Constituency = ",event.args._constituency);
                    App.getTotalVoteCasted();
                }
                App.render();
            })

            instance.VotingStartEvent({},{
                fromBlock: 0,
                toBlock: 'latest'
            }).watch(function(error, event){
                if(error)
                    console.log("There has been an error while starting the voting process ",error)
                else{
                    console.log("Total number of voters registered are ",event._totalVotes.toNumber() );
                    App.flag_voting_started=1;
                    App.flag_registration_started=0;
                    App.getTotalVoteCasted();
                }
                App.render();
            })

            instance.VotingEndEvent({},{
                fromBlock: 0,
                toBlock: 'latest'
            }).watch(function(error,event){
                if(error)
                    console.log("There has been an error while finishing the end process ",error);
                else{
                    console.log("Voting Finished!! The total number of votes casted is ",event.args._totalCastedVotes);
                    App.flag_voting_started=0;
                    App.flag_voting_ended=1;
                    //App.getResults();
                }
                App.render();
            })

            instance.PartyRegistryEvent({},{
                fromBlock: 0,
                toBlock: 'latest'
            }).watch(function(error,event){
                if(error)
                    console.log("There has been an error in registration of a party ",error);
                else{
                    window.alert("Party Registered !! Party Name = "+event.args._party," Constituency = "+event.args._constituency)
                    console.log("Party Registered !! Party Name = ",event.args._party," Constituency = ",event.args._constituency);
                }
                App.render();
            })

            instance.RegisteringStartEvent({},{
                fromBlock: 0,
                toBlock: 'latest'
            }).watch(function(error,event){
                if(error)
                    console.log("There has been an error while recording a registering start event",error);
                else{
                    console.log("Voters Registration Started !! Name of Tokens = ",event.args._name," symbol = ",event.args._symbol);
                    App.flag_registration_started=1;
                    App.getTotalVote();
                }
                App.render();
            })
        })
    },
}

window.onload = function(){
    App.init();
}
//on entering otp will verify the otp using ajax and will send the result as json
// this json would then be sent to regiter voter and spend voter accordingly

