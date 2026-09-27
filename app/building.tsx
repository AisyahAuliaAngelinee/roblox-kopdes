'use client';
import {useLanguage} from './language-context';
import {useEffect,useRef,useState} from 'react';
import {RotateCcw,ZoomIn,ZoomOut,Move} from 'lucide-react';
export default function Building(){
 const {t,language,setLanguage}=useLanguage();
 const host=useRef<HTMLDivElement>(null);const control=useRef<any>(null);const [failed,setFailed]=useState(false);
 useEffect(()=>{let stopped=false,cleanup=()=>{};
 (async()=>{const THREE=await import('three');const {OrbitControls}=await import('three/examples/jsm/controls/OrbitControls.js');if(stopped||!host.current)return;
 const el=host.current;const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(34,el.clientWidth/el.clientHeight,.1,100);camera.position.set(13,8,24);
 let renderer;try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch{setFailed(true);return;}
 renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.setSize(el.clientWidth,el.clientHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.setClearColor(0x000000,0);el.appendChild(renderer.domElement);
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=18;controls.maxDistance=42;controls.minPolarAngle=.35;controls.maxPolarAngle=Math.PI/2.2;controls.target.set(0,2,0);controls.autoRotate=false;controls.autoRotateSpeed=.35;control.current={reset:()=>{camera.position.set(13,8,24);controls.target.set(0,2,0);},zoom:(n:number)=>{camera.position.sub(controls.target).multiplyScalar(n).add(controls.target);}};
 scene.add(new THREE.AmbientLight(0xffffff,2.2));const sun=new THREE.DirectionalLight(0xffefdc,3);sun.position.set(-5,12,9);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-12;sun.shadow.camera.right=12;sun.shadow.camera.top=12;sun.shadow.camera.bottom=-12;scene.add(sun);
 const mat=(c:number)=>new THREE.MeshStandardMaterial({color:c,roughness:.8});const cream=mat(0xfff9e9),red=mat(0xc7343c),dark=mat(0x354c4d),green=mat(0x5c8550),glass=mat(0x9ac4c8),wood=mat(0xb08552);
 const box=(w:number,h:number,d:number,x:number,y:number,z:number,m:any)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;scene.add(o);return o;};
 // Wide shopfront and loading bay inspired by the owner's Roblox reference.
 const white=mat(0xf3f2ec),concrete=mat(0xb6b9bd),charcoal=mat(0x292e38),shutter=mat(0xa61b2a);
 box(19,.18,7,0,-.12,0,concrete);
 box(19,.06,1.7,0,-.18,4,mat(0x424b59));
 for(const x of [-7,-3,1,5])box(2.4,.012,.045,x,-.14,4.25,mat(0xe4c74e));
 // Back wall and side walls leave the loading bay visibly open at the front.
 box(18,4.2,.2,0,2.1,-2.2,white);box(.22,4.2,4.6,-9,2.1,0,white);box(.22,4.2,4.6,9,2.1,0,white);
 box(18,.65,.28,0,3.88,2.2,charcoal);
 box(18.6,.24,5.2,0,4.36,0,shutter);
 for(let x=-9.2;x<9.3;x+=.23)box(.045,.055,5.2,x,4.5,0,red);
 box(18.7,.25,.12,0,4.4,2.65,red);
 for(const x of [-8.9,-6.5,-4.1,-1.7,3.2,5.3,8.9])box(.23,4.15,.28,x,2.08,2.35,white);
 for(const x of [-7.7,-5.3,-2.9]){box(2.05,2.85,.12,x,1.57,2.22,shutter);for(let y=.25;y<3;y+=.16)box(2.03,.014,.03,x,y,2.3,red);box(.08,.13,.04,x,1.3,2.34,concrete);}
 // Shop windows, doors, interior shelves and small grocery packs.
 box(4.5,3.05,.1,.75,1.62,1.8,charcoal);
 for(const x of [-.85,.35,1.55,2.75]){box(1.06,2.85,.045,x,1.64,2.25,glass);box(.07,3.03,.11,x-.57,1.66,2.32,white);}
 for(const y of [.65,1.25,1.85]){box(3.8,.07,.35,.75,y,2.34,concrete);for(let x=-.9;x<2.6;x+=.25)box(.15,.3,.13,x,y+.19,2.4,mat([0xe5b34a,0x61a082,0xd36660][Math.floor((x+1)*10)%3]));}
 box(.06,2.85,.1,1,1.6,2.52,white);box(.06,.45,.09,.9,1.4,2.58,charcoal);
 box(4.9,.18,.85,.75,3.4,2.55,white);
 // Tall logo panel separates the grocery entrance from the warehouse bay.
 box(2,3.55,.3,4.2,1.8,2.32,white);
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=768;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#f3f2ec';ctx.fillRect(0,0,512,768);ctx.fillStyle='#cb172b';ctx.textAlign='center';ctx.font='bold 100px Arial';ctx.fillText('KOP',256,175);ctx.fillText('DES',256,275);ctx.fillText('KEL',256,375);ctx.fillStyle='#222';ctx.font='bold 34px Arial';ctx.fillText('KOPERASI',256,490);ctx.fillStyle='#bb2030';ctx.fillText('MERAH PUTIH',256,550);ctx.font='22px Arial';ctx.fillStyle='#444';ctx.fillText('GERAI & GUDANG',256,610);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(1.65,2.65),new THREE.MeshBasicMaterial({map:texture}));sign.position.set(4.2,2,2.49);scene.add(sign);
 box(3.45,.22,1,7.05,3.5,2.4,shutter);
 box(3.3,.1,4.2,7.05,.08,0,concrete);
 for(const x of [5.7,8.3]){for(const z of [-1.5,1])box(.08,2.6,.08,x,1.3,z,charcoal);for(const y of [.35,1.1,1.9]){box(.7,.08,2.7,x,y,-.25,charcoal);for(const z of [-1,.1,.8])box(.5,.5,.52,x,y+.29,z,wood);}}
 for(let y=.5;y<3.3;y+=.45){box(3.1,.015,.02,7,y,-2.08,concrete);for(let x=5.6+(Math.round(y*10)%2)*.45;x<8.7;x+=.9)box(.015,.44,.02,x,y-.22,-2.07,concrete);}
 box(4.7,.15,.7,.75,.03,2.85,white);box(4.9,.08,.45,.75,-.02,3.4,concrete);
 const resize=new ResizeObserver(()=>{if(!el.clientWidth||!el.clientHeight)return;camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight);});resize.observe(el);
 renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera);});cleanup=()=>{renderer.setAnimationLoop(null);resize.disconnect();controls.dispose();scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose());}});texture.dispose();renderer.dispose();renderer.domElement.remove();};
 })().catch(()=>setFailed(true));return()=>{stopped=true;cleanup();};},[]);
 return <div className="model-area"><div className="model-label"><span className="cube-dot"/> KOPDES VIRTUAL <span>01 / 3D</span></div><div ref={host} className="model-canvas" role="img" aria-label="Model 3D bangunan koperasi merah putih, dengan deretan pintu merah, etalase toko, dan gudang terbuka tanpa orang"/>{failed&&<div className="model-fallback">{t("Tampilan 3D memerlukan browser dengan WebGL. Katalog tetap bisa digunakan.")}</div>}<div className="model-bottom"><span><Move size={14}/> {t("Geser untuk memutar")}</span><div><button aria-label={t("Perbesar bangunan")} onClick={()=>control.current?.zoom(.88)}><ZoomIn size={17}/></button><button aria-label={t("Perkecil bangunan")} onClick={()=>control.current?.zoom(1.12)}><ZoomOut size={17}/></button><button aria-label={t("Reset sudut pandang")} onClick={()=>control.current?.reset()}><RotateCcw size={16}/></button></div></div></div>
}
