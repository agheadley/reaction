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
    initial:[{name:'HI',data:g_mol_HI,total:8},{name:'H2',data:g_mol_H2,total:8},{name:'I2',data:g_mol_I2,total:8}],
    rule:[
        {A:'H2',B:'I2',speed:0.3,result:['HI','HI']},
        {A:'HI',B:'HI',speed:0.4,result:['I2','H2']}
    ],
    speed:0.2,
    scale:5,
    width:500,
    height:400,
    activeCollision:[]
};


/* reaction results ? collision between g_molecule[a] and g_molecule[b] results in a reaction */
function processCollision(a,b)
{
    let inlist=[];
    let outlist=[];
    //console.log('collision ...  '+a+':'+g_molecule[a].name+'   '+b+':'+g_molecule[b].name);
    for(let i=0;i<g_reaction.rule.length;i++)
    {
        if((g_reaction.rule[i].A==g_molecule[b].name && g_reaction.rule[i].B==g_molecule[a].name) ||(g_reaction.rule[i].A==g_molecule[a].name && g_reaction.rule[i].B==g_molecule[b].name))
        {
            let vel=g_molecule[a].physics.state.vel.values();
            let speed=Math.sqrt(vel.x*vel.x+vel.y*vel.y);
            vel=g_molecule[b].physics.state.vel.values();
            speed+=Math.sqrt(vel.x*vel.x+vel.y*vel.y);
            if(speed>g_reaction.rule[i].speed)
            {
                console.log('successful reaction  ...  '+a+':'+g_molecule[a].name+'   '+b+':'+g_molecule[b].name+' speed :'+speed);
                outlist.push(a);
                outlist.push(b);
                for(let j=0;j<g_reaction.rule[i].result.length;j++) inlist.push(g_reaction.rule[i].result[j]);
            }
            
        }    
    }

    return {outIndex:outlist,inName:inlist};
    
}

function collision(data)
{
    let addition:string[]=[];   /* name array of molecules to add */
    let removal:number[]=[];    /* indices of g_molecule to remove */
    let indexA,indexB:number;
    let a,b:number;

    indexA=null;
    indexB=null;

    for(let i=0;i<data.collisions.length;i++) 
    {
        for(a=0;a<g_molecule.length;a++) if(data.collisions[i].bodyA==g_molecule[a].physics) indexA=a;    
        for(b=0;b<g_molecule.length;b++) if(data.collisions[i].bodyB==g_molecule[b].physics) indexB=b;
    }
    /* collision between molecules - process by collecting possible additions / removals */
    if(indexA!=null && indexB!=null)
    {   
        let data=processCollision(indexA,indexB);
        for(let i=0;i<data.inName.length;i++) addition.push(data.inName[i]);
        for(let i=0;i<data.outIndex.length;i++) removal.push(data.outIndex[i]);
        
    }

    console.log('Reaction...');
    console.log('adding ...',addition);
    console.log('removing ...',removal);

    /* sort reverse order so that splicing does not remove the wrong indecies */
    removal.sort(function(a, b){return b-a});
    /* remove body from Physics and remove g_molecule entry */
    for(let i=0;i<removal.length;i++)
    {
        /* add to the activeCollision list so that it can be shown on screen */
        let pos=g_molecule[removal[i]].physics.state.pos.values();
        g_reaction.activeCollision.push({time:0,x:pos.x,y:pos.y});
        /* finally remove body from world and remove molecule from list */
        g_world.removeBody(g_molecule[removal[i]].physics);
        g_molecule.splice(removal[i],1);
    }

    /* now add new molecules */
    for(let i=0;i<addition.length;i++)
    {
        for(let j=0;j<g_reaction.initial.length;j++)
        {
            if(g_reaction.initial[j].name==addition[i])
            {
                g_molecule.push(createMolecule(addition[i],g_reaction.initial[j].data));
            }
        }

        
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

function drawCollision(index)
{
    let collision=g_reaction.activeCollision[index];
    let r=4*g_reaction.scale;
    g_ctx.fillStyle='rgba(227,0,0,0.8)';
    g_ctx.beginPath();
    g_ctx.arc(collision.x,collision.y,r,0,2*Math.PI);
    g_ctx.fill();
    
}

/* main animation loop */
function step(timestamp)
{
    if (!g_startTime) g_startTime = timestamp;
    var progress = timestamp - g_startTime;
    g_world.step(timestamp);

    g_ctx.clearRect(0,0,g_canvas.width,g_canvas.height);

    /* start animation code  */

    /* draw molecules */
    for(let i=0;i<g_molecule.length;i++)
    {
        drawMolecule(g_molecule[i]); 
    }

    /* render any active collision markers */
    let removal=[];
    console.log(g_reaction.activeCollision);
    for(let i=0;i<g_reaction.activeCollision.length;i++)
    {
        if(g_reaction.activeCollision[i].time==0) g_reaction.activeCollision[i].time=timestamp;
        if(timestamp>(g_reaction.activeCollision[i].time+200)) removal.push(i);
        else drawCollision(i);
    }
    /* now remove old collisions - sort reverse for splicing */
    removal.sort(function(a, b){return b-a});
    for(let i=0;i<removal.length;i++) g_reaction.activeCollision.splice(removal[i],1);


    
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

function changePressure(direction)
{
    document.getElementById('pValue').innerHTML='200';
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
