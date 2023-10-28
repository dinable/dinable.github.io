import {
  AmbientLight,
  AxesHelper,
  DirectionalLight,
  GridHelper,
  Scene,
  WebGLRenderer,
  Raycaster,
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
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";
import { IFCLoader } from "web-ifc-three/IFCLoader";
import {
  MeshBVH,
  acceleratedRaycast,
  computeBoundsTree,
  disposeBoundsTree,
} from "three-mesh-bvh";
import { Vector2 } from "three";
import { MeshBasicMaterial } from "three";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";

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
  IFCFLOWTERMINAL,
  IFCRELFILLSELEMENT,
  IFCRELCONNECTSPATHELEMENTS,
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
let camera = new OrthographicCamera(
  size.width / -40,
  size.width / 40,
  size.height / 40,
  size.height / -40,
  1,
  1000
);
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
scene.add(grid);

const axes = new AxesHelper();
axes.material.depthTest = false;
axes.renderOrder = 1;
scene.add(axes);

//Creates the orbit controls (to navigate the scene)
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.target.set(-2, 0, 0);

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.pointerEvents = "none";
labelRenderer.domElement.style.top = "20rem";
document.body.appendChild(labelRenderer.domElement);

// const vrBtn = VRButton.createButton(renderer);
// document.body.appendChild(vrBtn)

//-------------IFC Loading--------------------------
//--------------------------------------------------
const ifcModels = [];
const loader = new IFCLoader();
let model;
let lastModel;
let lastFurniture;
let data;
let blob;

loader.ifcManager.setupThreeMeshBVH(
  computeBoundsTree,
  disposeBoundsTree,
  acceleratedRaycast
);

async function loadingIfc(path) {
  await loader.ifcManager.setWasmPath("wasm/");
  model = await loader.loadAsync(path);

  model.removeFromParent();

  ifcModels.push(model);
  return model;
}

let ifcProject;
async function showModel() {
  const ifcModel = await loadingIfc("./ifc/wand2.ifc");
  scene.add(ifcModel);

  ifcProject = await loader.ifcManager.getSpatialStructure(model.modelID);

  return ifcModel;
}

//------------VARIABLES-------------------
//--------------------------------------------------
const resetPositionsFurn = [];
const resetRotationFurn = [];

let deleteButton;
const orangeColor = new Color("rgb(255,94,0)");
const greyColor = new Color(0x007050);
const furnContainAreaColor = new Color(0x296017); //dunkelgrüm
const furnContainFurnColor = new Color(0x504b13); //kaki
const areaContainAreaColor = new Color(0x67116e); //lila

const furnClashAreaColor = new Color(0x99244f); //beere
const furnIntersectFurnColor = new Color(0x570042); //gelb    rosa f2a9f9
const wallCollisionColor = new Color(0x8137be); //dunkelrot
const areaIntersectAreaColor = new Color(0x007050); // tannengrün

const translationList = [];
let ifcModel;
let furnitureSubset;
let wallSubset;
const startPositionsFurns = [];
const allSubsetMeshes = [];
const allSubsetMeshesIDs = [];
const foundMeshesCheckbox = [];
const areaMeshes = [];
const noSpecificAreaIndex = [];
const modifiedDirections = [];
let areas = [];
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
let ids = [];
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
let checkedBtnmodeIsActive = false;
let checkallmodeIsActive = false;
let dincheckmodeIsActive = false;
let storymodeIsActive = false;
let downloadmodeIsActive = false;
let dincheckBtnIsActive = false;
let backPickFurn = false;

let wIsDown = false;

let aIsDown = false;
let indexFound;

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
const indicesIntersectFurnAndAreaInFront = [];

const checkedListContainsFurnAndAreaInFront = [];
const indicesContainsFurnAndAreaInFront = [];

const checkedListIntersectFurnAndArea = [];
const indicesIntersectFurnAndArea = [];

const checkedListContainsFurnAndArea = [];
const indicesContainsFurnAndArea = [];

const checkedListIntersectAreaAndFurn = [];
const indicesIntersectAreaAndFurn = [];

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
const falsePositionsFurnContainsArea = [];

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

const boundingCubes = [];
const selectedCube = [];
let lastIndex;
let lastFurnitureFound;
const subsetBoundingBoxes = [];
const areaPositions = [];
const startPositionAreas = [];

const selectedWallGumball = [];

const otherRelatedID = [];
const otherRelatedWalls = [];

let relatingWalls;
const selectedWallToRelate = [];
let counter = 0;

const distances = [];
const relatedWalls = [];

const cleanWallId = [];
const doubleTime = [];
const doubleTimeIndex = [];
const cleanWallIndex = [];
const otherRelatedIDIndex = [];

const idMeshToString = [];

const mesh = [];
let prepickedSubset = [];
const areaNewList = [];
const areaNewList2 = [];

let collidingFurnIDs = [];
let searchedID;

let foundSubsets = [];
let foundSubsetsID = [];
let redSubset = [];

const wallSubsetMeshesStartPositions = [];
const resetPositionsWall = [];

let idsOpenings;
let idsFill;
let openings;

const wallIDToOpenings = [];

const doorSub = [];
const windowSub = [];
const slabSub = [];

const idsUsed = [];

const noIntersectionidHTML = [];
const intersectionidHTML = [];

const labelMeasure = [];
const lines = [];

let lastPosition;
let indexWC;

//-------------------------ANIMATIONS --------------------------
//---------------------------------------------------------------------------------

const kitchenanimations = [
  `./Animations/Rollstuhl_Kollision_Küche_Svenja_z_1.mp4`,
  `./Animations/Rollstuhl_Kollision_Küche_Svenja_z_1.mp4`,
  `./Animations/Rollstuhl_Kollision_Küche_Svenja_z_1.mp4`,
  `./Animations/Rollstuhl_Kollision_Küche_Svenja_z_1.mp4`,
];
const showeranimations = [
  `./Animations/Rollstuhl_Kollision_Sonstige.mp4`,
  `./Animations/Rollstuhl_Kollision_Sonstige.mp4`,
  `./Animations/Rollstuhl_Kollision_Sonstige.mp4`,
  `./Animations/Rollstuhl_Kollision_Sonstige.mp4`,
];
const tubeanimations = [
  `./Animations/Rollstuhl_Kollision_Sonstige.mp4`,
  `./Animations/Rollstuhl_Kollision_Sonstige.mp4`,
  `./Animations/Rollstuhl_Kollision_Sonstige.mp4`,
  `./Animations/Rollstuhl_Kollision_Sonstige.mp4`,
];
const sinkanimations = [
  `./Animations/Rollstuhl_Kollision_Waschbecken.mp4`,
  `./Animations/Rollstuhl_Kollision_Waschbecken.mp4`,
  `./Animations/Rollstuhl_Kollision_Waschbecken.mp4`,
  `./Animations/Rollstuhl_Kollision_Waschbecken.mp4`,
];
const bedanimations = [
  `./Animations/Rollstuhl_Kollision_Bett_spiegel.mp4`,
  `./Animations/Rollstuhl_Kollision_Bett_spiegel.mp4`,
  `./Animations/Rollstuhl_Kollision_Bett_spiegel.mp4`,
  `./Animations/Rollstuhl_Kollision_Bett_spiegel.mp4`,
];
const wcanimations = [
  `./Animations/Rollstuhl_Kollision_WC_1.mp4`,
  `./Animations/Rollstuhl_Kollision_WC_1.mp4`,
  `./Animations/Rollstuhl_Kollision_WC_1.mp4`,
  `./Animations/Rollstuhl_Kollision_WC_1.mp4`,
];
const otheranimations = [
  `./Animations/Rollstuhl_Kollision_Sonstige.mp4`,
  `./Animations/Rollstuhl_Kollision_Sonstige.mp4`,
  `./Animations/Rollstuhl_Kollision_Sonstige.mp4`,
  `./Animations/Rollstuhl_Kollision_Sonstige.mp4`,
];
const wallanimations = ["wallanimations"];

//-------------------------SOME HELPERS --------------------------
//---------------------------------------------------------------------------------

const input = [
  "Bett",
  "Küchenzeile",
  "WC",
  "Waschtisch",
  "Badewanne",
  "Dusche",
];

let activateButton = document.createElement("button");
activateButton.innerText = "Möbelauswahl";
activateButton.id = "activeButton";
activateButton.classList.add("buttonsArea");

const checkBtn = document.getElementById("checkedBtn");

function getOccurence(array, value) {
  var count = 0;
  array.forEach((v) => v === value && count++);
  return count;
}

function clickedOnce(id, text, style, btn) {
  document.getElementById(id).innerHTML = text;
  btn.disabled = true;
  btn.classList.remove(style);
}

//-------------------------DINCHECKER --------------------------
//---------------------------------------------------------------------------------

function indexedBoundingBoxCollision(
  index,
  boundsIteration,
  collidingWithBounds,
  intersectionList,
  indexIntersectList,
  containsList,
  indexContainsList
) {
  let intersect;
  for (let i = 0; i < boundsIteration.length; i++) {
    if (index !== i) {
      intersect = boundsIteration[i].intersectsBox(collidingWithBounds[index]);

      intersectionList.push(intersect);
      indexIntersectList.push([i, index]);

      contains = boundsIteration[i].containsBox(collidingWithBounds[index]);
      containsList.push(contains);
      indexContainsList.push([i, index]);
    }
  }
}

function areaColorIfCollisionIsDetected(
  intersectionList,
  indexIntersectList,
  color,
  idsNot,
  notPosition,
  Intersection,
  NoIntersection,
  IntersectionWith,
  subsetColliding
) {
  for (let j = 0; j < intersectionList.length; j++) {
    if (intersectionList[j] === true) {
      areas[indexIntersectList[j][0]].material.transparent = true;
      areas[indexIntersectList[j][0]].material.opacity = 0.5;
      areas[indexIntersectList[j][0]].material.color = color;

      areas[indexIntersectList[j][0]].uuid =
        allSubsetMeshes[indexIntersectList[j][0]].uuid;
      areas[indexIntersectList[j][1]].uuid =
        subsetColliding[indexIntersectList[j][1]].uuid;

      Intersection.push(allSubsetMeshes[indexIntersectList[j][0]].uuid);
      IntersectionWith.push(subsetColliding[indexIntersectList[j][1]].uuid);
    } else if (intersectionList[j] === false) {
      const idsFalse = areas[indexIntersectList[j][0]].uuid;
      idsNot.push(idsFalse);

      if (notPosition.includes(idsFalse) === false) {
        notPosition.push(idsFalse);
      }
    }
  }

  for (let i = 0; i < notPosition.length; i++) {
    if (getOccurence(Intersection, notPosition[i]) === 0) {
      if (typeof notPosition[i] !== "string") {
        NoIntersection.push(notPosition[i]);
      }
    }
  }
}

function areaColorIfCollisionIsDetectedWithWall(
  intersectionList,
  indexIntersectList,
  color,
  idsNot,
  notPosition,
  Intersection,
  NoIntersection,
  IntersectionWith,
  subsetColliding
) {
  for (let j = 0; j < intersectionList.length; j++) {
    if (intersectionList[j] === true) {
      areas[indexIntersectList[j][0]].material.transparent = true;
      areas[indexIntersectList[j][0]].material.opacity = 0.5;
      areas[indexIntersectList[j][0]].material.color = color;
      areas[indexIntersectList[j][0]].uuid =
        allSubsetMeshes[indexIntersectList[j][0]].uuid;

      Intersection.push(allSubsetMeshes[indexIntersectList[j][0]].uuid);
      IntersectionWith.push(subsetColliding[indexIntersectList[j][1]].uuid);
    } else if (intersectionList[j] === false) {
      const idsFalse = areas[indexIntersectList[j][0]].uuid;
      idsNot.push(idsFalse);

      if (notPosition.includes(idsFalse) === false) {
        notPosition.push(idsFalse);
      }
    }
  }

  for (let i = 0; i < notPosition.length; i++) {
    if (getOccurence(Intersection, notPosition[i]) === 0) {
      if (typeof notPosition[i] !== "string") {
        NoIntersection.push(notPosition[i]);
      }
    }
  }
}

function DINCHECKER() {
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

  allIdsFalseAreaIntersectFurn.length = 0;
  falsePositionsAreaIntersectFurn.length = 0;

  allIdsFalseAreaContainsFurn.length = 0;
  falsePositionsAreaContainsFurn.length = 0;

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

  noIntersectionsIDsFurnIntersectArea.length = 0;
  IntersectionsIDsFurnIntersectArea.length = 0;
  IntersectionsIDsFurnIntersectAreaWith.length = 0;

  noIntersectionsIDsFurnContainArea.length = 0;
  IntersectionsIDsFurnContainArea.length = 0;
  IntersectionsIDsFurnContainAreaWith.length = 0;

  for (let i = 0; i < boundingCubes.length; i++) {
    // check if any collisions are there and fills Lists if any
    indexedBoundingBoxCollision(
      i,
      boundingCubes,
      boundingCubes,
      checkedList,
      indices,
      checkedListContains,
      indicesContains
    );
    indexedBoundingBoxCollision(
      i,
      subsetBoundingBoxes,
      subsetBoundingBoxes,
      checkedListIntersectFurn,
      indicesIntersectFurn,
      checkedListContainsFurn,
      indicesContainsFurn
    );
    indexedBoundingBoxCollision(
      i,
      subsetBoundingBoxes,
      boundingCubes,
      checkedListIntersectFurnAndArea,
      indicesIntersectFurnAndArea,
      checkedListContainsFurnAndArea,
      indicesContainsFurnAndArea
    );
    indexedBoundingBoxCollision(
      i,
      boundingCubes,
      subsetBoundingBoxes,
      checkedListIntersectAreaAndFurn,
      indicesIntersectAreaAndFurn,
      checkedListContainsAreaAndFurn,
      indicesContainsAreaAndFurn
    );
  }

  for (let i = 0; i < wallBounds.length; i++) {
    indexedBoundingBoxCollision(
      i,
      boundingCubes,
      wallBounds,
      checkedListAreaIntersectWall,
      indicesIntersectAreaAndWall,
      checkedListAreaContainsWall,
      indicesContainsAreaAndWall
    );
    indexedBoundingBoxCollision(
      i,
      subsetBoundingBoxes,
      wallBounds,
      checkedListFurnIntersectWall,
      indicesIntersectFurnAndWall,
      checkedListFurnContainsWall,
      indicesContainsFurnAndWall
    );
  }

  areaColorIfCollisionIsDetected(
    checkedList,
    indices,
    areaIntersectAreaColor,
    allIdsFalseAreaIntersectArea,
    falsePositionsAreaIntersectArea,
    IntersectionsIDsAreaIntersectArea,
    noIntersectionsIDsAreaIntersectArea,
    IntersectionsIDsAreaIntersectAreaWith,
    allSubsetMeshes
  );
  areaColorIfCollisionIsDetected(
    checkedListContains,
    indicesContains,
    areaContainAreaColor,
    allIdsFalseAreaContainsArea,
    falsePositionsAreaContainsArea,
    IntersectionsIDsAreaContainArea,
    noIntersectionsIDsAreaContainArea,
    IntersectionsIDsAreaContainAreaWith,
    allSubsetMeshes
  );

  areaColorIfCollisionIsDetected(
    checkedListIntersectFurn,
    indicesIntersectFurn,
    furnIntersectFurnColor,
    allIdsFalseFurnIntersectFurn,
    falsePositionsFurnIntersectFurn,
    IntersectionsIDsFurnIntersectFurn,
    noIntersectionsIDsFurnIntersectFurn,
    IntersectionsIDsFurnIntersectFurnWith,
    allSubsetMeshes
  );
  areaColorIfCollisionIsDetected(
    checkedListContainsFurn,
    indicesContainsFurn,
    furnContainFurnColor,
    allIdsFalseFurnContainsFurn,
    falsePositionsFurnContainsFurn,
    IntersectionsIDsFurnContainFurn,
    noIntersectionsIDsFurnContainFurn,
    IntersectionsIDsFurnContainFurnWith,
    allSubsetMeshes
  );

  areaColorIfCollisionIsDetected(
    checkedListIntersectFurnAndArea,
    indicesIntersectFurnAndArea,
    furnClashAreaColor,
    allIdsFalseAreaIntersectFurn,
    falsePositionsAreaIntersectFurn,
    IntersectionsIDs,
    noIntersectionsIDs,
    IntersectionsIDsWith,
    allSubsetMeshes
  );
  areaColorIfCollisionIsDetected(
    checkedListContainsFurnAndArea,
    indicesContainsFurnAndArea,
    furnContainAreaColor,
    allIdsFalseAreaContainsFurn,
    falsePositionsAreaContainsFurn,
    IntersectionsIDsAreaContainFurn,
    noIntersectionsIDsAreaContainFurn,
    IntersectionsIDsAreaContainFurnWith,
    allSubsetMeshes
  );

  areaColorIfCollisionIsDetected(
    checkedListIntersectAreaAndFurn,
    indicesIntersectAreaAndFurn,
    furnClashAreaColor,
    allIdsFalseFurnIntersectArea,
    falsePositionsFurnIntersectArea,
    IntersectionsIDsFurnIntersectArea,
    noIntersectionsIDsFurnIntersectArea,
    IntersectionsIDsFurnIntersectAreaWith,
    allSubsetMeshes
  );
  areaColorIfCollisionIsDetected(
    checkedListContainsAreaAndFurn,
    indicesContainsAreaAndFurn,
    furnContainAreaColor,
    allIdsFalseFurnContainsArea,
    falsePositionsFurnContainsArea,
    IntersectionsIDsFurnContainArea,
    noIntersectionsIDsFurnContainArea,
    IntersectionsIDsFurnContainAreaWith,
    allSubsetMeshes
  );

  areaColorIfCollisionIsDetectedWithWall(
    checkedListAreaIntersectWall,
    indicesIntersectAreaAndWall,
    wallCollisionColor,
    allIdsFalseAreaIntersectWall,
    falsePositionsAreaIntersectWall,
    IntersectionsIDsAreaIntersectWall,
    noIntersectionsIDsAreaIntersectWall,
    IntersectionsIDsAreaIntersectWallWith,
    wallSubsetMeshes
  );
  areaColorIfCollisionIsDetectedWithWall(
    checkedListAreaContainsWall,
    indicesContainsAreaAndWall,
    wallCollisionColor,
    allIdsFalseAreaContainsWall,
    falsePositionsAreaContainsWall,
    IntersectionsIDsAreaContainWall,
    noIntersectionsIDsAreaContainWall,
    IntersectionsIDsAreaContainWallWith,
    wallSubsetMeshes
  );

  areaColorIfCollisionIsDetectedWithWall(
    checkedListFurnIntersectWall,
    indicesIntersectFurnAndWall,
    wallCollisionColor,
    allIdsFalseFurnIntersectWall,
    falsePositionsFurnIntersectWall,
    IntersectionsIDsFurnIntersectWall,
    noIntersectionsIDsFurnIntersectWall,
    IntersectionsIDsFurnIntersectWallWith,
    wallSubsetMeshes
  );
  areaColorIfCollisionIsDetectedWithWall(
    checkedListFurnContainsWall,
    indicesContainsFurnAndWall,
    wallCollisionColor,
    allIdsFalseFurnContainsWall,
    falsePositionsFurnContainsWall,
    IntersectionsIDsFurnContainWall,
    noIntersectionsIDsFurnContainWall,
    IntersectionsIDsFurnContainWallWith,
    wallSubsetMeshes
  );

  allLists = IntersectionsIDsAreaContainFurn.concat(
    IntersectionsIDsAreaContainArea,
    IntersectionsIDsFurnIntersectFurn,
    IntersectionsIDsFurnContainFurn,
    IntersectionsIDsFurnIntersectArea,
    IntersectionsIDsFurnContainArea,
    IntersectionsIDs,
    IntersectionsIDsAreaIntersectWall,
    IntersectionsIDsAreaContainWall,
    IntersectionsIDsFurnIntersectWall,
    IntersectionsIDsFurnContainWall
  );
}

document.querySelectorAll("button").forEach((occurence) => {
  let id = occurence.getAttribute("id");
  occurence.addEventListener("click", async function () {
    if (id === "uploadmode") {
      const uploadbtn = document.getElementById("uploadmode");
      uploadbtn.onclick = clickedOnce(
        "demo",
        " ",
        "dincheck-buttonhover",
        uploadbtn
      );

      uploadmodeIsActive = true;

      ifcModel = await showModel();

      canvas.onpointermove = (event) =>
        pick(event, hightlightMaterial, false, ifcModels);
    } else {
      uploadmodeIsActive = false;
    }

    if (id === "furnituremode") {
      const uploadbtn = document.getElementById("furnituremode");
      uploadbtn.onclick = clickedOnce(
        "demo",
        " ",
        "dincheck-buttonhover",
        uploadbtn
      );

      furnituremodeIsActive = true;

      ifcModels.pop();
      model.removeFromParent();
      scene.remove(model);

      checkBtn.style.visibility = "visible";

      const containerTab = document.getElementById("programmFurniture");

      const divElement = document.createElement("div");
      divElement.id = `${"Bett"}-1`;
      divElement.classList.add("modal");
      containerTab.appendChild(divElement);

      const modalBackround = document.getElementById(`${"Bett"}-1`);
      modalBackround.style.display = "block";
      checkBtn.style.visibility = "hidden";

      const formElement = document.createElement("form");
      formElement.classList.add("modal-content");
      formElement.action = "/action_page.php";

      divElement.appendChild(formElement);

      const formContent = document.createElement("div");
      formContent.classList.add("containerForm");

      const heading = document.createElement("p");
      heading.innerText = `Wähle das ${"Bett"} aus.`;

      const decision = document.createElement("div");
      decision.classList.add("clearfix");

      const yesBtn = document.createElement("button");
      yesBtn.type = "button";
      yesBtn.classList.add("buttonsArea");
      yesBtn.style.backgroundColor = "darkgrey";
      yesBtn.innerText = "ok";
      yesBtn.id = "trueBtn";

      let clicked;

      yesBtn.onclick = () => {
        const modalBackround = document.getElementById(`${"Bett"}-1`);
        modalBackround.style.display = "none";
        clicked = false;
        return clicked;
      };

      formContent.appendChild(heading);
      formContent.appendChild(decision);
      decision.appendChild(yesBtn);

      formElement.appendChild(formContent);

      document.querySelectorAll("button").forEach((occurence) => {
        let id = occurence.getAttribute("id");
        occurence.addEventListener("click", async function () {
          if (id === "trueBtn") {
            const buttonTxt = document.getElementById("programmFurniture");
            buttonTxt.innerText = `Klicke ein/e ${"Bett"} jetzt an...`;

            var bedtest = document.getElementById(`${"Bett"}`);
            bedtest.checked = true;
          }
        });
      });

      await allElements();
      await getAllFurniture();
      await getRefDirectionFurniture();
      await startPositionAllSubsetMeshes(allSubsetMeshes);

      const visibleCheckboxes = document.getElementsByClassName(
        "tabcontent-flexible"
      );
      const checkboxesFurn = visibleCheckboxes[0];
      checkboxesFurn.style.visibility = "hidden";

      for (let id = 0; id < allSubsetMeshes.length; id++) {
        allSubsetMeshesIDs.push(allSubsetMeshes[id].uuid);
      }
    } else {
      furnituremodeIsActive = false;
      const visibleCheckboxes = document.getElementsByClassName(
        "tabcontent-flexible"
      );
      const checkboxesFurn = visibleCheckboxes[0];
      checkboxesFurn.style.visibility = "hidden";
    }

    if (id === "checkedBtn") {
      checkedBtnmodeIsActive = true;
      const buttonTxt = document.getElementById("programmFurniture");
      buttonTxt.innerText = `Möbelauswahl`;
      input.shift();

      if (input.length >= 1) {
        activateButton.style.color = "grey";
        activateButton.disabled = true;

        activatePopUpMenu(input, checkBtn);
      } else {
        checkBtn.style.color = "grey";
        checkBtn.disabled = true;
        checkBtn.style.visibility = "hidden";
        buttonTxt.innerText = ``;
        canvas.onpointerup = () => console.log("hey1");
      }
    } else {
      checkedBtnmodeIsActive = false;
    }

    if (id === "storymode") {
      storymodeIsActive = true;

      hightlightMaterialSecond.opacity = 0.0;
      for (let id = 0; id < areas.length; id++) {
        for (let mat = 0; mat < checkedMats.length; mat++) {
          areas[id].material = checkedMats[id];
          areas[id].position.set(
            areas[id].position.x,
            0.0,
            areas[id].position.z
          );
        }
      }

      for (let ref = 0; ref < areas.length; ref++) {
        if (areas[ref].uuid === specificFurnIDList[2].value) {
          if (ReferenceDirections[ref].x < 0) {
            const spherePos = allSubsetMeshes[ref].children[0].getWorldPosition(
              new Vector3()
            );
            spherePos.x = areas[ref].position.x;
            const vectorDir = new Vector3(
              areas[ref].position.z - spherePos.z,
              areas[ref].position.x - spherePos.x,
              0
            );

            modifiedDirections.push(vectorDir.normalize());
          }
          if (ReferenceDirections[ref].x > 0) {
            const spherePos = allSubsetMeshes[ref].children[0].getWorldPosition(
              new Vector3()
            );
            spherePos.x = areas[ref].position.x;
            const vectorDir = new Vector3(
              areas[ref].position.z - spherePos.z,
              areas[ref].position.x - spherePos.x,
              0
            );

            modifiedDirections.push(vectorDir.normalize());
          }
          if (ReferenceDirections[ref].y < 0) {
            const spherePos = allSubsetMeshes[ref].children[0].getWorldPosition(
              new Vector3()
            );
            spherePos.z = areas[ref].position.z;
            const vectorDir = new Vector3(
              areas[ref].position.z - spherePos.z,
              areas[ref].position.x - spherePos.x,
              0
            );

            modifiedDirections.push(vectorDir.normalize());
          }
          if (ReferenceDirections[ref].y > 0) {
            const spherePos = allSubsetMeshes[ref].children[0].getWorldPosition(
              new Vector3()
            );
            spherePos.z = areas[ref].position.z;
            const vectorDir = new Vector3(
              areas[ref].position.z - spherePos.z,
              areas[ref].position.x - spherePos.x,
              0
            );

            modifiedDirections.push(vectorDir.normalize());
          }
        }
        if (areas[ref].uuid === specificFurnIDList[0].value) {
          if (ReferenceDirections[ref].x < 0) {
            const spherePos = allSubsetMeshes[ref].children[0].getWorldPosition(
              new Vector3()
            );
            spherePos.x = areas[ref].position.x;
            const vectorDir = new Vector3(
              areas[ref].position.z - spherePos.z,
              areas[ref].position.x - spherePos.x,
              0
            );

            modifiedDirections.push(vectorDir.normalize());
          }
          if (ReferenceDirections[ref].x > 0) {
            const spherePos = allSubsetMeshes[ref].children[0].getWorldPosition(
              new Vector3()
            );
            spherePos.x = areas[ref].position.x;
            const vectorDir = new Vector3(
              areas[ref].position.z - spherePos.z,
              areas[ref].position.x - spherePos.x,
              0
            );

            modifiedDirections.push(vectorDir.normalize());
          }
          if (ReferenceDirections[ref].y < 0) {
            const spherePos = allSubsetMeshes[ref].children[0].getWorldPosition(
              new Vector3()
            );
            spherePos.z = areas[ref].position.z;
            const vectorDir = new Vector3(
              areas[ref].position.z - spherePos.z,
              areas[ref].position.x - spherePos.x,
              0
            );

            modifiedDirections.push(vectorDir.normalize());
          }
          if (ReferenceDirections[ref].y > 0) {
            const spherePos = allSubsetMeshes[ref].children[0].getWorldPosition(
              new Vector3()
            );
            spherePos.z = areas[ref].position.z;
            const vectorDir = new Vector3(
              areas[ref].position.z - spherePos.z,
              areas[ref].position.x - spherePos.x,
              0
            );

            modifiedDirections.push(vectorDir.normalize());
          }
        }
        if (
          areas[ref].uuid !== specificFurnIDList[0].value &&
          areas[ref].uuid !== specificFurnIDList[2].value
        ) {
          const spherePos = allSubsetMeshes[ref].children[0].getWorldPosition(
            new Vector3()
          );
          const vectorDir = new Vector3(
            areas[ref].position.z - spherePos.z,
            areas[ref].position.x - spherePos.x,
            0
          );

          modifiedDirections.push(vectorDir.normalize());
        }
      }

      if (storymodeIsActive) {
        deleteButton.style.visibility = "hidden";
      }

      for (let p = 0; p < doorSub[0].length; p++) {
        scene.remove(doorSub[0][p]);
      }
      for (let p = 0; p < windowSub[0].length; p++) {
        scene.remove(windowSub[0][p]);
      }

      for (let p = 0; p < slabSub[0].length; p++) {
        scene.remove(slabSub[0][p]);
      }
    } else {
      storymodeIsActive = false;
    }

    if (id === "dincheckmode") {
      const uploadbtn = document.getElementById("dincheckmode");
      uploadbtn.onclick = clickedOnce(
        "demo",
        " ",
        "dincheck-buttonhover",
        uploadbtn
      );
      canvas.onpointerdown = () => console.log("hey");
      dincheckmodeIsActive = true;

      // Other Areas 1.5 x 1.5
      const sizeArea = 1.5;
      for (let id = 0; id < specificFurnIDList.length; id++) {
        const specificID = Object.entries(specificFurnIDList[id]);
        foundMeshesCheckbox.push(specificID[1][1]);
      }
      for (let g = 0; g < allSubsetMeshesIDs.length; g++) {
        const index = foundMeshesCheckbox.indexOf(allSubsetMeshesIDs[g]);
        if (index === -1) {
          const indexNoarea = allSubsetMeshesIDs.indexOf(allSubsetMeshesIDs[g]);
          noSpecificAreaIndex.push(indexNoarea);
        }
      }
      for (let index = 0; index < noSpecificAreaIndex.length; index++) {
        const indexNoarea = noSpecificAreaIndex[index];

        noSpecificFurnIDList.push(areaMeshes[indexNoarea].uuid);

        if (ReferenceDirections[indexNoarea].x > 0) {
          const areaRandom = new BoxGeometry(sizeArea, 0.005, sizeArea);
          const areaRandomMesh = new Mesh(
            areaRandom,
            new MeshBasicMaterial({
              color: areaIntersectAreaColor,
              transparent: true,
              opacity: 0.3,
            })
          );

          areaRandomMesh.position.set(
            areaMeshes[indexNoarea].position.x,
            0,
            areaMeshes[indexNoarea].position.z +
              sizeArea / 2 +
              areaMeshes[indexNoarea].geometry.parameters.depth / 2
          );

          scene.add(areaRandomMesh);
          areaMeshes.splice(indexNoarea, 1, areaRandomMesh);
          areasInFront.push(areaRandomMesh);
        }

        if (ReferenceDirections[indexNoarea].x < 0) {
          const areaRandom = new BoxGeometry(sizeArea, 0.005, sizeArea);
          const areaRandomMesh = new Mesh(
            areaRandom,
            new MeshBasicMaterial({
              color: areaIntersectAreaColor,
              transparent: true,
              opacity: 0.3,
            })
          );
          const size = allSubsetMeshes[
            indexNoarea
          ].geometry.boundingBox.getSize(new Vector3());
          areaRandomMesh.position.set(
            areaMeshes[indexNoarea].position.x,
            0,
            areaMeshes[indexNoarea].position.z - sizeArea / 2 - size.z / 2
          );

          scene.add(areaRandomMesh);
          areaMeshes.splice(indexNoarea, 1, areaRandomMesh);
          areasInFront.push(areaRandomMesh);
        }
        if (ReferenceDirections[indexNoarea].y > 0) {
          const areaRandom = new BoxGeometry(sizeArea, 0.005, sizeArea);
          const areaRandomMesh = new Mesh(
            areaRandom,
            new MeshBasicMaterial({
              color: areaIntersectAreaColor,
              transparent: true,
              opacity: 0.3,
            })
          );
          areaRandomMesh.position.set(
            areaMeshes[indexNoarea].position.x +
              sizeArea / 2 +
              areaMeshes[indexNoarea].geometry.parameters.width / 2,
            0,
            areaMeshes[indexNoarea].position.z
          );
          scene.add(areaRandomMesh);
          areaMeshes.splice(indexNoarea, 1, areaRandomMesh);
          areasInFront.push(areaRandomMesh);
        }
        if (ReferenceDirections[indexNoarea].y < 0) {
          const areaRandom = new BoxGeometry(sizeArea, 0.005, sizeArea);
          const areaRandomMesh = new Mesh(
            areaRandom,
            new MeshBasicMaterial({
              color: areaIntersectAreaColor,
              transparent: true,
              opacity: 0.3,
            })
          );
          areaRandomMesh.position.set(
            areaMeshes[indexNoarea].position.x -
              sizeArea / 2 -
              areaMeshes[indexNoarea].geometry.parameters.width / 2,
            0,
            areaMeshes[indexNoarea].position.z
          );

          scene.add(areaRandomMesh);
          areaMeshes.splice(indexNoarea, 1, areaRandomMesh);

          areasInFront.push(areaRandomMesh);
        }
      }

      const buttonTxt = document.getElementById("programmFurniture");
      buttonTxt.innerText = ``;

      checkallmodeIsActive = true;
      furnituremodeIsActive = false;

      for (let object = 0; object < areaMeshes.length; object++) {
        const areasChild = areaMeshes[object].children[0];

        areas.push(areasChild);
      }

      areas = areaMeshes;

      for (let ref = 0; ref < areas.length; ref++) {
        const pos = new Vector3(
          areas[ref].position.x,
          areas[ref].position.y,
          areas[ref].position.z
        );
        resetPositionsFurn.push(pos);

        const distanceX = startPositionsFurns[ref].x - pos.x;
        const distanceY = startPositionsFurns[ref].y - pos.y;
        const distanceZ = startPositionsFurns[ref].z - pos.z;

        ReferencePositions.push(new Vector3(distanceX, distanceY, distanceZ));

        resetRotationFurn.push(
          new Vector3(
            areas[ref].rotation.x,
            areas[ref].rotation.y,
            areas[ref].rotation.z
          )
        );
        const RefDirArea = new Vector3(
          areas[ref].rotation.x,
          areas[ref].rotation.y,
          areas[ref].rotation.z
        ).normalize();

        if (RefDirArea.x === 0 && RefDirArea.y === 0 && RefDirArea.z === 0) {
          RefDirArea.x = ReferenceDirections[ref].x;
          RefDirArea.y = ReferenceDirections[ref].y;
          RefDirArea.z = ReferenceDirections[ref].z;
        }
        ReferenceDirectionsAreas.push(RefDirArea);
      }

      boundingBoxes(areas);
    } else {
      checkallmodeIsActive = false;
      dincheckmodeIsActive = false;
    }

    //DIN Check on click
    if (id === "checkall-button") {
      dincheckBtnIsActive = true;

      const checkallbtn = document.getElementById("checkall-button");
      checkallbtn.onclick = clickedOnce(
        "demo",
        "DIN Check wurde ausgeführt",
        "dincheck-buttonhover",
        checkallbtn
      );

      DINCHECKER();

      translateAreaIfCollision(specificFurnIDList, 2, 0.6, 0.6);
      translateAreaIfCollision(specificFurnIDList, 0, 0.3, 0.3);

      for (let id = 0; id < areas.length; id++) {
        areas[id].material.color = greyColor;
      }

      boundingCubes.length = 0;
      boundingBoxes(areas);
      DINCHECKER();

      for (let id = 0; id < areas.length; id++) {
        const materialStart = areas[id].material;
        checkedMats.push(materialStart);
      }

      createTreeMenu(ifcProject, "tree-root");
    } else {
      dincheckBtnIsActive = false;
    }

    if (id === "downloadmode") {
      downloadmodeIsActive = true;
      for (let i = 0; i < allSubsetMeshes.length; i++) {
        const geom = new Box3(new Vector3(), new Vector3());
        geom.setFromObject(allSubsetMeshes[i]);
        geom
          .copy(allSubsetMeshes[i].geometry.boundingBox)
          .applyMatrix4(allSubsetMeshes[i].matrixWorld);
      }

      document.addEventListener(
        "pointerup",
        overwriteIfcFile(event, allSubsetMeshes)
      );
    } else {
      downloadmodeIsActive = false;
    }
  });
});

window.addEventListener("keydown", async function (event) {
  switch (event.keyCode) {
    case 84: // T
      gumball.setMode("translate");
      gumball.showY = false;
      gumball.showZ = true;
      gumball.showX = true;
      break;

    case 69: // E
      // control.setMode( 'scale' );
      //         break;

      break;

    case 82: // R
      gumball.setRotationSnap(MathUtils.degToRad(90));

      gumball.showY = true;
      gumball.showZ = false;
      gumball.showX = false;

      gumball.setMode("rotate");

      break;

    case 65: // A
      if (storymodeIsActive === true) {
        aIsDown = true;
      }
      break;

    case 90: // Z
      //console.log("Z down", areas[lastIndex], allSubsetMeshes[lastIndex],specificFurnIDList)
      backPickFurn = true;
      if (backPickFurn && !storymodeIsActive) {
        scene.remove(areaMeshes[indexFound]);

        const modifiedCenter = new Vector3(
          centerPoints[indexFound].x,
          centerPoints[indexFound].y - centerPoints[indexFound].y,
          centerPoints[indexFound].z
        );

        const geom1 = new SphereGeometry(0.02);
        const centerSphere = new Mesh(
          geom1,
          new MeshPhongMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.0,
          })
        );
        centerSphere.position.set(
          centerPoints[indexFound].x,
          centerPoints[indexFound].y,
          centerPoints[indexFound].z
        );
        //scene.add(centerSphere)

        //movement areas random

        const areaRandom = new BoxGeometry(
          furnSizes[indexFound].x,
          0.005,
          furnSizes[indexFound].z
        );
        const areaRandomMesh = new Mesh(
          areaRandom,
          new MeshBasicMaterial({
            color: "lightgray",
            transparent: true,
            opacity: 0.6,
          })
        );

        areaRandomMesh.position.set(
          centerPoints[indexFound].x,
          0,
          centerPoints[indexFound].z
        );
        allSubsetMeshes[indexFound].add(centerSphere);
        allSubsetMeshes[indexFound].add(areaRandomMesh);

        areaMeshes[indexFound].uuid = allSubsetMeshes[indexFound].uuid;

        areaMeshes.splice(indexFound, 1, areaRandomMesh);
        delete specificFurnIDList[specificFurnIDList.length - 1].key;
        delete specificFurnIDList[specificFurnIDList.length - 1].value;

        specificFurnIDList.pop();

        scene.add(areaMeshes[indexFound]);
      }

      break;

    case 87: // w
      for (let l = 0; l < startPositionAreas.length; l++) {
        scene.remove(startPositionAreas[l]);
        startPositionAreas.length = 0;
      }
      for (let z = 0; z < labelMeasure.length; z++) {
        scene.remove(labelMeasure[z]);
        labelMeasure.length = 0;
      }
      for (let l = 0; l < lines.length; l++) {
        scene.remove(lines[l]);
        lines.length = 0;
      }

      if (storymodeIsActive === true) {
        //console.log("w is pressed")
        wIsDown = true;
      }
      break;
  }
});

