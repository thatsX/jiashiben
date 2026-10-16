/* ============================================================
   systems/tutorial.js —— 新手引导
   ============================================================ */

let tutorialStepIdx = 0;
let tutorialActive = false;

function startTutorial() {
  if (state.tutorialDone) return;
  tutorialActive = true;
  tutorialStepIdx = 0;
  renderTutorialStep();
}

function renderTutorialStep() {
  if (!tutorialActive) return;
  if (tutorialStepIdx >= TUTORIAL_STEPS.length) {
    endTutorial();
    return;
  }

  const step = TUTORIAL_STEPS[tutorialStepIdx];
  const total = TUTORIAL_STEPS.length;
  const isLast = tutorialStepIdx >= total - 1;

  // 清除旧的高亮
  document.querySelectorAll('.tutorial-highlight').forEach(el => {
    el.classList.remove('tutorial-highlight');
  });

  // 加新高亮
  if (step.target) {
    document.querySelectorAll(step.target).forEach(el => {
      el.classList.add('tutorial-highlight');
    });
  }

  // 渲染引导框
  const overlay = document.getElementById('tutorial-overlay');
  overlay.classList.add('show');
  overlay.innerHTML = `
    <div class="tutorial-box">
      <div class="tutorial-progress">${tutorialStepIdx + 1} / ${total}</div>
      <div class="tutorial-title">${step.text}</div>
      ${step.subtext ? `<div class="tutorial-subtext">${step.subtext}</div>` : ''}
      <div class="tutorial-actions">
        <button class="tutorial-skip" onclick="skipTutorial()">跳过</button>
        <button class="tutorial-next" onclick="nextTutorialStep()">
          ${isLast ? '开始！' : '下一步'}
        </button>
      </div>
    </div>
  `;
}

function nextTutorialStep() {
  tutorialStepIdx++;
  renderTutorialStep();
}

function skipTutorial() {
  tutorialActive = false;
  endTutorial();
}

function endTutorial() {
  tutorialActive = false;

  document.querySelectorAll('.tutorial-highlight').forEach(el => {
    el.classList.remove('tutorial-highlight');
  });

  const overlay = document.getElementById('tutorial-overlay');
  if (overlay) {
    overlay.classList.remove('show');
    overlay.innerHTML = '';
  }

  state.tutorialDone = true;
}