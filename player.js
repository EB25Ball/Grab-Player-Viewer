import * as THREE from 'https://cdn.skypack.dev/three@v0.132.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three@v0.132.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@v0.132.0/examples/jsm/loaders/GLTFLoader.js';

const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('user_id');
const picker = document.getElementById('color-picker');
const playerInfo_Url = `https://api.slin.dev/grab/v1/get_user_info?user_id=${userId}`;//edit this later to use the config https://api.slin.dev/grab/v1/ and then just call it with fetch(configname_here + 'get_user_info?' + `user_id=${userId}`)
const shopCatalog = `https://api.slin.dev/grab/v1/get_shop_catalog?version=1`;//edit this later to use the config https://api.slin.dev/grab/v1/ and then just call it with fetch(configname_here + 'get_user_info?' + `user_id=${userId}`)
let categoryResponse = await fetch(shopCatalog);
let categoryResponseBody = await categoryResponse.json();
let player_model;
let activePrim_Div;
let activeSec_Div;
let playerPrim_Color;
let playerSec_Color;
let custmoizationState = 0;
let primaryOpened = false;//god tier naming, but this check if the primary/secondary color menu was opened
let secondaryOpened = false;
let cosmeticCategories = document.getElementsByClassName("cosmeticCategories")
let shopItemsResponse = await fetch('https://api.slin.dev/grab/v1/get_shop_items?version=1');
let shopData = await shopItemsResponse.json()
let shopItems = []
let visorColor;
let files = {}
for (var item1 in categoryResponseBody) {
    if (categoryResponseBody[item1].title !== 'Item Packs' &&
        categoryResponseBody[item1].title !== 'Change Detail Color' &&
        categoryResponseBody[item1].title !== 'Change Main Color') {
        let title = categoryResponseBody[item1].title
        files[title] = {}
        for (var i = 0; i < categoryResponseBody[item1].items.length; i++) {
            var itemName = categoryResponseBody[item1].items[i];
            for (var item in shopData) {
                const cosmeticItem = shopData[item];
                if (item === itemName) {
                    let materialList = []
                    for (var e in cosmeticItem.materials_v2) {
                        if (cosmeticItem.materials_v2[e].type) {
                            materialList.push(cosmeticItem.materials_v2[e].type)
                        } else {
                            materialList.push(cosmeticItem.materials_v2[e])
                        }
                    } 
                    files[title][itemName] = {
                        file: cosmeticItem.file + '.glb',
                        name: cosmeticItem.title,
                        primaryColor: cosmeticItem.colors ? cosmeticItem.colors[0] : undefined,
                        secondaryColor: cosmeticItem.colors ? (cosmeticItem.colors[1] ? cosmeticItem.colors[1] : undefined) : undefined,
                        materials: materialList
                    }
                }
            }
        }
    }
}




function ConvertHSVToRGB(h, s, v, alpha) {
    let hi = h * 3.0 / Math.PI
    const f = hi - Math.floor(hi)

    if (hi >= 3.0)
        hi -= 6.0
    if (hi < -3.0)
        hi += 6.0

    let r = Math.max(v, 0.0)
    let g = Math.max(v - s * v, 0.0)
    let b = Math.max(v - s * f * v, 0.0)
    let a = Math.max(v - s * (1.0 - f) * v, 0.0)

    if (hi < -2.0) {
        return { r: r, g: a, b: g, a: alpha }
    }
    else if (hi < -1.0) {
        return { r: b, g: r, b: g, a: alpha }
    }
    else if (hi < 0.0) {
        return { r: g, g: r, b: a, a: alpha }
    }
    else if (hi < 1.0) {
        return { r: g, g: b, b: r, a: alpha }
    }
    else if (hi < 2.0) {
        return { r: a, g: g, b: r, a: alpha }
    }
    else {
        return { r: r, g: g, b: b, a: alpha }
    }
}
function LinearToGamma(color) {
    let r = color.r
    let g = color.g
    let b = color.b

    if (r <= 0.0031308) {
        r = r * 12.92
    }
    else {
        r = 1.055 * Math.pow(r, 1.0 / 2.4) - 0.055
    }

    if (g <= 0.0031308) {
        g = g * 12.92
    }
    else {
        g = 1.055 * Math.pow(g, 1.0 / 2.4) - 0.055
    }

    if (b <= 0.0031308) {
        b = b * 12.92
    }
    else {
        b = 1.055 * Math.pow(b, 1.0 / 2.4) - 0.055
    }

    return { r: r, g: g, b: b, a: color.a }
}