window.addEventListener("keyup", function (event) {
  for (let i = 0; i < ReferenceDirectionsAreas.length; i++) {
    ReferenceDirectionsAreas[i].normalize();
  }

  switch (event.keyCode) {
    case 87: // w
      if (storymodeIsActive === true) {
        //console.log("w is lift")
      }
      break;

    case 90: // Z
      backPickFurn = false;
      if (storymodeIsActive) {
        //console.log("Z",  wallSubsetMeshes[lastIndex].position, resetPositionsWall[lastIndex], resetPositionsFurn[lastIndex] , resetRotationFurn)
        wallSubsetMeshes[lastIndex].position.set(
          resetPositionsWall[lastIndex].x,
          resetPositionsWall[lastIndex].y,
          resetPositionsWall[lastIndex].z
        );

        areaMeshes[lastIndex].position.set(
          resetPositionsFurn[lastIndex].x,
          resetPositionsFurn[lastIndex].y,
          resetPositionsFurn[lastIndex].z
        );
        areaMeshes[lastIndex].rotation.set(
          resetRotationFurn[lastIndex].x,
          resetRotationFurn[lastIndex].y,
          resetRotationFurn[lastIndex].z
        );
      }
      break;

    case 16: // Shift
      gumball.setTranslationSnap(null);
      gumball.setRotationSnap(null);
      gumball.setScaleSnap(null);
      break;

    case 69: // E
      if (
        areas[lastIndex].uuid === specificFurnIDList[2].value ||
        areas[lastIndex].uuid === specificFurnIDList[0].value
      ) {
        const occurs = translationList.includes(areas[lastIndex].uuid);

        if (occurs) {
          counter -= 1;
          if (counter === -2) {
            translateAreaPush(lastIndex, -0.6, -0.6, -0.3, -0.3);
            counter += 1;
          } else if (counter === -1) {
            translateAreaPush(lastIndex, 0.6, 0.6, 0.3, 0.3);
            counter += 2;
          } else if (counter === 0) {
            translateAreaPush(lastIndex, -0.6, -0.6, -0.3, -0.3);
          }
        }
        if (!occurs) {
          counter -= 1;
          if (counter === -2) {
            translateAreaPush(lastIndex, 0.6, 0.6, 0.3, 0.3);
            counter += 1;
          } else if (counter === -1) {
            translateAreaPush(lastIndex, -0.6, -0.6, -0.3, -0.3);
            counter += 2;
          } else if (counter === 0) {
            translateAreaPush(lastIndex, 0.6, 0.6, 0.3, 0.3);
          }
        }
      }

      break;
  }
});

function translateAreaPush(lastIndex, moveX, moveZ, moveX2, moveZ2) {
  if (areas[lastIndex].uuid === specificFurnIDList[2].value) {
    indexWC = lastIndex;
    lastPosition = areas[indexWC].position;

    if (ReferenceDirections[indexWC].x === -1) {
      areas[indexWC].children[0].translateX(moveX);
      translationList.push(areas[indexWC].uuid);

      areas[indexWC].geometry.boundingBox;
      // const boxhelper = new BoxHelper(areas[indexWC], 0x000000)
      // scene.add(boxhelper)
    }
    if (ReferenceDirections[indexWC].x === 1) {
      areas[indexWC].children[0].translateX(moveX);
      areas[indexWC].geometry.boundingBox;
      translationList.push(areas[indexWC].uuid);
    }
    if (ReferenceDirections[indexWC].y === -1) {
      areas[indexWC].children[0].translateZ(moveZ);
      areas[indexWC].geometry.boundingBox;
      translationList.push(areas[indexWC].uuid);
    }
    if (ReferenceDirections[indexWC].y === 1) {
      areas[indexWC].children[0].translateZ(moveZ);
      areas[indexWC].geometry.boundingBox;
      translationList.push(areas[indexWC].uuid);
    }
  } else if (areas[lastIndex].uuid === specificFurnIDList[0].value) {
    //console.log("Found2",areas[lastIndex], specificFurnIDList[0].value )

    indexWC = lastIndex;
    lastPosition = areas[indexWC].position;
    if (ReferenceDirections[indexWC].x === -1) {
      areas[indexWC].children[0].translateX(moveX2);
      translationList.push(areas[indexWC].uuid);

      areas[indexWC].geometry.boundingBox;
      // const boxhelper = new BoxHelper(areas[indexWC], 0x000000)
      // scene.add(boxhelper)
    }
    if (ReferenceDirections[indexWC].x === 1) {
      areas[indexWC].children[0].translateX(moveX2);
      areas[indexWC].geometry.boundingBox;
      translationList.push(areas[indexWC].uuid);
      // const boxhelper = new BoxHelper(areas[indexWC], 0x000000)
      // scene.add(boxhelper)
    }
    if (ReferenceDirections[indexWC].y === -1) {
      areas[indexWC].children[0].translateZ(moveZ2);
      areas[indexWC].geometry.boundingBox;
      translationList.push(areas[indexWC].uuid);
    }
    if (ReferenceDirections[indexWC].y === 1) {
      areas[indexWC].children[0].translateZ(moveZ2);
      areas[indexWC].geometry.boundingBox;
      translationList.push(areas[indexWC].uuid);
    }
  } else {
    return;
  }
}

