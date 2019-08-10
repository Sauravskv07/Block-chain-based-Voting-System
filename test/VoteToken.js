var Vote_Token=artifacts.require('./Vote_Token.sol');

contract('Vote_Token', function(accounts) {
  var tokenInstance;
  var voter='0x1234567890abcd';

  it('initializes the contract with the correct values', function() {
    console.log("LETS PASS EVERYTHING");

    return Vote_Token.deployed().then(function(instance) {
      tokenInstance = instance;
      return tokenInstance.name();
    }).then(function(name) {
      assert.equal(name, "General Election 2019 Vote Token", 'has the correct name');
      return tokenInstance.symbol();
    }).then(function(symbol) {
      assert.equal(symbol, 'VOTE', 'has the correct symbol');
      return tokenInstance.totalVotes();
    }).then(function(total){
      assert.equal(total.toNumber(),0,'has correct initial tokens');
      return tokenInstance.state();
    }).then(function(state){
      assert.equal(state,0,'is in registration phase');
    })
  })

  it('registers a party in a constituency', function() {
    return Vote_Token.deployed().then(function(instance) {
      tokenInstance = instance;
      return tokenInstance.registerParty.call('MUT','BJP',{from: accounts[1]});
    }).then(assert.fail).catch(function(error) {
      console.log(error.message);
      assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
      return tokenInstance.registerParty('MUT','BJP',{from: accounts[0]})
     }).then(function(receipt) {
       assert.equal(receipt.logs.length, 1, 'triggers one event');
       assert.equal(receipt.logs[0].event, 'PartyRegistryEvent', 'should be the "PartyRegistryEvent" event');
       assert.equal(receipt.logs[0].args._constituency,'MUT', 'logs the name of the constituency to which a party is registered');
       assert.equal(receipt.logs[0].args._party,'BJP', 'logs the name of the party registered');
     })
  });

  it('registers a voter',function(){
    return Vote_Token.deployed().then(function(instance) {
      tokenInstance = instance;
      return tokenInstance.register.call(voter,'MT',{from: accounts[2]})
    }).then(assert.fail).catch(function(error){
      console.log(error.message);
      assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
      return tokenInstance.register(voter,'MUT',{from: accounts[1]})
    }).then(function(receipt){
      return tokenInstance.register.call(voter,'MUT',{from: accounts[2]})
    }).then(assert.fail).catch(function(error){
      console.log(error.message);
      assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
    })
  })


  it('starts the voting',function(){
    return Vote_Token.deployed().then(function(instance) {
      tokenInstance = instance;
      return tokenInstance.startVoting.call({from: accounts[1]});
    }).then(assert.fail).catch(function(error) {
      console.log(error.message);
      assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
      return tokenInstance.startVoting({from: accounts[0]})
     }).then(function(receipt){
      assert.equal(receipt.logs.length, 1, 'triggers one event');
      assert.equal(receipt.logs[0].event, 'VotingStartEvent', 'should be the "VotingStartEvent" event');
      assert.equal(receipt.logs[0].args._totalVotes.toNumber(),1, 'logs the number of vote tokens registered');
      return tokenInstance.state();
    }).then(function(state){
      assert.equal(state,1,"the current state of voting process is - voting")
    })
  })

 it('spends the vote token',function(){
    return Vote_Token.deployed().then(function(instance){
      tokenInstance = instance;
      return tokenInstance.spend(voter,"BJP")
    }).then(function(receipt){
      assert.equal(receipt.logs.length, 1, 'triggers one event');
      assert.equal(receipt.logs[0].event, 'VoteEvent', 'should be the "VoteEvent" event');
      assert.equal(receipt.logs[0].args._party,'BJP', 'logs the party voted');
      assert.equal(receipt.logs[0].args._constituency,'MUT', 'logs the constituecy voter belongs to');
      return tokenInstance.spend.call(voter,"BJP")
    }).then(assert.fail).catch(function(error) {
      console.log(error.message);
      assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
    })
  })

  it('ends the voting process',function(){
    return Vote_Token.deployed().then(function(instance) {
      tokenInstance = instance;
      return tokenInstance.endVoting.call({from: accounts[1]})
    }).then(assert.fail).catch(function(error){
      assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
      return tokenInstance.endVoting({from: accounts[0]})
    }).then(function(receipt){
      assert.equal(receipt.logs.length, 1, 'triggers one event');
      assert.equal(receipt.logs[0].event, 'VotingEndEvent', 'should be the "VotingEndEvent" event');
      assert.equal(receipt.logs[0].args._totalVotesCasted.toNumber(),1, 'logs the number of vote tokens casted');      
    })
  })

});




