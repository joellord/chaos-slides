const GIPHY_KEY = "Your Giphy API Key";
const SLIDES_ENDPOINT = "Your Atlas HTTPS Endpoint";
const slide = document.querySelector("#slide");

const introSlide = {image: "assets/intro.png"}

const GIPHY_ENDPOINT = "https://api.giphy.com/v1/gifs/search";

const genForm = document.querySelector("#generatorForm");
const genBtn = document.querySelector("#generateSlides");
const formNumSlides = document.querySelector("#numSlides");
const formSlideSource = document.querySelector("#slideSource");
const formTextProbability = document.querySelector("#textProbability");
const textField = document.querySelector("#text");
const forkMeBanner = document.querySelector("#forkMeBanner");

let slides = [introSlide];

let currentSlide = 0;

const KEYS = {
  RIGHT: "ArrowRight",
  LEFT: "ArrowLeft"
}

function showSlide() {
  slide.setAttribute("src", slides[currentSlide].image);
  let text = slides[currentSlide].text || "";
  textField.innerText = text;
  if (!text) textField.style.visibility = "hidden";
  else textField.style.visibility = "visible";
}

function nextSlide() {
  let totalSlides = slides.length;
  currentSlide++;

  if (currentSlide === totalSlides) currentSlide--;
  showSlide();
}

function previousSlide() {
  currentSlide--;
  if (currentSlide === -1) currentSlide = 0;
  showSlide();
}

document.addEventListener("keydown", e => {
  if (e.key === KEYS.RIGHT) {
    nextSlide();
  }
  if (e.key === KEYS.LEFT) {
    previousSlide();
  }
});

document.addEventListener("click", e => {
  const clickTarget = e.target;
  const clickTargetWidth = clickTarget.offsetWidth;
  const xCoordInClickTarget = e.clientX - clickTarget.getBoundingClientRect().left;
  if (clickTargetWidth / 2 > xCoordInClickTarget) {
    // clicked left
    previousSlide();
  } else {
    // clicked right
    nextSlide();
  }
});


const addRandomText = (slides, prob) => {
  return slides.map(slide => {
    let random = Math.round(Math.random()*100);
    if (random < prob) slide.text = randomWord();
    return slide;
  });
}

const slidesFromMongoDB = async (num, textProb) => {
  try {
    const response = await fetch(`${SLIDES_ENDPOINT}?num=${num}`); // .then(r => r.json());

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    let randomSlides = await response.json();
    slides = [introSlide, ...addRandomText(randomSlides, textProb)];
    console.log(slides);
  } catch (error) {
    console.error(error)
    alert("Problems getting data from MongoDB Atlas, did you set up your Atlas API endpont?" + error);
  }
}

const slidesFromGiphy = async (num, textProb) => {
  const URL = `${GIPHY_ENDPOINT}?api_key=${GIPHY_KEY}&q=${randomWord()}&limit=${num}`;
  try {
    const response = await fetch(URL);

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    let images = await response.json();
    let randomSlides = addRandomText(images.data.map(i => { return { image: i.images.downsized.url } }), textProb);
    slides = [introSlide, ...randomSlides];
    console.log(slides);
  } catch (error) {
    console.error(error)
    alert("Problems getting data from Giphy, did you set up your API key?" + error);
  }
}

const generateSlides = async function () {
  let numSlides = parseInt(formNumSlides.value);
  let slideSource = formSlideSource.value;
  let textProbability = parseInt(formTextProbability.value);
  if (textProbability < 0) textProbability = 0;
  if (textProbability > 100) textProbability = 100;
  if (slideSource === "mongodb") await slidesFromMongoDB(numSlides, textProbability);
  else if (slideSource === "giphy") await slidesFromGiphy(numSlides, textProbability);
  else alert("An error occured");

  if (slides.length > 1) {
    alert("Slide deck generated, use left and right arrows to move between slides. Refresh to generate a new deck.");
  }
}

genBtn.addEventListener("click", () => {
  generateSlides();
  genForm.style.visibility = "hidden";
  forkMeBanner.style.visibility = "hidden";
})

showSlide();