function boundingBoxes(meshes) {
  for (let cube of meshes) {
    let cube1BB = new Box3(new Vector3(), new Vector3());
    cube1BB.setFromObject(cube);
    scene.add(cube);
    boundingCubes.push(cube1BB);
  }
}

//-------------------------UPDATE --------------------------
//---------------------------------------------------------------------------------
const animate = () => {
  if (furnituremodeIsActive === true) {
    canvas.onpointerdown = (event) =>
      pickFurniture(event, selectionMaterialFurniture, allSubsetMeshes);
  }

  if (storymodeIsActive === true) {
    for (let p = 0; p < slabSub[0].length; p++) {
      scene.remove(slabSub[0][p]);
    }

    async function pickingAndChecking() {
      if (!wIsDown) {
        pickFurnitureSecond(event, allSubsetMeshes, areas);
      }

      if (wIsDown) {
        //console.log("w", wIsDown)
        lastIndex = undefined;
        if (gumball.mode === "rotate") {
          gumball.setMode("translate");
        }

        await pickFurnitureWall(event, wallSubsetMeshes, wallSubsetMeshes);

        //console.log("last", wallSubsetMeshes[lastIndex])

        await getRelatedWalls(wallSubsetMeshes);
        async function getRelatedWalls(furnitureMeshes) {
          relatingWalls = await loader.ifcManager.getAllItemsOfType(
            0,
            IFCRELCONNECTSPATHELEMENTS,
            true
          );

          for (let wall = 0; wall < relatingWalls.length; wall++) {
            const selectedWall = relatingWalls[wall].RelatedElement.value;
            const relatingWall = relatingWalls[wall].RelatingElement.value;

            if (
              furnitureMeshes[lastIndex].uuid ===
              relatingWalls[wall].RelatedElement.value
            ) {
              relatedID.push(
                wallSubsetMeshesIDs[0].indexOf(
                  relatingWalls[wall].RelatingElement.value
                )
              );
              selectedWallToRelate.push(
                relatingWalls[wall].RelatedElement.value
              );

              //console.log("hey wall", selectedWall, relatingWall, wallSubsetMeshesIDs, relatedID, furnitureMeshes[relatedID],furnitureMeshes[lastIndex] )
            }
            if (
              furnitureMeshes[lastIndex].uuid ===
              relatingWalls[wall].RelatingElement.value
            ) {
              relatedID.push(
                wallSubsetMeshesIDs[0].indexOf(
                  relatingWalls[wall].RelatedElement.value
                )
              );
              selectedWallToRelate.push(
                relatingWalls[wall].RelatingElement.value
              );

              //console.log("hey wall2", selectedWall, relatingWall, wallSubsetMeshesIDs, relatedID, furnitureMeshes[relatedID],furnitureMeshes[lastIndex] )
            }
          }
        }

        for (let i = 0; i < relatedID.length; i++) {
          relatedWalls.push(wallSubsetMeshes[relatedID[i]]);
        }

        for (let wall = 0; wall < relatingWalls.length; wall++) {
          for (let r = 0; r < relatedWalls.length; r++) {
            if (
              relatedWalls[r].uuid === relatingWalls[wall].RelatedElement.value
            ) {
              //console.log("others", wallSubsetMeshesIDs[0].indexOf(relatingWalls[wall].RelatingElement.value), relatedWalls[r].uuid, relatingWalls[wall].RelatingElement.value)
              otherRelatedID.push(relatingWalls[wall].RelatingElement.value);
              otherRelatedWalls.push(relatedWalls[r].uuid);

              otherRelatedIDIndex.push(
                wallSubsetMeshesIDs[0].indexOf(
                  relatingWalls[wall].RelatingElement.value
                )
              );
            }
            if (
              relatedWalls[r].uuid === relatingWalls[wall].RelatingElement.value
            ) {
              //console.log("others2", wallSubsetMeshesIDs[0].indexOf(relatingWalls[wall].RelatedElement.value),relatedWalls[r].uuid, relatingWalls[wall].RelatedElement.value )
              otherRelatedID.push(relatingWalls[wall].RelatedElement.value);
              otherRelatedWalls.push(relatedWalls[r].uuid);
            }
          }
        }
        //console.log("LISTEN",otherRelatedID, otherRelatedWalls )
      }

      // if(aIsDown){
      //     //console.log("a", aIsDown)
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

    canvas.onpointermove = () => collisionCheckLoop();
    canvas.onpointerdown = () => pickingAndChecking();

    canvas.onpointerup = () => {
      for (let p = 0; p < doorSub[0].length; p++) {
        scene.remove(doorSub[0][p]);
      }
      for (let p = 0; p < windowSub[0].length; p++) {
        scene.remove(windowSub[0][p]);
      }

      for (let i = 0; i < wallSubsetMeshes.length; i++) {
        scene.remove(wallSubsetMeshes[i]);
      }
      distances.length = 0;

      for (let j = 0; j < otherRelatedID.length; j++) {
        for (let i = 0; i < wallSubsetMeshes.length; i++) {
          if (wallSubsetMeshes[i].uuid === otherRelatedID[j]) {
            cleanWallIndex.push(i);
            const distX =
              wallSubsetMeshes[i].position.x -
              wallSubsetMeshes[lastIndex].position.x;
            const distY =
              wallSubsetMeshes[i].position.y -
              wallSubsetMeshes[lastIndex].position.y;
            const distZ =
              wallSubsetMeshes[i].position.z -
              wallSubsetMeshes[lastIndex].position.z;
            let distance = Math.sqrt(
              distX * distX + distY * distY + distZ * distZ
            );

            if (distance > 0) {
              distances.push(distance);
              cleanWallId.push(otherRelatedWalls[j]);
            }
          }
        }
      }

      for (let j = 0; j < cleanWallId.length; j++) {
        if (getOccurence(cleanWallId, cleanWallId[j]) > 1) {
          const index = cleanWallId.lastIndexOf(cleanWallId[j]);
          const indexFirst = cleanWallId.indexOf(cleanWallId[j]);

          doubleTime.push([distances[indexFirst], distances[index]]);
          doubleTimeIndex.push([indexFirst, index]);
        }
      }

      for (let i = 0; i < doubleTime.length; i++) {
        for (let q = 0; q < relatedID.length; q++) {
          if (
            otherRelatedWalls[doubleTimeIndex[i][0]] ===
            wallSubsetMeshes[relatedID[q]].uuid
          ) {
            const dist0 =
              doubleTime[i][0] -
              wallSubsetMeshes[relatedID[q]].geometry.parameters.width;
            const dist1 =
              doubleTime[i][1] -
              wallSubsetMeshes[relatedID[q]].geometry.parameters.width;

            const distanceO = Math.sqrt(dist0 * dist0);
            const distance1 = Math.sqrt(dist1 * dist1);

            if (doubleTime[i][0] > doubleTime[i][1]) {
              //console.log("0 > 1", doubleTime[i][0], doubleTime[i][1],  distances[doubleTimeIndex[i][1]])
              distances[doubleTimeIndex[i][0]] = doubleTime[i][0];
              distances[doubleTimeIndex[i][1]] = doubleTime[i][0];
            }
            if (doubleTime[i][0] < doubleTime[i][1]) {
              //console.log("0 < 1", doubleTime[i][0], doubleTime[i][1],  distances[doubleTimeIndex[i][1]])
              distances[doubleTimeIndex[i][0]] = doubleTime[i][1];
              distances[doubleTimeIndex[i][1]] = doubleTime[i][1];
            }
          }
        }
      }

      for (let i = 0; i < relatedID.length; i++) {
        const relatedIDs = relatedID[i];

        for (let u = 0; u < cleanWallId.length; u++) {
          if (wallSubsetMeshes[relatedIDs].uuid === cleanWallId[u]) {
            const distance = distances[u];
            if (wallDirection[relatedIDs].y === 1) {
              if (wallSubsetMeshes[lastIndex].position.z > 0) {
                //console.log("greater y1 0")

                wallMeshDynamicGeneration(
                  distance,
                  3,
                  wallDimensionsY[relatedIDs] - 0.01,
                  wallCenterPoints[relatedIDs].x,
                  1.5,
                  wallSubsetMeshes[lastIndex].position.z - distance / 2,
                  Math.PI / 2
                );
              }
              if (wallSubsetMeshes[lastIndex].position.z < 0) {
                //console.log("smaller y1 0", wallSubsetMeshes[relatedIDs])

                wallMeshDynamicGeneration(
                  distance,
                  3,
                  wallDimensionsY[relatedIDs] - 0.01,
                  wallCenterPoints[relatedIDs].x,
                  1.5,
                  wallSubsetMeshes[lastIndex].position.z + distance / 2,
                  Math.PI / 2
                );

                wallMeshSpheres[relatedIDs].position.set(
                  wallMeshSpheres[relatedIDs].position.x,
                  wallMeshSpheres[relatedIDs].position.y,
                  wallMeshSpheres[relatedIDs].position.z
                );
              }
            }

            if (wallDirection[relatedIDs].y === -1) {
              if (wallSubsetMeshes[lastIndex].position.z > 0) {
                //console.log("smaller y-1 0", )

                wallMeshDynamicGeneration(
                  distance,
                  3,
                  wallDimensionsY[relatedIDs] - 0.01,
                  wallCenterPoints[relatedIDs].x,
                  1.5,
                  wallSubsetMeshes[lastIndex].position.z - distance / 2,
                  Math.PI / 2
                );
              }
              if (wallSubsetMeshes[lastIndex].position.z < 0) {
                //console.log("smaller y-1 0", wallSubsetMeshes[relatedIDs])

                wallMeshDynamicGeneration(
                  distance,
                  3,
                  wallDimensionsY[relatedIDs] - 0.01,
                  wallCenterPoints[relatedIDs].x,
                  1.5,
                  wallSubsetMeshes[lastIndex].position.z + distance / 2,
                  Math.PI / 2
                );
              }
            }

            if (wallDirection[relatedIDs].x === 1) {
              if (wallSubsetMeshes[lastIndex].position.x > 0) {
                //console.log("greater x1 0")

                wallMeshDynamicGeneration(
                  distance,
                  3,
                  wallDimensionsY[relatedIDs] - 0.01,
                  wallSubsetMeshes[lastIndex].position.x - distance / 2,
                  1.5,
                  wallCenterPoints[relatedIDs].z,
                  0
                );
              }
              if (wallSubsetMeshes[lastIndex].position.x < 0) {
                //console.log("smaller x1 0", wallSubsetMeshes[relatedIDs])

                wallMeshDynamicGeneration(
                  distance,
                  3,
                  wallDimensionsY[relatedIDs] - 0.01,
                  distance / 2 - -wallSubsetMeshes[lastIndex].position.x,
                  1.5,
                  wallCenterPoints[relatedIDs].z,
                  0
                );
              }
            }
            if (wallDirection[relatedIDs].x === -1) {
              if (wallSubsetMeshes[lastIndex].position.x > 0) {
                //console.log("smaller x-1 0", )

                wallMeshDynamicGeneration(
                  distance,
                  3,
                  wallDimensionsY[relatedIDs] - 0.01,
                  wallSubsetMeshes[lastIndex].position.x - distance / 2,
                  1.5,
                  wallCenterPoints[relatedIDs].z,
                  0
                );
              }
              if (wallSubsetMeshes[lastIndex].position.x < 0) {
                //console.log("smaller x-1 0", wallSubsetMeshes[relatedIDs])

                wallMeshDynamicGeneration(
                  -distance,
                  3,
                  wallDimensionsY[relatedIDs] - 0.01,
                  distance / 2 - -wallSubsetMeshes[lastIndex].position.x,
                  1.5,
                  wallCenterPoints[relatedIDs].z,
                  0
                );
              }
            }
          }
        }

        function wallMeshDynamicGeneration(
          boxwidth,
          boxheight,
          boxlenght,
          posX,
          posY,
          posZ,
          angle
        ) {
          const wallCopy = new BoxGeometry(boxwidth, boxheight, boxlenght);
          const wallDynamicMesh = new Mesh(
            wallCopy,
            new MeshBasicMaterial({
              color: "grey",
              transparent: true,
              opacity: 0.6,
            })
          );
          wallDynamicMesh.position.set(posX, posY, posZ);
          wallDynamicMesh.rotateY(angle);

          wallDynamicMesh.uuid = wallSubsetMeshes[relatedIDs].uuid;

          const child = wallSubsetMeshes[relatedIDs].children[0];
          wallSubsetMeshes[relatedIDs] = wallDynamicMesh;
          wallSubsetMeshes[relatedIDs].add(child);

          wallDynamicMesh.geometry.computeBoundsTree();

          let wallBB = new Box3(new Vector3(), new Vector3());
          wallBB.copy(wallDynamicMesh.geometry.boundingBox);
          wallDynamicMesh.updateMatrixWorld(true);

          wallBB.applyMatrix4(wallDynamicMesh.matrixWorld);

          wallBounds[relatedIDs] = wallBB;

          centerWall1 = wallBB.getCenter(new Vector3());

          wallCenterPoints[relatedIDs] = centerWall1;

          wallsDynamicListe.push(wallDynamicMesh);

          if (wallDirection[lastIndex].x === -1) {
            wallMeshSpheres[lastIndex].position.set(
              wallMeshSpheres[lastIndex].position.x,
              wallMeshSpheres[lastIndex].position.y,
              wallSubsetMeshes[lastIndex].position.z
            );
          }
          if (wallDirection[lastIndex].x === 1) {
            wallMeshSpheres[lastIndex].position.set(
              wallMeshSpheres[lastIndex].x,
              wallMeshSpheres[lastIndex].position.y,
              wallSubsetMeshes[lastIndex].position.z
            );
          }
          if (wallDirection[lastIndex].y === -1) {
            wallMeshSpheres[lastIndex].position.set(
              wallSubsetMeshes[lastIndex].position.x,
              wallMeshSpheres[lastIndex].position.y,
              wallMeshSpheres[lastIndex].z
            );
          }
          if (wallDirection[lastIndex].y === 1) {
            wallMeshSpheres[lastIndex].position.set(
              wallSubsetMeshes[lastIndex].position.x,
              wallMeshSpheres[lastIndex].position.y,
              wallMeshSpheres[lastIndex].z
            );
          }

          if (wallDirection[relatedIDs].x === -1) {
            wallMeshSpheres[relatedIDs].position.set(
              wallSubsetMeshes[lastIndex].position.x,
              wallMeshSpheres[relatedIDs].position.y,
              wallMeshSpheres[relatedIDs].position.z
            );
          }
          if (wallDirection[relatedIDs].x === 1) {
            wallMeshSpheres[relatedIDs].position.set(
              wallSubsetMeshes[lastIndex].position.x,
              wallMeshSpheres[relatedIDs].position.y,
              wallMeshSpheres[relatedIDs].position.z
            );
          }
          if (wallDirection[relatedIDs].y === -1) {
            wallMeshSpheres[relatedIDs].position.set(
              wallMeshSpheres[relatedIDs].position.x,
              wallMeshSpheres[relatedIDs].position.y,
              wallSubsetMeshes[lastIndex].position.z
            );
          }
          if (wallDirection[relatedIDs].y === 1) {
            wallMeshSpheres[relatedIDs].position.set(
              wallMeshSpheres[relatedIDs].position.x,
              wallMeshSpheres[relatedIDs].position.y,
              wallSubsetMeshes[lastIndex].position.z
            );
          }

          wallCenterPoints[lastIndex] = wallSubsetMeshes[lastIndex].position;
        }
      }

      for (let i = 0; i < wallSubsetMeshes.length; i++) {
        wallSubsetMeshesStartPositions[i] = new Vector3(
          wallSubsetMeshes[i].position.x,
          wallSubsetMeshes[i].position.y,
          wallSubsetMeshes[i].position.z
        );

        wallSubset[i].position.set(
          -wallSubsetMeshes[i].position.x,
          -wallSubsetMeshes[i].position.y,
          -wallSubsetMeshes[i].position.z
        );
        wallSubset[i].rotation.set(
          -wallSubsetMeshes[i].x,
          -wallSubsetMeshes[i].y,
          -wallSubsetMeshes[i].z
        );
        wallSubset[i].uuid = wallSubsetMeshes[i].uuid;
        wallSubsetMeshes[i].add(wallSubset[i]);

        scene.add(wallSubsetMeshes[i]);
      }
    };
  } else {
    gumball.removeEventListener("change", animate);
    scene.remove(gumball);
  }

  controls.update();

  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);

  // renderer.setAnimationLoop( function(){
  //     renderer.render(scene, camera);
  // });
  window.requestAnimationFrame(animate);
};

//-------------------------CONTROLS--------------------------
//---------------------------------------------------------------------------------

const distancesWall = [];
// Transform Controls
gumball = new TransformControls(camera, renderer.domElement);
gumball.addEventListener("change", animate);
gumball.addEventListener("dragging-changed", function (event) {
  controls.enabled = !event.value;
  if (storymodeIsActive) {
    createTreeMenu(ifcProject, "tree-root2");
  }
});

gumball.setSize(0.5);
gumball.showY = false;
gumball.showZ = true;
gumball.showX = true;

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

//-------------------------MATERIALS--------------------------
//---------------------------------------------------------------------------------

const hightlightMaterial = new MeshBasicMaterial({
  transparent: true,
  opacity: 0.5,
  color: 0xffcc99,
  depthTest: false,
});

const hightlightMaterialSecond = new MeshBasicMaterial({
  transparent: true,
  opacity: 0.5,
  color: orangeColor,
  depthTest: false,
});

const selectionMaterial = new MeshBasicMaterial({
  transparent: true,
  opacity: 0.5,
  color: 0xff4500,
  depthTest: false,
});

const selectionMaterialFurniture = new MeshBasicMaterial({
  transparent: true,
  opacity: 0.5,
  color: "red",
  depthTest: false,
});

const hidedObjectMaterial = new MeshBasicMaterial({
  transparent: true,
  opacity: 0.5,
  color: "grey",
  depthTest: false,
});

const slabMaterial = new MeshBasicMaterial({
  color: 0xe8e6d5,
  transparent: false,
  opacity: 1.0,
  depthTest: false,
});

const wallClashmaterial = new MeshBasicMaterial({
  color: wallCollisionColor,
  transparent: true,
  opacity: 0.5,
  depthTest: true,
});

const greenMaterial = new MeshBasicMaterial({
  color: orangeColor,
  transparent: true,
  opacity: 0.3,
  depthTest: false,
});

const sphereGeometry = new SphereGeometry(0.1);

//-------------------------HOVER AND CLICKING TREE MENU--------------------------
//---------------------------------------------------------------------------------

async function pick(event, material, getProps, ifcModels) {
  const found = castObjects(event, ifcModels)[0];
  if (found) {
    const index = found.faceIndex;
    lastModel = found.object;

    const geometry = found.object.geometry;

    // Id which collided with raycaster
    const ifc = loader.ifcManager;
    const id = ifc.getExpressId(geometry, index);

    loader.ifcManager.createSubset({
      modelID: found.object.modelID,
      ids: [id],
      material: material,
      scene,
      removePrevious: true,
    });
  } else if (lastModel) {
    loader.ifcManager.removeSubset(lastModel.modelID, material);
    lastModel = undefined;
  }
}

function translateAreaIfCollision(specificFurnIDList, a, moveX, moveZ) {
  for (let id = 0; id < specificFurnIDList.length; id++) {
    if (
      IntersectionsIDsAreaIntersectArea.includes(
        specificFurnIDList[a].value
      ) === true ||
      IntersectionsIDsAreaContainArea.includes(specificFurnIDList[a].value) ===
        true ||
      IntersectionsIDsFurnIntersectFurn.includes(
        specificFurnIDList[a].value
      ) === true ||
      IntersectionsIDsFurnContainFurn.includes(specificFurnIDList[a].value) ===
        true ||
      IntersectionsIDs.includes(specificFurnIDList[a].value) === true ||
      IntersectionsIDsFurnIntersectArea.includes(
        specificFurnIDList[a].value
      ) === true ||
      IntersectionsIDsFurnContainArea.includes(specificFurnIDList[a].value) ===
        true ||
      IntersectionsIDsAreaIntersectWall.includes(
        specificFurnIDList[a].value
      ) === true ||
      IntersectionsIDsAreaContainWall.includes(specificFurnIDList[a].value) ===
        true ||
      IntersectionsIDsFurnIntersectWall.includes(
        specificFurnIDList[a].value
      ) === true ||
      IntersectionsIDsFurnContainWall.includes(specificFurnIDList[a].value) ===
        true ||
      IntersectionsIDsAreaContainFurn.includes(specificFurnIDList[a].value) ===
        true
    ) {
      for (let i = 0; i < areas.length; i++) {
        if (areas[i].uuid === specificFurnIDList[a].value) {
          indexWC = i;
        }
      }
    } else {
      return;
    }
  }

  lastPosition = areas[indexWC].position;

  if (ReferenceDirections[indexWC].x === -1) {
    areas[indexWC].position.set(
      lastPosition.x + moveX,
      lastPosition.y,
      lastPosition.z
    );
    translationList.push(areas[indexWC].uuid);

    areas[indexWC].geometry.boundingBox;
    // const boxhelper = new BoxHelper(areas[indexWC], 0x000000)
    // scene.add(boxhelper)
  }
  if (ReferenceDirections[indexWC].x === 1) {
    areas[indexWC].position.set(
      lastPosition.x + moveX,
      lastPosition.y,
      lastPosition.z
    );
    areas[indexWC].geometry.boundingBox;
    translationList.push(areas[indexWC].uuid);
    // const boxhelper = new BoxHelper(areas[indexWC], 0x000000)
    // scene.add(boxhelper)
  }
  if (ReferenceDirections[indexWC].y === -1) {
    areas[indexWC].position.set(
      lastPosition.x,
      lastPosition.y,
      lastPosition.z + moveZ
    );
    areas[indexWC].geometry.boundingBox;
    translationList.push(areas[indexWC].uuid);
  }
  if (ReferenceDirections[indexWC].y === 1) {
    areas[indexWC].position.set(
      lastPosition.x,
      lastPosition.y,
      lastPosition.z + moveZ
    );
    areas[indexWC].geometry.boundingBox;
    translationList.push(areas[indexWC].uuid);
  }
}

