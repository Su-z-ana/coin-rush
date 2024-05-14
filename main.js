import './style.css'
import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

let camera, scene, renderer;
let controls, water, sun, boat;
let coinCount = 0;
let timer = 60;
let imageElement = null;
let winElement = null;
const audioElement = document.getElementById(''); 
const timerElement = document.getElementById('timer');


const boatDirection = new THREE.Vector3(0, 2, -5);

const loader = new GLTFLoader();

function random(min, max) {
  return Math.random() * (max - min) + min;
}

class Boat {
  constructor(){
    this.speed = {
      vel: 0,
      rot: 0
    };
    loader.load("assets/boat/scene.gltf", (gltf) => {
      scene.add( gltf.scene )
      gltf.scene.scale.set(0.04, 0.04, 0.04)
      gltf.scene.position.set(5,-3.5,50)
      gltf.scene.rotation.y = - 180 *Math.PI/180;
      gltf.scene.position.z =150;
      this.boat = gltf.scene
      
    });
  }

  stop(){
    this.speed.vel = 0;
    this.speed.rot = 0;
  }

  update(){
    if(this.boat){
      this.boat.rotation.y += this.speed.rot;
      this.boat.translateZ(this.speed.vel);
     
    }
  }
}

class Coin{
  constructor(meh){
    scene.add( meh );
    meh.scale.set(2, 2, 2);
    if(Math.random() > .6){
      meh.position.set(random(-100, 100), -.5, random(-100, 100));
    }else{
      meh.position.set(random(-500, 500), -.5, random(-1000, 1000));
    }

    this.coin = meh;
  }
}

async function loadModel(url){
  return new Promise((resolve, reject) => {
    loader.load(url, (gltf) => {
      resolve(gltf.scene)
    })
  })
}

let boatModel = null
async function createCoin(){
  if(!boatModel){
    boatModel = await loadModel("assets/coin/scene.gltf")
  }
  return new Coin(boatModel.clone())
}

let coins = []
const COIN_COUNT = 80

init();
animate();

async function init() {
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  document.body.appendChild( renderer.domElement );

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 55, window.innerWidth / window.innerHeight, 1, 20000 );
  //camera.position.set( 30, 30, 100 );
  timerElement.textContent = 'Timer: 0s';
  

  sun = new THREE.Vector3();


  const waterGeometry = new THREE.PlaneGeometry( 10000, 10000 );

  water = new Water(
    waterGeometry,
    {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load( 'tex.jpg', function ( texture ) {

        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

      } ),
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      
    }
  );

  water.rotation.x = - Math.PI / 2;
  
  scene.add( water );
  


  const sky = new Sky();
  sky.scale.setScalar( 10000 );
  scene.add( sky );

  const parameters = {
    elevation: 2,
    azimuth: 180
  };

  imageElement = document.createElement('img');
  imageElement.src = 'loser.png';
  imageElement.style.position = 'absolute';
  imageElement.style.left = '650px';
  imageElement.style.right = '500px';
  imageElement.style.top = '250px';
  imageElement.style.width = '20%';
  imageElement.style.height = '20%';
  
  let homeElement = document.createElement('a');
  homeElement.href = 'index.html'; 

  let hintElement = document.createElement('a');
  hintElement.href = 'how.html'; 
  


const homeImage = document.createElement('img');
homeImage.src = 'home-page.png'; 
homeImage.alt = 'Home page';
homeImage.style.position = 'absolute';
  homeImage.style.left = '10px';
  homeImage.style.top = '80px';
  homeImage.style.width = '3%';
  homeImage.style.height = '3%';


  const hintImage = document.createElement('img');
