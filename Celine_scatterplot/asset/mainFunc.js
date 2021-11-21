const form = document.getElementById('searchForm');
const ApiKey_Phillip = '7540b6e4f23a1f8e3a9540f91f80b927';
let queryData;
let movieDataTrendy = [];

let ApiKey_Celine= '063bc2e727886ed9b4ff96cc392ad9c9';
let movie_id = 550;
let movieDataSimilar = [];

//sp for mv page
class Scatterplot_mv{
  constructor(containerId, data){

    this.data = data;
    this.id = containerId;

    // Define a 2-d array to store revenue&budget data to calculate min max value for coordinate system (x: budget, y: revenue)
    this.coordDomainData = {
      'budget' : [...data.map((dataPt) => dataPt.budget)],
      'revenue' : [...data.map((dataPt) => dataPt.revenue)]
    };
    // These variables are used to define size of the visualization canvas and the
    // margin (or "padding") around the scattter plot.  We use the margin to draw
    // things like axis labels.
    this.containerId = containerId;
    this.height = 400;
    this.width = 500;
    this.margin = {
      top:30,
      right:40,
      left:60,
      bottom: 60
    };
    // Create the SVG canvas that will be used to render the visualization.
    this.svg = d3.select("#"+this.id)
                .append("svg")
                .attr("width", this.width)
                .attr("height", this.height);


    // Define a variety of scales, for color, x axis and y axis.
    this.x = d3.scaleLinear()
                // Define min & max value within the data we use to visualize
                .domain([0, d3.max(this.coordDomainData.budget)+d3.max(this.coordDomainData.budget)*0.05])
                .range([this.margin.left, this.width-this.margin.right]);

    this.y = d3.scaleLinear()
                .domain([d3.max(this.coordDomainData.revenue)+d3.max(this.coordDomainData.revenue)*0.05, 0])
                .range([this.margin.top,this.height-this.margin.bottom]);
    // Add axes.  First the X axis and label.
    this.xAxis = this.svg.append("g")
        .attr("class", "axis-x")
        .attr("transform", "translate(30,"+(this.height-this.margin.bottom)+")")
        .call(d3.axisBottom(this.x).ticks(6).tickPadding([15]).tickFormat((d)=>{
          let textForm;

          (d / 1e6)/1000 >= 1 ?
          textForm = '$ ' + String(((d / 1e6)/1000).toFixed(1)) + ' billion' :
          textForm = '$ ' + String((d / 1e6).toFixed(1)) + ' million'

          return textForm;
        }));

    this.svg.append("text")
        .attr("class", "axis-label")
        .attr("y", this.height-this.margin.left/4)
        .attr("x",0 + (this.width / 2))
        .style("text-anchor", "middle")
        .text("Budget");

  // Now the Y axis and label.
    this.yAxis = this.svg.append("g")
        .attr("class", "axis-y")
        .attr("transform", "translate("+String(this.margin.left+30)+",0)")
        .call(d3.axisLeft(this.y).ticks(6).tickPadding([15]).tickFormat((d)=>{
          let textForm;

          (d / 1e6)/1000 >= 1 ?
          textForm = '$ ' + String(((d / 1e6)/1000).toFixed(1)) + ' billion' :
          textForm = '$ ' + String((d / 1e6).toFixed(1)) + ' million'

          return textForm;
        }));

    // this.svg.append("text")
    //     .attr("transform", "rotate(90)")
    //     .attr("class", "axis-label")
    //     .attr("y", -10)
    //     .attr("x",0+ (this.width / 2) )
    //     .style("text-anchor", "middle")
    //     .text("Revenue");
      this.svg.append("text")
        .attr("class", "axis-label")
        .attr("y", this.height-370)
        .attr("x", (this.width / 2)-200)
        .style("text-anchor", "middle")
        .text("Revenue");
  }

