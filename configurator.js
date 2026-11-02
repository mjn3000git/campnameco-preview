// Camp Name Co. sign designer, preview only. Renders the sign as SVG as the user types.
(function(){
  var form=document.getElementById('configForm');
  var stage=document.getElementById('signPreview');
  var summary=document.getElementById('summary');
  var quote=document.getElementById('quoteBtn');
  var lakeFields=document.getElementById('lakeFields');
  var WOODS={
    pine:{a:'#e6c48d',b:'#cfa465',g:'#a87b43',label:'Pine',ink:'#2a1a0e'},
    cedar:{a:'#c27a4e',b:'#a85f37',g:'#7c3f22',label:'Cedar',ink:'#2a1a0e'},
    liveedge:{a:'#b88b5a',b:'#946a3e',g:'#5f3f20',label:'Live edge',ink:'#2a1a0e'},
    redwood:{a:'#a5432e',b:'#82301f',g:'#5a1d12',label:'Old-growth redwood',ink:'#f6e7c8'}
  };
  var SIZES={small:0.7,medium:0.85,large:1,xl:1};
  var SIZE_LABEL={small:'Small',medium:'Medium',large:'Large',xl:'Extra large'};
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function val(n){var el=form.elements[n];return el?el.value:'';}
  function checked(n){return form.elements[n].checked;}
  function shapePath(shape,w,h,x,y,live){
    if(shape==='arrow'){return '<path d="M'+x+' '+y+' H'+(x+w*0.82)+' L'+(x+w)+' '+(y+h/2)+' L'+(x+w*0.82)+' '+(y+h)+' H'+x+' Z"';}
    if(shape==='oval'){return '<ellipse cx="'+(x+w/2)+'" cy="'+(y+h/2)+'" rx="'+(w/2)+'" ry="'+(h/2)+'"';}
    if(live){
      // wavy bark edge on top and bottom for live edge
      var t='M'+x+' '+(y+6),i,n=8;
      for(i=1;i<=n;i++){t+=' Q'+(x+w*(i-0.5)/n)+' '+(y+(i%2?-6:14))+' '+(x+w*i/n)+' '+(y+6);}
      t+=' L'+(x+w)+' '+(y+h-6);
      for(i=n-1;i>=0;i--){t+=' Q'+(x+w*(i+0.5)/n)+' '+(y+h+(i%2?6:-14))+' '+(x+w*i/n)+' '+(y+h-6);}
      return '<path d="'+t+' Z"';
    }
    return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="12"';
  }
  function render(){
    var shape=val('shape'),wood=WOODS[val('wood')]||WOODS.pine,size=val('size'),font=val('font');
    var l1=val('line1'),l2=val('line2'),lake=checked('lakeest'),posts=checked('posts'),clear=checked('clear');
    lakeFields.hidden=!lake;
    var s=SIZES[size]||1,W=600,H=360;
    var w,h;
    if(shape==='number'){w=300*s;h=220*s;} else if(shape==='oval'){w=500*s;h=230*s;} else {w=540*s;h=190*s;}
    var x=(W-w)/2,y=(H-h)/2-(posts?25:0);
    if(lake&&l2===''){/* room for lake line */}
    var svg='<svg viewBox="0 0 '+W+' '+H+'" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sign preview">'+
      '<defs><linearGradient id="pw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+wood.a+'"/><stop offset="1" stop-color="'+wood.b+'"/></linearGradient>'+
      '<pattern id="pg" width="140" height="16" patternUnits="userSpaceOnUse"><path d="M0 8 Q35 2 70 8 T140 8" stroke="'+wood.g+'" stroke-opacity=".35" fill="none" stroke-width="1.3"/></pattern>'+
      '<linearGradient id="gl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>';
    if(posts){svg+='<rect x="'+(x+w*0.15-8)+'" y="'+(y+h-10)+'" width="16" height="'+(H-y-h+10)+'" fill="#5a3820"/><rect x="'+(x+w*0.85-8)+'" y="'+(y+h-10)+'" width="16" height="'+(H-y-h+10)+'" fill="#5a3820"/>';}
    var base=shapePath(shape,w,h,x,y,val('wood')==='liveedge'&&shape!=='oval'&&shape!=='arrow');
    svg+=base+' fill="url(#pw)" stroke="#3a2414" stroke-width="5"/>'+base+' fill="url(#pg)"/>';
    if(clear){svg+=base+' fill="url(#gl)"/>';}
    var cx=shape==='arrow'?x+w*0.42:x+w/2,cy=y+h/2;
    var lines=[];
    var main=l1||(shape==='number'?'1847':'Your Camp');
    lines.push({t:main,size:(shape==='number'?70:46)*s,bold:true});
    if(l2)lines.push({t:l2,size:24*s});
    if(lake){var ly=[val('lake'),val('year')?'EST. '+val('year'):''].filter(Boolean).join(' · ');if(ly)lines.push({t:ly,size:20*s});}
    var total=lines.reduce(function(a,l){return a+l.size*1.15;},0),ty=cy-total/2;
    var maxW=(shape==='arrow'?w*0.75:w*0.88);
    lines.forEach(function(l){
      ty+=l.size*1.05;
      var est=l.t.length*l.size*0.6,fit=est>maxW?' textLength="'+maxW.toFixed(0)+'" lengthAdjust="spacingAndGlyphs"':'';
      svg+='<text x="'+cx+'" y="'+ty.toFixed(1)+'" text-anchor="middle" font-family="\''+font+'\',serif" font-size="'+l.size.toFixed(1)+'"'+(l.bold?' font-weight="700"':'')+' fill="'+wood.ink+'" stroke="#000" stroke-opacity=".15" stroke-width=".6"'+fit+'>'+esc(l.t)+'</text>';
      ty+=l.size*0.1;
    });
    svg+='</svg>';
    stage.innerHTML=svg;
    var shapeLabel={plank:'Plank',arrow:'Arrow',oval:'Oval',number:'House number'}[shape];
    var addons=[];if(lake)addons.push('lake name + est. year');if(posts)addons.push('mounting posts');if(clear)addons.push('clear coat');
    var text=shapeLabel+', '+wood.label+', '+SIZE_LABEL[size]+', '+font+' font. Text: "'+main+'"'+(l2?' / "'+l2+'"':'')+(addons.length?'. Add-ons: '+addons.join(', '):'')+'.';
    summary.textContent=text;
    quote.href='contact.html?design='+encodeURIComponent(text);
  }
  var w=new URLSearchParams(location.search).get('wood');
  if(w&&WOODS[w]){form.elements.wood.value=w;}
  form.addEventListener('input',render);
  form.addEventListener('change',render);
  if(document.fonts&&document.fonts.ready){document.fonts.ready.then(render);}
  render();
})();
