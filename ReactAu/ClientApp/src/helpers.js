export const are2ObjectsEqual = (o1, o2) => {
  return Object.entries(o1).toString() === Object.entries(o2).toString();
}
