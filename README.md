# tableTools

## Objective
- I want to use spreadsheets with calculated fields on web page.
- I want to decouple calculations from specific spreadsheet render to increase reusability.
- I want to have some preconfigurations and shorcuts to solve this tasks more easier.

## tableTools.tableCalculator.js

  #### A tool to compute table (sequence of rows) or row with calculated fields and nested calculated fields in functional way.
   ##### Concepts:
  - Some fields set by user, some are calculated.  
  - Calculated fields in row can only depend on fields of their row.  
  - Calculated fields are same in whole table.  
  - If user set value to calculated field - user input is ignored, field value overrides by calculation.  
  - The result is concentraiton of set by user fields and calculated fields.  
  - Traverse through table by iterator protocol.

[JSFiddle example (all output in console)](http://jsfiddle.net/vcxz09876/kLmkuzb7/)

