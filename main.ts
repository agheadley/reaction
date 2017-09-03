var Physics:any;  
var g_world:any;  
var g_canvas:HTMLCanvasElement;
var g_ctx:CanvasRenderingContext2D;
var g_animationID:any;
var g_startTime:number;

var g_molecule:any[];

var g_atom_H={name:'H',mass:1,r:1,color:'White'};
var g_atom_I={name:'H',mass:4,r:2,color:'DarkViolet'};

var g_mol_HI=[{atom:g_atom_H,x:-g_atom_H.r,y:0},{atom:g_atom_I,x:g_atom_I.r,y:0}];
var g_mol_H2=[{atom:g_atom_H,x:-g_atom_H.r,y:0},{atom:g_atom_H,x:g_atom_H.r,y:0}];
var g_mol_I2=[{atom:g_atom_I,x:-g_atom_I.r,y:0},{atom:g_atom_I,x:g_atom_I.r,y:0}];


var g_reaction={
    initial:[{name:'HI',data:g_mol_HI,total:1},{name:'H2',data:g_mol_H2,total:1},{name:'I2',data:g_mol_I2,total:1}],
    rule:[],
    speed:0.2,
    scale:10,
    width:500,
    height:400
};




function collision(data)
{
    for(let i=0;i<data.collisions.length;i++) 
    {
  
    }
}



function drawMolecule(molecule)
{
    /* recommended for compound bodies */
    molecule.physics.refreshGeometry();

    /* get state from the body */
    let pos=molecule.physics.state.pos.values();
    let angle=molecule.physics.state.angular.pos;

    /* draw each atom in the molecule */
    for(let i=0;i<molecule.atom.length;i++)
    {
        g_ctx.save();
        g_ctx.translate(pos.x,pos.y);
        g_ctx.rotate(angle);
        g_ctx.fillStyle=molecule.atom[i].color;
        g_ctx.beginPath();
        g_ctx.arc(molecule.atom[i].x,molecule.atom[i].y,molecule.atom[i].r,0,2*Math.PI);
        g_ctx.fill();
        g_ctx.restore();
        
    }

    
}

/* main animation loop */
function step(timestamp)
{
    if (!g_startTime) g_startTime = timestamp;
    var progress = timestamp - g_startTime;
    g_world.step(timestamp);

    g_ctx.clearRect(0,0,g_canvas.width,g_canvas.height);

    /* start animation code  */

    for(let i=0;i<g_molecule.length;i++)
    {
        drawMolecule(g_molecule[i]); 
    }
    
    /* end animation code */
    g_animationID= window.requestAnimationFrame(step);
}

function init()
{
    /* remove time */
    g_startTime=undefined;

    /* setup physics */
    initWorld();

    /* add molecules to world, using initial conditions */
    let initial=g_reaction.initial;
    g_molecule=[];
    for(let i=0;i<initial.length;i++)
    {
        for(let j=0;j<initial[i].total;j++)
        {
            g_molecule.push(createMolecule(initial[i].name,initial[i].data));
        }
        
    }

    /* start step timer and renderer */
    g_animationID= window.requestAnimationFrame(step);
    
}

function createMolecule(nameText,data)
{

    /* create molecule object */
    let molecule={physics:null,name:nameText,atom:[]};

    /* get random position and velocity */
    let posx=Math.random()*g_canvas.width;
    let posy=Math.random()*g_canvas.height;
    let velx=-g_reaction.speed+2*Math.random()*g_reaction.speed;
    let vely=Math.sqrt(g_reaction.speed*g_reaction.speed-velx*velx);
    if(Math.random()<0.5) vely=-vely;
    
    /* find centre of mass */
    let cmx:number=0;
    let cmy:number=0;
    let mass:number=0;
    
    for(let i=0;i<data.length;i++)
    {
            //console.log(data[i].atom.mass,data[i].atom.r,data[i].x,data[i].y);
            cmx+=data[i].x*g_reaction.scale*data[i].atom.mass;
            cmy+=data[i].y*g_reaction.scale*data[i].atom.mass;
            //console.log(cmx,cmy);
            mass+=data[i].atom.mass;
    }
    cmx=cmx/mass;
    cmy=cmy/mass;
    
    console.log(cmx,cmy);

    let child=[];
    let atomData=[];
    for(let i=0;i<data.length;i++)
    {

        let posx=data[i].x*g_reaction.scale;
        let posy=data[i].y*g_reaction.scale;
        let rad=data[i].atom.r*g_reaction.scale;
        let atomColor=data[i].atom.color;
        let m=data[i].atom.mass;
        
        
        let vertex=[    {x:rad,y:0},{x:0.707*rad,y:-0.707*rad},
                        {x:0,y:-rad},{x:-0.707*rad,y:-0.707*rad},
                        {x:-rad,y:0},{x:-0.707*rad,y:0.707*rad},
                        {x:0,y:rad},{x:0.707*rad,y:0.707*rad}
        ];

        let  options={vertices:vertex,x:posx,y:posy,mass:m};
        let poly= Physics.body('convex-polygon',options);
    
        atomData.push({x:posx,y:posy,r:rad,color:atomColor});
        child.push(poly);

    }

    let options={x:posx+cmx,y:posy+cmy,vx:velx,vy:vely,cof:0,restitution:1.0,children:child};
    let physics=Physics.body('compound',options);
    g_world.add(physics);

    molecule.physics=physics;
    molecule.atom=atomData;
    console.log(molecule);

    return molecule;



}


function initWorld()
{
   /* global world */
   g_world=Physics({timestep:1000.0/160,maxIPF:16,integrator:'verlet'});
   var gravity=Physics.behavior('constant-acceleration',{x:0,y:0.004}); //default
   gravity.setAcceleration({x:0,y:0});
   g_world.add(gravity);
   /* add borders */
   var bounds=Physics.aabb(0, 0, g_canvas.width, g_canvas.height)
   var viewPort=Physics.behavior('edge-collision-detection', {aabb:bounds,restitution: 1.0,cof: 1.0});
   g_world.add(viewPort);
   /* detect and respond to collisions */
   g_world.add(Physics.behavior('body-impulse-response'));
   g_world.add(Physics.behavior('body-collision-detection'));
   g_world.add(Physics.behavior('sweep-prune'));
   g_world.on('collisions:detected', collision);
       
}

function pauseToggle()
{
    /* https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelAnimationFrame */
    if(g_animationID!=null) {
        window.cancelAnimationFrame(g_animationID);
        g_animationID=null;
    }
    else g_animationID = window.requestAnimationFrame(step);
}

function resizeCanvas(w,h)
{
    g_reaction.width=w;
    g_reaction.height=h;
    g_canvas.width=w;
    g_canvas.height=h;
    init();
}


window.onload=() => {
    main('canvas');
};

function main(id)
{
    g_canvas=<HTMLCanvasElement>document.getElementById(id);
    g_canvas.width=g_reaction.width;
    g_canvas.height=g_reaction.height;
    
    g_ctx=g_canvas.getContext('2d');    

    init();
}
