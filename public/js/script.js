// Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('three-scene'),
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xf0f4f8);

// Add some 3D objects to the scene
const geometry = new THREE.SphereGeometry(1, 32, 32);
const material = new THREE.MeshBasicMaterial({ color: 0x007bff });
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

const geometry2 = new THREE.BoxGeometry(1, 1, 1);
const material2 = new THREE.MeshBasicMaterial({ color: 0xf2f2f2 });
const box = new THREE.Mesh(geometry2, material2);
box.position.x = 2;
scene.add(box);

camera.position.z = 5;

function animate() {
    requestAnimationFrame(animate);
    sphere.rotation.y += 0.01;
    box.rotation.y += 0.01;
    renderer.render(scene, camera);
}

animate();
