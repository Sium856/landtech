const BD="০১২৩৪৫৬৭৮৯",en=s=>String(s||"").replace(/[০-৯]/g,c=>BD.indexOf(c)).trim(),
esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])),
norm=s=>String(s||"").replace(/\s+/g," ").trim().toLowerCase(),$=i=>document.getElementById(i);
const ld=k=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}};
// [খতিয়ান, দাগ, মৌজা(বাং), মৌজা(En), মালিক(বাং), মালিক(En), নামজারি, খাস, মামলা, অধিগ্রহণ]
const SEED=[["101","12","সাভার","Savar","রহিম উদ্দিন","Rahim Uddin",1,0,0,0],["102","15","সাভার","Savar","করিম মিয়া","Karim Mia",0,0,0,0],
["103","20","আশুলিয়া","Ashulia","বাংলাদেশ সরকার","Government of Bangladesh",1,1,0,0],["104","8","আশুলিয়া","Ashulia","সালমা বেগম","Salma Begum",1,0,1,0],
["105","30","ধামরাই","Dhamrai","আব্দুল হালিম","Abdul Halim",1,0,0,1],["106","5","ধামরাই","Dhamrai","জাহাঙ্গীর আলম","Jahangir Alam",1,0,0,0],
["107","41","গাজীপুর সদর","Gazipur Sadar","নূর জাহান","Nur Jahan",1,0,0,0],["108","22","গাজীপুর সদর","Gazipur Sadar","শফিকুল ইসলাম","Shafiqul Islam",0,0,1,0],
["109","9","কেরানীগঞ্জ","Keraniganj","মোহাম্মদ আলী","Mohammad Ali",1,0,0,1],["110","17","কেরানীগঞ্জ","Keraniganj","রফিকুল হক","Rafiqul Haque",1,0,0,0],
["111","33","নারায়ণগঞ্জ সদর","Narayanganj Sadar","ফরিদা খাতুন","Farida Khatun",1,0,0,0],["112","27","নারায়ণগঞ্জ সদর","Narayanganj Sadar","ইব্রাহিম খলিল","Ibrahim Khalil",0,0,1,1]]
.map((r,i)=>({id:i+1,k:r[0],d:r[1],m:r[2],me:r[3],o:r[4],oe:r[5],n:r[6],x:r[7],c:r[8],a:r[9]}));
// Backend এর বদলে browser storage (শুধু prototype)
let db=ld("lbc3")||{lang:"bn",users:[{id:1,name:"Admin",email:"admin@demo.com",pass:"admin123",role:"admin"}],lands:SEED,reports:[],me:null,nid:100},
tab="check",cur=null,mode="login",edit=null,msg="",why=false;
const save=()=>{try{localStorage.setItem("lbc3",JSON.stringify(db))}catch(e){}},me=()=>db.users.find(u=>u.id===db.me);
const t=(e,b)=>db.lang=="bn"?b:e,cls={"Pass":"ok","Warning":"wn","Risk Found":"rk","Not Verified":"nv"},
STN={"Pass":["Pass","পাস"],"Warning":["Warning","সতর্কতা"],"Risk Found":["Risk Found","ঝুঁকি পাওয়া গেছে"],"Not Verified":["Not Verified","যাচাই হয়নি"]},
sn=s=>t(...STN[s]),
RN=[["Owner name","মালিকের নাম"],["Namjari (mutation)","নামজারি"],["Khas land","খাস জমি"],["Ongoing case","চলমান মামলা"],["Acquisition","অধিগ্রহণ"]],
DIS=["This is a preliminary warning. Before buying land, confirm with a lawyer and the government land records.","এটি প্রাথমিক সতর্কতা। জমি কেনার আগে একজন আইনজীবী ও সরকারি রেকর্ডে নিশ্চিত হোন।"];
// প্রতিটি rule: [ঠিক থাকলে, ঝুঁকি/সতর্কতা হলে, কেন সমস্যা + কী করবেন]
const W=[
f=>[["Seller name matches the khatian owner","বিক্রেতার নাম খতিয়ানের মালিকের সাথে মিলেছে"],[`Khatian owner is "${f.oe}", but the seller name is different`,`খতিয়ানে মালিক "${f.o}", কিন্তু বিক্রেতার নাম আলাদা`],["Only the recorded owner can legally sell the land. A different seller may mean fraud, or an agent or heir without papers. Ask for the seller's NID and power of attorney, and check the latest khatian.","খতিয়ানের মালিকই আইনত জমি বিক্রি করতে পারেন। আলাদা বিক্রেতা মানে জালিয়াতি হতে পারে, অথবা কাগজ ছাড়া এজেন্ট বা উত্তরাধিকারী। বিক্রেতার NID ও পাওয়ার অব অ্যাটর্নি চেয়ে নিন এবং সর্বশেষ খতিয়ান দেখুন।"]],
f=>[["Namjari is complete","নামজারি সম্পন্ন হয়েছে"],["Namjari is not done","নামজারি হয়নি"],["Without namjari, government records may still show the old owner, so ownership is not fully clear. Ask the seller to complete namjari before you buy. This is fixable, so the penalty is small.","নামজারি ছাড়া সরকারি খাতায় এখনো আগের মালিকের নাম থাকতে পারে, তাই মালিকানা পুরো পরিষ্কার নয়। কেনার আগে বিক্রেতাকে নামজারি করিয়ে নিতে বলুন। এটা ঠিক করা যায়, তাই স্কোর কাটা কম।"]],
f=>[["Not khas land","খাস জমি নয়"],["This is khas (government) land","এটি খাস (সরকারি) জমি"],["Khas land belongs to the government and cannot be sold privately. A deed for it is not valid. Do not buy. This is the biggest risk, so the penalty is highest.","খাস জমি সরকারের সম্পত্তি, ব্যক্তিগতভাবে বিক্রি করা যায় না। এর দলিল বৈধ নয়। কিনবেন না। এটা সবচেয়ে বড় ঝুঁকি, তাই স্কোর সবচেয়ে বেশি কাটা হয়েছে।"]],
f=>[["No ongoing case found","কোনো চলমান মামলা পাওয়া যায়নি"],["An ongoing case exists on this land","এই জমিতে মামলা চলছে"],["A court case can change or cancel ownership after you have paid. Check the case status with a lawyer at the court or land office before any payment.","মামলার রায়ে টাকা দেওয়ার পরও মালিকানা বদলে যেতে বা বাতিল হতে পারে। কোনো টাকা দেওয়ার আগে আইনজীবীর মাধ্যমে আদালত বা ভূমি অফিসে মামলার অবস্থা দেখুন।"]],
f=>[["Not on the acquisition list","অধিগ্রহণ তালিকায় নেই"],["On the government acquisition list","সরকারি অধিগ্রহণ তালিকায় আছে"],["The government may take this land for a road, bridge or project. Confirm with the land office. Compensation and buyer rights may be limited.","সরকার রাস্তা, ব্রিজ বা প্রকল্পের জন্য এই জমি নিয়ে নিতে পারে। ভূমি অফিসে নিশ্চিত হোন। ক্রেতা হিসেবে ক্ষতিপূরণ ও অধিকার সীমিত হতে পারে।"]]];
const nmatch=(l,s)=>[l.o,l.oe].some(x=>norm(x)==norm(s));
const chk=(r,s)=>[[nmatch(r,s)?0:2,35],[r.n?0:1,15],[r.x?2:0,40],[r.c?2:0,30],[r.a?2:0,30]];
function mk(land,k,d,s,u){
  const r={px:plotSnap(k,d),id:db.nid++,uid:u.id,un:u.name,k,d,s,date:new Date().toLocaleString("bn-BD"),f:null,items:[],score:null,status:"Not Verified"};
  if(land){r.f={o:land.o,oe:land.oe,m:land.m,me:land.me};r.items=chk(land,s);
    r.score=Math.max(0,100-r.items.reduce((a,x)=>a+(x[0]?x[1]:0),0));
    const mx=Math.max(...r.items.map(x=>x[0]));r.status=mx==2?"Risk Found":mx==1?"Warning":"Pass"}
  return r}
const ic=["✅","⚠️","❌"];
function whyHTML(r){return `<div class="why">${r.items.map((x,i)=>{const w=W[i](r.f);
  return `<div class="wr"><b>${ic[x[0]]} ${t(...RN[i])}${x[0]?` (−${x[1]})`:""}</b><br>${esc(t(...w[x[0]?1:0]))}${x[0]?`<br><i>${esc(t(...w[2]))}</i>`:""}</div>`}).join("")}
  <p class="mut small">${t("Score = 100 minus the points shown for each problem. The Status uses the worst result, so one ❌ always means Risk Found.","স্কোর = ১০০ থেকে প্রতিটি সমস্যার কাটা পয়েন্ট বাদ। Status সবচেয়ে খারাপ ফলাফল ধরে হয়, তাই একটি ❌ থাকলেই Risk Found।")}</p></div>`}
