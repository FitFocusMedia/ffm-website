// Quick bundle analysis
const fs = require('fs');
const path = require('path');

// Check package.json dependencies
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const deps = Object.keys(pkg.dependencies || {});

console.log('\n📦 Dependencies (' + deps.length + '):\n');
deps.forEach(d => console.log('  ' + d));

// Check for heavy imports
console.log('\n\n🔍 Scanning for heavy imports...\n');

const heavyLibs = [
  { name: 'moment', alt: 'date-fns or dayjs' },
  { name: 'lodash', alt: 'lodash-es with tree-shaking or native methods' },
  { name: '@supabase/supabase-js', alt: 'Already needed, but check if imported multiple times' },
  { name: 'chart.js', alt: 'Consider lightweight alternative' },
  { name: 'framer-motion', alt: 'Heavy - use CSS animations where possible' },
  { name: 'recharts', alt: 'Consider lighter charting lib' },
];

const srcDir = './src';
const results = [];

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (file.endsWith('.jsx') || file.endsWith('.tsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      heavyLibs.forEach(lib => {
        if (content.includes(`from '${lib.name}`) || content.includes(`from "${lib.name}`)) {
          results.push({ file: fullPath, lib: lib.name, alt: lib.alt });
        }
      });
    }
  });
}

scanDir(srcDir);

if (results.length > 0) {
  console.log('Found potentially heavy imports:');
  results.forEach(r => {
    console.log(`  ${r.file}`);
    console.log(`    └─ ${r.lib} → Consider: ${r.alt}`);
  });
} else {
  console.log('No obvious heavy library imports found.');
}
