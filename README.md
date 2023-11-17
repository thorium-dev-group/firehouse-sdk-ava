# firehouse-sdk-ava
SDK for Avalabs to test firehouse infra. 

This project is aimed at testing how well the Firehouse API can sustain a high transaction rate on an AvaCloud testnet. It is pre-wired to point to a AvaCloud testnet already setup for our team (contact us for more exact network).

Simply send http requests to the endpoint and a bank of wallets will sign and submit the txns as fast possible to the network. 

Please contact us for an API key to test. The default key we setup for our own testing has 60 wallets that it round-robin assigns to incoming txns. Nonces are completely managed to avoid gaps. 

NOTE: this is an early stage edition of what is possible. It does some error checking on the backend but currently does not support type-2 transactions. Meaning, gas prices are fixed at just above the base gas fee for testnet. This may need to change if customers have dynamic gas in their subnets.

## Usage
1) Edit the template.js file to change any details of txns you want to send through the API.
2) Create a .env file that has the following fields:
   1) API_KEY: the API key we give you for testing
   2) API_SECRET: the API secret we provide you
   3) API_ENDPOINT: the API endpoint that we provide you
3) Run yarn to install deps
4) Run yarn build
5) Run yarn start

It will report stats as it runs on tps. Check your block explorer for confirmations. Our experience has been that the explorer cannot keep up with the number of blocks being mined.