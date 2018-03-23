'use strict'

const THREE = require('three')
const TWEEN = require('tween.js')

const Stats = require('stats.js')
const dat = require('dat.gui').default
const yo = require('yo-yo')
require('postprocessing')

let SCREEN_WIDTH, SCREEN_HEIGHT, HALF_SCREEN_W, HALF_SCREEN_H

let scene, renderer, camera, stats, control,
    deb, gui, teaBody, teaCap, directionalLight,
    ambientLight, teaPotWrapper, sky, name, mixer,
    prevTime, clock, helloMove, delta, pose, direction, 
    a, sum, me, lettersDD

var time = 0.0
var position1 = 0
var position2 = 0
var position3 = 0
var oldPosition = 0
var c = 0
var maxA = 500
var factor = 0
var active = false

let messageH1 = 'Jose Sánchez'
let messageH2 = 'dev et designer'

const mainContainer = document.createElement('div')

mainContainer.setAttribute('class', 'intro-wrapper')
mainContainer.classList.add('container')

document.mainContainer = mainContainer

// background-color
let initBackColor = 0xf3f3f6

// tea COLOR
let teaColorS = 0xb37c74
let teaEmissiveS = 0xaa0808
let ambientLightS = 0xc3a2a2
let directionalLightS = 0x4b8c96

// me color
let meColor = 0x2f304b

//name Color
let nameColor = 0x2f304b

// sky
let upperColor = 0xb9dcd9

//
let devDeColor = 0xaa0808

let size = 5
let magnitude = 3

let sinProf

let x = document.computer ? 46 : 28

let mousePosition = {
  x: 0,
  y: 0
}

window.onmousemove = mousePos

function world (debbug, assets, appContainer) {
  renderer = new THREE.WebGLRenderer({alpha: true, antialias:true})
  renderer.setPixelRatio( window.devicePixelRatio )
  deb = debbug
  clock = new THREE.Clock(true)

  // getting assets
  let models = assets.geometries
  let fonts = assets.fonts

  conf (appContainer, (renderer) => {

    // controls
    control = new function () {
      this.color = teaColorS
      this.upperColor = upperColor
      this.emissive = teaEmissiveS
      this.ambientLight = ambientLightS
      this.directionalLight = directionalLightS
      this.devDeColor = 0x78ffbf
      this.devDeColorEmission = 0xffcbbb
      this.capY = -0.53
      this.teaMakerRotation = 0.7
      this.posX = 2
      this.posY = -6.2
      this.posZ = 0
      this.rotY = 0.17
      this.rotX = -0.29
      this.rotZ = 0.27
      this.translateX = -3.9
      this.translateY = -3.6
      this.translateZ = 9
      this.rotateY = 0.25
      this.rotateX = 0.04
      this.rotateZ = 0.00
      this.meColor = meColor
    }

    // DEV Y DESIGNER
    let lettersMaterial = new THREE.MeshPhongMaterial({
      color: upperColor,
      emissive: 0xaa5858,
      emissiveIntensity: 0.6,
      flatShading: true
    })

    lettersDD = new THREE.Mesh(models.letters, lettersMaterial)
    lettersDD.castShadow = true
    lettersDD.receiveShadow = true
    // assets

    
    // NAME
    // Material
    let nameMaterial = new THREE.MeshBasicMaterial({
      color: nameColor
    })

    // font
    let square = fonts.square

    // geometry
    let nameGeometry = new THREE.TextGeometry(`Jose                   Sánchez`, {
      font: square,
      size: 2.5,
      height: 0,
      curveSegments: 2
    })

    // mesh
    name = new THREE.Mesh(nameGeometry, nameMaterial)

    name.geometry.computeVertexNormals(true)

    // ME
    let meMaterial = new THREE.MeshBasicMaterial({
      color: meColor,
      skinning: true
    })

    let meGeometry = models.me

    me = new THREE.SkinnedMesh(meGeometry, meMaterial)

    mixer = new THREE.AnimationMixer(me)
    helloMove = mixer.clipAction('hello')

    helloMove.clampWhenFinished = true
    helloMove.setEffectiveWeight(1)

    // TEAPOT
    // materials
    let materialBody = new THREE.MeshLambertMaterial({
      color: 0xff9500,
      emissive: 0x8c5d1a,
      flatShading: true
    })

    let materialCap = new THREE.MeshLambertMaterial({
      color: initBackColor,
      emissive: initBackColor,
      flatShading: true
    })

    teaCap = new THREE.Mesh(models.cap, materialCap)
    teaBody = new THREE.Mesh(models.body, materialBody)

    teaCap.receiveShadow = true
    teaCap.castShadow = true
    teaBody.castShadow = true
    teaBody.receiveShadow = true

    teaPotWrapper = new THREE.Group()
    teaBody.position.x = -0.25
    teaBody.position.z = -0.3
    teaBody.position.y = -5

    teaCap.position.x = -0.25
    teaCap.position.y = -5
    teaCap.position.z = -0.3

    lettersDD.position.x = -0.25
    lettersDD.position.y = -5
    lettersDD.position.z = -0.3
    // teaPotWrapper.rotation.y = -0.4 * Math.PI
    
    me.position.y = 4
    me.position.x = 1.9
    me.scale.y = 0.78
    me.scale.x = 0.78
    me.rotation.y = 0.7 * Math.PI

    
    scene.add(name)
    teaPotWrapper.add(me)
    teaPotWrapper.add(teaCap)
    teaPotWrapper.add(teaBody)
    teaPotWrapper.add(lettersDD)

    // teaPotWrapper.rotation.x = 0.04 * Math.PI
    teaPotWrapper.position.y = -5

    sky = createSky(upperColor)

    // adds
    scene.add(teaPotWrapper)
    scene.add(sky)

    camera.lookAt(teaCap.position)

    if (debbug) {
      stats = createStats()
      addControls(control)
    }

    window.addEventListener( 'resize', onWindowResize, false )

    render ()
    helloMove.play()

  })
}

