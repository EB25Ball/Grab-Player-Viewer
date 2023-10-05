import * as THREE from 'https://cdn.skypack.dev/three@v0.132.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three@v0.132.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@v0.132.0/examples/jsm/loaders/GLTFLoader.js';

const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('user_id');
const picker = document.getElementById('color-picker');
const playerInfo_Url = `https://api.slin.dev/grab/v1/get_user_info?user_id=${userId}`;//edit this later to use the config https://api.slin.dev/grab/v1/ and then just call it with fetch(configname_here + 'get_user_info?' + `user_id=${userId}`)
const shopCatalog = `https://api.slin.dev/grab/v1/get_shop_catalog?version=1`;//edit this later to use the config https://api.slin.dev/grab/v1/ and then just call it with fetch(configname_here + 'get_user_info?' + `user_id=${userId}`)

let player_model;
let activePrim_Div;
let activeSec_Div;
let playerPrim_Color;
let playerSec_Color;
let custmoizationState = 0;
let primaryOpened = false;//god tier naming, but this check if the primary/secondary color menu was opened
let secondaryOpened = false;
let cosmeticCatogories = document.getElementsByClassName("cosmeticsCatogories")
let headFiles = [
    "cosmetics/head/head/diver_oldschool.glb",
    "cosmetics/head/head/head.glb",
    "cosmetics/head/head/space_basic.glb"
]

let handFiles = ["cosmetics/hands/handshand_claw.glb",
    "cosmetics/hands/sphere_basic.glb"]
let hatFiles = [
    "cosmetics/head/hat/baseballcap_propeller.glb",
    "cosmetics/head/hat/baseballcap_basic.glb",
    "cosmetics/head/hat/halo_angel_basic.glb",
    "cosmetics/head/hat/bunnyears_basic.glb",
    "cosmetics/head/hat/catears_piercing.glb",
    "cosmetics/head/hat/cheese_basic.glb",
    "cosmetics/head/hat/christmas_basic.glb",
    "cosmetics/head/hat/contest_build_tutorial.glb",
    "cosmetics/head/hat/cowboyhat_basic_dev.glb",
    "cosmetics/head/hat/crown_royal.glb",
    "cosmetics/head/hat/fedora_easter_2023.glb",
    "cosmetics/head/hat/headband_basic.glb",
    "cosmetics/head/hat/ninjahat_basic.glb",
    "cosmetics/head/hat/sunhat_basic_moderator.glb",
    "cosmetics/head/hat/tophat_basic.glb",
    "cosmetics/head/hat/tophat_heart.glb",
    "cosmetics/head/hat/tree_christmas_2022.glb",
    "cosmetics/head/hat/umbrellahat_basic.glb",
    "cosmetics/head/hat/witchhat_basic.glb"
]

let FacewearFiles = [
    "cosmetics/head/glasses/beard_christmas_2022.glb",
    "cosmetics/head/glasses/horns_devil_basic.glb",
    "cosmetics/head/glasses/mask_dragon_paper.glb",
    "cosmetics/head/glasses/mask_oni_basic.glb",
    "cosmetics/head/glasses/glasses_nerd.glb",
    "cosmetics/head/glasses/hmd_meta_basic.glb"
]

let grappleFiles = [
    "cosmetics/grapple/arrow_heart.glb",
    "cosmetics/grapple/candycane_2022.glb",
    "cosmetics/grapple/carrot_basic.glb",
    "cosmetics/grapple/cheese_string.glb",
    "cosmetics/grapple/easter_2023.glb",
    "cosmetics/grapple/fish_rizzler.glb",
    "cosmetics/grapple/foldingfan_basic.glb",
    "cosmetics/grapple/hotdog.glb",
    "cosmetics/grapple/kunai_basic.glb",
    "cosmetics/grapple/pen_marker.glb",
    "cosmetics/grapple/rocket_basic.glb",
    "cosmetics/grapple/shark_basic.glb",
    "cosmetics/grapple/shovel_basic.glb",
    "cosmetics/grapple/shoge_basic.glb",
    "cosmetics/grapple/spear_angel.glb",
    "cosmetics/grapple/spider_basic.glb",
    "cosmetics/grapple/stake_basic_wood.glb",
    "cosmetics/grapple/sword_royal.glb",
    "cosmetics/grapple/trident_basic_gold.glb",
    "cosmetics/grapple/trident_devil.glb"
]

