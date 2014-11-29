(function() {
  var globals;

  globals = require("./globals");

  module.exports = function(prefix, appObject, configObject, modelsObject) {
    globals.prefix = prefix;
    globals.appObject = appObject;
    globals.configObject = configObject;
    
    // transform modelsObject from array to key-value object
    // for fast accees e.g. modelsObject[ModelName].find...
    globals.modelsObject = globals.modelsObject || {};
    modelsObject.forEach(function(model){
        globals.modelsObject[model.name] = model
    })
    
    require("./router")(prefix, appObject, configObject, modelsObject);
  };

}).call(this);
