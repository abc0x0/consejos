(() => {
  'use strict';
  const stages = window.CONSEJOS_DATA;
  if (!Array.isArray(stages) || !stages.length) return;
  const $ = (id) => document.getElementById(id);
  const ns = 'http://www.w3.org/2000/svg';
  const x0 = 99, x1 = 947, top = 39, bottom = 249;
  const xAt = (i) => x0 + (x1 - x0) * i / (stages.length - 1);
  const yAt = (v) => bottom - ((v - 1) / 4) * (bottom - top);
  const memory = {
    get(key, fallback = '') { try { return localStorage.getItem(key) ?? fallback; } catch (_) { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, value); return true; } catch (_) { return false; } },
    remove(key) { try { localStorage.removeItem(key); } catch (_) {} }
  };

  // Las preferencias permanecen en este navegador y no se transmiten por red.
  const PROFILE_KEY = 'consejos-profile-v02';
  const STAGE_KEY = 'consejos-stage-v02';
  const PANEL_KEY = 'consejos-panel-v02';
  const panelIDs = ['bible-card','egw-card','reflection-card','alerts-card'];
  const tabs = Array.from(document.querySelectorAll('.topic-tab'));
  const profile = (() => {
    try {
      const saved = JSON.parse(memory.get(PROFILE_KEY, '{}'));
      return { first: clean(saved.first, 40), last: clean(saved.last, 65) };
    } catch (_) { return {first:'', last:''}; }
  })();
  let selected = Number(memory.get(STAGE_KEY, memory.get('consejos-stage-v01', '5')));
  if (!Number.isInteger(selected) || selected < 0 || selected >= stages.length) selected = 5;
  let activePanel = memory.get(PANEL_KEY,'bible-card');
  if (!panelIDs.includes(activePanel)) activePanel = 'bible-card';
  const questionOffsets = stages.map(() => 0);
  const graph = $('relationship-chart');
  const input = $('stage-range');

  function clean(s, limit) {
    return typeof s === 'string' ? s.replace(/[<>]/g,'').replace(/\s+/g,' ').trim().slice(0, limit) : '';
  }
  function titleFor(first) { return first ? `Consejos para ${first}` : 'Consejos para hija'; }
  function paintName() {
    const title = titleFor(profile.first);
    $('app-title').textContent = title;
    document.title = title + ' · v0.2';
    $('name-preview').textContent = title;
  }
  function syncProfileFields() {
    $('user-first').value = profile.first;
    $('user-last').value = profile.last;
    $('settings-feedback').textContent = '';
    previewName();
  }
  function previewName() {
    $('name-preview').textContent = titleFor(clean($('user-first').value,40));
  }
  function svgEl(tag,attrs={},content) {
    const e=document.createElementNS(ns,tag);
    Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,String(v)));
    if(content!==undefined)e.textContent=content;
    return e;
  }
  function append(parent,tag,attrs,content) {
    const e=svgEl(tag,attrs,content);
    parent.appendChild(e);
    return e;
  }
  function chart() {
    graph.replaceChildren();
    const defs=append(graph,'defs',{});
    const gradient=append(defs,'linearGradient',{id:'chart-fill',x1:'0',x2:'0',y1:'0',y2:'1'});
    append(gradient,'stop',{offset:'0%','stop-color':'#d65b88','stop-opacity':'.25'});
    append(gradient,'stop',{offset:'100%','stop-color':'#d65b88','stop-opacity':'.035'});
    for(let score=1;score<=5;score++){
      const y=yAt(score);
      append(graph,'line',{x1:x0,x2:x1,y1:y,y2:y,class:'chart-grid'});
      append(graph,'text',{x:x0-22,y:y+5,class:'axis-number','text-anchor':'end'},score);
    }
    append(graph,'line',{x1:x0,x2:x0,y1:top,y2:bottom,class:'chart-axis'});
    append(graph,'line',{x1:x0,x2:x1,y1:bottom,y2:bottom,class:'chart-axis'});
    append(graph,'text',{x:x0-44,y:top+5,class:'axis-edge','text-anchor':'end'},'Mucho');
    append(graph,'text',{x:x0-44,y:bottom+5,class:'axis-edge','text-anchor':'end'},'Poco');
    const points=stages.map((s,i)=>[xAt(i),yAt(s.value)]);
    const poly=points.map(p=>p.map(v=>v.toFixed(2)).join(',')).join(' ');
    append(graph,'polygon',{points:`${x0},${bottom} ${poly} ${x1},${bottom}`,fill:'url(#chart-fill)'});
    append(graph,'polyline',{points:poly,class:'chart-curve'});
    stages.forEach((stage,i)=>{
      const x=xAt(i),y=yAt(stage.value);
      append(graph,'line',{x1:x,x2:x,y1:top,y2:bottom,class:'chart-vgrid'});
      if(selected===i)append(graph,'line',{x1:x,x2:x,y1:y,y2:bottom,class:'selected-stem'});
      const node=append(graph,'g',{class:`chart-point ${selected===i?'is-selected':''}`,role:'button',tabindex:'0','aria-label':`${stage.name}: orientación ${stage.value} de 5. Seleccionar etapa.`});
      append(node,'title',{},`Seleccionar ${stage.name} (${stage.value}/5)`);
      append(node,'circle',{cx:x,cy:y,r:24,class:'point-hit'});
      if(selected===i)append(node,'circle',{cx:x,cy:y,r:17,class:'point-halo'});
      append(node,'circle',{cx:x,cy:y,r:selected===i?8.7:6,class:'point-dot'});
      node.addEventListener('click',()=>choose(i));
      node.addEventListener('keydown',(ev)=>{
        if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();choose(i);}
        else if(ev.key==='ArrowRight'){ev.preventDefault();choose(Math.min(stages.length-1,i+1));}
        else if(ev.key==='ArrowLeft'){ev.preventDefault();choose(Math.max(0,i-1));}
      });
      const axisLabel=append(graph,'text',{x,y:bottom+28,class:'axis-label','text-anchor':'middle'});
      const lines=stage.name==='Interés romántico'?['Interés','romántico']:
        stage.name==='Mejores amigos'?['Mejores','amigos']:[stage.name];
      lines.forEach((line,k)=>append(axisLabel,'tspan',{x,dy:k===0?0:15},line));
    });
    // v0.2: ancho REAL del texto + márgenes, sin truncar ninguna etiqueta.
    const sx=xAt(selected),sy=yAt(stages[selected].value);
    const tip=append(graph,'g',{class:'chart-tooltip','aria-hidden':'true'});
    const legend=`${stages[selected].name} · ${stages[selected].value}/5`;
    const label=append(tip,'text',{y:0,'text-anchor':'middle'},legend);
    const measured=typeof label.getComputedTextLength==='function'?label.getComputedTextLength():0;
    const width=Math.max(132,Math.ceil((measured>0?measured:legend.length*9.2)+36));
    const height=40;
    const tx=Math.max(7,Math.min(1020-width-7,sx-width/2));
    const ty=Math.max(3,sy-53);
    tip.insertBefore(svgEl('rect',{x:tx,y:ty,width,height,rx:11}),label);
    label.setAttribute('x',String(tx+width/2));
    label.setAttribute('y',String(ty+26));
    append(graph,'text',{x:(x0+x1)/2,y:342,'text-anchor':'middle',class:'axis-title'},'Etapa de la relación');
  }
  function makeStageButtons() {
    const el=$('stage-buttons');
    stages.forEach((s,i)=>{
      const b=document.createElement('button');
      b.type='button';b.className='stage-option';
      b.innerHTML='<span class="stage-circle" aria-hidden="true"></span><span class="stage-label"></span>';
      b.querySelector('.stage-label').textContent=s.short;
      b.addEventListener('click',()=>choose(i));
      el.appendChild(b);
    });
  }
  function questionList() {
    const bank=stages[selected].questions;
    const offset=questionOffsets[selected]%bank.length;
    const list=$('question-list');
    list.replaceChildren();
    for(let k=0;k<Math.min(4,bank.length);k++){
      const li=document.createElement('li');
      li.textContent=bank[(offset+k)%bank.length];
      list.appendChild(li);
    }
    $('question-count').textContent=`Mostrando ${Math.min(4,bank.length)} preguntas de un banco de ${bank.length}.`;
    $('new-questions').hidden=bank.length<=4;
  }
  function labelFor(score) {
    if(score<=2)return 'Orientación básica';
    if(score<=3)return 'Orientación moderada';
    if(score<=4)return 'Orientación alta';
    return 'Orientación muy alta';
  }
  function choose(i) {
    selected=i;
    memory.set(STAGE_KEY,String(i));
    const s=stages[i];
    input.value=String(i);
    input.style.setProperty('--track-progress',`${100*i/(stages.length-1)}%`);
    $('level-output').textContent=`${s.value}/5`;
    $('stage-title').textContent=s.name;
    $('stage-summary').textContent=s.summary;
    $('score-badge').textContent=`${s.value}/5 · ${labelFor(s.value)}`;
    $('bible-heading').textContent=s.bible.ref;
    $('bible-text').textContent=s.bible.text;
    $('bible-type').textContent=s.bible.kind;
    $('bible-link').href=s.bible.link;
    $('egw-heading').textContent=s.egw.title;
    $('egw-text').textContent=s.egw.text;
    $('egw-citation').textContent=s.egw.citation;
    $('egw-link').href=s.egw.link;
    const alerts=$('alert-list');
    alerts.replaceChildren();
    s.alerts.forEach(item=>{const li=document.createElement('li');li.textContent=item;alerts.appendChild(li);});
    Array.from($('stage-buttons').children).forEach((b,j)=>{
      b.classList.toggle('chosen',j===i);
      b.setAttribute('aria-pressed',j===i?'true':'false');
      b.setAttribute('aria-label',`${stages[j].name}${j===i?' (seleccionada)':''}`);
    });
    questionList();
    chart();
    if(window.matchMedia('(max-width: 520px)').matches){
      const viewport=document.querySelector('.stage-buttons-viewport');
      const option=document.querySelectorAll('.stage-option')[i];
      viewport.scrollLeft=Math.max(0,option.offsetLeft-viewport.offsetLeft-viewport.clientWidth/2+option.clientWidth/2);
    }
    if(window.matchMedia('(max-width: 760px)').matches){
      requestAnimationFrame(()=>{
        const shell=document.querySelector('.graph-shell');
        const fullWidth=graph.getBoundingClientRect().width;
        shell.scrollLeft=Math.max(0,xAt(i)*fullWidth/1020-shell.clientWidth/2);
      });
    }
  }
  function setPanel(id,{focusTab=false}={}) {
    if(!panelIDs.includes(id))return;
    activePanel=id;
    memory.set(PANEL_KEY,id);
    panelIDs.forEach(panelId=>{$(panelId).hidden=panelId!==id;});
    tabs.forEach(tab=>{
      const isActive=tab.dataset.panel===id;
      tab.classList.toggle('active',isActive);
      tab.setAttribute('aria-selected',String(isActive));
      tab.tabIndex=isActive?0:-1;
      if(isActive&&focusTab)tab.focus();
    });
  }
  tabs.forEach((tab,i)=>{
    tab.addEventListener('click',()=>setPanel(tab.dataset.panel));
    tab.addEventListener('keydown',(ev)=>{
      let next=null;
      if(ev.key==='ArrowRight'||ev.key==='ArrowDown')next=(i+1)%tabs.length;
      else if(ev.key==='ArrowLeft'||ev.key==='ArrowUp')next=(i+tabs.length-1)%tabs.length;
      else if(ev.key==='Home')next=0;
      else if(ev.key==='End')next=tabs.length-1;
      if(next!==null){ev.preventDefault();setPanel(tabs[next].dataset.panel,{focusTab:true});}
    });
  });

  const menu=$('app-menu'), menuBtn=$('menu-btn');
  function toggleMenu(open) {
    menu.hidden=!open;
    menuBtn.setAttribute('aria-expanded',String(open));
    menuBtn.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');
  }
  menuBtn.addEventListener('click',()=>toggleMenu(menu.hidden));
  document.addEventListener('pointerdown',(ev)=>{
    if(!menu.hidden&&!$('menu-root').contains(ev.target))toggleMenu(false);
  });
  document.addEventListener('keydown',(ev)=>{
    if(ev.key==='Escape'&&!menu.hidden){toggleMenu(false);menuBtn.focus();}
  });
  const settings=$('settings-dialog');
  $('settings-btn').addEventListener('click',()=>{toggleMenu(false);syncProfileFields();settings.showModal();$('user-first').focus();});
  $('settings-close').addEventListener('click',()=>settings.close());
  $('user-first').addEventListener('input',previewName);
  $('settings-form').addEventListener('submit',(ev)=>{
    ev.preventDefault();
    profile.first=clean($('user-first').value,40);
    profile.last=clean($('user-last').value,65);
    const ok=memory.set(PROFILE_KEY,JSON.stringify(profile));
    paintName();
    $('settings-feedback').textContent=ok?'Cambios guardados en este dispositivo.':'Nombre aplicado, pero el navegador impidió guardarlo.';
    if(ok)settings.close();
  });
  $('reset-profile').addEventListener('click',()=>{
    profile.first='';profile.last='';
    memory.remove(PROFILE_KEY);
    syncProfileFields();paintName();
    $('settings-feedback').textContent='Datos personales borrados de este dispositivo.';
  });

  const info=$('info-dialog'), install=$('install-dialog');
  $('about-btn').addEventListener('click',()=>{toggleMenu(false);info.showModal();});
  [info,install,settings].forEach(dialog=>dialog.addEventListener('click',ev=>{if(ev.target===dialog)dialog.close();}));
  let deferredInstall=null;
  window.addEventListener('beforeinstallprompt',(ev)=>{ev.preventDefault();deferredInstall=ev;$('install-btn').classList.add('install-ready');});
  $('install-btn').addEventListener('click',async()=>{
    if(deferredInstall){
      const prompt=deferredInstall;
      deferredInstall=null;
      prompt.prompt();
      try{await prompt.userChoice;}catch(_){}
      $('install-btn').classList.remove('install-ready');
    }else install.showModal();
  });
  window.addEventListener('appinstalled',()=>{$('install-btn').querySelector('span').textContent='Instalada';deferredInstall=null;});
  makeStageButtons();
  input.addEventListener('input',()=>choose(Number(input.value)));
  $('new-questions').addEventListener('click',()=>{
    questionOffsets[selected]=(questionOffsets[selected]+4)%stages[selected].questions.length;
    questionList();
  });
  paintName();
  setPanel(activePanel);
  choose(selected);
  if('serviceWorker' in navigator && (location.protocol==='https:'||['localhost','127.0.0.1'].includes(location.hostname))){
    window.addEventListener('load',()=>{
      navigator.serviceWorker.register('./sw.js',{scope:'./'})
        .then(()=>{$('offline-state').textContent='Lista para usarse sin conexión';})
        .catch(()=>{$('offline-state').textContent='Modo web · sin caché local';});
    });
  }else if(location.protocol==='file:'){$('offline-state').textContent='Modo local · instala desde HTTPS';}
})();
