
import {
    AmbientLight,
    AxesHelper,
    DirectionalLight,
    GridHelper,
    PerspectiveCamera,
    Scene,
    WebGLRenderer,
    Raycaster,
    Object3D,
    Color,
    BoxGeometry,
    Mesh,
    SphereGeometry,

    Vector3,
    MeshPhongMaterial,

    MathUtils,




} from "three";
//import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { IFCLoader } from "web-ifc-three/IFCLoader";
import { MeshBVH, acceleratedRaycast, computeBoundsTree, disposeBoundsTree } from "three-mesh-bvh";
import { Vector2 } from "three";
import { MeshBasicMaterial } from "three";
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

//addons/modifiers/CurveModifier.js';

import {
    IFCWALLSTANDARDCASE,
    IFCSLAB,
    IFCFURNISHINGELEMENT,
    IFCDOOR,
    IFCWINDOW,
    IFCPLATE,
    IFCMEMBER,

    IFCOPENINGELEMENT,
    IFCRELVOIDSELEMENT,
    IFCRELASSOCIATESMATERIAL,
    IFCFLOWTERMINAL,
    IFCRELFILLSELEMENT,
    IFCRELCONNECTSPATHELEMENTS

} from "web-ifc";
import { Box3 } from "three";
import { OrthographicCamera } from "three";
import { BoxHelper } from "three";
import { VideoTexture } from "three";
import { RGBFormat } from "three";
import { Line } from "three";
import { LineBasicMaterial } from "three";
import { BufferGeometry } from "three";

//Creates the Three.js scene
const scene = new Scene();

//Object to store the size of the viewport
const size = {
    width: window.innerWidth,
    height: window.innerHeight,
};

//Creates the camera (point of view of the user)
let camera = new OrthographicCamera(size.width / - 40, size.width / 40, size.height / 40, size.height / - 40, 1, 1000 )
//new PerspectiveCamera(75, size.width / size.height);
camera.position.z = 15;
camera.position.y = 13;
camera.position.x = 8;

//Creates the lights of the scene
const lightColor = 0xffffff;

const ambientLight = new AmbientLight(lightColor, 0.5);
scene.add(ambientLight);

const directionalLight = new DirectionalLight(lightColor, 2);
directionalLight.position.set(0, 10, 0);
scene.add(directionalLight);


//Sets up the renderer, fetching the canvas of the HTML
const canvas = document.getElementById("three-canvas");
const renderer = new WebGLRenderer({ canvas: canvas, alpha: true });

renderer.setSize(size.width, size.height);
// renderer.xr.enabled = true;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


//Creates grids and axes in the scene
const grid = new GridHelper(10, 10);
scene.add(grid)

const axes = new AxesHelper();
axes.material.depthTest = false;
axes.renderOrder = 1;
scene.add(axes)


//Creates the orbit controls (to navigate the scene)
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.target.set(-2, 0, 0);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize( window.innerWidth, window.innerHeight );
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.pointerEvents = 'none';
labelRenderer.domElement.style.top = '20rem';
document.body.appendChild( labelRenderer.domElement );


// const vrBtn = VRButton.createButton(renderer);
// document.body.appendChild(vrBtn)

//IFC Loading
const ifcModels = [];
const loader = new IFCLoader();
let model;
let lastModel;
let lastFurniture;
let data;
let blob;

loader.ifcManager.setupThreeMeshBVH(computeBoundsTree, disposeBoundsTree, acceleratedRaycast);




// const input = document.getElementById("file-input");
// loader.ifcManager.setWasmPath('wasm/');

// input.addEventListener('change', async()=> {
//     const file = input.files[0];
//     const url = URL.createObjectURL(file);
//     const model = await loader.loadAsync(url);
//     scene.add(model);
//     ifcModels.push(model);
//     await editFloorName();
// });
//const result = prompt("New height for the storey: ")
//var zValue = parseInt(result);

async function loadingIfc(path) {
    await  loader.ifcManager.setWasmPath('wasm/');
    model = await loader.loadAsync(path);


    // document.querySelector('#uploadmode').addEventListener('click', function(){
    //     //console.log("Button clicked Uploadmode" )
    //     scene.add(model)
    //     ifcModels.push(model);

    // })

    // document.querySelector('#drawmode').addEventListener('click', function(){
    //     //console.log("Button clicked " )
    //     scene.remove(model)
    //     model.removeFromParent();
    //     //console.log(ifcModels)
    //     ifcModels.pop()
    // })


    model.removeFromParent();


    //await getAll();
    ifcModels.push(model);
    return model
    //await editToiletPosition();

    //await editFloorName();
    //await editPosition(zValue);
    // await editWall();

}

let ifcProject
async function showModel(){
    const ifcModel = await loadingIfc('./ifc/wand2.ifc');
    scene.add(ifcModel)

    ifcProject = await loader.ifcManager.getSpatialStructure(model.modelID);

    //console.log("ifcProject", ifcProject)


    return ifcModel
}
const resetPositionsFurn = [];
const resetRotationFurn = [];

let deleteButton;
const orangeColor = new Color('rgb(255,94,0)')
const greyColor = new Color( 0x007050)
//new Color(0x296017)

const translationList = [];
let ifcModel
let furnitureSubset;
let wallSubset
const startPositionsFurns = [];
const allSubsetMeshes = [];
const allSubsetMeshesIDs = [];
const foundMeshesCheckbox = [];
const areaMeshes = [];
const noSpecificAreaIndex = [];
const modifiedDirections = [];
let  areas = []
const ReferencePositionAreas = [];
const centerPoints = [];
const locationSaver = [];
const spheresLocal = [];
const noSpecificFurnIDList = [];

const ReferenceDirections = [];
const ReferenceDirectionsAreas = [];
const ReferencePositions = [];
const collidedIDs = [];
const collidedWithIDs = [];

const furnSizes = [];
const idsElementsForCheck = [];
let ids = []
const idsSanitaryList = [];
const idsFurnitureList = [];
const wallDimensionsX = [];
const wallDimensionsY = [];
const wallPlacements = [];
const wallDirection = [];
const allOpeningsMeshes = [];
const positionsOpeningsElements = [];
const wallMeshSpheres = [];

const wallBounds = [];
const wallSubsetMeshes = [];
const wallSubsetMeshesIDs = [];

let allIDsInChecker;
const relatedID = [];
const wallsDynamic = [];

const checkedMats = [];
const specificFurnIDList = [];
const areasInFront = [];

const wallCenterPoints = [];

const labels = [];
const DINLabels = [];

let allLists;


let furnituremodeIsActive = false;
let  checkedBtnmodeIsActive = false;
let checkallmodeIsActive = false;
let dincheckmodeIsActive = false;
let storymodeIsActive = false;
let downloadmodeIsActive = false;
let dincheckBtnIsActive = false;
let  backPickFurn = false;

let wIsDown = false;

let aIsDown = false;
let indexFound

const wallsDynamicListe = [];
const checkedList = [];
const indices = [];

const checkedListContains = [];
const indicesContains = [];

const checkedListInFront = [];
const indicesInFront = [];

const checkedListContainsInFront = [];
const indicesContainsInFront = [];

const checkedListIntersectFurn = [];
const indicesIntersectFurn = [];

const checkedListContainsFurn = [];
const indicesContainsFurn = [];

const checkedListIntersectFurnInFront = [];
const indicesIntersectFurnInFront = [];

const checkedListContainsFurnInFront = [];
const indicesContainsFurnInFront = [];


const checkedListIntersectFurnAndAreaInFront = [];
const indicesIntersectFurnAndAreaInFront = []

const checkedListContainsFurnAndAreaInFront = [];
const indicesContainsFurnAndAreaInFront = [];


const checkedListIntersectFurnAndArea = [];
const indicesIntersectFurnAndArea = []

const checkedListContainsFurnAndArea = [];
const indicesContainsFurnAndArea = [];

const checkedListIntersectAreaAndFurn = [];
const indicesIntersectAreaAndFurn = []

const checkedListContainsAreaAndFurn = [];
const indicesContainsAreaAndFurn = [];

const checkedListAreaIntersectWall = [];
const indicesIntersectAreaAndWall = [];

const checkedListAreaContainsWall = [];
const indicesContainsAreaAndWall = [];

const checkedListFurnIntersectWall = [];
const indicesIntersectFurnAndWall = [];

const checkedListFurnContainsWall = [];
const indicesContainsFurnAndWall = [];

const positionsCollisions = [];
const allIdsFalseAreaIntersectArea = [];
const falsePositionsAreaIntersectArea = [];

const allIdsFalseAreaContainsArea = [];
const falsePositionsAreaContainsArea = [];

const allIdsFalseAreaIntersectFurn = [];
const falsePositionsAreaIntersectFurn = [];

const allIdsFalseAreaContainsFurn = [];
const falsePositionsAreaContainsFurn = [];

const allIdsFalseFurnIntersectArea = [];
const falsePositionsFurnIntersectArea = [];

const allIdsFalseFurnContainsArea = [];
const falsePositionsFurnContainsArea  = [];

const allIdsFalseFurnIntersectFurn = [];
const falsePositionsFurnIntersectFurn = [];

const allIdsFalseFurnContainsFurn = [];
const falsePositionsFurnContainsFurn = [];

const allIdsFalseAreaIntersectWall = [];
const falsePositionsAreaIntersectWall = [];

const allIdsFalseAreaContainsWall = [];
const falsePositionsAreaContainsWall = [];

const allIdsFalseFurnContainsWall = [];
const falsePositionsFurnContainsWall = [];

const allIdsFalseFurnIntersectWall = [];
const falsePositionsFurnIntersectWall = [];

const allIdsFalseAreaIntersectAreaInFront = [];
const falsePositionsAreaIntersectAreaInFront = [];

const allIdsFalseAreaContainsAreaInFront = [];
const falsePositionsAreaContainsAreaInFront = [];

const allIdsFalseAreaIntersectFurnInFront = [];
const falsePositionsAreaIntersectFurnInFront = [];

const allIdsFalseAreaContainsFurnInFront = [];
const falsePositionsAreaContainsFurnInFront = [];

const allIdsFalseFurnIntersectFurnInFront = [];
const falsePositionsFurnIntersectFurnInFront = [];

const allIdsFalseFurnContainsFurnInFront = [];
const falsePositionsFurnContainsFurnInFront = [];


const truePositions = [];
const allIdsTrue = [];

const noIntersectionsIDsAreaIntersectAreaInFront = [];
const IntersectionsIDsAreaIntersectAreaInFront = [];
const IntersectionsIDsAreaIntersectAreaWithInFront = [];

const noIntersectionsIDsAreaContainAreaInFront = [];
const IntersectionsIDsAreaContainAreaInFront = [];
const IntersectionsIDsAreaContainAreaWithInFront = [];

const noIntersectionsIDsInFront = [];
const IntersectionsIDsInFront = [];
const IntersectionsIDsWithInFront = [];

const noIntersectionsIDsAreaContainFurnInFront = [];
const IntersectionsIDsAreaContainFurnInFront = [];
const IntersectionsIDsAreaContainFurnWithInFront = [];

const noIntersectionsIDsFurnIntersectFurnInFront = [];
const IntersectionsIDsFurnIntersectFurnInFront = [];
const IntersectionsIDsFurnIntersectFurnWithInFront = [];

const noIntersectionsIDsFurnContainFurnInFront = [];
const IntersectionsIDsFurnContainFurnInFront = [];
const IntersectionsIDsFurnContainFurnWithInFront = [];

const noIntersectionsIDs = [];
const IntersectionsIDs = [];
const IntersectionsIDsWith = [];

const noIntersectionsIDsAreaContainFurn = [];
const IntersectionsIDsAreaContainFurn = [];
const IntersectionsIDsAreaContainFurnWith = [];


const noIntersectionsIDsAreaIntersectArea = [];
const IntersectionsIDsAreaIntersectArea = [];
const IntersectionsIDsAreaIntersectAreaWith = [];

const noIntersectionsIDsAreaContainArea = [];
const IntersectionsIDsAreaContainArea = [];
const IntersectionsIDsAreaContainAreaWith = [];

const noIntersectionsIDsFurnIntersectArea = [];
const IntersectionsIDsFurnIntersectArea = [];
const IntersectionsIDsFurnIntersectAreaWith = [];

const noIntersectionsIDsFurnContainArea = [];
const IntersectionsIDsFurnContainArea = [];
const IntersectionsIDsFurnContainAreaWith = [];

const noIntersectionsIDsFurnIntersectFurn = [];
const IntersectionsIDsFurnIntersectFurn = [];
const IntersectionsIDsFurnIntersectFurnWith = [];

const noIntersectionsIDsFurnContainFurn = [];
const IntersectionsIDsFurnContainFurn = [];
const IntersectionsIDsFurnContainFurnWith = [];

const noIntersectionsIDsAreaIntersectWall = [];
const IntersectionsIDsAreaIntersectWall = [];
const IntersectionsIDsAreaIntersectWallWith = [];

const noIntersectionsIDsAreaContainWall = [];
const IntersectionsIDsAreaContainWall = [];
const IntersectionsIDsAreaContainWallWith = [];

const noIntersectionsIDsFurnContainWall = [];
const IntersectionsIDsFurnContainWall = [];
const IntersectionsIDsFurnContainWallWith = [];

const noIntersectionsIDsFurnIntersectWall = [];
const IntersectionsIDsFurnIntersectWall = [];
const IntersectionsIDsFurnIntersectWallWith = [];

const greenAreaReset = [];


const idMeshToString = [];
const greenMaterial = new MeshBasicMaterial({color: orangeColor, transparent: true,  opacity: 0.3, depthTest: false})



const furnContainAreaColor =  new Color( 0x296017); //dunkelgrüm
const furnContainFurnColor = new Color( 0x504b13); //kaki
const areaContainAreaColor = new Color( 0x67116e); //lila

const furnClashAreaColor =  new Color( 0x99244f); //beere
const furnIntersectFurnColor = new Color( 0x570042); //gelb    rosa f2a9f9
const wallCollisionColor = new Color( 0x8137be); //dunkelrot
const areaIntersectAreaColor = new Color( 0x007050) // tannengrün


let lastPosition;
let indexWC

function indexedBoundingBoxCollision(index, boundsIteration, collidingWithBounds, intersectionList, indexIntersectList, containsList, indexContainsList){
    let intersect
    for(let i = 0; i < boundsIteration.length; i++){
        if( index !== i){
            intersect = boundsIteration[i].intersectsBox(collidingWithBounds[index])
            ////console.log("int", intersect, boundingCubes[i], boundingCubes[index], i,index)

            intersectionList.push(intersect)
            indexIntersectList.push( [i, index] )

            contains = boundsIteration[i].containsBox(collidingWithBounds[index])
            containsList.push(contains)
            indexContainsList.push( [i, index] )
        }

    }
}

function areaColorIfCollisionIsDetected(intersectionList, indexIntersectList, color, idsNot, notPosition, Intersection, NoIntersection, IntersectionWith, subsetColliding) {

    for ( let j = 0; j < intersectionList.length; j++){
        //area against area
        if(intersectionList[j] === true){
            ////console.log(j, indexIntersectList[j][0])
            areas[indexIntersectList[j][0]].material.transparent = true;
            areas[indexIntersectList[j][0]].material.opacity = 0.5;
            areas[indexIntersectList[j][0]].material.color = color;

            areas[indexIntersectList[j][0]].uuid = allSubsetMeshes[indexIntersectList[j][0]].uuid
            areas[indexIntersectList[j][1]].uuid = subsetColliding[indexIntersectList[j][1]].uuid
            //console.log("True Intersection",allSubsetMeshes[indexIntersectList[j][0]].uuid, subsetColliding[indexIntersectList[j][1]].uuid )

            Intersection.push(allSubsetMeshes[indexIntersectList[j][0]].uuid)
            IntersectionWith.push(subsetColliding[indexIntersectList[j][1]].uuid)

        } else  if(intersectionList[j] === false) {
            ////console.log("False Intersection",areas[indexIntersectList[j][1]].uuid,  )

            const idsFalse = areas[indexIntersectList[j][0]].uuid
            ////console.log('idsfalse', idsFalse)
            idsNot.push(idsFalse)

            if (notPosition.includes(idsFalse) === false){
                notPosition.push(idsFalse)

            }
        }
        ////console.log('notPosition', notPosition)
    }

    for(let i = 0; i < notPosition.length; i++){
       // //console.log("got it", getOccurence(Intersection, notPosition[i]) )
        if(getOccurence(Intersection, notPosition[i]) === 0) {
           ////console.log("found this", notPosition[i], Intersection, Intersection.indexOf(notPosition[i]))

            if( typeof(notPosition[i]) !== 'string') {
                NoIntersection.push(notPosition[i])
            }

        }
    }


    //console.log("noIntersectionsIDs", NoIntersection)

    //console.log("IntersectionsIDs", Intersection)
}

function areaColorIfCollisionIsDetectedWithWall(intersectionList, indexIntersectList, color, idsNot, notPosition, Intersection, NoIntersection, IntersectionWith, subsetColliding) {
    //console.log("sobd", wallSubsetMeshes, intersectionList, indexIntersectList)
    for ( let j = 0; j < intersectionList.length; j++){
        //area against area
        if(intersectionList[j] === true){
            ////console.log(j, indexIntersectList[j][0])
            areas[indexIntersectList[j][0]].material.transparent = true;
            areas[indexIntersectList[j][0]].material.opacity = 0.5;
            areas[indexIntersectList[j][0]].material.color = color;

            areas[indexIntersectList[j][0]].uuid = allSubsetMeshes[indexIntersectList[j][0]].uuid
            // areas[indexIntersectList[j][1]].uuid = subsetColliding[indexIntersectList[j][1]].uuid
            //console.log("True Intersection",allSubsetMeshes[indexIntersectList[j][0]].uuid, subsetColliding[indexIntersectList[j][1]].uuid )

            Intersection.push(allSubsetMeshes[indexIntersectList[j][0]].uuid)
            IntersectionWith.push(subsetColliding[indexIntersectList[j][1]].uuid)

        } else  if(intersectionList[j] === false) {
            ////console.log("False Intersection",areas[indexIntersectList[j][1]].uuid,  )

            const idsFalse = areas[indexIntersectList[j][0]].uuid
            ////console.log('idsfalse', idsFalse)
            idsNot.push(idsFalse)

            if (notPosition.includes(idsFalse) === false){
                notPosition.push(idsFalse)

            }
        }
        ////console.log('notPosition', notPosition)
    }

    for(let i = 0; i < notPosition.length; i++){
       // //console.log("got it", getOccurence(Intersection, notPosition[i]) )
        if(getOccurence(Intersection, notPosition[i]) === 0) {
           ////console.log("found this", notPosition[i], Intersection, Intersection.indexOf(notPosition[i]))

            if( typeof(notPosition[i]) !== 'string') {
                NoIntersection.push(notPosition[i])
            }

        }
    }


    //console.log("noIntersectionsIDs", NoIntersection)

    //console.log("IntersectionsIDs", Intersection)
}




const input = ['Bett', 'Küchenzeile','WC', 'Waschtisch', 'Badewanne', 'Dusche']

let activateButton = document.createElement('button');
activateButton.innerText = 'Möbelauswahl';
activateButton.id = 'activeButton'
activateButton.classList.add('buttonsArea');

const checkBtn = document.getElementById('checkedBtn')


function getOccurence(array, value) {
    var count = 0;
    array.forEach((v) => (v === value && count++));
    return count;
    //return array.filter((v) => (v === value)).length;
}

function DINCHECKER(){

    checkedList.length = 0;
    indices.length = 0;

    checkedListContains.length = 0;
    indicesContains.length = 0;

    checkedListIntersectFurn.length = 0;
    indicesIntersectFurn.length = 0;

    checkedListContainsFurn.length = 0;
    indicesContainsFurn.length = 0;

    checkedListContainsAreaAndFurn.length = 0;
    indicesContainsAreaAndFurn.length = 0;

    checkedListIntersectFurnAndArea.length = 0;
    indicesIntersectFurnAndArea.length = 0;

    checkedListContainsFurnAndArea.length = 0;
    indicesContainsFurnAndArea.length = 0;

    checkedListIntersectAreaAndFurn.length = 0;
    indicesIntersectAreaAndFurn.length = 0;

    checkedListAreaIntersectWall.length = 0;
    indicesIntersectAreaAndWall.length = 0;

    checkedListAreaContainsWall.length = 0;
    indicesContainsAreaAndWall.length = 0;

    checkedListFurnIntersectWall.length = 0;
    indicesIntersectFurnAndWall.length = 0;

    checkedListFurnContainsWall.length = 0;
    indicesContainsFurnAndWall.length = 0;


    checkedListInFront.length = 0;
    indicesInFront.length = 0;

    checkedListContainsInFront.length = 0;
    indicesContainsInFront.length = 0;

    checkedListIntersectFurnInFront.length = 0;
    indicesIntersectFurnInFront.length = 0;

    checkedListContainsFurnInFront.length = 0;
    indicesContainsFurnInFront.length = 0;

    checkedListIntersectFurnAndAreaInFront.length = 0;
    indicesIntersectFurnAndAreaInFront.length = 0;

    checkedListContainsFurnAndAreaInFront.length = 0;
    indicesContainsFurnAndAreaInFront.length = 0;

    checkedListIntersectFurnAndArea.length = 0;
    indicesIntersectFurnAndArea.length = 0;

    checkedListContainsFurnAndArea.length = 0;
    indicesContainsFurnAndArea.length = 0;


    positionsCollisions.length = 0;
    allIdsFalseAreaIntersectArea.length = 0;
    falsePositionsAreaIntersectArea.length = 0;

    allIdsFalseAreaContainsArea.length = 0;
    falsePositionsAreaContainsArea.length = 0;

    allIdsFalseAreaIntersectFurn.length = 0;
    falsePositionsAreaIntersectFurn.length = 0;

    allIdsFalseAreaContainsFurn.length = 0;
    falsePositionsAreaContainsFurn.length = 0;

    allIdsFalseFurnIntersectFurn.length = 0;
    falsePositionsFurnIntersectFurn.length = 0;

    allIdsFalseFurnContainsFurn.length = 0;
    falsePositionsFurnContainsFurn.length = 0;

    allIdsFalseAreaIntersectWall.length = 0;
    falsePositionsAreaIntersectWall.length = 0;

    allIdsFalseAreaContainsWall.length = 0;
    falsePositionsAreaContainsWall.length = 0;

    allIdsFalseFurnContainsWall.length = 0;
    falsePositionsFurnContainsWall.length = 0;

    allIdsFalseFurnIntersectWall.length = 0;
    falsePositionsFurnIntersectWall.length = 0;

    allIdsFalseAreaIntersectAreaInFront.length = 0;
    falsePositionsAreaIntersectAreaInFront.length = 0;

    allIdsFalseAreaContainsAreaInFront.length = 0;
    falsePositionsAreaContainsAreaInFront.length = 0;

    allIdsFalseAreaIntersectFurnInFront.length = 0;
    falsePositionsAreaIntersectFurnInFront.length = 0;

    allIdsFalseAreaContainsFurnInFront.length = 0;
    falsePositionsAreaContainsFurnInFront.length = 0;

    allIdsFalseFurnIntersectFurnInFront.length = 0;
    falsePositionsFurnIntersectFurnInFront.length = 0;

    allIdsFalseFurnContainsFurnInFront.length = 0;
    falsePositionsFurnContainsFurnInFront.length = 0;

    allIdsFalseAreaIntersectFurn.length = 0
    falsePositionsAreaIntersectFurn.length = 0

    allIdsFalseAreaContainsFurn.length = 0
    falsePositionsAreaContainsFurn.length = 0

    allIdsFalseFurnIntersectArea.length = 0;
    falsePositionsFurnIntersectArea.length = 0;

    allIdsFalseFurnContainsArea.length = 0;
    falsePositionsFurnContainsArea.length = 0;


    truePositions.length = 0;
    allIdsTrue.length = 0;

    noIntersectionsIDs.length = 0;
    IntersectionsIDs.length = 0;
    IntersectionsIDsWith.length = 0;

    noIntersectionsIDsAreaContainFurn.length = 0;
    IntersectionsIDsAreaContainFurn.length = 0;
    IntersectionsIDsAreaContainFurnWith.length = 0;


    noIntersectionsIDsAreaIntersectArea.length = 0;
    IntersectionsIDsAreaIntersectArea.length = 0;
    IntersectionsIDsAreaIntersectAreaWith.length = 0;

    noIntersectionsIDsAreaContainArea.length = 0;
    IntersectionsIDsAreaContainArea.length = 0;
    IntersectionsIDsAreaContainAreaWith.length = 0;

    noIntersectionsIDsFurnIntersectFurn.length = 0;
    IntersectionsIDsFurnIntersectFurn.length = 0;
    IntersectionsIDsFurnIntersectFurnWith.length = 0;

    noIntersectionsIDsFurnContainFurn.length = 0;
    IntersectionsIDsFurnContainFurn.length = 0;
    IntersectionsIDsFurnContainFurnWith.length = 0;

    noIntersectionsIDsAreaIntersectWall.length = 0;
    IntersectionsIDsAreaIntersectWall.length = 0;
    IntersectionsIDsAreaIntersectWallWith.length = 0;

    noIntersectionsIDsAreaContainWall.length = 0;
    IntersectionsIDsAreaContainWall.length = 0;
    IntersectionsIDsAreaContainWallWith.length = 0;

    noIntersectionsIDsFurnContainWall.length = 0;
    IntersectionsIDsFurnContainWall.length = 0;
    IntersectionsIDsFurnContainWallWith.length = 0;

    noIntersectionsIDsFurnIntersectWall.length = 0;
    IntersectionsIDsFurnIntersectWall.length = 0;
    IntersectionsIDsFurnIntersectWallWith.length = 0;

    noIntersectionsIDsInFront.length = 0;
    IntersectionsIDsInFront.length = 0;
    IntersectionsIDsWithInFront.length = 0;

    noIntersectionsIDsAreaContainFurnInFront.length = 0;
    IntersectionsIDsAreaContainFurnInFront.length = 0;
    IntersectionsIDsAreaContainFurnWithInFront.length = 0;


    noIntersectionsIDsAreaIntersectAreaInFront.length = 0;
    IntersectionsIDsAreaIntersectAreaInFront.length = 0;
    IntersectionsIDsAreaIntersectAreaWithInFront.length = 0;

    noIntersectionsIDsAreaContainAreaInFront.length = 0;
    IntersectionsIDsAreaContainAreaInFront.length = 0;
    IntersectionsIDsAreaContainAreaWithInFront.length = 0;

    noIntersectionsIDsFurnIntersectFurnInFront.length = 0;
    IntersectionsIDsFurnIntersectFurnInFront.length = 0;
    IntersectionsIDsFurnIntersectFurnWithInFront.length = 0;

    noIntersectionsIDsFurnContainFurnInFront.length = 0;
    IntersectionsIDsFurnContainFurnInFront.length = 0;
    IntersectionsIDsFurnContainFurnWithInFront.length = 0;


    noIntersectionsIDsFurnIntersectArea.length = 0
    IntersectionsIDsFurnIntersectArea.length = 0
    IntersectionsIDsFurnIntersectAreaWith.length = 0

    noIntersectionsIDsFurnContainArea.length = 0
    IntersectionsIDsFurnContainArea.length = 0
    IntersectionsIDsFurnContainAreaWith.length = 0






    for(let i = 0; i < boundingCubes.length; i++){
        //indexedBoundingBox(i)
        // check if any collisions are there and fills Lists if any
        indexedBoundingBoxCollision(i, boundingCubes, boundingCubes, checkedList,indices,checkedListContains, indicesContains)
        indexedBoundingBoxCollision(i, subsetBoundingBoxes, subsetBoundingBoxes, checkedListIntersectFurn, indicesIntersectFurn,checkedListContainsFurn, indicesContainsFurn)
        indexedBoundingBoxCollision(i, subsetBoundingBoxes, boundingCubes, checkedListIntersectFurnAndArea,indicesIntersectFurnAndArea,checkedListContainsFurnAndArea, indicesContainsFurnAndArea)
        indexedBoundingBoxCollision(i, boundingCubes, subsetBoundingBoxes, checkedListIntersectAreaAndFurn,indicesIntersectAreaAndFurn,checkedListContainsAreaAndFurn, indicesContainsAreaAndFurn)

    }
    // for(let i = 0; i < boundingCubesInFront.length; i++){
    //     //indexedBoundingBox(i)
    //     // check if any collisions are there and fills Lists if any
    //     indexedBoundingBoxCollision(i, boundingCubesInFront, boundingCubes, checkedListInFront,indicesInFront,checkedListContainsInFront, indicesContainsInFront)
    //     indexedBoundingBoxCollision(i, boundingCubesInFront, boundingCubesInFront, checkedListIntersectFurnInFront, indicesIntersectFurnInFront,checkedListContainsFurnInFront, indicesContainsFurnInFront)
    //     indexedBoundingBoxCollision(i, subsetBoundingBoxes, boundingCubesInFront, checkedListIntersectFurnAndAreaInFront,indicesIntersectFurnAndAreaInFront,checkedListContainsFurnAndAreaInFront, indicesContainsFurnAndAreaInFront)
    // }


    for(let i = 0; i < wallBounds.length; i++){
            indexedBoundingBoxCollision(i, boundingCubes, wallBounds, checkedListAreaIntersectWall,indicesIntersectAreaAndWall,checkedListAreaContainsWall, indicesContainsAreaAndWall)
            indexedBoundingBoxCollision(i, subsetBoundingBoxes, wallBounds, checkedListFurnIntersectWall,indicesIntersectFurnAndWall,checkedListFurnContainsWall, indicesContainsFurnAndWall)
    }





    areaColorIfCollisionIsDetected(checkedList, indices, areaIntersectAreaColor, allIdsFalseAreaIntersectArea, falsePositionsAreaIntersectArea, IntersectionsIDsAreaIntersectArea, noIntersectionsIDsAreaIntersectArea, IntersectionsIDsAreaIntersectAreaWith, allSubsetMeshes)
    areaColorIfCollisionIsDetected(checkedListContains, indicesContains, areaContainAreaColor, allIdsFalseAreaContainsArea, falsePositionsAreaContainsArea, IntersectionsIDsAreaContainArea, noIntersectionsIDsAreaContainArea, IntersectionsIDsAreaContainAreaWith, allSubsetMeshes )


    areaColorIfCollisionIsDetected(checkedListIntersectFurn, indicesIntersectFurn, furnIntersectFurnColor, allIdsFalseFurnIntersectFurn, falsePositionsFurnIntersectFurn, IntersectionsIDsFurnIntersectFurn,noIntersectionsIDsFurnIntersectFurn, IntersectionsIDsFurnIntersectFurnWith, allSubsetMeshes )
    areaColorIfCollisionIsDetected(checkedListContainsFurn, indicesContainsFurn, furnContainFurnColor, allIdsFalseFurnContainsFurn, falsePositionsFurnContainsFurn, IntersectionsIDsFurnContainFurn, noIntersectionsIDsFurnContainFurn, IntersectionsIDsFurnContainFurnWith, allSubsetMeshes)

    areaColorIfCollisionIsDetected(checkedListIntersectFurnAndArea, indicesIntersectFurnAndArea, furnClashAreaColor, allIdsFalseAreaIntersectFurn, falsePositionsAreaIntersectFurn, IntersectionsIDs, noIntersectionsIDs, IntersectionsIDsWith, allSubsetMeshes)
    areaColorIfCollisionIsDetected(checkedListContainsFurnAndArea, indicesContainsFurnAndArea, furnContainAreaColor, allIdsFalseAreaContainsFurn, falsePositionsAreaContainsFurn,IntersectionsIDsAreaContainFurn, noIntersectionsIDsAreaContainFurn, IntersectionsIDsAreaContainFurnWith, allSubsetMeshes )

    areaColorIfCollisionIsDetected(checkedListIntersectAreaAndFurn, indicesIntersectAreaAndFurn, furnClashAreaColor, allIdsFalseFurnIntersectArea, falsePositionsFurnIntersectArea, IntersectionsIDsFurnIntersectArea, noIntersectionsIDsFurnIntersectArea, IntersectionsIDsFurnIntersectAreaWith, allSubsetMeshes)
    areaColorIfCollisionIsDetected(checkedListContainsAreaAndFurn, indicesContainsAreaAndFurn, furnContainAreaColor, allIdsFalseFurnContainsArea, falsePositionsFurnContainsArea,IntersectionsIDsFurnContainArea, noIntersectionsIDsFurnContainArea, IntersectionsIDsFurnContainAreaWith, allSubsetMeshes )

    areaColorIfCollisionIsDetectedWithWall(checkedListAreaIntersectWall, indicesIntersectAreaAndWall, wallCollisionColor, allIdsFalseAreaIntersectWall, falsePositionsAreaIntersectWall, IntersectionsIDsAreaIntersectWall, noIntersectionsIDsAreaIntersectWall, IntersectionsIDsAreaIntersectWallWith, wallSubsetMeshes)
    areaColorIfCollisionIsDetectedWithWall(checkedListAreaContainsWall, indicesContainsAreaAndWall, wallCollisionColor, allIdsFalseAreaContainsWall, falsePositionsAreaContainsWall, IntersectionsIDsAreaContainWall, noIntersectionsIDsAreaContainWall, IntersectionsIDsAreaContainWallWith, wallSubsetMeshes)

    areaColorIfCollisionIsDetectedWithWall(checkedListFurnIntersectWall, indicesIntersectFurnAndWall, wallCollisionColor , allIdsFalseFurnIntersectWall, falsePositionsFurnIntersectWall,IntersectionsIDsFurnIntersectWall , noIntersectionsIDsFurnIntersectWall, IntersectionsIDsFurnIntersectWallWith, wallSubsetMeshes)
    areaColorIfCollisionIsDetectedWithWall(checkedListFurnContainsWall, indicesContainsFurnAndWall, wallCollisionColor, allIdsFalseFurnContainsWall, falsePositionsFurnContainsWall,IntersectionsIDsFurnContainWall, noIntersectionsIDsFurnContainWall, IntersectionsIDsFurnContainWallWith, wallSubsetMeshes)



    // areaColorIfCollisionIsDetectedInFront(checkedListInFront, indicesInFront, areaIntersectAreaColor, allIdsFalseAreaIntersectAreaInFront, falsePositionsAreaIntersectAreaInFront, IntersectionsIDsAreaIntersectAreaInFront, noIntersectionsIDsAreaIntersectAreaInFront, IntersectionsIDsAreaIntersectAreaWithInFront, allSubsetMeshes)
    // areaColorIfCollisionIsDetectedInFront(checkedListContainsInFront, indicesContainsInFront, areaContainAreaColor, allIdsFalseAreaContainsAreaInFront, falsePositionsAreaContainsAreaInFront, IntersectionsIDsAreaContainAreaInFront, noIntersectionsIDsAreaContainAreaInFront, IntersectionsIDsAreaContainAreaWithInFront, allSubsetMeshes )

    // areaColorIfCollisionIsDetectedInFront(checkedListIntersectFurnInFront, indicesIntersectFurnInFront, furnIntersectFurnColor, allIdsFalseFurnIntersectFurnInFront, falsePositionsFurnIntersectFurnInFront, IntersectionsIDsFurnIntersectFurnInFront,noIntersectionsIDsFurnIntersectFurnInFront, IntersectionsIDsFurnIntersectFurnWithInFront, allSubsetMeshes )
    // areaColorIfCollisionIsDetectedInFront(checkedListContainsFurnInFront, indicesContainsFurnInFront, furnContainFurnColor, allIdsFalseFurnContainsFurnInFront, falsePositionsFurnContainsFurnInFront, IntersectionsIDsFurnContainFurnInFront, noIntersectionsIDsFurnContainFurnInFront, IntersectionsIDsFurnContainFurnWithInFront, allSubsetMeshes)

    // areaColorIfCollisionIsDetectedInFront(checkedListIntersectFurnAndAreaInFront, indicesIntersectFurnAndAreaInFront, furnClashAreaColor, allIdsFalseAreaIntersectFurnInFront, falsePositionsAreaIntersectFurnInFront, IntersectionsIDsInFront, noIntersectionsIDsInFront, IntersectionsIDsWithInFront, allSubsetMeshes)
    // areaColorIfCollisionIsDetectedInFront(checkedListContainsFurnAndAreaInFront, indicesContainsFurnAndAreaInFront, furnContainAreaColor, allIdsFalseAreaContainsFurnInFront, falsePositionsAreaContainsFurnInFront,IntersectionsIDsAreaContainFurnInFront, noIntersectionsIDsAreaContainFurnInFront, IntersectionsIDsAreaContainFurnWithInFront, allSubsetMeshes )

   //IntersectionsIDsAreaIntersectArea
    allLists = IntersectionsIDsAreaContainFurn.concat(IntersectionsIDsAreaContainArea,
        IntersectionsIDsFurnIntersectFurn,
        IntersectionsIDsFurnContainFurn,
        IntersectionsIDsFurnIntersectArea,
        IntersectionsIDsFurnContainArea,
        IntersectionsIDs,
        IntersectionsIDsAreaIntersectWall,
        IntersectionsIDsAreaContainWall,
        IntersectionsIDsFurnIntersectWall,
        IntersectionsIDsFurnContainWall)





    //console.log("Blue, IntersectionsIDsAreaIntersectArea3", IntersectionsIDsAreaIntersectArea, IntersectionsIDsAreaIntersectAreaInFront)
    //console.log("lila, IntersectionsIDsAreaContainArea3", IntersectionsIDsAreaContainArea, IntersectionsIDsAreaContainAreaInFront)
    //console.log("rosa, IntersectionsIDsFurnIntersectFurn3", IntersectionsIDsFurnIntersectFurn, IntersectionsIDsFurnIntersectFurnInFront)
    //console.log("kaki, IntersectionsIDsFurnContainFurn3", IntersectionsIDsFurnContainFurn, IntersectionsIDsFurnContainFurnInFront)
    //console.log("beere, IntersectionsIDs3", IntersectionsIDs, IntersectionsIDsInFront, IntersectionsIDsAreaIntersectWall, IntersectionsIDsAreaContainWall, IntersectionsIDsFurnIntersectWall, IntersectionsIDsFurnContainWall)
    //console.log("dunkelgrün, IntersectionsIDsAreaContainFurn3", IntersectionsIDsAreaContainFurn, IntersectionsIDsAreaContainFurnInFront)

}

