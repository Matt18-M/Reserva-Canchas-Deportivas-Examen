interface Config {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  databaseUrl: string;
}

const requireEnv = (name: string): string => {
  const value = process.env[name];

  if (value === undefined || value.trim() === '') {
    throw new Error(`Variable de entorno obligatoria no definida: ${name}`);
  }

  return value;
};

const parsePort = (): number => {
  const portValue = requireEnv('PORT');
  const port = Number(portValue);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('PORT debe ser un número entero positivo.');
  }

  return port;
};

const config: Config = {
  port: parsePort(),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: requireEnv('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  databaseUrl: requireEnv('DATABASE_URL'),
};

export default config;
