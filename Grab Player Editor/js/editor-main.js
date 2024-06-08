import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { VRButton } from "https://cdn.jsdelivr.net/npm/three@0.145.0/examples/jsm/webxr/VRButton.min.js";
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import * as SHADERS from './shaders.js';
let templates = await fetch('/level_data/templates.json').then(response => response.json());
let protobufData = await fetch('/proto/proto.proto').then(response => response.text());
let animationPresets = {};
//rendering scene
let renderer, scene;
let camera

//three
let sunAngle, sunAltitude, horizonColor, sky;

let loader = new GLTFLoader();

let lastRan = '';
let oldText = '';

//elements
const editInputElement = document.getElementById('edit-input');
const terminalInputElement = document.getElementById('terminal-input');
const renderContainerElement = document.getElementById('render-container');

const editor = ace.edit("edit-input");
editor.setTheme("ace/theme/my_custom_theme"); 
editor.session.setMode("ace/mode/json");

function getLevel() {
    return JSON.parse(editInputElement.innerText);
}
function initEditor() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / (window.innerHeight - 20), 0.1, 10000 );
    
    THREE.ColorManagement.enabled = true;
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
    renderer.setSize( window.innerWidth , window.innerHeight - 20 );
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(window.devicePixelRatio);

    renderContainerElement.appendChild( renderer.domElement );
    light = new THREE.AmbientLight(0xffffff);
    scene.add(light);
    sun = new THREE.DirectionalLight( 0xffffff, 0.5 );
    scene.add( sun );
    controls = new OrbitControls( camera, renderer.domElement );
    controls.mouseButtons = {LEFT: 2, MIDDLE: 1, RIGHT: 0}
    fly = new FlyControls( camera, renderer.domElement );
    fly.pointerdown = fly.pointerup = fly.pointermove = () => {};
    fly.dragToLook = false;
    fly.rollSpeed = 0;
    fly.movementSpeed = 0.2;
    transformControl.addEventListener( 'dragging-changed', ( event ) => {
        controls.enabled = ! event.value;
    } );
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    renderer.domElement.addEventListener( 'pointermove', onPointerMove, false );
    window.addEventListener( 'pointermove', onPointerMove, false );
    renderer.domElement.addEventListener( 'pointerdown', onPointerDown, false );
    window.addEventListener( 'keydown', onEditingKey, false );
    addEventListener('resize', () => {
        camera.aspect = window.innerWidth / (window.innerHeight - 20);
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight - 20 );
    });
    camera.position.set(0, 10, 10);
    renderer.setAnimationLoop(animate);
    renderer.render( scene, camera );

}
function animate() {
    let delta = clock.getDelta();
    delta *= animationSpeed;
    controls.update(delta);
    if (playAnimations) {
        animationTime += delta;
        timelineSliderElement.value = animationTime % timelineSliderElement.max;
        for(let object of animatedObjects) {
            updateObjectAnimation(object, animationTime)
        }
    }

	// requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
// function setLevel(level) {
//     console.log(level);
//     formatWarningElement.style.display = level.formatVersion < 6 ? "block" : "none";    
//     level.levelNodes ? {} : level.levelNodes = [];
//     level.levelNodes.forEach(node => {
//         if (node?.levelNodeStatic && node.levelNodeStatic.material == 8) {
//             node.levelNodeStatic.color ? {} : node.levelNodeStatic.color = {};
//             node.levelNodeStatic.color.r ? {} : node.levelNodeStatic.color.r = 0;
//             node.levelNodeStatic.color.g ? {} : node.levelNodeStatic.color.g = 0;
//             node.levelNodeStatic.color.b ? {} : node.levelNodeStatic.color.b = 0;
//         }
//     });

//     editInputElement.innerText = JSON.stringify(level, null, 4);
//     highlightTextEditor();
// }
async function initAttributes(){

    skyMaterial = new THREE.ShaderMaterial();
    skyMaterial.vertexShader = SHADERS.skyVS;
    skyMaterial.fragmentShader = SHADERS.skyFS;
    skyMaterial.flatShading = false;
    skyMaterial.depthWrite = false;
    skyMaterial.side = THREE.BackSide;

}
function highlightTextEditor() {
    let hasChanged = oldText != editInputElement.innerHTML;
    if (!hideText && hasChanged) {
        if (highlightText) {
            editInputElement.innerHTML = JsonToHighlightedText(editInputElement.innerText);
        } else {
            editInputElement.innerHTML = JSON.stringify(JSON.parse(editInputElement.innerText), null, 4);
        }
    }
    if (hasChanged) {
        refreshScene();
    }
    oldText = editInputElement.innerHTML;
}

function loadModel(path) {
    return new Promise((resolve) => {
        loader.load(path, function (gltf) {
            let object = gltf.scene.children[0];
            object.geometry.scale(-1, 1, -1);
            resolve(object);
        });
    });
}
function refreshScene() {
    console.log('Refreshing');
    let levelData = getLevel();

    if (!skyMaterial) {
        skyMaterial = new THREE.ShaderMaterial();
        skyMaterial.vertexShader = SHADERS.skyVS;
        skyMaterial.fragmentShader = SHADERS.skyFS;
        skyMaterial.flatShading = false;
        skyMaterial.depthWrite = false;
        skyMaterial.side = THREE.BackSide;
    }
    sunAngle = new THREE.Euler(THREE.MathUtils.degToRad(45), THREE.MathUtils.degToRad(315 + 180), 0.0);
    sunAltitude = 45
    skyMaterial.uniforms["cameraFogColor0"] = { value: [0.916, 0.9574, 0.9575] }
    skyMaterial.uniforms["cameraFogColor1"] = { value: [0.28, 0.476, 0.73] }
    skyMaterial.uniforms["sunSize"] = { value: 1 }
    horizonColor = [0.916, 0.9574, 0.9575]


    const sunDirection = new THREE.Vector3( 0, 0, 1 );
    sunDirection.applyEuler(sunAngle);

    const skySunDirection = sunDirection.clone()
    skySunDirection.x = skySunDirection.x;
    skySunDirection.y = skySunDirection.y;
    skySunDirection.z = skySunDirection.z;

    let sunColorFactor = 1.0 - sunAltitude / 90.0
    sunColorFactor *= sunColorFactor
    sunColorFactor = 1.0 - sunColorFactor
    sunColorFactor *= 0.8
    sunColorFactor += 0.2
    let sunColor = [horizonColor[0] * (1.0 - sunColorFactor) + sunColorFactor, horizonColor[1] * (1.0 - sunColorFactor) + sunColorFactor, horizonColor[2] * (1.0 - sunColorFactor) + sunColorFactor]

    skyMaterial.uniforms["sunDirection"] = { value: skySunDirection }
    skyMaterial.uniforms["sunColor"] = { value: sunColor }

    sky = new THREE.Mesh(shapes[1].geometry, skyMaterial);
    
    sky.frustumCulled = false
    sky.renderOrder = 1000
    scene.add(sky);

    console.log('Refreshed', scene, objects, animatedObjects);
    renderer.render( scene, camera );
}
function initTerminal() {
    terminalInputElement.addEventListener('keydown', (e) => {
        if (e.which === 13 && e.shiftKey === false && e.altKey === false) {
            e.preventDefault();
            let input = terminalInputElement.value;
            let level = getLevel();
            let success = 0;
            let fail = 0;
            level.levelNodes.forEach(node => {
                try {
                    eval(input);
                    success++;
                } catch (e) {
                    console.error(e)
                    fail++;
                }
            });
            terminalInputElement.placeholder = `[Enter] to run JS code in loop\n[Alt] & [Enter] to run JS code out of loop\n[Alt] & [UpArrow] for last ran\nvar level = getLevel()\nlevel.levelNodes.forEach(node => {})\n\n${success} success | ${fail} error${fail != 0 ? "\n[ctrl]+[shift]+[i] for details" : ""}`;
            setLevel(level);
            lastRan = input
            terminalInputElement.value = '';
        } else if (e.which === 13 && e.altKey === true && e.shiftKey === false) {
            e.preventDefault();
            let input = terminalInputElement.value;
            let level = getLevel();
            try {
                eval(input);
                terminalInputElement.placeholder = `[Enter] to run JS code in loop\n[Alt] & [Enter] to run JS code out of loop\n[Alt] & [UpArrow] for last ran\nvar level = getLevel()\nlevel.levelNodes.forEach(node => {})\n\nsuccess`;
            } catch (e) {
                console.error(e);
                terminalInputElement.placeholder = `[Enter] to run JS code in loop\n[Alt] & [Enter] to run JS code out of loop\n[Alt] & [UpArrow] for last ran\nvar level = getLevel()\nlevel.levelNodes.forEach(node => {})\n\nerror | [ctrl]+[shift]+[i] for details`;
            }
            
            setLevel(level);
            lastRan = input
            terminalInputElement.value = '';
        } else if (e.which === 38 && e.altKey === true) {
            e.preventDefault();
            terminalInputElement.value = lastRan;
        }
    });
}
function initUI(){
    editInputElement.addEventListener('blur', highlightTextEditor);
}


await initAttributes();
initEditor();
highlightTextEditor();
initTerminal();
initUI();
initURLParams();
loadConfig();
