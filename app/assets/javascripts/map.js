// D3 Code goes here

// $.ajax({
//   type: "GET",
//   contentType: "application/json; charset=utf-8",
//   url: 'map/data',
//   dataType: 'json',
//   success: function (data) {
//     drawMap(data);
//   },
//   error: function (result) {
//     error();
//   }
// });


  
  var width = 1000;
  var height = 800;

  //create svg element
  var svg = d3.select('#map')
              .append('svg')
              .attr('width', width)
              .attr('height', height);

  d3.json("../assets/bklyn.geojson", function(error, json) {
    // console.log(json.features);
    hoods_data = json.features;

    var hslScale = d3.scale.linear()
                   .domain([0, hoods_data.length])
                   .range([100, 300])

    // find centroid of geojson
    // create first guess for projection position
    var center = d3.geo.centroid(json)
    var scale = 130 * width;
    var offset = [ width/2 - 750, height/2 + 350];
    var projection = d3.geo.mercator()
        .scale(scale)
        .center(center)
        .translate(offset);

    // create path
    var path = d3.geo.path().projection(projection);

    // create and append hood shapes to SVG element
    var hoods = svg.selectAll('path')
        .data(hoods_data)
        .enter()
        .append('path')
        .attr('class', 'hood')
          // function(d,i) { 
          // if ( d.properties.neighborhood == 'Jamaica Bay' ) {
          //   return 'hood-jb';
          // } else if (d.properties.neighborhood == 'Marine Park' ) {
          //   return 'hood-mp'
          // } else {
          //   return 'hood-' + i; 
          // }
        // })
        .attr('d', path)
        .attr('stroke', 'darkblue')
        .attr('stroke-width','1')
        .attr('fill', function(d,i) { 
          return 'hsl(' + hslScale(i) + ',20%,80%)'; 
        })
        .attr('data-basecolor', function(d,i) { 
          return 'hsl(' + hslScale(i) + ',20%,80%)'; 
        })
        .attr('data-hoodname', function(d) {
          return d.properties.neighborhood;
        })
        .attr('data-boroname', function(d) {
          return d.properties.borough;
        });


    d3.selectAll('.hood-jb').attr('fill', 'lightgreen')
    d3.selectAll('.hood-mp').attr('fill', 'lightgreen')
    d3.select('.hood-32').attr('fill', 'lightgreen')
    d3.select('.hood-26').attr('fill', 'lightgreen')
    d3.select('.hood-61').attr('fill', 'lightgreen')

    // hoods # 34-49 are all Jamaica Bay
    // hoods # 52-54 are all Marine Park

    // hood # 32 is Green-Wood Cemetery
    // hood # 61 is Prospect Park

    // 54 total hoods

    var pathArray = d3.selectAll('.hood');
    var hoodnameArray = [];
    pathArray.each(function(p) {
      currentName = p.properties.neighborhood
      if ( hoodnameArray.indexOf(currentName) == -1 ) {
        hoodnameArray.push(currentName)
      } 
    });




    // var quizHood = d3.select('#hood-'+selectRandomHood())


    // console.log(quizHood)





    // MOUSE EVENTS
    hoods.on('click', hoodClick);
    // hoods.on('mouseover', hoodMouseover);
    // hoods.on('mouseleave', hoodMouseleave);
  

  }); // END OF MAIN FUNCTION


  function hoodClick() {
    var clickedHood = d3.select(this);

    var isWrong = clickedHood.classed('wrong-guess')
    if (!isWrong) {
      clickedHood
        .classed('wrong-guess', true)
        .transition()
        .duration(500)
        .attr('fill', 'red')
    } else {
      var basecolor = clickedHood.attr('data-basecolor');
      clickedHood
        .classed('wrong-guess', false)
        .transition()
        .duration(500)
        .attr('fill', basecolor)
    }
  };

  function hoodMouseover() {
    var current = d3.select(this)
        .transition()
        .duration(250)
        .attr('fill','yellow')
        .transition()
        .duration(500)
        // .attr('fill', 'steelblue')   
  };

  function hoodMouseleave() {
    d3.select(this)
        .transition()
        .duration(500)
        .attr('fill','steelblue')
  }
  
  function selectRandomHood() {
    randNum = Math.floor(Math.random() * hoods_data.length)
    return randNum;
  }





// function draw(data) {
  
//   var color = d3.scale.category20b();
//   var width = 420,
//       barHeight = 20;

//   var x = d3.scale.linear()
//       .range([0, width])
//       .domain([0, d3.max(data)]);

//   var chart = d3.select("#map")
//       .append('svg')
//       .attr("width", width)
//       .attr("height", barHeight * data.length);

//   var bar = chart.selectAll("g")
//       .data(data)
//       .enter().append("g")
//       .attr("transform", function (d, i) {
//         return "translate(0," + i * barHeight + ")";
//       });

//   bar.append("rect")
//       .attr("width", x)
//       .attr("height", barHeight - 1)
//       .style("fill", function (d) {
//         return color(d)
//       })

//   bar.append("text")
//       .attr("x", function (d) {
//         return x(d) - 10;
//        })
//       .attr("y", barHeight / 2)
//       .attr("dy", ".35em")
//       .style("fill", "white")
//       .text(function (d) {
//         return d;
//       });
// }
 
// function error() {
//     console.log("error")
// }