const repHTML=r=>{const f=r.f;
  const rows=f?r.items.map((x,i)=>`<tr><td>${ic[x[0]]}</td><td>${t(...RN[i])}</td><td style="white-space:normal">${esc(t(...W[i](f)[x[0]?1:0]))}</td></tr>`).join(""):"";
  return `<div class="card rep"><h2>${t("Verification Report","যাচাই রিপোর্ট")} #${r.id}</h2>
<p class="mut small">${esc(r.date)} — ${esc(r.un)}</p>
<p>${t("Khatian","খতিয়ান")}: <b>${esc(r.k)}</b> &nbsp; ${t("Dag","দাগ")}: <b>${esc(r.d)}</b> &nbsp; ${t("Mouza","মৌজা")}: ${esc(f?t(f.me,f.m):"-")} &nbsp; ${t("Seller","বিক্রেতা")}: <b>${esc(r.s)}</b></p>
<p><span class="badge b-${cls[r.status]}">${sn(r.status)}</span>${r.score==null?"":`<span class="score">${r.score}/100</span>`}</p>
<p class="disc">⚠️ ${t(...DIS)}</p>
${f?`<div class="wrap"><table><tr><th></th><th>Check</th><th>${t("Reason","কারণ")}</th></tr>${rows}</table></div>
<p><button class="noprint" onclick="why=!why;R()">${why?"▲":"▼"} ${t("Why this result?","কেন এই ফলাফল?")}</button></p>${why?whyHTML(r):""}`
:`<p>${t("No record found for this khatian and dag number. Check the numbers and try again.","এই খতিয়ান ও দাগ নম্বরে কোনো record পাওয়া যায়নি। নম্বর দেখে আবার চেষ্টা করুন।")}</p>`}
${extraHTML(r)}
<p class="mut small">${t("Demo data. Not an official land record.","ডেমো তথ্য। সরকারি ভূমি রেকর্ড নয়।")}</p>
<button class="noprint" onclick="window.print()">🖨️ ${t("Print / PDF","প্রিন্ট / PDF")}</button></div>`};
const repTable=(list,all)=>list.length?`<div class="wrap"><table><tr><th>${t("Date","তারিখ")}</th>${all?"<th>User</th>":""}<th>${t("Khatian/Dag","খতিয়ান/দাগ")}</th><th>Status</th><th>Score</th><th></th></tr>${list.map(r=>`<tr><td>${esc(r.date)}</td>${all?`<td>${esc(r.un)}</td>`:""}<td>${esc(r.k)}/${esc(r.d)}</td><td><span class="badge b-${cls[r.status]}">${sn(r.status)}</span></td><td>${r.score??"-"}</td><td><button onclick="view(${r.id})">${t("View","দেখুন")}</button></td></tr>`).join("")}</table></div>`:`<p class="mut">${t("No reports yet.","এখনো কোনো report নেই।")}</p>`;
const langBtn=()=>`<span class="lang noprint"><button class="${db.lang=="en"?"on":""}" onclick="setLang('en')">English</button> <button class="${db.lang=="bn"?"on":""}" onclick="setLang('bn')">বাংলা</button></span>`;
let RST=null,dm={check:-1,plots:-1,sb:-1};
const togglePw=(id,b)=>{const i=$(id),s=i.type=="password";i.type=s?"text":"password";b.textContent=s?t("Hide","লুকান"):t("Show","দেখান")};
function useAcc(e,p){$("em").value=e;$("pw").value=p}
function authView(){
  const pw=(id,l)=>`<label>${l}</label><div class="pw"><input id="${id}" type="password"><button type="button" onclick="togglePw('${id}',this)">${t("Show","দেখান")}</button></div>`,
  em=`<label>Email</label><input id="em" type="email">`,err=`<p class="${msg[0]=="✔"?"okc":"rk"} small">${esc(msg)}</p>`;let b;
  if(mode=="forgot")b=`<h2>${t("Forgot password","পাসওয়ার্ড ভুলে গেছেন?")}</h2>${em}${err}<button class="pri" onclick="forgot()">${t("Get reset code","রিসেট কোড নিন")}</button> <button onclick="mode='login';msg='';R()">${t("Back","ফিরে যান")}</button>`;
  else if(mode=="reset")b=`<h2>${t("Set a new password","নতুন পাসওয়ার্ড দিন")}</h2><p class="plain small">${RST&&RST.ok?`${t("Demo reset code","ডেমো রিসেট কোড")}: <b>${RST.code}</b><br><span class="mut">${t("In the final version this code is sent to your email.","চূড়ান্ত সংস্করণে এই কোড আপনার ইমেইলে যাবে।")}</span>`:t("If this email is registered, a code has been sent.","এই ইমেইল নিবন্ধিত থাকলে একটি কোড পাঠানো হয়েছে।")}</p><label>${t("Reset code","রিসেট কোড")}</label><input id="rc">${pw("pw",t("New password","নতুন পাসওয়ার্ড"))}${err}<button class="pri" onclick="resetPw()">${t("Save password","পাসওয়ার্ড সংরক্ষণ")}</button>`;
  else b=`<div class="tabs"><button class="${mode=="login"?"on":""}" onclick="mode='login';msg='';R()">${t("Login","লগইন")}</button><button class="${mode=="reg"?"on":""}" onclick="mode='reg';msg='';R()">${t("Register","রেজিস্টার")}</button></div>
  ${mode=="reg"?`<label>${t("Name","নাম")}</label><input id="nm">`:""}${em}${pw("pw","Password")}
  ${mode=="login"?`<p class="small"><a href="#" onclick="mode='forgot';msg='';R();return false">${t("Forgot password?","পাসওয়ার্ড ভুলে গেছেন?")}</a></p>`:""}${err}
  <button class="pri" onclick="${mode=="reg"?"reg()":"login()"}">${mode=="reg"?t("Create account","একাউন্ট তৈরি করুন"):t("Login","লগইন করুন")}</button>
  ${mode=="login"?`<div class="plain small" style="margin-top:12px"><b>${t("Demo accounts","ডেমো অ্যাকাউন্ট")}</b><br>Admin: admin@demo.com / admin123 <button onclick="useAcc('admin@demo.com','admin123')">${t("Use","দিন")}</button><br>User: 252-15-856@diu.edu.bd / land123 <button onclick="useAcc('252-15-856@diu.edu.bd','land123')">${t("Use","দিন")}</button></div>`:""}`;
  return `<div class="card narrow"><div class="top"><div class="hero"><h1>🏡 Land Buy Checker</h1><span class="mut">${t("Check land risk in 1 minute","১ মিনিটে জমির ঝুঁকি যাচাই")}</span></div>${langBtn()}</div>${b}</div>`}
function forgot(){const em=$("em").value.trim().toLowerCase(),u=db.users.find(x=>x.email==em);
  if(!em){msg=t("Enter your email","ইমেইল দিন");return R()}
  if(u&&u.role=="admin"){msg=t("Admin password cannot be reset here.","অ্যাডমিনের পাসওয়ার্ড এখানে রিসেট করা যায় না।");return R()}
  RST={email:em,code:String(Math.floor(100000+Math.random()*900000)),ok:!!u};mode="reset";msg="";R()}
function resetPw(){const c=$("rc").value.trim(),p=$("pw").value;
  if(!RST||!RST.ok||c!=RST.code){msg=t("Wrong code or email not registered.","কোড ভুল বা ইমেইল নিবন্ধিত নয়।");return R()}
  if(p.length<6){msg=t("Password must be at least 6 characters.","পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");return R()}
  db.users.find(x=>x.email==RST.email).pass=p;RST=null;save();mode="login";msg="✔ "+t("Password changed. Please login.","পাসওয়ার্ড বদলেছে। এখন লগইন করুন।");R()}
