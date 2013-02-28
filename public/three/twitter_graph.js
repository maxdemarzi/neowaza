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

	var added = 0;
    for (n in data.edges) {
        var edge=data.edges[n];
		if (!edge.source || !edge.target) continue;
        var n1 = graph.getNode(edge.source);
        var n2 = graph.getNode(edge.target);
        if (n1.connectedTo(n2) || n2.connectedTo(n1)) continue;
		graph.addEdge(n1,n2);
		added ++;
    }
    if (added > 0) {
		graph.createLayout();
	}
}

function addRecent(graph) {
    $.ajax("/recent", {
        type:"GET",
        dataType:"json",
        success:function (res) {
            addNeo(graph, {edges:res});
        }
    })
}

function loadGraph(graph,cb) {
    $.ajax("/edges/::waza", {
        type:"GET",
        dataType:"json",
        success:function (res) {
            addNeo(graph, {edges:res});
            cb();
        }
    })
	setInterval(function() {addRecent(graph)},10000);
}

function isTag(id) {
	return /^::/.test(id); 
}
function loadData(graph,id) {
	console.log("loadData",graph,id)
	var url = "/edges/"+id;
	console.log(url)
    $.ajax(url, {
        type:"GET",
        dataType:"json",
        success:function (res) {
            addNeo(graph, {edges:res});
        }
    })
}

var timeout;
function showSelection(graph,obj) {
	if (obj==null) clearTimeout(timeout);
	else {
		timeout = setTimeout(function () {
            showBox(obj.node);
        }, 250);
	}
//	console.log("selection",obj)
	
}

var last;
function showClick(graph,obj) {
	console.log("click",graph,obj)
	if (obj!=last) {
	    loadData(graph,obj.node.id);
		showBox(obj.node)
		obj.scale.x=2;
		obj.scale.y=2;
		if (last) {
			last.scale.x=1;
			last.scale.y=1;
		}
		last=obj;
	}
}

var showBox = function (node) {
    var t = $("#hoveredName").empty();
    if (!node) return;
    var id = node['id'];
    if (id.match(/^::/)) {
        id = "#" + id.substring(2);
        t.text(id).append(n).show();
    } else {
        var n = '<br/><a href="http://twitter.com/' + id + '" target="_blank"><img id="avatar" src="http://api.twitter.com/1/users/profile_image?screen_name=' + id + '&size=bigger"' + '></img></a>';
        t.empty().text("@" + id).append(n).show()
    }
    $.ajax("/tweets/" + node['id'], {
        type:"GET",
        dataType:"json",
        success:function (res) {
            console.log("tweets", res);
            for (var n=0;n<res.length;n++) {
                $("<div>" + res[n].text + "</div>").appendTo(t)
            }
        }});
};
