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

var width = 600;
var height = 530;

// create svg element
var svg = d3.select('#map')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

$('#guess-ui').hide();

// GRAB GEOJSON AND GET CRACKING

d3.json("../assets/bklyn.geojson", function(error, json) {
  var hoods_data = json.features;
  // remove jamaica bay and marine-park for v1.0
  var filteredHoodsData = hoods_data.filter(function(hood) {
    return (hood.properties.neighborhood != 'Jamaica Bay') && (hood.properties.neighborhood != 'Marine Park')
  });
  hoods_data = filteredHoodsData;
  
  var hslScale = d3.scale.linear()
                 .domain([0, hoods_data.length])
                 .range([30, 60])

  // find centroid of geojson
  // create first guess for projection position
  var center = d3.geo.centroid(json)
  var scale = 220 * width;
  var offset = [ width / 2 - 600, height / 2 + 500 ];  
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
      // .append('g').attr('class', function(d) {
      //   return hoodToClassName(d.properties.neighborhood);
      // })
      .append('path')
      .attr('class', function(d) {
        return 'hood ' + hoodToClassName(d.properties.neighborhood);
      })
      .attr('d', path)
      .attr('stroke', 'darkblue')
      .attr('stroke-width','1')
      .attr('fill', function(d,i) { 
        return 'hsl(' + hslScale(i) + ',70%,80%)'; 
      })
      .attr('data-basecolor', function(d,i) { 
        return 'hsl(' + hslScale(i) + ',70%,80%)'; 
      })
      .attr('data-hoodname', function(d) {
        return d.properties.neighborhood;
      });


  // Greenify the free spaces
  var greenery = 'hsl(80, 80%, 80%)';
  d3.selectAll('.jamaica-bay').attr('data-basecolor', greenery).attr('fill', greenery)
  d3.selectAll('.marine-park').attr('data-basecolor', greenery).attr('fill', greenery)
  d3.select('.prospect-park').attr('data-basecolor', greenery).attr('fill', greenery)
  d3.select('.green-wood-cemetery').attr('data-basecolor', greenery).attr('fill', greenery)
  d3.select('.floyd-bennett-field').attr('data-basecolor', greenery).attr('fill', greenery)
  // hoods # 34-49 are all Jamaica Bay
  // hoods # 52-54 are all Marine Park
  // hood # 32 is Green-Wood Cemetery
  // hood # 61 is Prospect Park


  // Initialize hood quiz list
  var hoodQuizNames = [];
  d3.selectAll('.hood').each(function(p) {
    currentName = p.properties.neighborhood
    if ( hoodQuizNames.indexOf(currentName) == -1 ) {
      hoodQuizNames.push(currentName)
    } 
  });

  var remainingNames = hoodQuizNames;
  // Initalize remaining names array before main game loop
  var remainingClasses = hoodQuizNames.map(function(name) {
    return hoodToClassName(name);
  }); 

  // ------------------------------------------------------------
  // START GAME
  // ------------------------------------------------------------

  playRound();



  function playRound () {

    // select random hood for quiz
    var currentQuizName = selectRandomHood(remainingNames);
    var currentQuizClass = hoodToClassName(currentQuizName);

    // fill current quiz path with yellow
    // setPathToColor(currentQuizClass, 'yellow');

    // display guess UI
    $('#guess-ui').show();
    $('#guess-ui').empty().text("Find:  " + currentQuizName)
    var currentGuess = '';

    // listen for user to submit guess by clicking a hood
    d3.selectAll('.hood').on('click', checkGuess)

    function checkGuess() {
      var guessedName = d3.select(this).attr('data-hoodname');
      var guessedClass = hoodToClassName(guessedName)
      if ( guessedClass == currentQuizClass ) {
        console.log('correct guess!');
        setPathToColor(currentQuizClass, 'lime');

      } else {
        console.log('incorrect, dude');
        setPathToColor(currentQuizClass, 'red');

      }

      // remove guessed hood from hood list array
      var hoodIndex = remainingNames.indexOf(currentQuizName);  
        if (hoodIndex !== -1) {
          remainingNames.splice(hoodIndex, 1);
        }
      console.log(remainingNames)
      console.log(remainingNames.length)
      
      if (remainingNames.length > 0) {
        playRound();
      
      } else {
        alert('Game Over')
        hoods.on('click', null);
      }




    }
  }  

  // display form for user input of guess
  // CREATE TOOL TIP?

  // MOUSE EVENTS
  // hoods.on('click', hoodClick);
  // hoods.on('mouseover', hoodMouseover);
  // hoods.on('mouseenter', hoodMouseenter);
  // hoods.on('mouseleave', hoodMouseleave);


}); // END OF MAIN FUNCTION ############################################







// HELPER FUNCTIONS ====================================================

function setPathToColor(pathClass, color) {
  d3.select('.' + pathClass).attr('fill', color);

}

function hoodToClassName (hoodName) {
  var hoodNameArray = hoodName.split(' ');
  var lowercaseArray = [];
  for (var i = 0; i < hoodNameArray.length; i++) {
    lowercaseArray.push(hoodNameArray[i].toLowerCase());
  }
  return lowercaseArray.join('-');
}


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
  var current = d3.select(this);
  var currentFill = current.attr('fill');
  var current = d3.select(this)
      .transition()
      .duration(100)
      .attr('fill','yellow')
      .transition()
      .duration(500)
      .attr('fill', currentFill)   
};

function hoodMouseleave() {
  d3.select(this)
      .transition()
      .duration(500)
      .attr('fill','steelblue')
}

function selectRandomHood(remainingNames) {
  randNum = Math.floor(Math.random() * remainingNames.length)
  return remainingNames[randNum];
}