function conf (appContainer, cb) {
  scene = new THREE.Scene()
  renderer.setClearColor(initBackColor, 0)
  SCREEN_WIDTH = window.innerWidth
  SCREEN_HEIGHT = window.innerHeight
  HALF_SCREEN_W = SCREEN_WIDTH / 2
  HALF_SCREEN_H = SCREEN_HEIGHT / 2

  let width = window.innerWidth
  let height = window.innerHeight

  renderer.setSize(width, height)
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFBasicShadowMap
  camera = new THREE.OrthographicCamera(width / - x, width / x, height / x, height / - x, 1, 1000);
  camera.position.x = 15
  camera.position.y = -3
  camera.position.z = 13

  // lights
  ambientLight = new THREE.AmbientLight( 0xf1f1f1, 1 ) // soft white light scene.add( light );
  directionalLight = new THREE.DirectionalLight( 0xffffff, 1.3) // soft white light scene.add( light );
  // directionalLight.position.x = -1
  // directionalLight.position.z = 1
  // directionalLight.position.y = 4

  directionalLight.position.x = -3
  directionalLight.position.z = 3
  directionalLight.position.y = 6

  directionalLight.castShadow = true

  scene.add(ambientLight)
  scene.add(directionalLight)

  mainContainer.appendChild(renderer.domElement)
  appContainer.appendChild(mainContainer)

  cb(renderer)
}


function createSky (color) {
let skyGeometry = new THREE.PlaneGeometry(400, 13, 200, 13)

  let skyMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.9
  })

  let skyMesh = new THREE.Mesh(skyGeometry, skyMaterial)
  skyMesh.rotation.y = -0.2 * Math.PI;

  skyMesh.position.x = 0
  skyMesh.position.y = 77
  skyMesh.position.z = -27

  return skyMesh
}

// Controls
function addControls (controlObject) {
  gui = new dat.GUI();
  gui.addColor(controlObject, 'color', 0xff9500)
  gui.addColor(controlObject, 'emissive', 0xf1bc1c)
  gui.addColor(controlObject, 'ambientLight', 0xf1bc1c)
  gui.addColor(controlObject, 'directionalLight', 0xf1bc1c)
  gui.addColor(controlObject, 'upperColor', upperColor)
  gui.add(controlObject, 'teaMakerRotation', -1.5, 1.5)
  //devde
  gui.addColor(controlObject, 'devDeColor', 0x000000)
  gui.addColor(controlObject, 'devDeColorEmission', 0x000000)
  // Me color
  gui.addColor(controlObject, 'meColor', meColor)
  // sky
  gui.add(controlObject, 'capY', -0.5, 0)
  gui.add(controlObject, 'posX', -50, 50)
  gui.add(controlObject, 'posY', -50, 50)
  gui.add(controlObject, 'posZ', -50, 50)
  gui.add(controlObject, 'rotY', -1.0, 1.0)
  gui.add(controlObject, 'rotX', -1.0, 1.0)
  gui.add(controlObject, 'rotZ', -1.0, 1.0)
  // text
  gui.add(controlObject, 'translateX', -20, 20)
  gui.add(controlObject, 'translateY', -20, 20)
  gui.add(controlObject, 'translateZ', -20, 20)
  gui.add(controlObject, 'rotateY', -1.0, 1.0)
  gui.add(controlObject, 'rotateX', -1.0, 1.0)
  gui.add(controlObject, 'rotateZ', -1.0, 1.0)
}

