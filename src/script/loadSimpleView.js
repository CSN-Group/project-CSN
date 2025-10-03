import { run as runNetwork } from './basicNetworkInfo.js';
import { run as runRestart } from './compRestart.js';
import { run as runPcName } from './pcNameInfo.js';
//import { run as runSomething } from './modules/something.js';

window.addEventListener('DOMContentLoaded', async () => {    
    runNetwork();
    await runRestart();
    runPcName();
    console.log('All done, Captain!');
});