document.querySelectorAll('button').forEach(occurence => {
    let id = occurence.getAttribute('id');
    occurence.addEventListener('click', async function() {
    //console.log('A button with ID ' + id + ' was clicked!')

    if(id === 'uploadmode'){

        const uploadbtn = document.getElementById('uploadmode')
        uploadbtn.onclick = clickedOnce('demo'," ",'dincheck-buttonhover', uploadbtn  )


        uploadmodeIsActive = true;

        ifcModel = await showModel()


        canvas.onpointermove = (event) => pick(event, hightlightMaterial, false, ifcModels);
        //canvas.ondblclick = (event) => pick(event, selectionMaterial, true, ifcModels);

    } else {
        uploadmodeIsActive = false;
        //console.log("uploadmode deactivated", uploadmodeIsActive)
    }


    // if(id === 'drawmode'){
    //     drawmodeIsActive = true;
    //     //console.log("drawmode active", drawmodeIsActive)
    //     document.addEventListener( 'pointermove', onPointerMove);
    //     //  document.addEventListener( 'pointermove', addGumballToSphere );
    //     document.addEventListener( 'dblclick', onPointerDown);
    //     document.addEventListener( 'keydown', onDocumentKeyDown );
    //     document.addEventListener( 'keyup', onDocumentKeyUp );
    //     document.addEventListener( 'keydown', undoAndRedo );

    // } else {
    //     drawmodeIsActive = false;
    //     //console.log("drawmode deactivated", drawmodeIsActive)
    //     document.removeEventListener( 'pointermove', onPointerMove );
    //     //  document.removeEventListener( 'pointermove', removeGumballToSphere );
    //     document.removeEventListener( 'dblclick', onPointerDown );
    //     document.removeEventListener( 'keydown', onDocumentKeyDown );
    //     document.removeEventListener( 'keyup', onDocumentKeyUp );
    //     document.removeEventListener( 'keydown', undoAndRedo );
    // }

    if(id === 'furnituremode'){
        const uploadbtn = document.getElementById('furnituremode')
        uploadbtn.onclick = clickedOnce('demo'," ",'dincheck-buttonhover', uploadbtn  )


        furnituremodeIsActive = true;



        ifcModels.pop()
        model.removeFromParent();
        scene.remove(model)


        checkBtn.style.visibility = 'visible'

       ////////////////////////
    //    const closeTab = document.getElementById('Check');
    //    closeTab.style.visibility = 'hidden'
        const containerTab = document.getElementById('programmFurniture');

        const divElement = document.createElement('div');
        divElement.id = `${'Bett'}-1`;
        divElement.classList.add('modal');
        containerTab.appendChild(divElement)

        const modalBackround = document.getElementById(`${'Bett'}-1`)
        modalBackround.style.display ='block';
        checkBtn.style.visibility = 'hidden'

       const formElement = document.createElement('form');
       formElement.classList.add('modal-content');
       formElement.action = '/action_page.php';

       divElement.appendChild(formElement)

       const formContent = document.createElement('div');
       formContent.classList.add('containerForm');


       const heading = document.createElement('p');
       heading.innerText = `Wähle das ${'Bett'} aus.`

       const decision = document.createElement('div');
       decision.classList.add('clearfix');

       const yesBtn = document.createElement('button');
       yesBtn.type = 'button';
       yesBtn.classList.add('buttonsArea')
       yesBtn.style.backgroundColor = 'darkgrey'
       yesBtn.innerText = 'ok'
       yesBtn.id = 'trueBtn'

       let clicked

       yesBtn.onclick= () => {
            const modalBackround = document.getElementById(`${'Bett'}-1`)
            modalBackround.style.display='none';
            clicked = false
            return clicked

        }

       formContent.appendChild(heading)
       formContent.appendChild(decision)
       decision.appendChild(yesBtn)

       formElement.appendChild(formContent)



        document.querySelectorAll('button').forEach(occurence => {
            let id = occurence.getAttribute('id');
            occurence.addEventListener('click', async function() {

            if(id === 'trueBtn'){

                //console.log('A button with ID ' + id + ' was clicked!')
                const buttonTxt = document.getElementById('programmFurniture')
                //console.log(buttonTxt)
                buttonTxt.innerText = `Klicke ein/e ${'Bett'} jetzt an...` ;

                var bedtest = document.getElementById(`${'Bett'}`)
                bedtest.checked = true
                //console.log("bedtest", bedtest)


            }


            })


    })
        await allElements()
        await getAllFurniture();


        await getRefDirectionFurniture()

        await startPositionAllSubsetMeshes(allSubsetMeshes)



        const visibleCheckboxes = document.getElementsByClassName('tabcontent-flexible')
        const checkboxesFurn = visibleCheckboxes[0]
        checkboxesFurn.style.visibility = 'hidden'
        //console.log("allsubs", allSubsetMeshes)

        for(let id = 0; id < allSubsetMeshes.length; id++){
            allSubsetMeshesIDs.push(allSubsetMeshes[id].uuid)
        }
        // canvas.ondblclick = (event) =>  pickFurniture(event, selectionMaterialFurniture ,allSubsetMeshes ) ;

    } else {
        furnituremodeIsActive = false;
        //console.log("furnituremode deactivated", furnituremodeIsActive)

        const visibleCheckboxes = document.getElementsByClassName('tabcontent-flexible')
        const checkboxesFurn = visibleCheckboxes[0]
        checkboxesFurn.style.visibility = 'hidden'

         }

    if(id === 'checkedBtn') {
        checkedBtnmodeIsActive = true;
        //console.log('checkedBtm')

        const buttonTxt = document.getElementById('programmFurniture')
        buttonTxt.innerText = `Möbelauswahl` ;


        input.shift()
        //console.log("newInput", input)

        if(input.length >= 1 ){
            activateButton.style.color = 'grey'
            activateButton.disabled = true

            activatePopUpMenu(input, checkBtn);
        } else {

            checkBtn.style.color = 'grey'
            checkBtn.disabled = true
            checkBtn.style.visibility = 'hidden'
            buttonTxt.innerText = `` ;
            canvas.onpointerup = () =>  console.log("hey1") ;
        }

        //canvas.onpointerup = (event) =>  console.log("hey") ;


    } else {
        checkedBtnmodeIsActive = false;


        //console.log('checkedBtm False')


        //activatePopUpMenu(input[1], activateButton)

    }

    if(id === 'storymode'){
        // const uploadbtn = document.getElementById('storymode')
        // uploadbtn.onclick = clickedOnce('demo'," ",'dincheck-buttonhover', uploadbtn  )


        storymodeIsActive = true;



        hightlightMaterialSecond.opacity = 0.0;
        for(let id = 0; id < areas.length; id++){


                for(let mat = 0; mat < checkedMats.length; mat++){
                    areas[id].material = checkedMats[id];
                    areas[id].position.set( areas[id].position.x, 0.0 ,  areas[id].position.z)

                }

        }


        for(let ref = 0; ref < areas.length; ref++){
            //console.log('helllo', areas[ref].uuid, specificFurnIDList[2].value, allSubsetMeshes)
            if(areas[ref].uuid === specificFurnIDList[2].value){
                console.log("ii",specificFurnIDList[2].value, allSubsetMeshes[ref].children[0].getWorldPosition(new Vector3()), areas[ref].position)

                if(ReferenceDirections[ref].x < 0){
                    console.log("x-1 ii")
                    const spherePos = allSubsetMeshes[ref].children[0].getWorldPosition(new Vector3())
                    spherePos.x = areas[ref].position.x
                    const vectorDir = new Vector3( areas[ref].position.z - spherePos.z ,areas[ref].position.x - spherePos.x , 0)
                    console.log( "-1",spherePos, vectorDir.normalize(), specificFurnIDList)
                    modifiedDirections.push(vectorDir.normalize())
                }
                if(ReferenceDirections[ref].x > 0){
                    const spherePos = allSubsetMeshes[ref].children[0].getWorldPosition(new Vector3())
                    spherePos.x = areas[ref].position.x
                    const vectorDir = new Vector3( areas[ref].position.z - spherePos.z ,areas[ref].position.x - spherePos.x , 0)
                    console.log( "-1",spherePos, vectorDir.normalize())
                    modifiedDirections.push(vectorDir.normalize())

                }
                if(ReferenceDirections[ref].y < 0){
                    const spherePos = allSubsetMeshes[ref].children[0].getWorldPosition(new Vector3())
                    spherePos.z = areas[ref].position.z
                    const vectorDir = new Vector3( areas[ref].position.z - spherePos.z ,areas[ref].position.x - spherePos.x , 0)
                    console.log( "-1",spherePos, vectorDir.normalize())
                    modifiedDirections.push(vectorDir.normalize())

                }
                if(ReferenceDirections[ref].y > 0){
                    const spherePos = allSubsetMeshes[ref].children[0].getWorldPosition(new Vector3())
                    spherePos.z = areas[ref].position.z
                    const vectorDir = new Vector3( areas[ref].position.z - spherePos.z ,areas[ref].position.x - spherePos.x , 0)
                    console.log( "-1",spherePos, vectorDir.normalize())
                    modifiedDirections.push(vectorDir.normalize())

                }
            }
            if(areas[ref].uuid === specificFurnIDList[0].value){
                console.log("ii2",specificFurnIDList[0].value, allSubsetMeshes[ref].children[0].getWorldPosition(new Vector3()), areas[ref].position)

                if(ReferenceDirections[ref].x < 0){
                    console.log("x-1 ii")
                    const spherePos = allSubsetMeshes[ref].children[0].getWorldPosition(new Vector3())
                    spherePos.x = areas[ref].position.x
                    const vectorDir = new Vector3( areas[ref].position.z - spherePos.z ,areas[ref].position.x - spherePos.x , 0)
                    console.log( "-1",spherePos, vectorDir.normalize(), specificFurnIDList)
                    modifiedDirections.push(vectorDir.normalize())
                }
                if(ReferenceDirections[ref].x > 0){
                    const spherePos = allSubsetMeshes[ref].children[0].getWorldPosition(new Vector3())
                    spherePos.x = areas[ref].position.x
                    const vectorDir = new Vector3( areas[ref].position.z - spherePos.z ,areas[ref].position.x - spherePos.x , 0)
                    console.log( "-1",spherePos, vectorDir.normalize())
                    modifiedDirections.push(vectorDir.normalize())

                }
                if(ReferenceDirections[ref].y < 0){
                    const spherePos = allSubsetMeshes[ref].children[0].getWorldPosition(new Vector3())
                    spherePos.z = areas[ref].position.z
                    const vectorDir = new Vector3( areas[ref].position.z - spherePos.z ,areas[ref].position.x - spherePos.x , 0)
                    console.log( "-1",spherePos, vectorDir.normalize())
                    modifiedDirections.push(vectorDir.normalize())

                }
                if(ReferenceDirections[ref].y > 0){
                    const spherePos = allSubsetMeshes[ref].children[0].getWorldPosition(new Vector3())
                    spherePos.z = areas[ref].position.z
                    const vectorDir = new Vector3( areas[ref].position.z - spherePos.z ,areas[ref].position.x - spherePos.x , 0)
                    console.log( "-1",spherePos, vectorDir.normalize())
                    modifiedDirections.push(vectorDir.normalize())

                }
            }
            if(areas[ref].uuid !== specificFurnIDList[0].value && areas[ref].uuid !== specificFurnIDList[2].value ){
                const spherePos = allSubsetMeshes[ref].children[0].getWorldPosition(new Vector3())
                const vectorDir = new Vector3( areas[ref].position.z - spherePos.z ,areas[ref].position.x - spherePos.x , 0)
                console.log( "-1 else", areas[ref].uuid, spherePos, vectorDir.normalize())
                modifiedDirections.push(vectorDir.normalize())
            }
        }



        //console.log("storymode active", storymodeIsActive)
        if(storymodeIsActive) {
            //console.log(deleteButton)
            //deleteButton.removeFromParent();
            deleteButton.style.visibility = 'hidden'



        }

        for(let p = 0; p < doorSub[0].length; p++){
            scene.remove(doorSub[0][p])
        }
        for(let p = 0; p < windowSub[0].length; p++){
            scene.remove(windowSub[0][p])
        }
        
        for(let p = 0; p < slabSub[0].length; p++){
            scene.remove(slabSub[0][p])
        }
       

    } else {
        storymodeIsActive = false;
        //console.log("storymode deactivated", storymodeIsActive)
    }

    if (id === 'dincheckmode'){
        const uploadbtn = document.getElementById('dincheckmode')
        uploadbtn.onclick = clickedOnce('demo'," ",'dincheck-buttonhover', uploadbtn  )
        canvas.ondblclick = () =>  console.log("hey") ;
        dincheckmodeIsActive = true

        // Other Areas 1.5 x 1.5
        const sizeArea = 1.5;
        for (let id = 0; id < specificFurnIDList.length; id++){
            const specificID = Object.entries(specificFurnIDList[id])
            //console.log("specificFurnIDList", specificFurnIDList, specificID[1][1], specificID, allSubsetMeshesIDs)
            foundMeshesCheckbox.push(specificID[1][1])
        }
            for(let g = 0; g < allSubsetMeshesIDs.length; g++){
                const index = foundMeshesCheckbox.indexOf(allSubsetMeshesIDs[g])
                if (index === -1 ) {
                    //console.log("foundMeshesCheckbox 2 Not",foundMeshesCheckbox,index, allSubsetMeshesIDs[g], allSubsetMeshes[g], areaMeshes[g], ReferenceDirections[g], ReferenceDirections)

                    const indexNoarea = allSubsetMeshesIDs.indexOf(allSubsetMeshesIDs[g] )
                    noSpecificAreaIndex.push(indexNoarea)


                    //console.log("nme", indexNoarea, areaMeshes, areaMeshes[indexNoarea])

                }
            }
            for(let index = 0; index < noSpecificAreaIndex.length; index++){

                const indexNoarea = noSpecificAreaIndex[index]
                //console.log("indexno",noSpecificAreaIndex, indexNoarea, areaMeshes[indexNoarea], areaMeshes )



                noSpecificFurnIDList.push(areaMeshes[indexNoarea].uuid)

                    if(ReferenceDirections[indexNoarea].x > 0){


                        const areaRandom = new BoxGeometry(sizeArea ,0.005,sizeArea)
                        const areaRandomMesh = new Mesh(
                            areaRandom,
                            new MeshBasicMaterial({color: areaIntersectAreaColor, transparent: true, opacity: 0.3})

                        )


                        areaRandomMesh.position.set(areaMeshes[indexNoarea].position.x, 0,areaMeshes[indexNoarea].position.z+ sizeArea/2 + areaMeshes[indexNoarea].geometry.parameters.depth/2)

                        //console.log("areaRandomMesh", areaRandomMesh)
                        scene.add(areaRandomMesh)
                        areaMeshes.splice(indexNoarea, 1,  areaRandomMesh)
                        areasInFront.push(areaRandomMesh)

                    }

                    if(ReferenceDirections[indexNoarea].x < 0){
                        const areaRandom = new BoxGeometry(sizeArea ,0.005,sizeArea)
                        const areaRandomMesh = new Mesh(
                            areaRandom,
                            new MeshBasicMaterial({color: areaIntersectAreaColor, transparent: true, opacity: 0.3})

                        )
                        const size = allSubsetMeshes[indexNoarea].geometry.boundingBox.getSize(new Vector3());
                        areaRandomMesh.position.set(areaMeshes[indexNoarea].position.x, 0,areaMeshes[indexNoarea].position.z   - sizeArea/2 - size.z/2 )

                        scene.add(areaRandomMesh)

                        //console.log("areaRandomMesh", areaRandomMesh)
                        areaMeshes.splice(indexNoarea, 1,  areaRandomMesh)
                        areasInFront.push(areaRandomMesh)

                    }
                    if(ReferenceDirections[indexNoarea].y > 0){
                        const areaRandom = new BoxGeometry(sizeArea ,0.005,sizeArea)
                        const areaRandomMesh = new Mesh(
                            areaRandom,
                            new MeshBasicMaterial({color: areaIntersectAreaColor, transparent: true, opacity: 0.3})

                        )
                        areaRandomMesh.position.set(areaMeshes[indexNoarea].position.x + sizeArea/2 + areaMeshes[indexNoarea].geometry.parameters.width/2 , 0,areaMeshes[indexNoarea].position.z)

                        scene.add(areaRandomMesh)


                        areaMeshes.splice(indexNoarea, 1,  areaRandomMesh)
                        areasInFront.push(areaRandomMesh)


                    }
                    if(ReferenceDirections[indexNoarea].y < 0){
                        const areaRandom = new BoxGeometry(sizeArea ,0.005,sizeArea)
                        const areaRandomMesh = new Mesh(
                            areaRandom,
                            new MeshBasicMaterial({color: areaIntersectAreaColor, transparent: true, opacity: 0.3})

                        )
                        areaRandomMesh.position.set(areaMeshes[indexNoarea].position.x - sizeArea/2 -areaMeshes[indexNoarea].geometry.parameters.width/2 , 0,areaMeshes[indexNoarea].position.z)

                        scene.add(areaRandomMesh)
                        areaMeshes.splice(indexNoarea, 1,  areaRandomMesh)

                        areasInFront.push(areaRandomMesh)


                    }
               }








        const buttonTxt = document.getElementById('programmFurniture')
        buttonTxt.innerText = `` ;

        checkallmodeIsActive = true
        furnituremodeIsActive = false
        //console.log("checkallmode activated", checkallmodeIsActive)

        for(let object = 0; object < areaMeshes.length; object++){
            const areasChild = areaMeshes[object].children[0]
            //console.log("areaChild", areasChild)

            areas.push(areasChild)

        }
        // for(let object = 0; object < areaMeshes.length; object++){
        areas = areaMeshes

        for(let ref = 0; ref < areas.length; ref++){
            const pos = new Vector3(areas[ref].position.x, areas[ref].position.y, areas[ref].position.z);
            resetPositionsFurn.push(pos)

            const distanceX = startPositionsFurns[ref].x - pos.x
            const distanceY = startPositionsFurns[ref].y - pos.y
            const distanceZ = startPositionsFurns[ref].z - pos.z
            console.log("Distan", distanceX, distanceY, distanceZ, areas[ref].position, startPositionsFurns[ref])
            ReferencePositions.push(new Vector3(distanceX, distanceY, distanceZ))

            resetRotationFurn.push(new Vector3(areas[ref].rotation.x,
                areas[ref].rotation.y,
                areas[ref].rotation.z))
            const RefDirArea = new Vector3(areas[ref].rotation.x,
                areas[ref].rotation.y,
                areas[ref].rotation.z).normalize();

                if(RefDirArea.x === 0 && RefDirArea.y === 0 && RefDirArea.z ===0){
                    RefDirArea.x = ReferenceDirections[ref].x
                    RefDirArea.y = ReferenceDirections[ref].y
                    RefDirArea.z = ReferenceDirections[ref].z
                }
                ReferenceDirectionsAreas.push(RefDirArea)



        }
        console.log("areas", ReferenceDirectionsAreas, areas, ReferencePositions)



        boundingBoxes(areas)





    } else {

        checkallmodeIsActive = false
        dincheckmodeIsActive = false
        //console.log("checkallmode activated", checkallmodeIsActive)
    }

    //DIN Check on clicks
    if( id === 'checkall-button'){
        dincheckBtnIsActive = true
        //console.log("dincheckBtnIsActive", dincheckBtnIsActive)

        const checkallbtn = document.getElementById('checkall-button')
        checkallbtn.onclick = clickedOnce('demo',"DIN Check wurde ausgeführt",'dincheck-buttonhover', checkallbtn  )




        DINCHECKER()



        translateAreaIfCollision(specificFurnIDList, 2, 0.6, 0.6)
        translateAreaIfCollision(specificFurnIDList, 0, 0.3, 0.3)


        //rotateOtherAreasAroundFurnitureIfCollision(noSpecificFurnIDList, 1.5)




        //console.log("Blue, IntersectionsIDsAreaIntersectArea", IntersectionsIDsAreaIntersectArea, IntersectionsIDsAreaIntersectAreaInFront)
        //console.log("lila, IntersectionsIDsAreaContainArea", IntersectionsIDsAreaContainArea)
        //console.log("rosa, IntersectionsIDsFurnIntersectFurn", IntersectionsIDsFurnIntersectFurn)
        //console.log("kaki, IntersectionsIDsFurnContainFurn", IntersectionsIDsFurnContainFurn)
        //console.log("beere, IntersectionsIDs", IntersectionsIDs, IntersectionsIDsAreaIntersectWall, IntersectionsIDsAreaContainWall, IntersectionsIDsFurnIntersectWall, IntersectionsIDsFurnContainWall)
        //console.log("dunkelgrün, IntersectionsIDsAreaContainFurn", IntersectionsIDsAreaContainFurn)


        for(let id = 0; id < areas.length; id++){
            areas[id].material.color = greyColor

        }


        boundingCubes.length = 0;
        boundingBoxes(areas)
        DINCHECKER()

        for(let id = 0; id < areas.length; id++){
            const materialStart = areas[id].material
            //console.log("materialStart", materialStart)
            checkedMats.push(materialStart)
        }

        //console.log("ifcPr", ifcProject)
        createTreeMenu(ifcProject, "tree-root")



    } else {
        dincheckBtnIsActive = false
        //console.log("dincheckBtnIsActiveFalse", dincheckBtnIsActive)
    }


    if(id === 'downloadmode'){
        downloadmodeIsActive = true;
        //console.log("downloadmode active", downloadmodeIsActive)
        for(let i =0 ; i < allSubsetMeshes.length; i++){
            const geom = new Box3(new Vector3(), new Vector3());
            geom.setFromObject(allSubsetMeshes[i])
            geom.copy(allSubsetMeshes[i].geometry.boundingBox).applyMatrix4(allSubsetMeshes[i].matrixWorld)

        }

        document.addEventListener('pointerup', setNewPosition(event, allSubsetMeshes ))



    } else {
        downloadmodeIsActive = false;
        //console.log("downloadmode deactivated", downloadmodeIsActive)
    }

    });
});


function clickedOnce(id, text, style, btn){
    document.getElementById(id).innerHTML = text;
    //checkCollisionAll(boundingCubes, areas, subsetBoundingBoxes)
    btn.disabled = true
    btn.classList.remove(style)

    ////console.log("boundingCubes", boundingCubes)
}

const boundingCubes = [];
let check;
let containing;
const selectedCube = []
let lastIndex;
let lastFurnitureFound
const subsetBoundingBoxes = [];

async function pickRelatedWall(event, furnitureMeshes, areasMeshes ) {



    for(let l = 0; l < labels.length; l++){
        //areas[id].add(labels[l])
        scene.remove(labels[l])

    }
    labels.length = 0

    const found = castObjects(event, furnitureMeshes)[0];
    //console.log("found Mesh", found, furnituremodeIsActive)
    if(found) {
        // //console.log("index", index)
        lastFurniture = found.object;
        console.log(lastFurniture)



        for(id = 0; id < areasMeshes.length; id++){
            if(areasMeshes[id].uuid === found.object.uuid){
                console.log("id", id,areasMeshes[id].uuid , found.object.uuid, selectedCube )
                lastIndex = id
            }
        }

        let center = new Vector3(0,0,0);
        center = areasMeshes[lastIndex].geometry.boundingBox.getCenter(center);

        gumball.position.set(center.x, center.y, center.z)
        gumball.setSpace('local');


        //lastIndex = areasMeshes.indexOf(found.object.uuid)
        console.log("lastIndex", lastIndex, areasMeshes, furnitureMeshes)

        //move furniture around
        gumball.attach(areasMeshes[lastIndex])
        ////console.log("Position", lastFurniture.position, furnitureMeshes[lastIndex].position)


        if(lastFurniture.position.x === 0 && lastFurniture.position.y === 0 && lastFurniture.position.z === 0 ){
            lastFurniture.rotation.set(areasMeshes[lastIndex].rotation.x, -areasMeshes[lastIndex].rotation.y, areasMeshes[lastIndex].rotation.z)

            lastFurniture.position.set( - 1 * areasMeshes[lastIndex].position.x, areasMeshes[lastIndex].position.y,-1 * areasMeshes[lastIndex].position.z)
            // lastFurniture.rotation.set(areasMeshes[lastIndex].rotation.x, -areasMeshes[lastIndex].rotation.y, areasMeshes[lastIndex].rotation.z)


        }


        scene.add(gumball)

    }
}

const areaPositions = [];
const startPositionAreas = [];
async function pickFurnitureSecond(event, furnitureMeshes, areasMeshes ) {
 
   

    if(gumball.showX !== true && gumball.mode === 'translate' ){
        gumball.showX = true;
    }
    if(gumball.showZ !== true && gumball.mode === 'translate' ) {
        gumball.showZ = true;
    }

    // gumball.showX = true;
    console.log(gumball.mode)
    // gumball.showZ = true;

    for(let l = 0; l < labels.length; l++){
        //areas[id].add(labels[l])
        scene.remove(labels[l])

    }
    labels.length = 0
    
    for(let l = 0; l < DINLabels.length; l++){
        //areas[id].add(labels[l])
        scene.remove(DINLabels[l])

    }
    DINLabels.length = 0

    for(let l = 1; l < startPositionAreas.length; l++){
        //areas[id].add(labels[l])
        scene.remove(startPositionAreas[l])

    }
    


    const found = castObjects(event, furnitureMeshes)[0];
    //console.log("found Mesh", found, furnituremodeIsActive)
    if(found) {
        // //console.log("index", index)
        lastFurniture = found.object;
        //lastFurniture.position.set(-lastFurniture.children[0].position.x  , -lastFurniture.children[0].position.y, -lastFurniture.children[0].position.z)
        //lastFurniture.rotation.set(-lastFurniture.rotation.x  , -lastFurniture.rotation.y, -lastFurniture.rotation.z)
        
       
        console.log(lastFurniture)

        selectedCube.push(found.object)

        for(id = 0; id < areasMeshes.length; id++){
            if(areasMeshes[id].uuid === found.object.uuid){
                console.log("id", id,areasMeshes[id].uuid , found.object.uuid, selectedCube )
                lastIndex = id
            }
        }



      


        let center = new Vector3(0,0,0);
        center = areasMeshes[lastIndex].geometry.boundingBox.getCenter(center);

        gumball.position.set(center.x, center.y, center.z)

        gumball.setSpace('local');


        //lastIndex = areasMeshes.indexOf(found.object.uuid)
        console.log("lastIndex", lastIndex, areasMeshes, furnitureMeshes)

        //move furniture around
        gumball.attach(areasMeshes[lastIndex])
        console.log("Position", lastFurniture, areasMeshes[lastIndex], centerPoints[lastIndex], areaPositions, allSubsetMeshes[lastIndex].children)


        //if(lastFurniture.position.x === 0 && lastFurniture.position.y === 0 && lastFurniture.position.z === 0 ){
            

            let centerFurn = new Vector3(0,0,0);
            centerFurn = furnitureMeshes[lastIndex].geometry.boundingBox.getCenter(centerFurn);
            console.log("centerFurn", centerFurn)

            

            //lastFurniture.position.set(-areasMeshes[lastIndex].position.x, areasMeshes[lastIndex].position.y,-areasMeshes[lastIndex].position.z)
            //lastFurniture.rotation.set(areasMeshes[lastIndex].rotation.x, -areasMeshes[lastIndex].rotation.y, areasMeshes[lastIndex].rotation.z)

                //areasMeshes[lastIndex].position.x + centerPoints[lastIndex].x , areasMeshes[lastIndex].position.y,areasMeshes[lastIndex].position.z)
            //areasMeshes[lastIndex].position.x, areasMeshes[lastIndex].position.y,areasMeshes[lastIndex].position.z
            // lastFurniture.rotation.set(areasMeshes[lastIndex].rotation.x, -areasMeshes[lastIndex].rotation.y, areasMeshes[lastIndex].rotation.z)
            console.log("Position2", lastFurniture.position, areaPositions[0].value.position, areasMeshes[lastIndex].position)

        //}

        //lastFurniture.rotation.y = -areasMeshes[lastIndex].rotation.y 
       

        // if(lastFurniture.uuid === specificFurnIDList[0].value){
        //     console.log("BETTCHEN")
        //     if(lastFurniture.uuid === areaPositions[0].key){
        //         //lastFurniture.rotation.set(lastFurniture.rotation.x  , -Math.PI/2, lastFurniture.rotation.z)
                
        //         //lastFurniture.rotation.set(furnitureMeshes[lastIndex].rotation.x, -furnitureMeshes[lastIndex].rotation.y, furnitureMeshes[lastIndex].rotation.z)
        //         //lastFurniture.rotation.set(areasMeshes[lastIndex].rotation.x, -areasMeshes[lastIndex].rotation.y, areasMeshes[lastIndex].rotation.z)
                
        //         const distX = (  centerPoints[lastIndex].x -  areasMeshes[lastIndex].position.x )
        //         const distY = (  centerPoints[lastIndex].y-areasMeshes[lastIndex].position.y)
        //         const distZ = (  centerPoints[lastIndex].z-areasMeshes[lastIndex].position.z)
        //         let distance = Math.sqrt(distX*distX + distY*distY + distZ*distZ)
                
                
      
        //         lastFurniture.position.set(- areasMeshes[lastIndex].position.x +  Math.sqrt(distX*distX), - areasMeshes[lastIndex].position.y,  -areasMeshes[lastIndex].position.z +  Math.sqrt(distZ*distZ))
             
               
        //         areasMeshes[lastIndex].add(lastFurniture)
        //         console.log("rtzui", lastFurniture.rotateOnAxis(new Vector3(0,1,0), 3*Math.PI/2))
        //         areasMeshes[lastIndex].children[0].rotation.y = areasMeshes[lastIndex].rotation.y
        //         //lastFurniture.position.set(areaPositions[0].value.position.x - -areasMeshes[lastIndex].position.x, areaPositions[0].value.position.y, -areaPositions[0].value.position.z - -areasMeshes[lastIndex].position.z)
        //         //lastFurniture.position.set(lastFurniture.children[0].position.x  , lastFurniture.children[0].position.y, lastFurniture.children[0].position.z)
        //     }
           
        // }else {
        //     console.log("Kein Bett")
        if(lastFurniture.position.x === 0 && lastFurniture.position.y === 0 && lastFurniture.position.z === 0 ){
            lastFurniture.position.set(-areasMeshes[lastIndex].position.x, areasMeshes[lastIndex].position.y,-areasMeshes[lastIndex].position.z)
            lastFurniture.rotation.set(areasMeshes[lastIndex].rotation.x, -areasMeshes[lastIndex].rotation.y, areasMeshes[lastIndex].rotation.z)
           
        }
        areasMeshes[lastIndex].add(lastFurniture)
            
        // }
        const sphereLocal = new Mesh(sphereGeometry, new MeshBasicMaterial({color: orangeColor}))
        sphereLocal.position.set(areasMeshes[lastIndex].position.x, areasMeshes[lastIndex].position.y, areasMeshes[lastIndex].position.z)
       
        
        startPositionAreas.unshift(sphereLocal)
        scene.add(startPositionAreas[0])

   
       

        console.log("Position3", lastFurniture.position, areasMeshes[lastIndex])
        scene.add(gumball)
        

       

      
        





    }
}



