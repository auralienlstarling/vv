/* ---------------- Router ---------------- */
const views = document.querySelectorAll(".view");
const navButtons = document.querySelectorAll(".nav-btn");
function showView(id){
  views.forEach(v => v.classList.toggle("active", v.id === id));
  navButtons.forEach(btn => btn.classList.toggle("active", btn.dataset.target === id));
  window.location.hash = id;
}
navButtons.forEach(btn => btn.addEventListener("click", () => showView(btn.dataset.target)));
window.addEventListener("DOMContentLoaded", () => {
  const initial = (location.hash || "#home").slice(1);
  showView(initial);
  populateMonths();
  renderSuppliers();
  renderMessages();
  renderEvents();

  // --- Auto-fill Owner form if saved data exists ---
  const savedOwner = localStorage.getItem("ownerAccount");
  if(savedOwner){
    try {
      const data = JSON.parse(savedOwner);
      document.getElementById("ownerName").value = data.name || "";
      document.getElementById("ownerPhone").value = data.phone || "";
      document.getElementById("ownerCity").value = data.city || "";
      document.getElementById("roofSize").value = data.size || "";
      document.getElementById("cropFocus").value = data.crop || "";
      document.getElementById("flowers").value = data.flowers || "";
    } catch(e){}
  }

  // --- Auto-fill Volunteer form if saved data exists ---
  const savedVol = localStorage.getItem("volunteerAccount");
  if(savedVol){
    try {
      const data = JSON.parse(savedVol);
      document.getElementById("volName").value = data.name || "";
      document.getElementById("volPhone").value = data.phone || "";
      document.getElementById("volArea").value = data.area || "";
      document.getElementById("volGroup").value = data.group || "";
      document.getElementById("volRole").value = data.role || "";
      document.getElementById("volDate").value = data.date || "";
    } catch(e){}
  }

  // --- Auto-fill Supplier form if saved data exists ---
  const savedSup = localStorage.getItem("supplierAccount");
  if(savedSup){
    try {
      const data = JSON.parse(savedSup);
      document.getElementById("supName").value = data.name || "";
      document.getElementById("supEmail").value = data.email || "";
      document.getElementById("supCity").value = data.city || "";
      document.getElementById("supCat").value = data.cat || "";
      document.getElementById("supOffer").value = data.offer || "";
    } catch(e){}
  }
});
// Listen for hash changes (for browser navigation and anchor links)
window.addEventListener("hashchange", () => {
  const id = (location.hash || "#home").slice(1);
  showView(id);
});

/* ---------------- Browser Check ---------------- */
document.getElementById("checkSupportBtn")?.addEventListener("click", () => {
  const ok = !!(window.fetch && window.localStorage && window.ResizeObserver);
  document.getElementById("supportResult").textContent =
    ok ? "✅ All modern features available." : "⚠️ Some features missing.";
});

/* ---------------- Helpers (storage) ---------------- */
const DB = {
  get(key, fallback){ try{ return JSON.parse(localStorage.getItem(key)) ?? fallback; }catch{ return fallback; } },
  set(key, value){ localStorage.setItem(key, JSON.stringify(value)); }
};

/* ---------------- Owners ---------------- */
document.getElementById("ownerForm")?.addEventListener("submit", (e)=>{
  e.preventDefault();
  const data = {
    name: document.getElementById("ownerName").value.trim(),
    phone: document.getElementById("ownerPhone").value.trim(),
    city: document.getElementById("ownerCity").value,
    size: Number(document.getElementById("roofSize").value),
    crop: document.getElementById("cropFocus").value,
    flowers: document.getElementById("flowers").value.trim()
  };
  // Save to localStorage for auto-fill
  localStorage.setItem("ownerAccount", JSON.stringify(data));

  const owners = DB.get("owners", []);
  owners.push({...data, ts: Date.now()});
  DB.set("owners", owners);

  const estRevenue = Math.round(Math.max(1, data.size) * 10 * 12); // simple annual estimate in EGP (editable later)
  const ownerShare = Math.round(estRevenue * 0.20);

  document.getElementById("ownerResult").innerHTML = `
    <div class="box">
      ✅ Thank you, ${data.name}! We received your request in ${data.city}.<br/>
      <strong>Edible crops only.</strong> Accessory flowers noted: ${data.flowers || "None"}<br/>
      Estimated yearly revenue (illustrative): <strong>${estRevenue.toLocaleString()} EGP</strong> → 
      your 20% ≈ <strong>${ownerShare.toLocaleString()} EGP</strong>.
    </div>
  `;
});

/* ---------------- Volunteers ---------------- */
document.getElementById("volForm")?.addEventListener("submit", (e)=>{
  e.preventDefault();
  const entry = {
    name: document.getElementById("volName").value.trim(),
    phone: document.getElementById("volPhone").value.trim(),
    area: document.getElementById("volArea").value.trim(),
    group: document.getElementById("volGroup").value,
    role: document.getElementById("volRole").value,
    date: document.getElementById("volDate").value
  };
  // Save to localStorage for auto-fill
  localStorage.setItem("volunteerAccount", JSON.stringify(entry));

  const vols = DB.get("volunteers", []);
  vols.push({...entry, ts: Date.now()});
  DB.set("volunteers", vols);
  renderEvents();

  alert(`✅ Welcome ${entry.name}! You’re added to the ${entry.area} team for ${entry.role}.`);
});

