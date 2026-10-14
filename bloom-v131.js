/* Bloom 1.3.1 — direction éditoriale. Journal et données gérés par index.html. */
(function(){
'use strict';
function icon(name,size){
 const paths={
  settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.8 1.8 0 0 0 .36 2l.07.08-1.8 1.8-.08-.07a1.8 1.8 0 0 0-2-.36 1.8 1.8 0 0 0-1.1 1.66V21h-2.5v-.12a1.8 1.8 0 0 0-1.1-1.66 1.8 1.8 0 0 0-2 .36l-.08.07-1.8-1.8.07-.08a1.8 1.8 0 0 0 .36-2 1.8 1.8 0 0 0-1.66-1.1H6v-2.5h.12a1.8 1.8 0 0 0 1.66-1.1 1.8 1.8 0 0 0-.36-2l-.07-.08 1.8-1.8.08.07a1.8 1.8 0 0 0 2 .36 1.8 1.8 0 0 0 1.1-1.66V6h2.5v.12a1.8 1.8 0 0 0 1.1 1.66 1.8 1.8 0 0 0 2-.36l.08-.07 1.8 1.8-.07.08a1.8 1.8 0 0 0-.36 2 1.8 1.8 0 0 0 1.66 1.1H21v2.5h-.12a1.8 1.8 0 0 0-1.48 1.17Z"/>',
  walk:'<path d="m11 5 2.4 2.5L16 8m-5-3 2.2-1m-1.3 4.5-1.7 4 3.4 2.1m-3.4-2.1L7 15l-2 5m8.6-5.5L18 20m-3.5-8.3L18 13"/><circle cx="11" cy="3" r="1.4"/>',
  droplet:'<path d="M12 2.5S5 10.4 5 15a7 7 0 0 0 14 0c0-4.6-7-12.5-7-12.5Z"/>',
  coffee:'<path d="M5 9h13v5a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6V9Zm13 1h1.5a2.5 2.5 0 0 1 0 5H18M4 21h16M9 3v3m4-3v3"/>',
  lunch:'<path d="M3 11a9 9 0 0 0 18 0H3ZM5 16h14M12 3v5m-4-3v3m8-3v3"/>',
  moon:'<path d="M20.4 15.7A8.7 8.7 0 0 1 8.3 3.6 8.7 8.7 0 1 0 20.4 15.7Z"/>',
  apple:'<path d="M12 7c-3-3-8-.3-8 5.2 0 5 3.3 8.8 6.3 8 1.1-.3 2.3-.3 3.4 0 3 .8 6.3-3 6.3-8C20 6.7 15 4 12 7Zm0-.3c0-2.6 2-4.4 4.6-4.7"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  arrow:'<path d="m9 18 6-6-6-6"/>',
  leaf:'<path d="M20 4c-8.9.1-14.6 3.1-15 9.4-.3 3.9 2.4 6.6 6.2 6.6C17.9 20 20 12.5 20 4ZM4 20c3-5.3 7.1-8.9 12.2-11.5"/>'
 };
 const p=paths[name]||paths.leaf;
 return '<svg width="'+(size||22)+'" height="'+(size||22)+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';
}
function homeEditorial(){
 const p=db.profile,t=targets(p),n=total(dailyEntries());
 const pct=Math.max(0,Math.min(100,100*n.cal/Math.max(1,t.cal)));
 const steps=Math.max(0,num(db.steps?.[chosenDate]));
 const water=Math.max(0,num(db.settings?.waterByDate?.[chosenDate]));
 const firstName=String(p?.firstName||'').trim();
 const rest=Math.round(Math.abs(t.cal-n.cal)).toLocaleString('fr-FR');
 const remaining=n.cal<=t.cal?rest+' kcal disponibles':rest+' kcal au-delà du repère';
 const macros=[
  ['protein','Protéines','v131-protein'],
  ['carbs','Glucides','v131-carbs'],
  ['fat','Lipides','v131-fat']
 ].map(function(item){
  const k=item[0],v=num(n[k]),goal=Math.max(1,num(t[k])),pc=Math.min(100,Math.max(0,100*v/goal));
  return '<div class="v131-macro '+item[2]+'"><div class="v131-macro-line"><span>'+item[1]+'</span><strong>'+Math.round(v)+' <small>/ '+Math.round(t[k])+' g</small></strong></div><div class="v131-meter"><i style="width:'+pc+'%"></i></div></div>';
 }).join('');
 const foodIcons=['coffee','lunch','moon','apple'];
 const meals=TYPES.map(function(m,i){
  const rows=dailyEntries().filter(function(e){return e.type===m.id});
  const sum=Math.round(total(rows).cal);
  const label=rows.length?(rows[0].name+(rows.length>1?' et '+(rows.length-1)+' autre'+(rows.length>2?'s':'') : '')):'Aucun aliment';
  return '<button class="v131-meal" type="button" data-action="add-to-meal" data-type="'+esc(m.id)+'" aria-label="Ajouter au repas '+esc(m.name)+'">'+
  '<span class="v131-meal-head"><span class="v131-meal-icon v131-meal-icon-'+i+'">'+icon(foodIcons[i],23)+'</span><span class="v131-meal-name">'+esc(m.name)+'</span></span>'+
  '<span class="v131-meal-description">'+esc(label)+'</span>'+
  '<span class="v131-meal-footer"><span>'+(rows.length?sum+' kcal':'Ajouter')+'</span>'+icon('arrow',16)+'</span></button>';
 }).join('');
 return page(
 '<div class="v131-home">'+
 '<header class="v131-intro">'+
 '<div class="v131-topline"><div><div class="v131-logo">Bloom<span>·</span></div><p class="v131-signature">JOURNAL ALIMENTAIRE</p></div><button class="v131-settings" type="button" data-action="settings" aria-label="Ouvrir les réglages">'+icon('settings',22)+'</button></div>'+
 '<div class="v131-greeting"><h1>Bonjour'+(firstName?' '+esc(firstName):'')+'.</h1><p>Aujourd’hui, à ton rythme.</p></div>'+
 '<div class="v131-bloomie">'+catSVG('v131-cat')+'</div>'+
 '</header>'+
 '<div class="v131-day">'+dayNav()+'</div>'+
 '<section class="v131-energy" aria-label="Bilan de la journée">'+
 '<div class="v131-section-head"><h2>Ta journée</h2><button data-go="progress" type="button" class="v131-text-action">Voir le détail '+icon('arrow',15)+'</button></div>'+
 '<div class="v131-energy-grid"><div class="v131-ring" role="progressbar" aria-label="Calories consommées" aria-valuemin="0" aria-valuemax="'+Math.round(t.cal)+'" aria-valuenow="'+Math.max(0,Math.min(Math.round(t.cal),Math.round(n.cal)))+'">'+
 '<svg viewBox="0 0 156 156" aria-hidden="true"><circle class="v131-ring-bg" cx="78" cy="78" r="57"/><circle class="v131-ring-fg" cx="78" cy="78" r="57" pathLength="100" stroke-dasharray="'+pct+' 100"/></svg>'+
 '<div class="v131-ring-center"><strong>'+Math.round(n.cal).toLocaleString('fr-FR')+'</strong><span>kcal consommées</span></div></div>'+
 '<div class="v131-energy-right"><p class="v131-remaining">'+remaining+'</p><p class="v131-daily-goal">Repère : '+Math.round(t.cal).toLocaleString('fr-FR')+' kcal</p><div class="v131-macros">'+macros+'</div></div></div>'+
 '</section>'+
 '<div class="v131-metrics">'+
 '<button class="v131-metric" type="button" data-action="steps" aria-label="Modifier mes pas"><span class="v131-metric-top"><span class="v131-metric-icon">'+icon('walk',21)+'</span><span>Pas</span><span class="v131-metric-action">'+icon('arrow',16)+'</span></span><strong>'+Math.round(steps).toLocaleString('fr-FR')+'</strong><small>Objectif : 10 000</small><span class="v131-meter v131-steps-meter"><i style="width:'+Math.min(100,steps/100)+'%"></i></span></button>'+
 '<button class="v131-metric v131-water" type="button" data-bloom-water="250" aria-label="Ajouter 250 millilitres d’eau"><span class="v131-metric-top"><span class="v131-metric-icon">'+icon('droplet',21)+'</span><span>Eau</span><span class="v131-metric-action">'+icon('plus',16)+'</span></span><strong>'+(water/1000).toLocaleString('fr-FR',{maximumFractionDigits:2})+' L</strong><small>Objectif : 2 L · +250 mL</small><span class="v131-meter v131-water-meter"><i style="width:'+Math.min(100,water/20)+'%"></i></span></button>'+
 '</div>'+
 '<section class="v131-meals-section"><div class="v131-section-head v131-meals-title"><h2>Repas</h2><button data-go="journal" class="v131-text-action" type="button">Journal '+icon('arrow',15)+'</button></div>'+
 '<div class="v131-meals">'+meals+'</div></section>'+
 '<footer class="v131-bottom-note"><span class="v131-footer-leaf">'+icon('leaf',17)+'</span><span>Une journée à la fois.</span></footer>'+
 '</div>'
 );
}
window.home=homeEditorial;
document.addEventListener('click',function(event){
 const water=event.target.closest('[data-bloom-water]');
 if(!water)return;
 event.preventDefault();event.stopImmediatePropagation();
 db.settings=db.settings||{};
 const dates=db.settings.waterByDate&&typeof db.settings.waterByDate==='object'?db.settings.waterByDate:{};
 dates[chosenDate]=Math.min(10000,Math.max(0,num(dates[chosenDate]))+250);
 db.settings.waterByDate=dates;save();render();
 toast('250 mL d’eau ajoutés');
},true);
render();
})();
