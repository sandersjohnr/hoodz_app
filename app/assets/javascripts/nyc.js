// SVG dimensions
var width = 800;
var height = 750;

// create svg element
var svg = d3.select('#nyc-map')
            .append('svg')
            .classed('nyc', true)
            .attr('width', width)
            .attr('height', height);

// GRAB GEOJSON AND ADD PATH ELEMENTS TO DOM
d3.json("../assets/nyc.geojson", function(error, json) {
  var nyc_data = json.features;
  // Parse NYC data into separate boroughs
  var manhattan_data = nyc_data.filter(function (hood) {
    return ( hood.properties.borough == 'Manhattan' );
  });
  var queens_data = nyc_data.filter(function (hood) {
    return ( hood.properties.borough == 'Queens' );
  });
  var staten_data = nyc_data.filter(function(hood) {
    return ( hood.properties.borough == 'Staten Island');
  });
  var brooklyn_data = nyc_data.filter(function (hood) {
    return ( hood.properties.borough == 'Brooklyn');
  });
  var bronx_data = nyc_data.filter(function (hood) {
    return ( hood.properties.borough == 'Bronx');
  });

  var wOffset = 40;
  var hOffset = 230;
  // find centroid of geojson for projection position
  var center = d3.geo.centroid(json)
  var scale = 7.2* 10000;
  var offset = [ width / 2 + wOffset, height / 2 - hOffset];  
  var projection = d3.geo.mercator()
      .scale(scale)
      .center(center)
      .translate(offset);

  // create path
  var path = d3.geo.path().projection(projection);

  var hoods = d3ifyHoods(nyc_data, 6.3);
  // create and append hood shapes to SVG element

  

  // BOROUGH MENU
  var menuItems = ['Manhattan','Brooklyn','Queens','Bronx','Staten Island'];

  var menu = d3.select('#nyc-menu');
  var menuItems = menu.selectAll('p')
      .data(menuItems)
      .enter()
      .append('p').text(function(d) { return d; })
      .attr('class', function(d) { return nameToClass(d); });

  menuItems.on('click', function(d) {
    // turn off event listeners once clicked
    menuItems.on('click', null);
    var menuClass = d3.select(this).attr('class'); 
    d3.selectAll('path').remove();

    switch(menuClass) {
      case 'manhattan':
        wOffset = 140;
        hOffset = 230;
        hoodOffset = [ width / 2 + wOffset, height / 2 - hOffset]
        projection.translate(hoodOffset)
        projection.scale(15.4 * 10000);
        var hoods = d3ifyHoods(manhattan_data);
        break;
      case 'brooklyn':
        wOffset = 100;
        hOffset = 725;
        hoodOffset = [ width / 2 + wOffset, height / 2 - hOffset]
        projection.translate(hoodOffset)
        projection.scale(16.5 * 10000);
        var hoods = d3ifyHoods(brooklyn_data);
        break;
      case 'queens':
        wOffset = -130;
        hOffset = 440;
        hoodOffset = [ width / 2 + wOffset, height / 2 - hOffset]
        projection.translate(hoodOffset)
        projection.scale(11.5 * 10000);
        var hoods = d3ifyHoods(queens_data);
        break;
      case 'bronx':
        wOffset = -200;
        hOffset = -50;
        hoodOffset = [ width / 2 + wOffset, height / 2 - hOffset]
        projection.translate(hoodOffset)
        projection.scale(20 * 10000);
        var hoods = d3ifyHoods(bronx_data);
        break;
      case 'staten-island':
        wOffset = 650;
        hOffset = 950;
        hoodOffset = [ width / 2 + wOffset, height / 2 - hOffset]
        projection.translate(hoodOffset)
        projection.scale(16 * 10000);
        var hoods = d3ifyHoods(staten_data);
        break;
    }


    // gotta make the hoods
    // Initalize remaining names and classes arrays before main game loop
    var hoodQuizNames = [];
    d3.selectAll('.hood').each(function(d) {
      currentName = d.properties.neighborhood
      if ( hoodQuizNames.indexOf(currentName) == -1 ) {
        hoodQuizNames.push(currentName);
      } 
    });

    console.log(hoodQuizNames)
    // Start recursive playRound func
    playRound(hoodQuizNames);
  });

  function d3ifyHoods(boro_data) {
    // creating color scheme for main map
    var hslScale = d3.scale.linear()
                   .domain([0, boro_data.length])
                   .range([40, 60]);

    var hoods = svg.selectAll('path')
        .data(boro_data)
        .enter()
        .append('path')
        .attr('class', function(d) {
          return 'hood ' + nameToClass(d.properties.neighborhood) + ' boro-' + nameToClass(d.properties.borough);
        })
        .attr('d', path)
        .attr('stroke', 'cornflowerblue')
        .attr('stroke-width','1')
        .attr('fill', function(d,i) { 
          return 'hsl(' + hslScale(i) + ',65%,70%)'; 
        })
        .attr('data-basecolor', function(d,i) { 
          return 'hsl(' + hslScale(i) + ',65%,70%)'; 
        })
        .attr('data-hoodname', function(d) {
          return d.properties.neighborhood;
        })
        .attr('data-hoodclass', function(d) {
          return nameToClass(d.properties.neighborhood);
        })
        .attr('data-borough', function(d) {
          return d.properties.borough;
        });

    return hoods;
  }

  // ---------------------------------------------------------------------
  // INITIALIZE HOOD NAMES BEFORE PLAYING ROUND
  // ---------------------------------------------------------------------

  // PLAY GAME FUNCTION???

  // Initialize hood quiz list; check to make sure only one entry even if 
  // multiple paths exist for one hood


  // PLAY ROUND
  // ---------------------------------------------------------------------

  function playRound(remainingNames) {
    var currentQuizName = selectRandomHood(remainingNames);
    var currentQuizClass = nameToClass(currentQuizName);

    // TRIES ------ test phase
    // Begin tries
    // playerTry(3);
    // function playerTry (triesLeft) {
    //   if (triesLeft > 0) {
    //     console.log('tries left: ', triesLeft)
    //     playerTry(triesLeft - 1);
    //   } else {
    //     console.log('returning')
    //     return;
    //   }
    // } //end player try

    // display name of hood to find
    $('#guess-ui').show()
                  .empty();

    d3.select('#guess-ui')
                  .append('p')
                  .text('NOW FIND: ')
                  .append('p')
                  .text(currentQuizName)
                  .style('font-size', '80px')
                  .transition()
                  .duration(2000)
                  .attr('top', '-700px')
                  .style('font-size', '30px');

    // listen for user to submit guess by clicking a hood
    d3.selectAll('.hood').on('click', checkGuess);

    // CHECK GUESS
    // ---------------------------------------------------------------------
    function checkGuess() {
      console.log('checkGuess fired')
      // Turn off event listeners
      d3.selectAll('.hood').on('click', null);
      // Name of clicked hood becomes guess
      var clickedHood = d3.select(this)
      var guessedName = clickedHood.attr('data-hoodname');
      var guessedClass = nameToClass(guessedName);
      // Is guess correct?
      // console.log(guessedClass, currentQuizClass)
      if ( guessedClass == currentQuizClass ) {
        flashColor(currentQuizClass, 'lime');
        // when correct, remove guessed hood from hood list array
        var hoodIndex = remainingNames.indexOf(currentQuizName);  
          if (hoodIndex !== -1) {
            remainingNames.splice(hoodIndex, 1);
          }
      } else {
        flashColor(currentQuizClass, 'yellow');
        // ##### increment missed for current hood
        // ##### how to trigger a post request to database?
        // $.post('/path', data: {

        // });
      }
      
      if (remainingNames.length > 0) {
        playRound(remainingNames);
      
      } else {
        // End game, remove event listeners
        alert('Game Over')
        hoods.on('click', null);
      }

    }
  }  
  hoods.on('mouseenter',hoodMouseover);
  // hoods.on('mouseleave',hoodMouseleave);

});
     