function shell(u){const T0=u.role=="admin"?[["dash",t("Dashboard","ড্যাশবোর্ড")],["lands",t("Land Records","জমির রেকর্ড")],["all",t("All Reports","সব রিপোর্ট")],["check",t("Check Land","জমি যাচাই")]]:[["check",t("Check Land","জমি যাচাই")],["mine",t("My Reports","আমার রিপোর্ট")]];const T=mkTabs(u,T0);
return `<div class="bar2 noprint"><div class="brand">🏡 <b>Land Buy Checker</b><span>${t("Check land risk in 1 minute","১ মিনিটে জমির ঝুঁকি যাচাই")}</span></div><div>${langBtn()} <span class="small">${esc(u.name)} · ${u.role}</span> <button onclick="logout()">${t("Logout","লগআউট")}</button></div></div>
<div class="tabs noprint">${T.map(x=>`<button class="${tab==x[0]?"on":""}" onclick="go('${x[0]}')">${x[1]}</button>`).join("")}</div>${body(u)}`}
function body(u){
  const X=extraBody(u);if(X!=null)return X;
  if(tab=="check")return `<div class="card noprint"><h2>${t("Check a land","জমি যাচাই করুন")}</h2><div class="row"><div><label>${t("Khatian no.","খতিয়ান নম্বর")}</label><input id="k"></div><div><label>${t("Dag no.","দাগ নম্বর")}</label><input id="d"></div><div><label>${t("Seller name (Bangla or English)","বিক্রেতার নাম (বাংলা বা English)")}</label><input id="s"></div></div>
  <p class="rk small">${esc(msg)}</p><button class="pri" onclick="run()">${t("Check now","যাচাই করুন")}</button>
  </div>${demoBox("check")}${cur?repHTML(cur)+nextDemo("check"):""}`;
  if(tab=="mine"||tab=="all"){
    if(cur)return `<button class="noprint" onclick="cur=null;why=false;R()">← ${t("Back","ফিরে যান")}</button>`+repHTML(cur);
    const list=tab=="all"?db.reports:db.reports.filter(r=>r.uid==u.id);
    return `<div class="card"><h2>${tab=="all"?t("All user reports","সব user-এর রিপোর্ট"):t("My report history","আমার রিপোর্ট History")}</h2>${repTable(list,tab=="all")}</div>`}
  if(tab=="dash"){const n=db.reports.length,cnt=s=>db.reports.filter(r=>r.status==s).length,
    st=[[t("Users","User"),db.users.filter(x=>x.role=="user").length],[t("Land records","জমির রেকর্ড"),db.lands.length],[t("Total reports","মোট রিপোর্ট"),n],[sn("Risk Found"),cnt("Risk Found")],[t("Demo plots","ডেমো প্লট"),db.plots.length],[t("Setback rules","সেটব্যাক নিয়ম"),db.rules.length]];
    return `<div class="grid">${st.map(x=>`<div class="card"><div class="mut small">${x[0]}</div><div class="big">${x[1]}</div></div>`).join("")}</div>
    <div class="card"><h2>${t("Report status","রিপোর্টের Status")}</h2>${Object.keys(cls).map(s=>`<div class="small">${sn(s)}: ${cnt(s)}</div><div class="bar b-${cls[s]}" style="width:${n?cnt(s)/n*100:0}%"></div>`).join("")}</div>`}
  if(tab=="lands"){const e=db.lands.find(l=>l.id==edit)||{};
    const F=[["lk",t("Khatian","খতিয়ান"),e.k],["ld",t("Dag","দাগ"),e.d],["lm","মৌজা (বাংলা)",e.m],["lme","Mouza (English)",e.me],["lo","মালিক (বাংলা)",e.o],["loe","Owner (English)",e.oe]];
    return `<div class="card"><h2>${edit?t("Edit record","রেকর্ড Edit করুন"):t("New land record","নতুন জমির রেকর্ড")}</h2><div class="row">${F.map(c=>`<div><label>${c[1]}</label><input id="${c[0]}" value="${esc(c[2])}"></div>`).join("")}</div>
    <p>${[["ln",t("Namjari done","নামজারি হয়েছে"),e.n],["lx",t("Khas land","খাস জমি"),e.x],["lc",t("Ongoing case","চলমান মামলা"),e.c],["la",t("On acquisition list","অধিগ্রহণ তালিকায়"),e.a]].map(c=>`<label class="chk"><input type="checkbox" id="${c[0]}" ${c[2]?"checked":""}> ${c[1]}</label>`).join("")}</p>
    <p class="rk small">${esc(msg)}</p><button class="pri" onclick="saveLand()">${t("Save","Save করুন")}</button> ${edit?`<button onclick="edit=null;R()">${t("Cancel","বাতিল")}</button>`:""}</div>
    <div class="card"><h2>${t("Land records","জমির রেকর্ড")} (${db.lands.length})</h2><div class="wrap"><table><tr><th>${t("Khatian","খতিয়ান")}</th><th>${t("Dag","দাগ")}</th><th>${t("Mouza","মৌজা")}</th><th>${t("Owner","মালিক")}</th><th>${t("Namjari/Khas/Case/Acq.","নামজারি/খাস/মামলা/অধি.")}</th><th></th></tr>${db.lands.map(l=>`<tr><td>${esc(l.k)}</td><td>${esc(l.d)}</td><td>${esc(t(l.me,l.m))}</td><td>${esc(l.o)} / ${esc(l.oe)}</td><td>${[l.n,l.x,l.c,l.a].map(v=>v?"✔":"–").join(" ")}</td><td><button onclick="edit=${l.id};msg='';R()">Edit</button> <button onclick="delLand(${l.id})">${t("Delete","মুছুন")}</button></td></tr>`).join("")}</table></div></div>`}
}
function R(){const u=me();$("app").innerHTML=u?shell(u):authView()}
function setLang(l){db.lang=l;save();R()}
function go(x){dm={check:-1,plots:-1,sb:-1};tab=x;cur=null;edit=null;msg="";why=false;Q={};RES={st:"idle",list:[],err:""};ep=null;er=null;R()}
function view(id){cur=db.reports.find(r=>r.id==id);why=false;R()}
function enter(u){db.me=u.id;tab=u.role=="admin"?"dash":"check";cur=null;edit=null;msg="";why=false;save();R()}
function login(){const em=$("em").value.trim().toLowerCase(),u=db.users.find(x=>x.email==em&&x.pass==$("pw").value);
  if(!u){msg=t("Wrong email or password","Email বা password ভুল");return R()}enter(u)}
function reg(){const nm=$("nm").value.trim(),em=$("em").value.trim().toLowerCase(),pw=$("pw").value;
  if(!nm||!em||pw.length<6){msg=t("Enter name, email and a password of 6+ characters","নাম, email এবং কমপক্ষে ৬ অক্ষরের password দিন");return R()}
  if(db.users.some(x=>x.email==em)){msg=t("This email is already used","এই email আগেই ব্যবহার হয়েছে");return R()}
  const u={id:db.nid++,name:nm,email:em,pass:pw,role:"user"};db.users.push(u);enter(u)}
function logout(){db.me=null;save();R()}
function run(){const k=en($("k").value),d=en($("d").value),s=$("s").value.trim();
  if(!k||!d||!s){msg=t("Fill all three fields","তিনটি ঘরই পূরণ করুন");return R()}
  msg="";why=false;const land=db.lands.find(l=>l.k==k&&l.d==d);cur=mk(land,k,d,s,me());db.reports.unshift(cur);save();R()}
function saveLand(){const g=i=>$(i).value.trim(),c=i=>$(i).checked?1:0,
  o={k:en(g("lk")),d:en(g("ld")),m:g("lm"),me:g("lme"),o:g("lo"),oe:g("loe"),n:c("ln"),x:c("lx"),c:c("lc"),a:c("la")};
  if(!o.k||!o.d||!o.o||!o.oe){msg=t("Khatian, dag and owner name (both languages) are required","খতিয়ান, দাগ ও মালিকের নাম (দুই ভাষায়) দিতে হবে");return R()}
  o.m=o.m||o.me;o.me=o.me||o.m;
  if(edit)Object.assign(db.lands.find(l=>l.id==edit),o);else db.lands.push({id:db.nid++,...o});
  edit=null;msg="";save();R()}
