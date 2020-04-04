function makeResponsive() {

    // Empty SVG area
    var svgArea = d3.select("body").select("svg");
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    var svgWidth = window.innerWidth;
    var svgHeight = window.innerHeight;
  
    var margin = {
      top: 10,
      bottom: 110,
      right: 150,
      left: 100
    };
  
    var height = svgHeight - margin.top - margin.bottom;
    var width = svgWidth - margin.left - margin.right;

    // Append SVG element to #scatter
    var svg = d3
        .select("#scatter")
        .append("svg")
        .attr("height", svgHeight)
        .attr("width", svgWidth);

    var height = svgHeight - margin.top - margin.bottom;
    var width = svgWidth - margin.left - margin.right;

    // Append group element
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    d3.csv("assets/data/data.csv").then(function(popData) {
        // Convert strings into numbers
        popData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.healthcare = +data.healthcare;
        });

        // Create scales
        var xLinearScale = d3.scaleLinear()
            .domain([8, d3.max(popData, d => d.poverty) * 1.05])
            .range([0, width]);

        var yLinearScale = d3.scaleLinear()
            .domain([4, d3.max(popData, d => d.healthcare) * 1.1])
            .range([height, 0]);

        // Create axes
        var bottomAxis = d3.axisBottom(xLinearScale).ticks(7);
        var leftAxis = d3.axisLeft(yLinearScale).ticks(11);

        // Append axes  
        chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        chartGroup.append("g")
            .call(leftAxis);

        // Create circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(popData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d.poverty))
            .attr("cy", d => yLinearScale(d.healthcare))
            .attr("r", "15")
            .attr("class", "stateCircle stateText")
            .attr("opacity", ".5")
            .attr("text", function(d) {
                return(`${d.abbr}`);
            })
            .html(function(d) {
                return(`${d.abbr}`);
            });

        // Initialize tool tip
        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .html(function(d) {
                return(`${d.state}<br>Poverty: ${d.poverty}%<br>Healthcare: ${d.healthcare}%`);
            });

        // Create tool tip in the chart
        chartGroup.call(toolTip);

        // Create event listeners to display & hide the tool tip
        circlesGroup.on("mouseover", function(data) {
            toolTip.show(data);
        })
            .on("mouseout", function(data, index) {
                toolTip.hide(data);
            });
        
        // Create axes labels
        // X
        chartGroup.append("text")
            .attr("transform", `translate(${width / 2}, ${height + 35})`)
            .attr("class", "aText")
            .text("In Poverty (%)");

        // Y
        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", 0 - (height / 2))
            .attr("y", 0 - margin.left + 40)
            .attr("class", "aText")
            .text("Lacks Healthcare (%)");
    }).catch(function(error) {
        console.log(error);
      });

} 

// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);
