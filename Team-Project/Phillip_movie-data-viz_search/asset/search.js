const form = document.getElementById('searchForm');
let apiKey = '7540b6e4f23a1f8e3a9540f91f80b927';


//Fetch the search results based on location hash
let search = () => {

  if (window.location.hash) {

    //Hide the data viz element while the search results return
    let dataVizSection = document.getElementsByClassName('data-viz-container');
    // There are 2 section contain the data viz, so use a loop to hide all section
    for(let section of dataVizSection){
      section.style.display = 'none';
    }

    // create a variable to store the search query via location has
    let searchTerm = window.location.hash.slice(window.location.hash.indexOf('=')+1,);

    // using multi-search model to fetch search result from TMDB API
    fetch(`https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=en-US&query=${searchTerm}&page=1&include_adult=false`)
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

          searchResults.innerHTML += `<div class='searchResults'><a href='movie-data-viz-home.html#person=${search.name}'>${search.name}</a></div>`

        }else if (search.media_type==='movie') {

          searchResults.innerHTML += `<div class='searchResults'><a href='movie-data-viz-home.html#movie=${search.title}'>${search.title}</a></div>`

        }
      }

      console.log(queryData);
    })
    .catch(e => console.log('error'));

  }else{

    // If no search input, set <main></main> tag's display property to 'flex';
    document.querySelector('main').style.display = 'flex';
    //If location.hash = '', meaning no query input, then show the data viz element
    let dataVizSection = document.getElementsByClassName('data-viz-container');
    // There are 2 section contain the data viz, so use a loop to show all section
    for(let section of dataVizSection){
      section.style.display = 'inline-block';
    }
  }
}


// Initiate Search
search();

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

  search();
});
