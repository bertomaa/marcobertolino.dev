// Three.js Scene Setup for 3D Background
(function () {
    // Scene, Camera, Renderer
    const canvas = document.getElementById('bg-canvas');
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create geometric shapes
    const geometries = [
        new THREE.IcosahedronGeometry(1, 0),
        new THREE.OctahedronGeometry(1, 0),
        new THREE.TetrahedronGeometry(1, 0),
        new THREE.BoxGeometry(1, 1, 1)
    ];

    const material = new THREE.MeshPhongMaterial({
        color: 0x00d4ff,
        emissive: 0x0066aa,
        specular: 0x00d4ff,
        shininess: 50,
        wireframe: false,
        transparent: true,
        opacity: 0.7
    });

    const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0x7b2ff7,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });

    // Create mesh array
    const meshes = [];
    const meshCount = 25;

    for (let i = 0; i < meshCount; i++) {
        const geometry = geometries[Math.floor(Math.random() * geometries.length)];
        const useMaterial = Math.random() > 0.5 ? material : wireframeMaterial;
        const mesh = new THREE.Mesh(geometry, useMaterial);

        // Random position
        mesh.position.x = (Math.random() - 0.5) * 80;
        mesh.position.y = (Math.random() - 0.5) * 80;
        mesh.position.z = (Math.random() - 0.5) * 80;

        // Random scale
        const scale = Math.random() * 2 + 0.5;
        mesh.scale.set(scale, scale, scale);

        // Random rotation
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;

        // Store rotation speed
        mesh.userData.rotationSpeed = {
            x: (Math.random() - 0.5) * 0.01,
            y: (Math.random() - 0.5) * 0.01,
            z: (Math.random() - 0.5) * 0.01
        };

        // Store float animation
        mesh.userData.floatSpeed = Math.random() * 0.02 + 0.01;
        mesh.userData.floatOffset = Math.random() * Math.PI * 2;

        meshes.push(mesh);
        scene.add(mesh);
    }

    // Add particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 200;
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 100;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        color: 0x00d4ff,
        size: 0.15,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00d4ff, 1.5);
    pointLight1.position.set(20, 20, 20);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x7b2ff7, 1.5);
    pointLight2.position.set(-20, -20, -20);
    scene.add(pointLight2);

    // Mouse movement
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // Scroll effect
    let scrollY = 0;

    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
    });

    // Animation loop
    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.01;

        // Rotate and float meshes
        meshes.forEach((mesh) => {
            mesh.rotation.x += mesh.userData.rotationSpeed.x;
            mesh.rotation.y += mesh.userData.rotationSpeed.y;
            mesh.rotation.z += mesh.userData.rotationSpeed.z;

            // Float animation
            mesh.position.y += Math.sin(time * mesh.userData.floatSpeed + mesh.userData.floatOffset) * 0.01;
        });

        // Animate particles
        particles.rotation.y += 0.0005;

        // Camera movement based on mouse
        camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
        camera.position.y += (mouseY * 5 - camera.position.y) * 0.05;

        // Camera movement based on scroll
        camera.position.y = scrollY * 0.01;

        renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
})();
