const ApiKey_Thomas = '844ff7cd27e44a9424544c4b3c852920';
let netdatain =[];

//For testing
testid = 10859

//Gathering the basic actor information
function actordata(personid){

        // Fetching basic actor information
    fetch(`https://api.themoviedb.org/3/person/${personid}?api_key=${ApiKey_Thomas}&language=en-US`)
        .then(res => res.json())
        .then(data => {

            personname = data.name
            //Writing name
            document.getElementById('name').innerHTML = data.name;

            //Drawing Image
            document.getElementById('image').width = '250'
            document.getElementById('image').height = '350'
            document.getElementById('image').src = `https://image.tmdb.org/t/p/original${data.profile_path}`;

            //Declaring gender
            function getgender(value){
                if (value === 1) {
                    return 'Female';
                } else if (value === 2) {
                    return 'Male';
                } else {
                    return 'Non-Binary';
                }
            }

            //Writing gender
            document.getElementById('gender').innerHTML = getgender(data.gender);

            //Parsing Birthday;
            let parser = d3.timeParse("%Y-%m-%d")
            let birthdate = parser(data.birthday);

            //Name of month
            let formatMonth = d3.timeFormat("%B");
            let month = formatMonth(birthdate)

            //Get Age
            let age = new Date().getFullYear() - birthdate.getFullYear()

            //Writing birthday
            document.getElementById('dob').innerHTML = month+' '+birthdate.getDate()+', '+birthdate.getFullYear()+ ' ('+age+' years old)';

            //Writing birthplace
            document.getElementById('birthplace').innerHTML = data.place_of_birth;
    })
    // Fetching social info
    fetch(`https://api.themoviedb.org/3/person/${personid}/external_ids?api_key=${ApiKey_Thomas}&language=en-US`)
        .then(res => res.json())
        .then(data => {
            document.getElementById('insta').href = `https://www.instagram.com/${data.instagram_id}/`
            document.getElementById('twit').href = `https://twitter.com/${data.twitter_id}/`
        })
    // Fetching Actual data and charts
    fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=7540b6e4f23a1f8e3a9540f91f80b927&language=en-US`)
        .then(res => res.json())
        .then(data => {

            let filler = data.genres

            //list of genre names for radar
            genrelist = filler.map(item => {
                return { axis: item.name, id: item.id };
            });
            //give them 0 value now to avoid errors
            for (let i = 0; i < genrelist.length; ++i) {
                genrelist[i]['value'] = 0;
            }
        })
    // Fetching Actual data and charts
    fetch(`https://api.themoviedb.org/3/person/${personid}/movie_credits?api_key=${ApiKey_Thomas}&language=en-US`)
        .then(res => res.json())
        .then(data => {

            //Write credits number
            document.getElementById('credits').innerHTML = data.cast.length + data.crew.length;

            // Create radar chart
            let radarw = 405,
                radarh = 250

            /*                //Legend titles
                            let LegendOptions = ['Actor', 'Producer', 'Director', 'Writer'];*/

            //Options for the Radar chart, other than default
            let options = {
                w: radarw,
                h: radarh,
                levels: 4,
                ExtraWidthX: 300
            }
            let id = "#chart"

            series = 0;

            var cfg = {
                radius: 5,
                w: 600,
                h: 600,
                factor: 1,
                factorLegend: .85,
                levels: 3,
                radians: 2 * Math.PI,
                opacityArea: 0.5,
                ToRight: 5,
                TranslateX: 175,
                TranslateY: 40,
                ExtraWidthX: 0,
                ExtraWidthY: 100,
                color: d3.schemeGnBu[9]
            };

            if('undefined' !== typeof options){
                for(var i in options){
                    if('undefined' !== typeof options[i]){
                        cfg[i] = options[i];
                    }
                }
            }


            var radius = cfg.factor*Math.min(cfg.w/2, cfg.h/2);
            var Format = d3.format('%');

            var g = d3.select(id)
                .append("svg")
                .attr("width", cfg.w+cfg.ExtraWidthX)
                .attr("height", cfg.h+cfg.ExtraWidthY)
                .append("g")
                .attr("transform", "translate(" + cfg.TranslateX + "," + cfg.TranslateY + ")");

            d3.select(id).select("svg")
                .append("rect")
                .attr("width", cfg.w+cfg.ExtraWidthX-100)
                .attr("height", cfg.h+cfg.ExtraWidthY-5)
                .attr("x", 79)
                .attr("y", 1)
                .attr("rx", 20)
                .attr("ry", 20)
                .style("fill-opacity", 0)
                .style("stroke", 2)
                .style("stroke", "black");

            //Text indicating at what % each level is
            /*for(var j=0; j<cfg.levels; j++){
                var levelFactor = cfg.factor*radius*((j+1)/cfg.levels);
                g.selectAll(".levels")
                    .data([1]) //dummy data
                    .enter()
                    .append("svg:text")
                    .attr("x", function(d){return levelFactor*(1-cfg.factor*Math.sin(0));})
                    .attr("y", function(d){return levelFactor*(1-cfg.factor*Math.cos(0));})
                    .attr("class", "legend")
                    .style("font-family", "sans-serif")
                    .style("font-size", "10px")
                    .attr("transform", "translate(" + (cfg.w/2-levelFactor + cfg.ToRight) + ", " + (cfg.h/2-levelFactor) + ")")
                    .attr("fill", "#737373")
                    .text(Format((j+1)*cfg.maxValue/cfg.levels));
            }*/

            window.drawRadar = function() {

                //Calculate radar chart values
                function getdata(d) {

                    let count = d3.flatRollup(d, v => v.length, m => m)
                    let max = 0
                    let high = 0
                    for (let i = 0; i < count.length; ++i) {
                        max += count[i][1]
                        if (count[i][1] > high) {
                            high = count[i][1]
                        }
                    }
                    let newcount = [];

                    for (let j = 0; j < count.length; ++j) {
                        let temp = {}

                        //Scaling so it looks better
                        temp['value'] = (((count[j][1]/max) + (high/max)/4)/1.25);
                        temp['id'] = count[j][0];

                        newcount[j] = temp;
                    }

                    return genrelist.map(d => ({...d, ...newcount.find(v => v.id === d.id)})).map(({id, ...d}) => d);
                }

                let actgen = d3.merge(data.cast.map(function (d) {
                    return d.genre_ids
                })).filter(Boolean).sort();

                let dirgen = Array.prototype.concat.apply([], data.crew.map(function (d) {
                    if (d.department === 'Director') {
                        return d.genre_ids
                    }
                })).filter( Boolean ).sort();
                let prodgen = Array.prototype.concat.apply([], data.crew.map(function (d) {
                    if (d.department === 'Production') {
                        return d.genre_ids
                    }
                })).filter( Boolean ).sort();
                let writgen = Array.prototype.concat.apply([], data.crew.map(function (d) {
                    if (d.department === 'Writing') {
                        return d.genre_ids
                    }
                })).filter( Boolean ).sort();



                //Button inputs
                let inputs = document.querySelectorAll('input[class="radarcheck"]');
                let d = [];

                //Filling data with active inputs
                let fill = [getdata(actgen),  getdata(dirgen), getdata(prodgen), getdata(writgen)]
                for (let k = 0; k < fill.length; ++k) {
                    if (inputs[k].checked === true) {
                        d.push(fill[k])
                    }
                }

                //Check if all are empty (No problems, just prevents errors)
                if (d.length === 0){
                    return;
                }

                for (let i = d[0].length-1; i > 0; --i) {
                    let counter = 0;
                    for (let j = 0; j < d.length; ++j) {
                        counter = counter + d[j][i].value
                    }

                    if (counter === 0) {
                        for (let j = 0; j < d.length; ++j) {
                            d[j].splice(i, 1)
                        }
                    }
                }
                console.log(d)

                //get max scale
                let maxvalue = 0.01;
                for (let i = 0; i < d.length; ++i) {
                    if (d3.max(d[i], v => v.value ) > maxvalue){
                        maxvalue = d3.max(d[i], v => v.value);
                    }
                }
                var allAxis = (d[0].map(function(i, j){return i.axis}));
                var total = allAxis.length;

                g.selectAll("g").remove()

                g.selectAll(".segm").remove()

                var axis = g.selectAll(".axis")
                    .data(allAxis)
                    .enter()
                    .append("g")
                    .attr("class", "axis");

                axis.append("text")
                    .attr("class", "legend")
                    .text(function(d){return d})
                    .style("font-family", "sans-serif")
                    .style("font-size", "11px")
                    .attr("text-anchor", "middle")
                    .attr("dy", "1.5em")
                    .attr("transform", function(d, i){return "translate(0, -10)"})
                    .attr("x", function(d, i){return cfg.w/2*(1-cfg.factorLegend*Math.sin(i*cfg.radians/total))-60*Math.sin(i*cfg.radians/total);})
                    .attr("y", function(d, i){return cfg.h/2*(1-Math.cos(i*cfg.radians/total))-20*Math.cos(i*cfg.radians/total);});

                //Circular segments
                for(var j=0; j<cfg.levels-1; j++){
                    var levelFactor = cfg.factor*radius*((j+1)/cfg.levels);
                    g.selectAll(".levels")
                        .data(allAxis)
                        .enter()
                        .append("svg:line")
                        .attr("x1", function(d, i){return levelFactor*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
                        .attr("y1", function(d, i){return levelFactor*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
                        .attr("x2", function(d, i){return levelFactor*(1-cfg.factor*Math.sin((i+1)*cfg.radians/total));})
                        .attr("y2", function(d, i){return levelFactor*(1-cfg.factor*Math.cos((i+1)*cfg.radians/total));})
                        .attr("class", "segm")
                        .style("stroke", "grey")
                        .style("stroke-opacity", "0.75")
                        .style("stroke-width", "0.3px")
                        .attr("transform", "translate(" + (cfg.w/2-levelFactor) + ", " + (cfg.h/2-levelFactor) + ")");
                }

                axis.append("line")
                    .attr("x1", cfg.w/2)
                    .attr("y1", cfg.h/2)
                    .attr("x2", function(d, i){return cfg.w/2*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
                    .attr("y2", function(d, i){return cfg.h/2*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
                    .attr("class", "line")
                    .style("stroke", "grey")
                    .style("stroke-width", "1px");

                g.selectAll("polygon").remove()


                d.forEach(function(y, x){
                    dataValues = [];
                    g.selectAll(".nodes")
                        .data(y, function(j, i){
                            dataValues.push([
                                cfg.w/2*(1-(parseFloat(Math.max(j.value, 0))/maxvalue)*cfg.factor*Math.sin(i*cfg.radians/total)),
                                cfg.h/2*(1-(parseFloat(Math.max(j.value, 0))/maxvalue)*cfg.factor*Math.cos(i*cfg.radians/total)),
                            ]);
                        });

                    dataValues.push(dataValues[0]);

                    g.selectAll(".area")
                        .data([dataValues])
                        .enter()
                        .append("polygon")
                        .attr("class", "radar-chart-serie"+series)
                        .style("stroke-width", "1px")
                        .style("stroke", "black")
                        .attr("points",function(d) {
                            var str="";
                            for(var pti=0;pti<d.length;pti++){
                                str=str+d[pti][0]+","+d[pti][1]+" ";
                            }
                            return str;
                        })
                        .style("fill", function(j, i){return d3.interpolateCool(series/4)})
                        .style("fill-opacity", cfg.opacityArea)
                        .on('mouseover', function (d){
                            z = "polygon."+d3.select(this).attr("class");
                            g.selectAll("polygon")
                                .transition(200)
                                .style("fill-opacity", 0.1);
                            g.selectAll(z)
                                .transition(200)
                                .style("fill-opacity", .7);
                        })
                        .on('mouseout', function(){
                            g.selectAll("polygon")
                                .transition(200)
                                .style("fill-opacity", cfg.opacityArea);
                        });

                    series++;

                });
                series=0;

                /*let svg = d3.select('#body')
                    .selectAll('svg')
                    .append('svg')
                    .attr("width", w + 300)
                    .attr("height", h)

                //Initiate Legend
                let legend = svg.append("g")
                    .attr("class", "legend")
                    .attr("height", 100)
                    .attr("width", 200)
                    .attr('transform', 'translate(90,20)');

                //Create colour squares
                legend.selectAll('rect')
                    .data(LegendOptions)
                    .enter()
                    .append("rect")
                    .attr("x", w - 65)
                    .attr("y", function (d, i) {
                        return i * 20;
                    })
                    .attr("width", 10)
                    .attr("height", 10)
                    .style("fill", function (d, i) {
                        return colorscale[i];
                    })
                ;
                //Create text next to squares
                legend.selectAll('text')
                    .data(LegendOptions)
                    .enter()
                    .append("text")
                    .attr("x", w - 52)
                    .attr("y", function (d, i) {
                        return i * 20 + 9;
                    })
                    .attr("font-size", "11px")
                    .attr("fill", "#737373")
                    .text(function (d) {
                        return d;
                    })*/
            }
            //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            //bar chart construction area
            //Inital values
            let barh = 300
            let barw = 1600
            let nbar = 20


            //function to convert date strings to dates
            let parser = d3.timeParse("%Y-%m-%d")
            let formatter = d3.timeFormat("%Y")
            let formatter1 = d3.timeFormat("%j")
            function reformat(date) {
                return(formatter(parser(date))+formatter1(parser(date))*0.001)
            }

            //x scale for chart
            let x = d3.scaleLinear()
                .domain([nbar, 0])
                .range([50, barw-100]);

            //inverse scale for transformed text (title)
            /*let xi = d3.scaleLinear()
                .domain([nbar, 0])
                .range([barw-100, 50]);*/

            //Create new svg for chart
            let barsvg = d3.select("#barchart").append("svg")
                .attr("width", barw)
                .attr("height", barh)

            //y axis title
            barsvg.append("text")
                .attr("x",100)
                .attr("y",-90)
                .attr("dominant-baseline", "hanging")
                .attr("transform", "rotate(90,0,0)")
                .style("font-size", "15px")
                .text('Average Rating');

            //y axis
            barsvg.append("line")
                .attr("x1", x(nbar)+50)
                .attr("y1", 0)
                .attr("x2", x(nbar)+50)
                .attr("y2", barh)
                .attr("class", "line")
                .style("stroke", "black")
                .style("stroke-width", "2px");

            //x axis
            barsvg.append("line")
                .attr("x1", x(nbar)+50)
                .attr("y1", barh-48)
                .attr("x2", x(0)+43)
                .attr("y2", barh-48)
                .attr("class", "line")
                .style("stroke", "black")
                .style("stroke-width", "2px");

            //title
            barsvg.append("text")
                .attr("class", "header")
                .attr("x",barw/2-20)
                .attr("y",barh-30)
                .attr("dominant-baseline", "hanging")
                .style("font-size", "20px")
                .text("Recent Movie Popularity")
                .attr("text-anchor", "middle")
                .attr("font-weight", 700)

            window.drawBar = function(){

                //Button inputs
                let inputsBar = document.querySelectorAll('input[class="barcheck"]');

                let moviedata0 = [];

                //Filling data with active inputs
                if (inputsBar[0].checked === true) {
                    moviedata0.push(data.cast)
                }
                for (let i = 0; i < data.crew.length; ++i) {
                    if (inputsBar[1].checked === true && data.crew[i].department === "Director") {
                        moviedata0.push(data.crew[i])
                    }
                    if (inputsBar[2].checked === true && data.crew[i].department === "Production") {
                        moviedata0.push(data.crew[i])
                    }
                    if (inputsBar[3].checked === true && data.crew[i].department === "Writing") {
                        moviedata0.push(data.crew[i])
                    }
                }

                //More filler variables because I dont know how to do things better, sorting by date
                let moviedata1 = moviedata0.flat()
                    .sort((a, b) =>
                        d3.descending(reformat(a.release_date), reformat(b.release_date)))

                //Removing movies with no vote_average (unreleased mostly)
                for (let j = moviedata1.length -1; j >= 0; j--) {
                    if (moviedata1[j].vote_average === 0) {
                        moviedata1.splice(j,1)
                    }
                }

                //Check if all are empty (No problems, just prevents errors
                if (moviedata1.length === 0){
                    return;
                }

                //Merge identical movies and cutting to 20
                let moviedata = moviedata1.reduce((prev, cur) => {
                    const index = prev.findIndex(v => v.id === cur.id);
                    if (index === -1) {
                        prev.push(cur);
                    }
                    return prev;
                }, []).slice(0,nbar)

                //Finding max for scales
                let maxpop = d3.max(moviedata, function(d) { return d.vote_average; });

                //y scale for chart
                let y = d3.scaleLinear()
                    .domain([0, maxpop])
                    .range([0, barh-50]);

                //create svg
                let bars = barsvg.selectAll(".bar").data(moviedata, function(d) { return d.id; })

                //update
                bars.transition().delay(!bars.exit().empty() * 500).duration(500)
                    .attr("class", "bar")
                    .attr("x", function(d,i) { return x(i); })
                    .attr("y", function(d) { return y(maxpop - d.vote_average)} )
                    .attr("height", function(d) {return y(d.vote_average)})

                //create bars
                bars.enter().append("rect")
                    .attr("class", "bar")
                    .attr("x", function(d,i) { return x(i); })
                    .attr("y", function(d) { return y(maxpop - d.vote_average)} )
                    .attr("height", function(d) {return y(d.vote_average)})
                    .attr("width", 40)
                    .attr("fill", function(d,i) { return d3.interpolateCool(i/nbar)})
                    .on("mouseover", (event,d)=>{
                        tipMouseOver(event,d);
                    })
                    .on("mouseout",(event,d)=>{
                        tipMouseOut();
                    })
                    .style('fill-opacity', 0)
                    .transition().delay(!bars.exit().empty() * 500 + !bars.empty() * 500).duration(500)
                    .style('fill-opacity', 1);

                //removing old bars
                bars.exit()
                    .transition().duration(500)
                    .style('fill-opacity', 0)
                    .remove();

                //Movie title text, not sure if we need this, this was made pre tool tips
                /*bars.enter().append("text")
                    .attr("x", barh - 53)
                    .attr("y", function(d,i) { return xi(i) - barw +23 })
                    .attr("dominant-baseline", "hanging")
                    .attr("text-anchor", "end")
                    .style("font-size", "15px")
                    .attr("transform", "rotate(90,0,0)")
                    .text(function(d) {return d.title.substring(0, 25);});*/

                //Clear old date
                barsvg.selectAll(".date").remove()

                //Left date
                barsvg.append("text")
                    .attr("class", "date")
                    .attr("x", x(nbar)+55)
                    .attr("y", barh-30)
                    .attr("dominant-baseline", "hanging")
                    .style("font-size", "15px")
                    .text(moviedata[moviedata.length-1].release_date);

                //right date
                barsvg.append("text")
                    .attr("class", "date")
                    .attr("x",x(0)-35)
                    .attr("y",barh-30)
                    .attr("dominant-baseline", "hanging")
                    .style("font-size", "15px")
                    .text(moviedata[0].release_date);

                //tooltip stuff
                let bartooltip = d3.select("#barchart")
                    .append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);

                // tooltip mouseover event handler
                function tipMouseOver(event, d) {

                    let [xbartip, ybartip] = d3.pointer(event, svg);

                   /* let revenueText;
                    let budgetText;

                    (d.revenue / 1e6)/1000 >= 1 ?
                        revenueText = '$ ' + String(((d.revenue / 1e6)/1000).toFixed(1)) + ' billion' :
                        revenueText = '$ ' + String((d.revenue / 1e6).toFixed(1)) + ' million';

                    (d.budget / 1e6)/1000 >= 1 ?
                        budgetText = '$ ' + String(((d.budget / 1e6)/1000).toFixed(1)) + ' billion' :
                        budgetText = '$ ' + String((d.budget / 1e6).toFixed(1)) + ' million';*/



                    let htmlChild  = "<b>"+d.original_title+"</b><br/>"+
                        `<img src='https://image.tmdb.org/t/p/original${d.poster_path}' alt="No photo available" id="tooltip-poster" width='200' height='300'><br/>`+
                        "<span class = 'releaseText'><b>Release Date : </b>" + d.release_date + "</span><br/>" +
                        "<span class = 'popText'><b>Rating : </b>" + d.vote_average + "</span><br/>"

                    // `${x+250 > thisViz.width ? String(x-(x+250-thisViz.width)):String(x+10)}`
                    // `${y+400 > thisViz.height ? String(y-(y+400-thisViz.height)):String(y+20)}`

                    bartooltip.html(htmlChild)
                        .style("left", `${String(xbartip + 10)}` + "px")
                        .style("bottom", `${String(window.innerHeight - ybartip-5)}` + "px")
                        .style("position", "absolute")
                        .transition()
                        .duration(200) // ms
                        .style("opacity", 1)
                        .style("display", 'inline-block'); // started as 0!

                };
                // tooltip mouseout event handler
                function tipMouseOut() {
                    d3.selectAll(".tooltip")
                        .transition()
                        .duration(200) // ms
                        .style("opacity", 0)
                        .style("display", 'none');
                }
            }
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            //Net Construction area
            let w = 705
            let h = 350
            //number of circles
            let nnet = 10;

            //Create new svg for chart
            let svg = d3.select("#netchart").append("svg")
                .attr("width", w)
                .attr("height", h)

            //border
            svg.append("rect")
                .attr("width", w-100)
                .attr("height", h-5)
                .attr("x", 50)
                .attr("y", 1)
                .attr("rx", 20)
                .attr("ry", 20)
                .style("fill-opacity", 0)
                .style("stroke", 2)
                .style("stroke", "black")

            window.drawNet = function() {

                //Get inputs
                let inputsNet = document.querySelectorAll('input[class="netcheck"]');
                let movienet =[];

                //Filling data with active inputs
                if (inputsNet[0].checked === true) {
                    movienet.push(data.cast)
                }
                for (let i = 0; i < data.crew.length; ++i) {
                    if (inputsNet[1].checked === true && data.crew[i].department === "Director") {
                        movienet.push(data.crew[i])
                    }
                    if (inputsNet[2].checked === true && data.crew[i].department === "Production") {
                        movienet.push(data.crew[i])
                    }
                    if (inputsNet[3].checked === true && data.crew[i].department === "Writing") {
                        movienet.push(data.crew[i])
                    }
                }

                //Check if all are empty (No problems, just prevents errors
                if (movienet.length === 0){
                    return;
                }

                //Merge identical movies
                let finalmov = movienet.flat().reduce((prev, cur) => {
                    const index = prev.findIndex(v => v.id === cur.id);
                    if (index === -1) {
                        prev.push(cur);
                    }
                    return prev;
                }, [])

                let promises = [];

                for(let dataPt of finalmov){
                    // Push all api fetch commands inside the promise array
                    promises.push(
                        fetch(`https://api.themoviedb.org/3/movie/${dataPt.id}/credits?api_key=${ApiKey_Thomas}&language=en-US`)
                            .then(res => res.json())
                            .then(datan=>{
                                netdatain.push(datan.crew);
                                netdatain.push(datan.cast);
                            })
                    );
                }
                // Set a Promise.all(), which take a iterable as input, an iterable like array [] or object {}, once when resolved (finished), it will process next lines of codes in the subsequent .then(...)
                Promise
                    .all(promises)
                    .then(()=>{
                        return data;
                    })
                    .then(datanet => {

                        //fixing up net data
                        let finalnet = netdatain.flat().map(function (d) {
                            return d.id
                        }).filter(Boolean);

                        //reset old values
                        netdatain = [];

                        //counting n
                        let tempcount = d3.flatRollup(finalnet,
                            v => v.length,
                            c => c,
                            ).sort((a, b) => -(a[1] - b[1])).slice(1,nnet+1);

                        //to get random values
                        let count = tempcount.map(function(d){
                            let temp = {}
                            temp['id'] = d[0];
                            temp['n'] = d[1];
                            //to prevent offscreening
                            temp['randx'] = Math.random(d[0]) * (w-200)+100;
                            temp['randy'] = Math.random(d[0]) * (h-120)+60;
                            //to prevent overlapping with middle
                            if (w/2-70 < temp['randx'] && temp['randx'] < w/2 && h/2-70 < temp['randy'] && h/2+70 > temp['randy']) {
                                temp['randx'] = w/2-70
                            }
                            if (w/2 < temp['randx'] && temp['randx'] < w/2+70 && h/2-70 < temp['randy'] && h/2+70 > temp['randy']) {
                                temp['randx'] = w/2+70
                            }
                            return temp
                        });

                        //max and min for scale
                        let maxnet = d3.max(count, function(d) { return d.n; });
                        let minnet = d3.min(count, function(d) { return d.n; });

                        //r scale for chart
                        let r = d3.scaleLinear()
                            .domain([minnet, maxnet])
                            .range([20, 50]);

                        let colorscale = d3.schemeCategory10

                        //connectors
                        let lines = svg.selectAll(".lin").data(count, function(d) { return d.id; })

                        //update
                        lines.transition().duration(500)
                            .attr("x1", w/2)
                            .attr("y1", h/2)
                            .attr("x2", function(d) { return d.randx})
                            .attr("y2", function(d) { return d.randy})

                        //create
                        lines.enter().append("line")
                            .attr("class", "lin")
                            .attr("x1", w/2)
                            .attr("y1", h/2)
                            .attr("x2", function(d) { return d.randx})
                            .attr("y2", function(d) { return d.randy})
                            .style("stroke", "black")
                            .style("stroke-width", "0px")
                            .transition().delay(300).duration(300)
                            .style("stroke-width", "2px")

                        //remove
                        lines.exit()
                            .transition().duration(100)
                            .style("stroke-width", "0px")
                            .remove();

                        //create svg
                        let circles = svg.selectAll(".circs").data(count, function(d) { return d.id; })

                        //update
                        circles.transition().duration(500)
                            .attr("cx", function(d) { return d.randx})
                            .attr("cy", function(d) { return d.randy})
                            .attr("r", function(d) { return r(d.n)})
                            .attr("fill", function(d, i) { return d3.interpolateCool(i/nnet)})

                        //cricles for network
                        circles.enter().append("circle")
                            .attr("class", "circs")
                            .attr("cx", function(d) { return d.randx})
                            .attr("cy", function(d) { return d.randy})
                            .attr("r", function(d) { return r(d.n)})
                            .attr("fill", function(d, i) { return d3.interpolateCool(i/nnet)})
                            .on("mouseover", (event,d)=>{
                                tipMouseOver(event,d);
                            })
                            .on("mouseout",(event,d)=>{
                                tipMouseOut();
                            })
                            .style("stroke", "black")
                            .style("stroke-opacity", 0)
                            .style("fill-opacity", 0)
                            .transition().duration(500)
                            .style('fill-opacity', 1)
                            .style("stroke-opacity", 1);

                        //removing old net chart
                        circles.exit()
                            .transition().duration(300)
                            .style('fill-opacity', 0)
                            .style("stroke-opacity", 0)
                            .remove();

                        //so it goes on top
                        svg.selectAll(".remove").remove()

                        //Center circle
                        svg.append("circle")
                            .attr("class", "remove")
                            .attr("cx", w/2)
                            .attr("cy", h/2)
                            .attr("r", 15)
                            .attr("fill", "black");

                        /*//person name
                        svg.append("text")
                            .attr("class", "remove")
                            .attr("x", w/2)
                            .attr("y", h/2-5)
                            .attr("text-anchor", "middle")
                            .style("stroke", "White")
                            .text(personname)*/

                        //tooltip stuff
                        let tooltip = d3.select("#netchart")
                            .append("div")
                            .attr("class", "tooltip")
                            .style("opacity", 0);


                        // tooltip mouseover event handler
                        function tipMouseOver(event, d) {

                            fetch(`https://api.themoviedb.org/3/person/${d.id}?api_key=${ApiKey_Thomas}&language=en-US`)
                                .then(res => res.json())
                                .then(datatt=> {
                                    // Latest D3 version (v6 onward) does not recognize d3.event.pageX & d3.event.pageY
                                    // It changes to d3.pointer(event, target_container) where 2 position values (x, y) of the mouse position are returned.
                                    // 2nd argument is used to calculate the relative location of the tooltip so it can scale upon when the vessel's width and height change.

                                    let [xtip, ytip] = d3.pointer(event, svg);

                                    //Declaring gender
                                    function getgender(value){
                                        if (value === 1) {
                                            return 'Female';
                                        } else if (value === 2) {
                                            return 'Male';
                                        } else {
                                            return 'Non-Binary';
                                        }
                                    }

                                    //Parsing Birthday;
                                    let parser = d3.timeParse("%Y-%m-%d")

                                    let birthdate;
                                    if (datatt.birthday == null) {
                                        birthdate = new Date()
                                    } else {
                                        birthdate = parser(datatt.birthday);
                                    }

                                    //Name of month
                                    let formatMonth = d3.timeFormat("%B");
                                    let month = formatMonth(birthdate)

                                    //Get Age
                                    let age = new Date().getFullYear() - birthdate.getFullYear()

                                    let bdtext;
                                    if (datatt.birthday == null) {
                                        bdtext = 'Unknown'
                                    } else {
                                        bdtext = month+' '+birthdate.getDate()+', '+birthdate.getFullYear()+ ' ('+age+' years old)';
                                    }
                                    let bptext;
                                    if (datatt.place_of_birth == null) {
                                        bptext = 'Unknown'
                                    } else {
                                        bptext = datatt.place_of_birth;
                                    }

                                    let htmlChild =
                                        "<b>" + datatt.name + "</b><br/>" +
                                        `<img src='https://image.tmdb.org/t/p/original${datatt.profile_path}' alt="No photo available" id="tooltip-poster" width='200' height='300'><br/>` +
                                        "<span class = 'gendertext'><b>Gender : </b>" + getgender(datatt.gender) + "</span><br/>" +
                                        "<span class = 'bdtext'><b>Date of Birth : </b>" + bdtext + "</span><br/>" +
                                        "<span class = 'bptext'><b>Birthplace : </b>" + bptext + "</span><br/>" +
                                        "<span class = 'collabtext'><b>Collaborations : </b>" + d.n + "</span>";

                                    // `${x+250 > thisViz.width ? String(x-(x+250-thisViz.width)):String(x+10)}`
                                    // `${y+400 > thisViz.height ? String(y-(y+400-thisViz.height)):String(y+20)}`

                                    tooltip.html(htmlChild)
                                        .style("left", `${String(xtip + 10)}` + "px")
                                        .style("top", `${String(ytip + 20)}` + "px")
                                        .style("position", "absolute")
                                        .transition()
                                        .duration(200) // ms
                                        .style("opacity", 1)
                                        .style("display", 'inline-block'); // started as 0!

                                })
                        };
                        // tooltip mouseout event handler
                        function tipMouseOut() {
                            d3.selectAll(".tooltip")
                                .transition()
                                .duration(200) // ms
                                .style("opacity", 0)
                                .style("display", 'none');
                        }
                    })
            }

            drawNet()
            drawRadar()
            drawBar()


        })
}
actordata(testid)