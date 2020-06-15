function handleSurveyJSON(surveyJSON) {
  const answersFromStorage = sessionStorage.getItem('surveyAnswers');
  if (answersFromStorage)
    try {
      JSON.parse(answersFromStorage).forEach((strgAnsw) => {
        const { questionId, questionAnswer } = strgAnsw;
        surveyJSON.screens.some((screen) =>
          screen.fields.some((question) => {
            const { name } = question;
            if (name === questionId) {
              question.answer = questionAnswer;
              return true;
            }
            return false;
          }),
        );
      });
    } catch (e) {
      console.log('Что-то пошло не так при попытке записать ответы в прилетевший surveyJSON');
      console.log(JSON.stringify(e));
    }

  window.surveyData = surveyJSON;
}

function uploadSurveyJSON() {
  putSurveyAnswersToStorage(window.surveyData);
  const resultJSON = JSON.parse(JSON.stringify(window.surveyData));
  CLMPlayer.getSurveyFlowJsonForCall(resultJSON);
}

function putSurveyAnswersToStorage(survey) {
  const surveyAnswers = survey.screens.reduce((acc, screen) => {
    screen.fields.forEach(({ name, answer }) => answer && acc.push({ questionId: name, questionAnswer: answer }));
    return acc;
  }, []);
  sessionStorage.setItem('surveyAnswers', JSON.stringify(surveyAnswers));
}

/**
 * @param {String} value - id выбранного ответа
 * @returns {Array[0].<Object>} selectedQuestion - объект выбранного вопроса
 * @returns {Array[1].<Object>} selectedAnswer - объект выбранного ответа
 */
const findSelectedQuestionAndAnswerInSTATISTIC = (value) => {
  let selectedAnswer = null;
  const selectedQuestion = window.STATISTIC.filter((question) =>
    question.answers.some((answer) => {
      if (answer.id === value) {
        selectedAnswer = answer;
        return true;
      }
      return false;
    }),
  )[0];
  return [selectedQuestion, selectedAnswer];
};

/**
 * @param {String} value - id выбранного ответа
 * @returns {Array[0].<Number>} indexScreen - объект выбранного вопроса
 * @returns {Array[1].<Number>} indexField - объект выбранного ответа
 */
const findSelectedQuestionIndexInSurveyData = (surveyAnswerName) => {
  let indexSelectedQuestion = [];
  window.surveyData.screens.some((screen, indexScreen) =>
    screen.fields.some((question, indexField) => {
      if (question.choiceReferences && question.choiceReferences.includes(surveyAnswerName)) {
        indexSelectedQuestion = [indexScreen, indexField];
        return true;
      }
      return false;
    }),
  );
  return indexSelectedQuestion;
};

/**
 * @param {String} surveyAnswerName - названия (id) выбранного ответа
 * @param {Number} indexScreen - индекс Экрана, в котором находится выбранный вопрос
 * @param {Number} indexField - индекс ??вопроса??, куда записываем ответ
 */
const setAnswerToSurveyData = (surveyAnswerName, [indexScreen, indexField]) =>
  window.surveyData.screens[indexScreen].fields[indexField].answer
    ? (window.surveyData.screens[indexScreen].fields[indexField].answer += `${surveyAnswerName};`)
    : (window.surveyData.screens[indexScreen].fields[indexField].answer = `${surveyAnswerName};`);

function handleValueClick(e) {
  const { value } = e.target.dataset;
  if (!value || !window.surveyData) return;
  /**
   * Find the question and answer in statistics to which the button correspondes
   * Находим среди всех вопросов статистики вопрос и ответ, к которому относится выбранный ответ
   */
  const [selectedQuestion, selectedAnswer] = findSelectedQuestionAndAnswerInSTATISTIC(value);

  if (selectedQuestion) {
    /**
     * Find answer ID in the survey
     * Находим название (айдишник) ответа(!) в сервее
     */
    const { name } = window.surveyData.choices.filter((choice) => choice.value.stringValue == selectedAnswer.text)[0];
    if (!name) return;

    /**
     * Get the question with the id of the answer
     * С помощью название (айдишник) ответа находим индекс вопроса и индекс ответа в сервее и записываем туда выбранный ответ ()
     */
    setAnswerToSurveyData(name, findSelectedQuestionIndexInSurveyData(name));

    uploadSurveyJSON();
  }
}

function registerHandleSurveyClick() {
  document.addEventListener('click', handleValueClick);
}

function getSurveyJSON(presName) {
  if (navigator.vendor === 'Google Inc.') return;
  CLMPlayer.getSurveyFlowJson({
    developerName: presName,
  });
}

function isSlideWithStats() {
  return Boolean(document.querySelector('[data-value]'));
}

function registerSurveyListner() {
  if (navigator.vendor === 'Google Inc.') return;
  CLMPlayer.registerEventListener('surveyflowjsonloaded', handleSurveyJSON);
  CLMPlayer.registerEventListener('surveyflowjsonforcallloaded', uploadSurveyJSON);
  CLMPlayer.registerEventListener('returntocallbuttonpress', uploadSurveyJSON);
  CLMPlayer.registerEventListener('cancelbuttonpress', uploadSurveyJSON);
}

module.exports = { registerHandleSurveyClick, registerSurveyListner, isSlideWithStats, getSurveyJSON };
