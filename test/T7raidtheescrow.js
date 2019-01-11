
let Ransom = artifacts.require("./ZeroRansom.sol");
let Escrow = artifacts.require("./Escrow.sol");
let Registry = artifacts.require("./Registry.sol");

console.log("Testing;")

contract("Evil transaction, substitute amount in themiddle of txn and make it fail", async (accounts) => {


    // Some shortcut functions to save on typing
    let fw = web3.utils.fromWei;
    let tw = web3.utils.toWei;
    let tbn = web3.utils.toBN;
    let gb = web3.eth.getBalance;
    let lg = console.log;


    // three smart contracts under test
    let escrow;
    let registry;
    let ransom

    // accounts that we will use
    let owner = accounts[0];    // owner of ransomware,  final recepient of all ransoms
    let oracle = accounts[1];   // off chain daemon 
    let victim = accounts[2];   // infected person

    let victimId = 0x5500;   // Victim ID
    let ransomAmount = tw('0', 'wei'); // Ransom Amount

    let ttlBalBefore = 0;

    


    before( async () => {

        // Deploy contracts
        registry = await Registry.new(oracle, {from: owner});
        escrow = await Escrow.new(registry.address, oracle, {from: owner});
        ransom = await Ransom.new(victimId, "Hello", victim, registry.address, 55);

        lg('owner="'+owner+'"');

    } );

    it('Record balance at start', async () => {
        
        vicBal = tbn(await gb(victim));
        console.log('Vic Balance: ' , fw(vicBal, 'ether'))
      
        let currentBal = tbn(await gb(owner)).add(tbn(await gb(victim)));
        console.log('Initial Balance:', fw(currentBal, 'ether'));
    
    });

    it('Ensure that Escrow has money for us to withdraw', async () => {


        await escrow.donate({from: owner, value: tw('9.0', 'ether')})

        let escrowBal = fw(tbn(await gb(escrow.address)),'ether');
        assert.equal(escrowBal, 9); 

    });

    it('Can Register victim', async () => {

        await registry.authCallback(victimId, ransom.address, escrow.address, true, {from: oracle} );

        let cnt = await registry.victimCount();
        
        assert.equal(cnt, 1);

    });

    it('Can retrieve ransom addr for victim', async () => {

        let rv_ransom = await registry.getRansomAddressForVictim(0x5500);
        assert.equal(rv_ransom, ransom.address);

    });

    it('Registry knows escrow addr for victim', async() => {

        let rv_escrow = await registry.getEscrowAddressForVictim(0x5500);
        assert.equal(rv_escrow, escrow.address);

    });

    it('Ransom knows escrow addr', async() => {

        let rv_escrow = await ransom.getEscrowAddress();
        assert.equal(rv_escrow, escrow.address);

    });

    it('At this point ransom should be authenticated', async() => {
        let rv_auth = await ransom.isAuthenticated();
        assert.isTrue(rv_auth);
    });

    it('Remember the balance' , async () => {

        ttlBalBefore = tbn(await gb(owner)).add(tbn(await gb(victim)));
        console.log('Balance before :', fw(ttlBalBefore, 'ether'));

    });

    it('After we send zero payment ransom should send lots of money to victim', async() => {
        
        let victimBefore =  fw(await gb(victim), 'ether');
        console.log('Vic Before', victimBefore);

        let rv = await escrow.payRansom(victimId, "DFDFFFD", 
                               {from: victim, value: fw('0', 'wei')});
        console.log('Pay TX', rv.tx);

        rv = await escrow.decryptCallback(victimId, '0x00000000', false, {from: oracle} );
        console.log('Dec TX', rv.tx);

        let escrowBal = fw(tbn(await gb(escrow.address)),'ether');
        assert.equal(escrowBal, 0); 

        let victimAfter =  fw(await gb(victim), 'ether');
        console.log('Vic After', victimAfter);


    });

    it('Owner can claim funds', async() => {

        let ownerIntialBalance =  await web3.eth.getBalance(owner);

        let rv = await escrow.withdrawFunds( owner,  ransomAmount, {from: owner});
        console.log(rv.tx);

        let ttlBalAfter = tbn(await gb(owner)).add(tbn(await gb(victim)));
        console.log('Balance after :', fw(ttlBalAfter, 'ether'));

        
        let ttlBalDiff = ttlBalBefore.sub(ttlBalAfter);
        console.log("Sum bal diff :", fw(ttlBalDiff, 'ether'));

        assert.isBelow(parseFloat(fw(ttlBalDiff)), 0.01);
        
    });



});