hintImage.src = 'info.png'; 
hintImage.alt = 'Instruction page';
hintImage.style.position = 'absolute';
  hintImage.style.left = '10px';
  hintImage.style.top = '690px';
  hintImage.style.width = '3%';
  hintImage.style.height = '3%';


  winElement = document.createElement('img');
  winElement.src = 'winner.png';
  winElement.style.position = 'absolute';
  winElement.style.left = '650px';
  winElement.style.right = '500px';
  winElement.style.top = '250px';
  winElement.style.width = '20%';
  winElement.style.height = '20%';

  
  imageElement.style.display = 'none';
  winElement.style.display = 'none';
  document.body.appendChild(imageElement);
  document.body.appendChild(winElement);
  homeElement.appendChild(homeImage);
  document.body.appendChild(homeElement);
  hintElement.appendChild(hintImage);
  document.body.appendChild(hintElement);



  

 const adjust = new THREE.PMREMGenerator( renderer );

  function updateSun() {

    const phi = THREE.MathUtils.degToRad( 90 - parameters.elevation );
    const theta = THREE.MathUtils.degToRad( parameters.azimuth );

    sun.setFromSphericalCoords( 1, phi, theta );

    sky.material.uniforms[ 'sunPosition' ].value.copy( sun );
    water.material.uniforms[ 'sunDirection' ].value.copy( sun ).normalize();

    scene.environment = adjust.fromScene( sky ).texture;

  }

  updateSun();

  controls = new OrbitControls( camera, renderer.domElement );
  controls.maxPolarAngle = Math.PI * 0.495;
  controls.target.set( 0, 10, 0 );
  controls.minDistance = 40;
  controls.maxDistance = 200;
  controls.update();

  //const waterUniforms = water.material.uniforms;

  for(let i = 0; i < COIN_COUNT; i++){
    const coin = await createCoin()
    coins.push(coin)
  }

  boat = new Boat();
 
  window.addEventListener( 'resize', onWindowResize );

  window.addEventListener( 'keydown', function(e){
  if(e.key == "ArrowUp"){
      
      
      boat.speed.vel = +0.6
      
    }
   else if(e.key == "ArrowDown"){
      boat.speed.vel = -0.6
    }
    else if(e.key == "ArrowRight"){
      boat.speed.rot = -0.01
    }
    else if(e.key == "ArrowLeft"){
      boat.speed.rot = 0.01
    }
    else if(e.key == "w")
    {
        boat.speed.vel =2;
    }
    else if(e.key == "s")
    {
        boat.speed.vel = -2;
    }
  })
  window.addEventListener( 'keyup', function(e){
    boat.stop()
  })

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function isColliding(obj1, obj2){
  return (
    Math.abs(obj1.position.x - obj2.position.x) < 15 &&
    Math.abs(obj1.position.z - obj2.position.z) < 15
  )
}

function updateCount() {
  const CountElement = document.getElementById("Count");
  CountElement.textContent = coinCount;
}

function checkCollisions() {
  if (boat.boat) {
      coins.forEach((coin, index) => {
          if (coin.coin) {
              if (isColliding(boat.boat, coin.coin)) {
                  scene.remove(coin.coin);
                  coins.splice(index, 1); 
                  coinCount++; 
                  updateCount(); 
                  Element.play();
              }
          }
      });
  }
}

function endgame()
{
  //const end = document.getElementById('gover');
  //end.textContent= "GAME OVER";
  
  //endbtn.textContent="Go back to homepage";
  const result = document.getElementById('res');
  if (coinCount<80)
  {
    imageElement.style.display = 'block';
  result.textContent = "You collected " +coinCount+"/80 coins"; 
  }
  else if(coinCount=80)
  {
    //result.textContent = "YOU WON!!!"; 
    winElement.style.display = 'block';
  }
  
  
}

function animate() {
  requestAnimationFrame( animate );
  render();
  
  if (boat && boat.boat) {
    boat.update();
    checkCollisions();
    const boatPosition = boat.boat.position.clone();
    const cameraOffset = new THREE.Vector3(2, 15, -30);
    cameraOffset.applyQuaternion(boat.boat.quaternion);
    const cameraPosition = boatPosition.clone().add(cameraOffset);
    camera.position.copy(cameraPosition);
    const targetPosition = boatPosition.clone().add(boatDirection);
    camera.lookAt(targetPosition);

    coins.forEach((coin) => {
      if (coin.coin) {
        coin.coin.rotation.y += 0.01; 
      }
    });
    timer -= 1 / 100; 
    timer = Math.max(0, timer);
    timerElement.textContent = `Timer: ${Math.floor(timer)}s`;

    if (timer <= 0 || coinCount==80) {
      scene.remove(boat.boat);
      boat.boat = null; 
      endgame();
      
    }
  }
}

function render() {
  water.material.uniforms[ 'time' ].value += 0.009;

  renderer.render( scene, camera );

}


    