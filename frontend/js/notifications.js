
function notificationsFor(uid) { return Store.get("notifications", []).filter(n => n.userId === uid); }
function markNotification(id) {
    const all = Store.get("notifications", []);
    const n = all.find(x => x.id === id); if (n) n.read = true;
    Store.set("notifications", all); location.reload();
}
function markAllNotifications(uid) {
    const all = Store.get("notifications", []);
    all.forEach(n => { if (n.userId === uid) n.read = true; });
    Store.set("notifications", all); location.reload();
}
