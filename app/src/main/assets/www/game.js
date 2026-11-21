
const $ = id => document.getElementById(id);
const sceneHost = $("scene");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x10151a);
scene.fog = new THREE.FogExp2(0x10151a, 0.035);
const camera = new THREE.PerspectiveCamera(68, innerWidth / innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({antialias:true, powerPreference:"high-performance"});
const isTouchDevice=matchMedia("(pointer:coarse)").matches;
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isTouchDevice ? 1.5 : 2));
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
moon.shadow.mapSize.set(isTouchDevice?1024:2048,isTouchDevice?1024:2048); moon.shadow.camera.left=-14; moon.shadow.camera.right=14; moon.shadow.camera.top=14; moon.shadow.camera.bottom=-14; moon.shadow.bias=-0.00025; moon.shadow.normalBias=0.025;
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

const notebookPosition=new THREE.Vector3(-1,1.2,-5);
const ledger=new THREE.Group();ledger.position.copy(notebookPosition);scene.add(ledger);
const ledgerCover=mat(0x171316,.48),ledgerEdge=mat(0x8e2835,.55);
cube(ledger,.62,.075,.46,ledgerCover,0,0,0);
cube(ledger,.035,.078,.46,ledgerEdge,-.29,0,0);
// Illustrated black leather cover with the blood-marked hand artwork.
const coverTexture=new THREE.TextureLoader().load("notebook-cover.svg");
coverTexture.colorSpace=THREE.SRGBColorSpace;
const coverArt=new THREE.Mesh(new THREE.PlaneGeometry(.616,.456),new THREE.MeshBasicMaterial({map:coverTexture,roughness:1}));
coverArt.rotation.x=-Math.PI/2;coverArt.position.y=.039;ledger.add(coverArt);
const ledgerTexture=new THREE.TextureLoader().load("notebook-cover.webp");
ledgerTexture.colorSpace=THREE.SRGBColorSpace;
const ledgerFace=new THREE.Mesh(new THREE.PlaneGeometry(.56,.4),new THREE.MeshStandardMaterial({map:ledgerTexture,roughness:.92}));
ledgerFace.rotation.x=-Math.PI/2;ledgerFace.position.set(0,.04,0);ledger.add(ledgerFace);
const ledgerGlow=new THREE.PointLight(0x8d2634,1.1,2.4);ledgerGlow.position.set(0,.35,0);ledger.add(ledgerGlow);
const secretSeal=new THREE.Group();secretSeal.position.set(0,1.8,-7.78);secretSeal.visible=false;scene.add(secretSeal);
const sealRing=new THREE.Mesh(new THREE.TorusGeometry(.48,.035,10,48),new THREE.MeshStandardMaterial({color:0xb82e3b,emissive:0x65101b,emissiveIntensity:1.8,metalness:.35,roughness:.35}));secretSeal.add(sealRing);
const sealCore=new THREE.Mesh(new THREE.CircleGeometry(.32,8),new THREE.MeshBasicMaterial({color:0x26070c,transparent:true,opacity:.88}));secretSeal.add(sealCore);
const sealLight=new THREE.PointLight(0xc02d3d,0,4);sealLight.position.set(0,0,.35);secretSeal.add(sealLight);
const rug=cube(scene,5,.035,3,mat(0x35272a),0,-.035,2.2);
// Subtle floor inlays and architectural trim give the library more depth.
const floorLine=mat(0x38312c);
for(let x=-14;x<=14;x+=2) cube(scene,.018,.012,29,floorLine,x,-.045,0);
const trim=mat(0x211914);
cube(scene,29.6,.16,.12,trim,0,.02,-7.78);cube(scene,29.6,.16,.12,trim,0,.02,7.78);
cube(scene,.12,.16,15.6,trim,-14.78,.02,0);cube(scene,.12,.16,15.6,trim,14.78,.02,0);
// Floating dust catches the warm library lights.
const dustPositions=new Float32Array(180*3);
for(let i=0;i<180;i++){dustPositions[i*3]=(Math.random()-.5)*25;dustPositions[i*3+1]=.3+Math.random()*3.8;dustPositions[i*3+2]=(Math.random()-.5)*13;}
const dustGeometry=new THREE.BufferGeometry();dustGeometry.setAttribute("position",new THREE.BufferAttribute(dustPositions,3));
const dust=new THREE.Points(dustGeometry,new THREE.PointsMaterial({color:0xd8c7a4,size:.025,transparent:true,opacity:.42,depthWrite:false}));scene.add(dust);