function videoAfterTranslationWC(
  indexFurniture,
  indexFurniture2,
  sourceVideo1,
  sourceVideo2,
  sourceVideo3,
  sourceVideo4
) {
  for (let check = 0; check < translationList.length; check++) {
    if (foundMeshesCheckbox[indexFurniture] === translationList[check]) {
      const src = sourceVideo1; // transform gif to mp4
      // video -y gespiegelt
      return src;
    } else if (foundMeshesCheckbox[indexFurniture] !== translationList[check]) {
      const src = sourceVideo2; // transform gif to mp4
      // video -y nicht gespiegelt
      return src;
    }
  }
}

async function prepickByID(event, material, secondMaterial, Expressid, node) {
  loader.ifcManager.removeSubset(0, secondMaterial);
  loader.ifcManager.removeSubset(0, wallClashmaterial);
  for (let l = 0; l < labels.length; l++) {
    scene.remove(labels[l]);
  }

  labels.length = 0;
  prepickedSubset.length = 0;
  for (let l = 0; l < DINLabels.length; l++) {
    scene.remove(DINLabels[l]);
  }
  DINLabels.length = 0;

  const searchID = Expressid[0];

  if (searchedID !== undefined) {
    if (searchID !== searchedID) {
      removeSubsetAndGetOriginalMaterials(
        checkedListIntersectFurnAndArea,
        foundSubsets,
        indicesIntersectFurnAndArea,
        1
      );
    }
  }
  if (allLists.includes(searchID) === true) {
    const problembtn = document.createElement("button");
    problembtn.textContent = "❗️DIN-Verstoß";
    problembtn.className = "problemcontainer";

    for (let id = 0; id < areas.length; id++) {
      const labelObject = new CSS2DObject(problembtn);

      labelObject.uuid = areas[id].uuid;
      labels.push(labelObject);
    }
    for (let id = 0; id < areas.length; id++) {
      if (areas[id].uuid === searchID) {
        // Create video and play
        labels[id].position.set(
          areas[id].position.x + 0.3,
          areas[id].position.y,
          areas[id].position.z
        );
        scene.add(labels[id]);

        await specificAnimation(
          IntersectionsIDs,
          kitchenanimations,
          noIntersectionsIDs,
          furnClashAreaColor,
          1,
          "Küche",
          1.5,
          1.5
        );
        await specificAnimation(
          IntersectionsIDs,
          showeranimations,
          noIntersectionsIDs,
          furnClashAreaColor,
          5,
          "Dusche",
          1.5,
          1.5
        );
        await specificAnimation(
          IntersectionsIDs,
          tubeanimations,
          noIntersectionsIDs,
          furnClashAreaColor,
          4,
          "Badewanne",
          1.5,
          1.5
        );
        await specificAnimation(
          IntersectionsIDs,
          sinkanimations,
          noIntersectionsIDs,
          furnClashAreaColor,
          3,
          "Waschtisch",
          1.5,
          1.5
        );
        await specificAnimation(
          IntersectionsIDs,
          bedanimations,
          noIntersectionsIDs,
          furnClashAreaColor,
          0,
          "Bett",
          4.5,
          3.5
        );
        await specificAnimation(
          IntersectionsIDs,
          wcanimations,
          noIntersectionsIDs,
          furnClashAreaColor,
          2,
          "WC",
          1.5,
          1.5
        );

        await specificAnimation(
          IntersectionsIDsFurnIntersectArea,
          kitchenanimations,
          noIntersectionsIDsFurnIntersectArea,
          furnClashAreaColor,
          1,
          "Küche",
          1.5,
          1.5
        );
        await specificAnimation(
          IntersectionsIDsFurnIntersectArea,
          showeranimations,
          noIntersectionsIDsFurnIntersectArea,
          furnClashAreaColor,
          5,
          "Dusche",
          1.5,
          1.5
        );
        await specificAnimation(
          IntersectionsIDsFurnIntersectArea,
          tubeanimations,
          noIntersectionsIDsFurnIntersectArea,
          furnClashAreaColor,
          4,
          "Badewanne",
          1.5,
          1.5
        );
        await specificAnimation(
          IntersectionsIDsFurnIntersectArea,
          sinkanimations,
          noIntersectionsIDsFurnIntersectArea,
          furnClashAreaColor,
          3,
          "Waschtisch",
          1.5,
          1.5
        );
        await specificAnimation(
          IntersectionsIDsFurnIntersectArea,
          bedanimations,
          noIntersectionsIDsFurnIntersectArea,
          furnClashAreaColor,
          0,
          "Bett",
          4.5,
          3.5
        );
        await specificAnimation(
          IntersectionsIDsFurnIntersectArea,
          wcanimations,
          noIntersectionsIDsFurnIntersectArea,
          furnClashAreaColor,
          2,
          "WC",
          1.5,
          1.5
        );
      }
      indexID = noSpecificFurnIDList.indexOf(areas[id].uuid);
      if (noSpecificFurnIDList[indexID] === searchID) {
        //console.log("SONSTIGE")
        const Videomaterial = videoMaterial(otheranimations[0], 1.5, 1.5, id);
        areas[id].material = Videomaterial;

        areas[id].position.set(areas[id].position.x, 1, areas[id].position.z);
      }

      problembtn.onpointerenter = () => {
        const labelBase = document.createElement("div");
        labelBase.className = " delete-button hidden ";
        labelBase.style.backgroundColor = "rgba(255,255,255,0.5)";

        moreInformationPlusButton(
          "Küchenzeile",
          "DIN 18040-2: 2011-09: 5.4 Wohn- Schlafräume und Küchen",
          "Wohn-, Schlafräume und Küchen sind für Menschen mit motorischen Einschränkungen bzw. für Rollstuhl- nutzer barrierefrei nutzbar, wenn sie so dimensioniert sind, dass bei nutzungstypischer Möblierung jeweils ausreichende Bewegungsflächen vorhanden sind. Bewegungsflächen dürfen sich überlagern.",
          "Vor Kücheneinrichtungen ist eine Bewegngsfläche von 120cm vorzusehen.",
          "Vor Kücheneinrichtungen ist eine Bewegngsfläche von 150cm vorzusehen. Bei der Planung der haustechnischen Anschlüsse in einer Küche für Rollstuhlnutzer ist die Anordnung von Herd, Arbeitsplatte und Spüle übereck zu empfehlen."
        );

        moreInformationPlusButton(
          "Dusche",
          "DIN 18040-2: 2011-09: 5.5.5 Duschplätze",
          "Duschplätze müssen so gestaltet sein, dass sie barrierefrei z. B. auch mit einem Rollator bzw. Rollstuhl nutz- bar sind.  ",
          "Dies wird erreicht durch: die niveaugleiche Gestaltung zum angrenzenden Bodenbereich des Sanitärraumes und einer Absenkung von max. 2 cm; ggf. auftretende Übergänge sollten vorzugsweise als geneigte Fläche ausgebildet werden; rutschhemmende Bodenbeläge im Duschbereich (sinngemäß nach GUV-I 8527 mindestens Bewertungs- gruppe B). Die Fläche des Duschplatzes kann in die Bewegungsflächen des Sanitärraumes einbezogen werden, wenn der Übergang zum Duschplatz bodengleich gestaltet ist und wenn die zur Entwässerung erforderliche Neigung max. 2 % beträgt.",
          "Die Nachrüstmöglichkeit für einen Dusch-Klappsitz, in einer Sitzhöhe von 46 cm bis 48 cm; beidseitig des Dusch-Klappsitzes eine Nachrüstmöglichkeit für hochklappbare Stützgriffe, deren Oberkante 28 cm über der Sitzhöhe liegt. Eine Einhebel-Duscharmatur mit Handbrause muss aus der Sitzposition in 85 cm Höhe über OFF erreichbar sein. Um Verletzungsgefahren insbesondere für blinde und sehbehinderte Menschen beim Vorbeugen zu ver- meiden, sollte der Hebel von Einhebel-Dusch-Armaturen nach unten weisen."
        );

        moreInformationPlusButton(
          "Badewanne",
          "DIN 18040-2: 2011-09: 5.5.6 Badewannen",
          " ",
          "Das nachträgliche Aufstellen einer Badewanne z. B. im Bereich der Dusche sollte möglich sein.",
          "Das nachträgliche Aufstellen einer Badewanne z. B. im Bereich der Dusche muss möglich sein. Sie muss mit einem Lifter nutzbar sein."
        );

        moreInformationPlusButton(
          "Waschtisch",
          "DIN 18040-2: 2011-09: 5.5.4 Waschplätze",
          "Waschplätze müssen so gestaltet sein, dass eine Nutzung auch im Sitzen möglich ist.",
          "Dies wird mit folgenden Maßnahmen erreicht: 1. bauseitige Möglichkeit, einen mindestens 100 cm hohen Spiegel bei Bedarf unmittelbar über dem Waschtisch anzuordnen; 2. Beinfreiraum unter dem Waschtisch;",
          "1. Vorderkantenhöhe des Waschtisches von max. 80 cm über OFF; 2. Unterfahrbarkeit von mindestens 55 cm Tiefe und Abstand der Armatur zum vorderen Rand des Waschtisches von höchstens 40 cm (siehe Bild 16); 3. Beinfreiraum unter dem Waschtisch mit einer Breite von mindestens 90 cm (axial gemessen); Angaben zu den erforderlichen gestaffelten Höhen und Tiefen (siehe Bild 16); 4. einem mindestens 100 cm hohen Spiegel, der unmittelbar über dem Waschtisch angeordnet ist."
        );

        moreInformationPlusButton(
          "WC",
          "DIN 18040-2: 2011-09: 5.5.3 WC-Becken",
          "",
          "Zur leichteren Nutzbarkeit des WC-Beckens ist ein seitlicher Mindestabstand von 20 cm zur Wand oder zu anderen Sanitärobjekten einzuhalten.",
          "Zweckentsprechend angeordnet sind WC-Becken mit 1.einer Höhe des WC-Beckens einschließlich Sitz zwischen 46 cm und 48 cm über OFF. 2. Ausreichende Bewegungsflächen neben WC-Becken sind. 2.1 mindestens 70 cm tief, von der Beckenvorderkante bis zur rückwärtigen Wand; 2.2 mindestens 90 cm breit an der Zugangsseite und für Hilfspersonen mindestens 30 cm breit an der gegenüberliegenden Seite (siehe Bild 12). In Gebäuden mit mehr als einer Wohneinheit für uneingeschränkte Rollstuhlnutzung sind die Zu- gangsseiten abwechselnd rechts oder links vorzusehen. 3. Folgende Bedienelemente und Stützen sind erforderlich: 3.1 Rückenstütze, angeordnet 55 cm hinter der Vorderkante des WC-Beckens. Der WC-Deckel ist als alleinige Rückenstütze ungeeignet; 3.2 Spülung, mit der Hand oder dem Arm bedienbar, im Greifbereich des Sitzenden, ohne dass der Benutzer die Sitzposition verändern muss. Wird eine berührungslose Spülung verwendet, muss ihr ungewolltes Auslösen ausgeschlossen sein; 3.3 Toilettenpapierhalter, erreichbar ohne Veränderung der Sitzposition; 3.4 Stützklappgriffe. 4. Stützklappgriffe müssen folgende Anforderungen erfüllen (siehe auch Bild 13): 4.1 auf jeder Seite des WC-Beckens montiert; 4.2 hochklappbar; 4.3 15 cm über die Vorderkante des WC-Beckens hinausragend; 4.4 bedienbar mit wenig Kraftaufwand in selbst gewählten Etappen; 4.5 Abstand zwischen den Stützklappgriffen 65 cm bis 70 cm; 4.6 Oberkante über der Sitzhöhe 28 cm; 4.7 Befestigung, die einer Punktlast von mindestens 1 kN am Griffende standhält. ANMERKUNG Es wird z. B. unterschieden zwischen Stützklappgriffen mit und ohne Feder. Die Klappgriffe mit Feder können mit geringerem Kraftaufwand beim Hochklappen bedient werden."
        );

        moreInformationPlusButton(
          "Bett",
          "DIN 18040-2: 2011-09: 5.4  Wohn- Schlafräume und Küchen",
          "Wohn-, Schlafräume und Küchen sind für Menschen mit motorischen Einschränkungen bzw. für Rollstuhl- nutzer barrierefrei nutzbar, wenn sie so dimensioniert sind, dass bei nutzungstypischer Möblierung jeweils ausreichende Bewegungsflächen vorhanden sind.",
          "Ausreichende Mindesttiefen von Bewegungsflächen entlang und vor Möbeln sind bei mindestens einem Bett: 120 cm entlang der einen und 90 cm entlang der anderen Längsseite;",
          "Ausreichende Mindesttiefen von Bewegungsflächen entlang und vor Möbeln sind bei mindestens einem Bett: 150 cm entlang der einen und 120 cm entlang der anderen Längsseite;"
        );

        moreInformationPlusButton(
          "Sonstiges Möbel",
          "DIN 18040-2: 2011-09: 5.4  Wohn- Schlafräume und Küchen",
          "Wohn-, Schlafräume und Küchen sind für Menschen mit motorischen Einschränkungen bzw. für Rollstuhl- nutzer barrierefrei nutzbar, wenn sie so dimensioniert sind, dass bei nutzungstypischer Möblierung jeweils ausreichende Bewegungsflächen vorhanden sind.",
          "Ausreichende Mindesttiefen von Bewegungsflächen entlang und vor Möbeln sind bei sonstigen Möbeln: vor sonstigen Möbeln: 90cm;",
          "Ausreichende Mindesttiefen von Bewegungsflächen entlang und vor Möbeln sind bei sonstigen Möbeln: 150cm;"
        );

        moreInformationPlusButton(
          "Sanitärmöbel",
          "DIN 18040-2: 2011-09: 5.5 Sanitärräume",
          "In einer Wohnung mit mehreren Sanitärräumen muss mindestens einer der Sanitärräume barrierefrei nutzbar sein. Mit den Anforderungen dieses Abschnitts der Norm sind Sanitärräume sowohl für Menschen mit motorischen Einschränkungen bzw. für Rollstuhlnutzer als auch für blinde und sehbehinderte Menschen barrierefrei nutzbar. Aus Sicherheitsgründen dürfen Drehflügeltüren nicht in Sanitärräume schlagen, um ein Blockieren der Tür zu vermeiden. Türen von Sanitärräumen müssen von außen entriegelt werden können. Armaturen sollten als Einhebel- oder berührungslose Armatur ausgebildet sein. Berührungslose Armaturen dürfen nur in Verbindung mit Temperaturbegrenzung eingesetzt werden. Um ein Verbrühen zu vermeiden, ist die Wassertemperatur an der Auslaufarmatur auf 45 °C zu begrenzen. Die Ausstattungselemente sollten sich visuell kontrastierend von ihrer Umgebung abheben (z. B. heller Waschtisch/dunkler Hintergrund oder kontrastierende Umrahmungen). Die Wände von Sanitärräumen sind bauseits so auszubilden, dass sie bei Bedarf nachgerüstet werden können mit senkrechten und waagerechten Stütz- und/oder Haltegriffen neben dem WC-Becken sowie im Bereich der Dusche und der Badewanne. Ist ein Sanitärraum ausschließlich über ein Fenster zu lüften, ist zur Bedienbarkeit 5.3.2 zu beachten.",
          "Jeweils vor den Sanitärobjekten wie WC-Becken, Waschtisch, Badewanne und im Duschplatz ist eine Bewegungsfläche anzuordnen. Ausreichend ist eine Mindestfläche von 120cm×120cm;",
          "Jeweils vor den Sanitärobjekten wie WC-Becken, Waschtisch, Badewanne und im Duschplatz ist eine Bewegungsfläche anzuordnen. Ausreichend ist eine Mindestfläche von 150cm×150cm;"
        );

        function moreInformationPlusButton(
          nodetype,
          headerText,
          moreInfo,
          rules,
          rulesR
        ) {
          if (node.type == nodetype.toString()) {
            //labelBase.textContent = moreInfo.toString()

            for (let i = 0; i < labels.length; i++) {
              if (node.expressID === labels[i].uuid) {
                const header = document.createElement("h3");
                header.textContent = headerText.toString();
                labelBase.appendChild(header);

                const enter = document.createElement("br");
                labelBase.appendChild(enter);

                const info = document.createElement("p");
                info.textContent = moreInfo.toString();
                labelBase.appendChild(info);

                const enter2 = document.createElement("br");
                labelBase.appendChild(enter2);

                const ruletext = document.createElement("h4");
                ruletext.textContent =
                  "In einer barrierefrei nutzbaren Wohnung: " +
                  rules.toString();
                labelBase.appendChild(ruletext);

                const enter3 = document.createElement("br");
                labelBase.appendChild(enter3);

                const ruletextR = document.createElement("h4");
                ruletextR.textContent =
                  "In einer Wohnung im R-Standard: " + rulesR.toString();
                labelBase.appendChild(ruletextR);

                deleteButton = labels[i].element;
                deleteButton.appendChild(labelBase);

                const labelObject = new CSS2DObject(deleteButton);

                DINLabels.push(labelObject);

                for (id = 0; id < areas.length; id++) {
                  if (areas[id].uuid == searchID) {
                    labelObject.position.set(
                      labels[i].position.x,
                      labels[i].position.y,
                      labels[i].position.z
                    );
                  }
                }

                labelBase.onpointerdown = () => {
                  deleteButton.style.visibility = "hidden";
                  labelObject.removeFromParent();
                  labelObject.element = null;
                  labelBase.remove();
                };

                deleteButton.onpointerenter = () => {
                  labelBase.classList.remove("hidden");
                };
                deleteButton.onpointerleave = () => {
                  labelBase.classList.add("hidden");
                };

                scene.add(labelObject);
              }
            }
          }
        }
      };
    }
  }

  showCollisionText("containerText", "containerTextNot");

  function showCollisionText(className, classNameGreen) {
    const stringID = searchID.toString();
    const collisionTextShow = document.getElementsByClassName(className);
    const arrayNodes = Array.from(collisionTextShow);

    const collisionTextShowGreen =
      document.getElementsByClassName(classNameGreen);

    ShowTextPerNode(intersectionidHTML, stringID, arrayNodes);
    ShowTextPerNode(noIntersectionidHTML, stringID, arrayNodes);
  }

  function specificAnimationWalls(
    IntersectionsIDsTest,
    IntersectionsIDsTestWith,
    source,
    index,
    name
  ) {
    if (noSpecificFurnIDList.includes(searchID) === true) {
      for (let r = 0; r < IntersectionsIDsTest.length; r++) {
        if (noSpecificFurnIDList.includes(IntersectionsIDsTest[r]) === true) {
          for (let id = 0; id < areas.length; id++) {
            if (areas[id].uuid === searchID) {
              const Videomaterial = videoMaterial(
                otheranimations[0],
                1.5,
                1.5,
                id
              );
              //for(let mat = 0; mat < checkedMats.length; mat++){
              areas[id].material = Videomaterial;

              areas[id].position.set(
                areas[id].position.x,
                1,
                areas[id].position.z
              );
            }
          }
        }
      }
    }

    if (IntersectionsIDsTest.includes(foundMeshesCheckbox[index]) === true) {
      const indexWall = IntersectionsIDsTest.indexOf(searchID);
      if (searchID === IntersectionsIDsTest[indexWall]) {
        loader.ifcManager.createSubset({
          modelID: model.modelID,
          ids: [IntersectionsIDsTestWith[indexWall]],
          material: wallClashmaterial,
          scene,
          removePrevious: true,
        });

        if (
          specificFurnIDList[index].value === IntersectionsIDsTest[indexWall] &&
          specificFurnIDList[index].key === "Dusche"
        ) {
          wallCollisonAnimationArea(
            "Dusche Wand",
            IntersectionsIDsTest,
            indexWall,
            showeranimations,
            1.5,
            1.5
          );
        }

        if (
          specificFurnIDList[index].value === IntersectionsIDsTest[indexWall] &&
          specificFurnIDList[index].key === "Küche"
        ) {
          wallCollisonAnimationArea(
            "Küche Wand",
            IntersectionsIDsTest,
            indexWall,
            kitchenanimations,
            1.5,
            1.5
          );
        }
        if (
          specificFurnIDList[index].value === IntersectionsIDsTest[indexWall] &&
          specificFurnIDList[index].key === "Badewanne"
        ) {
          wallCollisonAnimationArea(
            "Badewanne Wand",
            IntersectionsIDsTest,
            indexWall,
            tubeanimations,
            1.5,
            1.5
          );
        }

        if (
          specificFurnIDList[index].value === IntersectionsIDsTest[indexWall] &&
          specificFurnIDList[index].key === "Waschtisch"
        ) {
          wallCollisonAnimationArea(
            "Waschtisch Wand",
            IntersectionsIDsTest,
            indexWall,
            sinkanimations,
            1.5,
            1.5
          );
        }
        if (
          specificFurnIDList[index].value === IntersectionsIDsTest[indexWall] &&
          specificFurnIDList[index].key === "Bett"
        ) {
          wallCollisonAnimationArea(
            "Bett Wand",
            IntersectionsIDsTest,
            indexWall,
            bedanimations,
            4.5,
            3.5
          );
        }
        if (
          specificFurnIDList[index].value === IntersectionsIDsTest[indexWall] &&
          specificFurnIDList[index].key === "WC"
        ) {
          wallCollisonAnimationArea(
            "WC Wand",
            IntersectionsIDsTest,
            indexWall,
            wcanimations,
            1.5,
            1.5
          );
        }

        function wallCollisonAnimationArea(
          name,
          IntersectionsIDsTest,
          indexWall,
          showeranimations,
          width,
          depth
        ) {
          let videoSource;
          for (let id = 0; id < areas.length; id++) {
            if (areas[id].uuid === IntersectionsIDsTest[indexWall]) {
              for (let video = 0; video < showeranimations.length; video++) {
                if (ReferenceDirections[id].x > 0) {
                  videoSource = showeranimations[0];
                }
                if (ReferenceDirections[id].x < 0) {
                  videoSource = showeranimations[1];
                }

                if (ReferenceDirections[id].y < 0) {
                  videoSource = showeranimations[2];
                }

                if (ReferenceDirections[id].y > 0) {
                  videoSource = showeranimations[3];
                }
              }
              const Videomaterial = videoMaterial(
                videoSource,
                width,
                depth,
                id
              );
              areas[id].material = Videomaterial;
              areas[id].position.set(
                areas[id].position.x,
                allSubsetMeshes[id].geometry.boundingBox.max.y,
                areas[id].position.z
              );
            } else {
              for (let mat = 0; mat < checkedMats.length; mat++) {
                areas[id].material = checkedMats[id];
                areas[id].position.set(
                  areas[id].position.x,
                  0.0,
                  areas[id].position.z
                );
              }
            }
          }
        }
      }
    } else if (
      IntersectionsIDsTest.includes(foundMeshesCheckbox[index]) === false
    ) {
      for (let id = 0; id < areas.length; id++) {
        if (areas[id].uuid !== searchID) {
          for (let mat = 0; mat < checkedMats.length; mat++) {
            areas[id].material = checkedMats[id];
            areas[id].position.set(
              areas[id].position.x,
              0.0,
              areas[id].position.z
            );
          }
        }
      }
    }
  }

  function videoMaterial(source, width, depth, id) {
    let textureVid = document.createElement("video");

    textureVid.src = source; // transform gif to mp4
    textureVid.loop = true;
    textureVid.width = "900";
    textureVid.height = "1080";
    textureVid.play();

    // Load video texture
    let videoTexture = new VideoTexture(textureVid);
    videoTexture.format = RGBFormat;

    videoTexture.generateMipmaps = false;
    videoTexture.repeat.set(
      areas[id].geometry.parameters.width / width,
      areas[id].geometry.parameters.depth / depth
    );

    // Create mesh
    var Videomaterial = new MeshBasicMaterial({
      map: videoTexture,
      depthTest: true,
      transparent: true,
      opacity: 0.8,
    });
    return Videomaterial;
  }

  async function specificAnimation(
    IntersectionsIDsTest,
    source,
    noIntersectionsIDs,
    firstMaterial,
    index,
    name,
    width,
    depth
  ) {
    if (IntersectionsIDsTest.includes(foundMeshesCheckbox[index]) === true) {
      const firstOcc = includesIDinList([foundMeshesCheckbox[index]]);

      await extraAnimationArea(
        "WC",
        "Waschtisch",
        2,
        3,
        "./Animations/Rollstuhl_Kollision_WC_1_mirror.mp4",
        "./Animations/Rollstuhl_Kollision_WC_1.mp4",
        "./Animations/Rollstuhl_Kollision_Waschbecken.mp4",
        "./Animations/Rollstuhl_Kollision_Waschbecken.mp4"
      );
      async function extraAnimationArea(
        nameFurn,
        nameFurn2,
        indexFurniture,
        indexFurniture2,
        sourceVideo1,
        sourceVideo2,
        sourceVideo3,
        sourceVideo4
      ) {
        if (name === nameFurn || name === nameFurn2) {
          for (let id = 0; id < areas.length; id++) {
            if (
              IntersectionsIDsTest.includes(
                foundMeshesCheckbox[indexFurniture]
              ) === true
            ) {
              if (searchID === foundMeshesCheckbox[indexFurniture]) {
                if (areas[id].uuid === foundMeshesCheckbox[indexFurniture]) {
                  videoArea(
                    sourceVideo1,
                    sourceVideo2,
                    sourceVideo3,
                    sourceVideo4
                  );
                  for (let u = 0; u < areaNewList.length; u++) {
                    scene.add(areaNewList[0]);
                  }
                }
              }
              if (searchID !== foundMeshesCheckbox[indexFurniture]) {
                for (let u = 0; u < areaNewList.length; u++) {
                  scene.remove(areaNewList[u]);
                }

                if (mesh.length > 0) {
                  for (let p = 0; p < mesh.length; p++) {
                    scene.add(mesh[p]);
                  }
                }
              }
            }
            if (
              IntersectionsIDsTest.includes(
                foundMeshesCheckbox[indexFurniture2]
              ) === true
            ) {
              if (searchID === foundMeshesCheckbox[indexFurniture2]) {
                if (areas[id].uuid === foundMeshesCheckbox[indexFurniture2]) {
                  videoArea(
                    sourceVideo1,
                    sourceVideo2,
                    sourceVideo3,
                    sourceVideo4
                  );
                  for (let u = 0; u < areaNewList2.length; u++) {
                    scene.add(areaNewList2[0]);
                  }
                }
              }

              if (searchID !== foundMeshesCheckbox[indexFurniture2]) {
                for (let u = 0; u < areaNewList2.length; u++) {
                  scene.remove(areaNewList2[u]);
                }
                if (mesh.length > 0) {
                  for (let p = 0; p < mesh.length; p++) {
                    scene.add(mesh[p]);
                  }
                }
              }
            }
            function videoArea(
              sourceVideo1,
              sourceVideo2,
              sourceVideo3,
              sourceVideo4
            ) {
              let textureVid = document.createElement("video");

              function generateAreaForAnimation(
                boxX,
                boxZ,
                material,
                posx,
                posy,
                posz
              ) {
                const areaRandom = new BoxGeometry(boxX, 0.008, boxZ);
                material.map.repeat.y = boxZ / boxZ;
                material.map.repeat.x = boxX / boxX;

                const areaNew = new Mesh(areaRandom, material);

                areaNew.position.set(posx, posy, posz);

                if (areas[id].uuid === foundMeshesCheckbox[indexFurniture]) {
                  areaNewList.push(areaNew);
                }
                if (areas[id].uuid === foundMeshesCheckbox[indexFurniture2]) {
                  areaNewList2.push(areaNew);
                }
              }

              if (areas[id].uuid === foundMeshesCheckbox[indexFurniture2]) {
                const src = sourceVideo3;
                textureVid.src = src; // transform gif to mp4
                textureVid.loop = true;
                textureVid.width = "900";
                textureVid.height = "1080";
                textureVid.play();

                // Load video texture
                let videoTexture = new VideoTexture(textureVid);
                videoTexture.format = RGBFormat;

                videoTexture.generateMipmaps = false;

                // Create mesh
                const materialVideo = new MeshBasicMaterial({
                  map: videoTexture,
                  depthTest: true,
                  transparent: true,
                  opacity: 0.8,
                });

                const meshHide = areas[id];
                mesh.push(meshHide);
                scene.remove(meshHide);

                if (ReferenceDirections[id].x > 0) {
                  generateAreaForAnimation(
                    1.5,
                    areas[id].geometry.parameters.depth + 1.5,
                    materialVideo,
                    areas[id].position.x,
                    areas[id].position.y + 0.85,
                    areas[id].position.z +
                      (areas[id].geometry.parameters.depth + 1.5) / 2 -
                      areas[id].geometry.parameters.depth / 2
                  );
                }
                if (ReferenceDirections[id].x < 0) {
                  generateAreaForAnimation(
                    1.5,
                    areas[id].geometry.parameters.depth + 1.5,
                    materialVideo,
                    areas[id].position.x,
                    areas[id].position.y + 0.85,
                    areas[id].position.z -
                      (areas[id].geometry.parameters.depth + 1.5) / 2 +
                      areas[id].geometry.parameters.depth / 2
                  );
                }

                if (ReferenceDirections[id].y < 0) {
                  generateAreaForAnimation(
                    areas[id].geometry.parameters.depth + 1.5,
                    1.5,
                    materialVideo,
                    areas[id].position.x -
                      (areas[id].geometry.parameters.depth + 1.5) / 2 +
                      areas[id].geometry.parameters.depth / 2,
                    areas[id].position.y + 0.85,
                    areas[id].position.z
                  );
                }

                if (ReferenceDirections[id].y > 0) {
                  generateAreaForAnimation(
                    areas[id].geometry.parameters.depth + 1.5,
                    1.5,
                    materialVideo,
                    areas[id].position.x +
                      (areas[id].geometry.parameters.depth + 1.5) / 2 -
                      areas[id].geometry.parameters.depth / 2,
                    areas[id].position.y + 0.85,
                    areas[id].position.z
                  );
                }
              }
              if (areas[id].uuid === foundMeshesCheckbox[indexFurniture]) {
                const src = videoAfterTranslationWC(
                  indexFurniture,
                  indexFurniture2,
                  sourceVideo1,
                  sourceVideo2,
                  sourceVideo3,
                  sourceVideo4
                );
                textureVid.src = src; // transform gif to mp4
                textureVid.loop = true;
                textureVid.width = "900";
                textureVid.height = "1080";
                textureVid.play();

                // Load video texture
                let videoTexture = new VideoTexture(textureVid);
                videoTexture.format = RGBFormat;

                videoTexture.generateMipmaps = false;

                // Create mesh
                const materialVideo = new MeshBasicMaterial({
                  map: videoTexture,
                  depthTest: true,
                  transparent: true,
                  opacity: 0.8,
                });

                const meshHide = areas[id];
                mesh.push(meshHide);
                scene.remove(meshHide);

                if (ReferenceDirections[id].x > 0) {
                  generateAreaForAnimation(
                    areas[id].geometry.parameters.width,
                    areas[id].geometry.parameters.depth + 1.5,
                    materialVideo,
                    areas[id].position.x,
                    areas[id].position.y + 0.85,
                    areas[id].position.z +
                      (areas[id].geometry.parameters.depth + 1.5) / 2 -
                      areas[id].geometry.parameters.depth / 2
                  );
                }
                if (ReferenceDirections[id].x < 0) {
                  generateAreaForAnimation(
                    areas[id].geometry.parameters.width,
                    areas[id].geometry.parameters.depth + 1.5,
                    materialVideo,
                    areas[id].position.x,
                    areas[id].position.y + 0.85,
                    areas[id].position.z -
                      (areas[id].geometry.parameters.depth + 1.5) / 2 +
                      areas[id].geometry.parameters.depth / 2
                  );
                }

                if (ReferenceDirections[id].y < 0) {
                  generateAreaForAnimation(
                    areas[id].geometry.parameters.depth + 1.5,
                    areas[id].geometry.parameters.width,
                    materialVideo,
                    areas[id].position.x -
                      (areas[id].geometry.parameters.depth + 1.5) / 2 +
                      areas[id].geometry.parameters.depth / 2,
                    areas[id].position.y + 0.85,
                    areas[id].position.z
                  );
                }

                if (ReferenceDirections[id].y > 0) {
                  generateAreaForAnimation(
                    areas[id].geometry.parameters.depth + 1.5,
                    areas[id].geometry.parameters.width,
                    materialVideo,
                    areas[id].position.x +
                      (areas[id].geometry.parameters.depth + 1.5) / 2 -
                      areas[id].geometry.parameters.depth / 2,
                    areas[id].position.y + 0.85,
                    areas[id].position.z
                  );
                }
              }
            }
          }
        } else {
          await changeAreaToAnimaton(
            firstOcc,
            IntersectionsIDsTest,
            source,
            noIntersectionsIDs,
            firstMaterial,
            width,
            depth
          );
        }
      }
    }
  }

  specificAnimationWalls(
    IntersectionsIDsAreaIntersectWall,
    IntersectionsIDsAreaIntersectWallWith,
    wallanimations,
    5,
    ["Dusche Wand"]
  );
  specificAnimationWalls(
    IntersectionsIDsAreaIntersectWall,
    IntersectionsIDsAreaIntersectWallWith,
    wallanimations,
    1,
    ["Küche Wand"]
  );
  specificAnimationWalls(
    IntersectionsIDsAreaIntersectWall,
    IntersectionsIDsAreaIntersectWallWith,
    wallanimations,
    4,
    ["Badewanne Wand"]
  );
  specificAnimationWalls(
    IntersectionsIDsAreaIntersectWall,
    IntersectionsIDsAreaIntersectWallWith,
    wallanimations,
    3,
    ["Waschtisch Wand"]
  );
  specificAnimationWalls(
    IntersectionsIDsAreaIntersectWall,
    IntersectionsIDsAreaIntersectWallWith,
    wallanimations,
    0,
    ["Bett Wand"]
  );
  specificAnimationWalls(
    IntersectionsIDsAreaIntersectWall,
    IntersectionsIDsAreaIntersectWallWith,
    wallanimations,
    2,
    ["WC Wand"]
  );

  const subs = loader.ifcManager.createSubset({
    modelID: model.modelID,
    ids: [searchID],
    material: secondMaterial,
    scene,
    removePrevious: true,
  });

  prepickedSubset.push(subs);

  function includesIDinList(IntersectionsIDsTest) {
    return IntersectionsIDsTest.includes(searchID);
  }

  async function changeAreaToAnimaton(
    firstOcc,
    IntersectionsIDsTest,
    source,
    noIntersectionsIDsTest,
    firstMaterial,
    width,
    depth
  ) {
    if (firstOcc === true) {
      loader.ifcManager.removeSubset(0, greenMaterial);
      for (let i = 0; i < IntersectionsIDsTest.length; i++) {
        const collisionID = IntersectionsIDsTest[i];

        if (collisionID === searchID) {
          for (let id = 0; id < areas.length; id++) {
            if (areas[id].uuid === collisionID) {
              let videoSource;
              for (let video = 0; video < source.length; video++) {
                if (ReferenceDirections[id].x > 0) {
                  videoSource = source[0];
                }
                if (ReferenceDirections[id].x < 0) {
                  videoSource = source[1];
                }

                if (ReferenceDirections[id].y < 0) {
                  videoSource = source[2];
                }

                if (ReferenceDirections[id].y > 0) {
                  videoSource = source[3];
                }
              }

              const Videomaterial = videoMaterial(videoSource, width, depth);

              function videoMaterial(source, width, depth) {
                let textureVid = document.createElement("video");

                textureVid.src = source; // transform gif to mp4
                textureVid.loop = true;
                textureVid.width = "900";
                textureVid.height = "1080";
                textureVid.play();

                // Load video texture
                let videoTexture = new VideoTexture(textureVid);
                videoTexture.format = RGBFormat;

                videoTexture.generateMipmaps = false;

                videoTexture.repeat.set(
                  areas[id].geometry.parameters.width / width,
                  areas[id].geometry.parameters.depth / depth
                );

                // Create mesh
                var Videomaterial = new MeshBasicMaterial({
                  map: videoTexture,
                  depthTest: true,
                  transparent: true,
                  opacity: 0.8,
                });
                return Videomaterial;
              }

              areas[id].material = Videomaterial;
              areas[id].position.set(
                areas[id].position.x,
                allSubsetMeshes[id].geometry.boundingBox.max.y,
                areas[id].position.z
              );
            }
          }
        }
      }
    } else if (firstOcc === false) {
      loader.ifcManager.removeSubset(0, secondMaterial);

      for (let k = 0; k < noIntersectionsIDsTest.length; k++) {
        // remove animationmateral
        for (let id = 0; id < areas.length; id++) {
          if (areas[id].uuid !== searchID) {
            for (let mat = 0; mat < checkedMats.length; mat++) {
              areas[id].material = checkedMats[id];
              areas[id].position.set(
                areas[id].position.x,
                0.0,
                areas[id].position.z
              );
            }
          }
        }
      }
    }
  }
}