let middelPointsStartWalls;
const selectedWallGumball = [];
const lastDistance = [];
const startPositionWalls = [];
async function pickFurnitureWall(event, furnitureMeshes, areasMeshes ) {

    if(gumball.mode === 'rotate' ){
        gumball.setMode('translate');
    }
  

    for(let l = 0; l < labels.length; l++){
        //areas[id].add(labels[l])
        scene.remove(labels[l])

    }
    for(let l = 0; l < DINLabels.length; l++){
        //areas[id].add(labels[l])
        scene.remove(DINLabels[l])

    }


    DINLabels.length = 0
    labels.length = 0
    relatedID.length = 0;
    otherRelatedID.length = 0;
    otherRelatedWalls.length = 0;
    relatedWalls.length = 0;
    selectedWallToRelate.length = 0;
    cleanWallId.length = 0;
    distances.length = 0;
    doubleTime.length = 0;
    doubleTimeIndex.length = 0;
    cleanWallIndex.length = 0;
    wallsDynamicListe.length = 0;



    const found = castObjects(event, wallSubsetMeshes)[0];
    console.log("found Mesh", found, selectedWallGumball)
    console.log(wallSubset)


    if(found) {

        // //console.log("index", index)
        lastFurniture = found.object;
        console.log(lastFurniture, areasMeshes.indexOf(lastFurniture))



        selectedWallGumball.push(found.object.uuid)

        for(id = 0; id < areasMeshes.length; id++){
            if(furnitureMeshes[id].uuid === found.object.uuid){
                console.log("id", id,areasMeshes[id].uuid , found.object.uuid )
                lastIndex = id
            }
        }

       
        gumball.position.set(0,0,0)
        gumball.setSpace('local');


        //lastIndex = areasMeshes.indexOf(found.object.uuid)
        //console.log("lastIndex", lastIndex, areasMeshes, furnitureMeshes, centerWall, gumball.position, wallDirection)

        //move furniture around
        gumball.attach(areasMeshes[lastIndex])
        ////console.log("Position", lastFurniture.position, furnitureMeshes[lastIndex].position)

        console.log(lastFurniture)

        scene.add(gumball)

        console.log(lastFurniture)
 

            

            console.log("wallsDynamicListe", wallsDynamicListe, relatedID
            )
            wallSubsetMeshes[lastIndex].geometry.computeBoundsTree()

            let wallBB2 = new Box3(new Vector3(), new Vector3())
            wallBB2.copy(wallSubsetMeshes[lastIndex].geometry.boundingBox)
            wallSubsetMeshes[lastIndex].updateMatrixWorld(true)


            wallBB2.applyMatrix4(wallSubsetMeshes[lastIndex].matrixWorld)

            const sizeFurnBB = wallBB2.getSize(new Vector3())
            console.log("sizeWallBB1", sizeFurnBB)

            const centerWall = wallBB2.getCenter(new Vector3());
            console.log("centerWall1", centerWall)


            if(wallDirection[lastIndex].x === -1) {
                wallMeshLastIndex(sizeFurnBB.x, sizeFurnBB.y, sizeFurnBB.z ,centerWall.x, centerWall.y, centerWall.z, 0 )
                
                if(gumball.showX !== false ){
                    gumball.showX = false;
                }
                if(gumball.showZ !== true  ) {
                    gumball.showZ = true;
                }
                if(gumball.showY !== false  ) {
                    gumball.showY = false;
                }
                
            
             
                //wallMeshSpheres[lastIndex].position.set( wallCenterPoints[lastIndex].x, wallMeshSpheres[lastIndex].position.y, wallCenterPoints[lastIndex].z - sizeFurnBB.x  )


            }
            if(wallDirection[lastIndex].x === 1) {
                wallMeshLastIndex(sizeFurnBB.x, sizeFurnBB.y, sizeFurnBB.z ,centerWall.x, centerWall.y, centerWall.z, 0 )
                if(gumball.showX !== false ){
                    gumball.showX = false;
                }
                if(gumball.showZ !== true  ) {
                    gumball.showZ = true;
                }
                if(gumball.showY !== false  ) {
                    gumball.showY = false;
                }
            
          
               // wallMeshSpheres[lastIndex].position.set( wallCenterPoints[lastIndex].x, wallMeshSpheres[lastIndex].position.y,  sizeFurnBB.x)


            }
            if(wallDirection[lastIndex].y === -1) {
                wallMeshLastIndex(sizeFurnBB.z, sizeFurnBB.y, sizeFurnBB.x ,centerWall.x, centerWall.y, centerWall.z,  Math.PI/2 )
                if(gumball.showX !== false ){
                    gumball.showX = false;
                }
                if(gumball.showZ !== true  ) {
                    gumball.showZ = true;
                }
                if(gumball.showY !== false  ) {
                    gumball.showY = false;
                }
              

            }
            if(wallDirection[lastIndex].y === 1) {
                wallMeshLastIndex(sizeFurnBB.z, sizeFurnBB.y, sizeFurnBB.x ,centerWall.x, centerWall.y, centerWall.z, Math.PI/2 )
                if(gumball.showX !== false ){
                    gumball.showX = false;
                }
                if(gumball.showZ !== true  ) {
                    gumball.showZ = true;
                }
                if(gumball.showY !== false  ) {
                    gumball.showY = false;
                }
            



            }

                        // }
                        function wallMeshLastIndex(boxwidth, boxheight, boxlenght, posX, posY, posZ, angle) {

                            //console.log("y = func",wallBounds[lastIndex], areasMeshes[lastIndex], wallPlacements[relatedIDs], centerWalls, sizeWall)
                            // const translateDistance = middelPointsStartWalls.distanceTo(areasMeshes[lastIndex].position)
                            // wallMeshSpheres[lastIndex].position.set(areasMeshes[lastIndex].position.x, areasMeshes[lastIndex].position.y, areasMeshes[lastIndex].position.z)

                            const wallCopy = new BoxGeometry(boxwidth, boxheight, boxlenght)
                            const wallDynamicMesh = new Mesh(
                                wallCopy,
                                new MeshBasicMaterial({color: 'blue', transparent: true, opacity: 0.6})

                            )
                            wallDynamicMesh.position.set(posX, posY, posZ)
                            wallDynamicMesh.rotateY(angle)


                            wallDynamicMesh.geometry.computeBoundsTree()

                            let wallBB = new Box3(new Vector3(), new Vector3())
                            wallBB.copy(wallDynamicMesh.geometry.boundingBox)
                            wallDynamicMesh.updateMatrixWorld(true)


                            wallBB.applyMatrix4(wallDynamicMesh.matrixWorld)

                            wallBounds[lastIndex] =  wallBB

                            const centerWall1 = wallBB.getCenter(new Vector3());
                            console.log("centerWall", centerWall1)



                            wallCenterPoints[lastIndex] = centerWall1


                            wallsDynamicListe.push(wallDynamicMesh)
                             wallDynamicMesh.uuid = wallSubsetMeshes[lastIndex].uuid

                            wallSubsetMeshes[lastIndex].position = centerWall1
                        }

            // for(let i = 0; i < wallsDynamicListe.length; i++){

            //     //scene.add(wallsDynamicListe[i])
            //     for(let wallid = 0; wallid < wallSubsetMeshes.length; wallid++){
            //         //console.log("id", wallSubsetMeshes[wallid].uuid,wallsDynamicListe[i].uuid )
            //         if(wallSubsetMeshes[wallid].uuid === wallsDynamicListe[i].uuid){
            //             wallSubsetMeshes[wallid] = wallsDynamicListe[i]
            //         }

            //     }
            // }


            // console.log("walls last", wallsDynamicListe, wallSubsetMeshes)
            // for ( let i = 0; i < wallSubsetMeshes.length; i++){
            //     scene.add(wallSubsetMeshes[i])
            //     //console.log("new Wall", wallSubsetMeshes)

            // }

        //     const wallSphere = new SphereGeometry(0.4)
        //     const wallMeshSphere = new Mesh(
        //         wallSphere,
        //         new MeshBasicMaterial({color: 'blue', transparent: true, opacity: 0.5})

        //     )
        //     wallMeshSphere.position.set(0,0,3)

        //     console.log("soh", sph)

        //     for(let i = 0; i < sph.length; i ++){

        //         sph[i] = wallMeshSphere
        //        scene.add(sph[i])

        //     }





        //relatedID.length = 0;
        //wallsDynamicListe.length = 0;

        // for(let i = 0; i < wallsDynamicListe.length; i++){

        //     scene.remove(wallsDynamicListe[i])

        // }
        // wallsDynamicListe.length = 0;







    } else if (lastFurniture) {
        console.log('remove', )

        lastFurniture = undefined;
        wIsDown = false;
        aIsDown = false;
        scene.remove(gumball)
        
    }
    // control.setMode( 'scale' );
    //         break;




}


let secondWall;
const otherRelatedID = [];
const otherRelatedWalls = [];

let relatingWalls
const selectedWallToRelate = [];


async function wallDynamic () {
    //console.log("allOpeningsAdded", allOpeningsAdded)



        relatedID.length = 0;
        wallsDynamicListe.length = 0;

        for ( let i = 0; i < wallSubsetMeshes.length; i++){
            scene.add(wallSubsetMeshes[i])

        }

        //     for(let id = 0; id < allOpeningsMeshes.length; id++){
        //         // wallSubsetMeshes[i].add(allOpeningsMeshes[id])
        //         // //addingOpeningsToWall(id)

        //         for(let j = 0; j < allOpeningsAdded.length; j++){
        //             if(wallSubsetMeshes[i].uuid === wallIDToOpenings[j].uuid){
        //                 //allOpeningsAdded[j].position.set(0,0,0)
        //                 //console.log("hello Mesh", wallSubsetMeshes)
        //                 wallMeshSpheres[i].add(allOpeningsMeshes[j])
        //                 allOpeningsMeshes[j].position.set(-wallMeshSpheres[i].position.x,-wallMeshSpheres[i].position.y, -wallMeshSpheres[i].position.z)
        //                 wallSubsetMeshes[i].add(allOpeningsMeshes[j])

        //                 if(wallDirection[i].y === 1){
        //                     allOpeningsMeshes[j].rotation = allOpeningsAdded[j].rotation
        //                     allOpeningsMeshes[j].position.set(wallSubsetMeshes[i].position.z,-wallSubsetMeshes[i].position.y, -wallSubsetMeshes[i].position.x)

        //                 }
        //                 if(wallDirection[i].y === -1){
        //                     allOpeningsMeshes[j].rotation = allOpeningsAdded[j].rotation
        //                     allOpeningsMeshes[j].position.set(wallSubsetMeshes[i].position.z,-wallSubsetMeshes[i].position.y, -wallSubsetMeshes[i].position.x)

        //                 }
        //                 if(wallDirection[i].x === 1 || wallDirection[i].x === -1){
        //                     //allOpeningsMeshes[j].position.set(-centerWall.x, -centerWall.y, -centerWall.z)

        //                     allOpeningsMeshes[j].position.set(-wallSubsetMeshes[i].position.x,-wallSubsetMeshes[i].position.y, -wallSubsetMeshes[i].position.z)

        //                 }



        //                 //allOpeningsMeshes[j].position.set(allOpeningsAdded)

        //         }
        //         }


        //     }

        // }

}
window.addEventListener( 'keydown', async function ( event ) {

        switch ( event.keyCode ) {



            case 16: // Shift
                //gumball.setTranslationSnap( 100 );
                //gumball.setRotationSnap( MathUtils.degToRad( 15 ) );
                //gumball.setScaleSnap( 0.25 );
                break;

            case 84: // T
                gumball.setMode( 'translate' );
                gumball.showY = false;
                gumball.showZ =  true;
                gumball.showX =  true;
                break;

            case 69: // E

            // control.setMode( 'scale' );
            //         break;

                break;

             case 82: // R
                gumball.setRotationSnap( MathUtils.degToRad( 90 ) );

                gumball.showY =  true ;
                gumball.showZ =  false;
                gumball.showX =  false;

                gumball.setMode( 'rotate' );



                // const spherePos = areas[lastIndex].children[0].children[0].getWorldPosition(new Vector3())
                // const vectorDir = new Vector3( areas[lastIndex].position.z - spherePos.z ,areas[lastIndex].position.x - spherePos.x , 0)

                // console.log(spherePos, vectorDir.normalize(), specificFurnIDList)

                // const areaRef = new Vector3(areas[lastIndex].quaternion.x , areas[lastIndex].quaternion.y, areas[lastIndex].quaternion.z);

                // if(areaRef.x === 0 && areaRef.y === 0 && areaRef.z === 0){
                //     console.log("zero", areaRef, ReferenceDirections[lastIndex], areas[lastIndex], areas[lastIndex].quaternion.w, areas[lastIndex].uuid)
                //     areaRef.x = modifiedDirections[lastIndex].x
                //     areaRef.y = modifiedDirections[lastIndex].y
                //     areaRef.z = modifiedDirections[lastIndex].z

                //     ReferenceDirectionsAreas[lastIndex] = areaRef
                //     if(areaRef.x === 1 && areaRef.y === 0 && areaRef.z === 0){

                //     }
                // }




                // if(areaRef.x === 0 && areaRef.y === 0 && areaRef.z === 0 ){
                //     areaRef.y = 1
                // }


                console.log("ReferenceDirectionsAreasR", ReferenceDirectionsAreas, ReferenceDirections, lastIndex, areas, modifiedDirections)

                break;


            case 65: // A
            if(storymodeIsActive === true){
                aIsDown = true;

            }
                //console.log("cbt", counter)
                break;

            case 90: // Z

                console.log("Z down", areas[lastIndex], allSubsetMeshes[lastIndex],specificFurnIDList)
                backPickFurn = true
                if(backPickFurn && !storymodeIsActive){
                    scene.remove(areaMeshes[indexFound])

                    const modifiedCenter = new Vector3(centerPoints[indexFound].x, centerPoints[indexFound].y-centerPoints[indexFound].y, centerPoints[indexFound].z)
    
                    const geom1 = new SphereGeometry(0.02)
                        const centerSphere = new Mesh(
                            geom1,
                            new MeshPhongMaterial({color: 0x00ffff, transparent:true, opacity: 0.0})
                        )
                        centerSphere.position.set(centerPoints[indexFound].x, centerPoints[indexFound].y, centerPoints[indexFound].z)
                        //scene.add(centerSphere)
    
    
                        //movement areas random
    
                        const areaRandom = new BoxGeometry(furnSizes[indexFound].x,0.005,furnSizes[indexFound].z)
                        const areaRandomMesh = new Mesh(
                            areaRandom,
                            new MeshBasicMaterial({color: 'lightgray'
                                , transparent: true, opacity: 0.6})
    
                        )
    
                        areaRandomMesh.position.set(centerPoints[indexFound].x, 0, centerPoints[indexFound].z)
                        allSubsetMeshes[indexFound].add(centerSphere)
                        allSubsetMeshes[indexFound].add(areaRandomMesh)
    
    
                        areaMeshes[indexFound].uuid = allSubsetMeshes[indexFound].uuid
    
                    areaMeshes.splice(indexFound, 1,  areaRandomMesh)
                    delete specificFurnIDList[specificFurnIDList.length -1 ].key
                    delete specificFurnIDList[specificFurnIDList.length -1 ].value
    
                    specificFurnIDList.pop()
                    //specificFurnIDList.delete([specificFurnIDList.length -1 ].key)
    
                    //await generateAreasOnClick(indexFound, modifiedCenter, lastFurnitureFound)
    
                    scene.add(areaMeshes[indexFound])
                    // scene.add(allSubsetMeshes[lastIndex])
                    console.log("spezi", specificFurnIDList)
    
                }

               

               break;

        //     case 86: // V
        //         const randomFoV = Math.random() + 0.1;
        //         const randomZoom = Math.random() + 0.1;

        //         cameraPersp.fov = randomFoV * 160;
        //         cameraOrtho.bottom = - randomFoV * 500;
        //         cameraOrtho.top = randomFoV * 500;

        //         cameraPersp.zoom = randomZoom * 5;
        //         cameraOrtho.zoom = randomZoom * 5;
        //         onWindowResize();
        //         break;

        //     case 187:
        //     case 107: // +, =, num+
        //         control.setSize( control.size + 0.1 );
        //         break;

        //     case 189:
        //     case 109: // -, _, num-
        //         control.setSize( Math.max( control.size - 0.1, 0.1 ) );
        //         break;

        //     case 88: // X
        //         control.showX = ! control.showX;
        //         break;

        //     case 89: // Y
        //         control.showY = ! control.showY;
        //         break;

        //     case 90: // Z
        //         control.showZ = ! control.showZ;
        //         break;

            // case 32: // Spacebar
            //     gumball.enabled = ! gumball.enabled;
            //     break;

            // case 27: // Esc
            //     gumball.reset();
            //     break;
            case 87: // w
            for(let l = 0; l < startPositionAreas.length; l++){
                //areas[id].add(labels[l])
                scene.remove(startPositionAreas[l])
                startPositionAreas.length = 0
            }
            for(let z = 0; z < labelMeasure.length; z++){
                scene.remove(labelMeasure[z])
                labelMeasure.length =0;
            }
            for(let l = 0; l < lines.length; l++){
                scene.remove(lines[l])
                lines.length = 0
            }


           
            
            if(storymodeIsActive === true){
                console.log("w is pressed")
                wIsDown = true
                

                //canvas.onpointerdown = () => {console.log("hey2")}




            }
            break;

        }

    } );



    let counter = 0;
    window.addEventListener( 'keyup', function ( event ) {

        for(let i = 0; i < ReferenceDirectionsAreas.length; i++) {
            ReferenceDirectionsAreas[i].normalize()
        }
        //console.log("ReferenceDirectionsAreas2", ReferenceDirectionsAreas, ReferenceDirections)
        switch ( event.keyCode ) {
            case 87: // w
            if(storymodeIsActive === true){
                console.log("w is lift")
               
                //wIsDown = false;

                //canvas.onpointerdown = () => {console.log("hey2")}




            }
            break;



            case 90: // Z
            backPickFurn = false
            if(storymodeIsActive){
            console.log("Z",  wallSubsetMeshes[lastIndex].position, resetPositionsWall[lastIndex], resetPositionsFurn[lastIndex] , resetRotationFurn)
            wallSubsetMeshes[lastIndex].position.set (resetPositionsWall[lastIndex].x,
                resetPositionsWall[lastIndex].y,
                resetPositionsWall[lastIndex].z)

            areaMeshes[lastIndex].position.set(resetPositionsFurn[lastIndex].x, resetPositionsFurn[lastIndex].y , resetPositionsFurn[lastIndex].z)
            areaMeshes[lastIndex].rotation.set(resetRotationFurn[lastIndex].x, resetRotationFurn[lastIndex].y , resetRotationFurn[lastIndex].z)

            }
            break;

            case 16: // Shift
                gumball.setTranslationSnap( null );
                gumball.setRotationSnap( null );
                gumball.setScaleSnap( null );
                break;


            case 69: // E

            console.log("Found1",areas[lastIndex].uuid, specificFurnIDList[2].value, translationList)

            if(areas[lastIndex].uuid === specificFurnIDList[2].value || areas[lastIndex].uuid === specificFurnIDList[0].value){
            const occurs = translationList.includes(areas[lastIndex].uuid )
            console.log("cbt1", counter, occurs)
            if(occurs){
                counter -= 1;
                        if(counter === -2){

                            console.log("cbt-2", counter)
                            translateAreaPush(lastIndex, -0.6,-0.6, -0.3, -0.3)
                            counter += 1
                        } else if (counter === -1){
                            translateAreaPush(lastIndex, 0.6,0.6, 0.3, 0.3)
                            counter += 2;
                        }
                        else if (counter === 0){
                            translateAreaPush(lastIndex, -0.6,-0.6,- 0.3,- 0.3)

                        }
            }
            if(!occurs) {
                counter -= 1;
                        if(counter === -2){

                            console.log("cbt-2", counter)
                            translateAreaPush(lastIndex, 0.6,0.6, 0.3, 0.3)
                            counter += 1
                        } else if (counter === -1){
                            translateAreaPush(lastIndex, -0.6,-0.6, -0.3, -0.3)
                            counter += 2;
                        }
                        else if (counter === 0){
                            translateAreaPush(lastIndex, 0.6,0.6, 0.3, 0.3)

                        }

            }
        }

            // for (let i = 0; i < translationList.length; i++) {
            //     if(translationList[i] !== areas[lastIndex].uuid){
            //         counter -= 1;
            //         if(counter === -2){

            //             console.log("cbt-2", counter)
            //             translateAreaPush(lastIndex, 0.6,0.6, 0.3, 0.3)
            //             counter += 1
            //         } else if (counter === -1){
            //             translateAreaPush(lastIndex, -0.6,-0.6, -0.3, -0.3)
            //             counter += 2;
            //         }
            //         else if (counter === 0){
            //             translateAreaPush(lastIndex, 0.6,0.6, 0.3, 0.3)

            //         }
            //     } else if(translationList[i] === areas[lastIndex].uuid){
            //         counter -= 1;
            //         if(counter === -2){

            //             console.log("cbt-2", counter)
            //             translateAreaPush(lastIndex, -0.6,-0.6, -0.3, -0.3)
            //             counter += 1
            //         } else if (counter === -1){
            //             translateAreaPush(lastIndex, 0.6,0.6, 0.3, 0.3)
            //             counter += 2;
            //         }
            //         else if (counter === 0){
            //             translateAreaPush(lastIndex, -0.6,-0.6,- 0.3,- 0.3)

            //         }
            //     }
            // }



            // if(counter === 0) {
            //     translateAreaPush(lastIndex, 0.6,0.6, 0.3, 0.3)
            //     counter += 1
            // }
            console.log("cbt2", counter)

            // if(translationList.length > 2 ){
            //     translateAreaPush(lastIndex, 0.6,0.6, 0.3, 0.3)

            // }
            // else {

            //     break;
            // }



                break;



        }


    } );


    function translateAreaPush(lastIndex, moveX, moveZ, moveX2, moveZ2){
        if(areas[lastIndex].uuid === specificFurnIDList[2].value){
            console.log("Found2",areas[lastIndex].uuid, specificFurnIDList[2].value )

            indexWC = lastIndex
            lastPosition = areas[indexWC].position
            //console.log("Pos", lastPosition, ReferenceDirections[indexWC],  areas[indexWC])
            if(ReferenceDirections[indexWC].x === -1 ){
                areas[indexWC].children[0].translateX(moveX)


                //areas[indexWC].position.set(lastPosition.x + moveX,lastPosition.y ,lastPosition.z )
                translationList.push(areas[indexWC].uuid)

                areas[indexWC].geometry.boundingBox
                // const boxhelper = new BoxHelper(areas[indexWC], 0x000000)
                // scene.add(boxhelper)

            }
            if(ReferenceDirections[indexWC].x === 1){

                areas[indexWC].children[0].translateX(moveX)
               // areas[indexWC].position.set(lastPosition.x + moveX,lastPosition.y ,lastPosition.z )
                areas[indexWC].geometry.boundingBox
                translationList.push(areas[indexWC].uuid)
                // const boxhelper = new BoxHelper(areas[indexWC], 0x000000)
                // scene.add(boxhelper)

            }
            if(ReferenceDirections[indexWC].y === -1){
                areas[indexWC].children[0].translateZ(moveZ)
                //areas[indexWC].position.set(lastPosition.x,lastPosition.y ,lastPosition.z + moveZ)
                areas[indexWC].geometry.boundingBox
                translationList.push(areas[indexWC].uuid)


            }
            if(ReferenceDirections[indexWC].y === 1){
                areas[indexWC].children[0].translateZ(moveZ)
                //areas[indexWC].position.set(lastPosition.x,lastPosition.y ,lastPosition.z + moveZ)
                areas[indexWC].geometry.boundingBox
                translationList.push(areas[indexWC].uuid)

            }


        }
        else if(areas[lastIndex].uuid === specificFurnIDList[0].value){
                console.log("Found2",areas[lastIndex], specificFurnIDList[0].value )

                indexWC = lastIndex
                lastPosition = areas[indexWC].position
                //console.log("Pos", lastPosition, ReferenceDirections[indexWC],  areas[indexWC])
                if(ReferenceDirections[indexWC].x === -1 ){
                    areas[indexWC].children[0].translateX(moveX2)
                    //areas[indexWC].position.set(lastPosition.x + moveX2,lastPosition.y ,lastPosition.z )
                    translationList.push(areas[indexWC].uuid)

                    areas[indexWC].geometry.boundingBox
                    // const boxhelper = new BoxHelper(areas[indexWC], 0x000000)
                    // scene.add(boxhelper)

                }
                if(ReferenceDirections[indexWC].x === 1){

                    areas[indexWC].children[0].translateX(moveX2)
                    //areas[indexWC].position.set(lastPosition.x + moveX2,lastPosition.y ,lastPosition.z )
                    areas[indexWC].geometry.boundingBox
                    translationList.push(areas[indexWC].uuid)
                    // const boxhelper = new BoxHelper(areas[indexWC], 0x000000)
                    // scene.add(boxhelper)

                }
                if(ReferenceDirections[indexWC].y === -1){
                    areas[indexWC].children[0].translateZ(moveZ2)
                    //areas[indexWC].position.set(lastPosition.x,lastPosition.y ,lastPosition.z + moveZ2)
                    areas[indexWC].geometry.boundingBox
                    translationList.push(areas[indexWC].uuid)


                }
                if(ReferenceDirections[indexWC].y === 1){
                    areas[indexWC].children[0].translateZ(moveZ2)
                    //areas[indexWC].position.set(lastPosition.x,lastPosition.y ,lastPosition.z + moveZ2)
                    areas[indexWC].geometry.boundingBox
                    translationList.push(areas[indexWC].uuid)

                }

            //translateAreaIfCollision(specificFurnIDList, 0, -0.3, -0.3)
        }
        else {
            return
        }

    }

function boundingBoxes(meshes){
    ////console.log(meshes)
    for(let cube of meshes) {
        let cube1BB = new Box3(new Vector3(), new Vector3());
        cube1BB.setFromObject(cube)
        ////console.log("cube1BB", cube1BB)
        scene.add(cube)
        boundingCubes.push(cube1BB)

        // //console.log("boundingCubes", boundingCubes)
    }


}




const distances = [];
const distancesVector = [];
const relatedWalls = [];
const wallsToCalculateDistances = [];
const relatedWallIDToCheck = [];

function generateNewWall(event, furnitureMeshes, areasMeshes, relatedIDs, width) {
   // for(let relatedIndex = 0; relatedIndex < otherRelatedID.length; relatedIndex++){
    //     if(wallSubsetMeshes[lastIndex].uuid !== otherRelatedID[relatedIndex]){
    //         console.log("other wall", otherRelatedID[relatedIndex], "npt", wallSubsetMeshes[lastIndex].uuid, otherRelatedWalls[relatedIndex])
    //         if( otherRelatedWalls[relatedIndex] === wallSubsetMeshes[relatedIDs].uuid  ) {
    //             console.log("related", otherRelatedWalls[relatedIndex], wallSubsetMeshes[relatedIDs].uuid, "searched", otherRelatedID[relatedIndex], wallSubsetMeshesIDs[0].indexOf(otherRelatedID[relatedIndex])  )
    //             const index = wallSubsetMeshesIDs[0].indexOf(otherRelatedID[relatedIndex])
    //             const wallDistance = wallSubsetMeshes[index].position.distanceTo(wallSubsetMeshes[lastIndex].position)
    //             console.log("walls Dist",  wallSubsetMeshes[index], wallSubsetMeshes[lastIndex], wallDistance)
    //             wallsToCalculateDistances.push( wallSubsetMeshes[index] )
    //             relatedWallIDToCheck.push(otherRelatedWalls[relatedIndex])



    //         }

    //     }
    // }




    console.log("relat", relatedID, wallMeshSpheres, wallSubsetMeshes, width)
    // for ( let i = 0; i < wallSubsetMeshes.length; i++){
    //     scene.remove(wallSubsetMeshes[i])
    // }

    areasMeshes[relatedIDs].geometry.computeBoundsTree()

    let wallBB = new Box3(new Vector3(), new Vector3())
    wallBB.copy(areasMeshes[relatedIDs].geometry.boundingBox)
    areasMeshes[relatedIDs].updateMatrixWorld(true)


    wallBB.applyMatrix4(areasMeshes[relatedIDs].matrixWorld)

    const sizeWall = wallBB.getSize(new Vector3())
    console.log("sizeWallBB1", sizeWall)

    const centerWalls = wallBB.getCenter(new Vector3());
    console.log("centerWall1", centerWalls, wallMeshSpheres[relatedIDs])



    const wallSphere = new SphereGeometry(0.4)
    const wallMeshSphere = new Mesh(
        wallSphere,
        new MeshBasicMaterial({color: 'red', transparent: true, opacity: 0.5})

    )
    console.log(wallBounds[relatedIDs])
    wallMeshSphere.position.set(centerWalls.x, centerWalls.y, centerWalls.z)
    scene.add(wallMeshSphere)




    const wallsDynamic = [];
    console.log("WallPos", wallSubsetMeshes[lastIndex].position, sizeWall)


    if(wallDirection[relatedIDs].x === 1) {
        console.log("x = 1")
        const distance = new Vector3(wallPlacements[relatedIDs].x, wallPlacements[relatedIDs].y, areasMeshes[lastIndex].position.z).distanceTo(new Vector3(wallPlacements[relatedIDs].x, wallPlacements[relatedIDs].y, -wallPlacements[relatedIDs].z))
        console.log( "dist", distance, sizeWall, centerWalls, relatedIDs, distance, )




    }
    if(wallDirection[relatedIDs].x === -1) {
        console.log("x = -1")


    }
    if(wallDirection[relatedIDs].y === 1) {

        console.log("y = 1", wallPlacements[relatedIDs], wallMeshSpheres[relatedIDs], wallMeshSpheres, wallMeshSpheres[relatedIDs].position.z )
        //const distance = new Vector3(wallPlacements[relatedIDs].x, wallPlacements[relatedIDs].y, areasMeshes[lastIndex].position.z).distanceTo(new Vector3(wallPlacements[relatedIDs].x, wallPlacements[relatedIDs].y, -wallPlacements[relatedIDs].z))

        // const distance0 = new Vector3(areasMeshes[lastIndex].position.x, areasMeshes[lastIndex].position.y, areasMeshes[lastIndex].position.z).distanceTo(new Vector3(areasMeshes[relatedIDs].children[0].position.x, areasMeshes[relatedIDs].children[0].position.y, areasMeshes[relatedIDs].children[0].position.z))
        // const distance1 = new Vector3(areasMeshes[lastIndex].position.x, areasMeshes[lastIndex].position.y, areasMeshes[lastIndex].position.z).distanceTo(new Vector3(areasMeshes[relatedIDs].children[1].position.x, areasMeshes[relatedIDs].children[1].position.y, areasMeshes[relatedIDs].children[1].position.z))
        // const distance2 = new Vector3(areasMeshes[lastIndex].position.x, areasMeshes[lastIndex].position.y, areasMeshes[lastIndex].position.z).distanceTo(new Vector3(areasMeshes[relatedIDs].children[0].position.x, areasMeshes[relatedIDs].children[0].position.y, areasMeshes[relatedIDs].children[0].position.z))
        // const distance3 = new Vector3(areasMeshes[lastIndex].children[0].position.x, areasMeshes[lastIndex].children[0].position.y, areasMeshes[lastIndex].children[0].position.z).distanceTo(new Vector3(areasMeshes[relatedIDs].children[1].position.x, areasMeshes[relatedIDs].children[1].position.y, areasMeshes[relatedIDs].children[1].position.z))

        // distances.push(distance0, distance1);

        // const distance = Math.max(...distances);
        // const lastPositionWall = wallBounds[lastIndex].getCenter(new Vector3());
        // console.log( "dist", distance,distance1,sizeWall, centerWalls, relatedIDs, lastPositionWall,-wallPlacements[relatedIDs].z, -wallPlacements[lastIndex].z,  wallSubsetMeshes[lastIndex].position)



        //if(areasMeshes[lastIndex].position.z < 0){
            //wallMeshSpheres[relatedIDs].position.z = wallSubsetMeshes[lastIndex].position.z
            //wallMeshSpheres[lastIndex].position.z = wallSubsetMeshes[lastIndex].position.z

            console.log("distances", areasMeshes[lastIndex], wallSubsetMeshes[relatedIDs])

                const indexRelated = otherRelatedWalls.indexOf(wallSubsetMeshes[relatedIDs].uuid)
                const wallIndex = wallSubsetMeshesIDs[0].indexOf(otherRelatedID[indexRelated])

                console.log("otherRelatedWalls habe ich-", otherRelatedWalls,"suche ich", otherRelatedID )
                console.log("ind check", otherRelatedWalls, wallSubsetMeshes[relatedIDs].uuid, relatedIDs)
                console.log("indexRel y 1", indexRelated, otherRelatedID[indexRelated], wallSubsetMeshes[relatedIDs].uuid, wallIndex, wallSubsetMeshes[wallIndex], wallSubsetMeshes[lastIndex], selectedWallToRelate, relatedID)

                //console.log("indexRel", indexRelated, otherRelatedID[indexRelated], wallSubsetMeshes[relatedIDs].uuid, wallIndex, wallSubsetMeshes[wallIndex], selectedWallToRelate, relatedID)
                //const width = wallSubsetMeshes[wallIndex].position.z - wallSubsetMeshes[lastIndex].position.z
                wallMeshDynamicGeneration(  width  , 3, wallDimensionsY[relatedIDs] -0.01,
                        wallCenterPoints[relatedIDs].x  , 1.5, wallSubsetMeshes[lastIndex].position.z + width/2 ,
                        Math.PI/2)




        // }
        // if(areasMeshes[lastIndex].position.z > 0){


        //     if(otherRelatedWalls.includes(wallSubsetMeshes[relatedIDs].uuid )===true){
        //         // index für relatedWall
        //         const indexRelated = otherRelatedWalls.indexOf(wallSubsetMeshes[relatedIDs].uuid)

        //         const wallIndex = wallSubsetMeshesIDs[0].indexOf(otherRelatedID[indexRelated])

        //         console.log("otherRelatedWalls habe ich", otherRelatedWalls,"suche ich", otherRelatedID )
        //         console.log("indexRel+", indexRelated, otherRelatedID[indexRelated], wallSubsetMeshes[relatedIDs].uuid, wallIndex, wallSubsetMeshes[wallIndex], wallSubsetMeshes[lastIndex], selectedWallToRelate, relatedID)

        //         const width = wallSubsetMeshes[wallIndex].position.z + wallSubsetMeshes[lastIndex].position.z
        //         console.log("widt + ", width)
        //         wallMeshDynamicGeneration(  width  , 3, wallDimensionsY[relatedIDs] -0.01,
        //                 wallCenterPoints[relatedIDs].x  , 1.5, wallSubsetMeshes[lastIndex].position.z + width/2 ,
        //                 Math.PI/2)

        //     }

            // const width = wallSubsetMeshes[lastIndex].position.z - resetPositionsWall[lastIndex].z

            // console.log("widt + ", width)
            // wallMeshDynamicGeneration(  width + wallDimensionsX[relatedIDs] , 3, wallDimensionsY[relatedIDs] -0.01,
            //     wallCenterPoints[relatedIDs].x  , 1.5,(wallCenterPoints[relatedIDs].z),
            //     Math.PI/2)

            // + width/2

            // wallMeshSpheres[relatedIDs].position.z = wallSubsetMeshes[lastIndex].position.z
            // //wallMeshSpheres[lastIndex].position.z = wallSubsetMeshes[lastIndex].position.z

            // const width = distance  +  wallDimensionsX[relatedIDs] -  wallDimensionsY[relatedIDs]

            // console.log("posititve",  wallDimensionsX[relatedIDs],  wallDimensionsX[relatedIDs],distances, width  )
            // wallMeshDynamicGeneration(  width , 3, wallDimensionsY[relatedIDs] -0.01,
            //     wallMeshSpheres[relatedIDs].position.x  , 1.5,  wallMeshSpheres[lastIndex].position.z  - distance/2 -  wallDimensionsX[relatedIDs]/2 ,
            //     Math.PI/2)


                // wallDimensionsX[relatedIDs] = boxwidth
                // wallDimensionsY[relatedIDs] = boxlenght


        //}



        //wallMeshSpheres[relatedIDs].translateX(wallMeshSpheres[relatedIDs].position.x - centerWalls.x)
        //wallMeshSpheres[relatedIDs].translateZ(distanceEdges)

        // wallPlacements[lastIndex] = wallMeshSpheres[lastIndex].position
        // wallPlacements[relatedIDs] = wallMeshSpheres[relatedIDs].position
        //wallMeshSpheres[relatedIDs].position.set(wallPlacements[relatedIDs].x, wallPlacements[relatedIDs].y,  areasMeshes[lastIndex].position.z)
    }
    if(wallDirection[relatedIDs].y === -1) {
        console.log("y = -1", wallPlacements[relatedIDs])


            const width =  wallSubsetMeshes[lastIndex].position.z + wallSubsetMeshes[wallIndex].position.z
            wallMeshDynamicGeneration(  width  , 3, wallDimensionsY[relatedIDs] -0.01,
                    wallCenterPoints[relatedIDs].x  , 1.5, wallSubsetMeshes[lastIndex].position.z - width/2 ,
                    Math.PI/2)




        // const distance = new Vector3(wallPlacements[relatedIDs].x, wallPlacements[relatedIDs].y, areasMeshes[lastIndex].position.z).distanceTo(new Vector3(wallPlacements[relatedIDs].x, wallPlacements[relatedIDs].y, -wallPlacements[relatedIDs].z))
        // console.log("dist", distance)
        // wallMeshSpheres[relatedIDs].position.z = wallSubsetMeshes[lastIndex].position.z
        // wallMeshSpheres[lastIndex].position.z = wallSubsetMeshes[lastIndex].position.z
        // wallMeshDynamicGeneration(wallDimensionsX[relatedIDs] + distance - 0.01 , 3, wallDimensionsY[relatedIDs] -0.01,
        //     wallPlacements[relatedIDs].x  , 1.5,   -wallPlacements[relatedIDs].z - distance/2 + wallDimensionsX[relatedIDs]/2,
        //     Math.PI/2)


            //wallMeshSpheres[lastIndex].position.set(wallPlacements[lastIndex].x, wallPlacements[lastIndex].y,  areasMeshes[lastIndex].position.z)

            // wallMeshSpheres[lastIndex].position.set( areasMeshes[lastIndex].position.x, wallPlacements[lastIndex].y, wallPlacements[lastIndex].z)
            // wallMeshSpheres[relatedIDs].position.set(areasMeshes[lastIndex].position.x,wallPlacements[relatedIDs].y, wallPlacements[relatedIDs].z)



    }














    //console.log("dyn", wallDynamicMesh)
}

