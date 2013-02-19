var colors = [
0x1f77b4ff, 0xaec7e8ff,
0xff7f0eff, 0xffbb78ff,
0x2ca02cff, 0x98df8aff,
0xd62728ff, 0xff9896ff,
0x9467bdff, 0xc5b0d5ff,
0x8c564bff, 0xc49c94ff,
0xe377c2ff, 0xf7b6d2ff,
0x7f7f7fff, 0xc7c7c7ff,
0xbcbd22ff, 0xdbdb8dff,
0x17becfff, 0x9edae5ff];
      
function addNeo(graph) {
	for (n in gon.edges) {
		graph.addLink(gon.edges[n].source, gon.edges[n].target);
	  }	
}

function onLoad() {
    var graph = Viva.Graph.graph();

    var layout = Viva.Graph.Layout.forceDirected(graph, {
        springLength : 100,
        springCoeff : 0.0001,
        dragCoeff : 0.02,
        gravity : -1
    });
     
    var graphics = Viva.Graph.View.webglGraphics();
	graphics.setNodeProgram(new Viva.Graph.View.webglImageNodeProgram())
    graphics
        .node(function(node){	
           return Viva.Graph.View.webglImage(12, "/image/"+node["id"]);
        })
        .link(function(link) {
            return Viva.Graph.View.webglLine(colors[(1) << 0]);
        });
    
    var renderer = Viva.Graph.View.renderer(graph,
        {
            layout     : layout,
            graphics   : graphics,
            container  : document.getElementById('graph1'),
            renderLinks : true
        });

    renderer.run();
    addNeo(graph);
    l = layout;
}