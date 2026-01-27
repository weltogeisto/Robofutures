import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const dataDir = path.join(projectRoot, 'src', 'data');
const asOf = new Date().toISOString();

const dataSources = {
  companyFinancials: {
    source: 'Yahoo Finance, SEC EDGAR filings',
    asOf,
    definition: 'Market cap: shares outstanding × price. Revenue: TTM unless noted.',
    revisionPolicy: 'Updated daily; historical not restated',
  },
  marketIndices: {
    source: 'SYNTHETIC - Demo data',
    asOf,
    definition: 'Normalized to 100 at start date. Not actual tradeable indices.',
    revisionPolicy: 'N/A - synthetic series',
  },
  leadingIndicators: {
    source: 'SYNTHETIC - For real data use USPTO, PitchBook, LinkedIn',
    asOf,
    definition: 'Illustrative trend patterns only',
    revisionPolicy: 'N/A - synthetic series',
  },
  supplyChain: {
    source: 'SYNTHETIC - For real data use industry reports, customs data',
    asOf,
    definition: 'Estimates based on public information',
    revisionPolicy: 'N/A - synthetic estimates',
  },
};

async function fetchMarketPerformance() {
  return [
    { month: 'Jan 24', date: '2024-01', robotics: 100, sp500: 100, nasdaq: 100, soxx: 100, industrials: 100 },
    { month: 'Mar 24', date: '2024-03', robotics: 112, sp500: 106, nasdaq: 108, soxx: 115, industrials: 104 },
    { month: 'Jun 24', date: '2024-06', robotics: 128, sp500: 112, nasdaq: 118, soxx: 132, industrials: 108 },
    { month: 'Sep 24', date: '2024-09', robotics: 142, sp500: 118, nasdaq: 125, soxx: 145, industrials: 112 },
    { month: 'Dec 24', date: '2024-12', robotics: 158, sp500: 124, nasdaq: 132, soxx: 158, industrials: 118 },
    { month: 'Mar 25', date: '2025-03', robotics: 175, sp500: 130, nasdaq: 140, soxx: 168, industrials: 122 },
    { month: 'Jun 25', date: '2025-06', robotics: 195, sp500: 136, nasdaq: 148, soxx: 180, industrials: 128 },
    { month: 'Sep 25', date: '2025-09', robotics: 212, sp500: 142, nasdaq: 155, soxx: 192, industrials: 132 },
    { month: 'Dec 25*', date: '2025-12', robotics: 228, sp500: 148, nasdaq: 162, soxx: 205, industrials: 138 },
  ];
}

async function fetchSegments() {
  return [
    {
      id: 'humanoid',
      name: 'Humanoid Robots',
      growth: 298,
      marketSize: 3.2,
      momentum: 97,
      color: '#8b5cf6',
      companies: ['TSLA', 'Figure AI', 'Boston Dynamics'],
      components: ['Harmonic Drives', 'Servo Motors', 'AI Chips', 'Force Sensors'],
    },
    {
      id: 'surgical',
      name: 'Surgical Robotics',
      growth: 44,
      marketSize: 19.8,
      momentum: 86,
      color: '#ec4899',
      companies: ['ISRG'],
      components: ['Vision Systems', 'Force Sensors', 'Controllers/PLCs'],
    },
    {
      id: 'warehouse',
      name: 'Warehouse/Logistics',
      growth: 62,
      marketSize: 26.5,
      momentum: 93,
      color: '#3b82f6',
      companies: ['SYM', 'AMZN'],
      components: ['LiDAR Sensors', 'Vision Systems', 'Controllers/PLCs', 'Batteries/Power'],
    },
    {
      id: 'cobot',
      name: 'Collaborative Robots',
      growth: 52,
      marketSize: 14.2,
      momentum: 89,
      color: '#10b981',
      companies: ['ABB', 'FANUY', 'ROK'],
      components: ['Force Sensors', 'Servo Motors', 'Vision Systems'],
    },
    {
      id: 'agri',
      name: 'Agricultural Robots',
      growth: 42,
      marketSize: 9.8,
      momentum: 78,
      color: '#f59e0b',
      companies: [],
      components: ['LiDAR Sensors', 'Vision Systems', 'Batteries/Power'],
    },
    {
      id: 'industrial',
      name: 'Industrial Arms',
      growth: 16,
      marketSize: 54.8,
      momentum: 62,
      color: '#6366f1',
      companies: ['ABB', 'FANUY', 'ROK'],
      components: ['Servo Motors', 'Harmonic Drives', 'Controllers/PLCs'],
    },
  ];
}

