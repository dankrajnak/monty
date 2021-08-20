import * as _ from "lodash";
const simulate = async (
  numCars: number,
  numDoors: number,
  shouldSwitch: boolean
): Promise<boolean> => {
  const doors: number[] = new Array(numDoors).fill(0).map((_, i) => i);
  const cars = _.sampleSize(doors, numCars)!;

  // Take your pick and remove it from doors;
  const pick = _.sample(doors)!;
  _.pullAt(doors, pick);

  if (shouldSwitch) {
    // shh the salesman always picks the first non car
    _.pullAt(
      doors,
      _.findIndex(doors, (door) => !_.includes(cars, door))
    );
    return cars.includes(_.sample(doors)!);
  }
  return cars.includes(pick);
};

export default simulate;
