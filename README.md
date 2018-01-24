# tableTools

## Objective
- I want to use spreadsheets with calculated fields on web page.
- I want to decouple calculations from specific spreadsheet render to increase re-usability.
- I want to have some configurations and shortcuts to solve this tasks more easier.

## tableTools.tableCalculator.js

  #### A tool to compute table (sequence of rows) or row with calculated fields and nested calculated fields in functional way.
   ##### Concepts:
  - Some fields set by user, some are calculated.  
  - Calculated fields in row can only depend on fields of their row.  
  - Calculated fields are same in whole table.  
  - If user set value to calculated field - user input is ignored, field value overrides by calculation.  
  - The result is concentration of set by user fields and calculated fields.  
  - Traverse through table by iterator protocol.

[JSFiddle example (all output in console)](http://jsfiddle.net/vcxz09876/kLmkuzb7/)


## tableTools.HOTUtils.js
#### Realization of interface to use custom row calculation functionality with [handsontable](https://handsontable.com/) javascript tables, configurations and utility functions.
   ##### Content:
  - There are common functions to work with rows as with objects.  
  - There are reconfigured base classes to work with [handsontable](https://handsontable.com/), which realize row = rowUpdate(n, row) interface to use custom row calculation functions (can be realized with tableTools.tableCalculator.js).
  
  [JSFiddle example](http://jsfiddle.net/vcxz09876/01vbrjde/)

