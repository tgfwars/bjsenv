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

  


  var windowFocused = false;
  let createPointerLock = function(scene) {
    let canvas = scene.getEngine().getRenderingCanvas();
    canvas.addEventListener("click", event => {
      windowFocused = true;
      canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
      if(canvas.requestPointerLock) {
        canvas.requestPointerLock();
      }
    }, false);
  };

const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

BABYLON.SceneLoader.Load("", "environment.gltf", engine, function(scene) {


  
  (function() {
    scene.materials.forEach(function(mtl){
        mtl.maxSimultaneousLights = 10;
    });
  
    let all = scene.getMeshByName("__root__");
    //console.log(all.lightSources[0]);

    let lightSphere = BABYLON.MeshBuilder.CreateSphere("lightSphere", {diameter:20});

    lightSphere.position.x = -0.4048232436180115; //testing coords. Remove the dispose() below to gauge size of sphere
    lightSphere.position.y = 6.872382164001465;
    lightSphere.position.z = 44.68169403076172;
    
    all.lightSources.forEach(function(light) {
     
      let shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
      //shadowGenerator.useBlurExponentialShadowMap = true;

      //console.log(light.id);
      let coords = light.getWorldMatrix();
      let x = coords.m[12];
      let y = coords.m[13];
      let z = coords.m[14];

      lightSphere.position.x = x; 
      lightSphere.position.y = y; 
      lightSphere.position.z = z; 

      lightSphere.computeWorldMatrix();

      all.getChildMeshes()
      .forEach((m) => {
      
          if (lightSphere.intersectsMesh(m)) {
              //shadowGenerator.addShadowCaster(m);
              //shadowGenerator.getShadowMap().renderList.push(m); 
              shadowGenerator.addShadowCaster(m, true);
              m.receiveShadows = true; 


              light.includedOnlyMeshes.push(m);
          }
      });

      //console.log(light.includedOnlyMeshes);

    });
    lightSphere.dispose();

  })();


 
  //console.log(mySun);

  //console.log(collisionHolder._children);






  let camera = new BABYLON.UniversalCamera("Camera", new BABYLON.Vector3(0, 1.7, 0), scene);//edit coordinates it should start at to match height. 2nd param important

  camera.minZ = 0;
  camera.attachControl(canvas, true);


  camera.keysUp.push(87);
  camera.keysDown.push(83);
  camera.keysLeft.push(65);
  camera.keysRight.push(68);
  
  //args vor vector: width, height, ??. if first arg is 1, walls won't clip when get close. Just adjust second arg is fine for height
  camera.ellipsoid = new BABYLON.Vector3(0.1, 0.8, 0.1);
  camera.checkCollisions = true;

  scene.gravity = new BABYLON.Vector3(0, -.2, 0); //allows walking up ramps. Needs be greater than -2 or else can walk up walls
  camera._needMoveForGravity = true; //If this is missing, gravity only works while moving
  
  scene.activeCamera.applyGravity = true;
  //scene.activeCamera._needMoveForGravity = true;
  scene.activeCamera.speed = 2;
  scene.activeCamera.fov = 0.8;
  scene.activeCamera.inertia = .2;


  createPointerLock(scene);


  //const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0));
  //var light = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(1, 10, 1), scene);

  //light.intensity = 100;




  
  scene.clearColor = new BABYLON.Color3(0.1, 0.05, 0.05);

  let floorMeshes = [];
  let plane = BABYLON.MeshBuilder.CreatePlane("ground", {
      height: 1000,
      width: 1000
    }, scene)

  plane.rotate(BABYLON.Axis.X, Math.PI / 2, BABYLON.Space.WORLD);

  plane.collisionsEnabled = true;
  plane.checkCollisions = true;
  plane.isVisible = false;
  plane.position.y = 0;





  if (scene.getMeshByName("skyHolder") !== null) {
    let skyHolder = scene.getMeshByName("skyHolder");
    skyHolder.isPickable = false;
  }

  if (scene.getMeshByName("humanSizeReference") !== null) {
    let humanSizeReference = scene.getMeshByName("humanSizeReference");
    humanSizeReference.setParent(null);

    humanSizeReference.isVisible = false;
    //humanSizeReference.useRightHandedSystem = false;

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


  scene.animationGroups.forEach(function(item) {
    //item.stop();
    item.start();
    item.loopMode = BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE;
  });

  
    //let root = scene.getMeshByName("__root__");
    //if (root._children !== null) {
      //root._children.forEach((mesh) => {
        //console.log(mesh);
        //mesh.setParent(null);

      //});
    //}

  if (scene.getMeshByName("collisionHolder") !== null) {

    let collisionHolder = scene.getMeshByName("collisionHolder");
    //console.log(collisionHolder._children);
    if (collisionHolder._children !== null) {
      collisionHolder._children.forEach((mesh) => {
        mesh.collisionsEnabled = true;
        mesh.checkCollisions = true;
        mesh.isVisible = false;
        floorMeshes.push(mesh); 
      });
    }
    collisionHolder.isVisible = false;
  }
  //console.log(collisionHolder._children);


  //console.log(scene.meshes);

  if (scene.getMeshByName("linkHolder") !== null) {
    let linkHolder = scene.getMeshByName("linkHolder");
    if (linkHolder._children !== null) {
      linkHolder._children.forEach((mesh) => {
        let buttonAction = function() {
          console.log("clicka");
        }
        mesh.actionManager = new BABYLON.ActionManager(scene);
        mesh.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, buttonAction)
      ); 
        //mesh.isVisible = false;
        mesh.visibility = 0;
        mesh.linkPopup = true;
        
        //mesh.collisionsEnabled = true;
        //mesh.checkCollisions = true;
        //mesh.isVisible = false;
      });
    }
    linkHolder.isVisible = false;
  }


  if (scene.getMeshByName("imageHolder") !== null) {

    let holder = scene.getMeshByName("imageHolder");
    if (holder._children !== null) {
     holder._children.forEach((mesh) => {
        let buttonAction = function() {
          console.log("clicka");
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
    holder.isVisible = false;
  }


	function addCrosshair(scene){
    let w = 128

    let texture = new BABYLON.DynamicTexture('reticule', w, scene, false)
    texture.hasAlpha = true

    let ctx = texture.getContext()
    let reticule

    const createOutline = () => {
      let c = 2

      ctx.moveTo(c, w * 0.25)
      ctx.lineTo(c, c)
      ctx.lineTo(w * 0.25, c)

      ctx.moveTo(w * 0.75, c)
      ctx.lineTo(w - c, c)
      ctx.lineTo(w - c, w * 0.25)

      ctx.moveTo(w - c, w * 0.75)
      ctx.lineTo(w - c, w - c)
      ctx.lineTo(w * 0.75, w - c)

      ctx.moveTo(w * 0.25, w - c)
      ctx.lineTo(c, w - c)
      ctx.lineTo(c, w * 0.75)

      ctx.lineWidth = 3.5
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.stroke()
    }

    const createNavigate = () => {
      ctx.fillStyle = 'transparent'
      ctx.clearRect(0, 0, w, w)
      //createOutline()

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.lineWidth = 5.5
      ctx.moveTo(w * 0.5, w * 0.25)
      ctx.lineTo(w * 0.5, w * 0.75)

      ctx.moveTo(w * 0.25, w * 0.5)
      ctx.lineTo(w * 0.75, w * 0.5)
      ctx.stroke()
      ctx.beginPath()

      texture.update()
    }

    createNavigate()

    let material = new BABYLON.StandardMaterial('reticule', scene)
    material.diffuseTexture = texture
    material.opacityTexture = texture
    material.emissiveColor.set(1, 1, 1)
    material.disableLighting = true

    let plane = BABYLON.MeshBuilder.CreatePlane('reticule', { size: 0.04 }, scene)
    plane.material = material
    plane.position.set(0, 0, 1.1)
    plane.isPickable = false
    plane.rotation.z = Math.PI / 4

    reticule = plane
    reticule.parent = camera
    return reticule
  }
  let reticule = addCrosshair(scene)








  function castRay(scene){       
      //var origin = camera.position;
    let ray = camera.getForwardRay(200);
    let rayHelper = new BABYLON.RayHelper(ray);
    //console.log(rayHelper);
    //rayHelper.show(scene);
    let hit = scene.pickWithRay(ray);
    //console.log(hit.pickedMesh.name); 
    console.log(hit);
    return hit;
  }

  scene.registerBeforeRender(function () {
     
      //castRay();
  });





  let vector = { x:'', y:'', z:'' };
  //scene.getAnimationGroupByName("cubeMove").stop();
  var originalParent;
  var viewedItem = false;
  scene.onPointerDown = function (event, pickResult){
    //left mouse click
    if(event.button == 0){
      let hit = castRay(scene);
      //console.log(hit);
      //vector = pickResult.pickedPoint;
      //console.log('left mouse click: ' + vector.x + ',' + vector.y + ',' + vector.z );
      if (hit.pickedMesh !== null && windowFocused) {
        console.log("in hereee");
        //console.log(hits[0].pickedMesh.name);
        let hitMesh = hit.pickedMesh;
        //console.log(hitMesh.name);
        
        if (viewedItem !== false) {
          viewedItem.parent = originalParent; //scene.getMeshByName("imageHolder");
          viewedItem.isVisible = false;
          viewedItem = false;
          console.log("in here");
        }

        else if (hitMesh.name == "closePopupBox") {
          console.log("inna");
          modal.style.display = "none";
          closePopupBox.isPickable = false;
          clearModalContent();
          
        }


        else if (hitMesh.hasOwnProperty("imagePopup")) {
          closePopupBox.isPickable = true;

          console.log('image popup');
          modal.style.display = "flex";
          document.getElementById("image").innerHTML = '<img src="images/' + hitMesh.name + '">'; 
          //document.exitPointerLock();
          windowFocused = false;


          //old image popup:
          //hitMesh._children.forEach((mesh) => {
            //mesh.isVisible = true;
            ////mesh.parent.isVisible = false;

            //originalParent = mesh.parent;
            //mesh.parent = camera
           //viewedItem = mesh;
           //mesh.renderingGroupId = 2; //locks in in front of everything else. Like layers
            //mesh.position.set(0, 0, 4); //how far from camera ::ttd
            ////mesh.rotation.z = Math.PI / 4

            ////reticule = plane
          //});

        } 



        else if (hitMesh.hasOwnProperty("linkPopup")) {
          console.log('link popup');
          //console.log(hitMesh.name);
          //console.log(windowFocused);
          if (windowFocused) {
            //let canvas = scene.getEngine().getRenderingCanvas();
            document.exitPointerLock();
            
            //if (confirm("Open " + hitMesh.name + "?")) {
            //let handle = window.open(hitMesh.name, "_blank"); //.focus();
            //} 
            windowFocused = false;

            let mover = scene.getMeshByName("mover");                      
            //console.log(scene.animationGroups[0]);
            //scene.animationGroups[0].play();
            //
            //
            

            //scene.getAnimationGroupByName("cubeMove").play();
          


            // When the user clicks on the button, open the modal
            modal.style.display = "flex";


            document.getElementById("youtube").innerHTML = generateYouTubeEmbed(hitMesh.name);




            // When the user clicks on <span> (x), close the modal
              //modal.style.display = "none";





//scene.beginAnimation(cubeStatic, 0, 100, true, 1.0);
          }
        }
      }
    }
    //right mouse click
    if(event.button == 2){
            vector.x = pickResult.pickedPoint.x;
            vector.y = pickResult.pickedPoint.y;
            vector.z = pickResult.pickedPoint.z;
            console.log('right mouse click: ' + vector.x + ',' + vector.y + ',' + vector.z );
    }
    //Wheel button or middle button on mouse click
    if(event.button == 1){
            vector['x'] = pickResult.pickedPoint['x'];
            vector['y'] = pickResult.pickedPoint['y'];
            vector['z'] = pickResult.pickedPoint['z'];
            console.log('middle mouse click: ' + vector.x + ',' + vector.y + ',' + vector.z );
    }
  }





//var xrHelper =  scene.createDefaultXRExperience();
  var experience = scene.createDefaultXRExperienceAsync({
        // define the floor meshes
        floorMeshes: floorMeshes 
    });



  var closePopupBox = BABYLON.MeshBuilder.CreateBox("closePopupBox", {height:100, width: 100});
  closePopupBox.parent = camera
  closePopupBox.renderingGroupId = 2; //locks in in front of everything else. Like layers
  closePopupBox.position.set(0, 0, 0); //how far from camera ::ttd
  closePopupBox.rotation.z = Math.PI / 4
  //closePopupBox.isVisible = false;
  closePopupBox.isPickable = false;



  if (_get['debug']) {
    scene.debugLayer.show();
  }

  // Register a render loop to repeatedly render the scene
  engine.runRenderLoop(function () {
          scene.render();
  });

});








// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
        engine.resize();
});







////modal window


// Get the modal
var modal = document.getElementById("myModal");


// Get the <span> element that closes the modal
function initCloseButton() {
  var span = document.getElementsByClassName("close")[0];
  // When the user clicks on <span> (x), close the modal
  span.onclick = function() {
  
    modal.style.display = "none";
    clearModalContent(); 
    
  }
}
initCloseButton();

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (windowFocused == false) { 
    modal.style.display = "none";
    clearModalContent(); 
    
  }
  //if (event.target == modal) {
    //modal.style.display = "none";
  //}
}

function clearModalContent() {
    document.getElementById("youtube").innerHTML = ""; 
    document.getElementById("image").innerHTML = ""; 

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

/*
Notes
pointerlock
  make windowFocused = false / true to prevent click again on mesh on pointerlock
  
*/

