# Test report

Generated on 2026-10-25 from the `main` branch.

## Backend — Jest + Supertest (real PostgreSQL test database)

Command: `cd backend && npm run test:coverage`

```
--------------------------|---------|----------|---------|---------|-------------------------------
File                      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s             
--------------------------|---------|----------|---------|---------|-------------------------------
All files                 |    92.6 |       92 |     100 |   92.43 |                               
 src                      |     100 |       50 |     100 |     100 |                               
  app.js                  |     100 |       50 |     100 |     100 | 11                            
 src/config               |     100 |      100 |     100 |     100 |                               
  database.js             |     100 |      100 |     100 |     100 |                               
 src/middleware           |     100 |      100 |     100 |     100 |                               
  auth.middleware.js      |     100 |      100 |     100 |     100 |                               
 src/modules/auth         |   93.84 |    91.66 |     100 |   93.84 |                               
  auth.routes.js          |    82.6 |       75 |     100 |    82.6 | 22-23,42-43                   
  auth.service.js         |     100 |     87.5 |     100 |     100 | 9                             
  auth.validation.js      |     100 |      100 |     100 |     100 |                               
 src/modules/inventory    |   91.83 |    91.66 |     100 |   91.83 |                               
  inventory.routes.js     |    82.6 |       75 |     100 |    82.6 | 23-24,43-44                   
  inventory.service.js    |     100 |      100 |     100 |     100 |                               
  inventory.validation.js |     100 |      100 |     100 |     100 |                               
 src/modules/vehicles     |   90.98 |     92.5 |     100 |   90.51 |                               
  vehicles.routes.js      |   77.77 |       80 |     100 |   77.77 | 22-23,32-33,49-50,69-70,83-84 
  vehicles.service.js     |     100 |    88.88 |     100 |     100 | 44,62                         
  vehicles.validation.js  |   97.95 |    96.15 |     100 |   97.91 | 31                            
--------------------------|---------|----------|---------|---------|-------------------------------

Test Suites: 9 passed, 9 total
Tests:       67 passed, 67 total
Snapshots:   0 total
Time:        1.597 s, estimated 2 s
Ran all test suites.
```

## Frontend — Vitest + React Testing Library

Command: `cd frontend && npm run test:coverage`

```
 Test Files  14 passed (14)
      Tests  72 passed (72)
   Duration  3.19s (tests 41%, environment 39%, setup 9%, import 5%, transform 3%, worker 3%)

 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   93.44 |    95.66 |    87.3 |   93.91 |                   
 src               |       0 |      100 |       0 |       0 |                   
  App.jsx          |       0 |      100 |       0 |       0 | 10                
 src/api           |   73.33 |       95 |   33.33 |   75.86 |                   
  auth.js          |       0 |      100 |       0 |       0 | 4-8               
  client.js        |   94.11 |    93.33 |   66.66 |     100 | 35                
  vehicles.js      |   54.54 |      100 |   28.57 |   54.54 | 4,21-33           
 src/components    |   93.84 |    95.45 |   92.06 |   94.35 |                   
  AppShell.jsx     |    92.3 |      100 |    87.5 |    92.3 | 99                
  ...leSection.jsx |   93.75 |     87.5 |      80 |   93.75 | 36                
  Dialog.jsx       |   88.88 |       50 |     100 |     100 | 9                 
  FilterBar.jsx    |   91.66 |    88.23 |   86.66 |    90.9 | 42,51             
  Icons.jsx        |   83.33 |      100 |   83.33 |   83.33 | 33                
  LotBays.jsx      |     100 |     87.5 |     100 |     100 | 32                
  ...ockDialog.jsx |    87.5 |      100 |     100 |    87.5 | 25-26             
 src/context       |   93.33 |      100 |     100 |   93.33 |                   
  AuthContext.jsx  |   93.33 |      100 |     100 |   93.33 | 12                
 src/pages         |   97.27 |    96.55 |   94.11 |   97.84 |                   
  ...ntoryPage.jsx |    98.3 |    96.87 |   94.44 |     100 | 46                
  ...eFormPage.jsx |   94.11 |    95.12 |      90 |   93.87 | 53-54,92          
 src/utils         |   95.34 |    93.54 |     100 |   94.59 |                   
  validation.js    |      92 |     91.3 |     100 |    90.9 | 12,32             
-------------------|---------|----------|---------|---------|-------------------

=============================== Coverage summary ===============================
Statements   : 93.44% ( 342/366 )
Branches     : 95.66% ( 243/254 )
Functions    : 87.3% ( 110/126 )
Lines        : 93.91% ( 324/345 )
================================================================================
```
