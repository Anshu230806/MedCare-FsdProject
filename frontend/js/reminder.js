
function startReminderWatcher(){
  const user=currentUser(); if(!user||user.role!=="patient")return;
  setInterval(()=>{
    const meds=getMedicinesForPatient(user.id);
    const logs=getTodayLogs(user.id);
    const now=new Date();
    meds.forEach(m=>{
      if(!m.time)return;
      const current=now.toTimeString().slice(0,5);
      const log=logs.find(l=>l.medicineId===m.id);
      if(current===m.time && (!log||["pending","snoozed"].includes(log.status))){
        if(!document.getElementById("reminderModal")) openReminder(m.id);
      }
      if(log?.status==="snoozed" && log.snoozedUntil && new Date(log.snoozedUntil)<=now && !document.getElementById("reminderModal")){
        openReminder(m.id);
      }
    });
  },1000);
}
