// SVG dimensions
var width = 500;
var height = 1000;

// create svg element
var svg2 = d3.select('#nyc-map')
            .append('svg')
            .classed('nyc', true)
            .attr('width', width)
            .attr('height', height);
$('svg.bklyn').hide();

// GRAB GEOJSON AND ADD PATH ELEMENTS TO DOM
d3.json("../assets/nyc.geojson", function(error, json) {
  var nyc_data = json.features;
  // filter nyc data for only manhattan
  manhattan_data = nyc_data.filter(function (hood){
    return ( hood.properties.borough == 'Manhattan' )
  });

  console.log(manhattan_data);
  // find centroid of geojson
  // create first guess for projection position
  var center = d3.geo.centroid(json)
  var scale = 13 * 10000;
  var offset = [ width / 2 + 50, height / 2 -370];  
  var projection = d3.geo.mercator()
      .scale(scale)
      .center(center)
      .translate(offset);
  // create path
  var path = d3.geo.path().projection(projection);
  
  // creating color scheme
  var hslScale = d3.scale.linear()
                 .domain([0, manhattan_data.length])
                 .range([30, 70])

  // create and append hood shapes to SVG element
  var hoods = svg2.selectAll('path')
      .data(manhattan_data)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('stroke', 'darkblue')
      .attr('stroke-width','1')
      .attr('fill', function(d,i) { 
        return 'hsl(' + hslScale(i) + ',70%,80%)'; 
      })
      .attr('data-basecolor', function(d,i) { 
        return 'hsl(' + hslScale(i) + ',70%,80%)'; 
      });

});