let form = document.getElementById("form");
let user = document.getElementById("usuario");
let password = document.getElementById("contraseña");

let userName = "admin";
let userPassword = "pass123";

form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (user.value !== userName && password.value !== userPassword) {
        alert("Usuario y contraseña invalido");
    } else {
        window.location.href = "home.html";
    }
    user.value = "";
    contraseña.value = "";
});
