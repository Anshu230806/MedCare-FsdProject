
function patientInit(){
  const user=requireAuth("patient"); if(!user)return null;
  setupNav();
  return user;
}
function renderPatientSummary(pid){
  const logs=getTodayLogs(pid);
  const taken=logs.filter(l=>l.status==="taken").length;
  const missed=logs.filter(l=>l.status==="missed").length;
  const pending=logs.filter(l=>l.status==="pending").length;
  const total=logs.length||getMedicinesForPatient(pid).length;
  const percent=total?Math.round(taken/total*100):0;
  document.querySelectorAll("[data-stat=adherence]").forEach(e=>e.textContent=percent+"%");
  document.querySelectorAll("[data-stat=taken]").forEach(e=>e.textContent=taken);
  document.querySelectorAll("[data-stat=missed]").forEach(e=>e.textContent=missed);
  document.querySelectorAll("[data-stat=pending]").forEach(e=>e.textContent=pending);
  const bar=document.querySelector("[data-progress]"); if(bar) bar.style.width=percent+"%";
}
function patientTodayRows(pid){
  const meds=getMedicinesForPatient(pid);
  const logs=getTodayLogs(pid);
  return meds.map(m=>{
    let log=logs.find(l=>l.medicineId===m.id);
    if(!log){
      log={id:uid("l"),medicineId:m.id,patientId:pid,date:todayISO(),scheduledTime:m.time||"09:00",actualTime:null,status:"pending"};
    }
    return {m,log};
  });
}
function takeDose(medicineId, doseLog=null){
  const user=currentUser(); if(!user)return;
  let logs=Store.get("medicationLogs",[]);
  let log=doseLog || logs.find(l=>l.medicineId===medicineId && l.date===todayISO() && l.status==="pending");
  if(!log){
    const m=Store.get("medicines",[]).find(x=>x.id===medicineId);
    log={id:uid("l"),medicineId,patientId:user.id,date:todayISO(),scheduledTime:m?.time||"09:00",status:"pending"};
    logs.push(log);
  }
  log.status="taken";
  const now=new Date();
  log.actualTime=now.toTimeString().slice(0,5);
  const idx=logs.findIndex(x=>x.id===log.id); if(idx>=0)logs[idx]=log; else logs.push(log);
  Store.set("medicationLogs",logs);
  const notes=Store.get("notifications",[]);
  notes.unshift({id:uid("n"),userId:user.id,text:`${Store.get("medicines",[]).find(m=>m.id===medicineId)?.name||"Medicine"} was taken at ${formatTime(log.actualTime)}.`,type:"success",read:false,createdAt:new Date().toISOString()});
  Store.set("notifications",notes);
  updateCaregiverNotification(user.id, medicineId, "taken");
  closeReminder();
  toast("Medicine confirmation recorded.");
  document.dispatchEvent(new CustomEvent("medicationUpdated"));
}
function snoozeDose(medicineId){
  const user=currentUser(); if(!user)return;
  const settings=Store.get("settings",{})[user.id]||{snooze:10};
  const minutes=Number(settings.snooze)||10;
  const logs=Store.get("medicationLogs",[]);
  let log=logs.find(l=>l.medicineId===medicineId&&l.date===todayISO()&&l.status==="pending");
  const m=Store.get("medicines",[]).find(x=>x.id===medicineId);
  if(!log){log={id:uid("l"),medicineId,patientId:user.id,date:todayISO(),scheduledTime:m?.time||"09:00",actualTime:null,status:"pending"};logs.push(log);}
  log.status="snoozed"; log.snoozedUntil=new Date(Date.now()+minutes*60000).toISOString();
  Store.set("medicationLogs",logs);
  const notes=Store.get("notifications",[]);
  notes.unshift({id:uid("n"),userId:user.id,text:`${m.name} reminder postponed for ${minutes} minutes.`,type:"reminder",read:false,createdAt:new Date().toISOString()});
  Store.set("notifications",notes);
  closeReminder(); toast(`Reminder postponed for ${minutes} minutes.`);
  document.dispatchEvent(new CustomEvent("medicationUpdated"));
}
function updateCaregiverNotification(patientId, medicineId, status){
  const con=Store.get("caregiverConnections",[]).find(c=>c.patientId===patientId&&c.status==="active");
  if(!con)return;
  const m=Store.get("medicines",[]).find(x=>x.id===medicineId);
  const notes=Store.get("notifications",[]);
  notes.unshift({id:uid("n"),userId:con.caregiverId,text:`${currentUser().name} marked ${m?.name||"medicine"} as ${status}.`,type:"activity",read:false,createdAt:new Date().toISOString()});
  Store.set("notifications",notes);
}
function openReminder(medicineId){
  const m=Store.get("medicines",[]).find(x=>x.id===medicineId);
  if(!m)return;
  const wrap=document.createElement("div");
  wrap.id="reminderModal"; wrap.className="modal-backdrop";
  wrap.innerHTML=`<div class="modal">
    <img class="reminder-img" src="${m.image||""}" alt="Medicine">
    <h2>Medicine Reminder</h2>
    <p><strong>${m.name}</strong><br>${m.dosage}</p>
    <p class="muted">Scheduled time: ${formatTime(m.time)}</p>
    <p class="muted">${m.instructions||""}</p>
    <div class="modal-actions">
      <button class="btn btn-primary" id="takeBtn">I Took It</button>
      <button class="btn" id="snoozeBtn">Remind Me Later</button>
      <button class="btn" id="voiceBtn">Confirm with Voice</button>
      <button class="btn" id="closeBtn">Close</button>
    </div>
  </div>`;
  document.body.appendChild(wrap);
  document.getElementById("takeBtn").onclick=()=>takeDose(medicineId);
  document.getElementById("snoozeBtn").onclick=()=>snoozeDose(medicineId);
  document.getElementById("voiceBtn").onclick=()=>{
    toast("Listening... Voice confirmation simulated.");
    setTimeout(()=>takeDose(medicineId),900);
  };
  document.getElementById("closeBtn").onclick=closeReminder;
}
function closeReminder(){document.getElementById("reminderModal")?.remove();}
function saveMedicineFromForm(form){
  const user=currentUser(); if(!user)return;
  const fd=new FormData(form);
  const id=fd.get("id")||uid("m");
  const existing=Store.get("medicines",[]);
  const medicine={
    id,patientId:user.id,name:fd.get("name").trim(),dosage:fd.get("dosage").trim(),
    instructions:fd.get("instructions").trim(),scheduleType:fd.get("scheduleType"),
    time:fd.get("time"),interval:fd.get("intervalValue")?{value:Number(fd.get("intervalValue")),unit:fd.get("intervalUnit")} : null,
    startDate:fd.get("startDate"),endDate:fd.get("endDate"),image:form.dataset.image||"",
    active:true
  };
  if(!medicine.name||!medicine.dosage||!medicine.time){toast("Please complete the required fields.");return false;}
  const idx=existing.findIndex(m=>m.id===id);
  if(idx>=0)existing[idx]=medicine; else existing.push(medicine);
  Store.set("medicines",existing);
  toast(idx>=0?"Medicine updated.":"Medicine added.");
  setTimeout(()=>location.href="medicines.html",450);
  return false;
}
