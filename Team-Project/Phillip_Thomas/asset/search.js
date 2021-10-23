const form = document.getElementById('searchForm');
const ApiKey_Phillip = '7540b6e4f23a1f8e3a9540f91f80b927';


// Define a Function to display search page
let displaySearch = () => {


  // create a variable to store the search query via location hash
  let searchTerm = window.location.hash.replace('#query=','')

  // using multi-search model to fetch search result from TMDB API
  fetch(`https://api.themoviedb.org/3/search/multi?api_key=${ApiKey_Phillip}&language=en-US&query=${searchTerm}&page=1&include_adult=false`)
  .then(res => res.json())
  .then(data => {
    // Create a <section></section> tag to contain the search results
    let searchContainer = document.createElement('section');

    // Set id of the search container (For css styling)
    searchContainer.setAttribute('id','searchContainer');

    // Append search container inside <main></main> tag within the html file
    // And tweek a bit of the original css styles (change display property from 'flex' -> 'block')
    document.querySelector('main').style.display = 'block';
    document.querySelector('main').appendChild(searchContainer);

    let searchResults = document.getElementById('searchContainer');
    let queryData = data.results.filter((item) => item.media_type === 'movie' || item.media_type === 'person').slice(0,10);
    // Loop the search result into the search page
    for(let search of queryData){

      if(search.media_type==='person'){

        searchResults.innerHTML +=
        `<div class='searchResults'>
          <a href='index.html#person_id=${search.id}'>${search.name}</a>
        </div>`

      }else if (search.media_type==='movie') {

        searchResults.innerHTML +=
        `<div class='searchResults'>
          <a href='index.html#movie_id=${search.id}'>${search.title}</a>
        </div>`

      }
    }

    console.log(queryData);
  })
  .catch(e => console.log('error'));
}

// Define a Function to display movie page
let displayMovie = () => {
  let movieId = window.location.hash.replace('#movie_id=','')
  fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${ApiKey_Phillip}&language=en-US&append_to_response=credits,similar`)
    .then(res => res.json())
    .then(data => {
      //Create Movie Poster
      let img = new Image();
      img.src = `https://image.tmdb.org/t/p/original${data.poster_path}`;
      img.className = 'movie_poster';
      // Append movie poster to the page
      document.querySelector('body').appendChild(img);
    })
}

// Define a Function to display person page
let displayPerson = () => {
  let personId = window.location.hash.replace('#person_id=','')
  fetch(`https://api.themoviedb.org/3/person/${personId}?api_key=${ApiKey_Phillip}&language=en-US&append_to_response=movie_credits`)
    .then(res => res.json())
    .then(data => {
      //Create Person's Profile Img
      let img = new Image();
      img.src = `https://image.tmdb.org/t/p/original${data.poster_path}`;
      img.className = 'movie_poster';
      // Append Person's Profile Img to the page
      document.querySelector('body').appendChild(img);
    })
}

//Fetch the search results based on location hash
let display= () => {

  let dataVizSection = d3.selectAll('.container')

  if (window.location.hash.includes('#query=')) {

    // Set the display property = 'none' for all the data viz sections at the home page.
    // Then display the search results
    dataVizSection.style('display','none');
    displaySearch();
  }
  else if(window.location.hash.includes('#person_id=')){
    // Set the display property = 'none' for all the data viz sections at the home page.
    // Then display the person page

  }else if(window.location.hash.includes('#movie_id=')){
    // Set the display property = 'none' for all the data viz sections at the home page.
    // Then display the movie page
    dataVizSection.style('display','none');
    displayMovie();

  }else{

    // If no search input, set <main></main> tag's display property to 'flex';
    d3.select('main').style('display','flex');
    dataVizSection.style('display','flex');

    dataVizSection.style('opacity','0')
                  .transition()
                  .duration(400)
                  .style('opacity','1');

  }


}


// Initiate Search
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
    document.getElementById('searchContainer').remove();
  }
  // When the location hash has been altered, fading the visualization out
  let dataVizSection = d3.selectAll('.container')
  // There are 2 section contain the data viz, so use a loop to hide all section
  dataVizSection.style('opacity','1')
                .transition()
                .duration(400)
                .style('opacity','0')
                .end()
                .then(()=>{
                  // After opacity change to 0, performing the search function
                  display();
                });
});
