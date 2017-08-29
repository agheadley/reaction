/*
new images loaded with array of file names (assumed to be in directory ./images/)
this.data contains an array of loaded image objects
adapted from https://stackoverflow.com/questions/18974517/check-if-images-are-loaded-before-gameloop

example callback
    var image = new ImageLoad(imageNamesArray,function() {
      //place next code here e.g. init();
    });

*/


function loadImageData(images,callback) {
    this.data=[];
    var count=0;
    for(var i=0;i<images.length;i++)
    {

        this.data[i] = new Image();
        this.data[i].src='images/'+images[i];
        this.data[i].onload=function() {
            count+=1;
            console.log('loaded image : '+count);
            if (count == images.length) callback();
        };

    }

  }

/* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random */

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}
