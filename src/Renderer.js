
var Renderer = function(options) {
  this.layers = {};

//this.layers.depth       = Depth.initShader();
  this.layers.interaction = Interaction.initShader();
  this.layers.skydome     = SkyDome.initShader();
  this.layers.basemap     = Basemap.initShader();
  this.layers.buildings   = Buildings.initShader({
    showBackfaces: options.showBackfaces
  });

  this.resize();
  Events.on('resize', this.resize.bind(this));

  var color = Color.parse(options.backgroundColor || '#cccccc').toRGBA();
  this.backgroundColor = {
    r: color.r/255,
    g: color.g/255,
    b: color.b/255
  };

  GL.cullFace(GL.BACK);
  GL.enable(GL.CULL_FACE);
  GL.enable(GL.DEPTH_TEST);

  //Events.on('contextlost', function() {
  //  this.stop();
  //}.bind(this));

  //Events.on('contextrestored', function() {
  //  this.start();
  //}.bind(this));
};

Renderer.prototype = {

  start: function() {
    this.loop = setInterval(function() {
      requestAnimationFrame(function() {
        Map.transform = new Matrix()
          .rotateZ(Map.rotation)
          .rotateX(Map.tilt)
          .translate(WIDTH/2, HEIGHT/2, 0)
          .multiply(this.perspective);

// console.log('CONTEXT LOST?', GL.isContextLost());

//      this.layers.depth.render(this);
        this.layers.interaction.render(this);

        GL.clearColor(this.backgroundColor.r, this.backgroundColor.g, this.backgroundColor.b, 1);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        this.layers.skydome.render(this);
        this.layers.basemap.render(this);
        this.layers.buildings.render(this);
      }.bind(this));
    }.bind(this), 17);
  },

  stop: function() {
    clearInterval(this.loop);
  },

  resize: function() {
    this.perspective = Matrix._perspective(20, WIDTH, HEIGHT, 40000);
    GL.viewport(0, 0, WIDTH, HEIGHT);
  },

  destroy: function() {
    this.stop();
    for (var k in this.layers) {
      this.layers[k].destroy();
    }
  }
};