let checkpointsFiles = [
    "cosmetics/checkpoint/backpack_school.glb",
    "cosmetics/checkpoint/balloon_heart.glb",
    "cosmetics/checkpoint/chair_folding.glb",
    "cosmetics/checkpoint/checkpoint.glb",
    "cosmetics/checkpoint/cheesepoint.glb",
    "cosmetics/checkpoint/egg_basic_easter.glb",
    "cosmetics/checkpoint/flag_basic.glb",
    "cosmetics/checkpoint/fox_inu.glb",
    "cosmetics/checkpoint/gate_angel.glb",
    "cosmetics/checkpoint/katana_basic.glb",
    "cosmetics/checkpoint/kite_basic.glb",
    "cosmetics/checkpoint/lantern_chinese.glb",
    "cosmetics/checkpoint/lifebuoy_flag_basic.glb",
    "cosmetics/checkpoint/mini_me.glb",
    "cosmetics/checkpoint/the_mountain.glb",
    "cosmetics/checkpoint/ninjabanner_basic.glb",
    "cosmetics/checkpoint/northpole_2022.glb",
    "cosmetics/checkpoint/orb_basic_pulsating.glb",
    "cosmetics/checkpoint/pentagram_devil.glb",
    "cosmetics/checkpoint/pumpkin_basic.glb",
    "cosmetics/checkpoint/scepter_royal.glb",
    "cosmetics/checkpoint/scubatanks.glb",
    "cosmetics/checkpoint/sir_duckton.glb",
    "cosmetics/checkpoint/snowman_2022_cc.glb",
    "cosmetics/checkpoint/ufo_basic_beam.glb"
]






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
        const visorColor = `rgb(${Math.ceil(parseInt(extractColor[1], 10) / 2)},${Math.ceil(parseInt(extractColor[2], 10) / 2)},${Math.ceil(parseInt(extractColor[3], 10) / 2)})`;
        if (player_model) {
            player_model.traverse(function (node) {
                if (node.isMesh && modelNodes.includes(node.name)) {
                    node.material.color.set(color);
                }
                if (node.isMesh && node.name === "Cylinder005_2") {
                    node.material.color.set(visorColor);//darkened visor color fyi, this is correct darkenment
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
let categoryResponse = await fetch(shopCatalog);
let categoryResponseBody = await categoryResponse.json();

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

    if (cosmeticCatogories !== null || cosmeticCatogories !== undefined) {
        for (let i = 0; i < 6; i++) {
            const cosmeticCatogories = document.createElement("span")
            cosmeticCatogories.innerHTML = `${categories[i]}`
            cosmeticCatogories.style.gridColumn = `1 / 10`
            cosmeticCatogories.style.gridRow = `${i} / 6`
            cosmeticCatogories.className = "cosmeticsCatogories";
            picker.appendChild(cosmeticCatogories);
            cosmeticCatogories.addEventListener("click", catgorySelect)
        }
    } else {
        for (var i = 0; i < cosmeticCatogories.length; i++) {
            cosmeticCatogories[i].style.display = 'block';
            cosmeticCatogories.innerHTML = `${categories[i]}`
            cosmeticCatogories.style.gridColumn = `1 / 10`;
            cosmeticCatogories.style.gridRow = `${i} / 6`;
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
    checkShopItems();
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
            for (var i = 0; i < cosmeticCatogories.length; i++) {
                cosmeticCatogories[i].style.display = 'none';
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
            document.getElementById("stuff").style.height = "399px";

            break;

    }
}
let shopItemsResponse = await fetch('https://api.slin.dev/grab/v1/get_shop_items?version=1');
let shopData = await shopItemsResponse.json()
let shopItems = []
function checkShopItems() {

    for (var item in shopData) {
        if (shopData.hasOwnProperty(item)) {
            const cosmeticItem = shopData[item];
            if (cosmeticItem.colors !== undefined) {
                let isInShopItems = shopItems.includes(cosmeticItem.file);
                for (const cosmeticArray of [checkpointsFiles, headFiles, handFiles, grappleFiles, hatFiles, FacewearFiles]) {
                    if (cosmeticArray.includes(cosmeticItem.file + '.glb')) {
                        shopItems.push(cosmeticItem.file+'.glb')
                        console.log(cosmeticItem.file);
                        if (cosmeticItem.colors[0] && cosmeticItem.colors[1] === undefined) {
                            cosmeticArray.push(`${cosmeticItem.file}_primary_${cosmeticItem.colors[0][0]}_${[cosmeticItem.colors[0][1]]}_${cosmeticItem.colors[0][2]}_secondary.glb`)
                        }
                        else if (cosmeticItem.colors[0] && cosmeticItem.colors[1]) {
                            cosmeticArray.push(`${cosmeticItem.file}_primary_${cosmeticItem.colors[0][0]}_${[cosmeticItem.colors[0][1]]}_${cosmeticItem.colors[0][2]}_secondary_${cosmeticItem.colors[1][0]}_${[cosmeticItem.colors[1][1]]}_${cosmeticItem.colors[1][2]}.glb`)
                        }
                    }
                    
                }

            }
        }
    }
    for (const cosmeticArray of [checkpointsFiles, headFiles, handFiles, grappleFiles, hatFiles, FacewearFiles]) 
{
    const filteredCosmeticArray = cosmeticArray.filter(item => !shopItems.includes(item));

    // Assign the filtered array back to the original cosmeticArray
    cosmeticArray.length = 0; // Clear the original array
    cosmeticArray.push(...filteredCosmeticArray);
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

            const cosmeticsMap = {
                playerHat,
                playerGrapple,
                playerCheckpoint,
                playerHead,
                playerFaceWear
            };
            const cosmeticItemKeys = Object.keys(shopData);
            for (const key in cosmeticsMap) {
                const mappedItem = cosmeticsMap[key];

                if (cosmeticItemKeys.includes(mappedItem)) {
                    const correspondingItem = shopData[mappedItem];

                    if (correspondingItem && correspondingItem.file) {
                        eval(`${key} = correspondingItem.file.replace('hook/','')`);
                        if (correspondingItem.colors !== undefined) {
                            if (correspondingItem.colors[0] && correspondingItem.colors[1] === undefined) {
                                eval(`${key} = ${key}+'_primary_${correspondingItem.colors[0][0]}_${[correspondingItem.colors[0][1]]}_${correspondingItem.colors[0][2]}_secondary'`)
                            }
                            if (correspondingItem.colors[0] && correspondingItem.colors[1] !== undefined) {
                                eval(`${key} = ${key}+'_primary_${correspondingItem.colors[0][0]}_${correspondingItem.colors[0][1]}_${correspondingItem.colors[0][2]}_secondary_${correspondingItem.colors[1][0]}_${correspondingItem.colors[1][1]}_${correspondingItem.colors[1][2]}.glb'`)
                            }
                            console.log(key)
                            console.log(playerHat)

                        }
                    }
                }
            }
            if (playerCheckpoint == 'checkpoint_lifebuoyflag_basic') playerCheckpoint = 'checkpoint_lifebuoy_flag_basic'//file name stuff so had to add Underscore
            if (playerCheckpoint !== undefined) {
                OffsetX = 0.5;
                OffsetY = -1.25
                OffsetScale = 0.75;
                OffsetZ = -0.5;
                cosmeticsOnLoad(playerCheckpoint.replace("checkpoint_", "cosmetics/checkpoint/") + ".glb", undefined/*offsetrotx*/, undefined/*OffsetRoty*/, undefined/*OffsetRotz*/, OffsetScale/*OffsetScale*/, OffsetX/*OffsetX*/, OffsetY/*OffsetY*/, OffsetZ/*OffsetZ*/)
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
                cosmeticsOnLoad(playerGrapple.replace("grapple_hook_", "cosmetics/grapple/") + ".glb", OffsetRotx/*offsetrotx*/, undefined/*OffsetRoty*/, OffsetRotz/*OffsetRotz*/, undefined/*OffsetScale*/, OffsetX/*OffsetX*/, OffsetY/*OffsetY*/, OffsetZ/*OffsetZ*/)
                if (!toggledElements.includes(playerGrapple.replace("grapple_hook_", "cosmetics/grapple/") + ".glb")) {
                    toggledElements.push(playerGrapple.replace("grapple_hook_", "cosmetics/grapple/") + ".glb");
                }
            }
            if (playerHat !== undefined) {
                OffsetY = player_model.children[0].position.y + 0.20;
                OffsetRoty = 3.0;

                cosmeticsOnLoad(playerHat, undefined, OffsetRoty, undefined, undefined, undefined, OffsetY, undefined)
                if (!toggledElements.includes(playerHat.replace("head_", "cosmetics/head/hat/") + ".glb")) {
                    toggledElements.push(playerHat.replace("head_", "cosmetics/head/hat/") + ".glb");
                }
            }
            if (playerFaceWear !== undefined) {
                OffsetY = player_model.children[0].position.y + 0.2;
                if(playerFaceWear=='cosmetics/head/glasses/glasses_nerd'){
                    OffsetZ=player_model.children[0].position.z + 0.035;
                    cosmeticsOnLoad(playerFaceWear.replace("head_glasses_", "cosmetics/head/glasses/") + ".glb", undefined/*offsetrotx*/, undefined/*OffsetRoty*/, undefined/*OffsetRotz*/, undefined/*OffsetScale*/, -undefined/*OffsetX*/, OffsetY/*OffsetY*/, OffsetZ/*OffsetRotz*/)

                }else{
                    cosmeticsOnLoad(playerFaceWear.replace("head_glasses_", "cosmetics/head/glasses/") + ".glb", undefined/*offsetrotx*/, undefined/*OffsetRoty*/, undefined/*OffsetRotz*/, undefined/*OffsetScale*/, -undefined/*OffsetX*/, OffsetY/*OffsetY*/, undefined/*OffsetRotz*/)

                }
                
                if (!toggledElements.includes(playerFaceWear.replace("head_", "cosmetics/head/glasses/") + ".glb")) {
                    toggledElements.push(playerFaceWear.replace("head_", "cosmetics/head/glasses/") + ".glb");
                }
            }
            if (playerHead !== undefined) {
                OffsetY = player_model.children[0].position.y + 0.2;
                OffsetRoty = Math.PI * 2 / 2;
                cosmeticsOnLoad(playerHead.replace("head_", "cosmetics/head/head/") + ".glb", undefined/*offsetrotx*/, OffsetRoty/*OffsetRoty*/, undefined/*OffsetRotz*/, undefined/*OffsetScale*/, -undefined/*OffsetX*/, OffsetY/*OffsetY*/, undefined/*OffsetRotz*/)
                if (!toggledElements.includes(playerHead.replace("head_", "cosmetics/head/head/") + ".glb")) {
                    toggledElements.push(playerHead.replace("head_", "cosmetics/head/head/") + ".glb");
                }
            }
            function cosmeticsOnLoad(modelFile, OffsetRotx, OffsetRoty, OffsetRotz, OffsetScale, OffsetX, OffsetY, OffsetZ) {
console.log(modelFile);
if(!modelFile.includes(".glb")){
    modelFile= modelFile+'.glb';
}
                loader.load(modelFile.replace(/(_primary).*$/i, ".glb"), (model) => {
                    if (OffsetX) model.scene.position.x = OffsetX;
                    if (OffsetY) model.scene.position.y = OffsetY;
                    if (OffsetScale) model.scene.scale.set(OffsetScale, OffsetScale, OffsetScale);
                    if (OffsetZ) model.scene.position.z = OffsetZ;
                    if (OffsetRoty) model.scene.rotation.y = OffsetRoty;
                    if (OffsetRotx) model.scene.rotation.x = OffsetRotx;
                    if (OffsetRotz) model.scene.rotation.z = OffsetRotz;
                    let x = 0;
                    model.scene.traverse(function (node) {

                        if (node.name == 'primary') node.material.color.set(primColor);
                        if (node.name == 'secondary') node.material.color.set(secColor);
                        if (node.material !== undefined) {
                            const regex = /primary_([\d._]+)_secondary/;
                            const regex2 = /secondary_([\d._]+).glb/;
                            const match2 = modelFile.match(regex2);
                            const match = modelFile.match(regex);
                            
                            if (match2) {
                                const num = match2[1].split('_').map(Number);
                                const hexNum1 = parseInt(num[0] * 255).toString(16).padStart(2, '0');
                                const hexNum2 = parseInt(num[1] * 255).toString(16).padStart(2, '0');
                                const hexNum3 = parseInt(num[2] * 255).toString(16).padStart(2, '0');
                                if(x==1){
                                    node.material.color.set(`#${hexNum1}${hexNum2}${hexNum3}`)
                                  }
                              }
                            if (match) {
                              const num = match[1].split('_').map(Number);
                              const hexNum1 = parseInt(num[0] * 255).toString(16).padStart(2, '0');
                              const hexNum2 = parseInt(num[1] * 255).toString(16).padStart(2, '0');
                              const hexNum3 = parseInt(num[2] * 255).toString(16).padStart(2, '0');
                              if(x==0){
                                node.material.color.set(`#${hexNum1}${hexNum2}${hexNum3}`)
                              }x++
                            }
                        }
                        if (node.name == 'visor') {
                            node.material.color.set(`rgb(${Math.floor(LinearToGamma({ r: playerSec_Color[0], g: playerSec_Color[1], b: playerSec_Color[2], a: 1 }).r * 255 / 2)},${Math.floor(LinearToGamma({ r: playerSec_Color[0], g: playerSec_Color[1], b: playerSec_Color[2], a: 1 }).g * 255 / 2)},${Math.floor(LinearToGamma({ r: playerSec_Color[0], g: playerSec_Color[1], b: playerSec_Color[2], a: 1 }).b * 255 / 2)})`)
                            player_model.children[0].visible = false;


                        } else {
                            if (!toggledElements.includes(modelFile)) {
                                toggledElements.push(modelFile);
                            }
                        }
                    });
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



let canvaser;

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
    document.getElementById("stuff").style.height = "100%";
    let categoryFiles;
    if (selectedCategory === 'Heads') {
        categoryFiles = headFiles;
        OffsetY = player_model.children[0].position.y + 0.2;
        OffsetRoty = Math.PI * 2 / 2;
    } else if (selectedCategory === 'Hats') {
        categoryFiles = hatFiles;
        OffsetY = player_model.children[0].position.y + 0.20;
        OffsetRoty = 3.0;
    } else if (selectedCategory === 'Facewear') {
        categoryFiles = FacewearFiles;
        OffsetY = player_model.children[0].position.y + 0.2;
    } else if (selectedCategory === 'Grapples') {
        categoryFiles = grappleFiles;
        OffsetZ = -0.5;
        OffsetY = -1.00;
        OffsetX = -0.5;

        OffsetRotx = Math.PI / 2;
        OffsetRotz = Math.PI * 4 / 2;

    } else if (selectedCategory === 'Checkpoints') {
        categoryFiles = checkpointsFiles;
        OffsetX = 0.5;
        OffsetY = -1.25;
        OffsetScale = 1;
        OffsetZ = -0.5;


    } else if (selectedCategory === "Hands") {
        categoryFiles = handFiles;
        OffsetRotx = -Math.PI / 2;;
        OffsetRotz = -Math.PI / 2;
        OffsetX = 0.3;
        OffsetY = -0.65;
    }
    canvaser = document.getElementById("c");
    var element2 = document.getElementById("body")
    var positionInfo = element2.getBoundingClientRect();
    var height2 = positionInfo.height;
    var width2 = positionInfo.width;
    canvaser.style.height = height2;
    canvaser.style.width2 = width2;
    var template = document.getElementById("template").text;
    var content = document.getElementById("content");
    categoryFiles.sort();
    for (let i = 0; i < categoryFiles.length; i++) {
        var loader1 = new GLTFLoader();
        var scene1 = new THREE.Scene();
        var element = document.createElement("div");
        element.id = `${categoryFiles[i]}`
        element.className = "list-item";
        const withoutUnderscore = categoryFiles[i].replace(/_/g, ' ');
        const withoutExtension = withoutUnderscore.replace(/\.glb$/, '');
        const file2name = withoutExtension.replace('cosmetics/', '').replace('basic', '').replace('head/', '').replace('hat/', '').replace('grapple/', '').replace('checkpoint/', '').replace('head/', '').replace('hand/', '').replace('glasses/', '').replace('primary','').replace('secondary','').replace(/\d/g, '').replace(/\./g, '');
        element.innerHTML = template.replace('Scene $', `${file2name}`);


        const previewButton = document.createElement('button');
        previewButton.style.height = '2em';
        previewButton.innerHTML = 'preview'
        previewButton.classList.add('previewButton', `${selectedCategory}`);
        previewButton.id = categoryFiles[i];

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

                loader.load(categoryFiles[i].replace(/(_primary).*$/i, ".glb"), function (gltf) {
                    model = gltf.scene;
                    model.name = categoryFiles[i];
                    if (OffsetX) model.position.x = OffsetX;
                    if (OffsetY) model.position.y = OffsetY;
                    if (OffsetScale) model.scale.set(OffsetScale, OffsetScale, OffsetScale);
                    if (OffsetZ) model.position.z = OffsetZ;
                    if (OffsetRoty) model.rotation.y = OffsetRoty;
                    if (OffsetRotx) model.rotation.x = OffsetRotx;
                    if (OffsetRotz) model.rotation.z = OffsetRotz;
                    if(categoryFiles[i]=='cosmetics/head/glasses/glasses_nerd.glb'){
                        model.position.z=0.035;
                    }
                    
                    scene.add(model); if (selectedCategory === "Hands") {
                        const clonedModel = model.clone();
                        clonedModel.name = model.name;
                        clonedModel.position.x = -model.position.x;
                        scene.add(clonedModel)
                    }
                    let x = 0;
                    model.traverse(function (node) {
                        if (node.name == 'primary') node.material.color.set(primColor);
                        if (node.name == 'secondary') node.material.color.set(secColor);
                        if (node.material !== undefined) {
                            const regex = /primary_([\d._]+)_secondary/;
                            const regex2 = /secondary_([\d._]+).glb/;
                            const match2 = categoryFiles[i].match(regex2);
                            const match = categoryFiles[i].match(regex);
                            
                            if (match2) {
                                const num = match2[1].split('_').map(Number);
                                const hexNum1 = parseInt(num[0] * 255).toString(16).padStart(2, '0');
                                const hexNum2 = parseInt(num[1] * 255).toString(16).padStart(2, '0');
                                const hexNum3 = parseInt(num[2] * 255).toString(16).padStart(2, '0');
                                if(x==1){
                                    node.material.color.set(`#${hexNum1}${hexNum2}${hexNum3}`)
                                  }
                              }
                            if (match) {
                              const num = match[1].split('_').map(Number);
                              const hexNum1 = parseInt(num[0] * 255).toString(16).padStart(2, '0');
                              const hexNum2 = parseInt(num[1] * 255).toString(16).padStart(2, '0');
                              const hexNum3 = parseInt(num[2] * 255).toString(16).padStart(2, '0');
                              if(x==0){
                                node.material.color.set(`#${hexNum1}${hexNum2}${hexNum3}`)
                              }x++
                            }
                        }
                        if (node.name == 'visor') {
                            node.material.color.set(`rgb(${Math.floor(LinearToGamma({ r: playerSec_Color[0], g: playerSec_Color[1], b: playerSec_Color[2], a: 1 }).r * 255 / 2)},${Math.floor(LinearToGamma({ r: playerSec_Color[0], g: playerSec_Color[1], b: playerSec_Color[2], a: 1 }).g * 255 / 2)},${Math.floor(LinearToGamma({ r: playerSec_Color[0], g: playerSec_Color[1], b: playerSec_Color[2], a: 1 }).b * 255 / 2)})`)
                            player_model.children[0].visible = false;


                        } else {
                            if (!toggledElements.includes(previewButton.id)) {
                                toggledElements.push(previewButton.id);
                            }
                        }

                    });

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
                if (selectedCategory == 'Heads') {
                    const allUntoggled = toggledButtonsByCategory[category].every(button => !button.classList.contains('toggled'));
                    if (allUntoggled) {
                        player_model.children[0].visible = true;
                    }
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
            loader1.load(categoryFiles[i].replace(/(_primary).*$/i, ".glb"), function (gltf) {

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
                    if (node.name == 'primary') node.material.color.set(primColor);
                    if (node.name == 'secondary') node.material.color.set(secColor);
                    if (node.name == 'visor') node.material.color.set(`rgb(${Math.floor(LinearToGamma({ r: playerSec_Color[0], g: playerSec_Color[1], b: playerSec_Color[2], a: 1 }).r * 255 / 2)},${Math.floor(LinearToGamma({ r: playerSec_Color[0], g: playerSec_Color[1], b: playerSec_Color[2], a: 1 }).g * 255 / 2)},${Math.floor(LinearToGamma({ r: playerSec_Color[0], g: playerSec_Color[1], b: playerSec_Color[2], a: 1 }).b * 255 / 2)})`)


                    if (node.material !== undefined) {
const regex = /primary_([\d._]+)_secondary/;
const regex2 = /secondary_([\d._]+).glb/;
const match2 = categoryFiles[i].match(regex2);
const match = categoryFiles[i].match(regex);

if (match2) {
    const num = match2[1].split('_').map(Number);
    const hexNum1 = parseInt(num[0] * 255).toString(16).padStart(2, '0');
    const hexNum2 = parseInt(num[1] * 255).toString(16).padStart(2, '0');
    const hexNum3 = parseInt(num[2] * 255).toString(16).padStart(2, '0');
    if(x==1){
        node.material.color.set(`#${hexNum1}${hexNum2}${hexNum3}`)
      }
  }
if (match) {
  const num = match[1].split('_').map(Number);
  const hexNum1 = parseInt(num[0] * 255).toString(16).padStart(2, '0');
  const hexNum2 = parseInt(num[1] * 255).toString(16).padStart(2, '0');
  const hexNum3 = parseInt(num[2] * 255).toString(16).padStart(2, '0');
  if(x==0){
    node.material.color.set(`#${hexNum1}${hexNum2}${hexNum3}`)
  }x++
}

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

    renderer1 = new THREE.WebGLRenderer({ canvas: canvaser, alpha: true, transparent: true, antialias: true });
    renderer1.setPixelRatio(window.devicePixelRatio);
}
function updateSize() {
    var width = canvaser.clientWidth;
    var height = canvaser.clientHeight;
    if (canvaser.width !== width || canvaser.height != height) {
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