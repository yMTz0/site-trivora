// Inicializar Ícones
lucide.createIcons();

// GSAP Animações de Entrada
gsap.registerPlugin(ScrollTrigger);

// Hero Animation
gsap.from(".hero-content > *", {
    duration: 1.2,
    y: 50,
    opacity: 0,
    stagger: 0.2,
    ease: "power4.out"
});

// Floating animation para o background do hero
gsap.to(".hero-bg-animate", {
    duration: 10,
    x: "10%",
    y: "10%",
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
});

// Navbar Scroll Effect
window.addEventListener("scroll", () => {
    const nav = document.querySelector("#navbar");
    if (window.scrollY > 50) {
        nav.classList.add("scrolled");
    } else {
        nav.classList.remove("scrolled");
    }
});

// Toggle Login / Register
const btnToLogin = document.querySelector("#btn-to-login");
const btnToRegister = document.querySelector("#btn-to-register");
const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");

btnToRegister.addEventListener("click", () => {
    btnToLogin.classList.remove("active");
    btnToRegister.classList.add("active");
    loginForm.classList.remove("active");
    registerForm.classList.add("active");
    
    gsap.from("#register-form", { opacity: 0, x: 20, duration: 0.4 });
});

btnToLogin.addEventListener("click", () => {
    btnToRegister.classList.remove("active");
    btnToLogin.classList.add("active");
    registerForm.classList.remove("active");
    loginForm.classList.add("active");
    
    gsap.from("#login-form", { opacity: 0, x: -20, duration: 0.4 });
});

// Cards Reveal on Scroll
gsap.from(".feature-card", {
    scrollTrigger: {
        trigger: ".features-grid",
        start: "top 80%",
    },
    duration: 0.8,
    y: 60,
    opacity: 0,
    stagger: 0.2,
    ease: "power2.out"
});

// Feedback visual nos botões
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('mousedown', () => {
        gsap.to(button, { scale: 0.95, duration: 0.1 });
    });
    button.addEventListener('mouseup', () => {
        gsap.to(button, { scale: 1, duration: 0.1 });
    });
});