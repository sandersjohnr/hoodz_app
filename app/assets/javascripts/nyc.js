var width = 1100;
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
  var staten_data = nyc_data.filter(function (hood) {
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
  var scale = 7 * 10000;
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

  // BOROUGH MENU
  var menuItems = ['Manhattan','Brooklyn','Queens','Bronx','Staten Island'];
  var menu = d3.select('#nyc-menu');
  var menuItems = menu.selectAll('p')
      .data(menuItems)
      .enter()
      .append('p').text(function(d) { return d; })
      .attr('class', function(d) { return nameToClass(d); });
  // Listen for click on Boro menu
  menuItems.on('click', function(d) {
    // turn off event listeners once clicked
    menuItems.on('click', null);
    menuItems.style('display', 'none');
    var menuClass = d3.select(this).attr('class'); 
    d3.selectAll('.tooltip').remove();
    d3.selectAll('path').remove();

    switch(menuClass) {
      case 'manhattan':
        wOffset = 100;
        hOffset = 230;
        hoodOffset = [ width / 2 + wOffset, height / 2 - hOffset]
        projection.translate(hoodOffset)
        projection.scale(15.4 * 10000);
        var hoods = d3ifyHoods(manhattan_data);
        break;
      case 'brooklyn':
        wOffset = 60;
        hOffset = 725;
        hoodOffset = [ width / 2 + wOffset, height / 2 - hOffset]
        projection.translate(hoodOffset)
        projection.scale(16.5 * 10000);
        var hoods = d3ifyHoods(brooklyn_data);
        break;
      case 'queens':
        wOffset = -90;
        hOffset = 440;
        hoodOffset = [ width / 2 + wOffset, height / 2 - hOffset]
        projection.translate(hoodOffset)
        projection.scale(11.5 * 10000);
        var hoods = d3ifyHoods(queens_data);
        break;
      case 'bronx':
        wOffset = -190;
        hOffset = -50;
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

    // gotta make the hoods
    // Initalize remaining names and classes arrays before main game loop
    var hoodQuizNames = [];
    d3.selectAll('.hood').each(function(d) {
      currentName = d.properties.neighborhood
      if ( hoodQuizNames.indexOf(currentName) == -1 ) {
        hoodQuizNames.push(currentName);
      } 
    });

    // Learn and Start Game Menu
    createLearnMenu();

    function createLearnMenu() {

      var modes = ['Learn','Start Game'];
      var menu = d3.select('#nyc-menu');
      var menuItems = menu.selectAll('text')
          .data(modes)
          .enter()
          .append('p')
          .attr('id', function(d) { return nameToClass(d); })
          .attr('class', 'mode-menu')
          .attr('font-size', '21px')
          .attr('fill', 'white')
          .text(function(d) { return d; })

      // d3.select('svg')
      //   .append('text')
      //   .attr('id', 'learn')
      //   .attr('x', '30px')
      //   .attr('y', '200px')
      //   .text('Learn')
      // d3.select('svg')
      //   .append('text')
      //   .attr('id', 'start-game')
      //   .attr('class', 'mode-menu')
      //   .attr('x', '130px')
      //   .attr('y', '200px')
      //   .attr('font-size', '21px')
      //   .attr('fill', 'white')
      //   .text('Start Game')
    };

    function removeLearnMenu() {
      d3.selectAll('.mode-menu').remove();
    }

    hoods.on('mouseenter', spaceOut);

    d3.select('#learn').on('click', function() { 
      turnOnToolTips(); 
      removeLearnMenu();
    });
      // Start recursive playRound function
    d3.select('#start-game').on('click', function() {
      hoods.on('mouseenter', null)
      turnOffToolTips();
      removeLearnMenu();
      playRound(hoodQuizNames);
    });

    // Tool Tips
    function turnOffToolTips () {
      d3.selectAll('.hood').on('mouseenter', null);
      d3.selectAll('.hood').on('mouseout', null);
    };

    function turnOnToolTips () {
      d3.selectAll('.hood')
        .on('mouseenter', function(d) {
          d3.selectAll('.tooltip').remove();
          var centroid = path.centroid(d);
          var enteredHood = d3.select(this);
          enteredHood.attr('fill', 'orchid');
          var rectWidth = 200;
          var rectHeight = 300;
          svg.append('text')
              .attr('class', 'tooltip shadow')
              .attr('x', centroid[0] - 40)
              .attr('y', centroid[1] - 20)
              .attr('font-family', 'sans-serif')
              .attr('font-size', '22px')
              .attr('fill', 'white')            
              .attr('stroke', 2)
              .attr('text-anchor', 'middle')
              .text(d.properties.neighborhood);
          svg.append('rect')
              .attr('class', 'tooltip')
              .attr('fill', 'darkblue')
              .attr('height', rectHeight)
              .attr('width', rectWidth)
              .attr('x', 30)
              .attr('y', 90)
              .attr('stroke', 'white')
              .attr('stroke-width', 2)
              .attr('opacity', 0.3)
              .attr('fill', 'darkblue')
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
          return 'hood ' + nameToClass(d.properties.neighborhood) + ' boro-' + nameToClass(d.properties.borough);
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

  function playRound(remainingNames) {
    var currentQuizName = selectRandomHood(remainingNames);
    var currentQuizClass = nameToClass(currentQuizName);

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
                  .style('font-size', '40px');

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
      var center = d3.geo.centroid(json)
      var guessedName = clickedHood.attr('data-hoodname');
      var guessedClass = nameToClass(guessedName);
      // Is guess correct?
      if ( guessedClass == currentQuizClass ) {
        flashColor(currentQuizClass, 'lime');
        // when correct, remove guessed hood from hood list array
        var hoodIndex = remainingNames.indexOf(currentQuizName);  
          if (hoodIndex !== -1) {
            remainingNames.splice(hoodIndex, 1);
          }
      } else {
        flashColor(currentQuizClass, 'yellow');
        // ##############################
        // ##### increment missed for current hood
        // ##### how to trigger a post request to database?
        // $.post('/path', data: {
        // });
      }
      
      if (remainingNames.length > 0) {
        playRound(remainingNames);
      
      } else {
        // End game, remove event listeners
        console.log('CONGRATS!');
        hoods.on('click', null);
        winningDisplay();
      }

    }
  }  
  // hoods.on('mouseenter',spaceOut);
  // hoods.on('mouseleave',hoodMouseleave);

});

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
                              .split(',')
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

function spaceOut() {
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

function winningDisplay() {
  var currentPath = d3.selectAll('.hood')
  var currentFill = currentPath.attr('fill');
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
}

