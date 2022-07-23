        
        
        
        var canvas = document.getElementById("renderCanvas");

        var startRenderLoop = function (engine, canvas) {
            engine.runRenderLoop(function () {
                if (sceneToRender && sceneToRender.activeCamera) {
                    sceneToRender.render();
                }
            });
        }

        var engine = null;
        var scene = null;
        var sceneToRender = null;
        var createDefaultEngine = function() { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true,  disableWebGL2Support: false}); };
        var createScene = async function () {

        
var scene = new BABYLON.Scene(engine);

function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

var _get = getUrlVars();

if (_get['debug']) {
  scene.debugLayer.show();
}


////////////////////////////////////////
// Probably don't need to edit below //
//////////////////////////////////////

//////////////// START first person controls. Below is code for making first-person controls for non-vr control
scene.gravity = new BABYLON.Vector3(0, -0.1, 0);   // x, y and z. Y is up/down so -2 creates gravity

// good camera for First person walking controls
let camera = new BABYLON.UniversalCamera("Camera", new BABYLON.Vector3(2, 3, 2), scene);
// This targets the camera to scene origin. Makes the camera point in a particular spot. #edit
//camera.setTarget(new BABYLON.Vector3(0, 3, 0));
// This attaches the camera to the canvas
camera.attachControl(canvas, true);

camera.minZ = 0;
camera.maxZ = 100000; // Clipping distance


// Allow WASD in addition to arrow keys to move
camera.keysUp.push(87);
camera.keysDown.push(83);
camera.keysLeft.push(65);
camera.keysRight.push(68);

// how fast the camera (aka player) moves
scene.activeCamera.speed = .2;

// this creates a collision shape attached to camera so the camera can be affected by gravity
camera.ellipsoid = new BABYLON.Vector3(.1, .7, .1);
camera.checkCollisions = true;   
camera.applyGravity = true;
camera._needMoveForGravity = true;

// creates an invisible ground plane that user can stand on
var hiddenGround = BABYLON.MeshBuilder.CreateGround("ground", {width: 1000, height: 1000}, scene);
//hiddenGround.collisionsEnabled = true;
hiddenGround.checkCollisions = true;
hiddenGround.isVisible = false;

//scene.defaultCursor = 'pointer';
///////////// END first person controls

////////////// XR functionality Makes the scene VR Headset-friendly. Adds teleportation controls
let floorMeshes = [];
var xrHelper  = await scene.createDefaultXRExperienceAsync({
    // define the floor meshes
    floorMeshes: floorMeshes //This is an array of meshes that the player can teleport to. #edit
});

const teleportation = xrHelper.teleportation; //creates a variable that allows for more customization of teleportation options.

// If you want to add more meshes after the xrHelper has already been created
//teleportation.addFloorMesh(ground2); //ground2 would be the name of another mesh you create.

teleportation.parabolicRayEnabled = true; // False = cast a straight line for teleportation. True = It will cast an arc for telportation
teleportation.parabolicCheckRadius = 2; // How far you can teleport #edit
/////////////// END XR functionality

////////////////////////////////////////
// Probably don't need to edit above //
//////////////////////////////////////




var gl = new BABYLON.GlowLayer("glow", scene);

function clearModalContent() {
    document.getElementById("youtube").innerHTML = ""; 
    document.getElementById("image").innerHTML = ""; 
  console.log('cleared');
}

var modal = document.getElementById("myModal");
var close = document.getElementById("close");
close.addEventListener('click', function (event) {
    console.log("close")
    modal.style.display = "none";
    clearModalContent(); 
});



await BABYLON.SceneLoader.AppendAsync("", "environment.glb"); //the first animation in the first file added plays automatically. All others need to be triggered/played manually (see below)

scene.materials.forEach(function(mtl){
    mtl.maxSimultaneousLights = 10;
});



/// shadows and lights
(function(){
  if (!(settings.shadows || settings.shadowReceivers)) return; // shadowReceivers = an array of mesh names that will receive shadows. Eg. floor, wall
  
  let all = scene.getMeshByName("__root__");

  all.lightSources.forEach(function(light, i) {
    let shadowGenerator = new BABYLON.ShadowGenerator(2048, light);
    shadowGenerator.usePercentageCloserFiltering = true;

    light.range = 10; 

    // shadowGenerator.usePoissonSampling = true;
    // shadowGenerator.useBlurExponentialShadowMap = true;
    // shadowGenerator.useKernelBlur = true;
    // shadowGenerator.blurKernel = 64;


    let lightSphere = BABYLON.MeshBuilder.CreateSphere("lightSphere", {diameter:.001});


    lightSphere.isVisible = false;

    let coords = light.getWorldMatrix();
    let x = coords.m[12];
    let y = coords.m[13];
    let z = coords.m[14];

    lightSphere.position.x = x; 
    lightSphere.position.y = y; 
    lightSphere.position.z = z; 
    lightSphere.computeWorldMatrix(true);
    

    // make all meshes cast shadows. Add them to the list of meshes which cast/generate shadows
    all.getChildMeshes()
    .forEach((mesh) => {
      // lightSphere.computeWorldMatrix(true);
      if (!lightSphere.intersectsMesh(mesh)) {
        shadowGenerator.getShadowMap().renderList.push(mesh);

        if (settings.shadows) mesh.receiveShadows = true;
      } else {
        console.log(mesh.id);

      }
    });
  });

  

  //custom list of objects that receive shadows. 
  if (!settings.shadowReceivers) return;

  settings.shadowReceivers.forEach(function(meshName) {
    console.log(meshName)
    let mesh = scene.getMeshByName(meshName);
    if (mesh) 
      mesh.receiveShadows = true;
  });

})();


scene.animationGroups.forEach(function(animation) {
    animation.start(true);
});




let collisionHolder = scene.getNodeByName("collisionHolder");
if (collisionHolder) {
    //console.log(collisionHolder._children);
    if (collisionHolder._children) {
        collisionHolder._children.forEach((mesh) => {
        //mesh.collisionsEnabled = true;
        mesh.checkCollisions = true;
        mesh.isVisible = false;
        floorMeshes.push(mesh); 
        });
    }
    collisionHolder.isVisible = false;
}





let imageHolder = scene.getNodeByName("imageHolder");
if (imageHolder) {

    if (imageHolder._children) {
     imageHolder._children.forEach((mesh) => {
        let buttonAction = function() {
          console.log("clicka", mesh.name);

          modal.style.display = "flex";
          document.getElementById("image").innerHTML = '<img src="images/' + mesh.name + '">'; 
          modal.style.display = "flex";
        }
        mesh.actionManager = new BABYLON.ActionManager(scene);
        mesh.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, buttonAction)
      ); 
        //mesh.isVisible = false;
        mesh.visibility = 0;
        mesh.imagePopup = true;
        //mesh.collisionsEnabled = true;
        //mesh.checkCollisions = true;
        //mesh.isVisible = false;
      });
    }
    imageHolder.isVisible = false;
}