  render(){
    let thisViz = this;

    // Add the tooltip container to the vis container
    // it's invisible and its position/contents are defined during mouseover
    let tooltip = d3.select("#"+thisViz.id)
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // tooltip mouseover event handler
    thisViz.tipMouseOver = (event, d) => {

        // Latest D3 version (v6 onward) does not recognize d3.event.pageX & d3.event.pageY
        // It changes to d3.pointer(event, taget_container) where 2 position values (x, y) of the mouse position are returned.
        // 2nd argument is used to calculate the relative location of the tooltip so it can scale upon when the vessel's width and height change.

        let[x, y] = d3.pointer(event, thisViz.svg);
        let revenueText;
        let budgetText;

        (d.revenue / 1e6)/1000 >= 1 ?
        revenueText = '$ ' + String(((d.revenue / 1e6)/1000).toFixed(1)) + ' billion' :
        revenueText = '$ ' + String((d.revenue / 1e6).toFixed(1)) + ' million';

        (d.budget / 1e6)/1000 >= 1 ?
        budgetText = '$ ' + String(((d.budget / 1e6)/1000).toFixed(1)) + ' billion' :
        budgetText = '$ ' + String((d.budget / 1e6).toFixed(1)) + ' million';



        let htmlChild  = "<b>"+d.original_title+"</b><br/>"+
                    `<img src='https://image.tmdb.org/t/p/original${d.poster_path}' alt="tooltip movie poster" id="tooltip-poster"><br/>`+
                    "<span class = 'revenueText'><b>Revenue : </b>" + revenueText + "</span><br/>" +
                    "<span class = 'budgetText'><b>Budget : </b>" + budgetText + "</span>";

        // `${x+250 > thisViz.width ? String(x-(x+250-thisViz.width)):String(x+10)}`
        // `${y+400 > thisViz.height ? String(y-(y+400-thisViz.height)):String(y+20)}`

        tooltip.html(htmlChild)
            .style("left", `${String(x+10)}` + "px")
            .style("top", `${String(y+20)}` + "px")
            .transition()
            .duration(200) // ms
            .style("opacity", .9)
            .style("display",'inline-block'); // started as 0!

    }; 
    // tooltip mouseout event handler
    thisViz.tipMouseOut = () => {
      d3.selectAll(".tooltip")
            .transition()
            .duration(200) // ms
            .style("opacity", 0)
            .style("display",'none');
    };

        // Create the scatter variable: where both the circles and the brush take place
    let scatter = thisViz.svg
        .append('g')
        // Append a g tag to group the scatterplot.
        .attr('class','scatter-group')
        .selectAll('.dot')
        // Take in the prebuilt data, filtering the data to show only the ones that match the "_subset" input variable,
        // The filtering operation will be triggered whenever users select a region in the dropdown menu.
        .data(thisViz.data)
        .enter()
        .append("circle")
        .attr('class','dot')
        .attr("cx", d => thisViz.x(d.budget)+30)
        .attr("cy", d => thisViz.y(d.revenue))
        .attr('fill', d => d.revenue > d.budget? '#90cea1' : '#5F1B23')
        .on("mouseover", (event,d)=>{
          thisViz.tipMouseOver(event,d);
        })
        .on("mouseout",(event,d)=>{
          thisViz.tipMouseOut();
        })
        .attr('opacity',0.7)
        // Set the radius to be 0 first, later will initialize an animation to make it enlarge to 5 over a period of time.
        .attr("r", 0)
        .transition()
        .duration(500)
        .attr("r", d => 7);

}
// updateChart(genre){

//   let thisViz = this;
//   // Initialize animation for the scatter plot every time the render method is been called
//   thisViz.svg
//       .selectAll('.dot')
//       .transition()
//       .duration(500)
//       .attr("r", 0)

//   thisViz.svg
//       .select('.scatter-group')
//       .transition()
//       .duration(500)
//       .remove();



//   thisViz.filterData = thisViz.data.filter((dataPt)=>{
//     if(genre === 'All'){
//       return true
//     }else{
//       for(let item of dataPt.genres){
//         if(item.name.includes(genre)){return true}
//       }
//     }
//   });

//   if(thisViz.filterData.length === 0){
//     return
//   }
// ///////---------/////// 
//   thisViz.coordDomainData = {
//     'budget' : [...thisViz.filterData.map((dataPt) => dataPt.budget)],
//     'revenue' : [...thisViz.filterData.map((dataPt) => dataPt.revenue)]
//   };

//   thisViz.x = d3.scaleLinear()
//               // Define min & max value within the data we use to visualize
//               .domain([0, d3.max(thisViz.coordDomainData.budget)+d3.max(thisViz.coordDomainData.budget)*0.05])
//               .range([thisViz.margin.left,thisViz.width-thisViz.margin.right]);

//   thisViz.y = d3.scaleLinear()
//               .domain([d3.max(thisViz.coordDomainData.revenue)+d3.max(thisViz.coordDomainData.revenue)*0.05, 0])
//               .range([thisViz.margin.top,thisViz.height-thisViz.margin.bottom]);


//   thisViz.xAxis = this.svg
//       .select('.axis-x')
//       .transition().duration(900)
//       .call(d3.axisBottom(thisViz.x).ticks(6).tickPadding([15]).tickFormat((d)=>{
//         let textForm;

//         (d / 1e6)/1000 >= 1 ?
//         textForm = '$' + String(((d / 1e6)/1000).toFixed(1)) + ' billion' :
//         textForm = '$' + String((d / 1e6).toFixed(1)) + ' million'

//         return textForm;
//       }));

//   thisViz.yAxis = this.svg
//       .select('.axis-y')
//       .transition().duration(900)
//       .call(d3.axisLeft(thisViz.y).ticks(6).tickPadding([15]).tickFormat((d)=>{
//         let textForm;

//         (d / 1e6)/1000 >= 1 ?
//         textForm = '$' + String(((d / 1e6)/1000).toFixed(1)) + ' billion' :
//         textForm = '$' + String((d / 1e6).toFixed(1)) + ' million'

//         return textForm;
//       }));


//   thisViz.svg
//       .append('g')
//       // Append a g tag to group the scatterplot.
//       .attr('class','scatter-group')
//       .selectAll('.dot')
//       // Take in the prebuilt data, filtering the data to show only the ones that match the "_subset" input variable,
//       // The filtering operation will be triggered whenever users select a region in the dropdown menu.
//       .data(thisViz.filterData)
//       .enter()
//       .append("circle")
//       .attr('class','dot')
//       .attr("cx", d => thisViz.x(d.budget)+30)
//       .attr("cy", d => thisViz.y(d.revenue))
//       .attr('fill', d => d.revenue > d.budget? '#90cea1' : '#5F1B23')
//       .on("mouseover", (event,d)=>{
//         thisViz.tipMouseOver(event,d);
//       })
//       .on("mouseout",(event,d)=>{
//         thisViz.tipMouseOut();
//       })
//       .attr('opacity',0.7)
//       // Set the radius to be 0 first, later will initialize an animation to make it enlarge to 5 over a period of time.
//       .attr("r", 0)
//       .transition()
//       .duration(700)
//       .attr("r", d => 6);

// }
}
// Define a scatterplot object
class ScatterPlot {
  constructor(containerId, data){

    this.data = data;
    this.id = containerId

    // Define a 2-d array to store revenue&budget data to calculate min max value for coordinate system (x: budget, y: revenue)
    this.coordDomainData = {
      'budget' : [...data.map((dataPt) => dataPt.budget)],
      'revenue' : [...data.map((dataPt) => dataPt.revenue)]
    };
    // These variables are used to define size of the visualization canvas and the
    // margin (or "padding") around the scattter plot.  We use the margin to draw
    // things like axis labels.
    this.containerId = containerId;
    this.height = 700;
    this.width = 700;
    this.margin = {
      top:40,
      right:30,
      left:80,
      bottom: 70
    };

    // Create the SVG canvas that will be used to render the visualization.
    this.svg = d3.select("#"+this.id)
                .append("svg")
                .attr("width", this.width)
                .attr("height", this.height);


    // Define a variety of scales, for color, x axis and y axis.
    this.x = d3.scaleLinear()
                // Define min & max value within the data we use to visualize
                .domain([0, d3.max(this.coordDomainData.budget)+d3.max(this.coordDomainData.budget)*0.05])
                .range([this.margin.left, this.width-this.margin.right]);

    this.y = d3.scaleLinear()
                .domain([d3.max(this.coordDomainData.revenue)+d3.max(this.coordDomainData.revenue)*0.05, 0])
                .range([this.margin.top,this.height-this.margin.bottom]);


    // Add axes.  First the X axis and label.
    this.xAxis = this.svg.append("g")
        .attr("class", "axis-x")
        .attr("transform", "translate(30,"+(this.height-this.margin.bottom)+")")
        .call(d3.axisBottom(this.x).ticks(4).tickPadding([15]).tickFormat((d)=>{
          let textForm;

          (d / 1e6)/1000 >= 1 ?
          textForm = '$ ' + String(((d / 1e6)/1000).toFixed(1)) + ' billion' :
          textForm = '$ ' + String((d / 1e6).toFixed(1)) + ' million'

          return textForm;
        }));

    this.svg.append("text")
        .attr("class", "axis-label")
        .attr("y", this.height-this.margin.left/4)
        .attr("x",0 + (this.width / 2))
        .style("text-anchor", "middle")
        .text("Budget");

    // Now the Y axis and label.
    this.yAxis = this.svg.append("g")
        .attr("class", "axis-y")
        .attr("transform", "translate("+String(this.margin.left+30)+",0)")
        .call(d3.axisLeft(this.y).ticks(6).tickPadding([15]).tickFormat((d)=>{
          let textForm;

          (d / 1e6)/1000 >= 1 ?
          textForm = '$ ' + String(((d / 1e6)/1000).toFixed(1)) + ' billion' :
          textForm = '$ ' + String((d / 1e6).toFixed(1)) + ' million'

          return textForm;
        }));

    this.svg.append("text")
        .attr("transform", "rotate(90)")
        .attr("class", "axis-label")
        .attr("y", -10)
        .attr("x",0 + (this.width / 2))
        .style("text-anchor", "middle")
        .text("Revenue");

  }

