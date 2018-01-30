/*
Example: https://jsfiddle.net/vcxz09876/kLmkuzb7/

##########################################################################################################
  CONCEPTS:
##########################################################################################################

  ### Idea:

  I need a tool to calculate fields in row.

  Some fields set by user, some - calculated.
  Calculated fields in row can only depend on fields of their row.
  Calculated fields are same in whole table.
  If user set value to calculated field - user input is ignored, field value overrides by calculation.
  The result is concentraiton of set by user fields and calculated fields.

  ### Implementation notes:

  Row - object{feild_name1: value1, feild_name2: value2, ...: ...}
  Table - iterator of rows (next(){value, done} interface)

  ### Workflow notes:

  1. SetUp TableCalculationIterator by passing CalculatedFields{FieldName1: f1(ValueFinder), FieldName2: f2(ValueFinder), ...:...}

  2. Make row iterator by passing iterator of user inputed rows to TableCalculationIterator.

  ### I/O

  Input:
  Iterator of {feild_name1: value1, feild_name2: value2, ...: ...} objects (rows).

  Output:
  Iterator of {feild_name1: f1, feild_name2: f2, ...: ...} objects (rows).
  With fn() functions, that return values, to make possible calculate fields on demand.

  ### I tried to not use latest ECMAScript standards to make code execution more stable.
  */

var tableCalculator = {};

tableCalculator.makeIterator = function(array) {
  var nextIndex = 0;

  return {
    next: function() {
      return nextIndex < array.length ? {
        value: array[nextIndex++],
        done: false
      } : {
        done: true
      };
    }
  };
}

// Make ValueFinder function from object {name: const}, find value by name.
tableCalculator.makeValueFinder = function(obj) {
  function f(name) {
    return obj[name];
  }
  return f;
}

// Round Calculation result to n digits.
tableCalculator.withRD = function(n) {
  return function(f) {
    return function rdf(vf) {
      if (isNaN(f(vf))) {
        return undefined;
      }
      return Number(f(vf).toFixed(n))
    };
    return rdf
  };
}

// OVF - object to ValueFinder converter, if you pass object it will be converted to ValueFinder function.
tableCalculator.withOVF = function(f) {
  //vf - viewFinder shortcut
  return function(vf) {
    if (typeof vf != "function") {
      vf = tableCalculator.makeValueFinder(vf);
    };
    return f(vf);
  };
}

// Merge calculation filed stack. Stack of calculation fields can be used to extend calculations without rewriting calculation code.
tableCalculator.mergeFields = function(result, calculatedFields) {
  if (calculatedFields.length == 0) {
    return result
  };
  for (key in calculatedFields[0]) {
    result[key] = calculatedFields[0][key];
  };
  return tableCalculator.mergeFields(result, Array.prototype.slice.call(calculatedFields, 1));
};

//Make object RowCalculator{FieldName1: f1(), FieldName2: f2(), ...:...} object.
//f() calculates field value independent of field type (user inputed or calculated).
tableCalculator.makeRowCalculator = function(uiFields) {
  var uf = uiFields; // Just shortcut.
  var cf = tableCalculator.mergeFields({}, Array.prototype.slice.call(arguments, 1)); // Other arguments are stack of calculated fields

  // findSolution function hava same interface as ValueFinder function.
  // findSolution function implments recursive tree traversal algorithm.
  function findSolution(fname) {
    if (cf.hasOwnProperty(fname)) {
      return cf[fname](findSolution);
    } else if (uf.hasOwnProperty(fname)) {
      return uf[fname];
    } else {
      return undefined;
    };
  }

  // Set name as function parameter by closure
  function makeSolutionFunction(name) {
    var n = name;
    return function() {
      return findSolution(n);
    };
  }

  return (function(result) {
    for (i in arguments) {
      for (key in arguments[i]) {
        result[key] = makeSolutionFunction(key);
      };
    };
    return result;
  })({}, cf, uf);
};

// SetUp function for calculated field stack (for kind of tables), that return row iterator.
// Returned function have interfase f(user inputed rows iterator) -> (resulting rows iterator)
tableCalculator.makeTableCalculationIterator = function() {
  var cf = tableCalculator.mergeFields({}, Array.prototype.slice.call(arguments, 0)); // Merge calculated fields (all arguments)

  return function iter(i) {

    return {
      next: function() {
        var n = i.next();
        if (n.done === false) {
          return {
            value: tableCalculator.makeRowCalculator(n.value, cf),
            done: false
          };
        } else {
          return {
            value: undefined,
            done: true
          };
        }
      }
    };
    return iter;
  };
}

/*
 #########################################################################################################
 SINGLE ROW CALCULATION:
 #########################################################################################################
*/

tableCalculator.makeRowCalculation = function(calculatedFields) {
  return function(row) {
    var cf = calculatedFields,
      rowCalculator = tableCalculator.makeRowCalculator(row, cf),
      result = {};

    for (key in rowCalculator) {
      result[key] = rowCalculator[key]();
    };
    return result;

  };
}

/*
 #########################################################################################################
 LIANER INTERPOLATION:
 #########################################################################################################
*/

tableCalculator.Point2D = function(x, y) {
  this.x = x;
  this.y = y;
}


tableCalculator.interpLianer = function (p1, p2) {
  return function(x) {
    /*
    line function:
    y = k*x + b
    k = (y2 - y1) / (x2 - x1)
    b = y1 - k * x1
    */
    var k = (p2.y - p1.y) / (p2.x - p1.x),
      b = p1.y - k * p1.x;

    return new tableCalculator.Point2D(x, k * x + b);
  };
}

tableCalculator.interpOnPline = function(plist) {
    /*
    Find point on polyline.
    Polyline - array of point (Point2D)
    */
  return function(x) {
    var lastPoint = undefined,
      point = undefined;

    for (i in plist) {
      point = plist[i];

      if (x < point.x && (lastPoint === undefined)) {
        return undefined;
      }

      if (lastPoint === undefined) {
        lastPoint = point;
        continue;
      }

      if (lastPoint.x <= x && x <= point.x) {
        return tableCalculator.interpLianer(lastPoint, point)(x);
      }
      lastPoint = point;
    }
    return undefined;
  };
}

/*
 #########################################################################################################
 CONSOLE OUTPUT FUNCTIONS:
 #########################################################################################################
*/
tableCalculator.rowToConsole = function(rowCalculator, prefix) {
  for (key in rowCalculator) {
    console.log(prefix + ' :: ' + key + ' :: ' + rowCalculator[key]())
  };
};

tableCalculator.rowIteratorToConsole = function(rowIterator) {
  var i = 1;
  do {
    n = rowIterator.next()
    tableCalculator.rowToConsole(n.value, i++)
  }
  while (n.done === false);
};
