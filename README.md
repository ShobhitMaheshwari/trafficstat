# trafficstat

Sankey diagram for visualizing traffic in a network (based on http://bl.ocks.org/Neilos/584b9a5d44d5fe00f779)

Salient points about this chart are:

The network shows traffic and packets per link and per node. Each object is one of four types and the initial visualization is provided by aggregting all objects of same type (Therefore maximum 4 nodes).

Double clicking the type node will split all the objects in that type and one may inpect more detailed network stats. The resulting circle generated previously indicating the type may be again double clicked to show aggregated node.

All the nodes (type or object) can be dragged in x-y direction so as to provide a better picture.

When hovering over a node the all links which connect it to network become highlighted (red links: traffic going out of node, blue links: traffic coming into node)

Hovering over nodes and links also displays information about them.

The packet vs traffic toggle provides visualization of one of them at a time.

The data is mocked (randomly generated) using mockjax. The refresh button would request for new data. If Frozen checkbox is checked then repeated refreshing would give same data.


To run this locally clone this repo and run	"npm	install", "npm	run	start", and	open "localhost:8000" in browser.