  render(){
    let thisViz = this;

    // Add the tooltip container to the vis container
    // it's invisible and its position/contents are defined during mouseover
    let tooltip = d3.select("#"+thisViz.id)
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // tooltip mouseover event handler
    thisViz.tipMouseOver = (event, d) => {

        // Latest D3 version (v6 onward) does not recognize d3.event.pageX & d3.event.pageY
        // It changes to d3.pointer(event, taget_container) where 2 position values (x, y) of the mouse position are returned.
        // 2nd argument is used to calculate the relative location of the tooltip so it can scale upon when the vessel's width and height change.

        let[x, y] = d3.pointer(event, thisViz.svg);
        let revenueText;
        let budgetText;

        (d.revenue / 1e6)/1000 >= 1 ?
        revenueText = '$ ' + String(((d.revenue / 1e6)/1000).toFixed(1)) + ' billion' :
        revenueText = '$ ' + String((d.revenue / 1e6).toFixed(1)) + ' million';

        (d.budget / 1e6)/1000 >= 1 ?
        budgetText = '$ ' + String(((d.budget / 1e6)/1000).toFixed(1)) + ' billion' :
        budgetText = '$ ' + String((d.budget / 1e6).toFixed(1)) + ' million';



        let htmlChild  = "<b>"+d.original_title+"</b><br/>"+
                    `<img src='https://image.tmdb.org/t/p/original${d.poster_path}' alt="tooltip movie poster" id="tooltip-poster"><br/>`+
                    "<span class = 'revenueText'><b>Revenue : </b>" + revenueText + "</span><br/>" +
                    "<span class = 'budgetText'><b>Budget : </b>" + budgetText + "</span>";

        // `${x+250 > thisViz.width ? String(x-(x+250-thisViz.width)):String(x+10)}`
        // `${y+400 > thisViz.height ? String(y-(y+400-thisViz.height)):String(y+20)}`

        tooltip.html(htmlChild)
            .style("left", `${String(x+10)}` + "px")
            .style("top", `${String(y+20)}` + "px")
            .transition()
            .duration(200) // ms
            .style("opacity", .9)
            .style("display",'inline-block'); // started as 0!

    };
    // tooltip mouseout event handler
    thisViz.tipMouseOut = () => {
      d3.selectAll(".tooltip")
            .transition()
            .duration(200) // ms
            .style("opacity", 0)
            .style("display",'none');
    };

    // Create the scatter variable: where both the circles and the brush take place
    let scatter = thisViz.svg
        .append('g')
        // Append a g tag to group the scatterplot.
        .attr('class','scatter-group')
        .selectAll('.dot')
        // Take in the prebuilt data, filtering the data to show only the ones that match the "_subset" input variable,
        // The filtering operation will be triggered whenever users select a region in the dropdown menu.
        .data(thisViz.data)
        .enter()
        .append("circle")
        .attr('class','dot')
        .attr("cx", d => thisViz.x(d.budget)+30)
        .attr("cy", d => thisViz.y(d.revenue))
        .attr('fill', d => d.revenue > d.budget? '#90cea1' : '#5F1B23')
        .on("mouseover", (event,d)=>{
          thisViz.tipMouseOver(event,d);
        })
        .on("mouseout",(event,d)=>{
          thisViz.tipMouseOut();
        })
        .attr('opacity',0.7)
        // Set the radius to be 0 first, later will initialize an animation to make it enlarge to 5 over a period of time.
        .attr("r", 0)
        .transition()
        .duration(500)
        .attr("r", d => 7);


  }

