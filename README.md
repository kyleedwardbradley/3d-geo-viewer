# Interactive Sketchfab geological model viewer 

https://kyleedwardbradley.github.io/3d-geo-viewer/index.html

This model viewer allows interactive hiding and showing of objects based on material names, adjustment of transparency, and switching between models given as a list of Sketchfab UIDs.

The UIDs are stored in a local JSON file: ./uid_list.json

The viewer can be used in stand-alone mode by providing a Sketchfab UID to /viewer.html, e.g:
https://kyleedwardbradley.github.io/3d-geo-viewer/viewer.html?uid=52b8fc8c74c94dceaeabb852dea4046b

Underscores in material names will be replaced by spaces.

Material names and information can be added using a local JSON file (<UID string>.json):

```
{
    "material_info":[
        {
            "name":"Terrain",
            "tooltip": "Elevation from SRTM30"
        },
        {
            "name":"Focal_mechanisms",
            "tooltip":"Focal mechanisms before 2024-08-06"
        },
        {
            "name":"Focal_mechanisms_2",
            "tooltip":"Focal mechanisms after 2024-08-06. This ia a longer line of text to check whether the alert wraps well or not!"
        },
        {
            "name":"TorusObjectColor_1",
            "tooltip":"Target rings"
        },
        {
            "name":"Earthquakes_1",
            "tooltip":"Earthquakes before 2024-08-06"
        },
        {
            "name":"Earthquakes_2",
            "tooltip":"Earthquakes after 2024-08-06"
        },
        {
            "name":"SCECFaultSurface",
            "tooltip":"3D fault surfaces from SCEC CFM v5.3"
        }
    ]
}
```


This viewer adopted significant ideas and some code from https://github.com/ricoshae/sketchfabhideandshow by Chris Richter (chris@ricoshae.com.au)

Kyle Bradley, 2024
geokyle@gmail.com
