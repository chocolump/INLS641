const form = document.getElementById('searchForm');
const ApiKey_Phillip = '7540b6e4f23a1f8e3a9540f91f80b927';
let queryData;
let movieDataTrendy = [];
let collaborationData = [];
let collaborationFrequency = [];
let trendyPersonList = '';

// Define a function that create a sheild cover the body
let windowShield = (popUp=false,closeItem='',videoSrc='') =>{
  d3.select('body')
  .append('div')
  .attr('class','cover')
  .on('click',(event,d)=>{
    if(closeItem !== ''){
      closeItem
      .style('opacity','1')
      .transition()
      .duration(600)
      .style('opacity','0')
      .end()
      .then(()=>{
        closeItem.style('display','none')
      });
    }
    if(videoSrc !== ''){
      videoSrc.attr('src', '');
    }

    if(popUp){
      console.log('enter');
      clearPopUpContent();
    }else{
      // Clear the window cover shield
      d3.select('div.cover')
      .style("opacity", .6)
      .transition()
      .duration(300)
      .style("opacity", 0)
      .end()
      .then(()=>d3.select('div.cover').remove());
    }
  })
  .style("opacity", 0)
  .transition()
  .duration(300)
  .style("opacity", .6);
}
let createPopUp = (data, extraClassName)=>{
  let main = document.querySelector('main');
  let sectionContainer = document.createElement('section');
  sectionContainer.className = 'popup-window'+' '+extraClassName;

  main.appendChild(sectionContainer);
  let promise = [];

  sectionContainer.innerHTML = `
  <span id='movie-details-close-btn' class='close-btn'>x</span>
  <div class='pop-window-main-content'>
    <div class='pop-window-img-wrapper'>
      <img src="https://image.tmdb.org/t/p/original${data.poster_path}" alt="movie poster">
    </div>
    <div class='pop-window-text-wrapper'>
      <h1>${data.original_title}</h1>
      <p class="pop-window-text"><span class='popup-sub-title'>Release Date :</span> <span class='popup-highlight'>${data.release_date}</span></p>
      <p class="pop-window-text"><span class='popup-sub-title'>Genres :</span> ${displayGenres(data)}</p>
      <p class="pop-window-text"><span class='popup-sub-title'>Runtime :</span> <span class='popup-highlight'>${runTimeParsing(data)}</span></p>
      <p class="pop-window-text"><span class='popup-sub-title'>Average User Score :</span> <span class='popup-highlight'>${String(data.vote_average*10)+"%"}</span></p>
      <p class="pop-window-text"><span class='popup-sub-title'>Overview :</span> ${data.overview}</p>
      <span id='${data.id}' class="popup-movie-link">View Details</span>
    </div>
  </div>`;

  promise.push(sectionContainer.innerHTML)
  Promise.all(promise)
  .then(()=>{
    d3.select('.popup-window')
    .style("opacity", 0)
    .transition()
    .duration(300)
    .style("opacity", 1);

    let movieLink = document.getElementsByClassName('popup-movie-link');
    movieLink[0].addEventListener('click',()=>{
      let queryId = movieLink[0].id;
      clearPopUpContent();
      window.location.hash = `movie_id=${queryId}`;
    });
    document.getElementById('movie-details-close-btn').addEventListener('click',clearPopUpContent);
  })



}

// Define a function to create a list of span elements that contain movie genres based on input data
let displayGenres = (dPt) => {
  let eleArr = ``;
  for(let genre of dPt.genres){
    eleArr += `<span class='movie-genre tooltip-text'>${genre['name']}</span>`;
  }
  return eleArr
}

let runTimeParsing = (d) =>{
  let time = String(parseInt(d.runtime/60))+"h"+" "+String(d.runtime%60)+"m";
  return time
}
let clearPopUpContent = () => {
  d3.select('.popup-window').remove();


  // Close the window shield if window shield is on
  if(d3.select('div.cover')._groups[0][0]){
    d3.select('div.cover')
    .style("opacity", .6)
    .transition()
    .duration(300)
    .style("opacity", 0)
    .end()
    .then(()=>{
      d3.select('div.cover').remove()
    });
  }
  // At movie page -> the closing function gets buggy, so place a recursive function to reassure the popup window close properly
  if (d3.select('.popup-window')._groups[0][0]) {
    clearPopUpContent();
  }
}
// Define a scattorplot object
class ScatterPlot {
  constructor(containerId, data, width, height){

    this.data = data;

    // Define a 2-d array to store revenue&budget data to calculate min max value for coordinate system (x: budget, y: revenue)
    this.coordDomainData = {
      'budget' : [...data.map((dataPt) => dataPt.budget)],
      'revenue' : [...data.map((dataPt) => dataPt.revenue)]
    };
    // These variables are used to define size of the visualization canvas and the
    // margin (or "padding") around the scattter plot.  We use the margin to draw
    // things like axis labels.
    this.containerId = containerId;
    this.margin = {
      top:0,
      right:20,
      left:70,
      bottom: 90
    };
    this.height = height;
    this.width = width;

    // Create the SVG canvas that will be used to render the visualization.
    this.svg = d3.select("#"+this.containerId)
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
        .call(d3.axisBottom(this.x).ticks(5).tickPadding([15]).tickFormat((d)=>{
          let textForm;

          (d / 1e6)/1000 >= 1 ?
          textForm = '$ ' + String(((d / 1e6)/1000).toFixed(1)) + 'B' :
          textForm = '$ ' + String((d / 1e6).toFixed(1)) + 'M'

          return textForm;
        }));

    this.svg.append("text")
        .attr("class", "axis-label")
        .attr("y", this.height-this.margin.bottom/2.5)
        .attr("x",0 + (this.width / 1.8))
        .style("text-anchor", "middle")
        .text("Budget");

    // Now the Y axis and label.
    this.yAxis = this.svg.append("g")
        .attr("class", "axis-y")
        .attr("transform", "translate("+String(this.margin.left+30)+",0)")
        .call(d3.axisLeft(this.y).ticks(6).tickPadding([15]).tickFormat((d)=>{
          let textForm;

          (d / 1e6)/1000 >= 1 ?
          textForm = '$ ' + String(((d / 1e6)/1000).toFixed(1)) + 'B' :
          textForm = '$ ' + String((d / 1e6).toFixed(1)) + 'M'

          return textForm;
        }));

    this.svg.append("text")
        .attr("transform", "rotate(90)")
        .attr("class", "axis-label")
        .attr("y", -15)
        .attr("x",0 + (this.height / 2.5))
        .style("text-anchor", "middle")
        .text("Revenue");

  }

