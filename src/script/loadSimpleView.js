import { run as runNetwork } from './basicNetworkInfo.js';
import { run as runRestart } from './compRestart.js';
//import { run as runSomething } from './modules/something.js';

window.addEventListener('DOMContentLoaded', async () => {    
    runNetwork();      // asynchronous
    await runRestart();      // synchronous
    console.log('All done, Captain!');
});