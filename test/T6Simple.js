
let Ransom = artifacts.require("./Ransom.sol");
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
    let ransomAmount = tw('2', 'ether'); // Ransom Amount

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
});