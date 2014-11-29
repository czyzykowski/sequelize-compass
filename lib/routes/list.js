var globals = require("./../globals");

exports.getList = function(req, res) {

    var modelName = req.params.model.charAt(0).toUpperCase() + req.params.model.slice(1);
    var modelConfigObject = globals.helpers.getModelConfigObject(modelName);
    var request = {};

    if (modelConfigObject.attributes) {
        request.attributes = modelConfigObject.attributes;
    }

    globals.modelsObject[modelName].findAll(request).success(function(modelsList) {
        globals.helpers.getAllModelNames(function(err, modelsNames) {
            var data = globals.jade.renderFile("" + globals.viewsDir + "/list.jade", {
                prefix: globals.prefix,
                modelsNames: modelsNames,
                list: JSON.parse(JSON.stringify(modelsList)),
                model: globals.modelsObject[modelName],
                modelConfigObject: modelConfigObject
            });
            res.set("Content-Type", "text/html");
            res.end(data);
        });
    });
};
