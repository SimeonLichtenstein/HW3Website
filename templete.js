// Load the data 
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });

    // Define the dimensions and margins for the SVG
let 
  width = 600;
  height = 400;

let margin = {
  top: 50,
  bottom: 50,
  left: 50,
  right: 50
};

    // Create the SVG container
let svg1 = d3.select('#boxplot')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('background', 'lightyellow')


    // Set up scales for x and y axes
    // You can use the range 0 to 1000 for the number of Likes, or if you want, you can use
    // d3.min(data, d => d.Likes) to achieve the min value and 
    // d3.max(data, d => d.Likes) to achieve the max value
    // For the domain of the xscale, you can list all three age groups or use
    // [...new Set(data.map(d => d.AgeGroup))] to achieve a unique list of the age group

    // Add scales     
let yScale = d3.scaleLinear()
          .domain([0, 1000])
          .range([height - margin.bottom, margin.top])

let xScale = d3.scaleBand()
                .domain((data.map(d => d.AgeGroup)))
                .range([margin.left, width - margin.right])
                .padding(0.5)

    // Add x-axis label
svg1.append('text')
    .attr('x', width / 2)
    .attr('y', height - 10)
    .attr('text-anchor', 'middle')
    .text('Age Group');
svg1.append('g')
    .attr('transform', `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(xScale));

    // Add y-axis label
svg1.append('text')
    .attr('x', -(height / 2))
    .attr('y', 15)
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)')
    .text('Number of Likes');
svg1.append('g')
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(yScale));

  const rollupFunction = function(groupData) {
    const values = groupData.map(d => d.Likes).sort(d3.ascending);
    const min = d3.min(values); 
    const q1 = d3.quantile(values, 0.25);
    // Added median and q3 calculations
    const median = d3.quantile(values, 0.5);
    const q3 = d3.quantile(values, 0.75);
    const max = d3.max(values);
    return {min, q1, median, q3, max};
  };

  // Groups the data by AgeGroup and applies rollupFunction to calculate quantiles for each group
  const quantilesByGroups = d3.rollup(data, rollupFunction, d => d.AgeGroup);

  // Iterates through each age group and its calculated quantiles to prepare positioning values for drawing
  quantilesByGroups.forEach((quantiles, AgeGroup) => {
        const x = xScale(AgeGroup);
        const boxWidth = xScale.bandwidth();

        // Draw vertical lines
  svg1.append('line')
    .attr('x1', x + boxWidth / 2)
    .attr('x2', x + boxWidth / 2)
    .attr('y1', yScale(quantiles.min))
    .attr('y2', yScale(quantiles.max))
    .attr('stroke', 'black');

        // Draw box
  svg1.append('rect')
    .attr('x', x)
    .attr('y', yScale(quantiles.q3))
    .attr('width', boxWidth)
    .attr('height', yScale(quantiles.q1) - yScale(quantiles.q3))
    .attr('fill', 'lightyellow')
    .attr('stroke', 'black');      

        // Draw median line
  svg1.append('line')
    .attr('x1', x)
    .attr('x2', x + boxWidth)
    .attr('y1', yScale(quantiles.median))
    .attr('y2', yScale(quantiles.median))
    .attr('stroke', 'black');      
    });
});

// Prepare you data and load the data again. 
// This data should contains three columns, platform, post type and average number of likes. 
const socialMediaAvg = d3.csv("socialMediaAvg.csv");

socialMediaAvg.then(function(data) {
    data.forEach(function(d) {
         d.AvgLikes = +d.AvgLikes
    });
    // Convert string values to numbers


    // Define the dimensions and margins for the SVG
    let width = 600;
    let height = 400;
    
    let margin = {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
    };

    // Create the SVG container
let svg2 = d3.select('#barplot')
    .append('svg')
    .attr('width', width + 100)
    .attr('height', height)
    .style('background', 'lightyellow')

    // Define four scales
    // Scale x0 is for the platform, which divide the whole scale into 4 parts
    // Scale x1 is for the post type, which divide each bandwidth of the previous x0 scale into three part for each post type
    // Recommend to add more spaces for the y scale for the legend
    // Also need a color scale for the post type

    const x0 = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Platform))])
        .range([margin.left, width - margin.right])
        .padding(0.2);
      

    const x1 = d3.scaleBand()
        .domain([...new Set(data.map(d => d.PostType))])
        .range([0, x0.bandwidth()])
        .padding(0.1);
      

    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.AvgLikes)])
        .range([height - margin.bottom, margin.top]);
      

    const color = d3.scaleOrdinal()
      .domain([...new Set(data.map(d => d.PostType))])
      .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);    
         
    // Add scales x0 and y     
svg2.append('g')
    .attr('transform', `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(x0)); 