function quitWallTranslation(){
for(let i = 0; i < relatedID.length; i++){

    const relatedIDs = relatedID[i]
    console.log("finish",relatedIDs, wallSubsetMeshes[relatedIDs].geometry.parameters.width,wallSubsetMeshes[relatedIDs].geometry.parameters.depth, wallDimensionsX[relatedIDs], resetPositionsWall, lastIndex, wallCenterPoints )
    //scene.remove(gumball)


    const centerWalls = wallBounds[relatedIDs].getCenter(new Vector3());
    console.log("centerWallsNew", centerWalls)

    wallCenterPoints[relatedIDs].x = centerWalls.x
    wallCenterPoints[relatedIDs].z = centerWalls.z

    // wallDimensionsX[relatedIDs] = wallSubsetMeshes[relatedIDs].geometry.parameters.width
    // wallDimensionsY[relatedIDs] = wallSubsetMeshes[relatedIDs].geometry.parameters.depth





}


canvas.onpointerdown = () => {console.log("stop it")}

}
const cleanWallId = [];
const doubleTime = [];
const doubleTimeIndex = [];
const cleanWallIndex = [];
const otherRelatedIDIndex = [];

//Animation loop
const animate = () => {

    if(furnituremodeIsActive === true ){

        canvas.ondblclick = (event) =>  pickFurniture(event, selectionMaterialFurniture ,allSubsetMeshes ) ;


    }

    if(storymodeIsActive === true){
        // //console.log("Blue, IntersectionsIDsAreaIntersectArea2", IntersectionsIDsAreaIntersectArea)
        // //console.log("lila, IntersectionsIDsAreaContainArea2", IntersectionsIDsAreaContainArea)
        // //console.log("rosa, IntersectionsIDsFurnIntersectFurn2", IntersectionsIDsFurnIntersectFurn)
        // //console.log("kaki, IntersectionsIDsFurnContainFurn2", IntersectionsIDsFurnContainFurn)
        // //console.log("beere, IntersectionsIDs2", IntersectionsIDs, IntersectionsIDsAreaIntersectWall, IntersectionsIDsAreaContainWall, IntersectionsIDsFurnIntersectWall, IntersectionsIDsFurnContainWall)
        // //console.log("dunkelgrün, IntersectionsIDsAreaContainFurn2", IntersectionsIDsAreaContainFurn)

        // //console.log("ifcPr", ifcProject)
        // createTreeMenu(ifcProject)

        //pickFurnitureWall(event, wallSubsetMeshes, wallSubsetMeshes);
       
        for(let p = 0; p < slabSub[0].length; p++){
            scene.remove(slabSub[0][p])
        }

        


        async function pickingAndChecking (){
            if( !wIsDown ){
                
                pickFurnitureSecond(event, allSubsetMeshes, areas);
            }

            if(wIsDown){
                
               

                console.log("w", wIsDown)
                lastIndex = undefined
                if(gumball.mode === 'rotate' ){
                    gumball.setMode('translate');
                }
              
                await pickFurnitureWall(event, wallSubsetMeshes, wallSubsetMeshes)

                console.log("last", wallSubsetMeshes[lastIndex])

                await getRelatedWalls(wallSubsetMeshes)
                async function getRelatedWalls(furnitureMeshes) {
                    relatingWalls = await loader.ifcManager.getAllItemsOfType(0, IFCRELCONNECTSPATHELEMENTS, true);

                    for( let wall = 0; wall < relatingWalls.length; wall++){
                        const selectedWall = relatingWalls[wall].RelatedElement.value
                        const relatingWall = relatingWalls[wall].RelatingElement.value
                        //console.log("Reak", selectedWall, relatingWall, furnitureMeshes[lastIndex].uuid)

                        if(furnitureMeshes[lastIndex].uuid === relatingWalls[wall].RelatedElement.value ){

                            relatedID.push(wallSubsetMeshesIDs[0].indexOf(relatingWalls[wall].RelatingElement.value))
                            selectedWallToRelate.push( relatingWalls[wall].RelatedElement.value)


                            console.log("hey wall", selectedWall, relatingWall, wallSubsetMeshesIDs, relatedID, furnitureMeshes[relatedID],furnitureMeshes[lastIndex] )
                        }
                        if(furnitureMeshes[lastIndex].uuid === relatingWalls[wall].RelatingElement.value ){

                            relatedID.push(wallSubsetMeshesIDs[0].indexOf(relatingWalls[wall].RelatedElement.value))
                            selectedWallToRelate.push(relatingWalls[wall].RelatingElement.value)

                            console.log("hey wall2", selectedWall, relatingWall, wallSubsetMeshesIDs, relatedID, furnitureMeshes[relatedID],furnitureMeshes[lastIndex] )
                        }
                    }




                }

                for(let i = 0; i < relatedID.length; i++){
                    relatedWalls.push(wallSubsetMeshes[relatedID[i]])

                }

                for( let wall = 0; wall < relatingWalls.length; wall++){
                    for(let r = 0; r < relatedWalls.length; r++){
                        if(relatedWalls[r].uuid === relatingWalls[wall].RelatedElement.value){
                            console.log("others", wallSubsetMeshesIDs[0].indexOf(relatingWalls[wall].RelatingElement.value), relatedWalls[r].uuid, relatingWalls[wall].RelatingElement.value)
                            otherRelatedID.push(relatingWalls[wall].RelatingElement.value)
                            otherRelatedWalls.push(relatedWalls[r].uuid )

                            otherRelatedIDIndex.push(wallSubsetMeshesIDs[0].indexOf(relatingWalls[wall].RelatingElement.value))
                        }
                        if(relatedWalls[r].uuid === relatingWalls[wall].RelatingElement.value){
                            console.log("others2", wallSubsetMeshesIDs[0].indexOf(relatingWalls[wall].RelatedElement.value),relatedWalls[r].uuid, relatingWalls[wall].RelatedElement.value )
                            otherRelatedID.push(relatingWalls[wall].RelatedElement.value)
                            otherRelatedWalls.push(relatedWalls[r].uuid )
                        }
                    }
                }
                console.log("LISTEN",otherRelatedID, otherRelatedWalls )

            }

          
            // if(aIsDown){
            //     console.log("a", aIsDown)
            //     lastIndex = undefined
            //     for(let i = 0; i < wallSubsetMeshes.length; i++){
            //         for(let u = 0; u < relatedID.length; u++){
            //             if(wallSubsetMeshes[i].uuid === wallSubsetMeshes[relatedID[u]].uuid){
            //                 await pickFurnitureWall(event, wallSubsetMeshes[i], wallSubsetMeshes)
            //             }
            //         }
            //     }

            // }



        }


        canvas.onpointermove = () => collisionCheckLoop ();
        // canvas.onpointerdown = (event) =>  pickFurnitureWall(event, wallSubset, wallSubsetMeshes) ; //cubes
        canvas.onpointerdown = () =>  pickingAndChecking();

        canvas.onpointerup= () => {
            for(let p = 0; p < doorSub[0].length; p++){
                scene.remove(doorSub[0][p])
            }
            for(let p = 0; p < windowSub[0].length; p++){
                scene.remove(windowSub[0][p])
            }
            

            for ( let i = 0; i < wallSubsetMeshes.length; i++){

                scene.remove(wallSubsetMeshes[i])

            }
            distances.length=0

            for(let j = 0; j < otherRelatedID.length; j ++){
                //if( otherRelatedID[j] !== wallSubsetMeshes[lastIndex].uuid){
                    console.log("Liste neu",otherRelatedID[j], otherRelatedWalls[j] )

                    for(let i = 0; i < wallSubsetMeshes.length; i++){
                        // let distance = Math.sqrt(wallSubsetMeshes[i].geometry.parameters.width * wallSubsetMeshes[i].geometry.parameters.width +
                        //     wallSubsetMeshes[i].geometry.parameters.height * wallSubsetMeshes[i].geometry.parameters.height +
                        //     wallSubsetMeshes[i].geometry.parameters.depth * wallSubsetMeshes[i].geometry.parameters.depth  )
                        //     distances.push(distance)

                        if(wallSubsetMeshes[i].uuid === otherRelatedID[j]){

                            console.log("IDs", wallSubsetMeshes[i].uuid, otherRelatedID[j])

                            cleanWallIndex.push(i)
                            console.log("positions",wallSubsetMeshes[i].position,wallSubsetMeshes[lastIndex].position, wallSubsetMeshes[i].uuid   )
                            const distX = (  wallSubsetMeshes[i].position.x-wallSubsetMeshes[lastIndex].position.x)
                            const distY = (  wallSubsetMeshes[i].position.y-wallSubsetMeshes[lastIndex].position.y)
                            const distZ = (  wallSubsetMeshes[i].position.z-wallSubsetMeshes[lastIndex].position.z)
                            let distance = Math.sqrt(distX*distX + distY*distY + distZ*distZ)

                            if(distance > 0){
                                distances.push(distance)
                                cleanWallId.push(otherRelatedWalls[j])
                            }






                        }

                    }
                //}


            }

            console.log("DISZA", distances, cleanWallId, otherRelatedWalls)
            for(let j = 0; j < cleanWallId.length; j ++){


                if(getOccurence(cleanWallId,cleanWallId[j]) > 1) {
                    const index = cleanWallId.lastIndexOf(cleanWallId[j])
                    const indexFirst = cleanWallId.indexOf(cleanWallId[j])
                    console.log("222", cleanWallId, cleanWallId[j] , distances, index, indexFirst)


                    doubleTime.push([distances[indexFirst], distances[index]])
                    doubleTimeIndex.push([indexFirst,index])
                  
                }
            }
                console.log("doubleTimeIndex", doubleTimeIndex, doubleTime)

                for(let i = 0; i < doubleTime.length; i++){

                    for(let q = 0; q < relatedID.length; q++){
                        if(otherRelatedWalls[doubleTimeIndex[i][0]] ===  wallSubsetMeshes[relatedID[q]].uuid){
                            console.log("doubleTimeIndexNr", doubleTimeIndex, doubleTime, otherRelatedWalls[doubleTimeIndex[i][0]] ,wallSubsetMeshes[relatedID[q]].uuid)
                            const dist0 = doubleTime[i][0] -  wallSubsetMeshes[relatedID[q]].geometry.parameters.width
                            const dist1 = doubleTime[i][1] -  wallSubsetMeshes[relatedID[q]].geometry.parameters.width

                            const distanceO =  Math.sqrt(dist0 * dist0)
                            const distance1 =  Math.sqrt(dist1 * dist1)
                            console.log("didi",wallSubsetMeshes[relatedID[q]].geometry.parameters.width, dist0, dist1,distanceO, distance1, doubleTime[i][0], doubleTime[i][1] )
                           




                             if(doubleTime[i][0] > doubleTime[i][1]){

                            console.log("0 > 1", doubleTime[i][0], doubleTime[i][1],  distances[doubleTimeIndex[i][1]])
                            distances[doubleTimeIndex[i][0]] = doubleTime[i][0]
                            distances[doubleTimeIndex[i][1]] = doubleTime[i][0]
                        }
                        if(doubleTime[i][0] < doubleTime[i][1]){

                            console.log("0 < 1", doubleTime[i][0], doubleTime[i][1],  distances[doubleTimeIndex[i][1]])
                            distances[doubleTimeIndex[i][0]] = doubleTime[i][1]
                            distances[doubleTimeIndex[i][1]] = doubleTime[i][1]
                        }



                        }
                    }

                }



            for(let i = 0; i < relatedID.length; i++){
                console.log("diit", distances, relatedID, cleanWallId, cleanWallIndex, wallSubsetMeshes, otherRelatedIDIndex)

                const relatedIDs = relatedID[i]

                for(let u = 0; u < cleanWallId.length; u++){
                    if(wallSubsetMeshes[relatedIDs].uuid === cleanWallId[u]){
                        const distance = distances[u]
                        if(wallDirection[relatedIDs].y === 1) {
                            if(wallSubsetMeshes[lastIndex].position.z > 0){
                                console.log("y = 1", wallCenterPoints[relatedIDs], wallSubsetMeshes[relatedIDs])


                                console.log("greater y1 0")


                                wallMeshDynamicGeneration(  distance  , 3, wallDimensionsY[relatedIDs] -0.01,
                                    wallCenterPoints[relatedIDs].x  , 1.5, wallSubsetMeshes[lastIndex].position.z - distance/2 ,
                                    Math.PI/2)


                                    //wallMeshSpheres[relatedIDs].position.set(distance, wallMeshSpheres[relatedIDs].position.y,  wallCenterPoints[relatedIDs].z )

                            }
                            if(wallSubsetMeshes[lastIndex].position.z < 0){

                                console.log("smaller y1 0", wallSubsetMeshes[relatedIDs])
                                //const distance = distancesVector[f][0]

                                wallMeshDynamicGeneration(  distance  , 3, wallDimensionsY[relatedIDs] -0.01,
                                    wallCenterPoints[relatedIDs].x  , 1.5, wallSubsetMeshes[lastIndex].position.z + distance/2 ,
                                    Math.PI/2)


                                    wallMeshSpheres[relatedIDs].position.set( wallMeshSpheres[relatedIDs].position.x, wallMeshSpheres[relatedIDs].position.y,  wallMeshSpheres[relatedIDs].position.z )


                            }
                        }

                        if(wallDirection[relatedIDs].y === -1) {
                            if(wallSubsetMeshes[lastIndex].position.z > 0){

                                console.log("smaller y-1 0", )

                                wallMeshDynamicGeneration(  distance  , 3, wallDimensionsY[relatedIDs] -0.01,
                                    wallCenterPoints[relatedIDs].x  , 1.5, wallSubsetMeshes[lastIndex].position.z - distance/2 ,
                                    Math.PI/2)

                                    //wallMeshSpheres[relatedIDs].position.set(distance, wallMeshSpheres[relatedIDs].position.y,  wallCenterPoints[relatedIDs].z )

                            }
                            if(wallSubsetMeshes[lastIndex].position.z < 0){

                                console.log("smaller y-1 0", wallSubsetMeshes[relatedIDs])

                                wallMeshDynamicGeneration(  distance   , 3, wallDimensionsY[relatedIDs] -0.01,
                                    wallCenterPoints[relatedIDs].x  , 1.5, wallSubsetMeshes[lastIndex].position.z + distance/2 ,
                                    Math.PI/2)

                                    //wallMeshSpheres[relatedIDs].position.set(distance, wallMeshSpheres[relatedIDs].position.y,  wallCenterPoints[relatedIDs].z )

                            }
                        }





                        //     console.log("x = 1", wallCenterPoints[relatedIDs], wallSubsetMeshes[relatedIDs])

                        if(wallDirection[relatedIDs].x === 1) {
                            if(wallSubsetMeshes[lastIndex].position.x > 0){
                                console.log("greater x1 0")


                                wallMeshDynamicGeneration(  distance  , 3, wallDimensionsY[relatedIDs] -0.01,
                                    wallSubsetMeshes[lastIndex].position.x  - distance/2 ,    1.5, wallCenterPoints[relatedIDs].z  ,
                                    0)
                                    // wallMeshSpheres[relatedIDs].position.set( wallCenterPoints[relatedIDs].x, wallMeshSpheres[relatedIDs].position.y,  distance)


                            }
                            if(wallSubsetMeshes[lastIndex].position.x < 0){

                                console.log("smaller x1 0", wallSubsetMeshes[relatedIDs])
                                //const distance = distancesVector[f][0]

                                wallMeshDynamicGeneration(  distance  , 3, wallDimensionsY[relatedIDs] -0.01,
                                    distance/2 - -wallSubsetMeshes[lastIndex].position.x ,    1.5, wallCenterPoints[relatedIDs].z  ,
                                    0)
                                    // wallMeshSpheres[relatedIDs].position.set( wallCenterPoints[relatedIDs].x, wallMeshSpheres[relatedIDs].position.y,  distance)


                            }
                        }
                            if(wallDirection[relatedIDs].x === -1) {
                                if(wallSubsetMeshes[lastIndex].position.x > 0){
                                    console.log("smaller x-1 0", )

                                    wallMeshDynamicGeneration(  distance  , 3, wallDimensionsY[relatedIDs] -0.01,
                                        wallSubsetMeshes[lastIndex].position.x  - distance/2 ,    1.5, wallCenterPoints[relatedIDs].z  ,
                                        0)
                                        // wallMeshSpheres[relatedIDs].position.set( wallCenterPoints[relatedIDs].x, wallMeshSpheres[relatedIDs].position.y,  distance)

                                }
                                if(wallSubsetMeshes[lastIndex].position.x < 0){

                                    console.log("smaller x-1 0", wallSubsetMeshes[relatedIDs])

                                    wallMeshDynamicGeneration(  -distance  , 3, wallDimensionsY[relatedIDs] -0.01,
                                        distance/2 - -wallSubsetMeshes[lastIndex].position.x ,    1.5, wallCenterPoints[relatedIDs].z  ,
                                        0)
                                        // wallMeshSpheres[relatedIDs].position.set( wallCenterPoints[relatedIDs].x, wallMeshSpheres[relatedIDs].position.y,  distance)

                                }
                        }


                      

                    }

                }








                    function wallMeshDynamicGeneration (boxwidth, boxheight, boxlenght, posX, posY, posZ, angle, ) {

                        //console.log("y = func",wallBounds[lastIndex], areasMeshes[lastIndex], wallPlacements[relatedIDs], centerWalls, sizeWall)
                        // const translateDistance = middelPointsStartWalls.distanceTo(areasMeshes[lastIndex].position)
                        // wallMeshSpheres[lastIndex].position.set(areasMeshes[lastIndex].position.x, areasMeshes[lastIndex].position.y, areasMeshes[lastIndex].position.z)

                        console.log("boxwidth", boxwidth, boxlenght, wallSubsetMeshes[relatedIDs].uuid)
                        const wallCopy = new BoxGeometry(boxwidth, boxheight, boxlenght)
                        const wallDynamicMesh = new Mesh(
                            wallCopy,
                            new MeshBasicMaterial({color: 'grey', transparent: true, opacity: 0.6})

                        )
                        wallDynamicMesh.position.set(posX,posY,posZ)
                        wallDynamicMesh.rotateY(angle)



                        //wallMeshSpheres[relatedIDs].position.set
                        //wallDynamicMesh.geometry = wallSubsetMeshes[relatedIDs].geometry
                        wallDynamicMesh.uuid = wallSubsetMeshes[relatedIDs].uuid
                        
                        const child = wallSubsetMeshes[relatedIDs].children[0]
                        console.log("child", child)
                        wallSubsetMeshes[relatedIDs] = wallDynamicMesh
                        wallSubsetMeshes[relatedIDs].add(child)

                        //wallSubsetMeshes.push(wallDynamicMesh)

                        wallDynamicMesh.geometry.computeBoundsTree()

                        let wallBB = new Box3(new Vector3(), new Vector3())
                        wallBB.copy(wallDynamicMesh.geometry.boundingBox)
                        wallDynamicMesh.updateMatrixWorld(true)


                        wallBB.applyMatrix4(wallDynamicMesh.matrixWorld)

                        wallBounds[relatedIDs] =  wallBB

                        centerWall1 = wallBB.getCenter(new Vector3());
                        console.log("centerWall", centerWall1)

                        wallCenterPoints[relatedIDs] = centerWall1

                        wallsDynamicListe.push(wallDynamicMesh)




                        if(wallDirection[lastIndex].x === -1) {

                            wallMeshSpheres[lastIndex].position.set(wallMeshSpheres[lastIndex].position.x, wallMeshSpheres[lastIndex].position.y, wallSubsetMeshes[lastIndex].position.z )


                        }
                        if(wallDirection[lastIndex].x === 1) {

                            wallMeshSpheres[lastIndex].position.set( wallMeshSpheres[lastIndex].x, wallMeshSpheres[lastIndex].position.y, wallSubsetMeshes[lastIndex].position.z )


                        }
                        if(wallDirection[lastIndex].y === -1) {
                            wallMeshSpheres[lastIndex].position.set( wallSubsetMeshes[lastIndex].position.x , wallMeshSpheres[lastIndex].position.y,  wallMeshSpheres[lastIndex].z)

                        }
                        if(wallDirection[lastIndex].y === 1) {
                            wallMeshSpheres[lastIndex].position.set( wallSubsetMeshes[lastIndex].position.x , wallMeshSpheres[lastIndex].position.y,  wallMeshSpheres[lastIndex].z)

                        }





                        if(wallDirection[relatedIDs].x === -1) {

                            wallMeshSpheres[relatedIDs].position.set(wallSubsetMeshes[lastIndex].position.x, wallMeshSpheres[relatedIDs].position.y, wallMeshSpheres[relatedIDs].position.z )


                        }
                        if(wallDirection[relatedIDs].x === 1) {

                            wallMeshSpheres[relatedIDs].position.set(wallSubsetMeshes[lastIndex].position.x, wallMeshSpheres[relatedIDs].position.y, wallMeshSpheres[relatedIDs].position.z )


                        }
                        if(wallDirection[relatedIDs].y === -1) {
                            wallMeshSpheres[relatedIDs].position.set(wallMeshSpheres[relatedIDs].position.x,   wallMeshSpheres[relatedIDs].position.y,  wallSubsetMeshes[lastIndex].position.z)

                        }
                        if(wallDirection[relatedIDs].y === 1) {
                            wallMeshSpheres[relatedIDs].position.set(wallMeshSpheres[relatedIDs].position.x,   wallMeshSpheres[relatedIDs].position.y,  wallSubsetMeshes[lastIndex].position.z)

                        }

                        wallCenterPoints[lastIndex] = wallSubsetMeshes[lastIndex].position


                        
                        // for (let i = 0; i < wallSubsetMeshes.length; i++){

                        //     wallSubset[i].position.set(-wallSubsetMeshes[i].position.x,-wallSubsetMeshes[i].position.y, -wallSubsetMeshes[i].position.z )
                        //     wallSubset[i].rotation.set(-wallSubsetMeshes[i].x,-wallSubsetMeshes[i].y, -wallSubsetMeshes[i].z )

                        //     wallSubsetMeshes[i].add( wallSubset[i])
                        // }



                    }
                 


                }


            for ( let i = 0; i < wallSubsetMeshes.length; i++){
                wallSubsetMeshesStartPositions[i] = new Vector3(wallSubsetMeshes[i].position.x,wallSubsetMeshes[i].position.y, wallSubsetMeshes[i].position.z)

                wallSubset[i].position.set(-wallSubsetMeshes[i].position.x,-wallSubsetMeshes[i].position.y, -wallSubsetMeshes[i].position.z )
                wallSubset[i].rotation.set(-wallSubsetMeshes[i].x,-wallSubsetMeshes[i].y, -wallSubsetMeshes[i].z )
                wallSubset[i].uuid = wallSubsetMeshes[i].uuid
                wallSubsetMeshes[i].add( wallSubset[i])

                console.log("wallIDToOpenings", wallIDToOpenings[i], )




                // wallIDToOpenings[i].forEach( child => {
                //     wallSubsetMeshes[i].add(child)
                // })

                // for(let id = 0; id < idsFill.length; id++){
                //     addingOpeningsToWall(id);
                // }


                scene.add(wallSubsetMeshes[i])

           

            }
            console.log("new walls", wallSubsetMeshes, wallsDynamicListe, allOpeningsMeshes)

            

            


    }

   
       



    }else {
        gumball.removeEventListener('change' , animate);
        scene.remove(gumball)
    }




    controls.update();

    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);

    // renderer.setAnimationLoop( function(){
    //     renderer.render(scene, camera);
    // });
    window.requestAnimationFrame(animate);
};

const labelMeasure = [];
const lines = [];
function meausreDistance(startPositionArea, area ){
    console.log("startPositionArea", startPositionArea)
    if(startPositionArea.length > 0){
        const lastEntry = startPositionArea[0].position
        console.log("lastE", lastEntry)

        const distanceMeasure = new Vector3(lastEntry.x, lastEntry.y, lastEntry.z).distanceTo(new Vector3(area[lastIndex].position.x, area[lastIndex].position.y, area[lastIndex].position.z))
        console.log("distanceMeasure",distanceMeasure)
        
        const measureTxt = document.createElement('button');
        if(distanceMeasure > 0){
        
            measureTxt.textContent = distanceMeasure.toFixed(2);
          
        }
       
        measureTxt.className = 'measureText';
            
        const labelObjectTxt = new CSS2DObject(measureTxt);
        labelMeasure.unshift(labelObjectTxt)

        for(let z = 1; z < labelMeasure.length; z++){
            scene.remove(labelMeasure[z])
        }
        labelMeasure[0].position.set((lastEntry.x + area[lastIndex].position.x)/2, lastEntry.y, (lastEntry.z + area[lastIndex].position.z)/2)
        scene.add(labelMeasure[0])

        const lineGeometry = new BufferGeometry().setFromPoints( [new Vector3(lastEntry.x, lastEntry.y, lastEntry.z), new Vector3(area[lastIndex].position.x, area[lastIndex].position.y, area[lastIndex].position.z)] );
        const line = new Line( lineGeometry, new LineBasicMaterial({ color: orangeColor,  linewidth: 2}) );
        
        lines.unshift(line)
        for(let l = 1; l < lines.length; l++){
            scene.remove(lines[l])
            
        }
        scene.add(lines[0])
        
    }
}
function collisionCheckLoop () {

    if(areas.length >= 1){

        meausreDistance(startPositionAreas, areas )
       


      

        

        //canvas.onpointerdown = (event) =>  pickFurnitureSecond(event, allSubsetMeshes, areas) ; //cubes


        //canvas.onpointerup = (event) =>  generateNewWall(event, wallSubset, wallSubsetMeshes)
        //console.log("wall", wallSubsetMeshes, wallSubset, allSubsetMeshes)
        ////console.log(allSubsetMeshes)

        canvas.onpointerup = (event) => {

            const spherePos = allSubsetMeshes[lastIndex].children[0].getWorldPosition(new Vector3())
            const vectorDir = new Vector3( areas[lastIndex].position.z - spherePos.z ,areas[lastIndex].position.x - spherePos.x , 0)
            console.log( "R else", areas[lastIndex].uuid, spherePos, vectorDir.normalize(), "wall", wallSubsetMeshes[lastIndex].position)


            modifiedDirections[lastIndex] = vectorDir.normalize()

            //wallDynamic ()



            // if(wallsDynamic.length > 1){

            //     scene.remove(wallsDynamic[0] )
            //     wallsDynamic.length = 0;
            // }



            

        }


        if (lastIndex !== undefined) {
            //console.log("lastindex animate", lastIndex)
            //console.log("hello im not undefinded", areas[lastIndex], areas[lastIndex].uuid)
            for(let cube = 0; cube < boundingCubes.length; cube++){
                boundingCubes[cube].copy( areas[cube].geometry.boundingBox).applyMatrix4(areas[cube].matrixWorld)

            }
            ////console.log(selected)
            for(let cube = 0; cube < subsetBoundingBoxes.length; cube++){
                subsetBoundingBoxes[cube].copy( allSubsetMeshes[cube].geometry.boundingBox).applyMatrix4(allSubsetMeshes[cube].matrixWorld)

            }
            for(let cube = 0; cube < wallBounds.length; cube++){
                //console.log(wallBounds, wallSubsetMeshes, wallSubset, areas)
                wallBounds[cube].copy( wallSubsetMeshes[cube].geometry.boundingBox).applyMatrix4(wallSubsetMeshes[cube].matrixWorld)

            }
            ////console.log(selected)



        DINCHECKER()
        newColorForCollidingArea(IntersectionsIDsAreaIntersectArea,IntersectionsIDsAreaIntersectAreaWith, greyColor)
        newColorForCollidingArea(IntersectionsIDsAreaContainArea,IntersectionsIDsAreaContainAreaWith, areaContainAreaColor)

        newColorForCollidingArea(IntersectionsIDsFurnIntersectFurn,IntersectionsIDsFurnIntersectFurnWith, furnIntersectFurnColor)
        newColorForCollidingArea(IntersectionsIDsFurnContainFurn,IntersectionsIDsFurnContainFurnWith, furnContainFurnColor)

        newColorForCollidingArea(IntersectionsIDs,IntersectionsIDsWith,furnClashAreaColor)
        newColorForCollidingArea(IntersectionsIDsAreaContainFurn,IntersectionsIDsAreaContainFurnWith, furnClashAreaColor)

        newColorForCollidingArea(IntersectionsIDsFurnIntersectArea,IntersectionsIDsFurnIntersectAreaWith,furnClashAreaColor)
        newColorForCollidingArea(IntersectionsIDsFurnContainArea,IntersectionsIDsFurnContainAreaWith, furnClashAreaColor)

        newColorForCollidingArea(IntersectionsIDsAreaIntersectWall,IntersectionsIDsAreaIntersectWallWith,greyColor)
        newColorForCollidingArea(IntersectionsIDsAreaContainWall,IntersectionsIDsAreaContainWallWith, furnClashAreaColor)

        newColorForCollidingArea(IntersectionsIDsFurnIntersectWall,IntersectionsIDsFurnIntersectWallWith,greyColor)
        newColorForCollidingArea(IntersectionsIDsFurnContainWall,IntersectionsIDsFurnContainWallWith, furnContainFurnColor)


        // translateAreaIfCollision(specificFurnIDList, 2, 0.6, 0.6)
        // translateAreaIfCollision(specificFurnIDList, 0, 0.3, 0.3)

        //makes Areas grey if there is no intersection
        // greenAreaReset = IntersectionsIDsAreaIntersectArea.concat(
        //     IntersectionsIDsAreaContainArea,
        //     IntersectionsIDsFurnIntersectFurn,
        //     IntersectionsIDsFurnContainFurn,
        //     IntersectionsIDsFurnIntersectArea,
        //     IntersectionsIDsFurnContainArea,
        //     IntersectionsIDs,
        //     IntersectionsIDsAreaIntersectWall,
        //     IntersectionsIDsAreaContainWall,
        //     IntersectionsIDsFurnIntersectWall,
        //     IntersectionsIDsFurnContainWall,
        //     IntersectionsIDsAreaContainFurn,
        //     IntersectionsIDsAreaIntersectAreaWith,
        //     IntersectionsIDsAreaContainAreaWith,
        //     IntersectionsIDsFurnIntersectFurnWith,
        //     IntersectionsIDsFurnContainFurnWith,
        //     IntersectionsIDsFurnIntersectAreaWith,
        //     IntersectionsIDsFurnContainAreaWith,
        //     IntersectionsIDsWith,
        //     IntersectionsIDsAreaIntersectWallWith,
        //     IntersectionsIDsAreaContainWallWith,
        //     IntersectionsIDsFurnIntersectWallWith,
        //     IntersectionsIDsFurnContainWallWith,
        //     IntersectionsIDsAreaContainFurnWith)

        for(let id = 0; id < allIDsInChecker.length; id++) {

            if(IntersectionsIDsAreaIntersectArea.includes(allIDsInChecker[id]) === false &&
                IntersectionsIDsAreaContainArea.includes(allIDsInChecker[id]) === false &&
                IntersectionsIDsFurnIntersectFurn.includes(allIDsInChecker[id]) === false &&
                IntersectionsIDsFurnContainFurn.includes(allIDsInChecker[id]) === false &&
                IntersectionsIDsFurnIntersectArea.includes(allIDsInChecker[id]) === false &&
                IntersectionsIDsFurnContainArea.includes(allIDsInChecker[id]) === false &&
                IntersectionsIDs.includes(allIDsInChecker[id]) === false &&
                IntersectionsIDsAreaIntersectWall.includes(allIDsInChecker[id]) === false &&
                IntersectionsIDsAreaContainWall.includes(allIDsInChecker[id]) === false &&
                IntersectionsIDsFurnIntersectWall.includes(allIDsInChecker[id]) === false &&
                IntersectionsIDsFurnContainWall.includes(allIDsInChecker[id]) === false &&
                IntersectionsIDsAreaContainFurn.includes(allIDsInChecker[id]) === false &&

                IntersectionsIDsAreaIntersectAreaWith.includes(allIDsInChecker[id]) === false &&
                IntersectionsIDsAreaContainAreaWith.includes(allIDsInChecker[id]) === false &&
                IntersectionsIDsFurnIntersectFurnWith.includes(allIDsInChecker[id]) === false &&
                IntersectionsIDsFurnContainFurnWith.includes(allIDsInChecker[id]) === false &&
                IntersectionsIDsFurnIntersectAreaWith.includes(allIDsInChecker[id]) === false &&
                IntersectionsIDsFurnContainAreaWith.includes(allIDsInChecker[id]) === false &&
                IntersectionsIDsWith.includes(allIDsInChecker[id]) === false &&
                IntersectionsIDsAreaIntersectWallWith.includes(allIDsInChecker[id]) === false &&
                IntersectionsIDsAreaContainWallWith.includes(allIDsInChecker[id]) === false &&
                IntersectionsIDsFurnIntersectWallWith.includes(allIDsInChecker[id]) === false &&
                IntersectionsIDsFurnContainWallWith.includes(allIDsInChecker[id]) === false &&
                IntersectionsIDsAreaContainFurnWith.includes(allIDsInChecker[id]) === false         ) {
                //if(greenAreaReset.includes(allIDsInChecker[id]) === false) {
                    //console.log("ID is not included!!!!!", allIDsInChecker[id])
                    for (let i = 0; i < areas.length; i++){
                        if(areas[i].uuid === allIDsInChecker[id]) {
                            areas[i].material.color = greyColor;

                        }
                    }
                }
        }




        function newColorForCollidingArea(IntersectionsIDsAreaIntersectArea,IntersectionsIDsAreaIntersectAreaWith, color) {
            if(IntersectionsIDsAreaIntersectArea.includes(areas[lastIndex].uuid)=== true) {
                //console.log("INCLUDED",areas[lastIndex].uuid, IntersectionsIDsAreaIntersectArea.indexOf(areas[lastIndex].uuid), indices, checkedList,IntersectionsIDsAreaIntersectAreaWith, IntersectionsIDsAreaIntersectArea)

                const indexSearching = IntersectionsIDsAreaIntersectArea.indexOf(areas[lastIndex].uuid)

                //console.log("INT WITH:", IntersectionsIDsAreaIntersectAreaWith[indexSearching])
                for (let i = 0; i < areas.length; i++){
                    if(areas[i].uuid === IntersectionsIDsAreaIntersectAreaWith[indexSearching]) {
                        areas[i].material.color = color
                    }
                }
            }
        }


        if(IntersectionsIDsAreaIntersectArea.length === 0 &&
            IntersectionsIDsAreaContainArea.length === 0 &&
            IntersectionsIDsFurnIntersectFurn.length === 0 &&
            IntersectionsIDsFurnContainFurn.length === 0 &&
            IntersectionsIDsFurnIntersectArea.length === 0 &&
            IntersectionsIDsFurnContainArea.length === 0 &&
            IntersectionsIDs.length === 0 &&
            IntersectionsIDsAreaIntersectWall.length === 0 &&
            IntersectionsIDsAreaContainWall.length === 0 &&
            IntersectionsIDsFurnIntersectWall.length === 0 &&
            IntersectionsIDsFurnContainWall.length === 0 &&
            IntersectionsIDsAreaContainFurn.length === 0 ) {

                for (let i = 0; i < areas.length; i++){
                    areas[i].material.color = greyColor;
                }
            }
        //console.log("Blue2, IntersectionsIDsAreaIntersectArea", IntersectionsIDsAreaIntersectArea)
        //console.log("lila2, IntersectionsIDsAreaContainArea", IntersectionsIDsAreaContainArea)
        //console.log("rosa2, IntersectionsIDsFurnIntersectFurn", IntersectionsIDsFurnIntersectFurn)
        //console.log("kaki2, IntersectionsIDsFurnContainFurn", IntersectionsIDsFurnContainFurn)
        //console.log("beere2, IntersectionsIDs", IntersectionsIDs, IntersectionsIDsFurnIntersectArea, IntersectionsIDsAreaIntersectWall, IntersectionsIDsAreaContainWall, IntersectionsIDsFurnIntersectWall, IntersectionsIDsFurnContainWall)
        //console.log("dunkelgrün2, IntersectionsIDsAreaContainFurn", IntersectionsIDsAreaContainFurn)


        //canvas.onpointerup = () => createTreeMenu(ifcProject, "tree-root2")
    }
}

}

