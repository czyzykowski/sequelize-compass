(function() {
  var globals;

  globals = require("./../globals");

  exports.getSingle = function(req, res) {
    var requestedInstanceID = req.params.id;
    var modelName = globals.helpers.capitalizeFirstLetter(req.params.model);
    var modelConfigObject = globals.helpers.getModelConfigObject(modelName);
    var request = {};

    request.where = {};

    if (requestedInstanceID) {
      request.where["id"] = requestedInstanceID;
    }

    request.include = [];

    modelConfigObject.associations.forEach(function(association) {
      request.include.push({
        model: globals.modelsObject[association.model],
        as: association.as
      });
    });

    globals.modelsObject[modelName].find(request).then(function(modelInstance) {
      globals.helpers.getAllModelNames(function(err, modelsNames) {
        var associationInstances = {};
        var getAllModelInstances = {
          get: function(_, callback) {
            globals.modelsObject[_.model].findAll().then(function(instances) {
              associationInstances[_.as] = instances;
              callback(null, "OK");
            });
          }
        };
        require("async").map(modelConfigObject.associations, getAllModelInstances.get.bind(getAllModelInstances), function(err, result) {
          var data = globals.jade.renderFile("" + globals.viewsDir + "/single.jade", {
            prefix: globals.prefix,
            action: "edit",
            modelsNames: modelsNames,
            modelInstance: JSON.parse(JSON.stringify(modelInstance)),
            model: globals.modelsObject[modelName],
            modelConfigObject: modelConfigObject,
            associationInstances: associationInstances
          });
          res.set("Content-Type", "text/html");
          res.end(data);
        });
      });
    });
  };

  exports.postSingle = function(req, res) {
    var modelConfigObject, modelName, requestedInstanceID;
    requestedInstanceID = req.params.id;
    modelName = req.params.model.charAt(0).toUpperCase() + req.params.model.slice(1);
    modelConfigObject = globals.helpers.getModelConfigObject(modelName);
    globals.modelsObject[modelName].find({
      where: {
        id: requestedInstanceID
      }
    }).then(function(modelInstance) {
      modelConfigObject.attributes.forEach(function(attribute) {
        if (globals.modelsObject[modelConfigObject.modelName].rawAttributes[attribute].type === "TINYINT(1)") {
          modelInstance[attribute] = (req.body[attribute] === "true" ? true : false);
        } else {
          modelInstance[attribute] = req.body[attribute];
        }
      });
      modelInstance.save().then(function() {
        var setAssociation;
        setAssociation = {
          set: function(associationData, callback) {
            var retrieveAssociationObjects;
            retrieveAssociationObjects = {
              retrieve: function(objectID, callback) {
                globals.modelsObject[associationData.model].find({
                  where: {
                    id: objectID
                  }
                }).then(function(object) {
                  callback(null, object);
                }).catch(function(err) {
                  callback(err, null);
                });
              }
            };
            switch (associationData.type) {
              case "hasMany":
                require("async").map(globals.helpers.processMultipleSelectToArray(req.body["" + associationData.as]), retrieveAssociationObjects.retrieve.bind(retrieveAssociationObjects), function(err, retrievedObjects) {
                  modelInstance["set" + associationData.as](retrievedObjects).then(function() {
                    callback(null, "OK");
                  });
                });
              case "belongsTo":
                globals.modelsObject[associationData.model].find({
                  where: {
                    id: req.body["" + associationData.as]
                  },
                  limit: 1
                }).then(function(associationModel) {
                  modelInstance["set" + associationData.as](associationModel).then(function() {
                    callback(null, "OK");
                  });
                }).catch(function(err) {
                  callback(err, null);
                });
            }
          }
        };
        require("async").map(modelConfigObject.associations, setAssociation.set.bind(setAssociation), function(err, result) {
          res.redirect("" + globals.prefix + "/" + modelName);
        });
      });
    });
  };

}).call(this);