function ShowTextPerNode(intersectionidHTML, stringID, arrayNodes) {
  const arrayIDs = [];
  for (let a = 0; a < intersectionidHTML.length; a++) {
    if (intersectionidHTML[a] === stringID) {
      for (let b = 0; b < arrayNodes.length; b++) {
        const arrayids = arrayNodes[b].id.toString();
        arrayIDs.push(arrayids);
        if (arrayids === intersectionidHTML[a]) {
          const index = arrayIDs.indexOf(intersectionidHTML[a]);
          arrayNodes[index].style.color = "blue";
          arrayNodes[index].style.visibility = "visible";
        } else {
          arrayNodes[b].style.visibility = "hidden";
        }
      }
    }
  }
}

async function pickCheckbox(event, material, secondMaterial, Expressid) {
  const filterRadioButtonChecked = Array.from(
    document.getElementsByName("noIntersection")
  ).filter((x) => x["checked"]);
  const radioButtonValue = filterRadioButtonChecked[0].value;
  if (radioButtonValue !== undefined) {
    for (let j = 0; j < areas.length; j++) {
      let areasid = areas[j].uuid.toString();
      if (areasid === radioButtonValue) {
        let zoomPosition = areas[j].position;

        if (zoomPosition.z < 0 && zoomPosition.x > 0) {
          controls.position0.y = 2;
          camera.position.y = 10;
          camera.position.x = zoomPosition.x;
          camera.position.z = zoomPosition.z;
          controls.target.set(zoomPosition.x, zoomPosition.y, zoomPosition.z);
        }
        if (zoomPosition.z < 0 && zoomPosition.x < 0) {
          controls.position0.y = 2;
          camera.position.y = 10;
          camera.position.x = zoomPosition.x;
          camera.position.z = zoomPosition.z;
          controls.target.set(zoomPosition.x, zoomPosition.y, zoomPosition.z);
        }
      }
    }
  }
}

async function pickByIDClick(event, material, secondMaterial, Expressid) {
  collisionColorShow(
    checkedListIntersectFurnAndArea,
    indicesIntersectFurnAndArea
  );
  collisionColorShow(
    checkedListIntersectAreaAndFurn,
    indicesIntersectAreaAndFurn
  );

  function collisionColorShow(
    checkedListIntersectFurnAndArea,
    indicesIntersectFurnAndArea
  ) {
    const searchID = Expressid[0];

    for (let i = 0; i < checkedListIntersectFurnAndArea.length; i++) {
      if (checkedListIntersectFurnAndArea[i] === true) {
        const collisionID =
          allSubsetMeshes[indicesIntersectFurnAndArea[i][0]].uuid;

        if (collisionID === searchID) {
          collidingFurnIDs.push(
            allSubsetMeshes[indicesIntersectFurnAndArea[i][1]].uuid
          );

          for (let idmesh = 0; idmesh < collidingFurnIDs.length; idmesh++) {
            const sub = loader.ifcManager.createSubset({
              modelID: model.modelID,
              ids: [collidingFurnIDs[idmesh]],
              material: new MeshBasicMaterial({
                color: "blue",
                transparent: true,
                opacity: 0.5,
                depthTest: false,
              }),
              scene,
              removePrevious: true,
            });
            foundSubsets.push(sub);
          }

          generateSubsetWithIDred(searchID);
        }
      }
    }

    for (let i = 0; i < checkedListAreaIntersectWall.length; i++) {
      if (checkedListAreaIntersectWall[i] === true) {
        const collisionID =
          allSubsetMeshes[indicesIntersectAreaAndWall[i][0]].uuid;

        if (collisionID === searchID) {
          collidingFurnIDs.push(
            wallSubsetMeshes[indicesIntersectAreaAndWall[i][1]].uuid
          );

          for (let idmesh = 0; idmesh < collidingFurnIDs.length; idmesh++) {
            const sub = loader.ifcManager.createSubset({
              modelID: model.modelID,
              ids: [collidingFurnIDs[idmesh]],
              material: new MeshBasicMaterial({
                color: "blue",
                transparent: true,
                opacity: 0.5,
                depthTest: false,
              }),
              scene,
              removePrevious: true,
            });
            foundSubsets.push(sub);
          }

          generateSubsetWithIDred(searchID);
        }
      }
    }
    searchedID = searchID;

    if (searchID !== searchedID) {
      foundSubsets = [];
    }
  }
}

function generateSubsetWithIDred(id) {
  const sub = loader.ifcManager.createSubset({
    modelID: model.modelID,
    ids: [id],
    material: new MeshBasicMaterial({
      color: orangeColor,
      transparent: true,
      opacity: 0.5,
      depthTest: false,
    }),
    scene,
    removePrevious: true,
  });

  foundSubsets.push(sub);
  foundSubsetsID.push(id);
  redSubset.push(sub);
}

function removeSubsetAndGetOriginalMaterials(
  checkedListIntersectFurnAndArea,
  foundSubsets,
  indicesIntersectFurnAndArea,
  index
) {
  for (let i = 0; i < checkedListIntersectFurnAndArea.length; i++) {
    for (let k = 0; k < foundSubsets.length; k++) {
      foundSubsets[k].material =
        allSubsetMeshes[indicesIntersectFurnAndArea[i][index]].material;
    }

    foundSubsets.length = 0;
    foundSubsets = [];
    foundSubsetsID = [];
    redSubset = [];
    collidingFurnIDs = [];
    prepickedSubset.length = 0;
  }
}

