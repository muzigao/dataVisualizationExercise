function getDatasetByYear (year) {
	var data = _.findWhere(dataset, {year: year}).data
	return _(data).sortBy("population").reverse();
}

function getGiniRange(dataset) {
	var min = _.min(dataset, function(dataset) { return dataset.gini }).gini,
		max = _.max(dataset, function(dataset) { return dataset.gini }).gini;

	return [max, min];
}

function getOpennessRange(dataset) {
	var min = _.min(dataset, function(dataset) { return dataset.openness }).openness,
		max = _.max(dataset, function(dataset) { return dataset.openness }).openness;

	return [min, max];
}

function getPopulationRange(dataset) {
	var min = _.min(dataset, function(dataset) { return dataset.population }).population,
		max = _.max(dataset, function(dataset) { return dataset.population }).population;

	return [min, max];
}

function getCircleRadius(population) {
	var radius,
		roundedPopulation = d3.round(population/100000);
	if      (roundedPopulation > 10000) { radius = 40; }
	else if (roundedPopulation > 5000)  { radius = 32; }
	else if (roundedPopulation > 1000)  { radius = 26; }
	else if (roundedPopulation > 500)   { radius = 20; }
	else if (roundedPopulation > 100)   { radius = 16; }
	else if (roundedPopulation > 50)    { radius = 12; }
	else if (roundedPopulation > 10)    { radius = 8; }
	else if (roundedPopulation > 5)     { radius = 4; }
	else                                { radius = 2; }

	return radius;
}

var margin = {top: 40, right: 0, bottom: 100, left: 60},
	padding = {top: 0, right: 0, bottom: 30, left: 30},	
	gutter = 40,
	width = 800,
	height = 460;
var svg= d3.select("#canvas-container")
	.append("svg")
	.attr({"id":"canvas", "width": width + margin.left + margin.right + padding.left + padding.right + gutter, "height": height + margin.top + margin.bottom + padding.top + padding.bottom})
	.append("g")
	.attr("transform", "translate(" + (margin.left + padding.left) + "," + (margin.top + padding.top) + ")");

//Default dataset
var displayedYear = 1995; 
var data = getDatasetByYear(displayedYear);
var continents = ["Asia","South America","North America","Europe","Australia"];
var cScale = d3.scale.category10();

//Init Data
//Generate X Axis -- Economic Openness
var xScale = d3.scale.linear()
	.domain(getOpennessRange(data))
	.range([0, width]);
var xAxis = d3.svg.axis().scale(xScale).orient("bottom");

svg.append("text")
	.attr({"class": "axis-label x-label", "text-anchor": "middle"})
	.attr("transform", "translate(400,"+ (height + 85) +")")
	.text("Economic Openness");

svg.append("g")
    .attr({"class": "axis x", "transform": "translate(0," + (height + gutter) + ")"})
    .call(xAxis);
	
//Generate Y Axis -- Gini Coefficient
var yScale = d3.scale.linear()
	.domain(getGiniRange(data))
	.range([0, height]);
var yAxis = d3.svg.axis().scale(yScale).orient("left");

svg.append("text")
	.attr({"class": "axis-label y-label", "text-anchor": "middle"})
	.attr("transform", "translate(-75,230)rotate(-90)")
	.text("Gini Coefficient");

svg.append("g")
	.attr({"class": "axis y", "transform": "translate(" + (-gutter) +",0)"})
	.call(yAxis);

//Append Legend
function populateLegend() {
	d3.select(".legend")
		.selectAll('li')
		.data(continents)
		.enter()
		.append('li')
		.append('span')
		.attr("class","legend-item")
		.text(function(d){ return d; })
		.style("background-color",function(d, m) { return cScale(m); });
}

populateLegend();

//Append Country Label
svg.append("text")
	.attr({"class": "country-label","x": 800,"y": 20, "text-anchor": "end"});

svg.selectAll('circle')
	.data(data)
	.enter().append("circle")
	.attr("class", function(d) { return d.developed? "developed-country":"developing-country" })
	.attr("r", function(d) { return getCircleRadius(d.population); })
	.attr("cx", function(d) { return xScale(d.openness); })
	.attr("cy", function(d) { return yScale(d.gini); })
	.style("fill", function(d) { 
		var cIndex = _.indexOf(continents, d.continent);
		return cScale(cIndex);
	})
	.on("mouseover", function(d) { 
		d3.select('#canvas .country-label').text(d.country)
		  .transition()
		  .style("opacity",1);
	})
	.on("mouseout", function(d) {
		d3.select('#canvas .country-label')
		  .transition()
		  .duration(1000)
		  .style("opacity", 0);
	});

//Generage Controller List
d3.select('#controller-container .controller-list.year-list')
	.selectAll('li')
	.data(dataset)
	.enter()
	.append('li')
	.attr("class", "list-item year")
	.text(function(d) { return d.year; })
	.classed("selected", function(d) { return d.year === displayedYear; })
	.on("click", function(d){
		displayedYear = d.year;
		populateAxis();
		populateChart();
		populateController();
	});

//Render Country Development Status Filter
d3.select('.controller-list.status-list')
	.selectAll('li')
	.on("click", function(){
		d3.selectAll('.controller-list.status-list li').classed("selected", false);
		d3.select(this).classed("selected", true);

		d3.select("#canvas")
			.attr("class",d3.select(this).attr("data-display-status"));
	})

function populateAxis () {
	data = getDatasetByYear(displayedYear);

	xScale = d3.scale.linear()
		.domain(getOpennessRange(data))
		.range([0, width]);
	xAxis = d3.svg.axis().scale(xScale).orient("bottom");

	svg.select(".axis.x")
    	.call(xAxis);

    yScale = d3.scale.linear()
		.domain(getGiniRange(data))
		.range([0, height]);
	yAxis = d3.svg.axis().scale(yScale).orient("left");

	svg.select(".axis.y")
    	.call(yAxis);
}

function populateChart(){
	svg.selectAll('circle')
		.remove();

	svg.selectAll('circle')
		.data(data)
		.enter().append("circle")
		.attr("class", function(d) { return d.developed? "developed-country":"developing-country" })
		.attr("r", function(d) { return getCircleRadius(d.population); })
		.attr("cx", function(d) { return xScale(d.openness); })
		.attr("cy", function(d) { return yScale(d.gini); })
		.style("fill", function(d) { 
			var cIndex = _.indexOf(continents, d.continent);
			return cScale(cIndex);
		})
		.on("mouseover", function(d) { 
			d3.select('#canvas .country-label').text(d.country)
			  .transition()
			  .style("opacity",1);
		})
		.on("mouseout", function(d) {
			d3.select('#canvas .country-label')
			  .transition()
			  .duration(1000)
			  .style("opacity", 0);
		});
}

function populateController(){
	d3.select(".year-list")
		.selectAll("li")
		.classed('selected', function(d) {
			return d.year === displayedYear;
		})
	d3.select(".status-list")
		.selectAll("li")
		.classed("selected", function(d, m) {
			d3.select("#canvas")
				.attr("class", "showAll");
			return m === 0;
		});
}



