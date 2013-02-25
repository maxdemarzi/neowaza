function addNeo(graph, data) {
	console.log("addNeo",graph,data)
    function addNode(id) {
        if (!id || typeof id == "undefined") return null;
		var node = graph.getNode(id);
		if (node) return node;
		node = new Node(id);
//	  	node.position.x = Math.random()*1000;
//	  	node.position.y = Math.random()*500;
	  	node.data.title = id;
        graph.addNode(node);
        return node;
    }

    for (n in data.edges) {
        if (data.edges[n].source) {
            addNode(data.edges[n].source);
        }
        if (data.edges[n].target) {
            addNode(data.edges[n].target);
        }
    }

    for (n in data.edges) {
        var edge=data.edges[n];
        var n1 = graph.getNode(edge.source);
        var n2 = graph.getNode(edge.target);
        if (n1.connectedTo(n2) || n2.connectedTo(n1)) continue;
		graph.addEdge(n1,n2);
    }
}

function loadGraph(graph,cb) {
    $.ajax("/edges", {
        type:"GET",
        dataType:"json",
        success:function (res) {
            addNeo(graph, {edges:res});
            cb();
        }
    })
}

function loadData(graph,id) {
	console.log("loadData",graph,id)
    $.ajax(id ? "/edges/" + id : "/edges", {
        type:"GET",
        dataType:"json",
        success:function (res) {
            addNeo(graph, {edges:res});
        }
    })
}