//-------------------------Programm Area Generation --------------------------
//---------------------------------------------------------------------------------
function activatePopUpMenu(input, activateButton) {
  const closeTab = document.getElementById("Check");
  closeTab.style.visibility = "hidden";

  const containerTab = document.getElementById("programmFurniture");

  const divElement = document.createElement("div");
  divElement.id = `${input[0]}-1`;
  divElement.classList.add("modal");
  containerTab.appendChild(divElement);

  const modalBackround = document.getElementById(`${input[0]}-1`);
  modalBackround.style.display = "block";
  checkBtn.style.visibility = "hidden";

  const formElement = document.createElement("form");
  formElement.classList.add("modal-content");
  formElement.action = "/action_page.php";

  divElement.appendChild(formElement);

  const formContent = document.createElement("div");
  formContent.classList.add("containerForm");

  const heading = document.createElement("p");
  heading.innerText = `Gibt es ein/e ${input[0]}?`;

  const decision = document.createElement("div");
  decision.classList.add("clearfix");

  const yesBtn = document.createElement("button");
  yesBtn.type = "button";
  yesBtn.classList.add("buttonsArea");
  yesBtn.style.backgroundColor = "darkgrey";
  yesBtn.innerText = "ja";
  yesBtn.id = "trueBtn";

  let clicked;

  yesBtn.onclick = () => {
    const modalBackround = document.getElementById(`${input[0]}-1`);
    modalBackround.style.display = "none";
    clicked = false;
    return clicked;
  };

  const noBtn = document.createElement("button");
  noBtn.type = "button";
  noBtn.classList.add("buttonsArea");
  noBtn.innerText = "nein";
  noBtn.id = "falseBtn";

  noBtn.onclick = () => {
    const modalBackround = document.getElementById(`${input[0]}-1`);
    modalBackround.style.display = "none";
    clicked = false;

    specificFurnIDList.push({ key: `${input[0]}`, value: 0 });
    return clicked;
  };

  formContent.appendChild(heading);
  formContent.appendChild(decision);
  decision.appendChild(yesBtn);
  decision.appendChild(noBtn);
  formElement.appendChild(formContent);

  document.querySelectorAll("button").forEach((occurence) => {
    let id = occurence.getAttribute("id");
    occurence.addEventListener("click", async function () {
      if (id === "trueBtn") {
        const buttonTxt = document.getElementById("programmFurniture");
        buttonTxt.innerText = `Klicke ein/e ${input[0]} jetzt an...`;

        var bedtest = document.getElementById(`${input[0]}`);
        bedtest.checked = true;
      } else if (id === "falseBtn") {
        input.shift();

        if (input.length >= 1) {
          checkBtn.style.visibility = "visible";

          const buttonTxt = document.getElementById("programmFurniture");
          buttonTxt.innerText = `Kein/e ${input[0]}.`;

          var bedtest = document.getElementById(`${input[0]}`);
          bedtest.checked = false;

          activatePopUpMenu(input, checkBtn);
        }
      }
    });
  });
}

//-------------------------WALLS--------------------------
//---------------------------------------------------------------------------------

function generateWallsAsMesh(wall, wallDimensionsX, wallDimensionsY, idsWalls) {
  const a = wall;
  const wallCopy = new BoxGeometry(
    wallDimensionsX[a] - 0.01,
    3,
    wallDimensionsY[a] - 0.01
  );
  const wallMesh = new Mesh(
    wallCopy,
    new MeshBasicMaterial({ color: "grey", transparent: true, opacity: 0.5 })
  );

  const wallSphere = new SphereGeometry(0.4);
  const wallMeshSphere = new Mesh(
    wallSphere,
    new MeshBasicMaterial({ color: "orange", transparent: true, opacity: 0.5 })
  );

  const wallMeshSphereTwo = new Mesh(
    wallSphere,
    new MeshBasicMaterial({ color: "purple", transparent: true, opacity: 0.5 })
  );

  if (wallDirection[a].x === 1) {
    //console.log("x = 1")
    wallMesh.position.set(
      wallPlacements[a].x + wallDimensionsX[a] / 2,
      1.5,
      -wallPlacements[a].z
    );
    computeWallBB(wallMesh);
    wallMesh.uuid = idsWalls[wall];

    wallSubsetMeshesStartPositions.push(wallMesh.position);
    resetPositionsWall.push(
      new Vector3(
        wallPlacements[a].x + wallDimensionsX[a] / 2,
        1.5,
        -wallPlacements[a].z
      )
    );

    const wallSize = wallBounds[a].getSize(new Vector3());

    wallMeshSphere.position.set(wallSize.x / 2, 0, 0);
    wallMeshSphereTwo.position.set(-wallSize.x / 2, 0, 0);

    wallSubsetMeshes.push(wallMesh);
  }
  if (wallDirection[a].x === -1) {
    //console.log("x = -1")
    wallMesh.position.set(
      wallPlacements[a].x - wallDimensionsX[a] / 2,
      1.5,
      -wallPlacements[a].z
    );
    computeWallBB(wallMesh);
    wallMesh.uuid = idsWalls[wall];

    wallSubsetMeshesStartPositions.push(wallMesh.position);
    resetPositionsWall.push(
      new Vector3(
        wallPlacements[a].x - wallDimensionsX[a] / 2,
        1.5,
        -wallPlacements[a].z
      )
    );
    const wallSize = wallBounds[a].getSize(new Vector3());

    wallMeshSphere.position.set(wallSize.x / 2, 0, 0);
    wallMeshSphereTwo.position.set(-wallSize.x / 2, 0, 0);

    wallSubsetMeshes.push(wallMesh);
  }
  if (wallDirection[a].y === 1) {
    //console.log("y = 1")
    wallMesh.position.set(
      wallPlacements[a].x,
      1.5,
      -wallPlacements[a].z - wallDimensionsX[a] / 2
    );
    wallMesh.rotateY(Math.PI / 2);
    computeWallBB(wallMesh);
    wallMesh.uuid = idsWalls[wall];

    wallSubsetMeshesStartPositions.push(wallMesh.position);
    resetPositionsWall.push(
      new Vector3(
        wallPlacements[a].x,
        1.5,
        -wallPlacements[a].z - wallDimensionsX[a] / 2
      )
    );

    const wallSize = wallBounds[a].getSize(new Vector3());

    wallMeshSphere.position.set(wallSize.z / 2, 0, 0);
    wallMeshSphereTwo.position.set(-wallSize.z / 2, 0, 0);

    wallSubsetMeshes.push(wallMesh);
  }
  if (wallDirection[a].y === -1) {
    //console.log("y = -1")
    wallMesh.position.set(
      wallPlacements[a].x,
      1.5,
      -wallPlacements[a].z + wallDimensionsX[a] / 2
    );
    wallMesh.rotateY(Math.PI / 2);
    computeWallBB(wallMesh);
    wallMesh.uuid = idsWalls[wall];

    wallSubsetMeshesStartPositions.push(wallMesh.position);
    resetPositionsWall.push(
      new Vector3(
        wallPlacements[a].x,
        1.5,
        -wallPlacements[a].z + wallDimensionsX[a] / 2
      )
    );

    const wallSize = wallBounds[a].getSize(new Vector3());

    wallMeshSphere.position.set(wallSize.z / 2, 0, 0);
    wallMeshSphereTwo.position.set(-wallSize.z / 2, 0, 0);

    wallSubsetMeshes.push(wallMesh);
  }
}

//------------get all ifcElements and converting them into three.js mesh----------
//---------------------------------------------------------------------------------
async function getAllFurniture() {
  const idsFurn = await loader.ifcManager.getAllItemsOfType(
    0,
    IFCFURNISHINGELEMENT,
    false
  );
  const idsSanitary = await loader.ifcManager.getAllItemsOfType(
    0,
    IFCFLOWTERMINAL,
    false
  );
  const idsWalls = await loader.ifcManager.getAllItemsOfType(
    0,
    IFCWALLSTANDARDCASE,
    false
  );
  idsOpenings = await loader.ifcManager.getAllItemsOfType(
    0,
    IFCRELVOIDSELEMENT,
    true
  );
  const idsOpeningElement = await loader.ifcManager.getAllItemsOfType(
    0,
    IFCOPENINGELEMENT,
    true
  );
  idsFill = await loader.ifcManager.getAllItemsOfType(
    0,
    IFCRELFILLSELEMENT,
    true
  );
  const doors = await loader.ifcManager.getAllItemsOfType(0, IFCDOOR, false);
  const window = await loader.ifcManager.getAllItemsOfType(0, IFCWINDOW, false);
  openings = doors.concat(window);

  wallSubsetMeshesIDs.push(idsWalls);

  allIDsInChecker = idsFurn.concat(idsSanitary, idsWalls);
  for (let id = 0; id < idsFill.length; id++) {
    for (let i = 0; i < openings.length; i++) {
      if (idsFill[id].RelatedBuildingElement.value === openings[i]) {
        //console.log("found this openings", idsFill[id].RelatedBuildingElement.value,openings[i] )
        const openingSubs = loader.ifcManager.createSubset({
          modelID: 0,
          ids: [openings[i]],
          scene,
          removePrevious: true,
          material: new MeshBasicMaterial({
            color: "grey",
            depthTest: false,
            transparent: true,
            opacity: 0.7,
          }),
          customID: [openings[i]].toString(),
        });

        scene.add(openingSubs);

        openingSubs.uuid = openings[i];
        allOpeningsMeshes.push(openingSubs);
      }
    }
  }

  for (let wall = 0; wall < idsWalls.length; wall++) {
    const wallRepresentation = await loader.ifcManager.getItemProperties(
      0,
      idsWalls[wall],
      true
    );

    const sweptArea =
      wallRepresentation.Representation.Representations[1].Items[0].SweptArea;
    const xValueWall = sweptArea.XDim.value;
    const yValueWall = sweptArea.YDim.value;

    wallDimensionsX.push(xValueWall);
    wallDimensionsY.push(yValueWall);

    const wallRels = await loader.ifcManager.getItemProperties(
      0,
      idsWalls[wall],
      true
    );

    const wallObjectPlacement =
      wallRepresentation.ObjectPlacement.RelativePlacement.Location.Coordinates;
    const wallplacementX = wallObjectPlacement[0].value;
    const wallplacementY = wallObjectPlacement[1].value;
    const wallplacementZ = wallObjectPlacement[2].value;

    const placement = new Vector3(
      wallplacementX,
      wallplacementZ,
      wallplacementY
    );

    const wallSphere = new SphereGeometry(0.1);
    const wallMeshSphere = new Mesh(
      wallSphere,
      new MeshBasicMaterial({ color: "blue", transparent: true, opacity: 0.0 })
    );
    wallMeshSphere.position.set(placement.x, placement.y, -placement.z);
    scene.add(wallMeshSphere);

    wallPlacements.push(placement);
    wallMeshSpheres.push(wallMeshSphere);

    const ReferenceDir =
      wallRepresentation.ObjectPlacement.RelativePlacement.RefDirection;
    if (ReferenceDir == null) {
      const wallrefDirNull = new Vector3(1, 0, 0);

      wallDirection.push(wallrefDirNull);
    }
    if (ReferenceDir !== null) {
      const refDirVector = new Vector3(
        ReferenceDir.DirectionRatios[0].value,
        ReferenceDir.DirectionRatios[1].value,
        ReferenceDir.DirectionRatios[2].value
      );
      wallDirection.push(refDirVector);
    }

    const placementSweptArea =
      wallRepresentation.Representation.Representations[1].Items[0].SweptArea
        .Position.Location.Coordinates;
    generateWallsAsMesh(wall, wallDimensionsX, wallDimensionsY, idsWalls);

    for (let id = 0; id < idsFill.length; id++) {
      addingOpeningsToWall(id);
    }
  }

  for (let i = 0; i < wallSubsetMeshes.length; i++) {
    wallIDToOpenings.push(wallSubsetMeshes[i].children);
  }

  ids = idsSanitary.concat(idsFurn);

  idsElementsForCheck.push(ids);
  idsSanitaryList.push(idsSanitary);
  idsFurnitureList.push(idsFurn);
  for (let furniture = 0; furniture < ids.length; furniture++) {
    const id = ids[furniture];

    furnitureSubset = loader.ifcManager.createSubset({
      modelID: 0,
      ids: [id],
      scene,
      removePrevious: true,
      customID: [id].toString(),
    });

    furnitureSubset.position.set(0, 0, 0);
    furnitureSubset.geometry.computeBoundsTree();

    let furnitureBB = new Box3(new Vector3(), new Vector3());
    furnitureBB.copy(furnitureSubset.geometry.boundingBox);
    furnitureSubset.updateMatrixWorld(true);

    furnitureBB.applyMatrix4(furnitureSubset.matrixWorld);

    const sizeFurnBB = furnitureBB.getSize(new Vector3());
    furnSizes.push(sizeFurnBB);
    //scene.add(boxhelper)
    let centerPtFurniture = furnitureSubset.geometry.boundingBox.getCenter(
      new Vector3()
    );

    centerPoints.push(centerPtFurniture);

    subsetBoundingBoxes.push(furnitureBB);

    allSubsetMeshes.push(furnitureSubset);
  }

  for (let i = 0; i < allSubsetMeshes.length; i++) {
    delete allSubsetMeshes[i].uuid;
    allSubsetMeshes[i].uuid = ids[i];
  }

  // spheres around the center of the Furnitures
  for (let point = 0; point < centerPoints.length; point++) {
    const geom1 = new SphereGeometry(0.003);
    const centerSphere = new Mesh(
      geom1,
      new MeshPhongMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.0,
      })
    );
    centerSphere.position.set(
      centerPoints[point].x,
      centerPoints[point].y,
      centerPoints[point].z
    );
    //scene.add(centerSphere)

    //movement areas random
    const areaRandom = new BoxGeometry(
      furnSizes[point].x,
      0.005,
      furnSizes[point].z
    );
    const areaRandomMesh = new Mesh(
      areaRandom,
      new MeshBasicMaterial({
        color: "lightgrey",
        transparent: true,
        opacity: 0.6,
      })
    );

    areaRandomMesh.position.set(
      centerPoints[point].x,
      0,
      centerPoints[point].z
    );
    allSubsetMeshes[point].add(centerSphere);

    areaMeshes.push(areaRandomMesh);
    areaMeshes[point].uuid = allSubsetMeshes[point].uuid;
  }
}

function addingOpeningsToWall(id) {
  for (let j = 0; j < idsOpenings.length; j++) {
    if (
      idsFill[id].RelatingOpeningElement.value ===
      idsOpenings[j].RelatedOpeningElement.value
    ) {
      for (let wallid = 0; wallid < wallSubsetMeshes.length; wallid++) {
        if (
          wallSubsetMeshes[wallid].uuid ===
          idsOpenings[j].RelatingBuildingElement.value
        ) {
          allOpeningsMeshes[j].position.set(
            -wallMeshSpheres[wallid].position.x,
            -wallMeshSpheres[wallid].position.y,
            -wallMeshSpheres[wallid].position.z
          );
          allOpeningsMeshes[j].rotation.set(
            -wallSubsetMeshes[wallid].rotation.x,
            -wallSubsetMeshes[wallid].rotation.y,
            -wallSubsetMeshes[wallid].rotation.z
          );

          if (wallDirection[wallid].y === 1) {
            //console.log("y1")

            allOpeningsMeshes[j].position.set(
              wallSubsetMeshesStartPositions[wallid].z,
              -wallSubsetMeshesStartPositions[wallid].y,
              -wallSubsetMeshesStartPositions[wallid].x
            );
            wallSubsetMeshes[wallid].add(allOpeningsMeshes[j]);
          }
          if (wallDirection[wallid].y === -1) {
            //console.log("y-1", wallSubsetMeshesStartPositions[wallid], wallSubsetMeshes[wallid], allOpeningsMeshes[j])
            allOpeningsMeshes[j].position.set(
              wallSubsetMeshesStartPositions[wallid].z,
              -wallSubsetMeshesStartPositions[wallid].y,
              -wallSubsetMeshesStartPositions[wallid].x
            );
            wallSubsetMeshes[wallid].add(allOpeningsMeshes[j]);
          }
          if (wallDirection[wallid].x === 1) {
            //console.log("x1")
            allOpeningsMeshes[j].rotation.set(
              wallSubsetMeshes[wallid].rotation.x,
              wallSubsetMeshes[wallid].rotation.y,
              wallSubsetMeshes[wallid].rotation.z
            );
            allOpeningsMeshes[j].position.set(
              -wallSubsetMeshesStartPositions[wallid].x,
              -wallSubsetMeshesStartPositions[wallid].y,
              -wallSubsetMeshesStartPositions[wallid].z
            );

            wallSubsetMeshes[wallid].add(allOpeningsMeshes[j]);
          }
          if (wallDirection[wallid].x === -1) {
            //console.log("x-1")

            allOpeningsMeshes[j].rotation.set(
              wallSubsetMeshes[wallid].rotation.x,
              wallSubsetMeshes[wallid].rotation.y,
              wallSubsetMeshes[wallid].rotation.z
            );
            allOpeningsMeshes[j].position.set(
              -wallSubsetMeshesStartPositions[wallid].x,
              -wallSubsetMeshesStartPositions[wallid].y,
              -wallSubsetMeshesStartPositions[wallid].z
            );
            wallSubsetMeshes[wallid].add(allOpeningsMeshes[j]);
          }
        }
      }
    }
  }
}

function computeWallBB(wallMesh) {
  wallMesh.geometry.computeBoundsTree();

  let wallBB = new Box3(new Vector3(), new Vector3());
  wallBB.copy(wallMesh.geometry.boundingBox);
  wallMesh.updateMatrixWorld(true);

  wallBB.applyMatrix4(wallMesh.matrixWorld);

  const center = new Vector3(0, 0, 0);
  centerWall = wallBB.getCenter(center);

  const wallSphere = new SphereGeometry(0.4);
  const wallMeshSphere = new Mesh(
    wallSphere,
    new MeshBasicMaterial({ color: "green", transparent: true, opacity: 0.5 })
  );
  wallMeshSphere.position.set(centerWall.x, centerWall.y, centerWall.z);
  //scene.add(wallMeshSphere)

  wallCenterPoints.push(centerWall);

  const boxhelper = new BoxHelper(wallMesh, 0x000000);
  //scene.add(boxhelper)

  wallBounds.push(wallBB);
}

async function startPositionAllSubsetMeshes(furnitureMeshes) {
  for (let i = 0; i < furnitureMeshes.length; i++) {
    const pickedFurnishingElement = await loader.ifcManager.getItemProperties(
      0,
      allSubsetMeshes[i].uuid
    );

    const objectPlacement = pickedFurnishingElement.ObjectPlacement.value;
    const ObjectPlacement = await loader.ifcManager.getItemProperties(
      0,
      objectPlacement
    );

    const relativePlacement = ObjectPlacement.RelativePlacement.value;
    const RelPlace = await loader.ifcManager.getItemProperties(
      0,
      relativePlacement
    );
    const location = RelPlace.Location.value;
    const Location = await loader.ifcManager.getItemProperties(0, location);

    const startPos = new Vector3(
      Location.Coordinates[0].value,
      Location.Coordinates[2].value,
      -Location.Coordinates[1].value
    );

    startPositionsFurns.push(startPos);
  }
}

async function coordinatesFurniture(id) {
  const pickedFurnishingElement = await loader.ifcManager.getItemProperties(
    0,
    id
  );

  const objectPlacement = pickedFurnishingElement.ObjectPlacement.value;
  const ObjectPlacement = await loader.ifcManager.getItemProperties(
    0,
    objectPlacement
  );

  const relativePlacement = ObjectPlacement.RelativePlacement.value;
  const RelPlace = await loader.ifcManager.getItemProperties(
    0,
    relativePlacement
  );

  const location = RelPlace.Location.value;
  const Location = await loader.ifcManager.getItemProperties(0, location);

  return Location.Coordinates;
}

//-------------------------GREY MODELLVIEW --------------------------
//---------------------------------------------------------------------------------

async function getSpecificSubset(entity, material) {
  const subsetMesh = [];
  const ids = await loader.ifcManager.getAllItemsOfType(0, entity, false);

  for (let entity = 0; entity < ids.length; entity++) {
    const id = ids[entity];

    entitySubset = loader.ifcManager.createSubset({
      modelID: 0,
      ids: [id],
      scene,
      removePrevious: true,
      material: material,
      customID: [id].toString(),
    });
    subsetMesh.push(entitySubset);
  }
  return subsetMesh;
}

async function allElements() {
  const walls = await getSpecificSubset(
    IFCWALLSTANDARDCASE,
    hidedObjectMaterial
  );
  doorSub.push(await getSpecificSubset(IFCDOOR, hidedObjectMaterial));
  windowSub.push(await getSpecificSubset(IFCWINDOW, hidedObjectMaterial));

  for (let i = 0; i < wallSubsetMeshes.length; i++) {
    walls[i].uuid = wallSubsetMeshes[i].uuid;
  }
  wallSubset = walls;

  await getSpecificSubset(IFCPLATE, hidedObjectMaterial);
  await getSpecificSubset(IFCMEMBER, hidedObjectMaterial);
  slabSub.push(await getSpecificSubset(IFCSLAB, slabMaterial));
}

async function getRefDirectionFurniture() {
  for (let i = 0; i < ids.length; i++) {
    const pickedFurnishingElement = await loader.ifcManager.getItemProperties(
      0,
      ids[i]
    );
    const objectPlacement = pickedFurnishingElement.ObjectPlacement.value;
    const ObjectPlacement = await loader.ifcManager.getItemProperties(
      0,
      objectPlacement
    );
    const relativePlacement = ObjectPlacement.RelativePlacement.value;
    const RelPlace = await loader.ifcManager.getItemProperties(
      0,
      relativePlacement
    );

    const refDir = RelPlace.RefDirection;

    if (refDir == null) {
      refDirNull = new Vector3(1, 0, 0);
      ReferenceDirections.push(refDirNull);
    } else {
      const refDirection = await loader.ifcManager.getItemProperties(
        0,
        refDir.value
      );
      const refDirectionX = refDirection.DirectionRatios[0].value;
      const refDirectionY = refDirection.DirectionRatios[1].value;
      const refDirectionZ = refDirection.DirectionRatios[2].value;

      const referenceVector = new Vector3(
        refDirectionX,
        refDirectionY,
        refDirectionZ
      );

      ReferenceDirections.push(referenceVector);
    }
  }
}

//-------------------------PICKING--------------------------
//---------------------------------------------------------------------------------

async function pickFurniture(event, material, furnitureMeshes) {
  //console.log("pickFurniture")
  const found = castObjects(event, furnitureMeshes)[0];

  if (found) {
    if (furnituremodeIsActive === true || checkedBtnmodeIsActive === true) {
      checkBtn.style.visibility = "visible";
    } else {
      checkBtn.style.visibility = "hidden";
    }

    const index = found.faceIndex;

    lastFurnitureFound = found.object;

    const geometry = found.object.geometry;
    const gumballPosition = gumball.position.set(
      found.point.x,
      found.point.y,
      found.point.z
    );

    // Id which collided with raycaster
    const ifc = loader.ifcManager;
    const id = ifc.getExpressId(geometry, index);

    delete geometry.uuid;
    geometry.uuid = id;

    gumball.attach(lastFurnitureFound);

    scene.add(gumball);

    gumball.position.set(
      gumballPosition.x - lastFurnitureFound.position.x,
      gumballPosition.y,
      gumballPosition.z - lastFurnitureFound.position.z
    );

    const coords = await coordinatesFurniture(id);

    indexFound = furnitureMeshes.indexOf(found.object);
    const modifiedCenter = new Vector3(
      centerPoints[indexFound].x,
      centerPoints[indexFound].y - centerPoints[indexFound].y,
      centerPoints[indexFound].z
    );

    await generateAreasOnClick(indexFound, modifiedCenter, lastFurnitureFound);
  }
}

