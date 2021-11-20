const ApiKey_Thomas = '844ff7cd27e44a9424544c4b3c852920';

//For testing
testid = 10859

//Gathering the basic actor information
function actordata(personid){

        // Fetching basic actor information
    fetch(`https://api.themoviedb.org/3/person/${personid}?api_key=${ApiKey_Thomas}&language=en-US`)
        .then(res => res.json())
        .then(data => {

            //Writing name
            document.getElementById('name').innerHTML = data.name;

            //Drawing Image
            document.getElementById('image').width = '250'
            document.getElementById('image').height = '350'
            document.getElementById('image').src = `https://image.tmdb.org/t/p/original${data.profile_path}`;

            //Declaring gender
            function getgender(value){
                gen = 'Default'
                if (value == 1) {
                    gen = 'Female';
                } else if (value == 2) {
                    gen = 'Male';
                } else {
                    gen = 'Non-Binary';
                }
            }

            //Writing gender
            getgender(data.gender);
            document.getElementById('gender').innerHTML = gen;

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

            genrelist = filler.map(item => {
                return { axis: item.name, id: item.id };
            });
            for (var i = 0; i < genrelist.length; ++i) {
                genrelist[i]['value'] = 0;
            }
        })
    // Fetching Actual data and charts
    fetch(`https://api.themoviedb.org/3/person/${personid}/movie_credits?api_key=${ApiKey_Thomas}&language=en-US`)
        .then(res => res.json())
        .then(data => {

            //Calculate movie credit number
            let totcredits = data.cast.length + data.crew.length;

            //Write credits number
            document.getElementById('credits').innerHTML = totcredits;

            //Calculate radar chart values
            function getdata(d) {

                let count = d3.flatRollup(d, v => v.length, d => d)
                let max = 0
                for (var i = 0; i < count.length; ++i) {
                    max += count[i][1]
                }
                let newcount = [];

                for (var i = 0; i < count.length; ++i) {
                    let temp = {}

                        temp['value'] = count[i][1] / max;
                        temp['id'] = count[i][0];

                    newcount[i] = temp;
                }

                let mergedlist = genrelist.map(d => ({...d, ...newcount.find(v => v.id === d.id)})).map(({id, ...d}) => d);
                return mergedlist
            }

            let actgen = d3.merge(data.cast.map(function (d) {
                return d.genre_ids
            })).filter(Boolean).sort();

            let dirgen = Array.prototype.concat.apply([], data.crew.map(function (d) {
                if (d.department == 'Director') {
                    return d.genre_ids
                }
            })).filter( Boolean ).sort();
            let prodgen = Array.prototype.concat.apply([], data.crew.map(function (d) {
                if (d.department == 'Production') {
                    return d.genre_ids
                }
            })).filter( Boolean ).sort();
            let writgen = Array.prototype.concat.apply([], data.crew.map(function (d) {
                if (d.department == 'Writing') {
                    return d.genre_ids
                }
            })).filter( Boolean ).sort();

            //Button interaction
            window.drawRadar = function() {

                //Button inputs
                let inputs = document.querySelectorAll('input[class="radarcheck"]');
                let d = []

                //Filling data with active inputs
                let fill = [getdata(actgen),  getdata(dirgen), getdata(prodgen), getdata(writgen)]
                for (var i = 0; i < fill.length; ++i) {
                    if (inputs[i].checked == true) {
                        d.push(fill[i])
                    }
                }
                //Check if all are empty (No problems, just prevents errors
                if (d.length == 0){
                    return;
                }

                //get max scale
                maxval = 0.01;
                for (var i = 0; i < d.length; ++i) {
                    if (d3.max(d[i], v => v.value ) > maxval){
                        maxval = d3.max(d[i], v => v.value);
                    }
                }
                // Create radar chart
                let w = 300,
                    h = 300

                let colorscale = d3.schemeCategory10;

                //Legend titles
                let LegendOptions = ['Actor', 'Producer', 'Director', 'Writer'];
                //Options for the Radar chart, other than default
                let mycfg = {
                    w: w,
                    h: h,
                    maxValue: maxval,
                    levels: 4,
                    ExtraWidthX: 300
                }

                //Call function to draw the Radar chart
                //Will expect that data is in %'s
                RadarChart.draw("#chart", d, mycfg);

                ////////////////////////////////////////////
                /////////// Initiate legend ////////////////
                ////////////////////////////////////////////

                var svg = d3.select('#body')
                    .selectAll('svg')
                    .append('svg')
                    .attr("width", w + 300)
                    .attr("height", h)

                //Create the title for the legend
                var text = svg.append("text")
                    .attr("class", "title")
                    .attr('transform', 'translate(90,0)')
                    .attr("x", w - 70)
                    .attr("y", 10)
                    .attr("font-size", "12px")
                    .attr("fill", "#404040")
                    .text("What % of owners use a specific service in a week");

                //Initiate Legend
                var legend = svg.append("g")
                    .attr("class", "legend")
                    .attr("height", 100)
                    .attr("width", 200)
                    .attr('transform', 'translate(90,20)')
                ;
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
                    })
            }
            //bar chart

            window.drawBar = function(){

                let h = 300
                let w = 1300
                let nbar = 20


                //Button inputs
                let inputsBar = document.querySelectorAll('input[class="barcheck"]');
                let moviedata0 =[];

                //Filling data with active inputs
                if (inputsBar[0].checked == true) {
                    moviedata0.push(data.cast)
                }
                for (var i = 0; i < data.crew.length; ++i) {
                    if (inputsBar[1].checked == true && data.crew[i].department == "Director") {
                        moviedata0.push(data.crew[i])
                    }
                    if (inputsBar[2].checked == true && data.crew[i].department == "Production") {
                        moviedata0.push(data.crew[i])
                    }
                    if (inputsBar[3].checked == true && data.crew[i].department == "Writing") {
                        moviedata0.push(data.crew[i])
                    }
                }

                let moviedata1 = moviedata0.flat().sort((a, b) => d3.descending(a.release_date, b.release_date))

                for (var i = 0; i < moviedata1.length; ++i) {
                    if (moviedata1[i].vote_average == 0) {
                        moviedata1.splice(i,1)
                    }
                }
                //Check if all are empty (No problems, just prevents errors
                if (moviedata1.length == 0){
                    return;
                }

                let moviedata = moviedata1.slice(0,nbar)

                let maxpop = d3.max(moviedata, function(d) { return d.vote_average; });

                let x = d3.scaleLinear()
                    .domain([nbar, 0])
                    .range([50, w-100]);

                let y = d3.scaleLinear()
                    .domain([0, maxpop])
                    .range([0, h-50]);

                d3.select("#barchart").select("svg").remove();

                let svg = d3.select("#barchart").append("svg")
                    .attr("width", w)
                    .attr("height", h)

                let bars = svg.selectAll().data(moviedata, function(d) { return d.id; })

                bars.enter().append("rect")
                    .attr("x", function(d,i) { return x(i); })
                    .attr("y", function(d) { return y(maxpop - d.vote_average)} )
                    .attr("height", function(d) {return y(d.vote_average)})
                    .attr("width", 40)
                    .attr("fill", '#33FFE0')

                let timetext = moviedata[moviedata.length-1].release_date;

                if (moviedata[moviedata.length-1].release_date.length == 0) {
                    timetext = "The Beginning of Time"
                };

                svg.append("text")
                    .attr("x", x(nbar)+55)
                    .attr("y", h-30)
                    .attr("dominant-baseline", "hanging")
                    .style("font-family", "sans-serif")
                    .style("font-size", "15px")
                    .text(timetext);

                svg.append("text")
                    .attr("x",x(0)-35)
                    .attr("y",h-30)
                    .attr("dominant-baseline", "hanging")
                    .style("font-family", "sans-serif")
                    .style("font-size", "15px")
                    .text(moviedata[0].release_date);

                svg.append("text")
                    .attr("x",100)
                    .attr("y",-90)
                    .attr("dominant-baseline", "hanging")
                    .attr("transform", "rotate(90,0,0)")
                    .style("font-family", "sans-serif")
                    .style("font-size", "15px")
                    .text('Average Rating');

                svg.append("line")
                    .attr("x1", x(nbar)+50)
                    .attr("y1", 0)
                    .attr("x2", x(nbar)+50)
                    .attr("y2", h)
                    .attr("class", "line")
                    .style("stroke", "black")
                    .style("stroke-width", "2px");

                svg.append("line")
                    .attr("x1", x(nbar)+50)
                    .attr("y1", h-50)
                    .attr("x2", x(0)+43)
                    .attr("y2", h-50)
                    .attr("class", "line")
                    .style("stroke", "black")
                    .style("stroke-width", "2px");
            }
            drawRadar()
            drawBar()
        })
}
actordata(testid)

