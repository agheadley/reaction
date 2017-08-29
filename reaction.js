/* 1:20 scale atom_def : px */
var SCALE=20;
/* max x,y components total */
var MAX_SPEED=0.3;

/* no of mols of each type to display */
var INITIAL_CONDITIONS=[{name:'HI',count:1},{name:'I2',count:1},{name:'H2',count:1}];

var MOLECULE=[];

function reactionInit(world,max,canvas)
{
    for(var i=0;i<INITIAL_CONDITIONS.length;i++)
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

function reactionDrawAll(ctx)
{
    for(var i=0;i<MOLECULE.length;i++)
    {
        moleculeDraw(MOLECULE[i],ctx);
        
    }
}

