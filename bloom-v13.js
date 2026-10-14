/* Bloom V1.3 - accueil Lora + Poppins. Le journal reste géré par index.html. */
(function(){
'use strict';
const floral='<svg class="v13-sprig" viewBox="0 0 120 140" aria-hidden="true"><path d="M14 137C43 97 66 59 77 11" fill="none" stroke="#96a889" stroke-width="2.7"/><g fill="#9aac8b"><ellipse cx="35" cy="99" rx="11" ry="21" transform="rotate(-47 35 99)"/><ellipse cx="68" cy="71" rx="10" ry="21" transform="rotate(39 68 71)"/><ellipse cx="54" cy="44" rx="10" ry="19" transform="rotate(-35 54 44)"/></g><g fill="#efb1a5"><circle cx="77" cy="15" r="9"/><circle cx="64" cy="15" r="9"/><circle cx="71" cy="5" r="9"/><circle cx="86" cy="5" r="9"/><circle cx="91" cy="18" r="9"/></g><circle cx="78" cy="13" r="5" fill="#e0bd8c"/></svg>';
function bloomHome(){
 const p=db.profile,t=targets(p),n=total(dailyEntries());
 const pct=Math.max(0,Math.min(100,Math.round(n.cal/Math.max(1,t.cal)*100)));
 const steps=Math.max(0,num(db.steps[chosenDate]));
 const water=Math.max(0,num((db.settings||{}).waterByDate?.[chosenDate]));
 const title=p.firstName?'Bonjour '+esc(p.firstName):'Bonjour';
 const macros=[['protein','Protéines','#ecb0a5'],['carbs','Glucides','#b6a2d2'],['fat','Lipides','#a3b59c']].map(function(item){
  const k=item[0],prc=Math.max(0,Math.min(100,100*num(n[k])/Math.max(1,num(t[k]))));
  return '<div class="v13-macro"><span>'+item[1]+'</span><div class="v13-bar" style="--fill:'+item[2]+'"><i style="width:'+prc+'%"></i></div><b>'+Math.round(n[k])+' g</b><small>/ '+Math.round(t[k])+' g</small></div>';
 }).join('');
 const dishes=['🥣','🥗','🍲','🍓'];
 const meals=TYPES.map(function(m,i){
  const rows=dailyEntries().filter(function(e){return e.type===m.id});
  const sum=Math.round(total(rows).cal);
  const desc=rows.length?(rows[0].name+(rows.length>1?' + '+(rows.length-1)+' autre'+(rows.length>2?'s':''):'') ):'À compléter à ton rythme';
  return '<button class="v13-meal" type="button" data-action="add-to-meal" data-type="'+m.id+'"><span class="v13-food-illustration">'+dishes[i]+'</span><span class="v13-meal-name">'+esc(m.name)+'</span><span class="v13-meal-desc">'+esc(desc)+'</span><strong class="v13-meal-kcal">'+(rows.length?sum+' kcal':'+ Ajouter un aliment')+'</strong></button>';
 }).join('');
 const rest=Math.round(Math.abs(t.cal-n.cal)).toLocaleString('fr-FR');
 const restText=n.cal<=t.cal?rest+' kcal jusqu’à ton repère':rest+' kcal au-delà du repère';
 return page(
 '<div class="v13-home">'+
 '<header class="v13-intro">'+floral+
 '<div class="v13-topline"><div><div class="v13-logo">Bloom<span>✿</span></div><div class="v13-signature">BIEN MANGER<br>POUR FLEURIR</div></div><button class="v13-gear" data-action="settings" type="button" aria-label="Paramètres">⚙</button></div>'+
 '<div class="v13-greeting"><h1>'+title+' <em>✿</em></h1><p>Une nouvelle journée pour<br>prendre soin de toi <span>♥</span></p></div>'+
 '<div class="v13-bloomie">'+catSVG('v13-cat')+'</div>'+
 '</header><div class="v13-day">'+dayNav()+'</div>'+
 '<section class="v13-energy"><div class="v13-energy-head"><h2>Calories</h2><button data-go="progress" type="button">Détails ›</button></div>'+
 '<div class="v13-energy-body"><div class="v13-ring"><svg viewBox="0 0 160 160" aria-hidden="true"><circle cx="80" cy="80" r="58" class="v13-track"/><circle cx="80" cy="80" r="58" class="v13-progress" stroke-dasharray="'+pct+' 100" pathLength="100"/></svg><div class="v13-center"><span>🌱</span><strong>'+Math.round(n.cal).toLocaleString('fr-FR')+'</strong><small>sur '+Math.round(t.cal).toLocaleString('fr-FR')+' kcal</small></div></div>'+
 '<div class="v13-energy-meta"><p>'+restText+'<br><small>Chaque journée est différente ♡</small></p><div class="v13-macros">'+macros+'</div></div></div></section>'+
 '<div class="v13-metrics"><button class="v13-metric" type="button" data-action="steps"><span class="v13-metric-label"><i>👟</i> Mes pas</span><strong>'+Math.round(steps).toLocaleString('fr-FR')+' <small>/ 10 000</small></strong><span class="v13-hint">Toucher pour modifier</span><span class="v13-meter"><i style="width:'+Math.min(100,steps/100)+'%"></i></span></button>'+
 '<button class="v13-metric v13-water" type="button" data-bloom-water="250"><span class="v13-metric-label"><i>💧</i> Mon eau <span class="v13-plus">+</span></span><strong>'+(water/1000).toLocaleString('fr-FR',{maximumFractionDigits:2})+' L <small>/ 2 L</small></strong><span class="v13-hint">+ 250 mL en touchant</span><span class="v13-meter"><i style="width:'+Math.min(100,water/20)+'%"></i></span></button></div>'+
 '<section class="v13-meals-section"><div class="v13-meals-head"><h2>Mes repas du jour</h2><button data-go="add" type="button">＋ Ajouter</button></div><div class="v13-meals">'+meals+'</div></section>'+
 '<div class="v13-note">'+floral+'<p>Prendre soin de soi,<br>c’est aussi faire fleurir demain. <span>♥</span></p>'+catSVG('v13-note-cat')+'</div>'+
 '<p class="v13-footer">Un pas après l’autre, avec Bloomie 🐈‍⬛</p></div>'
 );
}
window.home=bloomHome;
document.addEventListener('click',function(e){
 const btn=e.target.closest('[data-bloom-water]');
 if(!btn)return;
 e.preventDefault();e.stopImmediatePropagation();
 db.settings=db.settings||{};
 const w=db.settings.waterByDate&&typeof db.settings.waterByDate==='object'?db.settings.waterByDate:{};
 w[chosenDate]=Math.min(10000,num(w[chosenDate])+250);
 db.settings.waterByDate=w;save();render();toast('250 mL ajoutés 💧');
},true);
render();
})();