function createStats () {
  let stats = new Stats()
  stats.setMode(0)
  stats.domElement.style.position = 'absolute'
  stats.domElement.style.left = '0'
  stats.domElement.style.top = '93%'
  document.body.appendChild(stats.domElement)
  return stats
}

function onWindowResize () {
  SCREEN_WIDTH = window.innerWidth;
  let  SCREEN_HEIGHT = window.innerHeight;
  let aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
  let f = 44
  renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

  camera.left =  aspect * f / - 2
  camera.right = aspect * f / 2
  camera.bottom =   f / - 2
  camera.top = f / 2
  camera.updateProjectionMatrix();
}

function mousePos (e) {
  e = e || window.event
  mousePosition.x = e.clientX
  mousePosition.y = e.clientY
}

// animation
function render (ts) {
  if (deb) {
    stats.update()
  }

  // add h2

  // let myColor = control.color
  let myColor = new THREE.Color(control.color)
  let myEmissive = new THREE.Color(control.emissive)
  let myAmbient = new THREE.Color(control.ambientLight)
  let myDirectional = new THREE.Color(control.directionalLight)
  let personColor = new THREE.Color(control.meColor)

  let myDevDeColor = new THREE.Color(control.devDeColor)
  let myDevDeColorEmission = new THREE.Color(control.devDeColorEmission)

  teaBody.material.emissive = myEmissive
  teaBody.material.color = myColor

  me.material.color = personColor

  directionalLight.color = myDirectional

  ambientLight.color = myAmbient
  directionalLight.color = myDirectional

  lettersDD.material.color = myDevDeColor
  lettersDD.material.emissive = myDevDeColorEmission

  let skyColor = new THREE.Color(control.upperColor)

  sky.material.color = skyColor

  // skyPos
  sky.position.y = control.posY
  sky.position.x = control.posX
  sky.position.z = control.posZ
  sky.rotation.x = control.rotX * Math.PI
  sky.rotation.y = control.rotY * Math.PI
  sky.rotation.z = control.rotZ * Math.PI

  // textPos
  name.position.x = control.translateX
  name.position.y = control.translateY
  name.position.z = control.translateZ
  name.rotation.x = control.rotateX * Math.PI
  name.rotation.y = control.rotateY * Math.PI
  name.rotation.z = control.rotateZ * Math.PI

  let skyLength = sky.geometry.vertices.length

  let center = new THREE.Vector2(0, 0)

  for (var i = 0; i < skyLength; i++) {
    var v = sky.geometry.vertices[i];
    var dist = new THREE.Vector2(v.x, v.y).sub(center);
    v.z = Math.sin(dist.length()/-size + (ts/900)) * magnitude;
  }

  sky.geometry.verticesNeedUpdate = true;

  // rotate the teapot
  let middleX = (SCREEN_WIDTH - HALF_SCREEN_W) - mousePosition.x
  let middleY = (SCREEN_HEIGHT - HALF_SCREEN_H) - mousePosition.y
  let cameraY = (middleY * 3) / HALF_SCREEN_H

  let delta = clock.getDelta()
  
  
  
  if (document.computer) {
    let rad = (middleX * (Math.PI)) / HALF_SCREEN_W
    rad = (rad - 2.31)
    teaPotWrapper.rotation.y = rad * -1
    camera.position.y = cameraY * -1
  } else {
    teaPotWrapper.rotation.y += 0.01
    camera.position.y = -3
  }

  camera.lookAt(teaPotWrapper.position)
  mixer.update(delta)
  renderer.render(scene, camera)
  requestAnimationFrame(render)
}

module.exports = world