
/**
 * This is a template for a transaction that will be sent to the API endpoint. 
 * The API endpoint will sign the transaction using one of 60 wallets tied to 
 * an API key and send it to the network. This is basically testing how fast 
 * we can get from submission to confirmation using a Wallet as a Service model
 * with gas paid from wallets setup under an API key. 
 * 
 */

const template = {

    //this is a deployed wrapped token contract that mints 1 token per 1 native deposted
    "to": "0x7a2D1d1d2Dd78Fc7695680d666fAB66E9ab51445",

    //our test chain id
     "chainId": 31335,

     //roughly how much gas it uses
     "gasLimit": 36000,

     //timeout after 5mins.
     "validUntilSeconds": 300,

     //how much to deposit. Tiny amount to allow massive # txns
     "value": "1",

     //call data to 'deposit'
     "data": "0xd0e30db0"
}
module.exports = {
    template: template
}
