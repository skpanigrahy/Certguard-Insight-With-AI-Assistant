import { Certificate, CertificateType, Environment } from './types';

const products = ['Atlas', 'Jira', 'Confluence', 'Bitbucket', 'Bamboo', 'Crucible'];
const sealIds = ['SEAL001', 'SEAL002', 'SEAL003', 'SEAL004', 'SEAL005', 'SEAL006'];
const applications = ['App A', 'App B', 'App C', 'App D', 'App E', 'App F'];
const components = ['Web Server', 'API Gateway', 'Database Connector', 'Load Balancer', 'Message Queue'];
const issuers = ['DigiCert', 'Let\'s Encrypt', 'Sectigo', 'GoDaddy', 'Internal PKI'];
const locations = ['us-east-1', 'eu-west-2', 'ap-southeast-1', 'us-west-2'];
const signatureAlgos = ['SHA256withRSA', 'SHA384withRSA', 'SHA512withRSA'];
const environments: Environment[] = [Environment.PROD, Environment.UAT, Environment.DEV, Environment.QA];


export const generateMockCertificates = (count: number): Certificate[] => {
  const certificates: Certificate[] = [];

  for (let i = 0; i < count; i++) {
    const today = new Date();

    // Make validFrom date random in the last 2 years (730 days)
    const validFromDaysAgo = Math.floor(Math.random() * 730);
    const validFromDate = new Date();
    validFromDate.setDate(today.getDate() - validFromDaysAgo);
    validFromDate.setHours(0, 0, 0, 0); // Start of day for consistency

    // Certificate lifetime is between 3 months (~90 days) and 2 years (~730 days)
    const certificateLifetimeDays = 90 + Math.floor(Math.random() * (730 - 90)); 
    const expiryDate = new Date(validFromDate);
    expiryDate.setDate(validFromDate.getDate() + certificateLifetimeDays);

    const expiryDays = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

    const product = products[i % products.length];
    const application = applications[i % applications.length];
    const env = environments[i % environments.length];
    const commonName = `${application.toLowerCase().replace(/\s/g, '-')}-${env.toLowerCase()}.example.com`;

    const rootCaExpiry = new Date();
    rootCaExpiry.setFullYear(today.getFullYear() + 10);
    const rootCA: Certificate = {
      id: `mock-root-ca-${i}`,
      product: 'N/A',
      sealId: 'N/A',
      application: 'N/A',
      environment: env,
      component: 'Root CA',
      commonName: `Example Root CA G${i % 4}`,
      expiryDate: rootCaExpiry.toISOString(),
      daysToExpiry: Math.round((rootCaExpiry.getTime() - today.getTime()) / (1000 * 3600 * 24)),
      certificateType: CertificateType.SERVER,
      issuer: `CN=Example Root CA G${i % 4}`,
      subject: `CN=Example Root CA G${i % 4}`,
      serialNumber: (Math.random().toString(16) + '0000000000000').slice(2, 22).toUpperCase(),
      san: [],
      hostLocation: 'N/A',
      instanceHost: 'N/A',
      signatureAlgorithm: signatureAlgos[i % signatureAlgos.length],
      validFrom: new Date('2015-01-01').toISOString(),
      version: 3,
      chain: [],
    };

    const intermediateCaExpiry = new Date();
    intermediateCaExpiry.setFullYear(today.getFullYear() + 5);
    const intermediateCA: Certificate = {
      id: `mock-intermediate-ca-${i}`,
      product: 'N/A',
      sealId: 'N/A',
      application: 'N/A',
      environment: env,
      component: 'Intermediate CA',
      commonName: `${issuers[i % issuers.length]} Intermediate CA`,
      expiryDate: intermediateCaExpiry.toISOString(),
      daysToExpiry: Math.round((intermediateCaExpiry.getTime() - today.getTime()) / (1000 * 3600 * 24)),
      certificateType: CertificateType.SERVER,
      issuer: rootCA.commonName,
      subject: `CN=${issuers[i % issuers.length]} Intermediate CA`,
      serialNumber: (Math.random().toString(16) + '0000000000000').slice(2, 22).toUpperCase(),
      san: [],
      hostLocation: 'N/A',
      instanceHost: 'N/A',
      signatureAlgorithm: signatureAlgos[i % signatureAlgos.length],
      validFrom: new Date('2020-01-01').toISOString(),
      version: 3,
      chain: [rootCA],
    };

    const cert: Certificate = {
      id: `mock-cert-${i}`,
      product: product,
      sealId: sealIds[i % sealIds.length],
      application: application,
      environment: env,
      component: components[i % components.length],
      commonName: commonName,
      expiryDate: expiryDate.toISOString(),
      daysToExpiry: expiryDays,
      certificateType: i % 3 === 0 ? CertificateType.CLIENT : CertificateType.SERVER,
      issuer: intermediateCA.commonName,
      subject: `CN=${commonName}, OU=IT, O=Example Corp, C=US`,
      serialNumber: (Math.random().toString(16) + '0000000000000').slice(2, 22).toUpperCase(),
      san: [
        commonName,
        `www.${commonName}`
      ],
      hostLocation: locations[i % locations.length],
      instanceHost: `i-${(Math.random().toString(16) + '000000000').slice(2, 12)}`,
      signatureAlgorithm: signatureAlgos[i % signatureAlgos.length],
      validFrom: validFromDate.toISOString(),
      version: 3,
      chain: [intermediateCA, rootCA],
    };
    
    certificates.push(cert);
  }

  return certificates;
};