  // Optional depends on the time, if ok then develop it.
  updateChart(genre){

    let thisViz = this;
    // Initialize animation for the scatter plot every time the render method is been called
    thisViz.svg
        .selectAll('.dot')
        .transition()
        .duration(500)
        .attr("r", 0)

    thisViz.svg
        .select('.scatter-group')
        .transition()
        .duration(500)
        .remove();



    thisViz.filterData = thisViz.data.filter((dataPt)=>{
      if(genre === 'All'){
        return true
      }else{
        for(let item of dataPt.genres){
          if(item.name.includes(genre)){return true}
        }
      }
    });

    if(thisViz.filterData.length === 0){
      return
    }
///////---------/////// 
    thisViz.coordDomainData = {
      'budget' : [...thisViz.filterData.map((dataPt) => dataPt.budget)],
      'revenue' : [...thisViz.filterData.map((dataPt) => dataPt.revenue)]
    };

    thisViz.x = d3.scaleLinear()
                // Define min & max value within the data we use to visualize
                .domain([0, d3.max(thisViz.coordDomainData.budget)+d3.max(thisViz.coordDomainData.budget)*0.05])
                .range([thisViz.margin.left,thisViz.width-thisViz.margin.right]);

    thisViz.y = d3.scaleLinear()
                .domain([d3.max(thisViz.coordDomainData.revenue)+d3.max(thisViz.coordDomainData.revenue)*0.05, 0])
                .range([thisViz.margin.top,thisViz.height-thisViz.margin.bottom]);


    thisViz.xAxis = this.svg
        .select('.axis-x')
        .transition().duration(900)
        .call(d3.axisBottom(thisViz.x).ticks(6).tickPadding([15]).tickFormat((d)=>{
          let textForm;

          (d / 1e6)/1000 >= 1 ?
          textForm = '$' + String(((d / 1e6)/1000).toFixed(1)) + ' billion' :
          textForm = '$' + String((d / 1e6).toFixed(1)) + ' million'

          return textForm;
        }));

    thisViz.yAxis = this.svg
        .select('.axis-y')
        .transition().duration(900)
        .call(d3.axisLeft(thisViz.y).ticks(6).tickPadding([15]).tickFormat((d)=>{
          let textForm;

          (d / 1e6)/1000 >= 1 ?
          textForm = '$' + String(((d / 1e6)/1000).toFixed(1)) + ' billion' :
          textForm = '$' + String((d / 1e6).toFixed(1)) + ' million'

          return textForm;
        }));


    thisViz.svg
        .append('g')
        // Append a g tag to group the scatterplot.
        .attr('class','scatter-group')
        .selectAll('.dot')
        // Take in the prebuilt data, filtering the data to show only the ones that match the "_subset" input variable,
        // The filtering operation will be triggered whenever users select a region in the dropdown menu.
        .data(thisViz.filterData)
        .enter()
        .append("circle")
        .attr('class','dot')
        .attr("cx", d => thisViz.x(d.budget)+30)
        .attr("cy", d => thisViz.y(d.revenue))
        .attr('fill', d => d.revenue > d.budget? '#90cea1' : '#5F1B23')
        .on("mouseover", (event,d)=>{
          thisViz.tipMouseOver(event,d);
        })
        .on("mouseout",(event,d)=>{
          thisViz.tipMouseOut();
        })
        .attr('opacity',0.7)
        // Set the radius to be 0 first, later will initialize an animation to make it enlarge to 5 over a period of time.
        .attr("r", 0)
        .transition()
        .duration(700)
        .attr("r", d => 6);

  }
}


