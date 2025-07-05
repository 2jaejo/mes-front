function getRandomNumber() {
  return Math.floor(Math.random() * 100);
}

function convertToUpperCase(str) {
  return str.toUpperCase();
}

function camelToSnake(str) {
  return str
    .replace(/([A-Z])/g, letter => `_${letter.toLowerCase()}`)
    .replace(/^_/, ''); // 혹시 맨 앞에 _가 붙으면 제거
}

function snakeToCamel(str) {
  return str.toLowerCase().replace(/(_\w)/g, (match) => match[1].toUpperCase());
}

export const comm = {
  getRandomNumber,
  convertToUpperCase,
  camelToSnake,
  snakeToCamel,
}



    