function GetColor(row, column) {
    let color
    if (row === 0) {
        return color = ConvertHSVToRGB(0.0, 0.0, 1.0 - column / 10.0);
    }
    if (row <= 5 && row != 0) {
        return color = ConvertHSVToRGB(2.0 * Math.PI * column / 10.0, 1.0, row / (10.0 - 4.0));

    }
    else {
        return color = ConvertHSVToRGB(2.0 * Math.PI * column / 10.0, 1.0 - (row - 5.0) / (10.0 - 5.0), 1.0);
    }
}
for (let w = 0; w < 100; w++) {
    const container = document.createElement('div');
    const lastWholeDigitNum = w % 10;
    const firstWholeDigitNum = Math.floor(w / 10);
    container.classList.add(`column${lastWholeDigitNum}`);
    container.classList.add(`row${firstWholeDigitNum}`);
    container.onclick = function () {
        if (primaryOpened == true) {
            activePrim_Div = document.getElementsByClassName(container.className);
        }
        if (secondaryOpened == true) {
            activeSec_Div = document.getElementsByClassName(container.className);
        }
    }
    container.onmouseover = function () {
        container.style.outline = '3px solid #333';
        container.style.cursor = 'pointer';
    };
    container.onmouseout = function () {
        container.style.outline = 'none';
        container.style.cursor = 'pointer';
        if (activePrim_Div && primaryOpened == true) { activePrim_Div[0].style.outline = '3px solid #333'; }
        if (activeSec_Div && secondaryOpened == true) { activeSec_Div[0].style.outline = '3px solid #333'; }
    };
    container.setAttribute("hsvValue", `rgb(${GetColor(firstWholeDigitNum, lastWholeDigitNum).r},${GetColor(firstWholeDigitNum, lastWholeDigitNum).g},${GetColor(firstWholeDigitNum, lastWholeDigitNum).b})`)
    container.style.backgroundColor = `rgb(${Math.floor(LinearToGamma(GetColor(firstWholeDigitNum, lastWholeDigitNum)).r * 255)}, ${Math.floor(LinearToGamma(GetColor(firstWholeDigitNum, lastWholeDigitNum)).g * 255)}, ${Math.floor(LinearToGamma(GetColor(firstWholeDigitNum, lastWholeDigitNum)).b * 255)})`;
    picker.appendChild(container);
}
let primColor;
function setPrimaryColor(e) {
    let modelNodes = [
        "Cylinder005",
        "Mesh004"
    ];
    const color = e.target.style.backgroundColor;
    if (color) {
        primColor = color;
        if (player_model) {
            player_model.traverse(function (node) {
                if (node.isMesh && modelNodes.includes(node.name)) {
                    node.material.color.set(color);
                }
            });
        }
    }
    renderer.render(scene, camera);
    createMenu();
    document.querySelectorAll('#color-picker div').forEach(e => { e.style.outline = 'none'; e.style.display = 'none'; });
    primaryOpened = false;

    document.removeEventListener('click', setPrimaryColor);
    document.getElementById("back-btn").style.display = "none";

}
let secColor;
function setSecondaryColor(e) {
    let modelNodes = [
        "Cylinder005_1",
        "Cylinder005_2",
        "Mesh004_1"
    ];
    if (e.target.parentNode.id !== 'color-picker') return;
    const color = e.target.style.backgroundColor;
    if (color) {
        secColor = color;
        const extractColor = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        visorColor = `rgb(${Math.ceil(parseInt(extractColor[1], 10) / 2)},${Math.ceil(parseInt(extractColor[2], 10) / 2)},${Math.ceil(parseInt(extractColor[3], 10) / 2)})`;
        if (player_model) {
            player_model.traverse(function (node) {
                if (node.isMesh && modelNodes.includes(node.name)) {
                    node.material.color.set(color);
                }
                if (node.isMesh && node.name === "Cylinder005_2") {
                    node.material.color.set(visorColor);
                    //darkened visor color fyi, this is correct darkenment
                }
            });
        }
    }
    renderer.render(scene, camera);

    createMenu();

    document.querySelectorAll('#color-picker div').forEach(e => { e.style.outline = 'none'; e.style.display = 'none'; });
    secondaryOpened = false;

    document.removeEventListener('click', setSecondaryColor);
    document.getElementById("back-btn").style.display = "none";

}



addEventListener('click', (e) => {
    if (e.target.id == 'primary') {
        custmoizationState = 1;
        document.getElementById("back-btn").style.display = "block";
        primaryOpened = true;
        e.target.style.display = 'none';
        document.getElementById('secondary').style.display = 'none';
        document.getElementById('cosmetics').style.display = 'none';
        document.querySelectorAll('#color-picker div').forEach(e => e.style.display = 'block');
        if (activePrim_Div) {
            activePrim_Div[0].style.outline = '3px solid #333';
        }
        document.addEventListener('click', setPrimaryColor);

    } else if (e.target.id == 'secondary') {
        custmoizationState = 1;
        document.getElementById("back-btn").style.display = "block";
        secondaryOpened = true;
        e.target.style.display = 'none';
        document.getElementById('primary').style.display = 'none';
        document.getElementById('cosmetics').style.display = 'none';
        document.querySelectorAll('#color-picker div').forEach(e => e.style.display = 'block');
        if (activeSec_Div) {
            activeSec_Div[0].style.outline = '3px solid #333';
        }
        document.addEventListener('click', setSecondaryColor);
    } else if (e.target.id == 'cosmetics') {
        document.getElementById("back-btn").style.display = "block";
        custmoizationState = 2;
        e.target.style.display = 'none';
        document.getElementById('primary').style.display = 'none';
        document.getElementById('secondary').style.display = 'none';
        createCosmeticCategories();
    }
    else if (e.target.id == 'back-btn') {
        backClicked()
    }

});

let categories = [];

for (let i = 0; i < categoryResponseBody.length; i++) {
    if (
        categoryResponseBody[i].title !== 'Item Packs' &&
        categoryResponseBody[i].title !== 'Change Detail Color' &&
        categoryResponseBody[i].title !== 'Change Main Color'
    ) {
        categories.push(categoryResponseBody[i].title);
    }
}


