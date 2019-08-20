var contracts={};
App={
    web3Provider: null,
    contracts:{},
    totalVotes: 0,
    totalVotesCasted: 0,
    flag_registration_started: 0,
    flag_voting_started: 0,
    flag_voting_ended: 0,
    error=0,
    errorMessage="",

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
<<<<<<< HEAD
                    console.log("Voterid of person = ",event.args._voterid," Party voted = ",event.args._voterid," Constituency = ",event.args._constituency);
                    App.getTotalVoteCasted();
=======
                    console.log("Voterid of person = ",event.args._voterid," Party voted = ",event.args._party," Constituency = ",event.args._constituency);
>>>>>>> a8ab45e2be3918cc87f2e3a06872dec3e279c2eb
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