  render(){
    let thisViz = this;

    // Add the tooltip container to the vis container
    // it's invisible and its position/contents are defined during mouseover
    let tooltip = d3.select(".tooltip");

    // tooltip mouseover event handler
    thisViz.tipMouseOver = (event, d) => {

        // Latest D3 version (v6 onward) does not recognize d3.event.pageX & d3.event.pageY
        // It changes to d3.pointer(event, taget_container) where 2 position values (x, y) of the mouse position are returned.
        // 2nd argument is used to calculate the relative location of the tooltip so it can scale upon when the vessel's width and height change.

        let[x, y] = d3.pointer(event, thisViz.svg),
        revenueText,
        budgetText,
        balance,
        spendingPerformance;

        (d.revenue / 1e6)/1000 >= 1 ?
        revenueText = '$ ' + String(((d.revenue / 1e6)/1000).toFixed(1)) + ' billion' :
        revenueText = '$ ' + String((d.revenue / 1e6).toFixed(1)) + ' million';

        (d.budget / 1e6)/1000 >= 1 ?
        budgetText = '$ ' + String(((d.budget / 1e6)/1000).toFixed(1)) + ' billion' :
        budgetText = '$ ' + String((d.budget / 1e6).toFixed(1)) + ' million';

        (Math.abs(d.financial_balance) / 1e6)/1000 >= 1 ?
        balance = '$ ' + String(((Math.abs(d.financial_balance) / 1e6)/1000).toFixed(1)) + ' billion' :
        balance = '$ ' + String((Math.abs(d.financial_balance) / 1e6).toFixed(1)) + ' million';

        ((d.revenue_per_budget) / 1e6)/1000 >= 1 ?
        spendingPerformance = '$ ' + String((((d.revenue_per_budget) / 1e6)/1000).toFixed(1)) + ' billion' :
        ((d.revenue_per_budget) / 1e6) >= 1 ?
        spendingPerformance = '$ ' + String(((d.revenue_per_budget) / 1e6).toFixed(1)) + ' million':
        spendingPerformance = '$ ' + String(((d.revenue_per_budget)).toFixed(1));

        displayGenres(d);

        let balanceClass = d.revenue - d.budget > 0 ? 'revenue-text':'budget-text';
        let balanceText = d.revenue - d.budget > 0 ? 'Earned':'Loss';


        let htmlChild  = `<h1 class= 'tooltip-title'>${d.original_title + " ("+d.release_date.slice(0,4)+")"}</h1>
                    <p class='tooltip-sub-title'>Revenue : <span class = 'revenue-text'>${revenueText}</span></p>
                    <p class='tooltip-sub-title'>Budget : <span class = 'budget-text'>${budgetText}</span></p>
                    <hr>
                    <p class='tooltip-sub-title'>Net ${balanceText} : <span class = ${balanceClass}>${balance}</span></p>
                    <p class='tooltip-sub-title'> Revenue / Budget: <span class = ${balanceClass}>${spendingPerformance}</span></p>`;

        // `${x+250 > thisViz.width ? String(x-(x+250-thisViz.width)):String(x+10)}`
        // `${y+400 > thisViz.height ? String(y-(y+400-thisViz.height)):String(y+20)}`
        //                     `<img src='https://image.tmdb.org/t/p/original${d.poster_path}' alt="tooltip movie poster" id="tooltip-poster"><br/>`

        tooltip.html(htmlChild)
        .style("left", `${String(x+20)}` + "px")
        .style("top", `${String(y/1.4)}` + "px")
        .transition()
        .duration(200) // ms
        .style("opacity", .9)
        .style("display",'inline-block');

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
        .on("click",(event,d)=>{
          windowShield(true);
          createPopUp(d, 'scatterplot');
        })
        .attr('opacity',0.6)
        // Set the radius to be 0 first, later will initialize an animation to make it enlarge to 5 over a period of time.
        .attr("r", 0)
        .transition()
        .duration(500)
        .attr("r", d => 7);


  }

  // Optional depends on the time, if ok then develop it.
  updateChart(updatedVal){

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
      if(updatedVal.genre === 'All' && updatedVal.profitType === 'All'){
        // Default
        return true
      }else if (updatedVal.genre !== 'All' && updatedVal.profitType === 'All') {
        // Filter Genre Only
        for(let item of dataPt.genres){
          if(item.name.includes(updatedVal.genre)){
            return true
          }
        }
      }else if (updatedVal.genre === 'All' && updatedVal.profitType !== 'All'){
        // Filter Profit Only
        if (updatedVal.profitType === 'Earned') {
          return dataPt.revenue > dataPt.budget;
        }else if (updatedVal.profitType === 'Lost') {
          return dataPt.revenue < dataPt.budget;
        }
      }else{
        // Filter Both
        if (updatedVal.profitType === 'Earned'){
          for(let item of dataPt.genres){
            if(item.name.includes(updatedVal.genre) && dataPt.revenue > dataPt.budget){return true}
          }
        }else if (updatedVal.profitType === 'Lost') {
          for(let item of dataPt.genres){
            if(item.name.includes(updatedVal.genre) && dataPt.revenue < dataPt.budget){return true}
          }
        }
      }
    });

