
const Store = {
  get(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key) {
    localStorage.removeItem(key);
  }
};

function seedDemoData() {
  if (Store.get("medremind_seeded")) return;

  const medicineImage = "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200">
      <rect width="100%" height="100%" fill="#edf3f1"/>
      <rect x="78" y="52" width="144" height="95" rx="10" fill="#fff" stroke="#c8d9d4"/>
      <text x="150" y="105" text-anchor="middle" font-family="Arial" font-size="22" fill="#197a68">Medicine</text>
    </svg>`);

  Store.set("users", [
    {id:"u1",name:"Rahul Sharma",email:"rahul@example.com",password:"123456",role:"patient"},
    {id:"u2",name:"Priya Sharma",email:"priya@example.com",password:"123456",role:"caregiver"}
  ]);

  Store.set("medicines", [
    {id:"m1",patientId:"u1",name:"Metformin",dosage:"500 mg",instructions:"After breakfast",scheduleType:"fixed",time:"08:00",interval:null,image:medicineImage,active:true},
    {id:"m2",patientId:"u1",name:"Vitamin D",dosage:"1 tablet",instructions:"After lunch",scheduleType:"interval",time:"14:00",interval:{value:24,unit:"hours"},image:medicineImage,active:true},
    {id:"m3",patientId:"u1",name:"Amlodipine",dosage:"5 mg",instructions:"At the same time each evening",scheduleType:"fixed",time:"20:00",interval:null,image:medicineImage,active:true},
    {id:"m4",patientId:"u1",name:"Atorvastatin",dosage:"10 mg",instructions:"At bedtime",scheduleType:"fixed",time:"22:00",interval:null,image:medicineImage,active:true}
  ]);

  const today = new Date();
  const iso = d => d.toISOString().slice(0,10);
  const daysAgo = n => { const d = new Date(today); d.setDate(d.getDate()-n); return iso(d); };

  Store.set("medicationLogs", [
    {id:"l1",medicineId:"m1",patientId:"u1",date:daysAgo(0),scheduledTime:"08:00",actualTime:"08:06",status:"taken"},
    {id:"l2",medicineId:"m2",patientId:"u1",date:daysAgo(0),scheduledTime:"14:00",actualTime:"14:04",status:"taken"},
    {id:"l3",medicineId:"m3",patientId:"u1",date:daysAgo(0),scheduledTime:"20:00",actualTime:null,status:"pending"},
    {id:"l4",medicineId:"m4",patientId:"u1",date:daysAgo(0),scheduledTime:"22:00",actualTime:null,status:"pending"},
    {id:"l5",medicineId:"m1",patientId:"u1",date:daysAgo(1),scheduledTime:"08:00",actualTime:"08:03",status:"taken"},
    {id:"l6",medicineId:"m2",patientId:"u1",date:daysAgo(1),scheduledTime:"14:00",actualTime:null,status:"missed"},
    {id:"l7",medicineId:"m3",patientId:"u1",date:daysAgo(1),scheduledTime:"20:00",actualTime:"20:08",status:"taken"},
    {id:"l8",medicineId:"m4",patientId:"u1",date:daysAgo(1),scheduledTime:"22:00",actualTime:"22:10",status:"taken"},
    {id:"l9",medicineId:"m1",patientId:"u1",date:daysAgo(2),scheduledTime:"08:00",actualTime:"08:05",status:"taken"},
    {id:"l10",medicineId:"m2",patientId:"u1",date:daysAgo(2),scheduledTime:"14:00",actualTime:"14:15",status:"taken"},
    {id:"l11",medicineId:"m3",patientId:"u1",date:daysAgo(2),scheduledTime:"20:00",actualTime:null,status:"missed"},
    {id:"l12",medicineId:"m4",patientId:"u1",date:daysAgo(2),scheduledTime:"22:00",actualTime:"22:04",status:"taken"}
  ]);

  Store.set("notifications", [
    {id:"n1",userId:"u1",text:"Metformin was taken at 08:06 AM.",type:"success",read:false,createdAt:new Date().toISOString()},
    {id:"n2",userId:"u1",text:"Amlodipine is scheduled for 08:00 PM.",type:"reminder",read:false,createdAt:new Date().toISOString()},
    {id:"n3",userId:"u2",text:"Rahul missed Vitamin D yesterday.",type:"alert",read:false,createdAt:new Date().toISOString()}
  ]);

  Store.set("caregiverConnections", [{caregiverId:"u2",patientId:"u1",status:"active"}]);
  Store.set("settings", {
    u1:{reminders:true,snooze:10,caregiverAlerts:true,dailySummary:true},
    u2:{missedAlerts:true,dailySummary:true}
  });
  Store.set("medremind_seeded", true);
}

function currentUser(){ return Store.get("currentUser", null); }
function requireAuth(role){
  const user = currentUser();
  if(!user || (role && user.role !== role)){
    window.location.href = "../login.html";
    return null;
  }
  return user;
}
function logout(){
  Store.remove("currentUser");
  window.location.href = "../login.html";
}
function toast(message){
  const old=document.querySelector(".toast"); if(old) old.remove();
  const el=document.createElement("div"); el.className="toast"; el.textContent=message;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),2200);
}
function formatDate(dateStr){
  return new Date(dateStr+"T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
}
function formatTime(t){
  if(!t) return "";
  const [h,m]=t.split(":").map(Number);
  const d=new Date(); d.setHours(h,m,0,0);
  return d.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"});
}
function todayISO(){ return new Date().toISOString().slice(0,10); }
function uid(prefix="id"){ return prefix+"_"+Date.now()+"_"+Math.random().toString(36).slice(2,7); }
function getMedicinesForPatient(pid){ return Store.get("medicines",[]).filter(m=>m.patientId===pid && m.active!==false); }
function getLogsForPatient(pid){ return Store.get("medicationLogs",[]).filter(l=>l.patientId===pid); }
function getTodayLogs(pid){ return getLogsForPatient(pid).filter(l=>l.date===todayISO()); }
function adherenceFor(pid){
  const logs=getLogsForPatient(pid).filter(l=>l.status!=="pending");
  if(!logs.length) return 0;
  return Math.round(logs.filter(l=>l.status==="taken").length/logs.length*100);
}
function statusLabel(status){
  return `<span class="status ${status}">${status[0].toUpperCase()+status.slice(1)}</span>`;
}
function setupNav(){
  const menu=document.querySelector(".mobile-menu");
  const side=document.querySelector(".sidebar");
  if(menu && side) menu.onclick=()=>side.classList.toggle("open");
}
function resetDemo(){
  localStorage.clear();
  seedDemoData();
  window.location.href="../login.html";
}
seedDemoData();
