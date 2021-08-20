import { Command, flags } from "@oclif/command";
import * as inquirer from "inquirer";
import cli from "cli-ux";
import * as chalk from "chalk";
import simulate from "./simulate";

const formatter = new Intl.NumberFormat();
const formatNumber = (number: number): string => formatter.format(number);

class Monty extends Command {
  static description = "describe the command here";

  static flags = {
    help: flags.help({ char: "h" }),
  };

  async run() {
    this.log(
      chalk.bold.black("Wellllcome to Monty Hall!") + " Let's play a game."
    );
    const answers = await inquirer.prompt([
      {
        name: "doors",
        message: "How many doors would you like?",
        type: "number",
        default: 3,
        validate: (input) =>
          input > 1 ||
          "All for one and one for... you gotta pick something bigger than one.  Otherwise it's not much fun",
      },
      {
        name: "cars",
        message: "Annnd how many cars?",
        type: "number",
        default: 1,
        validate: (input, answers) =>
          input < answers.doors ||
          "Gotta give you a chance to lose, you goose!",
      },
      {
        name: "numSimulations",
        message: "How many times you wanna run this?",
        type: "number",
        default: 1_000_000,
        transformer: (input) => (input ? formatNumber(input) : ""),
        validate: (input) => {
          if (input < 0) {
            return "We can't run it negative times. C'mon now.";
          }
          if (input === 0) {
            return "0? No.";
          }
          if (input > 1_000_000_000) {
            return "Lets not get crazy";
          }
          return true;
        },
      },
    ]);
    const { doors, cars, numSimulations } = answers as {
      doors: number;
      cars: number;
      numSimulations: number;
    };
    const simpleBar = cli.progress({
      format: `${chalk.blue("{bar}")} | {value}/{total}`,
    });

    this.log("");

    simpleBar.start(numSimulations);
    let switchWins = 0;
    let dontSwitchWins = 0;
    for (let i = 0; i < numSimulations; i++) {
      if (await simulate(cars, doors, true)) {
        switchWins++;
      }
      if (await simulate(cars, doors, false)) {
        dontSwitchWins++;
      }
      simpleBar.increment();
    }

    simpleBar.stop();
    this.log("");
    this.log("...And the results are:");
    await cli.wait(1000);
    this.log("");
    this.log(
      chalk`{bold Switching} won you {bold.green ${
        formatNumber(switchWins) + " cars"
      }}. {italic ${((switchWins / numSimulations) * 100).toFixed(2)}}%`
    );
    this.log(
      chalk`{bold Not switching} won you {bold.red ${
        formatNumber(dontSwitchWins) + " cars"
      }}. {italic ${((dontSwitchWins / numSimulations) * 100).toFixed(2)}}%`
    );
    await cli.wait(1000);
    this.log("");

    if (switchWins > dontSwitchWins) {
      this.log(chalk`{bold.green Switching won} You're goddamn right it did`);
    } else if (dontSwitchWins > switchWins) {
      this.log(
        chalk.bold.red("Not Switching won") +
          `. Well, sure it did when you pick the things you did.  Choose better things.`
      );
    } else {
      this.log(chalk.bold.red("It was a tie") + ". Meh.");
    }

    const { again } = await inquirer.prompt([
      {
        type: "list",
        message: "Wanna play again?",
        name: "again",
        choices: ["Yes", "No"],
        default: "Yes",
      },
    ]);

    if (again === "Yes") {
      this.log("");
      this.run();
    } else {
      this.log("Alright, well it was fun.");
    }
  }
}

export = Monty;
