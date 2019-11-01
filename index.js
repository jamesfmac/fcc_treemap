// set the dimensions and margins of the graph
var margin = { top: 60, right: 30, bottom: 30, left: 30 },
  width = 900,
  height = 1300;

const dataSets = {
  kickstarter: {
    title: "Kickstarter Pledges",
    description: "Top 100 Most Pledged Kickstarter Campaigns Grouped By Category",
    url:
      "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json",
    data: {}
  },
  movies: {
    title: "Movie Sales",
    description: "Top 100 Highest Grossing Movies Grouped By Genre",
    url:
      "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json",
    data: {}
  },
  games: {
    title: "Videogame Sales",
    description: "Top 100 Most Sold Video Games Grouped by Platform",
    url:
      "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json",
    data: {}
  },
};

// Get the container element
var nav = document.getElementById("nav");

// Get all buttons with class="btn" inside the container
var btns = nav.getElementsByClassName("nav-item");

// Loop through the buttons and add the active class to the current/clicked button
for (var i = 0; i < btns.length; i++) {
  btns[i].addEventListener("click", function() {
    console.log(this.id);
    console.log(movies);
    drawChart(dataSets[this.id]);
    var current = document.getElementsByClassName("active");
    current[0].className = current[0].className.replace(" active", "");
    this.className += " active";
  });
}

//function to get width of an element
function getMeasurements(el) {
  const rect = document.getElementById(el).getBBox();
  return rect;
}

//function to wrap text
function wrap(text, width) {
  console.log(text, "text");
  text.each(function() {
    var text = d3.select(this),
      words = text
        .text()
        .split(/(?=[A-Z][^A-Z])/g)
        .reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1, // ems
      y = text.attr("y"),
      dy = parseFloat(text.attr("dy")),
      tspan = text
        .text(null)
        .append("tspan")
        .attr("x", text.attr("x"))
        .attr("y", y)
        .attr("dy", dy + "em");
    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text
          .append("tspan")
          .attr("x", text.attr("x"))
          .attr("y", y)
          .attr("dy", ++lineNumber * lineHeight + dy + "em")
          .text(word);
      }
    }
  });
}

