(function(){
'use strict';
var WA='51920783202';
var wa=function(t){return 'https://wa.me/'+WA+'?text='+encodeURIComponent(t)};
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var canHover=matchMedia('(hover:hover)').matches;

var CATS={polos:'Polos',hv:'Alta visibilidad',pant:'Pantalones'};
var P=[
 {id:'polo',cat:'polos',name:'Polo piqué gris jaspeado',spec:'Piqué · cuello y puños tejidos',colors:['#A9ADB3'],desc:'Polo de cuello camisero en tela piqué, ideal para personal administrativo, supervisores y atención al cliente. Admite logo bordado en el pecho.',tela:'Piqué',acab:'Bordado de logo en pecho'},
 {id:'polo-verde',cat:'polos',name:'Polo piqué verde botella',spec:'Piqué · cuello y puños tejidos',colors:['#1F6B3A'],desc:'Polo piqué en tono verde botella, muy usado en agroindustria, jardinería y mantenimiento. Fresco y fácil de lavar.',tela:'Piqué',acab:'Bordado o estampado de logo'},
 {id:'polo-azul',cat:'polos',name:'Polo cuello redondo azul francia',spec:'Jersey de algodón · manga corta',colors:['#1E3FA8'],desc:'Polo clásico de cuello redondo para uso diario en planta y almacén. Se personaliza con el logo de tu empresa en pecho y espalda.',tela:'Jersey de algodón',acab:'Estampado o bordado'},
 {id:'polera-ml',cat:'hv',name:'Polera manga larga alta visibilidad naranja',spec:'Dry-fit · cinta reflectiva en torso y mangas',colors:['#FF7A1A'],desc:'Polera de manga larga en naranja de alta visibilidad con cintas reflectivas en torso y brazos. Protege del sol y mantiene al trabajador visible.',tela:'Dry-fit',acab:'Cinta reflectiva segmentada'},
 {id:'polera-ml-amarilla',cat:'hv',name:'Polera manga larga alta visibilidad amarilla',spec:'Dry-fit · cinta reflectiva en torso y mangas',colors:['#E6F01E'],desc:'La misma polera de alta visibilidad en amarillo limón, ideal para trabajos viales y zonas de tránsito vehicular.',tela:'Dry-fit',acab:'Cinta reflectiva segmentada'},
 {id:'chaleco',cat:'hv',name:'Chaleco reflectivo multibolsillos naranja',spec:'Drill · cierre frontal · bolsillos de fuelle',colors:['#FF7A1A'],desc:'Chaleco de seguridad con cierre, bolsillos de fuelle y doble cinta reflectiva. Para supervisores, topógrafos y personal de obra.',tela:'Drill',acab:'Doble cinta reflectiva, cierre frontal'},
 {id:'chaleco-amarillo',cat:'hv',name:'Chaleco reflectivo multibolsillos amarillo',spec:'Drill · cierre frontal · bolsillos de fuelle',colors:['#E6F01E'],desc:'Versión en amarillo limón del chaleco multibolsillos, con doble cinta reflectiva horizontal y tirantes reflectivos.',tela:'Drill',acab:'Doble cinta reflectiva, cierre frontal'},
 {id:'pantalon-navy',cat:'pant',name:'Pantalón cargo drill azul marino',spec:'Drill · bolsillos cargo · cinta reflectiva',colors:['#1B2A4E'],desc:'Pantalón de trabajo en drill con bolsillos cargo laterales y cinta reflectiva a la altura de la rodilla. Resistente para la jornada completa.',tela:'Drill',acab:'Cinta reflectiva en piernas'},
 {id:'pantalon-azul',cat:'pant',name:'Pantalón cargo drill azul francia',spec:'Drill · bolsillos cargo · cinta reflectiva',colors:['#2446B0'],desc:'Pantalón cargo en azul francia con pasadores reforzados y cinta reflectiva. Combina con polos y chalecos de la línea.',tela:'Drill',acab:'Cinta reflectiva en piernas'},
 {id:'pantalon-caqui',cat:'pant',name:'Pantalón cargo drill caqui',spec:'Drill · bolsillos cargo · cinta reflectiva',colors:['#C9AE82'],desc:'Pantalón cargo en tono caqui, muy usado en minería, agroindustria y trabajo de campo. Cinta reflectiva en piernas.',tela:'Drill',acab:'Cinta reflectiva en piernas'}
];
P.forEach(function(p,i){p.code='EU-'+(i<9?'0':'')+(i+1);p.img='assets/img/'+p.id+'.webp'});
var quote=function(p){return wa('Hola EUTEX, quiero cotizar: '+p.name+' ('+p.code+')')};

function card(p,i,linkOut){
  var el=document.createElement('article');el.className='card';el.dataset.cat=p.cat;
  var media=linkOut
    ? '<a class="media" href="productos.html#'+p.code.toLowerCase()+'" aria-label="Ver '+p.name+'">'
    : '<button class="media" type="button" data-open="'+i+'" aria-label="Ver detalle de '+p.name+'">';
  var mediaEnd=linkOut?'</a>':'</button>';
  var detail=linkOut
    ? '<a class="btn btn-line" href="productos.html#'+p.code.toLowerCase()+'">Detalle</a>'
    : '<button class="btn btn-line" type="button" data-open="'+i+'">Detalle</button>';
  el.innerHTML=media+'<span class="code">'+p.code+'</span><span class="cat">'+CATS[p.cat]+'</span><img src="'+p.img+'" alt="'+p.name+'" width="300" height="520">'+mediaEnd+
    '<div class="body"><h3>'+p.name+'</h3><div class="spec">'+p.spec+'</div><div class="swatches">'+
    p.colors.map(function(c){return '<i style="background:'+c+'"></i>'}).join('')+'</div>'+
    '<div class="actions">'+detail+'<a class="btn btn-gold" href="'+quote(p)+'" target="_blank" rel="noopener">Cotizar</a></div></div>';
  return el;
}

/* Destacados (Inicio) */
var featured=$('#featured');
if(featured){['polera-ml','polo','chaleco','pantalon-navy'].forEach(function(id){
  var i=P.findIndex(function(p){return p.id===id});featured.appendChild(card(P[i],i,true));
});}

/* Catálogo (Productos) */
var grid=$('#grid');
if(grid){
  P.forEach(function(p,i){grid.appendChild(card(p,i,false))});
  var filters=$('#filters'),count=$('#count');
  var counts={all:P.length};P.forEach(function(p){counts[p.cat]=(counts[p.cat]||0)+1});
  [['all','Todos'],['polos','Polos'],['hv','Alta visibilidad'],['pant','Pantalones']].forEach(function(f,i){
    var b=document.createElement('button');b.className='chip';b.type='button';b.dataset.f=f[0];b.setAttribute('aria-pressed',i===0);
    b.innerHTML=f[1]+'<span class="ct">'+counts[f[0]]+'</span>';filters.appendChild(b);
  });
  var setCount=function(n){count.textContent=n+(n===1?' producto':' productos')};setCount(P.length);
  filters.addEventListener('click',function(e){
    var b=e.target.closest('.chip');if(!b)return;
    $$('.chip',filters).forEach(function(c){c.setAttribute('aria-pressed',c===b)});
    var d=0;$$('.card',grid).forEach(function(c){
      var show=b.dataset.f==='all'||c.dataset.cat===b.dataset.f;
      c.hidden=!show;c.classList.remove('in');c.style.transform='';
      if(show&&!reduce){void c.offsetWidth;c.style.animationDelay=(d*45)+'ms';c.classList.add('in')}
      if(show)d++;
    });
    setCount(d);
  });

  var dlg=$('#dlg');
  var open=function(i){var p=P[i];
    $('#dlg-img').src=p.img;$('#dlg-img').alt=p.name;
    $('#dlg-cat').textContent=p.code+' · '+CATS[p.cat];
    $('#dlg-title').textContent=p.name;$('#dlg-desc').textContent=p.desc;
    $('#dlg-specs').innerHTML='<div><dt>Tela</dt><dd>'+p.tela+'</dd></div><div><dt>Acabado</dt><dd>'+p.acab+'</dd></div><div><dt>Tallas</dt><dd>S · M · L · XL · XXL</dd></div><div><dt>Logo</dt><dd>Personalizable con tu marca</dd></div>';
    $('#dlg-wa').href=quote(p);
    if(dlg.showModal){if(!dlg.open)dlg.showModal()}else dlg.setAttribute('open','');
  };
  grid.addEventListener('click',function(e){var t=e.target.closest('[data-open]');if(t)open(+t.dataset.open)});
  $('#dlg-close').addEventListener('click',function(){dlg.close()});
  dlg.addEventListener('click',function(e){if(e.target===dlg)dlg.close()});
  var fromHash=function(){var h=(location.hash||'').slice(1).toUpperCase();var i=P.findIndex(function(p){return p.code===h});if(i>-1)open(i)};
  fromHash();addEventListener('hashchange',fromHash);

  if(!reduce&&canHover){
    grid.addEventListener('pointermove',function(e){var c=e.target.closest('.card');if(!c||c.classList.contains('in')&&c.getAnimations&&c.getAnimations().length)return;var r=c.getBoundingClientRect();
      var x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform='perspective(800px) rotateY('+(x*8)+'deg) rotateX('+(-y*8)+'deg) translateY(-4px)'});
    grid.addEventListener('pointerout',function(e){var c=e.target.closest('.card');if(c&&!c.contains(e.relatedTarget))c.style.transform=''});
  }
}

/* Parallax de la portada */
var sc=$('#showcase');
if(sc&&!reduce&&canHover){
  sc.closest('.hero').addEventListener('pointermove',function(e){var r=sc.getBoundingClientRect();
    var x=(e.clientX-(r.left+r.width/2))/r.width,y=(e.clientY-(r.top+r.height/2))/r.height;
    $$('.g',sc).forEach(function(g){var d=+g.dataset.depth;g.style.transform='translate('+(-x*d)+'px,'+(-y*d)+'px)'})});
}

/* Marquee continuo */
var mq=$('#marq');if(mq)mq.innerHTML+=mq.innerHTML;

/* Aparición al hacer scroll (todo es visible en reposo) */
if(!reduce&&'IntersectionObserver' in window){
  var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('play');io.unobserve(en.target)}})},{rootMargin:'0px 0px -8% 0px'});
  $$('.rv').forEach(function(el,i){if(el.getBoundingClientRect().top>innerHeight*.92){el.style.animationDelay=((i%4)*70)+'ms';io.observe(el)}});
}

