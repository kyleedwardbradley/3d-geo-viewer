// Sketchfab Viewer API: Start/Stop the viewer

var version = "1.12.1";

var urlParams = new URLSearchParams(window.location.search);
var autoSpin = 0.0;

if (urlParams.has("autospin")) {
  autoSpin = urlParams.get("autospin");
}

if (urlParams.has("id")) {
  uid = urlParams.get("id");
}

// search for a mapping from material name to object description; a json file with UID.json as name

var iframe = document.getElementById("api-frame");
var client = new window.Sketchfab(version, iframe);
var treeText = "";

var error = function () {
  console.error("Sketchfab API error");
};

var idxMaterials = 0;

// associative array linking material name to material object
var myMaterialsByNameFromMap = {};

// Keep a list of mat.name -> name 
var myMaterialsNamesFromMapName = {};

// associative array linking material name to id code
var myMaterialID = {};

// associative array linking node id number to node object
var myNodeObjects = {};

// number of nodes to iterate over
var numNodes=0;

var officialNodes = [];

// annotation list
var annotationlist;

var lastspan;

// A list of the spans containing material names + buttons
var spanlist = [];

var jsonarray;

function initGui() {
  var controls = document.getElementById("navTree");
  var buttonsText = '<ul id="topul"><li> <span className="lcaret">';
  buttonsText += '<input type="button" class="styled" id="screenshot" value="Screenshot"></button>';
  buttonsText += '<input type="button" class="styled" id="annotations" value="Annotations"></button>';
  buttonsText += '<input type="button" class="styled" id="wireframes" value="Wireframe"></button>';
  buttonsText += "</span></li></ul>"
  controls.innerHTML = buttonsText;
}

initGui();

