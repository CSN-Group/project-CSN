import { run as runNetwork } from './basicNetworkInfo.js';
//import { run as runSomething } from './modules/something.js';

window.addEventListener('DOMContentLoaded', async () => {
    //runSomething();             // synchronous
    runNetwork();      // asynchronous
    console.log('All done');
});