class BarChart {
  constructor(containerId){

  }
  render(vizType){

  }
}

// Fetch the movie genres

// Define a function to create section block
let createVizSection = (id, extraClassName) => {
  let sectionContainer = document.createElement('section');
  sectionContainer.id = id;
  sectionContainer.className = 'container' + extraClassName;

  return sectionContainer;
}

// Define a Function to display the main page---------------------------
let displayMain = (pageNum, maxPageNum) => {
  let apiUrl = `https://api.themoviedb.org/3/trending/movie/week?api_key=${ApiKey_Phillip}&page=${pageNum}`;

  fetch(apiUrl)
    .then(res => res.json())
    .then(dataTrendy=>{
      // Initiate a promise array
      let promises = [];

      for(let dataPt of dataTrendy.results){
        // Push all api fetch commands inside the promise array
        promises.push(
        fetch(`https://api.themoviedb.org/3/movie/${dataPt.id}?api_key=${ApiKey_Phillip}&language=en-US`)
          .then(res => res.json())
          .then(dataMovie=>{
            movieDataTrendy.push(dataMovie);
          })
        );
      }

      // Set a Promise.all(), which take a iterable as input, an iterable like array [] or object {}, once when resolved (finished), it will process next lines of codes in the subsequent .then(...)
      Promise
      .all(promises)
      .then(()=>{
        movieDataTrendy = movieDataTrendy.filter(item => item.revenue>0 && item.budget>0 && item.poster_path);
         //console.log('cinfig',movieDataTrendy);
        return dataTrendy;
      })
      .then(data => {

        if(data.total_pages > 1 && pageNum < maxPageNum){

          pageNum++;
          displayMain(pageNum, maxPageNum);

        }else{
          Promise
          .all(

            [(function(){
              let main = document.querySelector('main');
              let leftSec = createVizSection('left-section', '');
              let rightSec = createVizSection('right-section', '');

              main.id ='index-main';
              main.style.display = 'flex';
              main.appendChild(leftSec);
              main.appendChild(rightSec);

              leftSec.innerHTML = `
                <div id="trendy-scatterplot">
                  <h1>Trendy Movies Finance Breakdown</h1>
                  <select id='trendy_genre_scatterplot_filter'>
                    <option value = 'All'>All</option>
                  </select>
                  <div id= 'trendyScatter'></div>
                </div>
                <div id="celebity-bday-list">
                  <h1>List of Celebrities whose bdays are today</h1>
                  <div id= 'trendyPerson'></div>
                </div>
              `;
              rightSec.innerHTML = `
                <div id="trendy-barchart">
                  <h1>Bust or Blockbluster - Top 15 Ranking</h1>
                  <div id= 'trendyBar'><div>
                </div>
              `;
            })()])
          .then(()=>{
            // Initiate scatterplot
            let trendyScatterPlot = new ScatterPlot('trendyScatter', movieDataTrendy);
            trendyScatterPlot.render();

            //fill in movie genres
            let genreList = [];
            let optionHolder = document.getElementById('trendy_genre_scatterplot_filter');

            fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${ApiKey_Phillip}&language=en-US`)
              .then(res => res.json())
              .then(data =>{

                for(let genre of data.genres){
                  let option = document.createElement('option');
                  option.value = genre.name;
                  option.innerText = genre.name;
                  optionHolder.appendChild(option);
                }
              });

            optionHolder.addEventListener('change',(event)=>{
              // Update scatterplot
              trendyScatterPlot.updateChart(event.target.value);
            })


          })
          .then(()=>{
            // Initiate simple animation

            let mainVizSection = d3.selectAll('.container');
            mainVizSection.style('opacity','0')
                          .transition()
                          .duration(400)
                          .style('opacity','1');
          });
        }
      })
    })
    .catch(e => console.log('error'));
}

// Define a Function to display search page
let displaySearch = (pageNum, maxPageNum) => {

  // create a variable to store the search query via location hash
  let searchTerm = window.location.hash.replace('#query=','')
  let apiUrl = `https://api.themoviedb.org/3/search/multi?api_key=${ApiKey_Phillip}&language=en-US&query=${searchTerm}&page=${pageNum}&include_adult=false`;

  fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
      typeof queryData === 'object' ? queryData.push(...data.results) : queryData = data.results;
      console.log(data);

      if(data.total_pages > 1 && pageNum < maxPageNum){
        pageNum++
        displaySearch(pageNum, maxPageNum)
      }else{
        // Set id of the search container (For css styling)
        // Select the main tag
        let main = document.querySelector('main');
        main.id = 'index-search';
        // Create a <section></section> tag to contain the search results
        // using multi-search model to fetch search result from TMDB API
        let searchContainer = createVizSection('searchContainer',' search');
        // Append search container inside <main></main> tag within the html file
        // And tweek a bit of the original css styles (change display property from 'flex' -> 'block')
        main.style.display = 'block';
        main.appendChild(searchContainer);

        let searchResults = document.getElementById('searchContainer');

        queryData.sort((previous, present) => (previous.popularity > present.popularity) ? -1 : 1);


        // Filter the falsy value of the retrieve data
        let queryDataCleaned = queryData.filter((item) => {
          if(item.media_type === 'movie'){
            return (item.release_date) && (item.overview);
          }else if (item.media_type === 'person') {
            return item.profile_path;
          }
        });
        // Loop the search result into the search page
        console.log(queryDataCleaned);

        for(let search of queryDataCleaned){

          if(search.media_type==='person'){

            searchResults.innerHTML +=
            `<div class='searchResults'>
              <a class='searchResultsLink' href='index.html#person_id=${search.id}'>${search.name}</a>
              <div class='searchPreviewContainer'>
                <span class='searchPreview'>
                  <b>Type :</b> ${search.media_type[0].toUpperCase() + search.media_type.slice(1,)} |
                </span>
                <span class='searchPreview'>
                  <b>Gender :</b> ${search.gender === 1? 'Female' : search.gender === 2? 'Male':'Unspecified'} |
                </span>
                <span class='searchPreview'>
                  <b>Best Known for :</b> ${search.known_for_department[0].toUpperCase() + search.known_for_department.slice(1,)}
                </span>
                <p class='searchPreview'>
                  <b>Search Popularity Score :</b> ${String(search.popularity)}
                </p>
              </div>
            </div>`

          }else if(search.media_type==='movie') {

            searchResults.innerHTML +=
            `<div class='searchResults'>
              <a class='searchResultsLink' href='index.html#movie_id=${search.id}'>${search.title}</a>
              <div class='searchPreviewContainer'>
                <span class='searchPreview'>
                  <b>Type :</b> ${search.media_type[0].toUpperCase() + search.media_type.slice(1,)} |
                </span>
                <span class='searchPreview'>
                  <b>Release Date :</b> ${search.release_date}
                </span>
                <p class='searchPreview'>
                  <b>Overview :</b> ${search.overview}
                </p>
                <p class='searchPreview'>
                  <b>Search Popularity Score:</b> ${search.popularity}
                </p>
              </div>
            </div>`

          }
        }
      }
    })
    .then(()=>{
      window.scroll(0, 0);
      // Initiate simple animation
      let searchSection = d3.selectAll('.container.search');
      searchSection.style('opacity','0')
                    .transition()
                    .duration(600)
                    .style('opacity','1');
    })
    .catch(e => console.log('error'));
}

// Define a Function to display movie page
let displayMovie = () => {
  let movieId = window.location.hash.replace('#movie_id=','');
  let main = document.querySelector('main');
  //let apiUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${ApiKey_Phillip}&language=en-US&append_to_response=credits,similar`
  let apiUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${ApiKey_Celine}&language=en-US&append_to_response=credits,similar`;

  main.id = 'index-movie';

  fetch(apiUrl)
    .then(res => res.json())
    .then(data => {

      console.log(data);
      // Build Movie's Viz Block
      let main = document.querySelector('main');
      let profileSection = createVizSection('movie-profile-section', ' movie');
      //let vizSection = createVizSection('movie-viz-section', ' movie');
      // let middleSec = createVizSection('middle-section','');
      // let rightSecmv = createVizSection('right-section-mv','');
      let displayGenres = () => {
        let eleArr = ``;

        for(let genre of data.genres){
          eleArr += `<span class='movie-genre'>${genre['name']}</span>`;
        }

        return eleArr
      }

      main.style.display = 'flex';
      main.appendChild(profileSection);
      //main.appendChild(middleSec);
      //main.appendChild(rightSecmv);

      profileSection.innerHTML = `
        <div>
          <span>${data.original_title}</span>
          <img src='https://image.tmdb.org/t/p/original${data.poster_path}' alt="movie poster" id="poster">
          <h1>Film Info</h1>
          <h2>Release Date</h2>
          <p>${data.release_date}</p>
          <h2>Genre</h2>
          <div class='movie-genre-container'>${displayGenres()}</div>
          <h2>Budget</h2>
          <p>${data.budget <= 0 ? '-': String('$')+ String(data.budget)}</p>
          <h2>Revenue</h2>
          <p>${data.revenue <= 0 ? '-': String('$')+ String(data.revenue)}</p>
          <button class="trailor">Watch Trailer</button>
        </div>
      `;

      // middleSec.innerHTML = `
      //   <div id="similar-scatter">
      //     <h1>Finance BreakDown of the similar movies</h1>
      //     <select id='trendy_genre_scatterplot_filter'>
      //       <option value = 'All'>All</option>
      //     </select>
      //     <div id='similarScatter'></div>
      //   </div>
      //   <div id="castingcrews">
      //     <h1>casting crews</h1>
      //     <div id='castingcrews'></div>
      //   </div>
        
      // `;
      // rightSecmv.innerHTML = `
      //   <div id="similarBar">
      //     <h1>Comparision of the similar movie</h1>
      //   </div>
      // `;
    })
    .then(()=>{
      // Initiate simple animation
      let movieVizSection = d3.selectAll('.container.movie');
      movieVizSection.style('opacity','0')
                    .transition()
                    .duration(600)
                    .style('opacity','1');
    })
    .catch(e => console.log('error'));

    fetch(apiUrl)
      .then(res => res.json())
      .then(dataSimilar=>{
        let promises = [];

        for(let dataPt of dataSimilar.similar.results){
          promises.push(
            fetch(`https://api.themoviedb.org/3/movie/${dataPt.id}?api_key=${ApiKey_Celine}&language=en-US`)
              .then(res => res.json())
              .then(dataMovie=>{
                movieDataSimilar.push(dataMovie);
                //console.log('config1',dataSimilar);//similar movie of movie id=550
              })
            );
        }

        // Set a Promise.all(), which take a iterable as input, an iterable like array [] or object {}, once when resolved (finished), it will process next lines of codes in the subsequent .then(...)
        Promise
        .all(promises)
        .then(()=>{
          movieDataSimilar = movieDataSimilar.filter(item => item.revenue>0 && item.budget>0 && item.poster_path);              
            //console.log('config2', movieDataSimilar);  //final similar movie of movie id=550
          return dataSimilar;
        })
        .then(data => {
          if(data.total_pages > 1 && pageNum < maxPageNum){

            pageNum++;
            displayMain(pageNum, maxPageNum);
          }else{
            Promise
            .all(
              [(function(){
                let main = document.querySelector('main');
                let middleSec = createVizSection('middle-section','');
                let rightSecmv = createVizSection('right-section-mv','');
                
                main.id = 'index-main';
                main.style.display = 'flex';
                main.appendChild(middleSec);
                main.appendChild(rightSecmv);

                middleSec.innerHTML = `
                <div id="similar-scatter">
                  <h1>Finance BreakDown of the similar movies</h1>
                 
                  <div id='similarScatter'></div>
                </div>

                <div id="castingcrews">
                  <h2>Top cast</h2>
                  <div class="cast_crew" class="scroller_wrap should_fade is_hidden">
                    <ol class="cast scroller">
                   
                      <li class="card">
                          <a href=" "> 
                            <img src = 'https://image.tmdb.org/t/p/original${dataSimilar.credits.cast[0].profile_path}' alt="cast's name" id="cast-poster">
                          </a>
                          <p>${dataSimilar.credits.cast[0].name}</p>
                          <p class='character'>as ${dataSimilar.credits.cast[0].character}</p>
                      </li>
                      <li class="card">
                          <a href=" "> 
                            <img src = 'https://image.tmdb.org/t/p/original${dataSimilar.credits.cast[1].profile_path}' alt="cast's name" id="cast-poster">
                          </a>
                          <p>${dataSimilar.credits.cast[1].name}</p>
                          <p class='character'>as ${dataSimilar.credits.cast[1].character}</p>
                      </li>
                      <li class="card">
                          <a href=" "> 
                            <img src = 'https://image.tmdb.org/t/p/original${dataSimilar.credits.cast[2].profile_path}' alt="cast's name" id="cast-poster">
                          </a>
                          <p>${dataSimilar.credits.cast[2].name}</p>
                          <p class='character'>as ${dataSimilar.credits.cast[2].character}</p>
                      </li>
                      <li class="card">
                          <a href=" "> 
                            <img src = 'https://image.tmdb.org/t/p/original${dataSimilar.credits.cast[3].profile_path}' alt="cast's name" id="cast-poster">
                          </a>
                          <p>${dataSimilar.credits.cast[3].name}</p>
                          <p class='character'>as ${dataSimilar.credits.cast[3].character}</p>
                      </li>
                      <li class="card">
                          <a href=" "> 
                            <img src = 'https://image.tmdb.org/t/p/original${dataSimilar.credits.cast[4].profile_path}' alt="cast's name" id="cast-poster">
                          </a>
                          <p>${dataSimilar.credits.cast[4].name}</p>
                          <p class='character'>as ${dataSimilar.credits.cast[4].character}</p>
                      </li>
                      <li class="card">
                          <a href=" "> 
                            <img src = 'https://image.tmdb.org/t/p/original${dataSimilar.credits.cast[5].profile_path}' alt="cast's name" id="cast-poster">
                          </a>
                          <p>${dataSimilar.credits.cast[5].name}</p>
                          <p class='character'>as ${dataSimilar.credits.cast[5].character}</p>
                      </li>
                      <li class="card">
                          <a href=" "> 
                            <img src = 'https://image.tmdb.org/t/p/original${dataSimilar.credits.cast[6].profile_path}' alt="cast's name" id="cast-poster">
                          </a>
                          <p>${dataSimilar.credits.cast[6].name}</p>
                          <p class='character'>as ${dataSimilar.credits.cast[6].character}</p>
                      </li>
                    </ol>   
                  </div>          
                </div>
                
              `;
              rightSecmv.innerHTML = `
                <div id="similarBar">
                  <h1>Comparision of the similar movie</h1>

                </div>
              `;
              })()])
            .then(()=>{
              //initial scatterplot
              let similarScatterPlot = new Scatterplot_mv('similarScatter', movieDataSimilar);
              similarScatterPlot.render();

              // //
              // let optionHolder = document.getElementById('similar_genre_scatterplot_filter');
              // fetch( `https://api.themoviedb.org/3/genre/movie/list?api_key=${ApiKey_Celine}&language=en-US`)
              // .then(res => res.json())
              // .then(data =>{
              //   for(let genre of data.genres){
              //     let option = document.createElement('option');
              //      option.value = genre.name;
              //      option.innerText = genre.name;
              //      optionHolder.appendChild(option);
              //   }
              // });
              // optionHolder.addEventListener('change',(event)=>{
              //     // Update scatterplot
              //     trendyScatterPlot.updateChart(event.target.value);
              //   })




              //initial bar chart
            })
          }
        })

      })


}

// Define a Function to display person page
let displayPerson = () => {

  let personId = window.location.hash.replace('#person_id=','')
  let main = document.querySelector('main');
  main.id = 'index-person';

  fetch(`https://api.themoviedb.org/3/person/${personId}?api_key=${ApiKey_Phillip}&language=en-US&append_to_response=movie_credits`)
    .then(res => res.json())
    .then(data => {
      console.log(data);
      // Build Person's Viz Blocks
      let main = document.querySelector('main');
      let profileSection = createVizSection('person-profile-section', ' person');
      let vizSection = createVizSection('person-viz-section', ' person');

      main.style.display = 'flex';
      main.appendChild(profileSection);
      main.appendChild(vizSection);

      profileSection.innerHTML = `
      <div>
        <span>${data.name}</span>
        <img src = 'https://image.tmdb.org/t/p/original${data.profile_path}' alt="movie star's profile picture" id="poster">
        <h1>Personal Info</h1>
        <h2>Gender</h2>
        <p>${data.gender === 0? 'Not specified': data.gender === 1?'Female':'Male'}</p>
        <h2>Date of Birth</h2>
        <p>${data.birthday}</p>
        <h2>Birthplace</h2>
        <p>${data.place_of_birth}</p>
        <h2>Movie Credits (Cast + Crew)</h2>
        <p>${data.movie_credits.cast.length + data.movie_credits.crew.length}</p>
      </div>
      `;

      vizSection.innerHTML = `
      <div class="data-viz-container">
        radar chart
      </div>
      <div class="data-viz-container">
        network chart
      </div>
      <div class="data-viz-container">
        bar chart
      </div>
      `;
    })
    .then(()=>{
      // Initiate simple animation
      let personVizSection = d3.selectAll('.container.person');
      personVizSection.style('opacity','0')
                    .transition()
                    .duration(600)
                    .style('opacity','1');
    })
    .catch(e => console.log('error'));
}

//Fetch the search results based on location hash
let display= () => {

  let mainVizSection = d3.selectAll('.container');


  if (window.location.hash.includes('#query=')) {

    // Set the display property = 'none' for all the data viz sections at the home page.
    // Then display the search results
    mainVizSection.remove();
    displaySearch(1,2);
  }
  else if(window.location.hash.includes('#person_id=')){
    // Set the display property = 'none' for all the data viz sections at the home page.
    // Then display the person page

    mainVizSection.remove();
    displayPerson();

  }else if(window.location.hash.includes('#movie_id=')){
    // Set the display property = 'none' for all the data viz sections at the home page.
    // Then display the movie page

    mainVizSection.remove();
    displayMovie();

  }else{
    //mainVizSection.remove();
    displayMain(1,7);
  }

}


// Initiate Display Function to Render Page Components
display();

// Search keywords for movie / movie stars
form.addEventListener('submit', (e)=>{
  e.preventDefault();
  // Select the input box where user typing the keyword search
  const searchbox = document.getElementById('searchBox');
  // prevent user from accidentally type in empty search term
  if(form.elements.query.value){
    window.location.hash = searchbox.name + '=' + encodeURIComponent(form.elements.query.value);
    form.elements.query.value = '';
  }

});

// Detect if location hash has been changed either through search input or by manually altered the URL
window.addEventListener('hashchange', () => {

      if(document.getElementById('searchContainer')){
        // Clear all the previous search results
        queryData = undefined;
        document.getElementById('searchContainer').remove();
      }
      // When the location hash has been altered, fading the visualization out
      //let dataVizSection = d3.selectAll('.container')
      // There are 2 section contain the data viz, so use a loop to hide all section
      //dataVizSection.style('opacity','1')
      //              .transition()
      //              .duration(400)
      //              .style('opacity','0')
      //              .end()
      //              .then(()=>{
                      // After opacity change to 0, performing the search function
      display();
      //              });
});

document.getElementById('tmdbLogo').addEventListener('click', ()=>{
  // Clear all the previous trendy data
  movieDataTrendy = [];
  window.location.hash = 'main';
});