    // Update axis and data rendering if the filtered data is more than 0
    if(thisViz.filterData.length > 0){

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
            .call(d3.axisBottom(thisViz.x).ticks(5).tickPadding([15]).tickFormat((d)=>{
              let textForm;

              (d / 1e6)/1000 >= 1 ?
              textForm = '$ ' + String(((d / 1e6)/1000).toFixed(1)) + 'B' :
              textForm = '$ ' + String((d / 1e6).toFixed(1)) + 'M'

              return textForm;
            }));

        thisViz.yAxis = this.svg
            .select('.axis-y')
            .transition().duration(900)
            .call(d3.axisLeft(thisViz.y).ticks(6).tickPadding([15]).tickFormat((d)=>{
              let textForm;

              (d / 1e6)/1000 >= 1 ?
              textForm = '$ ' + String(((d / 1e6)/1000).toFixed(1)) + 'B' :
              textForm = '$ ' + String((d / 1e6).toFixed(1)) + 'M'

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
              .on("click",(event,d)=>{
                windowShield(true);
                createPopUp(d, 'scatterplot');
              })
              .attr('opacity',0.7)
              // Set the radius to be 0 first, later will initialize an animation to make it enlarge to 5 over a period of time.
              .attr("r", 0)
              .transition()
              .duration(700)
              .attr("r", d => 6);
    }

  }
}
class BarChart {
  constructor(containerId, data,dataNum, width, height){

    let thisViz = this;
    // Set retrieved amount of the top ranked data

    this.sortKey = 'revenue_per_budget';
    thisViz.originalData = data;
    thisViz.data = [];
    this.dataSortedAll = data.sort((prev,now)=>{
      let order;
      prev[this.sortKey] > now[this.sortKey]? order = -1 : order = 1;
      return order
    });

    if(this.dataSortedAll.length>=dataNum){
      this.dataNum = [...Array(dataNum).keys()];
    }else{
      this.dataNum = [...Array(this.dataSortedAll.length).keys()];
    }

    for (let index of this.dataNum) {
      thisViz.data.push(thisViz.dataSortedAll[index]);
    }

    // Define a 2-d array to store revenue&budget data to calculate min max value for coordinate system (x: budget, y: revenue)

    this.coordDomainData = {
      'metrics' : [...thisViz.data.map((dataPt) => dataPt[thisViz.sortKey])],
      'movieName' : [...thisViz.data.map((dataPt) => dataPt.original_title)]
    };
    // These variables are used to define size of the visualization canvas and the
    // margin (or "padding") around the scattter plot.  We use the margin to draw
    // things like axis labels.
    this.containerId = containerId;
    this.height = height;
    this.width = width;
    this.margin = {
      top:30,
      right:10,
      left:100,
      bottom: 100
    };

    // Define a variety of scales, for color, x axis and y axis.
    this.x = d3.scaleLinear()
                // Define min & max value within the data we use to visualize
                .domain([0, d3.max(this.coordDomainData['metrics'])+d3.max(this.coordDomainData['metrics'])*0.1])
                .range([this.margin.left, this.width-this.margin.right]);

    this.y = d3.scaleBand()
                .domain(this.coordDomainData.movieName)
                .range([this.margin.top,this.height-this.margin.bottom])
                .padding(.1);

    // Create the SVG canvas that will be used to render the visualization.
    this.svg = d3.select("#"+this.containerId)
                .append("svg")
                .attr("width", this.width)
                .attr("height", this.height);

    // Add axes.  First the X axis and label.
    this.xAxis = this.svg.append("g")
        .attr("class", "bar-axis-x")
        .attr("transform", "translate(30,"+(this.height-this.margin.bottom)+")")
        .call(d3.axisBottom(this.x).ticks(6).tickPadding([15]).tickFormat((d)=>{

          if(this.sortKey === 'revenue' || this.sortKey === 'budget'){
            let textForm;
            (d / 1e6)/1000 >= 1 ?
            textForm = '$ ' + String(((d / 1e6)/1000).toFixed(1)) + 'B' :
            textForm = '$ ' + String((d / 1e6).toFixed(1)) + 'M'

            return textForm;
          }else if (this.sortKey === 'revenue_per_budget') {
            return "$ "+String(d.toFixed(1));
          }else if(this.sortKey === 'vote_average'){
            return String(d*10)+"%";
          }else if(this.sortKey === 'runtime'){
            runTimeParsing(d);
          }

        }));

    this.svg.append("text")
        .attr("class", "axis-label bar-text")
        .attr("y", this.height-this.margin.bottom/2.5)
        .attr("x",0 + (this.width / 1.8))
        .style("text-anchor", "middle")
        .text(()=>{
          if(this.sortKey === 'revenue'){
            return 'Revenue';
          }else if (this.sortKey === 'budget') {
            return 'Budget';
          }else if (this.sortKey === 'revenue_per_budget') {
            return 'Revenue / Budget';
          }else if(this.sortKey === 'vote_average'){
            return 'Avg. User Score';
          }else if(this.sortKey === 'runtime'){
            return 'Film Length';
          }
        });

    // Now the Y axis and label.
    this.yAxis = this.svg.append("g")
        .attr("class", "bar-axis-y")
        .attr("transform", "translate("+String(this.margin.left+30)+",0)")
        .call(d3.axisLeft(this.y).tickFormat((d)=>{
          // Show only partial text on y-axis
          if (d.length > 20) {
            return (d.substring(0, 20) + "...");
          }else{
            return d;
          }

        }));
  }
  render(){
      //Bars
      let thisViz = this;

      let tooltip = d3.select(".tooltip");

      // tooltip mouseover event handler
      thisViz.tipMouseOver = (event, d) => {

          // Latest D3 version (v6 onward) does not recognize d3.event.pageX & d3.event.pageY
          // It changes to d3.pointer(event, taget_container) where 2 position values (x, y) of the mouse position are returned.
          // 2nd argument is used to calculate the relative location of the tooltip so it can scale upon when the vessel's width and height change.

          let[x, y] = d3.pointer(event, thisViz.svg),
          barLabel,
          barText;

          if(this.sortKey === 'revenue'){
            barLabel = 'Revenue';

            (d[this.sortKey] / 1e6)/1000 >= 1 ?
            barText = '$ ' + String(((d[this.sortKey] / 1e6)/1000).toFixed(1)) + ' Billion' :
            (d[this.sortKey] / 1e6)?
            barText = '$ ' + String((d[this.sortKey] / 1e6).toFixed(1)) + ' Million':
            barText = '$ ' + String((d[this.sortKey]).toFixed(1));

          }else if (this.sortKey === 'budget') {
            barLabel = 'Budget';

            (d[this.sortKey] / 1e6)/1000 >= 1 ?
            barText = '$ ' + String(((d[this.sortKey] / 1e6)/1000).toFixed(1)) + ' Billion' :
            (d[this.sortKey] / 1e6)?
            barText = '$ ' + String((d[this.sortKey] / 1e6).toFixed(1)) + ' Million':
            barText = '$ ' + String((d[this.sortKey]).toFixed(1));

          }else if (this.sortKey === 'revenue_per_budget') {
            barLabel = 'Revenue / Budget';

            barText = "$ "+String(d[this.sortKey].toFixed(1));

          }else if(this.sortKey === 'vote_average'){
            barLabel = 'Avg. User Score';
            barText = String(d[this.sortKey]*10)+"%";

          }else if(this.sortKey === 'runtime'){
            barLabel = 'Film Length';
            barText=runTimeParsing(d);
          }


          let htmlChild  = `<h1 class= 'tooltip-title'>${d.original_title + " ("+d.release_date.slice(0,4)+")"}</h1>
                      <p class='tooltip-sub-title bar-text'> ${barLabel} : <br><span class = 'bar-tooltip-text'>${barText}</span></p>`;

          // `${x+250 > thisViz.width ? String(x-(x+250-thisViz.width)):String(x+10)}`
          // `${y+400 > thisViz.height ? String(y-(y+400-thisViz.height)):String(y+20)}`
          //                     `<img src='https://image.tmdb.org/t/p/original${d.poster_path}' alt="tooltip movie poster" id="tooltip-poster"><br/>`

          tooltip.html(htmlChild)
          .style("left", `${String(x+20)}` + "px")
          .style("top", `${String(y/1.1)}` + "px")
          .transition()
          .duration(200) // ms
          .style("opacity", .9)
          .style("display",'inline-block');

      };
      // tooltip mouseout event handler
      thisViz.tipMouseOut = () => {
        d3.selectAll(".tooltip")
              .transition()
              .duration(200) // ms
              .style("opacity", 0)
              .style("display",'none');
      };

      let bar = thisViz.svg.selectAll("rect")
        .data(thisViz.data)
        .join("rect")
        .attr("x", thisViz.x(0)+30.5)
        .attr("y", d => thisViz.y(d.original_title))
        .attr('class','bar')
        .attr("height", thisViz.y.bandwidth())
        .attr("width",0)
        .on("mouseover", (event,d)=>{
          thisViz.tipMouseOver(event,d);
        })
        .on("mouseout",(event,d)=>{
          thisViz.tipMouseOut();
        })
        .on("click",(event,d)=>{
          windowShield(true);
          createPopUp(d, 'scatterplot');
        })
        .transition()
        .ease(d3.easeBounce)
        .delay((d,i) => {return i*75})
        .duration(500)
        .attr("width", d => thisViz.x(d.revenue_per_budget)-thisViz.margin.left-1);

  }
  updateChart(updatedVal,sortKey=''){
    let thisViz = this


    if(sortKey !== ''){
      thisViz.sortKey = sortKey;
    }


    this.dataSortedAll = thisViz.originalData.sort((prev,now)=>{
      let order;
      prev[thisViz.sortKey] > now[thisViz.sortKey]? order = -1 : order = 1;
      return order
    });

    // Filter data
    thisViz.filteredData = [];
    thisViz.filteredDataSorted = thisViz.dataSortedAll.filter((dataPt)=>{
      if(updatedVal.genre === 'All' && updatedVal.profitType === 'All'){
        // Default
        return true
      }else if (updatedVal.genre !== 'All' && updatedVal.profitType === 'All') {
        // Filter Genre Only
        for(let item of dataPt.genres){
          if(item.name.includes(updatedVal.genre)){
            return true
          }
        }
      }else if (updatedVal.genre === 'All' && updatedVal.profitType !== 'All'){
        // Filter Profit Only
        if (updatedVal.profitType === 'Earned') {
          return dataPt.revenue > dataPt.budget;
        }else if (updatedVal.profitType === 'Lost') {
          return dataPt.revenue < dataPt.budget;
        }
      }else{
        // Filter Both
        if (updatedVal.profitType === 'Earned'){
          for(let item of dataPt.genres){
            if(item.name.includes(updatedVal.genre) && dataPt.revenue > dataPt.budget){return true}
          }
        }else if (updatedVal.profitType === 'Lost') {
          for(let item of dataPt.genres){
            if(item.name.includes(updatedVal.genre) && dataPt.revenue < dataPt.budget){return true}
          }
        }
      }
    });

    // Set retrieved amount of the top ranked data
    if(this.filteredDataSorted.length>=15){
      this.dataNum = [...Array(15).keys()];
    }else{
      this.dataNum = [...Array(this.filteredDataSorted.length).keys()];
    }



    for (let index of this.dataNum) {
      thisViz.filteredData.push(thisViz.filteredDataSorted[index]);
    }

    // Define a 2-d array to store revenue&budget data to calculate min max value for coordinate system (x: budget, y: revenue)

    this.coordDomainData = {
      'metrics' : [...thisViz.filteredData.map((dataPt) => dataPt[thisViz.sortKey])],
      'movieName' : [...thisViz.filteredData.map((dataPt) => dataPt.original_title)]
    };



    // Define a variety of scales, for color, x axis and y axis.
    this.x = d3.scaleLinear()
                // Define min & max value within the data we use to visualize
                .domain([0, d3.max(thisViz.coordDomainData['metrics'])+d3.max(thisViz.coordDomainData['metrics'])*0.1])
                .range([thisViz.margin.left, thisViz.width-thisViz.margin.right]);

    this.y = d3.scaleBand()
                .domain(thisViz.coordDomainData.movieName)
                .range([thisViz.margin.top,thisViz.height-thisViz.margin.bottom])
                .padding(.1);

    // Add axes.  First the X axis and label.
    this.xAxis = this.svg.select(".bar-axis-x")
        .transition().duration(900)
        .attr("transform", "translate(30,"+(this.height-this.margin.bottom)+")")
        .call(d3.axisBottom(this.x).ticks(6).tickPadding([15]).tickFormat((d)=>{
          if(this.sortKey === 'revenue' || this.sortKey === 'budget'){
            let textForm;
            (d / 1e6)/1000 >= 1 ?
            textForm = '$ ' + String(((d / 1e6)/1000).toFixed(1)) + 'B' :
            textForm = '$ ' + String((d / 1e6).toFixed(1)) + 'M'

            return textForm;
          }else if (this.sortKey === 'revenue_per_budget') {
            return "$ "+String(d.toFixed(1));
          }else if(this.sortKey === 'vote_average'){
            return String(d*10)+"%";
          }else if(this.sortKey === 'runtime'){
            // console.log('yes');
            // runTimeParsing(d);
            let time = String(parseInt(d/60))+"h"+" "+String(d%60)+"m";
            return time
          }

        }));

    this.svg.select("text.axis-label")
    .text(()=>{
      if(this.sortKey === 'revenue'){
        return 'Revenue';
      }else if (this.sortKey === 'budget') {
        return 'Budget';
      }else if (this.sortKey === 'revenue_per_budget') {
        return 'Revenue / Budget';
      }else if(this.sortKey === 'vote_average'){
        return 'Avg. User Score';
      }else if(this.sortKey === 'runtime'){
        return 'Film Length';
      }
    });

    // Now the Y axis and label.
    this.yAxis = this.svg.select(".bar-axis-y")
        .transition().duration(900)
        .attr("transform", "translate("+String(this.margin.left+30)+",0)")
        .call(d3.axisLeft(this.y).tickFormat((d)=>{
          // Show only partial text on y-axis
          if (d.length > 20) {
            return (d.substring(0, 20) + "...");
          }else{
            return d;
          }
        }));

    // Destroy all bar chart and remake them all over again
    thisViz.svg.selectAll("rect").remove();

      let bar = thisViz.svg.selectAll("rect")
        .data(thisViz.filteredData)
        .join("rect")
        .attr("x", thisViz.x(0)+30.5)
        .attr("y", d => thisViz.y(d.original_title))
        .attr('class','bar')
        .attr("height", thisViz.y.bandwidth())
        .attr("width",0)
        .on("mouseover", (event,d)=>{
          thisViz.tipMouseOver(event,d);
        })
        .on("mouseout",(event,d)=>{
          thisViz.tipMouseOut();
        })
        .on("click",(event,d)=>{
          windowShield(true);
          createPopUp(d, 'scatterplot');
        })
        .transition()
        .ease(d3.easeBounce)
        .delay((d,i) => {return i*50})
        .duration(500)
        .attr("width", d => thisViz.x(d[this.sortKey])-thisViz.margin.left-1);
  }
}

// Define a bubble chart object
class BubbleChart {
  constructor(containerId, data){
    this.data = data;
    this.containerId = containerId;

    // These variables are used to define size of the visualization canvas and the
    // margin (or "padding") around the scattter plot.  We use the margin to draw
    // things like axis labels.
    this.containerId = containerId;
    this.height = 300;
    this.width = 300;
    this.margin = {
      top:10,
      right:10,
      left:10,
      bottom: 10
    };

    // Create the SVG canvas that will be used to render the visualization.
    this.svg = d3.select("#"+this.containerId)
                .append("svg")
                .attr("width", this.width)
                .attr("height", this.height);
  }
  render(){
    let thisViz = this;

  }
  updateChart(){

  }
}

// Define a radar chart object
class RadarChart {
  constructor(containerId, data){
    this.data = data;
    this.containerId = containerId;
  }
  render(){

  }
  updateChart(){

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

// Define a Function to display the main page
let displayMain = (pageNum, maxPageNum) => {
  let trendyMovieApiUrl = `https://api.themoviedb.org/3/trending/movie/week?api_key=${ApiKey_Phillip}&page=${pageNum}`;

  // Get Trendy Movies
  fetch(trendyMovieApiUrl)
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
            dataMovie.financial_balance = dataMovie.revenue - dataMovie.budget;
            dataMovie.revenue_per_budget = dataMovie.revenue / dataMovie.budget;
            movieDataTrendy.push(dataMovie);
          })
        );
      }

