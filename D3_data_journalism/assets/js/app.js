// NOTE: Could not get the graph to be responive, nor could I make the sizing a little more succint and put
// into functions.  After many hours of trying, both solo and with people, decided to manhandle the sizing aspects.
// Something to look into.


var svgWidth = 960;
var svgHeight = 500;
var margin = {
    top: 10,
    bottom: 110,
    right: 5,
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

// Append group element
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial parameters
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// Function used for updating x-scale var upon click on axis label
function xScale(popData, chosenXAxis) {
    // Create scales
    var xLinearScale = d3.scaleLinear()
        .domain( [d3.min(popData, d => d[chosenXAxis]) * 0.85,
                    d3.max(popData, d => d[chosenXAxis]) * 1.1
        ] )
        .range([0, width]);
    return xLinearScale;
}

// Function used for updating y-scale var upon click on yaxis label
function yScale(popData, chosenYAxis) {
    // Create scales
    var yLinearScale = d3.scaleLinear()
        .domain( [d3.min(popData, d => d[chosenYAxis]) * 0.45,
        d3.max(popData, d => d[chosenYAxis]) * 1.1
        ] )
        .range([height, 0]);
    return yLinearScale;
}
// Function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

// Function to update yAxis variable upon click on axis label
function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}

// Function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup;
}

// Function to update circle state text abbreviation
function renderCirclesText(circlesText, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    circlesText.transition()
        .duration(1000)
        .attr("dx", d => newXScale(d[chosenXAxis]))
        .attr("dy", d => newYScale(d[chosenYAxis]) + 5);
    return circlesText;
}

// Function to update the tool tip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    
    var labelX;
    
    if (chosenXAxis === "poverty") {
        labelX = "Poverty:";
    }
    else if (chosenXAxis === "age") {
        labelX = "Age:";
    }
    else {
        labelX = "Income:";
    }
    
    var labelY;
    
    if (chosenYAxis === "healthcare") {
        labelY = "Healthcare:";
    }
    else if (chosenYAxis === "smokes") {
        labelY = "Smokes:";
    }
    else {
        labelY = "Obese:";
    }

    if (chosenXAxis === "poverty") {
        var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .html(function(d) {
            return(`${d.state}<br>${labelX} ${d[chosenXAxis]}%<br>${labelY} ${d[chosenYAxis]}%`);
        });
    }
    else if (chosenXAxis === "age") {
        var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .html(function(d) {
            return(`${d.state}<br>${labelX} ${d[chosenXAxis]}<br>${labelY} ${d[chosenYAxis]}%`);
      });
  }
    else {
        var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .html(function(d) {
            return(`${d.state}<br>${labelX} $${d[chosenXAxis]}<br>${labelY} ${d[chosenYAxis]}%`);
        });
    }
    
    chartGroup.call(toolTip); 
        
    // Create event listeners to display & hide the tool tip
    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data); 
    })
        .on("mouseout", function(data) { 
            toolTip.hide(data);
        });
    
    return circlesGroup;
}