// Player: a simple original low-poly detective model.
const player=new THREE.Group();scene.add(player);
const coat=new THREE.Mesh(new THREE.CapsuleGeometry(.34,.72,4,8),mat(0x242b32));coat.position.y=.85;coat.castShadow=true;player.add(coat);
const head=new THREE.Mesh(new THREE.SphereGeometry(.25,16,12),mat(0xc7a98c));head.position.y=1.55;head.castShadow=true;player.add(head);
const hair=new THREE.Mesh(new THREE.SphereGeometry(.26,12,8,0,Math.PI*2,0,Math.PI*.55),mat(0x171719));hair.position.y=1.66;player.add(hair);
const legs=mat(0x15191e);
for(const x of [-.17,.17]){const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.11,.48,3,6),legs);leg.position.set(x,.28,0);player.add(leg);}
player.position.set(0,0,5);
let yaw=0,pitch=-.08,firstPerson=false,nearby=null,watcher=null,watcherInteracted=false,ledgerRead=false,sealUnlocked=false,sealActivated=false;
let gameStarted=false,chapterIndex=1,campaignComplete=false;
let activeClues=[];
const keys=new Set();
let stickX=0,stickY=0;
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
activeClues=clues;
const collected=new Set();
const chapterEvidence={
 2:[["Папка без номера","В архиве обнаружена папка, которую вычеркнули из каталога.",new THREE.Vector3(-8,1.1,-4)],["Запись дежурного","Дежурный слышал шаги в закрытом крыле после полуночи.",new THREE.Vector3(8,1.1,-4)],["Сломанный ключ","На ключе остался след красного воска.",new THREE.Vector3(0,1.1,3)]],
 3:[["Голос на плёнке","На записи слышно имя человека, которого нет в списках.",new THREE.Vector3(-10,1.1,2)],["Письмо свидетеля","Свидетель утверждает, что видел самого себя в двух местах.",new THREE.Vector3(10,1.1,2)]],
 4:[["Кадр наблюдения","На кадре силуэт стоит прямо за спиной следователя.",new THREE.Vector3(-7,1.1,5)],["Часы смотрителя","Стрелки остановились в момент появления реестра.",new THREE.Vector3(7,1.1,5)],["Скрытая схема","Под полом отмечен проход к комнате записей.",new THREE.Vector3(0,1.1,-2)]],
 5:[["Последнее признание","В признании сказано: реестр выбирает не жертву, а автора.",new THREE.Vector3(-5,1.1,-6)],["Пустая страница","На последней странице проступает отпечаток твоей ладони.",new THREE.Vector3(5,1.1,-6)]]
};
const allEvidence=[...clues,...Object.entries(chapterEvidence).flatMap(([chapter,items])=>items.map((entry,i)=>({id:"ch"+chapter+"_"+i,name:entry[0],detail:entry[1]})))];
function setMission(title,hint){$("missionTitle").textContent=title;$("missionHint").textContent=hint;}
function spawnChapterEvidence(index){
 activeClues=chapterEvidence[index].map((entry,i)=>({id:"ch"+index+"_"+i,name:entry[0],detail:entry[1],pos:entry[2],color:0xc04a55}));
 for(const clue of activeClues){
  const group=new THREE.Group();group.position.copy(clue.pos);scene.add(group);
  const base=new THREE.Mesh(new THREE.BoxGeometry(.46,.06,.34),darkWood);base.castShadow=true;group.add(base);
  const sheet=new THREE.Mesh(new THREE.PlaneGeometry(.34,.25),paper);sheet.rotation.x=-Math.PI/2;sheet.position.y=.045;group.add(sheet);
  const glow=new THREE.PointLight(0xc04a55,1.8,3);glow.position.y=.4;group.add(glow);
  clueMeshes.push({clue,group,glow});group.visible=false;
 }
}
for(const index of [2,3,4,5])spawnChapterEvidence(index);
function startChapter(index){
 chapterIndex=index;activeClues=chapterEvidence[index].map((entry,i)=>({id:"ch"+index+"_"+i,name:entry[0],detail:entry[1],pos:entry[2],color:0xc04a55}));
 for(const item of clueMeshes)item.group.visible=activeClues.some(c=>c.id===item.clue.id)&&!collected.has(item.clue.id);
 const titles={2:"Глава II · Архив без номера",3:"Глава III · Свидетель, которого нет",4:"Глава IV · Комната наблюдения",5:"Глава V · Последняя запись"};
 const hints={2:"Найди три следа в закрытом архивном крыле.",3:"Собери две части свидетельства и выясни, кто оставил запись.",4:"Исследуй комнату наблюдения и раскрой, кто следил за тобой.",5:"Найди последнее признание. Затем вернись к Чёрному реестру."};
 setMission(titles[index],hints[index]);$("statusText").textContent="BLACK FILES · ГЛАВА "+index;
 $("clueCounter").textContent=activeClues.filter(c=>collected.has(c.id)).length+"/"+activeClues.length;
 toast(titles[index]);
}
function finishChapter(index){
 if(index<5){toast("Глава завершена. Материалы следующего дела уже ждут.");startChapter(index+1);}
 else{setMission("Глава V завершена · Вернись к реестру","Подойди к чёрной тетради на столе и нажми «ВЗАИМОДЕЙСТВОВАТЬ».");toast("Все улики собраны. Осталась последняя запись.");}
}
const bookNotes=$("notes");
bookNotes.value=localStorage.getItem("blackFilesNotes")||"";
bookNotes.addEventListener("input",()=>localStorage.setItem("blackFilesNotes",bookNotes.value));
let page=0;
function renderPage(){
 $("acceptRules").style.display=(page===3&&!ledgerRead)?"inline-block":"none";
 const pages=[
  ["Дело № 001","В городской библиотеке произошло загадочное происшествие. Исследуй зал, найди три улики и установи, кто скрывает правду."],
  ["Материалы дела",allEvidence.filter(c=>collected.has(c.id)).map(c=>"• "+c.name+": "+c.detail).join("\n\n")||"Пока улик нет. Найди светящиеся документы в библиотеке."],
  ["Странный силуэт","Когда последняя улика была найдена, в глубине библиотеки мелькнула высокая фигура. Она не похожа ни на одного сотрудника..."],
  ["Правила Чёрного реестра","I. Имя, записанное без понимания его истории, остаётся незавершённым.\n\nII. Каждая запись стирает одно личное воспоминание автора.\n\nIII. Если страницы шелестят сами по себе — Смотритель уже рядом."]
 ];
 $("pageTitle").textContent=pages[page][0];$("pageText").textContent=pages[page][1];
 $("pageClues").textContent=page===1? "СОБРАНО: "+collected.size+" / "+allEvidence.length:"ЗАПИСИ СЛЕДОВАТЕЛЯ";
 $("bookPageLabel").textContent=(page+1)+" / 4";$("leftPageNum").textContent=String(page*2+1).padStart(2,"0");$("rightPageNum").textContent=String(page*2+2).padStart(2,"0");
}
function toast(message){const t=$("toast");t.textContent=message;t.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove("show"),2300);}
function collectNearby(){
 if(!nearby)return;
 if(collected.has(nearby.id)){toast("Эта улика уже в тетради.");return;}
 collected.add(nearby.id);
 const chapterCollected=activeClues.filter(c=>collected.has(c.id)).length;
 const chapterTotal=activeClues.length;
 $("clueCounter").textContent=chapterCollected+"/"+chapterTotal;
 $("missionTitle").textContent=chapterCollected===chapterTotal?(chapterIndex===1?"Найди таинственную фигуру":"Глава завершена"):"Улики найдены: "+chapterCollected+"/"+chapterTotal;
 $("missionHint").textContent=chapterCollected===chapterTotal?(chapterIndex===1?"Что-то движется между стеллажами...":"Материалы дела собраны. Продолжение начинается..."):"Продолжай осматривать помещение.";
 renderPage();toast("Добавлено в тетрадь: "+nearby.name);
 nearby=null;$("interactPrompt").style.display="none";
 if(chapterCollected===chapterTotal){if(chapterIndex===1)revealWatcher();else finishChapter(chapterIndex);}
}
function acceptLedgerRules(){
 if(ledgerRead)return;
 ledgerRead=true;sealUnlocked=true;secretSeal.visible=true;sealLight.intensity=3.5;
 $("bookOverlay").classList.add("hidden");
 $("missionTitle").textContent="Найди красную печать";
 $("missionHint").textContent="Реестр пробудился. Осмотри светящийся знак на дальней стене библиотеки.";
 toast("Смотритель: «Ты прочитал правила. Теперь реестр знает твоё имя...»");
}
function performInteraction(){
 if(nearby){collectNearby();return;}
 if(sealUnlocked&&!sealActivated&&Math.hypot(player.position.x,player.position.z+7.1)<2.6){sealActivated=true;sealLight.intensity=0;secretSeal.scale.setScalar(1.8);toast("ПЕЧАТЬ ОТКЛИКНУЛАСЬ. За стеной открылся архивный проход.");startChapter(2);return;}
 if(chapterIndex===1&&watcher&&new THREE.Vector3(watcher.position.x,0,watcher.position.z).distanceTo(player.position)<2.8){
   if(ledgerRead){toast("Смотритель: «Печать откроет то, что было скрыто...»");return;}
   if(!watcherInteracted){watcherInteracted=true;toast("Смотритель: «Не всякое имя должно быть записано...»");$("missionTitle").textContent="Узнай правила Чёрного реестра";$("missionHint").textContent="Осмотри тетрадь на письменном столе.";}
   else toast("Смотритель молча наблюдает за тобой...");
   return;
 }
 if(notebookPosition.distanceTo(player.position)<2.35){
 if(chapterIndex===5&&activeClues.every(c=>collected.has(c.id))&&!campaignComplete){
  campaignComplete=true;$("bookOverlay").classList.remove("hidden");page=3;renderPage();
  $("pageTitle").textContent="Последняя запись";
  $("pageText").textContent="Ты собрал все пять частей дела. Смотритель исчез, но на пустой странице проступили слова: «Первое имя уже было твоим». Дело закрыто… или только началось?";
  $("pageClues").textContent="КАМПАНИЯ ЗАВЕРШЕНА · 5 ГЛАВ";
  setMission("Дело закрыто?","Ты раскрыл пять глав Чёрного дела. Но реестр оставил последнее предупреждение.");
  toast("ПЯТЬ ГЛАВ ПРОЙДЕНЫ. ЧЁРНЫЙ РЕЕСТР НЕ ЗАКРЫТ.");
  return;
 }
 $("bookOverlay").classList.remove("hidden");page=3;renderPage();toast("Ты открыл Чёрный реестр. Прочитай его правила.");return;
}
 
 toast("Поблизости нет ничего, с чем можно взаимодействовать.");
}
function revealWatcher(){
 watcher=new THREE.Group();watcher.position.set(0,0,-6.5);scene.add(watcher);
 const robe=new THREE.Mesh(new THREE.ConeGeometry(.62,2.1,7),mat(0x09090d));robe.position.y=1.05;robe.castShadow=true;watcher.add(robe);
 const face=new THREE.Mesh(new THREE.SphereGeometry(.23,12,8),mat(0x17151a));face.position.y=1.9;watcher.add(face);
 const eyes=new THREE.Mesh(new THREE.BoxGeometry(.22,.035,.025),new THREE.MeshBasicMaterial({color:0xc44b50}));eyes.position.set(0,1.94,.21);watcher.add(eyes);
 const aura=new THREE.PointLight(0x8e2934,4,4);aura.position.y=1.8;watcher.add(aura);
 $("missionTitle").textContent="Кто стоит в темноте?";
 $("missionHint").textContent="Подойди к силуэту и нажми «ВЗАИМОДЕЙСТВОВАТЬ»...";
 toast("В глубине библиотеки кто-то появился...");
}
// Hold-to-move touch buttons; keyboard controls remain available.
document.querySelectorAll("[data-move]").forEach(button=>{
 const key=button.dataset.move;
 const press=e=>{e.preventDefault();keys.add(key);button.classList.add("is-pressed");button.setPointerCapture?.(e.pointerId);};
 const release=e=>{if(e)e.preventDefault();keys.delete(key);button.classList.remove("is-pressed");};
 button.addEventListener("pointerdown",press);button.addEventListener("pointerup",release);button.addEventListener("pointercancel",release);button.addEventListener("lostpointercapture",release);
});
$("actionBtn").addEventListener("click",performInteraction);
$("startGameBtn").addEventListener("click",()=>{gameStarted=true;$("startScreen").classList.add("hidden");document.body.classList.add("game-started");setMission("Осмотри библиотеку","Найди три улики и выясни, почему Чёрный реестр оказался здесь.");});
$("cameraBtn").addEventListener("click",()=>{firstPerson=!firstPerson;$("cameraBtn").textContent="КАМЕРА: "+(firstPerson?"1-Е ЛИЦО":"3-Е ЛИЦО");player.children.forEach(c=>c.visible=!firstPerson);});
$("bookBtn").addEventListener("click",()=>{$("bookOverlay").classList.remove("hidden");renderPage();});
$("closeBook").addEventListener("click",()=>$("bookOverlay").classList.add("hidden"));
$("acceptRules").addEventListener("click",acceptLedgerRules);
$("prevPage").addEventListener("click",()=>{page=(page+3)%4;renderPage();});
$("nextPage").addEventListener("click",()=>{page=(page+1)%4;renderPage();});
$("bookOverlay").addEventListener("click",e=>{if(e.target===$("bookOverlay"))$("bookOverlay").classList.add("hidden");});
addEventListener("keydown",e=>{keys.add(e.key.toLowerCase());if(!gameStarted)return;if(e.key.toLowerCase()==="e")performInteraction();if(e.key==="Escape"&&document.pointerLockElement)document.exitPointerLock();});
addEventListener("keyup",e=>keys.delete(e.key.toLowerCase()));
renderer.domElement.addEventListener("click",()=>{if(!matchMedia("(pointer:coarse)").matches && !$("bookOverlay").classList.contains("hidden"))return;if(!matchMedia("(pointer:coarse)").matches)renderer.domElement.requestPointerLock?.();});
addEventListener("mousemove",e=>{if(document.pointerLockElement===renderer.domElement){yaw-=e.movementX*.0022;pitch=Math.max(-.65,Math.min(.45,pitch-e.movementY*.0018));}});
let touchLook=null;
renderer.domElement.style.touchAction="none";
renderer.domElement.addEventListener("pointerdown",e=>{
 if(e.pointerType!=="mouse"&&e.clientX>innerWidth*.34&&!$("bookOverlay").classList.contains("hidden"))return;
 if(e.pointerType!=="mouse"&&e.clientX>innerWidth*.34){
   e.preventDefault();touchLook={id:e.pointerId,x:e.clientX,y:e.clientY};
   renderer.domElement.setPointerCapture(e.pointerId);
 }
});
renderer.domElement.addEventListener("pointermove",e=>{
 if(touchLook&&e.pointerId===touchLook.id&&e.pointerType!=="mouse"){
   e.preventDefault();
   const dx=e.clientX-touchLook.x,dy=e.clientY-touchLook.y;
   yaw-=dx*.007;pitch=Math.max(-.72,Math.min(.5,pitch-dy*.005));
   touchLook={id:e.pointerId,x:e.clientX,y:e.clientY};
 }
});
const stopLook=e=>{if(touchLook&&(!e||e.pointerId===touchLook.id))touchLook=null;};
renderer.domElement.addEventListener("pointerup",stopLook);
renderer.domElement.addEventListener("pointercancel",stopLook);
const joystick=$("joystick"),joystickKnob=$("joystickKnob");
function updateJoystick(e){
 const r=joystick.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
 const max=r.width*.34,dx=e.clientX-cx,dy=e.clientY-cy,len=Math.hypot(dx,dy),scale=len>max?max/len:1;
 const x=dx*scale,y=dy*scale;
 stickX=x/max;stickY=y/max;
 joystickKnob.style.left=(50+stickX*34)+"%";joystickKnob.style.top=(50+stickY*34)+"%";
}
function resetJoystick(){stickX=0;stickY=0;joystickKnob.style.left="50%";joystickKnob.style.top="50%";}
joystick.addEventListener("pointerdown",e=>{e.preventDefault();joystick.setPointerCapture(e.pointerId);updateJoystick(e);});
joystick.addEventListener("pointermove",e=>{if(joystick.hasPointerCapture(e.pointerId))updateJoystick(e);});
joystick.addEventListener("pointerup",resetJoystick);
joystick.addEventListener("pointercancel",resetJoystick);
const clock=new THREE.Clock();
const direction=new THREE.Vector3(),forward=new THREE.Vector3(),right=new THREE.Vector3();
function animate(){
 requestAnimationFrame(animate);
 const dt=Math.min(clock.getDelta(),.04);
 const f=Number(keys.has("w")||keys.has("arrowup"))-Number(keys.has("s")||keys.has("arrowdown"))-stickY;
 const side=Number(keys.has("d")||keys.has("arrowright"))-Number(keys.has("a")||keys.has("arrowleft"))+stickX;
 forward.set(-Math.sin(yaw),0,-Math.cos(yaw));right.set(Math.cos(yaw),0,-Math.sin(yaw));
 direction.copy(forward).multiplyScalar(f).addScaledVector(right,side);
 if(gameStarted&&direction.lengthSq()>0){direction.normalize();player.position.addScaledVector(direction,dt*3.15);player.rotation.y=Math.atan2(-direction.x,-direction.z);}
 player.position.x=THREE.MathUtils.clamp(player.position.x,-13.6,13.6);player.position.z=THREE.MathUtils.clamp(player.position.z,-7.1,7.1);
 const target=activeClues.filter(c=>!collected.has(c.id)).sort((a,b)=>a.pos.distanceTo(player.position)-b.pos.distanceTo(player.position))[0];
 nearby=target&&target.pos.distanceTo(player.position)<2.1?target:null;
 const watcherNear=!!watcher&&new THREE.Vector3(watcher.position.x,0,watcher.position.z).distanceTo(player.position)<2.8;
 const ledgerNear=notebookPosition.distanceTo(player.position)<2.35;
 const sealNear=sealUnlocked&&!sealActivated&&Math.hypot(player.position.x,player.position.z+7.1)<2.6;
 const actionLabel=nearby?"СОБРАТЬ УЛИКУ":sealNear?"АКТИВИРОВАТЬ КРАСНУЮ ПЕЧАТЬ":watcherNear?"ПОГОВОРИТЬ СО СМОТРИТЕЛЕМ":ledgerNear?"ИЗУЧИТЬ ЧЁРНЫЙ РЕЕСТР":"ВЗАИМОДЕЙСТВОВАТЬ";
 const canAct=!!nearby||watcherNear||ledgerNear||sealNear;
 $("actionBtn").disabled=!canAct;
 $("actionBtn").textContent=actionLabel;
 $("actionBtn").style.opacity=canAct?"1":".48";
 $("interactPrompt").style.display=canAct?"block":"none";
 if(canAct)$("interactPrompt").textContent="НАЖМИ E ИЛИ «"+actionLabel+"»";
 ledgerGlow.intensity=1+Math.sin(performance.now()*.002)*.35;
 if(watcher){watcher.rotation.y=Math.sin(performance.now()*.0007)*.12;watcher.position.y=Math.sin(performance.now()*.0012)*.035;}
 if(firstPerson){camera.position.set(player.position.x,player.position.y+1.58,player.position.z);camera.rotation.order="YXZ";camera.rotation.set(pitch,yaw,0);}
 else{const desired=new THREE.Vector3(player.position.x+Math.sin(yaw)*4.8,player.position.y+3.1,player.position.z+Math.cos(yaw)*4.8);camera.position.lerp(desired,1-Math.exp(-5*dt));const look=new THREE.Vector3(player.position.x,player.position.y+1.15,player.position.z);camera.lookAt(look);}
 for(const item of clueMeshes){item.group.rotation.y=Math.sin(performance.now()*.001+item.clue.pos.x)*.06;item.glow.intensity=1.4+Math.sin(performance.now()*.003)*.5;item.group.visible=activeClues.some(c=>c.id===item.clue.id)&&!collected.has(item.clue.id);}
 renderer.render(scene,camera);
 dust.rotation.y+=dt*.012;
 const loadingScreen=$("loading");
 if(loadingScreen){loadingScreen.style.opacity="0";setTimeout(()=>loadingScreen.remove(),550);}
}
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio||1,isTouchDevice?1.5:2));});
renderPage();for(const item of clueMeshes)item.group.visible=item.clue.id==="mira"||item.clue.id==="ren"||item.clue.id==="kaito";animate();
