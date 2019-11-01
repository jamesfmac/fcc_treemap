// set the dimensions and margins of the graph
var margin = { top: 60, right: 30, bottom: 30, left: 30 },
  width = 1300,
  height = 1300;

let kickstarter = {};
let movies = {};
let games = {};

// append the svg object to the body of the page
const svg = d3
  .select("#container")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("id", "chart")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function getMeasurements(el) {
  const rect = document.getElementById(el).getBoundingClientRect();

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

const drawChart = data => {
  const title = data.name;
  const desc = "Top 100 Most Sold Video Games Grouped by Platform";

  //get a list of the groupings

  const parents = data.children.map(child => child.name);

  console.log(parents);

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
    .attr("fill", "grey")
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
    .attr("fill", "grey")
    .style("text-anchor", "center")
    .attr(
      "transform",
      `translate(${(width - getMeasurements("description").width) / 2 -
        margin.left * 2},35)`
    );

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
    });

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
    .attr("font-size", "11px")
    .attr("fill", "white")
    .call(wrap, 66);

  //

  //attach the legend

  // attach the tooltip

  const tooltip = d3
    .select("#chart")
    .append("div")
    .attr("class", "tooltip")
    .attr("id", "tooltip")

    .style("opacity", 0);

  // mouse handlers
  /*

    const handleMouseOver = function(d, i) {
      const eduData = edu.find(o => o.fips === d.id);

      d3.select(this)
        .transition()
        .duration("0")
        .attr("opacity", ".85")
        .attr("fill", "grey");

      tooltip
        .transition("0")
        .style("opacity", "0.9")
        .style("left", event.clientX + 20 + "px")
        .style("top", event.clientY - 30 + "px")
        .attr("data-education", eduData.bachelorsOrHigher);
      tooltip.html(
        `${eduData.area_name}, ${eduData.state} <br/> ${eduData.bachelorsOrHigher}`
      );
    };

    const handleMouseOut = function(d, i) {
      d3.select(this)
        .transition()
        .duration("")
        .attr("opacity", "1")
        .attr("fill", d =>
          color(edu.find(o => o.fips === d.id).bachelorsOrHigher)
        );
      tooltip.transition("0").style("opacity", 0);
    };
    */

  // Add one rect in the legend for each name.
  const legend = svg.append("g").attr("id", "legend")  .attr(
    "transform",
    `translate(${(width - getMeasurements("legend").width) / 2 -
      margin.left*3},35)`
  );

  legend
    .append("g")
    .attr("id", "legend-keys")
    .selectAll("rect")
    .data(parents)
    .enter()
    .append("rect")
    .attr("class", "legend-item")
    .attr("x", (d, i) => {
      return  Math.floor(i / 6) * 100;
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
      return 20 + Math.floor(i / 6) * 100;
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
        "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json"
      ).then(response => response.json()),
      fetch(
        "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json"
      ).then(response => response.json()),
      fetch(
        "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json"
      ).then(response => response.json())
    ]);
    //save data globally
    kickstarter = kickstarterData;
    movies = moviesData;
    games = gameData;
    //drawchart with default
    drawChart(games);
  } catch (err) {
    console.log(err);
  }
})();
