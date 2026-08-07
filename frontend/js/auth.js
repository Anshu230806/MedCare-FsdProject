
document.addEventListener("DOMContentLoaded", () => {
    seedDemoData();
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", e => {
            e.preventDefault();
            const email = document.getElementById("email").value.trim().toLowerCase();
            const password = document.getElementById("password").value;
            const users = Store.get("users", []);
            const user = users.find(u => u.email.toLowerCase() === email && u.password === password);
            if (!user) { toast("Invalid email or password."); return; }
            Store.set("currentUser", { id: user.id, name: user.name, email: user.email, role: user.role });
            window.location.href = user.role === "patient" ? "patient/dashboard.html" : "caregiver/dashboard.html";
        });
    }
    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
        signupForm.addEventListener("submit", e => {
            e.preventDefault();
            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim().toLowerCase();
            const password = document.getElementById("password").value;
            const confirm = document.getElementById("confirm").value;
            const role = document.getElementById("role").value;
            const users = Store.get("users", []);
            if (!name || !email || password.length < 6 || password !== confirm) { toast("Please check the form details."); return; }
            if (users.some(u => u.email === email)) { toast("An account with this email already exists."); return; }
            const user = { id: uid("u"), name, email, password, role };
            users.push(user); Store.set("users", users);
            Store.set("currentUser", { id: user.id, name: user.name, email: user.email, role: user.role });
            toast("Account created.");
            setTimeout(() => window.location.href = role === "patient" ? "patient/dashboard.html" : "caregiver/dashboard.html", 500);
        });
    }
    document.querySelectorAll("[data-demo]").forEach(btn => {
        btn.onclick = () => {
            const role = btn.dataset.demo;
            const users = Store.get("users", []);
            const user = users.find(u => u.role === role);
            Store.set("currentUser", { id: user.id, name: user.name, email: user.email, role: user.role });
            window.location.href = role === "patient" ? "patient/dashboard.html" : "caregiver/dashboard.html";
        };
    });
    const forgot = document.getElementById("forgotForm");
    if (forgot) forgot.onsubmit = e => { e.preventDefault(); toast("Reset instructions simulated for this prototype."); };
});
