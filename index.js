// set the dimensions and margins of the graph
const margin = { top: 60, right: 30, bottom: 30, left: 30 },
  width = 900,
  height = 1300;

const dataSets = [
  {
    id: 1,
    title: "Kickstarter Pledges",
    description:
      "Top 100 Most Pledged Kickstarter Campaigns Grouped By Category",
    url:
      "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json",
    data: {}
  },
  {
    id: 2,
    title: "Movie Sales",
    description: "Top 100 Highest Grossing Movies Grouped By Genre",
    url:
      "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json",
    data: {}
  },
  {
    id: 3,
    title: "Videogame Sales",
    description: "Top 100 Most Sold Video Games Grouped by Platform",
    url:
      "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json",
    data: {}
  }
];

// Get the container element
const nav = document.getElementById("nav");

// Get all buttons with class="btn" inside the container
const btns = nav.getElementsByClassName("nav-item");

// Loop through the buttons and add the active class to the current/clicked button
for (var i = 0; i < btns.length; i++) {
  btns[i].addEventListener("click", function() {
    drawChart(this.id);
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

const drawChart = input => {
  let { title, description, data } = dataSets.find(x => x.id == input);

  // remove the previous svg
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
    .attr("fill", "white")
    .style("text-anchor", "center")
    .attr(
      "transform",
      `translate(${(width - getMeasurements("title").width) / 2},0)`
    );

  heading
    .append("text")
    .text(description)
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
      .attr("opacity", "1")
      .style("fill", "lightgrey");

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

  const cell = map
    .selectAll("g")
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("class", "group")
    .attr("transform", function(d) {
      return "translate(" + d.x0 + "," + d.y0 + ")";
    })
  

  cell
    .append("rect")
    .attr("class", "tile")
    .attr("width", d => d.x1 - d.x0)
    .attr("height", d => d.y1 - d.y0)
    .attr("data-name", d => d.data.name)
    .attr("data-value", d => d.data.value)
    .attr("data-category", d => d.data.category)
    .style("stroke", "white")
    .style("fill", d => colorScale(d.data.category))
    .on("mousemove", handleMouseOver)
    .on("mouseout", handleMouseOut);

  // and to add the text labels

  cell
    .append("text")
    .attr("class", "tile-text")
    .selectAll("tspan")
    .data(function(d) {
      return d.data.name.split(/(?=[A-Z][^A-Z])/g);
    })
    .enter()
    .append("tspan")
    .attr("x", 4)
    .attr("y", function(d, i) {
      return 15 + i * 10;
    })
    .text(function(d) {
      return d;
    });

  //attach the legend

  // Add one rect in the legend for each name.
  const legend = svg
    .append("g")
    .attr("id", "legend")
    .attr("transform", `translate(${width / 2 - 165},35)`)
    .attr("class", "legend");

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
    .style("fill", d => colorScale(d));

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

//fetch data and draw initial chart

(async function loadData(dataSets) {
  try {
    let fetchedData = await Promise.all(
      dataSets.map(x => fetch(x.url).then(response => response.json()))
    );
    //attaching the returned data
    dataSets.forEach((x, i) => (x.data = fetchedData[i]));
    //drawchart with default dataset
    drawChart(3);
  } catch (err) {
    console.log(err);
  }
})(dataSets);