svg2.append('g')
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y));

    // Add x-axis label
svg2.append('text')
    .attr('x', width / 2)
    .attr('y', height - 10)
    .attr('text-anchor', 'middle')
    .text('Platform');    

    // Add y-axis label
svg2.append('text')
    .attr('x', -(height / 2))
    .attr('y', 15)
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)')
    .text('Average Number of Likes');

  // Group container for bars
    const barGroups = svg2.selectAll("bar")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${x0(d.Platform)},0)`);

  // Draw bars
    // barGroups.append("rect")
    barGroups.append("rect")
        .attr('x', d => x1(d.PostType))
        .attr('y', d => y(d.AvgLikes))
        .attr('width', x1.bandwidth())
        .attr('height', d => y(0) - y(d.AvgLikes))
        .attr('fill', d => color(d.PostType));  

    // Add the legend
    const legend = svg2.append("g")
        .attr("transform", `translate(${width + 20}, ${margin.top})`);

    const types = [...new Set(data.map(d => d.PostType))];
 
    types.forEach((type, i) => {
    // Added colored square for legend
    legend.append("rect")
        .attr("x", 0)
        .attr("y", i * 20 + 4)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", color(type));

    legend.append("text")
        .attr("x", 20)
        .attr("y", i * 20 + 12)
        .text(type)
        .attr("alignment-baseline", "middle");

    // Alread have the text information for the legend. 
    // Now add a small square/rect bar next to the text with different color.
      legend.append("text")
          .attr("x", 20)
          .attr("y", i * 20 + 12)
          .text(type)
          .attr("alignment-baseline", "middle");
  });

});

// Prepare you data and load the data again. 
// This data should contains two columns, date (3/1-3/7) and average number of likes. 

const socialMediaTime = d3.csv("socialMediaTime.csv");

socialMediaTime.then(function(data) {
    // Convert string values to numbers and parse dates
    data.forEach(function(d) {
        d.AvgLikes = +d.AvgLikes;
        d.Date = new Date(d.Date);
    });
    
    // Sort data by date
    data.sort((a, b) => a.Date - b.Date);
    console.log(data)
    // Convert string values to numbers

    // Define the dimensions and margins for the SVG
    let width = 600;
    let height = 400;
    
    let margin = {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
    };

    // Create the SVG container
let svg3 = d3.select('#lineplot')
    .append('svg')
    .attr('width', width + 100)
    .attr('height', height)
    .style('background', 'lightyellow')
    // Convert string values to numbers
    

    // Define the dimensions and margins for the SVG
    

    // Create the SVG container
    

    // Set up scales for x and y axes  
const xScale = d3.scaleTime()
    .domain([d3.min(data, d => d.Date), d3.max(data, d => d.Date)])
    .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.AvgLikes)])
    .range([height - margin.bottom, margin.top]);  
    // Draw the axis, you can rotate the text in the x-axis here

svg3.append('g')
    .attr('transform', `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(xScale))
    .selectAll('text')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end');

svg3.append('g')
    .attr('transform', `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(yScale));

    // Add x-axis label
svg3.append('text')
    .attr('x', width / 2)
    .attr('y', height - 10)
    .attr('text-anchor', 'middle')
    .text('Date');    

    // Add y-axis label
svg3.append('text')
    .attr('x', -(height / 2))
    .attr('y', 15)
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)')
    .text('Average Number of Likes');

    // Draw the line and path. Remember to use curveNatural. 
svg3.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 2)
    .attr('d', d3.line()
        .x(d => xScale(d.Date))
        .y(d => yScale(d.AvgLikes))
        .curve(d3.curveNatural)
    );
});
