/** Accessible settings, journal and local save backups. */
(function(global){
  'use strict';
  const defaults={volume:0.7,tutorial:true,bindings:{}};
  const actions={KeyW:'向上',KeyS:'向下',KeyA:'向左',KeyD:'向右',Space:'互动',KeyF:'采集',KeyJ:'攻击',KeyR:'进食',KeyC:'法术',KeyQ:'切换形态',KeyI:'背包',KeyT:'火把',Tab:'合成',KeyB:'水桶',KeyV:'防火带'};
  let settings={...defaults,bindings:{}},api,previousFocus,waiting=null;
  try { const saved=JSON.parse(localStorage.getItem('kc-keep-settings')||'null'); if(saved){settings.volume=Number.isFinite(saved.volume)?Math.max(0,Math.min(1,saved.volume)):0.7;settings.tutorial=saved.tutorial!==false;if(saved.bindings&&typeof saved.bindings==='object')settings.bindings=saved.bindings;} } catch(e){}
  function persist(){try{localStorage.setItem('kc-keep-settings',JSON.stringify(settings));}catch(e){status('设置无法保存：浏览器存储已满。');}}
  function keyName(code){return code.replace('Key','').replace('Digit','').replace('Space','空格');}
  function mapped(code){return Object.keys(actions).find(action=>(settings.bindings[action]||action)===code)|| (Object.keys(actions).includes(code)?'Unbound':code);}
  function label(action){return keyName(settings.bindings[action]||action);}
  function status(text){document.getElementById('kc-status').textContent=text;}
  function close(){waiting=null;document.getElementById('kc-panel').close();api.close();document.getElementById('game').focus();}
  function open(page){
    if(!api.canOpen())return;
    previousFocus=document.activeElement;api.open();
    document.getElementById('kc-settings').hidden=page!=='settings';
    document.getElementById('kc-journal').hidden=page!=='journal';
    document.getElementById('kc-panel-title').textContent=page==='settings'?'设置与存档':'远征手册 · KC KEEP';
    status('');render();document.getElementById('kc-panel').showModal();
  }
  function render(){
    const data=api.describe();
    const saves=api.saveStatus();
    document.getElementById('kc-save-times').textContent='自动存档：'+saves.auto+' · 手动存档：'+saves.manual;
    document.getElementById('kc-goal').textContent=data.goal;
    document.getElementById('kc-forecast').textContent=data.forecast > 0 ? '距离冬季约 '+Math.ceil(data.forecast)+' 秒。提前准备柴火、冬帽和暖石。' : '冬季进行中：靠近营火保暖，注意暴风雪预警。';
    document.getElementById('kc-upgrade').textContent=data.upgrade;
    document.getElementById('kc-last-death').textContent=data.lastDeath ? '上次陨落：'+data.lastDeath.cause+' · 附近威胁：'+(data.lastDeath.nearby?.join('、')||'无') : '';
    document.getElementById('kc-upgrade-button').disabled=!data.canUpgrade;
    document.getElementById('kc-bucket-button').disabled=!data.canBucket;
    document.getElementById('kc-bucket').textContent=data.bucket;
    document.getElementById('kc-fire-help').textContent=label('KeyB')+'：水桶空时靠岸装水；有水时向鼠标位置泼水。'+label('KeyV')+'：在鼠标位置铺一格防火带（石头 1）。';
    const list=document.getElementById('kc-objectives');list.replaceChildren();
    for(const item of data.objectives){const li=document.createElement('li');li.textContent=(item.done?'✓ ':'○ ')+item.text;list.append(li);}
    const keys=document.getElementById('kc-bindings');keys.replaceChildren();
    for(const [code,name] of Object.entries(actions)){
      const row=document.createElement('label');row.textContent=name;
      const button=document.createElement('button');button.type='button';button.textContent=label(code);button.setAttribute('aria-label',name+'：'+label(code));
      button.onclick=()=>{waiting=code;button.textContent='按新键…';status('请按新按键；Esc 取消。重复按键将交换。');};row.append(button);keys.append(row);
    }
  }
  function init(callbacks){
    api=callbacks;global.DstAudio?.setVolume(settings.volume);
    document.getElementById('kc-open-settings').onclick=()=>open('settings');
    document.getElementById('kc-open-journal').onclick=()=>open('journal');
    document.getElementById('kc-close').onclick=close;
    const dialog=document.getElementById('kc-panel');
    dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
    dialog.addEventListener('keydown',e=>{
      if(!waiting)return;e.preventDefault();e.stopPropagation();
      if(e.code==='Escape'){waiting=null;render();status('已取消改键。');return;}
      if(e.ctrlKey||e.metaKey||e.altKey||!/^(Key[A-Z]|Digit[0-9]|Space|Tab)$/.test(e.code)||['Digit1','Digit2','Digit3','KeyE','KeyK','KeyM','KeyX'].includes(e.code)){status('请选择字母、空格或 Tab；E/K/M/X 和 1/2/3 为保留快捷键。');return;}
      const old=settings.bindings[waiting]||waiting;
      const other=Object.keys(actions).find(k=>k!==waiting&&(settings.bindings[k]||k)===e.code);
      if(other)settings.bindings[other]=old;
      settings.bindings[waiting]=e.code;waiting=null;persist();render();status('按键已保存。');
    });
    const volume=document.getElementById('kc-volume');volume.value=settings.volume;
    volume.oninput=()=>{settings.volume=Number(volume.value);global.DstAudio?.setVolume(settings.volume);persist();};
    const tutorial=document.getElementById('kc-tutorial-toggle');tutorial.checked=settings.tutorial;
    tutorial.onchange=()=>{settings.tutorial=tutorial.checked;persist();};
    document.getElementById('kc-reset-keys').onclick=()=>{settings.bindings={};persist();render();status('已恢复默认按键。');};
    document.getElementById('kc-upgrade-button').onclick=()=>{status(api.upgrade());render();};
    document.getElementById('kc-bucket-button').onclick=()=>{status(api.craftBucket());render();};
    document.getElementById('kc-save-manual').onclick=()=>{status(api.saveManual());render();};
    document.getElementById('kc-load-manual').onclick=()=>{
      if(!document.getElementById('kc-import-confirm').checked){status('请先勾选确认替换当前旅程。');return;}
      status(api.restoreManual());render();
    };
    document.getElementById('kc-save-export').onclick=()=>{
      const text=api.exportSave();render();if(!text){status('没有可导出的存档，或本次保存失败。');return;}
      const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='kc-keep-save-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status('已导出存档。');
    };
    const input=document.getElementById('kc-save-file');
    input.onchange=async()=>{
      const file=input.files[0];if(!file)return;
      if(!document.getElementById('kc-import-confirm').checked){status('请先勾选确认替换当前存档。');input.value='';return;}
      if(file.size>4*1024*1024){status('文件过大（上限 4 MB）。');input.value='';return;}
      try{status(api.importSave(await file.text()));render();}catch(e){status('导入失败：'+e.message);}input.value='';
    };
    document.getElementById('kc-restore-backup').onclick=()=>{if(!document.getElementById('kc-import-confirm').checked){status('请先勾选确认替换当前存档。');return;}status(api.restoreBackup());render();};
  }
  function update(text,playing){
    document.getElementById('kc-toolbar').hidden=!api||!api.canOpen();
    const hint=document.getElementById('kc-tutorial');hint.hidden=!playing||!settings.tutorial||!text;
    if(hint.textContent!==text)hint.textContent=text;
  }
  global.KCUI={init,update,mapped,label,get isOpen(){return !!document.getElementById('kc-panel')?.open;}};
})(window);
