document.addEventListener('DOMContentLoaded', () => {

    var typed = new Typed('.text', {
        strings: ["Web Developer", "Software Tester", "Code Enthusiast", "Computer Engineer"],
        typeSpeed: 100,
        backSpeed: 50,
        backDelay: 1000,
        loop: true
    });

    const themeToggleBtn = document.getElementById('themeToggle');

    function setTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggleBtn.textContent = '☀️';
            themeToggleBtn.setAttribute('aria-label', 'Switch to light mode');
        } else {
            document.body.classList.remove('dark-mode');
            themeToggleBtn.textContent = '🌙';
            themeToggleBtn.setAttribute('aria-label', 'Switch to dark mode');
        }
        localStorage.setItem('theme', theme);
    }
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });


    function addTransform(e) {
        e.currentTarget.style.transform = 'scale(1.1) rotate(10deg)';
    }

    function removeTransform(e) {
        e.currentTarget.style.transform = 'none';
    }
    document.querySelectorAll('.home-sci a, .contact-icon a').forEach(icon => {
        icon.addEventListener('mouseenter', addTransform);
        icon.addEventListener('mouseleave', removeTransform);
    });
    document.querySelectorAll('.row img').forEach(image => {
        image.addEventListener('mouseenter', (e) => {
            e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
        });
        image.addEventListener('mouseleave', (e) => {
            e.currentTarget.style.transform = 'none';
        });
    });


    const menuToggle = document.querySelector(".menu-toggle");
    const navbar = document.querySelector(".navbar");
    if (menuToggle && navbar) {
        menuToggle.setAttribute('tabindex', 0);
        menuToggle.setAttribute('aria-label', 'Open navigation menu');
        menuToggle.setAttribute('aria-expanded', navbar.classList.contains('active'));
        menuToggle.addEventListener("click", () => {
            navbar.classList.toggle("active");
            menuToggle.setAttribute('aria-expanded', navbar.classList.contains('active'));
        });
        menuToggle.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                navbar.classList.toggle("active");
                menuToggle.setAttribute('aria-expanded', navbar.classList.contains('active'));
            }
        });

        document.querySelectorAll('.navbar a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 480) {
                    navbar.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }


    const techSection = document.querySelector('.container1');
    const bars = document.querySelectorAll('.Technical-bar .progress-line span');
    let techAnimated = false;

    function animateTechBars() {
        if (techAnimated) return;
        if (!techSection) return;
        const sectionPos = techSection.getBoundingClientRect();
        if (sectionPos.top < window.innerHeight && sectionPos.bottom > 0) {
            bars.forEach(bar => {
                bar.style.transform = 'scaleX(1)';
            });
            techAnimated = true;
        }
    }

    window.addEventListener('scroll', animateTechBars);
    window.addEventListener('load', animateTechBars);
});
document.addEventListener('DOMContentLoaded', function() {
    var form = document.getElementById('contact-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        var data = new FormData(form);

        fetch('https://script.google.com/macros/s/AKfycbwe5wykAIaNS_0YtlZNDwx2INqhQnizMzxueJp-MPLSyaux4LuSzjSlzk0IhMBW4_ZyZg/exec', {
                method: 'POST',
                body: data
            })
            .then(response => response.json())
            .then(result => {
                if (result.result === "success") {
                    form.reset();
                    document.getElementById('thankyou-message').style.display = 'block';
                } else {
                    alert('Something went wrong. Please try again.');
                }
            })
            .catch(error => {
                alert('Something went wrong. Please try again.');
            });
    });
    var thankYouMessage = document.getElementById('thankyou-message');
});