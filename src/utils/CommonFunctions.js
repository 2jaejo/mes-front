import dayjs from "dayjs";

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

function changeDate ( handleChange, start, end, diff = 0, format = "YYYY-MM-DD" ){
  if (typeof handleChange !== "function") {
    console.error("handleChange is not a function");
    return;
  }

  const today = dayjs();
  const startDate = today.add(diff, "day").format(format);
  const endDate = today.format(format);

  handleChange({ target: { name: start, value: startDate } });
  handleChange({ target: { name: end, value: endDate } });
};

export const comm = {
  getRandomNumber,
  convertToUpperCase,
  camelToSnake,
  snakeToCamel,
  changeDate,
}



    