function renderEvents(){
  const list = document.getElementById("eventList");
  if(!list) return;
  const vols = DB.get("volunteers", []);
  list.innerHTML = vols.length ? "" : `<li>No events yet — be the first to schedule.</li>`;
  vols
    .sort((a,b)=>a.date.localeCompare(b.date))
    .forEach(v=>{
      const li = document.createElement("li");
      li.textContent = `${v.date} • ${v.area} • ${v.role} • ${v.name} (${v.group})`;
      list.appendChild(li);
    });
}

/* ---------------- Suppliers ---------------- */
document.getElementById("supForm")?.addEventListener("submit", (e)=>{
  e.preventDefault();
  const s = {
    name: document.getElementById("supName").value.trim(),
    email: document.getElementById("supEmail").value.trim(),
    city: document.getElementById("supCity").value,
    cat:  document.getElementById("supCat").value,
    offer:document.getElementById("supOffer").value.trim()
  };
  // Save to localStorage for auto-fill
  localStorage.setItem("supplierAccount", JSON.stringify(s));

  const list = DB.get("supplierOffers", []);
  list.push({...s, ts: Date.now()});
  DB.set("supplierOffers", list);
  alert(`✅ Thanks ${s.name}! Your free supply offer is logged. You’ll receive 10% monthly yield from supported rooftops.`);
});

/* Real Egyptian examples (static list to browse; you can add more later) */
const SUPPLIERS = [
  {name:"Misr Hytech Seed International", cat:"Seeds", city:"Cairo", url:"https://hytechseed.com/", blurb:"Egyptian hybrid seeds for vegetables & field crops."},
  {name:"Mashtal Garden Centers", cat:"Nursery", city:"Cairo", url:"https://www.mashtalegypt.com/", blurb:"Online plants, seeds, tools; delivery nationwide."},
  {name:"GrowPro", cat:"Nursery", city:"Cairo", url:"https://growpro-eg.com/", blurb:"Edible plants & urban farming supplies."},
  {name:"Nabat Delivery", cat:"Nursery", city:"Cairo", url:"https://nabatdelivery.com/", blurb:"Indoor/outdoor plants, seeds, pots; delivery."},
  {name:"Egypt Green Farm (Nursery)", cat:"Nursery", city:"Giza", url:"https://egyptgreenfarm.com/", blurb:"Established nursery; house & garden plants."},
  {name:"Plantcult Cairo", cat:"Nursery", city:"Cairo", url:"https://plantcultcairo.com/", blurb:"Boutique plant shop; urban jungle vibes."},
  {name:"SEKEM", cat:"Organic/Bio", city:"Nationwide", url:"https://sekem.com/en/index/", blurb:"Biodynamic network; organic inputs/knowledge."},
  {name:"Schaduf", cat:"Urban Greening", city:"Cairo", url:"https://schaduf.com/", blurb:"Green roofs/walls & urban agriculture solutions."},
  {name:"AlGhanim Agriculture — Hydroponics", cat:"Hydroponics/Systems", city:"Nationwide", url:"https://www.alghanimagri.com/", blurb:"High-tech hydroponic greenhouse & systems."}
];

