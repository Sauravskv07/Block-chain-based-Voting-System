var contracts={};
App={
    web3Provider: null,
    contracts:{},

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
                    console.log("There has been some error while voting ",error);
                }
                else{
                    console.log("Voterid of person = ",event.args._voterid," Party voted = ",event.args._party," Constituency = ",event.args._constituency);
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
                }
            })

            instance.VotingEndEvent({},{
                fromBlock: 0,
                toBlock: 'latest'
            }).watch(function(error,event){
                if(error)
                    console.log("There has been an error while finishing the end process ",error);
                else{
                    console.log("Voting Finished!! The total number of votes casted is ",event.args._totalCastedVotes);
                }
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
            })

            instance.RegisteringStartEvent({},{
                fromBlock: 0,
                toBlock: 'latest'
            }).watch(function(error,event){
                if(error)
                    console.log("There has been an error while recording a registering start event",error);
                else{
                    console.log("Voters Registration Started !! Name of Tokens = ",event.args._name," symbol = ",event.args._symbol);
                }
            })
        })
    },
}

window.onload = function(){
    App.init();
}

