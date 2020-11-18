const badWords: string[] = require('./dict.json');

const specials = ['%', '$', '*', '.', '-', '_'];

export class Profanity {
  // adds new bad words to default dictionary
  public static addBadWords(...values: string[]): void {
    for (let value of values) {
      value = value.toLowerCase();

      if (!badWords.includes(value)) {
        badWords.push(value);
      }
    }
  }

  // check if value contains profane language
  public static isProfane(value: string): boolean {
    for (const special of specials) {
      value = value.split(special).join('');
    }

    value = value.toLowerCase();

    for (const badWord of badWords) {
      const rgx = new RegExp(badWord, 'gi');

      if (rgx.test(value)) {
        return true;
      }
    }

    return false;
  }
}
