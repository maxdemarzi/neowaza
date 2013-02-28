/**
  @author David Piegza

  Implements a label for an object.
  
  It creates an text in canvas and sets the text-canvas as
  texture of a cube geometry.
  
  Parameters:
  text: <string>, text of the label
  
  Example: 
  var label = new THREE.Label("Text of the label");
  label.position.x = 100;
  label.position.y = 100;
  scene.addObject(label);
 */

THREE.Label = function(text, parameters) {
  var parameters = parameters || {};
  
  var labelCanvas = document.createElement( "canvas" );
  
  function create() {
    var xc = labelCanvas.getContext("2d");
	var tag=/^::/.test(text);
	if (tag) text="#"+text.substring(2);
    var fontsize = tag ? "18pt" : "10pt";
    // set font size to measure the text
	var style = tag ? " bold" : "";
    xc.font = fontsize + " Arial"+style;
    var len = xc.measureText(text).width*1.2;

    labelCanvas.setAttribute('width', len);
    
    // set font size again cause it will be reset
    // when setting a new width
    xc.font = fontsize + " Arial";
    xc.textBaseline = 'top';
    xc.fillStyle = "#74d0f4"
    xc.strokeStyle = "#74d0f4"
    xc.fillText(text, 0, 0);

    var geometry = new THREE.PlaneGeometry(len, 200);
    var xm = new THREE.MeshBasicMaterial( { map: new THREE.Texture( labelCanvas ), transparent: true } );
    xm.map.needsUpdate = true;

    // set text canvas to cube geometry
    var labelObject = new THREE.Mesh( geometry, [ xm ] );
    return labelObject;
  }

  return create();
}
