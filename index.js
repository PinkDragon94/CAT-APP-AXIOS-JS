
import * as Carousel from "./Carousel.js";
import axios from "axios";
document.addEventListener("DOMContentLoaded", () => {
// The breed selection input element.
// const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");
if (getFavouritesBtn) {
  getFavouritesBtn.addEventListener("click", getFavourites);
}
// Step 0: Store your API key here for reference and easy access.
const API_KEY = "live_mKIEpaqCSlPbkK3VO3bZSMa3D91BuQZ7AvMQ7NMAi1Wx5RsrZjamUiLiqgvSayKA";
axios.defaults.baseURL = "https://api.thecatapi.com/v1";
axios.defaults.headers.common["x-api-key"] = API_KEY;


const breedSelect = document.getElementById("breedSelect");
if (breedSelect) {
  breedSelect.addEventListener("change", loadCarousel);
}
async function initialLoad() {
  const res = await axios("/breeds");
  const breeds = await res.data;

  breeds.forEach((breed) => {
    const opt = document.createElement("option");
    opt.value = breed.id;
    opt.textContent = breed.name;

    breedSelect.appendChild(opt);
  });

  loadCarousel();

}
 

breedSelect.addEventListener("change", loadCarousel);
async function loadCarousel() {
  const val = breedSelect.value;
  const url = `/images/search?limit=25&breed_ids=${val}`;

  const res = await axios(url, {
    onDownloadProgress: updateProgress
  });

  buildCarousel(res.data);
}

function buildCarousel(data, favourites) {
  Carousel.clear();
  infoDump.innerHTML = "";

  data.forEach((ele) => {
    const item = Carousel.createCarouselItem(
      ele.url,
      breedSelect.value,
      ele.id
    );
    Carousel.appendCarousel(item);
  });

  if (favourites) {
    infoDump.innerHTML = "Here are your saved favourites!";
  } else if (data[0]) {
    const info = data[0].breeds || null;
    if (info && info[0].description) infoDump.innerHTML = info[0].description;
  } else {
    infoDump.innerHTML =
      "<div class='text-center'>No information on this breed, sorry!</div>";
  }

  Carousel.start();
}
if (breedSelect) {
    breedSelect.addEventListener("change", loadCarousel);
  }

  if (getFavouritesBtn) {
    getFavouritesBtn.addEventListener("click", getFavourites);
  }

axios.interceptors.request.use((request) => {
  console.log("Request Started.");
  progressBar.style.transition = "none";
  progressBar.style.width = "0%";
  document.body.style.setProperty("cursor", "progress", "important");

  request.metadata = request.metadata || {};
  request.metadata.startTime = new Date().getTime();

  return request;
});

axios.interceptors.response.use(
  (response) => {
    response.config.metadata.endTime = new Date().getTime();
    response.config.metadata.durationInMS =
      response.config.metadata.endTime - response.config.metadata.startTime;

    console.log(
      `Request took ${response.config.metadata.durationInMS} milliseconds.`
    );
    document.body.style.cursor = "default";
    return response;
  },
  (error) => {
    error.config.metadata.endTime = new Date().getTime();
    error.config.metadata.durationInMS =
      error.config.metadata.endTime - error.config.metadata.startTime;

    console.log(
      `Request took ${error.config.metadata.durationInMS} milliseconds.`
    );
    document.body.style.cursor = "default";
    throw error;
  }
);

function updateProgress(progressEvent) {
  const total = progressEvent.total;
  const current = progressEvent.loaded;
  const percentage = Math.round((current / total) * 100);

  progressBar.style.transition = "width ease 1s";
  progressBar.style.width = percentage + "%";
}



axios.interceptors.request.use(
  function (config) {
    document.body.style.cursor = 'progress';
    return config;
  },
  function (error) {
    document.body.style.cursor = 'default';
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  function (response) {
    document.body.style.cursor = 'default';
    return response;
  },
  function (error) {
    document.body.style.cursor = 'default';
    return Promise.reject(error);
  }
);

axios.get('https://api.thecatapi.com/v1/images/search?breed_id=your_breed_id', {
  headers: {
    'x-api-key': 'mKIEpaqCSlPbkK3VO3bZSMa3D91BuQZ7AvMQ7NMAi1Wx5RsrZjamUiLiqgvSayKA'
  }
})
.then(response => {
  console.log(response.data);
  
})
.catch(error => {
  console.error('There was an error!', error);
});


async function toggleFavoriteImage(imageId) {
  const response = await axios.get(`/favourites?image_id=${imageId}`);
  const favorite = response.data[0];

  if (favorite) {
    await axios.delete(`/favourites/${favorite.id}`);
  } else {
    await axios.post("/favourites", { image_id: imageId });
  }
}


getFavouritesBtn.addEventListener("click", () => {
  getFavourites();
});
async function getFavourites() {
  const response = await axios.get('/favourites');
  const imageUrls = response.data.map(favourite => favourite.image);

  buildCarousel(imageUrls);
}
initialLoad(); 
});