const drawChart = input => {

  let data = input.data
  let set = input


  d3.select("svg").remove();
  // append the svg object to the body of the page
  const svg = d3
    .select("#container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("id", "chart")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  console.log(data);
  let title = set.title;
  const desc = set.description

  //get a list of the groupings
  const parents = data.children.map(child => child.name);

  //set up the scales
  var colorScale = d3
    .scaleOrdinal()
    .domain(parents)
    .range(d3.schemeSet2);

  //attach heading and title
  const heading = svg.append("g").attr("id", "Heading");

  heading
    .append("text")
    .text(title)
    .attr("id", "title")
    .attr("font-family", "sans-serif")
    .attr("font-size", "40px")
    .attr("fill", "white")
    .style("text-anchor", "center")
    .attr(
      "transform",
      `translate(${(width - getMeasurements("title").width) / 2},0)`
    );

  heading
    .append("text")
    .text(desc)
    .attr("id", "description")
    .attr("font-family", "sans-serif")
    .attr("font-size", "16px")
    .attr("fill", "white")
    .style("text-anchor", "center")
    .attr(
      "transform",
      `translate(${(width - getMeasurements("description").width) / 2},35)`
    );

  //attach the tooltip
  const tooltip = d3
    .select("#container")
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "tooltip")
    .style("opacity", 0);

  // Functions for mouse handlers
  const handleMouseOver = function(d, i) {
    d3.select(this)
      .transition()
      .duration("0")
      .attr("opacity", ".85")
      .attr("fill", "grey");

    tooltip

      .style("opacity", "0.9")
      .style("left", event.clientX + 20 + "px")
      .style("top", event.clientY - 20 + "px")
      .attr("data-value", d.data.value);

    tooltip.html(
      `Name: ${d.data.name}<br/>Category: ${d.data.category} <br/>Value:${d.data.value}`
    );
  };

  const handleMouseOut = function(d, i) {
    d3.select(this)
      .transition()
      .duration("")
      .attr("opacity", "1")
      .style("fill", function(d) {
        return colorScale(d.data.category);
      });
    tooltip.style("opacity", 0);
  };

  // Give the data to this cluster layout:

  const root = d3
    .hierarchy(data)
    .eachBefore(function(d) {
      d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;
    })
    .sum(d => d.value)
    .sort(function(a, b) {
      return b.height - a.height || b.value - a.value;
    });

  // Then d3.treemap computes the position of each element of the hierarchy
  d3
    .treemap()
    .size([width, height - 600])
    .padding(0)(root);

  // use this information to add rectangles:
  const map = svg
    .append("g")
    .attr("id", "Map")
    .attr("transform", "translate( 0," + margin.top + ")");

  map
    .selectAll("rect")
    .data(root.leaves())
    .enter()
    .append("rect")

    .attr("x", function(d) {
      return d.x0;
    })
    .attr("y", function(d) {
      return d.y0;
    })
    .attr("class", "tile")
    .attr("data-name", d => d.data.name)
    .attr("data-value", d => d.data.value)
    .attr("data-category", d => d.data.category)

    .attr("width", function(d) {
      return d.x1 - d.x0;
    })
    .attr("height", function(d) {
      return d.y1 - d.y0;
    })
    .style("stroke", "white")
    .style("fill", function(d) {
      return colorScale(d.data.category);
    })
    .on("mousemove", handleMouseOver)
    .on("mouseout", handleMouseOut);

  // and to add the text labels

  svg
    .append("g")
    .attr("id", "map-labels")
    .selectAll("text")
    .data(root.leaves())
    .enter()
    .append("text")
    .attr("transform", "translate( 0," + margin.top + ")")
    .attr("x", function(d) {
      return d.x0 + 5;
    }) // +10 to adjust position (more right)
    .attr("y", function(d) {
      return d.y0 + 5;
    }) // +20 to adjust position (lower)
    .attr("dy", ".75em")
    .text(function(d) {
      return d.data.name;
    })
    .attr("font-size", "10px")
    .attr("fill", "black")
    .call(wrap, 50);

  //

  //attach the legend

  // Add one rect in the legend for each name.
  const legend = svg
    .append("g")
    .attr("id", "legend")
    .attr("transform", `translate(${width / 2 - 165},35)`)
    .attr("class", () => {
      console.log(getMeasurements("legend"));
      return "blah";
    });

  legend
    .append("g")
    .attr("id", "legend-keys")
    .selectAll("rect")
    .data(parents)
    .enter()
    .append("rect")
    .attr("class", "legend-item")
    .attr("x", (d, i) => {
      return Math.floor(i / 6) * 150;
    })
    .attr("y", function(d, i) {
      return 750 + i * 25 - Math.floor(i / 6) * 150;
    })
    .attr("width", 12)
    .attr("height", 12)
    .style("fill", function(d) {
      return colorScale(d);
    });

  // Add labels to each rect
  legend
    .append("g")
    .attr("id", "legend-labels")
    .selectAll("text")
    .data(parents)
    .enter()
    .append("text")
    .attr("x", (d, i) => {
      return 20 + Math.floor(i / 6) * 150;
    })
    .attr("y", function(d, i) {
      return 750 + i * 25 - Math.floor(i / 6) * 150;
    })
    .style("fill", function(d) {
      return colorScale(d);
    })
    .text(function(d) {
      return d;
    })
    .attr("text-anchor", "left")
    .attr("dominant-baseline", "hanging");
};

//fetch data and draw chart
(async function main() {
  try {
    let [kickstarterData, moviesData, gameData] = await Promise.all([
      fetch(
        dataSets.kickstarter.url
      ).then(response => response.json()),
      fetch(
        dataSets.movies.url
      ).then(response => response.json()),
      fetch(
        dataSets.games.url
      ).then(response => response.json())
    ]);
    //save data globally
    dataSets.kickstarter.data = kickstarterData;
    dataSets.movies.data = moviesData;
    dataSets.games.data = gameData;
    //drawchart with default
    drawChart(dataSets.games);
  } catch (err) {
    console.log(err);
  }
})();