function delLand(id){db.lands=db.lands.filter(l=>l.id!=id);save();R()}
// ===================== Feature 1 & 2: Plot Info + Setback Guide =====================
// ডেটা "English|বাংলা" format-এ রাখা হয়েছে। সব ডেটা DEMO। Real API বসাতে শুধু SRC object বদলাতে হবে।
const bi=s=>{const a=String(s??"").split("|");return t(a[0],a[1]||a[0])};
const UN={dec:["decimal (shatak)","শতক"],katha:["katha","কাঠা"],bigha:["bigha","বিঘা"]};
const SVO=[["CS","CS"],["SA","SA"],["RS","RS"],["BS","BS / BRS"],["OT","Other"]];
const svl=c=>c=="OT"?t("Other","অন্যান্য"):(SVO.find(s=>s[0]==c)||[0,c])[1];
const GZ="Gazipur|গাজীপুর",DK="Dhaka|ঢাকা",SV_="Savar|সাভার",ASH="Ashulia|আশুলিয়া",DHM="Dhamrai|ধামরাই",GS="Gazipur Sadar|গাজীপুর সদর",KR="Keraniganj|কেরানীগঞ্জ",NS="Narayanganj Sadar|নারায়ণগঞ্জ সদর",NG="Narayanganj|নারায়ণগঞ্জ",CT="Chattogram|চট্টগ্রাম",HZ="Hathazari|হাটহাজারী",RJ="Rajshahi|রাজশাহী",PB="Paba|পবা",
UP="Union Parishad|ইউনিয়ন পরিষদ",PZ="Pourashava|পৌরসভা",CC="City Corporation|সিটি কর্পোরেশন",RH="Roads and Highways Dept|সড়ক ও জনপথ অধিদপ্তর",LG="LGED|স্থানীয় সরকার প্রকৌশল অধিদপ্তর (এলজিইডি)";
const rd=(e,b,w,a,s)=>[e+"|"+b,w,a,s];
// ২০টি ডেমো প্লট: [বিভাগ, জেলা, উপজেলা, মৌজা, জরিপ, খতিয়ান, দাগ, পরিমাণ, একক, ম্যাপ, রাস্তা]
const SEEDP=[
[DK,DK,SV_,SV_,"RS","101","12",5.5,"dec","Demo Sheet 12",rd("Union road","ইউনিয়ন সড়ক",20,UP,"demo")],
[DK,DK,SV_,SV_,"BS","102","15",3,"katha",null,rd("Link road","সংযোগ সড়ক",null,null,"unverified")],
[DK,DK,SV_,ASH,"SA","103","20",12,"dec","Demo Sheet 7",rd("Highway service road","হাইওয়ের সার্ভিস রোড",30,RH,"demo")],
[DK,DK,SV_,ASH,"CS","104","8",2.5,"katha",null,rd("Private lane","ব্যক্তিগত গলি",10,null,"unverified")],
[DK,DK,DHM,DHM,"RS","105","30",8,"dec","Demo Sheet 3",rd("Municipal road","পৌর সড়ক",40,PZ,"demo")],
[DK,DK,DHM,DHM,"BS","106","5",4,"katha",null,null],
[DK,GZ,GS,GS,"RS","107","41",6,"dec","Demo Sheet 21",rd("Municipal road","পৌর সড়ক",24,PZ,"demo")],
[DK,GZ,GS,GS,"CS","108","22",10,"dec",null,rd("City road","শহরের সড়ক",18,CC,"demo")],
[DK,DK,KR,KR,"BS","109","9",3,"katha","Demo Sheet 5",rd("Link road","সংযোগ সড়ক",16,LG,"demo")],
[DK,DK,KR,KR,"RS","110","17",5,"dec",null,rd("Feeder road","ফিডার রোড",null,LG,"unverified")],
[DK,NG,NS,NS,"SA","111","33",15,"dec","Demo Sheet 9",rd("City road","শহরের সড়ক",45,CC,"demo")],
[DK,NG,NS,NS,"BS","112","27",2,"katha",null,rd("Narrow lane","সরু গলি",8,CC,"demo")],
[DK,"Munshiganj|মুন্সীগঞ্জ","Munshiganj Sadar|মুন্সীগঞ্জ সদর","Bhabanipur|ভবানীপুর","CS","113","4",20,"dec","Demo Sheet 2",rd("Rural road","গ্রামীণ সড়ক",14,UP,"demo")],
[DK,"Narsingdi|নরসিংদী","Narsingdi Sadar|নরসিংদী সদর","Karimpur|করিমপুর","RS","114","18",7,"dec",null,rd("Union road","ইউনিয়ন সড়ক",26,UP,"demo")],
[DK,"Tangail|টাঙ্গাইল","Tangail Sadar|টাঙ্গাইল সদর","Rampur|রামপুর","BS","115","6",5,"katha","Demo Sheet 14",rd("Municipal road","পৌর সড়ক",12,PZ,"demo")],
[CT,CT,HZ,"Fatehpur|ফতেপুর","SA","116","11",1.5,"bigha",null,rd("Highway service road","হাইওয়ের সার্ভিস রোড",36,RH,"demo")],
[CT,CT,HZ,"Alipur|আলীপুর","RS","117","25",9,"dec","Demo Sheet 8",rd("Link road","সংযোগ সড়ক",22,LG,"demo")],
[RJ,RJ,PB,"Shantipur|শান্তিপুর","BS","118","3",6,"katha",null,null],
[RJ,RJ,PB,"Gopalpur|গোপালপুর","CS","119","14",18,"dec","Demo Sheet 11",rd("Union road","ইউনিয়ন সড়ক",10,UP,"demo")],
["Khulna|খুলনা","Khulna|খুলনা","Dumuria|ডুমুরিয়া","Nayapara|নয়াপাড়া","RS","120","29",4,"katha","Demo Sheet 6",rd("Municipal road","পৌর সড়ক",30,PZ,"demo")]]
.map((r,i)=>({id:i+1,dv:r[0],ds:r[1],up:r[2],mz:r[3],sv:r[4],k:r[5],d:r[6],area:r[7],unit:r[8],map:r[9],src:"demo",
 road:r[10]?{type:r[10][0],width:r[10][1],auth:r[10][2],st:r[10][3]}:null}));
// ২০টি ডেমো সেটব্যাক নিয়ম (ILLUSTRATIVE, আইন নয়): ৫ কর্তৃপক্ষ × ৪ রাস্তার প্রস্থ-ধাপ (ft)
const BAND=[[0,12],[12,24],[24,40],[40,999]],SEEDR=[];
[[UP,[[4,2,2],[6,3,3],[8,4,4],[10,5,5]]],[PZ,[[5,3,3],[8,4,4],[10,5,5],[15,6,6]]],[CC,[[6,3,3],[9,4,4],[12,5,5],[15,6,6]]],[RH,[[10,4,4],[12,5,5],[15,6,6],[20,8,8]]],[LG,[[5,2.5,2.5],[8,3,3],[10,4,4],[12,5,5]]]]
.forEach(a=>a[1].forEach((x,i)=>SEEDR.push({id:SEEDR.length+1,auth:a[0],min:BAND[i][0],max:BAND[i][1],f:x[0],s:x[1],b:x[2],st:"demo"})));
if(db.seedv!=2){db.plots=SEEDP;db.rules=SEEDR;db.seedv=2;save()}
if(!db.lands.some(l=>l.k=="113"&&l.d=="4")){db.lands.push({id:db.nid++,k:"113",d:"4",m:"ভবানীপুর",me:"Bhabanipur",o:"নাসরিন আক্তার",oe:"Nasrin Akter",n:0,x:0,c:0,a:0});save()}
let Q={},RES={st:"idle",list:[],err:""},ep=null,er=null;
// ---- Data source: এখানে পরে real API / verified database বসবে (যেমন fetch("/api/plots")) ----
const SRC={
  async plots(q){await new Promise(r=>setTimeout(r,250));const n=norm;
    return db.plots.filter(p=>(!q.dv||p.dv==q.dv)&&(!q.ds||p.ds==q.ds)&&(!q.up||p.up==q.up)&&(!q.mz||n(p.mz).includes(n(q.mz)))&&(!q.sv||p.sv==q.sv)&&(!q.k||p.k==en(q.k))&&(!q.d||p.d==en(q.d)))},
  guard(role){const u=me();if(!u||u.role!=role)throw new Error("403")} // real backend-এ এটা server middleware হবে
};
// setback guidance: তথ্য যাচাইযোগ্য না হলে অনুমান করা হয় না → Verification Required
const ae=a=>String(a||"").split("|")[0].trim().toLowerCase(),fr=r=>db.rules.find(x=>ae(x.auth)==ae(r.auth)&&r.width>=x.min&&r.width<x.max);
function guide(p){const r=p.road,why=[];
  if(!r)why.push(t("No road information is recorded for this plot.","এই প্লটের রাস্তার কোনো তথ্য রেকর্ডে নেই।"));
  else{if(r.width==null)why.push(t("Road width is not recorded.","রাস্তার প্রস্থ রেকর্ডে নেই।"));
    if(!r.auth)why.push(t("Road owner / responsible authority is not recorded.","রাস্তার মালিক বা দায়িত্বপ্রাপ্ত কর্তৃপক্ষ রেকর্ডে নেই।"));
    if(r.width!=null&&r.auth&&!fr(r))why.push(t("No demo rule is available for this road authority and width.","এই কর্তৃপক্ষ ও রাস্তার প্রস্থের জন্য কোনো ডেমো নিয়ম নেই।"))}
  if(why.length)return{ok:false,why};
  return{ok:true,rule:fr(r)}}