// GAME FUNCTION ====================================================

function startBoro() {
  var clickedBoro = d3.select(this);
  console.log(clickedBoro.attr('class'));
  

  // switch -- case for boro selection
}

// HELPER FUNCTIONS =================================================

function flashColor(pathClass, color) {
  var currentPath = d3.selectAll('.' + pathClass)
  var currentFill = currentPath.attr('fill');
  currentPath.transition()
             .duration(50)
             .attr('fill', color)
             .transition()
             .duration(50)
             .attr('fill', 'white')
             .transition()
             .duration(50)
             .attr('fill', color)
             .transition()
             .duration(50)
             .attr('fill', 'white')
             .transition()
             .duration(50)
             .attr('fill', color)
             .transition()
             .duration(50)
             .attr('fill', 'white')
             .transition()
             .duration(50)
             .attr('fill', color)
}

function setPathToColor(pathClass, color) {
  d3.selectAll('.' + pathClass).attr('fill', color);
}

function nameToClass (hoodName) {
  var hoodNameArray = hoodName.split('\'')
                              .join('')
                              .split('.')
                              .join('')
                              .split(' ');
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
  var baseFill = current.attr('data-basecolor');
  var current = d3.select(this)
      .transition()
      .duration(100)
      .attr('fill','yellow')
      .transition()
      .duration(500)
      .attr('fill','orange')
      .transition()
      .duration(1000)
      .attr('fill','red')
      .transition()
      .duration(1500)
      .attr('fill','purple')
      .transition()
      .duration(2000)
      .attr('fill', baseFill)   
};

function hoodMouseleave() {
  d3.select(this)
      .transition()
      .duration(500)
      .attr('fill','steelblue')
}

