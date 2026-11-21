const THREE = await import(location.protocol === "file:" ? "./three.module.js" : "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js");

const $ = id => document.getElementById(id);
const sceneHost = $("scene");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x10151a);
scene.fog = new THREE.FogExp2(0x10151a, 0.035);
const camera = new THREE.PerspectiveCamera(68, innerWidth / innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({antialias:true, powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
sceneHost.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0x9aabc4, 0x17110d, 1.25));
const moon = new THREE.DirectionalLight(0xc2d2ef, 1.6);
moon.position.set(-5,9,6); moon.castShadow = true;
moon.shadow.mapSize.set(1024,1024); moon.shadow.camera.left=-14; moon.shadow.camera.right=14; moon.shadow.camera.top=14; moon.shadow.camera.bottom=-14;
scene.add(moon);
const warm = new THREE.PointLight(0xffbd79, 18, 12); warm.position.set(0,3.2,0); scene.add(warm);

const mat=(color,roughness=0.85)=>new THREE.MeshStandardMaterial({color,roughness});
const floorMat=mat(0x292522), wallMat=mat(0x393a3b), wood=mat(0x493326), darkWood=mat(0x211914), gold=mat(0xb28b51), paper=mat(0xe1d4b8), bookRed=mat(0x672c31), bookBlue=mat(0x263b4c);
function cube(parent,w,h,d,material,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
const floor=cube(scene,30,.25,30,floorMat,0,-.18,0);
cube(scene,30,5,.3,wallMat,0,2.35,-8);
cube(scene,30,5,.3,wallMat,0,2.35,8);
cube(scene,.3,5,16,wallMat,-15,2.35,0);
cube(scene,.3,5,16,wallMat,15,2.35,0);
// Tall library shelves with rows of books.
function shelf(x,z){
 const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
 cube(g,2.6,3.8,.35,darkWood,0,1.9,0);
 for(let y=.55;y<3.55;y+=.72){
   cube(g,2.55,.12,.55,wood,0,y,0);
   let bx=-1.15;
   while(bx<1.15){
     const bw=.12+Math.random()*.12, bh=.43+Math.random()*.2;
     const book=new THREE.Mesh(new THREE.BoxGeometry(bw,bh,.32),[bookRed,bookBlue,wood,gold][Math.floor(Math.random()*4)]);
     book.position.set(bx+bw/2,y+.06+bh/2,.02);book.rotation.z=(Math.random()-.5)*.08;book.castShadow=true;g.add(book);bx+=bw+.035;
   }
 }
 cube(g,2.8,.18,.65,wood,0,3.85,0);
}
shelf(-10,-4);shelf(-6,-4);shelf(6,-4);shelf(10,-4);shelf(-10,3);shelf(10,3);
cube(scene,4,.18,1.6,wood,0,1.05,-1);
for(const x of [-1.75,1.75])for(const z of [-.65,.65])cube(scene,.16,1,.16,darkWood,x,.5,-1+z);
for(let x=-12;x<=12;x+=6){const lamp=new THREE.PointLight(0xffd09a,7,8);lamp.position.set(x,3.8,1);scene.add(lamp);const bulb=new THREE.Mesh(new THREE.SphereGeometry(.09,12,8),new THREE.MeshBasicMaterial({color:0xffd9a1}));bulb.position.copy(lamp.position);scene.add(bulb);}
const desk=cube(scene,2.8,.18,1.25,wood,-1,1,-5);
for(const x of [-2.1,.1])for(const z of [-5.45,-4.55])cube(scene,.12,1,.12,darkWood,x,.48,z);
cube(scene,.7,.06,.48,paper,-1,1.13,-5);
const rug=cube(scene,5,.035,3,mat(0x35272a),0,-.035,2.2);

// Player: a simple original low-poly detective model.
const player=new THREE.Group();scene.add(player);
const coat=new THREE.Mesh(new THREE.CapsuleGeometry(.34,.72,4,8),mat(0x242b32));coat.position.y=.85;coat.castShadow=true;player.add(coat);
const head=new THREE.Mesh(new THREE.SphereGeometry(.25,16,12),mat(0xc7a98c));head.position.y=1.55;head.castShadow=true;player.add(head);
const hair=new THREE.Mesh(new THREE.SphereGeometry(.26,12,8,0,Math.PI*2,0,Math.PI*.55),mat(0x171719));hair.position.y=1.66;player.add(hair);
const legs=mat(0x15191e);
for(const x of [-.17,.17]){const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.11,.48,3,6),legs);leg.position.set(x,.28,0);player.add(leg);}
player.position.set(0,0,5);
let yaw=0,pitch=-.08,firstPerson=false,nearby=null;
const keys=new Set(), touchMoves=new Set();
const clues=[
 {id:"mira",name:"Журнал доступа",detail:"В журнале есть отметка Миры в 21:32 — на семнадцать минут позже заявленного ухода.",pos:new THREE.Vector3(-1,1.25,-5),color:0xc5a66a},
 {id:"ren",name:"Обрывок записки",detail:"На бумаге написано: «встретимся после закрытия». Почерк не совпадает с конспектом.",pos:new THREE.Vector3(1.1,1.2,-5),color:0xb5c9d9},
 {id:"kaito",name:"Карта камер",detail:"Камера восточного коридора отключилась ровно на девять минут.",pos:new THREE.Vector3(0,1.1,-1),color:0xa94a53}
];
const clueMeshes=[];
for(const clue of clues){
 const group=new THREE.Group();group.position.copy(clue.pos);scene.add(group);
 const base=new THREE.Mesh(new THREE.BoxGeometry(.42,.05,.32),wood);base.castShadow=true;group.add(base);
 const sheet=new THREE.Mesh(new THREE.PlaneGeometry(.32,.24),paper);sheet.rotation.x=-Math.PI/2;sheet.position.y=.04;group.add(sheet);
 const glow=new THREE.PointLight(clue.color,1.6,2.8);glow.position.y=.35;group.add(glow);
 clueMeshes.push({clue,group,glow});
}
const collected=new Set();
const bookNotes=$("notes");
bookNotes.value=localStorage.getItem("blackFilesNotes")||"";
bookNotes.addEventListener("input",()=>localStorage.setItem("blackFilesNotes",bookNotes.value));
let page=0;
function renderPage(){
 const pages=[
  ["Дело № 001","В городской библиотеке произошло загадочное происшествие. Исследуй зал, найди три улики и установи, кто скрывает правду."],
  ["Материалы дела",clues.filter(c=>collected.has(c.id)).map(c=>"• "+c.name+": "+c.detail).join("\n\n")||"Пока улик нет. Найди светящиеся документы в библиотеке."],
  ["Странный силуэт","Когда последняя улика была найдена, в глубине библиотеки мелькнула высокая фигура. Она не похожа ни на одного сотрудника..."]
 ];
 $("pageTitle").textContent=pages[page][0];$("pageText").textContent=pages[page][1];
 $("pageClues").textContent=page===1? "СОБРАНО: "+collected.size+" / 3":"ЗАПИСИ СЛЕДОВАТЕЛЯ";
 $("bookPageLabel").textContent=(page+1)+" / 3";$("leftPageNum").textContent=String(page*2+1).padStart(2,"0");$("rightPageNum").textContent=String(page*2+2).padStart(2,"0");
}
function toast(message){const t=$("toast");t.textContent=message;t.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove("show"),2300);}
function collectNearby(){
 if(!nearby)return;
 if(collected.has(nearby.id)){toast("Эта улика уже в тетради.");return;}
 collected.add(nearby.id);
 $("clueCounter").textContent=collected.size+"/3";
 $("missionTitle").textContent=collected.size===3?"Найди таинственную фигуру":"Улики найдены: "+collected.size+"/3";
 $("missionHint").textContent=collected.size===3?"Что-то движется между стеллажами...":"Продолжай осматривать библиотеку.";
 renderPage();toast("Добавлено в тетрадь: "+nearby.name);
 if(collected.size===3)revealWatcher();
 nearby=null;$("interactPrompt").style.display="none";
}
function revealWatcher(){
 const watcher=new THREE.Group();watcher.position.set(0,0,-6.5);scene.add(watcher);
 const robe=new THREE.Mesh(new THREE.ConeGeometry(.62,2.1,7),mat(0x09090d));robe.position.y=1.05;robe.castShadow=true;watcher.add(robe);
 const face=new THREE.Mesh(new THREE.SphereGeometry(.23,12,8),mat(0x17151a));face.position.y=1.9;watcher.add(face);
 const eyes=new THREE.Mesh(new THREE.BoxGeometry(.22,.035,.025),new THREE.MeshBasicMaterial({color:0xc44b50}));eyes.position.set(0,1.94,.21);watcher.add(eyes);
 const aura=new THREE.PointLight(0x8e2934,4,4);aura.position.y=1.8;watcher.add(aura);
 $("missionTitle").textContent="Кто стоит в темноте?";
 $("missionHint").textContent="Подойди ближе... или открой тетрадь.";
 toast("В глубине библиотеки кто-то появился...");
}
$("cameraBtn").addEventListener("click",()=>{firstPerson=!firstPerson;$("cameraBtn").textContent="КАМЕРА: "+(firstPerson?"1-Е ЛИЦО":"3-Е ЛИЦО");player.children.forEach(c=>c.visible=!firstPerson);});
$("bookBtn").addEventListener("click",()=>{$("bookOverlay").classList.remove("hidden");renderPage();});
$("closeBook").addEventListener("click",()=>$("bookOverlay").classList.add("hidden"));
$("prevPage").addEventListener("click",()=>{page=(page+2)%3;renderPage();});
$("nextPage").addEventListener("click",()=>{page=(page+1)%3;renderPage();});
$("bookOverlay").addEventListener("click",e=>{if(e.target===$("bookOverlay"))$("bookOverlay").classList.add("hidden");});
addEventListener("keydown",e=>{keys.add(e.key.toLowerCase());if(e.key.toLowerCase()==="e")collectNearby();if(e.key==="Escape"&&document.pointerLockElement)document.exitPointerLock();});
addEventListener("keyup",e=>keys.delete(e.key.toLowerCase()));
renderer.domElement.addEventListener("click",()=>{if(!matchMedia("(pointer:coarse)").matches && !$("bookOverlay").classList.contains("hidden"))return;if(!matchMedia("(pointer:coarse)").matches)renderer.domElement.requestPointerLock?.();});
addEventListener("mousemove",e=>{if(document.pointerLockElement===renderer.domElement){yaw-=e.movementX*.0022;pitch=Math.max(-.65,Math.min(.45,pitch-e.movementY*.0018));}});
let touchLook=null;
renderer.domElement.addEventListener("pointerdown",e=>{if(e.pointerType!=="mouse"){touchLook={x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId);}});
renderer.domElement.addEventListener("pointermove",e=>{if(touchLook&&e.pointerType!=="mouse"){yaw-=(e.clientX-touchLook.x)*.006;pitch=Math.max(-.65,Math.min(.45,pitch-(e.clientY-touchLook.y)*.004));touchLook={x:e.clientX,y:e.clientY};}});
renderer.domElement.addEventListener("pointerup",()=>touchLook=null);
document.querySelectorAll("[data-move]").forEach(b=>{
 const start=e=>{e.preventDefault();touchMoves.add(b.dataset.move);};
 const end=e=>{e.preventDefault();touchMoves.delete(b.dataset.move);};
 b.addEventListener("pointerdown",start);b.addEventListener("pointerup",end);b.addEventListener("pointercancel",end);b.addEventListener("pointerleave",end);
});
const clock=new THREE.Clock();
const direction=new THREE.Vector3(),forward=new THREE.Vector3(),right=new THREE.Vector3();
function animate(){
 requestAnimationFrame(animate);
 const dt=Math.min(clock.getDelta(),.04);
 const f=Number(keys.has("w")||keys.has("arrowup")||touchMoves.has("forward"))-Number(keys.has("s")||keys.has("arrowdown")||touchMoves.has("back"));
 const side=Number(keys.has("d")||keys.has("arrowright")||touchMoves.has("right"))-Number(keys.has("a")||keys.has("arrowleft")||touchMoves.has("left"));
 forward.set(-Math.sin(yaw),0,-Math.cos(yaw));right.set(Math.cos(yaw),0,-Math.sin(yaw));
 direction.copy(forward).multiplyScalar(f).addScaledVector(right,side);
 if(direction.lengthSq()>0){direction.normalize();player.position.addScaledVector(direction,dt*3.15);player.rotation.y=Math.atan2(-direction.x,-direction.z);}
 player.position.x=THREE.MathUtils.clamp(player.position.x,-13.6,13.6);player.position.z=THREE.MathUtils.clamp(player.position.z,-7.1,7.1);
 const target=clues.filter(c=>!collected.has(c.id)).sort((a,b)=>a.pos.distanceTo(player.position)-b.pos.distanceTo(player.position))[0];
 nearby=target&&target.pos.distanceTo(player.position)<2.1?target:null;
 $("interactPrompt").style.display=nearby?"block":"none";
 if(nearby)$("interactPrompt").textContent="НАЖМИ E, ЧТОБЫ ИЗУЧИТЬ: "+nearby.name;
 if(firstPerson){camera.position.set(player.position.x,player.position.y+1.58,player.position.z);camera.rotation.order="YXZ";camera.rotation.set(pitch,yaw,0);}
 else{const desired=new THREE.Vector3(player.position.x+Math.sin(yaw)*4.8,player.position.y+3.1,player.position.z+Math.cos(yaw)*4.8);camera.position.lerp(desired,1-Math.exp(-5*dt));const look=new THREE.Vector3(player.position.x,player.position.y+1.15,player.position.z);camera.lookAt(look);}
 for(const item of clueMeshes){item.group.rotation.y=Math.sin(performance.now()*.001+item.clue.pos.x)*.06;item.glow.intensity=1.4+Math.sin(performance.now()*.003)*.5;item.group.visible=!collected.has(item.clue.id);}
 renderer.render(scene,camera);
}
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));});
renderPage();animate();
$("loading").style.opacity="0";setTimeout(()=>$("loading").remove(),550);