      // Set a Promise.all(), which take a iterable as input, an iterable like array [] or object {}, once when resolved (finished), it will process next lines of codes in the subsequent .then(...)
      Promise
      .all(promises)
      .then(()=>{
        movieDataTrendy = movieDataTrendy.filter(item => item.revenue>0 && item.budget>0 && item.poster_path);
        // console.log(movieDataTrendy);
        return dataTrendy;
      })
      .then(data => {

        if(data.total_pages > 1 && pageNum < maxPageNum){

          pageNum++;
          displayMain(pageNum, maxPageNum);

        }else{
          Promise
          // Render the whole HTML Components of the main page
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
                  <h1>Weekly Trending Movies Finance Breakdown</h1>
                  <div class='filter'>
                    <p>Movie Genres :</p>
                    <select id='genre_scatterplot_filter'>
                      <option value = 'All'>All</option>
                    </select>
                    <p>Financial Balance :</p>
                    <select id='profit_scatterplot_filter'>
                      <option value = 'All'>All</option>
                      <option value = 'Earned'>Earned</option>
                      <option value = 'Lost'>Lost</option>
                    </select>
                  </div>
                  <div id= 'trendyScatter'>
                    <div class='tooltip' style='opacity: 0;'>
                    </div>
                  </div>
                </div>
                <div id="celebity-trendy-list">
                  <h1>Weekly Trending Celebrities</h1>
                  <div id= 'trendyPerson'></div>
                </div>
              `;
              rightSec.innerHTML = `
                <div id="trendy-barchart">
                  <h1>Top Ranking of The Weekly Trending Films</h1>
                  <p>Top 15 movies if any</p>
                  <div id='barchart-filter-container'>
                    <div class='filter-group'>
                      <input type="radio" id="revenue_per_budget" name="bar-filter-options" checked><label for="revenue_per_budget">Revenue / Budget</label>
                    </div>
                    <div class='filter-group'>
                      <input type="radio" id="vote_average" name="bar-filter-options"><label for="vote_average">Avg. User Score</label>
                    </div>
                    <div class='filter-group'>
                      <input type="radio" id="revenue" name="bar-filter-options"><label for="revenue">Revenue</label>
                    </div>
                    <div class='filter-group'>
                      <input type="radio" id="budget" name="bar-filter-options"><label for="budget">Budget</label>
                    </div>
                    <div class='filter-group'>
                      <input type="radio" id="runtime" name="bar-filter-options"><label for="runtime">Film Length</label>
                    </div>
                  </div>
                  <div id= 'trendyBar'><div>
                </div>
              `;

            })()])
          // Render the scatterplot & Bar Chart
          // Clean up the UI (Hide preloader / set page at the top & reset local storage of pageYOffset as 0) / Finish loading with d3 animation
          .then(()=>{
            let trendyPersonApiUrl = `https://api.themoviedb.org/3/trending/person/week?api_key=${ApiKey_Phillip}&page=1`;

            // Get Trendy People
            fetch(trendyPersonApiUrl)
              .then(res => res.json())
              .then(personTrendy=>{
                // filter out people without a photo
                let personTrendyFiltered = personTrendy.results.filter(d=> d.profile_path);

                for (let i = 0; i < personTrendyFiltered.length/2; i++) {
                  trendyPersonList += `
                  <div class='trendy-person-container'>
                    <p class="trendy-person-name" >${personTrendyFiltered[i].name}</p>
                    <img src = 'https://image.tmdb.org/t/p/original${personTrendyFiltered[i].profile_path}' alt="movie star's profile picture" id="${personTrendy.results[i].id}" class='main-trendy-poster'>
                  </div>
                  `;
                }

                let personTrendyNode = document.getElementById('trendyPerson');
                personTrendyNode.innerHTML = trendyPersonList,
                personTrendyPhotos = document.getElementsByClassName('main-trendy-poster');

                for(let img of personTrendyPhotos){
                  img.addEventListener('click',()=>{
                    window.location.hash = `person_id=${img.id}`;
                  });
                }

              });


            // Hide the preloader
            hidePreloader();
            // Place page location on top
            window.scroll(0, 0);
            // If user return all open the home page set the localStorage of page position -> 0
            localStorage.setItem('prevLocation', 0);

            // Initiate simple animation
            let mainVizSection = d3.selectAll('.container');
            mainVizSection.style('opacity','0')
                          .transition()
                          .duration(400)
                          .style('opacity','1');
          })
          .then(()=>{
            // Initiate scatterplot
            let trendyScatterPlot = new ScatterPlot('trendyScatter', movieDataTrendy, 700, 500);
            trendyScatterPlot.render();

            // Render Bar Chart
            let trendyBars = new BarChart('trendyBar',movieDataTrendy, 15, 600, 850);
            trendyBars.render();
            //fill in movie genres
            let genreList = [],
            genreOptionHolder = document.getElementById('genre_scatterplot_filter')
            ,profitOptionHolder = document.getElementById('profit_scatterplot_filter'),
            sortedBtn = document.querySelectorAll('input[name="bar-filter-options"]');

            fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${ApiKey_Phillip}&language=en-US`)
              .then(res => res.json())
              .then(data =>{

                for(let genre of data.genres){
                  let option = document.createElement('option');
                  option.value = genre.name;
                  option.innerText = genre.name;
                  genreOptionHolder.appendChild(option);
                }
              })
              .then(()=>{
                genreOptionHolder.addEventListener('change',(event)=>{
                  // Update scatterplot
                  let updatedVal = {
                    'genre': event.target.value,
                    'profitType': profitOptionHolder.value
                  }
                  trendyScatterPlot.updateChart(updatedVal);
                  trendyBars.updateChart(updatedVal);
                });
                profitOptionHolder.addEventListener('change',(event)=>{
                  let updatedVal = {
                    'genre': genreOptionHolder.value,
                    'profitType': event.target.value
                  }
                  // Update scatterplot
                  trendyScatterPlot.updateChart(updatedVal);
                  trendyBars.updateChart(updatedVal);
                });

                for(let ele of sortedBtn){
                    ele.addEventListener('change',()=>{
                      let updatedVal = {
                        'genre': genreOptionHolder.value,
                        'profitType': profitOptionHolder.value
                      }
                      trendyBars.updateChart(updatedVal, ele.id);
                    });
                }
              });
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
            return (item.release_date) && (item.overview) && (item.poster_path);
          }else if (item.media_type === 'person') {
            return item.profile_path;
          }
        });

        //Hide the preloader
        hidePreloader();

        // Loop the search result into the search page
        //Render aLL Search Page HTML Components
        for(let search of queryDataCleaned){

          if(search.media_type==='person'){

            // anchor link reference
            // Person: <a class='searchResultsLink' href='index.html#person_id=${search.id}'>${search.name}</a>
            // Movie: <a class='searchResultsLink' href='index.html#movie_id=${search.id}'>${search.title}</a>

            searchResults.innerHTML +=
            `<div class='searchResults'>

              <span id='${search.id}' class='searchResultsLink person'>${search.name}</span>
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
              <span id='${search.id}' class='searchResultsLink movie'>${search.title}</span>
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

      let locationY;
      let scrollingPosition = () => {
        locationY = window.pageYOffset;
      }
      // Add an event listener to remember the scrolling location
      document.addEventListener('scroll', scrollingPosition);

      // Loop through all span tag to add a click event that will alter the location.hash upcon clicking
      for(let ele of document.querySelectorAll('span.searchResultsLink')){
        ele.addEventListener('click',()=>{
          let queryId = ele.id;
          if(ele.classList.contains('movie')){
            window.location.hash = `movie_id=${queryId}`;
          }else{
            window.location.hash = `person_id=${queryId}`;
          }

          localStorage.setItem('prevLocation', locationY);
          document.removeEventListener('scroll', scrollingPosition);
        });
      }

    })
    .then(()=>{
      localStorage.getItem('prevLocation') === null? window.scroll(0, 0) : window.scroll(0, Number(localStorage.getItem('prevLocation')));
      // Initiate simple animation
      let searchSection = d3.selectAll('.container.search');
      searchSection.style('opacity','0')
                    .transition()
                    .duration(600)
                    .style('opacity','1');
    })
    // .catch(e => console.log('error'));
}

// Define a Function to display movie page
let displayMovie = () => {
  let movieId = window.location.hash.replace('#movie_id=','');
  let main = document.querySelector('main');
  let apiUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${ApiKey_Phillip}&language=en-US&append_to_response=credits,similar,recommendations,videos`

  main.id = 'index-movie';

  fetch(apiUrl)
    .then(res => res.json())
    .then(data => {

      console.log(data);
      // Build Movie's Viz Block
      let main = document.querySelector('main');
      let profileSection = createVizSection('movie-profile-section', ' movie');
      let vizSection = createVizSection('movie-viz-section', ' movie');
      let similarFilm = [];
      let promises = [];
      // return button element depends on the availability of trailor link
      let trailorDetector = () => {
        if(data.videos.results.length > 0){

          for(let dPt of data.videos.results){
            if(dPt.name.toLowerCase().includes('official trailer')){
              // if the video object's name contains partial string: 'official trailer', return the video key
              return `<button id="${dPt.key}" class='trailor-button'>Watch Trailer</button>`
            }else if (dPt.name.toLowerCase().includes('trailer')) {
              // if the video object's name does not contain 'official trailer', but does contain 'trailer', then also return the video key
              return `<button id="${dPt.key}" class='trailor-button'>Watch Trailer</button>`
            }
          }
          // If run thru all video items, aka the for lopp finish, and there's still no official trailer, then return unclickable btn
          return `<button id="unclickable-btn" disabled>No Trailor Available</button>`

        }else{
          return `<button id="unclickable-btn" disabled>No Trailor Available</button>`
        }
      }


      main.style.display = 'flex';
      main.appendChild(profileSection);
      main.appendChild(vizSection);

      profileSection.innerHTML = `
        <div class='popup-window' id='trailer-frame' style = 'opacity:0;display:none;'>
          <iframe src allowfullscreen allow="autoplay"></iframe>
          <span id='trailer-close-btn' class='close-btn'>x</span>
        </div>
        <div>
          <span>${data.original_title}</span>
          <img src='https://image.tmdb.org/t/p/original${data.poster_path}' alt="movie poster" id="poster">
          <h1>Film Info</h1>
          <h2>Release Date</h2>
          <p>${data.release_date}</p>
          <h2>Genre</h2>
          <div class='movie-genre-container'>${displayGenres(data)}</div>
          <h2>Budget</h2>
          <p>${data.budget <= 0 ? '-': String('$')+ String(data.budget)}</p>
          <h2>Revenue</h2>
          <p>${data.revenue <= 0 ? '-': String('$')+ String(data.revenue)}</p>
          ${trailorDetector()}
        </div>
      `;
      vizSection.innerHTML = `
        <div class='left-viz'>
          <div id='movie-scatterplot-container' class="data-viz-container">
            <h1>Similar Movies Finance Breakdown</h1>
            <div class='movie filter'>
              <p>Movie Genres :</p>
              <select id='genre_scatterplot_filter'>
                <option value = 'All'>All</option>
              </select>
              <p>Financial Balance :</p>
              <select id='profit_scatterplot_filter'>
                <option value = 'All'>All</option>
                <option value = 'Earned'>Earned</option>
                <option value = 'Lost'>Lost</option>
              </select>
            </div>
            <div id= 'trendyScatter'>
              <div class='tooltip' style='opacity: 0;'>
              </div>
            </div>
          </div>
          <div id='movie-casting-container' class="data-viz-container">
            <h1>Top 10 Casting</h1>
            <div id='phote-container'>
            </div>
          </div>
        </div>
        <div class='right-viz'>
          <div id='movie-bar-container' class="data-viz-container">
            <h1>Top Ranking of The Similar Films</h1>
            <p>Top 10 movies if any</p>
            <div id='barchart-filter-container'>
              <div class='filter-group'>
                <input type="radio" id="revenue_per_budget" name="bar-filter-options" checked><label for="revenue_per_budget">Revenue / Budget</label>
              </div>
              <div class='filter-group'>
                <input type="radio" id="vote_average" name="bar-filter-options"><label for="vote_average">Avg. User Score</label>
              </div>
              <div class='filter-group'>
                <input type="radio" id="revenue" name="bar-filter-options"><label for="revenue">Revenue</label>
              </div>
              <div class='filter-group'>
                <input type="radio" id="budget" name="bar-filter-options"><label for="budget">Budget</label>
              </div>
              <div class='filter-group'>
                <input type="radio" id="runtime" name="bar-filter-options"><label for="runtime">Film Length</label>
              </div>
            </div>
          </div>
        </div>
      `;

      let castContainer = document.getElementById('phote-container');
      let castEle = '';
      let casts = data.credits.cast.filter(d=>d.profile_path);
      let castList;

      casts.length >= 10? castList = 10 : castList = casts.length

      for (let i = 0; i < castList; i++) {
        castEle += `
        <div class='trendy-person-container'>
          <p class="trendy-person-name" >${casts[i].name}</p>
          <img src = 'https://image.tmdb.org/t/p/original${casts[i].profile_path}' alt="movie star's profile picture" id="${casts[i].id}" class='main-trendy-poster'>
        </div>
        `;
      }

      castContainer.innerHTML = castEle;
      let personPhotos = document.getElementsByClassName('main-trendy-poster');

      for(let img of personPhotos){
        img.addEventListener('click',()=>{
          window.location.hash = `person_id=${img.id}`;
        });
      }

      // Get similar movies based on recommendations
      for (let d of data.recommendations.results.filter((d)=>d.media_type==='movie')) {
        promises.push(
          fetch(`https://api.themoviedb.org/3/movie/${d.id}?api_key=${ApiKey_Phillip}&language=en-US`)
            .then(res => res.json())
            .then(dataSimilar => {
              dataSimilar.revenue_per_budget = dataSimilar.revenue/dataSimilar.budget;
              dataSimilar.financial_balance = dataSimilar.revenue - dataSimilar.budget;
              similarFilm.push(dataSimilar)
            })
        );
      }

      Promise.all(promises)
      .then(()=>{
        let dataFiltered = similarFilm.filter(d=>d.revenue>0 && d.budget>0 && d.poster_path!=='');

        // Initiate scatterplot
        let trendyScatterPlot = new ScatterPlot('movie-scatterplot-container', dataFiltered, 500, 380);
        trendyScatterPlot.render();

        // Render Bar Chart
        let trendyBars = new BarChart('movie-bar-container',dataFiltered, 10, 500, 680);
        trendyBars.render();
        //fill in movie genres
        let genreList = [],
        genreOptionHolder = document.getElementById('genre_scatterplot_filter')
        ,profitOptionHolder = document.getElementById('profit_scatterplot_filter'),
        sortedBtn = document.querySelectorAll('input[name="bar-filter-options"]');

        fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${ApiKey_Phillip}&language=en-US`)
          .then(res => res.json())
          .then(data =>{

            for(let genre of data.genres){
              let option = document.createElement('option');
              option.value = genre.name;
              option.innerText = genre.name;
              genreOptionHolder.appendChild(option);
            }
          })
          .then(()=>{
            genreOptionHolder.addEventListener('change',(event)=>{
              // Update scatterplot
              let updatedVal = {
                'genre': event.target.value,
                'profitType': profitOptionHolder.value
              }
              trendyScatterPlot.updateChart(updatedVal);
              trendyBars.updateChart(updatedVal);
            });
            profitOptionHolder.addEventListener('change',(event)=>{
              let updatedVal = {
                'genre': genreOptionHolder.value,
                'profitType': event.target.value
              }
              // Update scatterplot
              trendyScatterPlot.updateChart(updatedVal);
              trendyBars.updateChart(updatedVal);
            });

            for(let ele of sortedBtn){
                ele.addEventListener('change',()=>{
                  let updatedVal = {
                    'genre': genreOptionHolder.value,
                    'profitType': profitOptionHolder.value
                  }
                  trendyBars.updateChart(updatedVal, ele.id);
                });
            }
          });
        });

    })
    // Impelement trailor function
    .then(()=>{
      let trailerFrame = d3.select('#trailer-frame'),
      trailerPlayer = d3.select('#trailer-frame>iframe'),
      btnEle = document.getElementsByClassName('trailor-button');

      openTrailer = () =>{
        trailerPlayer.attr('src', `https://www.youtube.com/embed/${btnEle[0].id}?wmode=transparent&amp;rel=0&autoplay=1`);
        trailerFrame
        .style('display','inline-block')
        .style('opacity','0')
        .transition()
        .duration(600)
        .style('opacity','1');
      },
      closeTrailer = () =>{
        trailerPlayer.attr('src', '');
        trailerFrame
        .style('opacity','1')
        .transition()
        .duration(600)
        .style('opacity','0')
        .end()
        .then(()=>{
          trailerFrame.style('display','none')
        });

      };

      // If button is clickabel, aka there's trailer, then add event listener
      if(btnEle[0]){
        btnEle[0].addEventListener('click',()=>{

          windowShield(false,trailerFrame,trailerPlayer);
          openTrailer();

        });
        document.getElementById('trailer-close-btn').addEventListener('click',()=>{
          closeTrailer();
          // Close the window shield
          d3.select('div.cover')
          .style("opacity", .6)
          .transition()
          .duration(300)
          .style("opacity", 0)
          .end()
          .then(()=>d3.select('div.cover').remove());

        });
      }
    })
    .then(()=>{

      // Hide the preloader
      hidePreloader();
      // Place page location on top
      window.scroll(0, 0);
      // Initiate simple animation
      let movieVizSection = d3.selectAll('.container.movie');
      movieVizSection.style('opacity','0')
                    .transition()
                    .duration(600)
                    .style('opacity','1');
    })
    .catch(e => console.log('error'));
}