function createCosmeticCategories() {

    if (cosmeticCategories !== null || cosmeticCategories !== undefined) {
        for (let i = 0; i < 6; i++) {
            const cosmeticCategories = document.createElement("span")
            cosmeticCategories.innerHTML = `${categories[i]}`
            cosmeticCategories.style.gridColumn = `1 / 10`
            cosmeticCategories.style.gridRow = `${i} / 6`
            cosmeticCategories.className = "cosmeticCategories";
            picker.appendChild(cosmeticCategories);
            cosmeticCategories.addEventListener("click", catgorySelect)
        }
    } else {
        for (var i = 0; i < cosmeticCategories.length; i++) {
            cosmeticCategories[i].style.display = 'block';
            cosmeticCategories.innerHTML = `${categories[i]}`
            cosmeticCategories.style.gridColumn = `1 / 10`;
            cosmeticCategories.style.gridRow = `${i} / 6`;
        }
    }
}

function catgorySelect() {
    const selectedCategory = this.innerHTML;
    for (let i = 0; i < 6; i++) {
        const colorPickerSpans = document.querySelectorAll('#color-picker span');
        colorPickerSpans.forEach(span => {
            if (span.id !== 'cosmetics' && span.id !== 'primary' && span.id !== 'secondary') {
                span.remove();
            }
        });
    }
    createCosmetics(selectedCategory);
    animates();
}
function createMenu() {
    document.getElementById('cosmetics').style.display = 'block';
    document.getElementById('primary').style.display = 'block';
    document.getElementById('secondary').style.display = 'block';
}
function backClicked() {
    switch (custmoizationState) {
        case 1://color picker to menu
            document.querySelectorAll('#color-picker div').forEach(e => { e.style.outline = 'none'; e.style.display = 'none'; });
            document.getElementById("back-btn").style.display = "none";
            createMenu();
            if (secondaryOpened == true) {
                secondaryOpened = false;
                document.removeEventListener('click', setSecondaryColor);
            }
            if (primaryOpened == true) {
                primaryOpened = false;
                document.removeEventListener('click', setPrimaryColor);
            }
            custmoizationState = 0;

            break;
        case 2://cosmetics catogory to menu
            custmoizationState = 0;
            for (var i = 0; i < cosmeticCategories.length; i++) {
                cosmeticCategories[i].style.display = 'none';
            }
            document.getElementById("back-btn").style.display = "none";
            createMenu();
            break;
        case 3://cosmetics to cosmetics cagory
            custmoizationState = 2;
            var contentChildren = document.getElementById("content").childNodes;
            for (var i = contentChildren.length - 1; i >= 0; i--) {
                var child = contentChildren[i];
                document.getElementById("content").removeChild(child);
            }

            picker.style.display = "grid";
            createCosmeticCategories();
            document.getElementById("customizations").style.height = "399px";

            break;

    }
}

const scene = new THREE.Scene();
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
const dirLight = new THREE.DirectionalLight(0x999999, 0.5)

dirLight.position.set(0, 1, 2);
scene.add(ambientLight);
scene.add(dirLight);
const camera = new THREE.PerspectiveCamera(55, 400 / 450, 0.1, 1000);
camera.position.z = 2.5;
camera.rotation.x = -0.1;

const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector('.player-model'), alpha: true, transparent: true, antialias: true });
renderer.setSize(400, 450);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = true;
controls.enablePan = false;
controls.minPolarAngle = Math.PI / 2;
controls.maxPolarAngle = Math.PI / 2;
controls.addEventListener('start', () => {
    document.body.style.cursor = 'none';
});

controls.addEventListener('end', () => {
    document.body.style.cursor = 'auto';
});

scene.background = null;
const player_group = new THREE.Group();
scene.add(player_group);

const cos_group = new THREE.Group();
let model;