function plotSnap(k,d){const p=db.plots.find(x=>x.k==k&&x.d==d);if(!p)return null;const g=guide(p);
  return{mz:p.mz,sv:p.sv,area:p.area,unit:p.unit,map:p.map,rd:p.road?{type:p.road.type,width:p.road.width,auth:p.road.auth}:null,g:g.ok?{f:g.rule.f,s:g.rule.s,b:g.rule.b}:null}}
const DEMO=()=>`<span class="badge b-wn">${t("Demo Data — Not Official Land Records","ডেমো ডেটা — সরকারি ভূমি রেকর্ড নয়")}</span>`;
const VR=()=>`<span class="badge b-rk">${t("Verification Required","যাচাই প্রয়োজন")}</span>`;
const GL=[["Mouza","মৌজা","Your village or area, as the government writes it. Land records are kept mouza by mouza, like files in separate folders.","সরকারি খাতায় আপনার গ্রাম বা এলাকার নাম। জমির রেকর্ড মৌজা ধরে আলাদা আলাদা ফাইলে রাখা হয়।"],
["Khatian","খতিয়ান","The government's record page for land. It says whose land it is and how much land it is.","জমির সরকারি খাতার পাতা। এখানে লেখা থাকে জমি কার এবং কতটুকু।"],
["Dag (plot)","দাগ","The number of one piece of land, just like a house number. One khatian can have many dags.","একটুকরো জমির নম্বর, অনেকটা বাড়ির হোল্ডিং নম্বরের মতো। এক খতিয়ানে অনেক দাগ থাকতে পারে।"],
["Survey type (CS, SA, RS, BS)","জরিপের ধরন (CS, SA, RS, BS)","Every few decades the government measures all land again and makes new record books. Each round has a name: CS, SA, RS, BS. The numbers change in each round, so always ask which round your number is from.","সরকার কয়েক দশক পর পর সব জমি আবার মেপে নতুন খাতা বানায়। প্রতিবারের নাম CS, SA, RS, BS। প্রতিবার নম্বর বদলে যায়, তাই আপনার নম্বরটি কোন জরিপের তা জেনে নিন।"],
["Demo Data","ডেমো ডেটা","Practice data made for this competition. It is not a real government record.","এই প্রতিযোগিতার জন্য বানানো অনুশীলনের তথ্য। এটি সরকারের আসল রেকর্ড নয়।"],
["Verification Required","যাচাই প্রয়োজন","The information is missing or not sure. We do not guess. Please ask the land office.","তথ্য নেই বা নিশ্চিত নয়। আমরা অনুমান করি না। ভূমি অফিসে জিজ্ঞেস করুন।"]];
const glossHTML=()=>`<details class="card"><summary><b>${t("What do these terms mean?","এই শব্দগুলোর মানে কী?")}</b></summary>${GL.map(g=>`<p><b>${t(g[0],g[1])}</b>: ${t(g[2],g[3])}</p>`).join("")}</details>`;
const opt=(v,s,l)=>`<option value="${esc(v)}" ${s?"selected":""}>${esc(l)}</option>`;
function searchForm(){const P=db.plots,U=a=>[...new Set(a)],
  dvs=U(P.map(p=>p.dv)),dss=U(P.filter(p=>!Q.dv||p.dv==Q.dv).map(p=>p.ds)),ups=U(P.filter(p=>(!Q.dv||p.dv==Q.dv)&&(!Q.ds||p.ds==Q.ds)).map(p=>p.up)),
  sel=(key,list,ph)=>`<div><label>${ph}</label><select onchange="setQ('${key}',this.value)"><option value="">${t("— Select —","— বাছাই করুন —")}</option>${list.map(v=>opt(v,Q[key]==v,bi(v))).join("")}</select></div>`,
  inp=(key,lab)=>`<div><label>${lab}</label><input value="${esc(Q[key])}" oninput="Q.${key}=this.value"></div>`;
  return `<div class="card noprint"><div class="row">${sel("dv",dvs,t("Division","বিভাগ"))}${sel("ds",dss,t("District","জেলা"))}${sel("up",ups,t("Upazila","উপজেলা"))}${inp("mz",t("Mouza name","মৌজার নাম"))}
  <div><label>${t("Survey type","জরিপের ধরন")}</label><select onchange="Q.sv=this.value"><option value="">${t("— Any —","— যেকোনো —")}</option>${SVO.map(s=>opt(s[0],Q.sv==s[0],svl(s[0]))).join("")}</select></div>
  ${inp("k",t("Khatian no.","খতিয়ান নম্বর"))}${inp("d",t("Dag / Plot no.","দাগ / প্লট নম্বর"))}</div>
  <p><button class="pri" onclick="doSearch()">${t("Search","খুঁজুন")}</button> <button onclick="Q={};RES={st:'idle',list:[],err:''};R()">${t("Clear","মুছুন")}</button></p></div>`}
function setQ(k,v){Q[k]=v;if(k=="dv"){Q.ds="";Q.up=""}if(k=="ds")Q.up="";R()}
async function doSearch(){const q=Q;
  if(!q.mz&&!(q.k&&q.d)){RES={st:"err",list:[],err:t("Enter a mouza name, or both Khatian and Dag number.","মৌজার নাম দিন, অথবা খতিয়ান ও দাগ নম্বর দুটোই দিন।")};return R()}
  if((q.k&&!/^\d+$/.test(en(q.k)))||(q.d&&!/^\d+$/.test(en(q.d)))){RES={st:"err",list:[],err:t("Khatian and Dag must be numbers only.","খতিয়ান ও দাগ শুধু সংখ্যা হতে হবে।")};return R()}
  RES={st:"load",list:[],err:""};R();
  try{RES={st:"ok",list:await SRC.plots(q),err:""}}catch(e){RES={st:"err",list:[],err:t("Something went wrong. Please try again.","কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।")}}
  R()}
function resHTML(fn){
  if(RES.st=="idle")return `<p class="mut">${t("Enter details and press Search.","তথ্য দিয়ে “খুঁজুন” চাপুন।")}</p>`;
  if(RES.st=="load")return `<p class="mut">⏳ ${t("Searching…","খোঁজা হচ্ছে…")}</p>`;
  if(RES.st=="err")return `<p class="rk">${esc(RES.err)}</p>`;
  if(!RES.list.length)return `<div class="card">${t("No matching record found in the demo data. This does not mean the land is invalid. Check the numbers or ask the land office.","ডেমো ডেটায় কোনো মিল পাওয়া যায়নি। এর মানে এই নয় যে জমি অবৈধ। নম্বর আবার দেখুন বা ভূমি অফিসে জিজ্ঞেস করুন।")}</div>`;
  return RES.list.map(fn).join("")}
