function calculateSettlements(playerBalances) {
  let transactions = [];

  let debtors = playerBalances.filter(player => player.net < 0);
  let creditors = playerBalances.filter(player => player.net > 0);

  debtors.sort((a, b) => a.net - b.net);
  creditors.sort((a, b) => b.net - a.net);

  while (debtors.length > 0 && creditors.length > 0) {
    let debtor = debtors[0];
    let creditor = creditors[0];

    let payment = Math.min(Math.abs(debtor.net), creditor.net);

    transactions.push({ from: debtor.name, to: creditor.name, amount: payment });

    debtor.net += payment;
    creditor.net -= payment;

    if (debtor.net === 0) { debtors.shift(); }
    if (creditor.net === 0) { creditors.shift(); }
  }

  return transactions;
}

module.exports = calculateSettlements;