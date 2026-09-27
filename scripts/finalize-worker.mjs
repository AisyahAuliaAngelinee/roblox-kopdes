import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
// OpenNext leaves require() calls for Wrangler to resolve. Sites uploads
// Worker modules directly, so complete that bundling before packaging.
const temp=await fs.mkdtemp(path.join(os.tmpdir(),'kopdes-worker-'));
try {
  const result=spawnSync(process.execPath,['node_modules/wrangler/bin/wrangler.js','deploy','--dry-run','--config','dist/server/wrangler.json','--outdir',temp],{stdio:'inherit'});
  if(result.status!==0)throw new Error('Worker bundling failed');
  const config=JSON.parse(await fs.readFile('dist/server/wrangler.json','utf8'));
  config.no_bundle=true;
  await fs.rm('dist/server',{recursive:true,force:true});
  await fs.mkdir('dist/server',{recursive:true});
  await fs.copyFile(path.join(temp,'index.js'),'dist/server/index.js');
  await fs.writeFile('dist/server/wrangler.json',JSON.stringify(config,null,2));
} finally {await fs.rm(temp,{recursive:true,force:true});}
