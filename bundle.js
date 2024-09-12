!function(){"use strict";function t(t,e){return null!==t&&"function"==typeof e}function e(t){return"string"==typeof t}function n(t){return"number"==typeof t}function r(t){return null!==t&&"string"!=typeof t&&"number"!=typeof t&&"function"!=typeof t&&!Array.isArray(t)&&"nodeType"in t}function i(i,...o){let l=[],a=[],u=[],f=[];for(let c=0;c<i.length;c++){let d=i[c],p=o[c],$=d.match(/ref="?$/),v=d.match(/on([a-z]+)="?/),y="xxxxxxxxxxxx".replace(/x/g,(()=>Math.floor(16*Math.random()).toString(16)));if(void 0===p)l.push(d);else if(s=p,null!==$&&"function"==typeof s)a.push({key:y,t:p}),l.push(d,y);else if(t(v,p)){if(!v)throw new Error("Unreachable");let t=v[1];u.push({key:y,name:t,t:p}),l.push(d,y)}else if(e(p))l.push(d,p);else if(n(p))l.push(d,String(p));else if(r(p))f.push({key:y,i:p}),l.push(d,`<span data-stract=${y}></span>`);else if(Array.isArray(p)){l.push(d);for(let t=0;t<p.length;t++){let i=p[t];e(i)?l.push(i):n(i)?l.push(String(i)):r(i)&&(f.push({key:y,i:i}),l.push(`<span data-stract=${y}></span>`))}}else{if(p)throw new Error(`Type ${typeof p} is not a valid interpolation!`);l.push(d)}}var s;let c=document.createElement("template");c.innerHTML=l.join("");let{content:d}=c;return u.forEach((t=>{let e=`on${t.name}`,n=`[${e}='${t.key}']`,r=d.querySelector(n);r.removeAttribute(e),r.addEventListener(t.name,t.t)})),f.forEach((t=>{let e=`[data-stract='${t.key}']`,n=d.querySelector(e);if(Array.isArray(t.i)){let e=n;for(let n=0;n<t.i.length;n++)r=e,i=t.i[n],r.parentNode.insertBefore(i,r.nextSibling);n.parentNode.removeChild(n)}else n.parentNode.replaceChild(t.i,n);var r,i})),a.forEach((t=>{let e=`[ref='${t.key}']`,n=d.querySelector(e);n.removeAttribute("ref"),t.t(n)})),d}let o=new Set;function l(t){return o.add(t),()=>o.delete(t)}let a=new Set,u=new Set;class f{constructor(){}next=null;set(...t){this.clear(),this.next=setInterval(...t)}clear(){this.next&&clearInterval(this.next)}}function s(){let t={o:null};return[t,e=>t.o=e]}function c(t,e,n){let[r,o]=s(),[a,u]=s(),[f,c]=s();function d(){a.o&&f.o&&(a.o.value>=100?(f.o.style.backgroundColor="red",f.o.textContent="Shame Unrecoverable"):a.o.value>90?(f.o.style.backgroundColor="red",f.o.textContent="Shame Critical!!!"):a.o.value<=90&&(f.o.style.backgroundColor="black",f.o.textContent="Shame OK"))}l((()=>{a.o&&f.o&&(a.o.value+=Math.random()>.75?5:1,d(),a.o.value>=100&&function(){if(v=!1,!r.o)return;r.o.style.opacity="0.2",e(t)}())}));let p=[];p.push($(2)),p.push($(4));let v=!0;function y(t){if(!t.dataTransfer)return!1;if(!v)return!1;let e=t.dataTransfer.getData("text/plain");return!!p.find((t=>t===e))}return i`
    <div
      data-friendid=${t}
      ref=${o}
      class="border-1"
      ondrop=${function(t){t.preventDefault();let e=t.dataTransfer?.getData("text/plain");if(!e)return;console.log(`Dropped ${e}`);let n=h();n.l&&(n.l.remove(),n.l=null),t.currentTarget.style.backgroundColor="transparent",a.o&&(a.o.value-=10*e.length),d()}}
      ondragover=${function(t){y(t)&&t.preventDefault()}}
      ondragenter=${function(t){if(!y(t))return;console.log("drag enter"),t.currentTarget.style.backgroundColor="blue"}}
      ondragleave=${function(t){console.log("drag leave"),t.currentTarget.style.backgroundColor="transparent"}}
    >
      <div style="pointer-events:none;">
        <div style="position:relative; height: 2rem;">
          <meter
            ref=${u}
            value=${n}
            min=0
            optimium=0
            low="10"
            high=90
            max=100
            style="
              width: 100%;
              height: 1rem;
            "
          ></meter>
          <label
            ref=${c}
            style="
              position:absolute;
              right: 0;
              bottom: 0;
              background-color: black;
              text-transform: uppercase;
            "
          >Shame</label>
        </div>
        <ul>
          ${p.map((t=>i`<li>${t}</li>`))}
        </ul>
      </div>
    </div>
  `}function d(){l((()=>{Math.random()>.5&&t.o?.appendChild(function(){let t=$(Math.random()>.85?4:2);function e(e){if(!e.dataTransfer)return;e.dataTransfer.dropEffect="move",e.dataTransfer.setData("text/plain",t);let n=e.target;h().l=n}function n(t){t.target.style.outline="1px solid red"}function r(t){t.target.style.outline=""}let o=0,a=10,u=l((()=>{f.o&&(o+=1,f.o.style.opacity=""+(1-o/a),o>a&&(f.o.remove(),u()))})),[f,c]=s();return i`
    <li
      ref=${c}
      draggable="true"
      ondragstart=${e}
      ondrag=${n}
      ondragend=${r}
    >
      <button>✥</button>
      ${t}
    </li>
  `}())}));let t={o:null};return i`
    <div>
      <ul ref=${e=>t.o=e}>
      </ul>
    </div>
  `}let p=["◯","△","◻","✕"];function $(t){let e="";for(let n=0;n<t;n++){let t=Math.random();e=`${e}${p[Math.floor(t*p.length)]}`.split("").sort().join("")}return e}function v(t){let e=t/1e3,n=Math.floor(e%3600/60),r=Math.floor(e%60),i=t%1e3;return`${n>9?n:`0${n}`}:${r>9?r:`0${r}`}.${i>99?i:i>9?`0${i}`:`00${i}`}`}function y(t,e){let[n,r]=s(),[o,l]=s(),[a,f]=s(),c=0,d=0;var p;p=()=>{n.o&&o.o&&$&&(c+=10,n.o.textContent=v(c),d+=t(),o.o.textContent=`${d} points`)},u.add(p);let $=!0;return e.o=function(){return $=!1,a.o.textContent="Anxiety Not Sustained",{ms:c,points:d}},i`
    <div
      style="
        display: flex;
        justify-content: center;
        align-items: center;
      "
    >
      <div style="position: relative;">
        <header
          ref=${f}
          style='
            position: absolute;
            left: 0;
            top: 0;
            background-color: black;
            text-transform: uppercase;
          '
        >Anxiety Sustaining</header>
        <div
          style="
            font-size: 5rem;
            font-variant-numeric: tabular-nums;
            font-family: monospace;
            font-weight: bold;
          "
          ref=${r}
        ></div>
        <div
          ref=${l}
        ></div>
      </div>
    </div>
  `}let m={l:null};function h(){return m}document.querySelector("body")?.appendChild(function(){let t=new f;t.set((()=>{!function(){for(let t of o)t()}()}),1e3);let e=new f;e.set((()=>{!function(){for(let t of a)t()}()}),100);let n=new f;function r(){t.clear(),e.clear(),n.clear()}n.set((()=>{!function(){for(let t of u)t()}()}),10),window.addEventListener("keyup",(t=>{"Escape"===t.key&&(r(),console.log("halt"))}));let p=[{id:"a",u:50},{id:"b",u:40},{id:"c",u:75}];function $(){r()}let m={o:null};function h(t){let e=p.findIndex((e=>e.id===t));if(-1!==e&&(p.splice(e,1),0===p.length)){let{ms:t,points:e}=m.o?.()??{ms:0,points:0};g.o?.appendChild(function(t,e,n){let[r,o]=s(),a="Anxiety Not Sustained".split(" "),u=[`Anxiety lasted ${v(e)}, ${n} points`],f=l((()=>{if(0===a.length){let e=u.shift();if(!e)return;if(r.o?.appendChild(i`<span style="font-size: 1rem;"><span style="background-color: black;">${e}</span></span>`),0===u.length)return f(),void t()}let e=a.shift();e&&r.o?.appendChild(i`<span><span style="background-color: black;">${e}</span></span>`)}));return i`
    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0">
      <div
        ref=${o}
        style="
          display: flex;
          flex-direction: column;
          gap: 1rem;
          font-size: 5rem;
          text-transform: uppercase;
        "
      ></div>
    </div>
  `}($,t,e))}}let[g,b]=s();return i`
    <div ref=${b} style="position: relative;">
      ${y((function(){return p.length}),m)}
      ${p.map((t=>c(t.id,h,t.u)))}
      ${d()}
    </div>
  `}())}();