const fs = require('fs');
const axios = require('axios');
const { cwd } = require('process');

const configFile = '/typegen.config.json'

function parseToTypes({ key, data }) {
  const preText = key ? key + ": " : "";

  if (data['$ref']) {
    const val = data['$ref'].split('/').pop();
    return preText + val;
  }

  if (data.type === 'string') {
    return preText + 'string';
  }
  if (data.type === 'number') {
    return preText + 'number';
  }
  if (data.type === 'integer') {
    return preText + 'number';
  }
  if (data.type === 'boolean') {
    return preText + 'boolean';
  }

  if (data.type === 'array') {
    if (key) {
      return `${key}: ${parseToTypes({ data: data.items })}[]`;
    }
    return parseToTypes({ data: data.items })
  }

  if (data.type === 'object') {
    return preText + '{}';
  }

  throw new Error('Unknown type');
}

const getTypes = (schemas) => {
  let str = "";

  Object.entries(schemas).forEach(([key, values]) => {
    str += `export type ${key} = {\n`;
    Object.entries(values.properties).forEach(([key, data]) => {
      str += '\t' + parseToTypes({ key, data }) + ',\n';
    })
    str += '}\n\n';
  });

  return str;
}

const writeToFile = (str, fileName) => {
  fs.writeFileSync(fileName, str, function (err) {
    if (err) throw err;
  });
  console.log('Saved to file!');
}

const getSwaggerSchemas = async (url) => {
  const data = await axios.get(url)

  return data.data.components.schemas;
}

const getConfigFromFile = () => {
  const cwdd = cwd();

  const file = fs.readFileSync(cwdd + configFile, 'utf8', function (err, data) {
    if (err) throw err;
    return JSON.parse(data);
  });

  return JSON.parse(file)
}

const getConfigForEnv = (fullConfig, env) => {
  const config = fullConfig[env];
  if (!config) {
    throw new Error(`No config found for env: ${env}`);
  }
  return config;
}

const getConfigs = (args) => {
  const env = args || 'dev'

  const fullConfig = getConfigFromFile();

  const config = getConfigForEnv(fullConfig, env)

  if (!config.url) {
    throw new Error('No url found in config');
  }

  const cwdd = cwd();

  return {
    url: config.url,
    typeFileNameLocation: cwdd + '/' + (config.location || 'types.ts'),
    title: config.title || env
  }
}

const main = async (args) => {
  const { url, title, typeFileNameLocation } = getConfigs(args[0]);

  console.log(`Generating types for ${title}...`);

  const schemas = await getSwaggerSchemas(url);

  const types = getTypes(schemas);

  console.log('Writing to file...');
  console.log(typeFileNameLocation);

  writeToFile(types, typeFileNameLocation);
}

module.exports = main;
