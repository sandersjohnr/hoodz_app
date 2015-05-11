// SVG dimensions
var width = 800;
var height = 700;

// create svg element
var svg = d3.select('#nyc-map')
            .append('svg')
            .classed('nyc', true)
            .attr('width', width)
            .attr('height', height);

$('#map').hide();

// GRAB GEOJSON AND ADD PATH ELEMENTS TO DOM
d3.json("../assets/nyc.geojson", function(error, json) {
  var nyc_data = json.features;

  // creating color scheme
  var hslScale = d3.scale.linear()
                 .domain([0, nyc_data.length])
                 .range([40, 60])

  // find centroid of geojson
  // create first guess for projection position
  var center = d3.geo.centroid(json)
  var scale = 6.3 * 10000;
  var offset = [ width / 2 + 00, height / 2 - 230];  
  var projection = d3.geo.mercator()
      .scale(scale)
      .center(center)
      .translate(offset);

  // create path
  var path = d3.geo.path().projection(projection);

  // create and append hood shapes to SVG element
  var hoods = svg.selectAll('path')
      .data(nyc_data)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('stroke', 'cornflowerblue')
      .attr('stroke-width','1')
      .attr('fill', function(d,i) { 
        return 'hsl(' + hslScale(i) + ',80%,75%)'; 
      })
      .attr('data-basecolor', function(d,i) { 
        return 'hsl(' + hslScale(i) + ',80%,75%)'; 
      });

});