const diag=p=>`<svg viewBox="0 0 200 105" width="100%" style="max-width:260px;color:var(--tx)"><rect x="30" y="12" width="140" height="62" fill="none" stroke="currentColor" stroke-dasharray="4 3"/><text x="100" y="46" text-anchor="middle" font-size="9" fill="currentColor">${t("Plot","প্লট")} ${esc(p.k)}/${esc(p.d)}</text>${p.road?`<rect x="30" y="82" width="140" height="13" fill="#9ca3af"/><text x="100" y="91.5" text-anchor="middle" font-size="7" fill="#fff">${t("Road side (illustrative)","রাস্তার দিক (উদাহরণ)")}</text>`:""}</svg><div class="mut small">${t("Illustrative diagram only. Not an official map or survey drawing.","শুধু উদাহরণ চিত্র। এটি সরকারি ম্যাপ বা জরিপ নকশা নয়।")}</div>`;
const plotCard=p=>`<div class="card"><div class="top"><h2>${bi(p.mz)} — ${t("Khatian","খতিয়ান")} ${esc(p.k)} / ${t("Dag","দাগ")} ${esc(p.d)}</h2>${DEMO()}</div>
<p class="plain">💬 ${plainPlot(p)}</p>
<div class="grid" style="margin:8px 0">${[[t("Division","বিভাগ"),bi(p.dv)],[t("District","জেলা"),bi(p.ds)],[t("Upazila","উপজেলা"),bi(p.up)],[t("Mouza","মৌজা"),bi(p.mz)],[t("Survey type","জরিপের ধরন"),svl(p.sv)],[t("Recorded area","রেকর্ডকৃত পরিমাণ"),`${p.area} ${t(...UN[p.unit])}`],[t("Map reference","ম্যাপ রেফারেন্স"),p.map?p.map+" (demo)":t("Not available","পাওয়া যায়নি")]].map(x=>`<div><div class="mut small">${x[0]}</div><b>${esc(x[1])}</b></div>`).join("")}</div>
${p.map?"":`<p class="disc">${t("No map data for this plot. Showing an illustrative diagram only.","এই প্লটের ম্যাপ তথ্য নেই। শুধু একটি উদাহরণ চিত্র দেখানো হলো।")}</p>`}${diag(p)}
<p class="mut small">${t("Ownership is not shown and has not been verified by this tool.","এই tool-এ মালিকানা দেখানো বা যাচাই করা হয়নি।")}</p>
<button onclick="toSB(${p.id})">${t("Road & setback guide for this plot","এই প্লটের রাস্তা ও সেটব্যাক গাইড")}</button></div>`;
function toSB(id){const p=db.plots.find(x=>x.id==id);tab="sb";Q={k:p.k,d:p.d};RES={st:"ok",list:[p],err:""};R()}
const sbCard=p=>{const r=p.road,g=guide(p),st=r?(r.st=="verified"?t("Verified","যাচাইকৃত"):r.st=="demo"?t("Demo / illustrative","ডেমো / উদাহরণ"):t("Unverified","অযাচাইকৃত")):"";
  const info=r?[[t("Road type","রাস্তার ধরন"),bi(r.type)],[t("Recorded width","রেকর্ডকৃত প্রস্থ"),r.width==null?t("Not recorded","রেকর্ডে নেই"):r.width+" ft"],[t("Owner / authority","মালিক / কর্তৃপক্ষ"),r.auth?bi(r.auth):t("Not recorded","রেকর্ডে নেই")],[t("Source status","তথ্যের অবস্থা"),st]]:[];
  return `<div class="card"><div class="top"><h2>${bi(p.mz)} — ${esc(p.k)} / ${esc(p.d)}</h2>${DEMO()}</div>
  <p class="plain">💬 ${plainSB(p,g)}</p><h3>${t("Adjacent road","পাশের রাস্তা")}</h3>${r?`<div class="grid" style="margin:6px 0">${info.map(x=>`<div><div class="mut small">${x[0]}</div><b>${esc(x[1])}</b></div>`).join("")}</div>`:`<p>${VR()}</p>`}
  <h3>${t("Setback guidance (front / side / rear)","সেটব্যাক গাইড (সামনে / পাশে / পেছনে)")}</h3>
  ${g.ok?`<div class="grid" style="margin:6px 0">${[[t("Front","সামনে"),g.rule.f],[t("Side","পাশে"),g.rule.s],[t("Rear","পেছনে"),g.rule.b]].map(x=>`<div class="card" style="text-align:center"><div class="mut small">${x[0]}</div><div class="big">${x[1]} ft</div></div>`).join("")}</div>
  <p class="disc">${t("Illustrative demo rule only. Not legal advice and not building approval. The real requirement may differ. Confirm with the responsible authority.","শুধু উদাহরণ নিয়ম। এটি আইনি পরামর্শ বা ভবন অনুমোদন নয়। আসল নিয়ম ভিন্ন হতে পারে। দায়িত্বপ্রাপ্ত কর্তৃপক্ষের কাছে নিশ্চিত হোন।")}</p>`
  :`<p>${VR()}</p><ul>${g.why.map(w=>`<li>${w}</li>`).join("")}</ul><p class="mut small">${t("We do not guess the road owner or the setback distance.","আমরা রাস্তার মালিক বা সেটব্যাকের দূরত্ব অনুমান করি না।")}</p>`}</div>`};
const FAC=[["Which area the plot is in","প্লটটি কোন এলাকায়"],["Which office looks after it (city corporation, pourashava, union parishad or development authority)","কোন অফিস দেখভাল করে (সিটি কর্পোরেশন, পৌরসভা, ইউনিয়ন পরিষদ বা উন্নয়ন কর্তৃপক্ষ)"],["How wide the road is","রাস্তা কত চওড়া"],["What kind of building and how many floors","কেমন ভবন ও কত তলা"],["How big the plot is","প্লট কত বড়"],["Which rules are in force now","এখন কোন নিয়ম চালু আছে"]];
const CHK=[["Latest khatian (porcha) and mouza map: get them from the land office","সর্বশেষ খতিয়ান (পর্চা) ও মৌজা ম্যাপ: ভূমি অফিস থেকে নিন"],["Deed, the earlier deeds, namjari record and land tax receipt: ask the seller and check","দলিল, আগের দলিল, নামজারির কাগজ ও খাজনার রসিদ: বিক্রেতার কাছে চান ও মিলিয়ে দেখুন"],["Who owns the road: ask Roads and Highways, LGED, union parishad, pourashava or city corporation. If it is a private road, check the deed","রাস্তার মালিক কে: সড়ক ও জনপথ, এলজিইডি, ইউনিয়ন পরিষদ, পৌরসভা বা সিটি কর্পোরেশনকে জিজ্ঞেস করুন। ব্যক্তিগত রাস্তা হলে দলিল দেখুন"],["Building rules: ask the building or development office of your area, and ask which building code is in force","বাড়ি বানানোর নিয়ম: আপনার এলাকার ভবন বা উন্নয়ন অফিসে জিজ্ঞেস করুন এবং কোন বিল্ডিং কোড চালু আছে জেনে নিন"],["Measure the land on the ground with a licensed surveyor","লাইসেন্সধারী সার্ভেয়ার দিয়ে জমি সরেজমিনে মাপিয়ে নিন"],["Talk to a lawyer before you pay any money","টাকা দেওয়ার আগে একজন আইনজীবীর সাথে কথা বলুন"]];
const setbackInfo=()=>`<div class="card"><h2>${t("What is setback?","সেটব্যাক কী?")}</h2><p>${t("When you build a house, you must leave some empty space between the building and the edge of your plot or the road. This empty space is called setback. Think of the yard or open space in front of a house.","বাড়ি বানানোর সময় ভবন আর আপনার প্লটের সীমানা বা রাস্তার মাঝখানে কিছুটা জায়গা খালি রাখতে হয়। এই খালি জায়গাকেই সেটব্যাক বলে। ভাবুন বাড়ির সামনের উঠান বা ফাঁকা জায়গার মতো।")}</p>
<p>${t("Front = towards the road. Side = towards the neighbour. Rear = at the back.","সামনে = রাস্তার দিকে। পাশে = প্রতিবেশীর দিকে। পেছনে = বাড়ির পেছনে।")}</p>
<p class="mut small">${t("The empty space is not the same everywhere. It depends on:","কতটা জায়গা খালি রাখতে হবে তা সব জায়গায় এক নয়। এটা নির্ভর করে:")}</p><ul>${FAC.map(f=>`<li>${t(...f)}</li>`).join("")}</ul></div>
<div class="card"><h2>${t("What to check and where to ask","কী যাচাই করবেন ও কোথায় জিজ্ঞেস করবেন")}</h2><ul style="list-style:none;padding-left:4px">${CHK.map(c=>`<li>☐ ${t(...c)}</li>`).join("")}</ul></div>`;
const howTo=()=>`<div class="plain"><b>${t("How to use","কীভাবে ব্যবহার করবেন")}</b><br>1. ${t("Choose division, district, upazila, or type the mouza name.","বিভাগ, জেলা, উপজেলা বাছুন, অথবা মৌজার নাম লিখুন।")}<br>2. ${t("Type the khatian number and the dag number.","খতিয়ান নম্বর ও দাগ নম্বর লিখুন।")}<br>3. ${t("Press “Search”. Or fill the form with a demo below.","“খুঁজুন” চাপুন। অথবা নিচের ডেমো দিয়ে ফর্ম পূরণ করুন।")}</div>`;
function plainPlot(p){const a=`${p.area} ${t(...UN[p.unit])}`;return t(`This is plot (dag) no. ${p.d} of khatian no. ${p.k} in ${bi(p.mz)} mouza. The recorded land is ${a}. ${p.map?"A map reference is available (demo).":"No map is available, so only a rough picture is shown."}`,`এটি ${bi(p.mz)} মৌজার ${p.k} নম্বর খতিয়ানের ${p.d} নম্বর দাগের জমি। রেকর্ডে জমির পরিমাণ ${a}। ${p.map?"ম্যাপের রেফারেন্স আছে (ডেমো)।":"ম্যাপ নেই, তাই শুধু একটা মোটামুটি ছবি দেখানো হলো।"}`)}
function plainSB(p,g){const r=p.road;if(!g.ok)return t("We cannot say how much open space is needed, because some road information is missing. We do not guess. Please ask the land office and the local authority.","রাস্তার কিছু তথ্য না থাকায় কতটা জায়গা খালি রাখতে হবে বলা যাচ্ছে না। আমরা অনুমান করি না। ভূমি অফিস ও স্থানীয় কর্তৃপক্ষকে জিজ্ঞেস করুন।");
  const R=g.rule,A=bi(r.auth);return t(`The road beside this plot is ${r.width} ft wide and is looked after by ${A}. In this demo, about ${R.f} ft is shown as open space in front, ${R.s} ft on each side and ${R.b} ft at the back. The real rule may be different, so ask the authority before you build.`,`এই প্লটের পাশের রাস্তা ${r.width} ফুট চওড়া, দেখভালের দায়িত্বে ${A}। এই ডেমোতে ভবনের সামনে প্রায় ${R.f} ফুট, দুই পাশে ${R.s} ফুট করে এবং পেছনে ${R.b} ফুট জায়গা খালি রাখার কথা দেখানো হয়েছে। আসল নিয়ম আলাদা হতে পারে, তাই বাড়ি বানানোর আগে কর্তৃপক্ষকে জিজ্ঞেস করুন।`)}
