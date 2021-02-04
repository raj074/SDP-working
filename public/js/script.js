

$(function () {
  if (window.BS && window.BS.loader && window.BS.loader.length) {
    while (BS.loader.length) {
      BS.loader.pop()();
    }
  }
});

VanillaTilt.init(document.querySelectorAll(".card"), {
  max: 25,
  speed: 400,
  glare: true,
  "max-glare": 1,
});



function switchTheme(x) {
  
    if (!x.checked) {
      document.body.classList.add("light-mode");
      document.body.classList.remove("dark-mode");
        
    }else{
      document.body.classList.remove("light-mode");
      document.body.classList.add("dark-mode");
    }
       
}

