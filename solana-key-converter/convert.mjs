import bs58 from 'bs58';

// Replace this array with your actual keypair array
const keypairArray = [98,236,191,15,99,142,141,239,54,131,83,194,143,226,162,39,120,81,232,117,207,79,32,63,137,111,112,49,204,110,74,204,87,118,127,102,198,69,102,139,12,75,34,229,62,132,139,12,11,128,187,253,147,44,3,119,76,154,101,75,26,208,234,96];

const uint8Array = Uint8Array.from(keypairArray);
const base58Key = bs58.encode(uint8Array);

console.log('Base58 Private Key:', base58Key);
