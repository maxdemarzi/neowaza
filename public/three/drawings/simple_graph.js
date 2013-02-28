/**
  @author David Piegza

  Implements a simple graph drawing with force-directed placement in 2D and 3D.
  
  It uses the force-directed-layout implemented in:
  https://github.com/davidpiegza/Graph-Visualization/blob/master/layouts/force-directed-layout.js
  
  Drawing is done with Three.js: http://github.com/mrdoob/three.js

  To use this drawing, include the graph-min.js file and create a SimpleGraph object:
  
  <!DOCTYPE html>
  <html>
    <head>
      <title>Graph Visualization</title>
      <script type="text/javascript" src="path/to/graph-min.js"></script>
    </head>
    <body onload="new Drawing.SimpleGraph({layout: '3d', showStats: true, showInfo: true})">
    </bod>
  </html>
  
  Parameters:
  options = {
    layout: "2d" or "3d"

    showStats: <bool>, displays FPS box
    showInfo: <bool>, displays some info on the graph and layout
              The info box is created as <div id="graph-info">, it must be
              styled and positioned with CSS.


    selection: <bool>, enables selection of nodes on mouse over (it displays some info
               when the showInfo flag is set)


    limit: <int>, maximum number of nodes
    
    numNodes: <int> - sets the number of nodes to create.
    numEdges: <int> - sets the maximum number of edges for a node. A node will have 
              1 to numEdges edges, this is set randomly.
  }
  

  Feel free to contribute a new drawing!

 */
 
var Drawing = Drawing || {};

