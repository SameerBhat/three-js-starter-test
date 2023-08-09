import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

import Stats from "three/examples/jsm/libs/stats.module";
import {GUI} from "three/examples/jsm/libs/dat.gui.module";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader";

const wheels:any[] = [];
const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(10));

scene.background = new THREE.Color( 0x333333 );
scene.environment = new RGBELoader().load( '/assets/textures/venice_sunset_1k.hdr', () => {

});
scene.environment.mapping = THREE.EquirectangularReflectionMapping;
scene.fog = new THREE.Fog( 0x333333, 10, 15 );

const grid = new THREE.GridHelper( 20, 40, 0xffff00, 0xffffff );
const gridMaterial:any = grid.material;
gridMaterial.opacity = 0.2;
gridMaterial.depthWrite = false;
gridMaterial.transparent = true;
scene.add( grid );

const camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);
//camera.position.z = 2;
camera.position.set( 0, 3, 5.5 );

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( render );
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.85;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.maxDistance = 9;
controls.maxPolarAngle = THREE.MathUtils.degToRad( 90 );
controls.target.set( 0, 0.5, 0 );
controls.update();

const geometry = new THREE.SphereGeometry();
const material = new THREE.MeshBasicMaterial({
    color: 0xf0ff00,
    wireframe: true,
});

//const cube = new THREE.Mesh(geometry, material);
//scene.add(cube);

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

// Added Stats
const stats = Stats();
document.body.appendChild(stats.dom);

// Added dat.gui
const gui = new GUI();
/*const cubeFolder = gui.addFolder("Cube");
cubeFolder.add(cube.rotation, "x", 0, Math.PI * 2);
cubeFolder.add(cube.rotation, "y", 0, Math.PI * 2);
cubeFolder.add(cube.rotation, "z", 0, Math.PI * 2);
cubeFolder.open();
 */
const cameraFolder = gui.addFolder("Camera");
cameraFolder.add(camera.position, "x", 0, 10);
cameraFolder.add(camera.position, "y", 0, 10);
cameraFolder.add(camera.position, "z", 0, 10);
cameraFolder.open();


const bodyMaterial = new THREE.MeshPhysicalMaterial( {
    color: 0xfff000, metalness: 1.0, roughness: 0.5, clearcoat: 1.0, clearcoatRoughness: 0.03
} );
const detailsMaterial = new THREE.MeshStandardMaterial( {
    color: 0xffffff, metalness: 1.0, roughness: 0.5
} );

const glassMaterial = new THREE.MeshPhysicalMaterial( {
    color: 0xffffff, metalness: 0.25, roughness: 0, transmission: 1.0
} );

const dracoLoader = new DRACOLoader();

const loader = new GLTFLoader();
loader.setDRACOLoader( dracoLoader );
dracoLoader.setDecoderPath('assets/decoders/');

const shadow = new THREE.TextureLoader().load( 'assets/models/ferrari_ao.png' );

loader.load( 'assets/models/ferrari.glb', function ( gltf ) {
    const carModel = gltf.scene.children[ 0 ];
    setMaterial(carModel, 'body', bodyMaterial);
    setMaterial(carModel, 'rim_fl', detailsMaterial);
    setMaterial(carModel, 'rim_fr', detailsMaterial);
    setMaterial(carModel, 'rim_rr', detailsMaterial);
    setMaterial(carModel, 'rim_rl', detailsMaterial);
    setMaterial(carModel, 'trim', detailsMaterial);
    setMaterial(carModel, 'glass', glassMaterial);
    wheels.push(
        carModel.getObjectByName( 'wheel_fl' ),
        carModel.getObjectByName( 'wheel_fr' ),
        carModel.getObjectByName( 'wheel_rl' ),
        carModel.getObjectByName( 'wheel_rr' )
    );
    // shadow
    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry( 0.655 * 4, 1.3 * 4 ),
        new THREE.MeshBasicMaterial( {
            map: shadow, blending: THREE.MultiplyBlending, toneMapped: false, transparent: true
        } )
    );
    mesh.rotation.x = - Math.PI / 2;
    mesh.renderOrder = 2;
    carModel.add( mesh );
    scene.add( carModel );
});

function setMaterial(carModel: any, objName: string, material: any) {
    const mesh = carModel.getObjectByName( objName ) as THREE.Mesh;
    if (mesh) {
        mesh.material = material;
    }
}

function animate() {
    requestAnimationFrame(animate);

    //cube.rotation.x += 0.001;
    //cube.rotation.y += 0.001;

    render();
    stats.update();
}

function render() {
    //renderer.render(scene, camera);
    controls.update();

    const time = - performance.now() / 1000;
    for ( let i = 0; i < wheels.length; i ++ ) {
        wheels[ i ].rotation.x = time * Math.PI * 2;
    }

    grid.position.z = - ( time ) % 1;

    renderer.render( scene, camera );
    stats.update();
}

animate();
