import fs from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
const result=spawnSync(process.execPath,['node_modules/@opennextjs/cloudflare/dist/cli/index.js','build'],{stdio:'inherit',env:{...process.env,NEXT_TELEMETRY_DISABLED:'1'}});
if(result.status!==0)process.exit(result.status??1);
await fs.rm('dist',{recursive:true,force:true});await fs.mkdir('dist/server',{recursive:true});await fs.mkdir('dist/.openai',{recursive:true});
await fs.cp('.open-next','dist/server',{recursive:true,filter:src=>!src.startsWith('.open-next/assets')&&!src.endsWith('.env')&&!src.endsWith('.dev.vars')});
await fs.cp('.open-next/assets','dist/client',{recursive:true});
// Runtime secrets come from Sites bindings, never from the developer's local .env.
await fs.writeFile('dist/server/cloudflare/next-env.mjs','export const production = {};\nexport const development = {};\nexport const test = {};\n');
await fs.writeFile('dist/server/index.js','export {default} from "./worker.js";\nexport * from "./worker.js";\n');
await fs.copyFile('.openai/hosting.json','dist/.openai/hosting.json');
await fs.cp('drizzle','dist/.openai/drizzle',{recursive:true});
const config=JSON.parse(await fs.readFile('wrangler.json','utf8'));config.main='index.js';config.assets.directory='../client';
await fs.writeFile('dist/server/wrangler.json',JSON.stringify(config,null,2));
await import('./finalize-worker.mjs');
