var Physics;    // physics.js library
var WORLD;
var ANIMATION_ID,START_TIME;
var CANVAS,CTX;
var PAUSE=0;



window.onload=function() {
    main();
};



function main()
{
        /* global CANVAS,CTX */
        CANVAS=document.getElementById('canvas');
        CTX=canvas.getContext('2d');

      

        /* global WORLD */
        WORLD=Physics({timestep:1000.0/160,maxIPF:16,integrator:'verlet'});
        var gravity=Physics.behavior('constant-acceleration',{x:0,y:0.004}); //default
        gravity.setAcceleration({x:0,y:0});
        WORLD.add(gravity);
        /* add borders */
        var bounds=Physics.aabb(0, 0, CANVAS.width, CANVAS.height)
        var viewPort=Physics.behavior('edge-collision-detection', {aabb:bounds,restitution: 1.0,cof: 1.0});
        WORLD.add(viewPort);
        /* detect and respond to collisions */
        WORLD.add(Physics.behavior('body-impulse-response'));
        WORLD.add(Physics.behavior('body-collision-detection'));
        WORLD.add(Physics.behavior('sweep-prune'));
        WORLD.on('collisions:detected', collision);

        /* initiate reaction */
        reactionInit(WORLD,MAX_SPEED,CANVAS);

        

        /* start animation loop (step() ) */
        ANIMATION_ID = window.requestAnimationFrame(step);

}

function toggleStep()
{
    console.log('toggleStep()');
    if(PAUSE==0) {
        PAUSE=1;
        window.cancelAnimationFrame(ANIMATION_ID);
        
    }
    else {
        PAUSE=0;
        ANIMATION_ID = window.requestAnimationFrame(step);
    }
}

function step(timestamp)
{
    /* https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelAnimationFrame */
    CTX.clearRect(0,0,CANVAS.width,CANVAS.height);
    if (!START_TIME) START_TIME = timestamp;
    var progress = timestamp - START_TIME;
    WORLD.step(timestamp);
    /* start animation code  */
   
    reactionDrawAll(CTX);

    


    /* end animation code */
    ANIMATION_ID = window.requestAnimationFrame(step);
    
}


function collision(data) 
{
    console.log('collision');
    for(var i=0;i<data.collisions.length;i++)
    {
        //console.log('collision');
        //if(data.collisions[i].bodyB==circle1)
        //if(data.collisions[i].bodyB==ball[2].physics && data.collisions[i].bodyA==ball[1].physics || data.collisions[i].bodyA==ball[2].physics && data.collisions[i].bodyB==ball[1].physics ) {
    }
}