// Define a Function to display person page
let displayPerson = () => {

  let personId = window.location.hash.replace('#person_id=','')
  let main = document.querySelector('main');
  main.id = 'index-person';

  fetch(`https://api.themoviedb.org/3/person/${personId}?api_key=${ApiKey_Phillip}&language=en-US&append_to_response=movie_credits`)
    .then(res => res.json())
    .then(data => {
      // creditsData is an array data contains all the credited movies (cast + crew),
      // this will be used to build the Radar Chart!!
      let creditsData = [];

      // Collaboration data will be used to build bubble chart and bar chart
      // Initiate a promise array
      let promises = [];

      // Clean up the movie credits data, adding 1 attribute, 'creditType' in each data object
      // to identify whether the movie star is a 'cast' or just a 'crew'
      let getCredit = (target, d, creditName, movieName = 'na') =>{
        // loop through list of 'cast' & list of 'crew' (represented by 'creditType')
          for(let creditType in d[creditName]){
            for(let credit of d[creditName][creditType]){
              credit.creditType = creditType;
              if (movieName === 'na') {
                target.push(credit);
              }else if(Number(credit.id) !== Number(d.id)){
                // credit data will include the original movie star, so remove it
                credit.colabMovie = d.original_title;
                credit.colabMovieId = d.id;
                target.push(credit);
              }
            }
          }
      }

      getCredit(creditsData, data,'movie_credits');

      // Finished parsing data for radar chart then proceed processing data for network / bubble chart
      Promise.all(creditsData)
      // parsing collaboration data for network chart / bubble chart
      .then(()=>{
        console.log(creditsData);
        for(let d of creditsData){

          let apiUrl = `https://api.themoviedb.org/3/movie/${d.id}?api_key=${ApiKey_Phillip}&language=en-US&append_to_response=credits`

          promises.push(
            fetch(apiUrl)
              .then(res => res.json())
              .then(data => {
                getCredit(collaborationData, data, 'credits', 'people_credits');
              })
          );
        }

        // Promise when collaborationData has been finished constructing
        // Do the Data Viz Here
        Promise.all(promises)
        .then(()=>{
          // Filter out the collaborationData where
          collaborationData = collaborationData.filter((d)=> d.id !== data.id);
          // console.log(collaborationData);


          // collaborationId = [... new Set(collaborationData.map(d=>d.id))]
          // collaborationFrequencyUnique = d3.rollup(collaborationData, dpt => [... new Set(dpt.map(d=>d.colabMovieId))].length  , d => d.name);


          // To convert a map to a regular object of array -> [...MapObjectName]
          // Group the collaboration data by

          // Collaboration Star Name is store in the 'colabMovie' key, access by collaborationFrequency[i].colabMovie[0].name
          collaborationFrequency = [...d3.group(collaborationData, d => d.id, d=>d.colabMovieId)]
                                   .map(item => {
                                      return{
                                          'id':item[0],
                                          'colabMovie': [...item[1].values()].map(d=>d[0])
                                      }
                                  });

          // collaborationFrequency = [...d3.group(collaborationData, d => d.id, d => d.name, d=>d.colabMovie)]
          //                          .map(item => {
          //                             return{
          //                                 'id':item[0],
          //                                 'name':[...item[1]][0][0],
          //                                 'colabMovie': [...[...item[1]][0][1].values()].map(d=>d[0])
          //                             }
          //                         });
        });

      })
      // parsing the HTML components of the page
      .then(()=>{
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
        <div id="person-radar-chart" class="data-viz-container">
          radar chart
        </div>
        <div id="person-bubble-chart" class="data-viz-container">
          bubble chart
        </div>
        <div id="person-bar-chart" class="data-viz-container">
          bar chart
        </div>
        `;
      })
      .then(()=>{
        // Hide the preloader
        hidePreloader();
        // Place page location on top
        window.scroll(0, 0);
        // Initiate simple animation
        let personVizSection = d3.selectAll('.container.person');
        personVizSection.style('opacity','0')
                      .transition()
                      .duration(600)
                      .style('opacity','1');
      })
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

    collaborationData = [];
    collaborationFrequency = [];

    mainVizSection.remove();
    displayPerson();

  }else if(window.location.hash.includes('#movie_id=')){
    // Set the display property = 'none' for all the data viz sections at the home page.
    // Then display the movie page

    mainVizSection.remove();
    displayMovie();

  }else{
    movieDataTrendy = [];
    trendyPersonList = '';

    mainVizSection.remove();
    displayMain(1,6);
  }

}

// Define a function to hide preloader
let hidePreloader = () => {
  // Hide the preloader
  d3.select('.preloader')
    .style('display','none')
    .transition()
    .duration(300);
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
    //If search function fire, then set the page location back on top
    localStorage.setItem('prevLocation', 0);
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

      // Show the preloader When the Hash change
      d3.select('.preloader')
        .style('display','block')
        .transition()
        .duration(200);

      // Rerun the display() function
      display();
      //              });
});

document.getElementById('tmdbLogo').addEventListener('click', ()=>{
  // Clear all the previous trendy data
  if (window.location.hash !== 'main') {
    movieDataTrendy = [];
    window.location.hash = 'main';
  }
});
