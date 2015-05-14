var width = 1100;
var height = 750;
var gameResults = {};
var hitAmt = 20;
var missAmt = -5;
// create svg element
var svg = d3.select('#nyc-map')
            .append('svg')
            .classed('nyc', true)
            .attr('width', width)
            .attr('height', height);

// GRAB GEOJSON AND ADD PATH ELEMENTS TO DOM
d3.json("../assets/nyc.geojson", function(error, json) {
  var totalPoints = 0;

  var nyc_data = json.features;
  // Parse NYC data into separate boroughs
  var manhattan_data = nyc_data.filter(function (hood) {
    return ( hood.properties.borough == 'Manhattan' );
  });
  var queens_data = nyc_data.filter(function (hood) {
    return ( hood.properties.borough == 'Queens' );
  });
  var staten_data = nyc_data.filter(function (hood) {
    return ( hood.properties.borough == 'Staten Island');
  });
  var brooklyn_data = nyc_data.filter(function (hood) {
    return ( hood.properties.borough == 'Brooklyn' );
  });
  var bronx_data = nyc_data.filter(function (hood) {
    return ( hood.properties.borough == 'Bronx' );
  });

  var wOffset = 90;
  var hOffset = 270;
  var center = d3.geo.centroid(json)
  var scale = 10 * 10000;
  var offset = [ width / 2 + wOffset, height / 2 - hOffset];  
  var projection = d3.geo.mercator()
      .scale(scale)
      .center(center)
      .translate(offset);
  // create path
  var path = d3.geo.path().projection(projection);
  // create and append hood shapes to SVG element  
  var hoods = d3ifyHoods(nyc_data);
  hoods.on('mouseenter',spaceOut);

  // ---------------------------------------------------------------------------
  // BOROUGH MENU
  // ---------------------------------------------------------------------------
  var menu_data = ['Manhattan','Brooklyn','Queens','Bronx','Staten Island'];
  var menu = d3.select('#nyc-menu');
  var boroMenu = menu.selectAll('p')
      .data(menu_data)
      .enter()
      .append('p').text(function(d) { return d; })
      .attr('class', function(d) { return nameToClass(d); });
  // Listen for click on Boro menu
  boroMenu.on('click', function(d) {
    // Turn off event listeners once clicked
    boroMenu.on('click', null);
    boroMenu.style('display', 'none');
    var menuClass = d3.select(this).attr('class'); 
    d3.selectAll('.tooltip').remove();
    d3.selectAll('path').remove();
    // Create appropriate scales and offsets for boro views
    switch(menuClass) {
      case 'manhattan':
        wOffset = 180;
        hOffset = 230;
        hoodOffset = [ width / 2 + wOffset, height / 2 - hOffset]
        projection.translate(hoodOffset)
        projection.scale(15.4 * 10000);
        var hoods = d3ifyHoods(manhattan_data);
        break;
      case 'brooklyn':
        wOffset = 160;
        hOffset = 725;
        hoodOffset = [ width / 2 + wOffset, height / 2 - hOffset]
        projection.translate(hoodOffset)
        projection.scale(16.5 * 10000);
        var hoods = d3ifyHoods(brooklyn_data);
        break;
      case 'queens':
        wOffset = 0;
        hOffset = 440;
        hoodOffset = [ width / 2 + wOffset, height / 2 - hOffset]
        projection.translate(hoodOffset)
        projection.scale(11.5 * 10000);
        var hoods = d3ifyHoods(queens_data);
        break;
      case 'bronx':
        wOffset = -130;
        hOffset = -60;
        hoodOffset = [ width / 2 + wOffset, height / 2 - hOffset]
        projection.translate(hoodOffset)
        projection.scale(20 * 10000);
        var hoods = d3ifyHoods(bronx_data);
        break;
      case 'staten-island':
        wOffset = 710;
        hOffset = 950;
        hoodOffset = [ width / 2 + wOffset, height / 2 - hOffset]
        projection.translate(hoodOffset)
        projection.scale(16 * 10000);
        var hoods = d3ifyHoods(staten_data);
        break;
    }
    // Initalize remaining names and classes arrays 
    var hoodQuizNames = [];
    d3.selectAll('.hood').each(function(d) {
      currentName = d.properties.neighborhood
      if ( hoodQuizNames.indexOf(currentName) == -1 ) {
        hoodQuizNames.push(currentName);
      } 
    });
    // Learn and Start Game Menu
    createLearnMenu();
    hoods.on('mouseenter', spaceOut);
    // Start Learning Mode
    d3.select('#learn-the-hoods').on('click', function() {
      hoods.on('mouseenter', null);
      turnOnToolTips(); 
      removeLearnMenu();
    });

    // Start Game
    // --------------------------------------------------------------------
    d3.select('#start-game').on('click', function() {
      hoods.on('mouseenter', null);
      turnOffToolTips();
      removeStartMenu();
      removeLearnMenu();

      // Show points menu
      svg.append('text')
          .attr('id', 'total-points')
          .attr('x', 230)
          .attr('y', 500)
          .attr('text-anchor', 'middle')
          .attr('fill', 'gold')
          .style('font-family', 'sans-serif')
          .style('font-size', '100px')
          .text(totalPoints);

      playRound(hoodQuizNames, gameResults);
    });

    function createLearnMenu() {
      var modes = ['Learn the Hoods','Start Game'];
      var menu = d3.select('#nyc-menu');
      menu.selectAll('text')
          .data(modes)
          .enter()
          .append('p')
          .attr('id', function(d) { return nameToClass(d); })
          .attr('class', 'mode-menu')
          .attr('font-size', '21px')
          .attr('fill', 'white')
          .text(function(d) { return d; })
    };

    function removeLearnMenu() {
      d3.selectAll('#learn-the-hoods').remove();
    }

    function removeStartMenu() {
      d3.selectAll('#start-game').remove();
    }

    // Tool Tips
    function turnOffToolTips () {
      d3.selectAll('.hood').on('mouseenter', null);
      d3.selectAll('.hood').on('mouseout', null);
      d3.selectAll('.tooltip').remove();                  
    };

    function turnOnToolTips () {
      var learnHoods = d3.selectAll('.hood')
        .on('mouseenter', function(d) {
          d3.selectAll('.tooltip').remove();
          var centroid = path.centroid(d);
          var enteredHood = d3.select(this);
          enteredHood.attr('fill', 'purple');

          enteredHood.style('transition', 'scale(1.05)')
          svg.append('text')
              .attr('class', 'tooltip')
              .attr('x', centroid[0] - 60)
              .attr('y', centroid[1] - 30)
              .attr('font-family', 'sans-serif')
              .attr('font-size', '22px')
              .attr('fill', 'yellow')            
              .attr('stroke-width', 2)
              .attr('text-anchor', 'middle')
              .text(d.properties.neighborhood);
              
          var rectWidth = 250;
          var rectHeight = 400;
          svg.append('rect')
              .attr('class', 'tooltip')
              .attr('fill', 'darkblue')
              .attr('height', rectHeight)
              .attr('width', rectWidth)
              .attr('x', 60)
              .attr('y', 300)
              .attr('stroke', 'white')
              .attr('stroke-width', 3)
              .attr('opacity', 0.8)
              .attr('fill', 'darkblue');
        })
        .on('mouseout', function() {
          var enteredHood = d3.select(this)
          var basecolor = enteredHood.attr('data-basecolor');
          enteredHood.attr('fill', basecolor);
        });
    };

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
          return ['hood ',
                   nameToClass(d.properties.neighborhood),
                   ' boro-',
                   nameToClass(d.properties.borough)].join('');
        })
        .attr('d', path)
        .attr('stroke', 'cornflowerblue')
        .attr('stroke-width','1')
        .attr('fill', function(d,i) { 
          return 'hsl(' + hslScale(i) + ',65%,65%)'; 
        })
        .attr('data-basecolor', function(d,i) { 
          return 'hsl(' + hslScale(i) + ',65%,65%)'; 
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
  };

  // ---------------------------------------------------------------------
  // PLAY ROUND
  // ---------------------------------------------------------------------
  function playRound(remainingNames, gameResults) {
    var currentQuizName = selectRandomHood(remainingNames);
    var currentQuizClass = nameToClass(currentQuizName);
    // display name of hood to find
    $('#guess-ui').show()
                  .empty();
    $('#main-menu').hide();

    $('<p id="instruction">').appendTo($('#guess-ui'))
            .text('Click on: ')

    d3.select('#guess-ui')
                  .append('p')
                  .attr('class', 'guess-this')
                  .text(currentQuizName)
                  .style('font-size', '50px')
                  .transition()
                  .duration(1200)
                  .style('font-size', '40px');

    // listen for user to submit guess by clicking a hood
    d3.selectAll('.hood').on('click', null)
                         .on('click', checkGuess);

    // CHECK GUESS
    // ---------------------------------------------------------------------
    function checkGuess() {
      // Turn off event listeners
      d3.selectAll('.hood').on('click', null);
      // Name of clicked hood becomes guess
      var clickedHood = d3.select(this);
      var guessedName = clickedHood.attr('data-hoodname');
      var guessedClass = nameToClass(guessedName);
      var correctHood = d3.select('.' + currentQuizClass);
      var center = d3.geo.centroid(json.features[0]);
      
      // Check if guess is correct
      // --------------------------------------------
      if ( guessedClass == currentQuizClass ) {
        // If correct ....
        flashColor(currentQuizClass, 'lime');
        // Increment score results for hood 
        if ( gameResults[currentQuizClass] == undefined ) {
          gameResults[currentQuizClass] = hitAmt;
        } else {
          gameResults[currentQuizClass] += hitAmt;
        }
        // Assign data values to path elements for end-of-game heat map
        var currentScore = parseInt(correctHood.attr('data-score')) || 0;
        correctHood.attr('data-score', function() { return currentScore += hitAmt; });
        // Score Animations
        displayPoints(hitAmt);
        updateTotalPoints(hitAmt);

        // when correct, remove guessed hood from remaining names
        var hoodIndex = remainingNames.indexOf(currentQuizName);  
        if ( hoodIndex !== -1 ) {
          remainingNames.splice(hoodIndex, 1);
        }

      } else {
        // If guess is incorrect ...
        flashColor(currentQuizClass, 'yellow');
        if ( gameResults[currentQuizClass] == undefined ) {
          gameResults[currentQuizClass] = missAmt;
        } else {
          gameResults[currentQuizClass] += missAmt;
        }
        // Score Animations
        displayPoints(missAmt);
        updateTotalPoints(missAmt);

        // Assign data values to path elements for end-of-game heat map
        var currentScore = parseInt(correctHood.attr('data-score')) || 0;
        correctHood.attr('data-score', function() { return currentScore += missAmt; });
      }

      // play more rounds if names remain
      if ( remainingNames.length > 0 ) {        
        playRound(remainingNames, gameResults);

      } else {
        // End game, remove event listeners
        hoods.on('click', null);
        winningDisplay(gameResults);
        // storeGameResults(gameResults);
      }
    }

    function updateTotalPoints(score) {
      totalPoints += score;
      var total = d3.select('#total-points');
      if (totalPoints < 0) {
        total.transition()
             .duration(2000)
             .attr('fill', 'red');
      } else {
        total.transition()
             .duration(2000)
             .attr('fill', 'gold');
      }

      if (score > 0) {
        total.transition()
             .delay(1200)
             .text(totalPoints);
      } else {
        total.text(totalPoints);
      }
    };
  }; 

  function displayPoints(score) {
    var svg = d3.select('svg');
    if ( score > 0 ) {
      score = '+ ' + score;
      svg.append('text')
          .attr('class', 'score')
          .attr('fill', 'gold')
          .attr('x', 190)
          .attr('y', 650)
          .attr('font-size', '0px')
          .attr('opacity', '1.0')
          .attr('text-anchor','middle')
          .text(score)
          .transition()
          .duration(2000)
          .attr('y', 500)
          .attr('opacity', '0.0')
          .attr('font-size', '100px')
    } else if ( score < 0 ) {
      score = '- ' + Math.abs(score);
      svg.append('text')
          .attr('class', 'score')
          .attr('fill', 'red')
          .attr('x', 215)
          .attr('y', 500)
          .attr('opacity', '1.0')
          .attr('font-size', '100px')
          .attr('text-anchor','middle')
          .text(score)
          .transition()
          .duration(1500)
          .attr('y', 750)
          .attr('opacity', '0.0')
          .attr('font-size', '0px')
    }
  };  

});


function winningDisplay(gameResults) {
  var currentPath = d3.selectAll('.hood')
  var currentFill = currentPath.attr('fill');
  d3.select('total-points').transition()
                          .duration(2000)
                          .attr('font-size','200px')
  currentPath.transition()
             .duration(50)
             .attr('fill', 'purple')
             .transition()
             .duration(50)
             .attr('fill', 'orange')
             .transition()
             .duration(50)
             .attr('fill', 'purple')
             .transition()
             .duration(50)
             .attr('fill', 'white')
             .transition()
             .duration(50)
             .attr('fill', 'purple')
             .transition()
             .duration(50)
             .attr('fill', 'orange')
             .transition()
             .duration(50)
             .attr('fill', 'purple')
             .transition()
             .duration(50)
             .attr('fill', 'white')
             .transition()
             .duration(50)
             .attr('fill', 'purple')
             .transition()
             .duration(50)
             .attr('fill', 'orange')
             .transition()
             .duration(50)
             .attr('fill', 'purple')
             .each('end', function() {
                showGameResults(gameResults);
             })
};

function scoreMap(gameResults) {
  var scoreScale = d3.scale.linear()
                    .domain([-5, 0])
                    .range([0, 110]);

  var currentHood = d3.select(this);
  var currentScore = currentHood.attr('data-score');
  currentHood.transition()
              .duration(2000)
              .attr('fill', 'hsl(' + scoreScale(currentScore) + '),100%,50%)')
};

function showGameResults(results) {
  var raw_scores = Object.keys(results)
                         .map(function(key, index) { return results[key]; });
  var sortedRaw = raw_scores.sort(function(a,b){
    if (a > b) { return 1; } 
    else if (a < b) { return -1; } 
    else { return 0; }
  });
  var minimumScore = sortedRaw.shift();
  var maximumScore = sortedRaw.pop();
  var scoreScale = d3.scale.linear()
                     .domain([minimumScore, maximumScore])
                     .range([0,80]);
    
  for (classKey in results) {
    var currentHood = d3.selectAll('.' + classKey);
    var currentScore = currentHood.attr('data-score');
    currentHood.transition()
              .duration(2000)
              .attr('fill', 'hsl(' + scoreScale(currentScore) + '),100%,50%)')
  }
};

function storeGameResults(results) {
  console.log('store game results')
  // AJAX call to retrieve user score

  // Update score base on recent results

  // POST request to update SCORES
};



// HELPER FUNCTIONS =================================================

function wigOut(results) {
  var scaleScale = d3.scale.linear()
                     .domain([0, 1])
                     .range([0.85, 1.15]);

  d3.selectAll('.hood')
    .transition()
    .duration(3000)
    .style('transform', function() {
      return 'scale('+ scaleScale(Math.random()) +')';
    })
    
};

function setPathToColor(pathClass, color) {
  d3.selectAll('.' + pathClass).attr('fill', color);
};

function nameToClass(hoodName) {
  var hoodNameArray = hoodName.split('\'')
                              .join('')
                              .split('.')
                              .join('')
                              .split(',')
                              .join('')
                              .split(' ');
  var lowercaseArray = [];
  for (var i = 0; i < hoodNameArray.length; i++) {
    lowercaseArray.push(hoodNameArray[i].toLowerCase());
  }
  return lowercaseArray.join('-');
};

function selectRandomHood(remainingNames) {
  randNum = Math.floor(Math.random() * remainingNames.length)
  return remainingNames[randNum];
};

//------------------------------
// Aesthetic UI Events
//------------------------------

function spaceOut() {
  var current = d3.select(this);
      current.style('transform', 'scale(1.005)');
  var baseFill = current.attr('data-basecolor');
  var current = d3.select(this)
      .transition()
      .duration(250)
      .attr('fill','yellow')
      .transition()
      .duration(500)
      .attr('fill','orange')
      .transition()
      .duration(750)
      .attr('fill','red')
      .transition()
      .duration(1000)
      .attr('fill','purple')
      .transition()
      .duration(1250)
      .attr('fill','blue')
      .transition()
      .duration(1500)
      .attr('fill','green')
      .transition()
      .duration(1750)
      .attr('fill', baseFill) 
      .transition()
      .duration(1600)
      .style('transform', 'scale(1.0)');  
};

function flashColor(pathClass, color) {
  var currentPath = d3.selectAll('.' + pathClass);
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
             .attr('fill', color)
             .transition()
             .duration(50)
             .attr('fill', 'white')
             .transition()
             .duration(50)
             .attr('fill', color);
};
