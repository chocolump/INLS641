
class PovertyRateVis {

    constructor(svg_id) {
        this.url = "https://ils.unc.edu/~gotz/courses/data/states.csv";
        this.svg_id = svg_id;

        //load data and process
        this.loadAndPrepare();
    }
    render(regions, avgs, min_pr, max_pr) {
        let plot_spacing = 30;
        let plot_width = 150;

        // Get the svg element to draw on
        let svg = d3.select("#"+this.svg_id);

        // Y axis scale
        let y = d3.scaleLinear()
            .domain([min_pr, max_pr])
            .range([plot_width, 0]);

        let region_groups = svg.selectAll(".region_g")
            .data(regions.entries())
            .enter().append("g")
            .attr('class', "region_g")
            .attr("transform", function(d, i) {
                let x = plot_spacing + i*(plot_width+plot_spacing);
                let y = plot_spacing;
                return "translate("+x+","+y+")";
            });

        region_groups.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", plot_width)
            .attr("height", plot_width)
            .style("fill", "#f4f4f4");

        // Draw lines
        region_groups.selectAll(".stateline").data(function(d) {return d[1];})
            .enter().append("line")
            .attr("class", "stateline")
            .attr("x1", 0)
            .attr("x2", plot_width)
            .attr("y1", function(d) {return y(d.poverty_rate);})
            .attr("y2", function(d) {return y(d.poverty_rate);})
            .style("stroke", "lightblue");

        console.log("draw  vis");
    }
    loadAndPrepare() {
        let thisvis = this;

        //load data from csv
        d3.csv(this.url, function(d) {
            return {
                state: d.state,
                life_expectancy: +d.life_expectancy,
                poverty_rate: +d.poverty_rate,
                region: d.region
            }
        }).then(function(data) {
            // Calculate min and max poverty rates
            let min_pr = d3.min(data, function(d) {return d.poverty_rate;});
            let max_pr = d3.max(data, function(d) {return d.poverty_rate;});

            // Group the data by region
            let grouped_data = d3.group(data, function(d) {return d.region;});

            //Average by region
            let avg_data = d3.rollup(data,
                function(region_of_states) {
                    let pr_mean = d3.mean(region_of_states, function(d) {return d.poverty_rate ;});
                    let le_mean = d3.mean(region_of_states, function(d) {return d.life_expectancy ;});

                    return {
                        poverty_rate: pr_mean,
                        life_expectancy: le_mean,
                        states: region_of_states
                    }
                },
                function(d) {
                    return d.region;
            });

            thisvis.render(grouped_data, avg_data, min_pr, max_pr);

        }).catch(function(error) {
            console.log("Error loading CSV data");
            console.log(error);
        });
    }
}

