// Main Application Logic - Data Loading and DOM Manipulation
(function () {
    let data = null;

    // Transform JSON Resume format to app format
    function transformResumeData(resume) {
        // Extract GitHub and LinkedIn from profiles
        const github = resume.basics.profiles?.find(p => p.network === 'GitHub')?.url || resume.basics.url;
        const linkedin = resume.basics.profiles?.find(p => p.network === 'LinkedIn')?.url;

        // Transform education to degrees format
        const degrees = (resume.education || []).map(edu => {
            // Check if it's the EIT Digital double degree
            const isEitDigital = edu.institution === 'EIT Digital Master School';

            if (isEitDigital && edu.courses) {
                // Split into multiple degree entries for double degree
                return edu.courses.map((course, index) => {
                    const match = course.match(/^(MSc .+) at ([^,]+), ([^(]+)\(GPA ([^)]+)\)$/);
                    if (match) {
                        return {
                            institution: match[2].trim(),
                            degree: match[1].trim(),
                            year: `${edu.startDate?.slice(0, 4) || ''}/${edu.endDate?.slice(0, 4) || ''}`,
                            grade: match[4].trim(),
                            description: `Part of EIT Digital Double Master's Degree. Located in ${match[3].trim()}.`,
                            degreeGroup: 'eit-digital',
                            isPrimary: index === 0
                        };
                    }
                    return null;
                }).filter(Boolean);
            }

            return [{
                institution: edu.institution,
                degree: `${edu.studyType} ${edu.area}`,
                year: `${edu.startDate?.slice(0, 4) || ''}/${edu.endDate?.slice(0, 4) || ''}`,
                grade: edu.score?.replace('GPA ', '') || null,
                description: edu.courses?.[0] || ''
            }];
        }).flat();

        // Transform work to experience format
        const experience = (resume.work || []).map(job => {
            const startDate = job.startDate ? new Date(job.startDate + '-01') : null;
            const endDate = job.endDate ? new Date(job.endDate + '-01') : null;

            const formatDate = (date) => {
                if (!date) return 'Present';
                return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            };

            return {
                company: job.name,
                role: job.position,
                period: `${formatDate(startDate)} - ${formatDate(endDate)}`,
                achievements: job.highlights || []
            };
        });

        // Transform projects format
        const projects = (resume.projects || []).map(proj => ({
            name: proj.name,
            description: proj.highlights?.join(' ') || '',
            technologies: [], // JSON Resume doesn't have technologies, could parse from highlights
            link: proj.url
        }));

        // Transform skills format
        const skills = (resume.skills || []).map(skill => ({
            name: skill.name,
            keywords: skill.keywords || []
        }));

        return {
            personal: {
                name: resume.basics.name,
                tagline: resume.basics.label,
                bio: `${resume.basics.label} based in ${resume.basics.location?.city || ''}, ${resume.basics.location?.region || ''}. Specialized in cloud infrastructure, Kubernetes, and security.`,
                profilePicture: 'images/profile.jpg',
                cvUrl: 'cv/Marco_Bertolino_CV.pdf',
                email: resume.basics.email,
                github: github,
                linkedin: linkedin
            },
            degrees,
            skills,
            experience,
            projects
        };
    }

    // Fetch and load data from JSON
    async function loadData() {
        try {
            const response = await fetch('cv/resume.json');
            const resumeData = await response.json();
            data = transformResumeData(resumeData);
            populateContent();
        } catch (error) {
            console.error('Error loading data:', error);
            // Fallback content
            document.getElementById('hero-name').textContent = 'Loading Error';
            document.getElementById('hero-tagline').textContent = 'Please check cv/resume.json';
        }
    }

    // Populate all content sections
    function populateContent() {
        if (!data) return;

        // Hero section
        document.getElementById('hero-name').textContent = data.personal.name;
        document.getElementById('hero-tagline').textContent = data.personal.tagline;

        // Profile picture
        const profileContainer = document.getElementById('profile-picture-container');
        if (data.personal.profilePicture) {
            profileContainer.innerHTML = `
                <img src="${data.personal.profilePicture}" 
                     alt="${data.personal.name}" 
                     class="profile-picture"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="profile-picture-placeholder" style="display: none;">
                    ${data.personal.name.charAt(0)}
                </div>
            `;
        } else {
            // Show placeholder with first initial
            profileContainer.innerHTML = `
                <div class="profile-picture-placeholder">
                    ${data.personal.name.charAt(0)}
                </div>
            `;
        }

        // CV Download button
        if (data.personal.cvUrl) {
            const cvBtn = document.getElementById('cv-download-btn');
            cvBtn.href = data.personal.cvUrl;
            cvBtn.target = '_blank';
            cvBtn.style.display = 'inline-block';
        }

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

        // Group degrees by degreeGroup
        const groupedDegrees = {};
        const standaloneeDegrees = [];

        data.degrees.forEach(degree => {
            if (degree.degreeGroup) {
                if (!groupedDegrees[degree.degreeGroup]) {
                    groupedDegrees[degree.degreeGroup] = [];
                }
                groupedDegrees[degree.degreeGroup].push(degree);
            } else {
                standaloneeDegrees.push(degree);
            }
        });

        // Render grouped degrees (double degrees)
        let animationDelay = 0;
        Object.keys(groupedDegrees).forEach(groupKey => {
            const degrees = groupedDegrees[groupKey];
            const primaryDegree = degrees.find(d => d.isPrimary) || degrees[0];

            const groupCard = document.createElement('div');
            groupCard.className = 'double-degree-group animate-on-scroll';
            groupCard.style.animationDelay = `${animationDelay * 0.1}s`;

            const institutionsHTML = degrees.map(degree => `
                <div class="institution-chip">
                    <h4 class="degree-institution">${degree.institution}</h4>
                    <p class="degree-title">${degree.degree}</p>
                    <p class="degree-year">${degree.year}</p>
                    ${degree.grade ? `<span class="degree-grade">GPA: ${degree.grade}</span>` : ''}
                    <p class="degree-description">${degree.description}</p>
                </div>
            `).join('');

            groupCard.innerHTML = `
                <div class="double-degree-header">
                    <div class="degree-badge">🎓 Double Master's Degree</div>
                    <h3 class="double-degree-title">European Institute of Technology</h3>
                    <p class="double-degree-subtitle">Cybersecurity Specialization</p>
                </div>
                <div class="double-degree-institutions">
                    ${institutionsHTML}
                </div>
            `;

            degreesContainer.appendChild(groupCard);
            animationDelay++;
        });

        // Render standalone degrees
        standaloneeDegrees.forEach((degree) => {
            const degreeCard = document.createElement('div');
            degreeCard.className = 'glass-card degree-card animate-on-scroll';
            degreeCard.style.animationDelay = `${animationDelay * 0.1}s`;

            degreeCard.innerHTML = `
                <h3 class="degree-institution">${degree.institution}</h3>
                <p class="degree-title">${degree.degree}</p>
                <p class="degree-year">${degree.year}</p>
                ${degree.grade ? `<span class="degree-grade">GPA: ${degree.grade}</span>` : ''}
                <p class="degree-description">${degree.description}</p>
            `;
            degreesContainer.appendChild(degreeCard);
            animationDelay++;
        });

        // Skills section
        const skillsContainer = document.getElementById('skills-container');
        skillsContainer.innerHTML = '';

        data.skills.forEach((skill, index) => {
            const skillCard = document.createElement('div');
            skillCard.className = 'glass-card skill-card animate-on-scroll';
            skillCard.style.animationDelay = `${index * 0.1}s`;

            const keywordTags = skill.keywords
                .map(keyword => `<span class="skill-tag">${keyword}</span>`)
                .join('');

            skillCard.innerHTML = `
                <h3 class="skill-category">${skill.name}</h3>
                <div class="skill-keywords">
                    ${keywordTags}
                </div>
            `;
            skillsContainer.appendChild(skillCard);
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

    // Active section tracking for navigation
    function initActiveNavigation() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        const navLinksContainer = document.querySelector('.nav-links');

        if (!navLinksContainer) return;

        const observerOptions = {
            threshold: [0, 0.25, 0.5, 0.75, 1],
            rootMargin: '-80px 0px -60% 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.25) {
                    const sectionId = entry.target.getAttribute('id');

                    // Remove active class from all links
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                    });

                    // Add active class to current link
                    const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
                    if (activeLink) {
                        activeLink.classList.add('active');
                        navLinksContainer.classList.add('has-active');

                        // Calculate position for liquid underline with slight delay for smoother animation
                        requestAnimationFrame(() => {
                            const linkRect = activeLink.getBoundingClientRect();
                            const containerRect = navLinksContainer.getBoundingClientRect();
                            const leftOffset = linkRect.left - containerRect.left;
                            const width = linkRect.width;

                            navLinksContainer.style.setProperty('--underline-left', `${leftOffset}px`);
                            navLinksContainer.style.setProperty('--underline-width', `${width}px`);
                        });
                    }
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            observer.observe(section);
        });

        // Set initial active state for first visible section
        setTimeout(() => {
            const firstVisibleSection = Array.from(sections).find(section => {
                const rect = section.getBoundingClientRect();
                return rect.top >= 0 && rect.top <= window.innerHeight / 2;
            });

            if (firstVisibleSection) {
                const sectionId = firstVisibleSection.getAttribute('id');
                const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                    navLinksContainer.classList.add('has-active');

                    const linkRect = activeLink.getBoundingClientRect();
                    const containerRect = navLinksContainer.getBoundingClientRect();
                    const leftOffset = linkRect.left - containerRect.left;
                    const width = linkRect.width;

                    navLinksContainer.style.setProperty('--underline-left', `${leftOffset}px`);
                    navLinksContainer.style.setProperty('--underline-width', `${width}px`);
                }
            }
        }, 100);
    }

    // Initialize app
    loadData();

    // Initialize active navigation after content loads
    setTimeout(() => {
        initActiveNavigation();
    }, 500);
})();
