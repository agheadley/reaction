/* 1:20 scale atom_def : px */
var SCALE=5;
/* max x,y components total */
var MAX_SPEED=0.4;

/* no of mols of each type to display */
var INITIAL_CONDITIONS=[{name:'HI',count:0},{name:'I2',count:10},{name:'H2',count:10}];

var REACTION_RULES=[
    {molA:"I2",molB:"H2",result:["HI","HI"],speed:0.3},
    {molA:"HI",molB:"HI",result:["I2","H2"],speed:0.1},
];

var MOLECULE=[];

function reactionInit(world,max,canvas)
{
    for(var i=0;i<INITIAL_CONDITIONS.length;i++)
    {
        for(j=0;j<INITIAL_CONDITIONS[i].count;j++)
        {
        /* make molecules and assign random speed */
        var mol=moleculeMake(INITIAL_CONDITIONS[i].name,MOLECULE_DEF[INITIAL_CONDITIONS[i].name],SCALE);
        
        
        var vx=-max+2*Math.random()*max;
        var vy=Math.sqrt(max*max-vx*vx);
        if(Math.random()<0.5) vy=-vy;
        
        mol=moleculeSetSpeed(mol,vx,vy);

        var x=Math.random()*canvas.width;
        var y=Math.random()*canvas.height;
        
        mol=moleculeSetPosition(mol,x,y);
    
        /* now add as compound bodies to the WORLD */
        mol=moleculeAddToWorld(mol,world);
        
        MOLECULE.push(mol);
        }
    }

}

function  reactionProcessCollision(collision,world,canvas,max)
{
    var addList=[];
    var removeList=[];

    var indexA,indexB;
    var a,b;

    indexA=null;
    indexB=null;
    for(a=0;a<MOLECULE.length;a++) if(collision.bodyA==MOLECULE[a].physics) indexA=a;    
    for(b=0;b<this.MOLECULE.length;b++) if(collision.bodyB==MOLECULE[b].physics) indexB=b;
    
    /* not a wall collision ... */
    if(indexA!=null && indexB!=null) 
    {   
        for(var i=0;i<REACTION_RULES.length;i++)
        {
            if((MOLECULE[indexA].name==REACTION_RULES[i].molA && MOLECULE[indexB].name==REACTION_RULES[i].molB) || (MOLECULE[indexB].name==REACTION_RULES[i].molA && MOLECULE[indexA].name==REACTION_RULES[i].molB))
            {
                
                /* check to see collision is of Ea - simple based on overall speed */
                var vx=Math.abs(MOLECULE[indexA].physics.state.vel.values().x);
                vx+=Math.abs(MOLECULE[indexB].physics.state.vel.values().x);
                var vy=Math.abs(MOLECULE[indexA].physics.state.vel.values().y);
                vy+=Math.abs(MOLECULE[indexB].physics.state.vel.values().y);
                var speed=Math.sqrt(vx*vx+vy*vy)
                //console.log('collision between '+MOLECULE[indexA].name+' and '+MOLECULE[indexB].name+' at speed : '+speed);
                
                
                /* if Ea (speed) exceeded - perform a reaction */
                if(speed>REACTION_RULES[i].speed) 
                {
                  
                    removeList.push(indexA);
                    removeList.push(indexB);
                    /* add new molecules */
                    
                    for(var j=0;j<REACTION_RULES[i].result.length;j++) addList.push(REACTION_RULES[i].result[j]);

                }
            }
        }  
    }
    reactionRemove(removeList,world);
    reactionAdd(addList,world,canvas,max); 
    reactionCountAll(); 
}

/* check counts for all mols */
function reactionCountAll()
{
    for(var i=0;i<INITIAL_CONDITIONS.length;i++) INITIAL_CONDITIONS[i]['tempCount']=0;
    
    for(var i=0;i<INITIAL_CONDITIONS.length;i++)
    {
        for(var j=0;j<MOLECULE.length;j++)
        {
            if(INITIAL_CONDITIONS[i].name==MOLECULE[j].name) INITIAL_CONDITIONS[i]['tempCount']++;
        }
    }
    console.log(INITIAL_CONDITIONS);
}


/* remove reacted molecules */
function reactionRemove(indices,world)
{
    indices.sort(function(a, b){return b-a});
    for(var i=0;i<indices.length;i++)
    {
        world.removeBody(MOLECULE[indices[i]].physics);
        MOLECULE.splice(indices[i],1);
    }
}

/* add new molecules within x1,y1 and x2,y2 bounding box.*/
function reactionAdd(names,world,canvas,speed)
{
    for(var i=0;i<names.length;i++)
        {
            var mol=moleculeMake(names[i],MOLECULE_DEF[names[i]],SCALE);
           

            var x=Math.random()*canvas.width;
            var y=Math.random()*canvas.height;
            
            mol=moleculeSetPosition(mol,x,y);

            var vx=-speed+2*Math.random()*speed;
            var vy=Math.sqrt(speed*speed-vx*vx);
            if(Math.random()<0.5) vy=-vy;

            mol=moleculeSetSpeed(mol,vx,vy);
            
            
            mol=moleculeAddToWorld(mol,world);
            MOLECULE.push(mol);
            
        }
}

function reactionDrawAll(ctx)
{
    for(var i=0;i<MOLECULE.length;i++)
    {
        moleculeDraw(MOLECULE[i],ctx);
        
    }
}