const extraHTML=r=>{const x=r.px;
  return `<div style="border-top:2px dashed var(--bd);margin-top:12px;padding-top:8px"><h2>${t("Extra information (not part of the risk score)","অতিরিক্ত তথ্য (ঝুঁকি স্কোরের অংশ নয়)")}</h2><p>${DEMO()}</p>
  ${x?`<p>${t("Plot","প্লট")}: <b>${bi(x.mz)}</b>, ${svl(x.sv)}, ${x.area} ${t(...UN[x.unit])}${x.map?"":` (${t("no map data","ম্যাপ তথ্য নেই")})`}</p>
  <p>${t("Road","রাস্তা")}: ${x.rd?`${bi(x.rd.type)}, ${x.rd.width==null?t("width not recorded","প্রস্থ রেকর্ডে নেই"):x.rd.width+" ft"}, ${x.rd.auth?bi(x.rd.auth):t("authority not recorded","কর্তৃপক্ষ রেকর্ডে নেই")}`:t("not recorded","রেকর্ডে নেই")}</p>
  <p>${t("Setback (illustrative)","সেটব্যাক (উদাহরণ)")}: ${x.g?`${t("front","সামনে")} ${x.g.f} ft, ${t("side","পাশে")} ${x.g.s} ft, ${t("rear","পেছনে")} ${x.g.b} ft`:VR()}</p>`
  :`<p>${t("No plot or road information found in the demo data.","ডেমো ডেটায় এই প্লট বা রাস্তার তথ্য পাওয়া যায়নি।")}</p>`}
  <p class="mut small">${t("Demo information. Not legal advice or building approval. Verify with the land office and the responsible authority.","ডেমো তথ্য। এটি আইনি পরামর্শ বা ভবন অনুমোদন নয়। ভূমি অফিস ও দায়িত্বপ্রাপ্ত কর্তৃপক্ষের কাছে যাচাই করুন।")}</p></div>`};
// ---- Admin ----
if(!db.users.some(u=>u.email=="252-15-856@diu.edu.bd")){db.users.push({id:db.nid++,name:"Demo User",email:"252-15-856@diu.edu.bd",pass:"land123",role:"user"});save()}
const bb=s=>{const a=String(s).split("|");return a[1]?a[1]+" / "+a[0]:a[0]};
const DM={check:[{n:["Safe land","নিরাপদ জমি"],f:{k:"101",d:"12",s:["Rahim Uddin","রহিম উদ্দিন"]},e:["Expected: Pass, 100/100","ফল: Pass, ১০০/১০০"]},
{n:["Risky land","ঝুঁকিপূর্ণ জমি"],f:{k:"103",d:"20",s:["Abdul Karim","আব্দুল করিম"]},e:["Expected: Risk Found (khas land, seller is not the owner)","ফল: Risk Found (খাস জমি, বিক্রেতা মালিক নন)"]}],
plots:[{n:["Plot with full details","পূর্ণ তথ্যসহ প্লট"],f:{dv:DK,ds:DK,up:SV_,mz:["Savar","সাভার"],sv:"RS",k:"101",d:"12"},e:["Shows area, map reference and road","জমির পরিমাণ, ম্যাপ রেফারেন্স ও রাস্তা দেখাবে"]},
{n:["Plot with missing details","অসম্পূর্ণ তথ্যের প্লট"],f:{dv:DK,ds:DK,up:DHM,mz:["Dhamrai","ধামরাই"],sv:"BS",k:"106",d:"5"},e:["No map (picture only) and no road recorded","ম্যাপ নেই (শুধু ছবি), রাস্তার তথ্য নেই"]}],
sb:[{n:["Setback guidance shown","সেটব্যাক গাইড আছে"],f:{dv:DK,ds:DK,up:SV_,mz:["Savar","সাভার"],sv:"RS",k:"101",d:"12"},e:["Road 20 ft, Union Parishad: demo guidance shown","রাস্তা ২০ ফুট, ইউনিয়ন পরিষদ: ডেমো গাইড দেখাবে"]},
{n:["Verification Required","যাচাই প্রয়োজন"],f:{dv:DK,ds:DK,up:SV_,mz:["Savar","সাভার"],sv:"BS",k:"102",d:"15"},e:["Road width and owner not recorded: we do not guess","প্রস্থ ও মালিক রেকর্ডে নেই: অনুমান করা হয় না"]}]};
const dmRows=(p,f)=>(p=="check"?[[t("Khatian no.","খতিয়ান নম্বর"),f.k],[t("Dag no.","দাগ নম্বর"),f.d],[t("Seller name","বিক্রেতার নাম"),f.s[1]+" / "+f.s[0]]]
 :[[t("Division","বিভাগ"),bb(f.dv)],[t("District","জেলা"),bb(f.ds)],[t("Upazila","উপজেলা"),bb(f.up)],[t("Mouza","মৌজা"),f.mz[1]+" / "+f.mz[0]],[t("Survey type","জরিপের ধরন"),svl(f.sv)],[t("Khatian no.","খতিয়ান নম্বর"),f.k],[t("Dag no.","দাগ নম্বর"),f.d]])
 .map(x=>`<tr><td class="mut small">${x[0]}</td><td><b>${esc(x[1])}</b></td></tr>`).join("");
const demoBox=p=>`<div class="card noprint"><div class="top"><h2>${t("Try a demo","ডেমো চেষ্টা করুন")}</h2>${DEMO()}</div><p class="mut small">${t("Press “Fill form” to enter these values, then press the main button.","“ফর্ম পূরণ” চাপলে এই তথ্য ফর্মে বসবে, তারপর মূল বাটন চাপুন।")}</p>
<div class="grid">${DM[p].map((d,i)=>`<div class="card" style="margin:0"><b>${t("Demo","ডেমো")} ${i+1}: ${t(...d.n)}</b><table>${dmRows(p,d.f)}</table><p class="small mut">${t(...d.e)}</p><button onclick="fillDemo('${p}',${i})">${t("Fill form","ফর্ম পূরণ")}</button></div>`).join("")}</div></div>`;
function fillDemo(p,i){dm[p]=i;const f=DM[p][i].f;
  if(p=="check"){$("k").value=f.k;$("d").value=f.d;$("s").value=t(f.s[0],f.s[1]);msg="";return}
  Q={dv:f.dv,ds:f.ds,up:f.up,mz:t(f.mz[0],f.mz[1]),sv:f.sv,k:f.k,d:f.d};RES={st:"idle",list:[],err:""};R()}
const nextDemo=p=>{if(dm[p]<0)return"";const n=1-dm[p],d=DM[p][n];
  return `<div class="plain noprint">💡 <b>${t("Next demo","পরের ডেমো")}:</b> ${t("Demo","ডেমো")} ${n+1}, ${t(...d.n)}. ${t(...d.e)} <button onclick="fillDemo('${p}',${n});try{window.scrollTo({top:0,behavior:'smooth'})}catch(e){}">${t("Fill form","ফর্ম পূরণ")}</button></div>`};