Drawing.SimpleGraph = function(options) {
  var options = options || {};
  
  this.renderMode = options.renderMode || "canvas";
  this.layout = options.layout || "2d";
  this.layout_options = options.graphLayout || {};
  this.show_stats = options.showStats || false;
  this.show_info = options.showInfo || false;
  this.show_labels = options.showLabels || false;
  this.selection = options.selection || false;
  this.click = options.click || false;
  this.limit = options.limit || 1000;
  this.nodes_count = options.numNodes || 20;
  this.edges_count = options.numEdges || 10;
  this.create = options.create || createGraph;

  var camera, scene, renderer, interaction, geometry, object_selection;
  var stats;
  var info_text = {};
  var graph = new Graph({limit: options.limit});

  var textures = {};
  
  var geometries = [];
  
  var that=this;

  this.addNode=function(node) {
    if (graph.addNode(node)) drawNode(node);
  }
  this.getNode=function(id) {
	return graph.getNode(id);
  }
  this.addEdge=function(n1,n2) {
	if(graph.addEdge(n1, n2)) {
      drawEdge(n1, n2);
    }  
  }

  init();
//  console.log(this.create)
  this.create(this, function() {
	  that.createLayout();
	  animate();
  });


  function init() {
    // Three.js initialization
    renderer = that.renderMode =="canvas" ? new THREE.CanvasRenderer({antialias: true}) : new THREE.WebGLRenderer({antialias: true});
    renderer.setSize( window.innerWidth, window.innerHeight );
    
    camera = new THREE.TrackballCamera({
      fov: 20, 
      aspect: window.innerWidth / window.innerHeight,
      near: 1,
      far: 1000000,

      rotateSpeed: 0.001,
      zoomSpeed: 3,
      panSpeed: 1,

      noZoom: false,
      noPan: false,
      noRotate: true,

      staticMoving: false,
      dynamicDampingFactor: 0.3,
      
      domElement: renderer.domElement,

      keys: [ 65, 83, 68 ]
    });
    camera.position.z = 3000;

    THREE.Interaction(camera);

    scene = new THREE.Scene();

    // Node geometry
    if(that.layout === "3d") {
      geometry = new THREE.SphereGeometry( 25, 25, 25 );
    } else {
      geometry = new THREE.SphereGeometry( 50, 50, 0 );
    }
    
    // Create node selection, if set
    if(that.selection) {
      object_selection = new THREE.ObjectSelection({
        domElement: renderer.domElement,
        selected: function(obj) {
          // display info
          if(obj != null) {
            info_text.select = "Object " + obj.id;
          } else {
            delete info_text.select;
          }

		  if (obj !=null && typeof that.selection == "function" && obj.hasOwnProperty("node")) {
			 that.selection.call(null,that,obj)
		  }
        },
        clicked: function(obj) {
			console.log("clicked",obj)
		    if (obj !=null && typeof that.click == "function") {
				if (obj.hasOwnProperty("node")) that.click.call(null,that,obj)
				if (obj.parent && obj.parent.hasOwnProperty("node")) that.click.call(null,that,obj.parent)
		   }
        }
      });
    }

    document.body.appendChild( renderer.domElement );
  
    // Stats.js
    if(that.show_stats) {
      stats = new Stats();
      stats.domElement.style.position = 'absolute';
      stats.domElement.style.top = '0px';
      document.body.appendChild( stats.domElement );
    }

    // Create info box
    if(that.show_info) {
      var info = document.createElement("div");
      var id_attr = document.createAttribute("id");
      id_attr.nodeValue = "graph-info";
      info.setAttributeNode(id_attr);
      document.body.appendChild( info );
    }
  }
  

  /**
   *  Creates a graph with random nodes and edges.
   *  Number of nodes and edges can be set with
   *  numNodes and numEdges.
   */
  function createGraph(graph,cb) {
    var node0 = new Node(0);
    node0.data.title = "This is node " + node0.id;
    graph.addNode(node0);

    var nodes = [];
    nodes.push(node0);

    var steps = 1;
    while(nodes.length != 0 && steps < that.nodes_count) {
      var node = nodes.shift();

      var numEdges = randomFromTo(1, that.edges_count);
      for(var i=1; i <= numEdges; i++) {
		var id=i*steps;
	    if (graph.getNode(id)) continue;
        var target_node = new Node(id);
        target_node.data.title = "This is node " + target_node.id;
		graph.addNode(target_node);
        nodes.push(target_node);
        graph.addEdge(node, target_node);
      }
      steps++;
    }
    cb();
  }

  this.createLayout = function() {
	that.layout_options.width = that.layout_options.width || 1000;
    that.layout_options.height = that.layout_options.height || 1000;
    that.layout_options.iterations = that.layout_options.iterations || 1000000;
    that.layout_options.layout = that.layout_options.layout || that.layout;
    graph.layout = new Layout.ForceDirected(graph, that.layout_options);
    graph.layout.init();
    info_text.nodes = "Nodes " + graph.nodes.length;
    info_text.edges = "Edges " + graph.edges.length;
  }

  function nodeLabel(node) {
     return node.data.title || node.id;
  }

  function isTag(node) {
     var label = nodeLabel(node);
     return /^::/.test(label); 
  }

  function addLabelObject(node,scene) {
      if (!that.show_labels ||isTag(node)) return node;
      var label = nodeLabel(node);
      node.data.label_object = new THREE.Label(label, node.data.draw_object);
	  node.data.label_object.position.x = 0;
	  node.data.label_object.position.y = - 120;
	  node.data.label_object.position.z = -1;

	  if (scene) {
		scene.addObject(node.data.label_object);
	  }
	  else {
		node.data.draw_object.addChild(node.data.label_object);
	  }
      return node;
  }

  /**
   *  Create a node object and add it to the scene.
   */
  function drawNode(node) {
	var tag=isTag(node);
	var draw_object;
	if (tag) {
	  draw_object = new THREE.Label(nodeLabel(node));
	} else {
      draw_object = createImageObject(imageUrl(node));
	}

	// new THREE.Mesh( geometry, [ new THREE.MeshBasicMaterial( {  color: Math.random() * 0xffffff, opacity: 0.5 } ) ] );
    
    var area = 2000;
    draw_object.position.x = Math.floor(Math.random() * (area + area + 1) - area);
    draw_object.position.y = Math.floor(Math.random() * (area + area + 1) - area);

    if(that.layout === "3d") {
      draw_object.position.z = Math.floor(Math.random() * (area + area + 1) - area);
    }

    draw_object.id = node.id;
    node.data.draw_object = draw_object;
    draw_object.node = node;
    node.position = draw_object.position; // todo is this the right initialization??
    scene.addObject( node.data.draw_object );

	if (!tag) addLabelObject(node);
  }


  /**
   *  Create an edge object (line) and add it to the scene.
   */
  function drawEdge(source, target) {
      material = new THREE.LineBasicMaterial( { color: 0xffffff, opacity: 0.3, linewidth: 0.5 } );
      var tmp_geo = new THREE.Geometry();
    
      tmp_geo.vertices.push(new THREE.Vertex(source.data.draw_object.position));
      tmp_geo.vertices.push(new THREE.Vertex(target.data.draw_object.position));

      line = new THREE.Line( tmp_geo, material, THREE.LinePieces );
      line.scale.x = line.scale.y = line.scale.z = 1;
      line.originalScale = 1;
      line.edge = {source:source,target:target}
      geometries.push(tmp_geo);
      
      scene.addObject( line );
  }


  function animate() {
    requestAnimationFrame( animate );
    render();
    if(that.show_info) {
      printInfo();
    }
  }

  function loadTexture(name) {
      if (!textures[name])
          textures[name]=THREE.ImageUtils.loadTexture(name);
      return textures[name];
  }

    function createImageObject(url) {
        var texture = loadTexture(url);
        var geometry = new THREE.PlaneGeometry(48, 48);
        var material = new THREE.MeshBasicMaterial({map:texture});
        var plane = new THREE.Mesh(geometry, material);
        plane.receiveShadow = false;
        return plane;
    }

	function imageUrl(node) {
		var id=node.data.title||node.id;
		//return that.renderMode == "canvas" ? "http://api.twitter.com/1/users/profile_image?screen_name="+id+"&size=bigger" : "/img/"+id+".png";
		return "/image/"+id+".png";
	}

   
  function render() {
    // Generate layout if not finished
    if(!graph.layout.finished) {
      info_text.calc = "<span style='color: red'>Calculating layout...</span>";
      graph.layout.generate();
//      if (Math.random()<0.8) return;
    } else {
      info_text.calc = "";
    }

    // Update position of lines (edges)
    for(var i=0; i<geometries.length; i++) {
      geometries[i].__dirtyVertices = true;
    }


    // Show labels if set
    // It creates the labels when this options is set during visualization
    var length = graph.nodes.length;

      var labels = that.show_labels;
      for (var i = 0; i < length; i++) {
          var node = graph.nodes[i];
          if (labels) {
              if (node.data.label_object == undefined) {
                  addLabelObject(node);
              } else {
	              node.data.label_object.lookAt(camera.position);
              }
/*              node.data.label_object.position.x = node.data.draw_object.position.x;
              node.data.label_object.position.y = node.data.draw_object.position.y - 120;
              node.data.label_object.position.z = node.data.draw_object.position.z - 2;
*/
          } else {
              if (node.data.label_object == undefined) continue;
			  node.removeChild(node.data.label_object)
              node.data.label_object = undefined;
          }
          node.data.draw_object.lookAt(camera.position);
      }

      // render selection
    if(that.selection) {
      object_selection.render(scene, camera);
    }

    // update stats
    if(that.show_stats) {
      stats.update();
    }
    
    // render scene
    renderer.render( scene, camera );
  }

  /**
   *  Prints info from the attribute info_text.
   */
  function printInfo(text) {
    var str = '';
    for(var index in info_text) {
      if(str != '' && info_text[index] != '') {
        str += " - ";
      }
      str += info_text[index];
    }
    document.getElementById("graph-info").innerHTML = str;
  }

  // Generate random number
  function randomFromTo(from, to) {
    return Math.floor(Math.random() * (to - from + 1) + from);
  }
  
  // Stop layout calculation
  this.stop_calculating = function() {
    graph.layout.stop_calculating();
  }
}