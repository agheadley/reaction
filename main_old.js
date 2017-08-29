var Physics;    // physics.js library
var world;
var canvas,ctx;

var rec1,rec2,compound;
var compound2,com1,com2;

window.onload=function() {
    main();
};

var ATOM={
    I:{name:"I",r:2,mass:4,color:"DarkViolet"},
    H:{name:"H",r:1,mass:1,color:"White"}
};


var MOLECULE={
    HI:[{atom:"H",x:-ATOM.H.r,y:0},{atom:"I",x:ATOM.I.r,y:0}]
};

function main()
{

        canvas=document.getElementById('canvas');
        ctx=canvas.getContext('2d');
        ctx.fillCircle();

        world=Physics({timestep:1000.0/160,maxIPF:16,integrator:'verlet'});
        var gravity=Physics.behavior('constant-acceleration',{x:0,y:0.004}); //default
        gravity.setAcceleration({x:0,y:0});
        world.add(gravity);

        // add borders
        var viewPort=Physics.behavior('edge-collision-detection', {
          aabb: Physics.aabb(0, 0, canvas.width, canvas.height),
          restitution: 1.0,
          cof: 1.0
        });
        world.add(viewPort);
        world.add(Physics.behavior('body-impulse-response'));

        // add body collision detection and resolution
        world.add(Physics.behavior('body-collision-detection'));
        world.add(Physics.behavior('sweep-prune'));


        //test
        var options={width:50,height:25,x:250,y:300,vx:0.2,vy:0.3,cof:0,restitution:1.0};
        rec1= Physics.body('rectangle',options);
        world.add(rec1);
        options={width:50,height:25,x:100,y:400,vx:-0.2,vy:0.3,cof:0,restitution:1.0};
        rec2= Physics.body('rectangle',options);
        world.add(rec2);


        /*
        options={x:100,y:100,vx:0.05,vy:0.05,cof:0,restitution:1.0,
            children:[
                Physics.body('circle',{x:-10,y:0,r:10,mass:1}),
                Physics.body('circle',{x:10,y:0,r:10,mass:1})
            ]
        };
        */

        options={x:100,y:100,vx:0.05,vy:0.05,cof:0,restitution:1.0,
            children:[
                Physics.body('circle',{x:-10,y:0,r:20,mass:2}),
                Physics.body('circle',{x:20,y:0,r:10,mass:1})
            ]
        };

        compound=Physics.body('compound',options);
        world.add(compound);


        com1=Physics.body('rectangle',{x:-10,y:0,width:40,height:40,mass:2});
        com2=Physics.body('rectangle',{x:20,y:0,width:20,height:20,mass:1});
        options={x:400,y:100,vx:0.05,vy:-0.05,cof:0,restitution:1.0,
            children:[com1,com2]
        };

        compound2=Physics.body('compound',options);
        world.add(compound2);


        // subscribe to ticker to advance the simulation
        Physics.util.ticker.on(function( time, dt ){
          world.step( time );
        });

        // start the ticker
        Physics.util.ticker.start();

        world.on('step',step);

        // If you want to subscribe to collision pairs
        // emit an event for each collision pair
        world.on('collisions:detected', collision);

}

function step() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    var pos,angle;

    ctx.fillStyle='#ff0000';

    pos=rec1.state.pos.values();
    angle=rec1.state.angular.pos;
    ctx.save();
    ctx.translate(pos.x,pos.y);
    ctx.rotate(angle);
    ctx.fillRect(-rec1.width/2,-rec1.height/2,rec1.width,rec1.height);
    ctx.restore();

    ctx.fillStyle='#00ff00';

    pos=rec2.state.pos.values();
    angle=rec2.state.angular.pos;
    ctx.save();
    ctx.translate(pos.x,pos.y);
    ctx.rotate(angle);
    ctx.fillRect(-rec2.width/2,-rec2.height/2,rec2.width,rec2.height);
    ctx.restore();


    /*
    pos=compound.state.pos.values();
    angle=compound.state.angular.pos;
    ctx.save();
    ctx.translate(pos.x,pos.y);
    ctx.rotate(angle);
    ctx.fillRect(-10-compound.width/2,-compound.height/2,10,10);
    ctx.fillRect(10-compound.width/2,-compound.height/2,10,10);
    ctx.restore();
    */
    pos=compound.state.pos.values();
    angle=compound.state.angular.pos;
    ctx.save();
    ctx.translate(pos.x,pos.y);
    ctx.rotate(angle);
    ctx.fillStyle='#0000ff';
    ctx.beginPath();
    ctx.arc(-10,0,20,0,2*Math.PI);
    ctx.fill();
    ctx.fillStyle='#000088';
    ctx.beginPath();
    ctx.arc(20,0,10,0,2*Math.PI);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle='#ffffff';
    ctx.fillRect(pos.x-1,pos.y-1,2,2);

    pos=compound2.state.pos.values();
    angle=compound2.state.angular.pos;

    var pos1=com1.state.pos.values();
    var pos2=com2.state.pos.values();
    ctx.save();
    ctx.translate(pos.x,pos.y);
    ctx.rotate(angle);
    ctx.fillStyle='DarkViolet';
    //ctx.fillRect(pos1.x-com1.width/2,pos1.y-com1.height/2,com1.width,com1.height);
    ctx.beginPath();
    ctx.arc(pos1.x,pos1.y,com1.width/2,0,2*Math.PI);
    ctx.fill();

    ctx.fillStyle='White';
    //ctx.fillRect(pos2.x-com2.width/2,pos2.y-com2.height/2,com2.width,com2.height);
    ctx.beginPath();
    ctx.arc(pos2.x,pos2.y,com2.width/2,0,2*Math.PI);
    ctx.fill();

    ctx.restore();


}

function collision(data) {

    for(var i=0;i<data.collisions.length;i++)
    {
        //console.log('collision');
        //if(data.collisions[i].bodyB==circle1)
        //if(data.collisions[i].bodyB==ball[2].physics && data.collisions[i].bodyA==ball[1].physics || data.collisions[i].bodyA==ball[2].physics && data.collisions[i].bodyB==ball[1].physics ) {
    }
}
