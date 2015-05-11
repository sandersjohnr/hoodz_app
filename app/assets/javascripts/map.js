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

var width = 800;
var height = 700;

// create svg element
var svg = d3.select('#map')
            .append('svg')
            .classed('bklyn', true)
            .attr('width', width)
            .attr('height', height);

// initialize UI to hidden
$('#guess-ui').hide();
$('#nyc-map').hide();

// GRAB GEOJSON AND ADD PATH ELEMENTS TO DOM
d3.json("../assets/bklyn.geojson", function(error, json) {
  var hoods_data = json.features;

  // Remove jamaica bay and marine-park from hoods_data for v1.0
  var filteredHoodsData = hoods_data.filter(function(hood) {
    return (hood.properties.neighborhood != 'Jamaica Bay') && (hood.properties.neighborhood != 'Marine Park')
  });
  // hoods_data = filteredHoodsData;
  
  var hslScale = d3.scale.linear()
                 .domain([0, hoods_data.length])
                 .range([40, 60])

  // find centroid of geojson
  // create first guess for projection position
  var center = d3.geo.centroid(json)
  var scale = 13 * 10000;
  var offset = [ width / 2 - 600, height / 2 + 475 ];  
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
      .attr('class', function(d) {
        return 'hood ' + hoodToClassName(d.properties.neighborhood);
      })
      .attr('d', path)
      .attr('stroke', 'cornflowerblue')
      .attr('stroke-width','1')
      .attr('fill', function(d,i) { 
        return 'hsl(' + hslScale(i) + ',80%,75%)'; 
      })
      .attr('data-basecolor', function(d,i) { 
        return 'hsl(' + hslScale(i) + ',80%,75%)'; 
      })
      .attr('data-hoodname', function(d) {
        return d.properties.neighborhood;
      })
      .attr('data-hoodclass', function(d) {
        return hoodToClassName(d.properties.neighborhood);
      });


  // Greenify the parks
  var greenery = 'hsl(80, 80%, 80%)';
  d3.selectAll('.jamaica-bay').attr('data-basecolor', greenery).attr('fill', greenery)
  d3.selectAll('.marine-park').attr('data-basecolor', greenery).attr('fill', greenery)
  d3.select('.prospect-park').attr('data-basecolor', greenery).attr('fill', greenery)
  d3.select('.green-wood-cemetery').attr('data-basecolor', greenery).attr('fill', greenery)
  d3.select('.floyd-bennett-field').attr('data-basecolor', greenery).attr('fill', greenery)
  // hoods # 34-49 are all Jamaica Bay; hoods # 52-54 are all Marine Park; hood # 32 is Green-Wood Cemetery; hood # 61 is Prospect Park



  // ---------------------------------------------------------------------
  // INITIALIZE HOOD NAMES BEFORE PLAYING ROUND
  // ---------------------------------------------------------------------

  // Initialize hood quiz list; check to make sure only one entry even if 
  // multiple paths exist for one hood
  var hoodQuizNames = [];
    d3.selectAll('.hood').each(function(d) {
      currentName = d.properties.neighborhood
      if ( hoodQuizNames.indexOf(currentName) == -1 ) {
        hoodQuizNames.push(currentName)
      } 
    });
  
  // Initalize remaining names and classes arrays before main game loop
  var remainingNames = hoodQuizNames;
  var remainingClasses = hoodQuizNames.map(function(name) {
    return hoodToClassName(name);
  }); 


  // PLAY ROUND
  // ---------------------------------------------------------------------
  playRound(selectRandomHood(remainingNames));

  function playRound(currentQuizName) {
    
    // TRIES ------ test phase
    // Begin tries
    playerTry(3);
    function playerTry (triesLeft) {
      if (triesLeft > 0) {
        console.log('tries left: ', triesLeft)
        playerTry(triesLeft - 1);
      } else {
        console.log('returning')
        return;
      }
    } //end player try

    // select random hood for quiz
    // var currentQuizName = selectRandomHood(remainingNames);
    var currentQuizClass = hoodToClassName(currentQuizName);

    // display name of hood to find
    $('#guess-ui').show()
                  .empty()
                  .text("Find:  " + currentQuizName)
                  .append('<p id="test">TEST</p>')

    // listen for user to submit guess by clicking a hood
    d3.selectAll('.hood').on('click', checkGuess)
    d3.select('#test').on('click', test);


    // CHECK GUESS
    // ---------------------------------------------------------------------
    function checkGuess() {
      // Turn off event listeners
      console.log('checkGuess fired')
      d3.selectAll('.hood').on('click', null);
      // Name of clicked hood becomes guess
      var clickedHood = d3.select(this)

      var guessedName = clickedHood.attr('data-hoodname');
      var guessedClass = hoodToClassName(guessedName);
      // Is guess correct?
      if ( guessedClass == currentQuizClass ) {
        // console.log('correct guess!');
        flashColor(currentQuizClass, 'lime');
        // when correct, remove guessed hood from hood list array
        var hoodIndex = remainingNames.indexOf(currentQuizName);  
          if (hoodIndex !== -1) {
            remainingNames.splice(hoodIndex, 1);
          }
      } else {
        // console.log('incorrect, dude');
        flashColor(guessedClass, 'yellow');

        // ##### increment missed for current hood
        // ##### how to trigger a post request to database?
      }
      
      if (remainingNames.length > 0) {

        playRound(selectRandomHood(remainingNames));
      
      } else {
        // End game, remove event listeners
        alert('Game Over')
        hoods.on('click', null);
      }

    }
  }  
  // MOUSE EVENTS
  // hoods.on('click', hoodClick);
  // hoods.on('mouseover', hoodMouseover);
  // hoods.on('mouseenter', hoodMouseenter);
  // hoods.on('mouseleave', hoodMouseleave);

}); // END OF GEOJSON FUNCTION ############################################


// HELPER FUNCTIONS ====================================================

function flashColor(pathClass, color) {
  var currentPath = d3.selectAll('.' + pathClass)
  var currentFill = currentPath.attr('fill');
  currentPath.transition()
             .duration(50)
             .attr('fill', color)
             .transition()
             .duration(50)
             .attr('fill', currentFill)
             .transition()
             .duration(50)
             .attr('fill', color)
             .transition()
             .duration(50)
             .attr('fill', currentFill)
             .transition()
             .duration(50)
             .attr('fill', color)

}

function setPathToColor(pathClass, color) {
  d3.selectAll('.' + pathClass).attr('fill', color);
}

function hoodToClassName (hoodName) {
  var hoodNameArray = hoodName.split(' ');
  var lowercaseArray = [];
  for (var i = 0; i < hoodNameArray.length; i++) {
    lowercaseArray.push(hoodNameArray[i].toLowerCase());
  }
  return lowercaseArray.join('-');
}

function selectRandomHood(remainingNames) {
  randNum = Math.floor(Math.random() * remainingNames.length)
  return remainingNames[randNum];
}

// Aesthetic UI selection events
//------------------------------
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

