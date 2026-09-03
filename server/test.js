const calculateSettlements = require('./utils/settlements');

const testData = [
  { name: "Alex", net: 50 },
  { name: "Sam", net: 30 },
  { name: "Jordan", net: -40 },
  { name: "Priya", net: -40 }
];

console.log(calculateSettlements(testData));