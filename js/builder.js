const repo="https://raw.githubusercontent.com/RulsOfficial/ruls-dbd-builds/main/"
let perks=[],killers=[]
const $=id=>document.getElementById(id),$$=s=>document.querySelectorAll(s)

function showToast(msg,type=''){
  const t=$('toast')
  t.textContent=msg
  t.className='toast show '+type
  setTimeout(()=>t.classList.remove('show'),2500)
}

async function loadPerks(){
  try{
    const type=$("type").value
    perks=(await fetch(repo+`data/${type}-perks.json`).then(r=>r.json())).filter(p=>p.perkName)
    if(type==="survivor"){
      const groups=Object.keys(await fetch(repo+"data/survivor-groups.json").then(r=>r.json()))
      $("groupSelect").innerHTML=groups.map(g=>`<option value="${g}">${g}</option>`).join('')
    }else{
      killers=[...new Set(perks.map(p=>p.character).filter(Boolean))]
    }
    renderPerks()
  }catch(e){showToast('Failed to load perks','error')}
}

function renderPerks(){
  $("perkContainer").innerHTML=""
  for(let i=0;i<4;i++){
    const slot=Object.assign(document.createElement("div"),{className:"perk-slot"})
    const img=Object.assign(document.createElement("img"),{className:"perk-image"})
    const input=Object.assign(document.createElement("input"),{placeholder:`Perk ${i+1}`})
    const list=Object.assign(document.createElement("div"),{className:"autocomplete-list"})
    const desc=Object.assign(document.createElement("div"),{className:"perk-desc"})
    const box=Object.assign(document.createElement("div"),{className:"autocomplete"})
    const header=Object.assign(document.createElement("div"),{className:"perk-header"})
    input.oninput=input.onfocus=()=>input.value&&searchPerk(input,list,img,desc,slot)
    box.append(input,list);header.append(img,box);slot.append(header,desc)
    $("perkContainer").appendChild(slot)
  }
}

function searchPerk(input,list,img,desc,slot){
  list.innerHTML=""
  if(!input.value){list.classList.remove('active');return}
  const matches=perks.filter(p=>p.perkName.toLowerCase().includes(input.value.toLowerCase())).slice(0,15)
  if(!matches.length){list.classList.remove('active');return}
  matches.forEach(p=>{
    const item=Object.assign(document.createElement("div"),{className:"autocomplete-item",textContent:p.perkName})
    item.onclick=()=>{
      if([...$$('#perkContainer input')].some(i=>i.value===p.perkName)){showToast("Perk already selected","error");return}
      input.value=p.perkName;img.src=p.perkImage;desc.innerHTML=decodeURIComponent(p.description)
      slot.classList.add('selected');list.classList.remove('active');list.innerHTML=""
    }
    list.appendChild(item)
  })
  list.classList.add('active')
}

function searchAutocomplete(input,list,data){
  list.innerHTML=""
  if(!input.value){list.classList.remove('active');return}
  const matches=data.filter(k=>k.toLowerCase().includes(input.value.toLowerCase()))
  if(!matches.length){list.classList.remove('active');return}
  matches.forEach(k=>{
    const item=Object.assign(document.createElement("div"),{className:"autocomplete-item",textContent:k})
    item.onclick=()=>{input.value=k;list.classList.remove('active');list.innerHTML=""}
    list.appendChild(item)
  })
  list.classList.add('active')
}

document.onclick=e=>{if(!e.target.closest('.autocomplete'))$$('.autocomplete-list').forEach(l=>l.classList.remove('active'))}

$("killerInput").oninput=$("killerInput").onfocus=()=>searchAutocomplete($("killerInput"),$("killerList"),killers)

$("type").onchange=()=>{
  const isKiller=$("type").value==="killer"
  $("killerBox").style.display=isKiller?"block":"none"
  $("groupBox").style.display=isKiller?"none":"block"
  loadPerks()
}

function generate(){
  const name=$("buildName").value.trim(),author=$("author").value.trim(),type=$("type").value
  const perksSelected=[...$$('#perkContainer input')].map(i=>i.value)
  if(!name){showToast("Enter a build name","error");return}
  if(perksSelected.some(p=>!p)){showToast("Select all 4 perks","error");return}
  const json={name:name.includes("Build")?name:name+" Build",perks:perksSelected,altperks:["","","",""],author:author||"Anonymous"}
  if(type==="survivor")json.group=$("groupSelect").value
  else{if(!$("killerInput").value){showToast("Select a killer","error");return};json.killer=$("killerInput").value}
  const fmt=k=>Array.isArray(json[k])?'['+json[k].map(v=>JSON.stringify(v)).join(', ')+']':JSON.stringify(json[k])
  $("output").textContent="{\n"+[`    "name": ${fmt("name")}`,`    "perks": ${fmt("perks")}`,`    "altperks": ${fmt("altperks")}`,json.group?`    "group": ${fmt("group")}`:`    "killer": ${fmt("killer")}`,`    "author": ${fmt("author")}`].join(",\n")+"\n}"
  showToast("JSON generated!","success")
}

function copy(){
  if(!$("output").textContent){showToast("Generate JSON first","error");return}
  navigator.clipboard.writeText($("output").textContent)
  showToast("Copied!","success")
}

function createIssue(){
  if(!$("output").textContent){showToast("Generate JSON first","error");return}
  const name=$("buildName").value.trim(),type=$('type').value
  const title=encodeURIComponent(name.includes("Build")?name:name+" Build")
  const body=encodeURIComponent(`\`\`\`json\n${$("output").textContent}\n\`\`\``)
  window.open(`https://github.com/RulsOfficial/ruls-dbd-builds/issues/new?title=${title}&labels=${type}-build&body=${body}`,'_blank')
}

loadPerks()
