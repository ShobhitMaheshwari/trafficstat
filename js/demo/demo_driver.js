'use strict';
(function () {
    function DataFetcher(urlFactory, delay) {
        var self = this;

        self.repeat = false;
        self.delay = delay;
        self.timer = null;
        self.requestObj = null;

        function getNext() {
            self.requestObj = $.ajax({
                    url: urlFactory()
                }).done(function(response) {
                    $(self).trigger("stateFetchingSuccess", {
                        result: response
                    });
                }).fail(function(jqXHR, textStatus, errorThrown) {
                    $(self).trigger("stateFetchingFailure", {
                        error: textStatus
                    });
                }).always(function() {
                    if (self.repeat && _.isNumber(self.delay)) {
                        self.timer = setTimeout(getNext, self.delay);
                    }
                });
        }

        self.start = function(shouldRepeat) {
            self.repeat = shouldRepeat;
            getNext();
        };

        self.stop = function() {
            self.repeat = false;
            clearTimeout(self.timer);
        };

        self.repeatOnce = function() {
            getNext();
        };

        self.setDelay = function(newDelay) {
            this.delay = newDelay;
        };
    }

    function addNewEntry($container, contentHTML) {
        var $innerSpan = $("<p/>").text(contentHTML),
            $newEntry = $("<li/>").append($innerSpan);

        $container.append($newEntry);
    }

    var $trafficStatusList = $("#mockTrafficStat"),
        df2 = new DataFetcher(function() {
            return "/traffic_status";
        });

	function Graph(){
		this.parse = function(data){
			var nodes = {};
			var thisgraph = this;
			thisgraph.trafficedges = [];
			thisgraph.packetedges = [];
			var types = new Set();
			data.forEach(function(element){
				nodes[element.srcObj] = element.srcType;
				nodes[element.destObj] = element.destType;
				thisgraph.trafficedges.push({"source": element.srcObj,
								"target": element.destObj,
								"value": element.traffic});
				thisgraph.packetedges.push({"source": element.srcObj,
								"target": element.destObj,
								"value": element.packets});
				types.add(element.srcType);
				types.add(element.destType);
			});
			var len = Object.keys(nodes).length;
			var typemap = {}, i = 1;
			for (let elem of types){
				typemap[elem] = len+i;
				i++;
			}
			this.nodes = [];
			for(var id in nodes){
				if (nodes.hasOwnProperty(id)) {
					this.nodes.push({"type" : nodes[id], "id" : id, "parent" : typemap[nodes[id]], "name" : id});
				}
			}
			for(var type in typemap){
				if (typemap.hasOwnProperty(type)) {
					this.nodes.push({"type" : type, "id" : typemap[type], "parent" : null, "name" : type});
				}
			}
		};
	};

	var graph = new Graph();
	var graph2;

	var res = initialize();

	function clearchart(){
		document.getElementById("links").innerHTML = "";
		document.getElementById("nodes").innerHTML = "";
		document.getElementById("collapsers").innerHTML = "";
	};

	function toggle(){
		var svg = d3.select("svg g");
		var demoSwitch = {
		gtX: 350,
		gtY: 10,
		id: "deomswitch",
		swpos: "left",
		leftTxt: "Traffic",
		rightTxt: "Packet",
		label: "Switch between packet and traffic visualization"
		},
		switchElement = sP.swtch.newSwtch(demoSwitch, {oW:1,aR:1,oH:1,nW:2,nH:1}); // not passing anything in for pym will default to 1.
		sP.swtch.renderSwtch(svg, switchElement);

		var switchListener = svg.select("#" + demoSwitch.id)
			.on("click", function() {
				sP.swtch.toggleSwitch(svg,demoSwitch, {oW:1,aR:1,oH:1,nW:2,nH:1}) // again not passing any pym info in will default to 1.
				clearchart();
				var biHiSankey = d3.biHiSankey();
				// Set the biHiSankey diagram properties
				biHiSankey
				  .nodeWidth(NODE_WIDTH)
				  .nodeSpacing(10)
				  .linkSpacing(4)
				  .arrowheadScaleFactor(0.5) // Specifies that 0.5 of the link's stroke WIDTH should be allowed for the marker at the end of the link.
				  .size([WIDTH, HEIGHT]);
				var tempgraph = jQuery.extend(true, {}, graph2);
				if(demoSwitch.swpos == "right"){
					biHiSankey
					  .nodes(tempgraph.nodes)
					  .links(tempgraph.packetedges)
					  .initializeNodes(function (node) {
							node.state = node.parent ? "contained" : "collapsed";
					  })
					  .layout(LAYOUT_INTERATIONS);
					disableUserInterractions(2 * TRANSITION_DURATION);
				} else {
					biHiSankey
					  .nodes(tempgraph.nodes)
					  .links(tempgraph.trafficedges)
					  .initializeNodes(function (node) {
							node.state = node.parent ? "contained" : "collapsed";
					  })
					  .layout(LAYOUT_INTERATIONS);
					disableUserInterractions(2 * TRANSITION_DURATION);
				}
					update(biHiSankey, res["svg"], res["tooltip"], res["colorScale"], res["highlightColorScale"]);
			});
	};


    $(df2).on({
        "stateFetchingSuccess": function(event, data) {
			graph.parse(data.result.data);
			graph2 = jQuery.extend(true, {}, graph);
			clearchart();

			var biHiSankey = d3.biHiSankey();
			// Set the biHiSankey diagram properties
			biHiSankey
			  .nodeWidth(NODE_WIDTH)
			  .nodeSpacing(10)
			  .linkSpacing(4)
			  .arrowheadScaleFactor(0.5) // Specifies that 0.5 of the link's stroke WIDTH should be allowed for the marker at the end of the link.
			  .size([WIDTH, HEIGHT]);
				biHiSankey
				  .nodes(graph.nodes)
				  .links(graph.trafficedges)
				  .initializeNodes(function (node) {
						node.state = node.parent ? "contained" : "collapsed";
				  })
				  .layout(LAYOUT_INTERATIONS);
				disableUserInterractions(2 * TRANSITION_DURATION);
				update(biHiSankey, res["svg"], res["tooltip"], res["colorScale"], res["highlightColorScale"]);
				toggle();
        },
        "stateFetchingFailure": function(event, data) {
			console.log("failure");
            //addNewEntry($trafficStatusList, JSON.stringify(data.error));
            //addNewEntry($trafficStatusList, "Hit a snag. Retry after 1 sec...");
            setTimeout(function() {
                $trafficStatusList.html("");
                df2.repeatOnce();
            }, 1000);
        }
    });
    df2.start();
})();
