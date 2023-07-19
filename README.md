## TS Swagger Typegen
The package is used to generate typescript types using Swagger documentation.

### Installation
##### Step 1: Install ts-swagger-typegen
```bash
yarn add ts-swagger-typegen
```

##### Step 2: Create a configration file
Add a `typegen.config.json` with content:
```json
{
  "dev": {
    "url": "<url_to_swagger>",
    "title": "<title>",
    "location": "<location_to_save_types>"
  }
}
```

#### Step 3: Add to scripts in package json
```json
  "scripts": {
    "typegen": "ts-swagger-typegen"
  }
```

#### Step 4: Generate types
```bash
yarn typegen dev
```
> You can change `dev` to any environment as specified in `typegen.config.json`