const distancesWall = [];
// Transform Controls
gumball = new TransformControls(camera, renderer.domElement);
gumball.addEventListener('change' , animate);
gumball.addEventListener('dragging-changed', function (event) {
    controls.enabled =! event.value;
    if(storymodeIsActive){
        createTreeMenu(ifcProject, "tree-root2")
    }
    //console.log("hdjudidi", areas[lastIndex].position, wallSubsetMeshes[lastIndex].position, gumball)




});
gumball.setSize(0.5);
gumball.showY = false;
gumball.showZ =  true;
gumball.showX =  true;

///////////////////////////////////////////////
//////////////////////////////////////////////////////
//Adjust the viewport to the size of the browser
window.addEventListener("resize", () => {
    (size.width = window.innerWidth), (size.height = window.innerHeight);
    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix();
    renderer.setSize(size.width, size.height);
    labelRenderer.setSize(size.width, size.height);

});


const raycaster = new Raycaster();
raycaster.firstHitOnly = true;
const mouse = new Vector2();

function castObjects(event, ifcModels) {
    const bounds = canvas.getBoundingClientRect();

    const x1 = event.clientX -bounds.left;
    const x2 = bounds.right -bounds.left;
    mouse.x = (x1/ x2) * 2-1;

    const y1 = event.clientY  - bounds.top;
    const y2 = bounds.bottom - bounds.top;
    mouse.y = - (y1 / y2) * 2 +1;

    raycaster.setFromCamera(mouse, camera);

    const intersection = raycaster.intersectObjects(ifcModels);

    // if(intersection.length > 0){
    //     SELECTED = intersection[0].object;

    //     for (var i = 0; i < ifcModels.length; i++){
    //         if(SELECTED.position.x == ifcModels[i].position.x){
    //             thisObject = i;
    //             //console.log(thisObject)
    //         }
    //     }
    // }
    return intersection
}
;





const hightlightMaterial = new MeshBasicMaterial({
    transparent: true,
    opacity: 0.5,
    color: 0xFFCC99,
    depthTest: false
});

const hightlightMaterialSecond = new MeshBasicMaterial({
    transparent: true,
    opacity: 0.5,
    color: orangeColor,
    depthTest: false
});

const selectionMaterial = new MeshBasicMaterial({
    transparent: true,
    opacity: 0.5,
    color: 0xFF4500,
    depthTest: false

});


const selectionMaterialFurniture = new MeshBasicMaterial({
    transparent: true,
    opacity: 0.5,
    color: 'red',
    depthTest: false

});

const hidedObjectMaterial = new MeshBasicMaterial({
    transparent: true,
    opacity: 0.5,
    color: 'grey',
    depthTest: false

});


const slabMaterial = new MeshBasicMaterial({color: 0xe8e6d5, transparent: false,  opacity: 1.0, depthTest: false})
// Draw Bounds
const labelObjects = [];




const sphereGeometry = new SphereGeometry(0.1);
const sphereMaterial = new MeshBasicMaterial({color: "lightgray"});



const firstSphereGeometry = new SphereGeometry(0.2);




// -------------------------------------------------------
// EDITING IFC
// -------------------------------------------------------




// --------------------------------------------------------
// PICKING AND CHECKBOXES
//---------------------------------------------------------

//const outputID = document.getElementById('id-output');

async function pick(event, material, getProps,ifcModels ) {

    const found = castObjects(event, ifcModels)[0];
    if(found) {
    const index = found.faceIndex;
    ////console.log("index", index)
    lastModel = found.object;

    const geometry = found.object.geometry;
    ////console.log("geometry", geometry)

    // Id which collided with raycaster
    const ifc = loader.ifcManager;
    const id = ifc.getExpressId(geometry, index );


    ////console.log(id);

    if (getProps) {
      //await wallEdit(found, id);
      //console.log('props')
    }

    loader.ifcManager.createSubset({
        modelID: found.object.modelID,
        ids: [id],
        material: material,
        scene,
        removePrevious: true,
    });
    }
     else if(lastModel) {
        loader.ifcManager.removeSubset(lastModel.modelID, material);
        lastModel = undefined;
    }




};

function translateAreaIfCollision(specificFurnIDList, a, moveX, moveZ){
    //console.log("noSpecificFurnIDList", noSpecificFurnIDList)

    for(let id = 0; id < specificFurnIDList.length; id++) {
        //console.log("ID WC!!!!!", specificFurnIDList[a], lastIndex)
        if( IntersectionsIDsAreaIntersectArea.includes(specificFurnIDList[a].value) === true ||
            IntersectionsIDsAreaContainArea.includes(specificFurnIDList[a].value) === true ||
            IntersectionsIDsFurnIntersectFurn.includes(specificFurnIDList[a].value) === true ||
            IntersectionsIDsFurnContainFurn.includes(specificFurnIDList[a].value) === true ||
            IntersectionsIDs.includes(specificFurnIDList[a].value) === true ||
            IntersectionsIDsFurnIntersectArea.includes(specificFurnIDList[a].value) === true ||
            IntersectionsIDsFurnContainArea.includes(specificFurnIDList[a].value) === true ||
            IntersectionsIDsAreaIntersectWall.includes(specificFurnIDList[a].value) === true ||
            IntersectionsIDsAreaContainWall.includes(specificFurnIDList[a].value) === true ||
            IntersectionsIDsFurnIntersectWall.includes(specificFurnIDList[a].value) === true ||
            IntersectionsIDsFurnContainWall.includes(specificFurnIDList[a].value) === true ||
            IntersectionsIDsAreaContainFurn.includes(specificFurnIDList[a].value) === true ) {





                for (let i = 0; i < areas.length; i++){

                    if(areas[i].uuid === specificFurnIDList[a].value) {
                            indexWC = i
                            //console.log("ID is WC!!!!!", specificFurnIDList[a].value, areas[i], ReferenceDirections[i], lastPosition, indexWC)

                        }

                    }
        }else {
            return
        }
    }

            lastPosition = areas[indexWC].position
            //console.log("Pos", lastPosition, ReferenceDirections[indexWC],  areas[indexWC])
            if(ReferenceDirections[indexWC].x === -1 ){
                areas[indexWC].position.set(lastPosition.x + moveX,lastPosition.y ,lastPosition.z )
                translationList.push(areas[indexWC].uuid)

                areas[indexWC].geometry.boundingBox
                // const boxhelper = new BoxHelper(areas[indexWC], 0x000000)
                // scene.add(boxhelper)

            }
            if(ReferenceDirections[indexWC].x === 1){
                areas[indexWC].position.set(lastPosition.x + moveX,lastPosition.y ,lastPosition.z )
                areas[indexWC].geometry.boundingBox
                translationList.push(areas[indexWC].uuid)
                // const boxhelper = new BoxHelper(areas[indexWC], 0x000000)
                // scene.add(boxhelper)

            }
            if(ReferenceDirections[indexWC].y === -1){
                areas[indexWC].position.set(lastPosition.x,lastPosition.y ,lastPosition.z + moveZ)
                areas[indexWC].geometry.boundingBox
                translationList.push(areas[indexWC].uuid)


            }
            if(ReferenceDirections[indexWC].y === 1){
                areas[indexWC].position.set(lastPosition.x,lastPosition.y ,lastPosition.z + moveZ)
                areas[indexWC].geometry.boundingBox
                translationList.push(areas[indexWC].uuid)

            }


}
//'./Animations/Rollstuhl_Kollision_WC_1_mirror.mp4'
//'./Animations/Rollstuhl_Kollision_WC_1.mp4'

function videoAfterTranslationWC(indexFurniture, indexFurniture2, sourceVideo1, sourceVideo2, sourceVideo3, sourceVideo4){
    for(let check = 0; check < translationList.length; check++){



    //     const src = sourceVideo4 ; // transform gif to mp4
    //     // video -y nicht gespiegelt
    //     return src


        if(foundMeshesCheckbox[indexFurniture]  === translationList[check] ){

            const src = sourceVideo1 ; // transform gif to mp4
            // video -y gespiegelt

            return src


        } else if (foundMeshesCheckbox[indexFurniture]  !== translationList[check] ) {

            const src = sourceVideo2 ; // transform gif to mp4
            // video -y nicht gespiegelt
            return src


        }

    }
}
const kitchenanimations = [`./Animations/Rollstuhl_Kollision_Küche_Svenja_z_1.mp4`, `./Animations/Rollstuhl_Kollision_Küche_Svenja_z_1.mp4`, `./Animations/Rollstuhl_Kollision_Küche_Svenja_z_1.mp4`,`./Animations/Rollstuhl_Kollision_Küche_Svenja_z_1.mp4`];
const showeranimations = [`./Animations/Rollstuhl_Kollision_Sonstige.mp4`, `./Animations/Rollstuhl_Kollision_Sonstige.mp4`, `./Animations/Rollstuhl_Kollision_Sonstige.mp4`, `./Animations/Rollstuhl_Kollision_Sonstige.mp4`];
const tubeanimations = [`./Animations/Rollstuhl_Kollision_Sonstige.mp4`, `./Animations/Rollstuhl_Kollision_Sonstige.mp4`, `./Animations/Rollstuhl_Kollision_Sonstige.mp4`, `./Animations/Rollstuhl_Kollision_Sonstige.mp4`];
const sinkanimations = [`./Animations/Rollstuhl_Kollision_Waschbecken.mp4`, `./Animations/Rollstuhl_Kollision_Waschbecken.mp4`, `./Animations/Rollstuhl_Kollision_Waschbecken.mp4`, `./Animations/Rollstuhl_Kollision_Waschbecken.mp4`];
const bedanimations = [`./Animations/Rollstuhl_Kollision_Bett_spiegel.mp4`, `./Animations/Rollstuhl_Kollision_Bett_spiegel.mp4`,`./Animations/Rollstuhl_Kollision_Bett_spiegel.mp4`,`./Animations/Rollstuhl_Kollision_Bett_spiegel.mp4`];
// [`./Animations/Rollstuhl_Kollision_Bett_x_-1.mp4`, './Animations/Rollstuhl_Kollision_Bett_x_1.mp4', './Animations/Rollstuhl_Kollision_Bett_y_1.mp4', './Animations/Rollstuhl_Kollision_Bett_y_1.mp4'];
const wcanimations = [`./Animations/Rollstuhl_Kollision_WC_1.mp4`,`./Animations/Rollstuhl_Kollision_WC_1.mp4`,`./Animations/Rollstuhl_Kollision_WC_1.mp4`,`./Animations/Rollstuhl_Kollision_WC_1.mp4`];

const otheranimations = [`./Animations/Rollstuhl_Kollision_Sonstige.mp4`, `./Animations/Rollstuhl_Kollision_Sonstige.mp4`, `./Animations/Rollstuhl_Kollision_Sonstige.mp4`, `./Animations/Rollstuhl_Kollision_Sonstige.mp4`];
const wallanimations = ['wallanimations']




const mesh = [];
let prepickedSubset = [];
const areaNewList = [];
const areaNewList2 = [];
const wallClashmaterial = new MeshBasicMaterial({color: wallCollisionColor, transparent: true,  opacity: 0.5, depthTest: true})