function generateYouTubeEmbed(url) {
  let youTubeCode;
  if (url.indexOf('=') > -1) {
    youTubeCode = url.replace(/^.*[=]/, '')
  } else {
    youTubeCode = url.replace(/^.*[\\\/]/, '')
  }
  let output = '<iframe frameborder="0" scrolling="no" marginheight="0" marginwidth="0" width="" height="" type="text/html" style="width:50vw; height:30vw;" src="https://www.youtube.com/embed/' + youTubeCode + /*https://www.youtube.com/embed/DBXH9jJRaDk*/ '?autoplay=1"></iframe>';
  return output;
}

let linkHolder = scene.getNodeByName("linkHolder");
if (linkHolder) {
    if (linkHolder._children) {
      linkHolder._children.forEach((mesh) => {
        let buttonAction = function() {
          console.log("clicka");

            modal.style.display = "flex";
            document.getElementById("youtube").innerHTML = generateYouTubeEmbed(mesh.name);

          //stuff here

        }
        mesh.actionManager = new BABYLON.ActionManager(scene);
        mesh.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, buttonAction)
      ); 
        mesh.visibility = 0;
      });
    }
    linkHolder.isVisible = false;
}



if (scene.getMeshByName("humanSizeReference") !== null) {



    let humanSizeReference = scene.getMeshByName("humanSizeReference");

    humanSizeReference.setParent(null);
    humanSizeReference.isVisible = false;

    camera.rotation.y = humanSizeReference.rotationQuaternion.toEulerAngles().y;

    if (humanSizeReference.position.y < 1) { //correct
      camera.position.y = 1.7;
      
    } else {
      camera.position.y = humanSizeReference.position.y;
    } 
    camera.position.x = humanSizeReference.position.x; //correct
    camera.position.z = humanSizeReference.position.z;

    //console.log(humanSizeReference.position.x);
    //console.log(humanSizeReference.position.y);
    
    //camera.position.y=100;
    //camera.position.x=2; //correct
    //camera.position.z=-10;
    
}




///////////////////////////


// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

if (typeof(settings.light) !== 'undefined') {
light.intensity = settings.light;
} else {
light.intensity = 0.1;
}


// check if settings.js is included, which as settings variable declared
if (typeof settings !== 'undefined') {
  ////////////// FOG
  if (settings.fog) {
    scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
    scene.fogDensity = settings.fog;
  }
}
                
                
              
                
    let skyDome = scene.getNodeByName("skyDome");
    if (skyDome) {
      skyDome.material.fogEnabled = false;
    }

    return scene;
};
                window.initFunction = async function() {
                    
                    
                    var asyncEngineCreation = async function() {
                        try {
                        return createDefaultEngine();
                        } catch(e) {
                        console.log("the available createEngine function failed. Creating the default engine instead");
                        return createDefaultEngine();
                        }
                    }

                    window.engine = await asyncEngineCreation();
        if (!engine) throw 'engine should not be null.';
        startRenderLoop(engine, canvas);
        window.scene = createScene();};
        initFunction().then(() => {scene.then(returnedScene => { sceneToRender = returnedScene; });
                            
        });

        // Resize
        window.addEventListener("resize", function () {
            engine.resize();
        });
