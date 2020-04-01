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
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);
            console.log("xAxis:", xAxis);
    
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
    
        // Append the y-axis
        // chartGroup.append("text")
        //         .attr("transform", "rotate(-90)")
        //         .attr("y", 0 - margin.left)
        //         .attr("x", 0 - (height / 2))
        //         .attr("dy", "1em")
        //         .attr("class", "aText")
        //         .text("Lacks Healthcare (%)");


        var something = svg.append('g').attr('class','yText');
        console.log("something:", something);
        var yText = d3.select('.yText');
        console.log("yText:", yText);
        
        function yTextRefresh() {
            yText.attr("transform", `translate(${margin.left}, ${margin.top})rotate(-90)`);
        };
        yTextRefresh();

        yText
            .append('text')
            .text('Obese (%)')
            .attr('y',-26)
            .attr('data-name','obesity')
            .attr('data-axis','y')
            .attr('class','aText active y');
        yText
            .append('text')
            .text('Smokes (%)')
            .attr('y',0)
            .attr('data-name','smokes')
            .attr('data-axis','y')
            .attr('class','aText inactive y');
        yText
            .append('text')
            .text('Lacks healthcare (%)')
            .attr('y',26)
            .attr('data-name','healthcare')
            .attr('data-axis','y')
            .attr('class','aText inactive y');
        
        
        
    
        // updateToolTip function above csv import
        var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
    
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
    
                    // Change classes to change bold text
                    // if (chosenXAxis === "poverty") {
                    //     povertyLabel
                    //         .classed("active", true)
                    //         .classed("inactive", false);
                    //     ageLabel
                    //         .classed("active", false)
                    //         .classed("inactive", true);
                    // }
                    // else {
                    //     povertyLabel
                    //         .classed("active", false)
                    //         .classed("inactive", true);
                    //     ageLabel
                    //         .classed("active", true)
                    //         .classed("inactive", false);
                    // }
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
        }).catch(function(error) {
            console.log(error);
          });