var success = function (api) {
  api.start(function () {

 
    // Clicking on an object in the viewer will scroll and select the material
    // in the navTree

    api.addEventListener('click', function (info) {
      if (info && info.material) {
        lastspan.style.removeProperty("background"); 
        thisspan=document.getElementById('span_' + myMaterialsNamesFromMapName[info.material.name]);
        thisspan.style.backgroundColor = '#9dcaf14f';
        lastspan=thisspan;
        navt=document.getElementById('navTree');
        navt.scrollTop = thisspan.offsetTop;
      } else {
        lastspan.style.removeProperty("background"); 
        // api.highlightMaterial();
      }
    }, {
      pick: 'fast'
    });


    api.addEventListener("viewerready", function () {

      // We need to create a data structure that allows us to show(id) and hide(id) all
      // objects having a specified material name. 

      api.getNodeMap(function (err, result) {
        if (err) {
          console.log('Error getting nodes');
          return;
        }
        // get the id from that log
        console.log(result);

        for (var instanceID in result) {
          myNodeObjects[instanceID]=result[instanceID]
        }
      });

      // Save list of annotations
      api.getAnnotationList(function (p, list) {
        annotationlist=list;
      });

      // Get the list of materials, create a new associative array where each material
      // is referenced by the material name.
      api.getMaterialList(function(err, materials) {
        if (!err) {

          console.log(materials);

          materials = materials.sort((a, b) => a.name.localeCompare(b.name));

          var outerul = document.createElement("ul");
          outerul.id="myUl";

          var i = 0;
          var thischild;

          getData('./' + uid + '.json');
          console.log(jsonarray)

          for (var instanceID in materials) {
            var mat = materials[instanceID];

            var name = mat.name;
            var myid = mat.id;

            var lengthOfName=25;
            var li;
            var sp;
            var div;
            var textNode;
            var meta;           

            if (!name) name = "noname_" + idxMaterials++;

            myMaterialsByNameFromMap[name] = mat;
            myMaterialsNamesFromMapName[mat.name] = name;

            // We also need to save the mapping from material name to material id code so we can turn off items by material ID
            myMaterialID[name]=myid;

            console.log(name);

            var text = name.replace(/_/g, " ");
            if (text.length > lengthOfName) {
              text = text.substring(0, lengthOfName);
              text += "...";
            }

            // Create a row in navTree
            var li = document.createElement("li");

            // Create a span to contain text and buttons
            var sp = document.createElement("span");
            lastspan=sp;
            sp.className = "caret";
            sp.id = 'span_' + name; 

            var textNode = document.createTextNode(text);

            var bspan = document.createElement("span");
            bspan.id = 'bspan_' + name;
            bspan.className = "caret"
        
            // Add the material name text to the span
            sp.appendChild(textNode);

            // append the question mark button span to the line
            sp.appendChild(bspan);

            // If we click on the name of a material, briefly highlight objects with
            // that material. 
            sp.setAttribute("mymat", name);
            sp.setAttribute("highlighted", "off");

            spanlist.push(sp);

            sp.addEventListener("click", function () {
              var lspan;
              var thisname=this.getAttribute("mymat");
              var ishigh=this.getAttribute("highlighted");
            
              var mymat=myMaterialsByNameFromMap[thisname];

              // De-highlight all materials
              api.setHighlightOptions({
                outlineWidth: 0,
                outlineColor: [0, 0, 0],
                outlineDuration: 0,
                highlightColor: [0.0, 0.0, 0],
                highlightDuration: 0
              });

              // Turn off highlighting for all of the other spans
              for (var instanceID in spanlist) {
                var mat = spanlist[instanceID].mat;
                if (mat != mymat) {
                  api.highlightMaterial(mat);
                  spanlist[instanceID].setAttribute("highlighted", "off");
                  spanlist[instanceID].style.removeProperty("background"); 
                }            
              }

              console.log(mymat)
              if (ishigh=="on") {
                   // Set highlight options

                api.setHighlightOptions({
                  outlineWidth: 0,
                  outlineColor: [0, 0, 0],
                  outlineDuration: 0,
                  highlightColor: [0.0, 0.0, 0],
                  highlightDuration: 0
                });

                api.highlightMaterial(mymat);
                this.setAttribute("highlighted", "off");
                this.style.removeProperty("background"); 


              } else {

                   // Set highlight options

                api.setHighlightOptions({
                  outlineWidth: 10,
                  outlineColor: [0, 1.0, 0],
                  outlineDuration: 2000,
                  highlightColor: [0.0, 0.0, 1.0],
                  highlightDuration: 1000
                });


                api.highlightMaterial(mymat);
                this.setAttribute("highlighted", "on");
                this.style.backgroundColor = '#9dcaf14f';


              }

            });

            // Create a hide/show button 
            thischild=li.appendChild(createButton(name));
            // Activate it to change the material element stored in the button definition
            thischild.addEventListener("click", function () {
              var thisname=this.getAttribute("nametext")
              var materialToUpdate = myMaterialsByNameFromMap[thisname];

              if (this.getAttribute("state")=="off") {
                this.innerHTML="Off"
                this.style.backgroundColor = "red";
                this.setAttribute("state", "on")

                // This might be deprecated
                this.setAttribute("storedvalue", materialToUpdate.channels.Opacity.factor);

                // Iterate over nodes and turn off any with the correct material id for the present name
                for (var instanceID in myNodeObjects) {
                  // console.log(myNodeObjects[instanceID])
                  if (myNodeObjects[instanceID].materialID == myMaterialID[thisname]) {
                    api.hide(instanceID)
                  }
                }
              } else {
                this.innerHTML="On"
                this.style.backgroundColor = "green";
                this.setAttribute("state", "off")

                // Iterate over nodes and turn off any with the correct material id for the present name
                for (var instanceID in myNodeObjects) {
                  if (myNodeObjects[instanceID].materialID == myMaterialID[thisname]) {
                    api.show(instanceID)
                  }
                }

              }
            });
        
            li.appendChild(sp);

            thischild=li.appendChild(createSlider(name));

            thischild.addEventListener("input", function () {
              var thisname=this.getAttribute("nametext")
              var materialToUpdate = myMaterialsByNameFromMap[thisname];
              materialToUpdate.channels.Opacity.enable = true;
              materialToUpdate.channels.Opacity.factor = this.value/100;
              api.setMaterial(materialToUpdate);
            })

            // Append the line to the UL
            outerul.appendChild(li);
            ++i;

          }

          // console.log(myMaterialID);

          // Append the UL to the navTree div in the HTML 
          var navTree = document.getElementById("navTree");
          navTree.appendChild(outerul);
        
        }
      });

      // Set up button to take a screenshot
      document.getElementById('screenshot').addEventListener('click', function () {
          api.getScreenShot(2000, 1120, 'image/jpeg', function (err, result) {
          if (!err) {
            var anchor = document.createElement('a');
            anchor.href = result;
            anchor.download = 'screenshot.jpg';
            anchor.innerHTML = '<img width="100" height="58" src=' + result + '>';
            document.getElementById('navTree').appendChild(anchor);
          }
        });
      });

      // Set up button to turn on/off annotations
      var annot=document.getElementById('annotations');
      annot.setAttribute("state", "on");
      annot.style.backgroundColor = "green"

      document.getElementById('annotations').addEventListener('click', function () {
        if (this.getAttribute("state")=="on") {
          for (this_anno_ind in annotationlist) {
            api.hideAnnotation(this_anno_ind);
          }
          this.setAttribute("state", "off");
          this.style.backgroundColor = "red"

        } else {
          for (this_anno_ind in annotationlist) {
            api.showAnnotation(this_anno_ind);
          }
          this.setAttribute("state", "on");
          this.style.backgroundColor = "green"
        }
      });

      // Set up button to turn on/off wireframes
      var wiref=document.getElementById('wireframes');
      wiref.setAttribute("state", "on");
      wiref.style.backgroundColor = "red"

      document.getElementById('wireframes').addEventListener('click', function () {
        if (this.getAttribute("state")=="on") {
          api.setWireframe(true, {color: 'FF0000FF'});
          this.setAttribute("state", "off");
          this.style.backgroundColor = "green"
        } else {
          api.setWireframe(false);
          this.setAttribute("state", "on");
          this.style.backgroundColor = "red"
        }
      });      
    });
  });
};

