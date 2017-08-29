var ATOM_DEF={
    I:{name:"I",r:2,mass:4,color:"DarkViolet"},
    H:{name:"H",r:1,mass:1,color:"White"}
};


var MOLECULE_DEF={
    HI:[{atom:"H",x:-ATOM_DEF.H.r,y:0},{atom:"I",x:ATOM_DEF.I.r,y:0}],
    I2:[{atom:"I",x:-ATOM_DEF.I.r,y:0},{atom:"I",x:ATOM_DEF.I.r,y:0}],
    H2:[{atom:"H",x:-ATOM_DEF.H.r,y:0},{atom:"H",x:ATOM_DEF.H.r,y:0}]
};

/* argument is object array from MOLECULE_DEF */
function moleculeMake(name,molDef,scale)
{
    var mol={};
    var xCM=0;
    var yCM=0;

    for(var i=0;i<molDef.length;i++)
    {
        xCM+=ATOM_DEF[molDef[i].atom].mass*molDef[i].x*scale;
        yCM+=ATOM_DEF[molDef[i].atom].mass*molDef[i].y*scale;
    }
    xCM=xCM/molDef.length;
    yCM=yCM/molDef.length;

    
    mol['name']=name;
    mol['pos']={x:0,y:0};
    mol['vel']={x:0,y:0};
    mol['angle']=0;
    mol['atom']=[];
    
    for(var i=0;i<molDef.length;i++)
    {
        var mass=ATOM_DEF[molDef[i].atom].mass;
        var name=ATOM_DEF[molDef[i].atom].name;
        var color=ATOM_DEF[molDef[i].atom].color;
        var r=ATOM_DEF[molDef[i].atom].r*scale; 
        /* with CM calcs - Physics.js issues ? */       
        var x=-xCM+molDef[i].x*scale;
        var y=-yCM+molDef[i].y*scale;
        /* checking without CM calcs */
        var x=molDef[i].x*scale;
        var y=molDef[i].y*scale;
        mol['atom'].push({x:x,y:y,r:r,mass:mass,name:name,color:color});
    }
    return mol;
}

 /* now add as compound bodies to the WORLD */
 function moleculeAddToWorld(mol,world)
 {
    var offspring=[];
    for(var i=0;i<mol.atom.length;i++)
    {
            var child=Physics.body('rectangle',{x:mol.atom[i].x,y:mol.atom[i].y,width:2*mol.atom[i].r,height:2*mol.atom[i].r,mass:mol.atom[i].mass});
            offspring.push(child);
    }
    var options={x:mol.pos.x,y:mol.pos.y,vx:mol.vel.x,vy:mol.vel.y,cof:0,restitution:1.0,children:offspring};
    var physics=Physics.body('compound',options);
    world.add(physics);
    mol['physics']=physics;
    return mol;

 }

/* draw a molecule */
function moleculeDraw(mol,ctx)
{
    var pos=mol.physics.state.pos.values();
    var angle=mol.physics.state.angular.pos;
    
    ctx.save();
    ctx.translate(pos.x,pos.y);
    ctx.rotate(angle);
    //ctx.fillRect(-rec1.width/2,-rec1.height/2,rec1.width,rec1.height);
    for(var i=0;i<mol.atom.length;i++)
    {
        ctx.fillStyle=mol.atom[i].color;
        ctx.beginPath();
        //ctx.fillRect(mol.atom[i].x-mol.atom[i].r,mol.atom[i].y-mol.atom[i].r,2*mol.atom[i].r,2*mol.atom[i].r);
        ctx.arc(mol.atom[i].x,mol.atom[i].y,mol.atom[i].r,0,2*Math.PI);
        ctx.fill();
    }

    ctx.restore();
}

/* sets angle in radians */
function moleculeSetAngle(mol,angle)
{
    mol.angle=angle;
    return mol;
}

/* sets pos  */
function moleculeSetPosition(mol,x,y)
{
    mol.pos.x=x;
    mol.pos.y=y;
    return mol;
}

/* sets speed */
function moleculeSetSpeed(mol,vx,vy)
{
    
    mol.vel.x=vx;
    mol.vel.y=vy;

    return mol;
}