function supplierMatches(s, {cat, city, q}){
  const okCat  = (cat==="all")  || (s.cat===cat);
  const okCity = (city==="all") || (s.city===city);
  const okQ    = !q || (s.name.toLowerCase().includes(q) || s.blurb.toLowerCase().includes(q));
  return okCat && okCity && okQ;
}
function renderSuppliers(){
  const target = document.getElementById("supplierList");
  if(!target) return;
  const cat  = document.getElementById("catFilter").value;
  const city = document.getElementById("cityFilter").value;
  const q    = document.getElementById("searchInput").value.trim().toLowerCase();

  const items = SUPPLIERS.filter(s => supplierMatches(s,{cat,city,q}));
  target.innerHTML = "";
  if(items.length===0){ target.innerHTML = `<div class="card">No suppliers match your filters.</div>`; return; }
  items.forEach(s=>{
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <h3>${s.name}</h3>
      <div class="meta">${s.cat} • ${s.city}</div>
      <p>${s.blurb}</p>
      <a href="${s.url}" target="_blank" rel="noopener">Visit site ↗</a>
    `;
    target.appendChild(card);
  });
}
["catFilter","cityFilter","searchInput"].forEach(id=>{
  document.getElementById(id)?.addEventListener("input", renderSuppliers);
});

/* ---------------- Plant Guide (climate rules) ---------------- */
const CITY_META = {
  "cairo":      { label:"Cairo",      region:"core" },
  "giza":       { label:"Giza",       region:"core" },
  "alexandria": { label:"Alexandria", region:"coastal" },
  "port-said":  { label:"Port Said",  region:"coastal" },
  "luxor":      { label:"Luxor",      region:"upper" },
  "aswan":      { label:"Aswan",      region:"upper" }
};
const RULES = {
  coastal(m){
    const hot = m>=5 && m<=9;
    return hot
      ? ["Basil","Mint","Cherry Tomato (heat-tolerant)","Okra","Chili Pepper","Eggplant","Roselle (Karkadeh)","Sweet Potato"]
      : ["Lettuce","Arugula (Gargeer)","Spinach","Parsley","Coriander","Peas","Fava Beans (pots)","Strawberry"];
  },
  core(m){
    const veryHot = m>=5 && m<=9;
    return veryHot
      ? ["Basil","Mint","Okra","Molokhia","Chili Pepper","Eggplant","Sweet Potato","Aloe/Medicinal herbs"]
      : ["Lettuce","Arugula","Spinach","Dill","Parsley","Coriander","Radish","Beetroot","Strawberry"];
  },
  upper(m){
    const scorching = m>=4 && m<=9;
    return scorching
      ? ["Okra","Molokhia","Basil","Chili Pepper","Eggplant","Purslane","Sweet Potato","Moringa (pots)"]
      : ["Lettuce (shade)","Arugula","Spinach (early/late)","Onion greens","Garlic greens","Coriander","Peas (winter)"];
  }
};
function populateMonths(){
  const sel = document.getElementById("month");
  if(!sel) return;
  const names = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const now = new Date().getMonth();
  names.forEach((n,i)=>{
    const o = document.createElement("option");
    o.value = String(i); o.textContent = n; if(i===now) o.selected = true;
    sel.appendChild(o);
  });
}
document.getElementById("plantForm")?.addEventListener("submit",(e)=>{
  e.preventDefault();
  const cityKey = document.getElementById("city").value;
  const month = Number(document.getElementById("month").value);
  const region = CITY_META[cityKey].region;
  const list = RULES[region](month);
  const wrap = document.getElementById("plantResults");
  wrap.innerHTML = `
    <div class="card"><div class="meta"><strong>${CITY_META[cityKey].label}</strong> • ${region.toUpperCase()} region</div></div>
  `;
  const grid = document.createElement("div");
  grid.className = "results";
  list.forEach(name=>{
    const b = document.createElement("span");
    b.className = "badge"; b.textContent = name; grid.appendChild(b);
  });
  wrap.appendChild(grid);
});

/* ---------------- Economics Calculator ---------------- */
document.getElementById("ecoForm")?.addEventListener("submit",(e)=>{
  e.preventDefault();
  const crop = document.getElementById("ecoCrop").value;
  const yieldAmt = Math.max(0, Number(document.getElementById("ecoYield").value));
  const price = Math.max(0, Number(document.getElementById("ecoPrice").value));
  const supplierCount = Math.max(0, Number(document.getElementById("ecoSuppliers").value));

  const revenue = yieldAmt * price; // EGP
  const ownerShare = revenue * 0.20;
  const supplierPool = revenue * 0.10;
  const supplierEach = supplierCount>0 ? supplierPool / supplierCount : 0;
  const opsWorkers = revenue - ownerShare - supplierPool;

  document.getElementById("ecoResult").innerHTML = `
    <div class="box">
      <strong>${crop}</strong> • Yield: ${yieldAmt.toLocaleString()} • Price: ${price.toLocaleString()} EGP
      <hr/>
      Revenue: <strong>${revenue.toLocaleString()} EGP</strong><br/>
      Owner (20%): <strong>${Math.round(ownerShare).toLocaleString()} EGP</strong><br/>
      Supplier pool (10%): <strong>${Math.round(supplierPool).toLocaleString()} EGP</strong> 
      ${supplierCount?`(≈ ${Math.round(supplierEach).toLocaleString()} EGP each × ${supplierCount})`:""}<br/>
      Ops & Workers: <strong>${Math.round(opsWorkers).toLocaleString()} EGP</strong>
    </div>
  `;
});

/* ---------------- Messaging Hub ---------------- */
document.getElementById("msgForm")?.addEventListener("submit",(e)=>{
  e.preventDefault();
  const item = {
    name: document.getElementById("msgName").value.trim(),
    role: document.getElementById("msgRole").value,
    text: document.getElementById("msgText").value.trim(),
    ts: Date.now()
  };
  const msgs = DB.get("messages", []);
  msgs.unshift(item);
  DB.set("messages", msgs);
  renderMessages();
  e.target.reset();
});
function renderMessages(){
  const list = document.getElementById("msgList");
  if(!list) return;
  const msgs = DB.get("messages", []);
  list.innerHTML = msgs.length ? "" : "<li>No messages yet.</li>";
  msgs.forEach(m=>{
    const li = document.createElement("li");
    const when = new Date(m.ts).toLocaleString();
    li.innerHTML = `<strong>${m.name}</strong> (${m.role}) • <span class="meta">${when}</span><br/>${m.text}`;
    list.appendChild(li);
  });
}