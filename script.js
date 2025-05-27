document.addEventListener('DOMContentLoaded', () => {
    // Typed.js for typing text effect
    var typed = new Typed('.text', {
        strings: ["Web Developer", "Software Tester", "Code Enthusiast", "Computer Engineer"],
        typeSpeed: 100,
        backSpeed: 50,
        backDelay: 1000,
        loop: true
    });

    // Theme toggle
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

    // Icon hover effects
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

    // Navbar toggle for mobile
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

    // === Animate skill bars ONLY when visible using Intersection Observer ===
    const techSection = document.querySelector('.container1');
    let techAnimated = false;
    if (techSection) {
        const observer = new window.IntersectionObserver(
            (entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !techAnimated) {
                        // Animate bars (span inside .progress-line)
                        document.querySelectorAll('.Technical-bar .progress-line span').forEach(span => {
                            span.style.animation = 'animate 1s 1s cubic-bezier(1,0,0.5,1) forwards';
                        });
                        // Animate percentage text
                        document.querySelectorAll('.Technical-bar .bar .info span').forEach(span => {
                            span.style.animation = 'showText 0.5s 1s linear forwards';
                        });
                        techAnimated = true;
                        observer.disconnect(); // Only run once
                    }
                });
            }, {
                threshold: 0.3 // 30% visible
            }
        );
        observer.observe(techSection);
    }

    // Contact form submission (Google Apps Script)
    var form = document.getElementById('contact-form');
    if (form) {
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
    }
});