// Retrieve data from csv file
d3.csv("assets/data/data.csv").then(function(popData, err) {
    if (err) throw err;
    // Convert strings into numbers
    popData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.income = +data.income;
        data.smokes = +data.smokes;
        data.obesity = +data.obesity;
    });

    // xLinearScale & yLinearScale
    var xLinearScale = xScale(popData, chosenXAxis);
    var yLinearScale = yScale(popData, chosenYAxis);
    
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
    
    // Append x-axis  
    var xAxis = chartGroup.append("g")  
        .attr("transform", `translate(0, ${height})`)
        .attr("class", "x-axis")                          
        .call(bottomAxis);
        
    // Append y-axis 
    var yAxis = chartGroup.append("g")  
        .call(leftAxis);

    // Need a new group to handle state abbreviation text
    // Will use for both circles themselves and text
    var circleAbbr = chartGroup.append("g")
        
    // Append initial circles
    var circlesGroup = circleAbbr.selectAll("circle") 
        .data(popData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", "15")
        .attr("class", "stateCircle")
        .attr("opacity", ".9");

    var circlesText = circleAbbr.selectAll("text")
        .data(popData)
        .enter()
        .append("text") 
        .attr("dx", d => xLinearScale(d[chosenXAxis]))
        .attr("dy", d => yLinearScale(d[chosenYAxis]) + 5)
        .attr("class", "stateText")  
        .text(function (d) { return d.abbr });
        

    // Add a group with class xText to svg area
    svg.append("g").attr("class", "xText");
    
    // Create xText variable and translate the group
    var xText = d3.select(".xText")
    xText.attr("transform", `translate(${width / 1.55}, ${height})`);
    
    //Poverty x-axis title
    var xLabel1 = xText.append("text")
        .text("In Poverty (%)")
        .attr("y", 50)
        .attr("class", "aText active")
        .attr("value", "poverty"); // value to grab for event listener
    // Age x-axis title
    var xLabel2 = xText.append("text")
        .text("Age (Median)")  
        .attr("y", 75) 
        .attr("class", "aText inactive") 
        .attr("value", "age"); // value for event listener
    // Income x-axis title
    var xLabel3 = xText.append("text")
        .text("Household Income (Median)")  
        .attr("y", 100) 
        .attr("class", "aText inactive")
        .attr("value", "income"); // value for event listener
    
    // Append y-axis group to svg area
    svg.append('g').attr('class','y-axis');
    
    // Translate the group
    var yText = d3.select(".y-axis");
    yText.attr("transform", `translate(${margin.left}, ${margin.top})rotate(-90)`);
    
    // 1st Y-Axis Title
    var yLabel1 = yText.append("text")
        .text("Lacks Healthcare (%)")
        .attr("x", 0 - (height / 2.3))
        .attr("y", -35)
        .attr("value", "healthcare") // value for event listener
        .attr("class", "aText active");    
    // 2rd Y-Axis Title
    var yLabel2 = yText.append("text")
        .text("Smokes (%)")
        .attr("x", 0 - (height / 2.3))
        .attr("y", -60)
        .attr("value", "smokes")  // value for event listener
        .attr("class", "aText inactive");
    // 3nd Y-Axis Title
    var yLabel3 = yText.append("text")
        .text("Obese (%)")
        .attr("x", 0 - (height / 2.3))
        .attr("y", -85)
        .attr("value", "obesity")  // value for event listener
        .attr("class", "aText inactive");

    // update tool tip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
                       // NOTE: order of parameters above matters!!
    
    // X-axis labels event listener
    xText.selectAll("text")
        .on("click", function() {
            // Get values of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {
                // Replaces chosenXAxis with value
                chosenXAxis = value;
                // Update x scale for new data
                xLinearScale = xScale(popData, chosenXAxis);
                // Update x-axis with transition
                xAxis = renderXAxis(xLinearScale, xAxis);
                // Update circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                circlesText = renderCirclesText(circlesText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                // Update toolTips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
                // Change active text to bold
                if (chosenXAxis === "poverty") {
                    xLabel1
                        .classed("active", true)
                        .classed("inactive", false);
                    xLabel2
                        .classed("active", false)
                        .classed("inactive", true);
                    xLabel3
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "age") {
                    xLabel1
                        .classed("active", false)
                        .classed("inactive", true);
                    xLabel2
                        .classed("active", true)
                        .classed("inactive", false);
                    xLabel3
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    xLabel1
                        .classed("active", false)
                        .classed("inactive", true);
                    xLabel2
                        .classed("active", false)
                        .classed("inactive", true);
                    xLabel3
                        .classed("active", true)
                        .classed("inactive", false);
                }                                
            }
        });
    
    // Y-axis labels event listener
    yText.selectAll("text")
        .on("click", function() {
            // Get values of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {
                // Replaces chosenXAxis with value
                chosenYAxis = value;
                // Update x scale for new data
                yLinearScale = yScale(popData, chosenYAxis);
                // Update x-axis with transition
                yAxis = renderYAxis(yLinearScale, yAxis);
                // Update circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                circlesText = renderCirclesText(circlesText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);
                // Update toolTips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
                // Change active text to bold
                if (chosenYAxis === "healthcare") {
                    yLabel1
                        .classed("active", true)
                        .classed("inactive", false);
                    yLabel2
                        .classed("active", false)
                        .classed("inactive", true);
                    yLabel3
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "smokes") {
                    yLabel1
                        .classed("active", false)
                        .classed("inactive", true);
                    yLabel2
                        .classed("active", true)
                        .classed("inactive", false);
                    yLabel3
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    yLabel1
                        .classed("active", false)
                        .classed("inactive", true);
                    yLabel2
                        .classed("active", false)
                        .classed("inactive", true);
                    yLabel3
                        .classed("active", true)
                        .classed("inactive", false);
                }                                
            }
        });
    }).catch(function(error) {
        console.log(error);
        });
