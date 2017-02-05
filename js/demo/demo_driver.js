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
console.log(response);
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
/*
	function GraphD3(){
		this.initialize = function(){
			this.svg = d3.select("svg");
			this.width = +this.svg.attr("width");
			this.height = +this.svg.attr("height");

			this.color = d3.scaleOrdinal(d3.schemeCategory20);

			this.simulation = d3.forceSimulation()
				.force("link", d3.forceLink().id(function(d) { return d.id; }))
				.force("charge", d3.forceManyBody())
				.force("center", d3.forceCenter(this.width/2, this.height/2));
		};
		this.addData = function(graph){
			var link = this.svg.append("g")
				.attr("class", "links")
				.selectAll("line")
				.data(graph.links)
				.enter().append("line")
				  .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

			var color = this.color;
			var node = this.svg.append("g")
				  .attr("class", "nodes")
				.selectAll("circle")
				.data(graph.nodes)
				.enter().append("circle")
				  .attr("r", 5)
				  .attr("fill", function(d) { return color(d.group); })
				  .call(d3.drag()
					  .on("start", this.dragstarted)
					  .on("drag", this.dragged)
					  .on("end", this.dragended));

			  node.append("title")
				  .text(function(d) { return d.id; });

			this.simulation
				  .nodes(graph.nodes)
				  .on("tick", ticked);

			this.simulation.force("link")
				.links(graph.links);

			function ticked() {
				link
					.attr("x1", function(d) { return d.source.x; })
					.attr("y1", function(d) { return d.source.y; })
					.attr("x2", function(d) { return d.target.x; })
					.attr("y2", function(d) { return d.target.y; });

				node
					.attr("cx", function(d) { return d.x; })
					.attr("cy", function(d) { return d.y; });
			}
		};

		this.dragstarted = function (d) {
		  if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
		  d.fx = d.x;
		  d.fy = d.y;
		}

		this.dragged = function (d) {
		  d.fx = d3.event.x;
		  d.fy = d3.event.y;
		}

		this.dragended = function (d) {
		  if (!d3.event.active) this.simulation.alphaTarget(0);
		  d.fx = null;
		  d.fy = null;
		}
	};

	graph = new GraphD3();
	graph.initialize();*/

	function Graph(){
		this.parse = function(data){
			this.nodes = {};
			this.edges = [];
			var graph = this;
			data.forEach(function(element){
				graph.nodes[element.srcObj] = element.srcType;
				graph.nodes[element.destObj] = element.destType;
				graph.edges.push(element);
			});
		};
	};

    $(df2).on({
        "stateFetchingSuccess": function(event, data) {
			graph = new Graph();
			graph.parse(data.result.data);

			/*d3.json("miserables.json", function(error, graph2) {
				graph.addData(graph2);
			});*/
			//console.log(data.result.data);
            //data.result.data.forEach(function(dataEntry) {
            //    addNewEntry($trafficStatusList, JSON.stringify(dataEntry));
            //});
        },
        "stateFetchingFailure": function(event, data) {
            //addNewEntry($trafficStatusList, JSON.stringify(data.error));
            //addNewEntry($trafficStatusList, "Hit a snag. Retry after 1 sec...");
            //setTimeout(function() {
            //    $trafficStatusList.html("");
            //    df2.repeatOnce();
            //}, 1000);
        }
    });

    df2.start();
})();
