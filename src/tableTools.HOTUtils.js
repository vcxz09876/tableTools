/*

https://jsfiddle.net/vcxz09876/01h2sp1a/show_js/
##########################################################################################################
  IDEA:
##########################################################################################################

Simplify usage of Handsontable (https://handsontable.com/) by making some shortcuts and preconfigurations.

Basicly, I intend to use it in my own projects. Just, want to store simplifications in one place.
*/


var HOTUtils = {};

/*
Some unility functions to simplify code late
*/

HOTUtils.mergeObjects = function(result, objects) {
  if (objects.length == 0) {
    return result
  };
  for (key in objects[0]) {
    result[key] = objects[0][key];
  };
  return HOTUtils.mergeObjects(result, Array.prototype.slice.call(objects, 1));
};

HOTUtils.objectToSetRowArray = function(n, obj) {
  var res = [];
  for (k in obj) {
    res.push([n, k, obj[k]])
  };
  return res;
}

HOTUtils.reCalculate = function(data, rowUpdate) {
  for (k in data) {
    data[k] = rowUpdate(0, data[k]);
  };
  return data;
}


/*
##########################################################################################################
  HOTUtils.HOT*
##########################################################################################################

### Idea

Make some preconfigured base classes to simplify usage.
Provide ability to use custom row calculators.

### What they do:

Merge all configurations:
                         defaultHOTConfig - set in HOTUtils abstract classes,
                         extendHOTConfig - set in user defined subclass,
                         overrideConfig - set as render argument.

Implement row recalculatioin by call row = rowUpdate(n, row) function on startup and cell change.
*row - structure {'fieldname1': value1, 'fieldname2': value2, ... : ...}

*/

//Topmost class with most basic configurations and functional
HOTUtils.HOTAbstract = function(target) {

  // Element id to render table
  this.target = target;

  // Config extentions by user.
  this.extendHOTConfig = {};

	// Function that recalculate row on change.
  // Return row {'fieldname1': value1, 'fieldname2': value2, ... : ...}
  this.rowUpdate = function(n, row) {
    return row;
  }

  //Simplify render initilization.
  this.makeRender = function renderHOT(target, config, rowCalculator) {
    var
      container = document.getElementById(target),
      hot = new Handsontable(container, config);
    return hot;
  }

	// Function renders HOT table in this.target element
  this.render = function(overrideConfig) {
    var rowUpdate = this.rowUpdate;

    if (overrideConfig === undefined) {
      overrideConfig = {};
    }

    // Configs mergeing
    var config = HOTUtils.mergeObjects({}, [this.defaultHOTConfig, this.extendHOTConfig, overrideConfig]);

    HOTUtils.reCalculate(config.data, rowUpdate);

    // Rendering table
    var hot = this.makeRender(this.target, config, '');

    // Function that is called on cell change.
    function onCellChange() {
      var old_value = arguments[0][0][2], // get values form argumets, that pass HOT, when call onCellChange function
        new_value = arguments[0][0][3];

      // Check value change to avoid infinite updates.
      // Additional check if all parameters is NaN to avoid infinit loop with NaN NaN comparison, but can be buggy on not number values.
      if (old_value == new_value || (isNaN(old_value) && isNaN(new_value))) {
        return true;
      };
      var row_n = arguments[0][0][0], // get row number from arguments
        row = hot.getSourceDataAtRow(row_n);

      // Recalculate row values by calling rowUpdate function and set this values to HOT table.
      hot.setDataAtRowProp(HOTUtils.objectToSetRowArray(row_n, rowUpdate(row_n, row)));
    }

    // Register hook on HOT, that calls onCellChange function on every cell change.
    Handsontable.hooks.add('afterChange', onCellChange, hot);

    // Return HOT table instance.
    return hot;

  };

}

// Editable table preconfiguration.
HOTUtils.HOTEditor = function(target) {
  HOTUtils.HOTAbstract.call(this);

  this.target = target;

  this.defaultHOTConfig = {
    allowInsertRow: true,
    columnSorting: true,
    sortIndicator: true,
    manualColumnResize: true,
    minSpareRows: 1
  };

}