/* Cabecera */
var hdr=$('.site-header');
var onScroll=function(){hdr.classList.toggle('scrolled',scrollY>8)};addEventListener('scroll',onScroll,{passive:true});onScroll();
var burger=$('#burger'),menu=$('#menu');
var setMenu=function(o){menu.classList.toggle('open',o);burger.setAttribute('aria-expanded',o);burger.setAttribute('aria-label',o?'Cerrar menú':'Abrir menú')};
burger.addEventListener('click',function(){setMenu(!menu.classList.contains('open'))});
document.addEventListener('keydown',function(e){if(e.key==='Escape')setMenu(false)});
document.addEventListener('click',function(e){if(menu.classList.contains('open')&&!e.target.closest('.nav'))setMenu(false)});
addEventListener('resize',function(){if(innerWidth>900)setMenu(false)});

/* Copiar datos */
$$('[data-copy]').forEach(function(b){b.addEventListener('click',function(e){
  e.preventDefault();var done=function(t){b.textContent=t;setTimeout(function(){b.textContent='Copiar'},1800)};
  var sel=function(){var s=getSelection(),r=document.createRange();r.selectNodeContents(b.closest('.crow').querySelector('b'));s.removeAllRanges();s.addRange(r);done('Seleccionado')};
  try{navigator.clipboard.writeText(b.dataset.copy).then(function(){done('Copiado')},sel)}catch(_){sel()}
})});

/* Formulario → WhatsApp */
var form=$('#qform');
if(form){
  var sel=$('#f-producto');
  P.forEach(function(p){var o=document.createElement('option');o.value=p.name+' ('+p.code+')';o.textContent=p.code+' · '+p.name;sel.appendChild(o)});
  var send=$('#send');
  var build=function(){var f=new FormData(form);var L=['Hola EUTEX, quiero una cotización.'];
    if(f.get('nombre'))L.push('Nombre: '+f.get('nombre'));if(f.get('empresa'))L.push('Empresa: '+f.get('empresa'));
    L.push('Producto: '+(f.get('producto')||'Varios productos'));if(f.get('cantidad'))L.push('Cantidad: '+f.get('cantidad'));
    if(f.get('mensaje'))L.push('Detalle: '+f.get('mensaje'));send.href=wa(L.join('\n'))};
  form.addEventListener('input',build);form.addEventListener('change',build);
  form.addEventListener('submit',function(e){e.preventDefault()});build();
}

var y=$('#year');if(y)y.textContent=new Date().getFullYear();
})();
