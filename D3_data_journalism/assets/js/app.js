    // Empty SVG area
    // var svgArea = d3.select("body").select("svg");
    // if (!svgArea.empty()) {
    //     svgArea.remove();
    // }

var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 50,
    bottom: 50,
    right: 50,
    left: 50
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
        .domain( [d3.min(popData, d => d[chosenXAxis]) * 0.9,
                  d3.max(popData, d => d[chosenXAxis]) * 1.1
     ] )
        .range([0, width]);

    return xLinearScale;
}

// Function used for updating y-scale var upon click on axis label
function yScale(popData, chosenYAxis) {
    // Create scales
    var yLinearScale = d3.scaleLinear()
        .domain( [d3.min(popData, d => d[chosenYAxis]) * 0.9,
                  d3.max(popData, d => d[chosenYAxis]) * 1.1
     ] )
        .range([height, 0]);

    return yLinearScale;
}

// Function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis, newYScale, yAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
            .duration(1000)
            .call(leftAxis);
    
    return (xAxis, yAxis);
    
    
}

// Function used for updating yAxis var upon click on axis label
// function renderYAxis(newYScale, yAxis) {
//     var leftAxis = d3.axisLeft(newYScale);

//     yAxis.transition()
//         .duration(1000)
//         .call(leftAxis);

//     return yAxis;
// }

// Function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}

function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    var label;
    var yLabel;

    if (chosenXAxis === "poverty") {
        label = "Poverty:";
    }
    else if (chosenXAxis === "age") {
        label = "Age:";
    }
    else  {
        label = "Income:";
    }

    if (chosenYAxis === "healthcare") {
        yLabel = "Healthcare:"
    }
    else {
        yLabel = "Smokes:";
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .html(function(d) {
            return(`${d.state}<br>${label} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
        });

    circlesGroup.call(toolTip);

    // Create event listeners to display & hide the tool tip
    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });

    return circlesGroup;
}

d3.csv("assets/data/data.csv").then(function(popData, err) {
    if (err) throw err;
    
    // Convert strings into numbers
    popData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.age = +data.age;
        data.income = +data.income;
        data.smokes = +data.smokes;
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(popData, chosenXAxis);

    var yLinearScale = yScale(popData, chosenYAxis);

    // Create initial axis function
    var bottomAxis = d3.axisBottom(xLinearScale);//.ticks(7);
    var leftAxis = d3.axisLeft(yLinearScale);//.ticks(11);

    // Append x-axis  
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // Append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(popData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", "15")
        .attr("class", "stateCircle stateText")
        .attr("opacity", ".5");
        // .attr("text", function(d) {
        //     return(`${d.abbr}`);
        // })
        // .html(function(d) {
        //     return(`${d.abbr}`);
        // });

    // Create group for 3 x-axis labels
    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + margin.top})`);

    var povertyLabel = labelsGroup.append("text")
        .attr("class", "aText active")
        .attr("x", 0)
        .attr("y", -20)
        .attr("value", "poverty") // value to grab for event listener
        .text("In Poverty (%)");

    var ageLabel = labelsGroup.append("text")
        .attr("class", "aText inactive")
        .attr("x", 0)
        .attr("y", 0)
        .attr("value", "age") // value to grab for event listener
        .text("Age (Median)");

    var incomeLabel = labelsGroup.append("text")
        .attr("class", "aText inactive")
        .attr("x", 150)
        .attr("y", 0)
        .attr("value", "income") // value to grab for event listener
        .text("Household Income (Median");

    // Append y-axis 
    var yAxis = chartGroup.append("g")
        .call(leftAxis);
    
    // Create group for 2 y-axis labels
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");

    var hcLabel = yLabelsGroup.append("text")
        .attr("class", "aText active")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "healthcare") // value to grab for event listener
        .text("Lacks Healthcare (%)");

    var smokesLabel = yLabelsGroup.append("text")
        .attr("class", "aText inactive")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "2em")
        .attr("value", "smokes") // value to grab for event listener
        .text("Smokes (%)");
     
    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // X-axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function() {
            // Get values of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

                // Replaces chosenXAxis with value
                chosenXAxis = value;

                // function found above csv import
                // Update x scale for new data
                xLinearScale = xScale(popData, chosenXAxis);

                // Update x-axis with transition
                xAxis = renderAxes(xLinearScale, xAxis);

                // Update circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
            
                // Update toolTips with new info
                circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }                                
            }
        });
        
    // Y-axis labels event listener
    yLabelsGroup.selectAll("text")
        .on("click", function() {
            // Get values of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {

                // Replaces chosenYAxis with value
                chosenYAxis = value;

                // function found above csv import
                // Update y scale for new data
                yLinearScale = yScale(popData, chosenYAxis);

                // Update x-axis with transition
                yAxis = renderAxes(yLinearScale, yAxis);

                // Update circles with new y values
                circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);
            
                // Update toolTips with new info
                circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

                if (chosenYAxis === "healthcare") {
                    hcLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                
                else {
                    hcLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }                                
            }
        });        
    }).catch(function(error) {
        console.log(error);
      });

 

