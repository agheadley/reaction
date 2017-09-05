var Physics;
var g_world;
var g_canvas;
var g_ctx;
var g_animationID;
var g_startTime;
var g_molecule;
var g_atom_H = { name: 'H', mass: 1, r: 1, color: 'White' };
var g_atom_I = { name: 'H', mass: 4, r: 2, color: 'DarkViolet' };
var g_mol_HI = [{ atom: g_atom_H, x: -g_atom_H.r, y: 0 }, { atom: g_atom_I, x: g_atom_I.r, y: 0 }];
var g_mol_H2 = [{ atom: g_atom_H, x: -g_atom_H.r, y: 0 }, { atom: g_atom_H, x: g_atom_H.r, y: 0 }];
var g_mol_I2 = [{ atom: g_atom_I, x: -g_atom_I.r, y: 0 }, { atom: g_atom_I, x: g_atom_I.r, y: 0 }];
var g_reaction = {
    initial: [{ name: 'HI', data: g_mol_HI, total: 1 }, { name: 'H2', data: g_mol_H2, total: 1 }, { name: 'I2', data: g_mol_I2, total: 1 }],
    rule: [],
    speed: 0.2,
    scale: 10,
    width: 500,
    height: 400
};
/* reaction results ? collision between g_molecule[a] and g_molecule[b] results in a reaction */
function processCollision(a, b) {
    console.log('collision ...  ' + a + ':' + g_molecule[a].name + '   ' + b + ':' + g_molecule[b].name);
}
function collision(data) {
    var indexA, indexB;
    var a, b;
    indexA = null;
    indexB = null;
    for (var i = 0; i < data.collisions.length; i++) {
        for (a = 0; a < g_molecule.length; a++)
            if (data.collisions[i].bodyA == g_molecule[a].physics)
                indexA = a;
        for (b = 0; b < g_molecule.length; b++)
            if (data.collisions[i].bodyB == g_molecule[b].physics)
                indexB = b;
    }
    /* collision between molecules - process */
    if (indexA != null && indexB != null) {
        processCollision(indexA, indexB);
    }
}
function drawMolecule(molecule) {
    /* recommended for compound bodies */
    molecule.physics.refreshGeometry();
    /* get state from the body */
    var pos = molecule.physics.state.pos.values();
    var angle = molecule.physics.state.angular.pos;
    /* draw each atom in the molecule */
    for (var i = 0; i < molecule.atom.length; i++) {
        g_ctx.save();
        g_ctx.translate(pos.x, pos.y);
        g_ctx.rotate(angle);
        g_ctx.fillStyle = molecule.atom[i].color;
        g_ctx.beginPath();
        g_ctx.arc(molecule.atom[i].x, molecule.atom[i].y, molecule.atom[i].r, 0, 2 * Math.PI);
        g_ctx.fill();
        g_ctx.restore();
    }
}
/* main animation loop */
function step(timestamp) {
    if (!g_startTime)
        g_startTime = timestamp;
    var progress = timestamp - g_startTime;
    g_world.step(timestamp);
    g_ctx.clearRect(0, 0, g_canvas.width, g_canvas.height);
    /* start animation code  */
    for (var i = 0; i < g_molecule.length; i++) {
        drawMolecule(g_molecule[i]);
    }
    /* end animation code */
    g_animationID = window.requestAnimationFrame(step);
}
function init() {
    /* remove time */
    g_startTime = undefined;
    /* setup physics */
    initWorld();
    /* add molecules to world, using initial conditions */
    var initial = g_reaction.initial;
    g_molecule = [];
    for (var i = 0; i < initial.length; i++) {
        for (var j = 0; j < initial[i].total; j++) {
            g_molecule.push(createMolecule(initial[i].name, initial[i].data));
        }
    }
    /* start step timer and renderer */
    g_animationID = window.requestAnimationFrame(step);
}
function createMolecule(nameText, data) {
    /* create molecule object */
    var molecule = { physics: null, name: nameText, atom: [] };
    /* get random position and velocity */
    var posx = Math.random() * g_canvas.width;
    var posy = Math.random() * g_canvas.height;
    var velx = -g_reaction.speed + 2 * Math.random() * g_reaction.speed;
    var vely = Math.sqrt(g_reaction.speed * g_reaction.speed - velx * velx);
    if (Math.random() < 0.5)
        vely = -vely;
    /* find centre of mass */
    var cmx = 0;
    var cmy = 0;
    var mass = 0;
    for (var i = 0; i < data.length; i++) {
        //console.log(data[i].atom.mass,data[i].atom.r,data[i].x,data[i].y);
        cmx += data[i].x * g_reaction.scale * data[i].atom.mass;
        cmy += data[i].y * g_reaction.scale * data[i].atom.mass;
        //console.log(cmx,cmy);
        mass += data[i].atom.mass;
    }
    cmx = cmx / mass;
    cmy = cmy / mass;
    console.log(cmx, cmy);
    var child = [];
    var atomData = [];
    for (var i = 0; i < data.length; i++) {
        var posx_1 = data[i].x * g_reaction.scale;
        var posy_1 = data[i].y * g_reaction.scale;
        var rad = data[i].atom.r * g_reaction.scale;
        var atomColor = data[i].atom.color;
        var m = data[i].atom.mass;
        var vertex = [{ x: rad, y: 0 }, { x: 0.707 * rad, y: -0.707 * rad },
            { x: 0, y: -rad }, { x: -0.707 * rad, y: -0.707 * rad },
            { x: -rad, y: 0 }, { x: -0.707 * rad, y: 0.707 * rad },
            { x: 0, y: rad }, { x: 0.707 * rad, y: 0.707 * rad }
        ];
        var options_1 = { vertices: vertex, x: posx_1, y: posy_1, mass: m };
        var poly = Physics.body('convex-polygon', options_1);
        atomData.push({ x: posx_1, y: posy_1, r: rad, color: atomColor });
        child.push(poly);
    }
    var options = { x: posx + cmx, y: posy + cmy, vx: velx, vy: vely, cof: 0, restitution: 1.0, children: child };
    var physics = Physics.body('compound', options);
    g_world.add(physics);
    molecule.physics = physics;
    molecule.atom = atomData;
    console.log(molecule);
    return molecule;
}
function initWorld() {
    /* global world */
    g_world = Physics({ timestep: 1000.0 / 160, maxIPF: 16, integrator: 'verlet' });
    var gravity = Physics.behavior('constant-acceleration', { x: 0, y: 0.004 }); //default
    gravity.setAcceleration({ x: 0, y: 0 });
    g_world.add(gravity);
    /* add borders */
    var bounds = Physics.aabb(0, 0, g_canvas.width, g_canvas.height);
    var viewPort = Physics.behavior('edge-collision-detection', { aabb: bounds, restitution: 1.0, cof: 1.0 });
    g_world.add(viewPort);
    /* detect and respond to collisions */
    g_world.add(Physics.behavior('body-impulse-response'));
    g_world.add(Physics.behavior('body-collision-detection'));
    g_world.add(Physics.behavior('sweep-prune'));
    g_world.on('collisions:detected', collision);
}
function pauseToggle() {
    /* https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelAnimationFrame */
    if (g_animationID != null) {
        window.cancelAnimationFrame(g_animationID);
        g_animationID = null;
    }
    else
        g_animationID = window.requestAnimationFrame(step);
}
function resizeCanvas(w, h) {
    g_reaction.width = w;
    g_reaction.height = h;
    g_canvas.width = w;
    g_canvas.height = h;
    init();
}
window.onload = function () {
    main('canvas');
};
function main(id) {
    g_canvas = document.getElementById(id);
    g_canvas.width = g_reaction.width;
    g_canvas.height = g_reaction.height;
    g_ctx = g_canvas.getContext('2d');
    init();
}
//# sourceMappingURL=main.js.map