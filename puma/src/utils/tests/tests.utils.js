const sanitazeValue = (inputValue) => inputValue.replace(/[^a-z^;A-Z]/g, '');

const splitValue = (sanitazedValue) => {
  const splitedValue = sanitazedValue.split(';');
  if (splitedValue.some((v) => v !== '')) {
    return splitedValue;
  } else {
    return [];
  }
}

export default { sanitazeValue, splitValue }
