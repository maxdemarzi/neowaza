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

	graph.addNode(gon.edges[0].source, {twid : gon.edges[0].source});
	
	for (n in gon.nodes) {	
		graph.addNode(gon.nodes[n].target, {twid : gon.nodes[n].target });
		}
	
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
			var t = Viva.Graph.View.webglLine(3014898687);
			return t.oldColor = 3014898687, t
        });

    var renderer = Viva.Graph.View.renderer(graph,
       {
           layout     : layout,
           graphics   : graphics,
           container  : document.getElementById('graph1'),
           renderLinks : true
       });

		var p = function (e) {
		            var t = $("#hoveredName"),
		                n = '<br/><img src="http://api.twitter.com/1/users/profile_image?screen_name=' + e.data.twid + '&size=bigger"' + '></img>';
		            t.empty().text(e.data.twid).append(n).show()
		    };
		 
		var d = function () {
					            $("#hoveredName").hide().empty()
					        };

     var inputs = Viva.Graph.webglInputEvents(graphics, graph),
         r = null,
         i = function (e, n) {
               e && e.id && graph.forEachLinkedNode(e.id, function (e, t) {
                   t.ui.color = n || t.ui.oldColor
               })
           };

         inputs.mouseEnter(function (n) {
             p(n), i(r), r = n, graph.forEachLinkedNode(n.id, function (t, n) {
                 n.ui.color = 4278190335, graphics.bringLinkToFront(n.ui)
             }), renderer.rerender()
         }).mouseLeave(function (e) {
             d(), i(r), r = null, i(e), renderer.rerender()
         }).dblClick(function (e) {
             h(e)
         }).click(function (e) {
             m(e)
         })
		        




    


    renderer.run();
    addNeo(graph);
    l = layout;
}