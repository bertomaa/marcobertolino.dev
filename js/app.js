// Main Application Logic - Data Loading and DOM Manipulation
(function () {
    let data = null;

    // Fetch and load data from JSON
    async function loadData() {
        try {
            const response = await fetch('data.json');
            data = await response.json();
            populateContent();
        } catch (error) {
            console.error('Error loading data:', error);
            // Fallback content
            document.getElementById('hero-name').textContent = 'Loading Error';
            document.getElementById('hero-tagline').textContent = 'Please check data.json';
        }
    }

    // Populate all content sections
    function populateContent() {
        if (!data) return;

        // Hero section
        document.getElementById('hero-name').textContent = data.personal.name;
        document.getElementById('hero-tagline').textContent = data.personal.tagline;

        // About section
        document.getElementById('about-bio').textContent = data.personal.bio;

        // Social links
        const socialLinksContainer = document.getElementById('social-links');
        socialLinksContainer.innerHTML = '';

        if (data.personal.email) {
            socialLinksContainer.innerHTML += `
                <a href="mailto:${data.personal.email}" class="social-link">
                    📧 Email
                </a>
            `;
        }
        if (data.personal.github) {
            socialLinksContainer.innerHTML += `
                <a href="${data.personal.github}" target="_blank" rel="noopener noreferrer" class="social-link">
                    🔗 GitHub
                </a>
            `;
        }
        if (data.personal.linkedin) {
            socialLinksContainer.innerHTML += `
                <a href="${data.personal.linkedin}" target="_blank" rel="noopener noreferrer" class="social-link">
                    💼 LinkedIn
                </a>
            `;
        }

        // Degrees section
        const degreesContainer = document.getElementById('degrees-container');
        degreesContainer.innerHTML = '';

        data.degrees.forEach((degree, index) => {
            const degreeCard = document.createElement('div');
            degreeCard.className = 'glass-card degree-card animate-on-scroll';
            degreeCard.style.animationDelay = `${index * 0.1}s`;
            degreeCard.innerHTML = `
                <h3 class="degree-institution">${degree.institution}</h3>
                <p class="degree-title">${degree.degree}</p>
                <p class="degree-year">${degree.year}</p>
                <p class="degree-description">${degree.description}</p>
            `;
            degreesContainer.appendChild(degreeCard);
        });

        // Experience section
        const experienceContainer = document.getElementById('experience-container');
        experienceContainer.innerHTML = '';

        data.experience.forEach((exp, index) => {
            const expCard = document.createElement('div');
            expCard.className = 'glass-card experience-card animate-on-scroll';
            expCard.style.animationDelay = `${index * 0.1}s`;

            const achievementsList = exp.achievements
                .map(achievement => `<li>${achievement}</li>`)
                .join('');

            expCard.innerHTML = `
                <div class="experience-header">
                    <h3 class="experience-company">${exp.company}</h3>
                    <p class="experience-role">${exp.role}</p>
                    <p class="experience-period">${exp.period}</p>
                </div>
                <ul class="experience-achievements">
                    ${achievementsList}
                </ul>
            `;
            experienceContainer.appendChild(expCard);
        });

        // Projects section
        const projectsContainer = document.getElementById('projects-container');
        projectsContainer.innerHTML = '';

        data.projects.forEach((project, index) => {
            const projectCard = document.createElement('div');
            projectCard.className = 'glass-card project-card animate-on-scroll';
            projectCard.style.animationDelay = `${index * 0.1}s`;

            const techTags = project.technologies
                .map(tech => `<span class="tech-tag">${tech}</span>`)
                .join('');

            projectCard.innerHTML = `
                <h3 class="project-name">${project.name}</h3>
                <p class="project-description">${project.description}</p>
                <div class="project-tech">
                    ${techTags}
                </div>
                <a href="${project.link}" target="_blank" rel="noopener noreferrer" class="project-link">
                    View Project →
                </a>
            `;
            projectsContainer.appendChild(projectCard);
        });

        // Footer
        document.getElementById('footer-name').textContent = data.personal.name;
        document.getElementById('current-year').textContent = new Date().getFullYear();

        // Initialize scroll animations
        initScrollAnimations();
    }

    // Scroll animations using Intersection Observer
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    // Optional: stop observing after animation
                    // observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all elements with animate-on-scroll class
        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll effect to navigation
    let lastScroll = 0;
    const nav = document.querySelector('.nav');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            nav.style.background = 'rgba(10, 14, 39, 0.95)';
            nav.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
        } else {
            nav.style.background = 'rgba(10, 14, 39, 0.7)';
            nav.style.boxShadow = 'none';
        }

        lastScroll = currentScroll;
    });

    // Initialize app
    loadData();
})();
