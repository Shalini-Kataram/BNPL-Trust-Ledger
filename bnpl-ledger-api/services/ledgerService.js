const fs = require("fs");
const fsPromises = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

class LedgerService {

  constructor() {

    this.writeQueue = Promise.resolve();

    this.ledgerFile = path.join(
      __dirname,
      "../data/ledger.json"
    );

    if (!fs.existsSync(this.ledgerFile)) {

      fs.writeFileSync(
        this.ledgerFile,
        JSON.stringify([], null, 2)
      );
    }
  }

  async publish(event) {

    this.writeQueue =
      this.writeQueue.then(async () => {

        const data =
          await fsPromises.readFile(
            this.ledgerFile,
            "utf8"
          );

        const events =
          JSON.parse(data);

        const ledgerEvent = {

          id: crypto.randomUUID(),

          timestamp:
            new Date().toISOString(),

          ...event
        };

        events.push(ledgerEvent);

        await fsPromises.writeFile(
          this.ledgerFile,
          JSON.stringify(events, null, 2)
        );

        return ledgerEvent;
      });

    return this.writeQueue;
  }

  async getAllEvents() {

    const data =
      await fsPromises.readFile(
        this.ledgerFile,
        "utf8"
      );

    return JSON.parse(data);
  }

  async getCustomerEvents(
    customerHash
  ) {

    const events =
      await this.getAllEvents();

    return events.filter(
      event =>
        event.customerHash === customerHash
    );
  }

  async clearLedger() {

    await fsPromises.writeFile(
      this.ledgerFile,
      JSON.stringify([], null, 2)
    );

    return true;
  }
}

module.exports = new LedgerService();