const loader = new GLTFLoader();
loader.load('playerModel/player.glb', function (gltf) {
    player_model = gltf.scene;
    dirLight.target = player_model;
    SetColors();
    player_model.position.y = 0.2;
    player_group.add(player_model);
});
const toggledButtonsByCategory = {};
const toggledElements = [];
async function SetColors() {
    let OffsetY;
    let OffsetRoty;
    let OffsetRotx;
    let OffsetRotz;
    let OffsetX;
    let OffsetScale;
    let OffsetZ;
    let playerHat
    let playerHead
    let playerGrapple
    let playerCheckpoint
    let playerFaceWear
    if (player_model) {
        if (userId) {
            let response = await fetch(playerInfo_Url);
            let responseBody = await response.json();
            playerPrim_Color = responseBody.active_customizations.player_color_primary.color;
            playerSec_Color = responseBody.active_customizations.player_color_secondary.color;
            playerHat = responseBody.active_customizations.items["head/hat"];
            playerGrapple = responseBody.active_customizations.items["grapple/hook"];
            playerCheckpoint = responseBody.active_customizations.items["checkpoint"];
            playerHead = responseBody.active_customizations.items["head"];
            playerFaceWear = responseBody.active_customizations.items["head/glasses"];
            if (playerCheckpoint == 'checkpoint_lifebuoyflag_basic') playerCheckpoint = 'checkpoint_lifebuoy_flag_basic'//file name stuff so had to add Underscore
            if (playerCheckpoint !== undefined) {
                OffsetX = 0.5;
                OffsetY = -1.25
                OffsetScale = 0.75;
                OffsetZ = -0.5;
                cosmeticsOnLoad(playerCheckpoint.replace("checkpoint_", "cosmetics/checkpoint/") + ".glb", undefined/*offsetrotx*/, undefined/*OffsetRoty*/, undefined/*OffsetRotz*/, OffsetScale/*OffsetScale*/, OffsetX/*OffsetX*/, OffsetY/*OffsetY*/, OffsetZ/*OffsetZ*/, 'Checkpoints')
                if (!toggledElements.includes(playerCheckpoint.replace("checkpoint_", "cosmetics/checkpoint/") + ".glb")) {
                    toggledElements.push(playerCheckpoint.replace("checkpoint_", "cosmetics/checkpoint/") + ".glb");
                }
            }
            if (playerGrapple !== undefined) {
                OffsetZ = -0.5;
                OffsetY = -1.00;
                OffsetX = -0.5;

                OffsetRotx = Math.PI / 2;
                OffsetRotz = Math.PI * 4 / 2;
                cosmeticsOnLoad(playerGrapple.replace("grapple_hook_", "cosmetics/grapple/hook/") + ".glb", OffsetRotx/*offsetrotx*/, undefined/*OffsetRoty*/, OffsetRotz/*OffsetRotz*/, undefined/*OffsetScale*/, OffsetX/*OffsetX*/, OffsetY/*OffsetY*/, OffsetZ/*OffsetZ*/, 'Grapples')
                if (!toggledElements.includes(playerGrapple.replace("grapple_hook_", "cosmetics/grapple/") + ".glb")) {
                    toggledElements.push(playerGrapple.replace("grapple_hook_", "cosmetics/grapple/") + ".glb");
                }
            }
            if (playerHat !== undefined) {
                OffsetY = player_model.children[0].position.y + 0.20;
                OffsetRoty = 3.0;

                cosmeticsOnLoad(playerHat.replace('head_hat_', 'cosmetics/head/hat/'), undefined, OffsetRoty, undefined, undefined, undefined, OffsetY, undefined, 'Hats')
                if (!toggledElements.includes(playerHat.replace("head_", "cosmetics/head/hat/") + ".glb")) {
                    toggledElements.push(playerHat.replace("head_", "cosmetics/head/hat/") + ".glb");
                }
            }
            if (playerFaceWear !== undefined) {
                OffsetY = player_model.children[0].position.y + 0.2;
                if (playerFaceWear == 'cosmetics/head/glasses/glasses_nerd') {
                    OffsetZ = player_model.children[0].position.z + 0.035;
                    cosmeticsOnLoad(playerFaceWear.replace("head_glasses_", "cosmetics/head/glasses/") + ".glb", undefined/*offsetrotx*/, undefined/*OffsetRoty*/, undefined/*OffsetRotz*/, undefined/*OffsetScale*/, -undefined/*OffsetX*/, OffsetY/*OffsetY*/, OffsetZ/*OffsetRotz*/, 'Facewear')

                } else {
                    cosmeticsOnLoad(playerFaceWear.replace("head_glasses_", "cosmetics/head/glasses/") + ".glb", undefined/*offsetrotx*/, undefined/*OffsetRoty*/, undefined/*OffsetRotz*/, undefined/*OffsetScale*/, -undefined/*OffsetX*/, OffsetY/*OffsetY*/, undefined/*OffsetRotz*/, 'Facewear')

                }

                if (!toggledElements.includes(playerFaceWear.replace("head_", "cosmetics/head/glasses/") + ".glb")) {
                    toggledElements.push(playerFaceWear.replace("head_", "cosmetics/head/glasses/") + ".glb");
                }
            }
            if (playerHead !== undefined) {
                OffsetY = player_model.children[0].position.y + 0.2;
                OffsetRoty = Math.PI * 2 / 2;
                cosmeticsOnLoad(playerHead.replace("head_", "cosmetics/head/head/") + ".glb", undefined/*offsetrotx*/, OffsetRoty/*OffsetRoty*/, undefined/*OffsetRotz*/, undefined/*OffsetScale*/, -undefined/*OffsetX*/, OffsetY/*OffsetY*/, undefined/*OffsetRotz*/, 'Heads')
                if (!toggledElements.includes(playerHead.replace("head_", "cosmetics/head/head/") + ".glb")) {
                    toggledElements.push(playerHead.replace("head_", "cosmetics/head/head/") + ".glb");
                }
            }
            function cosmeticsOnLoad(modelFile, OffsetRotx, OffsetRoty, OffsetRotz, OffsetScale, OffsetX, OffsetY, OffsetZ, modelCat) {
                if (!modelFile.includes(".glb")) {
                    modelFile = modelFile + '.glb';
                }
                loader.load(modelFile.replace(/(_primary).*$/i, ".glb"), (model) => {
                    if (OffsetX) model.scene.position.x = OffsetX;
                    if (OffsetY) model.scene.position.y = OffsetY;
                    if (OffsetScale) model.scene.scale.set(OffsetScale, OffsetScale, OffsetScale);
                    if (OffsetZ) model.scene.position.z = OffsetZ;
                    if (OffsetRoty) model.scene.rotation.y = OffsetRoty;
                    if (OffsetRotx) model.scene.rotation.x = OffsetRotx;
                    if (OffsetRotz) model.scene.rotation.z = OffsetRotz;

                    let categoryFiles = files[modelCat]
                    for (var cosItem in categoryFiles) {
                        if (categoryFiles[cosItem].file == modelFile) {
                            let x = 0;
                           
                            model.scene.traverse(function (node) {
                                if (node.name !== 'Scene') {
                                    if (categoryFiles[cosItem].materials.indexOf("default_primary_color") !== -1 &&categoryFiles[cosItem].primaryColor==undefined) {
                                        if (x == categoryFiles[cosItem].materials.indexOf("default_primary_color")) {
                                            node.material.color.set(primColor);
                                            console.log(x);
                                        }
                                    }
                                    if (categoryFiles[cosItem].materials.indexOf("default_secondary_color") !== -1) {
                                        if (x == categoryFiles[cosItem].materials.indexOf("default_secondary_color")) {
                                            node.material.color.set(secColor);
                                        }
                                    }
                                    if (categoryFiles[cosItem].materials.indexOf("default_secondary_color_visor") !== -1) {
                                        if (x == categoryFiles[cosItem].materials.indexOf("default_secondary_color_visor")) {                            
                                            node.material.color.set(`#${parseInt(Math.floor(LinearToGamma({ r: playerSec_Color[0], g: playerSec_Color[1], b: playerSec_Color[2], a: 1 }).r * 255 / 2)).toString(16).padStart(2, '0')}${parseInt(Math.floor(LinearToGamma({ r: playerSec_Color[0], g: playerSec_Color[1], b: playerSec_Color[2], a: 1 }).g * 255 / 2)).toString(16).padStart(2, '0')}${parseInt(Math.floor(LinearToGamma({ r: playerSec_Color[0], g: playerSec_Color[1], b: playerSec_Color[2], a: 1 }).b * 255 / 2)).toString(16).padStart(2, '0')}`);
                                            player_model.children[0].visible=false;

                                        }
                                    }
                                    if(categoryFiles[cosItem].materials.indexOf("default_primary_color") == -1 &&categoryFiles[cosItem].primaryColor){
                                        if(x==0){
                                            node.material.color.set(`#${ Math.round(categoryFiles[cosItem].primaryColor[0] * 255).toString(16).padStart(2, '0')}${Math.round(categoryFiles[cosItem].primaryColor[1] * 255).toString(16).padStart(2, '0')}${ Math.round(categoryFiles[cosItem].primaryColor[2] * 255).toString(16).padStart(2, '0')}`)
                                        }
                                    }
                                    if(categoryFiles[cosItem].materials.indexOf("default_secondary_color") == -1 &&categoryFiles[cosItem].secColor){
                                        node.material.color.set(`#${ Math.round(categoryFiles[cosItem].secondaryColor[0] * 255).toString(16).padStart(2, '0')}${Math.round(categoryFiles[cosItem].secondaryColor[1] * 255).toString(16).padStart(2, '0')}${ Math.round(categoryFiles[cosItem].secondaryColor[2] * 255).toString(16).padStart(2, '0')}`)
                                    }
                                    
                                    x++;
                                }


                               
                            }); 
                            if (!toggledElements.includes(modelFile)) {
                                    toggledElements.push(modelFile);
                                }
                        }
                    }

                   
                    model.scene.name = modelFile;
                    scene.add(model.scene)
                });
            }

            let primaryNodes = [
                "Cylinder005",
                "Mesh004"
            ];
            let secondaryNodes = [
                "Cylinder005_1",//head lines
                "Cylinder005_2",//visor
                "Mesh004_1"//body outlines
            ];

            const Color_Buttons = document.querySelectorAll('.ColorButtons');
            Color_Buttons.forEach(element => {
                const backgroundColor = element.style.backgroundColor;
                if (backgroundColor === `rgb(${Math.floor(LinearToGamma({ r: playerPrim_Color[0], g: playerPrim_Color[1], b: playerPrim_Color[2], a: 1 }).r * 255)}, ${Math.floor(LinearToGamma({ r: playerPrim_Color[0], g: playerPrim_Color[1], b: playerPrim_Color[2], a: 1 }).g * 255)}, ${Math.floor(LinearToGamma({ r: playerPrim_Color[0], g: playerPrim_Color[1], b: playerPrim_Color[2], a: 1 }).b * 255)})`) {
                    activePrim_Div = document.getElementsByClassName(element.className);
                }
                if (backgroundColor === `rgb(${Math.floor(LinearToGamma({ r: playerSec_Color[0], g: playerSec_Color[1], b: playerSec_Color[2], a: 1 }).r * 255)}, ${Math.floor(LinearToGamma({ r: playerSec_Color[0], g: playerSec_Color[1], b: playerSec_Color[2], a: 1 }).g * 255)}, ${Math.floor(LinearToGamma({ r: playerSec_Color[0], g: playerSec_Color[1], b: playerSec_Color[2], a: 1 }).b * 255)})`) {
                    activeSec_Div = document.getElementsByClassName(element.className);
                }

            });
            player_model.traverse(function (node) {
                if (node.isMesh && primaryNodes.includes(node.name)) {
                    node.material.color.set(`rgb(${Math.floor(LinearToGamma({ r: playerPrim_Color[0], g: playerPrim_Color[1], b: playerPrim_Color[2], a: 1 }).r * 255)},${Math.floor(LinearToGamma({ r: playerPrim_Color[0], g: playerPrim_Color[1], b: playerPrim_Color[2], a: 1 }).g * 255)},${Math.floor(LinearToGamma({ r: playerPrim_Color[0], g: playerPrim_Color[1], b: playerPrim_Color[2], a: 1 }).b * 255)})`);
                    primColor = `rgb(${Math.floor(LinearToGamma({ r: playerPrim_Color[0], g: playerPrim_Color[1], b: playerPrim_Color[2], a: 1 }).r * 255)},${Math.floor(LinearToGamma({ r: playerPrim_Color[0], g: playerPrim_Color[1], b: playerPrim_Color[2], a: 1 }).g * 255)},${Math.floor(LinearToGamma({ r: playerPrim_Color[0], g: playerPrim_Color[1], b: playerPrim_Color[2], a: 1 }).b * 255)})`
                    secColor = `rgb(${Math.floor(LinearToGamma({ r: playerSec_Color[0], g: playerSec_Color[1], b: playerSec_Color[2], a: 1 }).r * 255)},${Math.floor(LinearToGamma({ r: playerSec_Color[0], g: playerSec_Color[1], b: playerSec_Color[2], a: 1 }).g * 255)},${Math.floor(LinearToGamma({ r: playerSec_Color[0], g: playerSec_Color[1], b: playerSec_Color[2], a: 1 }).b * 255)})`
                }
                if (node.isMesh && secondaryNodes.includes(node.name)) {
                    node.material.color.set(`rgb(${Math.floor(LinearToGamma({ r: playerSec_Color[0], g: playerSec_Color[1], b: playerSec_Color[2], a: 1 }).r * 255)},${Math.floor(LinearToGamma({ r: playerSec_Color[0], g: playerSec_Color[1], b: playerSec_Color[2], a: 1 }).g * 255)},${Math.floor(LinearToGamma({ r: playerSec_Color[0], g: playerSec_Color[1], b: playerSec_Color[2], a: 1 }).b * 255)})`);
                }
                if (node.isMesh && node.name === "Cylinder005_2") {
                    node.material.color.set(`rgb(${Math.floor(LinearToGamma({ r: playerSec_Color[0], g: playerSec_Color[1], b: playerSec_Color[2], a: 1 }).r * 255 / 2)},${Math.floor(LinearToGamma({ r: playerSec_Color[0], g: playerSec_Color[1], b: playerSec_Color[2], a: 1 }).g * 255 / 2)},${Math.floor(LinearToGamma({ r: playerSec_Color[0], g: playerSec_Color[1], b: playerSec_Color[2], a: 1 }).b * 255 / 2)})`);
                }
            });
        }
    }
}