async function prepickByID(event, material, secondMaterial,Expressid, node ) {
    loader.ifcManager.removeSubset(0, secondMaterial);
    loader.ifcManager.removeSubset(0, wallClashmaterial);
    for(let l = 0; l < labels.length; l++){
        //areas[id].add(labels[l])
        scene.remove(labels[l])
        

    }

    labels.length = 0
    prepickedSubset.length = 0
    for(let l = 0; l < DINLabels.length; l++){
        //areas[id].add(labels[l])
        scene.remove(DINLabels[l])

    }
    DINLabels.length = 0
   

    //console.log(Expressid, collidedIDs, checkedListIntersectFurnAndArea)
    const searchID = Expressid[0]
    ////console.log("NO1", searchID, searchedID)
    if(searchedID !== undefined){
        if(searchID !== searchedID) {
            ////console.log("NO", searchID, searchedID)
            removeSubsetAndGetOriginalMaterials(checkedListIntersectFurnAndArea, foundSubsets, indicesIntersectFurnAndArea, 1)

        }
    }
    //console.log(allLists.includes(searchID), searchID,IntersectionsIDsAreaIntersectArea )
    if(allLists.includes(searchID) === true){

        const problembtn = document.createElement('button');
        problembtn.textContent = '❗️DIN-Verstoß';
        problembtn.className = 'problemcontainer';

        for(let id = 0; id < areas.length; id++){

            //labelBase.textContent = moreInfo.toString()
            const labelObject = new CSS2DObject(problembtn);

            labelObject.uuid = areas[id].uuid
            labels.push(labelObject)

        }
        for(let id = 0; id < areas.length; id++){
            //console.log(areas[id], labels, problembtn, )
        if( areas[id].uuid === searchID) {
            //console.log("hello area",  areas[id].uuid, collisionID, areas[id], ReferenceDirections[id], specificFurnIDList)
             // Create video and play
                labels[id].position.set(areas[id].position.x + 0.3,areas[id].position.y ,areas[id].position.z )
                //areas[id].add(labels[l])
                scene.add(labels[id])

                await  specificAnimation( IntersectionsIDs, kitchenanimations, noIntersectionsIDs, furnClashAreaColor, 1, 'Küche', 1.5, 1.5)
                await  specificAnimation( IntersectionsIDs, showeranimations, noIntersectionsIDs, furnClashAreaColor, 5, 'Dusche', 1.5, 1.5)
                await  specificAnimation( IntersectionsIDs, tubeanimations, noIntersectionsIDs, furnClashAreaColor, 4, 'Badewanne', 1.5, 1.5)
                await  specificAnimation( IntersectionsIDs, sinkanimations, noIntersectionsIDs, furnClashAreaColor, 3, 'Waschtisch', 1.5, 1.5)
                await  specificAnimation( IntersectionsIDs, bedanimations, noIntersectionsIDs, furnClashAreaColor, 0, 'Bett',  4.5, 3.5)
                await  specificAnimation( IntersectionsIDs, wcanimations, noIntersectionsIDs, furnClashAreaColor, 2, 'WC', 1.5, 1.5)

                // await  specificAnimation( IntersectionsIDsAreaIntersectWall, wallanimations, noIntersectionsIDs, furnClashAreaColor, 1, 'Küche Wand', 1.5, 1.5)
                // await  specificAnimation( IntersectionsIDsAreaIntersectWall, wallanimations, noIntersectionsIDs, furnClashAreaColor, 5, 'Dusche Wand', 1.5, 1.5)
                // await  specificAnimation( IntersectionsIDsAreaIntersectWall, wallanimations, noIntersectionsIDs, furnClashAreaColor, 4, 'Badewanne Wand', 1.5, 1.5)
                // await  specificAnimation( IntersectionsIDsAreaIntersectWall, wallanimations, noIntersectionsIDs, furnClashAreaColor, 3, 'Waschtisch Wand', 1.5, 1.5)
                // await  specificAnimation( IntersectionsIDsAreaIntersectWall, wallanimations, noIntersectionsIDs, furnClashAreaColor, 0, 'Bett Wand', 4.5, 3.5)
                // await  specificAnimation( IntersectionsIDsAreaIntersectWall, wallanimations, noIntersectionsIDs, furnClashAreaColor, 2, 'WC Wand', 1.5, 1.5)

                await  specificAnimation( IntersectionsIDsFurnIntersectArea, kitchenanimations, noIntersectionsIDsFurnIntersectArea, furnClashAreaColor, 1, 'Küche', 1.5, 1.5)
                await  specificAnimation( IntersectionsIDsFurnIntersectArea, showeranimations, noIntersectionsIDsFurnIntersectArea, furnClashAreaColor, 5, 'Dusche', 1.5, 1.5)
                await  specificAnimation( IntersectionsIDsFurnIntersectArea, tubeanimations, noIntersectionsIDsFurnIntersectArea, furnClashAreaColor, 4, 'Badewanne', 1.5, 1.5)
                await  specificAnimation( IntersectionsIDsFurnIntersectArea, sinkanimations, noIntersectionsIDsFurnIntersectArea, furnClashAreaColor, 3, 'Waschtisch', 1.5, 1.5)
                await  specificAnimation( IntersectionsIDsFurnIntersectArea, bedanimations, noIntersectionsIDsFurnIntersectArea, furnClashAreaColor, 0, 'Bett',  4.5, 3.5)
                await  specificAnimation( IntersectionsIDsFurnIntersectArea, wcanimations, noIntersectionsIDsFurnIntersectArea, furnClashAreaColor, 2, 'WC', 1.5, 1.5)





        }
        indexID = noSpecificFurnIDList.indexOf(areas[id].uuid);
        if(noSpecificFurnIDList[indexID] === searchID ){
            console.log("SONSTIGE")
            const Videomaterial = videoMaterial(otheranimations[0], 1.5, 1.5, id)
                        //for(let mat = 0; mat < checkedMats.length; mat++){
            areas[id].material = Videomaterial;

            areas[id].position.set( areas[id].position.x, 1 ,  areas[id].position.z)

        }


        problembtn.onpointerenter = () => {

            const labelBase = document.createElement('div');
            labelBase.className = ' delete-button hidden '
            labelBase.style.backgroundColor = 'rgba(255,255,255,0.5)'

            moreInformationPlusButton( 'Küchenzeile',
            "DIN 18040-2: 2011-09: 5.4 Wohn- Schlafräume und Küchen",
            "Wohn-, Schlafräume und Küchen sind für Menschen mit motorischen Einschränkungen bzw. für Rollstuhl- nutzer barrierefrei nutzbar, wenn sie so dimensioniert sind, dass bei nutzungstypischer Möblierung jeweils ausreichende Bewegungsflächen vorhanden sind. Bewegungsflächen dürfen sich überlagern.",
            "Vor Kücheneinrichtungen ist eine Bewegngsfläche von 120cm vorzusehen.",
            "Vor Kücheneinrichtungen ist eine Bewegngsfläche von 150cm vorzusehen. Bei der Planung der haustechnischen Anschlüsse in einer Küche für Rollstuhlnutzer ist die Anordnung von Herd, Arbeitsplatte und Spüle übereck zu empfehlen.")

            moreInformationPlusButton( 'Dusche',
            "DIN 18040-2: 2011-09: 5.5.5 Duschplätze",
            "Duschplätze müssen so gestaltet sein, dass sie barrierefrei z. B. auch mit einem Rollator bzw. Rollstuhl nutz- bar sind.  ",
            "Dies wird erreicht durch: die niveaugleiche Gestaltung zum angrenzenden Bodenbereich des Sanitärraumes und einer Absenkung von max. 2 cm; ggf. auftretende Übergänge sollten vorzugsweise als geneigte Fläche ausgebildet werden; rutschhemmende Bodenbeläge im Duschbereich (sinngemäß nach GUV-I 8527 mindestens Bewertungs- gruppe B). Die Fläche des Duschplatzes kann in die Bewegungsflächen des Sanitärraumes einbezogen werden, wenn der Übergang zum Duschplatz bodengleich gestaltet ist und wenn die zur Entwässerung erforderliche Neigung max. 2 % beträgt.",
            "Die Nachrüstmöglichkeit für einen Dusch-Klappsitz, in einer Sitzhöhe von 46 cm bis 48 cm; beidseitig des Dusch-Klappsitzes eine Nachrüstmöglichkeit für hochklappbare Stützgriffe, deren Oberkante 28 cm über der Sitzhöhe liegt. Eine Einhebel-Duscharmatur mit Handbrause muss aus der Sitzposition in 85 cm Höhe über OFF erreichbar sein. Um Verletzungsgefahren insbesondere für blinde und sehbehinderte Menschen beim Vorbeugen zu ver- meiden, sollte der Hebel von Einhebel-Dusch-Armaturen nach unten weisen.")

            moreInformationPlusButton( 'Badewanne',
            "DIN 18040-2: 2011-09: 5.5.6 Badewannen",
            " ",
            "Das nachträgliche Aufstellen einer Badewanne z. B. im Bereich der Dusche sollte möglich sein.",
            "Das nachträgliche Aufstellen einer Badewanne z. B. im Bereich der Dusche muss möglich sein. Sie muss mit einem Lifter nutzbar sein.")


            moreInformationPlusButton( 'Waschtisch',
            "DIN 18040-2: 2011-09: 5.5.4 Waschplätze",
            "Waschplätze müssen so gestaltet sein, dass eine Nutzung auch im Sitzen möglich ist.",
            "Dies wird mit folgenden Maßnahmen erreicht: 1. bauseitige Möglichkeit, einen mindestens 100 cm hohen Spiegel bei Bedarf unmittelbar über dem Waschtisch anzuordnen; 2. Beinfreiraum unter dem Waschtisch;",
            "1. Vorderkantenhöhe des Waschtisches von max. 80 cm über OFF; 2. Unterfahrbarkeit von mindestens 55 cm Tiefe und Abstand der Armatur zum vorderen Rand des Waschtisches von höchstens 40 cm (siehe Bild 16); 3. Beinfreiraum unter dem Waschtisch mit einer Breite von mindestens 90 cm (axial gemessen); Angaben zu den erforderlichen gestaffelten Höhen und Tiefen (siehe Bild 16); 4. einem mindestens 100 cm hohen Spiegel, der unmittelbar über dem Waschtisch angeordnet ist.")

            moreInformationPlusButton( 'WC',
            "DIN 18040-2: 2011-09: 5.5.3 WC-Becken",
            "",
            "Zur leichteren Nutzbarkeit des WC-Beckens ist ein seitlicher Mindestabstand von 20 cm zur Wand oder zu anderen Sanitärobjekten einzuhalten.",
            "Zweckentsprechend angeordnet sind WC-Becken mit 1.einer Höhe des WC-Beckens einschließlich Sitz zwischen 46 cm und 48 cm über OFF. 2. Ausreichende Bewegungsflächen neben WC-Becken sind. 2.1 mindestens 70 cm tief, von der Beckenvorderkante bis zur rückwärtigen Wand; 2.2 mindestens 90 cm breit an der Zugangsseite und für Hilfspersonen mindestens 30 cm breit an der gegenüberliegenden Seite (siehe Bild 12). In Gebäuden mit mehr als einer Wohneinheit für uneingeschränkte Rollstuhlnutzung sind die Zu- gangsseiten abwechselnd rechts oder links vorzusehen. 3. Folgende Bedienelemente und Stützen sind erforderlich: 3.1 Rückenstütze, angeordnet 55 cm hinter der Vorderkante des WC-Beckens. Der WC-Deckel ist als alleinige Rückenstütze ungeeignet; 3.2 Spülung, mit der Hand oder dem Arm bedienbar, im Greifbereich des Sitzenden, ohne dass der Benutzer die Sitzposition verändern muss. Wird eine berührungslose Spülung verwendet, muss ihr ungewolltes Auslösen ausgeschlossen sein; 3.3 Toilettenpapierhalter, erreichbar ohne Veränderung der Sitzposition; 3.4 Stützklappgriffe. 4. Stützklappgriffe müssen folgende Anforderungen erfüllen (siehe auch Bild 13): 4.1 auf jeder Seite des WC-Beckens montiert; 4.2 hochklappbar; 4.3 15 cm über die Vorderkante des WC-Beckens hinausragend; 4.4 bedienbar mit wenig Kraftaufwand in selbst gewählten Etappen; 4.5 Abstand zwischen den Stützklappgriffen 65 cm bis 70 cm; 4.6 Oberkante über der Sitzhöhe 28 cm; 4.7 Befestigung, die einer Punktlast von mindestens 1 kN am Griffende standhält. ANMERKUNG Es wird z. B. unterschieden zwischen Stützklappgriffen mit und ohne Feder. Die Klappgriffe mit Feder können mit geringerem Kraftaufwand beim Hochklappen bedient werden.")

            moreInformationPlusButton( 'Bett',
            "DIN 18040-2: 2011-09: 5.4  Wohn- Schlafräume und Küchen",
            "Wohn-, Schlafräume und Küchen sind für Menschen mit motorischen Einschränkungen bzw. für Rollstuhl- nutzer barrierefrei nutzbar, wenn sie so dimensioniert sind, dass bei nutzungstypischer Möblierung jeweils ausreichende Bewegungsflächen vorhanden sind.",
            "Ausreichende Mindesttiefen von Bewegungsflächen entlang und vor Möbeln sind bei mindestens einem Bett: 120 cm entlang der einen und 90 cm entlang der anderen Längsseite;",
            "Ausreichende Mindesttiefen von Bewegungsflächen entlang und vor Möbeln sind bei mindestens einem Bett: 150 cm entlang der einen und 120 cm entlang der anderen Längsseite;")

            moreInformationPlusButton( 'Sonstiges Möbel',
            "DIN 18040-2: 2011-09: 5.4  Wohn- Schlafräume und Küchen",
            "Wohn-, Schlafräume und Küchen sind für Menschen mit motorischen Einschränkungen bzw. für Rollstuhl- nutzer barrierefrei nutzbar, wenn sie so dimensioniert sind, dass bei nutzungstypischer Möblierung jeweils ausreichende Bewegungsflächen vorhanden sind.",
            "Ausreichende Mindesttiefen von Bewegungsflächen entlang und vor Möbeln sind bei sonstigen Möbeln: vor sonstigen Möbeln: 90cm;",
            "Ausreichende Mindesttiefen von Bewegungsflächen entlang und vor Möbeln sind bei sonstigen Möbeln: 150cm;")

            moreInformationPlusButton( 'Sanitärmöbel',
            "DIN 18040-2: 2011-09: 5.5 Sanitärräume",
            "In einer Wohnung mit mehreren Sanitärräumen muss mindestens einer der Sanitärräume barrierefrei nutzbar sein. Mit den Anforderungen dieses Abschnitts der Norm sind Sanitärräume sowohl für Menschen mit motorischen Einschränkungen bzw. für Rollstuhlnutzer als auch für blinde und sehbehinderte Menschen barrierefrei nutzbar. Aus Sicherheitsgründen dürfen Drehflügeltüren nicht in Sanitärräume schlagen, um ein Blockieren der Tür zu vermeiden. Türen von Sanitärräumen müssen von außen entriegelt werden können. Armaturen sollten als Einhebel- oder berührungslose Armatur ausgebildet sein. Berührungslose Armaturen dürfen nur in Verbindung mit Temperaturbegrenzung eingesetzt werden. Um ein Verbrühen zu vermeiden, ist die Wassertemperatur an der Auslaufarmatur auf 45 °C zu begrenzen. Die Ausstattungselemente sollten sich visuell kontrastierend von ihrer Umgebung abheben (z. B. heller Waschtisch/dunkler Hintergrund oder kontrastierende Umrahmungen). Die Wände von Sanitärräumen sind bauseits so auszubilden, dass sie bei Bedarf nachgerüstet werden können mit senkrechten und waagerechten Stütz- und/oder Haltegriffen neben dem WC-Becken sowie im Bereich der Dusche und der Badewanne. Ist ein Sanitärraum ausschließlich über ein Fenster zu lüften, ist zur Bedienbarkeit 5.3.2 zu beachten."  ,
            "Jeweils vor den Sanitärobjekten wie WC-Becken, Waschtisch, Badewanne und im Duschplatz ist eine Bewegungsfläche anzuordnen. Ausreichend ist eine Mindestfläche von 120cm×120cm;",
            "Jeweils vor den Sanitärobjekten wie WC-Becken, Waschtisch, Badewanne und im Duschplatz ist eine Bewegungsfläche anzuordnen. Ausreichend ist eine Mindestfläche von 150cm×150cm;")



            function moreInformationPlusButton(nodetype, headerText, moreInfo, rules, rulesR){
                console.log("ertzuio", searchID, node)
                if( node.type == nodetype.toString() ) {
                    //labelBase.textContent = moreInfo.toString()
                    

                    for(let i = 0; i < labels.length; i++){
                        console.log('info ', node.expressID , labels[i].uuid, node)
                        if(node.expressID === labels[i].uuid) {
                            console.log('info2 ' , labels, node)
                            const header = document.createElement('h3');
                            header.textContent = headerText.toString()
                            labelBase.appendChild(header)

                            const enter = document.createElement('br');
                            labelBase.appendChild(enter)

                            const info = document.createElement('p');
                            info.textContent = moreInfo.toString()
                            labelBase.appendChild(info)

                            const enter2 = document.createElement('br');
                            labelBase.appendChild(enter2)

                            const ruletext = document.createElement('h4');
                            ruletext.textContent = "In einer barrierefrei nutzbaren Wohnung: " + rules.toString()
                            labelBase.appendChild(ruletext)

                            const enter3 = document.createElement('br');
                            labelBase.appendChild(enter3)

                            const ruletextR = document.createElement('h4');
                            ruletextR.textContent = "In einer Wohnung im R-Standard: " +  rulesR.toString()
                            labelBase.appendChild(ruletextR)
                            
                            deleteButton = labels[i].element
                            deleteButton.appendChild(labelBase)
                            
                            
                            const labelObject = new CSS2DObject(deleteButton);

                            DINLabels.push(labelObject)
                            

                            for(id = 0; id < areas.length; id++){
                                if(areas[id].uuid == searchID) {

                                    //console.log("ID Position", areas[id].position, areas[id], areas, id)
                                    labelObject.position.set(labels[i].position.x , labels[i].position.y, labels[i].position.z)
                                }
                            }



                            // labelObjects.push(labelObject)

                            // scene.add(labelObjects[1]);


                            labelBase.onpointerdown = () => {
                                deleteButton.style.visibility = 'hidden'
                                labelObject.removeFromParent();
                                labelObject.element = null;
                                labelBase.remove();
                            }



                            deleteButton.onpointerenter = () => {
                                labelBase.classList.remove('hidden')
                            }
                            deleteButton.onpointerleave = () => {
                                labelBase.classList.add('hidden')
                                
                            }

                            //labels[i].add(labelObject)
                            scene.add(labelObject)



                        }
                    }
               
             
               

            
            }

        }
    }
    


    }

    }


   showCollisionText('containerText', 'containerTextNot')
   //showCollisionText('containerTextNot')
    function showCollisionText(className,classNameGreen, ){
        const stringID = searchID.toString();
        const collisionTextShow = document.getElementsByClassName(className);
        const arrayNodes = Array.from(collisionTextShow)

        const collisionTextShowGreen = document.getElementsByClassName(classNameGreen);




        ShowTextPerNode(intersectionidHTML,stringID, arrayNodes )
        ShowTextPerNode(noIntersectionidHTML,stringID, arrayNodes )

     }



    function specificAnimationWalls(IntersectionsIDsTest, IntersectionsIDsTestWith, source, index, name){
        if(noSpecificFurnIDList.includes(searchID) === true){
        for(let  r = 0; r < IntersectionsIDsTest.length; r++){
            if(noSpecificFurnIDList.includes(IntersectionsIDsTest[r]) === true){

                for (let id = 0; id < areas.length; id++){
                    if( areas[id].uuid === searchID) {
                        const Videomaterial = videoMaterial(otheranimations[0], 1.5, 1.5, id)
                        //for(let mat = 0; mat < checkedMats.length; mat++){
                        areas[id].material = Videomaterial;

                        areas[id].position.set( areas[id].position.x, 1 ,  areas[id].position.z)


                        }
                    }
            }
        }
    }

        if(IntersectionsIDsTest.includes(foundMeshesCheckbox[index]) === true){
            //console.log("name", name, foundMeshesCheckbox[index])

                //const firstOcc = includesIDinList([foundMeshesCheckbox[index]])

                const indexWall = IntersectionsIDsTest.indexOf(searchID)

                //console.log('indexWall', indexWall, IntersectionsIDsTest, IntersectionsIDsTestWith, searchID, foundMeshesCheckbox, specificFurnIDList, specificFurnIDList[index].key, noSpecificFurnIDList)

                if(searchID === IntersectionsIDsTest[indexWall]){
                    //console.log('wallani', name)
                    loader.ifcManager.createSubset({
                        modelID: model.modelID,
                        ids: [ IntersectionsIDsTestWith[indexWall] ],
                        material: wallClashmaterial,
                        scene,
                        removePrevious: true,
                    });

                        if(specificFurnIDList[index].value === IntersectionsIDsTest[indexWall] && specificFurnIDList[index].key === 'Dusche'){
                            wallCollisonAnimationArea('Dusche Wand', IntersectionsIDsTest, indexWall, showeranimations, 1.5, 1.5)
                        }

                        if(specificFurnIDList[index].value === IntersectionsIDsTest[indexWall] && specificFurnIDList[index].key === 'Küche' ) {
                            wallCollisonAnimationArea('Küche Wand', IntersectionsIDsTest, indexWall, kitchenanimations, 1.5, 1.5)
                        }
                        if(specificFurnIDList[index].value === IntersectionsIDsTest[indexWall] && specificFurnIDList[index].key === 'Badewanne' ){
                            wallCollisonAnimationArea('Badewanne Wand', IntersectionsIDsTest, indexWall, tubeanimations, 1.5, 1.5)
                        }

                        if(specificFurnIDList[index].value === IntersectionsIDsTest[indexWall] && specificFurnIDList[index].key === 'Waschtisch' ){
                            wallCollisonAnimationArea('Waschtisch Wand', IntersectionsIDsTest, indexWall, sinkanimations, 1.5, 1.5)
                        }
                        if(specificFurnIDList[index].value === IntersectionsIDsTest[indexWall] && specificFurnIDList[index].key === 'Bett' ){
                            wallCollisonAnimationArea('Bett Wand', IntersectionsIDsTest, indexWall, bedanimations, 4.5, 3.5)
                        }
                        if(specificFurnIDList[index].value === IntersectionsIDsTest[indexWall] && specificFurnIDList[index].key === 'WC' ){
                            wallCollisonAnimationArea('WC Wand', IntersectionsIDsTest, indexWall, wcanimations, 1.5, 1.5)
                        }





                    function wallCollisonAnimationArea(name, IntersectionsIDsTest, indexWall, showeranimations, width, depth){

                        //if(name === 'Dusche Wand' || name === 'Küche Wand' ||name === 'Badewanne Wand' ||name === 'Waschtisch Wand' ||name === 'Bett Wand' ||name === 'WC Wand' ){
                            let videoSource
                            for (let id = 0; id < areas.length; id++){


                                if(areas[id].uuid === IntersectionsIDsTest[indexWall]){
                                    for (let video = 0; video < showeranimations.length; video++){
                                        if(ReferenceDirections[id].x > 0){
                                            //console.log("0", ReferenceDirections[id])
                                            videoSource = showeranimations[0]

                                        }
                                        if(ReferenceDirections[id].x < 0){
                                            //console.log("1", ReferenceDirections[id])
                                            videoSource = showeranimations[1]
                                        }

                                        if(ReferenceDirections[id].y < 0){
                                            //console.log("2", ReferenceDirections[id])
                                            videoSource = showeranimations[2]

                                        }

                                        if(ReferenceDirections[id].y > 0){
                                            //console.log("3", ReferenceDirections[id])
                                            videoSource = showeranimations[3]


                                        }

                                    }
                                    const Videomaterial = videoMaterial(videoSource, width, depth, id)


                                    // let geo = new EdgesGeometry(areas[id].geometry);
                                    // let mat = new LineBasicMaterial({ color: "black", linewidth: 10 });
                                    // let wireframe = new LineSegments(geo, mat);
                                    // wireframe.renderOrder = 1; // make sure wireframes are rendered 2nd
                                    // areas[id].add(wireframe);

                                    areas[id].material = Videomaterial
                                    //console.log("heigt", allSubsetMeshes[id], allSubsetMeshes[id].geometry.boundingBox.max.y, areas[id])
                                    areas[id].position.set( areas[id].position.x, allSubsetMeshes[id].geometry.boundingBox.max.y,  areas[id].position.z)

                                } else  {

                                    for(let mat = 0; mat < checkedMats.length; mat++){
                                        areas[id].material = checkedMats[id];

                                        areas[id].position.set( areas[id].position.x, 0.0 ,  areas[id].position.z)


                                    }
                                }

                            }

                        }
                    };

                } else if(IntersectionsIDsTest.includes(foundMeshesCheckbox[index]) === false) {
                    for (let id = 0; id < areas.length; id++){
                        if( areas[id].uuid !== searchID) {
                            for(let mat = 0; mat < checkedMats.length; mat++){
                                areas[id].material = checkedMats[id];
                                areas[id].position.set( areas[id].position.x, 0.0 ,  areas[id].position.z)


                            }
                        }

                }
                }
            }



            function videoMaterial(source, width, depth, id){

                let textureVid = document.createElement("video")


                textureVid.src = source ; // transform gif to mp4
                textureVid.loop = true;
                textureVid.width = '900';
                textureVid.height = '1080';
                textureVid.play();


                // Load video texture
                let videoTexture = new VideoTexture(textureVid);
                videoTexture.format = RGBFormat;

                // videoTexture.minFilter = NearestFilter;
                // videoTexture.maxFilter = NearestFilter;

                videoTexture.generateMipmaps = false;
                // videoTexture.wrapS = RepeatWrapping;
                // videoTexture.wrapT = RepeatWrapping;
                // //console.log(areas[id])
                videoTexture.repeat.set(areas[id].geometry.parameters.width/width, areas[id].geometry.parameters.depth/depth)

                // Create mesh

                var Videomaterial = new MeshBasicMaterial( { map: videoTexture, depthTest: true, transparent: true, opacity: 0.8 } );
                //console.log(Videomaterial, videoTexture)
                return Videomaterial
                //areas[id].geometry.parameters.height = allSubsetMeshes[id].geometry.boundingBox.max.y

            }


    async function specificAnimation( IntersectionsIDsTest, source, noIntersectionsIDs, firstMaterial, index, name, width, depth) {

        if(IntersectionsIDsTest.includes(foundMeshesCheckbox[index]) === true){
            console.log("name", name, foundMeshesCheckbox[index], specificFurnIDList, foundMeshesCheckbox,)

            const firstOcc = includesIDinList([foundMeshesCheckbox[index]])

            await extraAnimationArea('WC','Waschtisch', 2, 3, './Animations/Rollstuhl_Kollision_WC_1_mirror.mp4', './Animations/Rollstuhl_Kollision_WC_1.mp4', './Animations/Rollstuhl_Kollision_Waschbecken.mp4', './Animations/Rollstuhl_Kollision_Waschbecken.mp4');
            //await extraAnimationArea('Waschtisch', 3, './Animations/Rollstuhl_Kollision_WC_1_mirror.mp4', './Animations/Rollstuhl_Kollision_WC_1.mp4');

            async function extraAnimationArea(nameFurn, nameFurn2, indexFurniture,indexFurniture2,  sourceVideo1, sourceVideo2, sourceVideo3, sourceVideo4){
                //console.log(foundMeshesCheckbox[indexFurniture] , foundMeshesCheckbox[indexFurniture2] )
                console.log(name, nameFurn, nameFurn2)
                if(name === nameFurn || name === nameFurn2){
                    for(let id = 0; id < areas.length; id++){
                        if(IntersectionsIDsTest.includes(foundMeshesCheckbox[indexFurniture]) === true){
                            if(searchID === foundMeshesCheckbox[indexFurniture] ){
                                ////console.log("IDARREA", areas[id],  foundMeshesCheckbox[indexFurniture], translationList)
                                if(areas[id].uuid === foundMeshesCheckbox[indexFurniture]  ){
                                    videoArea (sourceVideo1, sourceVideo2, sourceVideo3, sourceVideo4)
                                    for(let u = 0; u < areaNewList.length; u++){
                                        scene.add(areaNewList[0])
                                    }
                                }
                            }if (searchID !== foundMeshesCheckbox[indexFurniture] ){
                                ////console.log("NOOOOOOO", areas[id].uuid, foundMeshesCheckbox[indexFurniture] )
                                for(let u = 0; u < areaNewList.length; u++){
                                    scene.remove(areaNewList[u])
                                }

                                if(mesh.length > 0){
                                    for(let p = 0; p < mesh.length; p++){
                                        scene.add(mesh[p])
                                    }

                                }

                            }
                        }
                        if(IntersectionsIDsTest.includes(foundMeshesCheckbox[indexFurniture2]) === true){
                            if(searchID === foundMeshesCheckbox[indexFurniture2]){
                                if(areas[id].uuid === foundMeshesCheckbox[indexFurniture2]  ){
                                    videoArea (sourceVideo1, sourceVideo2, sourceVideo3, sourceVideo4)
                                    for(let u = 0; u < areaNewList2.length; u++){
                                        scene.add(areaNewList2[0])
                                    }
                                }

                            }

                            if (searchID !== foundMeshesCheckbox[indexFurniture2] ){
                                ////console.log("NOOOOOO2O", areas[id].uuid, foundMeshesCheckbox[indexFurniture2] )

                                for(let u = 0; u < areaNewList2.length; u++){
                                    scene.remove(areaNewList2[u])
                                }
                                if(mesh.length > 0){
                                    for(let p = 0; p < mesh.length; p++){
                                        scene.add(mesh[p])
                                    }

                                }

                            }

                        }
                        function videoArea (sourceVideo1, sourceVideo2, sourceVideo3, sourceVideo4) {
                                let textureVid = document.createElement("video")

                                function generateAreaForAnimation(boxX, boxZ, material, posx, posy, posz){
                                    //console.log("Area", areas[id], ReferenceDirections[id], foundMeshesCheckbox[indexFurniture] , foundMeshesCheckbox[indexFurniture2] )
                                    const areaRandom = new BoxGeometry(boxX  ,0.008,boxZ)

                                    material.map.repeat.y = boxZ/boxZ
                                    material.map.repeat.x = boxX/boxX

                                    const  areaNew = new Mesh(areaRandom, material )



                                    areaNew.position.set(posx, posy, posz  )

                                    if(areas[id].uuid === foundMeshesCheckbox[indexFurniture] ) {
                                        areaNewList.push(areaNew)
                                        //areaNewList2.push(areaNew)
                                    }
                                    if(areas[id].uuid === foundMeshesCheckbox[indexFurniture2] ) {
                                        areaNewList2.push(areaNew)
                                        //areaNewList2.push(areaNew)
                                    }

                                    //scene.add(areaNewList[0])
                                    ////console.log("areaNweF", areaNewList, areaNewList2)
                                    //IntersectionsIDsTest.splice()

                                }


                                if(areas[id].uuid === foundMeshesCheckbox[indexFurniture2] ) {
                                    const src = sourceVideo3
                                    textureVid.src = src ; // transform gif to mp4
                                    textureVid.loop = true;
                                    textureVid.width = '900';
                                    textureVid.height = '1080';
                                    textureVid.play();

                                    // Load video texture
                                    let videoTexture = new VideoTexture(textureVid);
                                    videoTexture.format = RGBFormat;

                                    videoTexture.generateMipmaps = false;

                                    // Create mesh

                                    const materialVideo = new MeshBasicMaterial( { map: videoTexture ,depthTest: true, transparent: true, opacity: 0.8 } );

                                    const meshHide = areas[id];
                                    mesh.push(meshHide)
                                    scene.remove(meshHide)

                                    if(ReferenceDirections[id].x > 0){
                                        generateAreaForAnimation(1.5, areas[id].geometry.parameters.depth + 1.5,materialVideo,
                                            areas[id].position.x,
                                            areas[id].position.y + 0.85,
                                            areas[id].position.z + ((areas[id].geometry.parameters.depth + 1.5)/2) - areas[id].geometry.parameters.depth/2 )

                                    }
                                    if(ReferenceDirections[id].x < 0){
                                        generateAreaForAnimation(1.5, areas[id].geometry.parameters.depth + 1.5,materialVideo,
                                            areas[id].position.x,
                                            areas[id].position.y +0.85,
                                            areas[id].position.z - ((areas[id].geometry.parameters.depth + 1.5)/2) + areas[id].geometry.parameters.depth/2 )


                                    }

                                    if(ReferenceDirections[id].y < 0){
                                        generateAreaForAnimation(areas[id].geometry.parameters.depth + 1.5,1.5, materialVideo,
                                            areas[id].position.x - ((areas[id].geometry.parameters.depth + 1.5)/2) + areas[id].geometry.parameters.depth/2,
                                            areas[id].position.y + 0.85,
                                            areas[id].position.z )


                                        ////console.log("areaNwe", areaNewList)

                                    }

                                    if(ReferenceDirections[id].y > 0){
                                        generateAreaForAnimation(areas[id].geometry.parameters.depth + 1.5, 1.5,materialVideo,
                                            areas[id].position.x + ((areas[id].geometry.parameters.depth + 1.5)/2) - areas[id].geometry.parameters.depth/2,
                                            areas[id].position.y + 0.85,
                                            areas[id].position.z )



                                    }
                                } if(areas[id].uuid === foundMeshesCheckbox[indexFurniture] ) {

                                    const src = videoAfterTranslationWC(indexFurniture, indexFurniture2,sourceVideo1, sourceVideo2, sourceVideo3, sourceVideo4)
                                    textureVid.src = src ; // transform gif to mp4
                                    textureVid.loop = true;
                                    textureVid.width = '900';
                                    textureVid.height = '1080';
                                    textureVid.play();

                                    // Load video texture
                                    let videoTexture = new VideoTexture(textureVid);
                                    videoTexture.format = RGBFormat;

                                    videoTexture.generateMipmaps = false;

                                    // Create mesh

                                    const materialVideo = new MeshBasicMaterial( { map: videoTexture, depthTest: true, transparent: true, opacity: 0.8 } );

                                    const meshHide = areas[id];
                                    mesh.push(meshHide)
                                    scene.remove(meshHide)


                                    if(ReferenceDirections[id].x > 0){
                                        generateAreaForAnimation(areas[id].geometry.parameters.width, areas[id].geometry.parameters.depth + 1.5,materialVideo,
                                            areas[id].position.x,
                                            areas[id].position.y + 0.85,
                                            areas[id].position.z + ((areas[id].geometry.parameters.depth + 1.5)/2) - areas[id].geometry.parameters.depth/2 )

                                    }
                                    if(ReferenceDirections[id].x < 0){
                                        generateAreaForAnimation(areas[id].geometry.parameters.width, areas[id].geometry.parameters.depth + 1.5,materialVideo,
                                            areas[id].position.x,
                                            areas[id].position.y +0.85,
                                            areas[id].position.z - ((areas[id].geometry.parameters.depth + 1.5)/2) + areas[id].geometry.parameters.depth/2 )


                                    }

                                    if(ReferenceDirections[id].y < 0){
                                        generateAreaForAnimation(areas[id].geometry.parameters.depth + 1.5,areas[id].geometry.parameters.width, materialVideo,
                                            areas[id].position.x - ((areas[id].geometry.parameters.depth + 1.5)/2) + areas[id].geometry.parameters.depth/2,
                                            areas[id].position.y + 0.85,
                                            areas[id].position.z )


                                        ////console.log("areaNwe", areaNewList)

                                    }

                                    if(ReferenceDirections[id].y > 0){
                                        generateAreaForAnimation(areas[id].geometry.parameters.depth + 1.5, areas[id].geometry.parameters.width,materialVideo,
                                            areas[id].position.x + ((areas[id].geometry.parameters.depth + 1.5)/2) - areas[id].geometry.parameters.depth/2,
                                            areas[id].position.y + 0.85,
                                            areas[id].position.z )



                                    }
                                }
                            }



                    }
                } else {


                    await changeAreaToAnimaton(firstOcc, IntersectionsIDsTest, source, noIntersectionsIDs, firstMaterial, width, depth)
                }
            };





        }
    }







    specificAnimationWalls(IntersectionsIDsAreaIntersectWall, IntersectionsIDsAreaIntersectWallWith, wallanimations, 5, ['Dusche Wand'])
    specificAnimationWalls(IntersectionsIDsAreaIntersectWall, IntersectionsIDsAreaIntersectWallWith, wallanimations,1, ['Küche Wand'])
    specificAnimationWalls(IntersectionsIDsAreaIntersectWall, IntersectionsIDsAreaIntersectWallWith, wallanimations,4, ['Badewanne Wand'])
    specificAnimationWalls(IntersectionsIDsAreaIntersectWall, IntersectionsIDsAreaIntersectWallWith, wallanimations,3, ['Waschtisch Wand'])
    specificAnimationWalls(IntersectionsIDsAreaIntersectWall, IntersectionsIDsAreaIntersectWallWith, wallanimations,0, ['Bett Wand'])
    specificAnimationWalls(IntersectionsIDsAreaIntersectWall, IntersectionsIDsAreaIntersectWallWith, wallanimations,2,[ 'WC Wand'])


        const subs = loader.ifcManager.createSubset({
            modelID: model.modelID,
            ids: [ searchID ],
            material: secondMaterial,
            scene,
            removePrevious: true,
        });

        prepickedSubset.push(subs)
        console.log("subs", prepickedSubset)







    function includesIDinList(IntersectionsIDsTest){
        return IntersectionsIDsTest.includes(searchID)
    }




    async function changeAreaToAnimaton(firstOcc, IntersectionsIDsTest, source, noIntersectionsIDsTest, firstMaterial, width, depth) {

        if(firstOcc === true) {
            loader.ifcManager.removeSubset(0,  greenMaterial);
            for(let i = 0; i < IntersectionsIDsTest.length; i++){
                // if(checkedListIntersectFurnAndArea[i] === true){
                const collisionID = IntersectionsIDsTest[i]

                if (collisionID === searchID){
                    console.log("here we go", collisionID,)


                    for(let id = 0; id < areas.length; id++){

                            //labelBase.textContent = moreInfo.toString()

                        console.log("ID Position", areas[id].uuid ,collisionID)

                        if( areas[id].uuid === collisionID) {
                            console.log("hello area",  areas[id].uuid, collisionID, areas[id], ReferenceDirections[id], specificFurnIDList)
                             // Create video and play
                            //if(collisionID == )
                            let videoSource
                            for (let video = 0; video < source.length; video++){
                                if(ReferenceDirections[id].x > 0){
                                    videoSource = source[0]

                                }
                                if(ReferenceDirections[id].x < 0){
                                    videoSource = source[1]
                                }

                                if(ReferenceDirections[id].y < 0){
                                    videoSource = source[2]

                                }

                                if(ReferenceDirections[id].y > 0){
                                    videoSource = source[3]


                                }

                            }


                            const Videomaterial = videoMaterial(videoSource,  width, depth)

                            function videoMaterial(source,  width, depth){

                                let textureVid = document.createElement("video")


                                textureVid.src = source ; // transform gif to mp4
                                textureVid.loop = true;
                                textureVid.width = '900';
                                textureVid.height = '1080';
                                textureVid.play();


                                // Load video texture
                                let videoTexture = new VideoTexture(textureVid);
                                videoTexture.format = RGBFormat;

                                // videoTexture.minFilter = NearestFilter;
                                // videoTexture.maxFilter = NearestFilter;

                                videoTexture.generateMipmaps = false;
                                // videoTexture.wrapS = RepeatWrapping;
                                // videoTexture.wrapT = RepeatWrapping;
                                // //console.log(areas[id])
                                videoTexture.repeat.set(areas[id].geometry.parameters.width/width, areas[id].geometry.parameters.depth/depth)

                                // Create mesh

                                var Videomaterial = new MeshBasicMaterial( { map: videoTexture, depthTest: true, transparent: true, opacity: 0.8 } );
                                //console.log(Videomaterial, videoTexture)
                                return Videomaterial
                                //areas[id].geometry.parameters.height = allSubsetMeshes[id].geometry.boundingBox.max.y

                            }


                            // let geo = new EdgesGeometry(areas[id].geometry);
                            // let mat = new LineBasicMaterial({ color: "black", linewidth: 10 });
                            // let wireframe = new LineSegments(geo, mat);
                            // wireframe.renderOrder = 1; // make sure wireframes are rendered 2nd
                            // areas[id].add(wireframe);

                            areas[id].material = Videomaterial
                            //console.log("heigt", allSubsetMeshes[id], allSubsetMeshes[id].geometry.boundingBox.max.y, areas[id])
                            areas[id].position.set( areas[id].position.x, allSubsetMeshes[id].geometry.boundingBox.max.y,  areas[id].position.z)





                        }
                        // else if( areas[id].uuid !== collisionID) {
                        //     console.log("else if",  areas[id].uuid, collisionID)
                        //     for(let mat = 0; mat < checkedMats.length; mat++){
                        //         areas[id].material = checkedMats[id];

                        //         areas[id].position.set( areas[id].position.x, 0.0 ,  areas[id].position.z)


                        //     }
                        // }

                    }


                    // const subs = loader.ifcManager.createSubset({
                    //     modelID: model.modelID,
                    //     ids: [ searchID ],
                    //     material: secondMaterial,
                    //     scene,
                    //     removePrevious: true,
                    // });
                    // prepickedSubset.push(subs)

                } else if (collisionID !== searchID){

                        ////console.log("areaNweDel",  areaNewList)

                        //scene.remove(areaNewList[0])


                }
            }
        } else if(firstOcc === false) {

            loader.ifcManager.removeSubset(0,  secondMaterial);

            for(let k = 0; k < noIntersectionsIDsTest.length; k++){


                ////console.log("collisionID NOs", collisionID, noIntersectionsIDsFurnIntersectArea)
                // remove animationmateral
                for(let id = 0; id < areas.length; id++){

                    if( areas[id].uuid !== searchID) {
                        for(let mat = 0; mat < checkedMats.length; mat++){
                            areas[id].material = checkedMats[id];
                            areas[id].position.set( areas[id].position.x, 0.0 ,  areas[id].position.z)

                        }
                    }
                }



            }
        }

        }

}

function ShowTextPerNode(intersectionidHTML,stringID, arrayNodes ) {
    const arrayIDs = [];
    for(let a = 0; a < intersectionidHTML.length; a++){
        ////console.log(arrayNodes[a].id
        if(intersectionidHTML[a] === stringID) {

            //console.log("yes")
            for(let b = 0; b < arrayNodes.length; b++){
                ////console.log(arrayNodes[b].id)

                const arrayids = arrayNodes[b].id.toString()
                ////console.log("arrayids", arrayids)
                arrayIDs.push(arrayids)
                if(arrayids === intersectionidHTML[a] ) {
                    const index = arrayIDs.indexOf(intersectionidHTML[a])
                    ////console.log("found idindex", index)
                    arrayNodes[index].style.color = 'blue'
                    arrayNodes[index].style.visibility = 'visible'

                } else {
                    arrayNodes[b].style.visibility = 'hidden';
                }
            }

        }
    }
}



let collidingFurnIDs = [];
async function pickCheckbox(event, material, secondMaterial,Expressid ) {

    const filterRadioButtonChecked = Array.from(document.getElementsByName('noIntersection')).filter(x => x ['checked']);
        //console.log("radioButtonValue", filterRadioButtonChecked, areas, )
        const radioButtonValue = filterRadioButtonChecked[0].value
        if(radioButtonValue !== undefined) {
        //console.log("radioButtonValue",radioButtonValue)

        for (let j = 0; j < areas.length; j++) {
            let areasid = areas[j].uuid.toString();
            if( areasid === radioButtonValue){
                let zoomPosition = areas[j].position
                //console.log('zoomPosition', zoomPosition, areas[j], areas, radioButtonValue,)
                // if(zoomPosition.z < 0 && zoomPosition.x < 0) {

                //     camera.position.set(zoomPosition.x  - zoomPosition.x/2 , 1.5, zoomPosition.z - zoomPosition.z/2)
                //     //console.log("z - x-")

                // }
                // if(zoomPosition.z > 0 && zoomPosition.x < 0 ) {

                //     camera.position.set(zoomPosition.x  - zoomPosition.x/2 , 1.5, zoomPosition.z + zoomPosition.z/2)
                //     //console.log("z+ x-")

                // }
                // if(zoomPosition.z > 0 && zoomPosition.x > 0 ) {

                //     camera.position.set(zoomPosition.x  + zoomPosition.x/2 , 1.5, zoomPosition.z + zoomPosition.z/2)
                //     //console.log("z+ x+")

                // }
                if(zoomPosition.z < 0 && zoomPosition.x > 0) {
                    controls.position0.y = 2
                    camera.position.y = 10
                    camera.position.x = zoomPosition.x
                    camera.position.z = zoomPosition.z
                    controls.target.set(zoomPosition.x, zoomPosition.y, zoomPosition.z);

                    //sconsole.log("controls1", controls, camera)
                    //camera.position.set(zoomPosition.x  + zoomPosition.x/2 , 1.5, zoomPosition.z - zoomPosition.z)
                    //console.log("z - x+")

                }
                if(zoomPosition.z < 0 && zoomPosition.x < 0) {
                    controls.position0.y = 2
                    camera.position.y = 10
                    camera.position.x = zoomPosition.x
                    camera.position.z = zoomPosition.z
                    controls.target.set(zoomPosition.x , zoomPosition.y, zoomPosition.z);




                    //console.log("controls2", controls, camera,  controls.getDistance())
                    //camera.position.set(zoomPosition.x  + zoomPosition.x/2 , 1.5, zoomPosition.z - zoomPosition.z)
                    //console.log("z - x-")

                }



            }
        }

    }



};

let searchedID
async function pickByIDClick(event, material, secondMaterial,Expressid ) {

    collisionColorShow(checkedListIntersectFurnAndArea, indicesIntersectFurnAndArea)
    collisionColorShow(checkedListIntersectAreaAndFurn, indicesIntersectAreaAndFurn)

    function collisionColorShow(checkedListIntersectFurnAndArea, indicesIntersectFurnAndArea){
        //console.log(Expressid, collidedIDs, checkedListIntersectFurnAndArea)

        const searchID = Expressid[0]

        // const ifcElement = await loader.ifcManager.getItemProperties(model.modelID, searchID)
        // //console.log(ifcElement)

        for(let i = 0; i < checkedListIntersectFurnAndArea.length; i++){
            if(checkedListIntersectFurnAndArea[i] === true){
                const collisionID = allSubsetMeshes[indicesIntersectFurnAndArea[i][0]].uuid
                ////console.log("collisionid", collisionID)
                if (collisionID === searchID){

                    //console.log("here we go", collisionID, searchID, indicesIntersectFurnAndArea[i])

                    collidingFurnIDs.push(allSubsetMeshes[indicesIntersectFurnAndArea[i][1]].uuid)
                    //console.log("collidingFurnIDs",collidingFurnIDs )

                    for ( let idmesh = 0; idmesh < collidingFurnIDs.length; idmesh++){
                        const sub = loader.ifcManager.createSubset({
                            modelID: model.modelID,
                            ids: [ collidingFurnIDs[idmesh] ],
                            material: new MeshBasicMaterial({color: 'blue', transparent: true,  opacity: 0.5, depthTest: false}),
                            scene,
                            removePrevious: true,
                        });
                        foundSubsets.push(sub)
                        //foundSubsetsID.push(id)
                    }
                    //collidingFurnIDs.forEach(generateSubsetWithID)
                    //console.log("foundSubsets", foundSubsets)
                    generateSubsetWithIDred(searchID)


                }
            }


        }

        for(let i = 0; i < checkedListAreaIntersectWall.length; i++){
            if(checkedListAreaIntersectWall[i] === true){
                const collisionID = allSubsetMeshes[indicesIntersectAreaAndWall[i][0]].uuid
                //console.log("collisionid wall", collisionID)
                if (collisionID === searchID){

                    //console.log("here we go walls", collisionID, searchID, indicesIntersectAreaAndWall[i], wallSubsetMeshesNew)

                    collidingFurnIDs.push(wallSubsetMeshes[indicesIntersectAreaAndWall[i][1]].uuid)
                    //console.log("collidingFurnIDs",collidingFurnIDs )

                    for ( let idmesh = 0; idmesh < collidingFurnIDs.length; idmesh++){
                        const sub = loader.ifcManager.createSubset({
                            modelID: model.modelID,
                            ids: [ collidingFurnIDs[idmesh] ],
                            material: new MeshBasicMaterial({color: 'blue', transparent: true,  opacity: 0.5, depthTest: false}),
                            scene,
                            removePrevious: true,
                        });
                        foundSubsets.push(sub)
                        //foundSubsetsID.push(id)
                    }
                    //collidingFurnIDs.forEach(generateSubsetWithID)
                    //console.log("foundSubsets", foundSubsets)
                    generateSubsetWithIDred(searchID)


                }
            }


        }
        searchedID = searchID

        if(searchID !== searchedID) {
            foundSubsets = []
        }


    }


};

let foundSubsets = [];
let foundSubsetsID = [];
let redSubset = [];

function generateSubsetWithIDred(id) {
    //console.log("id", id)
    const sub = loader.ifcManager.createSubset({
        modelID: model.modelID,
        ids: [ id ],
        material: new MeshBasicMaterial({color: orangeColor, transparent: true,  opacity: 0.5, depthTest: false}),
        scene,
        removePrevious: true,
    });

    foundSubsets.push(sub)
    foundSubsetsID.push(id)
    redSubset.push(sub)
}

function removeSubsetAndGetOriginalMaterials(checkedListIntersectFurnAndArea, foundSubsets, indicesIntersectFurnAndArea, index) {
    for(let i = 0; i < checkedListIntersectFurnAndArea.length; i++){
        for(let k = 0; k < foundSubsets.length; k++){
            foundSubsets[k].material = allSubsetMeshes[indicesIntersectFurnAndArea[i][index]].material
        }

        foundSubsets.length = 0
        foundSubsets = []
        foundSubsetsID = []
        redSubset = []
        collidingFurnIDs = []
        prepickedSubset.length = 0
    }
}