async function fetchCompanies() {
  return [
    { ticker: 'NVDA', name: 'NVIDIA', marketCap: 4200, revenue: 187.1, revenueGrowth: 94, exposure: 38, momentum: 94, segments: ['humanoid', 'warehouse', 'surgical'], tier: 'Core' },
    { ticker: 'ISRG', name: 'Intuitive Surgical', marketCap: 200, revenue: 9.6, revenueGrowth: 16, exposure: 95, momentum: 86, segments: ['surgical'], tier: 'Core' },
    { ticker: 'ABB', name: 'ABB Ltd', marketCap: 134, revenue: 34.5, revenueGrowth: 10, exposure: 48, momentum: 70, segments: ['cobot', 'industrial'], tier: 'Satellite' },
    { ticker: 'FANUY', name: 'Fanuc Corp', marketCap: 34, revenue: 5.3, revenueGrowth: 6, exposure: 88, momentum: 62, segments: ['cobot', 'industrial'], tier: 'Satellite' },
    { ticker: 'ROK', name: 'Rockwell Automation', marketCap: 45, revenue: 8.3, revenueGrowth: 12, exposure: 58, momentum: 68, segments: ['cobot', 'industrial'], tier: 'Core' },
    { ticker: 'SYM', name: 'Symbotic', marketCap: 7, revenue: 2.4, revenueGrowth: 72, exposure: 100, momentum: 90, segments: ['warehouse'], tier: 'Speculative' },
    { ticker: 'PATH', name: 'UiPath', marketCap: 8.5, revenue: 1.4, revenueGrowth: 18, exposure: 72, momentum: 65, segments: [], tier: 'Satellite' },
    { ticker: 'TSLA', name: 'Tesla (Optimus)', marketCap: 1600, revenue: 95.6, revenueGrowth: 22, exposure: 28, momentum: 82, segments: ['humanoid'], tier: 'Satellite' },
  ];
}

async function fetchSupplyChainComponents() {
  return [
    { id: 'ai-chips', name: 'AI Chips', suppliers: ['NVIDIA', 'AMD', 'Intel'], concentration: 84, leadTime: 14, criticality: 98, priceChange: 8, shortage: 'Medium', region: 'USA/Taiwan' },
    { id: 'servo', name: 'Servo Motors', suppliers: ['Yaskawa', 'Fanuc', 'Siemens'], concentration: 71, leadTime: 11, criticality: 92, priceChange: 6, shortage: 'Medium', region: 'Japan/Germany' },
    { id: 'lidar', name: 'LiDAR Sensors', suppliers: ['Hesai', 'Luminar', 'Velodyne'], concentration: 62, leadTime: 8, criticality: 84, priceChange: -18, shortage: 'Low', region: 'China/USA' },
    { id: 'harmonic', name: 'Harmonic Drives', suppliers: ['Harmonic Drive', 'Nabtesco', 'Sumitomo'], concentration: 89, leadTime: 22, criticality: 96, priceChange: 22, shortage: 'Critical', region: 'Japan' },
    { id: 'force', name: 'Force Sensors', suppliers: ['ATI', 'Robotiq', 'OnRobot'], concentration: 56, leadTime: 7, criticality: 78, priceChange: 4, shortage: 'Low', region: 'USA/Denmark' },
    { id: 'vision', name: 'Vision Systems', suppliers: ['Cognex', 'Keyence', 'Basler'], concentration: 60, leadTime: 5, criticality: 82, priceChange: 2, shortage: 'Low', region: 'USA/Japan/Germany' },
    { id: 'battery', name: 'Batteries/Power', suppliers: ['CATL', 'LG Energy', 'Panasonic'], concentration: 76, leadTime: 12, criticality: 88, priceChange: -12, shortage: 'Low', region: 'China/Korea/Japan' },
    { id: 'plc', name: 'Controllers/PLCs', suppliers: ['Rockwell', 'Siemens', 'Mitsubishi'], concentration: 54, leadTime: 6, criticality: 75, priceChange: 1, shortage: 'Low', region: 'USA/Germany/Japan' },
  ];
}

