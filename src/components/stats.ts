export const stats = {
  clientsAmount: 0,
  tripsAmount: 0,
  runningUntil: "stops :)",
  toHtml,
};

function toHtml() {
  return `
<!DOCTYPE html>
    <html lang="en">
    <body style="font-family:sans-serif">
        <h3>Active trips in collection: ${this.tripsAmount}</h3>
        <h3>Users connected: ${this.clientsAmount}</h3>
        <h3>Server running until: ${this.runningUntil}</h3>
    </body>    
</html>
 `;
}