async function pickFurnitureSecond(event, furnitureMeshes, areasMeshes) {
  if (gumball.showX !== true && gumball.mode === "translate") {
    gumball.showX = true;
  }
  if (gumball.showZ !== true && gumball.mode === "translate") {
    gumball.showZ = true;
  }

  for (let l = 0; l < labels.length; l++) {
    scene.remove(labels[l]);
  }
  labels.length = 0;

  for (let l = 0; l < DINLabels.length; l++) {
    scene.remove(DINLabels[l]);
  }
  DINLabels.length = 0;

  for (let l = 1; l < startPositionAreas.length; l++) {
    scene.remove(startPositionAreas[l]);
  }

  const found = castObjects(event, furnitureMeshes)[0];

  if (found) {
    lastFurniture = found.object;

    //console.log(lastFurniture)

    selectedCube.push(found.object);

    for (id = 0; id < areasMeshes.length; id++) {
      if (areasMeshes[id].uuid === found.object.uuid) {
        //console.log("id", id,areasMeshes[id].uuid , found.object.uuid, selectedCube )
        lastIndex = id;
      }
    }

    let center = new Vector3(0, 0, 0);
    center = areasMeshes[lastIndex].geometry.boundingBox.getCenter(center);

    gumball.position.set(center.x, center.y, center.z);

    gumball.setSpace("local");

    //console.log("lastIndex", lastIndex, areasMeshes, furnitureMeshes)

    //move furniture around
    gumball.attach(areasMeshes[lastIndex]);
    //console.log("Position", lastFurniture, areasMeshes[lastIndex], centerPoints[lastIndex], areaPositions, allSubsetMeshes[lastIndex].children)

    let centerFurn = new Vector3(0, 0, 0);
    centerFurn =
      furnitureMeshes[lastIndex].geometry.boundingBox.getCenter(centerFurn);
    //console.log("centerFurn", centerFurn)

    if (
      lastFurniture.position.x === 0 &&
      lastFurniture.position.y === 0 &&
      lastFurniture.position.z === 0
    ) {
      lastFurniture.position.set(
        -areasMeshes[lastIndex].position.x,
        areasMeshes[lastIndex].position.y,
        -areasMeshes[lastIndex].position.z
      );
      lastFurniture.rotation.set(
        areasMeshes[lastIndex].rotation.x,
        -areasMeshes[lastIndex].rotation.y,
        areasMeshes[lastIndex].rotation.z
      );
    }
    areasMeshes[lastIndex].add(lastFurniture);

    const sphereLocal = new Mesh(
      sphereGeometry,
      new MeshBasicMaterial({ color: orangeColor })
    );
    sphereLocal.position.set(
      areasMeshes[lastIndex].position.x,
      areasMeshes[lastIndex].position.y,
      areasMeshes[lastIndex].position.z
    );

    startPositionAreas.unshift(sphereLocal);
    scene.add(startPositionAreas[0]);

    scene.add(gumball);
  }
}

async function pickFurnitureWall(event, furnitureMeshes, areasMeshes) {
  if (gumball.mode === "rotate") {
    gumball.setMode("translate");
  }

  for (let l = 0; l < labels.length; l++) {
    scene.remove(labels[l]);
  }
  for (let l = 0; l < DINLabels.length; l++) {
    scene.remove(DINLabels[l]);
  }

  DINLabels.length = 0;
  labels.length = 0;
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

  if (found) {
    lastFurniture = found.object;

    selectedWallGumball.push(found.object.uuid);

    for (id = 0; id < areasMeshes.length; id++) {
      if (furnitureMeshes[id].uuid === found.object.uuid) {
        //console.log("id", id,areasMeshes[id].uuid , found.object.uuid )
        lastIndex = id;
      }
    }

    gumball.position.set(0, 0, 0);
    gumball.setSpace("local");

    //move furniture around
    gumball.attach(areasMeshes[lastIndex]);

    scene.add(gumball);

    wallSubsetMeshes[lastIndex].geometry.computeBoundsTree();

    let wallBB2 = new Box3(new Vector3(), new Vector3());
    wallBB2.copy(wallSubsetMeshes[lastIndex].geometry.boundingBox);
    wallSubsetMeshes[lastIndex].updateMatrixWorld(true);

    wallBB2.applyMatrix4(wallSubsetMeshes[lastIndex].matrixWorld);

    const sizeFurnBB = wallBB2.getSize(new Vector3());
    const centerWall = wallBB2.getCenter(new Vector3());

    if (wallDirection[lastIndex].x === -1) {
      wallMeshLastIndex(
        sizeFurnBB.x,
        sizeFurnBB.y,
        sizeFurnBB.z,
        centerWall.x,
        centerWall.y,
        centerWall.z,
        0
      );

      if (gumball.showX !== false) {
        gumball.showX = false;
      }
      if (gumball.showZ !== true) {
        gumball.showZ = true;
      }
      if (gumball.showY !== false) {
        gumball.showY = false;
      }

      //wallMeshSpheres[lastIndex].position.set( wallCenterPoints[lastIndex].x, wallMeshSpheres[lastIndex].position.y, wallCenterPoints[lastIndex].z - sizeFurnBB.x  )
    }
    if (wallDirection[lastIndex].x === 1) {
      wallMeshLastIndex(
        sizeFurnBB.x,
        sizeFurnBB.y,
        sizeFurnBB.z,
        centerWall.x,
        centerWall.y,
        centerWall.z,
        0
      );
      if (gumball.showX !== false) {
        gumball.showX = false;
      }
      if (gumball.showZ !== true) {
        gumball.showZ = true;
      }
      if (gumball.showY !== false) {
        gumball.showY = false;
      }

      // wallMeshSpheres[lastIndex].position.set( wallCenterPoints[lastIndex].x, wallMeshSpheres[lastIndex].position.y,  sizeFurnBB.x)
    }
    if (wallDirection[lastIndex].y === -1) {
      wallMeshLastIndex(
        sizeFurnBB.z,
        sizeFurnBB.y,
        sizeFurnBB.x,
        centerWall.x,
        centerWall.y,
        centerWall.z,
        Math.PI / 2
      );
      if (gumball.showX !== false) {
        gumball.showX = false;
      }
      if (gumball.showZ !== true) {
        gumball.showZ = true;
      }
      if (gumball.showY !== false) {
        gumball.showY = false;
      }
    }
    if (wallDirection[lastIndex].y === 1) {
      wallMeshLastIndex(
        sizeFurnBB.z,
        sizeFurnBB.y,
        sizeFurnBB.x,
        centerWall.x,
        centerWall.y,
        centerWall.z,
        Math.PI / 2
      );
      if (gumball.showX !== false) {
        gumball.showX = false;
      }
      if (gumball.showZ !== true) {
        gumball.showZ = true;
      }
      if (gumball.showY !== false) {
        gumball.showY = false;
      }
    }

    function wallMeshLastIndex(
      boxwidth,
      boxheight,
      boxlenght,
      posX,
      posY,
      posZ,
      angle
    ) {
      const wallCopy = new BoxGeometry(boxwidth, boxheight, boxlenght);
      const wallDynamicMesh = new Mesh(
        wallCopy,
        new MeshBasicMaterial({
          color: "blue",
          transparent: true,
          opacity: 0.6,
        })
      );
      wallDynamicMesh.position.set(posX, posY, posZ);
      wallDynamicMesh.rotateY(angle);

      wallDynamicMesh.geometry.computeBoundsTree();

      let wallBB = new Box3(new Vector3(), new Vector3());
      wallBB.copy(wallDynamicMesh.geometry.boundingBox);
      wallDynamicMesh.updateMatrixWorld(true);

      wallBB.applyMatrix4(wallDynamicMesh.matrixWorld);

      wallBounds[lastIndex] = wallBB;
      const centerWall1 = wallBB.getCenter(new Vector3());
      wallCenterPoints[lastIndex] = centerWall1;

      wallsDynamicListe.push(wallDynamicMesh);
      wallDynamicMesh.uuid = wallSubsetMeshes[lastIndex].uuid;

      wallSubsetMeshes[lastIndex].position = centerWall1;
    }
  } else if (lastFurniture) {
    lastFurniture = undefined;
    wIsDown = false;
    aIsDown = false;
    scene.remove(gumball);
  }
}

function castObjects(event, ifcModels) {
  const bounds = canvas.getBoundingClientRect();

  const x1 = event.clientX - bounds.left;
  const x2 = bounds.right - bounds.left;
  mouse.x = (x1 / x2) * 2 - 1;

  const y1 = event.clientY - bounds.top;
  const y2 = bounds.bottom - bounds.top;
  mouse.y = -(y1 / y2) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersection = raycaster.intersectObjects(ifcModels);
  return intersection;
}

//-------------------------GENERATING AREAS --------------------------
//---------------------------------------------------------------------------------

async function generateAreasOnClick(
  indexFound,
  modifiedCenter,
  lastFurnitureFound
) {
  let area;

  var bed = document.getElementById("Bett").checked;
  var kitchen = document.getElementById("Küchenzeile").checked;
  var toilet = document.getElementById("WC").checked;
  var sink = document.getElementById("Waschtisch").checked;
  var tube = document.getElementById("Badewanne").checked;
  var shower = document.getElementById("Dusche").checked;

  let lastFurnitureFoundBB = new Box3(new Vector3(), new Vector3());
  lastFurnitureFoundBB.setFromObject(lastFurnitureFound);
  lastFurnitureFoundBB
    .copy(lastFurnitureFound.geometry.boundingBox)
    .applyMatrix4(lastFurnitureFound.matrixWorld);

  const sizeBB = lastFurnitureFoundBB.getSize(new Vector3());

  async function setSpecificArea(checkboxID, width, length) {
    if (checkboxID) {
      area = await generateAreaFurniture(width, length, modifiedCenter);
      scene.add(area);
      areaMeshes.splice(indexFound, 1, area);
      for (let i = 0; i < areaMeshes.length; i++) {
        ReferencePositionAreas.push(area.position);
      }
    }
    return area;
  }

  async function positionFurnitureArea(
    rotate,
    checkboxID,
    width,
    length,
    positionX,
    positionY,
    positionZ
  ) {
    if (checkboxID) {
      let area = await setSpecificArea(checkboxID, width, length);
      area.position.set(positionX, positionY, positionZ);
      area.rotation.set(0, rotate, 0);
      specificFurnIDList.push({
        key: input[0],
        value: lastFurnitureFound.geometry.uuid,
      });

      idsUsed.unshift(lastFurnitureFound.geometry.uuid);

      areaPositions.push({
        key: lastFurnitureFound.geometry.uuid,
        value: area,
      });

      return area;
    }
  }

  if (ReferenceDirections[indexFound].x > 0) {
    area = await positionFurnitureArea(
      0,
      toilet,
      0.7,
      1.2 + sizeBB.x,
      modifiedCenter.x + 0.3,
      modifiedCenter.y,
      modifiedCenter.z - (sizeBB.z - 0.7) / 2
    );
    area = await positionFurnitureArea(
      0,
      sink,
      0.55,
      0.9,
      modifiedCenter.x,
      modifiedCenter.y,
      modifiedCenter.z - (sizeBB.z - 0.55) / 2
    );

    area = await positionFurnitureArea(
      0,
      tube,
      1.5,
      1.5,
      modifiedCenter.x,
      modifiedCenter.y,
      modifiedCenter.z + (sizeBB.z + 1.5) / 2
    );
    area = await positionFurnitureArea(
      0,
      shower,
      1.5,
      1.5,
      modifiedCenter.x,
      modifiedCenter.y,
      modifiedCenter.z
    );

    let sidemax = Math.max(sizeBB.x, sizeBB.z);
    if (sidemax < 1.5) {
      sidemax = 1.5;
    }
    area = await positionFurnitureArea(
      0,
      kitchen,
      1.4,
      sidemax,
      modifiedCenter.x,
      modifiedCenter.y,
      modifiedCenter.z + (sizeBB.z + 1.5) / 2
    );

    area = await positionFurnitureArea(
      0,
      bed,
      sizeBB.x + 1.5,
      1.5 + 1.2 + sizeBB.z,
      modifiedCenter.x - 0.15,
      modifiedCenter.y,
      modifiedCenter.z + 1.5 / 2
    );
  }
  if (ReferenceDirections[indexFound].x < 0) {
    area = await positionFurnitureArea(
      0,
      toilet,
      0.7,
      1.2 + sizeBB.x,
      modifiedCenter.x - 0.3,
      modifiedCenter.y,
      modifiedCenter.z + (sizeBB.z - 0.7) / 2
    );
    area = await positionFurnitureArea(
      0,
      sink,
      0.55,
      0.9,
      modifiedCenter.x,
      modifiedCenter.y,
      modifiedCenter.z + (sizeBB.z - 0.55) / 2
    );

    area = await positionFurnitureArea(
      0,
      tube,
      1.5,
      1.5,
      modifiedCenter.x,
      modifiedCenter.y,
      modifiedCenter.z - (sizeBB.z + 1.5) / 2
    );
    area = await positionFurnitureArea(
      0,
      shower,
      1.5,
      1.5,
      modifiedCenter.x,
      modifiedCenter.y,
      modifiedCenter.z
    );

    let sidemax = Math.max(sizeBB.x, sizeBB.z);
    if (sidemax < 1.5) {
      sidemax = 1.5;
    }
    area = await positionFurnitureArea(
      0,
      kitchen,
      1.5,
      sidemax,
      modifiedCenter.x,
      modifiedCenter.y,
      modifiedCenter.z - (sizeBB.z + 1.5) / 2
    );

    area = await positionFurnitureArea(
      0,
      bed,
      sizeBB.x + 1.5,
      1.5 + 1.2 + sizeBB.z,
      modifiedCenter.x - 0.15,
      modifiedCenter.y,
      modifiedCenter.z - 1.5 / 2
    );
  }

  if (ReferenceDirections[indexFound].y > 0) {
    area = await positionFurnitureArea(
      Math.PI / 2,
      toilet,
      0.7,
      1.2 + sizeBB.x,
      modifiedCenter.x - (sizeBB.x - 0.7) / 2,
      modifiedCenter.y,
      modifiedCenter.z + 0.3
    );

    area = await positionFurnitureArea(
      Math.PI / 2,
      sink,
      0.55,
      0.9,
      modifiedCenter.x - (sizeBB.x - 0.55) / 2,
      modifiedCenter.y,
      modifiedCenter.z
    );
    area = await positionFurnitureArea(
      Math.PI / 2,
      tube,
      1.5,
      1.5,
      modifiedCenter.x + (sizeBB.x + 1.5) / 2,
      modifiedCenter.y,
      modifiedCenter.z
    );
    area = await positionFurnitureArea(
      Math.PI / 2,
      shower,
      1.5,
      1.5,
      modifiedCenter.x,
      modifiedCenter.y,
      modifiedCenter.z
    );

    let sidemax = Math.max(sizeBB.x, sizeBB.z);
    if (sidemax < 1.5) {
      sidemax = 1.5;
    }
    area = await positionFurnitureArea(
      Math.PI / 2,
      kitchen,
      1.5,
      sidemax,
      modifiedCenter.x + (sizeBB.x + 1.5) / 2,
      modifiedCenter.y,
      modifiedCenter.z
    );
    area = await positionFurnitureArea(
      Math.PI / 2,
      bed,
      sizeBB.x + 1.5,
      1.5 + 1.2 + sizeBB.z,
      modifiedCenter.x + 1.5 / 2,
      modifiedCenter.y,
      modifiedCenter.z - 0.15
    );
  }

  if (ReferenceDirections[indexFound].y < 0) {
    area = await positionFurnitureArea(
      Math.PI / 2,
      toilet,
      0.7,
      1.2 + sizeBB.x,
      modifiedCenter.x + (sizeBB.x - 0.7) / 2,
      modifiedCenter.y,
      modifiedCenter.z + 0.3
    );

    area = await positionFurnitureArea(
      Math.PI / 2,
      sink,
      0.55,
      0.9,
      modifiedCenter.x + (sizeBB.x - 0.55) / 2,
      modifiedCenter.y,
      modifiedCenter.z
    );
    area = await positionFurnitureArea(
      Math.PI / 2,
      tube,
      1.5,
      1.5,
      modifiedCenter.x - (sizeBB.x + 1.5) / 2,
      modifiedCenter.y,
      modifiedCenter.z
    );
    area = await positionFurnitureArea(
      Math.PI / 2,
      shower,
      1.5,
      1.5,
      modifiedCenter.x,
      modifiedCenter.y,
      modifiedCenter.z
    );

    let sidemax = Math.max(sizeBB.x, sizeBB.z);
    if (sidemax < 1.5) {
      sidemax = 1.5;
    }
    area = await positionFurnitureArea(
      Math.PI / 2,
      kitchen,
      1.5,
      sidemax,
      modifiedCenter.x - (sizeBB.x + 1.5) / 2,
      modifiedCenter.y,
      modifiedCenter.z
    );
    area = await positionFurnitureArea(
      Math.PI / 2,
      bed,
      sizeBB.x + 1.5,
      1.5 + 1.2 + sizeBB.z,
      modifiedCenter.x - 1.5 / 2,
      modifiedCenter.y,
      modifiedCenter.z - 0.15
    );
  }
}

async function generateAreaFurniture(
  lengtharea,
  widtharea,
  lastFurnitureFound
) {
  const areaMesh = new Mesh(
    new BoxGeometry(widtharea, 0.01, lengtharea),
    new MeshBasicMaterial({ color: greyColor, transparent: true, opacity: 0.6 })
  );

  areaMesh.position.set(
    lastFurnitureFound.x,
    lastFurnitureFound.y,
    lastFurnitureFound.z
  );
  return areaMesh;
}

//--------------COLLISIONCHECKLOOP MEASURE  PICKING FURN + WALLS--------------------------
//---------------------------------------------------------------------------------

