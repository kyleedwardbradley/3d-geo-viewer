// Sketchfab Viewer API: Start/Stop the viewer

var version = "1.12.1";

var urlParams = new URLSearchParams(window.location.search);

if (urlParams.has("id")) {
  uid = urlParams.get("id");
}

// delay function
const delay = ms => new Promise(res => setTimeout(res, ms));


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

// list of the hide/show buttons
var buttonlist=[];

var lastspan;

// A list of the spans containing material names + buttons
var spanlist = [];

var jsonarray;

var camera_data = "";

function initGui() {
  var controls = document.getElementById("navTreeTop");
  var buttonsText = '<ul id="topul"><li> <span className="lcaret">';
  buttonsText += '<input type="button" class="styled-fixed" id="screenshot" value="Save"></button>';
  buttonsText += '<input type="button" class="styled" id="annotations" value="Annot"></button>';
  buttonsText += '<input type="button" class="styled" id="wireframes" value="Wire"></button>';
  buttonsText += '<input type="button" class="styled-fixed" id="resetbutton" value="Zoom"></button>';
  buttonsText += '<input type="button" class="styled-fixed" id="script" value="Script"></button>';
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

            var bspan = document.createElement("span");
            bspan.id = 'bspan_' + name;
            // bspan.className = "caret"
            bspan.style.removeProperty("background"); 

            // Create a span to contain text and buttons
            var sp = document.createElement("span");
            lastspan=sp;
            sp.className = "caret";
            sp.id = 'span_' + name; 

            var textNode = document.createTextNode(text);
            // Add the material name text to the span
            // append the question mark button span to the line

            sp.appendChild(textNode);

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
            var thisbutton = createShowHideButton(name)
            thischild=li.appendChild(thisbutton);
            // Add it to the list
            buttonlist.push(thischild)
            
            // Activate it to change the material element stored in the button definition
            thischild.addEventListener("click", function () {
              var thisname=this.getAttribute("nametext")
              var materialToUpdate = myMaterialsByNameFromMap[thisname];

              if (this.getAttribute("state")=="off") {
                this.innerHTML="Off"
                this.style.backgroundColor = "red";
                this.setAttribute("state", "on")

                // This might be deprecated
                // this.setAttribute("storedvalue", materialToUpdate.channels.Opacity.factor);

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
        
            // Create a focus button
            thischild=li.appendChild(createZoomButton(name));
            thischild.addEventListener("click", function () {
              var this_state;
              var this_id;
              var this_text = this.getAttribute("nametext");
              var turnoff = [];

              // Loop through all materials, recording which ones are turned on
              for (var this_button in buttonlist) {
                this_id = buttonlist[this_button].getAttribute("nametext");
                // read the state of the button: "Off" actually means the material is On
                this_state = buttonlist[this_button].getAttribute("state");
                if (this_id != this_text) {
                  if (this_state == "off") {
                    turnoff.push(this_id);                    
                    for (var instanceID in myNodeObjects) {
                      if (myNodeObjects[instanceID].materialID == myMaterialID[this_id]) {
                        api.hide(instanceID)
                      }
                    }

                  }
                } 
              }
              // Zoom to the visible objects
              api.focusOnVisibleGeometries();
              // Turn back on 
              for (var this_id in turnoff) {
                for (var instanceID in myNodeObjects) {
                  if (myNodeObjects[instanceID].materialID == myMaterialID[turnoff[this_id]]) {
                    api.show(instanceID)
                  }
                }
              }
            });

            li.appendChild(sp);

            li.appendChild(bspan);
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

      // Set up button to turn on/off all annotations
      var annot=document.getElementById('annotations');
      annot.setAttribute("state", "on");
      annot.style.backgroundColor = "green"

      document.getElementById('annotations').addEventListener('click', function () {
        if (this.getAttribute("state")=="on") {
          for (this_anno_ind in annotationlist) {
            api.hideAnnotation(this_anno_ind);
          }
          api.hideAnnotationTooltips();
          api.unselectAnnotation();
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
      
      // Reset camera to presently visible geometries
      document.getElementById('resetbutton').addEventListener('click', function () {
        api.focusOnVisibleGeometries();
      });

      // // Output camera information
      // document.getElementById('cam').addEventListener('click', function () {
      //   api.getCameraLookAt(function(err, camera) {
      //     var camera_x=camera.position[0];
      //     var camera_y=camera.position[1];
      //     var camera_z=camera.position[2];
      //     var target_x=camera.target[0];
      //     var target_y=camera.target[1];
      //     var target_z=camera.target[2];
          
      //     var formObject =  {
      //         "camera_x": camera_x, 
      //         "camera_y": camera_y, 
      //         "camera_z": camera_z, 
      //         "target_x": target_x, 
      //         "target_y": target_y, 
      //         "target_z": target_z,
      //       }
          
      //       if (camera_data == "") {
      //         camera_data = JSON.stringify(formObject); // [x, y, z]
      //       } else {
      //         camera_data = camera_data + JSON.stringify(formObject); // [x, y, z]
      //       }
      //   });
      // });

      // // Download saved camera location/orientations
      // document.getElementById('dl').addEventListener('click', function () {
      //   downloadJSON(camera_data, 'camera_data.json');
      // });

      // Run the control script for this model
          document.getElementById('script').addEventListener('click', function () {
            runScreenplay('./screenplay.json', api);
          });

      // Set up popups

      window.addEventListener('click', ({ target }) => {

        const popups = [...document.getElementsByClassName('popup')];

        console.log('clock')
        const popup = target.closest('.popup');
        console.log(popup);
        const clickedOnClosedPopup = popup && !popup.classList.contains('show');
        
        popups.forEach(p => p.classList.remove('show'));
        
        if (clickedOnClosedPopup) {
          console.log('showing');
          popup.classList.add('show');
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
  autospin: 0,
  transparent: 1,
  ui_controls: 0,
  ui_watermark: 0
});

// Functions

function createShowHideButton(name) {
  var btn = document.createElement("button");
  btn.type = "button";

  btn.setAttribute("state", "off")
  // btn.setAttribute("storedvalue", 100)
  btn.id = 'button_' + name;
  btn.style.backgroundColor = "green";
  btn.style.width = "40px";
  btn.style.height = "40px";
  btn.innerHTML = 'On'
  btn.setAttribute("nametext", name)

  return btn;
}

function createZoomButton(name) {
  var btn = document.createElement("button");
  btn.type = "button";

  btn.id = 'zoom_' + name;
  btn.style.background="url(./focus.svg)"
  // btn.style.backgroundColor = "lightblue";
  btn.style.width = "40px";
  btn.style.height = "40px";
  btn.style.padding = "14px";
  btn.style.backgroundSize = "36px auto";
  // btn.innerHTML = 'T'
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
      // myspan.innerHTML='<button onclick="alert(\'' + tooltip + '\');">?</button>';
      myspan.innerHTML='<span class="popup"><img src="./qmark.svg" width="20" height="20"><span class="popuptext">' + tooltip + '</span></span>';
      myspan.title=tooltip;
      console.log(myspan.innerHTML);
    }
  } catch (error) {
    console.error(error.message);
  }
}

// Function to download and run a scripted control file - a screenplay

async function runScreenplay(path, api) {
  try {
    const response = await fetch(path + '?v=' + Date().now);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    var name;
    var tooltip;
    var myspan;
    var annotationlist;

    api.getAnnotationList(function (p, list) {
      annotationlist=list;
    });

    for (this_anno_ind in annotationlist) {
      api.hideAnnotation(this_anno_ind);
      api.hideAnnotationTooltip(this_anno_ind);
      api.hideAnnotationTooltips();
      api.unselectAnnotation();
    }
    for (this_entry in json.screenplay) {
      command=json.screenplay[this_entry].command;
      console.log('running ' + command + ' - ' + json.screenplay[this_entry].argument);
      switch (command) {
        case 'wait':
          await delay(json.screenplay[this_entry].argument * 1000);
          break;
        case 'annotation':
          api.gotoAnnotation(json.screenplay[this_entry].argument-1);
          // for (this_anno_ind in annotationlist) {
          //   api.hideAnnotation(this_anno_ind);
          //   api.hideAnnotationTooltip(this_anno_ind);
          //   api.unselectAnnotation();
          // }
          break;
        case 'easing':
          api.setCameraEasing(json.screenplay[this_entry].argument);
          break;
        case 'fadeout_others':
          var duration=json.screenplay[this_entry].argument
          break;
        
      }
      console.log('done');
    }
  } catch (error) {
    console.error(error.message);
  }
}

// function downloadJSON(data, filename) {

//   const blob = new Blob([data], { type: "application/json" });

//   console.log(blob)
//   const url = URL.createObjectURL(blob);

//   const link = document.createElement("a");
//   link.href = url;
//   link.download = filename;
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
// }