//---------------------------------------------------------------------------------
//-------------------------Select every single furniture --------------------------
//---------------------------------------------------------------------------------
function activatePopUpMenu (input, activateButton) {
    const closeTab = document.getElementById('Check');
    closeTab.style.visibility = 'hidden'

    const containerTab = document.getElementById('programmFurniture');

        const divElement = document.createElement('div');
        divElement.id = `${input[0]}-1`;
        divElement.classList.add('modal');
        containerTab.appendChild(divElement)

        // activateButton.onclick = (event) => {
            //console.log('clicked')
            const modalBackround = document.getElementById(`${input[0]}-1`)
            modalBackround.style.display ='block';
            checkBtn.style.visibility = 'hidden'

        // }

        //containerTab.appendChild(activateButton)


    //     const popup = document.createElement('span');
    //     popup.innerText = 'x';
    //     popup.classList.add('close');
    //     popup.title = 'Close Modal';

    //     popup.onclick = () => {
    //         const modalBackround = document.getElementById(`${input[0]}-1`)
    //         modalBackround.style.display='none';
    //    }

    //    divElement.appendChild(popup)

       const formElement = document.createElement('form');
       formElement.classList.add('modal-content');
       formElement.action = '/action_page.php';

       divElement.appendChild(formElement)

       const formContent = document.createElement('div');
       formContent.classList.add('containerForm');


       const heading = document.createElement('p');
       heading.innerText = `Gibt es ein/e ${input[0]}?`

       const decision = document.createElement('div');
       decision.classList.add('clearfix');

       const yesBtn = document.createElement('button');
       yesBtn.type = 'button';
       yesBtn.classList.add('buttonsArea')
       yesBtn.style.backgroundColor = 'darkgrey'
       yesBtn.innerText = 'ja'
       yesBtn.id = 'trueBtn'

       let clicked

       yesBtn.onclick= () => {
            const modalBackround = document.getElementById(`${input[0]}-1`)
            modalBackround.style.display='none';
            clicked = false
            return clicked

        }
        // const noBtn = document.createElement('button');
        // noBtn.type = 'button';
        // noBtn.classList.add('buttonsArea')
        // noBtn.innerText = 'nein'
        // noBtn.id = 'falseBtn'

        // noBtn.onclick= () => {
        //     const modalBackround = document.getElementById(`${input[0]}-1`)
        //     modalBackround.style.display='none';
        //     clicked = false
        //     return clicked

        // }

        const noBtn = document.createElement('button');
        noBtn.type = 'button';
        noBtn.classList.add('buttonsArea')
        noBtn.innerText = 'nein'
        noBtn.id = 'falseBtn'

        noBtn.onclick= () => {
            const modalBackround = document.getElementById(`${input[0]}-1`)
            modalBackround.style.display='none';
            clicked = false

            specificFurnIDList.push({ key: `${input[0]}`, value: 0 })
            return clicked

        }

       formContent.appendChild(heading)
       formContent.appendChild(decision)
       decision.appendChild(yesBtn)
       decision.appendChild(noBtn)
       formElement.appendChild(formContent)



        document.querySelectorAll('button').forEach(occurence => {
            let id = occurence.getAttribute('id');
            occurence.addEventListener('click', async function() {

            if(id === 'trueBtn'){

                //console.log('A button with ID ' + id + ' was clicked!')
                const buttonTxt = document.getElementById('programmFurniture')
                //console.log(buttonTxt)
                buttonTxt.innerText = `Klicke ein/e ${input[0]} jetzt an...` ;

                var bedtest = document.getElementById(`${input[0]}`)
                bedtest.checked = true
                //console.log("bedtest", bedtest)


            }
             else if(id === 'falseBtn') {


                input.shift()
                //console.log("newInput", input)

                if(input.length >= 1 ){
                    checkBtn.style.visibility = 'visible'
                    //console.log('A button with ID ' + id + ' was clicked!')
                    const buttonTxt = document.getElementById('programmFurniture')
                    buttonTxt.innerText = `Kein/e ${input[0]}.` ;

                    var bedtest = document.getElementById(`${input[0]}`)
                    bedtest.checked = false
                    //console.log("bedtest else", bedtest)

                    activatePopUpMenu(input, checkBtn);
                }

            }



        })

    })
    // // Get the modal
    // var modal = document.getElementById(`${input}-1`);

    // // When the user clicks anywhere outside of the modal, close it
    // window.onclick = function(event) {
    //     if (event.target == modal) {
    //     modal.style.display = "none";
    //     }
    // }

}





// Gets the id of all the items of a specific category (per category one array with all ids)


const wallSubsetMeshesStartPositions = [];

const resetPositionsWall = [];

function generateWallsAsMesh(wall, wallDimensionsX, wallDimensionsY, idsWalls){


    const a = wall;
    //console.log("wallDirection",idsWalls[a],  wallDirection)
    const wallCopy = new BoxGeometry(wallDimensionsX[a] - 0.01, 3, wallDimensionsY[a]-0.01)
    const wallMesh = new Mesh(
        wallCopy,
        new MeshBasicMaterial({color: 'grey', transparent: true, opacity: 0.5})

    )

    const wallSphere = new SphereGeometry(0.4)
    const wallMeshSphere = new Mesh(
        wallSphere,
        new MeshBasicMaterial({color: 'orange', transparent: true, opacity: 0.5})

    )

    const wallMeshSphereTwo = new Mesh(
        wallSphere,
        new MeshBasicMaterial({color: 'purple', transparent: true, opacity: 0.5})

    )



    //console.log("        wall", wallMesh,  wallMesh.position, wallDimensionsX[a], wallDimensionsY[a], wallPlacements[a], wallDirection)


    if(wallDirection[a].x === 1) {
        console.log("x = 1")
        wallMesh.position.set(wallPlacements[a].x + wallDimensionsX[a]/2, 1.5, -wallPlacements[a].z )
        computeWallBB(wallMesh)
        wallMesh.uuid = idsWalls[wall]

        wallSubsetMeshesStartPositions.push(wallMesh.position)
        resetPositionsWall.push(new Vector3(wallPlacements[a].x + wallDimensionsX[a]/2, 1.5, -wallPlacements[a].z ))

        // wallMesh.add(wallMeshSphere);
        // wallMesh.add(wallMeshSphereTwo);

        const wallSize = wallBounds[a].getSize(new Vector3())

        wallMeshSphere.position.set(wallSize.x/2, 0, 0)
        wallMeshSphereTwo.position.set(-wallSize.x/2, 0, 0)
        console.log("wallSIIIIZe", wallSize, wallMeshSphere.position, wallMeshSphereTwo.position)

        wallSubsetMeshes.push(wallMesh)


    }
    if(wallDirection[a].x === -1) {
        console.log("x = -1")
        wallMesh.position.set(wallPlacements[a].x - wallDimensionsX[a]/2, 1.5, -wallPlacements[a].z )
        computeWallBB(wallMesh)
        wallMesh.uuid = idsWalls[wall]

        wallSubsetMeshesStartPositions.push(wallMesh.position)
        resetPositionsWall.push(new Vector3(wallPlacements[a].x - wallDimensionsX[a]/2, 1.5, -wallPlacements[a].z ))

        // wallMesh.add(wallMeshSphere);
        // wallMesh.add(wallMeshSphereTwo);

        const wallSize = wallBounds[a].getSize(new Vector3());

        wallMeshSphere.position.set(wallSize.x/2, 0, 0)
        wallMeshSphereTwo.position.set(-wallSize.x/2, 0, 0)
        console.log("wallSIIIIZe", wallSize, wallMeshSphere.position, wallMeshSphereTwo.position)

        wallSubsetMeshes.push(wallMesh)

    }
    if(wallDirection[a].y === 1) {
        console.log("y = 1")
        wallMesh.position.set(wallPlacements[a].x  , 1.5, -wallPlacements[a].z - wallDimensionsX[a]/2 )
        wallMesh.rotateY(Math.PI/2)
        computeWallBB(wallMesh)
        wallMesh.uuid = idsWalls[wall]

        wallSubsetMeshesStartPositions.push(wallMesh.position)
        resetPositionsWall.push(new Vector3(wallPlacements[a].x  , 1.5, -wallPlacements[a].z - wallDimensionsX[a]/2 ))

        // wallMesh.add(wallMeshSphere);
        // wallMesh.add(wallMeshSphereTwo);

        const wallSize = wallBounds[a].getSize(new Vector3());

        wallMeshSphere.position.set(wallSize.z/2, 0, 0)
        wallMeshSphereTwo.position.set(-wallSize.z/2, 0,0)
        console.log("wallSIIIIZe", wallSize, wallMeshSphere.position, wallMeshSphereTwo.position)

        wallSubsetMeshes.push(wallMesh)
    }
    if(wallDirection[a].y === -1) {
        console.log("y = -1")
        wallMesh.position.set(wallPlacements[a].x  , 1.5, -wallPlacements[a].z + wallDimensionsX[a]/2 )
        wallMesh.rotateY(Math.PI/2)
        computeWallBB(wallMesh)
        wallMesh.uuid = idsWalls[wall]

        wallSubsetMeshesStartPositions.push(wallMesh.position)
        resetPositionsWall.push(new Vector3(wallPlacements[a].x  , 1.5, -wallPlacements[a].z + wallDimensionsX[a]/2 ))

        // wallMesh.add(wallMeshSphere);
        // wallMesh.add(wallMeshSphereTwo);

        const wallSize = wallBounds[a].getSize(new Vector3());

        wallMeshSphere.position.set(wallSize.z/2, 0, 0)
        wallMeshSphereTwo.position.set(-wallSize.z/2, 0, 0)

        console.log("wallSIIIIZe", wallSize, wallMeshSphere.position, wallMeshSphereTwo.position)

        wallSubsetMeshes.push(wallMesh)
    }


    // for( let k = 0; k < wallSubsetMeshes.length; k++){
    //     scene.add(wallSubsetMeshes[k])
    // }
    // for(let id = 0; id < idsFill.length; id++){

    //     addingOpeningsToWall(id)

    // }


    // for(let i = 0; i < wallBounds.length; i++){

    //     const sizelastwallBB = wallBounds[i].getSize(new Vector3())
    //     const centerlastwallBB = wallBounds[i].getCenter(new Vector3())

    //     console.log("BB", wallBounds[i], sizelastwallBB)

    //     const wallSphere = new SphereGeometry(0.4)
    //     const wallMeshSphere = new Mesh(
    //         wallSphere,
    //         new MeshBasicMaterial({color: 'brown', transparent: true, opacity: 0.5})

    //     )
    //     //wallMeshSphere.position.set(centerlastwallBB.x + sizelastwallBB.x/2, 0, centerlastwallBB.z + sizelastwallBB.z/2)

    //     console.log("posititi", wallMeshSphere.position, wallSubsetMeshes[i].position, wallMeshSpheres[i].position)
    //     wallSubsetMeshes[i].add(wallMeshSphere)
    //     wallMeshSphere.position.set(wallSubsetMeshes[i].position.x - wallMeshSpheres[i].position.x, wallMeshSpheres[i].position.y, wallSubsetMeshes[i].position.z - wallMeshSpheres[i].position.z)




    // }




}
let idsOpenings;
let idsFill;
let openings;
async function getAllFurniture() {
    const idsFurn= await loader.ifcManager.getAllItemsOfType(0, IFCFURNISHINGELEMENT, false);
    const idsSanitary = await loader.ifcManager.getAllItemsOfType(0, IFCFLOWTERMINAL, false);


    const idsWalls = await loader.ifcManager.getAllItemsOfType(0, IFCWALLSTANDARDCASE, false);
    //console.log(idsWalls)


    idsOpenings = await loader.ifcManager.getAllItemsOfType(0, IFCRELVOIDSELEMENT, true);
    console.log("idsopenings", idsOpenings)
    const idsOpeningElement = await loader.ifcManager.getAllItemsOfType(0, IFCOPENINGELEMENT, true);
    console.log("idsopenElem", idsOpeningElement)



    idsFill = await loader.ifcManager.getAllItemsOfType(0, IFCRELFILLSELEMENT, true);
    console.log("idsopen", idsFill[0].RelatedBuildingElement, idsFill)

    // RelatedOpeningELem id dann bei relvoidseken rekatedOPeningELem === RelatedOpeningELem id -> RelatedBuildongelement  = id wall

    const doors = await loader.ifcManager.getAllItemsOfType(0, IFCDOOR, false);
    console.log("door", doors, )
    const window = await loader.ifcManager.getAllItemsOfType(0, IFCWINDOW, false);
    console.log("window", window, )

    openings = doors.concat(window)
    console.log("allOpenings", openings)



    wallSubsetMeshesIDs.push(idsWalls)



    allIDsInChecker = idsFurn.concat(idsSanitary, idsWalls)
    for(let id = 0; id < idsFill.length; id++){
        for(let i = 0; i < openings.length; i++){
            if(idsFill[id].RelatedBuildingElement.value === openings[i]){
                console.log("found this openings", idsFill[id].RelatedBuildingElement.value,openings[i] )
                const openingSubs = loader.ifcManager.createSubset({
                    modelID: 0,
                    ids: [openings[i]],
                    scene,
                    removePrevious: true,
                    material: new MeshBasicMaterial({color: 'grey', depthTest: false, transparent: true, opacity: 0.7}),
                    customID: [openings[i]].toString()
                });


                scene.add(openingSubs)

                openingSubs.uuid = openings[i];
                allOpeningsMeshes.push(openingSubs)
                
                
            
            }
        }
       //addingOpeningsToWall(id)

    }

    //console.log("allIDsInChecker", allIDsInChecker)

    for(let wall = 0; wall < idsWalls.length; wall++){
        const wallRepresentation = await loader.ifcManager.getItemProperties(0, idsWalls[wall], true)

        const sweptArea = wallRepresentation.Representation.Representations[1].Items[0].SweptArea
        const xValueWall = sweptArea.XDim.value
        const yValueWall = sweptArea.YDim.value
        //console.log("wallRep", xValueWall, yValueWall, wallRepresentation)
        wallDimensionsX.push(xValueWall)
        wallDimensionsY.push(yValueWall)


        const wallRels = await loader.ifcManager.getItemProperties(0, idsWalls[wall],true)
        // const direction = sweptArea.Position.RefDirection.DirectionRatios
        // const XDir = direction[0].value
        // const YDir = direction[1].value
        // //console.log("X udn Y Dir", XDir, YDir)
        console.log(wallRels)

        const wallObjectPlacement = wallRepresentation.ObjectPlacement.RelativePlacement.Location.Coordinates
        const wallplacementX = wallObjectPlacement[0].value
        const wallplacementY = wallObjectPlacement[1].value
        const wallplacementZ = wallObjectPlacement[2].value
        console.log("position wall", wallplacementX, wallplacementY, wallplacementZ)
        const placement = new Vector3(wallplacementX, wallplacementZ, wallplacementY)

        const wallSphere = new SphereGeometry(0.1)
        const wallMeshSphere = new Mesh(
            wallSphere,
            new MeshBasicMaterial({color: 'blue', transparent: true, opacity: 0.0})

        )
        wallMeshSphere.position.set(placement.x, placement.y, -placement.z)
        scene.add(wallMeshSphere)

        wallPlacements.push(placement)
        wallMeshSpheres.push(wallMeshSphere)

        const ReferenceDir = wallRepresentation.ObjectPlacement.RelativePlacement.RefDirection
        if(ReferenceDir == null) {

            const wallrefDirNull = new Vector3(1, 0 , 0)
            //  //console.log(refDirNull)
            wallDirection.push(wallrefDirNull)
            //console.log("null Ref")
        }
        if(ReferenceDir!== null) {
            //console.log("ReferenceDirAAA", ReferenceDir.DirectionRatios)
            const refDirVector = new Vector3(ReferenceDir.DirectionRatios[0].value, ReferenceDir.DirectionRatios[1].value, ReferenceDir.DirectionRatios[2].value)
            wallDirection.push(refDirVector)
        }



        const placementSweptArea = wallRepresentation.Representation.Representations[1].Items[0].SweptArea.Position.Location.Coordinates


        generateWallsAsMesh(wall, wallDimensionsX, wallDimensionsY, idsWalls)


        for(let id = 0; id < idsFill.length; id++){
            addingOpeningsToWall(id);
        }

}

    console.log("allOPeningMesh", allOpeningsMeshes, wallSubsetMeshes)
    for (let i = 0; i < wallSubsetMeshes.length; i++){
        wallIDToOpenings.push( wallSubsetMeshes[i].children)

    }
// for(let id = 0; id < idsFill.length; id++){
//     for (let i = 0; i < wallSubsetMeshes.length; i++){

//         for(let j = 0; j < idsOpenings.length; j++){
//             if(idsFill[id].RelatingOpeningElement.value === idsOpenings[j].RelatedOpeningElement.value){
//                 console.log("related wall id:",idsOpenings[j].RelatingBuildingElement.value, idsOpenings[j].RelatedOpeningElement.value, wallSubsetMeshes, wallMeshSpheres, wallSubset )


//                     if(wallSubset[i].uuid === idsOpenings[j].RelatingBuildingElement.value){
//                         wallSubset[i].add(allOpeningsMeshes[j])

//                 }
//             }

//         }
//     }
// }








    ids = idsSanitary.concat(idsFurn)

    //console.log(ids)
    idsElementsForCheck.push(ids)
    idsSanitaryList.push(idsSanitary)
    idsFurnitureList.push(idsFurn)
    for (let furniture = 0; furniture <ids.length; furniture++ ){
        // every single furniture Mesh gets his own subset with different color
        const id = ids[furniture]

        furnitureSubset = loader.ifcManager.createSubset({
            modelID: 0,
            ids: [id],
            scene,
            removePrevious: true,
            customID: [id].toString()
        });

        furnitureSubset.position.set(0 , 0, 0)


        //scene.remove(furnitureSubset)
        //console.log("furnitsub", furnitureSubset)

        // let geo = new EdgesGeometry(furnitureSubset.geometry);
        // let mat = new LineBasicMaterial({ color: "black", linewidth: 10 });
        // let wireframe = new LineSegments(geo, mat);
        // wireframe.renderOrder = 1; // make sure wireframes are rendered 2nd
        // scene.add(wireframe);

        furnitureSubset.geometry.computeBoundsTree()
        //computeBoundsTree()

        let furnitureBB = new Box3(new Vector3(), new Vector3())
        furnitureBB.copy(furnitureSubset.geometry.boundingBox)
        furnitureSubset.updateMatrixWorld(true)


        furnitureBB.applyMatrix4(furnitureSubset.matrixWorld)

        const sizeFurnBB = furnitureBB.getSize(new Vector3())
        //console.log("sizeFurnBB", sizeFurnBB)
        furnSizes.push(sizeFurnBB)

        //scene.add(boxhelper)




        //furnitureBB.setFromObject(furnitureSubset)
        let centerPtFurniture = furnitureSubset.geometry.boundingBox.getCenter(new Vector3())
        //console.log("furnitureBB", furnitureBB ,centerPtFurniture)
        centerPoints.push(centerPtFurniture)

        subsetBoundingBoxes.push(furnitureBB)
        //boundingCubes.push(furnitureBB)

        allSubsetMeshes.push(furnitureSubset)
    }




    ////console.log("furnituresub", allSubsetMeshes)
    for(let i = 0; i < allSubsetMeshes.length; i++){
        delete allSubsetMeshes[i].uuid
        allSubsetMeshes[i].uuid = ids[i]





    }

    // spheres around the center of the Furnitures
    for ( let point = 0; point < centerPoints.length; point++){
        const geom1 = new SphereGeometry(0.003)
        const centerSphere = new Mesh(
            geom1,
            new MeshPhongMaterial({color: 0x00ffff, transparent:true, opacity: 0.0})
        )
        centerSphere.position.set(centerPoints[point].x, centerPoints[point].y, centerPoints[point].z)
        //scene.add(centerSphere)


        //movement areas random

        const areaRandom = new BoxGeometry(furnSizes[point].x,0.005,furnSizes[point].z)
        const areaRandomMesh = new Mesh(
            areaRandom,
            new MeshBasicMaterial({color: 'lightgrey'
                , transparent: true, opacity: 0.6})

        )

        areaRandomMesh.position.set(centerPoints[point].x, 0, centerPoints[point].z)
        allSubsetMeshes[point].add(centerSphere)
        //allSubsetMeshes[point].add(areaRandomMesh)


        areaMeshes.push(areaRandomMesh)


        areaMeshes[point].uuid = allSubsetMeshes[point].uuid





    }


}
const allOpeningsAdded = [];
const wallIDToOpenings = [];
function addingOpeningsToWall(id){
    for(let j = 0; j < idsOpenings.length; j++){
        if(idsFill[id].RelatingOpeningElement.value === idsOpenings[j].RelatedOpeningElement.value){
            console.log("related wall id:",idsOpenings[j].RelatingBuildingElement.value, idsOpenings[j].RelatedOpeningElement.value, wallSubsetMeshes, wallMeshSpheres, idsOpenings )

            for( let wallid = 0; wallid < wallSubsetMeshes.length; wallid++){
                if(wallSubsetMeshes[wallid].uuid === idsOpenings[j].RelatingBuildingElement.value){
                    //wallMeshSpheres[wallid].add(allOpeningsMeshes[j])

                    // if(wallMeshSpheres[wallid].position.x > 0) {
                    //     allOpeningsMeshes[j].position.set(wallMeshSpheres[wallid].position.x,-wallMeshSpheres[wallid].position.y, -wallMeshSpheres[wallid].position.z)

                    // }

                        allOpeningsMeshes[j].position.set(-wallMeshSpheres[wallid].position.x,-wallMeshSpheres[wallid].position.y, -wallMeshSpheres[wallid].position.z)
                        allOpeningsMeshes[j].rotation.set(-wallSubsetMeshes[wallid].rotation.x, -wallSubsetMeshes[wallid].rotation.y, -wallSubsetMeshes[wallid].rotation.z)

                    //positionsOpeningsElements[j].x , positionsOpeningsElements[j].y, positionsOpeningsElements[j].z
                    console.log("position", allOpeningsMeshes[j].position, idsFill)

                    if(wallDirection[wallid].y === 1){
                        console.log("y1")
                        //if(wallSubsetMeshes[wallid].position.x > 0){
                           // allOpeningsMeshes[j].rotation.set(wallSubsetMeshes[wallid].rotation.x, wallSubsetMeshes[wallid].rotation.y, wallSubsetMeshes[wallid].rotation.z)
                            //(new Vector3(0,1,0),  Math.PI/2)
                            allOpeningsMeshes[j].position.set(wallSubsetMeshesStartPositions[wallid].z,-wallSubsetMeshesStartPositions[wallid].y, -wallSubsetMeshesStartPositions[wallid].x)
                            wallSubsetMeshes[wallid].add(allOpeningsMeshes[j])
                        //}
                        //if(wallSubsetMeshes[wallid].position.x < 0){
                            // console.log("neh",allOpeningsMeshes[j], wallSubsetMeshes[wallid], j )

                            // allOpeningsMeshes[6].rotateOnAxis(new Vector3(0,1,0),2* Math.PI)
                            // wallSubsetMeshes[wallid].add(allOpeningsMeshes[6], )

                            // allOpeningsMeshes[7].rotateOnAxis(new Vector3(0,1,0), Math.PI/2)
                            // wallSubsetMeshes[wallid].add(allOpeningsMeshes[7])
                            // allOpeningsMeshes[j].rotateOnAxis(new Vector3(0,1,0), Math.PI/2)
                            // allOpeningsMeshes[j].position.set(wallSubsetMeshesStartPositions[wallid].z,-wallSubsetMeshesStartPositions[wallid].y, -wallSubsetMeshesStartPositions[wallid].x)
                        //    allOpeningsAdded.push(allOpeningsMeshes[j])
                        //wallIDToOpenings.push(wallSubsetMeshes[wallid])
                        console.log("positionAdd", allOpeningsMeshes[j].position)

                        // }




                        //allOpeningsMeshes[j].position.set(centerWall.z, -1.5 , -centerWall.x)
                    }
                    if(wallDirection[wallid].y === -1){
                        console.log("y-1", wallSubsetMeshesStartPositions[wallid], wallSubsetMeshes[wallid], allOpeningsMeshes[j])
                        allOpeningsMeshes[j].position.set(wallSubsetMeshesStartPositions[wallid].z,-wallSubsetMeshesStartPositions[wallid].y, -wallSubsetMeshesStartPositions[wallid].x)

                        wallSubsetMeshes[wallid].add(allOpeningsMeshes[j])
                        //allOpeningsMeshes[j].rotation.set(wallSubsetMeshes[wallid].rotation.x, wallSubsetMeshes[wallid].rotation.y, wallSubsetMeshes[wallid].rotation.z)

                        //allOpeningsMeshes[j].rotateOnAxis(new Vector3(0,1,0), 3*Math.PI/2)
                        // allOpeningsAdded.push(allOpeningsMeshes[j])
                        //wallIDToOpenings.push(wallSubsetMeshes[wallid])
                        // allOpeningsMeshes[j].position.set(centerWall.z, -1.5 , -centerWall.x)
                        console.log("positionAdd", allOpeningsMeshes[j].position)

                    }
                    if(wallDirection[wallid].x === 1 ){
                        console.log("x1")
                        //allOpeningsMeshes[j].position.set(-centerWall.x, -centerWall.y, -centerWall.z)
                        allOpeningsMeshes[j].rotation.set(wallSubsetMeshes[wallid].rotation.x, wallSubsetMeshes[wallid].rotation.y, wallSubsetMeshes[wallid].rotation.z)
                        allOpeningsMeshes[j].position.set(-wallSubsetMeshesStartPositions[wallid].x,-wallSubsetMeshesStartPositions[wallid].y, -wallSubsetMeshesStartPositions[wallid].z)

                        wallSubsetMeshes[wallid].add(allOpeningsMeshes[j])
                        // allOpeningsAdded.push(allOpeningsMeshes[j])
                        //wallIDToOpenings.push(wallSubsetMeshes[wallid])

                        console.log("positionAdd", allOpeningsMeshes[j].position)

                    }
                    if( wallDirection[wallid].x === -1){
                        console.log("x-1")
                        //allOpeningsMeshes[j].position.set(-centerWall.x, -centerWall.y, -centerWall.z)

                        allOpeningsMeshes[j].rotation.set(wallSubsetMeshes[wallid].rotation.x, wallSubsetMeshes[wallid].rotation.y, wallSubsetMeshes[wallid].rotation.z)
                        allOpeningsMeshes[j].position.set(-wallSubsetMeshesStartPositions[wallid].x,-wallSubsetMeshesStartPositions[wallid].y, -wallSubsetMeshesStartPositions[wallid].z)

                        wallSubsetMeshes[wallid].add(allOpeningsMeshes[j])
                       // allOpeningsAdded.push(allOpeningsMeshes[j])
                        //wallIDToOpenings.push(wallSubsetMeshes[wallid])
                        console.log("positionAdd", allOpeningsMeshes[j].position)

                    }


                }
            }
        }

    }
}

function computeWallBB(wallMesh) {
    wallMesh.geometry.computeBoundsTree()

    let wallBB = new Box3(new Vector3(), new Vector3())
    wallBB.copy(wallMesh.geometry.boundingBox)
    wallMesh.updateMatrixWorld(true)


    wallBB.applyMatrix4(wallMesh.matrixWorld)

    // const sizeFurnBB = wallBB.getSize(new Vector3())
    // console.log("sizeWallBB", sizeFurnBB)

    const center = new Vector3(0,0,0);
    centerWall = wallBB.getCenter(center);
    console.log("centerWall", centerWall)

    const wallSphere = new SphereGeometry(0.4)
    const wallMeshSphere = new Mesh(
        wallSphere,
        new MeshBasicMaterial({color: 'green', transparent: true, opacity: 0.5})

    )
    wallMeshSphere.position.set(centerWall.x, centerWall.y, centerWall.z)
    //scene.add(wallMeshSphere)

    wallCenterPoints.push(centerWall)
    console.log("wallCenterPoints", wallCenterPoints)
    //furnSizes.push(sizeFurnBB)
    const boxhelper = new BoxHelper(wallMesh, 0x000000)
    //scene.add(boxhelper)

    wallBounds.push(wallBB)



    // //wallBB.setFromObject(wallMesh)
    // let centerPtFurniture = wallMesh.geometry.boundingBox.getCenter(new Vector3())
    // //console.log("wallBB", wallBB ,centerPtFurniture)
    // centerPoints.push(centerPtFurniture)

    // subsetBoundingBoxes.push(wallBB)
    // //boundingCubes.push(wallBB)
    // allSubsetMeshes.push(wallMesh)
}


//GREY MODELL
async function getSpecificSubset(entity, material) {
    const subsetMesh = []
    const ids = await loader.ifcManager.getAllItemsOfType(0, entity, false);

    for (let entity = 0; entity < ids.length; entity++ ){
        // every single entity Mesh gets his own subset with different color
        const id = ids[entity]

        entitySubset = loader.ifcManager.createSubset({
            modelID: 0,
            ids: [id],
            scene,
            removePrevious: true,
            material: material,
            customID: [id].toString()
        });
        subsetMesh.push(entitySubset)
        //return entitySubset
    }
    return subsetMesh

}
const doorSub = [];
const windowSub = [];
const slabSub = [];

async function allElements(){

    const walls = await getSpecificSubset(IFCWALLSTANDARDCASE, hidedObjectMaterial)
    doorSub.push(await getSpecificSubset(IFCDOOR, hidedObjectMaterial))
    windowSub.push(await getSpecificSubset(IFCWINDOW, hidedObjectMaterial))


    console.log(walls, wallSubsetMeshes)
    for (let i = 0; i < wallSubsetMeshes.length; i++){
        walls[i].uuid = wallSubsetMeshes[i].uuid

        // walls[i].position.set(-wallSubsetMeshes[i].position.x,-wallSubsetMeshes[i].position.y, -wallSubsetMeshes[i].position.z )
        // walls[i].rotation.set(-wallSubsetMeshes[i].x,-wallSubsetMeshes[i].y, -wallSubsetMeshes[i].z )

        //wallSubsetMeshes[i].add( walls[i])
        // for(let id = 0; id < idsFill.length; id++){

        //     addingOpeningsToWall(id)

        // }

        //scene.remove(walls[i])
    }
    wallSubset = walls
    console.log("wallSubset", wallSubset)



    //console.log(`doors`, doors)
    //await getSpecificSubset(IFCSLAB)

    await getSpecificSubset(IFCPLATE, hidedObjectMaterial)
    await getSpecificSubset(IFCMEMBER, hidedObjectMaterial)
    slabSub.push(await getSpecificSubset(IFCSLAB, slabMaterial))




}

// getAllPositionsFurniture(furnitureMeshes)
// function getAllPositionsFurniture(furnitureMeshes) {
//     for(let i = 0; i < allids.length; i++){
//         //const coords = await coordinatesFurniture(allids[i])
//         //console.log("coords", allids[i])
//     }
//     //console.log( furnitureMeshes)
// }


// // pick furniture
async function pickFurniture(event, material ,furnitureMeshes ) {
    console.log("pickFurniture")
    const found = castObjects(event, furnitureMeshes)[0];
    //console.log("found Mesh", found)


    if(found) {
        if(furnituremodeIsActive === true || checkedBtnmodeIsActive === true) {
            //console.log("hello beauty")
            checkBtn.style.visibility = 'visible'
        } else {
            checkBtn.style.visibility = 'hidden'
        }

        const index = found.faceIndex;
        //console.log("index", index)
        lastFurnitureFound = found.object;

        const geometry = found.object.geometry;


        console.log("geometry", geometry, geometry.uuid,found.object)

        const gumballPosition =  gumball.position.set(found.point.x,found.point.y, found.point.z)
        ////console.log("gumballPosition", gumballPosition)

        // Id which collided with raycaster
        const ifc = loader.ifcManager;
        const id = ifc.getExpressId(geometry, index );
        //console.log("id", found.object.id, id, found.object.modelID)

        delete geometry.uuid
        geometry.uuid = id
        //console.log("geometry2", geometry, geometry.uuid)


        gumball.attach(lastFurnitureFound)

        ////console.log(gumball.position)
        scene.add(gumball)

        gumball.position.set(gumballPosition.x - lastFurnitureFound.position.x, gumballPosition.y, gumballPosition.z - lastFurnitureFound.position.z)


        const coords = await coordinatesFurniture(id)
        ////console.log(coords)
        //console.log("startPositionFurniture", startPositionFurniture)

        indexFound = furnitureMeshes.indexOf(found.object)
        const modifiedCenter = new Vector3(centerPoints[indexFound].x, centerPoints[indexFound].y-centerPoints[indexFound].y, centerPoints[indexFound].z)

        //console.log("indexfound", indexFound, centerPoints, centerPoints[indexFound], )
       await generateAreasOnClick(indexFound, modifiedCenter, lastFurnitureFound)

}




}
async function generateAreasOnClick(indexFound, modifiedCenter, lastFurnitureFound){


    let area


    var bed = document.getElementById('Bett').checked
    var kitchen = document.getElementById('Küchenzeile').checked
    var toilet = document.getElementById('WC').checked
    var sink = document.getElementById('Waschtisch').checked
    var tube = document.getElementById('Badewanne').checked
    var shower = document.getElementById('Dusche').checked


    let lastFurnitureFoundBB = new Box3(new Vector3(), new Vector3())
    lastFurnitureFoundBB.setFromObject(lastFurnitureFound)
    lastFurnitureFoundBB.copy( lastFurnitureFound.geometry.boundingBox).applyMatrix4(lastFurnitureFound.matrixWorld)

    const sizeBB = lastFurnitureFoundBB.getSize(new Vector3())
    //console.log("lastBB",sizeBB )


    async function setSpecificArea(checkboxID, width, length ){


        if(checkboxID){

            area = await generateAreaFurniture(width, length, modifiedCenter)
            scene.add(area)
            areaMeshes.splice(indexFound, 1,  area)
            for(let i = 0; i <areaMeshes.length; i++){
                ReferencePositionAreas.push(area.position)
            }



        }


        return area
    }




    async function positionFurnitureArea( rotate, checkboxID, width, length, positionX, positionY, positionZ) {
        if(checkboxID){


            //console.log("checkboxID", geometry.uuid)
            let area =await setSpecificArea(checkboxID, width, length)
            area.position.set( positionX,  positionY,  positionZ)


            //console.log("area", area, length, width, sizeBB)
            area.rotation.set( 0,rotate,0);
            specificFurnIDList.push({key: input[0], value: lastFurnitureFound.geometry.uuid})
            areaPositions.push({key: lastFurnitureFound.geometry.uuid, value: area})


            //console.log("specificFurnIDList", specificFurnIDList, noSpecificAreaIndex)
            // addingAreaInFrontOfFurniture(toilet)
            // addingAreaInFrontOfFurniture(sink)

            //console.log(" noSpecificAreaIndex",noSpecificAreaIndex,allSubsetMeshesIDs)


            return area
        }


    }

    if(ReferenceDirections[indexFound].x > 0){
        //console.log("smaller 0 X")


        area = await  positionFurnitureArea(0, toilet, 0.7, 1.2 + sizeBB.x, modifiedCenter.x + 0.3 , modifiedCenter.y ,modifiedCenter.z - (sizeBB.z  - 0.7)/2)
        area = await  positionFurnitureArea(0,sink,0.55, 0.9 , modifiedCenter.x  , modifiedCenter.y ,modifiedCenter.z - (sizeBB.z  - 0.55)/2 )

        area = await  positionFurnitureArea(0,tube,1.5, 1.5, modifiedCenter.x  , modifiedCenter.y ,modifiedCenter.z + (sizeBB.z + 1.5 )/2 )
        area = await  positionFurnitureArea(0,shower,1.5, 1.5, modifiedCenter.x  , modifiedCenter.y ,modifiedCenter.z  )


        let sidemax = Math.max(sizeBB.x, sizeBB.z)
        if(sidemax < 1.5){sidemax = 1.5}
        area= await  positionFurnitureArea(0,kitchen,1.4, sidemax, modifiedCenter.x  , modifiedCenter.y ,modifiedCenter.z + (sizeBB.z + 1.5 )/2 )

        area = await  positionFurnitureArea(0,bed,sizeBB.x + 1.5 , 1.5 + 1.2 + sizeBB.z, modifiedCenter.x -0.15  , modifiedCenter.y ,modifiedCenter.z + 1.5/2)


        //area.position.set(modifiedCenter.x  , modifiedCenter.y ,modifiedCenter.z + sizeBB.z/2 + area.geometry.parameters.depth / 2 )
    }
    if(ReferenceDirections[indexFound].x < 0){
        //console.log("greater 0 X")
        area = await  positionFurnitureArea(0,toilet, 0.7, 1.2 + sizeBB.x, modifiedCenter.x - 0.3 , modifiedCenter.y ,modifiedCenter.z + (sizeBB.z - 0.7)/2 )
        area = await  positionFurnitureArea(0,sink,0.55, 0.9 , modifiedCenter.x  , modifiedCenter.y ,modifiedCenter.z + (sizeBB.z  - 0.55)/2 )

        area = await  positionFurnitureArea(0,tube,1.5, 1.5, modifiedCenter.x  , modifiedCenter.y ,modifiedCenter.z - (sizeBB.z + 1.5 )/2 )
        area = await  positionFurnitureArea(0,shower,1.5, 1.5, modifiedCenter.x  , modifiedCenter.y ,modifiedCenter.z  )


        let sidemax = Math.max(sizeBB.x, sizeBB.z)
        if(sidemax < 1.5){sidemax = 1.5}
        area= await  positionFurnitureArea(0,kitchen,1.5, sidemax, modifiedCenter.x  , modifiedCenter.y ,modifiedCenter.z - (sizeBB.z + 1.5 )/2 )

        area = await  positionFurnitureArea(0,bed,sizeBB.x + 1.5 , 1.5 + 1.2 + sizeBB.z, modifiedCenter.x -0.15  , modifiedCenter.y ,modifiedCenter.z - 1.5/2)

    }


    if(ReferenceDirections[indexFound].y > 0){
        //console.log("smaller 0 y")

        area = await  positionFurnitureArea(Math.PI/2, toilet, 0.7, 1.2 + sizeBB.x, modifiedCenter.x - (sizeBB.x  - 0.7)/2 , modifiedCenter.y ,modifiedCenter.z + 0.3 )

        area = await  positionFurnitureArea(Math.PI/2,sink,0.55, 0.9 , modifiedCenter.x - (sizeBB.x  - 0.55)/2  , modifiedCenter.y ,modifiedCenter.z  )
        area = await  positionFurnitureArea(Math.PI/2,tube,1.5, 1.5, modifiedCenter.x + (sizeBB.x + 1.5 )/2   , modifiedCenter.y ,modifiedCenter.z )
        area = await  positionFurnitureArea(Math.PI/2,shower,1.5, 1.5, modifiedCenter.x  , modifiedCenter.y ,modifiedCenter.z  )

        let sidemax = Math.max(sizeBB.x, sizeBB.z)
        if(sidemax < 1.5){sidemax = 1.5}
        area= await  positionFurnitureArea(Math.PI/2,kitchen,1.5, sidemax, modifiedCenter.x + (sizeBB.x + 1.5 )/2 , modifiedCenter.y ,modifiedCenter.z  )
        area = await  positionFurnitureArea(Math.PI/2,bed,sizeBB.x + 1.5 , 1.5 + 1.2 + sizeBB.z, modifiedCenter.x + 1.5/2   , modifiedCenter.y ,modifiedCenter.z -0.15)

        // if(toilet){
        //     //console.log("toitop", sizeBB.z, sizeBB.z - area.geometry.parameters.depth, area.geometry.parameters.depth,  modifiedCenter.z)
        //     const difference = sizeBB.x - area.geometry.parameters.depth
        //     area.position.set(modifiedCenter.x - difference/2 , modifiedCenter.y ,modifiedCenter.z )

        // } else {

        //     area.position.set(modifiedCenter.x + sizeBB.x/2 + area.geometry.parameters.depth / 2 , modifiedCenter.y ,modifiedCenter.z )
        // }


    }

    if(ReferenceDirections[indexFound].y < 0){
        //console.log("greater 0 y")
        area = await  positionFurnitureArea(Math.PI/2, toilet, 0.7, 1.2 + sizeBB.x, modifiedCenter.x + (sizeBB.x  - 0.7)/2 , modifiedCenter.y ,modifiedCenter.z + 0.3 )

        area = await  positionFurnitureArea(Math.PI/2,sink,0.55, 0.9 , modifiedCenter.x + (sizeBB.x  - 0.55)/2  , modifiedCenter.y ,modifiedCenter.z  )
        area = await  positionFurnitureArea(Math.PI/2,tube,1.5, 1.5, modifiedCenter.x - (sizeBB.x + 1.5 )/2   , modifiedCenter.y ,modifiedCenter.z )
        area = await  positionFurnitureArea(Math.PI/2,shower,1.5, 1.5, modifiedCenter.x  , modifiedCenter.y ,modifiedCenter.z  )

        let sidemax = Math.max(sizeBB.x, sizeBB.z)
        if(sidemax < 1.5){sidemax = 1.5}
        area = await  positionFurnitureArea(Math.PI/2,kitchen,1.5, sidemax, modifiedCenter.x - (sizeBB.x + 1.5 )/2 , modifiedCenter.y ,modifiedCenter.z  )
        area = await  positionFurnitureArea(Math.PI/2,bed,sizeBB.x + 1.5 , 1.5 + 1.2 + sizeBB.z, modifiedCenter.x - 1.5/2   , modifiedCenter.y ,modifiedCenter.z -0.15)

    }
}

