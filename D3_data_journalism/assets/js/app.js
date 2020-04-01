// var width = parseInt(d3.select("#scatter").style("width"));
// var height = width - width / 3.9;
// var margin = 20;
// var labelArea = 110;
// var tPadBot = 40;
// var tPadLeft = 40;
// var svg = d3
//     .select("#scatter")
//     .append("svg")
//     .attr("width", width)
//     .attr("height", height)
//     .attr("class", "chart")
//     .style("background", "blue")
// var height = svgHeight - margin.top - margin.bottom;
// var width = svgWidth - margin.left - margin.right;
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
// Function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}
// Function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));
    return circlesGroup;
}
function updateToolTip(chosenXAxis, circlesGroup) {
    var label;
    if (chosenXAxis === "poverty") {
        label = "Poverty:";
    }
    else if (chosenXAxis === "age") {
        label = "Age:";
    }
    else {
        label = "Income:";
    }
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .html(function(d) {
            return(`${d.state}<br>${label} ${d[chosenXAxis]}<br>Healthcare: ${d.healthcare}`);
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
        data.obesity = +data.obesity;
    });
    // xScale function above csv import
    var xLinearScale = xScale(popData, chosenXAxis);
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(popData, d => d.healthcare) * 1.1])
        .range([height, 0]);
    // Create initial axis function
    var bottomAxis = d3.axisBottom(xLinearScale);//.ticks(7);
    var leftAxis = d3.axisLeft(yLinearScale);//.ticks(11);
    // Append x-axis  
    var xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    // Append y-axis 
    chartGroup.append("g")
        .call(leftAxis);
    // Append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(popData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", "15")
        .attr("class", "stateCircle stateText")
        .attr("opacity", ".5");
        // .attr("text", function(d) {
        //     return(`${d.abbr}`);
        // })
        // .html(function(d) {
        //     return(`${d.abbr}`);
        // });
    
    // Add a group with class xText to svg area
    svg.append("g").attr("class", "xText");
    
    // Create xText variable and translate the group
    var xText = d3.select(".xText")
    xText.attr("transform", `translate(${width / 2}, ${height + margin.top})`);
    // function xTextRefresh() {
    //     xText.attr("transform", `translate(${width / 2}, ${height + margin.top})`);
    // }
    // xTextRefresh();
    
    //Poverty x-axis title
    var xLabel1 = xText.append("text")
        .text("In Poverty (%)")
        .attr("x", 0)
        .attr("y", -20)
        .attr("class", "aText active")
        .attr("value", "poverty"); // value to grab for event listener
    
    // Age x-axis title
    var xLabel2 = xText.append("text")
        .text("Age (Median)")  
        .attr("x", 0)
        .attr("y", 0) 
        .attr("class", "aText inactive")
        .attr("value", "age"); 
    
    // Income x-axis title
    var xLabel3 = xText.append("text")
        .text("Household Income (medium)")  
        .attr("x", 0)
        .attr("y", 20) 
        .attr("class", "aText inactive")
        .attr("value", "income");
    
    // Append y-axis group to svg area
    svg.append('g').attr('class','y-axis');
    // Translate the group
    var yText = d3.select('.y-axis');
    yText.attr("transform", `translate(${margin.left}, ${margin.top})rotate(-90)`);
    
    // function yTextRefresh() {
    //     yText.attr("transform", `translate(${margin.left}, ${margin.top})rotate(-90)`);
    // };
    // yTextRefresh();
    
    // 1st Y-Axis Title
    var yLabel1 = yText.append('text')
        .text('Lacks healthcare (%)')
        .attr('y',26)
        .attr('data-name','healthcare')
        .attr('data-axis','y')
        .attr('class','aText active y');    
    
    // 2nd Y-Axis Title
    var yLabel2 = yText.append('text')
        .text('Obese (%)')
        .attr('y',-26)
        .attr('data-name','obesity')
        .attr('data-axis','y')
        .attr('class','aText inactive y');
    
    // 3rd Y-Axis Title
    var yLabel3 = yText.append('text')
        .text('Smokes (%)')
        .attr('y',0)
        .attr('data-name','smokes')
        .attr('data-axis','y')
        .attr('class','aText inactive y');

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
    // X-axis labels event listener
    //labelsGroup was where xText is on line below
    xText.selectAll("text")
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
    }).catch(function(error) {
        console.log(error);
        });