client.init(uid, {
  success: success,
  error: error,
  autostart: 1,
  preload: 1,
  autospin: autoSpin,
  transparent: 1
});

// Functions

function createButton(name) {
  var btn = document.createElement("button");
  btn.type = "button";

  btn.setAttribute("state", "off")
  btn.setAttribute("storedvalue", 100)
  btn.id = 'button_' + name;
  btn.style.backgroundColor = "green";
  btn.style.width = "40px";
  btn.style.height = "40px";
  btn.innerHTML = 'On'
  btn.setAttribute("nametext", name)

  return btn;
}


function createSlider(name) {
  var slider = document.createElement("input");
  slider.className="slider"
  slider.type = "range";
  slider.min = 0;
  slider.max = 100;
  slider.value = 100;
  slider.step = 1;
  slider.id = 'slider_' + name;
  slider.setAttribute("nametext", name)

  return slider;
}

// Function to get a JSON file with extra material information and then
// update the bspan_XXX spans in navTree with this info.

async function getData(path) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    var name;
    var tooltip;
    var myspan;
    for (this_entry in json.material_info) {
      name=json.material_info[this_entry].name;
      tooltip=json.material_info[this_entry].tooltip;
      console.log(name + '/' + tooltip)
      myspan=document.getElementById('bspan_' + name);
      // myspan.innerHTML='<a href="www.google.com" onclick="confirm('  + tooltip +');"?</a>';
      myspan.innerHTML='<button onclick="alert(\'' + tooltip + '\');">?</button>';
      myspan.title=tooltip;
    }
  } catch (error) {
    console.error(error.message);
  }
}