async function startPositionAllSubsetMeshes(furnitureMeshes){
    for ( let i = 0; i < furnitureMeshes.length; i++){


       //console.log("meshid", meshid, )
       ////console.log(furnitureMeshes[i].uuid)
        //console.log(allSubsetMeshes[i].uuid)

        const pickedFurnishingElement = await loader.ifcManager.getItemProperties( 0,allSubsetMeshes[i].uuid );
        // //console.log("furnishingElement: ",pickedFurnishingElement);

        const objectPlacement = pickedFurnishingElement.ObjectPlacement.value
        const ObjectPlacement =  await loader.ifcManager.getItemProperties(0, objectPlacement );
        // //console.log("objectPlacement: ",ObjectPlacement)

        const relativePlacement = ObjectPlacement.RelativePlacement.value
        const RelPlace =  await loader.ifcManager.getItemProperties(0, relativePlacement );
        // //console.log("RelPlace",RelPlace)
        const location = RelPlace.Location.value
        const Location =  await loader.ifcManager.getItemProperties(0, location );
        // //console.log("centerPoints2", areaMeshes[i])
        // //console.log("Location",Location)

        const startPos = new Vector3(Location.Coordinates[0].value, Location.Coordinates[2].value, -Location.Coordinates[1].value)

        startPositionsFurns.push(startPos)
    }
    console.log("startPositionsFurns", startPositionsFurns)
}

async function setNewPosition (event, furnitureMeshes) {


    const updatedPositionsFurniture = [];
    

    for ( let i = 0; i < furnitureMeshes.length; i++){
        //console.log("centerPoints", centerPoints, allSubsetMeshes, areaMeshes)
        updatedPositionsFurniture.push(furnitureMeshes[i].position)


       //console.log("meshid", meshid, )
       ////console.log(furnitureMeshes[i].uuid)
        //console.log(allSubsetMeshes[i].uuid)

        const pickedFurnishingElement = await loader.ifcManager.getItemProperties( 0,allSubsetMeshes[i].uuid );
        // //console.log("furnishingElement: ",pickedFurnishingElement);


        const objectPlacement = pickedFurnishingElement.ObjectPlacement.value
        // const ObjectPlacement =  await loader.ifcManager.getItemProperties(0, objectPlacement );
        // console.log("objectPlacement: ",ObjectPlacement)

        const ObjectPlacements =  await loader.ifcManager.getItemProperties(0, objectPlacement, true );
        console.log("objectPlacement 2: ",ObjectPlacements)



        // const relativePlacement = ObjectPlacement.RelativePlacement.value
        // const RelPlace =  await loader.ifcManager.getItemProperties(0, relativePlacement );
        // // //console.log("RelPlace",RelPlace)

        const refDir =  ObjectPlacements.RelativePlacement.RefDirection
        //RelPlace.RefDirection
        console.log("refDir", refDir)

        // const location = RelPlace.Location.value
        // const Location =  await loader.ifcManager.getItemProperties(0, location );
        // //console.log("centerPoints2", areaMeshes[i])
        // //console.log("Location",Location)



        // locationSaver.push(Location.Coordinates)

        // console.log("locationSaver", locationSaver, Location)

        for(let j = 0; j < locationSaver.length; j++){
            const sphereLocal = new Mesh(sphereGeometry, new MeshBasicMaterial({color: 0xff0000}))
            sphereLocal.position.set(locationSaver[i][0].value, locationSaver[i][2].value, -locationSaver[i][1].value)
            //scene.add(sphereLocal)
            spheresLocal.push(sphereLocal.position)

        }

        // const referencePointFurnitureX = centerPoints[i].x - locationSaver[i][0].value
        // const referencePointFurnitureZ = centerPoints[i].z + locationSaver[i][1].value
        // ReferenzX.push(referencePointFurnitureX)
        // ReferenzZ.push(referencePointFurnitureZ)
        // //console.log("CoordsFurn", ReferenzX, ReferenzZ)
        // // differenz vom Mittelpunkt substemesh zu sphereLocal Position


        // if (allSubsetMeshes[i].position.z > 0){
        //     ////console.log("negative z", allSubsetMeshes[i].position.z)
        //     allSubsetMeshes[i].position.z = - allSubsetMeshes[i].position.z
        // }



        const center = new Vector3(0,0,0)
        const modiefiedReferenz =  allSubsetMeshes[i].geometry.boundingBox.getCenter(center)

        const modiefiedReferenzX =  modiefiedReferenz.x
        const modiefiedReferenzZ = modiefiedReferenz.z
        const modiefiedReferenzY = modiefiedReferenz.y

        //console.log("1" ,allSubsetMeshes[i].position, allIDsFurn,  modiefiedReferenz)

        const sphereLocal = new Mesh(sphereGeometry, new MeshBasicMaterial({color: 0xffff00})) //gelb
        sphereLocal.position.set(modiefiedReferenzX, modiefiedReferenzY, modiefiedReferenzZ)
        //scene.add(sphereLocal)


        const modiefiedReferenzArea =  areas[i].position


        //console.log("hello", allSubsetMeshes[i].position, allIDsFurn, Location.Coordinates, modiefiedReferenz, modiefiedReferenzArea, ReferencePositionAreas, ReferencePositions)

        const sphereLocalArea = new Mesh(sphereGeometry, new MeshBasicMaterial({color: 0xff00ff})) //pink
        sphereLocalArea.position.set(modiefiedReferenzArea.x,1, modiefiedReferenzArea.z)
        //scene.add(sphereLocalArea)

        const sphereLocalArea2 = new Mesh(sphereGeometry, new MeshBasicMaterial({color: 0x0000ff})) //blau
        sphereLocalArea2.position.set( modiefiedReferenzArea.x + ReferencePositions[i].x , modiefiedReferenzArea.y + ReferencePositions[i].y, modiefiedReferenzArea.z + ReferencePositions[i].z)
        //scene.add(sphereLocalArea2)


        const sphereLocalArea3 = new Mesh(sphereGeometry, new MeshBasicMaterial({color: 0x00ff00})) //grün
        sphereLocalArea3.position.set( startPositionsFurns[i].x , 1.3 ,startPositionsFurns[i].z)
        //scene.add(sphereLocalArea3)

        ///Rotation
        if (ObjectPlacements.RelativePlacement.RefDirection == null) {
            refDirNull = new Vector3(1, 0 , 0)
            //console.log(refDirNull)

        } else {

            //const refDirection =  await loader.ifcManager.getItemProperties(0, refDir.value );
            ////console.log("refDirect", refDirection, )

            ObjectPlacements.RelativePlacement.RefDirection.DirectionRatios[0].value = modifiedDirections[i].x
            ObjectPlacements.RelativePlacement.RefDirection.DirectionRatios[1].value = modifiedDirections[i].y
            ObjectPlacements.RelativePlacement.RefDirection.DirectionRatios[2].value = modifiedDirections[i].z

            //await loader.ifcManager.ifcAPI.WriteLine(0, refDirection);
            //console.log("referenceVector", refDirection, allIDsFurn )

         }
        ///LOcation
        console.log("R", modifiedDirections[i], ReferenceDirections[i], areas[i].uuid )
        if(modifiedDirections[i].x === ReferenceDirections[i].x && modifiedDirections[i].y === ReferenceDirections[i].y && modifiedDirections[i].z === ReferenceDirections[i].z){
            console.log("equals", modiefiedReferenzArea, ReferencePositions[i])
            ObjectPlacements.RelativePlacement.Location.Coordinates[0].value = ( modiefiedReferenzArea.x +  ReferencePositions[i].x )
            ObjectPlacements.RelativePlacement.Location.Coordinates[1].value =  -(modiefiedReferenzArea.z + ReferencePositions[i].z)
            ObjectPlacements.RelativePlacement.Location.Coordinates[2].value =  modiefiedReferenzArea.y + ReferencePositions[i].y

        } else if(modifiedDirections[i].x !== ReferenceDirections[i].x || modifiedDirections[i].y !== ReferenceDirections[i].y || modifiedDirections[i].z !== ReferenceDirections[i].z){
            console.log("unequals", modiefiedReferenzArea, ReferencePositions[i])

            if(modifiedDirections[i].x < 0){
                console.log("x-1", modiefiedReferenzArea, ReferencePositions[i])
                ObjectPlacements.RelativePlacement.Location.Coordinates[0].value =  modiefiedReferenzArea.x + (ReferencePositions[i].z )
                ObjectPlacements.RelativePlacement.Location.Coordinates[1].value =  -(modiefiedReferenzArea.z - ReferencePositions[i].x)
                ObjectPlacements.RelativePlacement.Location.Coordinates[2].value =  modiefiedReferenzArea.y

            }
            if(modifiedDirections[i].x > 0){
                console.log("x+1", modiefiedReferenzArea, ReferencePositions[i])
                ObjectPlacements.RelativePlacement.Location.Coordinates[0].value =  modiefiedReferenzArea.x + ( ReferencePositions[i].z )
                ObjectPlacements.RelativePlacement.Location.Coordinates[1].value =  -(modiefiedReferenzArea.z + (- ReferencePositions[i].x))
                ObjectPlacements.RelativePlacement.Location.Coordinates[2].value =  modiefiedReferenzArea.y

            }
            if(modifiedDirections[i].y < 0){
                console.log("y-1", modiefiedReferenzArea, ReferencePositions[i])
                ObjectPlacements.RelativePlacement.Location.Coordinates[0].value =  modiefiedReferenzArea.x + (ReferencePositions[i].z )
                ObjectPlacements.RelativePlacement.Location.Coordinates[1].value =  -(modiefiedReferenzArea.z + ReferencePositions[i].x)
                ObjectPlacements.RelativePlacement.Location.Coordinates[2].value =  modiefiedReferenzArea.y

            }
            if(modifiedDirections[i].y > 0){
                console.log("y+1", modiefiedReferenzArea, ReferencePositions[i])
                ObjectPlacements.RelativePlacement.Location.Coordinates[0].value =  modiefiedReferenzArea.x - (ReferencePositions[i].x )
                ObjectPlacements.RelativePlacement.Location.Coordinates[1].value =  -(modiefiedReferenzArea.z + ReferencePositions[i].z)
                ObjectPlacements.RelativePlacement.Location.Coordinates[2].value =  modiefiedReferenzArea.y

            }
        }




        // locationSaver[i][0].value +
        // locationSaver[i][1].value

        // const ObjectPlacement =  await loader.ifcManager.getItemProperties(0, objectPlacement );
        // await loader.ifcManager.ifcAPI.WriteLine(0, Location);

        await loader.ifcManager.ifcAPI.WriteLine(0, ObjectPlacements.RelativePlacement);



    }

    const dataFurn = await loader.ifcManager.ifcAPI.ExportFileAsIFC(0);

    blob = new Blob([dataFurn]);


    const file = new File([blob], "./DINable.ifc");


    const downloadbutton = document.getElementById('download-button')
    const link = document.createElement('a');
    link.download = './DINable.ifc';
    link.href = URL.createObjectURL(file);


    downloadbutton.appendChild(link);

    const downloadFile = () => {
        //console.log("downloaded")
        link.click();
        link.remove();};
    downloadbutton.addEventListener('click', downloadFile);




    //console.log("updatedPositionsFurniture", updatedPositionsFurniture)
}



async function getRefDirectionFurniture(){



        ////console.log("idsFurn", typeof(idsFurn))
        for(let i = 0; i < ids.length; i++) {
            const pickedFurnishingElement = await loader.ifcManager.getItemProperties( 0, ids[i] );
            ////console.log("furnishingElement: ",pickedFurnishingElement);

            const objectPlacement = pickedFurnishingElement.ObjectPlacement.value
            const ObjectPlacement =  await loader.ifcManager.getItemProperties(0, objectPlacement );
            // //console.log("objectPlacement: ",ObjectPlacement)

            const relativePlacement = ObjectPlacement.RelativePlacement.value
            const RelPlace =  await loader.ifcManager.getItemProperties(0, relativePlacement );
            // //console.log("RelPlace",RelPlace)

            const refDir = RelPlace.RefDirection
            ////console.log("refDir", refDir)
            if (refDir == null) {
                refDirNull = new Vector3(1, 0 , 0)
                //console.log(refDirNull)
                ReferenceDirections.push(refDirNull)
            } else {

                const refDirection =  await loader.ifcManager.getItemProperties(0, refDir.value );
                ////console.log("refDirect", refDirection, )
                const refDirectionX = refDirection.DirectionRatios[0].value
                const refDirectionY = refDirection.DirectionRatios[1].value
                const refDirectionZ = refDirection.DirectionRatios[2].value

                const referenceVector = new Vector3(refDirectionX, refDirectionY, refDirectionZ)
                //console.log("referenceVector", referenceVector )


                ReferenceDirections.push(referenceVector)
            }




        }


    ////console.log("ReferenceDirections", ReferenceDirections)

}


async function generateAreaFurniture(lengtharea, widtharea, lastFurnitureFound){

    const areaMesh = new Mesh(
        new BoxGeometry(widtharea,0.01,lengtharea),
        new MeshBasicMaterial({color: greyColor, transparent: true, opacity: 0.6})
    )


    areaMesh.position.set(lastFurnitureFound.x,   lastFurnitureFound.y,  lastFurnitureFound.z  )
    return areaMesh

}







async function coordinatesFurniture(id) {
    const pickedFurnishingElement = await loader.ifcManager.getItemProperties( 0, id);
    ////console.log("furnishingElement: ",pickedFurnishingElement);

    const objectPlacement = pickedFurnishingElement.ObjectPlacement.value
    const ObjectPlacement =  await loader.ifcManager.getItemProperties(0, objectPlacement );
    // //console.log("objectPlacement: ",ObjectPlacement)

    const relativePlacement = ObjectPlacement.RelativePlacement.value
    const RelPlace =  await loader.ifcManager.getItemProperties(0, relativePlacement );
    // //console.log("RelPlace",RelPlace)

    const location = RelPlace.Location.value
    const Location =  await loader.ifcManager.getItemProperties(0, location );
    // //console.log("Location",Location)



    return Location.Coordinates
}



setupProgress();

function setupProgress() {
const text = document.getElementById('progress-text')
loader.ifcManager.setOnProgress((event) => {
    const percent = event.loaded / event.total * 100;
    const formatted = Math.trunc(percent);
    text.innerText = formatted;
})
};





// Tree view

const toggler = document.getElementsByClassName("caret");
for (let i = 0; i < toggler.length; i++) {
    toggler[i].onclick = () => {
        toggler[i].parentElement.querySelector(".nested").classList.toggle("active");
        toggler[i].classList.toggle("caret-down");
    }
}

// Spatial tree menu

function createTreeMenu(ifcProject, id) {
    const root = document.getElementById(id);
    removeAllChildren(root);
    const ifcProjectNode = createNestedChild(root, ifcProject);

    ifcProject.children.forEach(async child => {
        await constructTreeMenuNode(ifcProjectNode, child);
    })
}

function nodeToString(node) {
    return `${node.expressID}`

}

async function constructTreeMenuNode(parent, node) {
    const children = node.children;

    if (children.length === 0) {
        await createSimpleChild(parent, node);
        return;
    // }
    // else {
    //     for( let i = 0; i < children.length; i++){
    //         //console.log("child", children[i].type)
    //         if(children[i].type === 'IFCFURNISHINGELEMENT') {
    //             for(let id = 0; id < noIntersectionsIDs.length; id++){
    //                 if(children[i].expressID === noIntersectionsIDs[id]) {
    //                     node.expressID
    //                     //console.log("no int",children[i].expressID , noIntersectionsIDs[id], node)

    //                 }
    //             }

    //             ////console.log(children[i].expressID)
    //         }
    //     }


    }

    const nodeElement = createNestedChild(parent, node);

    children.forEach(async child => {
        await constructTreeMenuNode(nodeElement, child);
    })
}

function createNestedChild(parent, node) {
    const content = nodeToString(node);
    const root = document.createElement('li');
    createTitle(root, content + `- ${node.type}`);
    const childrenContainer = document.createElement('ul');
    childrenContainer.classList.add("activetree");
    root.appendChild(childrenContainer);
    parent.appendChild(root);
    return childrenContainer;
}

function createTitle(parent, content) {
    const title = document.createElement("span");
    title.classList.add("caret");

    title.onclick = () => {
        title.parentElement.querySelector(".nested").classList.toggle("activetree");
        title.classList.toggle("caret-down");
    }
    title.textContent = content
    parent.appendChild(title);
}

async function createSimpleChild(parent, node) {
    const content = nodeToString(node);
    ////console.log(node.type)
    const childNode = document.createElement('li');
    childNode.classList.add('leaf-node');


    childNode.textContent = content;
    ////console.log("nodes", typeof(childNode.textContent), truePositions, childNode)


    colorForNodes(IntersectionsIDsAreaIntersectWall, '#8137be', childNode,parent, content, node, " Kollision mit einer Wand" )
    colorForNodes(IntersectionsIDsAreaContainWall, '#8137be', childNode,parent, content, node, " Die Bewegungsfläche enthält die Wand" )
    colorForNodes(IntersectionsIDsFurnIntersectWall, '#8137be', childNode,parent, content, node, " Ein Möbel kollidiert mit der Wand " )
    colorForNodes(IntersectionsIDsFurnContainWall, '#8137be', childNode,parent, content, node, " Ein Möbel enthält die Wand." )

    colorForNodes(IntersectionsIDsFurnIntersectFurn, '#570042', childNode,parent, content, node, "Möbel überschneiden sich." )
    colorForNodes(IntersectionsIDsAreaContainFurn, '#296017', childNode,parent, content, node, "Bewegungsfläche und Möbel enthalten sich." )
    colorForNodes(IntersectionsIDsFurnContainArea, '#296017', childNode,parent, content, node, "Möbel und Bewegungsfläche enthalten sich." )
    colorForNodes(IntersectionsIDsFurnContainFurn, '#504b13', childNode,parent, content, node, "Möbel enthalten sich." )
    colorForNodes(IntersectionsIDsAreaContainArea, '#67116e', childNode,parent, content, node, "Bewegungsflächen enthalten sich." )
    colorForNodes(IntersectionsIDsFurnIntersectArea, '#99244f', childNode,parent, content, node, "Kollision eines Möbels mit mindestens einer Bewegungsfläche" )
    colorForNodes(IntersectionsIDs, '#99244f', childNode,parent, content, node, "Kollision eines Möbels mit mindestens einer Bewegungsfläche" )
    colorForNodes(IntersectionsIDsAreaIntersectArea, '#007050', childNode,parent, content, node, "Bewegungsflächen überlagern sich DIN-konform." )




    for(let u = 0; u < allSubsetMeshes.length; u++){
        const occurenceID = getOccurence(noIntersectionsIDs, allSubsetMeshes[u].uuid)
        for(let p = 0; p < wallSubsetMeshes.length; p++){
            const occurenceIDwall = getOccurence(noIntersectionsIDs, wallSubsetMeshes[p].uuid)
            ////console.log("occurendce", occurenceIDwall, occurenceID)

            if(occurenceID === 0 && occurenceIDwall === 0) {
                ////console.log("occ",allSubsetMeshes[u].uuid)
                noIntersectionsIDs.push(allSubsetMeshes[u].uuid)
            }
        }

    }

    colorForNodes(noIntersectionsIDs, '#007050', childNode,parent, content, node, "Keine Kollision" ) //grüm
    // colorForNodes(noIntersectionsIDsAreaContainFurn, '#4CBB17', childNode,parent, content, node, "Keine Kollision" ) //grüm
    // colorForNodes(noIntersectionsIDsAreaIntersectArea, '#4CBB17', childNode,parent, content, node, "Keine Kollision" ) //grüm
    // colorForNodes(noIntersectionsIDsAreaContainArea, '#4CBB17', childNode,parent, content, node, "Keine Kollision" ) //grüm
    // colorForNodes(noIntersectionsIDsFurnIntersectFurn, '#4CBB17', childNode,parent, content, node, "Keine Kollision" ) //grüm
    // colorForNodes(noIntersectionsIDsFurnContainFurn, '#4CBB17', childNode,parent, content, node, "Keine Kollision" ) //grüm

    //colorForNodes(wallSubsetMeshesIDs, '#4CBB17', childNode,parent, content, node, "Wand" ) //grüm

    colorForNodesNoCollisionCheck ( '#000000', childNode, content, node)


    //colorForNodesIntersection(IntersectionsIDs, '#C70039',childNode, 'noIntersection', parent, content) //rot

    //childNode.textContent = content + `- ${node.type}`;
    parent.appendChild(childNode );

    collisionTypeText(intersectionidHTML, noIntersectionsIDs, childNode,'#C70039', content, parent)

    childNode.onpointerenter =  (event) => prepickByID(event, hightlightMaterial, hightlightMaterialSecond, [node.expressID], node);

    //parent.onpointerup =  (event) => pickCheckbox(event, hightlightMaterial, hightlightMaterialSecond, [node.expressID]);

        //await loader.ifcManager.selector.prepickIfcItemsByID(0, [node.expressID])


    childNode.onpointerdown =  (event) => pickByIDClick(event, selectionMaterial, hightlightMaterialSecond, [node.expressID]);
    //canvas.ondblclick = (event) =>  pickFurnitureSecond(event, allSubsetMeshes, areas) ; //cubes

}
const noIntersectionidHTML = [];
function colorForNodes (liste, colorNode, childNode, parent, content, node, text) {
    const specificID = [];

    // = document.createElement('p');
    // occNumber.classList.add('container');
    // occNumber.style.paddingLeft = '102px';
    // occNumber.style.fontSize = '8px'

    //occNumber.textContent = 'hello'
    for(let i = 0; i < liste.length; i++){
        let idsfurniture = liste[i].toString();
        if(childNode.textContent ===  idsfurniture){


            //  console.log("allLists", allLists, " ---",
            //  IntersectionsIDsAreaIntersectArea,
            //  IntersectionsIDsAreaContainArea,
            //  IntersectionsIDsFurnIntersectFurn,
            //  IntersectionsIDsFurnContainFurn,
            //  IntersectionsIDsFurnIntersectArea,
            //  IntersectionsIDsFurnContainArea,
            //  IntersectionsIDs,
            //  IntersectionsIDsAreaIntersectWall,
            //  IntersectionsIDsAreaContainWall,
            //  IntersectionsIDsFurnIntersectWall,
            //  IntersectionsIDsFurnContainWall,
            //  IntersectionsIDsAreaContainFurn )

            ////console.log("childNode greem", childNode.textContent, content)
            ////console.log("true", childNode, idsfurniture, ids)
            childNode.style.color = colorNode; //green
            childNode.style.padding = '10px 0px 0px 0px'

            noIntersectionidHTML.push(idsfurniture)


            for (let id = 0; id < specificFurnIDList.length; id++){
                specificID.push(specificFurnIDList[id].value)
                ////console.log("test", specificFurnIDList[id].value)


                    if(specificFurnIDList[id].value == childNode.textContent ) {
                        //console.log("content", childNode.textContent , [id])
                        if(id == 2){
                            node.type = 'WC'
                        }
                        if(id == 0){
                            node.type = 'Bett'
                        }
                        if(id == 3){
                            node.type = 'Waschtisch'
                        }
                        if(id == 4){
                            node.type = 'Badewanne'
                        }
                        if(id == 5){
                            node.type = 'Dusche'
                        }
                        if(id == 1){
                            node.type = 'Küchenzeile'
                        }

                    } else {
                        if(node.type == 'IFCFURNISHINGELEMENT') {
                            node.type = 'Sonstiges Möbel'
                        }
                        if(node.type == 'IFCFLOWTERMINAL') {
                            node.type = 'Sanitärmöbel'
                        }

                    }



            }


            // if(node.type == 'IFCFURNISHINGELEMENT') {
            //     node.type = 'Möbel'
            // }

            const radiobox = document.createElement('input');
            radiobox.type = 'radio';
            radiobox.id = idsfurniture;
            radiobox.name = 'noIntersection'
            radiobox.value = idsfurniture

            radiobox.classList.add('container');


            const radioDot = document.createElement('span');
            radioDot.classList.add('dot');
            radioDot.style.left = '-25px';
            radioDot.style.top = '10px';

            const label = document.createElement('label')
            label.classList.add('container')

            label.appendChild(radiobox);
            label.appendChild(radioDot);

            //label.appendChild(occNumber)

            for(let p = 0; p < allIDsInChecker.length; p++){
                const occurence =  allLists.filter(x => x === allIDsInChecker[p]).length
                //console.log("occurence", occurence, allIDsInChecker[p], content, childNode.textContent, node)

                    if(node.expressID === allIDsInChecker[p]){

                        childNode.textContent = content + `- ${node.type}` + ` - ${text}`  +  `- Anzahl Kollisionen: ${occurence}`
                    }
             }






            // deleteButton = document.createElement('button');
            // deleteButton.textContent = '+';
            // deleteButton.className = 'label-container';

           
            //const btn = document.getElementById('storymode')


            radiobox.onclick= () => {

             
                pickCheckbox(event, hightlightMaterial, hightlightMaterialSecond, [node.expressID]);



            }

            //label.appendChild(infobutton);

            parent.appendChild(label);

        }

    }


}

function colorForNodesNoCollisionCheck ( colorNode, childNode, content, node) {

        if(childNode.textContent === content){

            //console.log("childNode undef", childNode.textContent, content)
            ////console.log("true", childNode, idsfurniture, ids)
            childNode.style.color = colorNode; //green
            childNode.style.padding = '10px 0px 0px 0px'

            // if(node.type == 'IFCFURNISHINGELEMENT') {
            //     node.type = 'Möbel'
            // }

            childNode.textContent = content + `- ${node.type}`



        }

    }



const intersectionidHTML = [];

function collisionTypeText(liste, noListe, childNode,colorNode, content, parent) {
    const textCollision = document.createElement('p');
    const textNoCollision = document.createElement('p');


    for(let id = 0; id < allSubsetMeshes.length; id++) {
        const allids = allSubsetMeshes[id].uuid.toString()
        idMeshToString.push(allids)

    }
    for(let d = 0; d < areas.length; d++) {
        const areaID = areas[d].uuid.toString()
        const includesID = liste.includes(areaID)
       // //console.log("includesID",includesID)
        if(includesID) {
            //console.log("areaID", areaID)
            const idindex = idMeshToString.indexOf(areaID)
            ////console.log(areas[idindex])
            if(areas[idindex].material.color === furnClashAreaColor) {
                textCollision.classList.add('containerText')
                ////console.log("found area", areas[idindex])
                textCollision.innerText =  " Möbel -" + `${ content }`+ "- kollidiert mit mindestens einer Bewegungsfläche "
                textCollision.style.paddingLeft = '0px';
                textCollision.style.marginBottom = '0px';
                textCollision.style.paddingTop = '5px';
                textCollision.style.color = '#858585'; //

                ////console.log(textCollision)
                textCollision.id = areaID;

                textCollision.style.visibility = 'hidden';
                parent.appendChild(textCollision)
            }
        }
        if(noListe.includes(areaID)) {

            const idindex = idMeshToString.indexOf(areaID)
            //console.log("no areaid", areaID, idindex)
                for(let b = 0; b < noListe.length; b++){
                    //console.log("no areaid 2", areas[idindex].material.color)
                    if(areas[idindex].material.color === greyColor) {
                        //console.log("no areaid 3")
                        textNoCollision.classList.add('containerTextNot')
                        ////console.log("found area", areas[idindex])
                        textNoCollision.innerText =  " Möbel -" + `${ content }`+ "- kollidiert mit keiner Bewegungsfläche "
                        textNoCollision.style.paddingLeft = '0px';
                        textNoCollision.style.marginBottom = '0px';
                        textNoCollision.style.paddingTop = '5px';
                        textNoCollision.style.color = '#858585';
                        ////console.log(textNoCollision)
                        textNoCollision.id = areaID;

                        textNoCollision.style.visibility = 'visible';
                        parent.appendChild(textNoCollision)
                    }
                }



        }


        }
    }


function removeAllChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}



let objectData ={
    "expressID": 186,
    "type": [],
    "GlobalId": {
        "type": 1,
        "value": "2idC0G3ezCdhA9WVjWemc$"
    },
    "OwnerHistory": {},
    "Name": {
        "type": 1,
        "value": "Muro b\\X2\\00E1\\X0\\sico:Partici\\X2\\00F3\\X0\\n con capa de yeso:163541"
    },
    "Description": null,
    "ObjectType": {},
    "ObjectPlacement": {},
    "Representation": {},
    "Tag": {},
    "psets": [
        {
            "expressID": 253,
            "type": 1451395588,
            "GlobalId": {
                "type": 1,
                "value": "3LVpPLOTD8Y8ACz1_oabXX"
            },
            "OwnerHistory": {},
            "Name": {
                "type": 1,
                "value": "Pset_ReinforcementBarPitchOfWall"
            },
            "Description": null,
            "HasProperties": [
                {
                    "expressID": 252,
                    "type": 3650150729,
                    "Name": {
                        "type": 1,
                        "value": "Reference"
                    },
                    "Description": null,
                    "NominalValue": {
                        "type": 2,
                        "label": "IFCLABEL",
                        "valueType": 1,
                        "value": "Partici\\X2\\00F3\\X0\\n con capa de yeso"
                    },
                    "Unit": null
                }
            ]
        },
    ],
    "mats": []
}

function createPset(objectData){
    let newPset = {}
    newPset.expressID = 254
    newPset.type = objectData.psets[0].type
    newPset.GlobalId ={
        'type' : 1,
        'value' : "3LVpPLOTD8Y8ACz1_IFCJS"
    }
    newPset.OwnerHistory = {}
    newPset.Name = {
        'type' : 1,
        'value' : 'Pset_Ifcjs'
    }
    newPset.Description = null
    newPset.HasProperties = []

    return newPset
}

let newPset = createPset(objectData)
objectData.psets = [...objectData.psets, ...[newPset]]
newPset.Name.value = 'Pset_Edit'
//console.log(objectData)




animate();