function meausreDistance(startPositionArea, area) {
  if (startPositionArea.length > 0) {
    const lastEntry = startPositionArea[0].position;

    const distanceMeasure = new Vector3(
      lastEntry.x,
      lastEntry.y,
      lastEntry.z
    ).distanceTo(
      new Vector3(
        area[lastIndex].position.x,
        area[lastIndex].position.y,
        area[lastIndex].position.z
      )
    );

    const measureTxt = document.createElement("button");
    if (distanceMeasure > 0) {
      measureTxt.textContent = distanceMeasure.toFixed(2);
    }

    measureTxt.className = "measureText";

    const labelObjectTxt = new CSS2DObject(measureTxt);
    labelMeasure.unshift(labelObjectTxt);

    for (let z = 1; z < labelMeasure.length; z++) {
      scene.remove(labelMeasure[z]);
    }
    labelMeasure[0].position.set(
      (lastEntry.x + area[lastIndex].position.x) / 2,
      lastEntry.y,
      (lastEntry.z + area[lastIndex].position.z) / 2
    );
    scene.add(labelMeasure[0]);

    const lineGeometry = new BufferGeometry().setFromPoints([
      new Vector3(lastEntry.x, lastEntry.y, lastEntry.z),
      new Vector3(
        area[lastIndex].position.x,
        area[lastIndex].position.y,
        area[lastIndex].position.z
      ),
    ]);
    const line = new Line(
      lineGeometry,
      new LineBasicMaterial({ color: orangeColor, linewidth: 2 })
    );

    lines.unshift(line);
    for (let l = 1; l < lines.length; l++) {
      scene.remove(lines[l]);
    }
    scene.add(lines[0]);
  }
}
function collisionCheckLoop() {
  if (areas.length >= 1) {
    meausreDistance(startPositionAreas, areas);

    canvas.onpointerup = (event) => {
      const spherePos = allSubsetMeshes[lastIndex].children[0].getWorldPosition(
        new Vector3()
      );
      const vectorDir = new Vector3(
        areas[lastIndex].position.z - spherePos.z,
        areas[lastIndex].position.x - spherePos.x,
        0
      );

      modifiedDirections[lastIndex] = vectorDir.normalize();
    };

    if (lastIndex !== undefined) {
      for (let cube = 0; cube < boundingCubes.length; cube++) {
        boundingCubes[cube]
          .copy(areas[cube].geometry.boundingBox)
          .applyMatrix4(areas[cube].matrixWorld);
      }

      for (let cube = 0; cube < subsetBoundingBoxes.length; cube++) {
        subsetBoundingBoxes[cube]
          .copy(allSubsetMeshes[cube].geometry.boundingBox)
          .applyMatrix4(allSubsetMeshes[cube].matrixWorld);
      }
      for (let cube = 0; cube < wallBounds.length; cube++) {
        wallBounds[cube]
          .copy(wallSubsetMeshes[cube].geometry.boundingBox)
          .applyMatrix4(wallSubsetMeshes[cube].matrixWorld);
      }

      DINCHECKER();
      newColorForCollidingArea(
        IntersectionsIDsAreaIntersectArea,
        IntersectionsIDsAreaIntersectAreaWith,
        greyColor
      );
      newColorForCollidingArea(
        IntersectionsIDsAreaContainArea,
        IntersectionsIDsAreaContainAreaWith,
        areaContainAreaColor
      );

      newColorForCollidingArea(
        IntersectionsIDsFurnIntersectFurn,
        IntersectionsIDsFurnIntersectFurnWith,
        furnIntersectFurnColor
      );
      newColorForCollidingArea(
        IntersectionsIDsFurnContainFurn,
        IntersectionsIDsFurnContainFurnWith,
        furnContainFurnColor
      );

      newColorForCollidingArea(
        IntersectionsIDs,
        IntersectionsIDsWith,
        furnClashAreaColor
      );
      newColorForCollidingArea(
        IntersectionsIDsAreaContainFurn,
        IntersectionsIDsAreaContainFurnWith,
        furnClashAreaColor
      );

      newColorForCollidingArea(
        IntersectionsIDsFurnIntersectArea,
        IntersectionsIDsFurnIntersectAreaWith,
        furnClashAreaColor
      );
      newColorForCollidingArea(
        IntersectionsIDsFurnContainArea,
        IntersectionsIDsFurnContainAreaWith,
        furnClashAreaColor
      );

      newColorForCollidingArea(
        IntersectionsIDsAreaIntersectWall,
        IntersectionsIDsAreaIntersectWallWith,
        greyColor
      );
      newColorForCollidingArea(
        IntersectionsIDsAreaContainWall,
        IntersectionsIDsAreaContainWallWith,
        furnClashAreaColor
      );

      newColorForCollidingArea(
        IntersectionsIDsFurnIntersectWall,
        IntersectionsIDsFurnIntersectWallWith,
        greyColor
      );
      newColorForCollidingArea(
        IntersectionsIDsFurnContainWall,
        IntersectionsIDsFurnContainWallWith,
        furnContainFurnColor
      );

      for (let id = 0; id < allIDsInChecker.length; id++) {
        if (
          IntersectionsIDsAreaIntersectArea.includes(allIDsInChecker[id]) ===
            false &&
          IntersectionsIDsAreaContainArea.includes(allIDsInChecker[id]) ===
            false &&
          IntersectionsIDsFurnIntersectFurn.includes(allIDsInChecker[id]) ===
            false &&
          IntersectionsIDsFurnContainFurn.includes(allIDsInChecker[id]) ===
            false &&
          IntersectionsIDsFurnIntersectArea.includes(allIDsInChecker[id]) ===
            false &&
          IntersectionsIDsFurnContainArea.includes(allIDsInChecker[id]) ===
            false &&
          IntersectionsIDs.includes(allIDsInChecker[id]) === false &&
          IntersectionsIDsAreaIntersectWall.includes(allIDsInChecker[id]) ===
            false &&
          IntersectionsIDsAreaContainWall.includes(allIDsInChecker[id]) ===
            false &&
          IntersectionsIDsFurnIntersectWall.includes(allIDsInChecker[id]) ===
            false &&
          IntersectionsIDsFurnContainWall.includes(allIDsInChecker[id]) ===
            false &&
          IntersectionsIDsAreaContainFurn.includes(allIDsInChecker[id]) ===
            false &&
          IntersectionsIDsAreaIntersectAreaWith.includes(
            allIDsInChecker[id]
          ) === false &&
          IntersectionsIDsAreaContainAreaWith.includes(allIDsInChecker[id]) ===
            false &&
          IntersectionsIDsFurnIntersectFurnWith.includes(
            allIDsInChecker[id]
          ) === false &&
          IntersectionsIDsFurnContainFurnWith.includes(allIDsInChecker[id]) ===
            false &&
          IntersectionsIDsFurnIntersectAreaWith.includes(
            allIDsInChecker[id]
          ) === false &&
          IntersectionsIDsFurnContainAreaWith.includes(allIDsInChecker[id]) ===
            false &&
          IntersectionsIDsWith.includes(allIDsInChecker[id]) === false &&
          IntersectionsIDsAreaIntersectWallWith.includes(
            allIDsInChecker[id]
          ) === false &&
          IntersectionsIDsAreaContainWallWith.includes(allIDsInChecker[id]) ===
            false &&
          IntersectionsIDsFurnIntersectWallWith.includes(
            allIDsInChecker[id]
          ) === false &&
          IntersectionsIDsFurnContainWallWith.includes(allIDsInChecker[id]) ===
            false &&
          IntersectionsIDsAreaContainFurnWith.includes(allIDsInChecker[id]) ===
            false
        ) {
          for (let i = 0; i < areas.length; i++) {
            if (areas[i].uuid === allIDsInChecker[id]) {
              areas[i].material = new MeshBasicMaterial({
                color: 0x007050,
                transparent: true,
                opacity: 0.2,
              });
            }
          }
        }
      }

      function newColorForCollidingArea(
        IntersectionsIDsAreaIntersectArea,
        IntersectionsIDsAreaIntersectAreaWith,
        color
      ) {
        if (
          IntersectionsIDsAreaIntersectArea.includes(areas[lastIndex].uuid) ===
          true
        ) {
          const indexSearching = IntersectionsIDsAreaIntersectArea.indexOf(
            areas[lastIndex].uuid
          );
          for (let i = 0; i < areas.length; i++) {
            if (
              areas[i].uuid ===
              IntersectionsIDsAreaIntersectAreaWith[indexSearching]
            ) {
              areas[i].material.color = color;
            }
          }
        }
      }

      if (
        IntersectionsIDsAreaIntersectArea.length === 0 &&
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
        IntersectionsIDsAreaContainFurn.length === 0
      ) {
        for (let i = 0; i < areas.length; i++) {
          areas[i].material.color = greyColor;
        }
      }
    }
  }
}

//-------------------------EDITING IFC FILE--------------------------
//---------------------------------------------------------------------------------
async function overwriteIfcFile(event, furnitureMeshes) {
  const updatedPositionsFurniture = [];

  for (let i = 0; i < furnitureMeshes.length; i++) {
    updatedPositionsFurniture.push(furnitureMeshes[i].position);
    const pickedFurnishingElement = await loader.ifcManager.getItemProperties(
      0,
      allSubsetMeshes[i].uuid
    );

    const objectPlacement = pickedFurnishingElement.ObjectPlacement.value;

    const ObjectPlacements = await loader.ifcManager.getItemProperties(
      0,
      objectPlacement,
      true
    );

    const refDir = ObjectPlacements.RelativePlacement.RefDirection;

    for (let j = 0; j < locationSaver.length; j++) {
      const sphereLocal = new Mesh(
        sphereGeometry,
        new MeshBasicMaterial({ color: 0xff0000 })
      );
      sphereLocal.position.set(
        locationSaver[i][0].value,
        locationSaver[i][2].value,
        -locationSaver[i][1].value
      );
      spheresLocal.push(sphereLocal.position);
    }

    const center = new Vector3(0, 0, 0);
    const modiefiedReferenz =
      allSubsetMeshes[i].geometry.boundingBox.getCenter(center);

    const modiefiedReferenzX = modiefiedReferenz.x;
    const modiefiedReferenzZ = modiefiedReferenz.z;
    const modiefiedReferenzY = modiefiedReferenz.y;

    const sphereLocal = new Mesh(
      sphereGeometry,
      new MeshBasicMaterial({ color: 0xffff00 })
    ); //gelb
    sphereLocal.position.set(
      modiefiedReferenzX,
      modiefiedReferenzY,
      modiefiedReferenzZ
    );

    const modiefiedReferenzArea = areas[i].position;
    const sphereLocalArea = new Mesh(
      sphereGeometry,
      new MeshBasicMaterial({ color: 0xff00ff })
    ); //pink
    sphereLocalArea.position.set(
      modiefiedReferenzArea.x,
      1,
      modiefiedReferenzArea.z
    );
    //scene.add(sphereLocalArea)

    const sphereLocalArea2 = new Mesh(
      sphereGeometry,
      new MeshBasicMaterial({ color: 0x0000ff })
    ); //blau
    sphereLocalArea2.position.set(
      modiefiedReferenzArea.x + ReferencePositions[i].x,
      modiefiedReferenzArea.y + ReferencePositions[i].y,
      modiefiedReferenzArea.z + ReferencePositions[i].z
    );
    //scene.add(sphereLocalArea2)

    const sphereLocalArea3 = new Mesh(
      sphereGeometry,
      new MeshBasicMaterial({ color: 0x00ff00 })
    ); //grün
    sphereLocalArea3.position.set(
      startPositionsFurns[i].x,
      1.3,
      startPositionsFurns[i].z
    );
    //scene.add(sphereLocalArea3)

    ///Rotation
    if (ObjectPlacements.RelativePlacement.RefDirection == null) {
      refDirNull = new Vector3(1, 0, 0);
    } else {
      ObjectPlacements.RelativePlacement.RefDirection.DirectionRatios[0].value =
        modifiedDirections[i].x;
      ObjectPlacements.RelativePlacement.RefDirection.DirectionRatios[1].value =
        modifiedDirections[i].y;
      ObjectPlacements.RelativePlacement.RefDirection.DirectionRatios[2].value =
        modifiedDirections[i].z;
    }
    ///LOcation
    //console.log("R", modifiedDirections[i], ReferenceDirections[i], areas[i].uuid )
    if (
      modifiedDirections[i].x === ReferenceDirections[i].x &&
      modifiedDirections[i].y === ReferenceDirections[i].y &&
      modifiedDirections[i].z === ReferenceDirections[i].z
    ) {
      //console.log("equals", modiefiedReferenzArea, ReferencePositions[i])
      ObjectPlacements.RelativePlacement.Location.Coordinates[0].value =
        modiefiedReferenzArea.x + ReferencePositions[i].x;
      ObjectPlacements.RelativePlacement.Location.Coordinates[1].value = -(
        modiefiedReferenzArea.z + ReferencePositions[i].z
      );
      ObjectPlacements.RelativePlacement.Location.Coordinates[2].value =
        modiefiedReferenzArea.y + ReferencePositions[i].y;
    } else if (
      modifiedDirections[i].x !== ReferenceDirections[i].x ||
      modifiedDirections[i].y !== ReferenceDirections[i].y ||
      modifiedDirections[i].z !== ReferenceDirections[i].z
    ) {
      //console.log("unequals", modiefiedReferenzArea, ReferencePositions[i])

      if (modifiedDirections[i].x < 0) {
        //console.log("x-1", modiefiedReferenzArea, ReferencePositions[i])
        ObjectPlacements.RelativePlacement.Location.Coordinates[0].value =
          modiefiedReferenzArea.x + ReferencePositions[i].z;
        ObjectPlacements.RelativePlacement.Location.Coordinates[1].value = -(
          modiefiedReferenzArea.z - ReferencePositions[i].x
        );
        ObjectPlacements.RelativePlacement.Location.Coordinates[2].value =
          modiefiedReferenzArea.y;
      }
      if (modifiedDirections[i].x > 0) {
        //console.log("x+1", modiefiedReferenzArea, ReferencePositions[i])
        ObjectPlacements.RelativePlacement.Location.Coordinates[0].value =
          modiefiedReferenzArea.x + ReferencePositions[i].z;
        ObjectPlacements.RelativePlacement.Location.Coordinates[1].value = -(
          modiefiedReferenzArea.z + -ReferencePositions[i].x
        );
        ObjectPlacements.RelativePlacement.Location.Coordinates[2].value =
          modiefiedReferenzArea.y;
      }
      if (modifiedDirections[i].y < 0) {
        //console.log("y-1", modiefiedReferenzArea, ReferencePositions[i])
        ObjectPlacements.RelativePlacement.Location.Coordinates[0].value =
          modiefiedReferenzArea.x + ReferencePositions[i].z;
        ObjectPlacements.RelativePlacement.Location.Coordinates[1].value = -(
          modiefiedReferenzArea.z + ReferencePositions[i].x
        );
        ObjectPlacements.RelativePlacement.Location.Coordinates[2].value =
          modiefiedReferenzArea.y;
      }
      if (modifiedDirections[i].y > 0) {
        //console.log("y+1", modiefiedReferenzArea, ReferencePositions[i])
        ObjectPlacements.RelativePlacement.Location.Coordinates[0].value =
          modiefiedReferenzArea.x - ReferencePositions[i].x;
        ObjectPlacements.RelativePlacement.Location.Coordinates[1].value = -(
          modiefiedReferenzArea.z + ReferencePositions[i].z
        );
        ObjectPlacements.RelativePlacement.Location.Coordinates[2].value =
          modiefiedReferenzArea.y;
      }
    }

    await loader.ifcManager.ifcAPI.WriteLine(
      0,
      ObjectPlacements.RelativePlacement
    );
  }

  const dataFurn = await loader.ifcManager.ifcAPI.ExportFileAsIFC(0);

  blob = new Blob([dataFurn]);

  const file = new File([blob], "./DINable.ifc");

  const downloadbutton = document.getElementById("download-button");
  const link = document.createElement("a");
  link.download = "./DINable.ifc";
  link.href = URL.createObjectURL(file);

  downloadbutton.appendChild(link);

  const downloadFile = () => {
    link.click();
    link.remove();
  };
  downloadbutton.addEventListener("click", downloadFile);
}

//-------------------------PROGRESS--------------------------
//---------------------------------------------------------------------------------

setupProgress();

function setupProgress() {
  const text = document.getElementById("progress-text");
  loader.ifcManager.setOnProgress((event) => {
    const percent = (event.loaded / event.total) * 100;
    const formatted = Math.trunc(percent);
    text.innerText = formatted;
  });
}

//------------------------TREE MENU--------------------------
//---------------------------------------------------------------------------------

const toggler = document.getElementsByClassName("caret");
for (let i = 0; i < toggler.length; i++) {
  toggler[i].onclick = () => {
    toggler[i].parentElement
      .querySelector(".nested")
      .classList.toggle("active");
    toggler[i].classList.toggle("caret-down");
  };
}

function createTreeMenu(ifcProject, id) {
  const root = document.getElementById(id);
  removeAllChildren(root);
  const ifcProjectNode = createNestedChild(root, ifcProject);

  ifcProject.children.forEach(async (child) => {
    await constructTreeMenuNode(ifcProjectNode, child);
  });
}

function nodeToString(node) {
  return `${node.expressID}`;
}

async function constructTreeMenuNode(parent, node) {
  const children = node.children;

  if (children.length === 0) {
    await createSimpleChild(parent, node);
    return;
  }

  const nodeElement = createNestedChild(parent, node);

  children.forEach(async (child) => {
    await constructTreeMenuNode(nodeElement, child);
  });
}

function createNestedChild(parent, node) {
  const content = nodeToString(node);
  const root = document.createElement("li");
  createTitle(root, content + `- ${node.type}`);
  const childrenContainer = document.createElement("ul");
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
  };
  title.textContent = content;
  parent.appendChild(title);
}

async function createSimpleChild(parent, node) {
  const content = nodeToString(node);
  const childNode = document.createElement("li");
  childNode.classList.add("leaf-node");
  childNode.textContent = content;

  colorForNodes(
    IntersectionsIDsAreaIntersectWall,
    "#8137be",
    childNode,
    parent,
    content,
    node,
    " Kollision mit einer Wand"
  );
  colorForNodes(
    IntersectionsIDsAreaContainWall,
    "#8137be",
    childNode,
    parent,
    content,
    node,
    " Die Bewegungsfläche enthält die Wand"
  );
  colorForNodes(
    IntersectionsIDsFurnIntersectWall,
    "#8137be",
    childNode,
    parent,
    content,
    node,
    " Ein Möbel kollidiert mit der Wand "
  );
  colorForNodes(
    IntersectionsIDsFurnContainWall,
    "#8137be",
    childNode,
    parent,
    content,
    node,
    " Ein Möbel enthält die Wand."
  );

  colorForNodes(
    IntersectionsIDsFurnIntersectFurn,
    "#570042",
    childNode,
    parent,
    content,
    node,
    "Möbel überschneiden sich."
  );
  colorForNodes(
    IntersectionsIDsAreaContainFurn,
    "#296017",
    childNode,
    parent,
    content,
    node,
    "Bewegungsfläche und Möbel enthalten sich."
  );
  colorForNodes(
    IntersectionsIDsFurnContainArea,
    "#296017",
    childNode,
    parent,
    content,
    node,
    "Möbel und Bewegungsfläche enthalten sich."
  );
  colorForNodes(
    IntersectionsIDsFurnContainFurn,
    "#504b13",
    childNode,
    parent,
    content,
    node,
    "Möbel enthalten sich."
  );
  colorForNodes(
    IntersectionsIDsAreaContainArea,
    "#67116e",
    childNode,
    parent,
    content,
    node,
    "Bewegungsflächen enthalten sich."
  );
  colorForNodes(
    IntersectionsIDsFurnIntersectArea,
    "#99244f",
    childNode,
    parent,
    content,
    node,
    "Kollision eines Möbels mit mindestens einer Bewegungsfläche"
  );
  colorForNodes(
    IntersectionsIDs,
    "#99244f",
    childNode,
    parent,
    content,
    node,
    "Kollision eines Möbels mit mindestens einer Bewegungsfläche"
  );
  colorForNodes(
    IntersectionsIDsAreaIntersectArea,
    "#007050",
    childNode,
    parent,
    content,
    node,
    "Bewegungsflächen überlagern sich DIN-konform."
  );

  for (let u = 0; u < allSubsetMeshes.length; u++) {
    const occurenceID = getOccurence(
      noIntersectionsIDs,
      allSubsetMeshes[u].uuid
    );
    for (let p = 0; p < wallSubsetMeshes.length; p++) {
      const occurenceIDwall = getOccurence(
        noIntersectionsIDs,
        wallSubsetMeshes[p].uuid
      );

      if (occurenceID === 0 && occurenceIDwall === 0) {
        noIntersectionsIDs.push(allSubsetMeshes[u].uuid);
      }
    }
  }

  colorForNodes(
    noIntersectionsIDs,
    "#007050",
    childNode,
    parent,
    content,
    node,
    "Keine Kollision"
  ); //grün
  colorForNodesNoCollisionCheck("#000000", childNode, content, node);

  parent.appendChild(childNode);

  collisionTypeText(
    intersectionidHTML,
    noIntersectionsIDs,
    childNode,
    "#C70039",
    content,
    parent
  );

  childNode.onpointerenter = (event) =>
    prepickByID(
      event,
      hightlightMaterial,
      hightlightMaterialSecond,
      [node.expressID],
      node
    );
  childNode.onpointerdown = (event) =>
    pickByIDClick(event, selectionMaterial, hightlightMaterialSecond, [
      node.expressID,
    ]);
}

function colorForNodes(
  liste,
  colorNode,
  childNode,
  parent,
  content,
  node,
  text
) {
  const specificID = [];
  for (let i = 0; i < liste.length; i++) {
    let idsfurniture = liste[i].toString();
    if (childNode.textContent === idsfurniture) {
      childNode.style.color = colorNode; //green
      childNode.style.padding = "10px 0px 0px 0px";

      noIntersectionidHTML.push(idsfurniture);

      for (let id = 0; id < specificFurnIDList.length; id++) {
        specificID.push(specificFurnIDList[id].value);

        if (specificFurnIDList[id].value == childNode.textContent) {
          if (id == 2) {
            node.type = "WC";
          }
          if (id == 0) {
            node.type = "Bett";
          }
          if (id == 3) {
            node.type = "Waschtisch";
          }
          if (id == 4) {
            node.type = "Badewanne";
          }
          if (id == 5) {
            node.type = "Dusche";
          }
          if (id == 1) {
            node.type = "Küchenzeile";
          }
        } else {
          if (node.type == "IFCFURNISHINGELEMENT") {
            node.type = "Sonstiges Möbel";
          }
          if (node.type == "IFCFLOWTERMINAL") {
            node.type = "Sanitärmöbel";
          }
        }
      }

      const radiobox = document.createElement("input");
      radiobox.type = "radio";
      radiobox.id = idsfurniture;
      radiobox.name = "noIntersection";
      radiobox.value = idsfurniture;

      radiobox.classList.add("container");

      const radioDot = document.createElement("span");
      radioDot.classList.add("dot");
      radioDot.style.left = "-25px";
      radioDot.style.top = "10px";

      const label = document.createElement("label");
      label.classList.add("container");

      label.appendChild(radiobox);
      label.appendChild(radioDot);

      for (let p = 0; p < allIDsInChecker.length; p++) {
        const occurence = allLists.filter(
          (x) => x === allIDsInChecker[p]
        ).length;

        if (node.expressID === allIDsInChecker[p]) {
          childNode.textContent =
            content +
            `- ${node.type}` +
            ` - ${text}` +
            `- Anzahl Kollisionen: ${occurence}`;
        }
      }

      radiobox.onclick = () => {
        pickCheckbox(event, hightlightMaterial, hightlightMaterialSecond, [
          node.expressID,
        ]);
      };

      parent.appendChild(label);
    }
  }
}

function colorForNodesNoCollisionCheck(colorNode, childNode, content, node) {
  if (childNode.textContent === content) {
    childNode.style.color = colorNode; //green
    childNode.style.padding = "10px 0px 0px 0px";
    childNode.textContent = content + `- ${node.type}`;
  }
}

function collisionTypeText(
  liste,
  noListe,
  childNode,
  colorNode,
  content,
  parent
) {
  const textCollision = document.createElement("p");
  const textNoCollision = document.createElement("p");

  for (let id = 0; id < allSubsetMeshes.length; id++) {
    const allids = allSubsetMeshes[id].uuid.toString();
    idMeshToString.push(allids);
  }
  for (let d = 0; d < areas.length; d++) {
    const areaID = areas[d].uuid.toString();
    const includesID = liste.includes(areaID);
    if (includesID) {
      const idindex = idMeshToString.indexOf(areaID);

      if (areas[idindex].material.color === furnClashAreaColor) {
        textCollision.classList.add("containerText");
        textCollision.innerText =
          " Möbel -" +
          `${content}` +
          "- kollidiert mit mindestens einer Bewegungsfläche ";
        textCollision.style.paddingLeft = "0px";
        textCollision.style.marginBottom = "0px";
        textCollision.style.paddingTop = "5px";
        textCollision.style.color = "#858585";
        textCollision.id = areaID;
        textCollision.style.visibility = "hidden";
        parent.appendChild(textCollision);
      }
    }
    if (noListe.includes(areaID)) {
      const idindex = idMeshToString.indexOf(areaID);
      for (let b = 0; b < noListe.length; b++) {
        if (areas[idindex].material.color === greyColor) {
          textNoCollision.classList.add("containerTextNot");
          textNoCollision.innerText =
            " Möbel -" +
            `${content}` +
            "- kollidiert mit keiner Bewegungsfläche ";
          textNoCollision.style.paddingLeft = "0px";
          textNoCollision.style.marginBottom = "0px";
          textNoCollision.style.paddingTop = "5px";
          textNoCollision.style.color = "#858585";
          textNoCollision.id = areaID;
          textNoCollision.style.visibility = "visible";
          parent.appendChild(textNoCollision);
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

animate();
