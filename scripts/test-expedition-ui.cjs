const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const elements=new Map(),saved=new Map();let focused=null,volume=null,paused=false;
function element(){return {textContent:'',hidden:false,open:false,value:'',checked:false,children:[],handlers:{},setAttribute(){},append(node){this.children.push(node);},replaceChildren(){this.children=[];},addEventListener(name,fn){this.handlers[name]=fn;},showModal(){this.open=true;},close(){this.open=false;},focus(){focused=this;}};}
function get(id){if(!elements.has(id))elements.set(id,element());return elements.get(id);}
const c={console,document:{getElementById:get,createElement:element,activeElement:null},localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)},DstAudio:{setVolume:v=>volume=v},setTimeout:()=>{}};c.window=c;
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../game/js/expedition-ui.js'),'utf8'),c);
c.KCUI.init({canOpen:()=>true,open:()=>paused=true,close:()=>paused=false,describe:()=>({goal:'Goal',upgrade:'Upgrade',canUpgrade:false,canBucket:false,bucket:'Bucket',objectives:[]})});
get('kc-open-settings').onclick();assert(paused);assert(get('kc-panel').open);
function bind(i,code){get('kc-bindings').children[i].children[0].onclick();get('kc-panel').handlers.keydown({code,preventDefault(){},stopPropagation(){}});}
bind(5,'KeyG');assert.equal(c.KCUI.mapped('KeyG'),'KeyF');assert.equal(c.KCUI.mapped('KeyF'),'Unbound');
bind(6,'KeyG');assert.equal(c.KCUI.mapped('KeyG'),'KeyJ');assert.equal(c.KCUI.mapped('KeyJ'),'KeyF');
bind(6,'KeyX');assert.equal(c.KCUI.label('KeyJ'),'G');get('kc-panel').handlers.keydown({code:'Escape',preventDefault(){},stopPropagation(){}});assert(get('kc-panel').open);
get('kc-reset-keys').onclick();assert.equal(c.KCUI.mapped('KeyF'),'KeyF');assert.equal(c.KCUI.mapped('KeyJ'),'KeyJ');
get('kc-volume').value='0';get('kc-volume').oninput();assert.equal(volume,0);
get('kc-close').onclick();assert(!paused);assert.equal(focused,get('game'));
console.log('PASS settings: remap, swap, reserved keys, reset, mute, pause and focus');