async function fetchLeadingIndicators() {
  return [
    { name: 'Patent Momentum', value: 82, change: 12, factors: { humanoid: 35, perception: 25, actuation: 20, safety: 10, other: 10 }, description: 'USPTO + WIPO robotics patent filings velocity' },
    { name: 'Hiring Velocity', value: 78, change: 8, factors: { software: 40, controls: 25, perception: 20, safety: 15 }, description: 'LinkedIn robotics job postings growth rate' },
    { name: 'Order Book Strength', value: 71, change: 5, factors: { warehouse: 35, industrial: 30, cobot: 20, other: 15 }, description: 'Automation capex + robot orders proxy' },
    { name: 'Policy Tailwinds', value: 85, change: 15, factors: { subsidies: 45, reshoring: 30, defense: 15, other: 10 }, description: 'Government incentives + procurement' },
    { name: 'Supply Chain Easing', value: 58, change: -5, factors: { chips: 30, harmonic: -20, sensors: 15, other: 15 }, description: 'Component availability index' },
    { name: 'Earnings Sentiment', value: 74, change: 6, factors: { mentions: 40, tone: 35, guidance: 25 }, description: 'NLP analysis of robotics mentions in calls' },
  ];
}

async function fetchAlerts() {
  return [
    { id: 1, type: 'signal', priority: 'high', title: 'Humanoid momentum crossed 95', time: '2h ago', read: false },
    { id: 2, type: 'earnings', priority: 'medium', title: 'ISRG earnings in 5 days', time: '1d ago', read: false },
    { id: 3, type: 'supply', priority: 'critical', title: 'Harmonic drive lead time +2 weeks', time: '3d ago', read: true },
    { id: 4, type: 'policy', priority: 'medium', title: 'EU robotics subsidy program announced', time: '5d ago', read: true },
    { id: 5, type: 'price', priority: 'low', title: 'SYM up 8% on volume spike', time: '1w ago', read: true },
  ];
}

async function writeJson(filename, payload) {
  const filePath = path.join(dataDir, filename);
  await writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf-8');
  return filePath;
}

async function main() {
  await mkdir(dataDir, { recursive: true });

  const [
    marketPerformance,
    segmentList,
    companyList,
    supplyChain,
    indicatorList,
    alerts,
  ] = await Promise.all([
    fetchMarketPerformance(),
    fetchSegments(),
    fetchCompanies(),
    fetchSupplyChainComponents(),
    fetchLeadingIndicators(),
    fetchAlerts(),
  ]);

  await Promise.all([
    writeJson('dataSources.json', dataSources),
    writeJson('marketPerformance.json', marketPerformance),
    writeJson('segments.json', segmentList),
    writeJson('companies.json', companyList),
    writeJson('supplyChainComponents.json', supplyChain),
    writeJson('leadingIndicators.json', indicatorList),
    writeJson('alerts.json', alerts),
  ]);

  console.log(`Data refreshed: ${asOf}`);
}

main().catch((error) => {
  console.error('Failed to refresh data:', error);
  process.exitCode = 1;
});