let canvas;

var scenes = [], renderer1;

function createCosmetics(selectedCategory) {
    custmoizationState = 3;
    let OffsetY;
    let OffsetRoty;
    let OffsetRotx;
    let OffsetRotz;
    let OffsetX;
    let OffsetScale;
    let OffsetZ;
    picker.style.display = "none";
    document.getElementById("customizations").style.height = "100%";
    let categoryFiles;
    if (selectedCategory === 'Heads') {
        categoryFiles = files[selectedCategory];
        OffsetY = player_model.children[0].position.y + 0.2;
        OffsetRoty = Math.PI * 2 / 2;
    } else if (selectedCategory === 'Hats') {
        categoryFiles = files[selectedCategory];
        OffsetY = player_model.children[0].position.y + 0.20;
        OffsetRoty = 3.0;
    } else if (selectedCategory === 'Facewear') {
        categoryFiles = files[selectedCategory];
        OffsetY = player_model.children[0].position.y + 0.2;
    } else if (selectedCategory === 'Grapples') {
        categoryFiles = files[selectedCategory];
        OffsetZ = -0.5;
        OffsetY = -1.00;
        OffsetX = -0.5;

        OffsetRotx = Math.PI / 2;
        OffsetRotz = Math.PI * 4 / 2;

    } else if (selectedCategory === 'Checkpoints') {
        categoryFiles = files[selectedCategory];
        OffsetX = 0.5;
        OffsetY = -1.25;
        OffsetScale = 1;
        OffsetZ = -0.5;


    } else if (selectedCategory === "Hands") {
        categoryFiles = files[selectedCategory];
        OffsetRotx = -Math.PI / 2;;
        OffsetRotz = -Math.PI / 2;
        OffsetX = 0.3;
        OffsetY = -0.65;
    }
    canvas = document.getElementById("canvas");
    var element2 = document.getElementById("body")
    var positionInfo = element2.getBoundingClientRect();
    var height2 = positionInfo.height;
    var width2 = positionInfo.width;
    canvas.style.height = height2;
    canvas.style.width2 = width2;
    var template = document.getElementById("template").text;
    var content = document.getElementById("content");
    for (let cosItem in categoryFiles) {
        var loader1 = new GLTFLoader();
        var scene1 = new THREE.Scene();
        var element = document.createElement("div");
        element.id = `${categoryFiles[cosItem].file}`
        element.className = "list-item";
        element.innerHTML = template.replace('Scene $', `${categoryFiles[cosItem].name}`);
        const previewButton = document.createElement('button');
        previewButton.style.height = '2em';
        previewButton.innerHTML = 'preview'
        previewButton.classList.add('previewButton', `${selectedCategory}`);
        previewButton.id = categoryFiles[cosItem].file;

        const category = selectedCategory;
        if (!toggledButtonsByCategory[category]) {
            toggledButtonsByCategory[category] = [];
        }
        if (toggledElements.includes(previewButton.id)) {
            previewButton.classList.toggle('toggled');
            previewButton.innerHTML = 'Un-equip';
            previewButton.style.backgroundColor = "#FF0000";
            toggledButtonsByCategory[category].push(previewButton);
        }
        previewButton.addEventListener('click', () => {

            previewButton.classList.toggle('toggled');

            if (previewButton.classList.contains('toggled')) {
                previewButton.innerHTML = 'Un-equip';
                previewButton.style.backgroundColor = "#FF0000";
                if (selectedCategory === 'Heads') {
                    player_model.children[0].visible = false;
                }//hhhhhhhhhhhhhhhhhhhhhh
                loader.load(categoryFiles[cosItem].file, function (gltf) {
                    model = gltf.scene;
                    model.name = categoryFiles[cosItem].file;
                    if (OffsetX) model.position.x = OffsetX;
                    if (OffsetY) model.position.y = OffsetY;
                    if (OffsetScale) model.scale.set(OffsetScale, OffsetScale, OffsetScale);
                    if (OffsetZ) model.position.z = OffsetZ;
                    if (OffsetRoty) model.rotation.y = OffsetRoty;
                    if (OffsetRotx) model.rotation.x = OffsetRotx;
                    if (OffsetRotz) model.rotation.z = OffsetRotz;
                    if (categoryFiles[cosItem].file == 'cosmetics/head/glasses/glasses_nerd.glb') {
                        model.position.z = 0.035;
                    }

                 if (selectedCategory === "Hands") {
                        const clonedModel = model.clone();
                        clonedModel.name = model.name;
                        clonedModel.position.x = -model.position.x;
                        scene.add(clonedModel)
                    }
                    let x = 0;
                   console.log(x);
                    model.traverse(function (node) {
                        console.log(node.name);
                        
                        if (node.name !== 'Scene') {
                            if (categoryFiles[cosItem].materials.indexOf("default_primary_color") !== -1 &&categoryFiles[cosItem].primaryColor==undefined) {
                                if (x == 1+categoryFiles[cosItem].materials.indexOf("default_primary_color")) {
                                    node.material.color.set(primColor);
                                    console.log(x);
                                }
                            }
                            if (categoryFiles[cosItem].materials.indexOf("default_secondary_color") !== -1) {
                                if (x == 1+categoryFiles[cosItem].materials.indexOf("default_secondary_color")) {
                                    node.material.color.set(secColor);
                                }
                            }
                            if (categoryFiles[cosItem].materials.indexOf("default_secondary_color_visor") !== -1) {
                                if (x == 1+categoryFiles[cosItem].materials.indexOf("default_secondary_color_visor")) {                            
                                    if(playerSec_Color){
                                    node.material.color.set(`#${parseInt(Math.floor(LinearToGamma({ r: playerSec_Color[0], g: playerSec_Color[1], b: playerSec_Color[2], a: 1 }).r * 255 / 2)).toString(16).padStart(2, '0')}${parseInt(Math.floor(LinearToGamma({ r: playerSec_Color[0], g: playerSec_Color[1], b: playerSec_Color[2], a: 1 }).g * 255 / 2)).toString(16).padStart(2, '0')}${parseInt(Math.floor(LinearToGamma({ r: playerSec_Color[0], g: playerSec_Color[1], b: playerSec_Color[2], a: 1 }).b * 255 / 2)).toString(16).padStart(2, '0')}`);
                                     } player_model.children[0].visible=false;
    
                                }
                            }
                            if(categoryFiles[cosItem].materials.indexOf("default_primary_color") == -1 &&categoryFiles[cosItem].primaryColor){
                                if(x==1){
                                    node.material.color.set(`#${ Math.round(categoryFiles[cosItem].primaryColor[0] * 255).toString(16).padStart(2, '0')}${Math.round(categoryFiles[cosItem].primaryColor[1] * 255).toString(16).padStart(2, '0')}${ Math.round(categoryFiles[cosItem].primaryColor[2] * 255).toString(16).padStart(2, '0')}`)
                                }
                            }
                            if(categoryFiles[cosItem].materials.indexOf("default_secondary_color") == -1 &&categoryFiles[cosItem].secColor){
                               if(x==2){
                                node.material.color.set(`#${ Math.round(categoryFiles[cosItem].secondaryColor[0] * 255).toString(16).padStart(2, '0')}${Math.round(categoryFiles[cosItem].secondaryColor[1] * 255).toString(16).padStart(2, '0')}${ Math.round(categoryFiles[cosItem].secondaryColor[2] * 255).toString(16).padStart(2, '0')}`)
                            }}
                            
                            x++;
                        } scene.add(model);
                    });
                    if (!toggledElements.includes(previewButton.id)) {
                        toggledElements.push(previewButton.id);
                    }
                });
            } else {
                previewButton.innerHTML = 'preview';
                previewButton.style.backgroundColor = "#00FF00";
                const index = toggledElements.indexOf(previewButton.id);
                if (index !== -1) {
                    toggledElements.splice(index, 1);
                }
                const loadedModel = scene.children.filter(obj => obj.name === previewButton.id);

                loadedModel.forEach(obj => {
                    scene.remove(obj);
                });
            }
            if (selectedCategory == 'Heads') {
                const allUntoggled = toggledButtonsByCategory[category].every(button => !button.classList.contains('toggled'));
                console.log("raggshkda");
                console.log(allUntoggled);
                if (allUntoggled) {
                   // player_model.children[0].visible = true;
                }
            }

            toggledButtonsByCategory[category] = toggledButtonsByCategory[category].filter(otherButton => {
                if (otherButton !== previewButton) {
                    otherButton.classList.remove('toggled');
                    otherButton.innerHTML = 'preview';
                    otherButton.style.backgroundColor = "#00FF00";
                    const loadedModel = scene.children.filter(obj => obj.name === otherButton.id);
                    const index = toggledElements.indexOf(otherButton.id);
                    if (index !== -1) {
                        toggledElements.splice(index, 1);
                    }
                    loadedModel.forEach(obj => {
                        scene.remove(obj);
                    });

                    // un-equips if they have the same category
                }
            });

            if (previewButton.classList.contains('toggled')) {
                toggledButtonsByCategory[category].push(previewButton);
            } else {
                const index = toggledButtonsByCategory[category].indexOf(previewButton);
                if (index !== -1) {
                    toggledButtonsByCategory[category].splice(index, 1);
                }
            }

        });

        element.appendChild(previewButton)
        scene1.userData.element = element.querySelector(".scene");
        content.appendChild(element);

        var camera1 = new THREE.PerspectiveCamera(50, 1, 1, 10);
        camera1.position.z = 2;

        scene1.userData.camera = camera1;
        (function (scene1) {
            loader1.load(categoryFiles[cosItem].file, function (gltf) {

                if (selectedCategory === "Grapples") {
                    gltf.scene.rotation.x = Math.PI / 2;
                    gltf.scene.rotation.z = Math.PI * 4 / 2;
                } else if (selectedCategory === "Heads") {
                    gltf.scene.rotation.y = Math.PI * 2 / 2;
                }
                else if (selectedCategory === "Hats") {
                    gltf.scene.rotation.y = Math.PI * 2 / 2;
                }
                else if (selectedCategory == "Hands") {
                    gltf.scene.rotation.x = Math.PI / 2;
                    gltf.scene.rotation.z = Math.PI / 2;
                    gltf.scene.scale.set(2, 2, 2);
                }
                let x = 0;
            
                gltf.scene.traverse(function (node) {
                    if (node.name !== 'Scene') {
                        if (categoryFiles[cosItem].materials.indexOf("default_primary_color") !== -1 &&categoryFiles[cosItem].primaryColor==undefined) {
                            if (x == categoryFiles[cosItem].materials.indexOf("default_primary_color")) {
                                node.material.color.set(primColor);
                                console.log(x);
                            }
                        }
                        if (categoryFiles[cosItem].materials.indexOf("default_secondary_color") !== -1) {
                            if (x == categoryFiles[cosItem].materials.indexOf("default_secondary_color")) {
                                node.material.color.set(secColor);
                            }
                        }
                        if (categoryFiles[cosItem].materials.indexOf("default_secondary_color_visor") !== -1) {
                            if (x == categoryFiles[cosItem].materials.indexOf("default_secondary_color_visor")) {  
                                if(playerSec_Color){
                                node.material.color.set(`#${parseInt(Math.floor(LinearToGamma({ r: playerSec_Color[0], g: playerSec_Color[1], b: playerSec_Color[2], a: 1 }).r * 255 / 2)).toString(16).padStart(2, '0')}${parseInt(Math.floor(LinearToGamma({ r: playerSec_Color[0], g: playerSec_Color[1], b: playerSec_Color[2], a: 1 }).g * 255 / 2)).toString(16).padStart(2, '0')}${parseInt(Math.floor(LinearToGamma({ r: playerSec_Color[0], g: playerSec_Color[1], b: playerSec_Color[2], a: 1 }).b * 255 / 2)).toString(16).padStart(2, '0')}`);    
                            }

                            }
                        }
                        if(categoryFiles[cosItem].materials.indexOf("default_primary_color") == -1 &&categoryFiles[cosItem].primaryColor){
                            if(x==0){
                               // categoryFiles[cosItem].primaryColor[0]
                                node.material.color.set(`#${ Math.round(categoryFiles[cosItem].primaryColor[0] * 255).toString(16).padStart(2, '0')}${Math.round(categoryFiles[cosItem].primaryColor[1] * 255).toString(16).padStart(2, '0')}${ Math.round(categoryFiles[cosItem].primaryColor[2] * 255).toString(16).padStart(2, '0')}`)
                            }
                        }
                        if(categoryFiles[cosItem].materials.indexOf("default_secondary_color") == -1 &&categoryFiles[cosItem].secColor){
                            node.material.color.set(`#${ Math.round(categoryFiles[cosItem].secondaryColor[0] * 255).toString(16).padStart(2, '0')}${Math.round(categoryFiles[cosItem].secondaryColor[1] * 255).toString(16).padStart(2, '0')}${ Math.round(categoryFiles[cosItem].secondaryColor[2] * 255).toString(16).padStart(2, '0')}`)
                        }
                        
                        x++;
                    }
                });

                scene1.add(gltf.scene);
            });
        })(scene1);
        var light = new THREE.DirectionalLight(0xffffff, 1); scene1.add(new THREE.AmbientLight(0xffffff))
        light.position.set(0, 0, 1);
        scene1.add(light);

        scenes.push(scene1);
    }

    renderer1 = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, transparent: true, antialias: true });
    renderer1.setPixelRatio(window.devicePixelRatio);
}
function updateSize() {
    var width = canvas.clientWidth;
    var height = canvas.clientHeight;
    if (canvas.width !== width || canvas.height != height) {
        renderer1.setSize(width, height, false);
    }
}
function animates() {
    render();
    requestAnimationFrame(animates);
}
function render() {
    updateSize();
    renderer1.setScissorTest(false);
    renderer1.clear();
    renderer1.setScissorTest(true);
    scenes.forEach(function (scene1) {
        scene1.children[0].rotation.y = Date.now() * 0.001;
        var element = scene1.userData.element;
        var rect = element.getBoundingClientRect();
        var width = rect.right - rect.left;
        var height = rect.bottom - rect.top;
        var left = rect.left;
        var bottom = renderer1.domElement.clientHeight - rect.bottom;
        renderer1.setViewport(left, bottom, width, height);
        renderer1.setScissor(left, bottom, width, height);
        var camera = scene1.userData.camera;
        renderer1.render(scene1, camera);
    });


}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    player_group.rotation.y = controls.target.x * Math.PI / 180;
    renderer.render(scene, camera);
}
animate();