const extraTabs=u=>[["plots",t("Plot Info","প্লট তথ্য")],["sb",t("Setback Guide","সেটব্যাক গাইড")],...(u.role=="admin"?[["pa",t("Manage Plots","প্লট ম্যানেজ")],["ra",t("Setback Rules","সেটব্যাক নিয়ম")]]:[])];
const mkTabs=(u,T0)=>{const g=k=>T0.find(x=>x[0]==k),X=extraTabs(u),h=k=>X.find(x=>x[0]==k);return u.role=="admin"?[g("dash"),g("lands"),h("pa"),h("ra"),g("check"),h("plots"),h("sb"),g("all")]:[g("check"),h("plots"),h("sb"),g("mine")]};
const mcls=()=>msg[0]=="✔"?"okc":"rk";
function plotsAdmin(){const e=db.plots.find(p=>p.id==ep)||{},r=e.road||{};
  const F=[["pdv","Division (English|বাংলা)",e.dv],["pds","District (English|বাংলা)",e.ds],["pup","Upazila (English|বাংলা)",e.up],["pmz","Mouza (English|বাংলা)",e.mz],["pk",t("Khatian","খতিয়ান"),e.k],["pd",t("Dag","দাগ"),e.d],["pa_",t("Area","পরিমাণ"),e.area],["pm",t("Map reference (optional)","ম্যাপ রেফারেন্স (ঐচ্ছিক)"),e.map],["rt","Road type (English|বাংলা; blank = none)",r.type],["rw",t("Road width, ft (blank = unknown)","রাস্তার প্রস্থ, ft (ফাঁকা = অজানা)"),r.width],["ra_","Authority (English|বাংলা; blank = unknown)",r.auth]],
  S=(id,l,list,cur)=>`<div><label>${l}</label><select id="${id}">${list.map(x=>`<option value="${x[0]}" ${cur==x[0]?"selected":""}>${x[1]}</option>`).join("")}</select></div>`;
  return `<div class="card"><h2>${ep?t("Edit plot","প্লট Edit করুন"):t("New demo plot & road","নতুন ডেমো প্লট ও রাস্তা")}</h2><div class="row">${F.map(c=>`<div><label>${c[1]}</label><input id="${c[0]}" value="${esc(c[2])}"></div>`).join("")}
  ${S("psv",t("Survey type","জরিপের ধরন"),SVO.map(s=>[s[0],svl(s[0])]),e.sv)}${S("pu",t("Unit","একক"),Object.keys(UN).map(k=>[k,t(...UN[k])]),e.unit)}${S("rs",t("Road info status","রাস্তার তথ্যের অবস্থা"),[["demo","Demo"],["unverified","Unverified"],["verified","Verified"]],r.st)}</div>
  <p class="${mcls()} small">${esc(msg)}</p><button class="pri" onclick="savePlot()">${t("Save","Save করুন")}</button> ${ep?`<button onclick="ep=null;R()">${t("Cancel","বাতিল")}</button>`:""}</div>
  <div class="card"><h2>${t("Demo plots","ডেমো প্লট")} (${db.plots.length})</h2><div class="wrap"><table><tr><th>${t("Khatian/Dag","খতিয়ান/দাগ")}</th><th>${t("Mouza","মৌজা")}</th><th>${t("Survey","জরিপ")}</th><th>${t("Area","পরিমাণ")}</th><th>${t("Road","রাস্তা")}</th><th></th></tr>${db.plots.map(p=>`<tr><td>${esc(p.k)}/${esc(p.d)}</td><td>${esc(bi(p.mz))}</td><td>${svl(p.sv)}</td><td>${p.area} ${t(...UN[p.unit])}</td><td>${p.road?esc(bi(p.road.type))+" · "+(p.road.width==null?"?":p.road.width+" ft"):"-"}</td><td><button onclick="ep=${p.id};msg='';R()">Edit</button> <button onclick="delPlot(${p.id})">${t("Delete","মুছুন")}</button></td></tr>`).join("")}</table></div></div>`}
function savePlot(){try{SRC.guard("admin");
  const g=i=>$(i).value.trim(),A=parseFloat(g("pa_")),rt=g("rt"),W=g("rw")===""?null:parseFloat(g("rw")),
  o={dv:g("pdv"),ds:g("pds"),up:g("pup"),mz:g("pmz"),sv:g("psv"),k:en(g("pk")),d:en(g("pd")),area:A,unit:g("pu"),map:g("pm")||null,src:"demo",road:rt?{type:rt,width:W,auth:g("ra_")||null,st:g("rs")}:null};
  if(!o.dv||!o.ds||!o.up||!o.mz||!/^\d+$/.test(o.k)||!/^\d+$/.test(o.d)||!(A>0)||(W!=null&&!(W>=0))){msg=t("Fill location, numeric khatian and dag, a valid area, and a valid road width if given.","স্থান, সংখ্যায় খতিয়ান ও দাগ, সঠিক পরিমাণ দিন (রাস্তার প্রস্থ দিলে সঠিক সংখ্যা)।");return R()}
  if(ep)Object.assign(db.plots.find(p=>p.id==ep),o);else db.plots.push({id:db.nid++,...o});
  ep=null;save();msg="✔ "+t("Saved","সংরক্ষিত হয়েছে");R()}catch(e){msg=t("Not allowed.","অনুমতি নেই।");R()}}
function delPlot(id){try{SRC.guard("admin");db.plots=db.plots.filter(p=>p.id!=id);save();R()}catch(e){}}
function rulesAdmin(){const e=db.rules.find(x=>x.id==er)||{};
  const F=[["qa","Authority (English|বাংলা)",e.auth],["qmin","Min width (ft)",e.min],["qmax","Max width (ft, exclusive)",e.max],["qf",t("Front (ft)","সামনে (ft)"),e.f],["qs",t("Side (ft)","পাশে (ft)"),e.s],["qb",t("Rear (ft)","পেছনে (ft)"),e.b]];
  return `<div class="card"><h2>${t("Demo setback rules (illustrative only)","ডেমো সেটব্যাক নিয়ম (শুধু উদাহরণ)")}</h2><div class="row">${F.map(c=>`<div><label>${c[1]}</label><input id="${c[0]}" value="${esc(c[2])}"></div>`).join("")}</div>
  <p class="${mcls()} small">${esc(msg)}</p><button class="pri" onclick="saveRule()">${t("Save","Save করুন")}</button> ${er?`<button onclick="er=null;R()">${t("Cancel","বাতিল")}</button>`:""}</div>
  <div class="card"><div class="wrap"><table><tr><th>${t("Authority","কর্তৃপক্ষ")}</th><th>${t("Road width (ft)","রাস্তার প্রস্থ (ft)")}</th><th>${t("Front","সামনে")}</th><th>${t("Side","পাশে")}</th><th>${t("Rear","পেছনে")}</th><th>Status</th><th></th></tr>${db.rules.map(x=>`<tr><td>${esc(bi(x.auth))}</td><td>${x.min} – ${x.max}</td><td>${x.f}</td><td>${x.s}</td><td>${x.b}</td><td>${x.st}</td><td><button onclick="er=${x.id};msg='';R()">Edit</button> <button onclick="delRule(${x.id})">${t("Delete","মুছুন")}</button></td></tr>`).join("")}</table></div></div>`}
function saveRule(){try{SRC.guard("admin");const n=i=>parseFloat($(i).value),o={auth:$("qa").value.trim(),min:n("qmin"),max:n("qmax"),f:n("qf"),s:n("qs"),b:n("qb"),st:"demo"};
  if([o.min,o.max,o.f,o.s,o.b].some(v=>isNaN(v)||v<0)||o.max<=o.min||!o.auth){msg=t("Enter valid numbers; max must be greater than min.","সঠিক সংখ্যা দিন; max অবশ্যই min-এর চেয়ে বড় হতে হবে।");return R()}
  if(er)Object.assign(db.rules.find(x=>x.id==er),o);else db.rules.push({id:db.nid++,...o});
  er=null;save();msg="✔ "+t("Saved","সংরক্ষিত হয়েছে");R()}catch(e){msg=t("Not allowed.","অনুমতি নেই।");R()}}
function delRule(id){try{SRC.guard("admin");db.rules=db.rules.filter(x=>x.id!=id);save();R()}catch(e){}}
function extraBody(u){
  if(tab=="plots")return `<h2>${t("Land Survey & Plot Information","জমির জরিপ ও প্লট তথ্য")}</h2>`+howTo()+demoBox("plots")+searchForm()+resHTML(plotCard)+(RES.st=="ok"?nextDemo("plots"):"")+glossHTML();
  if(tab=="sb")return `<h2>${t("Road & Building Setback Guide","রাস্তা ও ভবন সেটব্যাক গাইড")}</h2>`+howTo()+demoBox("sb")+searchForm()+resHTML(sbCard)+(RES.st=="ok"?nextDemo("sb"):"")+setbackInfo();
  if(u.role=="admin"&&tab=="pa")return plotsAdmin();
  if(u.role=="admin"&&tab=="ra")return rulesAdmin();
  return null}

R();
